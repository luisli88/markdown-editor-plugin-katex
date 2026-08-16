# markdown-editor-plugin-katex

A [MarkdownEditor](https://github.com/luisli88/MarkdownEditor) third-party plugin that renders
```katex ...``` blocks as math using [KaTeX](https://katex.org/).

Second reference implementation of the [public plugin contract](https://github.com/luisli88/markdown-editor-plugin-sdk),
alongside the bundled Mermaid plugin — installed the same way any third-party plugin is: paste this
repo's URL into MarkdownEditor's plugin install dialog.

## Install

In MarkdownEditor, open plugin management and paste:

```text
https://github.com/luisli88/markdown-editor-plugin-katex
```

The app resolves the latest published release tag automatically — no branch or version to pick.

## Usage

Insert a `katex` code block and write a LaTeX expression:

````markdown
```katex
c = \pm\sqrt{a^2 + b^2}
```
````

## Develop

```bash
npm install
npm run build   # produces a single self-contained dist/index.js (ESM)
```

`dist/index.js` is what gets fetched and sandboxed by the app — commit it before tagging a release.

## Known limitation

KaTeX's own webfonts aren't embedded in the bundle (kept simple on purpose — this plugin exists to
validate the installation mechanism, not to ship pixel-perfect math typesetting). Formulas render
correctly structured but fall back to the browser's default math-ish font instead of KaTeX's own.
