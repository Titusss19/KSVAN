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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <link rel="stylesheet" href="css/sales.css">
 
</head>
<body class="bg-gray-50">

<?php include 'components/navbar.php'; ?>
   

    <!-- Main Content -->
    <div class="pt-20 px-6 max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-start mb-8">
            <div class="flex-1">
                <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <i class="fas fa-chart-line text-red-600"></i>
                    Sales Reports
                </h1>
               
            </div>
            
            <div class="branch-selector">
                <select id="branchFilter" class="form-select-kstreet w-48">
                    <option value="all">All Branches</option>
                    <option value="main">Main Branch</option>
                    <option value="north">North Branch</option>
                    <option value="south">South Branch</option>
                </select>
            </div>
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
                        <option value="cash">Cash</option>
                        <option value="card">Credit Card</option>
                        <option value="gcash">GCash</option>
                        <option value="maya">Maya</option>
                    </select>
                </div>

                <!-- Order Type -->
                <div class="w-48">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                    <select id="orderTypeFilter" class="form-select-kstreet">
                        <option value="all">All Types</option>
                        <option value="dine-in">Dine-in</option>
                        <option value="takeout">Takeout</option>
                        <option value="delivery">Delivery</option>
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
            <!-- Sales Report (Active by default) -->
            <div id="salesReport" class="report-pane">
                <div class="table-kstreet">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Order ID</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Customer</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Products</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Cashier</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
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
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Cashier</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Branch</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Session Time</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Total Sales</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Transactions</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Cash Deposited</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Discrepancy</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="cashierTableBody">
                            <!-- Cashier data will be populated here -->
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div id="cashierEmptyState" class="hidden text-center py-16">
                        <i class="fas fa-user-tie text-5xl text-gray-300 mb-4"></i>
                        <h4 class="text-lg font-semibold text-gray-700">No cashier data found</h4>
                        <p class="text-gray-500">Try adjusting your filters or check back later</p>
                    </div>
                </div>
            </div>

            <!-- Void Report -->
            <div id="voidReport" class="report-pane hidden">
                <div class="table-kstreet">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Order ID</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Original Date</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Void Date</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Original Amount</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Reason</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Voided By</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Cashier</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="voidTableBody">
                            <!-- Void data will be populated here -->
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div id="voidEmptyState" class="hidden text-center py-16">
                        <i class="fas fa-ban text-5xl text-gray-300 mb-4"></i>
                        <h4 class="text-lg font-semibold text-gray-700">No voided transactions</h4>
                        <p class="text-gray-500">All transactions are valid</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    
    <!-- Receipt Modal -->
    <div id="receiptModal" class="fixed inset-0 modal-overlay hidden items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-2xl w-full modal-show">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-bold text-gray-900">Order Receipt</h3>
                <button class="modal-close text-2xl text-gray-500 hover:text-gray-700">
                    &times;
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
                                <span id="receiptOrderId">1001</span>
                            </div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="font-semibold">Date:</span>
                                <span id="receiptDate">Nov 15, 2024 14:30</span>
                            </div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="font-semibold">Cashier:</span>
                                <span id="receiptCashier">Maria Santos</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="font-semibold">Payment:</span>
                                <span id="receiptPayment" class="payment-method-badge cash">Cash</span>
                            </div>
                        </div>
                        
                        <!-- Items -->
                        <div class="border-b-2 border-dashed border-gray-300 pb-4">
                            <h4 class="font-bold text-gray-900 mb-2">ITEMS:</h4>
                            <div id="receiptItems" class="space-y-2">
                                <!-- Items will be populated here -->
                            </div>
                        </div>
                        
                        <!-- Totals -->
                        <div class="space-y-2">
                            <div class="flex justify-between font-bold">
                                <span>Total:</span>
                                <span id="receiptTotal">₱460.00</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span>Amount Paid:</span>
                                <span id="receiptPaid">₱500.00</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span>Change:</span>
                                <span id="receiptChange">₱40.00</span>
                            </div>
                        </div>
                        
                        <!-- Void Info (hidden by default) -->
                        <div id="voidInfo" class="hidden bg-red-50 border border-red-200 p-4 rounded-lg">
                            <h4 class="font-bold text-red-700 mb-2">VOIDED TRANSACTION</h4>
                            <div class="space-y-1 text-sm">
                                <div><span class="font-semibold">Reason:</span> <span id="voidReason">Customer cancellation</span></div>
                                <div><span class="font-semibold">Voided by:</span> <span id="voidedBy">Admin</span></div>
                                <div><span class="font-semibold">Void date:</span> <span id="voidDate">Nov 15, 2024 15:00</span></div>
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
    <div id="voidModal" class="fixed inset-0 modal-overlay hidden items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-md w-full modal-show">
            <div class="flex justify-between items-center p-6 border-b bg-red-50">
                <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                    Void Order
                </h3>
                <button class="modal-close text-2xl text-gray-500 hover:text-gray-700">
                    &times;
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
                
                <!-- Order Info -->
                <div id="voidOrderInfo" class="bg-gray-50 p-4 rounded-lg mb-4">
                    <!-- Order details will be populated here -->
                </div>
                
                <!-- Reason Input -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Void Reason *</label>
                    <textarea id="voidReasonInput" class="form-input-kstreet w-full" rows="3" placeholder="Enter reason for voiding this order..."></textarea>
                </div>
                
                <!-- PIN Input (for cashiers) -->
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

    <!-- Cashier Details Modal -->
    <div id="cashierModal" class="fixed inset-0 modal-overlay hidden items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-4xl w-full modal-show">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-bold text-gray-900">Cashier Session Details</h3>
                <button class="modal-close text-2xl text-gray-500 hover:text-gray-700">
                    &times;
                </button>
            </div>
            
            <div class="p-6">
                <div id="cashierDetails">
                    <!-- Cashier details will be populated here -->
                </div>
            </div>
            
            <div class="p-6 border-t flex justify-end gap-3">
                <button class="btn-kstreet-secondary" id="closeCashier">Close</button>
                <button class="btn-kstreet-primary bg-green-600 hover:bg-green-700" id="exportCashier">
                    <i class="fas fa-file-excel"></i> Export to Excel
                </button>
                <button class="btn-kstreet-primary" id="printCashier">
                    <i class="fas fa-print"></i> Print Report
                </button>
            </div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="fixed inset-0 bg-white bg-opacity-80 hidden items-center justify-center z-50">
        <div class="spinner-kstreet"></div>
    </div>

    <script>
        // Mock data for demonstration
        const mockSalesData = [
            {
                id: 1001,
                created_at: new Date().toISOString(),
                customer_name: 'Juan Dela Cruz',
                items: JSON.stringify([
                    { name: 'Burger Meal', quantity: 2, price: 150 },
                    { name: 'Fries', quantity: 1, price: 80 },
                    { name: 'Coke', quantity: 2, price: 40 }
                ]),
                total_amount: 460,
                subtotal: 460,
                tax: 55.2,
                discount: 0,
                paid_amount: 500,
                change_amount: 40,
                payment_method: 'cash',
                cashier_name: 'Maria Santos',
                order_type: 'dine-in',
                branch: 'main',
                is_voided: false
            },
            {
                id: 1002,
                created_at: new Date(Date.now() - 86400000).toISOString(),
                customer_name: null,
                items: JSON.stringify([
                    { name: 'Spaghetti', quantity: 1, price: 120 },
                    { name: 'Garlic Bread', quantity: 1, price: 60 }
                ]),
                total_amount: 180,
                subtotal: 180,
                tax: 21.6,
                discount: 0,
                paid_amount: 200,
                change_amount: 20,
                payment_method: 'gcash',
                cashier_name: 'John Doe',
                order_type: 'takeout',
                branch: 'north',
                is_voided: false
            },
            {
                id: 1003,
                created_at: new Date(Date.now() - 172800000).toISOString(),
                customer_name: 'Ana Reyes',
                items: JSON.stringify([
                    { name: 'Pizza Family', quantity: 1, price: 450 },
                    { name: 'Chicken Wings', quantity: 2, price: 180 }
                ]),
                total_amount: 810,
                subtotal: 810,
                tax: 97.2,
                discount: 50,
                paid_amount: 1000,
                change_amount: 190,
                payment_method: 'card',
                cashier_name: 'Maria Santos',
                order_type: 'delivery',
                branch: 'main',
                is_voided: true,
                void_reason: 'Wrong order',
                voided_by: 'John Doe',
                voided_at: new Date(Date.now() - 172700000).toISOString()
            }
        ];

        const mockCashierLogs = [
            {
                id: 1,
                cashier_name: 'Maria Santos',
                branch: 'main',
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 28800000).toISOString(),
                total_sales: 12560.50,
                total_transactions: 42,
                cash_in_drawer: 15000,
                cash_deposited: 12560.50,
                discrepancy: 0
            },
            {
                id: 2,
                cashier_name: 'John Doe',
                branch: 'north',
                start_time: new Date(Date.now() - 86400000).toISOString(),
                end_time: new Date(Date.now() - 57600000).toISOString(),
                total_sales: 8560.75,
                total_transactions: 28,
                cash_in_drawer: 9000,
                cash_deposited: 8560.75,
                discrepancy: 0
            }
        ];

        class SalesReports {
            constructor() {
                this.currentReport = 'sales';
                this.currentPage = 1;
                this.itemsPerPage = 10;
                this.salesData = mockSalesData;
                this.cashierLogs = mockCashierLogs;
                this.orderToVoid = null;
                this.user = JSON.parse(localStorage.getItem('user')) || {
                    name: 'John Doe',
                    role: 'manager',
                    email: 'john@kstreet.com'
                };

                this.init();
            }

            init() {
                this.bindEvents();
                this.renderSalesTable();
                this.updateVoidCount();
            }

            bindEvents() {
                // Tab switching
                document.querySelectorAll('.tab-btn-kstreet').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.tab-btn-kstreet').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        
                        this.currentReport = e.currentTarget.dataset.tab;
                        this.currentPage = 1;
                        
                        document.querySelectorAll('.report-pane').forEach(p => p.classList.add('hidden'));
                        document.getElementById(`${this.currentReport}Report`).classList.remove('hidden');
                        
                        this.renderCurrentReport();
                    });
                });

                // Time range change
                document.getElementById('timeRange').addEventListener('change', (e) => {
                    const customRange = document.getElementById('customDateRange');
                    customRange.style.display = e.target.value === 'custom' ? 'block' : 'none';
                });

                // Apply filters
                document.getElementById('applyFilters').addEventListener('click', () => {
                    this.currentPage = 1;
                    this.renderCurrentReport();
                });

                // Export to Excel
                document.getElementById('exportExcel').addEventListener('click', () => this.exportToExcel());

                // Modal close buttons
                document.querySelectorAll('.modal-close').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const modal = e.target.closest('.modal-overlay');
                        modal.classList.add('hidden');
                    });
                });

                // Receipt modal actions
                document.getElementById('closeReceipt').addEventListener('click', () => {
                    document.getElementById('receiptModal').classList.add('hidden');
                });

                document.getElementById('printReceipt').addEventListener('click', () => this.printReceipt());

                // Void modal actions
                document.getElementById('cancelVoid').addEventListener('click', () => {
                    document.getElementById('voidModal').classList.add('hidden');
                });

                document.getElementById('confirmVoid').addEventListener('click', () => this.confirmVoid());

                // Cashier modal actions
                document.getElementById('closeCashier').addEventListener('click', () => {
                    document.getElementById('cashierModal').classList.add('hidden');
                });

                // Pagination
                document.getElementById('prevPage').addEventListener('click', () => this.prevPage());
                document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
            }

            renderCurrentReport() {
                switch(this.currentReport) {
                    case 'sales':
                        this.renderSalesTable();
                        break;
                    case 'cashier':
                        this.renderCashierTable();
                        break;
                    case 'void':
                        this.renderVoidTable();
                        break;
                }
            }

            renderSalesTable() {
                const filteredSales = this.getFilteredSales();
                const paginatedData = this.getPaginatedData(filteredSales);
                const tableBody = document.getElementById('salesTableBody');
                const emptyState = document.getElementById('salesEmptyState');
                const pagination = document.getElementById('salesPagination');

                if (filteredSales.length === 0) {
                    tableBody.innerHTML = '';
                    emptyState.classList.remove('hidden');
                    pagination.classList.add('hidden');
                    return;
                }

                emptyState.classList.add('hidden');
                pagination.classList.remove('hidden');

                // Update pagination info
                document.getElementById('salesStart').textContent = this.getStartIndex();
                document.getElementById('salesEnd').textContent = this.getEndIndex(filteredSales);
                document.getElementById('salesTotal').textContent = filteredSales.length;
                document.getElementById('currentPage').textContent = this.currentPage;

                // Update pagination button states
                document.getElementById('prevPage').disabled = this.currentPage === 1;
                document.getElementById('nextPage').disabled = this.isLastPage(filteredSales);

                // Render table rows
                tableBody.innerHTML = paginatedData.map(order => `
                    <tr class="hover:bg-gray-50">
                        <td class="py-4 px-6">
                            <span class="font-semibold text-gray-900">#${order.id}</span>
                            ${order.is_voided ? '<span class="badge-void-kstreet">VOIDED</span>' : ''}
                        </td>
                        <td class="py-4 px-6 text-gray-600">${this.formatDateTime(order.created_at)}</td>
                        <td class="py-4 px-6 text-gray-600">${order.customer_name || 'Walk-in'}</td>
                        <td class="py-4 px-6 text-gray-600 max-w-xs">
                            <div class="truncate" title="${this.getProductNames(order.items).join(', ')}">
                                ${this.getProductNames(order.items).slice(0, 2).join(', ')}
                                ${this.getProductNames(order.items).length > 2 ? '...' : ''}
                            </div>
                        </td>
                        <td class="py-4 px-6 font-semibold text-gray-900">₱${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td class="py-4 px-6">
                            <span class="payment-method-badge ${order.payment_method}">
                                ${order.payment_method}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-gray-600">${order.cashier_name}</td>
                        <td class="py-4 px-6">
                            <div class="flex gap-2">
                                <button class="btn-icon btn-view" onclick="salesSystem.viewReceipt(${order.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${!order.is_voided ? `
                                <button class="btn-icon btn-void" onclick="salesSystem.showVoidModal(${order.id})">
                                    <i class="fas fa-ban"></i>
                                </button>
                                ` : ''}
                                <button class="btn-icon btn-print" onclick="salesSystem.printReceipt(${order.id})">
                                    <i class="fas fa-print"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }

            renderCashierTable() {
                const tableBody = document.getElementById('cashierTableBody');
                const emptyState = document.getElementById('cashierEmptyState');

                if (this.cashierLogs.length === 0) {
                    tableBody.innerHTML = '';
                    emptyState.classList.remove('hidden');
                    return;
                }

                emptyState.classList.add('hidden');

                tableBody.innerHTML = this.cashierLogs.map(log => `
                    <tr class="hover:bg-gray-50">
                        <td class="py-4 px-6 text-gray-600">${log.cashier_name}</td>
                        <td class="py-4 px-6 text-gray-600">${log.branch}</td>
                        <td class="py-4 px-6 text-gray-600">
                            <div>${this.formatDateTime(log.start_time)}</div>
                            <div class="text-sm text-gray-500">to ${this.formatDateTime(log.end_time)}</div>
                        </td>
                        <td class="py-4 px-6 font-semibold text-gray-900">₱${parseFloat(log.total_sales).toFixed(2)}</td>
                        <td class="py-4 px-6 text-gray-600">${log.total_transactions}</td>
                        <td class="py-4 px-6 font-semibold text-gray-900">₱${parseFloat(log.cash_deposited).toFixed(2)}</td>
                        <td class="py-4 px-6">
                            <span class="${log.discrepancy === 0 ? 'text-green-600' : 'text-red-600'}">
                                ₱${parseFloat(log.discrepancy).toFixed(2)}
                            </span>
                        </td>
                        <td class="py-4 px-6">
                            <button class="btn-kstreet-primary" onclick="salesSystem.viewCashierDetails(${log.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `).join('');
            }

            renderVoidTable() {
                const voidedOrders = this.salesData.filter(order => order.is_voided);
                const tableBody = document.getElementById('voidTableBody');
                const emptyState = document.getElementById('voidEmptyState');

                if (voidedOrders.length === 0) {
                    tableBody.innerHTML = '';
                    emptyState.classList.remove('hidden');
                    return;
                }

                emptyState.classList.add('hidden');

                tableBody.innerHTML = voidedOrders.map(order => `
                    <tr class="hover:bg-gray-50">
                        <td class="py-4 px-6">
                            <span class="font-semibold text-gray-900">#${order.id}</span>
                            <span class="badge-void-kstreet">VOIDED</span>
                        </td>
                        <td class="py-4 px-6 text-gray-600">${this.formatDateTime(order.created_at)}</td>
                        <td class="py-4 px-6 text-gray-600">${order.voided_at ? this.formatDateTime(order.voided_at) : 'N/A'}</td>
                        <td class="py-4 px-6 font-semibold text-gray-900">₱${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td class="py-4 px-6 text-gray-600">${order.void_reason || 'No reason provided'}</td>
                        <td class="py-4 px-6 text-gray-600">${order.voided_by || 'Unknown'}</td>
                        <td class="py-4 px-6 text-gray-600">${order.cashier_name}</td>
                        <td class="py-4 px-6">
                            <button class="btn-kstreet-primary" onclick="salesSystem.viewReceipt(${order.id})">
                                <i class="fas fa-eye"></i> View Receipt
                            </button>
                        </td>
                    </tr>
                `).join('');
            }

            getFilteredSales() {
                let filtered = [...this.salesData];
                
                // Time range filter
                const timeRange = document.getElementById('timeRange').value;
                if (timeRange !== 'all') {
                    filtered = this.filterByTimeRange(filtered, timeRange);
                }

                // Payment method filter
                const paymentFilter = document.getElementById('paymentFilter').value;
                if (paymentFilter !== 'all') {
                    filtered = filtered.filter(order => order.payment_method === paymentFilter);
                }

                // Order type filter
                const orderTypeFilter = document.getElementById('orderTypeFilter').value;
                if (orderTypeFilter !== 'all') {
                    filtered = filtered.filter(order => order.order_type === orderTypeFilter);
                }

                return filtered;
            }

            filterByTimeRange(data, range) {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                switch(range) {
                    case 'today':
                        return data.filter(item => new Date(item.created_at) >= today);
                    case 'yesterday':
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        return data.filter(item => {
                            const itemDate = new Date(item.created_at);
                            return itemDate >= yesterday && itemDate < today;
                        });
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return data.filter(item => new Date(item.created_at) >= weekAgo);
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return data.filter(item => new Date(item.created_at) >= monthAgo);
                    default:
                        return data;
                }
            }

            getPaginatedData(data) {
                const startIndex = (this.currentPage - 1) * this.itemsPerPage;
                const endIndex = startIndex + this.itemsPerPage;
                return data.slice(startIndex, endIndex);
            }

            getStartIndex() {
                return (this.currentPage - 1) * this.itemsPerPage + 1;
            }

            getEndIndex(data) {
                return Math.min(this.currentPage * this.itemsPerPage, data.length);
            }

            isLastPage(data) {
                return this.currentPage >= Math.ceil(data.length / this.itemsPerPage);
            }

            nextPage() {
                const filteredData = this.getFilteredSales();
                if (!this.isLastPage(filteredData)) {
                    this.currentPage++;
                    this.renderSalesTable();
                }
            }

            prevPage() {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderSalesTable();
                }
            }

            viewReceipt(orderId) {
                const order = this.salesData.find(o => o.id === orderId);
                if (!order) return;

                // Update receipt content
                document.getElementById('receiptOrderId').textContent = order.id;
                document.getElementById('receiptDate').textContent = this.formatDateTime(order.created_at);
                document.getElementById('receiptCashier').textContent = order.cashier_name;
                document.getElementById('receiptPayment').textContent = order.payment_method;
                document.getElementById('receiptPayment').className = `payment-method-badge ${order.payment_method}`;
                document.getElementById('receiptTotal').textContent = `₱${parseFloat(order.total_amount).toFixed(2)}`;
                document.getElementById('receiptPaid').textContent = `₱${parseFloat(order.paid_amount).toFixed(2)}`;
                document.getElementById('receiptChange').textContent = `₱${parseFloat(order.change_amount).toFixed(2)}`;

                // Update items
                const items = JSON.parse(order.items);
                const itemsHtml = items.map(item => `
                    <div class="flex justify-between">
                        <span>${item.name} x${item.quantity}</span>
                        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');
                document.getElementById('receiptItems').innerHTML = itemsHtml;

                // Handle voided orders
                if (order.is_voided) {
                    document.getElementById('voidStamp').classList.remove('hidden');
                    document.getElementById('voidInfo').classList.remove('hidden');
                    document.getElementById('receiptFooter').textContent = 'This transaction has been voided';
                    
                    document.getElementById('voidReason').textContent = order.void_reason;
                    document.getElementById('voidedBy').textContent = order.voided_by;
                    document.getElementById('voidDate').textContent = order.voided_at ? this.formatDateTime(order.voided_at) : 'N/A';
                    
                    document.getElementById('voidOrderBtn').classList.add('hidden');
                } else {
                    document.getElementById('voidStamp').classList.add('hidden');
                    document.getElementById('voidInfo').classList.add('hidden');
                    document.getElementById('receiptFooter').textContent = 'Thank you for your order!';
                    
                    // Show void button only if user has permission
                    if (this.user.role === 'manager' || this.user.role === 'admin') {
                        document.getElementById('voidOrderBtn').classList.remove('hidden');
                        document.getElementById('voidOrderBtn').onclick = () => this.showVoidModal(orderId);
                    } else {
                        document.getElementById('voidOrderBtn').classList.add('hidden');
                    }
                }

                // Show modal
                document.getElementById('receiptModal').classList.remove('hidden');
            }

            showVoidModal(orderId) {
                const order = this.salesData.find(o => o.id === orderId);
                if (!order) return;

                this.orderToVoid = order;

                // Update order info
                document.getElementById('voidOrderInfo').innerHTML = `
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="font-semibold">Order #:</span>
                            <span>${order.id}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold">Amount:</span>
                            <span class="font-bold">₱${parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold">Cashier:</span>
                            <span>${order.cashier_name}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold">Date:</span>
                            <span>${this.formatDateTime(order.created_at)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold">Payment:</span>
                            <span class="payment-method-badge ${order.payment_method}">${order.payment_method}</span>
                        </div>
                    </div>
                `;

                // Clear inputs
                document.getElementById('voidReasonInput').value = '';
                document.getElementById('managerPin').value = '';
                document.getElementById('pinError').classList.add('hidden');
                document.getElementById('pinError').textContent = '';

                // Show/hide PIN section based on user role
                const pinSection = document.getElementById('pinSection');
                if (this.user.role === 'cashier') {
                    pinSection.classList.remove('hidden');
                } else {
                    pinSection.classList.add('hidden');
                }

                // Show modal
                document.getElementById('voidModal').classList.remove('hidden');
            }

            confirmVoid() {
                const reason = document.getElementById('voidReasonInput').value.trim();
                if (!reason) {
                    alert('Please enter a reason for voiding this order.');
                    return;
                }

                // For cashiers, check PIN
                if (this.user.role === 'cashier') {
                    const pin = document.getElementById('managerPin').value.trim();
                    if (!pin || pin.length < 4) {
                        document.getElementById('pinError').textContent = 'Valid manager PIN required';
                        document.getElementById('pinError').classList.remove('hidden');
                        return;
                    }
                    // Here you would verify the PIN with your backend
                }

                // Show loading
                this.showLoading(true);

                // Simulate API call
                setTimeout(() => {
                    // Update the order locally
                    this.orderToVoid.is_voided = true;
                    this.orderToVoid.void_reason = reason;
                    this.orderToVoid.voided_by = this.user.name;
                    this.orderToVoid.voided_at = new Date().toISOString();

                    // Update UI
                    this.renderSalesTable();
                    this.renderVoidTable();
                    this.updateVoidCount();

                    // Close modal
                    document.getElementById('voidModal').classList.add('hidden');

                    // Show success message
                    alert(`Order #${this.orderToVoid.id} has been successfully voided.`);

                    // Hide loading
                    this.showLoading(false);
                }, 1000);
            }

            viewCashierDetails(logId) {
                const log = this.cashierLogs.find(l => l.id === logId);
                if (!log) return;

                // Calculate session duration
                const duration = this.calculateSessionDuration(log.start_time, log.end_time);

                // Update content
                document.getElementById('cashierDetails').innerHTML = `
                    <div class="grid grid-cols-2 gap-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-bold text-gray-900 mb-3">CASHIER INFORMATION</h4>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="font-semibold">Name:</span>
                                    <span>${log.cashier_name}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-semibold">Branch:</span>
                                    <span>${log.branch}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-semibold">Login Time:</span>
                                    <span>${this.formatDateTime(log.start_time)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-semibold">Logout Time:</span>
                                    <span>${log.end_time ? this.formatDateTime(log.end_time) : 'Still Active'}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-semibold">Session Duration:</span>
                                    <span>${duration}</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-green-50 p-4 rounded-lg">
                            <h4 class="font-bold text-gray-900 mb-3">SALES SUMMARY</h4>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="font-semibold">Total Sales:</span>
                                    <span class="font-bold text-green-700">₱${parseFloat(log.total_sales).toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-semibold">Total Transactions:</span>
                                    <span>${log.total_transactions}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-semibold">Cash in Drawer:</span>
                                    <span>₱${parseFloat(log.cash_in_drawer).toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-semibold">Cash Deposited:</span>
                                    <span>₱${parseFloat(log.cash_deposited).toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-semibold">Discrepancy:</span>
                                    <span class="${log.discrepancy === 0 ? 'text-green-600' : 'text-red-600'}">
                                        ₱${parseFloat(log.discrepancy).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Show modal
                document.getElementById('cashierModal').classList.remove('hidden');
            }

            printReceipt() {
                // This is a simplified print function
                // In a real implementation, you would generate a proper print layout
                const printContent = document.querySelector('.receipt-kstreet').cloneNode(true);
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>K-STREET Receipt</title>
                        <style>
                            body { font-family: 'Courier New', monospace; padding: 20px; }
                            @media print { @page { margin: 0; } body { margin: 1.6cm; } }
                        </style>
                    </head>
                    <body>${printContent.innerHTML}</body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }

            exportToExcel() {
                let data, filename;
                
                switch(this.currentReport) {
                    case 'sales':
                        data = this.getFilteredSales();
                        filename = `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`;
                        break;
                    case 'cashier':
                        data = this.cashierLogs;
                        filename = `cashier-report-${new Date().toISOString().split('T')[0]}.xlsx`;
                        break;
                    case 'void':
                        data = this.salesData.filter(order => order.is_voided);
                        filename = `void-report-${new Date().toISOString().split('T')[0]}.xlsx`;
                        break;
                }

                if (data.length === 0) {
                    alert('No data to export');
                    return;
                }

                // Convert to worksheet and download
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Report");
                XLSX.writeFile(wb, filename);
            }

            formatDateTime(dateString) {
                const date = new Date(dateString);
                return date.toLocaleString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            getProductNames(items) {
                try {
                    const parsed = JSON.parse(items);
                    return parsed.map(item => item.name);
                } catch {
                    return ['Unknown'];
                }
            }

            calculateSessionDuration(startTime, endTime) {
                if (!startTime || !endTime) return 'Still Active';

                const start = new Date(startTime);
                const end = new Date(endTime);
                const durationMs = end - start;

                const hours = Math.floor(durationMs / (1000 * 60 * 60));
                const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                if (hours === 0) return `${minutes}m`;
                return `${hours}h ${minutes}m`;
            }

            updateVoidCount() {
                const voidCount = this.salesData.filter(order => order.is_voided).length;
                document.getElementById('voidCount').textContent = voidCount;
            }

            showLoading(show) {
                document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
            }
        }

        // Initialize the system when page loads
        document.addEventListener('DOMContentLoaded', function() {
            window.salesSystem = new SalesReports();
        });

        // Logout function
        function logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    </script>
</body>
</html>