        // ===============================================
        // 1. APPLICATION DATA (The "JSON" configuration)
        // ===============================================
        
        const menuData = [
            {
                label: "File",
                items: [
                    { label: "New", action: "logAction", shortcut: "Ctrl + N" },
                    { label: "Open", action: "logAction", shortcut: "Ctrl + O" },
                    { label: "Save", action: "logAction", shortcut: "Ctrl + S" },
                    { label: "---", separator: true },
                    { label: "Close", action: "closeApplication", shortcut: "Ctrl + W" }
                ]
            },
            {
                label: "Edit",
                items: [
                    { label: "Cut", action: "performCut", shortcut: "Ctrl + X" },
                    { label: "Copy", action: "performCopy", shortcut: "Ctrl + C" },
                    { label: "Paste", action: "performPaste", shortcut: "Ctrl + V" },
                    { label: "---", separator: true },
                    { label: "Select All", action: "selectAllGlobal", shortcut: "Ctrl + A" }
                ]
            },
            {
                label: "View",
                items: [
                    { label: "Zoom In", action: "zoomIn", shortcut: "Ctrl + +" },
                    { label: "Zoom Out", action: "zoomOut", shortcut: "Ctrl + -" },
                    { label: "---", separator: true },
                    { label: "Full Screen", action: "toggleFullScreen", shortcut: "F11" }
                ]
            },
            {
                label: "Help",
                items: [
                    { label: "Documentation", action: "logAction", id: "docLink", shortcut: "F1" },
                    { label: "About", modal: "aboutModal" } 
                ]
            }
        ];

        // Data for the About Modal (from previous exchange)
        const aboutData = {
            "modalTitle": "About Sample Application",
            "appTitle": "Sample Application",
            "appVersion": "1.0.0",
            "aboutContent": "This sample application provides a demonstration of Appmenu Addon for Javascript by Chaotix..",
            "aboutLinkText": "Learn more",
            "aboutLinkUrl": "#",
            "componentsContent": "Includes: Bootstrap, Custom JS Menu, Modal structure.",
            "authorsContent": "Created by Chaotix.  Contributors: OpenAI's ChatGPT and CLAUDE AI."
        };


        // ===============================================
        // 2. CORE UTILITY FUNCTIONS
        // ===============================================

        let currentZoom = 100;
        // Ensure editor, zoomLevelSpan, and statusLog are only accessed after DOMContentLoaded
        // by checking them inside the functions, though they are declared globally for scope.
        let editor;
        let zoomLevelSpan;
        let statusLog;
        let lastEditableFocus = null; // Track last focused editable element

        // Helper function to check if element is editable
        function isEditable(el) {
            if (!el) return false;
            const tag = el.tagName;
            return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA';
        }

        // Track last focused editable element
        document.addEventListener('focusin', (e) => {
            if (isEditable(e.target)) {
                lastEditableFocus = e.target;
            }
        });

        /**
         * Generic handler to route menu clicks to specific functions.
         * The function name is passed as a string from the menuData.
         */
        window.handleMenuAction = function(action) {
            // This allows the function string to be called as a global function
            if (typeof window[action] === 'function') {
                window[action](action);
            } else {
                logStatus(`Action not implemented: ${action}`);
            }
        };
        
        /** Logs status messages to the UI. */
        function logStatus(message) {
            // We ensure statusLog is available before logging
            if (!statusLog) statusLog = document.getElementById('app-status');
            if (statusLog) {
                const now = new Date().toLocaleTimeString();
                statusLog.innerHTML = `<strong>${now}:</strong> ${message}`;
            }
        }

        /** Toggles the application into or out of full-screen mode. */
        window.toggleFullScreen = function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    logStatus('Entered Full Screen Mode');
                }).catch(err => {
                    logStatus(`Error attempting to enable full-screen: ${err.message} (Check browser restrictions)`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen().then(() => {
                        logStatus('Exited Full Screen Mode');
                    });
                }
            }
        };
        
        /** Simulates closing the application (or perhaps reloading the page). */
        window.closeApplication = function() {
            logStatus('Application Closed (Simulated - No action taken in this environment)');
            // In a real application, this might close a window or navigate away.
        };

        /** Attempts to perform the cut command on the active element. */
        window.performCut = async function() {
            const selected = window.getSelection().toString();
            if (!selected) {
                logStatus('Cut: no text selected');
                return;
            }

            const el = document.activeElement;
            if (isEditable(el)) {
                // execCommand('cut') works well for editable fields
                const ok = document.execCommand('cut');
                if (ok) {
                    logStatus(`Cut successful: "${selected.substring(0, 30)}${selected.length > 30 ? '...' : ''}"`);
                } else {
                    // Fallback: copy to clipboard
                    try {
                        if (navigator.clipboard?.writeText) {
                            await navigator.clipboard.writeText(selected);
                            logStatus(`Cut fallback → Copied: "${selected.substring(0, 30)}${selected.length > 30 ? '...' : ''}"`);
                        } else {
                            logStatus('Cut fallback failed');
                        }
                    } catch {
                        logStatus('Cut failed. Please use Ctrl/Cmd+X.');
                    }
                }
                return;
            }

            // Non-editable selection: cannot cut; copy instead
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(selected);
                    logStatus(`Cut not possible on non-editable → Copied: "${selected.substring(0, 30)}${selected.length > 30 ? '...' : ''}"`);
                } else {
                    const ok = document.execCommand('copy');
                    logStatus(ok ? `Cut not possible → Copied: "${selected.substring(0, 30)}${selected.length > 30 ? '...' : ''}"` : 'Cut failed');
                }
            } catch {
                logStatus('Cut failed. Please use Ctrl/Cmd+X.');
            }
        };

        /** Selects all text in the active element or entire page. */
        window.selectAllGlobal = function() {
            const el = document.activeElement;

            if (isEditable(el)) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.select();
                    logStatus('Select All: input/textarea selected');
                } else if (el.isContentEditable) {
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                    logStatus('Select All: contenteditable selected');
                }
                return;
            }

            // Select entire page content
            const range = document.createRange();
            range.selectNodeContents(document.body);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            logStatus('Select All: entire page selected');
        };

        /** Attempts to perform the copy command on the active element. */
        window.performCopy = async function() {
            const selected = window.getSelection().toString();
            if (!selected) {
                logStatus('Copy: no text selected');
                return;
            }

            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(selected);
                    logStatus(`Copy successful: "${selected.substring(0, 30)}${selected.length > 30 ? '...' : ''}"`);
                } else {
                    const ok = document.execCommand('copy');
                    logStatus(ok ? `Copy successful: "${selected.substring(0, 30)}${selected.length > 30 ? '...' : ''}"` : 'Copy failed');
                }
            } catch {
                logStatus('Copy failed. Please use Ctrl/Cmd+C.');
            }
        };

        /** Attempts to perform the paste command on the active element. */
        window.performPaste = async function() {
            // Prefer current active editable; otherwise fallback to lastEditableFocus
            let el = document.activeElement;
            if (!isEditable(el)) {
                el = lastEditableFocus;
            }

            const isTargetEditable = isEditable(el);
            if (!isTargetEditable) {
                logStatus('Paste not allowed: focus an input/textarea first');
                return;
            }

            try {
                if (navigator.clipboard?.readText) {
                    const text = await navigator.clipboard.readText();

                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        const start = el.selectionStart ?? el.value.length;
                        const end = el.selectionEnd ?? el.value.length;
                        el.setRangeText(text, start, end, 'end');
                    } else if (el.isContentEditable) {
                        document.execCommand('insertText', false, text);
                    }

                    logStatus(`Paste successful: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
                } else {
                    logStatus('Paste failed: Clipboard API unavailable; use Ctrl+V');
                }
            } catch {
                logStatus('Paste failed (permissions or empty clipboard). Use Ctrl+V');
            }
        };

        /** Increases the simulated zoom level. */
        window.zoomIn = function() {
            if (!zoomLevelSpan) zoomLevelSpan = document.getElementById('zoom-level');
            currentZoom += 10;
            if (currentZoom > 200) currentZoom = 200; // Cap zoom
            document.body.style.zoom = currentZoom + '%';
            if (zoomLevelSpan) zoomLevelSpan.textContent = currentZoom + '%';
            logStatus(`Zoom In: ${currentZoom}%`);
        };
        
        /** Decreases the simulated zoom level. */
        window.zoomOut = function() {
            if (!zoomLevelSpan) zoomLevelSpan = document.getElementById('zoom-level');
            currentZoom -= 10;
            if (currentZoom < 50) currentZoom = 50; // Cap zoom
            document.body.style.zoom = currentZoom + '%';
            if (zoomLevelSpan) zoomLevelSpan.textContent = currentZoom + '%';
            logStatus(`Zoom Out: ${currentZoom}%`);
        };

        /** Logs a simple action name. */
        window.logAction = function(action) {
            logStatus(`Menu Action: ${action} clicked.`);
        };


        // ===============================================
        // 3. NAVBAR GENERATION LOGIC
        // ===============================================

        /** Helper function to generate <li> elements for a dropdown menu. */
        const createDropdownItems = (items) => {
            return items.map(item => {
                if (item.separator) {
                    return '<li><hr class="dropdown-divider"></li>';
                }

                // Set the click handler for actions
                const actionAttr = item.action ? `onclick="handleMenuAction('${item.action}')"` : '';

                // Set Bootstrap attributes for modal links
                const dataToggleAttr = item.modal ? `data-bs-toggle="modal" data-bs-target="#${item.modal}"` : '';

                // Set ID for specific targeting (like 'docLink')
                const idAttr = item.id ? `id="${item.id}"` : '';

                // Add shortcut display if present
                const shortcutHTML = item.shortcut 
                    ? `<span class="keyboard-shortcut">${item.shortcut}</span>` 
                    : '';

                // Store the action and shortcut as data attributes for keyboard handler
                const dataAction = item.action ? `data-action="${item.action}"` : '';
                const dataShortcut = item.shortcut ? `data-shortcut="${item.shortcut}"` : '';

                // Generate the dropdown item HTML
                return `<li><a class="dropdown-item" href="#" ${idAttr} ${dataToggleAttr} ${actionAttr} ${dataAction} ${dataShortcut}>${item.label}${shortcutHTML}</a></li>`;
            }).join('');
        };

        /** Generates the full Bootstrap navbar using the menuData configuration. */
        function generateMenuBar() {
            const navbarContainer = document.getElementById('navbar-container');

            if (!navbarContainer) {
                console.error('navbar-container element not found!');
                throw new Error('navbar-container element not found');
            }

            // Generate the list of top-level menu items
            const navItems = menuData.map(menu => {
                const dropdownItemsHTML = createDropdownItems(menu.items);

                // Top-level menu structure
                return `
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle text-dark" href="#" data-bs-toggle="dropdown" aria-expanded="false">${menu.label}</a>
                        <ul class="dropdown-menu rounded-0 m-0" style="margin-top: -5px !important">
                            ${dropdownItemsHTML}
                        </ul>
                    </li>
                `;
            }).join('');


            // Wrap all menu items in the main navbar structure
            const menuBarHTML = `
                <nav class="navbar navbar-expand navbar-dark bg-white text-dark app-navbar menubar" aria-label="Top navigation bar">
                    <div class="container-fluid shadow">
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample02" aria-controls="navbarsExample02" aria-expanded="false" aria-label="Toggle navigation"> <span class="navbar-toggler-icon"></span> </button>
                        <div class="collapse navbar-collapse" id="navbarsExample02">
                            <ul class="navbar-nav me-auto">
                                ${navItems}
                            </ul>
                        </div>
                    </div>
                </nav>
            `;

            navbarContainer.innerHTML = menuBarHTML;
        }


        // ===============================================
        // 4. ABOUT MODAL GENERATION (from previous exchange)
        // ===============================================

        function createAboutModal() {
            const data = aboutData;
            const container = document.getElementById('modal-container');

            if (!container) {
                console.error('modal-container element not found!');
                throw new Error('modal-container element not found');
            }

            const modalHTML = `
                <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <!-- Modal Header -->
                            <div class="modal-header bg-primary text-white">
                                <h1 class="fs-5" id="aboutModalLabel">${data.modalTitle}</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="border: 2px black solid"></button>
                            </div>
                            
                            <!-- Modal Body -->
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-3">
                                        <i class="bi bi-window fs-1 text-primary"></i>
                                    </div>
                                    <div class="col-9">
                                        <h3>${data.appTitle}</h3>
                                        <h4 class="fs-6">Version ${data.appVersion}</h4>
                                        
                                        <!-- Tabs Navigation -->
                                        <ul class="nav nav-tabs" id="myTab" role="tablist">
                                            <li class="nav-item" role="presentation">
                                                <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">About</button>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Components</button>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane" type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false">Authors</button>
                                            </li>
                                        </ul>
                                        
                                        <!-- Tabs Content -->
                                        <div class="tab-content" id="myTabContent">
                                            <!-- About Tab -->
                                            <div class="tab-pane fade show active py-3" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
                                                <p>${data.aboutContent}</p>
                                                <a href="${data.aboutLinkUrl}">${data.aboutLinkText}</a>
                                            </div>
                                            <!-- Components Tab -->
                                            <div class="tab-pane fade py-3" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
                                                ${data.componentsContent}
                                            </div>
                                            <!-- Authors Tab -->
                                            <div class="tab-pane fade py-3" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">
                                                ${data.authorsContent}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Modal Footer -->
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = modalHTML;
        }


        // ===============================================
        // 5. INITIALIZATION
        // ===============================================

        // Initialize all dynamic content once the page is ready
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM Content Loaded - Starting initialization...');

            try {
                // Check if Bootstrap is loaded
                if (typeof bootstrap === 'undefined') {
                    throw new Error('Bootstrap library not loaded! Make sure Bootstrap JS is included before this script.');
                }
                console.log('✓ Bootstrap library detected');

                // Initialize global elements once the DOM is ready
                editor = document.getElementById('editor');
                zoomLevelSpan = document.getElementById('zoom-level');
                statusLog = document.getElementById('app-status');
                console.log('✓ Global elements initialized');

                generateMenuBar();
                console.log('✓ Menu bar generated');

                createAboutModal();
                console.log('✓ About modal created');

                initializeDesktopMenuHover();
                console.log('✓ Desktop menu hover initialized');

                initializeKeyboardNavigation();
                console.log('✓ Keyboard navigation initialized');

                initializeKeyboardShortcuts();
                console.log('✓ Keyboard shortcuts initialized');

                console.log('✅ All initialization complete!');
            } catch (error) {
                console.error('❌ Initialization error:', error);
                if (statusLog) {
                    statusLog.innerHTML = `<strong>Error:</strong> ${error.message}`;
                    statusLog.classList.remove('alert-info');
                    statusLog.classList.add('alert-danger');
                }
            }
        });

// ===============================================
// 6. DESKTOP MENU HOVER BEHAVIOR
// ===============================================

/**
 * Initializes desktop-style menu interaction with hover switching
 * and click-drag-release behavior.
 */
function initializeDesktopMenuHover() {
    const navbar = document.querySelector('#navbar-container');
    const dropdownItems = document.querySelectorAll('#navbar-container .nav-item.dropdown');

    if (!navbar) {
        console.error('Navbar not found for hover initialization');
        return;
    }

    if (dropdownItems.length === 0) {
        console.warn('No dropdown items found for hover initialization');
        return;
    }

    console.log(`Found ${dropdownItems.length} dropdown items to initialize`);

    let menuSystemActive = false;  // True when any menu is open
    let mouseIsDown = false;        // True during click-and-drag
    
    // Track global mouse state
    document.addEventListener('mousedown', () => { mouseIsDown = true; });
    document.addEventListener('mouseup', () => { mouseIsDown = false; });
    
    dropdownItems.forEach((item, index) => {
        const dropdownToggle = item.querySelector('.dropdown-toggle');
        if (!dropdownToggle) {
            console.warn(`Dropdown toggle not found for item ${index}`);
            return;
        }

        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap is not loaded! Cannot initialize dropdowns.');
            return;
        }

        const bsDropdown = new bootstrap.Dropdown(dropdownToggle, {
            autoClose: true
        });

        // Prevent menu from stealing focus when clicked (keeps focus in editable field)
        dropdownToggle.addEventListener('mousedown', (e) => {
            e.preventDefault(); // This preserves the current focus and selection
        });

        // When this menu opens, activate the menu system and highlight
        dropdownToggle.addEventListener('show.bs.dropdown', () => {
            menuSystemActive = true;
            dropdownToggle.classList.add('menu-open');
        });

        // When this menu closes, remove highlight and check if menu system should deactivate
        dropdownToggle.addEventListener('hidden.bs.dropdown', () => {
            dropdownToggle.classList.remove('menu-open');
            // Short delay to allow other menus to open
            setTimeout(() => {
                const anyOpen = navbar.querySelector('.dropdown-menu.show');
                menuSystemActive = !!anyOpen;
            }, 50);
        });
        
        // On mouseenter: if system is active OR mouse is down, switch to this menu
        item.addEventListener('mouseenter', () => {
            if (menuSystemActive || mouseIsDown) {
                // Close all menus
                dropdownItems.forEach(otherItem => {
                    const otherToggle = otherItem.querySelector('.dropdown-toggle');
                    const otherDropdown = bootstrap.Dropdown.getInstance(otherToggle);
                    if (otherDropdown && otherItem !== item) {
                        otherDropdown.hide();
                    }
                });
                
                // Open this menu
                bsDropdown.show();
            }
        });
    });
    
    // Click anywhere outside navbar to close all menus
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            menuSystemActive = false;
        }
    });
}
// ===============================================
// 7. KEYBOARD NAVIGATION
// ===============================================

/**
 * Initializes keyboard navigation for the menu system.
 * Supports: Arrow keys, Enter, Escape, Tab, and Alt key activation
 */
function initializeKeyboardNavigation() {
    const navbar = document.querySelector('#navbar-container');
    const topLevelItems = Array.from(document.querySelectorAll('#navbar-container .nav-item.dropdown'));
    
    let currentTopLevelIndex = -1;  // Which top-level menu is focused
    let currentDropdownIndex = -1;  // Which item within dropdown is focused
    let menuBarActive = false;      // Whether keyboard focus is in menu bar
    
    // Get all clickable items in a dropdown menu
    function getDropdownItems(topLevelItem) {
        const items = Array.from(topLevelItem.querySelectorAll('.dropdown-item'));
        return items.filter(item => !item.closest('.dropdown-divider'));
    }
    
    // Focus a top-level menu item
    function focusTopLevel(index) {
        // Remove focus from all
        topLevelItems.forEach(item => {
            item.querySelector('.dropdown-toggle').classList.remove('focused');
        });
        
        if (index >= 0 && index < topLevelItems.length) {
            currentTopLevelIndex = index;
            const toggle = topLevelItems[index].querySelector('.dropdown-toggle');
            toggle.classList.add('focused');
            toggle.focus();
        }
    }
    
    // Focus an item within the currently open dropdown
    function focusDropdownItem(index) {
        if (currentTopLevelIndex < 0) return;
        
        const items = getDropdownItems(topLevelItems[currentTopLevelIndex]);
        
        // Remove existing focus
        items.forEach(item => item.classList.remove('active'));
        
        if (index >= 0 && index < items.length) {
            currentDropdownIndex = index;
            items[index].classList.add('active');
            items[index].focus();
        }
    }
    
    // Open the currently focused top-level menu
    function openCurrentMenu() {
        if (currentTopLevelIndex < 0) return;
        
        const item = topLevelItems[currentTopLevelIndex];
        const toggle = item.querySelector('.dropdown-toggle');
        const dropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
        
        // Close all other menus first
        topLevelItems.forEach((otherItem, idx) => {
            if (idx !== currentTopLevelIndex) {
                const otherToggle = otherItem.querySelector('.dropdown-toggle');
                const otherDropdown = bootstrap.Dropdown.getInstance(otherToggle);
                if (otherDropdown) otherDropdown.hide();
            }
        });
        
        dropdown.show();
        
        // Focus first item after menu opens
        setTimeout(() => {
            currentDropdownIndex = 0;
            focusDropdownItem(0);
        }, 50);
    }
    
    // Close all menus and deactivate menu bar
    function closeAllMenus() {
        topLevelItems.forEach(item => {
            const toggle = item.querySelector('.dropdown-toggle');
            const dropdown = bootstrap.Dropdown.getInstance(toggle);
            if (dropdown) dropdown.hide();
            toggle.classList.remove('focused');
        });
        
        menuBarActive = false;
        currentTopLevelIndex = -1;
        currentDropdownIndex = -1;
    }
    
    // Global keyboard handler
    document.addEventListener('keydown', (e) => {

        // Alt key activates menu bar
        if (e.key === 'Alt' && !menuBarActive) {
            e.preventDefault();
            menuBarActive = true;
            focusTopLevel(0);
            return;
        }
        
        // Only handle these keys when menu bar is active
        if (!menuBarActive) return;
        
        const isDropdownOpen = topLevelItems.some(item => 
            item.querySelector('.dropdown-menu')?.classList.contains('show')
        );
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                closeAllMenus();
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                if (isDropdownOpen) {
                    // Move to previous top-level menu
                    let newIndex = currentTopLevelIndex - 1;
                    if (newIndex < 0) newIndex = topLevelItems.length - 1;
                    currentTopLevelIndex = newIndex;
                    currentDropdownIndex = -1;
                    openCurrentMenu();
                } else {
                    // Just navigate top-level
                    let newIndex = currentTopLevelIndex - 1;
                    if (newIndex < 0) newIndex = topLevelItems.length - 1;
                    focusTopLevel(newIndex);
                }
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                if (isDropdownOpen) {
                    // Move to next top-level menu
                    let newIndex = currentTopLevelIndex + 1;
                    if (newIndex >= topLevelItems.length) newIndex = 0;
                    currentTopLevelIndex = newIndex;
                    currentDropdownIndex = -1;
                    openCurrentMenu();
                } else {
                    // Just navigate top-level
                    let newIndex = currentTopLevelIndex + 1;
                    if (newIndex >= topLevelItems.length) newIndex = 0;
                    focusTopLevel(newIndex);
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (!isDropdownOpen) {
                    // Open the menu
                    openCurrentMenu();
                } else {
                    // Navigate down within dropdown
                    const items = getDropdownItems(topLevelItems[currentTopLevelIndex]);
                    let newIndex = currentDropdownIndex + 1;
                    if (newIndex >= items.length) newIndex = 0;
                    focusDropdownItem(newIndex);
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (isDropdownOpen) {
                    // Navigate up within dropdown
                    const items = getDropdownItems(topLevelItems[currentTopLevelIndex]);
                    let newIndex = currentDropdownIndex - 1;
                    if (newIndex < 0) newIndex = items.length - 1;
                    focusDropdownItem(newIndex);
                }
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (!isDropdownOpen) {
                    // Open the current menu
                    openCurrentMenu();
                } else if (currentDropdownIndex >= 0) {
                    // Activate the current item
                    const items = getDropdownItems(topLevelItems[currentTopLevelIndex]);
                    items[currentDropdownIndex].click();
                    closeAllMenus();
                }
                break;
        }
    });
    
    // Deactivate menu bar when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            menuBarActive = false;
            currentTopLevelIndex = -1;
            currentDropdownIndex = -1;
        }
    });
}

// ===============================================
// 8. KEYBOARD SHORTCUTS
// ===============================================

/**
 * Initializes global keyboard shortcuts for menu actions.
 * Detects Ctrl+Key, Alt+Key, and Function key combinations.
 */
function initializeKeyboardShortcuts() {
    // Build a map of shortcuts to actions
    const shortcutMap = new Map();
    
    // Parse all menu items and build the shortcut map
    const allMenuItems = document.querySelectorAll('.dropdown-item[data-shortcut]');
    allMenuItems.forEach(item => {
        const shortcut = item.getAttribute('data-shortcut');
        const action = item.getAttribute('data-action');
        const modal = item.getAttribute('data-bs-target');
        
        if (shortcut) {
            shortcutMap.set(shortcut.toLowerCase(), { action, modal, element: item });
        }
    });
    
    // Normalize shortcut string from keyboard event
    function getShortcutString(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        // Handle special keys
        let key = e.key.toLowerCase();
        
        // Normalize some keys
        if (key === '=' || key === '+') key = '=';
        if (key === '-' || key === '_') key = '-';
        
        // For function keys, use the key as-is
        if (e.key.startsWith('F') && e.key.length <= 3) {
            key = e.key.toLowerCase();
        }
        
        if (key && key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
            parts.push(key);
        }
        
        return parts.join('+');
    }
    
    // Global keydown handler
    document.addEventListener('keydown', (e) => {
        const shortcutString = getShortcutString(e);
        
        if (shortcutMap.has(shortcutString)) {
            const shortcutData = shortcutMap.get(shortcutString);
            
            // Prevent default browser behavior
            e.preventDefault();
            
            // Execute the action
            if (shortcutData.action) {
                handleMenuAction(shortcutData.action);
            } else if (shortcutData.modal) {
                // Trigger modal
                const modalElement = document.querySelector(shortcutData.modal);
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            }
            
            // Visual feedback - briefly highlight the menu item
            if (shortcutData.element) {
                shortcutData.element.classList.add('active');
                setTimeout(() => {
                    shortcutData.element.classList.remove('active');
                }, 200);
            }
        }
    });
}
