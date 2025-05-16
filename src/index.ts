/*
Highlite Loader
*/

import { IndexDBWrapper } from "./IndexDBWrapper";
const highliteCoreAPIURL = "https://api.github.com/repos/Highl1te/Core/releases/latest";
const highliteCoreURL = "https://github.com/Highl1te/Core/releases/latest/download/highliteCore.js";
const highspellAssetsURL = "https://highspell.com:3002/assetsClient";

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

async function obtainHighliteCore(highliteDB: IndexDBWrapper) {
    // Check if coreLastUpdated is set 
    const coreLastUpdated = await highliteDB.getItem("coreLastUpdated");

    // Perform API Request to Check Release Information
    const githubReleaseInformation = JSON.parse((await GM.xmlHttpRequest({method: "GET",url: highliteCoreAPIURL})).responseText);
    let remoteLastUpdated = undefined;
    githubReleaseInformation.assets.forEach((asset : any) => {
        if (asset.name === "highliteCore.js") {
            // DateTime Format is: "2025-05-15T19:55:02Z"
            // Convert to Date Object
            remoteLastUpdated = new Date(asset.updated_at);
        }
    })

    let highliteCore = "";
    // Check if coreLastUpdated is set, remoteLastUpdated is set, and if the coreLastUpdated date is less than remoteLastUpdated
    if (coreLastUpdated == undefined || remoteLastUpdated == undefined || coreLastUpdated < remoteLastUpdated) {
        console.log("[Highlite Loader] Highlite Core Version is outdated, updating...");
        // Update the coreLastUpdated value
        highliteCore = (await GM.xmlHttpRequest({"method": "GET", "url": highliteCoreURL + "?time=" + Date.now()})).responseText;
        await highliteDB.setItem("highliteCore", highliteCore);
        await highliteDB.setItem("coreLastUpdated", remoteLastUpdated);
    } else {
        console.log("[Highlite Loader] Highlite Core Version is up to date.");
        highliteCore = await highliteDB.getItem("highliteCore");
    }

    console.log("[Highlite Loader] Highlite Core obtained, executing.");
    GM_addElement("script",
        {
            textContent: highliteCore
        }
    );
};

async function obtainHighSpellClient(highliteDB: IndexDBWrapper) {
    // Check if clientLastVersion is set
    const clientLastVersion = await highliteDB.getItem("clientLastVersion");

    // Get Asset JSON to determine latest version
    const highSpellAssetJSON = JSON.parse((await GM.xmlHttpRequest({"method": "GET", "url": highspellAssetsURL + "?time=" + Date.now()})).responseText);
    const remoteLastVersion = highSpellAssetJSON.data.latestClientVersion;

    let highSpellClient = "";
    if (clientLastVersion == undefined || clientLastVersion < remoteLastVersion) {
        console.log("[Highlite Loader] High Spell Client Version is outdated, updating...");
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
        await highliteDB.setItem("highSpellClient", highSpellClient);
        await highliteDB.setItem("clientLastVersion", remoteLastVersion);
        console.log("[Highlite Loader] High Spell Client Version " + highSpellAssetJSON.data.latestClientVersion + " downloaded.");
    } else {
        console.log("[Highlite Loader] High Spell Client Version is up to date.");
        highSpellClient = await highliteDB.getItem("highSpellClient");
    }

    GM_addElement("script",
       {
        textContent: highSpellClient
    }
    );
    console.log("[Highlite Loader] High Spell Client Injection Completed.");
}

// Entry Point
(async function () {
    // Starts a MutationObserver to remove the High Spell client script tag from the DOM
    preventClientExecution();
    const highliteDB = new IndexDBWrapper("Highlite");
    let doReact = true;
    // Wait for the DOM to be ready
    document.addEventListener("DOMContentLoaded", async function () {

        highliteDB.init().then(() => {
            /*
            The reason why we are waiting for the DOM to be loaded is because the HighSpell client uses it
            as the startup event. To make sure we reload the script after the DOM has truly loaded, we specifically
            fire it after the true DOMContentLoaded event. This allows Highlite to interact with the client before
            it begins execution. HighSpell is launched within Highlite Core by firing another DOMContentLoaded event.
            */
        
            // doReact makes sure we don't react to our own DOMContentLoaded event later on.
            if (doReact) {
                doReact = false; // Set to false to prevent infinite loop
                obtainHighSpellClient(highliteDB).then(() => { // This is the injected client script
                    // Check ENV mode to determine if we are in production or development mode
                    if (process.env.NODE_ENV === "production") {
                        console.log("[Highlite Loader] Production mode detected, loading production core.");
                        obtainHighliteCore(highliteDB); // This is the core script
                    }
                    else if (process.env.NODE_ENV === "development") {
                        console.log("[Highlite Loader] Development mode detected, core is expected to be loaded manually.");      
                    } else {
                        console.error("[Highlite Loader] Unknown environment mode detected, aborting.");
                    }
                }) 
            }    
        })

    });
})();