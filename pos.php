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
<body class="bg-gray-50 overflow-x-hidden">
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
    
    <?php include 'components/navbar.php'; ?>

    <main class="content-wrapper px-2 sm:px-4 md:px-6 py-4 md:py-6">
        <div class="max-w-7xl mx-auto">
            <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
                <!-- Red Header -->
                <div class="bg-gradient-to-r from-red-600 to-red-500 text-white p-4 md:p-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                        <div class="flex-1">
                            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Cashier POS System</h1>
                            <p class="text-red-100 mt-1 md:mt-2 text-xs sm:text-sm font-medium" id="currentDateTime"></p>
                            <div class="mt-2 md:mt-3 flex flex-wrap items-center gap-2 md:gap-3">
                                <span class="text-red-100 text-xs sm:text-sm font-medium">Store Status:</span>
                                <button id="storeToggleBtn" class="px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg bg-white text-black hover:bg-red-50">
                                    OPEN
                                </button>
                                <span class="text-red-100 text-xs sm:text-sm hidden md:inline-block" id="lastActionTime"></span>
                                <span class="text-red-100 text-xs sm:text-sm">Branch: <?php echo htmlspecialchars($user['branch'] ?? 'main'); ?></span>
                            </div>
                        </div>
                        <div class="flex gap-2 md:gap-3 mt-2 md:mt-0">
                            <button id="dineInBtn" class="px-4 py-2 md:px-8 md:py-3 rounded-xl font-semibold transition-all shadow-lg bg-black text-white shadow-xl scale-105 text-xs sm:text-sm md:text-base">
                                Dine In
                            </button>
                            <button id="takeOutBtn" class="px-4 py-2 md:px-8 md:py-3 rounded-xl font-semibold transition-all shadow-lg bg-white text-black text-xs sm:text-sm md:text-base">
                                Take-Out
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex flex-col lg:flex-row">
                    <!-- Left Panel - Products -->
                    <div class="lg:w-2/3 p-4 md:p-6 border-r border-gray-200">
                        <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
                            Product Catalog (<?php echo htmlspecialchars($user['branch'] ?? 'main'); ?> Branch)
                        </h2>

              <!-- Search and Filter -->
<div class="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
    <!-- Search bar -->
    <div class="flex-1">
        <input type="text" placeholder="Search products..." id="searchInput" 
               class="w-full px-3 py-2 md:px-5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm md:text-base">
    </div>
    
    <!-- Categories - LIMITED WIDTH para mag-wrap after 4 -->
    <div class="md:w-2/3 flex flex-wrap gap-1 md:gap-2 content-start items-start" id="categoryButtons">
        <!-- All categories - magw-wrap after 4 kasi limited width -->
    </div>
</div>
                        <!-- Product Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5" id="productGrid">
                            <!-- Products will be loaded via JavaScript -->
                            <div class="text-center py-8 md:py-12 text-gray-400 col-span-full">
                                <div class="text-3xl md:text-4xl mb-2 md:mb-3">🛒</div>
                                <p class="text-base md:text-lg font-semibold text-gray-500">Loading products...</p>
                            </div>
                        </div>
                        
                        <!-- Pagination Container -->
                        <div id="paginationContainer" class="mt-4 md:mt-6 flex justify-center" style="display: none;">
                            <!-- Pagination will be loaded dynamically -->
                        </div>
                    </div>

                    <!-- Right Panel - Order -->
                    <div class="lg:w-1/3 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-0 mb-4 md:mb-6">
                            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Current Order</h2>
                            <button onclick="clearCart()" class="px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all text-xs sm:text-sm mt-1 sm:mt-0">
                                Clear All
                            </button>
                        </div>

                        <!-- Discount Buttons -->
                        <div class="mb-3 md:mb-4 grid grid-cols-2 gap-2 md:gap-3">
                            <button id="pwdDiscountBtn" onclick="togglePWDDiscount()" class="w-full py-2.5 md:py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600 text-xs md:text-sm">
                                PWD/Senior 20%
                            </button>
                            <button id="employeeDiscountBtn" onclick="toggleEmployeeDiscount()" class="w-full py-2.5 md:py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black text-xs md:text-sm">
                                Employee 5%
                            </button>
                        </div>

                        <!-- Cart Items -->
                        <div class="mb-4 md:mb-6 max-h-64 md:max-h-80 overflow-y-auto border-2 border-gray-200 rounded-2xl bg-white shadow-inner">
                            <div id="cartContainer" class="p-3 md:p-4 space-y-2 md:space-y-4">
                                <!-- Empty Cart State -->
                                <div class="text-center py-8 md:py-12 text-gray-400">
                                    <div class="text-3xl md:text-5xl mb-2 md:mb-3">🛒</div>
                                    <p class="text-base md:text-lg font-semibold text-gray-500">Empty Cart</p>
                                    <p class="text-xs md:text-sm mt-1">Add items to get started</p>
                                </div>
                            </div>
                        </div>

                        <!-- Totals Section -->
                        <div class="border-t-2 border-gray-200 pt-4 md:pt-6">
                            <div class="space-y-2 md:space-y-3 mb-4 md:mb-6">
                                <div class="flex justify-between text-gray-700 text-sm md:text-base">
                                    <span class="font-medium">Subtotal</span>
                                    <span id="subtotal" class="font-semibold">₱0.00</span>
                                </div>
                                <div class="flex justify-between text-amber-600 font-bold bg-amber-50 p-1.5 md:p-2 rounded-lg text-xs md:text-sm" id="pwdDiscountRow" style="display: none;">
                                    <span>PWD/Senior Discount (20%)</span>
                                    <span id="pwdDiscountAmount">-₱0.00</span>
                                </div>
                                <div class="flex justify-between text-blue-600 font-bold bg-blue-50 p-1.5 md:p-2 rounded-lg text-xs md:text-sm" id="employeeDiscountRow" style="display: none;">
                                    <span>Employee Discount (5%)</span>
                                    <span id="employeeDiscountAmount">-₱0.00</span>
                                </div>
                                <div class="flex justify-between font-bold border-gray-200 pt-3 md:pt-4 text-gray-900 text-sm md:text-base">
                                    <span>Change</span>
                                    <span id="changeAmount" class="font-semibold text-green-600">₱0.00</span>
                                </div>
                                <div class="flex justify-between font-bold border-gray-200 pt-3 md:pt-4 text-gray-900 text-lg md:text-xl">
                                    <span>Total</span>
                                    <span id="total" class="text-red-600">₱0.00</span>
                                </div>
                            </div>

                            <!-- Payment Method -->
                            <h1 class="text-black font-bold text-base md:text-lg mb-1 md:mb-2">Payment Method</h1>
                            <div class="space-y-3 md:space-y-4">
                                <div class="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-5">
                                    <button onclick="setPaymentMethod('Cash')" class="payment-method-btn py-2.5 md:py-3.5 bg-black text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-xs md:text-sm">
                                        Cash
                                    </button>
                                    <button onclick="setPaymentMethod('Gcash')" class="payment-method-btn py-2.5 md:py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-md hover:bg-gray-300 hover:shadow-lg transition-all text-xs md:text-sm">
                                        Gcash
                                    </button>
                                    <button onclick="setPaymentMethod('Gcash + Cash')" class="payment-method-btn py-2.5 md:py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-md hover:bg-gray-300 hover:shadow-lg transition-all text-xs md:text-sm">
                                        Gcash + Cash
                                    </button>
                                    <button onclick="setPaymentMethod('Grab')" class="payment-method-btn py-2.5 md:py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold shadow-md hover:bg-gray-300 hover:shadow-lg transition-all text-xs md:text-sm">
                                        Grab
                                    </button>
                                </div>
                            </div>

                            <!-- Payment Amount -->
                            <h1 class="text-black font-bold text-base md:text-lg mb-1 md:mb-2">Payment Amount</h1>
                            <div class="space-y-3 md:space-y-4">
                                <div class="grid grid-cols-3 gap-2 md:gap-3">
                                    <button id="exactAmountBtn" onclick="setPaymentExact()" class="py-2.5 md:py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-xs md:text-sm">
                                        Exact Amount
                                    </button>
                                    <button onclick="setPaymentAmount(500)" class="py-2.5 md:py-3.5 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 hover:shadow-lg transition-all text-xs md:text-sm">
                                        ₱500
                                    </button>
                                    <button onclick="setPaymentAmount(1000)" class="py-2.5 md:py-3.5 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 hover:shadow-lg transition-all text-xs md:text-sm">
                                        ₱1000
                                    </button>
                                </div>

                                <div>
                                    <label class="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Enter Payment Amount</label>
                                    <input type="number" id="paymentInput" placeholder="0.00" oninput="updateChangeAmount()"
                                           class="w-full px-3 py-2 md:px-5 md:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-base md:text-lg font-semibold transition-all">
                                </div>

                                <button onclick="processPayment()" id="processPaymentBtn" class="w-full bg-red-500 text-white py-3 md:py-5 rounded-xl font-bold text-base md:text-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl disabled:bg-gray-300 disabled:cursor-not-allowed">
                                    Process Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Store Success Modal -->
    <div id="storeSuccessModal" class="modal">
        <div class="modal-content">
            <div id="storeModalHeader" class="p-4 md:p-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl">
                <h3 class="text-xl md:text-2xl font-bold" id="storeModalTitle">Store Opened Successfully!</h3>
                <p class="opacity-90 mt-1 text-sm md:text-base" id="storeModalSubtitle">Welcome to K-Street POS</p>
            </div>

            <div class="p-4 md:p-6">
                <div class="text-center mb-4 md:mb-6">
                    <div class="text-5xl md:text-7xl mb-3 md:mb-4" id="storeModalIcon">✓</div>
                    <p class="text-gray-700 text-base md:text-lg font-medium mb-3 md:mb-4" id="storeModalMessage">Your store is now open for business!</p>
                    
                    <div class="border-2 rounded-2xl p-3 md:p-5 mt-3 md:mt-4" id="storeModalTimeBox">
                        <p class="font-semibold text-base md:text-lg mb-1" id="storeModalTimeLabel">Store Opened At:</p>
                        <p class="font-bold text-2xl md:text-3xl" id="storeActionTime">Loading...</p>
                    </div>
                </div>

                <div class="flex gap-2 md:gap-3">
                    <button onclick="closeStoreModal()" class="flex-1 py-2.5 md:py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl text-sm md:text-base" id="storeModalBtn">
                        Start Selling!
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Addons Modal -->
    <div id="addonsModal" class="modal">
        <div class="modal-content" style="max-width: 600px; max-height: 90vh;">
            <div class="p-4 md:p-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl sticky top-0 z-10">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-xl md:text-2xl font-bold">Customize Your Order</h3>
                        <p class="text-red-100 mt-1 text-sm md:text-base" id="addonsProductName">Product Name</p>
                        <p class="text-red-100 text-xs md:text-sm" id="addonsProductCode">Product Code: XXX</p>
                    </div>
                    <button onclick="closeAddonsModal()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all text-2xl md:text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-4 md:p-6 overflow-y-auto" style="max-height: calc(90vh - 140px);">
                <div id="addonsContent">
                    <!-- Addons content loaded by JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <!-- Payment Modal -->
    <div id="paymentModal" class="modal">
        <div class="modal-content">
            <div class="p-4 md:p-6 bg-gradient-to-r from-red-500 to-red-500 text-white rounded-t-3xl" id="paymentModalHeader">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl md:text-2xl font-bold text-white" id="paymentModalTitle">Payment Result</h3>
                    <button onclick="closePaymentModal()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all text-2xl md:text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-4 md:p-6">
                <div class="text-center mb-4 md:mb-6">
                    <div class="text-5xl md:text-7xl mb-3 md:mb-4 text-red-500" id="paymentModalIcon">✓</div>
                    <p class="text-gray-700 text-base md:text-lg font-medium mb-3 md:mb-4" id="paymentMessage">Payment processed successfully!</p>
                    
                    <div class="rounded-2xl p-3 md:p-5 mt-3 md:mt-4" id="paymentResultBox">
                        <p class="font-semibold text-base md:text-lg mb-1" id="paymentResultLabel">Change:</p>
                        <p class="font-bold text-2xl md:text-4xl" id="changeResult">₱0.00</p>
                    </div>
                </div>

                <div class="flex gap-2 md:gap-3" id="paymentModalButtons">
                    <button onclick="showReceipt()" class="flex-1 py-2.5 md:py-3.5 bg-gradient-to-r from-red-500 to-red-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl text-sm md:text-base">
                        View Receipt
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Receipt Modal -->
    <div id="receiptModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
            <div class="p-4 md:p-5 bg-gradient-to-r from-red-600 to-red-600 text-white rounded-t-3xl flex justify-between items-center">
                <h3 class="text-xl md:text-2xl font-bold">Receipt</h3>
                <button onclick="closeReceiptModal()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all text-2xl md:text-3xl font-bold">
                    ×
                </button>
            </div>

            <div class="p-4 md:p-6 max-h-64 md:max-h-96 overflow-y-auto">
                <div id="receiptContent" class="text-center font-mono text-xs md:text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 md:p-4 rounded-lg" style="white-space: pre-wrap;">
                    <!-- Receipt content will be shown here -->
                </div>
            </div>

            <div class="p-4 md:p-5 flex flex-col sm:flex-row gap-2 md:gap-3 border-t-2 border-gray-100">
                <button onclick="printReceipt()" class="flex-1 bg-gradient-to-r from-red-600 to-red-600 text-white py-2.5 md:py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl text-sm md:text-base mb-1 sm:mb-0">
                    Print
                </button>
                <button onclick="saveReceiptAsPNG()" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 md:py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl text-sm md:text-base mb-1 sm:mb-0">
                    Save PNG
                </button>
                <button onclick="closeReceiptModal()" class="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2.5 md:py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl text-sm md:text-base">
                    Close
                </button>
            </div>
        </div>
    </div>

    <!-- Load External JavaScript -->
    <script>
        // Pass PHP user data to JavaScript
        const currentUser = <?php echo json_encode($user); ?>;
        console.log('Current user loaded:', currentUser);
    </script>
    <script src="Javascript/pos.js"></script>
</body>
</html>