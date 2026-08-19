import katex from "katex";
// `--loader:.css=text` (ver package.json `build`) da el contenido crudo del
// CSS como string, igual que el patrón `?raw` de Vite en el monorepo host.
// Las fuentes propias de KaTeX (`@font-face` a rutas relativas dentro del
// paquete npm) no se embeben — quedan sin resolver en el documento host, así
// que el layout degrada al fallback de fuente del navegador en vez de la
// tipografía matemática original de KaTeX. Es una limitación conocida y
// aceptada para este plugin de referencia (valida el mecanismo de
// instalación de terceros, US1 — no es un objetivo de este ciclo lograr
// tipografía matemática pixel-perfect).
import katexCss from "katex/dist/katex.min.css";

/**
 * Mismo shape que `PluginThemeContext` de `@markdown-editor/plugin-sdk` — no
 * se declara como dependencia de npm (ese paquete es privado al monorepo,
 * sin publicar); el contrato completo está documentado en el `README.md` de
 * `plugin-sdk` (github.com/luisli88/MarkdownEditor).
 */
interface PluginThemeContext {
  mode: "light" | "dark";
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
}

/** Mismo shape que `SyntaxGrammar` de `@markdown-editor/plugin-sdk`. */
interface SyntaxGrammar {
  caseInsensitive?: boolean;
  keywords?: Record<string, string>;
  comment?: { begin: string; end: string };
  quoteStrings?: boolean;
  contains?: Array<{ className: string; begin: string; end?: string }>;
}

/**
 * Contrato de plugin (contracts/plugin-contract.md): `render`/`export`
 * reciben el `source` crudo del bloque — acá, una expresión LaTeX. KaTeX es
 * síncrono, pero el contrato exige `Promise` (permite motores async como
 * Mermaid) — se envuelve trivialmente.
 *
 * A diferencia de Mermaid (SVG con colores fijos por `fill`), el HTML que
 * produce KaTeX ya hereda `color` de su contenedor para el texto de la
 * fórmula — no hace falta reconstruir una paleta completa. Alcanza con fijar
 * `color` en el contenedor propio al `text` del tema activo: sin esto, el
 * fallback por default del navegador (negro) queda ilegible sobre un fondo
 * oscuro.
 */
async function render(source: string, theme?: PluginThemeContext): Promise<string> {
  const html = katex.renderToString(source, {
    throwOnError: false,
    output: "htmlAndMathml",
  });
  const color = theme ? `color:${theme.text};` : "";
  // El host sanitiza este HTML con DOMPurify antes de insertarlo
  // (`sanitizePluginHtml`, `document-core`) — un `<style>` como primer hijo
  // de nivel superior, antes de cualquier otro contenido, dispara las
  // reglas de parseo HTML5 que lo reubican dentro de un `<head>` implícito;
  // DOMPurify solo devuelve el `<body>` resultante, así que el `<style>`
  // desaparecía por completo. Anidado DENTRO del `<span>` (no como hermano
  // antes) sobrevive intacto sin necesitar ninguna excepción de
  // sanitización — verificado contra el output real de `katex.renderToString`.
  return `<span style="${color}"><style>${katexCss}</style>${html}</span>`;
}

/** Único formato de exportación — a diferencia de Mermaid (imagen embebida vs. fuente tal cual), una fórmula KaTeX siempre se exporta como el mismo HTML renderizado, así que no hace falta `getExportRepresentations` (opcional en el contrato). */
async function exportFormula(source: string): Promise<{ html: string }> {
  return { html: await render(source) };
}

/**
 * Gramática de resaltado propia para el editor en vivo de una expresión
 * LaTeX — comandos (`\frac`, `\sqrt`, `\alpha`, ...), agrupación (`{}`) y
 * sub/superíndice (`_`/`^`). Cobertura deliberadamente acotada, no un parser
 * LaTeX completo (mismo criterio que la gramática de Mermaid).
 */
const syntaxGrammar: SyntaxGrammar = {
  contains: [
    { className: "keyword", begin: "\\\\[a-zA-Z]+" },
    { className: "operator", begin: "[_^]" },
    { className: "punctuation", begin: "[{}]" },
  ],
};

function getSyntaxGrammar(): SyntaxGrammar {
  return syntaxGrammar;
}

export default { render, export: exportFormula, getSyntaxGrammar };
