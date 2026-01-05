// pos.js - WITH SELECT PRODUCT SECTION IN ADDONS MODAL
// ============================
// GLOBAL VARIABLES
// ============================
let cart = [];
let orderType = "Dine In";
let paymentMethod = "Cash";
let discountApplied = false;
let employeeDiscountApplied = false;
let storeOpen = false;
let selectedProduct = null;
let selectedAddons = [];
let selectedUpgrade = null;
let selectedFlavors = []; // NEW: Array for multiple flavors
let specialInstructions = "";
let lastActionTime = null;
let products = [];
let addons = [];
let upgrades = [];
let flavors = [];
let completeProducts = []; // NEW: For k-street product complete
let categories = ["All"];
let activeCategory = "All";
let searchTerm = "";
let paymentAmount = "";
let changeAmount = 0;
let receiptContent = "";
let orderSaved = false;
let currentPage = 1;
let itemsPerPage = 9;

// NEW: Queue Management Variables
let queuedOrders = [];
let tableCounter = 0;

// ============================
// INITIALIZATION
// ============================
document.addEventListener("DOMContentLoaded", function () {
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  checkCurrentStoreStatus();
  fetchProducts();
  fetchAddons();
  fetchUpgrades();
  fetchCompleteProducts(); // NEW: Fetch complete products

  // NEW: Initialize queue management
  loadQueuedOrders();
  initializeTableCounter();
  updateQueueBadge();
  updateQueueButtonsVisibility();

  setupEventListeners();
});

// ============================
// TIME FUNCTIONS - FIXED FOR PHILIPPINES TIMEZONE
// ============================
function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
  document.getElementById("currentDateTime").textContent = timeString;
}

function formatStoreTime(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
}

// ============================
// SETUP EVENT LISTENERS
// ============================
function setupEventListeners() {
  // Order Type Buttons
  document
    .getElementById("dineInBtn")
    .addEventListener("click", () => setOrderType("Dine In"));
  document
    .getElementById("takeOutBtn")
    .addEventListener("click", () => setOrderType("Take-Out"));

  // Store Toggle
  document
    .getElementById("storeToggleBtn")
    .addEventListener("click", handleStoreToggle);

  // Search Input
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);

  // Payment Input
  document
    .getElementById("paymentInput")
    .addEventListener("input", updateChangeAmount);

  // Process Payment Button
  document
    .getElementById("processPaymentBtn")
    .addEventListener("click", processPayment);

  // Payment method buttons
  document.querySelectorAll(".payment-method-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      setPaymentMethod(this.textContent.trim());
    });
  });

  // Discount buttons
  document
    .getElementById("pwdDiscountBtn")
    .addEventListener("click", togglePWDDiscount);
  document
    .getElementById("employeeDiscountBtn")
    .addEventListener("click", toggleEmployeeDiscount);

  // Cart buttons
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);

  // Payment amount buttons
  document.querySelectorAll(".amount-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const amount = this.getAttribute("data-amount");
      if (amount === "exact") {
        setPaymentExact();
      } else {
        setPaymentAmount(amount);
      }
    });
  });

  // Close modal buttons
  document
    .getElementById("closeStoreModalBtn")
    .addEventListener("click", closeStoreModal);
  document
    .getElementById("storeModalBtn")
    .addEventListener("click", closeStoreModal);

  document
    .getElementById("closePaymentModalBtn")
    .addEventListener("click", closePaymentModal);

  document
    .getElementById("closeReceiptModalBtn")
    .addEventListener("click", closeReceiptModal);
  document
    .getElementById("printReceiptBtn")
    .addEventListener("click", printReceipt);
  document
    .getElementById("saveReceiptBtn")
    .addEventListener("click", saveReceiptAsPNG);
}

function setOrderType(type) {
  orderType = type;

  const dineInBtn = document.getElementById("dineInBtn");
  const takeOutBtn = document.getElementById("takeOutBtn");

  if (type === "Dine In") {
    dineInBtn.className =
      "px-8 py-3 rounded-xl font-semibold transition-all shadow-lg bg-black text-white shadow-xl scale-105";
    takeOutBtn.className =
      "px-8 py-3 rounded-xl font-semibold transition-all shadow-lg bg-white text-black";
  } else {
    dineInBtn.className =
      "px-8 py-3 rounded-xl font-semibold transition-all shadow-lg bg-white text-black";
    takeOutBtn.className =
      "px-8 py-3 rounded-xl font-semibold transition-all shadow-lg bg-black text-white shadow-xl scale-105";
  }
}

// ============================
// STORE STATUS FUNCTIONS - FIXED TIMEZONE
// ============================
async function checkCurrentStoreStatus() {
  try {
    const response = await fetch(
      "backend/pos_api.php?action=get_store_status",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User": JSON.stringify({
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.role || "cashier",
            branch: currentUser.branch || "main",
          }),
        },
      }
    );

    const data = await response.json();

    storeOpen = data.isOpen || false;
    updateStoreToggleButton();
    renderProducts();

    if (data.lastAction) {
      lastActionTime = data.lastAction.timestamp;
      updateLastActionTime();
    }
  } catch (error) {
    console.error("Error checking store status:", error);
    storeOpen = false;
    updateStoreToggleButton();
    renderProducts();
  }
}

async function handleStoreToggle() {
  if (!currentUser) {
    return;
  }

  const newStatus = !storeOpen;
  const action = newStatus ? "open" : "close";

  try {
    // Get current time in Philippines timezone
    const now = new Date();
    const phTimeString = now.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila",
    });

    const response = await fetch(
      "backend/pos_api.php?action=log_store_action",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User": JSON.stringify({
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.role || "cashier",
            branch: currentUser.branch || "main",
          }),
        },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          action: action,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      storeOpen = newStatus;
      updateStoreToggleButton();
      renderProducts();

      // Use Philippine time directly from browser
      const actionTime = phTimeString;

      lastActionTime = new Date().toISOString();
      updateLastActionTime();

      showStoreSuccessModal(newStatus, actionTime);
    } else {
      alert(
        "Failed to update store status: " + (data.message || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error toggling store status:", error);
    alert("Failed to update store status");
  }
}

function updateStoreToggleButton() {
  const btn = document.getElementById("storeToggleBtn");
  btn.textContent = storeOpen ? "OPEN" : "CLOSED";
  btn.className = storeOpen
    ? "px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-lg bg-white text-black hover:bg-red-50"
    : "px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-lg bg-black text-white hover:bg-gray-800";
}

function updateLastActionTime() {
  if (lastActionTime) {
    document.getElementById("lastActionTime").textContent = `${
      storeOpen ? "Opened" : "Closed"
    } at ${formatStoreTime(lastActionTime)}`;
  }
}

function showStoreSuccessModal(isOpen, actionTime) {
  const modal = document.getElementById("storeSuccessModal");
  const header = document.getElementById("storeModalHeader");
  const title = document.getElementById("storeModalTitle");
  const subtitle = document.getElementById("storeModalSubtitle");
  const icon = document.getElementById("storeModalIcon");
  const message = document.getElementById("storeModalMessage");
  const timeBox = document.getElementById("storeModalTimeBox");
  const timeLabel = document.getElementById("storeModalTimeLabel");
  const timeValue = document.getElementById("storeActionTime");
  const btn = document.getElementById("storeModalBtn");

  if (isOpen) {
    header.className =
      "p-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl";
    title.textContent = "Store Opened Successfully!";
    subtitle.textContent = "Welcome to K-Street POS";
    icon.textContent = "✓";
    icon.className = "text-7xl mb-4 text-red-500";
    message.textContent = "Your store is now open for business!";
    timeBox.className =
      "bg-gradient-to-r from-red-50 to-red-50 border-2 border-red-200 rounded-2xl p-5 mt-4";
    timeLabel.textContent = "Store Opened At:";
    timeLabel.className = "text-red-800 font-semibold text-lg mb-1";
    timeValue.className = "text-red-600 font-bold text-3xl";
    btn.className =
      "flex-1 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl";
    btn.textContent = "Start Selling!";
  } else {
    header.className =
      "p-6 bg-gradient-to-r from-black to-black text-white rounded-t-3xl";
    title.textContent = "Store Closed Successfully!";
    subtitle.textContent = "Thank you for using K-Street POS";
    icon.textContent = "🔒";
    icon.className = "text-7xl mb-4 text-gray-500";
    message.textContent = "Your store is now closed for the day.";
    timeBox.className =
      "bg-gradient-to-r from-gray-50 to-gray-50 border-2 border-gray-200 rounded-2xl p-5 mt-4";
    timeLabel.textContent = "Store Closed At:";
    timeLabel.className = "text-gray-800 font-semibold text-lg mb-1";
    timeValue.className = "text-gray-600 font-bold text-3xl";
    btn.className =
      "flex-1 py-3.5 bg-gradient-to-r from-black to-black text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl";
    btn.textContent = "Got It!";
  }

  timeValue.textContent = actionTime;
  modal.classList.add("active");
}

function closeStoreModal() {
  document.getElementById("storeSuccessModal").classList.remove("active");
  updateStoreToggleButton();
  updateLastActionTime();
  renderProducts();

  const pwdBtn = document.getElementById("pwdDiscountBtn");
  const empBtn = document.getElementById("employeeDiscountBtn");

  if (storeOpen) {
    pwdBtn.disabled = false;
    empBtn.disabled = false;
    pwdBtn.style.opacity = "1";
    empBtn.style.opacity = "1";
    pwdBtn.style.cursor = "pointer";
    empBtn.style.cursor = "pointer";
  } else {
    pwdBtn.disabled = true;
    empBtn.disabled = true;
    pwdBtn.style.opacity = "0.5";
    empBtn.style.opacity = "0.5";
    pwdBtn.style.cursor = "not-allowed";
    empBtn.style.cursor = "not-allowed";
  }
}

// ============================
// DATA FETCHING FUNCTIONS
// ============================
async function fetchProducts() {
  try {
    const response = await fetch("backend/pos_api.php?action=get_items", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User": JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role || "cashier",
          branch: currentUser.branch || "main",
        }),
      },
    });

    const data = await response.json();

    // Filter k-street food
    products = data.filter((item) => item.description_type === "k-street food");

    // Sort by: 1. Main Category First, 2. Alphabetical
    products.sort((a, b) => {
      const aIsMain = a.category && a.category.toLowerCase() === "main";
      const bIsMain = b.category && b.category.toLowerCase() === "main";

      if ((aIsMain && bIsMain) || (!aIsMain && !bIsMain)) {
        return a.name.localeCompare(b.name);
      }

      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;

      return 0;
    });

    // Extract unique categories
    const uniqueCategories = [
      "All",
      ...new Set(products.map((p) => p.category)),
    ];
    categories = uniqueCategories;

    renderCategoryButtons();
    renderProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    products = [];
    renderProducts();
  }
}

async function fetchAddons() {
  try {
    const response = await fetch("backend/pos_api.php?action=get_all_items", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User": JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role || "cashier",
          branch: currentUser.branch || "main",
        }),
      },
    });

    const data = await response.json();
    addons = data.filter(
      (item) => item.description_type === "k-street add sides"
    );
  } catch (error) {
    console.error("Error fetching addons:", error);
    addons = [];
  }
}

async function fetchUpgrades() {
  try {
    const response = await fetch("backend/pos_api.php?action=get_all_items", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User": JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role || "cashier",
          branch: currentUser.branch || "main",
        }),
      },
    });

    const data = await response.json();
    upgrades = data.filter(
      (item) => item.description_type === "k-street upgrades"
    );
    flavors = data.filter(
      (item) => item.description_type === "k-street Flavor"
    );
  } catch (error) {
    console.error("Error fetching upgrades:", error);
    upgrades = [];
    flavors = [];
  }
}

// NEW: Fetch Complete Products
async function fetchCompleteProducts() {
  try {
    const response = await fetch("backend/pos_api.php?action=get_all_items", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User": JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role || "cashier",
          branch: currentUser.branch || "main",
        }),
      },
    });

    const data = await response.json();
    completeProducts = data.filter(
      (item) => item.description_type === "k-street product"
    );
    console.log("Complete products loaded:", completeProducts);
  } catch (error) {
    console.error("Error fetching complete products:", error);
    completeProducts = [];
  }
}

// ============================
// RENDER CATEGORY BUTTONS
// ============================
function renderCategoryButtons() {
  const container = document.getElementById("categoryButtons");
  container.innerHTML = categories
    .map(
      (cat) => `
        <button onclick="filterCategory('${cat}')" 
                class="category-btn px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all shadow-sm ${
                  activeCategory === cat
                    ? "bg-red-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }">
            ${cat}
        </button>
    `
    )
    .join("");
}

// ============================
// RENDER PRODUCTS
// ============================
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const paginationContainer = document.getElementById("paginationContainer");

  const filtered = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  } else if (currentPage < 1) {
    currentPage = 1;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  if (paginatedItems.length === 0) {
    grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-400">
                <div class="text-5xl mb-3">🔍</div>
                <p class="text-lg font-semibold text-gray-500">No products found</p>
                <p class="text-sm mt-1">Try different search terms or category</p>
            </div>
        `;

    if (paginationContainer) {
      paginationContainer.style.display = "none";
    }
    return;
  }

  grid.innerHTML = paginatedItems
    .map(
      (product) => `
        <div onclick="addToCart(${
          product.id
        })" class="group border-2 rounded-2xl p-4 transition-all duration-300 ${
        storeOpen
          ? "border-gray-100 hover:shadow-2xl hover:border-red-200 hover:scale-105 cursor-pointer"
          : "border-gray-200 opacity-80 cursor-not-allowed"
      }">
            <div class="h-40 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                ${getProductImageHtml(product)}
            </div>
            <h3 class="font-bold text-lg text-gray-800 mb-1">${
              product.name
            }</h3>
            <span class="inline-block px-3 py-1 bg-red-100 text-black-700 text-xs font-semibold rounded-full mb-3">${
              product.category
            }</span>
            <div class="flex justify-between items-center">
                <span class="text-red-600 font-bold text-xl">₱${parseFloat(
                  product.price
                ).toFixed(2)}</span>
                <button onclick="event.stopPropagation(); addToCart(${
                  product.id
                })" 
                        ${
                          !storeOpen ? 'disabled title="Store is closed"' : ""
                        } class="px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
        storeOpen
          ? "bg-gradient-to-r from-red-600 to-red-600 text-white hover:from-black hover:to-black hover:shadow-xl"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }">
                    ${storeOpen ? "Add" : "Closed"}
                </button>
            </div>
        </div>
    `
    )
    .join("");

  if (filtered.length > itemsPerPage) {
    renderPagination(filtered.length, totalPages, startIndex, endIndex);
    if (paginationContainer) {
      paginationContainer.style.display = "block";
    }
  } else {
    if (paginationContainer) {
      paginationContainer.style.display = "none";
    }
  }
}

function setPaymentExact() {
  if (!storeOpen) {
    return;
  }

  if (cart.length === 0) {
    return;
  }

  const total = calculateTotal();
  document.getElementById("paymentInput").value = total.toFixed(2);
  paymentAmount = total.toString();
  updateTotals();
}

function renderPagination(totalItems, totalPages, startIndex, endIndex) {
  const paginationContainer = document.getElementById("paginationContainer");
  if (!paginationContainer) {
    const productGrid = document.getElementById("productGrid");
    const parent = productGrid.parentElement;

    const newPaginationContainer = document.createElement("div");
    newPaginationContainer.id = "paginationContainer";
    newPaginationContainer.className = "mt-6 flex justify-center";
    parent.appendChild(newPaginationContainer);
  }

  let paginationHTML = `
    <div class="flex flex-col items-center justify-center space-y-3">
      <div class="flex items-center justify-center space-x-2">
        <button onclick="goToPage(${currentPage - 1})" 
                ${currentPage === 1 ? "disabled" : ""}
                class="px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }">
          ← Previous
        </button>
  `;

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationHTML += `
      <button onclick="goToPage(1)" class="px-4 py-2 rounded-lg font-medium transition-all ${
        1 === currentPage
          ? "bg-red-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }">
        1
      </button>
      ${startPage > 2 ? '<span class="px-2 text-gray-400">...</span>' : ""}
    `;
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button onclick="goToPage(${i})" class="px-4 py-2 rounded-lg font-medium transition-all ${
      i === currentPage
        ? "bg-red-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    paginationHTML += `
      ${
        endPage < totalPages - 1
          ? '<span class="px-2 text-gray-400">...</span>'
          : ""
      }
      <button onclick="goToPage(${totalPages})" class="px-4 py-2 rounded-lg font-medium transition-all ${
      totalPages === currentPage
        ? "bg-red-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }">
        ${totalPages}
      </button>
    `;
  }

  paginationHTML += `
        <button onclick="goToPage(${currentPage + 1})" 
                ${currentPage === totalPages ? "disabled" : ""}
                class="px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }">
          Next →
        </button>
      </div>
      <div class="text-center text-gray-600 text-sm">
        Showing ${startIndex + 1}-${Math.min(
    endIndex,
    totalItems
  )} of ${totalItems} products
      </div>
    </div>
  `;

  paginationContainer.innerHTML = paginationHTML;
}

function goToPage(page) {
  const filtered = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderProducts();
    document
      .getElementById("productGrid")
      .scrollIntoView({ behavior: "smooth" });
  }
}

function getProductImageHtml(product) {
  if (
    product.image &&
    product.image.trim() !== "" &&
    product.image !== "null"
  ) {
    let imageUrl = product.image.trim();
    imageUrl = imageUrl.replace(/["']/g, "");

    if (
      imageUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ||
      imageUrl.includes("http")
    ) {
      if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
        if (imageUrl.startsWith("img/")) {
          return `<img src="${imageUrl}" 
                  alt="${product.name}" 
                  onerror="this.onerror=null; this.src='img/kslogo.png';"
                  class="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300">`;
        } else if (imageUrl.startsWith("uploads/")) {
          return `<img src="${imageUrl}" 
                  alt="${product.name}" 
                  onerror="this.onerror=null; this.src='img/kslogo.png';"
                  class="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300">`;
        } else {
          return `<img src="img/${imageUrl}" 
                  alt="${product.name}" 
                  onerror="this.onerror=null; this.src='uploads/${imageUrl}'; this.onerror=function(){this.onerror=null; this.src='img/kslogo.png';};"
                  class="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300">`;
        }
      } else {
        return `<img src="${imageUrl}" 
                alt="${product.name}" 
                onerror="this.onerror=null; this.src='img/kslogo.png';"
                class="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300">`;
      }
    }
  }

  return `<img src="img/kslogo.png" 
          alt="${product.name}" 
          class="object-contain h-32 w-32 opacity-70">`;
}

function renderCart() {
  const container = document.getElementById("cartContainer");

  if (cart.length === 0) {
    container.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <div class="text-5xl mb-3">🛒</div>
                <p class="text-lg font-semibold text-gray-500">Empty Cart</p>
                <p class="text-sm mt-1">Add items to get started</p>
            </div>
        `;
    updateTotals();
    return;
  }

  container.innerHTML = cart
    .map((item, index) => {
      let displayName = item.name;

      // Show upgrade if present
      if (item.selectedUpgrade) {
        if (item.selectedUpgrade.description_type === "k-street product") {
          displayName = `[COMPLETE] ${item.selectedUpgrade.name}`;
        } else {
          displayName = `[UPGRADED] ${item.selectedUpgrade.name}`;
        }
      }

      return `
            <div class="flex justify-between items-center border-b border-gray-100 pb-4 last:border-b-0 hover:bg-red-50 p-3 rounded-xl transition-all">
                <div class="flex-1">
                    <p class="font-bold text-gray-800">${displayName}</p>
                    <p class="text-sm text-gray-600 mt-0.5">
                        ₱${parseFloat(item.finalPrice || item.price).toFixed(
                          2
                        )} × ${item.quantity}
                    </p>
                    ${
                      item.selectedAddons && item.selectedAddons.length > 0
                        ? `
                        <p class="text-xs text-gray-500 mt-1">
                            Add-ons: ${item.selectedAddons
                              .map((a) => `${a.name} (+₱${a.price})`)
                              .join(", ")}
                        </p>
                    `
                        : ""
                    }
                    ${
                      item.selectedUpgrade
                        ? `
                        <p class="text-xs font-semibold ${
                          item.selectedUpgrade.description_type ===
                          "k-street product"
                            ? "text-blue-600"
                            : "text-green-600"
                        }">
                            ${
                              item.selectedUpgrade.description_type ===
                              "k-street product"
                                ? "Complete Product"
                                : "Upgrade"
                            }: ${item.selectedUpgrade.name}
                        </p>
                    `
                        : ""
                    }
                    ${
                      item.selectedFlavors && item.selectedFlavors.length > 0
                        ? `
                        <p class="text-xs font-semibold text-purple-600">
                            Flavors: ${item.selectedFlavors
                              .map((f) => f.name)
                              .join(", ")}
                        </p>
                    `
                        : ""
                    }
                    ${
                      item.specialInstructions
                        ? `
                        <p class="text-xs text-gray-500">Note: ${item.specialInstructions}</p>
                    `
                        : ""
                    }
                    <p class="text-red-600 font-bold mt-1">
                        ₱${(
                          parseFloat(item.finalPrice || item.price) *
                          item.quantity
                        ).toFixed(2)}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="updateQuantity(${index}, ${
        item.quantity - 1
      })" 
                            class="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-all font-bold text-lg shadow-sm hover:shadow-md">
                        -
                    </button>
                    <span class="font-bold w-8 text-center text-lg">${
                      item.quantity
                    }</span>
                    <button onclick="updateQuantity(${index}, ${
        item.quantity + 1
      })" 
                            class="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-all font-bold text-lg shadow-sm hover:shadow-md">
                        +
                    </button>
                    <button onclick="removeFromCart(${index})" 
                            class="w-9 h-9 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-all ml-1 font-bold text-lg shadow-sm hover:shadow-md">
                        ×
                    </button>
                </div>
            </div>
        `;
    })
    .join("");

  updateTotals();
  updateQueueButtonsVisibility();
}

// ============================
// FILTER & SEARCH FUNCTIONS
// ============================
function filterCategory(category) {
  activeCategory = category;
  currentPage = 1;
  renderCategoryButtons();
  renderProducts();
}

function handleSearch(e) {
  searchTerm = e.target.value;
  currentPage = 1;
  renderProducts();
}

// ============================
// CART FUNCTIONS
// ============================
function addToCart(productId) {
  if (!storeOpen) {
    return;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) return;

  selectedProduct = product;
  selectedAddons = [];
  selectedUpgrade = null;
  selectedFlavors = []; // NEW: Initialize flavors array
  specialInstructions = "";

  showAddonsModal();
}

// ============================
// UPDATED ADDONS MODAL WITH SELECT PRODUCT SECTION
// ============================
function showAddonsModal() {
  if (!selectedProduct) return;

  const modal = document.getElementById("addonsModal");
  document.getElementById("addonsProductName").textContent =
    selectedProduct.name;
  document.getElementById(
    "addonsProductCode"
  ).textContent = `Product Code: ${selectedProduct.product_code}`;

  // UPDATED: Fetch ALL k-street add sides (no category filter)
  const filteredAddons = addons; // Get all addons without filtering by category

  const filteredUpgrades = [...upgrades, ...flavors].filter(
    (item) => item.product_code === selectedProduct.product_code
  );

  const upgradesOnly = filteredUpgrades.filter(
    (item) => item.description_type === "k-street upgrades"
  );
  const flavorsOnly = filteredUpgrades.filter(
    (item) => item.description_type === "k-street Flavor"
  );

  // Filter complete products by product_code
  const filteredCompleteProducts = completeProducts.filter(
    (item) => item.product_code === selectedProduct.product_code
  );

  let html = '<div class="space-y-6">';

  // ============================
  // NEW: SELECT PRODUCT SECTION
  // ============================
  html += `
        <div>
            <h4 class="text-lg font-bold text-gray-800 mb-3">Select Product</h4>
            <p class="text-sm text-gray-500 mb-3">Choose complete product variations for ${selectedProduct.name}</p>
            <div class="grid grid-cols-1 gap-2">
    `;

  if (filteredCompleteProducts.length > 0) {
    filteredCompleteProducts.forEach((complete) => {
      html += `
                <button onclick="toggleCompleteProduct(${
                  complete.id
                })" id="complete-${complete.id}" 
                        class="p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-medium">${complete.name}</span>
                            <span class="text-sm text-gray-500 ml-2">₱${parseFloat(
                              complete.price
                            ).toFixed(2)}</span>
                            <div class="text-xs text-gray-400 mt-1">Original: ₱${parseFloat(
                              selectedProduct.price
                            ).toFixed(2)}</div>
                        </div>
                        <span class="complete-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center"></span>
                    </div>
                </button>
            `;
    });
  } else {
    html += `<p class="text-gray-500 text-center py-4">No complete products available for ${selectedProduct.name}</p>`;
  }

  html += "</div></div>";

  // ============================
  // Add-ons Section - NOW FETCHES ALL
  // ============================
  html += `
        <div>
            <h4 class="text-lg font-bold text-gray-800 mb-3">Add-ons (Sides)</h4>
            <p class="text-sm text-gray-500 mb-3">All available sides for your order</p>
            <div class="grid grid-cols-1 gap-2">
    `;

  if (filteredAddons.length > 0) {
    filteredAddons.forEach((addon) => {
      html += `
                <button onclick="toggleAddon(${addon.id})" id="addon-${
        addon.id
      }" 
                        class="p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-medium">${addon.name}</span>
                            <span class="text-sm text-gray-500 ml-2">+₱${parseFloat(
                              addon.price
                            ).toFixed(2)}</span>
                        </div>
                        <span class="addon-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center"></span>
                    </div>
                </button>
            `;
    });
  } else {
    html += '<p class="text-gray-500 text-center py-4">No sides available</p>';
  }

  html += "</div></div>";

  // ============================
  // Upgrades Section
  // ============================
  html += `
        <div>
            <h4 class="text-lg font-bold text-gray-800 mb-3">Upgrades</h4>
            <p class="text-sm text-gray-500 mb-3">Upgrade your ${selectedProduct.name} to a better version</p>
            <div class="grid grid-cols-1 gap-2">
    `;

  if (upgradesOnly.length > 0) {
    upgradesOnly.forEach((upgrade) => {
      html += `
                <button onclick="toggleUpgrade(${upgrade.id})" id="upgrade-${
        upgrade.id
      }"
                        class="p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-medium">${upgrade.name}</span>
                            <span class="text-sm text-gray-500 ml-2">Upgrade to: ₱${parseFloat(
                              upgrade.price
                            ).toFixed(2)}</span>
                            <div class="text-xs text-gray-400 mt-1">Original: ₱${parseFloat(
                              selectedProduct.price
                            ).toFixed(2)}</div>
                        </div>
                        <span class="upgrade-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center"></span>
                    </div>
                </button>
            `;
    });
  } else {
    html += `<p class="text-gray-500 text-center py-4">No upgrades available for ${selectedProduct.name}</p>`;
  }

  html += "</div></div>";

  // ============================
  // Flavors Section
  // ============================
  html += `
        <div>
            <h4 class="text-lg font-bold text-gray-800 mb-3">k-street Flavor</h4>
            <p class="text-sm text-gray-500 mb-3">Select multiple flavors for your ${selectedProduct.name}</p>
            <div class="grid grid-cols-1 gap-2">
    `;

  if (flavorsOnly.length > 0) {
    flavorsOnly.forEach((flavor) => {
      html += `
                <button onclick="toggleFlavor(${flavor.id})" id="flavor-${
        flavor.id
      }"
                        class="p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-medium">${flavor.name}</span>
                            <span class="text-sm text-gray-500 ml-2">+₱${parseFloat(
                              flavor.price
                            ).toFixed(2)}</span>
                        </div>
                        <span class="flavor-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center"></span>
                    </div>
                </button>
            `;
    });
  } else {
    html += `<p class="text-gray-500 text-center py-4">No flavor variations available for ${selectedProduct.name}</p>`;
  }

  html += "</div></div>";

  // ============================
  // Special Instructions
  // ============================
  html += `
        <div>
            <h4 class="text-lg font-bold text-gray-800 mb-3">Special Instructions</h4>
            <textarea id="specialInstructions" placeholder="Any special requests or instructions..." 
                      class="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
                      rows="3"></textarea>
        </div>
    `;

  // ============================
  // Price Summary
  // ============================
  const basePrice = selectedProduct.price;
  html += `
        <div class="bg-gray-50 p-4 rounded-xl">
            <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600" id="priceLabel">Base Price:</span>
                <span class="font-semibold" id="basePrice">₱${parseFloat(
                  basePrice
                ).toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center mb-2" id="addonsTotal" style="display: none;">
                <span class="text-gray-600">Sides:</span>
                <span class="font-semibold" id="addonsTotalValue">+₱0.00</span>
            </div>
            <div class="flex justify-between items-center mb-2" id="upgradeInfo" style="display: none;">
                <span id="upgradeLabel" class="text-green-600">Upgrade Applied:</span>
                <span id="upgradeName" class="font-semibold text-green-600">-</span>
            </div>
            <div class="flex justify-between items-center mb-2" id="flavorsTotal" style="display: none;">
                <span class="text-gray-600">Flavors:</span>
                <span class="font-semibold" id="flavorsTotalValue">+₱0.00</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                <span class="text-lg font-bold text-gray-800">Total:</span>
                <span class="text-lg font-bold text-red-600" id="modalTotal">₱${parseFloat(
                  basePrice
                ).toFixed(2)}</span>
            </div>
        </div>
    `;

  // ============================
  // Action Buttons
  // ============================
  html += `
        <div class="flex gap-3">
            <button onclick="confirmAddToCart()" class="flex-1 bg-gradient-to-r from-red-600 to-red-600 text-white py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl">
                Add to Cart
            </button>
            <button onclick="closeAddonsModal()" class="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                Cancel
            </button>
        </div>
    `;

  html += "</div>";

  document.getElementById("addonsContent").innerHTML = html;
  modal.classList.add("active");
}

// ============================
// NEW: TOGGLE COMPLETE PRODUCT FUNCTION (FIXED - ALLOWS FLAVORS)
// ============================
function toggleCompleteProduct(completeId) {
  const complete = completeProducts.find((c) => c.id === completeId);
  if (!complete) return;

  // Clear all complete product selections first
  document.querySelectorAll('[id^="complete-"]').forEach((btn) => {
    btn.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300";
    const check = btn.querySelector(".complete-check");
    check.className =
      "complete-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center";
    check.textContent = "";
  });

  // Clear upgrades when complete product is selected (but NOT flavors)
  document.querySelectorAll('[id^="upgrade-"]').forEach((btn) => {
    btn.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300";
    const check = btn.querySelector(".upgrade-check");
    check.className =
      "upgrade-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center";
    check.textContent = "";
  });

  // Toggle selection
  if (selectedUpgrade && selectedUpgrade.id === completeId) {
    selectedUpgrade = null;
  } else {
    selectedUpgrade = complete;
    // DON'T clear flavors - allow them to coexist
    const button = document.getElementById(`complete-${completeId}`);
    button.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-blue-100 border-blue-500 text-blue-700";
    const check = button.querySelector(".complete-check");
    check.className =
      "complete-check w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 text-white flex items-center justify-center";
    check.textContent = "✓";
  }

  updateModalPricing();
}

function toggleAddon(addonId) {
  const addon = addons.find((a) => a.id === addonId);
  if (!addon) return;

  const index = selectedAddons.findIndex((a) => a.id === addonId);
  const button = document.getElementById(`addon-${addonId}`);
  const checkSpan = button.querySelector(".addon-check");

  if (index !== -1) {
    selectedAddons.splice(index, 1);
    button.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300";
    checkSpan.className =
      "addon-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center";
    checkSpan.textContent = "";
  } else {
    selectedAddons.push(addon);
    button.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-red-100 border-red-500 text-red-700";
    checkSpan.className =
      "addon-check w-5 h-5 rounded-full border-2 border-red-500 bg-red-500 text-white flex items-center justify-center";
    checkSpan.textContent = "✓";
  }

  updateModalPricing();
}

// ============================
// FIXED: toggleUpgrade - ALLOWS FLAVORS TO COEXIST
// ============================
function toggleUpgrade(upgradeId) {
  const upgrade = upgrades.find((u) => u.id === upgradeId);
  if (!upgrade) return;

  // Clear complete product selections when upgrade is selected
  document.querySelectorAll('[id^="complete-"]').forEach((btn) => {
    btn.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300";
    const check = btn.querySelector(".complete-check");
    check.className =
      "complete-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center";
    check.textContent = "";
  });

  // DON'T clear flavors - allow them to coexist with upgrades

  // Clear other upgrades (only one upgrade allowed)
  document.querySelectorAll('[id^="upgrade-"]').forEach((btn) => {
    btn.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300";
    const check = btn.querySelector(".upgrade-check");
    check.className =
      "upgrade-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center";
    check.textContent = "";
  });

  // Toggle selection
  if (selectedUpgrade && selectedUpgrade.id === upgradeId) {
    selectedUpgrade = null;
  } else {
    selectedUpgrade = upgrade;
    // DON'T clear selectedFlavors - allow them to coexist
    const button = document.getElementById(`upgrade-${upgradeId}`);
    button.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-green-100 border-green-500 text-green-700";
    const check = button.querySelector(".upgrade-check");
    check.className =
      "upgrade-check w-5 h-5 rounded-full border-2 border-green-500 bg-green-500 text-white flex items-center justify-center";
    check.textContent = "✓";
  }

  updateModalPricing();
}

// ============================
// FIXED: toggleFlavor - ALLOWS UPGRADES TO COEXIST
// ============================
function toggleFlavor(flavorId) {
  const flavor = flavors.find((f) => f.id === flavorId);
  if (!flavor) return;

  // DON'T clear upgrades or complete products - allow them to coexist
  const index = selectedFlavors.findIndex((f) => f.id === flavorId);
  const button = document.getElementById(`flavor-${flavorId}`);
  const checkSpan = button.querySelector(".flavor-check");

  if (index !== -1) {
    // Remove flavor
    selectedFlavors.splice(index, 1);
    button.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-300";
    checkSpan.className =
      "flavor-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center";
    checkSpan.textContent = "";
  } else {
    // Add flavor
    selectedFlavors.push(flavor);
    button.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-purple-100 border-purple-500 text-purple-700";
    checkSpan.className =
      "flavor-check w-5 h-5 rounded-full border-2 border-purple-500 bg-purple-500 text-white flex items-center justify-center";
    checkSpan.textContent = "✓";
  }

  updateModalPricing();
}

function updateModalPricing() {
  let basePrice = parseFloat(selectedProduct.price);
  let addonsTotal = selectedAddons.reduce(
    (sum, addon) => sum + parseFloat(addon.price),
    0
  );
  let flavorsTotal = selectedFlavors.reduce(
    (sum, flavor) => sum + parseFloat(flavor.price),
    0
  );
  let finalPrice = basePrice;

  // Handle upgrade pricing
  if (selectedUpgrade) {
    finalPrice = parseFloat(selectedUpgrade.price);

    // Determine label based on upgrade type
    let priceLabel = "Base Price:";
    let upgradeLabel = "Upgrade Applied:";
    let labelColor = "text-green-600";

    if (selectedUpgrade.description_type === "k-street product") {
      priceLabel = "Complete Product Price:";
      upgradeLabel = "Complete Product:";
      labelColor = "text-blue-600";
    } else {
      priceLabel = "Upgraded Price:";
    }

    document.getElementById("priceLabel").textContent = priceLabel;
    document.getElementById("basePrice").textContent = `₱${finalPrice.toFixed(
      2
    )}`;

    document.getElementById("upgradeInfo").style.display = "flex";
    document.getElementById("upgradeLabel").textContent = upgradeLabel;
    document.getElementById("upgradeLabel").className = labelColor;
    document.getElementById("upgradeName").textContent = selectedUpgrade.name;
    document.getElementById(
      "upgradeName"
    ).className = `font-semibold ${labelColor}`;
  } else {
    document.getElementById("priceLabel").textContent = "Base Price:";
    document.getElementById("basePrice").textContent = `₱${basePrice.toFixed(
      2
    )}`;
    document.getElementById("upgradeInfo").style.display = "none";
  }

  // Show addons total if any
  if (addonsTotal > 0) {
    document.getElementById("addonsTotal").style.display = "flex";
    document.getElementById(
      "addonsTotalValue"
    ).textContent = `+₱${addonsTotal.toFixed(2)}`;
  } else {
    document.getElementById("addonsTotal").style.display = "none";
  }

  // Show flavors total if any
  if (flavorsTotal > 0) {
    document.getElementById("flavorsTotal").style.display = "flex";
    document.getElementById(
      "flavorsTotalValue"
    ).textContent = `+₱${flavorsTotal.toFixed(2)}`;
  } else {
    document.getElementById("flavorsTotal").style.display = "none";
  }

  const total = finalPrice + addonsTotal + flavorsTotal;
  document.getElementById("modalTotal").textContent = `₱${total.toFixed(2)}`;
}

function confirmAddToCart() {
  if (!selectedProduct) return;

  const instructionsInput = document.getElementById("specialInstructions");
  specialInstructions = instructionsInput ? instructionsInput.value : "";

  // Calculate final price with upgrade (if any) + addons + flavors
  const upgradePrice = selectedUpgrade
    ? parseFloat(selectedUpgrade.price)
    : parseFloat(selectedProduct.price);
  const addonsPrice = selectedAddons.reduce(
    (sum, addon) => sum + parseFloat(addon.price),
    0
  );
  const flavorsPrice = selectedFlavors.reduce(
    (sum, flavor) => sum + parseFloat(flavor.price),
    0
  );
  const finalPrice = upgradePrice + addonsPrice + flavorsPrice;

  const cartItem = {
    id: selectedProduct.id,
    name: selectedProduct.name,
    price: parseFloat(selectedProduct.price),
    quantity: 1,
    selectedAddons: [...selectedAddons],
    selectedUpgrade: selectedUpgrade,
    selectedFlavors: [...selectedFlavors], // Store flavors array
    specialInstructions: specialInstructions,
    finalPrice: finalPrice,
  };

  const existingIndex = cart.findIndex(
    (item) =>
      item.id === cartItem.id &&
      JSON.stringify(item.selectedAddons) ===
        JSON.stringify(cartItem.selectedAddons) &&
      ((!item.selectedUpgrade && !cartItem.selectedUpgrade) ||
        (item.selectedUpgrade &&
          cartItem.selectedUpgrade &&
          item.selectedUpgrade.id === cartItem.selectedUpgrade.id)) &&
      JSON.stringify(item.selectedFlavors) ===
        JSON.stringify(cartItem.selectedFlavors) &&
      item.specialInstructions === cartItem.specialInstructions
  );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push(cartItem);
  }

  closeAddonsModal();
  renderCart();
}

function closeAddonsModal() {
  document.getElementById("addonsModal").classList.remove("active");
  selectedProduct = null;
  selectedAddons = [];
  selectedUpgrade = null;
  selectedFlavors = []; // NEW: Clear flavors array
  specialInstructions = "";
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function updateQuantity(index, newQuantity) {
  if (newQuantity < 1) {
    removeFromCart(index);
    return;
  }
  cart[index].quantity = newQuantity;
  renderCart();
}

function clearCart() {
  cart = [];
  paymentAmount = "";
  discountApplied = false;
  employeeDiscountApplied = false;
  orderSaved = false;
  document.getElementById("paymentInput").value = "";
  renderCart();
  updateQueueButtonsVisibility();
}

// ============================
// QUEUE MANAGEMENT FUNCTIONS
// ============================

async function initializeTableCounter() {
  try {
    const response = await fetch(
      "backend/pos_api.php?action=get_table_counter",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User": JSON.stringify({
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.role || "cashier",
            branch: currentUser.branch || "main",
          }),
        },
      }
    );

    const data = await response.json();
    if (data.success) {
      tableCounter = data.tableCounter;
    }
  } catch (error) {
    console.error("Error fetching table counter:", error);
    tableCounter = 0;
  }
}

async function loadQueuedOrders() {
  try {
    const response = await fetch("backend/pos_api.php?action=get_queue", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User": JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role || "cashier",
          branch: currentUser.branch || "main",
        }),
      },
    });

    const data = await response.json();
    queuedOrders = data || [];
    console.log("Queued orders loaded:", queuedOrders);
  } catch (error) {
    console.error("Error loading queued orders:", error);
    queuedOrders = [];
  }
}

async function addToQueue() {
  if (!storeOpen) {
    alert("Store is closed");
    return;
  }

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const queueData = {
    userId: currentUser.id,
    orderType: orderType,
    items: cart,
    discountApplied: discountApplied,
    employeeDiscountApplied: employeeDiscountApplied,
    subtotal: calculateSubtotal(),
    total: calculateTotal(),
  };

  try {
    const response = await fetch("backend/pos_api.php?action=add_to_queue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User": JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role || "cashier",
          branch: currentUser.branch || "main",
        }),
      },
      body: JSON.stringify(queueData),
    });

    const data = await response.json();

    if (data.success) {
      showQueueSuccessMessage(data.tableNumber);

      // Reload queue from server
      await loadQueuedOrders();
      await initializeTableCounter();
      updateQueueBadge();

      // Clear cart
      clearCart();
    } else {
      alert("Failed to add to queue: " + (data.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error adding to queue:", error);
    alert("Failed to add to queue. Please try again.");
  }
}

function showQueueSuccessMessage(tableNum) {
  const message = document.createElement("div");
  message.className =
    "fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in";
  message.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="fas fa-check-circle"></i>
      <span class="font-semibold">Added to Queue - Table ${tableNum}</span>
    </div>
  `;

  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3000);
}

function updateQueueBadge() {
  const badge = document.getElementById("queueBadge");
  if (badge) {
    badge.textContent = queuedOrders.length;
    badge.style.display = queuedOrders.length > 0 ? "inline-block" : "none";
  }
}

function updateQueueButtonsVisibility() {
  const addToQueueBtn = document.getElementById("addToQueueBtn");
  if (addToQueueBtn) {
    addToQueueBtn.style.display = cart.length > 0 ? "block" : "none";
  }
}

async function showQueueModal() {
  // Reload queue from server
  await loadQueuedOrders();

  const modal = document.getElementById("queueModal");
  if (!modal) return;

  renderQueuedOrders();
  modal.classList.add("active");
}

function closeQueueModal() {
  const modal = document.getElementById("queueModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function renderQueuedOrders() {
  const container = document.getElementById("queuedOrdersContainer");
  if (!container) return;

  if (queuedOrders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-gray-400">
        <div class="text-5xl mb-3">📋</div>
        <p class="text-lg font-semibold text-gray-500">No Queued Orders</p>
        <p class="text-sm mt-1">Add items to cart and click "Add to Queue"</p>
      </div>
    `;
    return;
  }

  container.innerHTML = queuedOrders
    .map((order, index) => {
      const date = new Date(order.timestamp);
      const timeString = date.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
      });

      // Parse items
      let items = [];
      try {
        items =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;
      } catch (e) {
        console.error("Error parsing items:", e);
        items = [];
      }

      return `
        <div class="border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 transition-all">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="text-xl font-bold text-gray-800">Table ${
                order.table_number
              }</h4>
              <p class="text-sm text-gray-500">${timeString} • ${
        order.order_type
      }</p>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ${items.length} items
            </span>
          </div>

          <div class="mb-3 max-h-32 overflow-y-auto">
            ${items
              .map(
                (item) => `
              <div class="text-sm text-gray-600 py-1">
                ${item.quantity}x ${item.name} 
                ${
                  item.selectedUpgrade
                    ? `<span class="text-blue-600">[${item.selectedUpgrade.name}]</span>`
                    : ""
                }
                ${
                  item.selectedFlavors && item.selectedFlavors.length > 0
                    ? `<span class="text-purple-600">[${item.selectedFlavors
                        .map((f) => f.name)
                        .join(", ")}]</span>`
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-gray-200">
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-xl font-bold text-red-600">₱${parseFloat(
                order.total
              ).toFixed(2)}</p>
            </div>
           <div class="flex gap-2">
  <button onclick="printQueueReceipt(${index})" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold">
    <i class="fas fa-print"></i> Print
  </button>
  <button onclick="viewQueuedOrder(${index})" class="px-4 py-2 bg-black text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold">
    <i class="fas fa-eye"></i> View
  </button>
  <button onclick="loadQueuedOrderToCart(${index})" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-semibold">
    <i class="fas fa-shopping-cart"></i> Process
  </button>
  <button onclick="deleteQueuedOrder(${index})" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold">
    <i class="fas fa-trash"></i> Delete
  </button>
</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function viewQueuedOrder(index) {
  const order = queuedOrders[index];
  if (!order) return;

  const date = new Date(order.timestamp);
  const timeString = date.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });

  // Parse items
  let items = [];
  try {
    items =
      typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch (e) {
    console.error("Error parsing items:", e);
    items = [];
  }

  let detailsHTML = `
    <div class="space-y-4">
      <div class="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 class="text-2xl font-bold text-red-800 mb-2">Table ${
          order.table_number
        }</h3>
        <p class="text-sm text-red-600">${timeString}</p>
        <p class="text-sm text-red-600">${order.order_type} • ${
    order.branch
  } Branch</p>
      </div>

      <div class="border-2 border-red-200 rounded-lg p-4">
        <h4 class="font-bold text-gray-800 mb-3">Order Items:</h4>
        ${items
          .map(
            (item) => `
          <div class="py-2 border-b border-gray-100 last:border-b-0">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="font-semibold text-gray-800">${item.name}</p>
                ${
                  item.selectedUpgrade
                    ? `<p class="text-sm text-red-600">Upgrade: ${item.selectedUpgrade.name}</p>`
                    : ""
                }
                ${
                  item.selectedFlavors && item.selectedFlavors.length > 0
                    ? `<p class="text-sm text-red-600">Flavors: ${item.selectedFlavors
                        .map((f) => f.name)
                        .join(", ")}</p>`
                    : ""
                }
                ${
                  item.selectedAddons && item.selectedAddons.length > 0
                    ? `<p class="text-sm text-red-600">Add-ons: ${item.selectedAddons
                        .map((a) => a.name)
                        .join(", ")}</p>`
                    : ""
                }
                ${
                  item.specialInstructions
                    ? `<p class="text-sm text-gray-500">Note: ${item.specialInstructions}</p>`
                    : ""
                }
              </div>
              <div class="text-right ml-4">
                <p class="text-sm text-gray-600">x${item.quantity}</p>
                <p class="font-semibold text-gray-800">₱${(
                  item.finalPrice * item.quantity
                ).toFixed(2)}</p>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-600">Subtotal:</span>
          <span class="font-semibold">₱${parseFloat(order.subtotal).toFixed(
            2
          )}</span>
        </div>
        ${
          order.discount_applied
            ? `
          <div class="flex justify-between items-center mb-2 text-amber-600">
            <span>PWD/Senior Discount (20%):</span>
            <span>-₱${(order.subtotal * 0.2).toFixed(2)}</span>
          </div>
        `
            : ""
        }
        ${
          order.employee_discount_applied
            ? `
          <div class="flex justify-between items-center mb-2 text-blue-600">
            <span>Employee Discount (5%):</span>
            <span>-₱${(order.subtotal * 0.05).toFixed(2)}</span>
          </div>
        `
            : ""
        }
        <div class="flex justify-between items-center pt-2 border-t border-gray-200">
          <span class="text-lg font-bold text-gray-800">Total:</span>
          <span class="text-lg font-bold text-red-600">₱${parseFloat(
            order.total
          ).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  const viewModal = document.getElementById("viewQueueModal");
  if (viewModal) {
    document.getElementById("viewQueueContent").innerHTML = detailsHTML;
    viewModal.classList.add("active");
  }
}

function closeViewQueueModal() {
  const modal = document.getElementById("viewQueueModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function loadQueuedOrderToCart(index) {
  const order = queuedOrders[index];
  if (!order) return;

  // Parse items
  let items = [];
  try {
    items =
      typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch (e) {
    console.error("Error parsing items:", e);
    alert("Error loading order items");
    return;
  }

  // Clear current cart
  cart = [];

  // Load order items to cart
  cart = JSON.parse(JSON.stringify(items)); // Deep copy

  // Load order settings
  orderType = order.order_type;
  discountApplied = order.discount_applied === 1;
  employeeDiscountApplied = order.employee_discount_applied === 1;

  // Update order type buttons
  setOrderType(orderType);

  // Update discount buttons
  const pwdBtn = document.getElementById("pwdDiscountBtn");
  const empBtn = document.getElementById("employeeDiscountBtn");

  if (discountApplied) {
    pwdBtn.className =
      "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white";
    empBtn.className =
      "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black";
  } else if (employeeDiscountApplied) {
    pwdBtn.className =
      "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600";
    empBtn.className =
      "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white";
  } else {
    pwdBtn.className =
      "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600";
    empBtn.className =
      "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black";
  }

  // Delete from queue via API
  deleteQueuedOrderAPI(order.id, order.table_number);

  // Close queue modal
  closeQueueModal();

  // Render cart
  renderCart();
}

async function deleteQueuedOrderAPI(queueId, tableNum) {
  try {
    const response = await fetch("backend/pos_api.php?action=delete_queue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User": JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role || "cashier",
          branch: currentUser.branch || "main",
        }),
      },
      body: JSON.stringify({ queueId: queueId }),
    });

    const data = await response.json();

    if (data.success) {
      // Reload queue
      await loadQueuedOrders();
      updateQueueBadge();

      // Show success message
      const message = document.createElement("div");
      message.className =
        "fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      message.innerHTML = `
        <div class="flex items-center gap-2">
          <i class="fas fa-check-circle"></i>
          <span class="font-semibold">Table ${tableNum} loaded to cart</span>
        </div>
      `;

      document.body.appendChild(message);

      setTimeout(() => {
        message.remove();
      }, 3000);
    }
  } catch (error) {
    console.error("Error deleting from queue:", error);
  }
}

async function deleteQueuedOrder(index) {
  const order = queuedOrders[index];
  if (!order) return;

  if (confirm(`Delete Table ${order.table_number} from queue?`)) {
    try {
      const response = await fetch("backend/pos_api.php?action=delete_queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User": JSON.stringify({
            id: currentUser.id,
            email: currentUser.email,
            role: currentUser.role || "cashier",
            branch: currentUser.branch || "main",
          }),
        },
        body: JSON.stringify({ queueId: order.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Reload queue
        await loadQueuedOrders();
        updateQueueBadge();
        renderQueuedOrders();
      } else {
        alert("Failed to delete: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting queued order:", error);
      alert("Failed to delete order. Please try again.");
    }
  }
}

// ============================
// UPDATED CALCULATION FUNCTIONS - DISCOUNT ONLY ON MOST EXPENSIVE ITEM
// ============================

function calculateSubtotal() {
  return cart.reduce(
    (total, item) =>
      total + parseFloat(item.finalPrice || item.price) * item.quantity,
    0
  );
}

function getMostExpensiveItem() {
  if (cart.length === 0) return null;

  let mostExpensive = cart[0];
  let highestPrice = parseFloat(
    mostExpensive.finalPrice || mostExpensive.price
  );

  cart.forEach((item) => {
    const itemPrice = parseFloat(item.finalPrice || item.price);
    if (itemPrice > highestPrice) {
      highestPrice = itemPrice;
      mostExpensive = item;
    }
  });

  return mostExpensive;
}

function getDiscountAmount() {
  if (!discountApplied && !employeeDiscountApplied) return 0;

  const mostExpensiveItem = getMostExpensiveItem();
  if (!mostExpensiveItem) return 0;

  const itemPrice = parseFloat(
    mostExpensiveItem.finalPrice || mostExpensiveItem.price
  );

  if (discountApplied) {
    return itemPrice * 0.2; // 20% discount on ONE unit of most expensive
  } else if (employeeDiscountApplied) {
    return itemPrice * 0.05; // 5% discount on ONE unit of most expensive
  }

  return 0;
}

function calculateTotal() {
  let subtotal = calculateSubtotal();
  let discountAmount = getDiscountAmount();
  let total = subtotal - discountAmount;

  return Math.round(total * 100) / 100;
}

function calculateChange() {
  const amount = parseFloat(paymentAmount) || 0;
  const total = calculateTotal();
  const change = amount - total;
  return Math.max(0, change);
}

function updateTotals() {
  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const change = calculateChange();
  const discountAmount = getDiscountAmount();

  console.log("Updating totals:", {
    subtotal,
    total,
    change,
    discountApplied,
    employeeDiscountApplied,
    paymentAmount,
    discountAmount,
  });

  document.getElementById("subtotal").textContent = `₱${subtotal.toFixed(2)}`;
  document.getElementById("total").textContent = `₱${total.toFixed(2)}`;
  document.getElementById("changeAmount").textContent = `₱${change.toFixed(2)}`;

  const pwdRow = document.getElementById("pwdDiscountRow");
  const empRow = document.getElementById("employeeDiscountRow");

  if (discountApplied && discountAmount > 0) {
    pwdRow.style.display = "flex";
    document.getElementById(
      "pwdDiscountAmount"
    ).textContent = `-₱${discountAmount.toFixed(2)}`;
    empRow.style.display = "none";
  } else if (employeeDiscountApplied && discountAmount > 0) {
    empRow.style.display = "flex";
    document.getElementById(
      "employeeDiscountAmount"
    ).textContent = `-₱${discountAmount.toFixed(2)}`;
    pwdRow.style.display = "none";
  } else {
    pwdRow.style.display = "none";
    empRow.style.display = "none";
  }
}


// ============================
// FIXED DISCOUNT FUNCTIONS (PREVENT BOTH DISCOUNTS - PROPERLY FIXED)
// ============================
function togglePWDDiscount() {
  if (!storeOpen) {
    return;
  }

  console.log("Before PWD toggle:", {
    discountApplied,
    employeeDiscountApplied
  });

  // If PWD discount is currently OFF, turn it ON and turn OFF employee discount
  if (!discountApplied) {
    discountApplied = true;
    employeeDiscountApplied = false; // Turn off employee discount
  } else {
    // If PWD discount is currently ON, turn it OFF
    discountApplied = false;
  }

  console.log("After PWD toggle:", {
    discountApplied,
    employeeDiscountApplied
  });

  // Update button styles
  const btn = document.getElementById("pwdDiscountBtn");
  const empBtn = document.getElementById("employeeDiscountBtn");

  if (discountApplied) {
    // PWD is active
    btn.className = "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white";
    empBtn.className = "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black";
  } else {
    // PWD is inactive
    btn.className = "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600";
    // If employee discount is active, update its style too
    if (employeeDiscountApplied) {
      empBtn.className = "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white";
    }
  }

  updateTotals();
}

function toggleEmployeeDiscount() {
  if (!storeOpen) {
    return;
  }

  console.log("Before Employee toggle:", {
    discountApplied,
    employeeDiscountApplied
  });

  // If Employee discount is currently OFF, turn it ON and turn OFF PWD discount
  if (!employeeDiscountApplied) {
    employeeDiscountApplied = true;
    discountApplied = false; // Turn off PWD discount
  } else {
    // If Employee discount is currently ON, turn it OFF
    employeeDiscountApplied = false;
  }

  console.log("After Employee toggle:", {
    discountApplied,
    employeeDiscountApplied
  });

  // Update button styles
  const btn = document.getElementById("employeeDiscountBtn");
  const pwdBtn = document.getElementById("pwdDiscountBtn");

  if (employeeDiscountApplied) {
    // Employee is active
    btn.className = "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white";
    pwdBtn.className = "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600";
  } else {
    // Employee is inactive
    btn.className = "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black";
    // If PWD discount is active, update its style too
    if (discountApplied) {
      pwdBtn.className = "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white";
    }
  }

  updateTotals();
}

// ============================
// PAYMENT FUNCTIONS
// ============================
function setPaymentMethod(method) {
  paymentMethod = method;

  const buttons = document.querySelectorAll(".payment-method-btn");
  buttons.forEach((btn) => {
    if (btn.textContent.trim() === method) {
      btn.className =
        "payment-method-btn py-3.5 bg-black text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all";
    } else {
      btn.className =
        "payment-method-btn py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-md hover:bg-gray-300 hover:shadow-lg transition-all";
    }
  });
}

function setPaymentAmount(amount) {
  if (!storeOpen) return;

  // Get current value from input
  const currentValue =
    parseFloat(document.getElementById("paymentInput").value) || 0;

  // Add the new amount to current value
  const newAmount = currentValue + parseFloat(amount);

  // Update input and paymentAmount variable
  document.getElementById("paymentInput").value = newAmount.toFixed(2);
  paymentAmount = newAmount.toString();

  updateTotals();
}

async function processPayment() {
  if (!storeOpen) {
    return;
  }

  if (!currentUser) {
    return;
  }

  if (cart.length === 0) {
    return;
  }

  if (orderSaved) {
    return;
  }

  const amount = parseFloat(paymentAmount);
  const total = calculateTotal();

  if (!paymentAmount || amount <= 0 || isNaN(amount)) {
    showPaymentModal(
      "error",
      "Invalid Amount",
      "Please enter a valid payment amount.",
      total
    );
    return;
  }

  if (amount < total) {
    showPaymentModal(
      "error",
      "Insufficient Amount",
      `The amount entered is less than the total.`,
      total
    );
    return;
  }

  const change = amount - total;
  changeAmount = change;

  generateReceiptText();

  const productNames = cart
    .map((item) => {
      let name = item.name;

      if (item.selectedUpgrade) {
        if (item.selectedUpgrade.description_type === "k-street product") {
          name = `[COMPLETE] ${item.selectedUpgrade.name}`;
        } else {
          name = `[UPGRADED] ${item.selectedUpgrade.name}`;
        }
      }

      if (item.selectedFlavors && item.selectedFlavors.length > 0) {
        const flavorNames = item.selectedFlavors.map((f) => f.name).join(", ");
        name += ` [FLAVORS: ${flavorNames}]`;
      }

      return name;
    })
    .join(", ");

  const itemsData = cart.map((item) => {
    let name = item.name;

    if (item.selectedUpgrade) {
      if (item.selectedUpgrade.description_type === "k-street product") {
        name = `[COMPLETE] ${item.selectedUpgrade.name}`;
      } else {
        name = `[UPGRADED] ${item.selectedUpgrade.name}`;
      }
    }

    if (item.selectedFlavors && item.selectedFlavors.length > 0) {
      const flavorNames = item.selectedFlavors.map((f) => f.name).join(", ");
      name += ` [FLAVORS: ${flavorNames}]`;
    }

    return {
      id: item.id,
      name: name,
      quantity: item.quantity,
      price: item.finalPrice || item.price,
      subtotal: (item.finalPrice || item.price) * item.quantity,
      selectedAddons: item.selectedAddons,
      selectedUpgrade: item.selectedUpgrade,
      selectedFlavors: item.selectedFlavors || [],
      specialInstructions: item.specialInstructions,
    };
  });

  const orderData = {
    userId: currentUser.id,
    paidAmount: amount,
    total: total,
    discountApplied: discountApplied || employeeDiscountApplied,
    changeAmount: change,
    orderType: orderType,
    productNames: productNames,
    items: JSON.stringify(itemsData),
    paymentMethod: paymentMethod,
  };

  try {
    orderSaved = true;

    const response = await fetch("backend/pos_api.php?action=create_order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User": JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role || "cashier",
          branch: currentUser.branch || "main",
        }),
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (data.success) {
      showPaymentModal(
        "success",
        "Payment Successful!",
        `Payment of ₱${amount.toFixed(2)} received via ${paymentMethod}.`,
        change
      );
    } else {
      orderSaved = false;
      showPaymentModal(
        "error",
        "Order Failed",
        "Could not save order. Please try again.",
        total
      );
    }
  } catch (error) {
    orderSaved = false;
    console.error("Error saving order:", error);
    showPaymentModal(
      "error",
      "Order Failed",
      "Could not save order. Please try again.",
      total
    );
  }
}

function showPaymentModal(type, title, message, amount) {
  const modal = document.getElementById("paymentModal");
  const header = document.getElementById("paymentModalHeader");
  const modalTitle = document.getElementById("paymentModalTitle");
  const icon = document.getElementById("paymentModalIcon");
  const paymentMessage = document.getElementById("paymentMessage");
  const resultBox = document.getElementById("paymentResultBox");
  const resultLabel = document.getElementById("paymentResultLabel");
  const changeResult = document.getElementById("changeResult");
  const buttons = document.getElementById("paymentModalButtons");

  if (type === "success") {
    header.className =
      "p-6 bg-gradient-to-r from-red-500 to-red-500 text-white rounded-t-3xl";
    modalTitle.textContent = title;
    icon.textContent = "✓";
    icon.className = "text-7xl mb-4 text-red-500";
    paymentMessage.textContent = message;
    resultBox.className =
      "bg-gradient-to-r from-red-50 border-1 border-red-200 rounded-2xl p-5 mt-4";
    resultLabel.textContent = "Change:";
    resultLabel.className = "text-red-800 font-semibold text-lg mb-1";
    changeResult.textContent = `₱${amount.toFixed(2)}`;
    changeResult.className = "text-red-600 font-bold text-4xl";

    buttons.innerHTML = `
            <button onclick="showReceipt()" class="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-red-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl">
                View Receipt
            </button>
        `;
  } else {
    header.className =
      "p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-3xl";
    modalTitle.textContent = title;
    icon.textContent = "⚠";
    icon.className = "text-7xl mb-4 text-red-500";
    paymentMessage.textContent = message;
    resultBox.className =
      "bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-5 mt-4";
    resultLabel.textContent = "Total Amount Required:";
    resultLabel.className = "text-red-800 font-semibold text-lg mb-1";
    changeResult.textContent = `₱${amount.toFixed(2)}`;
    changeResult.className = "text-red-600 font-bold text-3xl mb-3";

    buttons.innerHTML = `
            <button onclick="closePaymentModal()" class="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3.5 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl">
                Cancel
            </button>
            <button onclick="closePaymentModal()" class="flex-1 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                Try Again
            </button>
        `;
  }

  modal.classList.add("active");
}

function closePaymentModal() {
  document.getElementById("paymentModal").classList.remove("active");
}

// ============================
// RECEIPT FUNCTIONS
// ============================
function generateReceiptText() {
  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const change = parseFloat(paymentAmount) - total;

  let receipt = `
K - Street Mc Arthur Highway, Magaspac,
Gerona, Tarlac
=============================
Cashier: ${currentUser?.username || currentUser?.email || "N/A"}
Branch: ${currentUser?.branch || "main"}
Order Type: ${orderType}
Payment Method: ${paymentMethod}
Date: ${new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
  })}
===============================
Items:
`;

  cart.forEach((item) => {
    let itemName = item.name;

    // Show upgrade if present
    if (item.selectedUpgrade) {
      if (item.selectedUpgrade.description_type === "k-street product") {
        itemName = `[COMPLETE] ${item.selectedUpgrade.name}`;
      } else {
        itemName = `[UPGRADED] ${item.selectedUpgrade.name}`;
      }
    }

    const itemTotal = ((item.finalPrice || item.price) * item.quantity).toFixed(
      2
    );

    receipt += `${itemName} x${item.quantity} ₱${itemTotal}\n`;

    if (item.selectedAddons && item.selectedAddons.length > 0) {
      receipt += `Add-ons: ${item.selectedAddons
        .map((a) => `${a.name} (+₱${a.price})`)
        .join(", ")}\n`;
    }

    if (item.selectedUpgrade) {
      if (item.selectedUpgrade.description_type === "k-street product") {
        receipt += `Complete Product: ${item.selectedUpgrade.name} (₱${item.selectedUpgrade.price})\n`;
      } else {
        receipt += `Upgrade: ${item.selectedUpgrade.name} (₱${item.selectedUpgrade.price})\n`;
      }
    }

    // NEW: Show flavors if present
    if (item.selectedFlavors && item.selectedFlavors.length > 0) {
      receipt += `Flavors: ${item.selectedFlavors
        .map((f) => `${f.name} (+₱${f.price})`)
        .join(", ")}\n`;
    }

    if (item.specialInstructions) {
      receipt += `Instructions: ${item.specialInstructions}\n`;
    }

    receipt += "\n";
  });

  receipt += `===============================\n`;
  receipt += `Subtotal: ₱${subtotal.toFixed(2)}\n`;

  if (discountApplied) {
    receipt += `PWD/Senior Discount (20%): Applied\n`;
  }
  if (employeeDiscountApplied) {
    receipt += `Employee Discount (5%): Applied\n`;
  }

  receipt += `Total: ₱${total.toFixed(2)}\n`;
  receipt += `Payment Method: ${paymentMethod}\n`;
  receipt += `Amount Paid: ₱${parseFloat(paymentAmount).toFixed(2)}\n`;
  receipt += `Change: ₱${change > 0 ? change.toFixed(2) : "0.00"}\n`;
  receipt += `===============================\n`;
  receipt += `Thank you for your order!\n`;

  receiptContent = receipt;
}

function showReceipt() {
  closePaymentModal();

  const modal = document.getElementById("receiptModal");
  const content = document.getElementById("receiptContent");

  content.textContent = receiptContent;
  modal.classList.add("active");
}

function closeReceiptModal() {
  document.getElementById("receiptModal").classList.remove("active");
  clearCart();
}

function printReceipt() {
  if (!cart || cart.length === 0) {
    return;
  }

  const items = cart;
  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const paidAmount = parseFloat(paymentAmount) || total;
  const change = calculateChange();

  // Generate unique transaction ID
  const transactionId = generateTransactionCode();

  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Receipt</title>
        <meta charset="UTF-8">
        <style>
            /* RESET EVERYTHING */
            * {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                line-height: 1.4 !important; /* ✅ 4.0 spacing between lines */
                font-family: 'Courier New', monospace !important;
            }
            
            @page {
                size: 80mm auto !important;
                margin: 0 !important;
            }
            
            html, body {
                width: 80mm !important;
                height: auto !important;
                margin: 0 auto !important;
                padding: 0 !important;
                background: white !important;
                color: black !important;
                font-size: 16px !important; /* BASE SIZE */
            }
            
            body {
                padding: 1mm !important; /* ✅ 1mm minimal */
                margin: 0 auto !important;
                width: 80mm !important;
            }
            
            .receipt {
                width: 80mm !important;
                margin: 0 auto !important;
                padding: 1mm !important;
                text-align: center !important;
            }
            
            /* HEADER */
            .store-name {
                font-size: 18px !important; /* ✅ 18px bold */
                font-weight: bold !important;
                text-transform: uppercase;
                margin: 0.4mm 0 !important; /* Added 4 spacing */
            }
            
            .store-address {
                font-size: 17px !important; /* ✅ 17px */
                margin: 0.4mm 0 !important; /* Added 4 spacing */
            }
            
            .divider {
                font-size: 16px !important;
                margin: 0.9mm 0 !important; /* ✅ 0.9mm minimal */
                padding: 0 !important;
            }
            
            /* SECTION INFO */
            .info {
                font-size: 17px !important; /* ✅ 17px */
                text-align: left !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }
            
            .info td {
                font-size: 17px !important; /* ✅ 17px */
                padding: 0.4mm 0 !important; /* ✅ 0.4mm-0.5mm minimal */
            }
            
            /* ITEMS HEADER */
            .items-header {
                font-size: 17px !important; /* ✅ 17px */
                font-weight: bold !important;
                text-align: left !important;
                margin: 0.4mm 0 !important; /* Added 4 spacing */
            }
            
            /* ITEMS TABLE */
            .items-table {
                width: 100% !important;
                font-size: 16px !important;
                border-collapse: collapse !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .items-table td {
                padding: 0.4mm 0 !important; /* ✅ 0.4mm-0.5mm minimal */
                vertical-align: top !important;
            }
            
            .item-name {
                text-align: left !important;
                width: 50% !important;
                font-size: 16px !important; /* ✅ 16px BOLD */
                font-weight: bold !important;
            }
            
            .item-qty {
                text-align: center !important;
                width: 15% !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }
            
            .item-price {
                text-align: right !important;
                width: 35% !important;
                font-size: 16px !important; /* ✅ 16px BOLD */
                font-weight: bold !important;
            }
            
            .item-addons {
                font-size: 16px !important; /* ✅ 16px italic */
                font-style: italic !important;
                padding-left: 2mm !important;
                text-align: left !important;
            }
            
            .item-notes {
                font-size: 16px !important; /* ✅ 16px italic */
                font-style: italic !important;
                padding-left: 2mm !important;
                text-align: left !important;
                color: #666 !important;
            }
            
            /* TOTALS */
            .totals {
                width: 100% !important;
                font-size: 16px !important; /* ✅ 16px BOLD */
                margin: 0.9mm 0 0 !important; /* ✅ 0.9mm minimal */
                padding: 0 !important;
                border-top: 1px solid black !important;
            }
            
            .totals td {
                padding: 0.4mm 0 !important; /* ✅ 0.4mm-0.5mm minimal */
                font-weight: bold !important;
            }
            
            .grand-total {
                font-weight: 900 !important; /* ✅ 16px SUPER BOLD */
                font-size: 16px !important;
                border-top: 2px solid black !important;
                border-bottom: 2px solid black !important;
            }
            
            .grand-total td {
                font-weight: 900 !important;
            }
            
            /* FOOTER */
            .footer {
                font-size: 12px !important; /* ✅ 12px */
                margin: 0.6mm 0 0 !important; /* ✅ 0.6mm-0.9mm minimal */
                padding: 0 !important;
            }
            
            .footer div {
                margin: 0.4mm 0 !important; /* Added 4 spacing between footer lines */
            }
            
            .transaction-info {
                font-size: 12px !important; /* ✅ 12px */
                color: #666 !important;
                margin: 0.6mm 0 0 !important; /* ✅ 0.6mm-0.9mm minimal */
                padding: 0 !important;
            }
            
            .transaction-info br {
                margin: 0.4mm 0 !important; /* Added 4 spacing between transaction lines */
            }
            
            /* DISCOUNT ROWS */
            .discount-row {
                color: #dc2626 !important;
                font-weight: bold !important;
            }
            
            /* PRINT BUTTON (FOR PREVIEW ONLY) */
            .no-print {
                display: none !important;
            }
            
            /* FORCE NO PAGE BREAKS */
            .receipt {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            /* PRINT SPECIFIC */
            @media print {
                .no-print {
                    display: none !important;
                }
                
                .receipt {
                    padding: 0.5mm !important;
                }
                
                body {
                    padding: 0.5mm !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <!-- HEADER -->
            <div class="store-name">K-STREET TARLAC</div>
            <div class="store-address">Mc Arthur Highway, Magaspac</div>
            <div class="store-address">Gerona, Tarlac</div>
            
            <div class="divider">=============================</div>
            
            <!-- TRANSACTION INFO -->
            <table class="info">
                <tr>
                    <td><strong>Cashier:</strong></td>
                    <td>${
                      currentUser?.username || currentUser?.email || "Unknown"
                    }</td>
                </tr>
                <tr>
                    <td><strong>Type:</strong></td>
                    <td>${orderType}</td>
                </tr>
                <tr>
                    <td><strong>Payment:</strong></td>
                    <td>${paymentMethod}</td>
                </tr>
                <tr>
                    <td><strong>Date:</strong></td>
                    <td>${new Date().toLocaleString("en-PH", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Manila",
                    })}</td>
                </tr>
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <!-- ITEMS -->
            <div class="items-header">ORDER ITEMS:</div>
            <table class="items-table">
                ${generateReceiptItems()}
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <!-- TOTALS -->
            <table class="totals">
                <tr>
                    <td style="text-align: left; width: 60%;">Subtotal:</td>
                    <td style="text-align: right; width: 40%;">₱${subtotal.toFixed(
                      2
                    )}</td>
                </tr>
                ${
                  discountApplied
                    ? `
                <tr class="discount-row">
                    <td style="text-align: left;">PWD/Senior Disc (20%):</td>
                    <td style="text-align: right;">-₱${(subtotal * 0.2).toFixed(
                      2
                    )}</td>
                </tr>
                `
                    : ""
                }
                ${
                  employeeDiscountApplied
                    ? `
                <tr class="discount-row">
                    <td style="text-align: left;">Employee Disc (5%):</td>
                    <td style="text-align: right;">-₱${(
                      subtotal * 0.05
                    ).toFixed(2)}</td>
                </tr>
                `
                    : ""
                }
                <tr class="grand-total">
                    <td style="text-align: left; width: 60%;">TOTAL:</td>
                    <td style="text-align: right; width: 40%;">₱${total.toFixed(
                      2
                    )}</td>
                </tr>
                <tr>
                    <td style="text-align: left;">Amount Paid:</td>
                    <td style="text-align: right;">₱${paidAmount.toFixed(
                      2
                    )}</td>
                </tr>
                <tr>
                    <td style="text-align: left;">Change:</td>
                    <td style="text-align: right;">₱${
                      change > 0 ? change.toFixed(2) : "0.00"
                    }</td>
                </tr>
            </table>
            
            <div class="divider">=============================</div>
            
            <!-- FOOTER -->
            <div class="footer">
                <div>Thank you for dining with us!</div>
                <div>Please come again!</div>
                <div style="font-weight: bold;">*** THIS IS YOUR OFFICIAL RECEIPT ***</div>
            </div>
            
            <div class="transaction-info">
                <div>Transaction ID: ${transactionId}</div>
                <div>Printed: ${new Date()
                  .toLocaleString("en-PH", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                  .replace(",", "")}</div>
            </div>
        </div>
        
        <!-- PREVIEW CONTROLS -->
        <div class="no-print" style="text-align: center; margin-top: 5mm;">
            <button onclick="window.print()" style="
                padding: 5px 10px;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 3px;
                font-size: 11px;
                cursor: pointer;
                margin: 2px;
            ">
                🖨️ Print
            </button>
            <button onclick="window.close()" style="
                padding: 5px 10px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 3px;
                font-size: 11px;
                cursor: pointer;
                margin: 2px;
            ">
                ✕ Close
            </button>
        </div>
        
        <!-- AUTO PRINT SCRIPT -->
        <script>
            // AUTO PRINT
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 300);
            };
            
            // KEYBOARD SHORTCUTS
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') window.close();
                if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                    e.preventDefault();
                    window.print();
                }
            });
        </script>
    </body>
    </html>
    `;

  // OPEN IN NEW WINDOW
  const printWindow = window.open("", "_blank", "width=350,height=600");
  printWindow.document.write(printHTML);
  printWindow.document.close();
  printWindow.focus();
}

// NEW FUNCTION: generateReceiptItems() - Updated to match the design
function generateReceiptItems() {
  let html = "";

  cart.forEach((item, index) => {
    let itemName = item.name;

    // Handle upgrades
    if (item.selectedUpgrade) {
      if (item.selectedUpgrade.description_type === "k-street product") {
        itemName = `[${item.selectedUpgrade.name} COMPLETE]`;
      } else {
        itemName = `[${item.selectedUpgrade.name} UPGRADE]`;
      }
    }

    // Add flavors to item name
    if (item.selectedFlavors && item.selectedFlavors.length > 0) {
      const flavorNames = item.selectedFlavors.map((f) => f.name).join(", ");
      itemName += ` [FLAVORS: ${flavorNames}]`;
    }

    const itemPrice = parseFloat(item.finalPrice || item.price);
    const itemTotal = (itemPrice * item.quantity).toFixed(2);

    html += `
      <tr>
          <td class="item-name">${itemName}</td>
          <td class="item-qty">x${item.quantity}</td>
          <td class="item-price">₱${itemTotal}</td>
      </tr>
    `;

    // Addons
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      const addonNames = item.selectedAddons.map((a) => a.name).join(", ");
      html += `
        <tr>
            <td colspan="3" class="item-addons">
                + ${addonNames}
            </td>
        </tr>
      `;
    }

    // Special instructions
    if (item.specialInstructions) {
      html += `
        <tr>
            <td colspan="3" class="item-notes">
                Note: ${item.specialInstructions}
            </td>
        </tr>
      `;
    }
  });

  return html;
}

// ============================
// NEW: PRINT QUEUE RECEIPT FUNCTION
// ============================
function printQueueReceipt(index) {
  const order = queuedOrders[index];
  if (!order) return;

  // Parse items
  let items = [];
  try {
    items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch (e) {
    console.error("Error parsing items:", e);
    return;
  }

  const subtotal = parseFloat(order.subtotal);
  const total = parseFloat(order.total);
  const discountApplied = order.discount_applied === 1;
  const employeeDiscountApplied = order.employee_discount_applied === 1;

  // Generate unique transaction ID
  const transactionId = generateTransactionCode();

  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Queue Receipt - Table ${order.table_number}</title>
        <meta charset="UTF-8">
        <style>
            * {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                line-height: 1.4 !important;
                font-family: 'Courier New', monospace !important;
            }
            
            @page {
                size: 80mm auto !important;
                margin: 0 !important;
            }
            
            html, body {
                width: 80mm !important;
                height: auto !important;
                margin: 0 auto !important;
                padding: 0 !important;
                background: white !important;
                color: black !important;
                font-size: 16px !important;
            }
            
            body {
                padding: 1mm !important;
                margin: 0 auto !important;
                width: 80mm !important;
            }
            
            .receipt {
                width: 80mm !important;
                margin: 0 auto !important;
                padding: 1mm !important;
                text-align: center !important;
            }
            
            .store-name {
                font-size: 18px !important;
                font-weight: bold !important;
                text-transform: uppercase;
                margin: 0.4mm 0 !important;
            }
            
            .store-address {
                font-size: 17px !important;
                margin: 0.4mm 0 !important;
            }
            
            .divider {
                font-size: 16px !important;
                margin: 0.9mm 0 !important;
                padding: 0 !important;
            }
            
            /* ON QUEUE BANNER */
            .queue-banner {
                background: white !important;
                border: 2px solid white !important;
                padding: 3mm !important;
                margin: 2mm 0 !important;
                border-radius: 2mm !important;
            }
            
            .queue-text {
                font-size: 20px !important;
                font-weight: 900 !important;
                color: black !important;
                letter-spacing: 2px !important;
            }
            
            .table-number {
                font-size: 24px !important;
                font-weight: 900 !important;
                color: black !important;
                margin: 1mm 0 !important;
            }
            
            .info {
                font-size: 17px !important;
                text-align: left !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }
            
            .info td {
                font-size: 17px !important;
                padding: 0.4mm 0 !important;
            }
            
            .items-header {
                font-size: 17px !important;
                font-weight: bold !important;
                text-align: left !important;
                margin: 0.4mm 0 !important;
            }
            
            .items-table {
                width: 100% !important;
                font-size: 16px !important;
                border-collapse: collapse !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .items-table td {
                padding: 0.4mm 0 !important;
                vertical-align: top !important;
            }
            
            .item-name {
                text-align: left !important;
                width: 50% !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }
            
            .item-qty {
                text-align: center !important;
                width: 15% !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }
            
            .item-price {
                text-align: right !important;
                width: 35% !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }
            
            .item-addons {
                font-size: 16px !important;
                font-style: italic !important;
                padding-left: 2mm !important;
                text-align: left !important;
            }
            
            .item-notes {
                font-size: 16px !important;
                font-style: italic !important;
                padding-left: 2mm !important;
                text-align: left !important;
                color: #666 !important;
            }
            
            .totals {
                width: 100% !important;
                font-size: 16px !important;
                margin: 0.9mm 0 0 !important;
                padding: 0 !important;
                border-top: 1px solid black !important;
            }
            
            .totals td {
                padding: 0.4mm 0 !important;
                font-weight: bold !important;
            }
            
            .grand-total {
                font-weight: 900 !important;
                font-size: 16px !important;
                border-top: 2px solid black !important;
                border-bottom: 2px solid black !important;
            }
            
            .grand-total td {
                font-weight: 900 !important;
            }
            
            .footer {
                font-size: 12px !important;
                margin: 0.6mm 0 0 !important;
                padding: 0 !important;
            }
            
            .footer div {
                margin: 0.4mm 0 !important;
            }
            
            .transaction-info {
                font-size: 12px !important;
                color: #666 !important;
                margin: 0.6mm 0 0 !important;
                padding: 0 !important;
            }
            
            .discount-row {
                color: #dc2626 !important;
                font-weight: bold !important;
            }
            
            .no-print {
                display: none !important;
            }
            
            .receipt {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            @media print {
                .no-print {
                    display: none !important;
                }
                
                .receipt {
                    padding: 0.5mm !important;
                }
                
                body {
                    padding: 0.5mm !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="store-name">K-STREET TARLAC</div>
            <div class="store-address">Mc Arthur Highway, Magaspac</div>
            <div class="store-address">Gerona, Tarlac</div>
            
            <div class="divider">=============================</div>
            
            <!-- ON QUEUE BANNER -->
            <div class="queue-banner">
                <div class="table-number">TABLE ${order.table_number}</div>
            </div>
            
            <div class="divider">=============================</div>
            
            <table class="info">
                <tr>
                    <td><strong>Cashier:</strong></td>
                    <td>${currentUser?.username || currentUser?.email || "Unknown"}</td>
                </tr>
                <tr>
                    <td><strong>Type:</strong></td>
                    <td>${order.order_type}</td>
                </tr>
                <tr>
                    <td><strong>Queue Time:</strong></td>
                    <td>${new Date(order.timestamp).toLocaleString("en-PH", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Manila",
                    })}</td>
                </tr>
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <div class="items-header">ORDER ITEMS:</div>
            <table class="items-table">
                ${generateQueueReceiptItems(items)}
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <table class="totals">
                <tr>
                    <td style="text-align: left; width: 60%;">Subtotal:</td>
                    <td style="text-align: right; width: 40%;">₱${subtotal.toFixed(2)}</td>
                </tr>
                ${discountApplied ? `
                <tr class="discount-row">
                    <td style="text-align: left;">PWD/Senior Disc (20%):</td>
                    <td style="text-align: right;">-₱${(subtotal * 0.2).toFixed(2)}</td>
                </tr>
                ` : ""}
                ${employeeDiscountApplied ? `
                <tr class="discount-row">
                    <td style="text-align: left;">Employee Disc (5%):</td>
                    <td style="text-align: right;">-₱${(subtotal * 0.05).toFixed(2)}</td>
                </tr>
                ` : ""}
                <tr class="grand-total">
                    <td style="text-align: left; width: 60%;">TOTAL:</td>
                    <td style="text-align: right; width: 40%;">₱${total.toFixed(2)}</td>
                </tr>
            </table>
            
            <div class="divider">=============================</div>
            
            <div class="footer">
                <div style="font-weight: bold; font-size: 14px !important; color: black !important;">PENDING PAYMENT</div>
                <div style="margin-top: 2mm !important;">This order is in queue</div>
                <div>Please process payment when ready</div>
            </div>
            
            <div class="transaction-info">
                <div>Queue ID: ${transactionId}</div>
                <div>Printed: ${new Date().toLocaleString("en-PH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).replace(",", "")}</div>
            </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 5mm;">
            <button onclick="window.print()" style="
                padding: 5px 10px;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 3px;
                font-size: 11px;
                cursor: pointer;
                margin: 2px;
            ">
                🖨️ Print
            </button>
            <button onclick="window.close()" style="
                padding: 5px 10px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 3px;
                font-size: 11px;
                cursor: pointer;
                margin: 2px;
            ">
                ✕ Close
            </button>
        </div>
        
        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 300);
            };
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') window.close();
                if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                    e.preventDefault();
                    window.print();
                }
            });
        </script>
    </body>
    </html>
    `;

  const printWindow = window.open("", "_blank", "width=350,height=600");
  printWindow.document.write(printHTML);
  printWindow.document.close();
  printWindow.focus();
}

// NEW FUNCTION: generateQueueReceiptItems()
function generateQueueReceiptItems(items) {
  let html = "";

  items.forEach((item, index) => {
    let itemName = item.name;

    if (item.selectedUpgrade) {
      if (item.selectedUpgrade.description_type === "k-street product") {
        itemName = `[${item.selectedUpgrade.name} COMPLETE]`;
      } else {
        itemName = `[${item.selectedUpgrade.name} UPGRADE]`;
      }
    }

    if (item.selectedFlavors && item.selectedFlavors.length > 0) {
      const flavorNames = item.selectedFlavors.map((f) => f.name).join(", ");
      itemName += ` [FLAVORS: ${flavorNames}]`;
    }

    const itemPrice = parseFloat(item.finalPrice || item.price);
    const itemTotal = (itemPrice * item.quantity).toFixed(2);

    html += `
      <tr>
          <td class="item-name">${itemName}</td>
          <td class="item-qty">x${item.quantity}</td>
          <td class="item-price">₱${itemTotal}</td>
      </tr>
    `;

    if (item.selectedAddons && item.selectedAddons.length > 0) {
      const addonNames = item.selectedAddons.map((a) => a.name).join(", ");
      html += `
        <tr>
            <td colspan="3" class="item-addons">
                + ${addonNames}
            </td>
        </tr>
      `;
    }

    if (item.specialInstructions) {
      html += `
        <tr>
            <td colspan="3" class="item-notes">
                Note: ${item.specialInstructions}
            </td>
        </tr>
      `;
    }
  });

  return html;
}

// Helper function to generate transaction code
function generateTransactionCode() {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `KST-${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date
    .getDate()
    .toString()
    .padStart(2, "0")}-${timestamp}${random}`;
}

function saveReceiptAsPNG() {
  if (!receiptContent || receiptContent.trim() === "") {
    return;
  }

  const receiptHTML = `
        <div style="
            width: 400px;
            padding: 20px;
            background: white;
            color: black;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.3;
            white-space: pre-wrap;
            box-sizing: border-box;
            text-align: center;
        ">
            ${receiptContent}
        </div>
    `;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.innerHTML = receiptHTML;
  document.body.appendChild(container);

  const receiptDiv = container.querySelector("div");

  setTimeout(async () => {
    try {
      const canvas = await html2canvas(receiptDiv, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        width: receiptDiv.offsetWidth,
        height: receiptDiv.offsetHeight,
        windowWidth: receiptDiv.offsetWidth,
        windowHeight: receiptDiv.offsetHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      const timestamp = new Date().getTime();
      link.download = `k-street-receipt-${timestamp}.png`;
      link.href = imgData;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      document.body.removeChild(container);
    } catch (error) {
      console.error("Error saving receipt as PNG:", error);
      document.body.removeChild(container);
    }
  }, 100);
}