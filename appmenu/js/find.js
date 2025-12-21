
    // --- Utilities & state ---
    const logEl = document.getElementById('log');
    let lastEditableFocus = null; // track last focused editable element

    function logAction(msg) {
      const timestamp = new Date().toLocaleTimeString();
      logEl.insertAdjacentHTML('beforeend', `[${timestamp}] ${msg}<br>`);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function isEditable(el) {
      if (!el) return false;
      const tag = el.tagName;
      return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA';
    }

    function getSelectedText() {
      return window.getSelection().toString();
    }

    // Track last focused editable element
    document.addEventListener('focusin', (e) => {
      if (isEditable(e.target)) {
        lastEditableFocus = e.target;
      }
    });

    // Prevent buttons from stealing focus on mouse click (focus stays in field)
    const btnIds = ['btnSelectAll', 'btnCut', 'btnCopy', 'btnPaste'];
    btnIds.forEach(id => {
      const btn = document.getElementById(id);
      btn.addEventListener('mousedown', (e) => e.preventDefault()); // preserves current focus
      // You could also use 'pointerdown' for broader input types:
      // btn.addEventListener('pointerdown', (e) => e.preventDefault());
    });

    // --- Actions ---
    function selectAllGlobal() {
      const el = document.activeElement;

      if (isEditable(el)) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.select();
          logAction('Select All: input/textarea');
        } else {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          logAction('Select All: contenteditable');
        }
        return;
      }

      // Select entire page content
      const range = document.createRange();
      range.selectNodeContents(document.body);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      logAction('Select All: entire page');
    }

    async function copyGlobal() {
      const selected = getSelectedText();
      if (!selected) {
        logAction('Copy: no text selected');
        return;
      }

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(selected);
          logAction(`Copy: "${selected}"`);
        } else {
          const ok = document.execCommand('copy');
          logAction(ok ? `Copy (fallback): "${selected}"` : 'Copy (fallback) failed');
        }
      } catch {
        logAction('Copy failed (permissions or environment)');
      }
    }

    async function cutGlobal() {
      const selected = getSelectedText();
      if (!selected) {
        logAction('Cut: no text selected');
        return;
      }

      const el = document.activeElement;
      if (isEditable(el)) {
        // execCommand('cut') still widely supported for editable fields
        const ok = document.execCommand('cut');
        if (ok) {
          logAction(`Cut: "${selected}"`);
        } else {
          // Fallback: copy (cannot remove text programmatically)
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(selected);
              logAction(`Cut fallback → Copy: "${selected}"`);
            } else {
              logAction('Cut fallback failed');
            }
          } catch {
            logAction('Cut fallback failed (permissions)');
          }
        }
        return;
      }

      // Non-editable selection: cannot cut; copy instead
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(selected);
          logAction(`Cut not possible on non-editable → Copied: "${selected}"`);
        } else {
          const ok = document.execCommand('copy');
          logAction(ok ? `Cut not possible → Copy (fallback): "${selected}"` : 'Cut not possible → Copy (fallback) failed');
        }
      } catch {
        logAction('Cut not possible → Copy failed (permissions)');
      }
    }

    async function pasteGlobal() {
      // Prefer current active editable; otherwise fallback to lastEditableFocus
      let el = document.activeElement;
      if (!isEditable(el)) {
        el = lastEditableFocus;
      }

      const isTargetEditable = isEditable(el);
      if (!isTargetEditable) {
        logAction('Paste not allowed: focus an input/textarea/contenteditable first');
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

          logAction(`Paste: "${text}"`);
        } else {
          logAction('Paste failed: Clipboard API unavailable; use Ctrl+V in the focused field');
        }
      } catch {
        logAction('Paste failed (permissions or empty clipboard)');
      }
    }

    // --- Wire buttons ---
    document.getElementById('btnSelectAll').addEventListener('click', selectAllGlobal);
    document.getElementById('btnCopy').addEventListener('click', copyGlobal);
    document.getElementById('btnCut').addEventListener('click', cutGlobal);
    document.getElementById('btnPaste').addEventListener('click', pasteGlobal);

    // --- Keyboard shortcuts (global) ---
    document.addEventListener('keydown', (e) => {
      if (!e.ctrlKey) return;

      const key = e.key.toLowerCase();
      if (key === 'a') {
        e.preventDefault();
        selectAllGlobal();
      } else if (key === 'c') {
        e.preventDefault();
        copyGlobal();
      } else if (key === 'x') {
        e.preventDefault();
        cutGlobal();
      } else if (key === 'v') {
        e.preventDefault();
        pasteGlobal();
      }
    });
  
