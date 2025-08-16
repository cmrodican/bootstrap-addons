# bootstrap-addons
A collection of projects to add new functionality and dynamic features to static Bootstrap websites.

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



## TV Navigation Framework
A lightweight framework built to bring TV-style, remote-control navigation to websites using [Bootstrap](https://getbootstrap.com/). This project is part of the [bootstrap-addons](https://github.com/cmrodican/bootstrap-addons) collection, and it aims to make static Bootstrap sites more dynamic and accessible on smart TVs and set-top boxes.

## Enhanced Bootstrap Table
A powerful, feature-rich enhancement for Bootstrap 5.3 tables that adds advanced searching, filtering, sorting, and column resizing capabilities with a clean, intuitive interface.

## 🛠️ Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

The Bootstrap Addons project is licensed under the terms of the [GNU General PublicLicense v2.0.  
See the [LICENSE file](https://github.com/cmrodican/bootstrap-addons/blob/main/license.txt) for details.



## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests on GitHub.

## 📞 Support

For questions or issues, please create an issue on the GitHub repository.

---

**Happy coding! 🚀**
