<!-- title: Bootstrap Docs CSS -->
<!-- lead: A standalone stylesheet that gives your own documentation pages and component demos the look of the official Bootstrap docs. -->

This page is a live demo. It is written in Markdown, rendered in your browser by [marked.js](https://marked.js.org/), and styled entirely by `bootstrap-docs.css`: the navbar, sidebar, "On this page" table of contents, callouts, examples and code blocks you see here all come from that one file.

## What it is

`bootstrap-docs.css` is the stylesheet that powers the layout and components of [getbootstrap.com/docs](https://getbootstrap.com/docs/). Load it next to Bootstrap 5.3 and you can reuse the same classes in your own docs, demos and component showcases without installing anything.

<div class="bd-callout bd-callout-info">

**It builds on Bootstrap, it doesn't replace it.** Load Bootstrap's CSS and JavaScript first, then `bootstrap-docs.css`.

</div>

## Quick start

Add the stylesheet after Bootstrap:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.9/css/bootstrap.min.css">
<link rel="stylesheet" href="bootstrap-docs/bootstrap-docs.css">
```

Then use the docs layout classes:

```html
<div class="container-xxl bd-gutter bd-layout">
  <aside class="bd-sidebar">…</aside>
  <main class="bd-main">
    <div class="bd-intro">…</div>
    <div class="bd-toc">…</div>
    <div class="bd-content">…</div>
  </main>
</div>
```

## Page layout

| Class | Purpose |
| --- | --- |
| `.bd-navbar` | Sticky top navbar with the signature gradient edge |
| `.bd-layout` | Two column grid: sidebar and main (from `lg` up) |
| `.bd-sidebar` | Left navigation column |
| `.bd-main` | Grid holding the intro, table of contents and content |
| `.bd-intro` | Page title and lead paragraph |
| `.bd-toc` | Sticky "On this page" navigation |
| `.bd-content` | The article body, with docs typography for headings, lists and tables |

## Callouts

Use `.bd-callout` with a color modifier to highlight notes.

<div class="bd-callout bd-callout-info">

**Info.** Neutral context or a helpful tip.

</div>

<div class="bd-callout bd-callout-warning">

**Warning.** Something to check before you ship.

</div>

<div class="bd-callout bd-callout-danger">

**Danger.** A mistake that will break something.

</div>

```html
<div class="bd-callout bd-callout-info">
  <strong>Info.</strong> Neutral context or a helpful tip.
</div>
```

## Live examples

Fence a block as `html example` in your Markdown and this page renders it in a `.bd-example` panel, followed by its highlighted source, the same pattern the official docs use.

```html example
<div class="d-flex flex-wrap gap-2">
  <button type="button" class="btn btn-primary">Primary</button>
  <button type="button" class="btn btn-outline-secondary">Secondary</button>
  <span class="badge text-bg-success align-self-center">Badge</span>
</div>
```

```html example
<div class="alert alert-warning mb-0" role="alert">
  Examples render with your page's active Bootstrap theme.
</div>
```

## The grid

The stylesheet also includes Bootstrap's CSS Grid utilities. Set the columns on `.grid` and span them with `.g-col-*`:

```html example
<div class="grid text-center">
  <div class="g-col-6 p-2 border rounded">.g-col-6</div>
  <div class="g-col-3 p-2 border rounded">.g-col-3</div>
  <div class="g-col-3 p-2 border rounded">.g-col-3</div>
</div>
```

<div class="bd-callout bd-callout-warning">

**Check for overlap.** Bootstrap's own `.grid` and `.g-col-*` classes use the same names. Review the file before loading it with a Bootstrap build that already includes the grid.

</div>

## Light and dark mode

The stylesheet defines its colors for both `data-bs-theme="light"` and `data-bs-theme="dark"`. Use the theme button in the corner of this page to switch, and watch the sidebar, callouts and code blocks follow.

## Files

- [`bootstrap-docs.css`](../bootstrap-docs/bootstrap-docs.css) — documentation and grid styles
- [`README.md`](../bootstrap-docs/README.md) — resource notes
- [`modules/bootstrap-docs.md`](bootstrap-docs.md) — the Markdown source of this page
