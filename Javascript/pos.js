// pos.js - Complete POS Frontend JavaScript
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
let specialInstructions = "";
let lastActionTime = null;
let products = [];
let addons = [];
let upgrades = [];
let flavors = [];
let categories = ["All"];
let activeCategory = "All";
let searchTerm = "";
let paymentAmount = "";
let changeAmount = 0;
let receiptContent = "";
let orderSaved = false; // NEW: Flag to prevent duplicate saves

// ============================
// INITIALIZATION
// ============================
document.addEventListener("DOMContentLoaded", function () {
  console.log("POS System Initializing...");
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  checkCurrentStoreStatus();
  fetchProducts();
  fetchAddons();
  fetchUpgrades();

  setupEventListeners();

  console.log("✅ POS System Ready!");
});

// ============================
// TIME FUNCTIONS
// ============================
function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  document.getElementById("currentDateTime").textContent = timeString;
}

function formatStoreTime(timestamp) {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
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
// STORE STATUS FUNCTIONS
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
    console.log("Store status:", data);

    storeOpen = data.isOpen || false;
    updateStoreToggleButton();
    renderProducts(); // UPDATED: Re-render products to enable/disable buttons

    if (data.lastAction) {
      lastActionTime = data.lastAction.timestamp;
      updateLastActionTime();
    }
  } catch (error) {
    console.error("Error checking store status:", error);
    storeOpen = false;
    updateStoreToggleButton();
    renderProducts(); // UPDATED: Re-render products
  }
}

async function handleStoreToggle() {
  if (!currentUser) {
    alert("Please login first");
    return;
  }

  const newStatus = !storeOpen;
  const action = newStatus ? "open" : "close";

  try {
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
      // UPDATED: Update store status FIRST before showing modal
      storeOpen = newStatus;
      updateStoreToggleButton();
      renderProducts(); // UPDATED: Immediate render

      const actionTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      lastActionTime = new Date().toISOString();
      updateLastActionTime();

      // Show modal AFTER updating state
      showStoreSuccessModal(newStatus, actionTime);
    } else {
      alert("Failed to update store status");
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
  // UPDATED: Force complete UI refresh
  updateStoreToggleButton();
  updateLastActionTime();
  renderProducts();

  // Also update discount buttons state
  const pwdBtn = document.getElementById("pwdDiscountBtn");
  const empBtn = document.getElementById("employeeDiscountBtn");

  if (storeOpen) {
    // Enable discount buttons
    pwdBtn.disabled = false;
    empBtn.disabled = false;
    pwdBtn.style.opacity = "1";
    empBtn.style.opacity = "1";
    pwdBtn.style.cursor = "pointer";
    empBtn.style.cursor = "pointer";
  } else {
    // Disable discount buttons
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
    console.log("Products fetched:", data.length);

    products = data.filter((item) => item.description_type === "k-street food");

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
    console.log("Addons fetched:", addons.length);
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
    console.log("Upgrades fetched:", upgrades.length);
    console.log("Flavors fetched:", flavors.length);
  } catch (error) {
    console.error("Error fetching upgrades:", error);
    upgrades = [];
    flavors = [];
  }
}

// ============================
// RENDER FUNCTIONS
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

function renderProducts() {
  const grid = document.getElementById("productGrid");

  const filtered = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-400">
                <div class="text-5xl mb-3">🔍</div>
                <p class="text-lg font-semibold text-gray-500">No products found</p>
                <p class="text-sm mt-1">Try different search terms or category</p>
            </div>
        `;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (product) => `
        <div class="group border-2 rounded-2xl p-4 transition-all duration-300 ${
          storeOpen
            ? "border-gray-100 hover:shadow-2xl hover:border-red-200 hover:scale-105"
            : "border-gray-200 opacity-80"
        }">
            <div class="h-40 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    ${
      product.image &&
      product.image.trim() !== "" &&
      !product.image.includes("fbcdn.net")
        ? `<img src="${product.image}" 
                alt="${product.name}" 
                onerror="this.onerror=null; this.src='images/no-image.png';"
                class="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300">`
        : `<img src="img/kslogo.png" 
                alt="No Image Available" 
                class="object-cover h-full w-full opacity-50">`
    }
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
                <button onclick="addToCart(${product.id})" 
                        ${!storeOpen ? 'disabled title="Store is closed"' : ""}
                        class="px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
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

  // UPDATED: Log render state for debugging
  console.log(
    `Products rendered. Store status: ${storeOpen ? "OPEN" : "CLOSED"}`
  );
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
      const displayName = item.selectedUpgrade
        ? item.selectedUpgrade.description_type === "k-street Flavor"
          ? `[${item.selectedUpgrade.name} FLAVOR] ${item.name}`
          : `[UPGRADED] ${item.selectedUpgrade.name}`
        : item.name;

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
                          "k-street Flavor"
                            ? "text-purple-600"
                            : "text-green-600"
                        }">
                            ${
                              item.selectedUpgrade.description_type ===
                              "k-street Flavor"
                                ? "Flavor"
                                : "Upgrade"
                            }: ${item.selectedUpgrade.name}
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
}

// ============================
// FILTER & SEARCH FUNCTIONS
// ============================
function filterCategory(category) {
  activeCategory = category;
  renderCategoryButtons();
  renderProducts();
}

function handleSearch(e) {
  searchTerm = e.target.value;
  renderProducts();
}

// ============================
// CART FUNCTIONS
// ============================
function addToCart(productId) {
  if (!storeOpen) {
    alert(
      "Store is currently closed. Please open the store first before adding items to cart."
    );
    return;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) return;

  selectedProduct = product;
  selectedAddons = [];
  selectedUpgrade = null;
  specialInstructions = "";

  showAddonsModal();
}

function showAddonsModal() {
  if (!selectedProduct) return;

  const modal = document.getElementById("addonsModal");
  document.getElementById("addonsProductName").textContent =
    selectedProduct.name;
  document.getElementById(
    "addonsProductCode"
  ).textContent = `Product Code: ${selectedProduct.product_code}`;

  const filteredAddons = addons.filter(
    (addon) =>
      addon.category === selectedProduct.category ||
      addon.category === "General"
  );

  const filteredUpgrades = [...upgrades, ...flavors].filter(
    (item) => item.product_code === selectedProduct.product_code
  );

  const upgradesOnly = filteredUpgrades.filter(
    (item) => item.description_type === "k-street upgrades"
  );
  const flavorsOnly = filteredUpgrades.filter(
    (item) => item.description_type === "k-street Flavor"
  );

  let html = '<div class="space-y-6">';

  // Add-ons Section
  html += `
        <div>
            <h4 class="text-lg font-bold text-gray-800 mb-3">Add-ons (Sides)</h4>
            <p class="text-sm text-gray-500 mb-3">Available sides that complement your ${selectedProduct.name}</p>
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
    html +=
      '<p class="text-gray-500 text-center py-4">No sides available for this item</p>';
  }

  html += "</div></div>";

  // Upgrades Section
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

  // Flavors Section
  html += `
        <div>
            <h4 class="text-lg font-bold text-gray-800 mb-3">k-street Flavor</h4>
            <p class="text-sm text-gray-500 mb-3">Different flavor variations for your ${selectedProduct.name}</p>
            <div class="grid grid-cols-1 gap-2">
    `;

  if (flavorsOnly.length > 0) {
    flavorsOnly.forEach((flavor) => {
      html += `
                <button onclick="toggleUpgrade(${flavor.id})" id="upgrade-${
        flavor.id
      }"
                        class="p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-medium">${flavor.name}</span>
                            <span class="text-sm text-gray-500 ml-2">Flavor: ₱${parseFloat(
                              flavor.price
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
    html += `<p class="text-gray-500 text-center py-4">No flavor variations available for ${selectedProduct.name}</p>`;
  }

  html += "</div></div>";

  // Special Instructions
  html += `
        <div>
            <h4 class="text-lg font-bold text-gray-800 mb-3">Special Instructions</h4>
            <textarea id="specialInstructions" placeholder="Any special requests or instructions..." 
                      class="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
                      rows="3"></textarea>
        </div>
    `;

  // Price Summary
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
            <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                <span class="text-lg font-bold text-gray-800">Total:</span>
                <span class="text-lg font-bold text-red-600" id="modalTotal">₱${parseFloat(
                  basePrice
                ).toFixed(2)}</span>
            </div>
        </div>
    `;

  // Action Buttons
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

function toggleAddon(addonId) {
  const addon = addons.find((a) => a.id === addonId);
  if (!addon) return;

  const index = selectedAddons.findIndex((a) => a.id === addonId);
  const button = document.getElementById(`addon-${addonId}`);
  const checkSpan = button.querySelector(".addon-check");

  if (index !== -1) {
    // Remove addon
    selectedAddons.splice(index, 1);
    button.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300";
    checkSpan.className =
      "addon-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center";
    checkSpan.textContent = "";
  } else {
    // Add addon
    selectedAddons.push(addon);
    button.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-red-100 border-red-500 text-red-700";
    checkSpan.className =
      "addon-check w-5 h-5 rounded-full border-2 border-red-500 bg-red-500 text-white flex items-center justify-center";
    checkSpan.textContent = "✓";
  }

  updateModalPricing();
}

function toggleUpgrade(upgradeId) {
  const upgrade = [...upgrades, ...flavors].find((u) => u.id === upgradeId);
  if (!upgrade) return;

  // Clear all upgrade selections
  document.querySelectorAll('[id^="upgrade-"]').forEach((btn) => {
    btn.className =
      "p-3 rounded-xl border-2 transition-all text-left bg-gray-50 border-gray-200 text-gray-700 hover:border-green-300";
    const check = btn.querySelector(".upgrade-check");
    check.className =
      "upgrade-check w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center";
    check.textContent = "";
  });

  if (selectedUpgrade && selectedUpgrade.id === upgradeId) {
    // Deselect
    selectedUpgrade = null;
  } else {
    // Select new upgrade
    selectedUpgrade = upgrade;
    const button = document.getElementById(`upgrade-${upgradeId}`);

    if (upgrade.description_type === "k-street Flavor") {
      button.className =
        "p-3 rounded-xl border-2 transition-all text-left bg-purple-100 border-purple-500 text-purple-700";
      const check = button.querySelector(".upgrade-check");
      check.className =
        "upgrade-check w-5 h-5 rounded-full border-2 border-purple-500 bg-purple-500 text-white flex items-center justify-center";
      check.textContent = "✓";
    } else {
      button.className =
        "p-3 rounded-xl border-2 transition-all text-left bg-green-100 border-green-500 text-green-700";
      const check = button.querySelector(".upgrade-check");
      check.className =
        "upgrade-check w-5 h-5 rounded-full border-2 border-green-500 bg-green-500 text-white flex items-center justify-center";
      check.textContent = "✓";
    }
  }

  updateModalPricing();
}

function updateModalPricing() {
  let basePrice = parseFloat(selectedProduct.price);
  let addonsTotal = selectedAddons.reduce(
    (sum, addon) => sum + parseFloat(addon.price),
    0
  );
  let finalPrice = basePrice;

  // Update pricing based on upgrade
  if (selectedUpgrade) {
    finalPrice = parseFloat(selectedUpgrade.price);
    document.getElementById("priceLabel").textContent =
      selectedUpgrade.description_type === "k-street Flavor"
        ? "Flavor Price:"
        : "Upgraded Price:";
    document.getElementById("basePrice").textContent = `₱${finalPrice.toFixed(
      2
    )}`;

    document.getElementById("upgradeInfo").style.display = "flex";
    if (selectedUpgrade.description_type === "k-street Flavor") {
      document.getElementById("upgradeLabel").textContent = "Flavor Applied:";
      document.getElementById("upgradeLabel").className = "text-purple-600";
      document.getElementById("upgradeName").textContent = selectedUpgrade.name;
      document.getElementById("upgradeName").className =
        "font-semibold text-purple-600";
    } else {
      document.getElementById("upgradeLabel").textContent = "Upgrade Applied:";
      document.getElementById("upgradeLabel").className = "text-green-600";
      document.getElementById("upgradeName").textContent = selectedUpgrade.name;
      document.getElementById("upgradeName").className =
        "font-semibold text-green-600";
    }
  } else {
    document.getElementById("priceLabel").textContent = "Base Price:";
    document.getElementById("basePrice").textContent = `₱${basePrice.toFixed(
      2
    )}`;
    document.getElementById("upgradeInfo").style.display = "none";
  }

  // Show addons total
  if (addonsTotal > 0) {
    document.getElementById("addonsTotal").style.display = "flex";
    document.getElementById(
      "addonsTotalValue"
    ).textContent = `+₱${addonsTotal.toFixed(2)}`;
  } else {
    document.getElementById("addonsTotal").style.display = "none";
  }

  // Update final total
  const total = finalPrice + addonsTotal;
  document.getElementById("modalTotal").textContent = `₱${total.toFixed(2)}`;
}

function confirmAddToCart() {
  if (!selectedProduct) return;

  // Get special instructions value
  const instructionsInput = document.getElementById("specialInstructions");
  specialInstructions = instructionsInput ? instructionsInput.value : "";

  const finalPrice = selectedUpgrade
    ? parseFloat(selectedUpgrade.price) +
      selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price), 0)
    : parseFloat(selectedProduct.price) +
      selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price), 0);

  const cartItem = {
    id: selectedProduct.id,
    name: selectedProduct.name,
    price: parseFloat(selectedProduct.price),
    quantity: 1,
    selectedAddons: [...selectedAddons],
    selectedUpgrade: selectedUpgrade,
    specialInstructions: specialInstructions,
    finalPrice: finalPrice,
  };

  // Check if same item with same customizations exists
  const existingIndex = cart.findIndex(
    (item) =>
      item.id === cartItem.id &&
      JSON.stringify(item.selectedAddons) ===
        JSON.stringify(cartItem.selectedAddons) &&
      ((!item.selectedUpgrade && !cartItem.selectedUpgrade) ||
        (item.selectedUpgrade &&
          cartItem.selectedUpgrade &&
          item.selectedUpgrade.id === cartItem.selectedUpgrade.id)) &&
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
  orderSaved = false; // UPDATED: Reset flag
  document.getElementById("paymentInput").value = "";
  renderCart();
}

// ============================
// CALCULATION FUNCTIONS
// ============================
function calculateSubtotal() {
  return cart.reduce(
    (total, item) =>
      total + parseFloat(item.finalPrice || item.price) * item.quantity,
    0
  );
}

function calculateTotal() {
  let subtotal = calculateSubtotal();
  let total = subtotal;

  if (discountApplied) {
    total *= 0.8; // 20% discount
  }
  if (employeeDiscountApplied) {
    total *= 0.95; // 5% discount
  }

  return total;
}

function calculateChange() {
  const amount = parseFloat(paymentAmount) || 0;
  const total = calculateTotal();
  return amount > 0 ? amount - total : 0;
}

function updateTotals() {
  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const change = calculateChange();

  document.getElementById("subtotal").textContent = `₱${subtotal.toFixed(2)}`;
  document.getElementById("total").textContent = `₱${total.toFixed(2)}`;
  document.getElementById("changeAmount").textContent = `₱${change.toFixed(2)}`;

  // Show/hide discount rows
  const pwdRow = document.getElementById("pwdDiscountRow");
  const empRow = document.getElementById("employeeDiscountRow");

  if (discountApplied) {
    pwdRow.style.display = "flex";
    document.getElementById("pwdDiscountAmount").textContent = `-₱${(
      subtotal * 0.2
    ).toFixed(2)}`;
  } else {
    pwdRow.style.display = "none";
  }

  if (employeeDiscountApplied) {
    empRow.style.display = "flex";
    document.getElementById("employeeDiscountAmount").textContent = `-₱${(
      subtotal * 0.05
    ).toFixed(2)}`;
  } else {
    empRow.style.display = "none";
  }
}

function updateChangeAmount() {
  paymentAmount = document.getElementById("paymentInput").value;
  updateTotals();
}

// ============================
// DISCOUNT FUNCTIONS
// ============================
function togglePWDDiscount() {
  if (!storeOpen) {
    alert("Store is closed");
    return;
  }

  if (employeeDiscountApplied) {
    employeeDiscountApplied = false;
  }

  discountApplied = !discountApplied;

  const btn = document.getElementById("pwdDiscountBtn");
  btn.className = discountApplied
    ? "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white"
    : "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600";

  const empBtn = document.getElementById("employeeDiscountBtn");
  empBtn.className =
    "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black";

  updateTotals();
}

function toggleEmployeeDiscount() {
  if (!storeOpen) {
    alert("Store is closed");
    return;
  }

  if (discountApplied) {
    discountApplied = false;
  }

  employeeDiscountApplied = !employeeDiscountApplied;

  const btn = document.getElementById("employeeDiscountBtn");
  btn.className = employeeDiscountApplied
    ? "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white"
    : "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black";

  const pwdBtn = document.getElementById("pwdDiscountBtn");
  pwdBtn.className =
    "w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600";

  updateTotals();
}

// ============================
// PAYMENT FUNCTIONS
// ============================
function setPaymentMethod(method) {
  paymentMethod = method;

  // Update all payment method buttons
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

  document.getElementById("paymentInput").value = amount;
  paymentAmount = amount.toString();
  updateTotals();
}

async function processPayment() {
  if (!storeOpen) {
    alert(
      "Store is currently closed. Please open the store first before processing payments."
    );
    return;
  }

  if (!currentUser) {
    alert("Please login first");
    return;
  }

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  // UPDATED: Check if order already saved to prevent duplicate
  if (orderSaved) {
    console.log("Order already saved, skipping duplicate save");
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

  // Generate receipt
  generateReceiptText();

  // Prepare order data
  const productNames = cart
    .map((item) => {
      if (item.selectedUpgrade) {
        if (item.selectedUpgrade.description_type === "k-street Flavor") {
          return `[${item.selectedUpgrade.name} FLAVOR] ${item.name}`;
        } else {
          return `[UPGRADED] ${item.selectedUpgrade.name}`;
        }
      }
      return item.name;
    })
    .join(", ");

  const itemsData = cart.map((item) => ({
    id: item.id,
    name: item.selectedUpgrade
      ? item.selectedUpgrade.description_type === "k-street Flavor"
        ? `[${item.selectedUpgrade.name} FLAVOR] ${item.name}`
        : `[UPGRADED] ${item.selectedUpgrade.name}`
      : item.name,
    quantity: item.quantity,
    price: item.finalPrice || item.price,
    subtotal: (item.finalPrice || item.price) * item.quantity,
    selectedAddons: item.selectedAddons,
    selectedUpgrade: item.selectedUpgrade,
    specialInstructions: item.specialInstructions,
  }));

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
    // UPDATED: Set flag before saving
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
      // UPDATED: Reset flag on error
      orderSaved = false;
      showPaymentModal(
        "error",
        "Order Failed",
        "Could not save order. Please try again.",
        total
      );
    }
  } catch (error) {
    // UPDATED: Reset flag on error
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
Date: ${new Date().toLocaleString()}
===============================
Items:
`;

  cart.forEach((item) => {
    const isFlavor =
      item.selectedUpgrade &&
      item.selectedUpgrade.description_type === "k-street Flavor";
    const isUpgrade =
      item.selectedUpgrade &&
      item.selectedUpgrade.description_type !== "k-street Flavor";

    let itemName = item.name;
    if (isFlavor) {
      itemName = `[${item.selectedUpgrade.name} FLAVOR] ${item.name}`;
    } else if (isUpgrade) {
      itemName = `[UPGRADED] ${item.selectedUpgrade.name}`;
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
      if (item.selectedUpgrade.description_type === "k-street Flavor") {
        receipt += `Flavor: ${item.selectedUpgrade.name}\n`;
      } else {
        receipt += `Upgrade: ${item.selectedUpgrade.name} (₱${item.selectedUpgrade.price})\n`;
      }
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
  clearCart(); // This will reset the orderSaved flag
}

function printReceipt() {
  if (!receiptContent || receiptContent.trim() === "") {
    alert("No receipt content to print!");
    return;
  }

  const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>K-Street Receipt</title>
            <style>
                @media print {
                    body {
                        margin: 0;
                        padding: 10px;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        line-height: 1.3;
                        width: 300px;
                    }
                }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.3;
                    padding: 20px;
                    width: 300px;
                    margin: 0 auto;
                    white-space: pre-wrap;
                    text-align: center;
                }
            </style>
        </head>
        <body>${receiptContent}</body>
        </html>
    `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(printHTML);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

function saveReceiptAsPNG() {
  if (!receiptContent || receiptContent.trim() === "") {
    alert("No receipt content to save!");
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

      console.log("Receipt saved successfully!");
    } catch (error) {
      console.error("Error saving receipt as PNG:", error);
      alert("Failed to save receipt as PNG. Please try again.");
      document.body.removeChild(container);
    }
  }, 100);
}
