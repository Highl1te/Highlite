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

async function obtainHighliteCore() {
    let highliteCore = ""
    const highliteCoreURL = "https://cdn.jsdelivr.net/gh/Highl1te/Core@latest/dist/index.js";
    highliteCore = (await GM.xmlHttpRequest({"method": "GET", "url": highliteCoreURL + "?time=" + Date.now()})).responseText;
    eval(highliteCore)
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

    eval(highSpellClient)
    console.log("HighSpell Client Loaded");
}

// Entry Point
(function () {
    // Pause window load until client is injected
    preventClientExecution();
    let doReact = true;
    // Wait for the DOM to be ready
    document.addEventListener("DOMContentLoaded", function () {
        /*
            The reason why we are waiting for the DOM to be loaded is because the HighSpell client uses it
            as the startup event. To make sure we reload the script after the DOM has truly loaded, we specifically
            fire it after the true DOMContentLoaded event. Tis allows Highlite to interact with the client before
            it begins execution.
        */
       
        // doReact makes sure we don't react to our own DOMContentLoaded event
        if (doReact) {
            doReact = false; // Set to false to prevent infinite loop
            obtainHighSpellClient().then(() => { // This is the injected client script
                obtainHighliteCore(); // This is the core script
            }).then(() => {
            // Inform HighSpell to Start
                document.dispatchEvent(new Event("DOMContentLoaded", {
                    bubbles: true,
                    cancelable: true
                }));
            }); 
        }
    });

})();