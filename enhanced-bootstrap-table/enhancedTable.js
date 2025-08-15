/*!
 * Enhanced Bootstrap Table Addon JS v1.0.0
 * https://github.com/cmrodican/bootstrap-addons/enhanced-bootstrap-table
 * Licensed under GNU GPL 2.0 License
 * Compatible with Bootstrap 5.3+ and Bootswatch themes
 */
        class BootstrapTableEnhancer {
            constructor() {
                this.tables = new Map();
                this.dropdowns = new Map();
                this.pendingChanges = new Map();
            }

            // Initialize table with enhanced features
            enhance(tableId) {
                const table = document.getElementById(tableId);
                if (!table) {
                    console.error(`Table with ID '${tableId}' not found`);
                    return;
                }

                const config = {
                    table: table,
                    headers: table.querySelectorAll('thead th[data-column]'),
                    tbody: table.querySelector('tbody'),
                    rows: Array.from(table.querySelectorAll('tbody tr')),
                    originalRows: Array.from(table.querySelectorAll('tbody tr')),
                    filters: {},
                    sortConfig: { column: null, direction: 'asc' }
                };

                this.tables.set(tableId, config);
                this.pendingChanges.set(tableId, {});
                this.initializeHeaders(tableId);
                this.initializeResizing(tableId);
                return this;
            }

            // Initialize headers with proper structure and icons
            initializeHeaders(tableId) {
                const config = this.tables.get(tableId);
                
                config.headers.forEach(header => {
                    const column = header.getAttribute('data-column');
                    const dataType = header.getAttribute('data-type') || 'default';
                    const originalText = header.textContent.trim();
                    
                    // Clear existing content
                    header.innerHTML = '';
                    
                    // Create header structure
                    const headerContent = document.createElement('div');
                    headerContent.className = 'table-header-content';
                    
                    const headerText = document.createElement('div');
                    headerText.className = 'table-header-text';
                    headerText.textContent = originalText;
                    
                    const headerIcons = document.createElement('div');
                    headerIcons.className = 'table-header-icons';
                    
                    // Add data type icon
                    const typeIcon = this.getDataTypeIcon(dataType);
                    if (typeIcon) {
                        const typeIconElement = document.createElement('i');
                        typeIconElement.className = `bi ${typeIcon}`;
                        typeIconElement.style.marginRight = '4px';
                        typeIconElement.style.opacity = '0.7';
                        headerIcons.appendChild(typeIconElement);
                    }
                    
                    // Add sort indicator
                    const sortIndicator = document.createElement('i');
                    sortIndicator.className = 'bi bi-chevron-down sort-indicator';
                    headerIcons.appendChild(sortIndicator);
                    
                    // Add menu button
                    const menuBtn = document.createElement('button');
                    menuBtn.className = 'table-header-menu-btn';
                    menuBtn.innerHTML = '<i class="bi bi-arrow-down-short"></i>';
                    menuBtn.setAttribute('type', 'button');
                    headerIcons.appendChild(menuBtn);
                    
                    headerContent.appendChild(headerText);
                    headerContent.appendChild(headerIcons);
                    header.appendChild(headerContent);
                    
                    // Create dropdown
                    this.createDropdown(tableId, header, column);
                    
                    // Add click event to menu button
                    menuBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleDropdown(tableId, column);
                    });
                });

                // Close dropdowns when clicking outside
                document.addEventListener('click', () => {
                    this.closeAllDropdowns();
                });
            }

            // Initialize column resizing
            initializeResizing(tableId) {
                const config = this.tables.get(tableId);
                const table = config.table;
                
                // Check if resizing is enabled
                if (!table.classList.contains('resizable-table') && !table.hasAttribute('data-resizable')) {
                    return;
                }
                
                config.headers.forEach((header, index) => {
                    // Skip last column
                    if (index === config.headers.length - 1) return;
                    
                    const resizeHandle = document.createElement('div');
                    resizeHandle.className = 'resize-handle';
                    header.appendChild(resizeHandle);
                    
                    let isResizing = false;
                    let startX = 0;
                    let startWidth = 0;
                    
                    resizeHandle.addEventListener('mousedown', (e) => {
                        isResizing = true;
                        startX = e.clientX;
                        startWidth = header.offsetWidth;
                        resizeHandle.classList.add('resizing');
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                        
                        e.preventDefault();
                    });
                    
                    const handleMouseMove = (e) => {
                        if (!isResizing) return;
                        
                        const diff = e.clientX - startX;
                        const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
                        header.style.width = newWidth + 'px';
                        header.style.minWidth = newWidth + 'px';
                    };
                    
                    const handleMouseUp = () => {
                        isResizing = false;
                        resizeHandle.classList.remove('resizing');
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                    };
                });
            }

            // Get data type icon
            getDataTypeIcon(dataType) {
                const iconMap = {
                    'text': 'bi-fonts',
                    'whole-number': 'bi-123',
                    'decimal': 'bi-calculator',
                    'currency': 'bi-currency-dollar',
                    'date': 'bi-calendar3',
                    'time': 'bi-clock',
                    'true-false': 'bi-check2-square',
                    'phone-number': 'bi-telephone',
                    'email-address': 'bi-envelope',
                    'default': null
                };
                return iconMap[dataType] || null;
            }

            // Create dropdown menu for column
            createDropdown(tableId, header, column) {
                const config = this.tables.get(tableId);
                const dataType = header.getAttribute('data-type') || 'default';
                const customFilters = header.getAttribute('data-custom-filters');
                
                // Create dropdown container
                const dropdownDiv = document.createElement('div');
                dropdownDiv.className = 'dropdown';
                dropdownDiv.style.position = 'absolute';
                dropdownDiv.style.top = '100%';
                dropdownDiv.style.left = '0';
                dropdownDiv.style.zIndex = '9999';
                
                // Get sort button labels and icons based on data type
                const sortConfig = this.getSortConfig(dataType);
                
                // Create dropdown menu
                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'dropdown-menu shadow';
                dropdownMenu.innerHTML = `
                    <div class="px-3 py-2">
                        <h6 class="dropdown-header px-0 mb-3">${this.getColumnTitle(header)}</h6>
                        
                        <!-- Sort Section -->
                        <div class="dropdown-section">
                            <div class="d-grid gap-2">
                                <button type="button" class="btn btn-outline-primary btn-sm sort-btn" data-action="sort" data-direction="asc">
                                    <i class="bi ${sortConfig.ascIcon}"></i> ${sortConfig.ascLabel}
                                </button>
                                <button type="button" class="btn btn-outline-primary btn-sm sort-btn" data-action="sort" data-direction="desc">
                                    <i class="bi ${sortConfig.descIcon}"></i> ${sortConfig.descLabel}
                                </button>
                            </div>
                        </div>
                        
                        <!-- Search Section -->
                        <div class="dropdown-section">
                            <label class="form-label small fw-semibold mb-2">Search</label>
                            <input type="text" class="form-control form-control-sm filter-input" 
                                   placeholder="Search ${this.getColumnTitle(header).toLowerCase()}..." 
                                   data-action="search">
                        </div>
                        
                        <!-- Filter Section -->
                        <div class="dropdown-section">
                            <label class="form-label small fw-semibold mb-2">Filter</label>
                            <div class="checkbox-filters">
                                <!-- Checkbox filters will be populated here -->
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="d-flex justify-content-end gap-2">
                            <button type="button" class="btn btn-outline-secondary btn-sm" data-action="cancel">
                                Cancel
                            </button>
                            <button type="button" class="btn btn-primary btn-sm" data-action="ok">
                                OK
                            </button>
                        </div>
                    </div>
                `;
                
                // Position dropdown
                dropdownDiv.appendChild(dropdownMenu);
                header.appendChild(dropdownDiv);
                
                // Store dropdown reference
                if (!this.dropdowns.has(tableId)) {
                    this.dropdowns.set(tableId, {});
                }
                this.dropdowns.get(tableId)[column] = dropdownMenu;
                
                // Populate filter options
                this.populateFilterOptions(tableId, column, customFilters);
                
                // Add event listeners
                this.addDropdownEventListeners(tableId, column, dropdownMenu);
            }

            // Get sort configuration based on data type
            getSortConfig(dataType) {
                const configs = {
                    'default': {
                        ascLabel: 'A to Z',
                        descLabel: 'Z to A',
                        ascIcon: 'bi-sort-alpha-down',
                        descIcon: 'bi-sort-alpha-up'
                    },
                    'text': {
                        ascLabel: 'A to Z',
                        descLabel: 'Z to A',
                        ascIcon: 'bi-sort-alpha-down',
                        descIcon: 'bi-sort-alpha-up'
                    },
                    'whole-number': {
                        ascLabel: 'Smallest to Largest',
                        descLabel: 'Largest to Smallest',
                        ascIcon: 'bi-sort-numeric-down',
                        descIcon: 'bi-sort-numeric-up'
                    },
                    'decimal': {
                        ascLabel: 'Smallest to Largest',
                        descLabel: 'Largest to Smallest',
                        ascIcon: 'bi-sort-numeric-down',
                        descIcon: 'bi-sort-numeric-up'
                    },
                    'currency': {
                        ascLabel: 'Lowest to Highest',
                        descLabel: 'Highest to Lowest',
                        ascIcon: 'bi-sort-numeric-down',
                        descIcon: 'bi-sort-numeric-up'
                    },
                    'date': {
                        ascLabel: 'Oldest to Newest',
                        descLabel: 'Newest to Oldest',
                        ascIcon: 'bi-sort-down',
                        descIcon: 'bi-sort-up'
                    },
                    'time': {
                        ascLabel: 'Earliest to Latest',
                        descLabel: 'Latest to Earliest',
                        ascIcon: 'bi-sort-down',
                        descIcon: 'bi-sort-up'
                    },
                    'true-false': {
                        ascLabel: 'False to True',
                        descLabel: 'True to False',
                        ascIcon: 'bi-sort-down',
                        descIcon: 'bi-sort-up'
                    },
                    'phone-number': {
                        ascLabel: 'A to Z',
                        descLabel: 'Z to A',
                        ascIcon: 'bi-sort-alpha-down',
                        descIcon: 'bi-sort-alpha-up'
                    },
                    'email-address': {
                        ascLabel: 'A to Z',
                        descLabel: 'Z to A',
                        ascIcon: 'bi-sort-alpha-down',
                        descIcon: 'bi-sort-alpha-up'
                    }
                };
                
                return configs[dataType] || configs['default'];
            }

            // Get column title from header
            getColumnTitle(header) {
                const textElement = header.querySelector('.table-header-text');
                return textElement ? textElement.textContent.trim() : header.textContent.trim();
            }

            // Populate filter checkboxes
            populateFilterOptions(tableId, column, customFilters) {
                const config = this.tables.get(tableId);
                const dropdown = this.dropdowns.get(tableId)[column];
                const filterContainer = dropdown.querySelector('.checkbox-filters');
                
                const columnIndex = Array.from(config.headers).findIndex(h => h.getAttribute('data-column') === column);
                let values = new Set();
                
                if (customFilters) {
                    // Use custom filters from data attribute
                    values = new Set(customFilters.split(',').map(v => v.trim()));
                } else {
                    // Extract unique values from table data
                    config.originalRows.forEach(row => {
                        const cell = row.cells[columnIndex];
                        if (cell) {
                            let text = cell.textContent.trim();
                            // Remove badge elements for status column
                            const badge = cell.querySelector('.badge');
                            if (badge) {
                                text = badge.textContent.trim();
                            }
                            if (text) values.add(text);
                        }
                    });
                }
                
                // Clear existing checkboxes
                filterContainer.innerHTML = '';
                
                // Add "Select All" checkbox
                const selectAllDiv = document.createElement('div');
                selectAllDiv.className = 'form-check checkbox-filter-item';
                selectAllDiv.innerHTML = `
                    <input class="form-check-input" type="checkbox" value="__SELECT_ALL__" id="filter_${column}_select_all" checked>
                    <label class="form-check-label fw-semibold" for="filter_${column}_select_all">
                        Select All
                    </label>
                `;
                filterContainer.appendChild(selectAllDiv);
                
                // Add individual checkboxes
                Array.from(values).sort().forEach((value, index) => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'form-check checkbox-filter-item';
                    checkboxDiv.innerHTML = `
                        <input class="form-check-input" type="checkbox" value="${value}" id="filter_${column}_${index}" checked>
                        <label class="form-check-label" for="filter_${column}_${index}">
                            ${value}
                        </label>
                    `;
                    filterContainer.appendChild(checkboxDiv);
                });
                
                // Add select all functionality
                const selectAllCheckbox = filterContainer.querySelector('input[value="__SELECT_ALL__"]');
                const individualCheckboxes = filterContainer.querySelectorAll('input:not([value="__SELECT_ALL__"])');
                
                selectAllCheckbox.addEventListener('change', () => {
                    individualCheckboxes.forEach(checkbox => {
                        checkbox.checked = selectAllCheckbox.checked;
                    });
                });
                
                individualCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const allChecked = Array.from(individualCheckboxes).every(cb => cb.checked);
                        const noneChecked = Array.from(individualCheckboxes).every(cb => !cb.checked);
                        
                        if (allChecked) {
                            selectAllCheckbox.checked = true;
                            selectAllCheckbox.indeterminate = false;
                        } else if (noneChecked) {
                            selectAllCheckbox.checked = false;
                            selectAllCheckbox.indeterminate = false;
                        } else {
                            selectAllCheckbox.indeterminate = true;
                        }
                    });
                });
            }

            // Add event listeners to dropdown elements
            addDropdownEventListeners(tableId, column, dropdownMenu) {
                const searchInput = dropdownMenu.querySelector('[data-action="search"]');
                const sortButtons = dropdownMenu.querySelectorAll('[data-action="sort"]');
                const okButton = dropdownMenu.querySelector('[data-action="ok"]');
                const cancelButton = dropdownMenu.querySelector('[data-action="cancel"]');

                // Initialize pending changes for this column
                if (!this.pendingChanges.get(tableId)[column]) {
                    this.pendingChanges.get(tableId)[column] = {
                        search: '',
                        filters: [],
                        sort: null
                    };
                }

                // Search input (update pending changes only)
                searchInput.addEventListener('input', (e) => {
                    this.pendingChanges.get(tableId)[column].search = e.target.value;
                });

                // Sort buttons (update pending changes only)
                sortButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const direction = button.getAttribute('data-direction');
                        this.pendingChanges.get(tableId)[column].sort = { column, direction };
                        
                        // Visual feedback
                        sortButtons.forEach(btn => btn.classList.remove('btn-primary'));
                        sortButtons.forEach(btn => btn.classList.add('btn-outline-primary'));
                        button.classList.remove('btn-outline-primary');
                        button.classList.add('btn-primary');
                    });
                });

                // OK button - apply all pending changes
                okButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.applyPendingChanges(tableId, column);
                    this.closeAllDropdowns();
                });

                // Cancel button - revert to current state
                cancelButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resetPendingChanges(tableId, column);
                    this.closeAllDropdowns();
                });

                // Prevent dropdown from closing when clicking inside
                dropdownMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            // Apply pending changes
            applyPendingChanges(tableId, column) {
                const config = this.tables.get(tableId);
                const dropdown = this.dropdowns.get(tableId)[column];
                const pending = this.pendingChanges.get(tableId)[column];
                
                // Apply search filter
                if (pending.search) {
                    config.filters[`${column}_search`] = { type: 'search', value: pending.search.toLowerCase() };
                } else {
                    delete config.filters[`${column}_search`];
                }
                
                // Apply checkbox filters
                const checkedValues = Array.from(dropdown.querySelectorAll('.checkbox-filters input:not([value="__SELECT_ALL__"]):checked'))
                    .map(input => input.value);
                
                if (checkedValues.length > 0) {
                    config.filters[`${column}_filter`] = { type: 'checkbox', values: checkedValues };
                } else {
                    delete config.filters[`${column}_filter`];
                }
                
                // Apply sort
                if (pending.sort) {
                    config.sortConfig = pending.sort;
                    this.updateSortIndicators(tableId, pending.sort.column, pending.sort.direction);
                }
                
                // Update filter badge
                const hasFilters = pending.search || checkedValues.length < this.getTotalFilterOptions(dropdown);
                this.updateFilterBadge(tableId, column, hasFilters);
                
                // Apply all filters and sorting
                this.applyFilters(tableId);
            }

            // Reset pending changes to current state
            resetPendingChanges(tableId, column) {
                const config = this.tables.get(tableId);
                const dropdown = this.dropdowns.get(tableId)[column];
                
                // Reset search input
                const searchInput = dropdown.querySelector('[data-action="search"]');
                searchInput.value = '';
                
                // Reset checkboxes to current filter state
                const currentFilter = config.filters[`${column}_filter`];
                const checkboxes = dropdown.querySelectorAll('.checkbox-filters input');
                
                if (currentFilter) {
                    checkboxes.forEach(checkbox => {
                        if (checkbox.value === '__SELECT_ALL__') return;
                        checkbox.checked = currentFilter.values.includes(checkbox.value);
                    });
                } else {
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = true;
                    });
                }
                
                // Update select all checkbox
                this.updateSelectAllCheckbox(dropdown);
                
                // Reset sort buttons
                const sortButtons = dropdown.querySelectorAll('[data-action="sort"]');
                sortButtons.forEach(btn => {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline-primary');
                });
                
                // Reset pending changes
                this.pendingChanges.get(tableId)[column] = {
                    search: '',
                    filters: [],
                    sort: null
                };
            }

            // Get total number of filter options
            getTotalFilterOptions(dropdown) {
                return dropdown.querySelectorAll('.checkbox-filters input:not([value="__SELECT_ALL__"])').length;
            }

            // Update select all checkbox state
            updateSelectAllCheckbox(dropdown) {
                const selectAllCheckbox = dropdown.querySelector('input[value="__SELECT_ALL__"]');
                const individualCheckboxes = dropdown.querySelectorAll('input:not([value="__SELECT_ALL__"])');
                
                const allChecked = Array.from(individualCheckboxes).every(cb => cb.checked);
                const noneChecked = Array.from(individualCheckboxes).every(cb => !cb.checked);
                
                if (allChecked) {
                    selectAllCheckbox.checked = true;
                    selectAllCheckbox.indeterminate = false;
                } else if (noneChecked) {
                    selectAllCheckbox.checked = false;
                    selectAllCheckbox.indeterminate = false;
                } else {
                    selectAllCheckbox.indeterminate = true;
                }
            }

            // Toggle dropdown visibility
            toggleDropdown(tableId, column) {
                this.closeAllDropdowns();
                const dropdown = this.dropdowns.get(tableId)[column];
                dropdown.classList.toggle('show');
                
                // Reset pending changes when opening
                if (dropdown.classList.contains('show')) {
                    this.resetPendingChanges(tableId, column);
                }
            }

            // Close all open dropdowns
            closeAllDropdowns() {
                this.dropdowns.forEach(tableDropdowns => {
                    Object.values(tableDropdowns).forEach(dropdown => {
                        dropdown.classList.remove('show');
                    });
                });
            }

            // Parse value based on data type
            parseValue(value, dataType) {
                switch (dataType) {
                    case 'whole-number':
                        return parseInt(value.replace(/[^\d-]/g, '')) || 0;
                    case 'decimal':
                        return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                    case 'currency':
                        return parseFloat(value.replace(/[$,]/g, '')) || 0;
                    case 'date':
                        return new Date(value);
                    case 'time':
                        const today = new Date();
                        const timeMatch = value.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
                        if (timeMatch) {
                            let hours = parseInt(timeMatch[1]);
                            const minutes = parseInt(timeMatch[2]);
                            const period = timeMatch[3];
                            
                            if (period && period.toUpperCase() === 'PM' && hours !== 12) {
                                hours += 12;
                            } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
                                hours = 0;
                            }
                            
                            return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
                        }
                        return new Date();
                    case 'true-false':
                        const normalized = value.toLowerCase().trim();
                        return ['true', 'yes', '1', 'on', 'enabled'].includes(normalized);
                    case 'phone-number':
                        return value.replace(/[^\d]/g, ''); // Remove all non-digits for comparison
                    case 'email-address':
                        return value.toLowerCase();
                    default:
                        return value;
                }
            }

            // Apply all active filters
            applyFilters(tableId) {
                const config = this.tables.get(tableId);
                let visibleRows = [...config.originalRows];
                
                // Apply each filter
                Object.entries(config.filters).forEach(([filterKey, filter]) => {
                    const [column, filterType] = filterKey.split('_');
                    const columnIndex = Array.from(config.headers).findIndex(h => h.getAttribute('data-column') === column);
                    
                    visibleRows = visibleRows.filter(row => {
                        const cell = row.cells[columnIndex];
                        let cellText = cell ? cell.textContent.trim() : '';
                        
                        // Handle badge elements for status column
                        const badge = cell?.querySelector('.badge');
                        if (badge) {
                            cellText = badge.textContent.trim();
                        }
                        
                        if (filter.type === 'search') {
                            return cellText.toLowerCase().includes(filter.value);
                        } else if (filter.type === 'checkbox') {
                            return filter.values.includes(cellText);
                        }
                        return true;
                    });
                });
                
                // Update visible rows
                config.rows = visibleRows;
                this.updateTableDisplay(tableId);
                
                // Reapply sorting if active
                if (config.sortConfig.column) {
                    this.applySorting(tableId);
                }
            }

            // Apply sorting
            applySorting(tableId) {
                const config = this.tables.get(tableId);
                const { column, direction } = config.sortConfig;
                
                if (!column) return;
                
                const columnIndex = Array.from(config.headers).findIndex(h => h.getAttribute('data-column') === column);
                const header = Array.from(config.headers).find(h => h.getAttribute('data-column') === column);
                const dataType = header.getAttribute('data-type') || 'default';
                
                config.rows.sort((a, b) => {
                    let aVal = a.cells[columnIndex] ? a.cells[columnIndex].textContent.trim() : '';
                    let bVal = b.cells[columnIndex] ? b.cells[columnIndex].textContent.trim() : '';
                    
                    // Handle badge elements
                    const aBadge = a.cells[columnIndex]?.querySelector('.badge');
                    const bBadge = b.cells[columnIndex]?.querySelector('.badge');
                    if (aBadge) aVal = aBadge.textContent.trim();
                    if (bBadge) bVal = bBadge.textContent.trim();
                    
                    // Parse values based on data type
                    aVal = this.parseValue(aVal, dataType);
                    bVal = this.parseValue(bVal, dataType);
                    
                    let result;
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        result = aVal - bVal;
                    } else if (aVal instanceof Date && bVal instanceof Date) {
                        result = aVal.getTime() - bVal.getTime();
                    } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                        result = aVal === bVal ? 0 : aVal ? 1 : -1;
                    } else {
                        result = aVal.toString().localeCompare(bVal.toString());
                    }
                    
                    return direction === 'desc' ? -result : result;
                });
                
                this.updateTableDisplay(tableId);
            }

            // Update table display
            updateTableDisplay(tableId) {
                const config = this.tables.get(tableId);
                
                // Clear tbody
                config.tbody.innerHTML = '';
                
                // Add filtered/sorted rows
                config.rows.forEach(row => {
                    config.tbody.appendChild(row);
                });
            }

            // Update sort indicators
            updateSortIndicators(tableId, activeColumn, direction) {
                const config = this.tables.get(tableId);
                
                config.headers.forEach(header => {
                    const indicator = header.querySelector('.sort-indicator');
                    const column = header.getAttribute('data-column');
                    
                    if (column === activeColumn) {
                        indicator.className = `bi sort-indicator active ${direction === 'asc' ? 'bi-chevron-up' : 'bi-chevron-down'}`;
                    } else {
                        indicator.className = 'bi bi-chevron-down sort-indicator';
                    }
                });
            }

            // Update filter badge
            updateFilterBadge(tableId, column, hasFilters) {
                const config = this.tables.get(tableId);
                const header = Array.from(config.headers).find(h => h.getAttribute('data-column') === column);
                
                // Remove existing badge
                const existingBadge = header.querySelector('.filter-badge');
                if (existingBadge) {
                    existingBadge.remove();
                }
                
                // Add new badge if there are filters
                if (hasFilters) {
                    const badge = document.createElement('span');
                    badge.className = 'badge bg-primary filter-badge';
                    badge.textContent = '●';
                    badge.title = 'Filtered';
                    const headerIcons = header.querySelector('.table-header-icons');
                    headerIcons.insertBefore(badge, headerIcons.firstChild);
                }
            }

            // Clear filter for specific column
            clearColumnFilter(tableId, column) {
                const config = this.tables.get(tableId);
                const dropdown = this.dropdowns.get(tableId)[column];
                
                // Clear filters from config
                delete config.filters[`${column}_search`];
                delete config.filters[`${column}_filter`];
                
                // Reset form elements
                const searchInput = dropdown.querySelector('[data-action="search"]');
                searchInput.value = '';
                
                const checkboxes = dropdown.querySelectorAll('.checkbox-filters input');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
                
                // Remove filter badge
                this.updateFilterBadge(tableId, column, false);
                
                // Reapply filters
                this.applyFilters(tableId);
                
                // Close dropdown
                this.closeAllDropdowns();
            }

            // Clear all filters for table
            clearAllFilters(tableId) {
                const config = this.tables.get(tableId);
                
                // Clear all filters
                config.filters = {};
                config.sortConfig = { column: null, direction: 'asc' };
                
                // Reset all dropdowns
                Object.entries(this.dropdowns.get(tableId)).forEach(([column, dropdown]) => {
                    const searchInput = dropdown.querySelector('[data-action="search"]');
                    searchInput.value = '';
                    
                    const checkboxes = dropdown.querySelectorAll('.checkbox-filters input');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = true;
                    });
                    
                    // Remove filter badges
                    this.updateFilterBadge(tableId, column, false);
                });
                
                // Reset sort indicators
                config.headers.forEach(header => {
                    const indicator = header.querySelector('.sort-indicator');
                    indicator.className = 'bi bi-chevron-down sort-indicator';
                });
                
                // Show all original rows
                config.rows = [...config.originalRows];
                this.updateTableDisplay(tableId);
                
                // Close all dropdowns
                this.closeAllDropdowns();
            }
        }

        // Initialize the table enhancer
        const tableEnhancer = new BootstrapTableEnhancer();
        
        // Enhance the table when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            tableEnhancer.enhance('enhanced-table');
        });
