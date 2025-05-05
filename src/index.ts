/*
Highlite Loader
*/

function configureInjection() {
    // Chromium-based Injection
    new MutationObserver((_, observer) => {
        const clientjsScriptTag = document.querySelector('script[src*="/js/client/client"]');
        if (clientjsScriptTag) {
            inject(clientjsScriptTag);
        }
    }).observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // TODO: FireFox Injection
}

function inject(clientjsScriptTag) {
    // Obtain Client JavaScript
    let scriptText = GM_getResourceText('clientjs');
    let highliteText = GM_getResourceText('highlitejs');

    // Inject Helper Into Closure
    scriptText = scriptText.substring(0, scriptText.length - 9)
        + "; document.client = {};"
        + "document.client.get = function(a) {"
        + "return eval(a);"
        + "};"
        + "document.client.set = function(a, b) {"
        + "eval(a + ' = ' + b);"
        + "};"
        + scriptText.substring(scriptText.length - 9)

    clientjsScriptTag.remove();

    GM_addElement('script', {
        textContent: scriptText
    });

    checkForUpdate();
    begin();
}

function checkForUpdate() {
    // TODO: Stub Function to eventually XHR Head check the github repo for a newer version.
    promptForUpdate();
}

function promptForUpdate() {
    // TODO: Stub Function for eventual GUI popup prompting user to update Highlite
    doUpdate();
}

function doUpdate() {
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://raw.githubusercontent.com/KKonaOG/testing/refs/heads/main/highlite.js",
        onload: function(response) {
           GM_addElement('script', {
               textContent: response.responseText
           });
        }
    });
};

// Entry Point
(function () {
    configureInjection();
})();