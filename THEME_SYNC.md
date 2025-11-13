# Theme Synchronization System

*Cross-iframe theme coordination using the postMessage API*

---

## Overview

This Jupyter Book template includes a sophisticated theme synchronization system that enables seamless visual integration when your book is embedded in an iframe on your portfolio website. The system allows the parent webpage (portfolio) to control the book's theme (light/dark mode), ensuring a consistent user experience across your entire portfolio.

**Key Features:**

- 🎨 **Bidirectional theme control** - Portfolio controls book theme dynamically
- 🔒 **Secure communication** - Origin validation prevents unauthorized theme changes
- ⚡ **Instant updates** - Theme changes apply immediately without page reload
- 💾 **Persistent state** - Theme preference stored in localStorage
- 🖥️ **Graceful standalone mode** - Book functions independently outside iframe

**Implementation**: `_static/portfolio-sync.js`

---

## Architecture

### Communication Model

The theme synchronization system uses the **postMessage API** for secure cross-origin communication between the portfolio (parent window) and the embedded book (iframe).

```
┌─────────────────────────────────────┐
│        Portfolio Website            │
│         (Parent Window)             │
│                                     │
│  1. User toggles theme button       │
│  2. Portfolio updates own theme     │
│  3. Send postMessage to iframe  ────┼────┐
└─────────────────────────────────────┘    │
                                            │
                                            │ postMessage({
                                            │   type: "update-theme",
                                            │   theme: "dark"
                                            │ })
                                            │
┌────────────────────────────────────────┐ │
│     Jupyter Book (Iframe)              │◄┘
│                                        │
│  4. Receive postMessage                │
│  5. Validate origin (security)         │
│  6. Apply theme to book                │
│  7. Store preference in localStorage   │
└────────────────────────────────────────┘
```

### Data Flow

**1. User Interaction (Portfolio):**

```javascript
// Portfolio code
const themeButton = document.getElementById('theme-toggle');
themeButton.addEventListener('click', () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update portfolio theme
    applyTheme(newTheme);
    
    // Notify iframe
    const iframe = document.getElementById('book-iframe');
    iframe.contentWindow.postMessage({
        type: "update-theme",
        theme: newTheme
    }, "https://username.github.io");
});
```

**2. Message Reception (Book):**

```javascript
// Book code (portfolio-sync.js)
window.addEventListener("message", handleThemeMessage);

function handleThemeMessage(event) {
    // Security: Validate origin
    if (!TRUSTED_ORIGINS.includes(event.origin)) {
        console.warn("Untrusted origin:", event.origin);
        return;
    }
    
    // Process theme update
    if (event.data.type === "update-theme") {
        applyTheme(event.data.theme);
    }
}
```

**3. Theme Application (Book):**

```javascript
function applyTheme(theme) {
    const htmlElement = document.documentElement;
    
    // Update DOM attributes
    htmlElement.setAttribute("data-theme", theme);
    htmlElement.setAttribute("data-mode", theme);
    
    // Persist to localStorage
    localStorage.setItem("theme", theme);
    localStorage.setItem("mode", theme);
}
```

---

## postMessage API

### What is postMessage?

The `postMessage()` method provides a secure way for web pages from different origins to communicate. It's designed specifically for cross-origin iframe communication while maintaining browser security.

**Key characteristics:**

- **Cross-origin safe**: Allows controlled communication between different domains
- **Explicit targeting**: Sender specifies exact target origin
- **Event-based**: Receiver listens for message events
- **Structured data**: Supports any JavaScript object (serialized as JSON)
- **Security-first**: Receiver validates sender's origin before processing

### Message Structure

**Sending a message:**

```javascript
targetWindow.postMessage(message, targetOrigin);
```

**Parameters:**

1. `message` (any) - Data to send (will be structured cloned)
2. `targetOrigin` (string) - Expected origin of receiving window

**For theme synchronization:**

```javascript
iframe.contentWindow.postMessage(
    {
        type: "update-theme",
        theme: "dark"
    },
    "https://username.github.io"
);
```

### Message Event Object

**Receiving a message:**

```javascript
window.addEventListener("message", (event) => {
    console.log("Sender origin:", event.origin);
    console.log("Message data:", event.data);
    console.log("Source window:", event.source);
});
```

**Event properties:**

| Property | Type | Description |
|----------|------|-------------|
| `event.origin` | string | Origin of sender (e.g., `"https://portfolio.com"`) |
| `event.data` | any | The message payload |
| `event.source` | Window | Reference to sender's window object |

**For theme synchronization:**

```javascript
window.addEventListener("message", (event) => {
    // event.origin: "https://portfolio.com"
    // event.data: { type: "update-theme", theme: "dark" }
});
```

---

## Implementation Details

### Core Script: portfolio-sync.js

The theme synchronization is implemented in `_static/portfolio-sync.js`:

```javascript
(function() {
    'use strict';
    
    // ========================================================================
    // CONSTANTS
    // ========================================================================
    
    const MESSAGE_TYPE_UPDATE_THEME = "update-theme";
    const THEME_DARK = "dark";
    const THEME_LIGHT = "light";
    const DATA_THEME_ATTRIBUTE = "data-theme";
    const DATA_MODE_ATTRIBUTE = "data-mode";
    const LOCAL_STORAGE_THEME_KEY = "theme";
    const LOCAL_STORAGE_MODE_KEY = "mode";
    
    // Whitelist of origins allowed to control theme
    const TRUSTED_ORIGINS = [
        "http://127.0.0.1:5501",  // Local development (Live Server)
        "http://127.0.0.1:5500",  // Local development (alternative port)
        "https://syed-a-naqvi.github.io"  // Production portfolio
    ];
    
    // ========================================================================
    // THEME MANAGEMENT
    // ========================================================================
    
    /**
     * Applies theme to HTML element and persists to local storage
     * @param {string} theme - "light" or "dark"
     */
    function applyTheme(theme) {
        const htmlElement = document.documentElement;
        htmlElement.setAttribute(DATA_THEME_ATTRIBUTE, theme);
        htmlElement.setAttribute(DATA_MODE_ATTRIBUTE, theme);
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
        localStorage.setItem(LOCAL_STORAGE_MODE_KEY, theme);
    }

    /**
     * Handles theme update messages from parent window
     * @param {MessageEvent} event
     */
    function handleThemeMessage(event) {
        // Only process theme update messages
        if (event.data.type !== MESSAGE_TYPE_UPDATE_THEME) return;
        
        // Security: Validate sender origin
        if (!TRUSTED_ORIGINS.includes(event.origin)) {
            console.warn("Untrusted origin:", event.origin);
            return;
        }
        
        // Apply theme if valid
        if (event.data.theme === THEME_DARK || event.data.theme === THEME_LIGHT) {
            applyTheme(event.data.theme);
        } else {
            console.warn("Invalid theme received:", event.data.theme);
        }
    }
    
    // ========================================================================
    // IFRAME DETECTION & INITIALIZATION
    // ========================================================================
    
    function initialize() {
        const isIframe = window.self !== window.top;
        
        if (isIframe) {
            // Running inside iframe: Enable theme synchronization
            window.addEventListener("message", handleThemeMessage, false);
            console.log("Theme synchronization enabled (iframe mode)");
            
            // Additional iframe-specific setup...
            // (UI cleanup, custom ScrollSpy, etc.)
        } else {
            // Running standalone: Use normal theme controls
            console.log("Running in standalone mode");
        }
    }
    
    // Start when DOM is ready
    document.addEventListener("DOMContentLoaded", initialize);
})();
```

### Key Functions

#### 1. applyTheme(theme)

**Purpose**: Updates the document's theme and persists the preference

**Parameters:**

- `theme` (string) - Either `"light"` or `"dark"`

**Actions:**

1. Sets `data-theme` attribute on `<html>` element
2. Sets `data-mode` attribute on `<html>` element (redundant for compatibility)
3. Stores theme in localStorage under key `"theme"`
4. Stores theme in localStorage under key `"mode"` (redundant for compatibility)

**Why both attributes?**

Different Sphinx themes check different attributes:

- `data-theme` - Used by sphinx-book-theme
- `data-mode` - Used by pydata-sphinx-theme
- Setting both ensures compatibility across theme variants

**Why both localStorage keys?**

Similarly, different theme implementations check different keys for persistence.

#### 2. handleThemeMessage(event)

**Purpose**: Processes theme update messages from parent window

**Parameters:**

- `event` (MessageEvent) - The postMessage event object

**Security Checks:**

1. **Message type validation**: Only process `"update-theme"` messages
2. **Origin validation**: Only accept messages from TRUSTED_ORIGINS
3. **Theme value validation**: Only accept `"light"` or `"dark"`

**Error Handling:**

- Logs warnings for untrusted origins
- Logs warnings for invalid theme values
- Gracefully ignores invalid messages (no exceptions thrown)

#### 3. initialize()

**Purpose**: Sets up theme synchronization based on context (iframe vs standalone)

**Context Detection:**

```javascript
const isIframe = window.self !== window.top;
```

- `window.self` - Reference to current window
- `window.top` - Reference to topmost window in frame hierarchy
- If they're different, page is in an iframe

**Iframe Context:**

- Attaches message event listener for theme synchronization
- Removes theme toggle buttons (controlled by parent)
- Initializes custom ScrollSpy
- Applies iframe-specific CSS

**Standalone Context:**

- Preserves normal theme toggle buttons
- Uses Bootstrap's default ScrollSpy
- No special handling needed

---

## Security Considerations

### Origin Validation

**Why it's critical:**

Without origin validation, **any website** could embed your book and control its theme, potentially for malicious purposes:

- Phishing attacks (make book look like a different site)
- UI manipulation (hide content, overlay fake UI)
- User confusion (theme changes unexpectedly)

**Implementation:**

```javascript
const TRUSTED_ORIGINS = [
    "http://127.0.0.1:5501",              // Local dev
    "http://127.0.0.1:5500",              // Local dev (alt)
    "https://syed-a-naqvi.github.io"     // Production
];

function handleThemeMessage(event) {
    if (!TRUSTED_ORIGINS.includes(event.origin)) {
        console.warn("Untrusted origin:", event.origin);
        return;  // Ignore message
    }
    // ... process message ...
}
```

**Best practices:**

1. **Always validate origin** - Never trust event.data without checking event.origin
2. **Use exact matches** - Don't use wildcards or regex (easy to bypass)
3. **HTTPS in production** - Use https:// origins for deployed sites
4. **Minimal whitelist** - Only add origins you control

### Updating Trusted Origins

When deploying to your own portfolio, update the TRUSTED_ORIGINS array:

```javascript
const TRUSTED_ORIGINS = [
    "http://127.0.0.1:5501",              // Keep for local testing
    "http://127.0.0.1:5500",              // Keep for local testing
    "https://your-username.github.io"    // Replace with your portfolio URL
];
```

**Common mistakes:**

```javascript
// ❌ Too permissive (accepts any subdomain)
"https://*.github.io"

// ❌ Includes path (origin doesn't include paths)
"https://user.github.io/portfolio"

// ❌ Includes trailing slash
"https://user.github.io/"

// ✅ Correct format
"https://user.github.io"
```

### Message Type Validation

**Why it's important:**

Prevents message injection attacks where malicious code sends fake messages:

```javascript
// Malicious attempt
iframe.contentWindow.postMessage({
    type: "execute-code",
    code: "alert('XSS')"
}, "*");
```

**Protection:**

```javascript
function handleThemeMessage(event) {
    // Only process expected message type
    if (event.data.type !== MESSAGE_TYPE_UPDATE_THEME) {
        return;  // Silently ignore other message types
    }
    // ... process theme update ...
}
```

### Theme Value Validation

**Why it's important:**

Prevents injection of invalid or malicious theme values:

```javascript
// Malicious attempt
iframe.contentWindow.postMessage({
    type: "update-theme",
    theme: "javascript:alert('XSS')"
}, "https://user.github.io");
```

**Protection:**

```javascript
function handleThemeMessage(event) {
    // Only accept specific theme values
    if (event.data.theme === THEME_DARK || event.data.theme === THEME_LIGHT) {
        applyTheme(event.data.theme);
    } else {
        console.warn("Invalid theme received:", event.data.theme);
        return;  // Ignore invalid themes
    }
}
```

---

## Portfolio Implementation

### HTML Structure

Embed the Jupyter Book in your portfolio:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body data-theme="light">
    
    <!-- Portfolio header with theme toggle -->
    <header>
        <nav>
            <h1>My Portfolio</h1>
            <button id="theme-toggle" aria-label="Toggle theme">
                <span class="theme-icon">🌙</span>
            </button>
        </nav>
    </header>
    
    <!-- Main content area with embedded book -->
    <main>
        <div class="project-viewer">
            <iframe 
                id="book-iframe"
                src="https://your-username.github.io/your-book/"
                width="100%"
                height="800px"
                frameborder="0"
                allow="fullscreen"
                loading="lazy">
            </iframe>
        </div>
    </main>
    
    <script src="theme-controller.js"></script>
</body>
</html>
```

### Theme Controller Script

Create `theme-controller.js` in your portfolio:

```javascript
(function() {
    'use strict';
    
    // Configuration
    const BOOK_IFRAME_ID = 'book-iframe';
    const BOOK_ORIGIN = 'https://your-username.github.io';
    const THEME_TOGGLE_ID = 'theme-toggle';
    const LOCAL_STORAGE_KEY = 'portfolio-theme';
    
    // State
    let currentTheme = localStorage.getItem(LOCAL_STORAGE_KEY) || 'light';
    
    // DOM elements
    const themeToggle = document.getElementById(THEME_TOGGLE_ID);
    const bookIframe = document.getElementById(BOOK_IFRAME_ID);
    const html = document.documentElement;
    
    /**
     * Apply theme to portfolio
     */
    function applyPortfolioTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(LOCAL_STORAGE_KEY, theme);
        updateThemeIcon(theme);
        currentTheme = theme;
    }
    
    /**
     * Update theme toggle icon
     */
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('.theme-icon');
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
    
    /**
     * Notify iframe of theme change
     */
    function notifyIframeThemeChange(theme) {
        if (!bookIframe || !bookIframe.contentWindow) {
            console.warn('Book iframe not found or not loaded');
            return;
        }
        
        bookIframe.contentWindow.postMessage({
            type: 'update-theme',
            theme: theme
        }, BOOK_ORIGIN);
        
        console.log(`Sent theme update to book: ${theme}`);
    }
    
    /**
     * Toggle theme
     */
    function toggleTheme() {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update portfolio theme
        applyPortfolioTheme(newTheme);
        
        // Notify iframe
        notifyIframeThemeChange(newTheme);
    }
    
    /**
     * Initialize theme system
     */
    function initialize() {
        // Apply initial theme to portfolio
        applyPortfolioTheme(currentTheme);
        
        // Setup theme toggle button
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Wait for iframe to load, then sync theme
        if (bookIframe) {
            bookIframe.addEventListener('load', () => {
                console.log('Book iframe loaded, syncing theme...');
                notifyIframeThemeChange(currentTheme);
            });
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
```

### CSS Styling

Add theme-aware styles to your portfolio:

```css
/* Theme variables */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #2c3e50;
    --header-bg: #f8f9fa;
    --border-color: #dee2e6;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #2d2d2d;
    --border-color: #404040;
}

/* Apply theme variables */
body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}

header {
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
}

/* Theme toggle button */
#theme-toggle {
    background: none;
    border: 2px solid var(--border-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
}

#theme-toggle:hover {
    transform: scale(1.1);
    border-color: var(--text-color);
}

/* Iframe container */
.project-viewer {
    max-width: 1200px;
    margin: 2rem auto;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

#book-iframe {
    display: block;
    border: none;
}
```

---

## Theme Persistence

### localStorage Strategy

The system uses localStorage to persist theme preferences across page reloads:

**Book (iframe):**

```javascript
// Store theme
localStorage.setItem("theme", "dark");
localStorage.setItem("mode", "dark");

// Retrieve theme on page load
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);
```

**Portfolio (parent):**

```javascript
// Store portfolio theme
localStorage.setItem("portfolio-theme", "dark");

// Retrieve portfolio theme on page load
const savedTheme = localStorage.getItem("portfolio-theme") || "light";
applyPortfolioTheme(savedTheme);
```

### Synchronization on Load

**Challenge**: When the page loads, book and portfolio may have different themes stored.

**Solution**: Portfolio always takes precedence and syncs to iframe on load:

```javascript
// In portfolio: Wait for iframe to load
bookIframe.addEventListener('load', () => {
    // Get portfolio's current theme
    const portfolioTheme = localStorage.getItem("portfolio-theme") || "light";
    
    // Sync to iframe
    bookIframe.contentWindow.postMessage({
        type: 'update-theme',
        theme: portfolioTheme
    }, BOOK_ORIGIN);
});
```

**Result**: Consistent theme across portfolio and embedded book on every page load.

### Cross-Origin localStorage Limitation

**Important**: localStorage is origin-specific and cannot be shared across origins.

**This means:**

- Portfolio at `portfolio.com` has its own localStorage
- Book at `username.github.io` has its own localStorage
- They cannot directly access each other's storage

**Implications:**

1. Each needs its own theme persistence
2. Theme must be synced via postMessage on every page load
3. User could have different themes if viewing book standalone vs embedded

**Workaround**: Always sync on iframe load (as shown above)

---

## Testing

### Local Development Testing

**1. Start local servers:**

Portfolio (port 5500):

```bash
# Using Live Server extension in VS Code
# Right-click portfolio index.html → Open with Live Server
# Or use Python:
cd portfolio/
python -m http.server 5500
```

Book (port 8000):

```bash
cd jupyter-book/
sphinx-autobuild . _build/html --open-browser --port 8000
```

**2. Update trusted origins for local testing:**

In `portfolio-sync.js`:

```javascript
const TRUSTED_ORIGINS = [
    "http://127.0.0.1:5500",  // Portfolio local server
    "http://localhost:5500",   // Alternative localhost
    // Production origins...
];
```

In portfolio `theme-controller.js`:

```javascript
const BOOK_ORIGIN = 'http://127.0.0.1:8000';  // Book local server
```

**3. Test theme synchronization:**

- Open portfolio at `http://127.0.0.1:5500`
- Verify book loads in iframe
- Click theme toggle in portfolio
- Verify book theme changes instantly
- Check browser console for sync messages

### Production Testing

**1. Deploy both sites:**

- Portfolio: Deployed to `https://username.github.io`
- Book: Deployed to `https://username.github.io/book-repo`

**2. Update origins for production:**

In `portfolio-sync.js`:

```javascript
const TRUSTED_ORIGINS = [
    "http://127.0.0.1:5500",            // Keep for local dev
    "https://username.github.io"        // Production portfolio
];
```

In portfolio `theme-controller.js`:

```javascript
const BOOK_ORIGIN = 'https://username.github.io';  // Production
```

**3. Test across browsers:**

- Chrome/Edge (Chromium-based)
- Firefox
- Safari (if on macOS)
- Mobile browsers (responsive testing)

### Debugging

**Enable console logging:**

```javascript
// In handleThemeMessage
console.log('Received message:', event.data);
console.log('From origin:', event.origin);
console.log('Applying theme:', theme);
```

**Common issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Theme not changing | Origin not trusted | Add origin to TRUSTED_ORIGINS |
| Console warning "Untrusted origin" | Mismatch between sender and TRUSTED_ORIGINS | Verify origin matches exactly (no trailing slash, correct protocol) |
| Theme changes but doesn't persist | localStorage not working | Check browser privacy settings, ensure cookies enabled |
| Iframe not loading | CORS restrictions | Ensure book is on GitHub Pages or similar (allows iframe embedding) |
| postMessage not received | Iframe not loaded yet | Add 'load' event listener before sending message |

**Debugging template:**

```javascript
// In portfolio
console.log('Portfolio origin:', window.location.origin);
console.log('Sending message to:', BOOK_ORIGIN);
console.log('Message:', {type: 'update-theme', theme: newTheme});

// In book
window.addEventListener('message', (event) => {
    console.log('Message received!');
    console.log('Origin:', event.origin);
    console.log('Data:', event.data);
    console.log('Trusted?', TRUSTED_ORIGINS.includes(event.origin));
});
```

---

## Browser Compatibility

### postMessage API Support

**Supported browsers:**

- ✅ Chrome 1+ (since 2008)
- ✅ Firefox 3+ (since 2008)
- ✅ Safari 4+ (since 2009)
- ✅ Edge (all versions)
- ✅ Opera 9.5+ (since 2008)
- ✅ IE 8+ (with limitations)

**Compatibility: 99.9%** of users (as of 2025)

### localStorage Support

**Supported browsers:**

- ✅ Chrome 4+ (since 2010)
- ✅ Firefox 3.5+ (since 2009)
- ✅ Safari 4+ (since 2009)
- ✅ Edge (all versions)
- ✅ Opera 10.5+ (since 2010)
- ✅ IE 8+ (since 2009)

**Compatibility: 99.8%** of users (as of 2025)

### Polyfills

No polyfills needed for modern browsers. For legacy support (IE 8-9):

```javascript
// localStorage polyfill for IE 8
if (!window.localStorage) {
    window.localStorage = {
        getItem: function(key) {
            return this[key] || null;
        },
        setItem: function(key, value) {
            this[key] = value;
        }
    };
}
```

---

## Advanced Customization

### Multiple Theme Options

Extend beyond light/dark to support multiple themes:

```javascript
const AVAILABLE_THEMES = ["light", "dark", "high-contrast", "sepia"];

function handleThemeMessage(event) {
    if (!TRUSTED_ORIGINS.includes(event.origin)) return;
    if (event.data.type !== MESSAGE_TYPE_UPDATE_THEME) return;
    
    // Validate theme is one of available options
    if (AVAILABLE_THEMES.includes(event.data.theme)) {
        applyTheme(event.data.theme);
    }
}
```

### Theme Transition Animations

Add smooth transitions when theme changes:

```javascript
function applyTheme(theme) {
    const htmlElement = document.documentElement;
    
    // Add transition class
    htmlElement.classList.add('theme-transitioning');
    
    // Update theme
    htmlElement.setAttribute(DATA_THEME_ATTRIBUTE, theme);
    htmlElement.setAttribute(DATA_MODE_ATTRIBUTE, theme);
    
    // Store preference
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    localStorage.setItem(LOCAL_STORAGE_MODE_KEY, theme);
    
    // Remove transition class after animation
    setTimeout(() => {
        htmlElement.classList.remove('theme-transitioning');
    }, 300);
}
```

CSS:

```css
html.theme-transitioning * {
    transition: background-color 0.3s ease, 
                color 0.3s ease, 
                border-color 0.3s ease !important;
}
```

### Bidirectional Communication

Allow book to notify portfolio of theme changes:

```javascript
// In book (portfolio-sync.js)
function notifyParentOfThemeChange(theme) {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'book-theme-changed',
            theme: theme
        }, '*');  // Or specify parent origin if known
    }
}

// In portfolio (theme-controller.js)
window.addEventListener('message', (event) => {
    if (event.data.type === 'book-theme-changed') {
        applyPortfolioTheme(event.data.theme);
    }
});
```

### Automatic Theme Detection

Detect and apply system theme preference:

```javascript
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
}

function initialize() {
    // Try localStorage first
    let savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    
    // Fall back to system preference
    if (!savedTheme) {
        savedTheme = getSystemTheme();
    }
    
    applyTheme(savedTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
            if (!localStorage.getItem(LOCAL_STORAGE_THEME_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
}
```

---

## Performance Considerations

### Message Throttling

Prevent excessive postMessage calls:

```javascript
// In portfolio
let themeChangeTimeout;

function throttledThemeChange(theme) {
    clearTimeout(themeChangeTimeout);
    
    themeChangeTimeout = setTimeout(() => {
        notifyIframeThemeChange(theme);
    }, 100);  // Debounce for 100ms
}
```

### Lazy Iframe Loading

Defer iframe loading until visible:

```html
<iframe 
    id="book-iframe"
    src="https://username.github.io/book/"
    loading="lazy"
    width="100%"
    height="800px">
</iframe>
```

**Benefits:**

- Faster initial page load
- Reduced bandwidth usage
- Better performance on mobile

**Trade-off:**

- Slight delay when scrolling to iframe
- Theme sync happens when iframe loads (not immediately)

---

## Summary

The theme synchronization system provides:

✅ **Seamless integration** - Book blends perfectly with portfolio theme  
✅ **Secure communication** - Origin validation prevents unauthorized control  
✅ **Instant updates** - Theme changes apply immediately without reload  
✅ **Persistent preferences** - Theme remembered across sessions  
✅ **Dual-mode operation** - Works standalone or embedded  
✅ **Browser compatibility** - Supported by 99.9% of browsers  

**Key Achievement:** Complete visual integration between portfolio and embedded books through secure, real-time theme synchronization—creating a cohesive, professional user experience.
