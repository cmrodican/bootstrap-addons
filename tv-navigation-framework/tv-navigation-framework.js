/**
 * Enhanced TV Navigation Framework JavaScript - v1.1
 * Improvements: Focus trapping, better modal support, dynamic content handling
 */

class TVNavigationFramework {
  constructor(options = {}) {
    this.options = {
      enableAudio: true,
      enableVisualFeedback: true,
      enableKeyboard: true,
      enableGamepad: true,
      enableBreadcrumbs: true,
      enableHelp: true,
      enableFocusTrapping: true, // NEW: Enable focus trapping for modals
      focusableSelector: '.tv-nav-focusable, button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      skipSelector: '.tv-nav-skip',
      modalSelector: '.modal, .offcanvas, [role="dialog"], [role="alertdialog"]',
      audioVolume: 0.3,
      debugMode: false, // NEW: Enable debug logging
      ...options
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
    
    // NEW: Focus trapping support
    this.focusTrapStack = [];
    this.currentFocusTrap = null;
    
    // NEW: Dynamic content observer
    this.mutationObserver = null;
    
    // NEW: Modal event handlers
    this.modalEventHandlers = new Map();

    this.init();
  }

  async init() {
    this.createUI();
    this.setupEventListeners();
    this.setupDynamicContentObserver();
    this.setupModalSupport();
    
    if (this.options.enableAudio) {
      await this.initAudio();
    }
    if (this.options.enableGamepad) {
      this.initGamepad();
    }
    
    this.updateFocusableElements();
    this.setInitialFocus();
    this.showStatus('TV Navigation Ready');
    
    this.debug('TV Navigation Framework initialized');
  }

  // NEW: Debug logging
  debug(message, ...args) {
    if (this.options.debugMode) {
      console.log(`[TVNav] ${message}`, ...args);
    }
  }

  // NEW: Setup dynamic content observer
  setupDynamicContentObserver() {
    if (!window.MutationObserver) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        // Check for added/removed nodes
        if (mutation.type === 'childList') {
          shouldUpdate = true;
        }
        
        // Check for attribute changes on focusable elements
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (target.matches && target.matches(this.options.focusableSelector)) {
            shouldUpdate = true;
          }
        }
      });

      if (shouldUpdate) {
        this.debug('DOM changed, updating focusable elements');
        // Debounce updates
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          this.updateFocusableElements();
          this.validateCurrentFocus();
        }, 100);
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'disabled', 'hidden', 'style', 'tabindex']
    });
  }

  // NEW: Setup modal support with focus trapping
  setupModalSupport() {
    // Listen for Bootstrap modal events
    document.addEventListener('show.bs.modal', (e) => {
      this.debug('Modal opening:', e.target);
      this.handleModalOpen(e.target);
    });

    document.addEventListener('hidden.bs.modal', (e) => {
      this.debug('Modal closed:', e.target);
      this.handleModalClose(e.target);
    });

    // Also listen for generic modal patterns
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches && node.matches(this.options.modalSelector)) {
            if (this.isElementVisible(node)) {
              this.debug('Modal-like element appeared:', node);
              this.handleModalOpen(node);
            }
          }
        });
        
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches && node.matches(this.options.modalSelector)) {
            this.debug('Modal-like element removed:', node);
            this.handleModalClose(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // NEW: Handle modal opening
  handleModalOpen(modal) {
    if (!this.options.enableFocusTrapping) return;

    // Create focus trap
    const focusTrap = this.createFocusTrap(modal);
    this.focusTrapStack.push(focusTrap);
    this.currentFocusTrap = focusTrap;
    
    // Update focusable elements to only include modal content
    setTimeout(() => {
      this.updateFocusableElements();
      const firstFocusable = modal.querySelector(this.options.focusableSelector);
      if (firstFocusable && this.isElementVisible(firstFocusable)) {
        this.setFocus(firstFocusable, false);
      }
    }, 50);
  }

  // NEW: Handle modal closing
  handleModalClose(modal) {
    if (!this.options.enableFocusTrapping) return;

    // Remove focus trap
    this.focusTrapStack = this.focusTrapStack.filter(trap => trap.element !== modal);
    this.currentFocusTrap = this.focusTrapStack[this.focusTrapStack.length - 1] || null;
    
    // Restore previous focus or set initial focus
    setTimeout(() => {
      this.updateFocusableElements();
      if (this.currentFocusTrap) {
        // Still in a modal, focus first element of that modal
        const firstFocusable = this.currentFocusTrap.element.querySelector(this.options.focusableSelector);
        if (firstFocusable) {
          this.setFocus(firstFocusable, false);
        }
      } else {
        // No modal, restore normal navigation
        this.setInitialFocus();
      }
    }, 50);
  }

  // NEW: Create focus trap for modal
  createFocusTrap(element) {
    return {
      element: element,
      previousFocus: this.currentFocus,
      created: Date.now()
    };
  }

  // NEW: Validate current focus is still valid
  validateCurrentFocus() {
    if (this.currentFocus && !this.isElementVisible(this.currentFocus)) {
      this.debug('Current focus is no longer valid, setting new focus');
      this.currentFocus = null;
      this.setInitialFocus();
    }
  }

  // Enhanced updateFocusableElements with focus trapping support
  updateFocusableElements() {
    let container = document;
    
    // If we're in a focus trap (modal), only get elements from that container
    if (this.currentFocusTrap) {
      container = this.currentFocusTrap.element;
      this.debug('Updating focusable elements within focus trap:', container);
    }

    this.focusableElements = Array.from(container.querySelectorAll(this.options.focusableSelector))
      .filter(el => {
        // Skip elements marked to skip
        if (el.matches(this.options.skipSelector)) return false;
        
        // Skip disabled elements
        if (el.disabled) return false;
        
        // Skip elements with negative tabindex
        if (el.tabIndex < 0) return false;
        
        // Check visibility
        if (!this.isElementVisible(el)) return false;
        
        // If in focus trap, ensure element is within the trap
        if (this.currentFocusTrap && !this.currentFocusTrap.element.contains(el)) {
          return false;
        }
        
        return true;
      });

    this.debug(`Found ${this.focusableElements.length} focusable elements`);
  }

  // Enhanced navigation with better spatial logic
  navigate(direction) {
    if (!this.currentFocus) {
      this.setInitialFocus();
      return;
    }

    const currentRect = this.currentFocus.getBoundingClientRect();
    let candidates = [];

    this.focusableElements.forEach(element => {
      if (element === this.currentFocus || !this.isElementVisible(element)) return;

      const rect = element.getBoundingClientRect();
      const candidate = {
        element: element,
        rect: rect,
        distance: 0,
        alignment: 0
      };

      // Calculate if element is in the right direction
      let isValidDirection = false;
      let primaryDistance = 0;
      let secondaryDistance = 0;

      switch (direction) {
        case 'up':
          isValidDirection = rect.bottom <= currentRect.top + 5;
          primaryDistance = currentRect.top - rect.bottom;
          secondaryDistance = Math.abs(rect.left + rect.width/2 - currentRect.left - currentRect.width/2);
          break;
        case 'down':
          isValidDirection = rect.top >= currentRect.bottom - 5;
          primaryDistance = rect.top - currentRect.bottom;
          secondaryDistance = Math.abs(rect.left + rect.width/2 - currentRect.left - currentRect.width/2);
          break;
        case 'left':
          isValidDirection = rect.right <= currentRect.left + 5;
          primaryDistance = currentRect.left - rect.right;
          secondaryDistance = Math.abs(rect.top + rect.height/2 - currentRect.top - currentRect.height/2);
          break;
        case 'right':
          isValidDirection = rect.left >= currentRect.right - 5;
          primaryDistance = rect.left - currentRect.right;
          secondaryDistance = Math.abs(rect.top + rect.height/2 - currentRect.top - currentRect.height/2);
          break;
      }

      if (isValidDirection) {
        candidate.distance = primaryDistance + (secondaryDistance * 0.3); // Weight alignment less than distance
        candidate.alignment = 1 / (1 + secondaryDistance); // Higher alignment = better
        candidates.push(candidate);
      }
    });

    if (candidates.length > 0) {
      // Sort by distance, then by alignment
      candidates.sort((a, b) => {
        const distanceDiff = a.distance - b.distance;
        if (Math.abs(distanceDiff) < 50) { // If distances are close, prefer better alignment
          return b.alignment - a.alignment;
        }
        return distanceDiff;
      });

      this.setFocus(candidates[0].element);
      this.playSound('navigation');
    } else {
      this.playSound('error');
      this.shakeElement(this.currentFocus);
      this.debug(`No valid ${direction} navigation targets found`);
    }
  }

  // Enhanced goBack with focus trap support
  goBack() {
    if (this.keyboardVisible) {
      this.hideKeyboard();
      return;
    }

    // If we're in a focus trap (modal), try to close it
    if (this.currentFocusTrap) {
      const modal = this.currentFocusTrap.element;
      
      // Try Bootstrap modal close
      if (modal.classList.contains('modal')) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
          return;
        }
      }
      
      // Try clicking close button
      const closeButton = modal.querySelector('.btn-close, .close, [data-bs-dismiss="modal"], [data-dismiss="modal"]');
      if (closeButton) {
        closeButton.click();
        return;
      }
      
      // Try ESC key on modal
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      modal.dispatchEvent(escEvent);
      return;
    }

    // Normal back navigation
    if (this.navigationHistory.length > 0) {
      const previousElement = this.navigationHistory.pop();
      if (previousElement && this.isElementVisible(previousElement)) {
        this.setFocus(previousElement, false);
        this.playSound('navigation');
        return;
      }
    }

    // Try to find a back button
    const backButton = document.querySelector('[data-tv-nav="back"], .btn-back, .close');
    if (backButton && this.isElementVisible(backButton)) {
      backButton.click();
      this.playSound('select');
    } else {
      this.playSound('error');
    }
  }

  // Enhanced isElementVisible with better checks
  isElementVisible(element) {
    if (!element) return false;
    
    // Check if element exists in DOM
    if (!document.contains(element)) return false;
    
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    // Basic visibility checks
    if (rect.width <= 0 || rect.height <= 0) return false;
    if (computedStyle.visibility === 'hidden') return false;
    if (computedStyle.display === 'none') return false;
    if (computedStyle.opacity === '0') return false;
    
    // Check if element is in a hidden modal/container
    let parent = element.parentElement;
    while (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
        return false;
      }
      
      // Special check for Bootstrap modals
      if (parent.classList.contains('modal') && !parent.classList.contains('show')) {
        return false;
      }
      
      parent = parent.parentElement;
    }
    
    return true;
  }

  // Enhanced setFocus with better error handling
  setFocus(element, addToHistory = true) {
    if (!element || !this.isElementVisible(element)) {
      this.debug('Cannot focus element - not visible:', element);
      return false;
    }

    // Check if element is within current focus trap
    if (this.currentFocusTrap && !this.currentFocusTrap.element.contains(element)) {
      this.debug('Cannot focus element - outside current focus trap:', element);
      return false;
    }

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
    
    // Use setTimeout to ensure element is ready for focus
    setTimeout(() => {
      try {
        element.focus();
      } catch (error) {
        this.debug('Error focusing element:', error);
      }
    }, 0);

    // Scroll into view if needed
    this.scrollIntoView(element);

    // Update breadcrumb
    this.updateBreadcrumb(this.getElementBreadcrumb(element));
    
    this.debug('Focus set to:', element);
    return true;
  }

  // Enhanced scrollIntoView with better behavior
  scrollIntoView(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // More generous margins for TV viewing
    const margin = 80;
    
    const isInView = rect.top >= margin && 
                     rect.bottom <= viewportHeight - margin &&
                     rect.left >= margin && 
                     rect.right <= viewportWidth - margin;
    
    if (!isInView) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  }

  // Add method to manually create focus trap
  createModalFocusTrap(element) {
    this.handleModalOpen(element);
  }

  // Add method to manually remove focus trap
  removeModalFocusTrap(element) {
    this.handleModalClose(element);
  }

  // Enhanced destroy method
  destroy() {
    // Disconnect observers
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // Clear focus traps
    this.focusTrapStack = [];
    this.currentFocusTrap = null;
    
    // Clear timeouts
    clearTimeout(this.updateTimeout);
    
    // Remove event listeners
    this.modalEventHandlers.forEach((handler, element) => {
      element.removeEventListener('show.bs.modal', handler);
      element.removeEventListener('hidden.bs.modal', handler);
    });
    
    // Call original destroy logic
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('focus', this.handleFocus, true);
    window.removeEventListener('resize', this.updateFocusableElements);
    
    // Remove UI elements
    const elementsToRemove = [
      'tv-nav-breadcrumb',
      'tv-nav-status',
      'tv-nav-loading',
      'tv-nav-keyboard',
      'tv-nav-help'
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
    
    this.debug('TV Navigation Framework destroyed');
  }

  // Keep all existing methods from original framework...
  // [Include all the other methods from your original implementation]
  
  // Placeholder for createUI, setupEventListeners, initAudio, etc.
  // These would remain the same as your original implementation
}