// Renders modules/bootstrap-docs.md into the page using marked.js, styled by bootstrap-docs.css.
(() => {
  'use strict'

  const SOURCE = 'bootstrap-docs.md'
  const content = document.getElementById('doc-content')
  const toc = document.getElementById('TableOfContents')

  const slug = text => text.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
  const escapeHtml = str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const renderer = new marked.Renderer()

  // Headings get an id and a hover anchor, as in the Bootstrap docs.
  renderer.heading = (text, level) => {
    const id = slug(text)
    return `<h${level} id="${id}">${text}<a class="anchor-link" href="#${id}" aria-label="Link to this section: ${escapeHtml(text.replace(/<[^>]*>/g, ''))}"></a></h${level}>\n`
  }

  // Fenced code becomes a .highlight block. "html example" also renders a live .bd-example first.
  renderer.code = (code, infostring) => {
    const [lang = 'plaintext', flag] = (infostring || '').split(/\s+/)
    const highlight = `<div class="highlight"><pre><code class="language-${lang}">${escapeHtml(code)}</code></pre></div>\n`
    return flag === 'example' ? `<div class="bd-example">${code}</div>\n${highlight}` : highlight
  }

  // Wide tables scroll inside .table-responsive, using the docs table styling.
  renderer.table = (header, body) =>
    `<div class="table-responsive"><table class="table"><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`

  const buildToc = () => {
    const items = [...content.querySelectorAll('h2, h3')]
    let html = '<ul>'
    let open = false
    items.forEach(h => {
      const label = h.firstChild.textContent
      if (h.tagName === 'H3') {
        if (!open) { html += '<ul>'; open = true }
        html += `<li><a href="#${h.id}">${escapeHtml(label)}</a></li>`
      } else {
        if (open) { html += '</ul>'; open = false }
        html += `<li><a href="#${h.id}">${escapeHtml(label)}</a></li>`
      }
    })
    toc.innerHTML = html + (open ? '</ul>' : '') + '</ul>'
    if (items.length) {
      new bootstrap.ScrollSpy(document.body, { target: '#TableOfContents', rootMargin: '0px 0px -40%' })
    }
  }

  const render = markdown => {
    // Page title and lead come from comments at the top of the Markdown file.
    const meta = key => (markdown.match(new RegExp(`<!--\\s*${key}:\\s*(.*?)\\s*-->`)) || [])[1]
    const title = meta('title')
    if (title) document.getElementById('doc-title').textContent = title
    document.getElementById('doc-lead').textContent = meta('lead') || ''

    content.innerHTML = marked.parse(markdown, { renderer, gfm: true })
    buildToc()
    if (window.Prism) Prism.highlightAllUnder(content)
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()
  }

  fetch(SOURCE)
    .then(response => {
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      return response.text()
    })
    .then(render)
    .catch(error => {
      content.innerHTML = `<div class="bd-callout bd-callout-danger"><p>Could not load <code>${SOURCE}</code> (${escapeHtml(String(error.message))}). Serve this folder over HTTP, for example <code>python3 -m http.server</code>, because browsers block <code>fetch()</code> on <code>file://</code> pages.</p></div>`
    })
})()
