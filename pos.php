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

     <main class="content-wrapper">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Red Header -->
            <div class="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="flex-1">
                        <h1 class="text-3xl font-bold tracking-tight">Cashier POS System</h1>
                        <p class="text-red-100 mt-2 text-sm font-medium" id="currentDateTime"></p>
                        <div class="mt-3 flex items-center gap-3">
                            <span class="text-red-100 text-sm font-medium">Store Status:</span>
                            <button id="storeToggleBtn" class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-lg bg-white text-black hover:bg-red-50">
                                OPEN
                            </button>
                            <span class="text-red-100 text-sm" id="lastActionTime"></span>
                            <span class="text-red-100 text-sm">Branch: <?php echo htmlspecialchars($user['branch'] ?? 'main'); ?></span>
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
                        Product Catalog (<?php echo htmlspecialchars($user['branch'] ?? 'main'); ?> Branch)
                    </h2>

                    <!-- Search and Filter -->
                    <div class="flex flex-col md:flex-row gap-4 mb-6">
                        <div class="flex-1">
                            <input type="text" placeholder="Search products..." id="searchInput" 
                                   class="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                        </div>
                        <div class="flex gap-2 overflow-x-auto pb-2" id="categoryButtons">
                            <!-- Categories will be loaded dynamically -->
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
                    
                    <!-- Pagination Container (initially hidden) -->
                    <div id="paginationContainer" class="mt-6 flex justify-center" style="display: none;">
                        <!-- Pagination will be loaded dynamically -->
                    </div>
                </div>

                <!-- Right Panel - Order (1/3 width) -->
                <div class="lg:w-1/3 p-6 bg-gradient-to-br from-gray-50 to-white">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Current Order</h2>
                        <button onclick="clearCart()" class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all">
                            Clear All
                        </button>
                    </div>

                    <!-- Discount Buttons -->
                    <div class="mb-4 grid grid-cols-2 gap-3">
                        <button id="pwdDiscountBtn" onclick="togglePWDDiscount()" class="w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-black to-black hover:from-red-600 hover:to-red-600">
                            PWD/Senior 20%
                        </button>
                        <button id="employeeDiscountBtn" onclick="toggleEmployeeDiscount()" class="w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-600 to-red-600 hover:from-black hover:to-black">
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
           <!-- Palitan ang current ₱100 button sa loob ng Payment Amount section -->
            <div class="grid grid-cols-3 gap-3">
    <!-- EXACT AMOUNT BUTTON - BAGO -->
             <button id="exactAmountBtn" onclick="setPaymentExact()" class="py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
             Exact Amount
             </button>
                 <button   button onclick="setPaymentAmount(500)" class="py-3.5 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 hover:shadow-lg transition-all">
                 ₱500
             </button>
             <button onclick="setPaymentAmount(1000)" class="py-3.5 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 hover:shadow-lg transition-all">
              ₱1000
              </button>
            </div>

                            <div>
                                <label class="block text-sm font-bold text-gray-700 mb-2">Enter Payment Amount</label>
                                <input type="number" id="paymentInput" placeholder="0.00" oninput="updateChangeAmount()"
                                       class="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold transition-all">
                            </div>

                            <button onclick="processPayment()" id="processPaymentBtn" class="w-full bg-red-500 text-white py-5 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl disabled:bg-gray-300 disabled:cursor-not-allowed">
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
            <div id="storeModalHeader" class="p-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl">
                <h3 class="text-2xl font-bold" id="storeModalTitle">Store Opened Successfully!</h3>
                <p class="opacity-90 mt-1" id="storeModalSubtitle">Welcome to K-Street POS</p>
            </div>

            <div class="p-6">
                <div class="text-center mb-6">
                    <div class="text-7xl mb-4" id="storeModalIcon">✓</div>
                    <p class="text-gray-700 text-lg font-medium mb-4" id="storeModalMessage">Your store is now open for business!</p>
                    
                    <div class="border-2 rounded-2xl p-5 mt-4" id="storeModalTimeBox">
                        <p class="font-semibold text-lg mb-1" id="storeModalTimeLabel">Store Opened At:</p>
                        <p class="font-bold text-3xl" id="storeActionTime">Loading...</p>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="closeStoreModal()" class="flex-1 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl" id="storeModalBtn">
                        Start Selling!
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Addons Modal -->
    <div id="addonsModal" class="modal">
        <div class="modal-content" style="max-width: 600px; max-height: 90vh;">
            <div class="p-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl sticky top-0 z-10">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-2xl font-bold">Customize Your Order</h3>
                        <p class="text-red-100 mt-1" id="addonsProductName">Product Name</p>
                        <p class="text-red-100 text-sm" id="addonsProductCode">Product Code: XXX</p>
                    </div>
                    <button onclick="closeAddonsModal()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 200px);">
                <div id="addonsContent">
                    <!-- Addons content loaded by JavaScript -->
                </div>
            </div>
        </div>
    </div>

    <!-- Payment Modal -->
    <div id="paymentModal" class="modal">
        <div class="modal-content">
            <div class="p-6 bg-gradient-to-r from-red-500 to-red-500 text-white rounded-t-3xl" id="paymentModalHeader">
                <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-bold text-white" id="paymentModalTitle">Payment Result</h3>
                    <button onclick="closePaymentModal()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <div class="text-center mb-6">
                    <div class="text-7xl mb-4 text-red-500" id="paymentModalIcon">✓</div>
                    <p class="text-gray-700 text-lg font-medium mb-4" id="paymentMessage">Payment processed successfully!</p>
                    
                    <div class="rounded-2xl p-5 mt-4" id="paymentResultBox">
                        <p class="font-semibold text-lg mb-1" id="paymentResultLabel">Change:</p>
                        <p class="font-bold text-4xl" id="changeResult">₱0.00</p>
                    </div>
                </div>

                <div class="flex gap-3" id="paymentModalButtons">
                    <button onclick="showReceipt()" class="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-red-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl">
                        View Receipt
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Receipt Modal -->
    <div id="receiptModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
            <div class="p-5 bg-gradient-to-r from-red-600 to-red-600 text-white rounded-t-3xl flex justify-between items-center">
                <h3 class="text-2xl font-bold">Receipt</h3>
                <button onclick="closeReceiptModal()" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-3xl font-bold">
                    ×
                </button>
            </div>

            <div class="p-6 max-h-96 overflow-y-auto">
                <div id="receiptContent" class="text-center font-mono text-sm text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg" style="white-space: pre-wrap;">
                    <!-- Receipt content will be shown here -->
                </div>
            </div>

            <div class="p-5 flex gap-3 border-t-2 border-gray-100">
                <button onclick="printReceipt()" class="flex-1 bg-gradient-to-r from-red-600 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl">
                    Print
                </button>
                <button onclick="saveReceiptAsPNG()" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
                    Save PNG
                </button>
                <button onclick="closeReceiptModal()" class="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl">
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