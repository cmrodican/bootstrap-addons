// Configuration
const CONFIG = {
  API_BASE_URL: "https://hubresources-openapi.crodican.workers.dev/",
  MAPTILER_API_KEY: "1nPjVtGASMJJCaJkeKXQ",
  DEFAULT_PAGE_SIZE: 25,
  DEBOUNCE_DELAY: 300,
  ENDPOINTS: {
    resources: "/api/resources",
    filters: "/api/resources/filters",
    geoJSON: "/api/resources/geojson",
    export: "/api/resources/export"
  },
  // Set to false in production to disable console logs
  DEBUG_MODE: true
};
// Filter name constants to avoid magic strings
const FILTER_TYPES = {
  COUNTY: "County",
  RESOURCE_TYPE: "Resource Type",
  CATEGORY: "Category",
  POPULATIONS_SERVED: "Populations Served",
  SEARCH: "search"
};
// Logger Utility
const Logger = {
  log(...args) {
    if (CONFIG.DEBUG_MODE) {
      console.log(...args);
    }
  },
  warn(...args) {
    if (CONFIG.DEBUG_MODE) {
      console.warn(...args);
    }
  },
  error(...args) {
    // Always log errors, even in production
    console.error(...args);
  },
  info(...args) {
    if (CONFIG.DEBUG_MODE) {
      console.info(...args);
    }
  }
};
// Application State
const AppState = {
  currentData: [],
  totalRows: 0,
  filterOptions: {},
  currentPage: 1,
  recordsPerPage: CONFIG.DEFAULT_PAGE_SIZE,
  currentSort: "",
  sortDirection: "asc",
  isLoading: false,
  currentView: "cards",
  activeFilters: {
    search: "",
    County: [],
    "Resource Type": [],
    "Populations Served": [],
    Category: []
  },
  map: null,
  countyOutlines: {
    enabled: true, // Master toggle
    visible: { // Individual county visibility
      'PHILADELPHIA': true,
      'BERKS': true,
      'BUCKS': true,
      'CHESTER': true,
      'DELAWARE': true,
      'LANCASTER': true,
      'MONTGOMERY': true,
      'SCHUYLKILL': true
    }
  }
};
// API Client
class APIClient {
  static cache = new Map();
  static cacheTimeout = 2 * 60 * 1000;
  /**
   * Generates a unique cache key for API requests
   * @param {string} endpoint - The API endpoint path
   * @param {Object} params - Query parameters object
   * @returns {string} A unique cache key string
   */
  static getCacheKey(endpoint, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        // Create a copy before sorting to avoid mutating the original array
        result[key] = Array.isArray(params[key]) ? [...params[key]].sort() : params[key];
        return result;
      }, {});
    return `${endpoint}?${JSON.stringify(sortedParams)}`;
  }
  /**
   * Makes an HTTP request to the API with caching
   * @param {string} endpoint - The API endpoint path
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} The API response data
   * @throws {Error} If the request fails or returns an error
   */
  static async request(endpoint, params = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      Logger.log("✓ Using cached data");
      return cached.data;
    }
    try {
      const url = new URL(endpoint, CONFIG.API_BASE_URL);
     
      Object.keys(params).forEach((key) => {
        if (Array.isArray(params[key])) {
          params[key].forEach((value) => url.searchParams.append(key, value));
        } else if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
          url.searchParams.append(key, params[key]);
        }
      });
      Logger.log("→ API Request:", url.toString());
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        Logger.error("API Error Response:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      Logger.log("✓ API Response received");
      // For GeoJSON endpoint, return raw data
      if (endpoint === CONFIG.ENDPOINTS.geoJSON) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        return data;
      }
      // Handle standard API response format: { success: true, data: {...} }
      if (!data.success) {
        throw new Error(data.error?.message || "API request failed");
      }
      const resultData = data.data;
      this.cache.set(cacheKey, {
        data: resultData,
        timestamp: Date.now()
      });
      if (this.cache.size > 50) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
      return resultData;
    } catch (error) {
      Logger.error("✗ API Error:", error);
      throw error;
    }
  }
  /**
   * Clears all cached API responses
   */
  static clearCache() {
    this.cache.clear();
    Logger.log("✓ Cache cleared");
  }
  /**
   * Fetches available filter options from the API
   * @returns {Promise<Object>} Filter options organized by type
   */
  static async getFilters() {
    try {
      return await this.request(CONFIG.ENDPOINTS.filters);
    } catch (error) {
      Logger.error("Failed to fetch filters:", error);
      return {};
    }
  }
  /**
   * Fetches paginated resource data from the API
   * @param {Object} params - Query parameters including page, limit, filters
   * @returns {Promise<{list: Array, pageInfo: Object}>} Resources list and pagination info
   * @throws {Error} If the request fails
   */
  static async getData(params = {}) {
    try {
      const response = await this.request(CONFIG.ENDPOINTS.resources, params);
     
      // API returns: { list: [...], pageInfo: { currentPage, pageSize, totalRows, totalPages } }
      return {
        list: response.list || [],
        pageInfo: {
          totalRows: response.pageInfo?.totalRows || 0,
          currentPage: response.pageInfo?.currentPage || 1,
          pageSize: response.pageInfo?.pageSize || 25
        }
      };
    } catch (error) {
      Logger.error("Failed to fetch data:", error);
      throw error;
    }
  }
  /**
   * Fetches GeoJSON data and converts it to map marker format
   * @param {Object} params - Query parameters for filtering resources
   * @returns {Promise<Array>} Array of marker objects with location data
   */
  static async getMapMarkers(params = {}) {
    try {
      // Fetch GeoJSON FeatureCollection
      const geoJSON = await this.request(CONFIG.ENDPOINTS.geoJSON, params);
      // Convert GeoJSON features to marker format
      if (geoJSON && geoJSON.features && Array.isArray(geoJSON.features)) {
        return geoJSON.features
          .filter(feature => {
            // Filter out features with null coordinates
            const coords = feature.geometry.coordinates;
            return coords && coords[0] !== null && coords[1] !== null;
          })
          .map(feature => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates; // [longitude, latitude]
            return {
              id: props.id,
              lat: coords[1], // latitude is second in GeoJSON
              lng: coords[0], // longitude is first in GeoJSON
              name: props.name,
              organization: props.organization,
              phone: props.phone,
              address: props.address,
              city: props.city,
              state: props.state,
              zipCode: props.zipCode,
              website: props.website,
              image: props.image,
              fullAddress: props.fullAddress,
              phoneUrl: props.phoneUrl,
              googleMapsUrl: props.googleMapsUrl,
              county: props.county,
              resourceType: props.resourceType,
              category: props.category,
              populationsServed: props.populationsServed,
              moreInfo: props.moreInfo,
              markerIcon: props.markerIcon
            };
          });
      }
      return [];
    } catch (error) {
      Logger.error("Failed to fetch map markers:", error);
      return [];
    }
  }
}
// DOM Elements Cache
const DOM = {
  init() {
    this.searchInput = document.getElementById("search-input");
    this.searchBtn = document.getElementById("search-btn");
    this.perPageSelect = document.getElementById("per-page-select");
    this.clearFiltersBtn = document.getElementById("clear-filters-btn");
    this.loadingSpinner = document.getElementById("loading-spinner");
    this.tableContainer = document.getElementById("table-container");
    this.cardsContainer = document.getElementById("cards-container");
    this.tableBody = document.getElementById("table-body");
    this.resultsInfo = document.getElementById("results-info");
    this.pagination = document.getElementById("pagination");
    this.exportBtn = document.getElementById("export-btn");
    this.activeFiltersDiv = document.getElementById("active-filters");
    this.filterChipsDiv = document.getElementById("filter-chips");
    this.mapContainer = document.getElementById("mapContainer");
    this.heroSection = document.getElementById("hero");
    this.heroContent = document.getElementById("heroContent");
    this.tableViewBtn = document.getElementById("table-view-btn");
    this.cardViewBtn = document.getElementById("card-view-btn");
  }
};
// Results Manager
const ResultsManager = {
  showResultsSection() {
    // Everything is always visible now - just resize map to ensure proper rendering
    if (AppState.map) {
      setTimeout(() => {
        AppState.map.resize();
        // Re-trigger county boundaries after resize
        if (MapManager.fullCountyGeoJSON) {
          MapManager.updateCountyOutlineVisibility();
        }
      }, 200);
    }
  },
  hideResultsSection() {
    // No-op: everything stays visible
  }
};
// Utility Functions
const Utils = {
  /**
   * Creates a debounced function that delays execution
   * @param {Function} func - The function to debounce
   * @param {number} wait - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  /**
   * Escapes HTML special characters to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} Escaped text safe for HTML
   */
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return String(text || "").replace(/[&<>"']/g, (m) => map[m]);
  },
  formatPhoneUrl(phone) {
    return phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;
  },
  showLoading() {
    AppState.isLoading = true;
    if (DOM.loadingSpinner) DOM.loadingSpinner.style.display = "flex";
    if (DOM.tableContainer) DOM.tableContainer.style.display = "none";
    if (DOM.cardsContainer) DOM.cardsContainer.style.display = "none";
    if (DOM.exportBtn) DOM.exportBtn.disabled = true;
  },
  hideLoading() {
    AppState.isLoading = false;
    if (DOM.loadingSpinner) DOM.loadingSpinner.style.display = "none";
    ViewManager.showCurrentView();
  }
};
// View Management
const ViewManager = {
  initialize() {
    if (DOM.tableViewBtn) {
      DOM.tableViewBtn.addEventListener("click", () => this.switchView("table"));
    }
    if (DOM.cardViewBtn) {
      DOM.cardViewBtn.addEventListener("click", () => this.switchView("cards"));
    }
  },
  switchView(view) {
    AppState.currentView = view;
    if (DOM.tableViewBtn) DOM.tableViewBtn.classList.toggle("active", view === "table");
    if (DOM.cardViewBtn) DOM.cardViewBtn.classList.toggle("active", view === "cards");
    this.showCurrentView();
    this.renderCurrentView();
  },
  showCurrentView() {
    if (AppState.currentView === "table") {
      if (DOM.tableContainer) DOM.tableContainer.style.display = "block";
      if (DOM.cardsContainer) DOM.cardsContainer.style.display = "none";
    } else {
      if (DOM.tableContainer) DOM.tableContainer.style.display = "none";
      if (DOM.cardsContainer) DOM.cardsContainer.style.display = "block";
    }
  },
  renderCurrentView() {
    if (AppState.currentData && AppState.currentData.length > 0) {
      if (AppState.currentView === "table") {
        TableRenderer.render(AppState.currentData);
      } else {
        CardRenderer.render(AppState.currentData);
      }
    }
  }
};
// Filter Management
const FilterManager = {
  async loadFilterOptions() {
    try {
      AppState.filterOptions = await APIClient.getFilters();
      this.initializeDropdowns();
      this.initializeSearchControlFilters();
      this.setupFilterChipHandlers(); // Add handler for filter chip removal
    } catch (error) {
      Logger.error("Failed to load filter options:", error);
      AppState.filterOptions = {};
      this.initializeDropdowns();
      this.initializeSearchControlFilters();
      this.setupFilterChipHandlers();
    }
  },
  initializeDropdowns() {
    const filterTypes = ["County", "Resource Type", "Populations Served"];
    filterTypes.forEach((filterType) => {
      const options = AppState.filterOptions[filterType] || [];
      this.createFilterDropdown(filterType, options);
    });
    this.initializeCategoryDropdown();
    this.setupEventListeners();
  },
  initializeSearchControlFilters() {
    this.createSearchControlDropdown("County", AppState.filterOptions.County || []);
    this.createSearchControlDropdown("Resource Type", AppState.filterOptions["Resource Type"] || []);
    this.createSearchControlDropdown("Populations Served", AppState.filterOptions["Populations Served"] || []);
    this.initializeSearchControlCategoryDropdown();
    this.updateFilterCountBadges();
  },
  createSearchControlDropdown(filterType, options) {
    const dropdownId = this.getSearchControlDropdownId(filterType);
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown || !options.length) return;
    dropdown.innerHTML = options
      .map((option) => {
        const safeId = `sc-${filterType}-${option}`.replace(/[^a-zA-Z0-9-_]/g, "-");
        const isChecked = AppState.activeFilters[filterType]?.includes(option) ? "checked" : "";
        return `
          <li>
            <div class="dropdown-item-check">
              <input type="checkbox" id="${safeId}" value="${Utils.escapeHtml(option)}" ${isChecked}
                onchange="FilterManager.handleSearchControlFilterChange('${Utils.escapeHtml(filterType)}', this.value, this.checked)">
              <label for="${safeId}">${Utils.escapeHtml(option)}</label>
            </div>
          </li>
        `;
      })
      .join("");
  },
  initializeSearchControlCategoryDropdown() {
    const categories = AppState.filterOptions.Category || {};
    const allCategories = new Set();
    Object.values(categories).forEach((cats) => cats.forEach((cat) => allCategories.add(cat)));
    this.createSearchControlDropdown("Category", Array.from(allCategories).sort());
  },
  updateSearchControlCategoryDropdown() {
    const selectedResourceTypes = AppState.activeFilters["Resource Type"];
    const categories = AppState.filterOptions.Category || {};
    if (selectedResourceTypes.length === 0) {
      this.initializeSearchControlCategoryDropdown();
      return;
    }
    const availableCategories = new Set();
    selectedResourceTypes.forEach((resourceType) => {
      if (categories[resourceType]) {
        categories[resourceType].forEach((cat) => availableCategories.add(cat));
      }
    });
    this.createSearchControlDropdown("Category", Array.from(availableCategories).sort());
    AppState.activeFilters.Category = AppState.activeFilters.Category.filter((cat) =>
      availableCategories.has(cat)
    );
  },
  getSearchControlDropdownId(filterType) {
    const mapping = {
      County: "county-dropdown-menu",
      "Resource Type": "resource-type-dropdown-menu",
      Category: "category-dropdown-menu",
      "Populations Served": "populations-dropdown-menu"
    };
    return mapping[filterType];
  },
  handleSearchControlFilterChange(filterType, value, checked) {
    if (checked) {
      if (!AppState.activeFilters[filterType].includes(value)) {
        AppState.activeFilters[filterType].push(value);
      }
    } else {
      AppState.activeFilters[filterType] = AppState.activeFilters[filterType].filter((v) => v !== value);
    }
    if (filterType === "Resource Type") {
      this.updateCategoryDropdown();
      this.updateSearchControlCategoryDropdown();
    }
    this.syncDropdowns(filterType);
    APIClient.clearCache();
    this.updateUI();
    AppState.currentPage = 1;
    DataManager.loadData();
  },
  syncDropdowns(filterType) {
    const tableDropdownId = this.getDropdownId(filterType);
    const tableDropdown = document.getElementById(tableDropdownId);
    if (tableDropdown) {
      const checkboxes = tableDropdown.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        const isActive = AppState.activeFilters[filterType]?.includes(checkbox.value);
        checkbox.checked = isActive;
      });
    }
    const searchDropdownId = this.getSearchControlDropdownId(filterType);
    const searchDropdown = document.getElementById(searchDropdownId);
    if (searchDropdown) {
      const checkboxes = searchDropdown.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        const isActive = AppState.activeFilters[filterType]?.includes(checkbox.value);
        checkbox.checked = isActive;
      });
    }
  },
  updateFilterCountBadges() {
    ["County", "Resource Type", "Category", "Populations Served"].forEach((filterType) => {
      const count = AppState.activeFilters[filterType]?.length || 0;
      const badgeId = this.getCountBadgeId(filterType);
      const badge = document.getElementById(badgeId);
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
      }
    });
  },
  getCountBadgeId(filterType) {
    const mapping = {
      County: "county-count-badge",
      "Resource Type": "resource-type-count-badge",
      Category: "category-count-badge",
      "Populations Served": "populations-count-badge"
    };
    return mapping[filterType];
  },
  createFilterDropdown(filterType, options) {
    const dropdownId = this.getDropdownId(filterType);
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown || !options.length) return;
    // Remove old event listener if it exists (prevent memory leak)
    if (dropdown._filterListener) {
      dropdown.removeEventListener("change", dropdown._filterListener);
    }
    dropdown.innerHTML = options
      .map((option) => {
        const safeId = `th-${filterType}-${option}`.replace(/[^a-zA-Z0-9-_]/g, "-");
        const isChecked = AppState.activeFilters[filterType]?.includes(option) ? "checked" : "";
        return `
          <div class="filter-option">
            <input type="checkbox" id="${safeId}" value="${Utils.escapeHtml(option)}" ${isChecked} data-filter-type="${Utils.escapeHtml(filterType)}">
            <label for="${safeId}">${Utils.escapeHtml(option)}</label>
          </div>
        `;
      })
      .join("");
    // Use event delegation to prevent memory leak
    const filterListener = (e) => {
      if (e.target.type === "checkbox" && e.target.dataset.filterType) {
        this.handleFilterChange(e.target.dataset.filterType, e.target.value, e.target.checked);
      }
    };
   
    dropdown.addEventListener("change", filterListener);
    dropdown._filterListener = filterListener; // Store reference for cleanup
  },
  initializeCategoryDropdown() {
    const categories = AppState.filterOptions.Category || {};
    const allCategories = new Set();
    Object.values(categories).forEach((cats) => cats.forEach((cat) => allCategories.add(cat)));
    this.createFilterDropdown("Category", Array.from(allCategories).sort());
  },
  updateCategoryDropdown() {
    const selectedResourceTypes = AppState.activeFilters["Resource Type"];
    const categories = AppState.filterOptions.Category || {};
    if (selectedResourceTypes.length === 0) {
      this.initializeCategoryDropdown();
      return;
    }
    const availableCategories = new Set();
    selectedResourceTypes.forEach((resourceType) => {
      if (categories[resourceType]) {
        categories[resourceType].forEach((cat) => availableCategories.add(cat));
      }
    });
    this.createFilterDropdown("Category", Array.from(availableCategories).sort());
    AppState.activeFilters.Category = AppState.activeFilters.Category.filter((cat) =>
      availableCategories.has(cat)
    );
  },
  handleFilterChange(filterType, value, checked) {
    if (checked) {
      if (!AppState.activeFilters[filterType].includes(value)) {
        AppState.activeFilters[filterType].push(value);
      }
    } else {
      AppState.activeFilters[filterType] = AppState.activeFilters[filterType].filter((v) => v !== value);
    }
    if (filterType === "Resource Type") {
      this.updateCategoryDropdown();
      this.updateSearchControlCategoryDropdown();
    }
    this.syncDropdowns(filterType);
    APIClient.clearCache();
    this.updateUI();

    // Sync with map FilterPanelControl
    if (window.filterPanelControl) {
      window.filterPanelControl.updateActiveFilters();
    }

    AppState.currentPage = 1;
    DataManager.loadData();
  },
  setupEventListeners() {
    document.querySelectorAll(".filter-header").forEach((header) => {
      header.addEventListener("click", (e) => {
        e.stopPropagation();
        const column = header.dataset.column;
        if (this.isFilterColumn(column) && !e.target.closest(".resize-handle")) {
          this.toggleDropdown(column);
        }
      });
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".filter-header")) {
        this.closeAllDropdowns();
      }
    });
  },
  isFilterColumn(column) {
    return ["County", "Resource Type", "Category", "Populations Served"].includes(column);
  },
  toggleDropdown(filterType) {
    const dropdownId = this.getDropdownId(filterType);
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    this.closeAllDropdowns();
    dropdown.classList.toggle("show");
  },
  closeAllDropdowns() {
    document.querySelectorAll(".filter-dropdown").forEach((dropdown) => {
      dropdown.classList.remove("show");
    });
  },
  getDropdownId(filterType) {
    const mapping = {
      County: "county-filter-dropdown",
      "Resource Type": "resource-type-filter-dropdown",
      Category: "category-filter-dropdown",
      "Populations Served": "populations-filter-dropdown"
    };
    return mapping[filterType];
  },
  clearAll() {
    AppState.activeFilters = {
      search: "",
      County: [],
      "Resource Type": [],
      "Populations Served": [],
      Category: []
    };
    DOM.searchInput.value = "";
    document.querySelectorAll('.filter-dropdown input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
    document.querySelectorAll('[id$="-dropdown-menu"] input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
    this.updateCategoryDropdown();
    this.updateSearchControlCategoryDropdown();
    this.updateUI();

    // Sync with map controls
    if (window.searchControl && window.searchControl._input) {
      window.searchControl._input.value = '';
    }
    if (window.filterPanelControl) {
      window.filterPanelControl.updateActiveFilters();
    }

    CountyCardManager.showCountySearch();
    MapManager.updateCountyBoundaries();
  },
  updateUI() {
    this.updateIndicators();
    this.updateFilterChips();
    this.updateFilterCountBadges();
  },
  updateIndicators() {
    ["County", "Resource Type", "Category", "Populations Served"].forEach((filterType) => {
      const indicatorId = this.getDropdownId(filterType).replace("-dropdown", "-indicator");
      const indicator = document.getElementById(indicatorId);
      if (indicator) {
        if (AppState.activeFilters[filterType]?.length > 0) {
          indicator.classList.add("active");
        } else {
          indicator.classList.remove("active");
        }
      }
    });
  },
  updateFilterChips() {
    const chips = [];
    if (AppState.activeFilters.search) {
      chips.push({
        type: "search",
        value: AppState.activeFilters.search,
        label: `Search: "${AppState.activeFilters.search}"`
      });
    }
    ["County", "Resource Type", "Category", "Populations Served"].forEach((filterType) => {
      if (AppState.activeFilters[filterType]?.length > 0) {
        AppState.activeFilters[filterType].forEach((value) => {
          chips.push({
            type: filterType,
            value: value,
            label: `${filterType}: ${value}`
          });
        });
      }
    });
    if (chips.length > 0) {
      DOM.activeFiltersDiv.style.display = "block";
      DOM.filterChipsDiv.innerHTML = chips
        .map(
          (chip) =>
            `<span class="filter-chip">
              ${Utils.escapeHtml(chip.label)}
              <button type="button" class="btn-close filter-chip-remove" data-filter-type="${Utils.escapeHtml(chip.type)}" data-filter-value="${Utils.escapeHtml(chip.value)}" aria-label="Remove filter"></button>
            </span>`
        )
        .join("");
    } else {
      DOM.activeFiltersDiv.style.display = "none";
    }
  },
  // Add event delegation handler for filter chip removal
  setupFilterChipHandlers() {
    if (DOM.filterChipsDiv) {
      DOM.filterChipsDiv.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.filter-chip-remove');
        if (removeBtn) {
          const type = removeBtn.dataset.filterType;
          const value = removeBtn.dataset.filterValue;
          this.removeFilter(type, value);
        }
      });
    }
  },
  removeFilter(type, value) {
    if (type === "search") {
      AppState.activeFilters.search = "";
      DOM.searchInput.value = "";
      // Sync with map SearchControl
      if (window.searchControl && window.searchControl._input) {
        window.searchControl._input.value = '';
      }
    } else if (AppState.activeFilters[type]) {
      AppState.activeFilters[type] = AppState.activeFilters[type].filter((v) => v !== value);
      this.syncDropdowns(type);
    }
    if (type === "Resource Type") {
      this.updateCategoryDropdown();
      this.updateSearchControlCategoryDropdown();
    }

    // Sync with map FilterPanelControl
    if (window.filterPanelControl) {
      window.filterPanelControl.updateActiveFilters();
    }

    AppState.currentPage = 1;
    this.updateUI();
    DataManager.loadData();
  }
};
// Data Management
const DataManager = {
  requestId: 0,
  /**
   * Loads resource data from the API based on current filters and state
   * Handles race conditions by tracking request IDs
   * @returns {Promise<void>}
   */
  async loadData() {
    // Increment request ID to track the latest request
    const currentRequestId = ++this.requestId;
    Utils.showLoading();
    try {
      const params = this.buildRequestParams();
      const data = await APIClient.getData(params);
      // Check if this is still the latest request (not stale)
      if (currentRequestId !== this.requestId) {
        Logger.log("⏮ Ignoring stale request #" + currentRequestId);
        return;
      }
      AppState.currentData = data.list || [];
      AppState.totalRows = data.pageInfo?.totalRows || 0;
      if (AppState.currentView === "table") {
        TableRenderer.render(AppState.currentData);
      } else {
        CardRenderer.render(AppState.currentData);
      }
      PaginationManager.render();
      this.updateResultsInfo();
      MapManager.updateMarkers();
      MapManager.updateCountyBoundaries();

      // Update map controls
      if (window.resultsInfoControl) {
        window.resultsInfoControl.update();
      }

      if (DOM.exportBtn) {
        DOM.exportBtn.disabled = AppState.currentData.length === 0;
      }
    } catch (error) {
      // Only show error if this is still the latest request
      if (currentRequestId === this.requestId) {
        Logger.error("Error loading data:", error);
        this.showError(error.message);
      }
    } finally {
      // Only hide loading if this is still the latest request
      if (currentRequestId === this.requestId) {
        Utils.hideLoading();
      }
    }
  },
  buildRequestParams() {
    const params = {
      page: AppState.currentPage,
      limit: AppState.recordsPerPage
    };
    if (AppState.currentSort) {
      const sortParam = AppState.sortDirection === "desc" ? `-${AppState.currentSort}` : AppState.currentSort;
      params.sort = sortParam;
    }
    if (AppState.activeFilters.search) {
      params.search = AppState.activeFilters.search;
    }
    // Map filter names to API parameter names
    if (AppState.activeFilters.County?.length > 0) {
      params.County = AppState.activeFilters.County;
    }
    if (AppState.activeFilters["Resource Type"]?.length > 0) {
      params["Resource Type"] = AppState.activeFilters["Resource Type"];
    }
    if (AppState.activeFilters.Category?.length > 0) {
      params.Category = AppState.activeFilters.Category;
    }
    // API uses "Populations" not "Populations Served"
    if (AppState.activeFilters["Populations Served"]?.length > 0) {
      params.Populations = AppState.activeFilters["Populations Served"];
    }
    return params;
  },
  updateResultsInfo() {
    if (!DOM.resultsInfo) return;
   
    const start = (AppState.currentPage - 1) * AppState.recordsPerPage + 1;
    const end = Math.min(AppState.currentPage * AppState.recordsPerPage, AppState.totalRows);
    if (AppState.totalRows === 0) {
      DOM.resultsInfo.textContent = "No resources found";
    } else {
      DOM.resultsInfo.textContent = `Showing ${start}-${end} of ${AppState.totalRows} resources`;
    }
  },
  showError(message) {
    const errorHtml = `
      <div class="text-center text-danger py-4">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Error: ${Utils.escapeHtml(message)}
      </div>
    `;
    if (AppState.currentView === "table") {
      DOM.tableBody.innerHTML = `<tr><td colspan="12">${errorHtml}</td></tr>`;
    } else {
      DOM.cardsContainer.innerHTML = errorHtml;
    }
    DOM.resultsInfo.textContent = "Error loading data";
  }
};
// Table Rendering
const TableRenderer = {
  render(data) {
    if (!DOM.tableBody) return; // Guard: ensure table body exists
   
    if (!data || data.length === 0) {
      DOM.tableBody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center text-muted py-4">
            <i class="bi bi-inbox me-2"></i>
            No resources found with the current filters.
          </td>
        </tr>
      `;
      return;
    }
    DOM.tableBody.innerHTML = data.map((resource) => this.renderRow(resource)).join("");
  },
  renderRow(resource) {
    const resourceIdentifier = resource.ID || resource["Location Name"] || "unknown";
    return `
      <tr class="table-row-clickable"
          data-resource-id="${Utils.escapeHtml(String(resourceIdentifier))}"
          ${resource.Longitude && resource.Latitude ? `data-longitude="${Utils.escapeHtml(String(resource.Longitude))}" data-latitude="${Utils.escapeHtml(String(resource.Latitude))}"` : ""}>
        <td class="text-nowrap">
          <div class="location-name-cell">
            ${resource.Image ? `<img src="${Utils.escapeHtml(resource.Image)}" alt="Location" class="location-image" onerror="this.style.display='none'">` : ""}
            <strong>${Utils.escapeHtml(resource["Location Name"] || "N/A")}</strong>
          </div>
        </td>
        <td class="text-nowrap">${Utils.escapeHtml(resource.Organization || "N/A")}</td>
        <td class="text-nowrap">
          ${resource.County ? `<span class="badge badge-county">${Utils.escapeHtml(resource.County)}</span>` : "N/A"}
        </td>
        <td class="text-nowrap">
          ${resource["Resource Type"] ? `<span class="badge badge-resource-type">${Utils.escapeHtml(resource["Resource Type"])}</span>` : "N/A"}
        </td>
        <td class="text-nowrap">
          ${resource.Category ? resource.Category.split(",").map(cat => `<span class="badge badge-category">${Utils.escapeHtml(cat.trim())}</span>`).join(" ") : "N/A"}
        </td>
        <td class="text-nowrap">
          ${resource["Populations Served"] ? resource["Populations Served"].split(",").map(pop => `<span class="badge badge-population">${Utils.escapeHtml(pop.trim())}</span>`).join(" ") : "N/A"}
        </td>
        <td class="text-nowrap" onclick="event.stopPropagation()">
          ${resource.Phone ? `<a href="${Utils.formatPhoneUrl(resource.Phone)}" class="btn-link text-nowrap"><i class="bi bi-telephone me-1"></i>${Utils.escapeHtml(resource.Phone)}</a>` : "N/A"}
        </td>
        <td onclick="event.stopPropagation()">
          ${resource.Website ? `<a href="${Utils.escapeHtml(resource.Website)}" target="_blank" class="btn-link text-nowrap" title="Visit Website"><i class="bi bi-globe"></i> Website</a>` : "N/A"}
        </td>
        <td class="text-nowrap">${Utils.escapeHtml(resource.Address || "N/A")}</td>
        <td>${Utils.escapeHtml(resource.City || "N/A")}</td>
        <td>${Utils.escapeHtml(resource.State || "N/A")}</td>
        <td>${Utils.escapeHtml(resource["Zip Code"] || "N/A")}</td>
      </tr>
    `;
  }
};
// Card Rendering
const CardRenderer = {
  render(data) {
    if (!DOM.cardsContainer) return; // Guard: ensure cards container exists
   
    if (!data || data.length === 0) {
      DOM.cardsContainer.innerHTML = `
        <div class="text-center text-muted py-5">
          <i class="bi bi-inbox me-2" style="font-size: 2rem;"></i>
          <h5>No resources found with the current filters.</h5>
        </div>
      `;
      return;
    }
    DOM.cardsContainer.innerHTML = data.map((resource) => this.renderCard(resource)).join("");
  },
  renderCard(resource) {
    const resourceIdentifier = resource.ID || resource["Location Name"] || "unknown";
    const phoneUrl = Utils.formatPhoneUrl(resource.Phone) || "#";
    return `
      <div class="card resourceCard mb-4" data-resource-id="${Utils.escapeHtml(String(resourceIdentifier))}">
        <div class="row no-gutters p-0">
          <div class="card-sidenav col-2 d-flex flex-column justify-content-between align-items-center p-0">
            <a href="${Utils.escapeHtml(resource.Website || "#")}" class="d-flex align-items-center justify-content-center flex-grow-1 w-100 sidenav-button" target="_blank" rel="noopener noreferrer" aria-label="Visit website">
              <i class="bi bi-globe"></i>
            </a>
            <a href="${Utils.escapeHtml(phoneUrl)}" class="d-flex align-items-center justify-content-center flex-grow-1 w-100 sidenav-button" aria-label="Call">
              <i class="bi bi-telephone-fill"></i>
            </a>
            <button class="map-fly-btn d-flex align-items-center justify-content-center flex-grow-1 w-100 border-0 sidenav-button"
                    ${resource.Longitude && resource.Latitude ? `data-longitude="${Utils.escapeHtml(String(resource.Longitude))}" data-latitude="${Utils.escapeHtml(String(resource.Latitude))}"` : "disabled"}
                    data-resource-id="${Utils.escapeHtml(String(resourceIdentifier))}"
                    aria-label="View on map"
                    title="View on map">
              <i class="bi bi-geo-alt-fill"></i>
            </button>
          </div>
          <div class="card-body col-10 p-4">
            <h3 class="card-title">${Utils.escapeHtml(resource["Location Name"] || "N/A")}</h3>
            <h5 class="text-dark">${Utils.escapeHtml(resource.Organization || "N/A")}</h5>
           
            <div class="mb-2">
              ${resource["Resource Type"] ? `<span class="card-badge">${Utils.escapeHtml(resource["Resource Type"])}</span>` : ""}
              ${resource.Category ? resource.Category.split(",").map(cat => `<span class="card-badge">${Utils.escapeHtml(cat.trim())}</span>`).join("") : ""}
            </div>
           
            <h6>Phone: ${Utils.escapeHtml(resource.Phone || "N/A")}</h6>
            <p>
              ${Utils.escapeHtml(resource.Address || "N/A")}<br>
              ${Utils.escapeHtml(resource.City || "N/A")}, ${Utils.escapeHtml(resource.State || "N/A")}, ${Utils.escapeHtml(resource["Zip Code"] || "N/A")}<br>
              ${resource["Google Maps URL"] ? `<strong><a href="${Utils.escapeHtml(resource["Google Maps URL"])}" class="text-secondary" target="_blank" rel="noopener noreferrer">Directions</a></strong>` : ""}
            </p>
           
            ${resource["Populations Served"] && resource["Populations Served"].trim() !== "" ? `<h6>Populations Served:</h6>
            <div class="mb-2">
              ${(resource["Populations Served"] || "").split(",").map(pop => pop.trim()).filter(pop => pop).map(pop => `<span class="card-badge">${Utils.escapeHtml(pop)}</span>`).join("")}
            </div>` : ""}
           
            <div class="row">
              <div class="col d-flex flex-column justify-content-start">
                ${resource.County ? `<h6>County:</h6>
                <div class="mb-2">
                  <span class="card-badge">${Utils.escapeHtml(resource.County)}</span>
                </div>` : ""}
              </div>
              <div class="col d-flex justify-content-end">
                ${resource.Image ? `<div class="col-md-auto d-flex justify-content-end align-items-end p-2" style="position:relative">
                <img class="cardImage" onerror="this.style.display='none'" src="${Utils.escapeHtml(resource.Image)}" alt="${Utils.escapeHtml(resource.Organization || resource["Location Name"] || "Resource logo")}">
                </div>` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
// Pagination Management
const PaginationManager = {
  render() {
    if (!DOM.pagination) return; // Guard: ensure pagination element exists
   
    const totalPages = Math.ceil(AppState.totalRows / AppState.recordsPerPage);
    if (totalPages <= 1) {
      DOM.pagination.innerHTML = "";
      return;
    }
    const startPage = Math.max(1, AppState.currentPage - 2);
    const endPage = Math.min(totalPages, AppState.currentPage + 2);
    let html = this.createPageButton("prev", AppState.currentPage - 1, AppState.currentPage <= 1);
    if (startPage > 1) {
      html += this.createPageButton("page", 1);
      if (startPage > 2) {
        html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      html += this.createPageButton("page", i, false, i === AppState.currentPage);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
      html += this.createPageButton("page", totalPages);
    }
    html += this.createPageButton("next", AppState.currentPage + 1, AppState.currentPage >= totalPages);
    DOM.pagination.innerHTML = html;
  },
  createPageButton(type, page, disabled = false, active = false) {
    const disabledClass = disabled ? "disabled" : "";
    const activeClass = active ? "active" : "";
    if (type === "prev") {
      return `
        <li class="page-item ${disabledClass}">
          <a class="page-link" href="#" onclick="PaginationManager.changePage(${page})" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      `;
    } else if (type === "next") {
      return `
        <li class="page-item ${disabledClass}">
          <a class="page-link" href="#" onclick="PaginationManager.changePage(${page})" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      `;
    } else {
      return `
        <li class="page-item ${activeClass}">
          <a class="page-link" href="#" onclick="PaginationManager.changePage(${page})">${page}</a>
        </li>
      `;
    }
  },
  changePage(page) {
    const totalPages = Math.ceil(AppState.totalRows / AppState.recordsPerPage);
    if (page < 1 || page > totalPages) return;
    AppState.currentPage = page;
    DataManager.loadData();
  }
};
// Custom Map Controls
/**
 * SearchControl - Expandable search input control for the map
 */
class SearchControl {
  constructor() {
    this._isActive = false;
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl search-control';

    this._container.innerHTML = `
      <button class="search-toggle-btn" aria-label="Toggle search">
        <i class="bi bi-search"></i>
      </button>
      <input type="text" id="map-search-input" placeholder="Search resources..." />
    `;

    this._toggleBtn = this._container.querySelector('.search-toggle-btn');
    this._input = this._container.querySelector('input');

    // Toggle button click handler
    this._toggleBtn.addEventListener('click', () => {
      this.toggle();
    });

    // Input change handler
    this._input.addEventListener('input', Utils.debounce(() => {
      AppState.activeFilters.search = this._input.value.trim();
      APIClient.clearCache();
      this.updateData();
    }, CONFIG.DEBOUNCE_DELAY));

    // Store global reference
    window.searchControl = this;

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  toggle() {
    this._isActive = !this._isActive;

    if (this._isActive) {
      this._container.classList.add('active');
      this._toggleBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
      this._toggleBtn.setAttribute('aria-label', 'Close search');
      // Focus input after animation
      setTimeout(() => this._input.focus(), 200);
    } else {
      this._container.classList.remove('active');
      this._toggleBtn.innerHTML = '<i class="bi bi-search"></i>';
      this._toggleBtn.setAttribute('aria-label', 'Open search');
    }
  }

  async updateData() {
    FilterManager.updateUI();
    DataManager.loadData();
    MapManager.updateCountyBoundaries();
    if (window.filterPanelControl) {
      window.filterPanelControl.updateActiveFilters();
    }
  }
}

/**
 * FilterPanelControl - Expandable filter panel control for the map
 */
class FilterPanelControl {
  constructor() {
    this._isActive = false;
    this._expandedSections = new Set(); // Track which sections are expanded
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl filter-panel-control';

    this.render();

    // Store global reference
    window.filterPanelControl = this;

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  render() {
    // Preserve current expanded state before re-rendering
    this.saveExpandedState();

    const filterCount = this.getTotalFilterCount();

    this._container.innerHTML = `
      <div class="filter-top-row">
        <button class="filter-toggle-btn" aria-label="Toggle filters">
          <i class="bi bi-funnel-fill"></i>
        </button>
        <div class="filter-panel-header">
          <span><i class="bi bi-funnel-fill"></i> Filters</span>
          <button onclick="window.filterPanelControl.clearAll()">Clear All</button>
        </div>
      </div>
      <div class="filter-panel-content">
        ${this.renderFilterSection('County', 'map')}
        ${this.renderFilterSection('Resource Type', 'tags')}
        ${this.renderFilterSection('Category', 'grid')}
        ${this.renderFilterSection('Populations Served', 'people')}
        ${this.renderCountyOutlines()}
        ${this.renderActiveFilters()}
      </div>
    `;

    this.attachEventListeners();

    // Attach toggle button listener
    this._toggleBtn = this._container.querySelector('.filter-toggle-btn');
    this._toggleBtn.addEventListener('click', () => {
      this.toggle();
    });

    // Restore expanded state after re-rendering
    this.restoreExpandedState();
  }

  saveExpandedState() {
    // Save which sections are currently expanded
    if (!this._container) return;

    this._expandedSections.clear();
    this._container.querySelectorAll('.filter-section.expanded').forEach(section => {
      const sectionId = section.dataset.section;
      if (sectionId) {
        this._expandedSections.add(sectionId);
      }
    });
  }

  restoreExpandedState() {
    // Restore the expanded state for previously expanded sections
    if (this._expandedSections.size === 0) return;

    this._container.querySelectorAll('.filter-section').forEach(section => {
      const sectionId = section.dataset.section;
      if (sectionId && this._expandedSections.has(sectionId)) {
        section.classList.add('expanded');
      }
    });
  }

  toggle() {
    this._isActive = !this._isActive;

    if (this._isActive) {
      this._container.classList.add('active');
      this._toggleBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
      this._toggleBtn.setAttribute('aria-label', 'Close filters');
    } else {
      this._container.classList.remove('active');
      this._toggleBtn.innerHTML = '<i class="bi bi-funnel-fill"></i>';
      this._toggleBtn.setAttribute('aria-label', 'Open filters');
    }
  }

  renderFilterSection(filterType, icon) {
    const options = AppState.filterOptions[filterType] || [];
    const activeCount = AppState.activeFilters[filterType]?.length || 0;

    // Handle Category special case
    let displayOptions = options;
    if (filterType === 'Category' && typeof options === 'object' && !Array.isArray(options)) {
      const allCategories = new Set();
      Object.values(options).forEach(cats => cats.forEach(cat => allCategories.add(cat)));
      displayOptions = Array.from(allCategories).sort();
    }

    const sectionId = `filter-${filterType.replace(/\s+/g, '-').toLowerCase()}`;

    return `
      <div class="filter-section" data-section="${sectionId}">
        <div class="filter-section-title">
          <i class="bi bi-${icon}"></i>
          ${filterType}
          ${activeCount > 0 ? `<span class="filter-count-badge">${activeCount}</span>` : ''}
          <i class="bi bi-chevron-down accordion-icon"></i>
        </div>
        <div class="filter-options-wrapper">
          <div class="filter-options">
            ${Array.isArray(displayOptions) ? displayOptions.map(option => this.renderFilterOption(filterType, option)).join('') : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderFilterOption(filterType, option) {
    const isChecked = AppState.activeFilters[filterType]?.includes(option);
    const safeId = `filter-${filterType}-${option}`.replace(/[^a-zA-Z0-9-_]/g, '-');

    return `
      <div class="filter-option">
        <input
          type="checkbox"
          id="${safeId}"
          value="${Utils.escapeHtml(option)}"
          data-filter-type="${Utils.escapeHtml(filterType)}"
          ${isChecked ? 'checked' : ''}
        />
        <label for="${safeId}">${Utils.escapeHtml(option)}</label>
      </div>
    `;
  }

  renderCountyOutlines() {
    const counties = [
      { name: 'PHILADELPHIA', label: 'Philadelphia', color: '#e74c3c' },
      { name: 'BERKS', label: 'Berks', color: '#3498db' },
      { name: 'BUCKS', label: 'Bucks', color: '#2ecc71' },
      { name: 'CHESTER', label: 'Chester', color: '#f39c12' },
      { name: 'DELAWARE', label: 'Delaware', color: '#9b59b6' },
      { name: 'LANCASTER', label: 'Lancaster', color: '#1abc9c' },
      { name: 'MONTGOMERY', label: 'Montgomery', color: '#e67e22' },
      { name: 'SCHUYLKILL', label: 'Schuylkill', color: '#34495e' }
    ];

    const allVisible = Object.values(AppState.countyOutlines.visible).every(v => v);

    return `
      <div class="filter-section" data-section="filter-county-outlines">
        <div class="filter-section-title">
          <i class="bi bi-map-fill"></i>
          County Outlines
          <i class="bi bi-chevron-down accordion-icon"></i>
        </div>
        <div class="filter-options-wrapper">
          <div style="padding: 0 16px 12px 16px;">
            <button id="toggle-all-counties-btn" class="btn btn-sm btn-outline-primary w-100 mb-2" style="font-size: 12px;">
              ${allVisible ? 'Hide All' : 'Show All'}
            </button>
            <div class="county-checkbox-grid">
              ${counties.map(county => `
                <label class="county-checkbox-item">
                  <input
                    type="checkbox"
                    data-county="${county.name}"
                    ${AppState.countyOutlines.visible[county.name] ? 'checked' : ''}
                  />
                  <span class="county-color-box" style="background-color: ${county.color};"></span>
                  ${county.label}
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderActiveFilters() {
    const chips = this.getActiveFilterChips();

    if (chips.length === 0) return '';

    return `
      <div class="active-filters">
        <div class="active-filters-title">Active Filters:</div>
        <div class="filter-chips">
          ${chips.map(chip => `
            <span class="filter-chip">
              ${Utils.escapeHtml(chip.label)}
              <button
                class="filter-chip-remove"
                data-filter-type="${Utils.escapeHtml(chip.type)}"
                data-filter-value="${Utils.escapeHtml(chip.value)}"
              >×</button>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  getActiveFilterChips() {
    const chips = [];

    if (AppState.activeFilters.search) {
      chips.push({
        type: 'search',
        value: AppState.activeFilters.search,
        label: `"${AppState.activeFilters.search}"`
      });
    }

    ['County', 'Resource Type', 'Category', 'Populations Served'].forEach(filterType => {
      if (AppState.activeFilters[filterType]?.length > 0) {
        AppState.activeFilters[filterType].forEach(value => {
          chips.push({ type: filterType, value: value, label: value });
        });
      }
    });

    return chips;
  }

  getTotalFilterCount() {
    let count = 0;
    if (AppState.activeFilters.search) count++;
    ['County', 'Resource Type', 'Category', 'Populations Served'].forEach(filterType => {
      count += AppState.activeFilters[filterType]?.length || 0;
    });
    return count;
  }

  attachEventListeners() {
    // Accordion toggle listeners
    this._container.querySelectorAll('.filter-section-title').forEach(title => {
      title.addEventListener('click', (e) => {
        const section = e.currentTarget.closest('.filter-section');
        section.classList.toggle('expanded');
      });
    });

    // Filter checkbox listeners
    this._container.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const filterType = e.target.dataset.filterType;
        const value = e.target.value;
        const checked = e.target.checked;

        if (checked) {
          if (!AppState.activeFilters[filterType].includes(value)) {
            AppState.activeFilters[filterType].push(value);
          }
        } else {
          AppState.activeFilters[filterType] = AppState.activeFilters[filterType].filter(v => v !== value);
        }

        if (filterType === 'Resource Type') {
          FilterManager.updateCategoryDropdown();
        }

        FilterManager.syncDropdowns(filterType);
        APIClient.clearCache();
        this.updateData();
      });
    });

    // County outline checkbox listeners
    this._container.querySelectorAll('input[data-county]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const county = e.target.dataset.county;
        AppState.countyOutlines.visible[county] = e.target.checked;
        MapManager.updateCountyOutlineVisibility();
        Logger.log(`County outline toggled: ${county} = ${e.target.checked}`);
      });
    });

    // Toggle all counties button listener
    const toggleAllBtn = this._container.querySelector('#toggle-all-counties-btn');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const allChecked = Object.values(AppState.countyOutlines.visible).every(v => v);
        const newState = !allChecked;

        // Update state
        Object.keys(AppState.countyOutlines.visible).forEach(county => {
          AppState.countyOutlines.visible[county] = newState;
        });

        // Update map
        MapManager.updateCountyOutlineVisibility();

        // Re-render to update UI
        this.render();

        Logger.log(`All counties ${newState ? 'shown' : 'hidden'}`);
      });
    }

    // Filter chip remove listeners
    this._container.querySelectorAll('.filter-chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.filterType;
        const value = e.target.dataset.filterValue;

        if (type === 'search') {
          AppState.activeFilters.search = '';
          const searchInput = document.getElementById('map-search-input');
          if (searchInput) searchInput.value = '';
          DOM.searchInput.value = '';
        } else {
          AppState.activeFilters[type] = AppState.activeFilters[type].filter(v => v !== value);
        }

        FilterManager.syncDropdowns(type);
        this.updateData();
      });
    });
  }

  async updateData() {
    // Update county boundaries BEFORE rendering so checkboxes reflect correct state
    MapManager.updateCountyBoundaries();
    this.render();
    FilterManager.updateUI();
    DataManager.loadData();
  }

  updateActiveFilters() {
    // Update county boundaries BEFORE rendering so checkboxes reflect correct state
    MapManager.updateCountyBoundaries();
    this.render();
  }

  clearAll() {
    AppState.activeFilters = {
      search: '',
      County: [],
      'Resource Type': [],
      Category: [],
      'Populations Served': []
    };

    const searchInput = document.getElementById('map-search-input');
    if (searchInput) searchInput.value = '';
    DOM.searchInput.value = '';

    FilterManager.updateUI();
    this.updateData();
  }
}

/**
 * ResultsInfoControl - Displays resource count in fullscreen mode
 */
class ResultsInfoControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl results-info-control';
    this.update();

    // Store reference globally for updates
    window.resultsInfoControl = this;

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
    window.resultsInfoControl = null;
  }

  update() {
    const count = AppState.totalRows || 0;
    this._container.innerHTML = `
      <i class="bi bi-info-circle"></i> ${count} resource${count !== 1 ? 's' : ''} found
    `;
  }
}

/**
 * ExportControl - CSV export button in fullscreen mode
 */
class ExportControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('button');
    this._container.className = 'maplibregl-ctrl export-control';
    this._container.innerHTML = '<i class="bi bi-download"></i> Export CSV';

    this._container.addEventListener('click', () => this.exportToCSV());

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  exportToCSV() {
    ExportManager.exportToCSV();
  }
}

/**
 * NavigationButtonHelper - Adds Bootstrap icons to zoom buttons
 */
const NavigationButtonHelper = {
  addBootstrapIcons() {
    // Add Bootstrap icons to zoom buttons
    const zoomInBtn = document.querySelector('.maplibregl-ctrl-zoom-in');
    const zoomOutBtn = document.querySelector('.maplibregl-ctrl-zoom-out');

    if (zoomInBtn) {
      zoomInBtn.innerHTML = '<i class="bi bi-plus-lg"></i>';
      zoomInBtn.title = 'Zoom in';
    }

    if (zoomOutBtn) {
      zoomOutBtn.innerHTML = '<i class="bi bi-dash-lg"></i>';
      zoomOutBtn.title = 'Zoom out';
    }
  }
};

/**
 * FullscreenHelper - Adds fullscreen functionality to navigation control
 */
const FullscreenHelper = {
  _isFullscreen: false,
  _button: null,
  _map: null,

  addToNavigationControl(map) {
    this._map = map;

    // Find the navigation control group
    const navControl = document.querySelector('.maplibregl-ctrl-group');
    if (!navControl) {
      Logger.warn('Navigation control group not found');
      return;
    }

    // Create fullscreen button
    this._button = document.createElement('button');
    this._button.className = 'maplibregl-ctrl-icon maplibregl-ctrl-fullscreen';
    this._button.type = 'button';
    this._button.setAttribute('aria-label', 'Toggle fullscreen');
    this.updateButton();

    this._button.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());

    // Append to navigation control group
    navControl.appendChild(this._button);
  },

  toggleFullscreen() {
    const mapContainer = this._map.getContainer();

    if (!this._isFullscreen) {
      // Enter fullscreen
      if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
      } else if (mapContainer.webkitRequestFullscreen) {
        mapContainer.webkitRequestFullscreen();
      } else if (mapContainer.mozRequestFullScreen) {
        mapContainer.mozRequestFullScreen();
      } else if (mapContainer.msRequestFullscreen) {
        mapContainer.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  },

  handleFullscreenChange() {
    this._isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    // Add or remove fullscreen class from map container
    const mapContainer = this._map.getContainer();
    if (this._isFullscreen) {
      mapContainer.classList.add('is-fullscreen');
    } else {
      mapContainer.classList.remove('is-fullscreen');
    }

    this.updateButton();
  },

  updateButton() {
    if (!this._button) return;

    if (this._isFullscreen) {
      this._button.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
      this._button.setAttribute('aria-label', 'Exit fullscreen');
      this._button.title = 'Exit fullscreen';
    } else {
      this._button.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
      this._button.setAttribute('aria-label', 'Enter fullscreen');
      this._button.title = 'Enter fullscreen';
    }
  }
};

// Map Interaction Management
const MapInteraction = {
  /**
   * Animates the map to fly to a specific location and open its popup
   * @param {number} longitude - Longitude coordinate
   * @param {number} latitude - Latitude coordinate
   * @param {string|number} resourceId - ID of the resource to highlight
   */
  flyToLocation(longitude, latitude, resourceId) {
    if (!AppState.map || longitude == null || latitude == null) {
      Logger.warn("Cannot fly to location: missing map or coordinates");
      return;
    }
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (isNaN(lng) || isNaN(lat)) {
      Logger.warn("Invalid coordinates provided");
      return;
    }
    this.showMapFlyFeedback();
    AppState.map.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 1500,
      essential: true,
      offset: [0, -100]
    });
    setTimeout(() => {
      const marker = MapManager.markerMap.get(resourceId);
      if (marker) {
        const popup = marker.getPopup();
        if (popup) {
          if (popup.isOpen()) {
            popup.remove();
          }
          marker.togglePopup();
        } else {
          Logger.warn("Marker has no popup for resourceId:", resourceId);
        }
      } else {
        Logger.warn("Marker not found for resourceId:", resourceId);
      }
    }, 1600);
  },
  showMapFlyFeedback() {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #55298a;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      z-index: 9999;
      font-size: 0.9rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
      <i class="bi bi-geo-alt-fill me-2"></i>
      Flying to location on map...
    `;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "slideIn 0.3s ease-out reverse";
      setTimeout(() => {
        document.body.removeChild(notification);
        document.head.removeChild(style);
      }, 300);
    }, 2000);
  },
  handleTableRowClick(event) {
    if (event.target.closest("a, button") || event.target.onclick) {
      return;
    }
    const row = event.target.closest("tr.table-row-clickable");
    if (!row) return;
    const longitude = row.dataset.longitude;
    const latitude = row.dataset.latitude;
    const resourceId = row.dataset.resourceId;
    if (longitude && latitude) {
      this.flyToLocation(longitude, latitude, resourceId);
    }
  },
  handleMapFlyButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const button = event.target.closest(".map-fly-btn");
    if (!button || button.disabled) return;
    const longitude = button.dataset.longitude;
    const latitude = button.dataset.latitude;
    const resourceId = button.dataset.resourceId;
    if (longitude && latitude) {
      this.flyToLocation(longitude, latitude, resourceId);
    }
  }
};
// Map Manager
const MapManager = {
  markerMap: new Map(),
  countyBoundariesLoaded: false,
  fullCountyGeoJSON: null,
  getMarkerIcon(resourceType) {
    const base = 'assets/mapping/';
    switch (resourceType) {
      case 'Recovery Support':
        return base + 'markerRecoverySupport.png';
      case 'Family Support':
        return base + 'markerFamilySupport.png';
      case 'Housing':
        return base + 'markerHousing.png';
      case 'Transportation':
        return base + 'markerTransportation.png';
      default:
        return base + 'markerRecoverySupport.png';
    }
  },
  initialize() {
    Logger.log('🚀 Initializing map with OpenFreeMap Positron style...');

    AppState.map = new maplibregl.Map({
      container: "map",
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [-75.1652, 39.9526],
      zoom: 9,
      fadeDuration: 300
    });

    // Add navigation controls (zoom buttons only, no compass)
    AppState.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Add Bootstrap icons to zoom buttons
    NavigationButtonHelper.addBootstrapIcons();

    // Add fullscreen button to navigation control group
    FullscreenHelper.addToNavigationControl(AppState.map);

    // Wait for map to load before adding custom controls
    AppState.map.on('load', async () => {
      Logger.log('🗺️ Map loaded');

      // Load county boundaries
      await this.loadCountyGeoJSON();

      // Wait a bit to ensure style is fully ready
      setTimeout(() => {
        this.updateCountyOutlineVisibility();
        Logger.log('✅ County boundaries loaded');
      }, 100);

      // Add custom controls
      const searchControl = new SearchControl();
      AppState.map.addControl(searchControl, 'top-left');
      Logger.log('✅ SearchControl added');

      const filterPanelControl = new FilterPanelControl();
      AppState.map.addControl(filterPanelControl, 'top-left');
      Logger.log('✅ FilterPanelControl added');

      const resultsInfoControl = new ResultsInfoControl();
      AppState.map.addControl(resultsInfoControl, 'bottom-left');
      Logger.log('✅ ResultsInfoControl added');

      const exportControl = new ExportControl();
      AppState.map.addControl(exportControl, 'bottom-left');
      Logger.log('✅ ExportControl added');

      Logger.log('✅ Map initialization complete');

      // Trigger initial updates if data has already loaded
      // This ensures markers and county outlines show up even if data loaded before map was ready
      setTimeout(() => {
        if (AppState.currentData && AppState.currentData.length > 0) {
          Logger.log('🔄 Data already loaded, updating map...');
          this.updateMarkers();
        }
        // Always try to show county outlines on initial load
        this.updateCountyOutlineVisibility();
      }, 500);
    });
  },
  async loadCountyGeoJSON() {
    try {
      const response = await fetch('geojson-assets/counties.geojson');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.fullCountyGeoJSON = await response.json();
      Logger.log('✅ County GeoJSON loaded');
    } catch (error) {
      Logger.error('Failed to load county GeoJSON:', error);
    }
  },
  /**
   * Updates county outline visibility based on user toggles
   * Independent from filter state
   */
  updateCountyOutlineVisibility() {
    if (!this.fullCountyGeoJSON || !AppState.map) {
      Logger.warn('⚠️ Cannot update county outlines - missing GeoJSON or map');
      return;
    }
    Logger.log('🔄 Updating county outline visibility...');
    // Get counties that should be visible based on user toggles
    const visibleCounties = Object.entries(AppState.countyOutlines.visible)
      .filter(([county, visible]) => visible)
      .map(([county]) => county);
    Logger.log(`Visible counties: ${visibleCounties.join(', ')}`);
    // Create filtered GeoJSON with only visible counties
    const filteredGeoJSON = {
      type: 'FeatureCollection',
      features: this.fullCountyGeoJSON.features.filter(feature => {
        const countyName = (feature.properties.county_name || '').toUpperCase();
        return visibleCounties.includes(countyName);
      })
    };
    Logger.log(`Filtered to ${filteredGeoJSON.features.length} counties`);
    if (this.countyBoundariesLoaded) {
      // Update existing source
      const source = AppState.map.getSource('hub-counties');
      if (source) {
        source.setData(filteredGeoJSON);
        Logger.log('✅ Updated existing county boundaries');
      }
    } else {
      // Create source and layers for the first time
      Logger.log('🎨 Creating county boundary layers...');
     
      AppState.map.addSource('hub-counties', {
        type: 'geojson',
        data: filteredGeoJSON
      });
      AppState.map.addLayer({
        id: 'county-fills',
        type: 'fill',
        source: 'hub-counties',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.15
        }
      });
      AppState.map.addLayer({
        id: 'county-borders',
        type: 'line',
        source: 'hub-counties',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.8
        }
      });
      AppState.map.on('mouseenter', 'county-fills', () => {
        AppState.map.getCanvas().style.cursor = 'pointer';
      });
      AppState.map.on('mouseleave', 'county-fills', () => {
        AppState.map.getCanvas().style.cursor = '';
      });
      this.countyBoundariesLoaded = true;
      Logger.log('✅ County boundary layers created');
    }
    Logger.log(`✅ County outlines updated: ${visibleCounties.length} counties shown`);
  },
  updateCountyBoundaries() {
    // Sync county outline visibility with active county filters
    this.syncCountyOutlinesWithFilters();
    this.updateCountyOutlineVisibility();
  },
  /**
   * Syncs county outline visibility with active county filters
   * When county filters are active, show only those counties
   * When no county filters are active, show all counties
   */
  syncCountyOutlinesWithFilters() {
    const activeCountyFilters = AppState.activeFilters.County || [];

    if (activeCountyFilters.length > 0) {
      // Hide all counties first
      Object.keys(AppState.countyOutlines.visible).forEach(county => {
        AppState.countyOutlines.visible[county] = false;
      });

      // Show only filtered counties
      activeCountyFilters.forEach(countyName => {
        const countyKey = countyName.toUpperCase();
        if (AppState.countyOutlines.visible.hasOwnProperty(countyKey)) {
          AppState.countyOutlines.visible[countyKey] = true;
        }
      });

      // Note: UI checkboxes in FilterPanelControl will update via render()
      Logger.log(`✓ County outlines synced with filters: ${activeCountyFilters.join(', ')}`);
    } else {
      // No county filters active - show all counties
      Object.keys(AppState.countyOutlines.visible).forEach(county => {
        AppState.countyOutlines.visible[county] = true;
      });

      // Note: UI checkboxes in FilterPanelControl will update via render()
      Logger.log('✓ No county filters - showing all county outlines');
    }
  },
  async updateMarkers() {
    // Guard: ensure map is loaded and style is ready
    if (!AppState.map || !AppState.map.isStyleLoaded()) {
      Logger.warn("⚠️ Map not ready for markers yet");
      return;
    }
    try {
      // Build params with same filters as table/cards, but remove pagination
      // This ensures ALL matching resources appear on the map, not just the current page
      const params = DataManager.buildRequestParams();
      delete params.page; // Remove page parameter
      delete params.sort; // Remove sort - not needed for map display
      // Set a very high limit to get all results (API may have default limit)
      // TODO: Consider pagination or streaming for large datasets (>10,000 markers)
      // Current limit assumes reasonable dataset size for client-side rendering
      params.limit = 10000; // Request up to 10,000 markers (effectively unlimited)
      Logger.log('→ Fetching ALL map markers (no pagination):', params);
      const markerData = await APIClient.getMapMarkers(params);
      Logger.log(`✓ Received ${markerData.length} markers for map display`);
      if (!markerData || markerData.length === 0) {
        this.clearAllMarkers();
        this.centerOnPhiladelphia();
        return;
      }
      const currentMarkerIds = new Set(this.markerMap.keys());
      const newMarkerIds = new Set(markerData.map((d) => d.id).filter(Boolean));
      currentMarkerIds.forEach((id) => {
        if (!newMarkerIds.has(id)) {
          const marker = this.markerMap.get(id);
          marker.remove();
          this.markerMap.delete(id);
        }
      });
      const bounds = new maplibregl.LngLatBounds();
      let hasValidBounds = false;
      markerData.forEach((location) => {
        // Ensure every marker has a unique ID
        const markerId = location.id ?? `${location.lat},${location.lng}`;
        let marker = this.markerMap.get(markerId);
        const popup = this.createPopup(location);
        location.markerIcon = this.getMarkerIcon(location.resourceType);
        if (marker) {
          marker.setLngLat([location.lng, location.lat]);
          marker.setPopup(popup);
        } else {
          // Create custom marker element with icon image
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.backgroundImage = `url(${location.markerIcon})`;
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.backgroundSize = 'contain';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.cursor = 'pointer';

          // Create hover tooltip
          const hoverTooltip = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'dark-tooltip',
            offset: 15
          }).setHTML(`<strong>${location.name}</strong>`);

          marker = new maplibregl.Marker({ element: el })
            .setLngLat([location.lng, location.lat])
            .setPopup(popup)
            .addTo(AppState.map);

          // Add hover event listeners for tooltip
          el.addEventListener('mouseenter', () => {
            hoverTooltip.setLngLat([location.lng, location.lat]).addTo(AppState.map);
          });

          el.addEventListener('mouseleave', () => {
            hoverTooltip.remove();
          });

          this.markerMap.set(markerId, marker);
        }
        bounds.extend([location.lng, location.lat]);
        hasValidBounds = true;
      });
      if (hasValidBounds) {
        // Wait a moment to ensure map is properly displayed and resized before fitting bounds
        setTimeout(() => {
          if (markerData.length === 1) {
            Logger.log(`✓ Flying to single marker location`);
            AppState.map.flyTo({
              center: [markerData[0].lng, markerData[0].lat],
              zoom: 13,
              duration: 1000
            });
          } else {
            Logger.log(`✓ Fitting map bounds to show all ${markerData.length} markers`);
            AppState.map.fitBounds(bounds, {
              padding: { top: 80, bottom: 80, left: 80, right: 80 },
              maxZoom: 14,
              duration: 1000
            });
          }
        }, 300);
      }
    } catch (error) {
      Logger.error("Error updating map markers:", error);
      this.centerOnPhiladelphia();
    }
  },
  clearAllMarkers() {
    this.markerMap.forEach((marker) => marker.remove());
    this.markerMap.clear();
  },
  createPopup(location) {
    const popupContent = `
      <div class="map-popup-container" style="max-width: 300px;">
        <div class="row no-gutters py-0 px-1">
          <div class="card-body col-12 p-3">
            <h3 class="text-secondary fw-bold lh-1 py-0">${location.name}</h3>
            <h5 class="text-dark fw-light lh-1 py-0">${location.organization}</h5>
            <p class="text-body-tertiary lh-1 py-0 mb-1">${location.address}<br />
              ${location.city}, ${location.state}, ${location.zipCode}
            </p>
            <p class="mb-0">
              ${location.googleMapsUrl ? `<a class="text-primary fw-bold d-block mb-1" href="${location.googleMapsUrl}" target="_blank" rel="noopener noreferrer"><i class="bi bi-geo-alt-fill"></i> Directions</a>` : ""}
              ${location.website ? `<a class="text-primary d-block mb-1" href="${location.website}" target="_blank" rel="noopener noreferrer"><i class="bi bi-globe"></i> Website</a>` : ""}
              ${location.phone ? `<a class="text-primary text-decoration-none fw-bold d-block" href="tel:${location.phone}"><i class="bi bi-telephone-fill text-primary"></i> ${location.phone}</a>` : "N/A"}
            </p>
          </div>
        </div>
      </div>`;
    return new maplibregl.Popup({ offset: 25, maxWidth: "320px" }).setHTML(popupContent);
  },
  centerOnPhiladelphia() {
    AppState.map.flyTo({
      center: [-75.1652, 39.9526],
      zoom: 9
    });
  }
};
// Column Resizing
const ColumnResizer = {
  initialize() {
    const headers = document.querySelectorAll("thead th");
    headers.forEach((header) => {
      const resizeHandle = document.createElement("div");
      resizeHandle.className = "resize-handle";
      resizeHandle.title = "Drag to resize column";
      header.appendChild(resizeHandle);
      this.setupResizeHandlers(header, resizeHandle);
    });
  },
  setupResizeHandlers(header, resizeHandle) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    resizeHandle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startWidth = header.offsetWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      header.style.borderRight = "2px solid #20cb98";
      document.addEventListener("selectstart", this.preventSelection);
    });
    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      e.preventDefault();
      const diff = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);
      header.style.width = newWidth + "px";
      header.style.minWidth = newWidth + "px";
      header.style.maxWidth = newWidth + "px";
    });
    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        header.style.borderRight = "1px solid rgba(255, 255, 255, 0.2)";
        document.removeEventListener("selectstart", this.preventSelection);
      }
    });
    resizeHandle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  },
  preventSelection(e) {
    e.preventDefault();
    return false;
  }
};
// Sorting
const SortManager = {
  initialize() {
    document.querySelectorAll("th.sortable").forEach((th) => {
      th.addEventListener("click", (e) => {
        if (!e.target.closest(".filter-dropdown") && !e.target.closest(".resize-handle")) {
          this.handleSort(th.dataset.column);
        }
      });
    });
  },
  handleSort(column) {
    if (AppState.currentSort === column) {
      AppState.sortDirection = AppState.sortDirection === "asc" ? "desc" : "asc";
    } else {
      AppState.currentSort = column;
      AppState.sortDirection = "asc";
    }
    this.updateSortIndicators();
    AppState.currentPage = 1;
    DataManager.loadData();
  },
  updateSortIndicators() {
    document.querySelectorAll("th.sortable").forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc");
    });
    const sortedTh = document.querySelector(`th[data-column="${AppState.currentSort}"]`);
    if (sortedTh) {
      sortedTh.classList.add(AppState.sortDirection === "asc" ? "sort-asc" : "sort-desc");
    }
  },
  clearSort() {
    AppState.currentSort = "";
    AppState.sortDirection = "asc";
    document.querySelectorAll("th.sortable").forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc");
    });
  }
};
// Export functionality
const ExportManager = {
  exportToCSV() {
    const params = DataManager.buildRequestParams();
    delete params.page;
    delete params.limit;
   
    const url = new URL(CONFIG.ENDPOINTS.export, CONFIG.API_BASE_URL);
    Object.keys(params).forEach((key) => {
      if (Array.isArray(params[key])) {
        params[key].forEach((value) => url.searchParams.append(key, value));
      } else if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
        url.searchParams.append(key, params[key]);
      }
    });
    window.open(url.toString(), '_blank');
  }
}
// County Card Management
const CountyCardManager = {
  initialize() {
    this.setupEventListeners();
  },
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const countyCard = e.target.closest('.county-card');
      if (countyCard) {
        e.preventDefault();
        this.handleCountyCardClick(countyCard);
      }
    });
    const allCountiesLink = document.getElementById('allCounties');
    if (allCountiesLink) {
      allCountiesLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSeeAllCountiesClick();
      });
    }
  },
  handleCountyCardClick(card) {
    const county = card.dataset.county;
    if (!county) return;
    AppState.activeFilters.County = [county];
    AppState.activeFilters.search = "";
    DOM.searchInput.value = "";
    AppState.currentPage = 1;
    APIClient.clearCache();
    FilterManager.syncDropdowns('County');
    FilterManager.updateUI();
    ResultsManager.showResultsSection();
    DataManager.loadData();
  },
  handleSeeAllCountiesClick() {
    AppState.activeFilters = {
      search: "",
      County: [],
      "Resource Type": [],
      "Populations Served": [],
      Category: []
    };
    DOM.searchInput.value = "";
    AppState.currentPage = 1;
    APIClient.clearCache();
    FilterManager.clearAll();
    ResultsManager.showResultsSection();
    DataManager.loadData();
  },
  hideCountySearch() {
    // No-op: county search stays visible
  },
  showCountySearch() {
    // No-op: county search stays visible
  }
};
// Event Handlers
const EventHandlers = {
  initialize() {
    if (DOM.searchBtn) {
      DOM.searchBtn.addEventListener("click", this.handleSearch);
    }
   
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.handleSearch();
        }
      });
      DOM.searchInput.addEventListener(
        "input",
        Utils.debounce(() => {
          const resultsSection = document.getElementById('results');
          if (resultsSection && resultsSection.classList.contains('show')) {
            this.handleSearch();
          }
        }, CONFIG.DEBOUNCE_DELAY)
      );
    }
    if (DOM.perPageSelect) {
      DOM.perPageSelect.addEventListener("change", this.handlePerPageChange);
    }
   
    if (DOM.clearFiltersBtn) {
      DOM.clearFiltersBtn.addEventListener("click", this.handleClearFilters);
    }
   
    if (DOM.exportBtn) {
      DOM.exportBtn.addEventListener("click", () => ExportManager.exportToCSV());
    }
    document.addEventListener("click", (e) => {
      if (e.target.closest("tr.table-row-clickable")) {
        MapInteraction.handleTableRowClick(e);
      }
      if (e.target.closest(".map-fly-btn")) {
        MapInteraction.handleMapFlyButtonClick(e);
      }
      if (e.target.closest(".dropdown-item-check")) {
        e.stopPropagation();
      }
    });
    document.addEventListener('click', (e) => {
      const categoryLink = e.target.closest('[data-category]');
      if (categoryLink) {
        e.preventDefault();
        this.handleCategoryLinkClick(categoryLink);
      }
    });
    const mobileFilterToggleBtn = document.getElementById("mobile-filter-toggle-btn");
    const filterControlsContainer = document.getElementById("filter-controls-container");
    if (mobileFilterToggleBtn && filterControlsContainer) {
      mobileFilterToggleBtn.addEventListener("click", () => {
        filterControlsContainer.classList.toggle("show");
        const isShown = filterControlsContainer.classList.contains("show");
        if (isShown) {
          mobileFilterToggleBtn.innerHTML = '<i class="bi bi-funnel-fill me-1"></i>Hide Filters';
        } else {
          mobileFilterToggleBtn.innerHTML = '<i class="bi bi-funnel me-1"></i>Filters';
        }
      });
    }
    CountyCardManager.initialize();
  },
  handleSearch() {
    AppState.activeFilters.search = DOM.searchInput.value.trim();
    AppState.currentPage = 1;
    APIClient.clearCache();
    ResultsManager.showResultsSection();
    FilterManager.updateFilterChips();

    // Sync with map SearchControl
    if (window.searchControl && window.searchControl._input) {
      window.searchControl._input.value = AppState.activeFilters.search;
    }

    DataManager.loadData();
  },
  handlePerPageChange() {
    AppState.recordsPerPage = parseInt(DOM.perPageSelect.value);
    AppState.currentPage = 1;
    DataManager.loadData();
  },
  handleClearFilters() {
    FilterManager.clearAll();
    SortManager.clearSort();
    AppState.currentPage = 1;
  },
  handleCategoryLinkClick(element) {
    const category = element.dataset.category;
    if (!category) return;
    AppState.activeFilters = {
      search: "",
      County: [],
      "Resource Type": [],
      "Populations Served": [],
      Category: [category]
    };
    DOM.searchInput.value = "";
    AppState.currentPage = 1;
    APIClient.clearCache();
    FilterManager.syncDropdowns('Category');
    FilterManager.updateUI();
    ResultsManager.showResultsSection();
    DataManager.loadData();
  }
};
// County Outline Management
const CountyOutlineManager = {
  initialize() {
    // Individual county toggles
    document.querySelectorAll('#county-outline-controls input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const county = e.target.dataset.county;
        AppState.countyOutlines.visible[county] = e.target.checked;
        MapManager.updateCountyOutlineVisibility();
      });
    });
    // Toggle all button
    const toggleAllBtn = document.getElementById('toggle-all-counties');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        const allChecked = Object.values(AppState.countyOutlines.visible).every(v => v);
        const newState = !allChecked;
       
        // Update state
        Object.keys(AppState.countyOutlines.visible).forEach(county => {
          AppState.countyOutlines.visible[county] = newState;
        });
       
        // Update UI checkboxes
        document.querySelectorAll('#county-outline-controls input[type="checkbox"]').forEach(cb => {
          cb.checked = newState;
        });
       
        // Update map
        MapManager.updateCountyOutlineVisibility();
       
        // Update button text
        toggleAllBtn.textContent = newState ? 'Hide All' : 'Show All';
      });
    }
  }
};
// Application Initialization
async function initializeApp() {
  try {
    DOM.init();
    ViewManager.initialize();
    MapManager.initialize();
    ColumnResizer.initialize();
    SortManager.initialize();
    EventHandlers.initialize();
    // CountyOutlineManager.initialize(); // Disabled - now integrated into FilterPanelControl
    await FilterManager.loadFilterOptions();

    Logger.log("✓ Application initialized.");

    // Load initial data to populate results section
    await DataManager.loadData();
    Logger.log("✓ Initial data loaded.");

  } catch (error) {
    Logger.error("Failed to initialize application:", error);
    Utils.hideLoading();
    Logger.error("Failed to initialize application");
  }
}
document.addEventListener("DOMContentLoaded", initializeApp);
window.PaginationManager = PaginationManager;
window.FilterManager = FilterManager;
window.CountyCardManager = CountyCardManager;
window.ResultsManager = ResultsManager;
