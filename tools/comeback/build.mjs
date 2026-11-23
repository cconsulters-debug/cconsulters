// Baut Comeback.jsx + comeback.css zu einer einzigen, lauffähigen HTML-Datei.
// Aufruf (im Repo-Root):  node tools/comeback/build.mjs [--artifact pfad.html]
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const js = execSync(
  `npx --yes esbuild@0.24.0 "${join(dir, "Comeback.jsx")}" --loader:.jsx=jsx --jsx-factory=React.createElement --jsx-fragment=React.Fragment --minify --target=es2019`,
  { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
);
const css = readFileSync(join(dir, "comeback.css"), "utf8");

const inner = `<title>Comeback</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,650;12..96,750&family=Figtree:wght@400;500;600;700&display=swap">
<style>
${css}
</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>
${js.replace(/<\/script/gi, "<\\/script")}
</script>
`;

const standalone = `<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#2E6A5C">
</head>
<body>
${inner}</body>
</html>
`;

writeFileSync(join(dir, "index.html"), standalone);
const i = process.argv.indexOf("--artifact");
if (i > -1) writeFileSync(process.argv[i + 1], inner);
console.log("OK", (standalone.length / 1024).toFixed(1), "KB");
