# Theme Synchronization System

*Cross-iframe theme coordination using postMessage API*

---

## Overview

The template includes theme synchronization for iframe embedding, allowing a portfolio website to control the book's theme (light/dark mode) dynamically. The system uses the postMessage API for secure cross-origin communication.

**Implementation**: `_static/portfolio-sync.js`

---

## Features

- Portfolio controls book theme dynamically

- Secure communication with origin validation

- Instant updates without page reload

- Persistent state in localStorage

- Graceful standalone mode

---

## Architecture

### Communication Model

```text
┌──────────────────────────┐
│  Portfolio (Parent)      │
│  1. User toggles theme   │
│  2. Update portfolio     │
│  3. Send postMessage ──┐ │
└────────────────────────┼─┘
                         │  
┌────────────────────────┼─┐
│  Book (Iframe)         │ │
│  4. Receive message  ◄─┘ │
│  5. Validate origin      │
│  6. Apply theme          │
└──────────────────────────┘
```

### Data Flow

**Portfolio code:**

```javascript
const iframe = document.querySelector('iframe');
const newTheme = 'dark';  // or 'light'

iframe.contentWindow.postMessage({
  type: 'update-theme',
  theme: newTheme
}, "https://username.github.io");
```

**Book code:**

```javascript
window.addEventListener("message", (event) => {
  if (event.data.type === 'update-theme') {
    applyTheme(event.data.theme);
  }
});
```

---

## postMessage API

### Overview

The `postMessage()` method provides secure cross-origin communication between web pages. It's designed for iframe communication while maintaining browser security.

**Characteristics:**

- Cross-origin safe with explicit targeting

- Event-based message reception

- Supports any JavaScript object (JSON-serialized)

- Receiver validates sender's origin

### Message Structure

**Sending:**

```javascript
targetWindow.postMessage(message, targetOrigin);
```

Parameters:

- `message` (any) - Data to send (structured clone)

- `targetOrigin` (string) - Expected receiver origin

**For theme sync:**

```javascript
iframe.contentWindow.postMessage(
  { type: 'update-theme', theme: 'dark' },
  "https://username.github.io"
);
```

### Message Event

**Receiving:**

```javascript
window.addEventListener("message", (event) => {
  console.log(event.origin);  // Sender origin
  console.log(event.data);    // Message payload
  console.log(event.source);  // Sender window
});
```

**Event properties:**

| Property | Type | Description |
|----------|------|-------------|
| `event.origin` | string | Sender origin (e.g., `"https://portfolio.com"`) |
| `event.data` | any | Message payload |
| `event.source` | Window | Sender window reference |

---

## Implementation

### Core Script

The theme synchronization is in `_static/portfolio-sync.js`:

```javascript
(function() {
  'use strict';
  
  const TRUSTED_ORIGINS = [
    "http://127.0.0.1:5501",  // Local development
    "http://127.0.0.1:5500",
    "https://syed-a-naqvi.github.io"  // Production
  ];
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', theme);
    localStorage.setItem('theme', theme);
    localStorage.setItem('mode', theme);
  }
  
  function handleThemeMessage(event) {
    if (event.data.type !== 'update-theme') return;
    if (!TRUSTED_ORIGINS.includes(event.origin)) {
      console.warn('Untrusted origin:', event.origin);
      return;
    }
    if (event.data.theme === 'dark' || event.data.theme === 'light') {
      applyTheme(event.data.theme);
    }
  }
  
  function initialize() {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      window.addEventListener("message", handleThemeMessage);
      // Remove theme toggle buttons (controlled by parent)
      document.querySelectorAll('.theme-switch-button').forEach(btn => btn.remove());
    }
  }
  
  document.addEventListener("DOMContentLoaded", initialize);
})();
```

### Key Functions

#### 1. applyTheme(theme)

**Purpose**: Updates document theme and persists preference

```javascript
function applyTheme(theme) {
  const htmlElement = document.documentElement;
  htmlElement.setAttribute('data-theme', theme);
  htmlElement.setAttribute('data-mode', theme);
  localStorage.setItem('theme', theme);
  localStorage.setItem('mode', theme);
}
```

**Why both attributes:**

- `data-theme` - Used by sphinx-book-theme

- `data-mode` - Used by pydata-sphinx-theme

Setting both ensures compatibility across theme variants.

**Why both localStorage keys:**

Different theme implementations check different keys for persistence.

#### 2. handleThemeMessage(event)

**Purpose**: Processes theme update messages from parent window

```javascript
function handleThemeMessage(event) {
  // Message type validation
  if (event.data.type !== 'update-theme') return;
  
  // Origin validation
  if (!TRUSTED_ORIGINS.includes(event.origin)) {
    console.warn('Untrusted origin:', event.origin);
    return;
  }
  
  // Theme value validation
  if (event.data.theme === 'dark' || event.data.theme === 'light') {
    applyTheme(event.data.theme);
  }
}
```

**Security checks:**

1. Message type validation - Only process `"update-theme"` messages

2. Origin validation - Only accept from `TRUSTED_ORIGINS`

3. Theme value validation - Only accept `"light"` or `"dark"`

#### 3. initialize()

**Purpose**: Sets up theme sync based on context

```javascript
function initialize() {
  const isIframe = window.self !== window.top;
  
  if (isIframe) {
    // Attach message listener
    window.addEventListener("message", handleThemeMessage);
    
    // Remove theme toggle buttons
    document.querySelectorAll('.theme-switch-button').forEach(btn => btn.remove());
    
    // Initialize custom ScrollSpy
    initializeCustomScrollSpy();
  }
}
```

**Context detection:**

```javascript
const isIframe = window.self !== window.top;
```

- `window.self` - Current window

- `window.top` - Topmost window in frame hierarchy

- Different values indicate iframe embedding

**Iframe context:**

- Attaches message listener

- Removes theme buttons (controlled by parent)

- Initializes custom ScrollSpy

**Standalone context:**

- Preserves normal theme toggle buttons

- Uses Bootstrap's default ScrollSpy

---

## Security

### Origin Validation

**Critical for security:**

Without origin validation, any website could control the book's theme for malicious purposes (phishing, UI manipulation).

**Implementation:**

```javascript
const TRUSTED_ORIGINS = [
  "http://127.0.0.1:5501",
  "https://syed-a-naqvi.github.io"
];

function handleThemeMessage(event) {
  if (!TRUSTED_ORIGINS.includes(event.origin)) {
    console.warn('Untrusted origin:', event.origin);
    return;
  }
  // Process message
}
```

**Configuration:**

Update `TRUSTED_ORIGINS` array in `portfolio-sync.js` to include:

- Local development servers (e.g., `http://127.0.0.1:5500`)

- Production portfolio domain (e.g., `https://portfolio.com`)

### Message Validation

Multiple validation layers:

1. **Type check**: Only process `update-theme` messages

2. **Origin check**: Only accept from trusted origins

3. **Value check**: Only accept valid theme values

**Defense in depth:**

Even if one validation fails, others provide protection.

---

## Portfolio Integration

### Portfolio Controller Setup

Portfolio code to control book theme:

```javascript
// Get theme toggle button
const themeToggle = document.getElementById('theme-toggle');

// Get iframe element
const bookIframe = document.querySelector('iframe#jupyter-book');

themeToggle.addEventListener('click', () => {
  // Toggle portfolio theme
  const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Send message to book iframe
  if (bookIframe && bookIframe.contentWindow) {
    bookIframe.contentWindow.postMessage(
      { type: 'update-theme', theme: newTheme },
      "https://username.github.io"  // Target origin
    );
  }
});
```

### Initial Theme Sync

Sync book theme on iframe load:

```javascript
bookIframe.addEventListener('load', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  bookIframe.contentWindow.postMessage(
    { type: 'update-theme', theme: currentTheme },
    "https://username.github.io"
  );
});
```

### Error Handling

```javascript
try {
  bookIframe.contentWindow.postMessage(
    { type: 'update-theme', theme: newTheme },
    "https://username.github.io"
  );
} catch (error) {
  console.error('Failed to send theme update:', error);
}
```

---

## Testing

### Local Development

1. **Start portfolio locally** (e.g., Live Server on port 5501)

2. **Build book and serve** (e.g., `sphinx-autobuild` on port 8000)

3. **Embed book in portfolio**:

   ```html
   <iframe src="http://127.0.0.1:8000" width="100%" height="800"></iframe>
   ```

4. **Update TRUSTED_ORIGINS** in `portfolio-sync.js`:

   ```javascript
   const TRUSTED_ORIGINS = [
     "http://127.0.0.1:5501",  // Portfolio local server
     "http://127.0.0.1:5500"
   ];
   ```

5. **Test theme toggle** in portfolio

### Production Testing

1. **Deploy book to GitHub Pages**

2. **Deploy portfolio with embedded book**

3. **Verify theme synchronization works**

4. **Check browser console for errors**

### Verification Checklist

- [ ] Theme changes in portfolio update book immediately

- [ ] No console errors or warnings

- [ ] Origin validation rejects untrusted origins

- [ ] Theme persists in book's localStorage

- [ ] Standalone book mode still has theme toggle

---

## Troubleshooting

### Theme not synchronizing

**Check iframe load:**

```javascript
bookIframe.addEventListener('load', () => {
  console.log('Book iframe loaded');
});
```

**Verify postMessage call:**

```javascript
console.log('Sending theme update:', newTheme);
bookIframe.contentWindow.postMessage(/* ... */);
```

**Check browser console in book:**

Open book directly and check for:

- Origin validation warnings

- Message reception logs

### Origin validation failing

**Mismatch between portfolio origin and TRUSTED_ORIGINS:**

- Portfolio runs on `https://example.com`

- TRUSTED_ORIGINS includes `https://www.example.com`

- These are different origins (subdomain matters)

**Solution:** Add exact origin to TRUSTED_ORIGINS:

```javascript
const TRUSTED_ORIGINS = [
  "https://example.com",        // Without www
  "https://www.example.com"     // With www
];
```

### Theme toggle buttons still visible in iframe

**Cause:** Button removal selector doesn't match actual buttons

**Solution:** Check actual button classes and update selector:

```javascript
document.querySelectorAll('.theme-switch-button, .btn-theme-toggle').forEach(btn => btn.remove());
```

---

## Summary

The theme synchronization system provides:

✅ **Dynamic control** - Portfolio controls book theme in real-time  

✅ **Secure** - Origin validation prevents unauthorized access  

✅ **Persistent** - Theme saved in localStorage  

✅ **Transparent** - Works seamlessly in iframe context  

✅ **Standalone compatible** - Book functions independently outside iframe  

The postMessage API enables secure cross-origin communication while maintaining browser security guarantees.
