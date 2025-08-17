// Netflix-Style Media Grid JavaScript
class NetflixInterface {
  constructor() {
    this.currentRow = 0;
    this.currentItem = 0;
    this.rows = [];
    this.init();
  }

  init() {
    this.setupRows();
    this.setupNavigation();
    this.setupMediaHandlers();
    this.preloadContent();
  }

  setupRows() {
    this.rows = Array.from(document.querySelectorAll('.content-row'));
    this.rows.forEach((row, index) => {
      const items = row.querySelectorAll('.media-item');
      items.forEach((item, itemIndex) => {
        item.dataset.rowIndex = index;
        item.dataset.itemIndex = itemIndex;
      });
    });
  }

  setupNavigation() {
    // Enhanced navigation for media grid
    document.addEventListener('tv-nav-navigate', (e) => {
      const { direction, from, to } = e.detail;
      
      if (direction === 'right' && this.isLastItemInRow(from)) {
        this.scrollRowRight(from);
      } else if (direction === 'left' && this.isFirstItemInRow(from)) {
        this.scrollRowLeft(from);
      }
      
      // Auto-scroll hero banner based on navigation
      if (this.isInHeroSection(to)) {
        this.updateHeroBanner(to);
      }
    });

    // Page navigation with shoulder buttons
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PageDown' || e.code === 'ShoulderRight') {
        this.navigateToNextRow();
      } else if (e.key === 'PageUp' || e.code === 'ShoulderLeft') {
        this.navigateToPreviousRow();
      }
    });
  }

  setupMediaHandlers() {
    // Handle media selection
    document.addEventListener('tv-nav-activate', (e) => {
      const element = e.detail.element;
      
      if (element.classList.contains('media-item')) {
        this.selectMedia(element);
      } else if (element.classList.contains('btn-play')) {
        this.playMedia();
      } else if (element.classList.contains('btn-info')) {
        this.showMediaInfo();
      }
    });
  }

  selectMedia(mediaElement) {
    const movieId = mediaElement.dataset.movieId;
    const movieData = this.getMovieData(movieId);
    
    // Update hero section with selected media
    this.updateHeroWithMedia(movieData);
    
    // Show detailed overlay
    this.showMediaDetails(movieData);
    
    // Play preview after delay
    setTimeout(() => {
      this.playPreview(movieId);
    }, 2000);
  }

  scrollRowRight(currentElement) {
    const row = currentElement.closest('.content-row');
    const container = row.querySelector('.carousel-container');
    const itemWidth = 308; // 300px + 8px gap
    
    const currentTransform = this.getTransformX(container);
    const newTransform = currentTransform - itemWidth;
    
    container.style.transform = `translateX(${newTransform}px)`;
    
    // Load more content if near end
    this.lazyLoadMoreContent(row);
  }

  scrollRowLeft(currentElement) {
    const row = currentElement.closest('.content-row');
    const container = row.querySelector('.carousel-container');
    const itemWidth = 308;
    
    const currentTransform = this.getTransformX(container);
    const newTransform = Math.min(currentTransform + itemWidth, 0);
    
    container.style.transform = `translateX(${newTransform}px)`;
  }

  navigateToNextRow() {
    const currentSection = this.getCurrentSection();
    const nextSection = this.getNextSection(currentSection);
    
    if (nextSection) {
      const firstItem = nextSection.querySelector('.media-item.tv-nav-focusable');
      if (firstItem) {
        tvNav.setFocus(firstItem);
        this.updateBreadcrumb(nextSection.dataset.section);
      }
    }
  }

  navigateToPreviousRow() {
    const currentSection = this.getCurrentSection();
    const prevSection = this.getPreviousSection(currentSection);
    
    if (prevSection) {
      const firstItem = prevSection.querySelector('.media-item.tv-nav-focusable');
      if (firstItem) {
        tvNav.setFocus(firstItem);
        this.updateBreadcrumb(prevSection.dataset.section);
      }
    }
  }

  lazyLoadMoreContent(row) {
    const container = row.querySelector('.carousel-container');
    const items = container.querySelectorAll('.media-item');
    const lastItem = items[items.length - 1];
    
    // Load more if near the end
    if (this.isNearEnd(container, lastItem)) {
      this.loadMoreItems(row);
    }
  }

  async loadMoreItems(row) {
    const section = row.dataset.section;
    const currentCount = row.querySelectorAll('.media-item').length;
    
    try {
      const newItems = await this.fetchMoreContent(section, currentCount);
      this.appendItemsToRow(row, newItems);
    } catch (error) {
      console.error('Failed to load more content:', error);
    }
  }

  async fetchMoreContent(section, offset) {
    // Simulate API call
    const response = await fetch(`/api/content/${section}?offset=${offset}&limit=10`);
    return await response.json();
  }

  appendItemsToRow(row, items) {
    const container = row.querySelector('.carousel-container');
    
    items.forEach((item, index) => {
      const mediaElement = this.createMediaItem(item);
      container.appendChild(mediaElement);
      
      // Make it focusable
      tvNav.addFocusableElement(mediaElement);
    });
  }

  createMediaItem(itemData) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item tv-nav-focusable';
    mediaItem.dataset.movieId = itemData.id;
    
    mediaItem.innerHTML = `
      <img src="${itemData.thumbnail}" alt="${itemData.title}" loading="lazy">
      <div class="media-overlay">
        <h4>${itemData.title}</h4>
        <div class="media-meta">
          <span class="rating">⭐ ${itemData.rating}</span>
          <span class="year">${itemData.year}</span>
          <span class="duration">${itemData.duration}</span>
        </div>
        <div class="media-actions">
          <button class="btn-play-small">▶️</button>
          <button class="btn-add">+</button>
          <button class="btn-like">👍</button>
        </div>
      </div>
    `;
    
    return mediaItem;
  }

  // Utility methods
  getTransformX(element) {
    const transform = element.style.transform;
    if (!transform) return 0;
    
    const match = transform.match(/translateX\((-?\d+)px\)/);
    return match ? parseInt(match[1]) : 0;
  }

  isLastItemInRow(element) {
    const row = element.closest('.content-row');
    const items = row.querySelectorAll('.media-item');
    return element === items[items.length - 1];
  }

  isFirstItemInRow(element) {
    const row = element.closest('.content-row');
    const firstItem = row.querySelector('.media-item');
    return element === firstItem;
  }

  getCurrentSection() {
    return tvNav.currentFocus?.closest('.content-row');
  }

  getNextSection(currentSection) {
    return currentSection?.nextElementSibling;
  }

  getPreviousSection(currentSection) {
    return currentSection?.previousElementSibling;
  }

  updateBreadcrumb(sectionName) {
    tvNav.updateBreadcrumb(`${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`);
  }
}

// Initialize Netflix Interface
document.addEventListener('tv-nav-ready', () => {
  const netflixInterface = new NetflixInterface();
  window.netflixInterface = netflixInterface;
});