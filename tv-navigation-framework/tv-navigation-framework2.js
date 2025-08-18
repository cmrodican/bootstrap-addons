
        // Simple TV Navigation Implementation for Testing
        class SimpleTVNavigation {
            constructor() {
                this.currentFocus = null;
                this.focusableElements = [];
                this.initialized = false;
                this.toasts = [];
                
                this.init();
            }
            
            init() {
                console.log('Initializing Simple TV Navigation...');
                
                this.updateFocusableElements();
                this.setupEventListeners();
                this.setInitialFocus();
                
                this.initialized = true;
                this.updateStatus('Ready', 'success');
                this.updateDebugInfo();
                
                console.log('Simple TV Navigation initialized with', this.focusableElements.length, 'elements');
            }
            
            setupEventListeners() {
                document.addEventListener('keydown', this.handleKeyDown.bind(this));
                window.addEventListener('resize', () => this.updateFocusableElements());
            }
            
            updateFocusableElements() {
                this.focusableElements = Array.from(document.querySelectorAll('.tv-nav-focusable'))
                    .filter(el => this.isVisible(el));
                this.updateDebugInfo();
            }
            
            isVisible(element) {
                const rect = element.getBoundingClientRect();
                const style = window.getComputedStyle(element);
                return rect.width > 0 && 
                       rect.height > 0 && 
                       style.visibility !== 'hidden' && 
                       style.display !== 'none' &&
                       style.opacity !== '0';
            }
            
            handleKeyDown(event) {
                // Don't interfere with form inputs
                if (event.target.tagName === 'INPUT' || 
                    event.target.tagName === 'TEXTAREA' || 
                    event.target.tagName === 'SELECT') {
                    return;
                }
                
                let handled = false;
                
                switch(event.key) {
                    case 'ArrowUp':
                        event.preventDefault();
                        this.navigate('up');
                        handled = true;
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        this.navigate('down');
                        handled = true;
                        break;
                    case 'ArrowLeft':
                        event.preventDefault();
                        this.navigate('left');
                        handled = true;
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        this.navigate('right');
                        handled = true;
                        break;
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        this.activateElement();
                        handled = true;
                        break;
                    case 'Escape':
                        event.preventDefault();
                        this.goBack();
                        handled = true;
                        break;
                    case 'Home':
                        event.preventDefault();
                        this.goHome();
                        handled = true;
                        break;
                }
                
                if (handled) {
                    event.stopPropagation();
                }
            }
            
            navigate(direction) {
                if (!this.currentFocus) {
                    this.setInitialFocus();
                    return;
                }
                
                const currentRect = this.currentFocus.getBoundingClientRect();
                let bestElement = null;
                let bestScore = Infinity;
                
                this.focusableElements.forEach(element => {
                    if (element === this.currentFocus || !this.isVisible(element)) return;
                    
                    const rect = element.getBoundingClientRect();
                    const score = this.calculateNavigationScore(currentRect, rect, direction);
                    
                    if (score < bestScore) {
                        bestScore = score;
                        bestElement = element;
                    }
                });
                
                if (bestElement) {
                    this.setFocus(bestElement);
                } else {
                    this.shakeElement(this.currentFocus);
                }
            }
            
            calculateNavigationScore(currentRect, targetRect, direction) {
                const currentCenter = {
                    x: currentRect.left + currentRect.width / 2,
                    y: currentRect.top + currentRect.height / 2
                };
                
                const targetCenter = {
                    x: targetRect.left + targetRect.width / 2,
                    y: targetRect.top + targetRect.height / 2
                };
                
                let isValidDirection = false;
                let distance = 0;
                let angle = 0;
                
                switch (direction) {
                    case 'up':
                        isValidDirection = targetCenter.y < currentCenter.y - 10;
                        distance = currentCenter.y - targetCenter.y;
                        angle = Math.abs(Math.atan2(targetCenter.x - currentCenter.x, currentCenter.y - targetCenter.y));
                        break;
                    case 'down':
                        isValidDirection = targetCenter.y > currentCenter.y + 10;
                        distance = targetCenter.y - currentCenter.y;
                        angle = Math.abs(Math.atan2(targetCenter.x - currentCenter.x, targetCenter.y - currentCenter.y));
                        break;
                    case 'left':
                        isValidDirection = targetCenter.x < currentCenter.x - 10;
                        distance = currentCenter.x - targetCenter.x;
                        angle = Math.abs(Math.atan2(targetCenter.y - currentCenter.y, currentCenter.x - targetCenter.x));
                        break;
                    case 'right':
                        isValidDirection = targetCenter.x > currentCenter.x + 10;
                        distance = targetCenter.x - currentCenter.x;
                        angle = Math.abs(Math.atan2(targetCenter.y - currentCenter.y, targetCenter.x - currentCenter.x));
                        break;
                }
                
                if (!isValidDirection) return Infinity;
                
                return distance + (angle * 100);
            }
            
            setFocus(element) {
                if (!element || !this.isVisible(element)) return false;
                
                // Remove focus from current element
                if (this.currentFocus) {
                    this.currentFocus.classList.remove('tv-nav-focused');
                    this.currentFocus.blur();
                }
                
                // Set new focus
                this.currentFocus = element;
                element.classList.add('tv-nav-focused');
                element.focus();
                
                // Scroll into view
                element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
                
                this.updateDebugInfo();
                return true;
            }
            
            setInitialFocus() {
                this.updateFocusableElements();
                if (this.focusableElements.length > 0) {
                    this.setFocus(this.focusableElements[0]);
                    return true;
                }
                return false;
            }
            
            activateElement() {
                if (!this.currentFocus) return;
                
                const element = this.currentFocus;
                const tagName = element.tagName.toLowerCase();
                
                switch (tagName) {
                    case 'a':
                    case 'button':
                        element.click();
                        break;
                    case 'input':
                        if (['checkbox', 'radio'].includes(element.type)) {
                            element.click();
                        } else {
                            element.focus();
                        }
                        break;
                    case 'select':
                        element.focus();
                        break;
                    default:
                        if (element.onclick || element.getAttribute('onclick')) {
                            element.click();
                        }
                }
            }
            
            goBack() {
                // Simple implementation - just unfocus current element
                if (this.currentFocus) {
                    this.currentFocus.classList.remove('tv-nav-focused');
                    this.currentFocus.blur();
                    this.currentFocus = null;
                    this.updateDebugInfo();
                }
            }
            
            goHome() {
                this.setInitialFocus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            shakeElement(element) {
                if (!element) return;
                element.classList.add('tv-nav-shake');
                setTimeout(() => {
                    element.classList.remove('tv-nav-shake');
                }, 500);
            }
            
            showToast(message, type = 'info', duration = 3000) {
                const toast = document.createElement('div');
                toast.className = `tv-nav-toast active ${type}`;
                toast.textContent = message;
                
                // Color based on type
                const colors = {
                    success: 'rgba(40, 167, 69, 0.9)',
                    error: 'rgba(220, 53, 69, 0.9)',
                    warning: 'rgba(255, 193, 7, 0.9)',
                    info: 'rgba(23, 162, 184, 0.9)'
                };
                
                toast.style.background = colors[type] || colors.info;
                if (type === 'warning') toast.style.color = '#000';
                
                document.body.appendChild(toast);
                this.toasts.push(toast);
                
                setTimeout(() => {
                    toast.classList.remove('active');
                    setTimeout(() => {
                        if (toast.parentNode) {
                            document.body.removeChild(toast);
                        }
                        const index = this.toasts.indexOf(toast);
                        if (index > -1) {
                            this.toasts.splice(index, 1);
                        }
                    }, 200);
                }, duration);
            }
            
            updateStatus(message, type = 'info') {
                const status = document.getElementById('status');
                if (status) {
                    status.textContent = message;
                    status.className = `tv-nav-status ${type}`;
                }
            }
            
            updateDebugInfo() {
                const currentFocusEl = document.getElementById('currentFocus');
                const elementCountEl = document.getElementById('elementCount');
                const navStatusEl = document.getElementById('navStatus');
                
                if (currentFocusEl) {
                    currentFocusEl.textContent = this.currentFocus ? 
                        this.currentFocus.tagName + (this.currentFocus.textContent ? ': ' + this.currentFocus.textContent.substring(0, 20) : '') : 
                        'None';
                }
                
                if (elementCountEl) {
                    elementCountEl.textContent = this.focusableElements.length;
                }
                
                if (navStatusEl) {
                    navStatusEl.textContent = this.initialized ? 'Active' : 'Initializing';
                }
            }
        }
        
        // Initialize navigation when DOM is loaded
        let tvNav;
        
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing navigation...');
            tvNav = new SimpleTVNavigation();
            
            // Show welcome message
            setTimeout(() => {
                tvNav.showToast('TV Navigation Test Ready! Use arrow keys to navigate.', 'success', 4000);
            }, 500);
        });
        
        // Test functions
        function testToast(type) {
            const messages = {
                success: 'This is a success message!',
                warning: 'This is a warning message!',
                error: 'This is an error message!',
                info: 'This is an info message!'
            };
            
            tvNav.showToast(messages[type] || messages.info, type);
        }
        
        function showMessage(message) {
            tvNav.showToast(message, 'info');
            console.log('Action:', message);
        }
        
        function focusFirst() {
            tvNav.setInitialFocus();
            tvNav.showToast('Focused first element', 'info');
        }
        
        function showDebugInfo() {
            const info = {
                'Current Focus': tvNav.currentFocus ? tvNav.currentFocus.tagName : 'None',
                'Focusable Elements': tvNav.focusableElements.length,
                'Initialized': tvNav.initialized,
                'Active Toasts': tvNav.toasts.length
            };
            
            console.table(info);
            tvNav.showToast('Debug info logged to console', 'info');
        }
        
        function resetNavigation() {
            tvNav.updateFocusableElements();
            tvNav.setInitialFocus();
            tvNav.showToast('Navigation reset', 'success');
        }
        
        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-bs-theme', newTheme);
            tvNav.showToast(`Theme: ${newTheme}`, 'info');
        }
        
        // Additional keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Don't interfere with form inputs or navigation
            if (e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'SELECT' ||
                ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Escape'].includes(e.key)) {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case 'h':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        showMessage('Help: Use arrow keys to navigate, Enter to select, Escape to go back');
                    }
                    break;
                case 'd':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        showDebugInfo();
                    }
                    break;
                case 'r':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        resetNavigation();
                    }
                    break;
                case 't':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        toggleTheme();
                    }
                    break;
                case 'f':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        focusFirst();
                    }
                    break;
            }
        });
        
        // Test gamepad connection (if available)
        window.addEventListener('gamepadconnected', function(e) {
            console.log('Gamepad connected:', e.gamepad.id);
            tvNav.showToast(`Gamepad connected: ${e.gamepad.id}`, 'success');
        });
        
        window.addEventListener('gamepaddisconnected', function(e) {
            console.log('Gamepad disconnected');
            tvNav.showToast('Gamepad disconnected', 'warning');
        });
        
        // Performance monitoring
        let navigationCount = 0;
        let startTime = performance.now();
        
        document.addEventListener('keydown', function(e) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                navigationCount++;
            }
        });
        
        // Log performance stats after 30 seconds
        setTimeout(() => {
            const elapsed = (performance.now() - startTime) / 1000;
            console.log(`Navigation performance: ${navigationCount} navigations in ${elapsed.toFixed(1)} seconds`);
        }, 30000);
        
        // Export for testing
        window.testNav = {
            tvNav: () => tvNav,
            focusFirst,
            showDebugInfo,
            resetNavigation,
            toggleTheme,
            testToast,
            showMessage
        };
        
        // Add visual indicators for better testing
        function addVisualIndicators() {
            const style = document.createElement('style');
            style.textContent = `
                .tv-nav-focusable {
                    position: relative;
                }
                
                .tv-nav-focusable::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    border: 2px solid transparent;
                    border-radius: inherit;
                    pointer-events: none;
                    z-index: -1;
                }
                
                .tv-nav-focusable:hover::before {
                    border-color: rgba(0, 123, 255, 0.3);
                }
                
                .tv-nav-focused::before {
                    border-color: var(--tv-nav-focus-color) !important;
                    box-shadow: var(--tv-nav-focus-glow) !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Initialize visual indicators
        document.addEventListener('DOMContentLoaded', function() {
            addVisualIndicators();
        });
    