# Custom ScrollSpy Implementation

*IntersectionObserver-based navigation for iframe contexts*

---

## Overview

The template includes a custom ScrollSpy implementation for iframe contexts. Bootstrap's native ScrollSpy fails when the book is embedded in an iframe, requiring a custom solution using the IntersectionObserver API.

**Implementation**: `_static/portfolio-sync.js`

---

## Problem

Bootstrap ScrollSpy doesn't function in iframe contexts—TOC links never receive the `.active` class despite content scrolling normally. The root cause is unclear, but the symptom is consistent: scroll-based active state detection fails.

---

## Solution

A custom implementation using IntersectionObserver API that:

- Operates independently of Bootstrap
- Uses browser-native intersection detection
- Works reliably in iframe contexts
- Adapts to viewport size changes

---

## Secondary TOC Structure

### HTML Structure

The secondary sidebar (right side) shows page-level navigation:

```html
<div class="bd-sidebar-secondary bd-toc">
  <div class="sidebar-secondary-items">
    <nav class="bd-toc-nav page-toc">
      <ul class="visible nav section-nav flex-column">
        <li class="toc-h2 nav-item">
          <a class="nav-link" href="#overview">Overview</a>
        </li>
        <li class="toc-h2 nav-item">
          <a class="nav-link" href="#methodology">Methodology</a>
          <ul class="nav section-nav flex-column">
            <li class="toc-h3 nav-item">
              <a class="nav-link" href="#data">Data Collection</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</div>
```

### Key Elements

| Element | Purpose |
|---------|---------|
| `.bd-toc-nav` | Navigation element Bootstrap targets |
| `.nav-link` | TOC links (receive `.active` class) |
| `.toc-h2`, `.toc-h3` | Heading level indicators |
| `.section-nav` | Nested lists for hierarchical structure |

### Link-to-Section Mapping

Each TOC link corresponds to a content section:

```html
<!-- TOC Link -->
<a class="nav-link" href="#methodology">Methodology</a>

<!-- Content Section -->
<section id="methodology">
  <h2>Methodology</h2>
  ...
</section>
```

The `href="#id"` must match the section's `id="id"`.

---

## Bootstrap ScrollSpy Configuration

Every Jupyter Book page includes this configuration:

```html
<body data-bs-spy="scroll" 
      data-bs-target=".bd-toc-nav" 
      data-offset="180" 
      data-bs-root-margin="0px 0px -60%">
```

**Configuration:**

- `data-bs-spy="scroll"` - Enables ScrollSpy
- `data-bs-target=".bd-toc-nav"` - Navigation to update
- `data-offset="180"` - Active zone starts 180px from viewport top
- `data-bs-root-margin="0px 0px -60%"` - Active zone in top 40% of viewport

**Normal Operation:**

1. Attach scroll event listener to window
2. Calculate which sections are in active zone
3. Update TOC by adding `.active` to current section's link

**Iframe Failure:**

The scroll events don't trigger the active state updates. Interaction with scrolling and click events works, but the automatic active state detection fails.

---

## Custom Implementation

### Core Concept

Use IntersectionObserver to watch content sections and update TOC links based on viewport intersection.

### IntersectionObserver API

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Section is visible in viewport
      const link = sectionLinkMap.get(entry.target);
      setActiveLink(link);
    }
  });
}, {
  root: null,  // viewport
  rootMargin: '-180px 0px -80% 0px',  // Active zone
  threshold: 0  // Trigger when any part enters zone
});
```

**Advantages over scroll events:**

- Browser-native intersection detection
- No reliance on scroll event propagation
- Efficient performance (browser-optimized)
- Works consistently in iframe contexts

### Implementation Details

#### 1. Data Structure Setup

```javascript
const sectionLinkMap = new Map();  // section → link
const childToParentMap = new Map();  // child link → parent link
const tocLinks = Array.from(document.querySelectorAll('.bd-toc-nav a.nav-link[href^="#"]'));
const activeLinks = [];  // Track active link chain
```

#### 2. Building Mappings

```javascript
tocLinks.forEach(link => {
  const sectionId = link.getAttribute('href').substring(1);
  const section = document.getElementById(sectionId);
  
  if (section) {
    sectionLinkMap.set(section, link);
    
    // Build parent-child relationships
    const parentLi = link.parentElement.closest('li.nav-item');
    if (parentLi) {
      const parentLink = parentLi.querySelector(':scope > a.nav-link');
      if (parentLink && parentLink !== link) {
        childToParentMap.set(link, parentLink);
      }
    }
  }
});
```

#### 3. Active Link Setting

```javascript
function setActiveLink(link) {
  // Remove all active classes
  while (activeLinks.length > 0) {
    activeLinks.pop().classList.remove('active');
  }
  
  // Add active class to link and all parents
  let currentLink = link;
  while (currentLink) {
    currentLink.classList.add('active');
    activeLinks.push(currentLink);
    currentLink = childToParentMap.get(currentLink);
  }
}
```

This ensures hierarchical highlighting: if a subsection is active, its parent sections are also marked active.

#### 4. Responsive Observer Configuration

```javascript
function getResponsiveObserver() {
  const viewportHeight = window.innerHeight;
  
  // Adapt bottom margin based on viewport size
  let bottomMarginPercent;
  if (viewportHeight < 600) {
    bottomMarginPercent = 70;  // Smaller active zone on small screens
  } else if (viewportHeight < 900) {
    bottomMarginPercent = 75;
  } else {
    bottomMarginPercent = 80;  // Larger active zone on big screens
  }
  
  const topMargin = 180;
  const bottomMargin = Math.floor(viewportHeight * (bottomMarginPercent / 100));
  
  return new IntersectionObserver((entries) => {
    let topMostEntry = null;
    let topMostY = Infinity;
    
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.boundingClientRect.top < topMostY) {
        topMostY = entry.boundingClientRect.top;
        topMostEntry = entry;
      }
    });
    
    if (topMostEntry) {
      const link = sectionLinkMap.get(topMostEntry.target);
      if (link) setActiveLink(link);
    }
  }, {
    root: null,
    rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px`,
    threshold: 0
  });
}
```

**Responsive behavior:**

- Small screens (< 600px): 70% bottom margin (30% active zone)
- Medium screens (600-900px): 75% bottom margin (25% active zone)
- Large screens (> 900px): 80% bottom margin (20% active zone)

This prevents excessive TOC updates on smaller viewports.

#### 5. Click Handler Integration

```javascript
tocLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const sectionId = link.getAttribute('href').substring(1);
    const section = document.getElementById(sectionId);
    
    if (section) {
      e.preventDefault();
      
      // Disable observer during smooth scroll
      toggleObserver(false);
      
      // Immediately set active state
      setActiveLink(link);
      
      // Smooth scroll to section
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Re-enable observer after scroll completes
      setTimeout(() => toggleObserver(true), 1000);
    }
  });
});
```

**Why disable observer during scroll:**

Smooth scrolling triggers many intersection events. Temporarily disabling the observer prevents conflicting active state updates during user-initiated navigation.

#### 6. User Interaction Detection

```javascript
['wheel', 'keydown', 'mousedown', 'touchstart'].forEach(eventType => {
  document.addEventListener(eventType, () => {
    if (!observerActive) {
      toggleObserver(true);
    }
  }, { passive: true });
});
```

Detects when the user resumes manual scrolling and re-enables the observer.

#### 7. Viewport Resize Handling

```javascript
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (observer) {
      observer.disconnect();
    }
    observer = getResponsiveObserver();
    toggleObserver(true);
  }, 250);
});
```

Debounces resize events and recreates observer with updated rootMargin.

#### 8. Initialization

```javascript
// Remove Bootstrap ScrollSpy
document.body.removeAttribute('data-bs-spy');
document.body.removeAttribute('data-bs-target');
document.body.removeAttribute('data-offset');
document.body.removeAttribute('data-bs-root-margin');

if (window.bootstrap?.ScrollSpy) {
  const scrollSpyInstance = window.bootstrap.ScrollSpy.getInstance(document.body);
  if (scrollSpyInstance) {
    scrollSpyInstance.dispose();
  }
}

// Create and start observer
observer = getResponsiveObserver();
sectionLinkMap.forEach((link, section) => {
  observer.observe(section);
});
```

Cleans up Bootstrap ScrollSpy and initializes custom implementation.

---

## Performance Characteristics

### Time Complexity

- **Initialization**: O(n) where n is number of TOC links
- **Intersection event**: O(1) for single section
- **Active link update**: O(h) where h is hierarchy depth (typically 2-4)

### Space Complexity

- O(n) for storing section-link mappings
- O(h) for storing active link chain

### Browser Optimization

IntersectionObserver is optimized by the browser:

- Uses browser's layout engine for intersection calculations
- Batches multiple intersection checks
- Doesn't block main thread
- More efficient than scroll event listeners

---

## Integration

### Iframe Context Detection

```javascript
const isIframe = window.self !== window.top;

if (isIframe) {
  initializeCustomScrollSpy();
} else {
  // Use Bootstrap's default ScrollSpy in standalone mode
}
```

### Standalone Mode

In standalone mode (not in iframe), Bootstrap ScrollSpy is left untouched. The custom implementation only activates when embedded.

---

## Summary

The custom ScrollSpy implementation provides:

✅ **Iframe compatibility** - Works where Bootstrap ScrollSpy fails  
✅ **Browser-native** - Uses IntersectionObserver API  
✅ **Responsive** - Adapts to viewport size  
✅ **Hierarchical** - Supports nested navigation  
✅ **Efficient** - O(1) intersection detection  
✅ **Smooth integration** - Seamless click and scroll handling  

The implementation bypasses Bootstrap's scroll event mechanism with a more reliable intersection-based approach.
