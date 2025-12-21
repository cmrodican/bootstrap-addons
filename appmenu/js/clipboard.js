
    const logEl = document.getElementById('log');
    let lastEditableFocus = null;
    let matches = [];
    let currentIndex = -1;

    function logAction(msg) {
      const timestamp = new Date().toLocaleTimeString();
      logEl.insertAdjacentHTML('beforeend', `[${timestamp}] ${msg}<br>`);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function isEditable(el) {
      return el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
    }

    document.addEventListener('focusin', e => { if (isEditable(e.target)) lastEditableFocus = e.target; });

    // Clipboard actions
    function getSelectedText() { return window.getSelection().toString(); }
    async function copyGlobal() {
      const selected = getSelectedText();
      if (!selected) return logAction('Copy: no text selected');
      try { await navigator.clipboard.writeText(selected); logAction(`Copy: "${selected}"`); }
      catch { logAction('Copy failed'); }
    }
    async function cutGlobal() {
      const selected = getSelectedText();
      if (!selected) return logAction('Cut: no text selected');
      if (isEditable(document.activeElement)) {
        document.execCommand('cut'); logAction(`Cut: "${selected}"`);
      } else { await navigator.clipboard.writeText(selected); logAction(`Cut fallback → Copy: "${selected}"`); }
    }
    async function pasteGlobal() {
      let el = document.activeElement;
      if (!isEditable(el)) el = lastEditableFocus;
      if (!isEditable(el)) return logAction('Paste not allowed: focus an editable element');
      const text = await navigator.clipboard.readText();
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end');
      } else { document.execCommand('insertText', false, text); }
      logAction(`Paste: "${text}"`);
    }
    function selectAllGlobal() {
      const el = document.activeElement;
      if (isEditable(el)) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.select();
        else {
          const range = document.createRange(); range.selectNodeContents(el);
          const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        }
        logAction('Select All executed');
      } else {
        const range = document.createRange(); range.selectNodeContents(document.body);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        logAction('Select All: entire page');
      }
    }

    // Wire clipboard buttons
    document.getElementById('btnCopy').onclick = copyGlobal;
    document.getElementById('btnCut').onclick = cutGlobal;
    document.getElementById('btnPaste').onclick = pasteGlobal;
    document.getElementById('btnSelectAll').onclick = selectAllGlobal;

    // Custom Find feature
    function clearHighlights() {
      matches.forEach(m => {
        const parent = m.parentNode;
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      });
      matches = [];
      currentIndex = -1;
    }

    function findText() {
      clearHighlights();
      const term = document.getElementById('searchInput').value.trim();
      if (!term) return logAction('Find: empty search term');

      const regex = new RegExp(term, 'gi');
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (regex.test(node.nodeValue)) {
          const span = document.createElement('span');
          span.className = 'highlight';
          span.textContent = node.nodeValue;
          const parent = node.parentNode;
          parent.replaceChild(span, node);
          matches.push(span);
        }
      }
      if (matches.length) {
        currentIndex = 0;
        matches[currentIndex].classList.add('current-highlight');
        logAction(`Found ${matches.length} matches for "${term}"`);
      } else {
        logAction(`No matches for "${term}"`);
      }
    }

    function navigateMatch(direction) {
      if (!matches.length) return;
      matches[currentIndex].classList.remove('current-highlight');
      currentIndex = (currentIndex + direction + matches.length) % matches.length;
      matches[currentIndex].classList.add('current-highlight');
      matches[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    document.getElementById('btnFind').onclick = findText;
    document.getElementById('btnClear').onclick = clearHighlights;
    document.getElementById('btnNext').onclick = () => navigateMatch(1);
    document.getElementById('btnPrev').onclick = () => navigateMatch(-1);
  
