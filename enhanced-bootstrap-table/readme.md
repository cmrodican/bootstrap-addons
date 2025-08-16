# Enhanced Bootstrap Table

A powerful, feature-rich enhancement for Bootstrap 5.3 tables that adds advanced searching, filtering, sorting, and column resizing capabilities with a clean, intuitive interface.

## 🚀 Features

- ✅ **Advanced Filtering**: Dropdown menus with checkbox filters and search functionality
- ✅ **Smart Sorting**: Data-type aware sorting (text, numbers, dates, currency, etc.)
- ✅ **Column Resizing**: Drag to resize table columns
- ✅ **Data Type Support**: 10 different data types with automatic formatting
- ✅ **JSON Data Population**: Easy integration with JSON data sources
- ✅ **Responsive Design**: Mobile-friendly with Bootstrap 5.3
- ✅ **Zero Dependencies**: Only requires Bootstrap 5.3 and Bootstrap Icons

## 📦 Installation

### CDN Links (Recommended)

Add these CDN links to your HTML file:

```html
<!-- Bootstrap 5.3 CSS -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap Icons -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" rel="stylesheet">

<!-- Enhanced Table CSS -->
<link href="https://cdn.jsdelivr.net/gh/cmrodican/bootstrap-addons/enhanced-bootstrap-table/enhancedTable.css" rel="stylesheet">

<!-- Bootstrap 5.3 JS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>

<!-- Enhanced Table JS -->
<script src="https://cdn.jsdelivr.net/gh/cmrodican/bootstrap-addons/enhanced-bootstrap-table/enhancedTable.js"></script>

<!-- JSON Data Populator (Optional) -->
<script src="https://cdn.jsdelivr.net/gh/cmrodican/bootstrap-addons/enhanced-bootstrap-table/JSONforEnhancedTable.js"></script>
```

### Manual Installation

1. Download the files from the GitHub repository
2. Include the CSS and JS files in your project
3. Add the script tags to your HTML

## 🎯 Quick Start

### Basic HTML Structure

```html
<table class="table table-striped table-hover resizable-table" id="my-table">
    <thead class="table-dark">
        <tr>
            <th scope="col" data-column="name" data-type="text">Name</th>
            <th scope="col" data-column="email" data-type="email-address">Email</th>
            <th scope="col" data-column="salary" data-type="currency">Salary</th>
            <th scope="col" data-column="joinDate" data-type="date">Join Date</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John Smith</td>
            <td>john@example.com</td>
            <td>$75,000</td>
            <td>2022-01-15</td>
        </tr>
        <!-- More rows... -->
    </tbody>
</table>
```

### JavaScript Initialization

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
    const tableEnhancer = new BootstrapTableEnhancer();
    tableEnhancer.enhance('my-table');
});
</script>
```

## 📋 Configuration

### Table Classes

| Class | Description |
|-------|-------------|
| `table` | Required Bootstrap table class |
| `table-striped` | Adds zebra striping to table rows |
| `table-hover` | Enables hover effect on table rows |
| `resizable-table` | Enables column resizing functionality |

### Table Attributes

| Attribute | Description |
|-----------|-------------|
| `data-resizable` | Alternative way to enable column resizing |

### Column Configuration

#### Required Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-column` | Unique identifier for the column | `data-column="firstName"` |

#### Optional Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-type` | Data type for smart sorting and formatting | `data-type="currency"` |
| `data-custom-filters` | Comma-separated list of custom filter options | `data-custom-filters="Active,Pending,Inactive"` |

## 🎛️ Data Types

The enhanced table supports 10 different data types with automatic sorting and formatting:

### Available Data Types

| Data Type | Description | Sort Labels | Icon |
|-----------|-------------|-------------|------|
| `default` | Basic text sorting | A to Z / Z to A | None |
| `text` | Standard text | A to Z / Z to A | 📝 |
| `whole-number` | Integer numbers | Smallest to Largest / Largest to Smallest | 🔢 |
| `decimal` | Decimal numbers | Smallest to Largest / Largest to Smallest | 🧮 |
| `currency` | Money values | Lowest to Highest / Highest to Lowest | 💲 |
| `date` | Date values | Oldest to Newest / Newest to Oldest | 📅 |
| `time` | Time values | Earliest to Latest / Latest to Earliest | 🕐 |
| `true-false` | Boolean values | False to True / True to False | ☑️ |
| `phone-number` | Phone numbers | A to Z / Z to A | 📞 |
| `email-address` | Email addresses | A to Z / Z to A | ✉️ |

### Data Type Examples

```html
<!-- Text column -->
<th data-column="name" data-type="text">Name</th>

<!-- Currency column -->
<th data-column="salary" data-type="currency">Salary</th>

<!-- Date column -->
<th data-column="joinDate" data-type="date">Join Date</th>

<!-- Boolean column -->
<th data-column="isActive" data-type="true-false">Active</th>

<!-- Phone number column -->
<th data-column="phone" data-type="phone-number">Phone</th>

<!-- Email column -->
<th data-column="email" data-type="email-address">Email</th>

<!-- Custom filters -->
<th data-column="department" data-type="text" data-custom-filters="Engineering,Marketing,Sales,HR">Department</th>
```

## 🔧 JavaScript API

### Basic Enhancement

```javascript
// Initialize table enhancer
const tableEnhancer = new BootstrapTableEnhancer();

// Enhance a specific table
tableEnhancer.enhance('table-id');
```

### Clear Filters

```javascript
// Clear all filters for a table
tableEnhancer.clearAllFilters('table-id');
```

## 📊 JSON Data Population

### Basic Usage

```javascript
// Sample JSON data
const employees = [
    {
        name: "John Smith",
        email: "john@example.com",
        department: "Engineering",
        salary: 75000,
        joinDate: "2022-01-15",
        isActive: true
    },
    {
        name: "Jane Doe", 
        email: "jane@example.com",
        department: "Marketing",
        salary: 65000,
        joinDate: "2021-08-22",
        isActive: true
    }
];

// Populate table with JSON data
tableDataPopulator.populateTable('my-table', employees);
```

### Advanced Configuration

```javascript
tableDataPopulator.populateTable('my-table', employees, {
    clearExistingData: true,
    autoCreateColumns: true,
    badgeColumn: 'status',
    badgeMapping: {
        'Active': 'bg-success',
        'Pending': 'bg-warning',
        'Inactive': 'bg-danger'
    },
    linkColumns: ['email', 'website'],
    imageColumns: ['avatar'],
    customRenderers: {
        'salary': (value) => `<strong>$${value.toLocaleString()}</strong>`
    }
});
```

### JSON Populator Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `clearExistingData` | Boolean | Clear existing table data before populating | `true` |
| `autoCreateColumns` | Boolean | Auto-create table headers from JSON keys | `false` |
| `badgeColumn` | String | Column to render as Bootstrap badges | `null` |
| `badgeMapping` | Object | Mapping of values to badge CSS classes | `{}` |
| `linkColumns` | Array | Columns to render as clickable links | `[]` |
| `imageColumns` | Array | Columns to render as images | `[]` |
| `customRenderers` | Object | Custom rendering functions for specific columns | `{}` |

### Load from Remote URL

```javascript
// Load data from API endpoint
await tableDataPopulator.loadFromUrl('my-table', '/api/employees', {
    badgeColumn: 'status',
    badgeMapping: {
        'Active': 'bg-success',
        'Inactive': 'bg-danger'
    }
});
```

### Dynamic Data Updates

```javascript
// Update specific row
tableDataPopulator.updateRow('my-table', 0, { salary: 80000 });

// Add new rows
const newEmployees = [{ name: "Bob Johnson", email: "bob@example.com" }];
tableDataPopulator.addRows('my-table', newEmployees);
```

## 💅 Styling and Customization

### Custom Badge Styles

```html
<!-- In your table data -->
<td><span class="badge bg-success">Active</span></td>
<td><span class="badge bg-warning">Pending</span></td>
<td><span class="badge bg-danger">Inactive</span></td>
```

### Custom CSS Classes

```css
/* Custom filter badge styling */
.filter-badge {
    font-size: 0.75em;
    margin-left: 5px;
}

/* Custom dropdown menu styling */
.dropdown-menu {
    min-width: 280px;
}

/* Custom resize handle styling */
.resize-handle:hover {
    border-right-color: #your-color !important;
}
```

## 🎨 Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Bootstrap Table Example</title>
    
    <!-- Bootstrap 5.3 CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Bootstrap Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" rel="stylesheet">
    
    <!-- Enhanced Table CSS -->
    <link href="https://cdn.jsdelivr.net/gh/cmrodican/bootstrap-addons/enhanced-bootstrap-table/enhancedTable.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <h1 class="mb-4">Employee Directory</h1>
                
                <div class="table-container">
                    <table class="table table-striped table-hover resizable-table" id="employee-table">
                        <thead class="table-dark">
                            <tr>
                                <th scope="col" data-column="name" data-type="text">Name</th>
                                <th scope="col" data-column="email" data-type="email-address">Email</th>
                                <th scope="col" data-column="department" data-type="text" data-custom-filters="Engineering,Marketing,Sales,HR,Finance">Department</th>
                                <th scope="col" data-column="salary" data-type="currency">Salary</th>
                                <th scope="col" data-column="status" data-type="text" data-custom-filters="Active,Pending,Inactive">Status</th>
                                <th scope="col" data-column="joinDate" data-type="date">Join Date</th>
                                <th scope="col" data-column="isManager" data-type="true-false">Manager</th>
                                <th scope="col" data-column="phone" data-type="phone-number">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Data will be populated via JSON -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5.3 JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    
    <!-- Enhanced Table JS -->
    <script src="https://cdn.jsdelivr.net/gh/cmrodican/bootstrap-addons/enhanced-bootstrap-table/enhancedTable.js"></script>
    
    <!-- JSON Data Populator -->
    <script src="https://cdn.jsdelivr.net/gh/cmrodican/bootstrap-addons/enhanced-bootstrap-table/JSONforEnhancedTable.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize table enhancer
            const tableEnhancer = new BootstrapTableEnhancer();
            tableEnhancer.enhance('employee-table');

            // Sample data
            const employees = [
                {
                    name: "John Smith",
                    email: "john.smith@example.com",
                    department: "Engineering",
                    salary: 85000,
                    status: "Active",
                    joinDate: "2022-01-15",
                    isManager: true,
                    phone: "5551234567"
                },
                {
                    name: "Sarah Johnson",
                    email: "sarah.johnson@example.com",
                    department: "Marketing",
                    salary: 65000,
                    status: "Active",
                    joinDate: "2021-11-03",
                    isManager: false,
                    phone: "5552345678"
                }
            ];

            // Populate table with data
            tableDataPopulator.populateTable('employee-table', employees, {
                badgeColumn: 'status',
                badgeMapping: {
                    'Active': 'bg-success',
                    'Pending': 'bg-warning',
                    'Inactive': 'bg-danger'
                }
            });
        });
    </script>
</body>
</html>
```

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
