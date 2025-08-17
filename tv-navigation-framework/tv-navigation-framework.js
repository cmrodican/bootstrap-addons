/*!
 * TV Navigation Framework CSS v1.0.0
 * https://github.com/cmrodican/bootstrap-addons/tv-navigation-framework
 * Licensed under GNU GPL 2.0 License
 * Compatible with Bootstrap 5.3+ and Bootswatch themes
 * Supports game controllers and TV remotes
 */

class TVNavigationFramework {
    constructor(options = {}) {
        this.options = {
            enableAudio: true
            , enableVisualFeedback: true
            , enableKeyboard: true
            , enableGamepad: true
            , enableBreadcrumbs: true
            , enableHelp: true
            , focusableSelector: '.tv-nav-focusable, button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            , skipSelector: '.tv-nav-skip'
            , audioVolume: 0.3
            , navigationSound: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ'
            , selectSound: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ'
            , errorSound: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcBieJ'
            , ...options
        };
        this.currentFocus = null;
        this.focusableElements = [];
        this.navigationHistory = [];
        this.audioContext = null;
        this.sounds = {};
        this.keyboardVisible = false;
        this.keyboardInput = null;
        this.gamepadIndex = null;
        this.gamepadButtons = {};
        this.isShiftPressed = false;
        this.isCapsLockOn = false;
        this.init();
    }
    async init() {
        this.createUI();
        this.setupEventListeners();
        if (this.options.enableAudio) {
            await this.initAudio();
        }
        if (this.options.enableGamepad) {
            this.initGamepad();
        }
        this.updateFocusableElements();
        this.setInitialFocus();
        this.showStatus('TV Navigation Ready');
    }
    createUI() {
        document.body.classList.add('tv-nav-enabled');
        // Create breadcrumb
        if (this.options.enableBreadcrumbs) {
            const breadcrumb = document.createElement('div');
            breadcrumb.className = 'tv-nav-breadcrumb';
            breadcrumb.id = 'tv-nav-breadcrumb';
            breadcrumb.textContent = 'Home';
            document.body.appendChild(breadcrumb);
        }
        // Create status indicator
        const status = document.createElement('div');
        status.className = 'tv-nav-status';
        status.id = 'tv-nav-status';
        status.textContent = 'Initializing...';
        document.body.appendChild(status);
        // Create loading overlay
        const loading = document.createElement('div');
        loading.className = 'tv-nav-loading';
        loading.id = 'tv-nav-loading';
        loading.innerHTML = '<div class="tv-nav-spinner"></div>';
        document.body.appendChild(loading);
        // Create on-screen keyboard
        if (this.options.enableKeyboard) {
            this.createKeyboard();
        }
        // Create help overlay
        if (this.options.enableHelp) {
            this.createHelp();
        }
    }
    createKeyboard() {
        const keyboard = document.createElement('div');
        keyboard.className = 'tv-nav-keyboard';
        keyboard.id = 'tv-nav-keyboard';
        const qwertyLayout = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
      , ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
      , ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
      , ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
      , ['caps', 'space', 'enter', 'close']
    ];
        keyboard.innerHTML = `
      <div class="tv-nav-keyboard-header">
        <h3>On-Screen Keyboard</h3>
        <button class="btn btn-danger btn-sm" onclick="tvNav.hideKeyboard()">Close</button>
      </div>
      <input type="text" class="tv-nav-keyboard-input" id="tv-nav-keyboard-input" placeholder="Type here...">
      <div class="tv-nav-keyboard-layout">
        ${qwertyLayout.map(row => ` < div class = "tv-nav-keyboard-row" > $ {
            row.map(key => {
                let className = 'tv-nav-key tv-nav-focusable';
                let content = key;
                let span = '';
                if (key === 'space') {
                    className += ' space';
                    content = 'Space';
                    span = ' style="grid-column: span 4;"';
                }
                else if (key === 'backspace') {
                    className += ' backspace special';
                    content = '⌫ Backspace';
                    span = ' style="grid-column: span 2;"';
                }
                else if (key === 'enter') {
                    className += ' enter special';
                    content = '⏎ Enter';
                    span = ' style="grid-column: span 2;"';
                }
                else if (key === 'shift') {
                    className += ' shift special';
                    content = '⇧ Shift';
                }
                else if (key === 'caps') {
                    className += ' caps special';
                    content = '⇪ Caps';
                }
                else if (key === 'close') {
                    className += ' close special';
                    content = '✕ Close';
                    span = ' style="grid-column: span 2;"';
                }
                return `<button class="${className}" data-key="${key}"${span}>${content}</button>`;
            }).join('')
        } < /div>
        `).join('')}
      </div>
    `;
        document.body.appendChild(keyboard);
        // Add event listeners to keyboard keys
        keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('tv-nav-key')) {
                this.handleKeyboardKey(e.target.dataset.key);
            }
        });
    }
    createHelp() {
        const help = document.createElement('div');
        help.className = 'tv-nav-help';
        help.id = 'tv-nav-help';
        help.innerHTML = `
      <div class="tv-nav-help-content">
        <div class="tv-nav-help-title">TV Navigation Controls</div>
        
        <div class="tv-nav-help-section">
          <h4>Basic Navigation</h4>
          <p><span class="tv-nav-help-key">Arrow Keys</span> Navigate between elements</p>
          <p><span class="tv-nav-help-key">Enter</span> or <span class="tv-nav-help-key">A Button</span> Select/Activate</p>
          <p><span class="tv-nav-help-key">Escape</span> or <span class="tv-nav-help-key">B Button</span> Go Back</p>
        </div>

        <div class="tv-nav-help-section">
          <h4>Controller Mapping</h4>
          <p><span class="tv-nav-help-key">A Button</span> <span class="tv-nav-help-key">Enter</span> Confirm/Select</p>
          <p><span class="tv-nav-help-key">B Button</span> <span class="tv-nav-help-key">Escape</span> Back/Cancel</p>
          <p><span class="tv-nav-help-key">X/Y Button</span> <span class="tv-nav-help-key">Home</span> Home/Main Menu</p>
          <p><span class="tv-nav-help-key">Menu Button</span> <span class="tv-nav-help-key">F10</span> Show Keyboard</p>
          <p><span class="tv-nav-help-key">L1/R1</span> <span class="tv-nav-help-key">Page Up/Down</span> Navigate Sections</p>
        </div>

        <div class="tv-nav-help-section">
          <h4>Special Features</h4>
          <p><span class="tv-nav-help-key">F1</span> Show this help</p>
          <p><span class="tv-nav-help-key">F10</span> Show on-screen keyboard</p>
          <p><span class="tv-nav-help-key">Alt + M</span> Toggle audio feedback</p>
        </div>

        <button class="btn btn-primary mt-3 tv-nav-focusable" onclick="tvNav.hideHelp()">Close Help</button>
      </div>
    `;
        document.body.appendChild(help);
    }
    async initAudio() {
        try {
            this.audioContext = new(window.AudioContext || window.webkitAudioContext)();
            // Create audio buffers for different sounds
            await this.createAudioBuffer('navigation', 200, 0.1);
            await this.createAudioBuffer('select', 400, 0.2);
            await this.createAudioBuffer('error', 150, 0.3);
            await this.createAudioBuffer('success', 600, 0.2);
        }
        catch (error) {
            console.warn('Audio initialization failed:', error);
            this.options.enableAudio = false;
        }
    }
    async createAudioBuffer(name, frequency, duration) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1;
            // Apply fade out
            if (i > length * 0.7) {
                data[i] *= (length - i) / (length * 0.3);
            }
        }
        this.sounds[name] = buffer;
    }
    playSound(soundName) {
        if (!this.options.enableAudio || !this.audioContext || !this.sounds[soundName]) return;
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        source.buffer = this.sounds[soundName];
        gainNode.gain.value = this.options.audioVolume;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }
    initGamepad() {
        this.gamepadButtons = {
            0: 'select', // A button
            1: 'back', // B button
            2: 'home', // X button
            3: 'home', // Y button
            4: 'pageup', // L1
            5: 'pagedown', // R1
            9: 'menu' // Menu/Options button
        };
        window.addEventListener('gamepadconnected', (e) => {
            this.gamepadIndex = e.gamepad.index;
            this.showStatus('Controller Connected');
            console.log('Gamepad connected:', e.gamepad.id);
        });
        window.addEventListener('gamepaddisconnected', (e) => {
            this.gamepadIndex = null;
            this.showStatus('Controller Disconnected');
            console.log('Gamepad disconnected');
        });
        // Start gamepad polling
        this.pollGamepad();
    }
    pollGamepad() {
        if (this.gamepadIndex !== null) {
            const gamepad = navigator.getGamepads()[this.gamepadIndex];
            if (gamepad) {
                // Check buttons
                for (let i = 0; i < gamepad.buttons.length; i++) {
                    const button = gamepad.buttons[i];
                    const wasPressed = this.gamepadButtons[`pressed_${i}`] || false;
                    const isPressed = button.pressed;
                    if (isPressed && !wasPressed) {
                        this.handleGamepadButton(i);
                    }
                    this.gamepadButtons[`pressed_${i}`] = isPressed;
                }
                // Check D-pad/analog sticks for navigation
                const leftStickX = gamepad.axes[0];
                const leftStickY = gamepad.axes[1];
                const dpadX = gamepad.axes[6] || 0;
                const dpadY = gamepad.axes[7] || 0;
                const threshold = 0.5;
                const wasLeft = this.gamepadButtons.wasLeft || false;
                const wasRight = this.gamepadButtons.wasRight || false;
                const wasUp = this.gamepadButtons.wasUp || false;
                const wasDown = this.gamepadButtons.wasDown || false;
                const isLeft = leftStickX < -threshold || dpadX < -threshold;
                const isRight = leftStickX > threshold || dpadX > threshold;
                const isUp = leftStickY < -threshold || dpadY < -threshold;
                const isDown = leftStickY > threshold || dpadY > threshold;
                if (isLeft && !wasLeft) this.navigate('left');
                if (isRight && !wasRight) this.navigate('right');
                if (isUp && !wasUp) this.navigate('up');
                if (isDown && !wasDown) this.navigate('down');
                this.gamepadButtons.wasLeft = isLeft;
                this.gamepadButtons.wasRight = isRight;
                this.gamepadButtons.wasUp = isUp;
                this.gamepadButtons.wasDown = isDown;
            }
        }
        requestAnimationFrame(() => this.pollGamepad());
    }
    handleGamepadButton(buttonIndex) {
        const action = this.gamepadButtons[buttonIndex];
        switch (action) {
        case 'select':
            this.activateElement();
            break;
        case 'back':
            this.goBack();
            break;
        case 'home':
            this.goHome();
            break;
        case 'menu':
            this.toggleKeyboard();
            break;
        case 'pageup':
            this.navigateSection('up');
            break;
        case 'pagedown':
            this.navigateSection('down');
            break;
        }
    }
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('focus', (e) => this.handleFocus(e), true);
        window.addEventListener('resize', () => this.updateFocusableElements());
        // Prevent default focus outline and use our custom styling
        document.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('tv-nav-focusable')) {
                e.target.classList.add('tv-nav-focused');
            }
        });
        document.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('tv-nav-focusable')) {
                e.target.classList.remove('tv-nav-focused');
            }
        });
    }
    handleKeyDown(e) {
        // Don't interfere if keyboard is visible and an input is focused
        if (this.keyboardVisible && document.activeElement === this.keyboardInput) {
            return;
        }
        const key = e.key;
        let handled = true;
        switch (key) {
        case 'ArrowUp':
            e.preventDefault();
            this.navigate('up');
            break;
        case 'ArrowDown':
            e.preventDefault();
            this.navigate('down');
            break;
        case 'ArrowLeft':
            e.preventDefault();
            this.navigate('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            this.navigate('right');
            break;
        case 'Enter':
            e.preventDefault();
            this.activateElement();
            break;
        case 'Escape':
        case 'Backspace':
            e.preventDefault();
            this.goBack();
            break;
        case 'Home':
            e.preventDefault();
            this.goHome();
            break;
        case 'PageUp':
            e.preventDefault();
            this.navigateSection('up');
            break;
        case 'PageDown':
            e.preventDefault();
            this.navigateSection('down');
            break;
        case 'F1':
            e.preventDefault();
            this.showHelp();
            break;
        case 'F10':
            e.preventDefault();
            this.toggleKeyboard();
            break;
        default:
            handled = false;
        }
        // Handle keyboard shortcuts
        if (e.altKey) {
            switch (key) {
            case 'm':
            case 'M':
                e.preventDefault();
                this.toggleAudio();
                handled = true;
                break;
            }
        }
        if (handled) {
            e.stopPropagation();
        }
    }
    navigate(direction) {
        if (!this.currentFocus) {
            this.setInitialFocus();
            return;
        }
        const currentRect = this.currentFocus.getBoundingClientRect();
        let bestElement = null;
        let bestDistance = Infinity;
        this.focusableElements.forEach(element => {
            if (element === this.currentFocus || !this.isElementVisible(element)) return;
            const rect = element.getBoundingClientRect();
            let isValidDirection = false;
            let distance = 0;
            switch (direction) {
            case 'up':
                isValidDirection = rect.bottom <= currentRect.top + 10;
                distance = Math.abs(rect.left - currentRect.left) + (currentRect.top - rect.bottom);
                break;
            case 'down':
                isValidDirection = rect.top >= currentRect.bottom - 10;
                distance = Math.abs(rect.left - currentRect.left) + (rect.top - currentRect.bottom);
                break;
            case 'left':
                isValidDirection = rect.right <= currentRect.left + 10;
                distance = Math.abs(rect.top - currentRect.top) + (currentRect.left - rect.right);
                break;
            case 'right':
                isValidDirection = rect.left >= currentRect.right - 10;
                distance = Math.abs(rect.top - currentRect.top) + (rect.left - currentRect.right);
                break;
            }
            if (isValidDirection && distance < bestDistance) {
                bestDistance = distance;
                bestElement = element;
            }
        });
        if (bestElement) {
            this.setFocus(bestElement);
            this.playSound('navigation');
        }
        else {
            this.playSound('error');
            this.shakeElement(this.currentFocus);
        }
    }
    navigateSection(direction) {
        const sections = document.querySelectorAll('section, .card, .container, .row');
        if (sections.length === 0) return;
        const currentSection = this.currentFocus ? this.currentFocus.closest('section, .card, .container, .row') : null;
        const currentIndex = currentSection ? Array.from(sections).indexOf(currentSection) : -1;
        let targetIndex;
        if (direction === 'up') {
            targetIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
        }
        else {
            targetIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
        }
        const targetSection = sections[targetIndex];
        const firstFocusable = targetSection.querySelector(this.options.focusableSelector);
        if (firstFocusable && this.isElementVisible(firstFocusable)) {
            this.setFocus(firstFocusable);
            this.playSound('navigation');
            this.updateBreadcrumb(`Section ${targetIndex + 1}`);
        }
    }
    activateElement() {
        if (!this.currentFocus) return;
        this.playSound('select');
        if (this.currentFocus.tagName === 'A') {
            this.currentFocus.click();
        }
        else if (this.currentFocus.tagName === 'BUTTON') {
            this.currentFocus.click();
        }
        else if (this.currentFocus.tagName === 'INPUT') {
            if (this.currentFocus.type === 'checkbox' || this.currentFocus.type === 'radio') {
                this.currentFocus.click();
            }
            else {
                this.showKeyboard(this.currentFocus);
            }
        }
        else if (this.currentFocus.tagName === 'SELECT') {
            this.currentFocus.focus();
            // Trigger dropdown
            const event = new KeyboardEvent('keydown', {
                key: 'Enter'
            });
            this.currentFocus.dispatchEvent(event);
        }
        else if (this.currentFocus.tagName === 'TEXTAREA') {
            this.showKeyboard(this.currentFocus);
        }
        else {
            // Generic click for other focusable elements
            this.currentFocus.click();
        }
    }
    goBack() {
        if (this.keyboardVisible) {
            this.hideKeyboard();
            return;
        }
        if (this.navigationHistory.length > 0) {
            const previousElement = this.navigationHistory.pop();
            if (previousElement && this.isElementVisible(previousElement)) {
                this.setFocus(previousElement, false);
                this.playSound('navigation');
                return;
            }
        }
        // Try to find a back button or close button
        const backButton = document.querySelector('[data-tv-nav="back"], .btn-back, .close, .modal-close');
        if (backButton && this.isElementVisible(backButton)) {
            backButton.click();
            this.playSound('select');
        }
        else {
            this.playSound('error');
        }
    }
    goHome() {
        // Try to find a home button or navigate to first focusable element
        const homeButton = document.querySelector('[data-tv-nav="home"], .btn-home, .navbar-brand');
        if (homeButton && this.isElementVisible(homeButton)) {
            this.setFocus(homeButton);
            this.playSound('select');
        }
        else {
            this.setInitialFocus();
            this.playSound('navigation');
        }
        this.updateBreadcrumb('Home');
    }
    showKeyboard(targetInput = null) {
        if (!this.options.enableKeyboard) return;
        this.keyboardVisible = true;
        this.keyboardInput = targetInput;
        const keyboard = document.getElementById('tv-nav-keyboard');
        const input = document.getElementById('tv-nav-keyboard-input');
        keyboard.classList.add('active');
        if (targetInput && targetInput.value) {
            input.value = targetInput.value;
        }
        // Focus first key
        const firstKey = keyboard.querySelector('.tv-nav-key');
        if (firstKey) {
            this.setFocus(firstKey, false);
        }
        this.playSound('select');
    }
    hideKeyboard() {
        if (!this.keyboardVisible) return;
        const keyboard = document.getElementById('tv-nav-keyboard');
        const input = document.getElementById('tv-nav-keyboard-input');
        // Transfer value back to original input
        if (this.keyboardInput && input.value !== this.keyboardInput.value) {
            this.keyboardInput.value = input.value;
            // Trigger input event
            const event = new Event('input', {
                bubbles: true
            });
            this.keyboardInput.dispatchEvent(event);
        }
        keyboard.classList.remove('active');
        this.keyboardVisible = false;
        // Return focus to original input or first focusable element
        if (this.keyboardInput && this.isElementVisible(this.keyboardInput)) {
            this.setFocus(this.keyboardInput, false);
        }
        else {
            this.setInitialFocus();
        }
        this.keyboardInput = null;
        this.playSound('navigation');
    }
    toggleKeyboard() {
        if (this.keyboardVisible) {
            this.hideKeyboard();
        }
        else {
            this.showKeyboard();
        }
    }
    handleKeyboardKey(key) {
        const input = document.getElementById('tv-nav-keyboard-input');
        switch (key) {
        case 'space':
            input.value += ' ';
            break;
        case 'backspace':
            input.value = input.value.slice(0, -1);
            break;
        case 'enter':
            this.hideKeyboard();
            return;
        case 'close':
            this.hideKeyboard();
            return;
        case 'shift':
            this.isShiftPressed = !this.isShiftPressed;
            this.updateKeyboardKeys();
            break;
        case 'caps':
            this.isCapsLockOn = !this.isCapsLockOn;
            this.updateKeyboardKeys();
            break;
        default:
            let char = key;
            if (this.isShiftPressed || this.isCapsLockOn) {
                char = char.toUpperCase();
            }
            input.value += char;
            // Reset shift after use
            if (this.isShiftPressed) {
                this.isShiftPressed = false;
                this.updateKeyboardKeys();
            }
        }
        this.playSound('select');
    }
    updateKeyboardKeys() {
        const keys = document.querySelectorAll('.tv-nav-key[data-key]');
        keys.forEach(key => {
            const keyValue = key.dataset.key;
            if (keyValue.length === 1 && /[a-zA-Z]/.test(keyValue)) {
                if (this.isShiftPressed || this.isCapsLockOn) {
                    key.textContent = keyValue.toUpperCase();
                }
                else {
                    key.textContent = keyValue.toLowerCase();
                }
            }
        });
        // Update shift key appearance
        const shiftKey = document.querySelector('.tv-nav-key[data-key="shift"]');
        if (shiftKey) {
            if (this.isShiftPressed) {
                shiftKey.classList.add('active');
            }
            else {
                shiftKey.classList.remove('active');
            }
        }
        // Update caps key appearance
        const capsKey = document.querySelector('.tv-nav-key[data-key="caps"]');
        if (capsKey) {
            if (this.isCapsLockOn) {
                capsKey.classList.add('active');
            }
            else {
                capsKey.classList.remove('active');
            }
        }
    }
    showHelp() {
        const help = document.getElementById('tv-nav-help');
        if (help) {
            help.classList.add('active');
            const closeButton = help.querySelector('button');
            if (closeButton) {
                this.setFocus(closeButton, false);
            }
        }
    }
    hideHelp() {
        const help = document.getElementById('tv-nav-help');
        if (help) {
            help.classList.remove('active');
            this.setInitialFocus();
        }
    }
    toggleAudio() {
        this.options.enableAudio = !this.options.enableAudio;
        this.showStatus(`Audio ${this.options.enableAudio ? 'Enabled' : 'Disabled'}`);
        this.playSound('select');
    }
    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll(this.options.focusableSelector)).filter(el => !el.matches(this.options.skipSelector) && this.isElementVisible(el));
    }
    isElementVisible(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && computedStyle.visibility !== 'hidden' && computedStyle.display !== 'none' && element.offsetParent !== null;
    }
    setFocus(element, addToHistory = true) {
        if (!element || !this.isElementVisible(element)) return;
        // Add current focus to history
        if (addToHistory && this.currentFocus && this.currentFocus !== element) {
            this.navigationHistory.push(this.currentFocus);
            // Limit history size
            if (this.navigationHistory.length > 10) {
                this.navigationHistory.shift();
            }
        }
        // Remove focus from current element
        if (this.currentFocus) {
            this.currentFocus.classList.remove('tv-nav-focused');
            this.currentFocus.blur();
        }
        this.currentFocus = element;
        element.classList.add('tv-nav-focused');
        element.focus();
        // Scroll into view if needed
        this.scrollIntoView(element);
        // Update breadcrumb
        this.updateBreadcrumb(this.getElementBreadcrumb(element));
    }
    setInitialFocus() {
        this.updateFocusableElements();
        // Try to focus the first focusable element
        if (this.focusableElements.length > 0) {
            this.setFocus(this.focusableElements[0], false);
        }
    }
    scrollIntoView(element) {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!isInView) {
            element.scrollIntoView({
                behavior: 'smooth'
                , block: 'center'
                , inline: 'nearest'
            });
        }
    }
    handleFocus(e) {
        if (e.target.classList.contains('tv-nav-focusable')) {
            this.currentFocus = e.target;
            e.target.classList.add('tv-nav-focused');
        }
    }
    getElementBreadcrumb(element) {
        const section = element.closest('section');
        const card = element.closest('.card');
        const modal = element.closest('.modal');
        if (modal) {
            const title = modal.querySelector('.modal-title');
            return title ? title.textContent : 'Modal';
        }
        if (card) {
            const title = card.querySelector('.card-title, .card-header');
            return title ? title.textContent : 'Card';
        }
        if (section) {
            const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
            return heading ? heading.textContent : 'Section';
        }
        return element.textContent ? .trim().substring(0, 30) || element.tagName;
    }
    updateBreadcrumb(text) {
        if (!this.options.enableBreadcrumbs) return;
        const breadcrumb = document.getElementById('tv-nav-breadcrumb');
        if (breadcrumb) {
            breadcrumb.textContent = text;
        }
    }
    showStatus(message, duration = 3000) {
        const status = document.getElementById('tv-nav-status');
        if (status) {
            status.textContent = message;
            status.style.opacity = '1';
            setTimeout(() => {
                status.style.opacity = '0.7';
            }, duration);
        }
    }
    showLoading(show = true) {
        const loading = document.getElementById('tv-nav-loading');
        if (loading) {
            if (show) {
                loading.classList.add('active');
            }
            else {
                loading.classList.remove('active');
            }
        }
    }
    shakeElement(element) {
            if (!element) return;
            element.classList.add('tv-nav-shake');
            setTimeout(() => {
                element.classList.remove('tv-nav-shake');
            }, 500);
        }
        // Public API methods
    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            this.setFocus(element);
            return true;
        }
        return false;
    }
    addFocusableElement(element) {
        if (element && !element.classList.contains('tv-nav-focusable')) {
            element.classList.add('tv-nav-focusable');
            this.updateFocusableElements();
        }
    }
    removeFocusableElement(element) {
        if (element) {
            element.classList.remove('tv-nav-focusable', 'tv-nav-focused');
            this.updateFocusableElements();
        }
    }
    getCurrentFocus() {
        return this.currentFocus;
    }
    getFocusableElements() {
        return this.focusableElements;
    }
    destroy() {
        // Remove event listeners and clean up
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('focus', this.handleFocus, true);
        window.removeEventListener('resize', this.updateFocusableElements);
        // Remove UI elements
        const elementsToRemove = [
      'tv-nav-breadcrumb'
      , 'tv-nav-status'
      , 'tv-nav-loading'
      , 'tv-nav-keyboard'
      , 'tv-nav-help'
    ];
        elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });
        // Remove classes
        document.body.classList.remove('tv-nav-enabled');
        document.querySelectorAll('.tv-nav-focused').forEach(el => {
            el.classList.remove('tv-nav-focused');
        });
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
// Auto-initialize
window.tvNav = new TVNavigationFramework();

function showModal() {
    const modal = new bootstrap.Modal(document.getElementById('demoModal'));
    modal.show();
}
// Initialize smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
                , block: 'start'
            });
        }
    });
});
// Show initial welcome message
setTimeout(() => {
    tvNav.showStatus('Use arrow keys or F1 for help!', 5000);
}, 2000);