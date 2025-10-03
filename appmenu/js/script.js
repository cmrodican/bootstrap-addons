        // ===============================================
        // 1. APPLICATION DATA (The "JSON" configuration)
        // ===============================================
        
        const menuData = [
            {
                label: "File",
                items: [
                    { label: "New", action: "logAction" },
                    { label: "Open", action: "logAction" },
                    { label: "Save", action: "logAction" },
                    { label: "---", separator: true },
                    { label: "Close", action: "closeApplication" }
                ]
            },
            {
                label: "Edit",
                items: [
                    { label: "Cut", action: "performCut" },
                    { label: "Copy", action: "performCopy" },
                    { label: "Paste", action: "performPaste" }
                ]
            },
            {
                label: "View",
                items: [
                    { label: "Zoom In", action: "zoomIn" },
                    { label: "Zoom Out", action: "zoomOut" },
                    { label: "---", separator: true },
                    { label: "Full Screen", action: "toggleFullScreen" }
                ]
            },
            {
                label: "Help",
                items: [
                    { label: "Documentation", action: "logAction", id: "docLink" },
                    // Links to the modal created by createAboutModal()
                    { label: "About", modal: "aboutModal" } 
                ]
            }
        ];

        // Data for the About Modal (from previous exchange)
        const aboutData = {
            "modalTitle": "About Sample Application",
            "appTitle": "Sample Application",
            "appVersion": "2.5.0",
            "aboutContent": "This application provides a sample of dynamic content generation. It was developed to demonstrate menu construction using JavaScript.",
            "aboutLinkText": "Learn more",
            "aboutLinkUrl": "https://example.com",
            "componentsContent": "Includes: Bootstrap, Custom JS Menu, Modal structure.",
            "authorsContent": "Main Developer: Gemini Model"
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
        window.performCut = function() {
            if (!editor) editor = document.getElementById('editor');
             // Try the modern API first, then fallback to the deprecated one
            if (editor && editor.value) {
                editor.select();
                try {
                    document.execCommand('cut');
                    logStatus('Cut successful: Content moved to clipboard.');
                } catch (err) {
                    logStatus('Cut failed. Please use Ctrl/Cmd+X.');
                }
            } else {
                logStatus('Nothing to cut. Select text in the editor.');
            }
        };
        
        /** Attempts to perform the copy command on the active element. */
        window.performCopy = function() {
            if (!editor) editor = document.getElementById('editor');
            if (editor && editor.value) {
                editor.select();
                 try {
                    document.execCommand('copy');
                    logStatus('Copy successful: Content copied to clipboard.');
                } catch (err) {
                    logStatus('Copy failed. Please use Ctrl/Cmd+C.');
                }
            } else {
                logStatus('Nothing to copy. Select text in the editor.');
            }
        };
        
        /** Attempts to perform the paste command on the active element. */
        window.performPaste = function() {
            if (!editor) editor = document.getElementById('editor');
            // Note: document.execCommand('paste') is restricted in modern browsers for security reasons.
            // We can only simulate or prompt the user.
            logStatus('Paste initiated. For security reasons, the browser may require Ctrl/Cmd+V.');
            if (editor) editor.focus();
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

                // Generate the dropdown item HTML
                return `<li><a class="dropdown-item" href="#" ${idAttr} ${dataToggleAttr} ${actionAttr}>${item.label}</a></li>`;
            }).join(''); // Join array elements into a single HTML string
        };

        /** Generates the full Bootstrap navbar using the menuData configuration. */
        function generateMenuBar() {
            const navbarContainer = document.getElementById('navbar-container');
            
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
            // Initialize global elements once the DOM is ready
            editor = document.getElementById('editor');
            zoomLevelSpan = document.getElementById('zoom-level');
            statusLog = document.getElementById('app-status');

            generateMenuBar();
            createAboutModal();
            initializeDesktopMenuHover();
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
    
    let menuSystemActive = false;  // True when any menu is open
    let mouseIsDown = false;        // True during click-and-drag
    
    // Track global mouse state
    document.addEventListener('mousedown', () => { mouseIsDown = true; });
    document.addEventListener('mouseup', () => { mouseIsDown = false; });
    
    dropdownItems.forEach(item => {
        const dropdownToggle = item.querySelector('.dropdown-toggle');
        if (!dropdownToggle) return;
        
        const bsDropdown = new bootstrap.Dropdown(dropdownToggle, {
            autoClose: true
        });
        
        // When this menu opens, activate the menu system
        dropdownToggle.addEventListener('show.bs.dropdown', () => {
            menuSystemActive = true;
        });
        
        // When this menu closes, check if menu system should deactivate
        dropdownToggle.addEventListener('hidden.bs.dropdown', () => {
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
