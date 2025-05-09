const pJSON = require('./package.json')
const UserBannerProd = `// ==UserScript==\n\
// @name         Highlite Loader\n\
// @namespace    Highlite\n\
// @version      ${pJSON.version}\n\
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
// ==/UserScript==`

// Production Build for Highlite Loader
await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    naming: 'highlite.user.js',
    minify: false,
    banner: UserBannerProd,
    env: "inline",
    define: {
        "process.env.NODE_ENV": "'production'"
    }
})


const UserBannerDev = `// ==UserScript==\n\
// @name         Highlite Loader Development\n\
// @namespace    Highlite\n\
// @version      ${pJSON.version}\n\
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
// ==/UserScript==`


// Development Build for Highlite Loader
await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    naming: 'highliteDevelopment.user.js',
    minify: false,
    banner: UserBannerDev,
    env: "inline",
    define: {
        "process.env.NODE_ENV": "'development'"
    }
})
