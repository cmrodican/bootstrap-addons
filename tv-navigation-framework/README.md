# TV Navigation Framework

A lightweight keyboard-navigation layer for Bootstrap-based interfaces that are designed for remote controls, TV screens, kiosks, or touchless browsing.

This module focuses on directional movement between focusable elements, making it easier to build accessible experiences for smart TVs and embedded interfaces without a mouse.

## What it includes

- `tv-navigation-framework.js` — core navigation logic
- `tv-navigation-framework.css` — base visual styling and focus states
- `examples/` — demo pages and sample layouts
- `tv-navigation-framework-utils.js` — helper utilities for testing and debugging

## Typical use cases

- smart TV dashboards
- remote-controlled web apps
- kiosks and large-screen interfaces
- accessibility-focused keyboard navigation

## Quick start

1. Include Bootstrap and the framework files in your page.
2. Add focusable elements to your HTML.
3. Initialize the framework with your preferred settings.
4. Use arrow keys or remote-style controls to move focus between items.

Example:

```html
<link rel="stylesheet" href="tv-navigation-framework.css" />
<script src="tv-navigation-framework.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    const nav = new TVNavigationFramework();
    nav.init();
  });
</script>
```

## Examples

The `examples/` folder contains interactive demo pages such as the Netflix-style sample and other navigation test layouts.

## Related files

- `example.html` — simplified test page
- `example2.html` — alternate implementation example
- `examples/index.html` — demonstration hub
- `examples/netflix-demo.html` — TV-style UI example
