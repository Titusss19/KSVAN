<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
}

$user = $_SESSION['user'];
$activeView = 'pos';
$currentUser = $user;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POS - K-STREET</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
     <link rel="stylesheet" href="css/pos.css">
</head>
<body>
    <!-- Include Navbar -->
    <?php include 'components/navbar.php'; ?>

    <!-- Main Content -->
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div class="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Red Header -->
            <div class="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="flex-1">
                        <h1 class="text-3xl font-bold tracking-tight">Cashier POS System</h1>
                        <p class="text-red-100 mt-2 text-sm font-medium" id="currentDateTime">
                            <!-- Time will be updated by JavaScript -->
                        </p>
                        <div class="mt-3 flex items-center gap-3">
                            <span class="text-red-100 text-sm font-medium">Store Status:</span>
                            <button id="storeToggleBtn" class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-lg bg-white text-black hover:bg-red-50">
                                OPEN
                            </button>
                            <span class="text-red-100 text-sm" id="lastActionTime"></span>
                            <span class="text-red-100 text-sm">Branch: <?php echo htmlspecialchars($user['branch'] ?? 'Main Street'); ?></span>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button id="dineInBtn" class="px-8 py-3 rounded-xl font-semibold transition-all shadow-lg bg-black text-white shadow-xl scale-105">
                            Dine In
                        </button>
                        <button id="takeOutBtn" class="px-8 py-3 rounded-xl font-semibold transition-all shadow-lg bg-white text-black">
                            Take-Out
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex flex-col lg:flex-row">
                <!-- Left Panel - Products (2/3 width) -->
                <div class="lg:w-2/3 p-6 border-r border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        Product Catalog <?php echo htmlspecialchars($user['branch'] ?? 'Main Street'); ?> Branch
                    </h2>

                    <!-- Search and Filter -->
                    <div class="flex flex-col md:flex-row gap-4 mb-6">
                        <div class="flex-1">
                            <input type="text" placeholder="Search products..." id="searchInput" 
                                   class="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                        </div>
                        <div class="flex gap-2 overflow-x-auto pb-2">
                            <button onclick="filterCategory('All')" class="category-btn px-5 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-lg scale-105 transition-all">
                                All
                            </button>
                            <button onclick="filterCategory('Fries')" class="category-btn px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-200 transition-all">
                                Fries
                            </button>
                            <button onclick="filterCategory('Burger')" class="category-btn px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-200 transition-all">
                                Burger
                            </button>
                            <button onclick="filterCategory('Drinks')" class="category-btn px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-200 transition-all">
                                Drinks
                            </button>
                            <button onclick="filterCategory('Meals')" class="category-btn px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-200 transition-all">
                                Meals
                            </button>
                        </div>
                    </div>

                    <!-- Product Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" id="productGrid">
                        <!-- Products will be loaded via JavaScript -->
                        <div class="text-center py-12 text-gray-400">
                            <div class="text-4xl mb-3">🛒</div>
                            <p class="text-lg font-semibold text-gray-500">Loading products...</p>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Order (1/3 width) -->
                <div class="lg:w-1/3 p-6 bg-gradient-to-br from-gray-50 to-white">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Current Order</h2>
                        <button onclick="clearCart()" class="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md transition-all flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Clear All
                        </button>
                    </div>

                    <!-- Discount Buttons -->
                    <div class="mb-4 grid grid-cols-2 gap-3">
                        <button id="pwdDiscountBtn" class="w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-black text-white">
                            PWD/Senior 20% 
                        </button>
                        <button id="employeeDiscountBtn" class="w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black hover:shadow-xl">
                            Employee 5%
                        </button>
                    </div>

                    <!-- Cart Items -->
                    <div class="mb-6 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-2xl bg-white shadow-inner">
                        <div id="cartContainer" class="p-4 space-y-4">
                            <!-- Empty Cart State -->
                            <div class="text-center py-12 text-gray-400">
                                <div class="text-5xl mb-3">🛒</div>
                                <p class="text-lg font-semibold text-gray-500">Empty Cart</p>
                                <p class="text-sm mt-1">Add items to get started</p>
                            </div>
                        </div>
                    </div>

                    <!-- Totals Section -->
                    <div class="border-t-2 border-gray-200 pt-6">
                        <div class="space-y-3 mb-6">
                            <div class="flex justify-between text-gray-700">
                                <span class="font-medium">Subtotal</span>
                                <span id="subtotal" class="font-semibold">₱0.00</span>
                            </div>
                            <div class="flex justify-between text-amber-600 font-bold bg-amber-50 p-2 rounded-lg" id="pwdDiscountRow" style="display: none;">
                                <span>PWD/Senior Discount (20%)</span>
                                <span id="pwdDiscountAmount">-₱0.00</span>
                            </div>
                            <div class="flex justify-between text-blue-600 font-bold bg-blue-50 p-2 rounded-lg" id="employeeDiscountRow" style="display: none;">
                                <span>Employee Discount (5%)</span>
                                <span id="employeeDiscountAmount">-₱0.00</span>
                            </div>
                            <div class="flex justify-between font-bold text-xl border-gray-200 pt-4 text-gray-900">
                                <span>Change</span>
                                <span id="changeAmount" class="font-semibold text-green-600">₱0.00</span>
                            </div>
                            <div class="flex justify-between font-bold text-xl border-gray-200 pt-4 text-gray-900">
                                <span>Total</span>
                                <span id="total" class="text-red-600">₱0.00</span>
                            </div>
                        </div>

                        <!-- Payment Method -->
                        <h1 class="text-black font-bold text-lg mb-2">Payment Method</h1>
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-3 mb-5">
                                <button onclick="setPaymentMethod('Cash')" class="payment-method-btn py-3.5 bg-black text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                                    Cash
                                </button>
                                <button onclick="setPaymentMethod('Gcash')" class="payment-method-btn py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-md hover:bg-gray-300 hover:shadow-lg transition-all">
                                    Gcash
                                </button>
                                <button onclick="setPaymentMethod('Gcash + Cash')" class="payment-method-btn py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-md hover:bg-gray-300 hover:shadow-lg transition-all">
                                    Gcash + Cash
                                </button>
                                <button onclick="setPaymentMethod('Grab')" class="payment-method-btn py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-md hover:bg-gray-300 hover:shadow-lg transition-all">
                                    Grab
                                </button>
                            </div>
                        </div>

                        <!-- Payment Amount -->
                        <h1 class="text-black font-bold text-lg mb-2">Payment Amount</h1>
                        <div class="space-y-4">
                            <div class="grid grid-cols-3 gap-3">
                                <button onclick="addPaymentAmount(100)" class="py-3.5 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 hover:shadow-lg transition-all">
                                    ₱100
                                </button>
                                <button onclick="addPaymentAmount(500)" class="py-3.5 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 hover:shadow-lg transition-all">
                                    ₱500
                                </button>
                                <button onclick="addPaymentAmount(1000)" class="py-3.5 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 hover:shadow-lg transition-all">
                                    ₱1000
                                </button>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">Enter Payment Amount</label>
                                <input type="number" id="paymentInput" placeholder="0.00" 
                                       class="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold transition-all">
                            </div>

                            <button onclick="processPayment()" id="processPaymentBtn" class="w-full bg-red-500 text-white py-5 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl">
                                Process Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Store Success Modal -->
    <div id="storeSuccessModal" class="modal">
        <div class="modal-content">
            <div class="p-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl">
                <h3 class="text-2xl font-bold">Store Opened Successfully!</h3>
                <p class="opacity-90 mt-1">Welcome to K-Street POS</p>
            </div>

            <div class="p-6">
                <div class="text-center mb-6">
                    <div class="text-7xl mb-4 text-red-500">✓</div>
                    <p class="text-gray-700 text-lg font-medium mb-4">Your store is now open for business!</p>
                    
                    <div class="bg-gradient-to-r from-red-50 to-red-50 border-red-200 border-2 rounded-2xl p-5 mt-4">
                        <p class="text-red-800 font-semibold text-lg mb-1">Store Opened At:</p>
                        <p class="text-red-600 font-bold text-3xl" id="storeActionTime">Loading...</p>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="closeStoreModal()" class="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl">
                        Start Selling!
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Addons Modal -->
    <div id="addonsModal" class="modal">
        <div class="modal-content" style="max-width: 600px;">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">Customize Item</h2>
                <button onclick="closeAddonsModal()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div id="addonsContent">
                <!-- Addons content loaded by JavaScript -->
            </div>
        </div>
    </div>

    <!-- Payment Modal -->
    <div id="paymentModal" class="modal">
        <div class="modal-content">
            <div class="p-6 bg-gradient-to-r from-red-500 to-red-500 text-white rounded-t-3xl">
                <h3 class="text-2xl font-bold text-white">Payment Successful!</h3>
            </div>

            <div class="p-6">
                <div class="text-center mb-6">
                    <div class="text-7xl mb-4 text-red-500">✓</div>
                    <p class="text-gray-700 text-lg font-medium mb-4" id="paymentMessage">Payment processed successfully!</p>
                    
                    <div class="bg-gradient-to-r from-red-50 border-1 border-red-200 rounded-2xl p-5 mt-4">
                        <p class="text-red-800 font-semibold text-lg mb-1">Change:</p>
                        <p class="text-red-600 font-bold text-4xl" id="changeResult">₱0.00</p>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="closePaymentModal()" class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                        Close
                    </button>
                    <button onclick="showReceipt()" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                        View Receipt
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Receipt Modal -->
    <div id="receiptModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">Receipt</h2>
                <div class="flex gap-2">
                    <button onclick="printReceipt()" class="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all">
                        Print
                    </button>
                    <button onclick="closeReceiptModal()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div id="receiptContent" class="font-mono text-sm bg-gray-50 p-4 rounded-lg">
                <!-- Receipt content will be shown here -->
            </div>
        </div>
    </div>

    <!-- JavaScript - EXACT SAME LOGIC AS REACT -->
    <script>
        // Global variables - SAME AS REACT
        let cart = [];
        let orderType = 'Dine In';
        let paymentMethod = 'Cash';
        let pwdDiscount = false;
        let employeeDiscount = false;
        let storeOpen = true;
        let selectedProduct = null;
        let selectedAddons = [];
        let selectedUpgrade = null;
        let specialInstructions = '';
        let lastActionTime = null;

        // Initialize - SAME LOGIC
        document.addEventListener('DOMContentLoaded', function() {
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);
            loadProducts();
            updateCartDisplay();
            
            // Set initial active states
            document.getElementById('dineInBtn').className = 'px-8 py-3 rounded-xl font-semibold transition-all shadow-lg bg-black text-white shadow-xl scale-105';
            document.getElementById('takeOutBtn').className = 'px-8 py-3 rounded-xl font-semibold transition-all shadow-lg bg-white text-black';
            
            // Load user from localStorage (simulated)
            const userData = <?php echo json_encode($user); ?>;
            console.log('Current user loaded:', userData);
        });

        // Update current time - SAME LOGIC
        function updateCurrentTime() {
            const now = new Date();
            const timeString = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            document.getElementById('currentDateTime').textContent = timeString;
        }

        // Load products - SIMILAR LOGIC
        function loadProducts() {
            // For demo, create some products
            const products = [
                { id: 1, name: 'Classic Burger', price: 120.00, category: 'Burger', image: '' },
                { id: 2, name: 'Cheese Burger', price: 140.00, category: 'Burger', image: '' },
                { id: 3, name: 'French Fries', price: 80.00, category: 'Fries', image: '' },
                { id: 4, name: 'Coke', price: 50.00, category: 'Drinks', image: '' },
                { id: 5, name: 'Burger Meal', price: 180.00, category: 'Meals', image: '' },
                { id: 6, name: 'Chicken Sandwich', price: 150.00, category: 'Burger', image: '' }
            ];
            
            const productGrid = document.getElementById('productGrid');
            productGrid.innerHTML = '';
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'group border-2 border-gray-100 rounded-2xl p-4 hover:shadow-2xl hover:border-red-200 hover:scale-105 transition-all duration-300';
                productCard.innerHTML = `
                    <div class="h-40 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}" class="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300">` : 
                        '<span class="text-gray-400 font-medium">No Image</span>'}
                    </div>
                    <h3 class="font-bold text-lg text-gray-800 mb-1">${product.name}</h3>
                    <span class="inline-block px-3 py-1 bg-red-100 text-black-700 text-xs font-semibold rounded-full mb-3">${product.category}</span>
                    <div class="flex justify-between items-center">
                        <span class="text-red-600 font-bold text-xl">₱${product.price.toFixed(2)}</span>
                        <button onclick="addToCart(${product.id})" class="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 text-white rounded-xl font-semibold hover:from-black hover:to-black hover:shadow-xl transition-all shadow-lg">
                            Add
                        </button>
                    </div>
                `;
                productGrid.appendChild(productCard);
            });
        }

        // Filter category - SAME LOGIC
        function filterCategory(category) {
            // For demo, just reload all products
            loadProducts();
            
            // Update button states
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.className = 'category-btn px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-200 transition-all';
            });
            event.target.className = 'category-btn px-5 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-lg scale-105 transition-all';
        }

        // Add to cart - SAME LOGIC
        function addToCart(productId) {
            if (!storeOpen) {
                alert('Store is currently closed. Please open the store first before adding items to cart.');
                return;
            }

            // For demo, create product object
            const product = {
                id: productId,
                name: 'Product ' + productId,
                price: 100 + (productId * 10),
                category: 'Category',
                quantity: 1,
                selectedAddons: [],
                selectedUpgrade: null,
                specialInstructions: '',
                finalPrice: 100 + (productId * 10)
            };
            
            // Show addons modal for demo
            showAddonsModal(product);
        }

        // Show addons modal - SIMILAR LOGIC
        function showAddonsModal(product) {
            selectedProduct = product;
            selectedAddons = [];
            selectedUpgrade = null;
            specialInstructions = '';
            
            const modal = document.getElementById('addonsModal');
            const content = document.getElementById('addonsContent');
            
            content.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-3">Add-ons (Sides)</h4>
                        <div class="grid grid-cols-1 gap-2">
                            <button onclick="toggleAddon(1)" class="p-3 bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-red-300 transition-all rounded-xl text-left">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <span class="font-medium">Extra Cheese</span>
                                        <span class="text-sm text-gray-500 ml-2">+₱20.00</span>
                                    </div>
                                    <span class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">✓</span>
                                </div>
                            </button>
                            <button onclick="toggleAddon(2)" class="p-3 bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-red-300 transition-all rounded-xl text-left">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <span class="font-medium">Extra Bacon</span>
                                        <span class="text-sm text-gray-500 ml-2">+₱30.00</span>
                                    </div>
                                    <span class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center"></span>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-3">Special Instructions</h4>
                        <textarea id="specialInstructions" placeholder="Any special requests..." class="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" rows="3"></textarea>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-xl mb-6">
                        <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span class="text-lg font-bold text-gray-800">Total:</span>
                            <span class="text-lg font-bold text-red-600">₱${selectedProduct.price.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <button onclick="confirmAddToCart()" class="flex-1 bg-gradient-to-r from-red-600 to-red-600 text-white py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl">
                            Add to Cart
                        </button>
                        <button onclick="closeAddonsModal()" class="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
            
            modal.classList.add('active');
        }

        function toggleAddon(addonId) {
            // For demo
            const addonBtn = event.target.closest('button');
            const checkSpan = addonBtn.querySelector('span:last-child');
            
            if (checkSpan.textContent === '✓') {
                checkSpan.textContent = '';
                checkSpan.className = 'w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center';
                addonBtn.className = 'p-3 bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-red-300 transition-all rounded-xl text-left';
            } else {
                checkSpan.textContent = '✓';
                checkSpan.className = 'w-5 h-5 rounded-full border-2 border-red-500 bg-red-500 text-white flex items-center justify-center';
                addonBtn.className = 'p-3 bg-red-100 border-2 border-red-500 text-red-700 transition-all rounded-xl text-left';
            }
        }

        function confirmAddToCart() {
            if (!selectedProduct) return;
            
            const specialInstructions = document.getElementById('specialInstructions')?.value || '';
            
            const cartItem = {
                ...selectedProduct,
                quantity: 1,
                selectedAddons: [], // Would be populated from selected addons
                selectedUpgrade: selectedUpgrade,
                specialInstructions: specialInstructions,
                finalPrice: selectedProduct.price
            };
            
            // Check if item already exists in cart
            const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
            
            if (existingItemIndex !== -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push(cartItem);
            }
            
            updateCartDisplay();
            closeAddonsModal();
        }

        function closeAddonsModal() {
            document.getElementById('addonsModal').classList.remove('active');
            selectedProduct = null;
        }

        // Update cart display - SAME LOGIC
        function updateCartDisplay() {
            const cartContainer = document.getElementById('cartContainer');
            const subtotalEl = document.getElementById('subtotal');
            const totalEl = document.getElementById('total');
            const changeEl = document.getElementById('changeAmount');
            const pwdDiscountRow = document.getElementById('pwdDiscountRow');
            const employeeDiscountRow = document.getElementById('employeeDiscountRow');
            const pwdDiscountAmount = document.getElementById('pwdDiscountAmount');
            const employeeDiscountAmount = document.getElementById('employeeDiscountAmount');

            if (cart.length === 0) {
                cartContainer.innerHTML = `
                    <div class="text-center py-12 text-gray-400">
                        <div class="text-5xl mb-3">🛒</div>
                        <p class="text-lg font-semibold text-gray-500">Empty Cart</p>
                        <p class="text-sm mt-1">Add items to get started</p>
                    </div>
                `;
                subtotalEl.textContent = '₱0.00';
                totalEl.textContent = '₱0.00';
                changeEl.textContent = '₱0.00';
                pwdDiscountRow.style.display = 'none';
                employeeDiscountRow.style.display = 'none';
                return;
            }

            let html = '';
            let subtotal = 0;

            cart.forEach((item, index) => {
                const itemTotal = (item.finalPrice || item.price) * item.quantity;
                subtotal += itemTotal;

                html += `
                    <div class="flex justify-between items-center border-b border-gray-100 pb-4 last:border-b-0 hover:bg-red-50 p-3 rounded-xl transition-all">
                        <div class="flex-1">
                            <p class="font-bold text-gray-800">${item.name}</p>
                            <p class="text-sm text-gray-600 mt-0.5">₱${(item.finalPrice || item.price).toFixed(2)} × ${item.quantity}</p>
                            ${item.selectedAddons.length > 0 ? `
                                <p class="text-xs text-gray-500 mt-1">Add-ons: ${item.selectedAddons.map(a => `${a.name} (+₱${a.price})`).join(', ')}</p>
                            ` : ''}
                            ${item.selectedUpgrade ? `
                                <p class="text-xs font-semibold ${item.selectedUpgrade.description_type === 'k-street Flavor' ? 'text-purple-600' : 'text-green-600'}">
                                    ${item.selectedUpgrade.description_type === 'k-street Flavor' ? 'Flavor' : 'Upgrade'}: ${item.selectedUpgrade.name}
                                </p>
                            ` : ''}
                            ${item.specialInstructions ? `
                                <p class="text-xs text-gray-500">Note: ${item.specialInstructions}</p>
                            ` : ''}
                            <p class="text-red-600 font-bold mt-1">₱${itemTotal.toFixed(2)}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="updateQuantity(${index}, -1)" class="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-all font-bold text-lg shadow-sm hover:shadow-md">
                                -
                            </button>
                            <span class="font-bold w-8 text-center text-lg">${item.quantity}</span>
                            <button onclick="updateQuantity(${index}, 1)" class="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-all font-bold text-lg shadow-sm hover:shadow-md">
                                +
                            </button>
                            <button onclick="removeFromCart(${index})" class="w-9 h-9 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-all ml-1 font-bold text-lg shadow-sm hover:shadow-md">
                                ×
                            </button>
                        </div>
                    </div>
                `;
            });

            cartContainer.innerHTML = html;

            // Calculate discounts - SAME LOGIC
            let pwdDiscountValue = 0;
            let employeeDiscountValue = 0;
            let total = subtotal;

            if (pwdDiscount) {
                pwdDiscountValue = subtotal * 0.2;
                total -= pwdDiscountValue;
                pwdDiscountRow.style.display = 'flex';
                pwdDiscountAmount.textContent = `-₱${pwdDiscountValue.toFixed(2)}`;
            } else {
                pwdDiscountRow.style.display = 'none';
            }

            if (employeeDiscount) {
                employeeDiscountValue = subtotal * 0.05;
                total -= employeeDiscountValue;
                employeeDiscountRow.style.display = 'flex';
                employeeDiscountAmount.textContent = `-₱${employeeDiscountValue.toFixed(2)}`;
            } else {
                employeeDiscountRow.style.display = 'none';
            }

            // Calculate change
            const paymentInput = document.getElementById('paymentInput');
            const paymentAmount = parseFloat(paymentInput.value) || 0;
            const change = paymentAmount > 0 ? paymentAmount - total : 0;

            subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
            totalEl.textContent = `₱${total.toFixed(2)}`;
            changeEl.textContent = `₱${change > 0 ? change.toFixed(2) : '0.00'}`;
        }

        // Cart functions - SAME LOGIC
        function updateQuantity(index, change) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            updateCartDisplay();
        }

        function removeFromCart(index) {
            cart.splice(index, 1);
            updateCartDisplay();
        }

        function clearCart() {
            cart = [];
            pwdDiscount = false;
            employeeDiscount = false;
            updateCartDisplay();
            updateDiscountButtons();
            resetPaymentInput();
        }

        // Store toggle - SAME LOGIC
        document.getElementById('storeToggleBtn').addEventListener('click', function() {
            if (!storeOpen) {
                // Simulate checking if user is logged in
                const userData = <?php echo json_encode($user); ?>;
                if (!userData) {
                    alert('Please login first');
                    return;
                }
            }

            storeOpen = !storeOpen;
            this.textContent = storeOpen ? 'OPEN' : 'CLOSED';
            this.style.backgroundColor = storeOpen ? '#ffffff' : '#000000';
            this.style.color = storeOpen ? '#000000' : '#ffffff';

            const actionTime = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            
            document.getElementById('storeActionTime').textContent = actionTime;
            document.getElementById('lastActionTime').textContent = 
                `${storeOpen ? 'Opened' : 'Closed'} at ${actionTime}`;
            
            document.getElementById('storeSuccessModal').classList.add('active');
        });

        function closeStoreModal() {
            document.getElementById('storeSuccessModal').classList.remove('active');
        }

        // Discount functions - SAME LOGIC
        document.getElementById('pwdDiscountBtn').addEventListener('click', function() {
            if (!storeOpen) {
                alert('Store is closed');
                return;
            }
            
            if (employeeDiscount) {
                employeeDiscount = false;
                document.getElementById('employeeDiscountBtn').className = 'w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black hover:shadow-xl';
            }
            
            pwdDiscount = !pwdDiscount;
            this.className = pwdDiscount ? 
                'w-full py-3.5 bg-black text-white rounded-xl font-semibold shadow-lg transition-all' :
                'w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600 hover:shadow-xl';
            
            updateCartDisplay();
        });

        document.getElementById('employeeDiscountBtn').addEventListener('click', function() {
            if (!storeOpen) {
                alert('Store is closed');
                return;
            }
            
            if (pwdDiscount) {
                pwdDiscount = false;
                document.getElementById('pwdDiscountBtn').className = 'w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600 hover:shadow-xl';
            }
            
            employeeDiscount = !employeeDiscount;
            this.className = employeeDiscount ? 
                'w-full py-3.5 bg-black text-white rounded-xl font-semibold shadow-lg transition-all' :
                'w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black hover:shadow-xl';
            
            updateCartDisplay();
        });

        function updateDiscountButtons() {
            document.getElementById('pwdDiscountBtn').className = 'w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600 hover:shadow-xl';
            document.getElementById('employeeDiscountBtn').className = 'w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black hover:shadow-xl';
        }

        // Payment method - SAME LOGIC
        function setPaymentMethod(method) {
            paymentMethod = method;
            document.querySelectorAll('.payment-method-btn').forEach(btn => {
                btn.className = 'payment-method-btn py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-md hover:bg-gray-300 hover:shadow-lg transition-all';
            });
            event.target.className = 'payment-method-btn py-3.5 bg-black text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all';
        }

        // Payment amount - SAME LOGIC
        function addPaymentAmount(amount) {
            if (!storeOpen) {
                alert('Store is closed');
                return;
            }
            document.getElementById('paymentInput').value = amount;
            updateCartDisplay();
        }

        function resetPaymentInput() {
            document.getElementById('paymentInput').value = '';
        }

        // Process payment - SAME LOGIC
        function processPayment() {
            if (!storeOpen) {
                alert('Store is currently closed. Please open the store first before processing payments.');
                return;
            }

            const paymentInput = document.getElementById('paymentInput');
            const amount = parseFloat(paymentInput.value);

            if (!paymentInput.value || amount <= 0 || isNaN(amount)) {
                showPaymentModal('error', 'Please enter a valid payment amount.', 0);
                return;
            }

            // Calculate totals
            let subtotal = 0;
            cart.forEach(item => {
                subtotal += (item.finalPrice || item.price) * item.quantity;
            });

            let total = subtotal;
            if (pwdDiscount) total *= 0.8;
            if (employeeDiscount) total *= 0.95;

            if (amount < total) {
                showPaymentModal('error', `The amount entered is less than the total.`, total);
                return;
            }

            const change = amount - total;
            
            // Show success modal
            document.getElementById('changeResult').textContent = `₱${change.toFixed(2)}`;
            document.getElementById('paymentMessage').textContent = `Payment of ₱${amount.toFixed(2)} received via ${paymentMethod}.`;
            document.getElementById('paymentModal').classList.add('active');
            
            // Generate receipt
            generateReceipt(amount, change);
        }

        function showPaymentModal(type, message, required = 0) {
            const modal = document.getElementById('paymentModal');
            const content = document.getElementById('paymentResultContent');
            
            if (type === 'error') {
                modal.querySelector('.bg-gradient-to-r').className = 'p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-3xl';
                modal.querySelector('h3').textContent = type === 'error' ? 'Payment Failed' : 'Payment Successful!';
                modal.querySelector('.text-7xl').className = type === 'error' ? 'text-7xl mb-4 text-red-500' : 'text-7xl mb-4 text-red-500';
                modal.querySelector('.text-7xl').textContent = type === 'error' ? '⚠' : '✓';
                modal.querySelector('#paymentMessage').textContent = message;
                
                if (type === 'error') {
                    modal.querySelector('.bg-gradient-to-r').innerHTML = `
                        <p class="text-red-800 font-semibold text-lg mb-1">Total Amount Required:</p>
                        <p class="text-red-600 font-bold text-3xl mb-3">₱${required.toFixed(2)}</p>
                        <p class="text-red-600 text-sm">Please enter at least ₱${required.toFixed(2)} to complete the payment.</p>
                    `;
                }
            }
            
            modal.classList.add('active');
        }

        function closePaymentModal() {
            document.getElementById('paymentModal').classList.remove('active');
        }

        // Receipt functions - SAME LOGIC
        function generateReceipt(amountPaid, change) {
            // Calculate totals
            let subtotal = 0;
            cart.forEach(item => {
                subtotal += (item.finalPrice || item.price) * item.quantity;
            });

            let total = subtotal;
            if (pwdDiscount) total *= 0.8;
            if (employeeDiscount) total *= 0.95;

            const userData = <?php echo json_encode($user); ?>;
            const userName = userData.name || userData.username || userData.email || 'N/A';
            const userBranch = userData.branch || 'Main Street';

            let receiptHtml = `
                <div class="text-center">
                    <h3 class="font-bold text-lg mb-2">K - STREET</h3>
                    <p class="text-sm">Mc Arthur Highway, Magaspac</p>
                    <p class="text-sm">Gerona, Tarlac</p>
                    <hr class="my-3">
                    
                    <div class="text-left">
                        <p><strong>Cashier:</strong> ${userName}</p>
                        <p><strong>Branch:</strong> ${userBranch}</p>
                        <p><strong>Order Type:</strong> ${orderType}</p>
                        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                        <hr class="my-3">
                        
                        <p><strong>Items:</strong></p>
            `;
            
            cart.forEach(item => {
                const itemTotal = (item.finalPrice || item.price) * item.quantity;
                receiptHtml += `<p>${item.name} x${item.quantity} ₱${itemTotal.toFixed(2)}</p>`;
            });
            
            receiptHtml += `
                        <hr class="my-3">
                        <p><strong>Subtotal:</strong> ₱${subtotal.toFixed(2)}</p>
            `;
            
            if (pwdDiscount) {
                receiptHtml += `<p><strong>PWD/Senior Discount (20%):</strong> Applied</p>`;
            }
            if (employeeDiscount) {
                receiptHtml += `<p><strong>Employee Discount (5%):</strong> Applied</p>`;
            }
            
            receiptHtml += `
                        <p><strong>Total:</strong> ₱${total.toFixed(2)}</p>
                        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                        <p><strong>Amount Paid:</strong> ₱${amountPaid.toFixed(2)}</p>
                        <p><strong>Change:</strong> ₱${change.toFixed(2)}</p>
                        <hr class="my-3">
                        <p class="text-center font-bold">Thank you for your order!</p>
                    </div>
                </div>
            `;
            
            document.getElementById('receiptContent').innerHTML = receiptHtml;
        }

        function showReceipt() {
            closePaymentModal();
            document.getElementById('receiptModal').classList.add('active');
        }

        function closeReceiptModal() {
            document.getElementById('receiptModal').classList.remove('active');
            clearCart();
        }

        function printReceipt() {
            const printContent = document.getElementById('receiptContent').innerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>K-Street Receipt</title>
                    <style>
                        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    </script>
</body>
</html>