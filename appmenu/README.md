# Appmenu Addon for Bootstrap Addons

A custom, desktop-style application menu bar component built on **Bootstrap 5**, providing a traditional **File/Edit/View/Help** menu experience that is fully dynamic and JavaScript-driven. This component mimics the hover-to-switch behavior common in desktop applications.

## ✨ Features

* **Desktop Look & Feel:** Mimics classic desktop menus with a slim bar, underlined first letters on top-level items (via CSS), and a tight layout.
* **Hover-to-Switch Logic:** Once a menu is opened (either by click or initial hover-click), simply **hovering** over adjacent top-level menu items (e.g., hovering from **File** to **Edit**) will automatically close the current menu and open the new one.
* **Dynamic Configuration:** The entire menu structure is generated from a simple JavaScript object (`menuData`), making it easy to configure, modify, and extend.
* **Bootstrap 5 Integration:** Built using standard Bootstrap 5 classes, utilities, and JavaScript components (Dropdowns, Modals).
* **Action Routing:** All menu items are routed through a single `handleMenuAction(action)` function, simplifying the connection between UI elements and underlying application logic.
* **Simulated Actions:** Includes handlers for common actions like **Cut/Copy/Paste**, **Zoom In/Out**, and **Full Screen** mode.

## 🚀 Getting Started

### 1. Prerequisites

This project relies on the following standard libraries:

* **Bootstrap 5.3+ CSS & JS:** Required for styling, dropdowns, and modals.
* **Bootstrap Icons:** Used for the icon within the About Modal.

### 2. File Structure

This component requires three files:

| File | Description |
| :--- | :--- |
| `index.html` | The main HTML file linking all dependencies and setting up the target containers. |
| `js/script.js` | Contains the `menuData` configuration, core action handlers, and the menu generation/hover logic. |
| `css/style.css` | Custom CSS to achieve the slim, desktop-like appearance and hover effects. |

### 3. Setup HTML Containers

Ensure your `index.html` has the necessary containers for the dynamic components:
```
html
<div id="navbar-container"></div>

<div id="app-status" class="alert alert-info">
    Action Status: Ready
</div>

<div id="modal-container"></div>
```

### 4. Configure Your Menu Data
Modify the menuData array in script.js to define your application's menu structure.

```
// Example menu configuration from script.js
const menuData = [
    {
        label: "File",
        items: [
            { label: "New", action: "logAction" },
            // Separators are marked with 'separator: true'
            { label: "---", separator: true },
            // Menu items can link to a Bootstrap Modal
            { label: "Close", action: "closeApplication" }
        ]
    },
    {
        label: "Help",
        items: [
            // Menu items open a modal using its ID (e.g., 'aboutModal')
            { label: "About", modal: "aboutModal" } 
        ]
    }
    // ... other menus
];
```
##  🛠 Usage and Integration

### 1. Implementing Actions
All functional menu items require an action property, which corresponds to a global JavaScript function name.

`script.js` example:

```
// This function name is referenced in menuData: { label: "New", action: "logAction" }
window.logAction = function(action) {
    logStatus(`Menu Action: ${action} clicked.`);
};

// This function is referenced in menuData: { label: "Close", action: "closeApplication" }
window.closeApplication = function() {
    logStatus('Application Closed (Simulated)');
    // Add your application closing logic here
};
```

### 2. Initializing
The component initializes itself upon page load. Make sure the call to `generateMenuBar()` and `initializeDesktopMenuHover()` is present within your DOMContentLoaded listener.

`script.js` initialization:

```
document.addEventListener('DOMContentLoaded', () => {
    // ... other initializations
    generateMenuBar();
    createAboutModal(); // If you are using the example About modal
    initializeDesktopMenuHover();
});
```

## License

This product is protected under GNU GPL 3.0
