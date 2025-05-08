await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    naming: 'highlite.user.js',
    minify: true,
    banner: "// ==UserScript==\n\
// @name         Highlite\n\
// @namespace    Highlite\n\
// @version      0.1.3\n\
// @description  Rune-lite esque client for High Spell.\n\
// @author       KKonaOG\n\
// @match        https://highspell.com/game\n\
// @icon         https://www.google.com/s2/favicons?sz=64&domain=highspell.com\n\
// @connect      githubusercontent.com\n\
// @connect      highspell.com\n\
// @grant        GM_addElement\n\
// @grant        GM_getResourceText\n\
// @grant        GM_xmlhttpRequest\n\
// @run-at       document-start\n\
// ==/UserScript=="
})
