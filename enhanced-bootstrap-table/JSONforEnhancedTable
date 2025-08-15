/*!
 * JSON Plugin for Enhanced Bootstrap Table Addon JS v1.0.0
 * https://github.com/cmrodican/bootstrap-addons/enhanced-bootstrap-table
 * Licensed under GNU GPL 2.0 License
 * Compatible with Bootstrap 5.3+ and Bootswatch themes
 */

        // Bootstrap Table JSON Data Populator Addon
        class BootstrapTableDataPopulator {
            constructor() {
                this.dataFormatters = {
                    'currency': (value) => {
                        if (typeof value === 'number') {
                            return new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                            }).format(value);
                        }
                        return value;
                    },
                    'date': (value) => {
                        if (value && (typeof value === 'string' || value instanceof Date)) {
                            const date = new Date(value);
                            return date.toISOString().split('T')[0]; // YYYY-MM-DD format
                        }
                        return value;
                    },
                    'time': (value) => {
                        if (value && typeof value === 'string') {
                            const date = new Date(`2000-01-01 ${value}`);
                            if (!isNaN(date.getTime())) {
                                return date.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                });
                            }
                        }
                        return value;
                    },
                    'true-false': (value) => {
                        if (typeof value === 'boolean') {
                            return value ? 'Yes' : 'No';
                        }
                        if (typeof value === 'string') {
                            const normalized = value.toLowerCase().trim();
                            if (['true', '1', 'yes', 'on', 'enabled'].includes(normalized)) {
                                return 'Yes';
                            } else if (['false', '0', 'no', 'off', 'disabled'].includes(normalized)) {
                                return 'No';
                            }
                        }
                        return value;
                    },
                    'phone-number': (value) => {
                        if (typeof value === 'string' && value.replace(/\D/g, '').length === 10) {
                            const cleaned = value.replace(/\D/g, '');
                            return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
                        }
                        return value;
                    },
                    'whole-number': (value) => {
                        if (typeof value === 'number') {
                            return Math.round(value).toLocaleString();
                        }
                        return value;
                    },
                    'decimal': (value) => {
                        if (typeof value === 'number') {
                            return value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                        return value;
                    }
                };
            }

            // Populate table with JSON data
            populateTable(tableId, jsonData, options = {}) {
                const table = document.getElementById(tableId);
                if (!table) {
                    console.error(`Table with ID '${tableId}' not found`);
                    return;
                }

                const config = {
                    clearExistingData: true,
                    autoCreateColumns: false,
                    badgeColumn: null, // Column to render as badges
                    badgeMapping: {}, // Value to badge class mapping
                    linkColumns: [], // Columns to render as links
                    imageColumns: [], // Columns to render as images
                    customRenderers: {}, // Custom cell renderers
                    ...options
                };

                // Clear existing data if specified
                if (config.clearExistingData) {
                    const tbody = table.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = '';
                    }
                }

                // Auto-create columns if specified
                if (config.autoCreateColumns && jsonData.length > 0) {
                    this.createColumnsFromData(table, jsonData[0], options);
                }

                // Get column configuration
                const headers = table.querySelectorAll('thead th[data-column]');
                const columnConfig = this.getColumnConfig(headers);

                // Populate rows
                this.populateRows(table, jsonData, columnConfig, config);

                // Re-enhance table if enhancer is available
                if (window.tableEnhancer && typeof window.tableEnhancer.enhance === 'function') {
                    // Update the enhancer's data
                    const enhancerConfig = window.tableEnhancer.tables.get(tableId);
                    if (enhancerConfig) {
                        enhancerConfig.rows = Array.from(table.querySelectorAll('tbody tr'));
                        enhancerConfig.originalRows = Array.from(table.querySelectorAll('tbody tr'));
                        enhancerConfig.filters = {};
                        enhancerConfig.sortConfig = { column: null, direction: 'asc' };
                    }
                }

                return this;
            }

            // Create columns from JSON data
            createColumnsFromData(table, sampleRow, options = {}) {
                const thead = table.querySelector('thead');
                const tbody = table.querySelector('tbody');
                
                if (!thead) {
                    console.error('Table must have a thead element');
                    return;
                }

                // Clear existing headers
                thead.innerHTML = '';

                // Create header row
                const headerRow = document.createElement('tr');
                
                Object.keys(sampleRow).forEach(key => {
                    const th = document.createElement('th');
                    th.setAttribute('scope', 'col');
                    th.setAttribute('data-column', key);
                    
                    // Auto-detect data type
                    const dataType = this.detectDataType(sampleRow[key], key);
                    th.setAttribute('data-type', dataType);
                    
                    // Set custom filters if provided
                    if (options.customFilters && options.customFilters[key]) {
                        th.setAttribute('data-custom-filters', options.customFilters[key]);
                    }
                    
                    // Format column header
                    const headerText = this.formatHeaderText(key);
                    th.textContent = headerText;
                    
                    headerRow.appendChild(th);
                });

                thead.appendChild(headerRow);

                // Clear tbody
                if (tbody) {
                    tbody.innerHTML = '';
                }
            }

            // Detect data type from value and column name
            detectDataType(value, columnName) {
                const lowerColumnName = columnName.toLowerCase();
                
                // Check column name patterns first
                if (lowerColumnName.includes('email')) return 'email-address';
                if (lowerColumnName.includes('phone')) return 'phone-number';
                if (lowerColumnName.includes('date')) return 'date';
                if (lowerColumnName.includes('time')) return 'time';
                if (lowerColumnName.includes('currency') || lowerColumnName.includes('salary') || lowerColumnName.includes('price')) return 'currency';
                if (lowerColumnName.includes('active') || lowerColumnName.includes('enabled') || lowerColumnName.includes('manager')) return 'true-false';
                
                // Check value patterns
                if (typeof value === 'boolean') return 'true-false';
                if (typeof value === 'number') {
                    return Number.isInteger(value) ? 'whole-number' : 'decimal';
                }
                
                if (typeof value === 'string') {
                    // Email pattern
                    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email-address';
                    
                    // Phone pattern
                    if (/^\(?[\d\s\-\(\)]{10,}$/.test(value)) return 'phone-number';
                    
                    // Date pattern
                    if (/^\d{4}-\d{2}-\d{2}$/.test(value) || !isNaN(Date.parse(value))) return 'date';
                    
                    // Currency pattern
                    if (/^\$[\d,]+\.?\d*$/.test(value)) return 'currency';
                    
                    // Boolean-like values
                    if (['yes', 'no', 'true', 'false', 'active', 'inactive'].includes(value.toLowerCase())) {
                        return 'true-false';
                    }
                }
                
                return 'text';
            }

            // Format header text from camelCase or snake_case
            formatHeaderText(text) {
                return text
                    .replace(/([A-Z])/g, ' $1') // Add space before capitals
                    .replace(/_/g, ' ') // Replace underscores with spaces
                    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
                    .trim();
            }

            // Get column configuration from headers
            getColumnConfig(headers) {
                const config = {};
                headers.forEach(header => {
                    const column = header.getAttribute('data-column');
                    const dataType = header.getAttribute('data-type') || 'text';
                    config[column] = { dataType, element: header };
                });
                return config;
            }

            // Populate table rows
            populateRows(table, data, columnConfig, config) {
                const tbody = table.querySelector('tbody');
                if (!tbody) {
                    console.error('Table must have a tbody element');
                    return;
                }

                data.forEach(rowData => {
                    const row = document.createElement('tr');
                    
                    Object.keys(columnConfig).forEach(column => {
                        const cell = document.createElement('td');
                        const value = rowData[column];
                        const { dataType } = columnConfig[column];
                        
                        // Apply custom renderer if available
                        if (config.customRenderers[column]) {
                            cell.innerHTML = config.customRenderers[column](value, rowData);
                        }
                        // Handle badge columns
                        else if (config.badgeColumn === column && config.badgeMapping[value]) {
                            const badge = document.createElement('span');
                            badge.className = `badge ${config.badgeMapping[value]}`;
                            badge.textContent = value;
                            cell.appendChild(badge);
                        }
                        // Handle link columns
                        else if (config.linkColumns.includes(column) && value) {
                            const link = document.createElement('a');
                            link.href = typeof value === 'object' ? value.url : value;
                            link.textContent = typeof value === 'object' ? value.text : value;
                            link.target = '_blank';
                            cell.appendChild(link);
                        }
                        // Handle image columns
                        else if (config.imageColumns.includes(column) && value) {
                            const img = document.createElement('img');
                            img.src = typeof value === 'object' ? value.src : value;
                            img.alt = typeof value === 'object' ? value.alt : 'Image';
                            img.style.maxWidth = '50px';
                            img.style.maxHeight = '50px';
                            img.className = 'img-thumbnail';
                            cell.appendChild(img);
                        }
                        // Handle regular data with formatting
                        else {
                            const formattedValue = this.formatCellValue(value, dataType);
                            cell.textContent = formattedValue;
                        }
                        
                        row.appendChild(cell);
                    });
                    
                    tbody.appendChild(row);
                });
            }

            // Format cell value based on data type
            formatCellValue(value, dataType) {
                if (value === null || value === undefined) {
                    return '';
                }

                const formatter = this.dataFormatters[dataType];
                return formatter ? formatter(value) : value.toString();
            }

            // Load data from URL
            async loadFromUrl(tableId, url, options = {}) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return this.populateTable(tableId, data, options);
                } catch (error) {
                    console.error('Error loading data from URL:', error);
                    throw error;
                }
            }

            // Add helper method to update specific row
            updateRow(tableId, rowIndex, newData) {
                const table = document.getElementById(tableId);
                if (!table) return;

                const tbody = table.querySelector('tbody');
                const rows = tbody.querySelectorAll('tr');
                
                if (rowIndex >= 0 && rowIndex < rows.length) {
                    const headers = table.querySelectorAll('thead th[data-column]');
                    const columnConfig = this.getColumnConfig(headers);
                    const row = rows[rowIndex];
                    
                    const cells = row.querySelectorAll('td');
                    Object.keys(columnConfig).forEach((column, index) => {
                        if (newData.hasOwnProperty(column) && cells[index]) {
                            const value = newData[column];
                            const { dataType } = columnConfig[column];
                            const formattedValue = this.formatCellValue(value, dataType);
                            cells[index].textContent = formattedValue;
                        }
                    });
                }
            }

            // Add helper method to append new rows
            addRows(tableId, newData, options = {}) {
                const table = document.getElementById(tableId);
                if (!table) return;

                const headers = table.querySelectorAll('thead th[data-column]');
                const columnConfig = this.getColumnConfig(headers);
                
                const config = {
                    badgeColumn: null,
                    badgeMapping: {},
                    linkColumns: [],
                    imageColumns: [],
                    customRenderers: {},
                    ...options
                };

                this.populateRows(table, newData, columnConfig, config);

                // Update enhancer if available
                if (window.tableEnhancer && typeof window.tableEnhancer.enhance === 'function') {
                    const enhancerConfig = window.tableEnhancer.tables.get(tableId);
                    if (enhancerConfig) {
                        enhancerConfig.rows = Array.from(table.querySelectorAll('tbody tr'));
                        enhancerConfig.originalRows = Array.from(table.querySelectorAll('tbody tr'));
                    }
                }
            }
        }

        // Make the data populator globally available
        window.tableDataPopulator = new BootstrapTableDataPopulator();

        // Example usage after DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Example JSON data
            const sampleData = [
                {
                    name: "Alice Johnson",
                    email: "alice@example.com",
                    department: "Engineering",
                    salary: 85000,
                    status: "Active",
                    joinDate: "2021-03-15",
                    isManager: true,
                    phone: "5551234567"
                },
                {
                    name: "Bob Smith",
                    email: "bob@example.com", 
                    department: "Marketing",
                    salary: 68000,
                    status: "Active",
                    joinDate: "2022-07-22",
                    isManager: false,
                    phone: "5552345678"
                },
                {
                    name: "Carol Davis",
                    email: "carol@example.com",
                    department: "Sales", 
                    salary: 72000,
                    status: "Pending",
                    joinDate: "2023-01-10",
                    isManager: false,
                    phone: "5553456789"
                }
            ];

            // Example of how to use the data populator
            // Uncomment the line below to replace the existing table data with JSON data
            // tableDataPopulator.populateTable('enhanced-table', sampleData, {
            //     badgeColumn: 'status',
            //     badgeMapping: {
            //         'Active': 'bg-success',
            //         'Pending': 'bg-warning', 
            //         'Inactive': 'bg-danger'
            //     }
            // });
        });
    
