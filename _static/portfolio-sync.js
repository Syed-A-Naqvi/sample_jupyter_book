// Constants for better maintainability and readability
const MESSAGE_TYPE_UPDATE_THEME = "update-theme";
const THEME_DARK = "dark";
const THEME_LIGHT = "light";
const IFRAME_STYLESHEET_HREF_PARTIAL = "_static/portfolio-sync.css";
const DATA_THEME_ATTRIBUTE = "data-theme";
const DATA_MODE_ATTRIBUTE = "data-mode";
const LOCAL_STORAGE_THEME_KEY = "theme";
const LOCAL_STORAGE_MODE_KEY = "mode";

/**
 * @typedef {object} UpdateThemeMessageData
 * @property {string} type - The type of message, should be "update-theme"
 * @property {{"light"|"dark"}} theme - The theme to update to, either "light" or "dark"
 */

// wait for DOM to load fully before modifying elements
document.addEventListener("DOMContentLoaded", function() {
    initializeThemeSync();
});

/**
 * Applies the given theme to the HTML element and saves it to local storage.
 * @param {string} theme - The theme to apply ("light" or "dark").
 */
function applyTheme(theme) {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute(DATA_THEME_ATTRIBUTE, theme);
    htmlElement.setAttribute(DATA_MODE_ATTRIBUTE, theme);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    localStorage.setItem(LOCAL_STORAGE_MODE_KEY, theme);
}

/**
 * Sets up a message listener for theme changes from the parent window.
 * @param {string[]} trustedOrigins - An array of origins allowed to send messages.
 */
function setupIframeThemeListener(trustedOrigins) {
    window.addEventListener("message",
        /**
         * Listen for theme change messages from parent window
         *
         * @param {MessageEvent<UpdateThemeMessageData>} event
         * - 'event.data' contains the payload sent from the parent
         * - 'event.origin' is the sender's origin
         * - 'event.data.type' should be "update-theme"
         * - 'event.data.theme' should be either "light" or "dark"
         */
        function(event) {
            if (event.data.type === MESSAGE_TYPE_UPDATE_THEME && trustedOrigins.includes(event.origin)) {
                if (event.data.theme === THEME_DARK || event.data.theme === THEME_LIGHT) {
                    applyTheme(event.data.theme);
                } else {
                    console.warn("Invalid theme received:", event.data.theme);
                }
            } else {
                console.warn("Untrusted origin or invalid message type:", event.origin, event.data.type);
            }
        }
    );
}

/**
 * Removes a specific stylesheet that is only needed when embedded in an iframe.
 */
function removeIframeSpecificStylesheet() {
    
    const linkElements = document.head.querySelectorAll("link[rel='stylesheet']");

    if (linkElements.length > 0) {
        let stylesheetRemoved = false;

        linkElements.forEach(link => {
            if (link.href.includes(IFRAME_STYLESHEET_HREF_PARTIAL)) {
                link.remove();
                stylesheetRemoved = true;
                return; // Assuming only one such stylesheet
            }
        });

        if (!stylesheetRemoved) {
            console.info("Iframe specific stylesheet not found, but not in iframe context.");
        }

    } else {

        console.warn("No link elements found in the document head.");
    
    }
}

/** 
 * Removes buttons that are irrelevant in an iframe context.
 */
function removeButtonsInIframeContext() {
    
    const buttonSelectors = [
        document.querySelector(".theme-switch-button"),
        document.querySelector(".btn-fullscreen-button")
    ]

    buttonSelectors.forEach(selector => {
        if (selector) {
            selector.remove();
        }
    });

}

/**
 * Initializes the theme synchronization logic based on whether the page is in an iframe.
 */
function initializeThemeSync() {
    const trustedOrigins = [
        "http://127.0.0.1:5501",
        "http://127.0.0.1:5500",
        "https://syed-a-naqvi.github.io"
    ];

    if (window.self !== window.top) {
        // Page is in an iframe
        setupIframeThemeListener(trustedOrigins);
        removeButtonsInIframeContext();
    } else {
        // Page is not in an iframe
        removeIframeSpecificStylesheet();
    }
}