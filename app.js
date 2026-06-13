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
  loadedCount: 24, // Pagination chunk size
  lastOrder: null,
  language: localStorage.getItem('simba_language') || 'en',
  translations: {},
  theme: localStorage.getItem('simba_theme') || 'light',
  orders: [],
  dashboardTab: 'orders' // 'orders', 'inventory', 'analytics'
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
  
  // Navigation elements
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
  
  // Containers
  productsGrid: document.getElementById('products-grid'),
  categoryList: document.getElementById('categories-list'),
  productCount: document.getElementById('product-count'),
  loadMoreContainer: document.getElementById('load-more-container'),
  cartItemsList: document.getElementById('cart-items-list'),
  cartSummaryContainer: document.getElementById('cart-summary-container'),
  
  // Auth Forms
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginTab: document.getElementById('tab-login'),
  registerTab: document.getElementById('tab-register'),
  
  // Loader overlay & Toasts
  loadingOverlay: document.getElementById('loading-overlay'),
  toastContainer: document.getElementById('toast-container')
};

// Initialize Application
async function init() {
  showGlobalLoading(true);
  
  // Initialize Theme preference
  if (state.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  
  // Initialize language selector value
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
  
  // Toggle visibility of views
  el.homeView.classList.remove('active');
  el.aboutView.classList.remove('active');
  el.contactView.classList.remove('active');
  el.cartView.classList.remove('active');
  el.authView.classList.remove('active');
  el.checkoutView.classList.remove('active');
  el.confirmationView.classList.remove('active');
  el.dashboardView.classList.remove('active');
  
  // Set navbar buttons as active or inactive
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
  } else if (page === 'dashboard') {
    el.dashboardView.classList.add('active');
    el.dashboardNavBtn.classList.add('active');
    
    // Show login gate if not logged in as representative
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
  
  // Remove home button when already on home page, keep elsewhere
  if (page === 'home') {
    el.homeNavBtn.classList.add('hidden');
  } else {
    el.homeNavBtn.classList.remove('hidden');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Products list branch availability filter
function getFilteredProducts() {
  return state.products.filter(product => {
    // 1. Stock Status filtering
    if (!product.inStock) {
      return false;
    }
    
    // 2. Branch selector filtering
    if (state.selectedBranch !== 'All Branches' && !product.branches.includes(state.selectedBranch)) {
      return false;
    }
    
    // 3. Category selector chips filtering
    if (state.selectedCategory !== 'All' && product.category !== state.selectedCategory) {
      return false;
    }
    
    // 4. Search bar query filtering
    if (state.searchQuery) {
      const nameMatch = product.name.toLowerCase().includes(state.searchQuery);
      const catMatch = product.category.toLowerCase().includes(state.searchQuery);
      if (!nameMatch && !catMatch) return false;
    }
    
    return true;
  });
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
        <span class="product-card-badge">${product.inStock ? 'In Stock' : 'Out of Stock'}</span>
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
            : `<button class="btn-card-add" style="background-color: var(--text-light); cursor: not-allowed;" disabled>${state.translations.sold_out || 'Sold Out'}</button>`
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
  const delivery = subtotal > 50000 || subtotal === 0 ? 0 : 2500;
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

// Register accounts submissions
function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const feedback = document.getElementById('register-feedback');
  
  feedback.className = 'form-feedback';
  feedback.style.display = 'none';
  
  if (!name || !email || !password) {
    feedback.textContent = 'Please fill out all fields.';
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
    
    users.push({ name, email, password });
    localStorage.setItem('simba_registered_users', JSON.stringify(users));
    
    loginUser({ name, email, role: 'customer' });
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
function handleGoogleLogin() {
  showGlobalLoading(true);
  
  setTimeout(() => {
    const googleUser = {
      email: 'john.rwanda@gmail.com',
      name: 'John Simba Google',
      role: 'customer'
    };
    
    loginUser(googleUser);
    showGlobalLoading(false);
    showToast('Signed in via Google successfully!', 'success');
    
    if (localStorage.getItem('simba_redirect_checkout') === 'true') {
      localStorage.removeItem('simba_redirect_checkout');
      navigate('checkout');
    } else {
      navigate('home');
    }
  }, 1200);
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
  if (state.user) {
    const initials = state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    el.accountNavBtn.innerHTML = `
      <div style="width: 22px; height: 22px; border-radius: 50%; background-color: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px;">
        ${initials}
      </div>
      <span data-i18n="nav_logout">${state.translations.nav_logout || 'Log Out'}</span>
    `;
    
    // Toggle navigation visibility of Dashboard - always show in nav, gate is inside dashboard page
    el.dashboardNavBtn.style.display = 'flex';
  } else {
    el.accountNavBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      <span data-i18n="nav_signin">${state.translations.nav_signin || 'Sign In'}</span>
    `;
    el.dashboardNavBtn.style.display = 'flex';
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

// Product Details Modal Overlay loader - Enhanced with full description
function openProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  const modal = document.getElementById('product-detail-modal');
  const body = document.getElementById('modal-body');
  
  const cartItem = state.cart.find(item => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  // Generate a rich product description from available data
  const descriptionMap = {
    'Food Products': 'A high-quality food product carefully selected by Simba Supermarket to ensure freshness, safety, and great taste for you and your family.',
    'Alcoholic Drinks': 'Premium imported beverage available in select Simba branches. Responsibly enjoy this product. Must be 18+ to purchase.',
    'Cosmetics & Personal Care': 'A trusted personal care product sourced to maintain your health, hygiene, and daily wellness routine.',
    'Baby Products': 'Safe, tested, and certified product designed specifically for babies and young children. Gentle and effective.',
    'Kitchenware & Electronics': 'A durable kitchenware or electronics item that enhances your home cooking and everyday lifestyle experience.',
    'Sports & Wellness': 'Designed to support an active and healthy lifestyle. Perfect for fitness enthusiasts and wellness-focused individuals.',
    'General': 'A versatile everyday product available across Simba Supermarket branches, known for great quality and value.'
  };

  const description = product.description || descriptionMap[product.category] || 
    `${product.name} is a quality product available at Simba Supermarket. Sold per ${product.unit} at an affordable price. Available in selected branches.`;

  body.innerHTML = `
    <div class="modal-body-layout">
      <div>
        <img src="${product.image}" alt="${product.name}" class="modal-product-img">
      </div>
      <div style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="modal-product-category">${product.category}</div>
          <h3 class="modal-product-name">${product.name}</h3>
          
          <span class="modal-product-badge ${product.inStock ? 'instock' : 'outofstock'}">
            ${product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
          </span>

          <div class="modal-product-price">${formatNumber(product.price)} <span style="font-size:14px; font-weight:500; color:var(--text-medium);">RWF</span></div>
          <div class="modal-product-unit">Per ${product.unit}</div>

          <div class="modal-description-label">Product Description</div>
          <div class="modal-description-text">${description}</div>

          <div class="modal-description-label">Available at Branches</div>
          <div class="modal-branches-list">
            ${product.branches.map(b => `<span class="modal-branch-chip">📍 ${b}</span>`).join('')}
          </div>

          <div style="display:flex; gap:16px; font-size:12px; color:var(--text-medium); margin-bottom:16px; flex-wrap:wrap;">
            <span>🏷️ <strong>SKU:</strong> ${product.id}</span>
            <span>📦 <strong>Unit:</strong> ${product.unit}</span>
            <span>🗂️ <strong>Category:</strong> ${product.category}</span>
          </div>
        </div>
        
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          ${product.inStock 
            ? `<button class="btn btn-primary" style="flex:1; min-width:140px; padding:12px 16px; font-size:13px;" onclick="addToCartById(${product.id}); closeProductModal();">
                 🛒 Add to Cart${inCartQty > 0 ? ` (${inCartQty})` : ''}
               </button>`
            : `<button class="btn" style="flex:1; background-color:var(--text-light); color:white; cursor:not-allowed; padding:12px 16px; font-size:13px;" disabled>Sold Out</button>`
          }
          <button class="btn btn-outline" onclick="closeProductModal()" style="padding:12px 16px; font-size:13px;">Close</button>
        </div>
      </div>
    </div>
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
  '/admin':     'dashboard',
  '/dashboard': 'dashboard',
  '/about':     'about',
  '/contact':   'contact',
  '/cart':      'cart',
  '/auth':      'auth',
  '/home':      'home',
  '/':          'home'
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
    dashboard: '/admin',
    about:     '/about',
    contact:   '/contact',
    cart:      '/cart',
    auth:      '/auth',
    home:      '/'
  };
  const newPath = pathMap[page] || '/';
  // Only push if path actually changed to avoid loop
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
