/*
Highlite Loader
*/

function preventClientExecution() {
    new MutationObserver((_, observer) => {
        const clientjsScriptTag = document.querySelector('script[src*="/js/client/client"]');
        if (clientjsScriptTag) {
            console.log("[Highlite Loader] High Spell Client found, removing...");
            clientjsScriptTag.remove();
        }
    }).observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}

async function obtainHighliteCore() {
    let highliteCore = ""
    const highliteCoreURL = "https://github.com/Highl1te/Core/releases/latest/download/index.js";
    console.log("[Highlite Loader] Obtaining latest Highlite Core version.");
    highliteCore = (await GM.xmlHttpRequest({"method": "GET", "url": highliteCoreURL + "?time=" + Date.now()})).responseText;

    eval(highliteCore)
    console.log("[Highlite Loader] Highlite Core Obtained.");
};

async function obtainHighSpellClient() {
    let highSpellClient = "";
    let highSpellAssetJSON = {};
    const assetJSONURL = "https://highspell.com:3002/assetsClient";
    console.log("[Highlite Loader] Obtaining latest High Spell Client version.");
    highSpellAssetJSON = JSON.parse((await GM.xmlHttpRequest({"method": "GET", "url": assetJSONURL + "?time=" + Date.now()})).responseText);
    const highSpellClientURL = `https://highspell.com/js/client/client.${highSpellAssetJSON.data.latestClientVersion}.js`;
    highSpellClient = (await GM.xmlHttpRequest({"method": "GET", "url": highSpellClientURL + "?time=" + Date.now()})).responseText;

    console.log("[Highlite Loader] High Spell Client Version: " + highSpellAssetJSON.data.latestClientVersion + " downloaded.");
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
    console.log("[Highlite Loader] High Spell Client Injection Completed.");
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
            fire it after the true DOMContentLoaded event. This allows Highlite to interact with the client before
            it begins execution. HighSpell is launcher within Highlite Core by firing another DOMContentLoaded event.
        */
       
        // doReact makes sure we don't react to our own DOMContentLoaded event
        if (doReact) {
            doReact = false; // Set to false to prevent infinite loop
            obtainHighSpellClient().then(() => { // This is the injected client script
                // Check ENV mode to determine if we are in production or development mode
                if (process.env.NODE_ENV === "production") {
                    console.log("[Highlite Loader] Production mode detected, loading production core.");
                    obtainHighliteCore(); // This is the core script
                }
                else if (process.env.NODE_ENV === "development") {
                    console.log("[Highlite Loader] Development mode detected, core is expected to be loaded manually.");      
                } else {
                    console.error("[Highlite Loader] Unknown environment mode detected, aborting.");
                }
            }) 
        }
    });
})();
