# Enhanced Bootstrap Table

A Bootstrap 5.3 table enhancement that adds richer filtering, sorting, column resizing, and data-processing features in a lightweight JavaScript/CSS package.

## Highlights

- advanced column filtering
- smart sorting with data-aware behavior
- draggable column resizing
- JSON-driven table population
- responsive Bootstrap 5 styling
- zero-build dependency for static sites

## Files

- `enhancedTable.css` — styling for the extended table UI
- `enhancedTable.js` — main interactive behavior
- `JSONforEnhancedTable.js` — optional JSON data loading helper
- `readme.md` — extended reference material and usage guide

## Documentation

For the full usage guide, configuration reference, and examples, see [readme.md](./readme.md).

## Quick start

```html
<table class="table table-striped table-hover resizable-table" id="my-table">
  <thead class="table-dark">
    <tr>
      <th data-column="name" data-type="text">Name</th>
      <th data-column="salary" data-type="currency">Salary</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jane Doe</td>
      <td>$60,000</td>
    </tr>
  </tbody>
</table>

<script src="enhancedTable.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    const tableEnhancer = new BootstrapTableEnhancer();
    tableEnhancer.enhance('my-table');
  });
</script>
```
