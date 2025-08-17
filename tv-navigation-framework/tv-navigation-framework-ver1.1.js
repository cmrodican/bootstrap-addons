/*!
 * TV Navigation Framework CSS v1.0.0
 * https://github.com/cmrodican/bootstrap-addons/tv-navigation-framework
 * Licensed under GNU GPL 2.0 License
 * Compatible with Bootstrap 5.3+ and Bootswatch themes
 */

(function(global, factory) {
  'use strict';
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else {
    // Browser globals
    global.TVNavigationFramework = factory();
  }
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  // Version
  const VERSION = '1.0.0';

  // Default configuration
  const DEFAULT_OPTIONS = {
    enableAudio: true,
    enableVisualFeedback: true,
    enableKeyboard: true,
    enableGamepad: true,
    enableBreadcrumbs: true,
    enableHelp: true,
    enableToasts: true,
    focusableSelector: '.tv-nav-focusable, button:not(.tv-nav-skip), a:not(.tv-nav-skip), input:not(.tv-nav-skip), select:not(.tv-nav-skip), textarea:not(.tv-nav-skip), [tabindex]:not([tabindex="-1"]):not(.tv-nav-skip)',
    skipSelector: '.tv-nav-skip, [disabled], [aria-hidden="true"]',
    audioVolume: 0.3,
    gamepadDeadzone: 0.3,
    navigationDelay: 200,
    debounceDelay: 100,
    scrollBehavior: 'smooth',
    autoInitialize: true,
    theme: 'auto'
  };

  // Event names
  const EVENTS = {
    FOCUS: 'tv-nav-focus',
    ACTIVATE: 'tv-nav-activate',
    BACK: 'tv-nav-back',
    HOME: 'tv-nav-home',
    NAVIGATE: 'tv-nav-navigate',
    KEYBOARD_SHOW: 'tv-nav-keyboard-show',
    KEYBOARD_HIDE: 'tv-nav-keyboard-hide',
    AUDIO_TOGGLE: 'tv-nav-audio-toggle',
    READY: 'tv-nav-ready'
  };

  // Utility functions
  const Utils = {
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    isVisible(element) {
      if (!element || !element.offsetParent) return false;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && 
             rect.height > 0 && 
             style.visibility !== 'hidden' && 
             style.display !== 'none' &&
             style.opacity !== '0';
    },

    getDistance(rect1, rect2) {
      const dx = Math.abs(rect1.left - rect2.left);
      const dy = Math.abs(rect1.top - rect2.top);
      return Math.sqrt(dx * dx + dy * dy);
    },

    createElement(tag, className = '', content = '') {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (content) element.innerHTML = content;
      return element;
    },

    dispatchEvent(element, eventName, detail = {}) {
      const event = new CustomEvent(eventName, {
        detail,
        bubbles: true,
        cancelable: true
      });
      return element.dispatchEvent(event);
    },

    prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    isLowEndDevice() {
      return navigator.hardwareConcurrency < 4 || 
             navigator.deviceMemory < 2;
    }
  };

  // Audio Manager
  class AudioManager {
    constructor(options) {
      this.options = options;
      this.context = null;
      this.sounds = new Map();
      this.enabled = options.enableAudio;
      this.volume = options.audioVolume;
    }

    async init() {
      if (!this.enabled) return;
      
      try {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        await this.createSounds();
      } catch (error) {
        console.warn('TV Navigation: Audio initialization failed:', error);
        this.enabled = false;
      }
    }

    async createSounds() {
      const soundDefinitions = {
        navigation: { frequency: 200, duration: 0.1, type: 'sine' },
        select: { frequency: 400, duration: 0.2, type: 'sine' },
        error: { frequency: 150, duration: 0.3, type: 'sawtooth' },
        success: { frequency: 600, duration: 0.2, type: 'sine' },
        back: { frequency: 250, duration: 0.15, type: 'triangle' },
        home: { frequency: 350, duration: 0.25, type: 'sine' }
      };

      for (const [name, config] of Object.entries(soundDefinitions)) {
        this.sounds.set(name, await this.createSound(config));
      }
    }

    async createSound({ frequency, duration, type = 'sine' }) {
      const sampleRate = this.context.sampleRate;
      const length = Math.floor(sampleRate * duration);
      const buffer = this.context.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        let value;
        
        switch (type) {
          case 'sine':
            value = Math.sin(2 * Math.PI * frequency * time);
            break;
          case 'sawtooth':
            value = 2 * ((frequency * time) % 1) - 1;
            break;
          case 'triangle':
            value = 2 * Math.abs(2 * ((frequency * time) % 1) - 1) - 1;
            break;
          default:
            value = Math.sin(2 * Math.PI * frequency * time);
        }

        // Apply envelope (fade out)
        const envelope = Math.max(0, 1 - (i / length));
        data[i] = value * envelope * 0.1;
      }

      return buffer;
    }

    play(soundName) {
      if (!this.enabled || !this.context || !this.sounds.has(soundName)) return;

      try {
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        
        source.buffer = this.sounds.get(soundName);
        gainNode.gain.value = this.volume;
        
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        source.start();
      } catch (error) {
        console.warn('TV Navigation: Sound playback failed:', error);
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    setVolume(volume) {
      this.volume = Math.max(0, Math.min(1, volume));
    }

    destroy() {
      if (this.context) {
        this.context.close();
        this.context = null;
      }
      this.sounds.clear();
    }
  }

  // Gamepad Manager
  class GamepadManager {
    constructor(framework) {
      this.framework = framework;
      this.gamepadIndex = null;
      this.buttonStates = new Map();
      this.axisStates = new Map();
      this.deadzone = framework.options.gamepadDeadzone;
      this.polling = false;
      
      this.buttonMap = {
        0: 'select',    // A button
        1: 'back',      // B button
        2: 'home',      // X button
        3: 'home',      // Y button
        4: 'pageup',    // L1/LB
        5: 'pagedown',  // R1/RB
        8: 'menu',      // Select/Back
        9: 'menu',      // Start/Menu
        12: 'up',       // D-pad up
        13: 'down',     // D-pad down
        14: 'left',     // D-pad left
        15: 'right'     // D-pad right
      };

      this.init();
    }

    init() {
      window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));
      this.startPolling();
    }

    onGamepadConnected(event) {
      this.gamepadIndex = event.gamepad.index;
      this.framework.showToast(`Controller connected: ${event.gamepad.id}`, 'success');
      console.log('TV Navigation: Gamepad connected:', event.gamepad.id);
    }

    onGamepadDisconnected(event) {
      if (this.gamepadIndex === event.gamepad.index) {
        this.gamepadIndex = null;
        this.framework.showToast('Controller disconnected', 'warning');
        console.log('TV Navigation: Gamepad disconnected');
      }
    }

    startPolling() {
      if (this.polling) return;
      this.polling = true;
      this.poll();
    }

    poll() {
      if (!this.polling) return;

      if (this.gamepadIndex !== null) {
        const gamepad = navigator.getGamepads()[this.gamepadIndex];
        if (gamepad) {
          this.handleButtons(gamepad);
          this.handleAxes(gamepad);
        }
      }

      requestAnimationFrame(() => this.poll());
    }

    handleButtons(gamepad) {
      for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i];
        const wasPressed = this.buttonStates.get(i) || false;
        const isPressed = button.pressed;

        if (isPressed && !wasPressed) {
          this.onButtonPressed(i);
        }

        this.buttonStates.set(i, isPressed);
      }
    }

    handleAxes(gamepad) {
      // Left stick (axes 0, 1) and right stick (axes 2, 3)
      const leftX = gamepad.axes[0] || 0;
      const leftY = gamepad.axes[1] || 0;

      const directions = {
        left: leftX < -this.deadzone,
        right: leftX > this.deadzone,
        up: leftY < -this.deadzone,
        down: leftY > this.deadzone
      };

      for (const [direction, isActive] of Object.entries(directions)) {
        const wasActive = this.axisStates.get(direction) || false;
        
        if (isActive && !wasActive) {
          this.framework.navigate(direction);
        }
        
        this.axisStates.set(direction, isActive);
      }
    }

    onButtonPressed(buttonIndex) {
      const action = this.buttonMap[buttonIndex];
      
      if (action) {
        switch (action) {
          case 'select':
            this.framework.activateElement();
            break;
          case 'back':
            this.framework.goBack();
            break;
          case 'home':
            this.framework.goHome();
            break;
          case 'menu':
            this.framework.toggleKeyboard();
            break;
          case 'pageup':
            this.framework.navigateSection('up');
            break;
          case 'pagedown':
            this.framework.navigateSection('down');
            break;
          case 'up':
          case 'down':
          case 'left':
          case 'right':
            this.framework.navigate(action);
            break;
        }
      }
    }

    stopPolling() {
      this.polling = false;
    }

    destroy() {
      this.stopPolling();
      this.buttonStates.clear();
      this.axisStates.clear();
    }
  }

  // Toast Manager
  class ToastManager {
    constructor() {
      this.toasts = [];
      this.container = null;
      this.createContainer();
    }

    createContainer() {
      this.container = Utils.createElement('div', 'tv-nav-toast-container');
      this.container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 4000;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
      const toast = Utils.createElement('div', `tv-nav-toast ${type}`);
      toast.textContent = message;
      toast.style.cssText = `
        background: ${this.getBackgroundColor(type)};
        color: ${this.getTextColor(type)};
        padding: 15px 25px;
        border-radius: 8px;
        margin-bottom: 10px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease-in-out;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      `;

      this.container.appendChild(toast);
      this.toasts.push(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      // Auto remove
      setTimeout(() => this.hide(toast), duration);

      return toast;
    }

    hide(toast) {
      if (!toast.parentNode) return;

      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';

      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
          this.toasts.splice(index, 1);
        }
      }, 300);
    }

    getBackgroundColor(type) {
      const colors = {
        success: 'rgba(40, 167, 69, 0.9)',
        error: 'rgba(220, 53, 69, 0.9)',
        warning: 'rgba(255, 193, 7, 0.9)',
        info: 'rgba(23, 162, 184, 0.9)',
        default: 'rgba(52, 58, 64, 0.9)'
      };
      return colors[type] || colors.default;
    }

    getTextColor(type) {
      return type === 'warning' ? '#000' : '#fff';
    }

    clear() {
      this.toasts.forEach(toast => this.hide(toast));
    }

    destroy() {
      this.clear();
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }

  // Main TV Navigation Framework Class
  class TVNavigationFramework {
    constructor(options = {}) {
      this.options = { ...DEFAULT_OPTIONS, ...options };
      this.version = VERSION;
      
      // Core properties
      this.currentFocus = null;
      this.focusableElements = [];
      this.navigationHistory = [];
      this.keyboardVisible = false;
      this.keyboardInput = null;
      this.helpVisible = false;
      this.isShiftPressed = false;
      this.isCapsLockOn = false;
      
      // Managers
      this.audioManager = null;
      this.gamepadManager = null;
      this.toastManager = null;
      
      // Debounced functions
      this.debouncedNavigate = Utils.debounce(this._navigate.bind(this), this.options.debounceDelay);
      this.debouncedUpdateElements = Utils.debounce(this.updateFocusableElements.bind(this), 100);
      
      // State flags
      this.initialized = false;
      this.destroyed = false;

      if (this.options.autoInitialize) {
        this.init();
      }
    }

    async init() {
      if (this.initialized || this.destroyed) return;

      try {
        this.createUI();
        this.setupEventListeners();
        
        // Initialize managers
        this.audioManager = new AudioManager(this.options);
        await this.audioManager.init();
        
        if (this.options.enableGamepad) {
          this.gamepadManager = new GamepadManager(this);
        }
        
        if (this.options.enableToasts) {
          this.toastManager = new ToastManager();
        }
        
        this.updateFocusableElements();
        this.setInitialFocus();
        this.applyTheme();
        
        this.initialized = true;
        this.showStatus('TV Navigation Ready');
        
        Utils.dispatchEvent(document, EVENTS.READY, { framework: this });
        
      } catch (error) {
        console.error('TV Navigation: Initialization failed:', error);
        this.showToast('Navigation initialization failed', 'error');
      }
    }

    createUI() {
      document.body.classList.add('tv-nav-enabled');

      // Create breadcrumb
      if (this.options.enableBreadcrumbs) {
        this.breadcrumbElement = Utils.createElement('div', 'tv-nav-breadcrumb', 'Home');
        this.breadcrumbElement.id = 'tv-nav-breadcrumb';
        document.body.appendChild(this.breadcrumbElement);
      }

      // Create status indicator
      this.statusElement = Utils.createElement('div', 'tv-nav-status', 'Initializing...');
      this.statusElement.id = 'tv-nav-status';
      document.body.appendChild(this.statusElement);

      // Create loading overlay
      this.loadingElement = Utils.createElement('div', 'tv-nav-loading');
      this.loadingElement.id = 'tv-nav-loading';
      this.loadingElement.innerHTML = '<div class="tv-nav-spinner"></div>';
      document.body.appendChild(this.loadingElement);

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
      this.keyboardElement = Utils.createElement('div', 'tv-nav-keyboard');
      this.keyboardElement.id = 'tv-nav-keyboard';

      const qwertyLayout = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
        ['caps', 'space', 'enter', 'close']
      ];

      this.keyboardElement.innerHTML = `
        <div class="tv-nav-keyboard-header">
          <h3>On-Screen Keyboard</h3>
          <button class="btn btn-danger btn-sm" onclick="tvNav.hideKeyboard()">×</button>
        </div>
        <input type="text" class="tv-nav-keyboard-input" id="tv-nav-keyboard-input" placeholder="Type here...">
        <div class="tv-nav-keyboard-layout">
          ${qwertyLayout.map(row => `
            <div class="tv-nav-keyboard-row">
              ${row.map(key => this.createKeyButton(key)).join('')}
            </div>
          `).join('')}
        </div>
      `;

      document.body.appendChild(this.keyboardElement);

      // Add event listeners
      this.keyboardElement.addEventListener('click', this.handleKeyboardClick.bind(this));
    }

    createKeyButton(key) {
      let className = 'tv-nav-key tv-nav-focusable';
      let content = key;
      let span = '';
      
      const keyConfig = {
        space: { class: 'space', content: 'Space', span: 4 },
        backspace: { class: 'backspace special', content: '⌫', span: 2 },
        enter: { class: 'enter special', content: '⏎', span: 2 },
        shift: { class: 'shift special', content: '⇧' },
        caps: { class: 'caps special', content: '⇪' },
        close: { class: 'close special', content: '✕', span: 2 }
      };

      if (keyConfig[key]) {
        className += ` ${keyConfig[key].class}`;
        content = keyConfig[key].content;
        if (keyConfig[key].span) {
          span = ` style="grid-column: span ${keyConfig[key].span};"`;
        }
      }
      
      return `<button class="${className}" data-key="${key}"${span}>${content}</button>`;
    }

    createHelp() {
      this.helpElement = Utils.createElement('div', 'tv-nav-help');
      this.helpElement.id = 'tv-nav-help';

      this.helpElement.innerHTML = `
        <div class="tv-nav-help-content">
          <div class="tv-nav-help-title">TV Navigation Controls</div>
          
          <div class="tv-nav-help-section">
            <h4>Basic Navigation</h4>
            <p><span class="tv-nav-help-key">↑↓←→</span> Navigate between elements</p>
            <p><span class="tv-nav-help-key">Enter</span> <span class="tv-nav-help-key">A</span> Select/Activate</p>
            <p><span class="tv-nav-help-key">Esc</span> <span class="tv-nav-help-key">B</span> Go Back/Cancel</p>
          </div>

          <div class="tv-nav-help-section">
            <h4>Advanced Controls</h4>
            <p><span class="tv-nav-help-key">Home</span> <span class="tv-nav-help-key">X/Y</span> Home/Main Menu</p>
            <p><span class="tv-nav-help-key">F10</span> <span class="tv-nav-help-key">Menu</span> On-Screen Keyboard</p>
            <p><span class="tv-nav-help-key">PgUp/PgDn</span> <span class="tv-nav-help-key">L1/R1</span> Navigate Sections</p>
          </div>

          <div class="tv-nav-help-section">
            <h4>Special Features</h4>
            <p><span class="tv-nav-help-key">F1</span> Show/Hide this help</p>
            <p><span class="tv-nav-help-key">Alt+M</span> Toggle audio feedback</p>
            <p><span class="tv-nav-help-key">Alt+T</span> Toggle theme</p>
          </div>

          <button class="btn btn-primary mt-3 tv-nav-focusable" onclick="tvNav.hideHelp()">Close Help</button>
        </div>
      `;

      document.body.appendChild(this.helpElement);
    }

    setupEventListeners() {
      // Keyboard events
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      
      // Focus events
      document.addEventListener('focusin', this.handleFocusIn.bind(this), true);
      document.addEventListener('focusout', this.handleFocusOut.bind(this), true);
      
      // Window events
      window.addEventListener('resize', this.debouncedUpdateElements);
      window.addEventListener('beforeunload', this.destroy.bind(this));
      
      // Mutation observer for dynamic content
      this.setupMutationObserver();
    }

    setupMutationObserver() {
      this.mutationObserver = new MutationObserver(this.debouncedUpdateElements);
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'disabled', 'hidden']
      });
    }

    handleKeyDown(event) {
      // Don't interfere with keyboard input
      if (this.keyboardVisible && event.target === document.getElementById('tv-nav-keyboard-input')) {
        return;
      }

      const key = event.key;
      let handled = true;

      // Basic navigation
      if (key.startsWith('Arrow')) {
        event.preventDefault();
        const direction = key.replace('Arrow', '').toLowerCase();
        this.navigate(direction);
      } else {
        // Other keys
        switch (key) {
          case 'Enter':
            event.preventDefault();
            this.activateElement();
            break;
          case 'Escape':
          case 'Backspace':
            event.preventDefault();
            this.goBack();
            break;
          case 'Home':
            event.preventDefault();
            this.goHome();
            break;
          case 'PageUp':
            event.preventDefault();
            this.navigateSection('up');
            break;
          case 'PageDown':
            event.preventDefault();
            this.navigateSection('down');
            break;
          case 'F1':
            event.preventDefault();
            this.toggleHelp();
            break;
          case 'F10':
            event.preventDefault();
            this.toggleKeyboard();
            break;
          default:
            handled = false;
        }
      }

      // Keyboard shortcuts with modifiers
      if (event.altKey) {
        switch (key.toLowerCase()) {
          case 'm':
            event.preventDefault();
            this.toggleAudio();
            handled = true;
            break;
          case 't':
            event.preventDefault();
            this.toggleTheme();
            handled = true;
            break;
        }
      }

      if (handled) {
        event.stopPropagation();
      }
    }

    navigate(direction) {
      this.debouncedNavigate(direction);
    }

    _navigate(direction) {
      if (!this.currentFocus) {
        this.setInitialFocus();
        return;
      }

      const currentRect = this.currentFocus.getBoundingClientRect();
      let bestElement = null;
      let bestScore = Infinity;

      this.focusableElements.forEach(element => {
        if (element === this.currentFocus || !Utils.isVisible(element)) return;

        const rect = element.getBoundingClientRect();
        const score = this.calculateNavigationScore(currentRect, rect, direction);

        if (score < bestScore) {
          bestScore = score;
          bestElement = element;
        }
      });

      if (bestElement) {
        this.setFocus(bestElement);
        this.audioManager?.play('navigation');
        Utils.dispatchEvent(document, EVENTS.NAVIGATE, { 
          direction, 
          from: this.currentFocus, 
          to: bestElement 
        });
      } else {
        this.audioManager?.play('error');
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

      // Calculate score based on distance and angle
      const angleWeight = 2;
      const distanceWeight = 1;
      
      return (distance * distanceWeight) + (angle * angleWeight * 100);
    }

    activateElement() {
      if (!this.currentFocus) return;

      this.audioManager?.play('select');
      
      const element = this.currentFocus;
      const tagName = element.tagName.toLowerCase();
      
      Utils.dispatchEvent(element, EVENTS.ACTIVATE, { element });

      switch (tagName) {
        case 'a':
        case 'button':
          element.click();
          break;
        case 'input':
          if (['checkbox', 'radio'].includes(element.type)) {
            element.click();
          } else if (['text', 'email', 'password', 'search', 'url'].includes(element.type)) {
            this.showKeyboard(element);
          } else {
            element.focus();
          }
          break;
        case 'textarea':
          this.showKeyboard(element);
          break;
        case 'select':
          element.focus();
          // Simulate Enter key to open dropdown
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
          element.dispatchEvent(enterEvent);
          break;
        default:
          // Try clicking for other focusable elements
          if (element.onclick || element.getAttribute('onclick')) {
            element.click();
          }
      }
    }

    setFocus(element, addToHistory = true) {
      if (!element || !Utils.isVisible(element)) return false;

      // Add to history
      if (addToHistory && this.currentFocus && this.currentFocus !== element) {
        this.navigationHistory.push(this.currentFocus);
        if (this.navigationHistory.length > 20) {
          this.navigationHistory.shift();
        }
      }

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
      this.scrollIntoView(element);

      // Update breadcrumb
      this.updateBreadcrumb(this.getElementBreadcrumb(element));

      Utils.dispatchEvent(element, EVENTS.FOCUS, { element });
      
      return true;
    }

    scrollIntoView(element) {
      const rect = element.getBoundingClientRect();
      const isInView = rect.top >= 0 && 
                      rect.bottom <= window.innerHeight &&
                      rect.left >= 0 && 
                      rect.right <= window.innerWidth;
      
      if (!isInView) {
        element.scrollIntoView({ 
          behavior: this.options.scrollBehavior,
          block: 'center',
          inline: 'nearest'
        });
      }
    }

    updateFocusableElements() {
      this.focusableElements = Array.from(document.querySelectorAll(this.options.focusableSelector))
        .filter(el => !el.matches(this.options.skipSelector) && Utils.isVisible(el));
    }

    setInitialFocus() {
      this.updateFocusableElements();
      
      // Try to focus the first focusable element
      if (this.focusableElements.length > 0) {
        this.setFocus(this.focusableElements[0], false);
        return true;
      }
      
      return false;
    }

    showToast(message, type = 'info', duration = 3000) {
      if (this.toastManager) {
        return this.toastManager.show(message, type, duration);
      }
    }

    showStatus(message, duration = 3000) {
      if (this.statusElement) {
        this.statusElement.textContent = message;
        this.statusElement.style.opacity = '1';
        
        if (duration > 0) {
          setTimeout(() => {
            this.statusElement.style.opacity = '0.7';
          }, duration);
        }
      }
    }

    showLoading(show = true) {
      if (this.loadingElement) {
        if (show) {
          this.loadingElement.classList.add('active');
        } else {
          this.loadingElement.classList.remove('active');
        }
      }
    }

    toggleHelp() {
      if (this.helpElement) {
        if (this.helpVisible) {
          this.hideHelp();
        } else {
          this.showHelp();
        }
      }
    }

    showHelp() {
      if (this.helpElement) {
        this.helpElement.classList.add('active');
        this.helpVisible = true;
        const closeButton = this.helpElement.querySelector('button');
        if (closeButton) {
          this.setFocus(closeButton, false);
        }
      }
    }

    hideHelp() {
      if (this.helpElement) {
        this.helpElement.classList.remove('active');
        this.helpVisible = false;
        this.setInitialFocus();
      }
    }

    toggleKeyboard() {
      if (this.keyboardVisible) {
        this.hideKeyboard();
      } else {
        this.showKeyboard();
      }
    }

    showKeyboard(targetInput = null) {
      if (!this.options.enableKeyboard) return;

      this.keyboardVisible = true;
      this.keyboardInput = targetInput;
      const input = document.getElementById('tv-nav-keyboard-input');
      
      this.keyboardElement.classList.add('active');
      
      if (targetInput && targetInput.value) {
        input.value = targetInput.value;
      }
      
      // Focus first key
      const firstKey = this.keyboardElement.querySelector('.tv-nav-key');
      if (firstKey) {
        this.setFocus(firstKey, false);
      }
      
      this.audioManager?.play('select');
      Utils.dispatchEvent(document, EVENTS.KEYBOARD_SHOW);
    }

    hideKeyboard() {
      if (!this.keyboardVisible) return;

      const input = document.getElementById('tv-nav-keyboard-input');
      
      // Transfer value back to original input
      if (this.keyboardInput && input.value !== this.keyboardInput.value) {
        this.keyboardInput.value = input.value;
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        this.keyboardInput.dispatchEvent(event);
      }
      
      this.keyboardElement.classList.remove('active');
      this.keyboardVisible = false;
      
      // Return focus to original input or first focusable element
      if (this.keyboardInput && Utils.isVisible(this.keyboardInput)) {
        this.setFocus(this.keyboardInput, false);
      } else {
        this.setInitialFocus();
      }
      
      this.keyboardInput = null;
      this.audioManager?.play('navigation');
      Utils.dispatchEvent(document, EVENTS.KEYBOARD_HIDE);
    }

    handleKeyboardClick(event) {
      if (event.target.classList.contains('tv-nav-key')) {
        this.handleKeyboardKey(event.target.dataset.key);
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
      
      this.audioManager?.play('select');
    }

    updateKeyboardKeys() {
      const keys = this.keyboardElement.querySelectorAll('.tv-nav-key[data-key]');
      keys.forEach(key => {
        const keyValue = key.dataset.key;
        if (keyValue.length === 1 && /[a-zA-Z]/.test(keyValue)) {
          if (this.isShiftPressed || this.isCapsLockOn) {
            key.textContent = keyValue.toUpperCase();
          } else {
            key.textContent = keyValue.toLowerCase();
          }
        }
      });

      // Update modifier key states
      const shiftKey = this.keyboardElement.querySelector('.tv-nav-key[data-key="shift"]');
      const capsKey = this.keyboardElement.querySelector('.tv-nav-key[data-key="caps"]');
      
      if (shiftKey) {
        shiftKey.classList.toggle('active', this.isShiftPressed);
      }
      
      if (capsKey) {
        capsKey.classList.toggle('active', this.isCapsLockOn);
      }
    }

    goBack() {
      if (this.keyboardVisible) {
        this.hideKeyboard();
        return;
      }

      if (this.helpVisible) {
        this.hideHelp();
        return;
      }

      if (this.navigationHistory.length > 0) {
        const previousElement = this.navigationHistory.pop();
        if (previousElement && Utils.isVisible(previousElement)) {
          this.setFocus(previousElement, false);
          this.audioManager?.play('navigation');
          return;
        }
      }

      // Try to find a back button or close button
      const backButton = document.querySelector('[data-tv-nav="back"], .btn-back, .close, .modal-close');
      if (backButton && Utils.isVisible(backButton)) {
        backButton.click();
        this.audioManager?.play('select');
      } else {
        this.audioManager?.play('error');
      }

      Utils.dispatchEvent(document, EVENTS.BACK);
    }

    goHome() {
      // Try to find a home button or navigate to first focusable element
      const homeButton = document.querySelector('[data-tv-nav="home"], .btn-home, .navbar-brand');
      if (homeButton && Utils.isVisible(homeButton)) {
        this.setFocus(homeButton);
        this.audioManager?.play('select');
      } else {
        this.setInitialFocus();
        this.audioManager?.play('navigation');
      }
      this.updateBreadcrumb('Home');
      Utils.dispatchEvent(document, EVENTS.HOME);
    }

    navigateSection(direction) {
      const sections = document.querySelectorAll('section, .card, .container, .row');
      if (sections.length === 0) return;

      const currentSection = this.currentFocus ? this.currentFocus.closest('section, .card, .container, .row') : null;
      const currentIndex = currentSection ? Array.from(sections).indexOf(currentSection) : -1;

      let targetIndex;
      if (direction === 'up') {
        targetIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
      } else {
        targetIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
      }

      const targetSection = sections[targetIndex];
      const firstFocusable = targetSection.querySelector(this.options.focusableSelector);
      
      if (firstFocusable && Utils.isVisible(firstFocusable)) {
        this.setFocus(firstFocusable);
        this.audioManager?.play('navigation');
        this.updateBreadcrumb(`Section ${targetIndex + 1}`);
      }
    }

    toggleAudio() {
      if (this.audioManager) {
        const enabled = this.audioManager.toggle();
        this.showStatus(`Audio ${enabled ? 'Enabled' : 'Disabled'}`);
        Utils.dispatchEvent(document, EVENTS.AUDIO_TOGGLE, { enabled });
        return enabled;
      }
      return false;
    }

    toggleTheme() {
      // Simple theme toggle between light and dark
      const body = document.body;
      const currentTheme = body.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-bs-theme', newTheme);
      this.showStatus(`Theme: ${newTheme}`);
    }

    applyTheme() {
      if (this.options.theme !== 'auto') {
        document.body.setAttribute('data-bs-theme', this.options.theme);
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
      
      return element.textContent?.trim().substring(0, 30) || element.tagName;
    }

    updateBreadcrumb(text) {
      if (!this.options.enableBreadcrumbs || !this.breadcrumbElement) return;
      this.breadcrumbElement.textContent = text;
    }

    shakeElement(element) {
      if (!element) return;
      element.classList.add('tv-nav-shake');
      setTimeout(() => {
        element.classList.remove('tv-nav-shake');
      }, 500);
    }

    handleFocusIn(event) {
      if (event.target.classList.contains('tv-nav-focusable')) {
        this.setFocus(event.target, false);
      }
    }

    handleFocusOut(event) {
      if (event.target.classList.contains('tv-nav-focused')) {
        event.target.classList.remove('tv-nav-focused');
      }
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
      if (this.destroyed) return;

      this.destroyed = true;
      
      // Clean up managers
      this.audioManager?.destroy();
      this.gamepadManager?.destroy();
      this.toastManager?.destroy();
      
      // Remove mutation observer
      this.mutationObserver?.disconnect();
      
      // Remove event listeners
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('focusin', this.handleFocusIn, true);
      document.removeEventListener('focusout', this.handleFocusOut, true);
      window.removeEventListener('resize', this.debouncedUpdateElements);
      window.removeEventListener('beforeunload', this.destroy);
      
      // Remove UI elements
      const elementsToRemove = [
        this.breadcrumbElement,
        this.statusElement,
        this.loadingElement,
        this.keyboardElement,
        this.helpElement
      ];
      
      elementsToRemove.forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      
      // Clean up classes
      document.body.classList.remove('tv-nav-enabled');
      document.querySelectorAll('.tv-nav-focused').forEach(el => {
        el.classList.remove('tv-nav-focused');
      });
      
      // Clear references
      this.currentFocus = null;
      this.focusableElements = [];
      this.navigationHistory = [];
    }

    // Version info
    static get version() {
      return VERSION;
    }

    get version() {
      return VERSION;
    }
  }

  // Export the class
  return TVNavigationFramework;
});

// Auto-initialize if DOM is ready and running in browser
if (typeof window !== 'undefined') {
  function autoInit() {
    if (!window.tvNav) {
      window.tvNav = new window.TVNavigationFramework();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}
