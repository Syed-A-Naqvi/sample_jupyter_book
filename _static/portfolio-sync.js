// wait for DOM to load fully before modifying elements
document.addEventListener("DOMContentLoaded", function() {

    syncParentTheme();

});


function syncParentTheme() {

    const htmlElement = document.documentElement;
    const trustedOrigins = [
        "http://127.0.0.1:5501",
        "http://127.0.0.1:5500",
        "https://syed-a-naqvi.github.io"
    ];
    
    // if the page is in an iframe, add post message listeners
    if (window.self !== window.top) {

        // Listens for messages requesting theme change
        window.addEventListener("message", function(event) {
          
            // event.data contains the payload sent from the parent
          // event.origin is the sender's origin
          if (event.data.type === "update-theme" && trustedOrigins.includes(event.origin)) {
            // Handle the data
            if (event.data.theme === "dark") {
                htmlElement.setAttribute("data-theme", "dark");
                htmlElement.setAttribute("data-mode", "dark");
                localStorage.setItem("theme", "dark");
                localStorage.setItem("mode", "dark");
            }
            else {
                htmlElement.setAttribute("data-theme", "light");
                htmlElement.setAttribute("data-mode", "light");
                localStorage.setItem("theme", "light");
                localStorage.setItem("mode", "light");
            }
          }

        });

    }
}