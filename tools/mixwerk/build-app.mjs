// Erzeugt die installierbare App-Version (PWA) aus index.html: node tools/mixwerk/build-app.mjs
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url);
const src = readFileSync(new URL("index.html", dir), "utf8");
const head = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0d0f13"><meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg"><link rel="apple-touch-icon" href="icon.svg">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
</head><body>\n`;
const tail = `\n<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});</script>\n</body></html>\n`;
writeFileSync(new URL("app/index.html", dir), head + src + tail);
console.log("app/index.html geschrieben");
