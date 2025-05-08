/*
Highlite Loader
*/

function preventClientExecution() {
    new MutationObserver((_, observer) => {
        const clientjsScriptTag = document.querySelector('script[src*="/js/client/client"]');
        if (clientjsScriptTag) {
            clientjsScriptTag.remove();
        }
    }).observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}

// function inject(clientjsScriptTag) {
//     // Obtain Client JavaScript
//     let scriptText = GM_getResourceText('clientjs');

//     // Inject Helper Into Closure
//     scriptText = scriptText.substring(0, scriptText.length - 9)
//         + "; document.client = {};"
//         + "document.client.get = function(a) {"
//         + "return eval(a);"
//         + "};"
//         + "document.client.set = function(a, b) {"
//         + "eval(a + ' = ' + b);"
//         + "};"
//         + scriptText.substring(scriptText.length - 9)

//     clientjsScriptTag.remove();

//     GM_addElement('script', {
//         textContent: scriptText
//     });

//     checkForUpdate();
// }

async function obtainHighliteCore() {
    let highliteCore = ""
    const highliteCoreURL = "https://cdn.jsdelivr.net/gh/Highl1te/Core@latest/dist/index.js";
    highliteCore = (await GM.xmlHttpRequest({"method": "GET", "url": highliteCoreURL + "?time=" + Date.now()})).responseText;

    // Store the core in IndexDB

    const db = await window.indexedDB.open("highlite", 1);
    db.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore("highlite", { keyPath: "id" });
        objectStore.createIndex("core", "core", { unique: false });
    }
    db.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("highlite", "readwrite");
        const objectStore = transaction.objectStore("highlite");
        objectStore.put({ id: 1, core: highliteCore });
    };
    db.onerror = function(event) {
        console.error("Error opening IndexedDB: ", event.target.error);
    };
    console.log("Highlite Core Loaded");

};

async function obtainHighSpellClient() {
    let highSpellClient = "";
    let highSpellAssetJSON = {};
    const assetJSONURL = "https://highspell.com:3002/assetsClient";

    highSpellAssetJSON = JSON.parse((await GM.xmlHttpRequest({"method": "GET", "url": assetJSONURL + "?time=" + Date.now()})).responseText);
    const highSpellClientURL = `https://highspell.com/js/client/client.${highSpellAssetJSON.data.latestClientVersion}.js`;
    highSpellClient = (await GM.xmlHttpRequest({"method": "GET", "url": highSpellClientURL + "?time=" + Date.now()})).responseText;

    highSpellClient = highSpellClient.substring(0, highSpellClient.length - 9)
        + "; document.client = {};"
        + "document.client.get = function(a) {"
        + "return eval(a);"
        + "};"
        + "document.client.set = function(a, b) {"
        + "eval(a + ' = ' + b);"
        + "};"
        + highSpellClient.substring(highSpellClient.length - 9)
}



// Entry Point
(function () {
    // Pause window load until client is injected
    preventClientExecution();

    obtainHighSpellClient();
    obtainHighliteCore();
})();