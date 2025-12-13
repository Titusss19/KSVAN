<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
}

$user = $_SESSION['user'];
$activeView = 'sales';
$currentUser = $user;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K-STREET - Sales Reports</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>
    <link rel="stylesheet" href="css/sales.css">
</head>
<body class="bg-gray-50">

<?php include 'components/navbar.php'; ?>

<main class="content-wrapper">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <!-- Header -->
        <div class="flex justify-between items-start mb-8">
            <div class="flex-1">
                <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <i class="fas fa-chart-line text-red-600"></i>
                    Sales Reports
                </h1>
            </div>
            
            <?php if ($user['role'] === 'admin' || $user['role'] === 'owner'): ?>
            <div class="branch-selector">
                <select id="branchFilter" class="form-select-kstreet w-48">
                    <option value="all">All Branches</option>
                    <!-- Branches will be loaded dynamically -->
                </select>
            </div>
            <?php endif; ?>
        </div>

        <!-- Report Tabs -->
        <div class="flex gap-2 mb-6 pb-2 border-b border-gray-200">
            <button class="tab-btn-kstreet active" data-tab="sales">
                <i class="fas fa-shopping-cart"></i>
                Sales Report
            </button>
            <button class="tab-btn-kstreet" data-tab="cashier">
                <i class="fas fa-user-tie"></i>
                Cashier Report
            </button>
            <button class="tab-btn-kstreet" data-tab="void">
                <i class="fas fa-ban"></i>
                Void Reports
                <span class="bg-red-600 text-white text-xs px-2 py-1 rounded-full ml-2" id="voidCount">0</span>
            </button>
        </div>

        <!-- Filter Controls -->
        <div class="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div class="flex flex-wrap gap-4 items-end">
                <!-- Time Range -->
                <div class="w-48">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                    <select id="timeRange" class="form-select-kstreet">
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                <!-- Custom Date Range (hidden by default) -->
                <div id="customDateRange" class="hidden">
                    <div class="flex items-center gap-2">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input type="date" id="startDate" class="form-input-kstreet">
                        </div>
                        <span class="text-gray-500 mt-6">to</span>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input type="date" id="endDate" class="form-input-kstreet">
                        </div>
                    </div>
                </div>

                <!-- Payment Method -->
                <div class="w-48">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select id="paymentFilter" class="form-select-kstreet">
                        <option value="all">All Methods</option>
                        <option value="Cash">Cash</option>
                        <option value="Gcash">GCash</option>
                        <option value="Gcash + Cash">GCash + Cash</option>
                        <option value="Grab">Grab</option>
                    </select>
                </div>

                <!-- Order Type -->
                <div class="w-48">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                    <select id="orderTypeFilter" class="form-select-kstreet">
                        <option value="all">All Types</option>
                        <option value="Dine In">Dine In</option>
                        <option value="Take Out">Take Out</option>
                        <option value="Delivery">Delivery</option>
                    </select>
                </div>

                <!-- Apply Filters Button -->
                <button id="applyFilters" class="btn-kstreet-primary">
                    <i class="fas fa-filter"></i>
                    Apply Filters
                </button>

                <!-- Export Button -->
                <button id="exportExcel" class="btn-kstreet-primary bg-green-600 hover:bg-green-700">
                    <i class="fas fa-file-export"></i>
                    Export Excel
                </button>
            </div>
        </div>

        <!-- Report Content -->
        <div id="reportContent">
            
            <!-- Sales Report Table -->
            <div id="salesReport" class="report-pane">
                <div class="table-kstreet">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-red-500 text-white">
                                <th class="py-4 px-6 text-left text-sm font-semibold tracking-wide">#</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold tracking-wide">Date & Time</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold tracking-wide">Products</th>
                                <th class="py-4 px-6 text-right text-sm font-semibold tracking-wide">Total</th>
                                <th class="py-4 px-6 text-right text-sm font-semibold tracking-wide">Paid</th>
                                <th class="py-4 px-6 text-right text-sm font-semibold tracking-wide">Change</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold tracking-wide">Cashier</th>
                                <th class="py-4 px-6 text-center text-sm font-semibold tracking-wide">Order Type</th>
                                <th class="py-4 px-6 text-center text-sm font-semibold tracking-wide">Payment Method</th>
                                <th class="py-4 px-6 text-center text-sm font-semibold tracking-wide">Action</th>
                            </tr>
                        </thead>
                        <tbody id="salesTableBody">
                            <!-- Sales data will be populated here -->
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div id="salesEmptyState" class="hidden text-center py-16">
                        <i class="fas fa-shopping-cart text-5xl text-gray-300 mb-4"></i>
                        <h4 class="text-lg font-semibold text-gray-700">No sales data found</h4>
                        <p class="text-gray-500">Try adjusting your filters or check back later</p>
                    </div>

                    <!-- Pagination -->
                    <div id="salesPagination" class="pagination-kstreet hidden px-6 py-4">
                        <div class="text-sm text-gray-600">
                            Showing <span id="salesStart">1</span> to <span id="salesEnd">10</span> of <span id="salesTotal">0</span> records
                        </div>
                        <div class="flex gap-2 items-center">
                            <button id="prevPage" class="btn-pagination-kstreet">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span class="font-semibold text-gray-700 px-4">Page <span id="currentPage">1</span></span>
                            <button id="nextPage" class="btn-pagination-kstreet">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cashier Report -->
            <div id="cashierReport" class="report-pane hidden">
                <div class="table-kstreet">
                    <div class="text-center py-16">
                        <i class="fas fa-user-tie text-5xl text-gray-300 mb-4"></i>
                        <h4 class="text-lg font-semibold text-gray-700">Cashier Report</h4>
                        <p class="text-gray-500">This feature is coming soon</p>
                    </div>
                </div>
            </div>

            <!-- Void Report -->
            <div id="voidReport" class="report-pane hidden">
                <div class="table-kstreet">
                    <div class="text-center py-16">
                        <i class="fas fa-ban text-5xl text-gray-300 mb-4"></i>
                        <h4 class="text-lg font-semibold text-gray-700">Void Report</h4>
                        <p class="text-gray-500">This feature is coming soon</p>
                    </div>
                </div>
            </div>
            
        </div>
    </div>

</main>

<!-- ⚠️ MODALS SHOULD BE HERE - OUTSIDE content-wrapper, BEFORE closing </body> -->

<!-- Receipt Modal -->
<div id="receiptModal" class="modal-overlay hidden">
    <div class="modal-content-kstreet max-w-2xl w-full">
        <div class="flex justify-between items-center p-6 border-b">
            <h3 class="text-xl font-bold text-gray-900">Order Receipt</h3>
            <button type="button" class="modal-close">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        <div class="p-6">
            <div class="receipt-kstreet">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">K-STREET</h2>
                    <p class="text-gray-600 text-sm">Mc Arthur Highway, Magaspac, Gerona, Tarlac</p>
                    <div id="voidStamp" class="void-stamp-kstreet inline-block mt-4 hidden">VOIDED</div>
                </div>
                
                <div class="space-y-4">
                    <div class="border-b-2 border-dashed border-gray-300 pb-4">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="font-semibold">Order #:</span>
                            <span id="receiptOrderId">-</span>
                        </div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="font-semibold">Date:</span>
                            <span id="receiptDate">-</span>
                        </div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="font-semibold">Cashier:</span>
                            <span id="receiptCashier">-</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="font-semibold">Payment:</span>
                            <span id="receiptPayment">-</span>
                        </div>
                    </div>
                    
                    <div class="border-b-2 border-dashed border-gray-300 pb-4">
                        <h4 class="font-bold text-gray-900 mb-2">ITEMS:</h4>
                        <div id="receiptItems" class="space-y-2"></div>
                    </div>
                    
                    <div class="space-y-2">
                        <div class="flex justify-between font-bold">
                            <span>Total:</span>
                            <span id="receiptTotal">₱0.00</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Amount Paid:</span>
                            <span id="receiptPaid">₱0.00</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Change:</span>
                            <span id="receiptChange">₱0.00</span>
                        </div>
                    </div>
                    
                    <div id="voidInfo" class="hidden bg-red-50 border border-red-200 p-4 rounded-lg">
                        <h4 class="font-bold text-red-700 mb-2">VOIDED TRANSACTION</h4>
                        <div class="space-y-1 text-sm">
                            <div><span class="font-semibold">Reason:</span> <span id="voidReason">-</span></div>
                            <div><span class="font-semibold">Voided by:</span> <span id="voidedBy">-</span></div>
                            <div><span class="font-semibold">Void date:</span> <span id="voidDate">-</span></div>
                        </div>
                    </div>
                    
                    <div class="text-center pt-4 border-t-2 border-dashed border-gray-300">
                        <p class="text-gray-600" id="receiptFooter">Thank you for your order!</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="p-6 border-t flex justify-end gap-3">
            <button class="btn-kstreet-secondary" id="closeReceipt">Close</button>
            <button class="btn-kstreet-primary" id="printReceipt">
                <i class="fas fa-print"></i> Print
            </button>
            <button class="btn-kstreet-primary bg-red-600 hover:bg-red-700 hidden" id="voidOrderBtn">
                <i class="fas fa-ban"></i> Void Order
            </button>
        </div>
    </div>
</div>

<!-- Void Modal -->
<div id="voidModal" class="modal-overlay hidden">
    <div class="modal-content-kstreet max-w-md w-full">
        <div class="flex justify-between items-center p-6 border-b bg-red-50">
            <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <i class="fas fa-exclamation-triangle text-red-600"></i>
                Void Order
            </h3>
            <button type="button" class="modal-close">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        <div class="p-6">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fas fa-exclamation-circle text-yellow-600"></i>
                    <span class="font-bold text-yellow-800">Warning: This action cannot be undone!</span>
                </div>
                <p class="text-yellow-700 text-sm">This order will be marked as voided and removed from sales calculations.</p>
            </div>
            
            <div id="voidOrderInfo" class="bg-gray-50 p-4 rounded-lg mb-4"></div>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Void Reason *</label>
                <textarea id="voidReasonInput" class="form-input-kstreet w-full" rows="3" placeholder="Enter reason for voiding this order..."></textarea>
            </div>
            
            <div id="pinSection" class="mb-4 hidden">
                <label class="block text-sm font-medium text-gray-700 mb-2">Manager PIN *</label>
                <input type="password" id="managerPin" class="form-input-kstreet w-full" placeholder="Enter manager PIN" maxlength="6">
                <div id="pinError" class="text-red-600 text-sm mt-2 hidden"></div>
            </div>
        </div>
        
        <div class="p-6 border-t flex justify-end gap-3">
            <button class="btn-kstreet-secondary" id="cancelVoid">Cancel</button>
            <button class="btn-kstreet-primary bg-red-600 hover:bg-red-700" id="confirmVoid">
                <i class="fas fa-ban"></i> Confirm Void
            </button>
        </div>
    </div>
</div>

<!-- Notification Modal -->
<div id="notificationModal" class="modal-overlay hidden">
    <div class="modal-content-kstreet" style="max-width: 400px;">
        <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
                <div id="notificationIcon" class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <!-- Icon will be inserted here -->
                </div>
                <div class="flex-1">
                    <h3 id="notificationTitle" class="text-lg font-bold text-gray-900 mb-1">Notification</h3>
                    <p id="notificationMessage" class="text-sm text-gray-600"></p>
                </div>
            </div>
            <div class="flex justify-end">
                <button onclick="salesReport.closeNotification()" class="btn-kstreet-primary px-6 py-2">
                    OK
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Loading Overlay -->
<div id="loadingOverlay" class="fixed inset-0 bg-white bg-opacity-80 hidden items-center justify-center z-50">
    <div class="spinner-kstreet"></div>
</div>

<!-- Pass PHP session data to JavaScript -->
<script>
    window.currentUser = <?php echo json_encode($user); ?>;
</script>

<script src="Javascript/sales.js"></script>

</body>
</html>
