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
 * Contrato de plugin (contracts/plugin-contract.md): `render`/`export`
 * reciben el `source` crudo del bloque — acá, una expresión LaTeX. KaTeX es
 * síncrono, pero el contrato exige `Promise` (permite motores async como
 * Mermaid) — se envuelve trivialmente.
 */
async function render(source: string): Promise<string> {
  const html = katex.renderToString(source, {
    throwOnError: false,
    output: "htmlAndMathml",
  });
  return `<style>${katexCss}</style>${html}`;
}

/** Único formato de exportación — a diferencia de Mermaid (imagen embebida vs. fuente tal cual), una fórmula KaTeX siempre se exporta como el mismo HTML renderizado, así que no hace falta `getExportRepresentations` (opcional en el contrato). */
async function exportFormula(source: string): Promise<{ html: string }> {
  return { html: await render(source) };
}

export default { render, export: exportFormula };
