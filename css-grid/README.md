# Grid
This addon contains two CSS files, which may be used together or separately to add additional functionality to a bootstrap project: `CSS-grid.css` and `semantic-grid.css`. This project is in no way affiliated with Bootstrap, which can be found at `https://github.com/twbs/bootstrap` or `https://getbootstrap.com`.

## CSS Grid (`bs-grid.css`)

This CSS file provides a responsive grid system inspired by Bootstrap's grid, but implemented purely with CSS Grid and custom properties (CSS variables). It enables you to quickly create flexible, responsive layouts with simple utility classes.

### Features

- **12-column grid** by default, configurable via CSS variables.
- **Responsive breakpoints** for `sm`, `md`, `lg`, `xl`, and `xxl` (matching Bootstrap's breakpoints).
- **Easy column spanning**: Use classes like `.g-col-6` to span 6 columns.
- **Column start utilities**: Use `.g-start-3` to start an element at column 3.
- **Gap customization** via the `--bs-gap` variable.
- **No dependencies**—just pure CSS.

### Usage

1. **Include the CSS file** in your HTML:
    ```html
    <!-- Link Bootstrap -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.7/css/bootstrap.min.css" integrity="sha512-fw7f+TcMjTb7bpbLJZlP8g2Y4XcCyFZW8uy8HsRZsH/SwbMw0plKHFHr99DN3l04VsYNwvzicUX/6qurvIxbxw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- And then link this file -->
    <link rel="stylesheet" href="bs-grid.css">
    ```

2. **Wrap your grid items with `.grid`:**
    ```html
    <div class="grid">
      <div class="g-col-6">Column 1 (spans 6)</div>
      <div class="g-col-6">Column 2 (spans 6)</div>
    </div>
    ```

3. **Responsive columns:**
    Use breakpoint classes to change column spans at different screen sizes.
    ```html
    <div class="grid">
      <div class="g-col-12 g-col-md-6 g-col-lg-4">Responsive Column</div>
      <div class="g-col-12 g-col-md-6 g-col-lg-8">Responsive Column</div>
    </div>
    ```

4. **Customizing rows, columns, and gap:**
    ```css
    .grid {
      --bs-rows: 2;      /* Number of rows */
      --bs-columns: 6;   /* Number of columns */
      --bs-gap: 2rem;    /* Grid gap */
    }
    ```

5. **Column starts:**
    ```html
    <div class="grid">
      <div class="g-col-4 g-start-3">Starts at column 3, spans 4 columns</div>
    </div>
    ```

### Class List Reference

- `.g-col-[N]`: Span `N` columns (1-12).
- `.g-start-[N]`: Start at column `N` (1-11).
- Responsive variants:  
  `.g-col-sm-[N]`, `.g-col-md-[N]`, `.g-col-lg-[N]`, `.g-col-xl-[N]`, `.g-col-xxl-[N]`  
  `.g-start-sm-[N]`, `.g-start-md-[N]`, `.g-start-lg-[N]`, `.g-start-xl-[N]`, `.g-start-xxl-[N]`

### Example

```html
<div class="grid">
  <div class="g-col-12 g-col-md-8">Main Content</div>
  <div class="g-col-12 g-col-md-4">Sidebar</div>
</div>
```

### Customization

You can adjust the number of columns, rows, and gap by overriding the CSS variables on the `.grid` container.

```css
.grid {
  --bs-columns: 16;
  --bs-rows: 1;
  --bs-gap: 1rem;
}
```

## Bootstrap Semantic Grid Addon (`semantic-grid.css`)

This addon provides a simple, semantic approach to creating a full-page layout using CSS Grid. It is designed to complement Bootstrap's existing utility-first grid classes (.g-col-*) by focusing on the overall page structure using HTML5 semantic tags like `<header>`, `<main>`, and `<footer>`.

### Features

- **Semantic-First Layout: Uses grid-area to map semantic HTML tags to specific areas of the page.
- **Responsive Design: Automatically stacks content on smaller screens for mobile-first compatibility.
- **Easy Integration: A single CSS file that can be dropped into any static Bootstrap project.
- **"Holy Grail" Layout: The default configuration provides a classic and flexible two-column layout with a header, navigation, and footer.


    ```





<!-- Your semantic grid addon CSS -->
<link rel="stylesheet" href="path/to/bootstrap-semantic-grid.css">

Step 2: Structure Your HTML
Wrap your main page content in a parent container with the .grid-container class. Then, place your semantic HTML tags inside this container.

<div class="grid-container">
    <header>
        <!-- Your header content -->
        <h1>Site Title</h1>
    </header>

    <nav>
        <!-- Your navigation links -->
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
    </nav>

    <main>
        <!-- Main content of the page -->
        <p>This is the main content area.</p>
    </main>

    <aside>
        <!-- Sidebar content -->
        <p>This is the sidebar area.</p>
    </aside>

    <footer>
        <!-- Footer content -->
        <p>&copy; 2024 Your Company</p>
    </footer>
</div>

That's it! The CSS in the addon will automatically position these elements to create the responsive layout.

Customization
You can easily modify the layout to fit your needs by editing the CSS. For example, to change the column widths or the arrangement of the grid areas on desktop, you would edit the .grid-container block. You can also add more grid-area properties to new semantic tags if needed.
