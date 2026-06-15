// app.js - Simba Supermarket E-Commerce App

// Define the 11 branches requested
const BRANCHES = [
  "HQ Centenary", 
  "Gishushu", 
  "Kimironko", 
  "Kicukiro", 
  "Kigali Heights", 
  "UTC", 
  "Gacuriro", 
  "Gikondo", 
  "Sonatube", 
  "Kisimenti", 
  "Rebero"
];

// Application State
const state = {
  user: JSON.parse(localStorage.getItem('simba_user')) || null,
  cart: JSON.parse(localStorage.getItem('simba_cart')) || [],
  selectedBranch: localStorage.getItem('simba_branch') || 'All Branches',
  searchQuery: '',
  selectedCategory: 'All',
  products: [],
  currentPage: 'home',
  loadedCount: 24,
  lastOrder: null,
  language: localStorage.getItem('simba_language') || 'en',
  translations: {},
  theme: localStorage.getItem('simba_theme') || 'light',
  orders: [],
  dashboardTab: 'orders',
  // New feature state
  priceMin: 0,
  priceMax: 999999,
  sortBy: 'relevance',
  availabilityFilter: 'all',
  wishlist: JSON.parse(localStorage.getItem('simba_wishlist')) || [],
  selectedDeliveryZone: localStorage.getItem('simba_zone') || 'Gasabo'
};

// Map each product deterministically to multiple branches using its ID (among the 11 branches)
function getProductBranches(productId) {
  const result = [];
  const hash1 = productId % BRANCHES.length;
  result.push(BRANCHES[hash1]);

  if (productId % 2 === 0) {
    const hash2 = (productId + 2) % BRANCHES.length;
    if (hash2 !== hash1) result.push(BRANCHES[hash2]);
  }

  if (productId % 3 === 0) {
    const hash3 = (productId + 5) % BRANCHES.length;
    if (hash3 !== hash1 && !result.includes(BRANCHES[hash3])) {
      result.push(BRANCHES[hash3]);
    }
  }

  return result;
}

// Global UI Elements Selector
const el = {
  homeView: document.getElementById('view-home'),
  aboutView: document.getElementById('view-about'),
  contactView: document.getElementById('view-contact'),
  cartView: document.getElementById('view-cart'),
  authView: document.getElementById('view-auth'),
  checkoutView: document.getElementById('view-checkout'),
  confirmationView: document.getElementById('view-confirmation'),
  dashboardView: document.getElementById('view-dashboard'),
  profileView: document.getElementById('view-profile'),
  wishlistView: document.getElementById('view-wishlist'),
  promotionsView: document.getElementById('view-promotions'),

  homeNavBtn: document.getElementById('nav-home-btn'),
  aboutNavBtn: document.getElementById('nav-about-btn'),
  contactNavBtn: document.getElementById('nav-contact-btn'),
  dashboardNavBtn: document.getElementById('nav-dashboard-btn'),
  cartBadge: document.getElementById('cart-badge'),
  accountNavBtn: document.getElementById('nav-account-btn'),
  branchSelector: document.getElementById('branch-select'),
  searchInput: document.getElementById('search-input'),
  langSelector: document.getElementById('lang-select'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),

  productsGrid: document.getElementById('products-grid'),
  categoryList: document.getElementById('categories-list'),
  productCount: document.getElementById('product-count'),
  loadMoreContainer: document.getElementById('load-more-container'),
  cartItemsList: document.getElementById('cart-items-list'),
  cartSummaryContainer: document.getElementById('cart-summary-container'),

  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginTab: document.getElementById('tab-login'),
  registerTab: document.getElementById('tab-register'),

  loadingOverlay: document.getElementById('loading-overlay'),
  toastContainer: document.getElementById('toast-container')
};

// Initialize Application
async function init() {
  showGlobalLoading(true);

  // Respect OS dark mode preference on first load
  if (!localStorage.getItem('simba_theme')) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark';
      localStorage.setItem('simba_theme', 'dark');
    }
  }

  // Apply theme
  if (state.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  el.langSelector.value = state.language;
  // Load Translations
  await loadTranslations(state.language);
  
  // Load orders database
  seedOrdersIfNeeded();
  
  setupEventListeners();
  updateAuthNavigation();
  updateCartBadge();
  
  // Load selected branch selector
  el.branchSelector.value = state.selectedBranch;
  
  try {
    const response = await fetch('simba_products.json');
    if (!response.ok) throw new Error('Failed to load products database');
    const data = await response.json();
    
    // Assign branches to each product
    state.products = data.products.map(p => ({
      ...p,
      branches: getProductBranches(p.id)
    }));
    
    renderCategoryDropdown();
    renderProducts();
    renderBranchesListInContact();
  } catch (error) {
    console.error(error);
    showToast('Failed to load products database.', 'error');
  } finally {
    showGlobalLoading(false);
  }
  
  initGoogleSignIn();

  // Register service worker (PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// Load Translation JSON files
async function loadTranslations(lang) {
  state.language = lang;
  localStorage.setItem('simba_language', lang);
  try {
    const response = await fetch(`${lang}.json`);
    if (!response.ok) throw new Error(`Could not load translations for ${lang}`);
    state.translations = await response.json();
    translatePage();
  } catch (error) {
    console.error(error);
    showToast(`Failed loading language translation.`, 'error');
  }
}

// Translate dynamic nodes in the DOM using translation properties
function translatePage() {
  // Elements with text translations
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const trans = state.translations[key];
    if (trans) el.innerHTML = trans;
  });
  
  // Inputs with placeholder translations
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const trans = state.translations[key];
    if (trans) el.placeholder = trans;
  });
}

// Seed mock orders for Representative dashboard metrics
function seedOrdersIfNeeded() {
  let orders = JSON.parse(localStorage.getItem('simba_orders'));
  if (!orders || orders.length === 0) {
    orders = [
      {
        orderId: "SMB-826315",
        customerName: "Aimable Nshuti",
        email: "nshuti@gmail.com",
        phone: "+250 788 401 202",
        branch: "Kigali Heights",
        amount: 32600,
        status: "pending",
        items: [{ product: { name: "Gorilla's Coffee Powder 250g", price: 6900 }, quantity: 2 }, { product: { name: "Basso Extra Virgin Olive oil 500ml", price: 13300 }, quantity: 1 }],
        date: "2026-06-11"
      },
      {
        orderId: "SMB-918237",
        customerName: "Marie Claire",
        email: "marie@yahoo.fr",
        phone: "+250 783 910 112",
        branch: "UTC",
        amount: 19600,
        status: "paid",
        items: [{ product: { name: "R.S Rafael Salgado Olive oil 1Ltr", price: 19600 }, quantity: 1 }],
        date: "2026-06-11"
      },
      {
        orderId: "SMB-273615",
        customerName: "John Smith",
        email: "jsmith@google.com",
        phone: "+250 782 110 220",
        branch: "Gishushu",
        amount: 9900,
        status: "delivered",
        items: [{ product: { name: "Nestle Lactogen No 1 Baby Milk 400g", price: 9900 }, quantity: 1 }],
        date: "2026-06-10"
      },
      {
        orderId: "SMB-635198",
        customerName: "Innocent Kabera",
        email: "kabera@live.com",
        phone: "+250 789 223 344",
        branch: "Kimironko",
        amount: 60000,
        status: "pending",
        items: [{ product: { name: "Sutai Electric Pan ST-903", price: 30000 }, quantity: 2 }],
        date: "2026-06-11"
      },
      {
        orderId: "SMB-112233",
        customerName: "Kezia Rugwiro",
        email: "kezia@domain.rw",
        phone: "+250 788 123 456",
        branch: "Kicukiro",
        amount: 15500,
        status: "paid",
        items: [{ product: { name: "Aviation Remote Controlled Plane", price: 15500 }, quantity: 1 }],
        date: "2026-06-09"
      }
    ];
    localStorage.setItem('simba_orders', JSON.stringify(orders));
  }
  state.orders = orders;
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation tabs routing
  el.homeNavBtn.addEventListener('click', (e) => { e.preventDefault(); navigate('home'); });
  el.aboutNavBtn.addEventListener('click', (e) => { e.preventDefault(); navigate('about'); });
  el.contactNavBtn.addEventListener('click', (e) => { e.preventDefault(); navigate('contact'); });
  el.dashboardNavBtn.addEventListener('click', (e) => { e.preventDefault(); navigate('dashboard'); });
  
  document.getElementById('nav-cart-btn').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('cart');
  });
  
  el.accountNavBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.user) {
      if (confirm(state.language === 'en' ? 'Are you sure you want to log out?' : state.language === 'rw' ? 'Urayobora gusohoka?' : 'Voulez-vous vraiment vous déconnecter?')) {
        logoutUser();
      }
    } else {
      navigate('auth');
    }
  });

  // Language selector
  el.langSelector.addEventListener('change', async (e) => {
    showGlobalLoading(true);
    await loadTranslations(e.target.value);
    // Refresh product list grid to translate button states
    renderProducts();
    if (state.currentPage === 'dashboard') {
      renderDashboard();
    }
    showGlobalLoading(false);
    showToast(state.language === 'en' ? 'Language switched to English' : state.language === 'rw' ? 'Ururimi rwahindutse Kinyarwanda' : 'Langue changée en Français', 'success');
  });

  // Light/Dark Mode toggle button
  el.themeToggleBtn.addEventListener('click', () => {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
      body.classList.remove('dark-mode');
      state.theme = 'light';
    } else {
      body.classList.add('dark-mode');
      state.theme = 'dark';
    }
    localStorage.setItem('simba_theme', state.theme);
    showToast(state.theme === 'dark' ? 'Dark Mode Activated' : 'Light Mode Activated', 'success');
  });

  // Real-time search query
  el.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    state.loadedCount = 24; // Reset pagination count on search
    renderProducts();
  });
  
  // Branch filter selector
  el.branchSelector.addEventListener('change', (e) => {
    state.selectedBranch = e.target.value;
    localStorage.setItem('simba_branch', state.selectedBranch);
    
    showGlobalLoading(true);
    setTimeout(() => {
      state.loadedCount = 24;
      renderProducts();
      showGlobalLoading(false);
      showToast(`${state.translations.branch_select_title || 'Branch'}: ${state.selectedBranch}`, 'success');
    }, 450);
  });
  
  // Auth Form tabs toggle
  el.loginTab.addEventListener('click', () => switchAuthTab('login'));
  el.registerTab.addEventListener('click', () => switchAuthTab('register'));
  
  // Forms submissions
  el.loginForm.addEventListener('submit', handleLoginSubmit);
  el.registerForm.addEventListener('submit', handleRegisterSubmit);
  
  // Google sign in simulation
  document.getElementById('btn-google-login').addEventListener('click', handleGoogleLogin);
  document.getElementById('btn-google-register').addEventListener('click', handleGoogleLogin);
  
  // Checkout Form Submission
  document.getElementById('checkout-form').addEventListener('submit', handleCheckoutSubmit);
  
  // Payment option toggles
  const paymentCards = document.querySelectorAll('.payment-option-card');
  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      document.getElementById('selected-payment-method').value = card.dataset.method;
    });
  });
  
  // Representative Dashboard tabs listeners
  document.getElementById('dash-tab-orders').addEventListener('click', () => switchDashboardTab('orders'));
  document.getElementById('dash-tab-inventory').addEventListener('click', () => switchDashboardTab('inventory'));
  document.getElementById('dash-tab-analytics').addEventListener('click', () => switchDashboardTab('analytics'));
  
  // Toggle Category Dropdown Menu
  const catBtn = document.getElementById('category-dropdown-btn');
  const catMenu = document.getElementById('category-dropdown-menu');
  if (catBtn && catMenu) {
    catBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      catMenu.classList.toggle('show');
    });
    window.addEventListener('click', () => {
      catMenu.classList.remove('show');
    });
  }

  // Dashboard Login Gate form
  const gateForm = document.getElementById('gate-login-form');
  if (gateForm) {
    gateForm.addEventListener('submit', handleGateLoginSubmit);
  }

  // Recurring order toggle
  const recurringCheck = document.getElementById('recurring-order');
  if (recurringCheck) {
    recurringCheck.addEventListener('change', function () {
      const opts = document.getElementById('recurring-options');
      if (opts) opts.style.display = this.checked ? 'block' : 'none';
    });
  }

  // Mobile hamburger menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // Feedback form type chips
  const feedbackTypeRow = document.getElementById('feedback-type-row');
  if (feedbackTypeRow) {
    feedbackTypeRow.addEventListener('click', (e) => {
      const chip = e.target.closest('.feedback-type-chip');
      if (!chip) return;
      feedbackTypeRow.querySelectorAll('.feedback-type-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('feedback-type-value').value = chip.dataset.type;
    });
  }

  // Feedback rating stars
  const starsContainer = document.getElementById('feedback-rating');
  if (starsContainer) {
    starsContainer.addEventListener('click', (e) => {
      const star = e.target.closest('.rating-star');
      if (!star) return;
      const val = parseInt(star.dataset.val);
      document.getElementById('feedback-rating-value').value = val;
      starsContainer.querySelectorAll('.rating-star').forEach((s, i) => {
        s.classList.toggle('active', i < val);
      });
    });
    // Keyboard support
    starsContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
      }
    });
  }
}

// Router routing manager
function navigate(page) {
  state.currentPage = page;
  updateHash(page);

  // Hide all views
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-links .nav-btn').forEach(btn => btn.classList.remove('active'));

  if (page === 'home') {
    el.homeView.classList.add('active');
    renderProducts();
  } else if (page === 'about') {
    el.aboutView.classList.add('active');
    el.aboutNavBtn.classList.add('active');
  } else if (page === 'contact') {
    el.contactView.classList.add('active');
    el.contactNavBtn.classList.add('active');
  } else if (page === 'cart') {
    el.cartView.classList.add('active');
    renderCart();
  } else if (page === 'auth') {
    el.authView.classList.add('active');
  } else if (page === 'checkout') {
    el.checkoutView.classList.add('active');
    renderCheckoutSummary();
  } else if (page === 'confirmation') {
    el.confirmationView.classList.add('active');
    renderOrderConfirmation();
  } else if (page === 'profile') {
    if (!state.user) { navigate('auth'); return; }
    if (el.profileView) { el.profileView.classList.add('active'); renderProfile(); }
  } else if (page === 'wishlist') {
    if (el.wishlistView) { el.wishlistView.classList.add('active'); renderWishlist(); }
  } else if (page === 'promotions') {
    if (el.promotionsView) { el.promotionsView.classList.add('active'); renderPromotions(); }
  } else if (page === 'dashboard') {
    el.dashboardView.classList.add('active');
    el.dashboardNavBtn.classList.add('active');
    const gate = document.getElementById('dashboard-login-gate');
    const content = document.getElementById('dashboard-content');
    if (!state.user || state.user.role !== 'representative') {
      gate.style.display = 'block';
      content.style.display = 'none';
    } else {
      gate.style.display = 'none';
      content.style.display = 'block';
      renderDashboard();
    }
  }

  if (page === 'home') {
    el.homeNavBtn.classList.add('hidden');
  } else {
    el.homeNavBtn.classList.remove('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMobileMenu();
}

// Kigali delivery zones
const KIGALI_ZONES = {
  'Nyarugenge': { fee: 1000, label: 'Nyarugenge (City Centre)' },
  'Gasabo':     { fee: 1500, label: 'Gasabo (Remera, Kimironko)' },
  'Kicukiro':   { fee: 1500, label: 'Kicukiro (Gikondo, Sonatube)' },
  'Bugesera':   { fee: 3000, label: 'Bugesera' },
  'Rwamagana':  { fee: 3500, label: 'Rwamagana' },
  'Musanze':    { fee: 5000, label: 'Musanze (Northern)' },
  'Huye':       { fee: 5000, label: 'Huye (Southern)' },
  'Pickup':     { fee: 0,    label: 'Store Pickup (Free)' }
};

function getDeliveryFee() {
  const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  if (subtotal >= 50000) return 0;
  if (subtotal === 0) return 0;
  const zone = KIGALI_ZONES[state.selectedDeliveryZone];
  return zone ? zone.fee : 1500;
}

// Stock level helper
function getStockLevel(product) {
  if (!product.inStock) return { level: 'outofstock', label: 'Out of Stock', emoji: '🔴' };
  if (product.id % 10 <= 2) return { level: 'lowstock', label: 'Low Stock', emoji: '🟡' };
  return { level: 'instock', label: 'In Stock', emoji: '🟢' };
}

// Products list branch availability filter
function getFilteredProducts() {
  let filtered = state.products.filter(product => {
    // Availability filter (if 'instock' only show inStock products, else show all)
    if (state.availabilityFilter === 'instock' && !product.inStock) return false;

    // Branch filter
    if (state.selectedBranch !== 'All Branches' && !product.branches.includes(state.selectedBranch)) return false;

    // Category filter
    if (state.selectedCategory !== 'All' && product.category !== state.selectedCategory) return false;

    // Price range filter
    if (product.price < state.priceMin || product.price > state.priceMax) return false;

    // Search query
    if (state.searchQuery) {
      const q = state.searchQuery;
      if (!product.name.toLowerCase().includes(q) && !product.category.toLowerCase().includes(q)) return false;
    }

    return true;
  });

  // Sort
  if (state.sortBy === 'price-asc')  filtered.sort((a, b) => a.price - b.price);
  else if (state.sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (state.sortBy === 'name-asc')  filtered.sort((a, b) => a.name.localeCompare(b.name));

  return filtered;
}

// Render Products Grid Cards (padding: 16px, margin: 12px, image size >= 200px object-fit cover)
function renderProducts() {
  const filtered = getFilteredProducts();
  const foundText = state.translations.products_found || "products found";
  el.productCount.textContent = `${filtered.length} ${foundText}`;
  
  el.productsGrid.innerHTML = '';
  
  if (filtered.length === 0) {
    el.productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-medium);">
        <h3>No products found matching active filters.</h3>
        <p>Try switching branches or categories.</p>
      </div>
    `;
    el.loadMoreContainer.style.display = 'none';
    return;
  }
  
  const visibleProducts = filtered.slice(0, state.loadedCount);
  
  visibleProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const cartItem = state.cart.find(item => item.product.id === product.id);
    const inCartQty = cartItem ? cartItem.quantity : 0;
    
    const labelAdd = state.translations.add_to_cart || "Add to Cart";
    
    card.innerHTML = `
      <div class="product-card-image-wrapper" onclick="openProductModal(${product.id})" style="cursor: pointer;">
        <img class="product-card-img" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" data-src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-card-badge stock-${getStockLevel(product).level}">${getStockLevel(product).emoji} ${getStockLevel(product).label}</span>
        <button class="btn-wishlist ${state.wishlist.includes(product.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${product.id})" title="Add to Wishlist" aria-label="Add to Wishlist" style="position:absolute;top:8px;right:8px;z-index:2;">♥</button>
      </div>
      <div class="product-card-info">
        <span class="product-card-category">${product.category}</span>
        <h4 class="product-card-name" title="${product.name}" onclick="openProductModal(${product.id})" style="cursor: pointer; transition: color var(--transition-fast);">${product.name}</h4>
        <div class="product-card-footer">
          <div class="product-card-price-box">
            <span class="product-card-unit">per ${product.unit}</span>
            <span class="product-card-price">${formatNumber(product.price)}</span>
          </div>
          ${product.inStock
            ? `<button class="btn-card-add" onclick="event.stopPropagation(); addToCartById(${product.id})">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                 ${labelAdd}${inCartQty > 0 ? ` (${inCartQty})` : ''}
               </button>`
            : `<button class="btn-card-add" style="background-color:var(--text-light);cursor:not-allowed;" disabled onclick="event.stopPropagation(); notifyMeWhenInStock(${product.id})">🔔 Notify Me</button>`
          }
        </div>
      </div>
    `;
    el.productsGrid.appendChild(card);
  });
  
  // Load More Button pagination controls
  if (state.loadedCount < filtered.length) {
    el.loadMoreContainer.style.display = 'flex';
    const labelLoad = state.translations.load_more || "Load More Products";
    el.loadMoreContainer.innerHTML = `
      <button class="btn btn-outline" id="btn-load-more">
        ${labelLoad}
      </button>
    `;
    document.getElementById('btn-load-more').addEventListener('click', () => {
      const btn = document.getElementById('btn-load-more');
      btn.innerHTML = `<div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div> ${state.translations.loading || 'Loading...'}`;
      
      setTimeout(() => {
        state.loadedCount += 24;
        renderProducts();
      }, 350);
    });
  } else {
    el.loadMoreContainer.style.display = 'none';
  }
  
  lazyLoadImages();
}

// Render Category Dropdown Menu links dynamically
function renderCategoryDropdown() {
  const menu = document.getElementById('category-dropdown-menu');
  if (!menu) return;
  
  const categories = ['All', ...new Set(state.products.map(p => p.category))];
  menu.innerHTML = '';
  
  categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = `category-dropdown-item ${state.selectedCategory === cat ? 'active' : ''}`;
    
    if (cat === 'All') {
      item.textContent = state.language === 'en' ? 'All Categories' : state.language === 'rw' ? 'Ibyiciro Byose' : 'Toutes les catégories';
    } else {
      item.textContent = cat;
    }
    
    item.addEventListener('click', () => {
      state.selectedCategory = cat;
      state.loadedCount = 24;
      
      // Update active category text display indicator
      const indicator = document.getElementById('active-category-indicator');
      if (indicator) {
        indicator.textContent = cat === 'All' 
          ? (state.language === 'en' ? 'All' : state.language === 'rw' ? 'Yose' : 'Toutes') 
          : cat;
      }
      
      renderProducts();
      menu.classList.remove('show');
      
      document.querySelectorAll('.category-dropdown-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
    
    menu.appendChild(item);
  });
}

// Render Branch locations cards inside Contact page
function renderBranchesListInContact() {
  const container = document.getElementById('contact-branches-list');
  container.innerHTML = '';
  
  // 11 Simba Branches list with addresses and phone contacts
  const branchDetails = [
    { name: "HQ Centenary", address: "KN 3 Rd, Centenary House, Kiyovu, Kigali", phone: "+250 788 307 200" },
    { name: "Gishushu", address: "KG 8 Ave, Simba Gishushu Building, Gasabo, Kigali", phone: "+250 788 307 201" },
    { name: "Kimironko", address: "KG 11 Ave, Near Kimironko Market, Gasabo, Kigali", phone: "+250 788 307 202" },
    { name: "Kicukiro", address: "KK 15 Rd, Centre Inkurunziza, Kicukiro, Kigali", phone: "+250 788 307 203" },
    { name: "Kigali Heights", address: "KG 7 Ave, Kigali Heights Ground Floor, Kacyiru, Kigali", phone: "+250 788 307 204" },
    { name: "UTC", address: "KN 34 St, U.T.C Commercial Building, Kiyovu, Kigali", phone: "+250 788 307 205" },
    { name: "Gacuriro", address: "KG 362 St, Gacuriro Estates, Gasabo, Kigali", phone: "+250 788 307 206" },
    { name: "Gikondo", address: "KK 31 Ave, Gikondo Industrial Area, Kicukiro, Kigali", phone: "+250 788 307 207" },
    { name: "Sonatube", address: "KK 14 Rd, Sonatube Roundabout, Kicukiro, Kigali", phone: "+250 788 307 208" },
    { name: "Kisimenti", address: "KG 11 Ave, Remera Kisimenti, Gasabo, Kigali", phone: "+250 788 307 209" },
    { name: "Rebero", address: "KK 30 Rd, Canal Olympia Area, Kicukiro, Kigali", phone: "+250 788 307 210" }
  ];
  
  branchDetails.forEach(b => {
    const card = document.createElement('div');
    card.className = 'location-item-card';
    card.innerHTML = `
      <div class="location-item-title">${b.name}</div>
      <div class="location-item-detail"><strong>Addr:</strong> ${b.address}</div>
      <div class="location-item-detail"><strong>Tel:</strong> ${b.phone}</div>
    `;
    container.appendChild(card);
  });
}

// Lazy load images observer
function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('img.product-card-img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.removeAttribute('data-src');
          imageObserver.unobserve(image);
        }
      });
    });
    lazyImages.forEach(image => imageObserver.observe(image));
  } else {
    lazyImages.forEach(image => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  }
}

// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = ``;
  if (type === 'success') {
    icon = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    icon = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    icon = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="12" x2="12" y2="16"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }
  
  toast.innerHTML = `${icon} <span>${message}</span>`;
  el.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Global loader
function showGlobalLoading(show) {
  if (show) {
    el.loadingOverlay.classList.add('active');
  } else {
    el.loadingOverlay.classList.remove('active');
  }
}

// Cart additions / updates / removals
function addToCartById(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  const existing = state.cart.find(item => item.product.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ product, quantity: 1 });
  }
  
  localStorage.setItem('simba_cart', JSON.stringify(state.cart));
  updateCartBadge();
  showToast(`"${product.name}" added to cart`, 'success');
  
  if (state.currentPage === 'home') {
    renderProducts();
  }
}
window.addToCartById = addToCartById;

function updateCartQuantity(productId, change) {
  const item = state.cart.find(item => item.product.id === productId);
  if (!item) return;
  
  item.quantity += change;
  
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.product.id !== productId);
    showToast(`Removed "${item.product.name}" from cart`, 'info');
  } else {
    showToast(`Updated quantity of "${item.product.name}"`, 'success');
  }
  
  localStorage.setItem('simba_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCart();
}
window.updateCartQuantity = updateCartQuantity;

function removeFromCart(productId) {
  const item = state.cart.find(item => item.product.id === productId);
  if (!item) return;
  
  state.cart = state.cart.filter(i => i.product.id !== productId);
  localStorage.setItem('simba_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCart();
  showToast(`Removed "${item.product.name}"`, 'info');
}
window.removeFromCart = removeFromCart;

function updateCartBadge() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems > 0) {
    el.cartBadge.textContent = totalItems;
    el.cartBadge.style.display = 'flex';
  } else {
    el.cartBadge.style.display = 'none';
  }
}

function getCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const delivery = getDeliveryFee();
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

// Render shopping cart list
function renderCart() {
  if (state.cart.length === 0) {
    el.cartItemsList.innerHTML = `
      <div class="cart-empty">
        <svg style="width: 50px; height: 50px; fill: var(--text-light); margin-bottom: 12px;" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        <h3 data-i18n="cart_empty">${state.translations.cart_empty || 'Your cart is empty'}</h3>
        <p style="color: var(--text-medium); margin: 6px 0 16px 0;" data-i18n="cart_empty_sub">${state.translations.cart_empty_sub || 'Add some groceries to get started!'}</p>
        <button class="btn btn-primary" onclick="navigate('home')" data-i18n="cart_start_shopping">${state.translations.cart_start_shopping || 'Start Shopping'}</button>
      </div>
    `;
    el.cartSummaryContainer.style.display = 'none';
    document.getElementById('cart-layout-grid').style.gridTemplateColumns = '1fr';
    return;
  }
  
  document.getElementById('cart-layout-grid').style.gridTemplateColumns = '';
  el.cartSummaryContainer.style.display = 'block';
  
  el.cartItemsList.innerHTML = '';
  state.cart.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    
    itemEl.innerHTML = `
      <img src="${item.product.image}" class="cart-item-img" alt="${item.product.name}">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.product.name}</div>
        <div class="cart-item-price">${formatNumber(item.product.price)} RWF / ${item.product.unit}</div>
      </div>
      <div class="cart-item-qty-controls">
        <button class="cart-item-qty-btn" onclick="updateCartQuantity(${item.product.id}, -1)">−</button>
        <div class="cart-item-qty-val">${item.quantity}</div>
        <button class="cart-item-qty-btn" onclick="updateCartQuantity(${item.product.id}, 1)">+</button>
      </div>
      <div class="cart-item-total">${formatNumber(item.product.price * item.quantity)} RWF</div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.product.id})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>
    `;
    el.cartItemsList.appendChild(itemEl);
  });
  
  const { subtotal, delivery, total } = getCartTotals();
  const titleSummary = state.translations.order_summary || "Order Summary";
  const labelSub = state.translations.subtotal || "Subtotal";
  const labelDel = state.translations.delivery_fee || "Delivery Fee";
  const labelTot = state.translations.total || "Total";
  const labelCheck = state.translations.proceed_checkout || "Proceed to Checkout";
  
  el.cartSummaryContainer.innerHTML = `
    <div class="cart-summary">
      <h3 style="font-size: 16px; font-weight:700; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">${titleSummary}</h3>
      <div class="summary-row">
        <span>${labelSub}</span>
        <span>${formatNumber(subtotal)} RWF</span>
      </div>
      <div class="summary-row">
        <span>${labelDel}</span>
        <span>${delivery === 0 ? 'FREE' : formatNumber(delivery) + ' RWF'}</span>
      </div>
      ${delivery > 0 ? `<div style="font-size:11px; color: var(--primary-color); margin-top: -6px; margin-bottom: 8px; font-weight:600;">Add ${formatNumber(50000 - subtotal)} RWF more for FREE Delivery!</div>` : ''}
      <div class="summary-row total">
        <span>${labelTot}</span>
        <span>${formatNumber(total)} RWF</span>
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 16px;" onclick="handleCheckoutRedirect()">
        ${labelCheck}
      </button>
    </div>
  `;

  // Cart upsell — complementary products
  if (state.products.length > 0) {
    const cartCats = [...new Set(state.cart.map(i => i.product.category))];
    const upsell = state.products
      .filter(p => cartCats.includes(p.category) && p.inStock && !state.cart.find(c => c.product.id === p.id))
      .slice(0, 5);
    if (upsell.length > 0) {
      const upsellEl = document.createElement('div');
      upsellEl.style.cssText = 'margin-top:20px; padding:16px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);';
      upsellEl.innerHTML = `
        <h4 style="font-size:13px; font-weight:700; margin-bottom:10px; color:var(--text-medium);">💡 You might also like</h4>
        <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; scrollbar-width:none;">
          ${upsell.map(p => `
            <div style="flex-shrink:0; width:100px; cursor:pointer;" onclick="openProductModal(${p.id})">
              <img src="${p.image}" style="width:100%;height:72px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
              <div style="font-size:10px; margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-medium);">${p.name}</div>
              <div style="font-size:11px; font-weight:700; color:var(--primary-color);">${formatNumber(p.price)} RWF</div>
              <button class="btn-card-add" style="width:100%; margin-top:4px; font-size:10px; padding:4px;" onclick="event.stopPropagation(); addToCartById(${p.id})">+ Add</button>
            </div>`).join('')}
        </div>`;
      el.cartItemsList.appendChild(upsellEl);
    }
  }
}

// Redirect to checkout with auth gate
function handleCheckoutRedirect() {
  if (!state.user) {
    showToast('Please sign in or register to complete checkout.', 'info');
    localStorage.setItem('simba_redirect_checkout', 'true');
    navigate('auth');
  } else {
    navigate('checkout');
  }
}
window.handleCheckoutRedirect = handleCheckoutRedirect;

// Switch tab login/register
function switchAuthTab(tab) {
  if (tab === 'login') {
    el.loginTab.classList.add('active');
    el.registerTab.classList.remove('active');
    el.loginForm.classList.add('active');
    el.registerForm.classList.remove('active');
  } else {
    el.registerTab.classList.add('active');
    el.loginTab.classList.remove('active');
    el.registerForm.classList.add('active');
    el.loginForm.classList.remove('active');
  }
}

// Login authentication submissions
function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const feedback = document.getElementById('login-feedback');
  
  feedback.className = 'form-feedback';
  feedback.style.display = 'none';
  
  if (!email || !password) {
    feedback.textContent = 'Please fill out all fields.';
    feedback.classList.add('error');
    return;
  }
  
  const submitBtn = el.loginForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<div class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>`;
  submitBtn.disabled = true;
  
  setTimeout(() => {
    // Check representative login details
    if (email === 'rep@simba.rw' && password === 'reppassword') {
      loginUser({ email, name: 'Simba Market Rep', role: 'representative' });
      showToast('Representative logged in successfully', 'success');
      el.loginForm.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      navigate('dashboard');
      return;
    }
    
    // Check local registered customer details
    const users = JSON.parse(localStorage.getItem('simba_registered_users')) || [];
    const matchedUser = users.find(u => u.email === email && u.password === password);
    const defaultTester = { email: 'simba@store.rw', password: 'password', name: 'Simba Customer' };
    
    if (matchedUser || (email === defaultTester.email && password === defaultTester.password)) {
      const activeUser = matchedUser || defaultTester;
      loginUser({ email: activeUser.email, name: activeUser.name, role: 'customer' });
      showToast(`Welcome back, ${activeUser.name}!`, 'success');
      el.loginForm.reset();
      
      if (localStorage.getItem('simba_redirect_checkout') === 'true') {
        localStorage.removeItem('simba_redirect_checkout');
        navigate('checkout');
      } else {
        navigate('home');
      }
    } else {
      feedback.textContent = 'Invalid credentials. User rep@simba.rw/reppassword for dashboard, or simba@store.rw/password.';
      feedback.classList.add('error');
    }
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 1000);
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const phone = (document.getElementById('register-phone') || {}).value?.trim() || '';
  const password = document.getElementById('register-password').value;
  const feedback = document.getElementById('register-feedback');

  feedback.className = 'form-feedback';
  feedback.style.display = 'none';

  if (!name || !email || !password) {
    feedback.textContent = 'Please fill out all required fields.';
    feedback.classList.add('error');
    return;
  }

  if (password.length < 6) {
    feedback.textContent = 'Password must be at least 6 characters.';
    feedback.classList.add('error');
    return;
  }

  const submitBtn = el.registerForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<div class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>`;
  submitBtn.disabled = true;

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('simba_registered_users')) || [];

    if (users.some(u => u.email === email)) {
      feedback.textContent = 'An account with this email already exists.';
      feedback.classList.add('error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }

    users.push({ name, email, password, phone });
    localStorage.setItem('simba_registered_users', JSON.stringify(users));

    loginUser({ name, email, role: 'customer', phone });
    showToast('Account registered successfully!', 'success');
    el.registerForm.reset();

    if (localStorage.getItem('simba_redirect_checkout') === 'true') {
      localStorage.removeItem('simba_redirect_checkout');
      navigate('checkout');
    } else {
      navigate('home');
    }

    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 1200);
}

// Google Login Integration
// Real Google Sign-In using Google Identity Services (GSI)
// Replace GOOGLE_CLIENT_ID with your actual Google OAuth 2.0 Client ID
// Get one at: https://console.cloud.google.com/
const GOOGLE_CLIENT_ID = '364652717993-t4o3m7fptcjd04s1q9b0l6h1k2mnv8pu.apps.googleusercontent.com';

function initGoogleSignIn() {
  if (typeof google === 'undefined' || !google.accounts) return;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });
}

function handleGoogleCredentialResponse(response) {
  try {
    // Decode the JWT credential (base64 decode the payload)
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    const googleUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role: 'customer',
      googleId: payload.sub
    };
    
    loginUser(googleUser);
    showGlobalLoading(false);
    showToast(`Welcome, ${googleUser.name}! Signed in with Google.`, 'success');
    
    if (localStorage.getItem('simba_redirect_checkout') === 'true') {
      localStorage.removeItem('simba_redirect_checkout');
      navigate('checkout');
    } else {
      navigate('home');
    }
  } catch (err) {
    showGlobalLoading(false);
    showToast('Google sign-in failed. Please try again.', 'error');
  }
}

function handleGoogleLogin() {
  if (typeof google === 'undefined' || !google.accounts) {
    showToast('Google Sign-In is not available. Check your internet connection.', 'error');
    return;
  }
  showGlobalLoading(true);
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Fallback: render button popup manually
      showGlobalLoading(false);
      // Create a temporary container for the Google button
      const tempDiv = document.createElement('div');
      tempDiv.id = 'google-btn-temp';
      tempDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:#fff;padding:24px;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
      tempDiv.innerHTML = '<p style="margin-bottom:12px;font-weight:600;font-size:14px;color:#2D1200;">Click below to sign in with Google</p>';
      document.body.appendChild(tempDiv);
      google.accounts.id.renderButton(tempDiv, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        logo_alignment: 'left'
      });
      // Remove after 30s
      setTimeout(() => { if (document.getElementById('google-btn-temp')) tempDiv.remove(); }, 30000);
      // Close on outside click
      setTimeout(() => {
        const closeHandler = (e) => {
          if (!tempDiv.contains(e.target)) { tempDiv.remove(); document.removeEventListener('click', closeHandler); }
        };
        document.addEventListener('click', closeHandler);
      }, 100);
    }
  });
}

function loginUser(userData) {
  state.user = userData;
  localStorage.setItem('simba_user', JSON.stringify(userData));
  updateAuthNavigation();
}

function logoutUser() {
  state.user = null;
  localStorage.removeItem('simba_user');
  updateAuthNavigation();
  showToast('Logged out successfully', 'info');
  navigate('home');
}

function updateAuthNavigation() {
  const mobileAccountBtn = document.getElementById('mobile-account-btn');

  if (state.user) {
    const initials = state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarHtml = state.user.picture
      ? `<img src="${state.user.picture}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:2px solid var(--primary-color);" alt="Profile" referrerpolicy="no-referrer">`
      : `<div style="width:22px;height:22px;border-radius:50%;background-color:var(--primary-color);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;">${initials}</div>`;

    el.accountNavBtn.innerHTML = `${avatarHtml}<span>${state.user.name.split(' ')[0]}</span>`;
    el.accountNavBtn.onclick = (e) => { e.preventDefault(); navigate('profile'); };
    el.dashboardNavBtn.style.display = 'flex';
    if (mobileAccountBtn) mobileAccountBtn.textContent = `👤 ${state.user.name.split(' ')[0]} (Profile)`;
  } else {
    el.accountNavBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      <span data-i18n="nav_signin">${state.translations.nav_signin || 'Sign In'}</span>
    `;
    el.accountNavBtn.onclick = (e) => { e.preventDefault(); navigate('auth'); };
    el.dashboardNavBtn.style.display = 'flex';
    if (mobileAccountBtn) mobileAccountBtn.textContent = '👤 Sign In';
  }
}

// Render checkout summary list
function renderCheckoutSummary() {
  const container = document.getElementById('checkout-summary');
  const { subtotal, delivery, total } = getCartTotals();
  
  document.getElementById('checkout-email').value = state.user.email;
  document.getElementById('checkout-name').value = state.user.name;
  
  const titleDetails = state.translations.order_summary || "Order Summary";
  const labelSub = state.translations.subtotal || "Subtotal";
  const labelDel = state.translations.delivery_fee || "Delivery Fee";
  const labelTot = state.translations.total || "Total";
  
  container.innerHTML = `
    <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
      <h3 style="margin-bottom:12px; font-weight: 700; border-bottom: 1.5px solid var(--border-color); padding-bottom: 8px;">${titleDetails}</h3>
      <div style="max-height: 200px; overflow-y: auto; margin-bottom: 16px; padding-right: 4px;">
        ${state.cart.map(item => `
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom: 8px;">
            <span style="font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width: 170px;">${item.product.name} × ${item.quantity}</span>
            <span style="font-weight:600;">${formatNumber(item.product.price * item.quantity)} RWF</span>
          </div>
        `).join('')}
      </div>
      <div style="font-size:13px; color:var(--text-medium); border-top: 1px solid var(--border-color); padding-top:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>${labelSub}</span>
          <span>${formatNumber(subtotal)} RWF</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>${labelDel}</span>
          <span>${delivery === 0 ? 'FREE' : formatNumber(delivery) + ' RWF'}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:700; color:var(--text-dark); margin-top:12px; border-top: 1.5px solid var(--border-color); padding-top:12px;">
          <span>${labelTot}</span>
          <span>${formatNumber(total)} RWF</span>
        </div>
      </div>
    </div>
  `;
}

// Place checkout orders
function handleCheckoutSubmit(e) {
  e.preventDefault();
  
  const address = document.getElementById('checkout-address').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const paymentMethod = document.getElementById('selected-payment-method').value;
  
  if (!address || !phone) {
    showToast('Please specify delivery address and phone number.', 'error');
    return;
  }
  
  showGlobalLoading(true);
  
  setTimeout(() => {
    const orderId = `SMB-${Math.floor(100000 + Math.random() * 900000)}`;
    const { subtotal, delivery, total } = getCartTotals();
    
    const newOrder = {
      orderId,
      customerName: state.user.name,
      email: state.user.email,
      phone,
      branch: state.selectedBranch === 'All Branches' ? 'HQ Centenary' : state.selectedBranch,
      amount: total,
      status: 'pending',
      items: [...state.cart],
      date: new Date().toISOString().split('T')[0]
    };
    
    // Save to state orders
    state.orders.unshift(newOrder);
    localStorage.setItem('simba_orders', JSON.stringify(state.orders));
    
    state.lastOrder = {
      orderId,
      items: [...state.cart],
      totals: { subtotal, delivery, total },
      address,
      phone,
      paymentMethod: getPaymentMethodName(paymentMethod),
      paymentStatus: paymentMethod === 'cod' ? 'Pending (COD)' : 'Paid Successfully',
      branch: newOrder.branch
    };
    
    // Clear cart
    state.cart = [];
    localStorage.removeItem('simba_cart');
    updateCartBadge();
    
    showGlobalLoading(false);
    showToast('Order placed successfully!', 'success');
    navigate('confirmation');
  }, 1800);
}

function getPaymentMethodName(code) {
  if (code === 'momo') return 'MTN Mobile Money (MOMO)';
  if (code === 'card') return 'Credit/Debit Card';
  return 'Cash on Delivery';
}

// Confirmation page summary
function renderOrderConfirmation() {
  if (!state.lastOrder) {
    navigate('home');
    return;
  }
  
  const o = state.lastOrder;
  const labelThank = state.translations.confirm_thank_you || "Thank You For Your Order!";
  const labelRec = state.translations.confirm_received || "Your order has been received.";
  const labelSum = state.translations.confirm_summary_details || "Summary Details";
  const labelGrand = state.translations.confirm_grand_total || "Grand Total Paid";
  const labelCont = state.translations.confirm_continue_shopping || "Continue Shopping";
  
  el.confirmationView.innerHTML = `
    <div class="confirm-container card">
      <div class="confirm-badge">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2 class="confirm-title">${labelThank}</h2>
      <p style="color: var(--text-medium); margin-bottom: 12px; font-size:14px;">${labelRec}</p>
      
      <div class="confirm-order-id">${state.translations.confirm_order_id || 'ORDER ID'}: ${o.orderId}</div>
      
      <div style="background-color: var(--bg-main); border-radius: var(--radius-md); padding: 16px; text-align: left; margin-bottom: 24px; border:1px solid var(--border-color);">
        <h3 style="margin-bottom: 12px; font-weight:700; font-size:14px;">${labelSum}</h3>
        <table class="confirm-details-table" style="margin:0;">
          <tr>
            <th data-i18n="confirm_full_address">${state.translations.confirm_full_address || 'Full Address'}</th>
            <td>${o.address}</td>
          </tr>
          <tr>
            <th data-i18n="confirm_phone_contact">${state.translations.confirm_phone_contact || 'Phone Contact'}</th>
            <td>${o.phone}</td>
          </tr>
          <tr>
            <th data-i18n="confirm_fulfillment_branch">${state.translations.confirm_fulfillment_branch || 'Fulfillment Branch'}</th>
            <td>${o.branch}</td>
          </tr>
          <tr>
            <th data-i18n="confirm_payment_method">${state.translations.confirm_payment_method || 'Payment Method'}</th>
            <td>${o.paymentMethod}</td>
          </tr>
          <tr>
            <th data-i18n="confirm_payment_status">${state.translations.confirm_payment_status || 'Payment Status'}</th>
            <td><span style="font-weight: 700; color: ${o.paymentStatus.includes('Paid') ? '#16A34A' : '#D97706'}">${o.paymentStatus}</span></td>
          </tr>
        </table>
        
        <h4 style="margin: 16px 0 8px 0; font-weight: 700; font-size:13px;" data-i18n="confirm_items_purchased">${state.translations.confirm_items_purchased || 'Items Purchased'}</h4>
        <div style="border-top:1px solid var(--border-color); padding-top:8px;">
          ${o.items.map(item => `
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom: 6px;">
              <span>${item.product.name} (×${item.quantity})</span>
              <span style="font-weight:600;">${formatNumber(item.product.price * item.quantity)} RWF</span>
            </div>
          `).join('')}
        </div>
        
        <div style="display:flex; justify-content:space-between; border-top:1.5px solid var(--border-color); padding-top:10px; margin-top:10px; font-weight:700; font-size:14px; color:var(--text-dark);">
          <span>${labelGrand}</span>
          <span>${formatNumber(o.totals.total)} RWF</span>
        </div>
      </div>
      
      <button class="btn btn-primary" onclick="navigate('home')">${labelCont}</button>
    </div>
  `;
}

// Switch Representative Dashboard View Tabs
function switchDashboardTab(tab) {
  state.dashboardTab = tab;
  document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`dash-tab-${tab}`).classList.add('active');
  
  document.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`dash-panel-${tab}`).classList.add('active');
  
  renderDashboard();
}

// Render Dashboard Panel details (Orders / Inventory / Analytics)
function renderDashboard() {
  if (state.dashboardTab === 'orders') {
    renderDashboardOrders();
  } else if (state.dashboardTab === 'inventory') {
    renderDashboardInventory();
  } else if (state.dashboardTab === 'analytics') {
    renderDashboardAnalytics();
  }
}

// A: Render dashboard orders table view
function renderDashboardOrders() {
  const container = document.getElementById('dash-orders-table-container');
  container.innerHTML = '';
  
  if (state.orders.length === 0) {
    container.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--text-medium);">No orders placed yet.</p>`;
    return;
  }
  
  const table = document.createElement('table');
  table.className = 'dash-table';
  
  table.innerHTML = `
    <thead>
      <tr>
        <th data-i18n="dash_order_id">${state.translations.dash_order_id || 'Order ID'}</th>
        <th data-i18n="dash_branch">${state.translations.dash_branch || 'Branch'}</th>
        <th data-i18n="dash_customer">${state.translations.dash_customer || 'Customer'}</th>
        <th data-i18n="dash_amount">${state.translations.dash_amount || 'Amount'}</th>
        <th data-i18n="dash_status">${state.translations.dash_status || 'Status'}</th>
        <th data-i18n="dash_actions">${state.translations.dash_actions || 'Actions'}</th>
      </tr>
    </thead>
    <tbody>
      ${state.orders.map(order => `
        <tr>
          <td><strong>${order.orderId}</strong><div style="font-size:10px; color:var(--text-light);">${order.date}</div></td>
          <td>${order.branch}</td>
          <td>${order.customerName}<div style="font-size:10px; color:var(--text-light);">${order.phone}</div></td>
          <td><strong>${formatNumber(order.amount)} RWF</strong></td>
          <td><span class="status-pill ${order.status}">${order.status}</span></td>
          <td>
            <select class="form-input" style="padding: 4px 8px; font-size:12px; width:auto; display:inline-block;" onchange="updateOrderStatus('${order.orderId}', this.value)" title="${state.translations.dash_update_status || 'Update Status'}">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            </select>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  container.appendChild(table);
}

// Update order status trigger from representative select
function updateOrderStatus(orderId, newStatus) {
  const order = state.orders.find(o => o.orderId === orderId);
  if (!order) return;
  
  order.status = newStatus;
  localStorage.setItem('simba_orders', JSON.stringify(state.orders));
  showToast(`Order ${orderId} updated to ${newStatus}`, 'success');
  renderDashboard();
}
window.updateOrderStatus = updateOrderStatus;

// B: Render Inventory management
function renderDashboardInventory() {
  const container = document.getElementById('dash-inventory-container');
  container.innerHTML = '';
  
  const list = document.createElement('div');
  list.className = 'inventory-list';
  
  // Render first 30 products for representative to prevent DOM lag
  const productsSubset = state.products.slice(0, 30);
  
  productsSubset.forEach(product => {
    const item = document.createElement('div');
    item.className = 'inventory-item';
    
    item.innerHTML = `
      <div class="inventory-item-info">
        <img src="${product.image}" class="inventory-item-img" alt="${product.name}">
        <div>
          <div class="inventory-item-title">${product.name}</div>
          <div style="font-size:11px; color:var(--text-medium); margin-top:2px;">ID: ${product.id} | ${product.category} | ${formatNumber(product.price)} RWF</div>
        </div>
      </div>
      
      <div class="inventory-item-actions">
        <!-- Stock toggle switch widget -->
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:11px; font-weight:600;" data-i18n="dash_stock_status">${state.translations.dash_stock_status || 'Stock Status'}:</span>
          <label class="switch-control">
            <input type="checkbox" ${product.inStock ? 'checked' : ''} onchange="toggleProductStock(${product.id}, this.checked)">
            <span class="switch-slider"></span>
          </label>
        </div>
        
        <!-- Branch selection tags -->
        <div style="display:flex; flex-direction:column; gap:4px; margin-left: 12px;">
          <span style="font-size:10px; font-weight:700; color:var(--text-medium);" data-i18n="dash_branch_availability">${state.translations.dash_branch_availability || 'Branch Availability'} (Toggle):</span>
          <div style="display:flex; flex-wrap:wrap; gap:4px; max-width: 320px;">
            ${BRANCHES.map(b => {
              const active = product.branches.includes(b);
              return `<span class="branch-avail-pill ${active ? 'active' : ''}" onclick="toggleProductBranch(${product.id}, '${b}')">${b}</span>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    list.appendChild(item);
  });
  
  container.appendChild(list);
}

// Toggle product absolute stock status
function toggleProductStock(productId, isChecked) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  product.inStock = isChecked;
  showToast(`Product ${product.id} stock status updated`, 'success');
  // Trigger home products rendering reload in background
  renderProducts();
}
window.toggleProductStock = toggleProductStock;

// Toggle specific product branch availability
function toggleProductBranch(productId, branchName) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  const index = product.branches.indexOf(branchName);
  if (index > -1) {
    product.branches.splice(index, 1);
  } else {
    product.branches.push(branchName);
  }
  
  showToast(`Updated branch availability for product ${productId}`, 'success');
  renderDashboardInventory();
  renderProducts();
}
window.toggleProductBranch = toggleProductBranch;

// C: Render Analytics summary metrics (total sales, pending orders count, sales by branch bars, top products)
function renderDashboardAnalytics() {
  const container = document.getElementById('dash-analytics-container');
  container.innerHTML = '';
  
  // 1. Core Analytics aggregates
  const totalSales = state.orders.reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = state.orders.filter(o => o.status === 'pending').length;
  
  // Calculate top products
  const productCounts = {};
  state.orders.forEach(order => {
    order.items.forEach(item => {
      const name = item.product.name;
      productCounts[name] = (productCounts[name] || 0) + item.quantity;
    });
  });
  const sortedProducts = Object.entries(productCounts).sort((a,b) => b[1] - a[1]);
  const topProducts = sortedProducts.slice(0, 3);
  
  // Calculate sales per branch
  const branchSales = {};
  BRANCHES.forEach(b => { branchSales[b] = 0; });
  state.orders.forEach(order => {
    if (branchSales[order.branch] !== undefined) {
      branchSales[order.branch] += order.amount;
    } else {
      branchSales[order.branch] = order.amount;
    }
  });
  
  const maxBranchSales = Math.max(...Object.values(branchSales), 1);
  
  // translate titles
  const labelSales = state.translations.dash_total_sales || "Total Sales";
  const labelPend = state.translations.dash_pending_orders || "Pending Orders";
  const labelTop = state.translations.dash_top_products || "Top Products";
  const labelByBranch = state.translations.dash_sales_by_branch || "Sales by Branch";
  
  container.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-card">
        <span class="analytics-card-title">${labelSales}</span>
        <span class="analytics-card-value">${formatNumber(totalSales)} RWF</span>
      </div>
      <div class="analytics-card">
        <span class="analytics-card-title">${labelPend}</span>
        <span class="analytics-card-value" style="color:#D97706;">${pendingOrders}</span>
      </div>
      <div class="analytics-card" style="grid-column: span 2;">
        <span class="analytics-card-title">${labelTop}</span>
        <div style="margin-top:8px;">
          ${topProducts.length === 0 
            ? `<p style="font-size:13px; color:var(--text-medium);">No items purchased yet</p>`
            : topProducts.map(([name, qty]) => `
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-weight:600;">
                  <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:220px;">${name}</span>
                  <span style="color:var(--primary-color);">${qty} sold</span>
                </div>
              `).join('')
          }
        </div>
      </div>
    </div>
    
    <div style="background-color:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; box-shadow:var(--shadow-sm);">
      <h3 style="font-size:14px; font-weight:700; margin-bottom:16px; text-transform:uppercase; color:var(--text-medium); border-bottom:1px solid var(--border-color); padding-bottom:8px;">${labelByBranch}</h3>
      <div class="branch-sales-list">
        ${BRANCHES.map(b => {
          const sales = branchSales[b] || 0;
          const pct = (sales / maxBranchSales) * 100;
          return `
            <div class="branch-sales-item">
              <div class="branch-sales-header">
                <span>${b}</span>
                <span>${formatNumber(sales)} RWF</span>
              </div>
              <div class="branch-sales-bar-bg">
                <div class="branch-sales-bar-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Product Details Modal Overlay loader - Enhanced with full description + reviews
function openProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('product-detail-modal');
  const body  = document.getElementById('modal-body');

  const cartItem  = state.cart.find(item => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const stock     = getStockLevel(product);
  const isWished  = state.wishlist.includes(product.id);

  const descriptionMap = {
    'Food Products':             'A high-quality food product carefully selected by Simba Supermarket to ensure freshness, safety, and great taste.',
    'Alcoholic Drinks':          'Premium beverage available in select Simba branches. Enjoy responsibly. Must be 18+ to purchase.',
    'Cosmetics & Personal Care': 'A trusted personal care product sourced to maintain your health, hygiene, and daily wellness routine.',
    'Baby Products':             'Safe, tested, and certified product designed for babies and young children. Gentle and effective.',
    'Kitchenware & Electronics': 'A durable kitchenware or electronics item that enhances your home cooking and everyday lifestyle.',
    'Sports & Wellness':         'Designed to support an active and healthy lifestyle. Perfect for fitness-focused individuals.',
    'General':                   'A versatile everyday product available across Simba branches, known for great quality and value.'
  };
  const description = product.description || descriptionMap[product.category] || `${product.name} — available at Simba Supermarket.`;

  // Reviews
  const reviews = JSON.parse(localStorage.getItem('simba_reviews')) || {};
  const productReviews = reviews[productId] || [];
  const avgRating = productReviews.length ? (productReviews.reduce((s,r)=>s+r.rating,0)/productReviews.length).toFixed(1) : null;

  const reviewsHtml = `
    <div style="margin-top:20px;border-top:1px solid var(--border-color);padding-top:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h4 style="font-size:14px;font-weight:700;">Customer Reviews</h4>
        ${avgRating ? `<span style="background:var(--primary-color);color:#fff;padding:3px 10px;border-radius:20px;font-weight:700;font-size:13px;">★ ${avgRating}</span>` : ''}
      </div>
      ${productReviews.length === 0
        ? '<p style="font-size:13px;color:var(--text-medium);">No reviews yet. Be the first!</p>'
        : productReviews.slice(-3).reverse().map(r => `
            <div style="padding:10px;background:var(--bg-main);border-radius:var(--radius-sm);margin-bottom:8px;border:1px solid var(--border-color);">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <strong style="font-size:13px;">${r.userName}</strong>
                <span style="color:var(--primary-color);font-weight:700;font-size:14px;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
              </div>
              <p style="font-size:12px;color:var(--text-medium);margin-bottom:2px;">${r.text}</p>
              <span style="font-size:10px;color:var(--text-light);">${r.date}</span>
            </div>`).join('')}
      ${state.user ? `
        <form onsubmit="submitReview(event,${productId})" style="margin-top:12px;">
          <div style="display:flex;gap:4px;margin-bottom:8px;" id="review-stars-${productId}">
            ${[1,2,3,4,5].map(i=>`<span class="review-star" style="font-size:24px;cursor:pointer;color:var(--border-color);transition:color 0.15s;" onclick="setReviewRating(${productId},${i})">★</span>`).join('')}
          </div>
          <input type="hidden" id="review-rating-${productId}" value="0">
          <textarea class="form-input" id="review-text-${productId}" rows="2" placeholder="Write your review…" required style="resize:none;margin-bottom:8px;font-size:13px;"></textarea>
          <button class="btn btn-primary" type="submit" style="padding:8px 20px;font-size:13px;">Submit Review</button>
        </form>`
        : `<p style="font-size:12px;color:var(--text-medium);margin-top:8px;"><a href="#" onclick="navigate('auth');return false;" style="color:var(--primary-color);font-weight:600;">Sign in</a> to write a review.</p>`}
    </div>`;

  body.innerHTML = `
    <div class="modal-body-layout">
      <div>
        <img src="${product.image}" alt="${product.name}" class="modal-product-img" loading="lazy">
      </div>
      <div style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div class="modal-product-category">${product.category}</div>
          <h3 class="modal-product-name">${product.name}</h3>
          <span class="modal-product-badge ${stock.level === 'instock' ? 'instock' : stock.level === 'lowstock' ? 'lowstock' : 'outofstock'}">
            ${stock.emoji} ${stock.label}
          </span>
          <div class="modal-product-price">${formatNumber(product.price)} <span style="font-size:14px;font-weight:500;color:var(--text-medium);">RWF</span></div>
          <div class="modal-product-unit">Per ${product.unit}</div>
          <div class="modal-description-label">Product Description</div>
          <div class="modal-description-text">${description}</div>
          <div class="modal-description-label">Available at Branches</div>
          <div class="modal-branches-list">
            ${product.branches.map(b=>`<span class="modal-branch-chip">📍 ${b}</span>`).join('')}
          </div>
          <div style="display:flex;gap:16px;font-size:12px;color:var(--text-medium);margin-bottom:16px;flex-wrap:wrap;">
            <span>🏷️ <strong>SKU:</strong> ${product.id}</span>
            <span>📦 <strong>Unit:</strong> ${product.unit}</span>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          ${product.inStock
            ? `<button class="btn btn-primary" style="flex:1;min-width:130px;padding:12px 16px;font-size:13px;" onclick="addToCartById(${product.id});closeProductModal();">
                 🛒 Add to Cart${inCartQty > 0 ? ` (${inCartQty})` : ''}
               </button>`
            : `<button class="btn btn-primary" style="flex:1;padding:12px 16px;font-size:13px;" onclick="notifyMeWhenInStock(${product.id})">🔔 Notify Me</button>`}
          <button class="btn-wishlist ${isWished?'active':''}" onclick="toggleWishlist(${product.id});this.classList.toggle('active');" title="${isWished?'Remove from':'Add to'} wishlist" aria-label="Toggle wishlist" style="font-size:24px;padding:8px;">♥</button>
          <button class="btn btn-outline" onclick="closeProductModal()" style="padding:12px 16px;font-size:13px;">Close</button>
        </div>
      </div>
    </div>
    ${reviewsHtml}
  `;
  modal.style.display = 'flex';
}

function closeProductModal() {
  const modal = document.getElementById('product-detail-modal');
  modal.style.display = 'none';
}

// Backdrop dismissing modal click
window.addEventListener('click', (e) => {
  const modal = document.getElementById('product-detail-modal');
  if (e.target === modal) {
    closeProductModal();
  }
});

window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;

// Numbers formatting
function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

// Select food category from homepage quick tile
function selectFoodCategory(category) {
  state.selectedCategory = category;
  state.loadedCount = 24;
  
  const indicator = document.getElementById('active-category-indicator');
  if (indicator) {
    indicator.textContent = category === 'All'
      ? (state.language === 'en' ? 'All' : state.language === 'rw' ? 'Yose' : 'Toutes')
      : category;
  }
  
  renderProducts();
  renderCategoryDropdown();
  
  // Scroll down to products grid
  const grid = document.getElementById('products-grid');
  if (grid) {
    setTimeout(() => grid.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}
window.selectFoodCategory = selectFoodCategory;

// ── FILTER CONTROLS ──────────────────────────────────────────
function handleSortChange(val) {
  state.sortBy = val;
  state.loadedCount = 24;
  renderProducts();
}
window.handleSortChange = handleSortChange;

function handleAvailabilityChange(val) {
  state.availabilityFilter = val;
  state.loadedCount = 24;
  renderProducts();
}
window.handleAvailabilityChange = handleAvailabilityChange;

function togglePricePanel() {
  const panel = document.getElementById('price-filter-panel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}
window.togglePricePanel = togglePricePanel;

function applyPriceFilter() {
  const min = parseInt(document.getElementById('price-min-input').value) || 0;
  const max = parseInt(document.getElementById('price-max-input').value) || 999999;
  state.priceMin = min;
  state.priceMax = max;
  state.loadedCount = 24;
  document.getElementById('price-filter-panel').style.display = 'none';
  renderProducts();
  showToast(`Price: ${formatNumber(min)} – ${formatNumber(max)} RWF`, 'success');
}
window.applyPriceFilter = applyPriceFilter;

function resetPriceFilter() {
  state.priceMin = 0;
  state.priceMax = 999999;
  const minEl = document.getElementById('price-min-input');
  const maxEl = document.getElementById('price-max-input');
  if (minEl) minEl.value = '0';
  if (maxEl) maxEl.value = '999999';
  state.loadedCount = 24;
  const panel = document.getElementById('price-filter-panel');
  if (panel) panel.style.display = 'none';
  renderProducts();
  showToast('Price filter reset', 'info');
}
window.resetPriceFilter = resetPriceFilter;

// ── WISHLIST ──────────────────────────────────────────────────
function toggleWishlist(productId) {
  if (!state.user) {
    showToast('Please sign in to save favourites.', 'info');
    navigate('auth');
    return;
  }
  const idx = state.wishlist.indexOf(productId);
  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast('Removed from wishlist', 'info');
  } else {
    state.wishlist.push(productId);
    showToast('Added to wishlist ❤️', 'success');
  }
  localStorage.setItem('simba_wishlist', JSON.stringify(state.wishlist));
  if (state.currentPage === 'wishlist') renderWishlist();
  else if (state.currentPage === 'home') renderProducts();
}
window.toggleWishlist = toggleWishlist;

function renderWishlist() {
  const container = document.getElementById('wishlist-items');
  if (!container) return;
  const wishlistProducts = state.products.filter(p => state.wishlist.includes(p.id));
  if (wishlistProducts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:48px; color:var(--text-medium);">
        <div style="font-size:52px; margin-bottom:12px;">❤️</div>
        <h3 style="margin-bottom:8px;">Your wishlist is empty</h3>
        <p style="margin-bottom:20px; font-size:14px;">Save products you love for easy access later.</p>
        <button class="btn btn-primary" onclick="navigate('home')">Browse Products</button>
      </div>`;
    return;
  }
  container.innerHTML = wishlistProducts.map(product => {
    const stock = getStockLevel(product);
    return `
      <div class="wishlist-item">
        <img src="${product.image}" alt="${product.name}" class="wishlist-item-img" onclick="openProductModal(${product.id})" style="cursor:pointer;" loading="lazy">
        <div class="wishlist-item-info">
          <span style="font-size:11px; color:var(--text-light); text-transform:uppercase; font-weight:600;">${product.category}</span>
          <h4 style="font-size:14px; font-weight:700; margin:4px 0 6px; cursor:pointer;" onclick="openProductModal(${product.id})">${product.name}</h4>
          <span class="stock-badge ${stock.level}">${stock.emoji} ${stock.label}</span>
          <div style="font-size:18px; font-weight:800; color:var(--primary-color); margin-top:8px;">${formatNumber(product.price)} <span style="font-size:12px;font-weight:500;">RWF</span></div>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
          ${product.inStock
            ? `<button class="btn btn-primary" style="padding:8px 16px; font-size:12px; white-space:nowrap;" onclick="addToCartById(${product.id}); toggleWishlist(${product.id})">🛒 Move to Cart</button>`
            : `<button class="btn" style="padding:8px 16px; font-size:12px; background:var(--text-light); color:#fff; cursor:not-allowed;" disabled>Out of Stock</button>`}
          <button class="btn btn-outline" style="padding:8px 16px; font-size:12px;" onclick="toggleWishlist(${product.id})">🗑️ Remove</button>
        </div>
      </div>`;
  }).join('');
}
window.renderWishlist = renderWishlist;

function notifyMeWhenInStock(productId) {
  const waitlist = JSON.parse(localStorage.getItem('simba_waitlist')) || [];
  if (!waitlist.includes(productId)) {
    waitlist.push(productId);
    localStorage.setItem('simba_waitlist', JSON.stringify(waitlist));
    showToast('You will be notified when this item is back in stock! 🔔', 'success');
  } else {
    showToast('You are already on the waitlist for this product.', 'info');
  }
}
window.notifyMeWhenInStock = notifyMeWhenInStock;

// ── PROFILE PAGE ──────────────────────────────────────────────
function renderProfile() {
  if (!state.user) { navigate('auth'); return; }

  const col = document.getElementById('profile-info-col');
  if (!col) return;

  const initials = state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarHtml = state.user.picture
    ? `<img src="${state.user.picture}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid var(--primary-color);" referrerpolicy="no-referrer" alt="Profile">`
    : `<div style="width:88px;height:88px;border-radius:50%;background:var(--primary-color);color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;">${initials}</div>`;

  const myOrders = state.orders.filter(o => o.email === state.user.email);

  col.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px;background:var(--bg-main);border-radius:var(--radius-md);border:1px solid var(--border-color);text-align:center;">
      ${avatarHtml}
      <h3 style="font-size:20px;font-weight:800;">${state.user.name}</h3>
      <p style="color:var(--text-medium);font-size:13px;">${state.user.email}</p>
      ${state.user.phone ? `<p style="color:var(--text-medium);font-size:13px;">📱 ${state.user.phone}</p>` : ''}
      <span style="background:var(--primary-light);color:var(--primary-color);padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;">${state.user.role || 'Customer'}</span>
      <div style="display:flex;gap:24px;margin-top:8px;">
        <div><div style="font-size:24px;font-weight:800;color:var(--primary-color);">${myOrders.length}</div><div style="font-size:11px;color:var(--text-medium);">Orders</div></div>
        <div><div style="font-size:24px;font-weight:800;color:var(--primary-color);">${state.wishlist.length}</div><div style="font-size:11px;color:var(--text-medium);">Wishlist</div></div>
        <div><div style="font-size:24px;font-weight:800;color:var(--primary-color);">${state.cart.reduce((s,i)=>s+i.quantity,0)}</div><div style="font-size:11px;color:var(--text-medium);">In Cart</div></div>
      </div>
      <div style="display:flex;gap:8px;width:100%;margin-top:4px;flex-wrap:wrap;">
        <button class="btn btn-secondary" style="flex:1;padding:8px;font-size:12px;" onclick="navigate('wishlist')">❤️ Wishlist</button>
        <button class="btn btn-secondary" style="flex:1;padding:8px;font-size:12px;" onclick="navigate('cart')">🛒 Cart</button>
        <button class="btn btn-outline" style="flex:1;padding:8px;font-size:12px;" onclick="if(confirm('Log out?'))logoutUser()">🚪 Log Out</button>
      </div>
    </div>`;

  // Order history
  const ordersList = document.getElementById('profile-orders-list');
  if (!ordersList) return;
  if (myOrders.length === 0) {
    ordersList.innerHTML = `<p style="color:var(--text-medium);font-size:14px;padding:16px;text-align:center;">No orders yet. <a href="#" onclick="navigate('home');return false;" style="color:var(--primary-color);font-weight:600;">Start shopping!</a></p>`;
  } else {
    ordersList.innerHTML = myOrders.map(order => `
      <div style="border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:14px;margin-bottom:10px;background:var(--bg-card);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px;">
          <strong style="font-size:13px;font-family:monospace;color:var(--primary-color);">${order.orderId}</strong>
          <span class="status-pill ${order.status}">${order.status}</span>
        </div>
        <div style="font-size:12px;color:var(--text-medium);margin-bottom:8px;">📅 ${order.date} · 📍 ${order.branch} · <strong>${formatNumber(order.amount)} RWF</strong></div>
        <div class="order-timeline">
          <div class="timeline-step ${['pending','paid','delivered'].includes(order.status)?'done':''}">📦</div>
          <div class="timeline-line ${['paid','delivered'].includes(order.status)?'done':''}"></div>
          <div class="timeline-step ${['paid','delivered'].includes(order.status)?'done':''}">💳</div>
          <div class="timeline-line ${order.status==='delivered'?'done':''}"></div>
          <div class="timeline-step ${order.status==='delivered'?'done':''}">✅</div>
        </div>
        <button class="btn btn-secondary" style="padding:6px 14px;font-size:11px;margin-top:12px;" onclick="reorderFromHistory('${order.orderId}')">🔄 Buy Again</button>
      </div>`).join('');
  }

  // Wishlist preview
  const wishlistPreview = document.getElementById('profile-wishlist-preview');
  if (wishlistPreview) {
    const wl = state.products.filter(p => state.wishlist.includes(p.id)).slice(0, 5);
    wishlistPreview.innerHTML = wl.length === 0
      ? `<p style="color:var(--text-medium);font-size:13px;">No saved items yet.</p>`
      : wl.map(p => `
          <div style="width:90px;text-align:center;cursor:pointer;flex-shrink:0;" onclick="openProductModal(${p.id})">
            <img src="${p.image}" style="width:80px;height:80px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border-color);" loading="lazy">
            <div style="font-size:10px;margin-top:4px;color:var(--text-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</div>
          </div>`).join('');
  }
}
window.renderProfile = renderProfile;

// Smart reorder — Buy Again
function reorderFromHistory(orderId) {
  const order = state.orders.find(o => o.orderId === orderId);
  if (!order) return;
  let added = 0;
  order.items.forEach(item => {
    const product = state.products.find(p => p.id === item.product.id);
    if (product && product.inStock) {
      const existing = state.cart.find(c => c.product.id === product.id);
      if (existing) existing.quantity += item.quantity;
      else state.cart.push({ product, quantity: item.quantity });
      added++;
    }
  });
  localStorage.setItem('simba_cart', JSON.stringify(state.cart));
  updateCartBadge();
  showToast(`${added} item(s) re-added to cart! 🔄`, 'success');
  navigate('cart');
}
window.reorderFromHistory = reorderFromHistory;

// ── DELIVERY ZONE ─────────────────────────────────────────────
function handleZoneChange(zone) {
  state.selectedDeliveryZone = zone;
  localStorage.setItem('simba_zone', zone);
  renderCheckoutSummary();
}
window.handleZoneChange = handleZoneChange;

// ── PRODUCT REVIEWS ───────────────────────────────────────────
function setReviewRating(productId, val) {
  const input = document.getElementById(`review-rating-${productId}`);
  if (input) input.value = val;
  document.querySelectorAll(`#review-stars-${productId} .review-star`).forEach((s, i) => {
    s.style.color = i < val ? 'var(--primary-color)' : 'var(--border-color)';
  });
}
window.setReviewRating = setReviewRating;

function submitReview(e, productId) {
  e.preventDefault();
  const rating = parseInt((document.getElementById(`review-rating-${productId}`) || {}).value || '0');
  const textEl = document.getElementById(`review-text-${productId}`);
  const text = textEl ? textEl.value.trim() : '';
  if (!rating) { showToast('Please select a star rating.', 'error'); return; }
  if (!text)   { showToast('Please write a review.', 'error'); return; }

  const reviews = JSON.parse(localStorage.getItem('simba_reviews')) || {};
  if (!reviews[productId]) reviews[productId] = [];
  reviews[productId].push({
    userId: state.user.email,
    userName: state.user.name,
    rating, text,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('simba_reviews', JSON.stringify(reviews));
  showToast('Review submitted — thank you! ⭐', 'success');
  openProductModal(productId); // Refresh modal with new review
}
window.submitReview = submitReview;

// ── PROMOTIONS PAGE ───────────────────────────────────────────
function renderPromotions() {
  const grid = document.getElementById('promotions-grid');
  const countdownEl = document.getElementById('promotions-countdown');
  if (!grid) return;

  // 24 sale products
  const saleProducts = state.products
    .filter(p => p.inStock && p.price > 3000)
    .slice(0, 24)
    .map(p => ({
      ...p,
      discountPct: [10, 15, 20, 25, 30][p.id % 5],
      salePrice: Math.floor(p.price * (1 - [10,15,20,25,30][p.id % 5] / 100))
    }));

  // Countdown — 48 h window stored in sessionStorage
  if (!sessionStorage.getItem('simba_sale_end')) {
    sessionStorage.setItem('simba_sale_end', Date.now() + 48 * 3600000);
  }
  const endTime = parseInt(sessionStorage.getItem('simba_sale_end'));

  function tick() {
    const left = endTime - Date.now();
    if (!document.getElementById('promotions-countdown')) { clearInterval(window._promoTimer); return; }
    if (left <= 0) { clearInterval(window._promoTimer); if (countdownEl) countdownEl.innerHTML = '<p style="text-align:center;color:var(--text-medium);">Sale ended.</p>'; return; }
    const h = String(Math.floor(left / 3600000)).padStart(2,'0');
    const m = String(Math.floor((left % 3600000) / 60000)).padStart(2,'0');
    const s = String(Math.floor((left % 60000) / 1000)).padStart(2,'0');
    if (countdownEl) countdownEl.innerHTML = `
      <p style="text-align:center;font-size:13px;color:var(--text-medium);margin-bottom:10px;">⏰ Flash sale ends in:</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;">
        ${[['HOURS',h],['MIN',m],['SEC',s]].map(([l,v]) => `
          <div style="text-align:center;background:var(--primary-color);color:#fff;padding:12px 18px;border-radius:var(--radius-sm);min-width:64px;">
            <div style="font-size:26px;font-weight:800;line-height:1;">${v}</div>
            <div style="font-size:10px;margin-top:2px;">${l}</div>
          </div>`).join('')}
      </div>`;
  }
  clearInterval(window._promoTimer);
  window._promoTimer = setInterval(tick, 1000);
  tick();

  grid.innerHTML = saleProducts.map(p => `
    <div class="product-card" style="cursor:pointer;position:relative;" onclick="openProductModal(${p.id})">
      <div style="position:absolute;top:8px;right:8px;background:#DC2626;color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:4px;z-index:2;">-${p.discountPct}%</div>
      <div class="product-card-image-wrapper">
        <img class="product-card-img" src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-card-badge stock-instock">🟢 In Stock</span>
      </div>
      <div class="product-card-info">
        <span class="product-card-category">${p.category}</span>
        <h4 class="product-card-name">${p.name}</h4>
        <div class="product-card-footer">
          <div>
            <div style="font-size:11px;color:var(--text-light);text-decoration:line-through;">${formatNumber(p.price)} RWF</div>
            <div style="font-size:15px;font-weight:800;color:#DC2626;">${formatNumber(p.salePrice)} RWF</div>
          </div>
          <button class="btn-card-add" onclick="event.stopPropagation();addToCartById(${p.id})">🛒 Add</button>
        </div>
      </div>
    </div>`).join('');
}
window.renderPromotions = renderPromotions;

// Dashboard Login Gate handler
function handleGateLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('gate-email').value.trim();
  const password = document.getElementById('gate-password').value;
  const feedback = document.getElementById('gate-feedback');
  
  feedback.className = 'form-feedback';
  feedback.style.display = 'none';
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<div class="spinner" style="width:14px; height:14px; border-width:2px; display:inline-block;"></div> Signing in...`;
  submitBtn.disabled = true;
  
  setTimeout(() => {
    // Check rep credentials: rep@simba.rw / simba@rep2026 OR rep@simba.rw / reppassword
    const validRep = (email === 'rep@simba.rw' && (password === 'simba@rep2026' || password === 'reppassword'));
    
    if (validRep) {
      loginUser({ email, name: 'Simba Market Rep', role: 'representative' });
      showToast('Representative access granted!', 'success');
      e.target.reset();
      
      // Show dashboard content
      document.getElementById('dashboard-login-gate').style.display = 'none';
      document.getElementById('dashboard-content').style.display = 'block';
      renderDashboard();
    } else {
      feedback.textContent = 'Invalid credentials. Use rep@simba.rw / simba@rep2026';
      feedback.className = 'form-feedback error';
    }
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 1000);
}

// Handle feedback form submission
function handleFeedbackSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('feedback-name').value.trim();
  const email = document.getElementById('feedback-email').value.trim();
  const type = document.getElementById('feedback-type-value').value;
  const rating = document.getElementById('feedback-rating-value').value;
  const branch = document.getElementById('feedback-branch').value;
  const message = document.getElementById('feedback-message').value.trim();
  const result = document.getElementById('feedback-result');
  
  if (!name || !email || !message) {
    result.textContent = 'Please fill in all required fields.';
    result.className = 'form-feedback error';
    return;
  }
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<div class="spinner" style="width:14px; height:14px; border-width:2px; display:inline-block;"></div> Sending...`;
  submitBtn.disabled = true;
  
  // Save feedback to localStorage
  setTimeout(() => {
    const feedbacks = JSON.parse(localStorage.getItem('simba_feedbacks')) || [];
    feedbacks.push({
      name, email, type,
      rating: parseInt(rating) || 0,
      branch: branch || 'N/A',
      message,
      date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('simba_feedbacks', JSON.stringify(feedbacks));
    
    result.textContent = `Thank you, ${name}! Your feedback has been received. We appreciate your input!`;
    result.className = 'form-feedback success';
    e.target.reset();
    
    // Reset stars and type chips visually
    document.querySelectorAll('.rating-star').forEach(s => s.classList.remove('active'));
    document.getElementById('feedback-rating-value').value = '0';
    document.querySelectorAll('.feedback-type-chip').forEach((c, i) => {
      c.classList.toggle('active', i === 0);
    });
    document.getElementById('feedback-type-value').value = 'General';
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    
    showToast('Feedback submitted successfully!', 'success');
  }, 1200);
}
window.handleFeedbackSubmit = handleFeedbackSubmit;

// ============================================================
// URL-based routing (supports both path /admin and hash #admin)
// Vercel rewrites all paths to index.html via vercel.json,
// then this router reads window.location.pathname / hash.
//
// Supported paths:  /admin, /about, /contact, /cart, /auth
// Supported hashes: #admin, #about, #contact, #cart, #auth, #home
// Example: https://your-site.vercel.app/admin  →  MarketRep Dashboard
// ============================================================

const PATH_ROUTE_MAP = {
  '/admin':      'dashboard',
  '/dashboard':  'dashboard',
  '/about':      'about',
  '/contact':    'contact',
  '/cart':       'cart',
  '/auth':       'auth',
  '/profile':    'profile',
  '/wishlist':   'wishlist',
  '/promotions': 'promotions',
  '/home':       'home',
  '/':           'home'
};

const HASH_ROUTE_MAP = {
  '#admin':     'dashboard',
  '#dashboard': 'dashboard',
  '#about':     'about',
  '#contact':   'contact',
  '#cart':      'cart',
  '#auth':      'auth',
  '#home':      'home',
  '':           'home'
};

// Sync URL when navigating (use path-style on Vercel, hash locally)
function updateHash(page) {
  const pathMap = {
    dashboard:   '/admin',
    about:       '/about',
    contact:     '/contact',
    cart:        '/cart',
    auth:        '/auth',
    profile:     '/profile',
    wishlist:    '/wishlist',
    promotions:  '/promotions',
    home:        '/'
  };
  const newPath = pathMap[page] || '/';
  if (window.location.pathname !== newPath) {
    history.pushState(null, '', newPath);
  }
}

// Determine target page from current URL (path takes priority over hash)
function getRouteFromUrl() {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return PATH_ROUTE_MAP[path] || HASH_ROUTE_MAP[hash] || 'home';
}

// Navigate based on current URL
function handleHashRoute() {
  const page = getRouteFromUrl();
  navigate(page);
}

// Mobile menu toggle
function toggleMobileMenu() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const btn = document.getElementById('mobile-menu-btn');
  const hamburger = btn.querySelector('.hamburger-icon');
  const close = btn.querySelector('.close-icon');
  const isOpen = drawer.classList.contains('open');
  
  if (isOpen) {
    drawer.classList.remove('open');
    hamburger.style.display = 'block';
    close.style.display = 'none';
  } else {
    drawer.classList.add('open');
    hamburger.style.display = 'none';
    close.style.display = 'block';
  }
}
window.toggleMobileMenu = toggleMobileMenu;

function closeMobileMenu() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const btn = document.getElementById('mobile-menu-btn');
  if (!drawer || !btn) return;
  drawer.classList.remove('open');
  const hamburger = btn.querySelector('.hamburger-icon');
  const close = btn.querySelector('.close-icon');
  if (hamburger) hamburger.style.display = 'block';
  if (close) close.style.display = 'none';
}
window.closeMobileMenu = closeMobileMenu;

function handleMobileAccountClick() {
  closeMobileMenu();
  if (state.user) {
    if (confirm('Are you sure you want to log out?')) logoutUser();
  } else {
    navigate('auth');
  }
}
window.handleMobileAccountClick = handleMobileAccountClick;

// Listen for browser back/forward
window.addEventListener('popstate', handleHashRoute);

// Window load trigger
window.addEventListener('DOMContentLoaded', async () => {
  await init();
  // After init, check if a route was requested via URL
  const page = getRouteFromUrl();
  if (page !== 'home') {
    navigate(page);
  }
});
