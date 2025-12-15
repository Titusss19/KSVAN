<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
}

$user = $_SESSION['user'];
$activeView = 'items';
$currentUser = $user;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K-STREET - Products & Inventory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/items.css">
</head>
<body class="bg-gray-50">
   <?php include 'components/navbar.php'; ?>
<script id="userData" type="application/json">
    <?php echo json_encode($user); ?>
</script>
     <main class="content-wrapper">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex justify-between items-start mb-8">
            <div class="flex-1">
                <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <i class="fas fa-boxes text-red-600"></i>
                    Products & Inventory
                </h1>
               
            </div>
            
<?php if ($user['role'] === 'admin' || $user['role'] === 'owner'): ?>
            <div class="branch-selector">
                <select id="branchFilter" class="form-select-kstreet w-48">
                    <option value="all">All Branches</option>
                    <option value="main">Main Branch</option>
                    <option value="north">North Branch</option>
                    <option value="south">South Branch</option>
                </select>
            </div>
            <?php else: ?>
            <div class="branch-display">
                <span class="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-medium">
                    <i class="fas fa-building mr-2"></i>
                    <?php echo ucfirst($user['branch']); ?> Branch
                </span>
            </div>
            <?php endif; ?>
        </div>

        <!-- Report Tabs -->
        <div class="flex gap-2 mb-6 pb-2 border-b border-gray-200">
            <button class="tab-btn-kstreet active" data-tab="products">
                <i class="fas fa-list"></i>
                Product List
            </button>
            <button class="tab-btn-kstreet" data-tab="inventory">
                <i class="fas fa-cube"></i>
                Item Inventory
                <!-- <span class="bg-red-600 text-white text-xs px-2 py-1 rounded-full ml-2" id="lowStockCount">0</span> -->
            </button>
        </div>

        <!-- Search and Filter Controls -->
        <div class="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div class="flex flex-wrap gap-4 items-end">
                <!-- Search for Products -->
                <div id="productSearchSection" class="w-80">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                    <div class="relative">
                        <input type="text" id="productSearch" placeholder="Search by name, code, or category..." class="form-input-kstreet search-input-kstreet">
                        <button id="clearProductSearch" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Search for Inventory -->
                <div id="inventorySearchSection" class="w-80 hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search Inventory</label>
                    <div class="relative">
                        <input type="text" id="inventorySearch" placeholder="Search by name, code, or category..." class="form-input-kstreet search-input-kstreet">
                        <button id="clearInventorySearch" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Category Filter -->
<!-- Category Filter - will be populated dynamically -->
<div id="productCategoryFilter" class="w-48">
    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
    <select id="categoryFilter" class="form-select-kstreet">
        <option value="all">Loading...</option>
    </select>
</div>

                <!-- Description Type Filter -->
                <div id="productDescFilter" class="w-48">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description Type</label>
                    <select id="descTypeFilter" class="form-select-kstreet">
                        <option value="all">All Types</option>
                        <option value="k-street food">k-street food</option>
                        <option value="k-street Flavor">k-street Flavor</option>
                        <option value="k-street add sides">k-street add sides</option>
                        <option value="k-street upgrades">k-street upgrades</option>
                    </select>
                </div>

                <!-- Stock Status Filter -->
                <div id="inventoryStockFilter" class="w-48 hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                    <select id="stockFilter" class="form-select-kstreet">
                        <option value="all">All Status</option>
                        <option value="in-stock">In Stock</option>
                        <option value="low-stock">Low Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                    </select>
                </div>

                <!-- Add Product Button -->
                <button id="addProductBtn" class="btn-kstreet-primary">
                    <i class="fas fa-plus"></i>
                    Add Product
                </button>

                <!-- Add Inventory Button -->
                <button id="addInventoryBtn" class="btn-kstreet-primary hidden">
                    <i class="fas fa-plus"></i>
                    Add Inventory Item
                </button>
            </div>
        </div>

        <!-- Low Stock Alert -->
        <div id="lowStockAlert" class="low-stock-alert hidden rounded-xl p-4 mb-6">
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-yellow-600 text-xl mr-3"></i>
                <div class="flex-1">
                    <span class="font-semibold text-yellow-800">Low Stock Alert:</span>
                    <span class="text-yellow-700 ml-2" id="lowStockItems">0 items need restocking</span>
                </div>
                <button class="text-yellow-700 hover:text-yellow-900">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <!-- Content Area -->
        <div id="contentArea">
            <!-- Products Tab Content -->
            <div id="productsContent" class="content-pane">
                <div class="table-kstreet">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">ID</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Product Code</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Product Name</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Category</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Description Type</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Branch</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Price</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="productsTableBody">
                            <!-- Products data will be populated here -->
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div id="productsEmptyState" class="hidden text-center py-16">
                        <i class="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
                        <h4 class="text-lg font-semibold text-gray-700">No products found</h4>
                        <p class="text-gray-500">Add your first product or try adjusting your filters</p>
                    </div>

                    <!-- Pagination -->
                    <div id="productsPagination" class="pagination-kstreet hidden px-6 py-4">
                        <div class="text-sm text-gray-600">
                            Showing <span id="productsStart">1</span> to <span id="productsEnd">10</span> of <span id="productsTotal">0</span> products
                        </div>
                        <div class="flex gap-2 items-center">
                            <button id="productsPrevPage" class="btn-pagination-kstreet">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span class="font-semibold text-gray-700 px-4">Page <span id="productsCurrentPage">1</span></span>
                            <button id="productsNextPage" class="btn-pagination-kstreet">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inventory Tab Content -->
            <div id="inventoryContent" class="content-pane hidden">
                <div class="table-kstreet">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Product Code</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Item Name</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Category</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Current Stock</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Min Stock</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Unit</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Price per Item</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Total Price</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Branch</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th class="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryTableBody">
                            <!-- Inventory data will be populated here -->
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div id="inventoryEmptyState" class="hidden text-center py-16">
                        <i class="fas fa-cube text-5xl text-gray-300 mb-4"></i>
                        <h4 class="text-lg font-semibold text-gray-700">No inventory items found</h4>
                        <p class="text-gray-500">Add your first inventory item or try adjusting your filters</p>
                    </div>

                    <!-- Pagination -->
                    <div id="inventoryPagination" class="pagination-kstreet hidden px-6 py-4">
                        <div class="text-sm text-gray-600">
                            Showing <span id="inventoryStart">1</span> to <span id="inventoryEnd">10</span> of <span id="inventoryTotal">0</span> items
                        </div>
                        <div class="flex gap-2 items-center">
                            <button id="inventoryPrevPage" class="btn-pagination-kstreet">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span class="font-semibold text-gray-700 px-4">Page <span id="inventoryCurrentPage">1</span></span>
                            <button id="inventoryNextPage" class="btn-pagination-kstreet">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    
    <!-- Add/Edit Product Modal -->
    <div id="productModal" class="fixed inset-0 modal-overlay hidden flex items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-2xl w-full modal-show max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-bold text-gray-900" id="productModalTitle">Add New Product</h3>
                <button class="modal-close text-2xl text-gray-500 hover:text-gray-700">
                    &times;
                </button>
            </div>
            
            <div class="p-6">
                <!-- Branch Info -->
                <div class="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <div id="branchInfoSection">
                        <!-- Branch info will be populated here -->
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Product Code *</label>
                        <input type="text" id="productCode" placeholder="Enter product code" class="form-input-kstreet">
                        <p class="text-xs text-gray-500 mt-1">
                            <strong>Important:</strong> Flavor items should have the SAME product code as their base product
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input type="text" id="productName" placeholder="Enter product name" class="form-input-kstreet">
                    </div>

                    <div class="grid grid-cols-2 gap-4">

<div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
    <select id="productCategory" class="form-select-kstreet">
        <option value="">Loading...</option>
    </select>
</div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Description Type</label>
                            <select id="productDescType" class="form-select-kstreet">
                                <option value="k-street food">k-street food</option>
                                <option value="k-street Flavor">k-street Flavor</option>
                                <option value="k-street add sides">k-street add sides</option>
                                <option value="k-street upgrades">k-street upgrades</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2" id="priceLabel">
                            Price *
                            <span id="priceNote" class="text-xs text-blue-600 ml-2 hidden">(Auto-inherited from base product)</span>
                        </label>
                        <input type="number" step="0.01" id="productPrice" placeholder="0.00" class="form-input-kstreet">
                        <p id="flavorNote" class="text-xs text-blue-600 mt-1 hidden">
                            ⓘ Price will be set to 0 in database. In POS, it will inherit price from base product.
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                        <input type="text" id="productImage" placeholder="Enter image URL" class="form-input-kstreet">
                    </div>

                    <div id="imagePreview" class="hidden">
                        <p class="text-sm text-gray-600 mb-2">Image Preview:</p>
                        <img id="previewImage" src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg border border-gray-300">
                    </div>
                </div>
            </div>
            
            <div class="p-6 border-t flex justify-end gap-3">
                <button class="btn-kstreet-secondary" id="cancelProduct">
                    Cancel
                </button>
                <button class="btn-kstreet-primary" id="saveProduct">
                    <i class="fas fa-save"></i> Save Product
                </button>
            </div>
        </div>
    </div>

    <!-- Add/Edit Inventory Modal -->
<div id="inventoryModal" class="fixed inset-0 modal-overlay hidden flex items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-2xl w-full modal-show max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-bold text-gray-900" id="inventoryModalTitle">Add New Inventory Item</h3>
                <button class="modal-close text-2xl text-gray-500 hover:text-gray-700">
                    &times;
                </button>
            </div>
            
            <div class="p-6">
                <!-- Branch Info -->
                <div class="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <div id="inventoryBranchInfo">
                        <!-- Branch info will be populated here -->
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Product Code *</label>
                        <input type="text" id="inventoryProductCode" placeholder="Enter product code" class="form-input-kstreet">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                        <input type="text" id="inventoryName" placeholder="Enter item name" class="form-input-kstreet">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select id="inventoryCategory" class="form-select-kstreet">
                                <option value="Raw Material">Raw Material</option>
                                <option value="Meat">Meat</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Bakery">Bakery</option>
                                <option value="Condiments">Condiments</option>
                                <option value="Packaging">Packaging</option>
                                <option value="Beverages">Beverages</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                            <select id="inventoryUnit" class="form-select-kstreet">
                                <option value="pcs">pcs</option>
                                <option value="kg">kg</option>
                                <option value="grams">grams</option>
                                <option value="liters">liters</option>
                                <option value="packs">packs</option>
                                <option value="bottles">bottles</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="inventoryDescription" rows="2" placeholder="Enter item description" class="form-input-kstreet"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2" id="currentStockLabel">Stock per Item *</label>
                            <input type="number" step="0.001" id="inventoryCurrentStock" placeholder="0" class="form-input-kstreet">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2" id="quantityLabel">Number of Items</label>
                            <input type="number" step="1" id="inventoryQuantity" placeholder="1" class="form-input-kstreet" value="1">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2" id="minStockLabel">Min Stock</label>
                            <input type="number" step="0.001" id="inventoryMinStock" placeholder="0" class="form-input-kstreet">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                            <input type="text" id="inventorySupplier" placeholder="Enter supplier name" class="form-input-kstreet">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Price per Item (Optional)</label>
                        <input type="number" step="0.01" id="inventoryPrice" placeholder="0.00" class="form-input-kstreet">
                    </div>

                    <!-- Calculations Display -->
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 class="text-sm font-semibold text-blue-800 mb-2">Calculations</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-blue-600">Total Quantity to Add:</p>
                                <p class="font-semibold" id="totalQuantityDisplay">0</p>
                            </div>
                            <div>
                                <p class="text-blue-600">Total Price:</p>
                                <p class="font-semibold" id="totalPriceDisplay">₱0.00</p>
                            </div>
                        </div>
                        <div id="existingStockInfo" class="mt-2 text-xs text-blue-600 hidden">
                            <p><strong>Existing Stock:</strong> <span id="existingStockDisplay">0</span> <span id="existingUnitDisplay">pcs</span></p>
                        </div>
                        <div class="mt-2 text-xs text-blue-600">
                            <p><strong>Final Stock:</strong> <span id="finalStockDisplay">0</span> <span id="finalUnitDisplay">pcs</span></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-6 border-t flex justify-end gap-3">
                <button class="btn-kstreet-secondary" id="cancelInventory">
                    Cancel
                </button>
                <button class="btn-kstreet-primary" id="saveInventory">
                    <i class="fas fa-save"></i> Save Item
                </button>
            </div>
        </div>
    </div>

    <!-- Stock Management Modal -->
    <!-- <div id="stockModal" class="fixed inset-0 modal-overlay hidden items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-md w-full modal-show">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-bold text-gray-900">Stock Management</h3>
                <button class="modal-close text-2xl text-gray-500 hover:text-gray-700">
                    &times;
                </button>
            </div>
            
            <div class="p-6">
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-900 mb-2" id="stockItemName">Item Name</h4>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-gray-600">Current Stock:</p>
                                <p class="font-semibold" id="currentStockDisplay">0</p>
                            </div>
                            <div>
                                <p class="text-gray-600">Min Stock:</p>
                                <p class="font-semibold" id="minStockDisplay">0</p>
                            </div>
                        </div>
                        <div class="mt-2 text-xs text-blue-600">
                            <p>Unit: <span id="stockUnitDisplay">pcs</span></p>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                        <select id="stockTransactionType" class="form-select-kstreet">
                            <option value="IN">Stock In (Add)</option>
                            <option value="OUT">Stock Out (Deduct)</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Stock per Item *</label>
                            <input type="number" step="0.001" id="stockPerItem" placeholder="0" class="form-input-kstreet">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                            <input type="number" step="1" id="stockQuantity" placeholder="1" class="form-input-kstreet" value="1">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Price per Item (Optional)</label>
                        <input type="number" step="0.01" id="stockPricePerItem" placeholder="0.00" class="form-input-kstreet">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea id="stockNotes" rows="2" placeholder="Enter notes (optional)" class="form-input-kstreet"></textarea>
                    </div>

                    
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 class="text-sm font-semibold text-blue-800 mb-2">Calculations</h4>
                        <div class="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p class="text-blue-600">Total Stock to Add:</p>
                                <p class="font-semibold" id="totalStockToAdd">0</p>
                            </div>
                            <div>
                                <p class="text-blue-600">Total Price:</p>
                                <p class="font-semibold" id="totalStockPrice">₱0.00</p>
                            </div>
                        </div>
                        <div class="mt-2 text-xs text-blue-600">
                            <p><strong>Final Stock:</strong> <span id="finalStockAfterTransaction">0</span></p>
                            <p><strong>New Price per Item:</strong> <span id="newPricePerItem">₱0.00</span></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-6 border-t flex justify-end gap-3">
                <button class="btn-kstreet-secondary" id="cancelStock">
                    Cancel
                </button>
                <button class="btn-kstreet-primary" id="processStock">
                    <i class="fas fa-exchange-alt"></i> Process Transaction
                </button>
            </div>
        </div>
    </div> -->

    <!-- View Product Modal -->
    <div id="viewModal" class="fixed inset-0 modal-overlay hidden items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-md w-full modal-show">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-bold text-gray-900">Product Details</h3>
                <button class="modal-close text-2xl text-gray-500 hover:text-gray-700">
                    &times;
                </button>
            </div>
            
            <div class="p-6">
                <img id="viewProductImage" src="" alt="Product Image" class="w-full h-48 object-cover rounded-xl mb-4 shadow-md">
                <div class="space-y-3">
                    <div>
                        <p class="text-sm text-gray-600">Product Code:</p>
                        <p class="font-semibold text-blue-600" id="viewProductCode"></p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Product Name:</p>
                        <p class="font-semibold text-gray-900" id="viewProductName"></p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Category:</p>
                        <p><span class="badge-category" id="viewProductCategory"></span></p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Description Type:</p>
                        <p><span class="badge-description-type" id="viewProductDescType"></span></p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Price:</p>
                        <p class="font-semibold text-green-600" id="viewProductPrice"></p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Branch:</p>
                        <p><span class="badge-branch" id="viewProductBranch"></span></p>
                    </div>
                </div>
            </div>
            
            <div class="p-6 border-t flex justify-end">
                <button class="btn-kstreet-secondary" id="closeView">
                    Close
                </button>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="fixed inset-0 modal-overlay hidden items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-md w-full modal-show">
            <div class="flex justify-between items-center p-6 border-b bg-red-50">
                <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <i class="fas fa-exclamation-triangle text-red-600"></i>
                    Confirm Delete
                </h3>
                <button class="modal-close text-2xl text-gray-500 hover:text-gray-700">
                    &times;
                </button>
            </div>
            
            <div class="p-6">
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-trash text-red-600 text-2xl"></i>
                    </div>
                </div>
                <p class="text-center text-gray-700 mb-2" id="deleteMessage"></p>
                <div class="bg-gray-50 p-3 rounded-lg mb-4">
                    <p class="text-center text-sm font-semibold text-gray-900" id="deleteItemName"></p>
                    <p class="text-center text-xs text-gray-600 mt-1">Product Code: <span id="deleteItemCode"></span></p>
                    <p class="text-center text-xs text-gray-600">Branch: <span id="deleteItemBranch"></span></p>
                </div>
                <p class="text-center text-sm text-red-600 font-semibold">This action cannot be undone!</p>
            </div>
            
            <div class="p-6 border-t flex justify-end gap-3">
                <button class="btn-kstreet-secondary" id="cancelDelete">
                    Cancel
                </button>
                <button class="btn-kstreet-primary bg-red-600 hover:bg-red-700" id="confirmDelete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    </div>

    <!-- Success Modal -->
    <div id="successModal" class="fixed inset-0 modal-overlay hidden items-center justify-center p-4 z-50">
        <div class="modal-content-kstreet max-w-md w-full modal-show">
            <div class="flex justify-center mb-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-check text-green-600 text-2xl"></i>
                </div>
            </div>
            <h3 class="text-xl font-bold text-center text-gray-900 mb-2" id="successTitle"></h3>
            <p class="text-center text-gray-600 mb-6" id="successMessage"></p>
            <div class="flex justify-center">
                <button class="btn-kstreet-primary" id="closeSuccess">
                    Close
                </button>
            </div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="fixed inset-0 bg-white bg-opacity-80 hidden items-center justify-center z-50">
        <div class="spinner-kstreet"></div>
    </div>

    <script>
        class ProductsInventorySystem {
            constructor() {
                this.currentTab = 'products';
                this.currentPage = {
                    products: 1,
                    inventory: 1
                };
                this.itemsPerPage = 10;
                this.isAdmin = false;
                this.selectedBranch = 'all';
                
                // Get user data from PHP session (passed through data attributes or API)
                this.user = this.getUserFromPHP();
                
                this.editingItem = null;
                this.editingInventory = null;
                this.itemToDelete = null;
                this.inventoryToDelete = null;
                // this.selectedInventory = null;
                this.currentModalType = 'product';
                
                this.products = [];
                this.inventory = [];
                this.categories = [];
                
                this.init();
            }

async init() {
    
    this.setupUser();
    this.bindEvents();
    
    console.log('About to call loadData()...');
    
    try {
     await this.loadCategories();
        await this.loadData();
        console.log('loadData() completed');
        console.log('Products:', this.products.length);
        console.log('Inventory:', this.inventory.length);
    } catch (error) {
        console.error('Error in loadData():', error);
    }
    
    this.renderProductsTable();
    // this.updateLowStockCount();
    
    console.log('=== INIT COMPLETED ===');
}

async loadCategories() {
    try {
        const response = await fetch('backend/fetch_categories.php');
        const data = await response.json();
        
        if (data.success) {
            this.categories = data.categories;
            console.log('✓ Loaded categories:', this.categories.length);
            this.populateCategoryDropdowns();
        } else {
            console.error('Error loading categories:', data.error);
            this.categories = [];
            this.populateCategoryDropdowns();
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        this.categories = [];
        this.populateCategoryDropdowns();
    }
}

populateCategoryDropdowns() {
    // Update filter dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
            this.categories.map(cat => 
                `<option value="${cat.category_name}">${cat.category_name}</option>`
            ).join('');
    }
    
    // Update product modal dropdown
    const productCategory = document.getElementById('productCategory');
    if (productCategory) {
        productCategory.innerHTML = this.categories.map(cat => 
            `<option value="${cat.category_name}">${cat.category_name}</option>`
        ).join('');
    }
}

async loadData() {
    try {
        this.showLoading(true);
        
        // Fetch products from database
        console.log('Fetching products...');
        const productsResponse = await fetch('backend/fetch_products.php');
        const productsText = await productsResponse.text(); // Get raw text first
        
        console.log('Products raw response:', productsText); // See what we got
        
        let productsData;
        try {
            productsData = JSON.parse(productsText);
        } catch (parseError) {
            console.error('Failed to parse products JSON:', parseError);
            console.error('Raw response was:', productsText);
            throw new Error('Server returned invalid JSON for products');
        }
        
        if (productsData.success) {
            this.products = productsData.products;
            console.log('✓ Loaded products:', this.products.length);
        } else {
            console.error('Error from server:', productsData.error);
            alert('Error loading products: ' + productsData.error);
            this.products = [];
        }
        
        // Fetch inventory from database
        console.log('Fetching inventory...');
        const inventoryResponse = await fetch('backend/fetch_inventory.php');
        const inventoryText = await inventoryResponse.text(); // Get raw text first
        
        console.log('Inventory raw response:', inventoryText); // See what we got
        
        let inventoryData;
        try {
            inventoryData = JSON.parse(inventoryText);
        } catch (parseError) {
            console.error('Failed to parse inventory JSON:', parseError);
            console.error('Raw response was:', inventoryText);
            throw new Error('Server returned invalid JSON for inventory');
        }
        
        if (inventoryData.success) {
            // Add display_unit for liters
            this.inventory = inventoryData.inventory.map(item => ({
                ...item,
                display_unit: item.unit === 'liters' ? 'ml' : item.unit,
                // Convert numeric strings to numbers
                current_stock: parseFloat(item.current_stock),
                min_stock: parseFloat(item.min_stock),
                price: parseFloat(item.price || 0),
                total_price: parseFloat(item.total_price || 0)
            }));
            console.log('✓ Loaded inventory:', this.inventory.length);
        } else {
            console.error('Error from server:', inventoryData.error);
            alert('Error loading inventory: ' + inventoryData.error);
            this.inventory = [];
        }
        
        this.showLoading(false);
        
    } catch (error) {
        this.showLoading(false);
        console.error('❌ Error loading data:', error);
        console.error('Error details:', error.stack);
        alert('Error loading data from server: ' + error.message + '\n\nCheck browser console for details.');
    }
}

getUserFromPHP() {
    // Get user data from PHP session variable
    const userDataElement = document.getElementById('userData');
    if (userDataElement) {
        try {
            return JSON.parse(userDataElement.textContent);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    
    // Fallback (shouldn't happen if session exists)
    return {
        id: 1,
        name: 'User',
        email: 'user@kstreet.com',
        role: 'manager',
        branch: 'main'
    };
}

setupUser() {
    this.isAdmin = this.user.role === 'admin' || this.user.role === 'owner';
    if (this.isAdmin) {
        this.selectedBranch = 'all';
    } else {
        this.selectedBranch = this.user.branch;
        const branchFilter = document.getElementById('branchFilter');
        if (branchFilter) {
            branchFilter.value = this.user.branch;
            branchFilter.disabled = true;
        }
    }
}

            bindEvents() {
                // Tab switching
                document.querySelectorAll('.tab-btn-kstreet').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.tab-btn-kstreet').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        
                        this.currentTab = e.currentTarget.dataset.tab;
                        this.switchTab(this.currentTab);
                    });
                });

                // Branch filter
const branchFilter = document.getElementById('branchFilter');
if (branchFilter) {
    branchFilter.addEventListener('change', (e) => {
        this.selectedBranch = e.target.value;
        this.renderCurrentTable();
        this.updateLowStockCount();
    });
}

                // Product search
                document.getElementById('productSearch').addEventListener('input', (e) => {
                    const clearBtn = document.getElementById('clearProductSearch');
                    clearBtn.classList.toggle('hidden', !e.target.value);
                    this.renderProductsTable();
                });

                document.getElementById('clearProductSearch').addEventListener('click', () => {
                    document.getElementById('productSearch').value = '';
                    document.getElementById('clearProductSearch').classList.add('hidden');
                    this.renderProductsTable();
                });

                // Inventory search
                document.getElementById('inventorySearch').addEventListener('input', (e) => {
                    const clearBtn = document.getElementById('clearInventorySearch');
                    clearBtn.classList.toggle('hidden', !e.target.value);
                    this.renderInventoryTable();
                });

                document.getElementById('clearInventorySearch').addEventListener('click', () => {
                    document.getElementById('inventorySearch').value = '';
                    document.getElementById('clearInventorySearch').classList.add('hidden');
                    this.renderInventoryTable();
                });

                // Category filter
                document.getElementById('categoryFilter').addEventListener('change', () => {
                    this.renderProductsTable();
                });

                // Description type filter
                document.getElementById('descTypeFilter').addEventListener('change', () => {
                    this.renderProductsTable();
                });

                // Stock filter
                document.getElementById('stockFilter').addEventListener('change', () => {
                    this.renderInventoryTable();
                });

                // Add buttons
                document.getElementById('addProductBtn').addEventListener('click', () => this.showProductModal());
                document.getElementById('addInventoryBtn').addEventListener('click', () => this.showInventoryModal());

                // Modal close buttons
                document.querySelectorAll('.modal-close').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const modal = e.target.closest('.modal-overlay');
                        modal.classList.add('hidden');
                    });
                });

                // Product modal buttons
                document.getElementById('cancelProduct').addEventListener('click', () => {
                    document.getElementById('productModal').classList.add('hidden');
                });

                document.getElementById('saveProduct').addEventListener('click', () => this.saveProduct());

                // Inventory modal buttons
                document.getElementById('cancelInventory').addEventListener('click', () => {
                    document.getElementById('inventoryModal').classList.add('hidden');
                });

                document.getElementById('saveInventory').addEventListener('click', () => this.saveInventory());

                // Description type change affects price field
                document.getElementById('productDescType').addEventListener('change', (e) => {
                    this.handleDescTypeChange(e.target.value);
                });

                // Inventory unit change updates labels
                document.getElementById('inventoryUnit').addEventListener('change', (e) => {
                    this.updateInventoryLabels(e.target.value);
                });

                // Inventory calculations
                ['inventoryCurrentStock', 'inventoryQuantity', 'inventoryPrice'].forEach(id => {
                    document.getElementById(id).addEventListener('input', () => {
                        this.updateInventoryCalculations();
                    });
                });

                // Stock modal
                // document.getElementById('cancelStock').addEventListener('click', () => {
                //     document.getElementById('stockModal').classList.add('hidden');
                // });

                // document.getElementById('processStock').addEventListener('click', () => this.processStockTransaction());

                // // Stock calculations
                // ['stockPerItem', 'stockQuantity', 'stockPricePerItem', 'stockTransactionType'].forEach(id => {
                //     document.getElementById(id).addEventListener('input', () => {
                //         this.updateStockCalculations();
                //     });
                // });

                // View modal
                document.getElementById('closeView').addEventListener('click', () => {
                    document.getElementById('viewModal').classList.add('hidden');
                });

                // Delete modal
                document.getElementById('cancelDelete').addEventListener('click', () => {
                    document.getElementById('deleteModal').classList.add('hidden');
                });

                document.getElementById('confirmDelete').addEventListener('click', () => this.confirmDelete());

                // Success modal
                document.getElementById('closeSuccess').addEventListener('click', () => {
                    document.getElementById('successModal').classList.add('hidden');
                });

                // Pagination
                document.getElementById('productsPrevPage').addEventListener('click', () => this.prevPage('products'));
                document.getElementById('productsNextPage').addEventListener('click', () => this.nextPage('products'));
                document.getElementById('inventoryPrevPage').addEventListener('click', () => this.prevPage('inventory'));
                document.getElementById('inventoryNextPage').addEventListener('click', () => this.nextPage('inventory'));

                // Image preview
                document.getElementById('productImage').addEventListener('input', (e) => {
                    this.updateImagePreview(e.target.value);
                });
            }

            switchTab(tab) {
                // Hide all content
                document.querySelectorAll('.content-pane').forEach(p => p.classList.add('hidden'));
                document.getElementById(`${tab}Content`).classList.remove('hidden');

                // Update search and filter visibility
                document.getElementById('productSearchSection').classList.toggle('hidden', tab !== 'products');
                document.getElementById('inventorySearchSection').classList.toggle('hidden', tab !== 'inventory');
                document.getElementById('productCategoryFilter').classList.toggle('hidden', tab !== 'products');
                document.getElementById('productDescFilter').classList.toggle('hidden', tab !== 'products');
                document.getElementById('inventoryStockFilter').classList.toggle('hidden', tab !== 'inventory');
                document.getElementById('addProductBtn').classList.toggle('hidden', tab !== 'products');
                document.getElementById('addInventoryBtn').classList.toggle('hidden', tab !== 'inventory');

                // Render the current table
                this.renderCurrentTable();
            }

            renderCurrentTable() {
                if (this.currentTab === 'products') {
                    this.renderProductsTable();
                } else {
                    this.renderInventoryTable();
                }
            }

            getFilteredProducts() {
                let filtered = [...this.products];

                // Branch filter
                if (this.selectedBranch !== 'all') {
                    filtered = filtered.filter(item => item.branch === this.selectedBranch);
                }

                // Search filter
                const searchTerm = document.getElementById('productSearch').value.toLowerCase();
                if (searchTerm) {
                    filtered = filtered.filter(item =>
                        item.name.toLowerCase().includes(searchTerm) ||
                        item.product_code.toLowerCase().includes(searchTerm) ||
                        item.category.toLowerCase().includes(searchTerm)
                    );
                }

                // Category filter
                const categoryFilter = document.getElementById('categoryFilter').value;
                if (categoryFilter !== 'all') {
                    filtered = filtered.filter(item => item.category === categoryFilter);
                }

                // Description type filter
                const descFilter = document.getElementById('descTypeFilter').value;
                if (descFilter !== 'all') {
                    filtered = filtered.filter(item => item.description_type === descFilter);
                }

                return filtered;
            }

            getFilteredInventory() {
                let filtered = [...this.inventory];

                // Branch filter
                if (this.selectedBranch !== 'all') {
                    filtered = filtered.filter(item => item.branch === this.selectedBranch);
                }

                // Search filter
                const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
                if (searchTerm) {
                    filtered = filtered.filter(item =>
                        item.name.toLowerCase().includes(searchTerm) ||
                        item.product_code.toLowerCase().includes(searchTerm) ||
                        item.category.toLowerCase().includes(searchTerm)
                    );
                }

                // Stock status filter
                const stockFilter = document.getElementById('stockFilter').value;
                if (stockFilter !== 'all') {
                    filtered = filtered.filter(item => {
                        const status = this.getStockStatus(item);
                        return status === stockFilter;
                    });
                }

                return filtered;
            }

            renderProductsTable() {
                const filteredProducts = this.getFilteredProducts();
                const paginatedData = this.getPaginatedData(filteredProducts, 'products');
                const tableBody = document.getElementById('productsTableBody');
                const emptyState = document.getElementById('productsEmptyState');
                const pagination = document.getElementById('productsPagination');

                if (filteredProducts.length === 0) {
                    tableBody.innerHTML = '';
                    emptyState.classList.remove('hidden');
                    pagination.classList.add('hidden');
                    return;
                }

                emptyState.classList.add('hidden');
                pagination.classList.remove('hidden');

                // Update pagination info
                const startIndex = (this.currentPage.products - 1) * this.itemsPerPage + 1;
                const endIndex = Math.min(this.currentPage.products * this.itemsPerPage, filteredProducts.length);
                const total = filteredProducts.length;

                document.getElementById('productsStart').textContent = startIndex;
                document.getElementById('productsEnd').textContent = endIndex;
                document.getElementById('productsTotal').textContent = total;
                document.getElementById('productsCurrentPage').textContent = this.currentPage.products;

                // Update pagination button states
                document.getElementById('productsPrevPage').disabled = this.currentPage.products === 1;
                document.getElementById('productsPrevPage').classList.toggle('disabled', this.currentPage.products === 1);
                document.getElementById('productsNextPage').disabled = this.isLastPage(filteredProducts, 'products');
                document.getElementById('productsNextPage').classList.toggle('disabled', this.isLastPage(filteredProducts, 'products'));

                // Render table rows
                tableBody.innerHTML = paginatedData.map(product => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="py-4 px-6 text-gray-600">#${product.id}</td>
                        <td class="py-4 px-6">
                            <span class="font-semibold text-blue-700">${product.product_code}</span>
                        </td>
                        <td class="py-4 px-6">
                            <div class="flex items-center">
                                
                                <span class="font-medium text-gray-900">${product.name}</span>
                            </div>
                        </td>
                        <td class="py-4 px-6">
                            <span class="badge-category">${product.category}</span>
                        </td>
                        <td class="py-4 px-6">
                            <span class="badge-description-type">${product.description_type}</span>
                        </td>
                        <td class="py-4 px-6">
                            <span class="badge-branch">${product.branch}</span>
                        </td>
                        <td class="py-4 px-6 font-semibold text-green-600">
                            ₱${parseFloat(product.price).toFixed(2)}
                        </td>
                        <td class="py-4 px-6">
                            <div class="flex gap-2">
                               <button class="btn-icon btn-view" onclick="productSystem.viewProduct(${product.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon btn-edit" onclick="productSystem.editProduct(${product.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="productSystem.showDeleteModal('product', ${product.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }

            renderInventoryTable() {
                const filteredInventory = this.getFilteredInventory();
                const paginatedData = this.getPaginatedData(filteredInventory, 'inventory');
                const tableBody = document.getElementById('inventoryTableBody');
                const emptyState = document.getElementById('inventoryEmptyState');
                const pagination = document.getElementById('inventoryPagination');

                if (filteredInventory.length === 0) {
                    tableBody.innerHTML = '';
                    emptyState.classList.remove('hidden');
                    pagination.classList.add('hidden');
                    return;
                }

                emptyState.classList.add('hidden');
                pagination.classList.remove('hidden');

                // Update pagination info
                const startIndex = (this.currentPage.inventory - 1) * this.itemsPerPage + 1;
                const endIndex = Math.min(this.currentPage.inventory * this.itemsPerPage, filteredInventory.length);
                const total = filteredInventory.length;

                document.getElementById('inventoryStart').textContent = startIndex;
                document.getElementById('inventoryEnd').textContent = endIndex;
                document.getElementById('inventoryTotal').textContent = total;
                document.getElementById('inventoryCurrentPage').textContent = this.currentPage.inventory;

                // Update pagination button states
                document.getElementById('inventoryPrevPage').disabled = this.currentPage.inventory === 1;
                document.getElementById('inventoryPrevPage').classList.toggle('disabled', this.currentPage.inventory === 1);
                document.getElementById('inventoryNextPage').disabled = this.isLastPage(filteredInventory, 'inventory');
                document.getElementById('inventoryNextPage').classList.toggle('disabled', this.isLastPage(filteredInventory, 'inventory'));

                // Render table rows
                tableBody.innerHTML = paginatedData.map(item => {
                    const status = this.getStockStatus(item);
                    const statusClass = status === 'in-stock' ? 'badge-in-stock' : 
                                      status === 'low-stock' ? 'badge-low-stock' : 'badge-out-of-stock';
                    const statusText = status === 'in-stock' ? 'In Stock' : 
                                     status === 'low-stock' ? 'Low Stock' : 'Out of Stock';

                    return `
                    <tr class="hover:bg-gray-50 transition-colors ${status === 'low-stock' ? 'bg-yellow-50' : ''} ${status === 'out-of-stock' ? 'bg-red-50' : ''}">
                        <td class="py-4 px-6">
                            <span class="font-semibold text-blue-700">${item.product_code}</span>
                        </td>
                        <td class="py-4 px-6 font-medium text-gray-900">${item.name}</td>
                        <td class="py-4 px-6">
                            <span class="badge-category">${item.category}</span>
                        </td>
                        <td class="py-4 px-6 font-semibold ${status === 'low-stock' ? 'text-yellow-600' : status === 'out-of-stock' ? 'text-red-600' : 'text-gray-900'}">
                            ${parseFloat(item.current_stock).toFixed(2)} ${item.display_unit || item.unit}
                        </td>
                        <td class="py-4 px-6 text-gray-600">${parseFloat(item.min_stock).toFixed(2)} ${item.display_unit || item.unit}</td>
                        <td class="py-4 px-6 text-gray-600">${item.display_unit || item.unit}</td>
                        <td class="py-4 px-6 text-green-600">
                            ${item.price > 0 ? `₱${parseFloat(item.price).toFixed(2)}` : '<span class="text-gray-400">-</span>'}
                        </td>
                        <td class="py-4 px-6 text-blue-600">
                            ${item.total_price > 0 ? `₱${parseFloat(item.total_price).toFixed(2)}` : '<span class="text-gray-400">-</span>'}
                        </td>
                        <td class="py-4 px-6">
                            <span class="badge-branch">${item.branch}</span>
                        </td>
                        <td class="py-4 px-6">
                            <span class="${statusClass}">
                                <span class="status-dot ${status}"></span>
                                ${statusText}
                            </span>
                        </td>
                        <td class="py-4 px-6">
                            <div class="flex gap-2">

                                <button class="btn-icon btn-edit" onclick="productSystem.editInventory(${item.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="productSystem.showDeleteModal('inventory', ${item.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `}).join('');
            }

            getPaginatedData(data, type) {
                const currentPage = this.currentPage[type];
                const startIndex = (currentPage - 1) * this.itemsPerPage;
                const endIndex = startIndex + this.itemsPerPage;
                return data.slice(startIndex, endIndex);
            }

            isLastPage(data, type) {
                const currentPage = this.currentPage[type];
                return currentPage >= Math.ceil(data.length / this.itemsPerPage);
            }

            prevPage(type) {
                if (this.currentPage[type] > 1) {
                    this.currentPage[type]--;
                    if (type === 'products') {
                        this.renderProductsTable();
                    } else {
                        this.renderInventoryTable();
                    }
                }
            }

            nextPage(type) {
                const filteredData = type === 'products' ? this.getFilteredProducts() : this.getFilteredInventory();
                if (!this.isLastPage(filteredData, type)) {
                    this.currentPage[type]++;
                    if (type === 'products') {
                        this.renderProductsTable();
                    } else {
                        this.renderInventoryTable();
                    }
                }
            }

showProductModal(product = null) {
    this.editingItem = product;
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const branchInfo = document.getElementById('branchInfoSection');

    // Repopulate categories dropdown to ensure it's loaded
    this.populateCategoryDropdowns();

    if (product) {
        title.textContent = 'Edit Product';
        this.fillProductForm(product);
    } else {
        title.textContent = 'Add New Product';
        this.resetProductForm();
    }

    // Update branch info
    if (this.isAdmin) {
        branchInfo.innerHTML = `
            <label class="block text-sm font-medium text-blue-700 mb-2">Select Branch for this Product *</label>
            <select id="productBranch" class="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-transparent">
                ${['main', 'north', 'south'].map(branch => `
                    <option value="${branch}" ${branch === (product?.branch || this.user.branch) ? 'selected' : ''}>
                        ${branch} ${branch === this.user.branch ? '(Your Branch)' : ''}
                    </option>
                `).join('')}
            </select>
        `;
    } else {
        branchInfo.innerHTML = `
            <p class="text-sm text-blue-700 font-medium">
                This product will be added to: <span class="font-bold">${this.user.branch}</span> branch
            </p>
        `;
    }

    modal.classList.remove('hidden');
}

            showInventoryModal(inventory = null) {
    console.log('🔵 showInventoryModal called', inventory);
    
    this.editingInventory = inventory;
    
    const modal = document.getElementById('inventoryModal');
    if (!modal) {
        console.error('❌ Inventory modal not found');
        return;
    }
    
    const title = document.getElementById('inventoryModalTitle');
    if (title) {
        title.textContent = inventory ? 'Edit Inventory Item' : 'Add New Inventory Item';
    }

    // Try to reset/fill form
    try {
        if (inventory) {
            this.fillInventoryForm(inventory);
        } else {
            this.resetInventoryForm();
        }
    } catch (error) {
        console.error('Error setting up inventory form:', error);
    }

    // Update branch info
    const branchInfo = document.getElementById('inventoryBranchInfo');
    if (branchInfo) {
        if (this.isAdmin) {
            branchInfo.innerHTML = `
                <label class="block text-sm font-medium text-blue-700 mb-2">Select Branch *</label>
                <select id="inventoryBranch" class="border border-gray-300 p-2 rounded-lg w-full">
                    <option value="main">Main Branch</option>
                    <option value="north">North Branch</option>
                    <option value="south">South Branch</option>
                </select>
            `;
            if (inventory) {
                const branchSelect = document.getElementById('inventoryBranch');
                if (branchSelect) branchSelect.value = inventory.branch;
            }
        } else {
            branchInfo.innerHTML = `
                <p class="text-sm text-blue-700 font-medium">
                    Branch: <span class="font-bold">${this.user.branch}</span>
                </p>
            `;
        }
    }

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
    
    console.log('✓ Inventory modal opened');
}

            // showStockModal(inventoryId) {
            //     const inventory = this.inventory.find(item => item.id === inventoryId);
            //     if (!inventory) return;

            //     this.selectedInventory = inventory;
            //     const modal = document.getElementById('stockModal');

            //     // Update modal content
            //     document.getElementById('stockItemName').textContent = inventory.name;
            //     document.getElementById('currentStockDisplay').textContent = 
            //         `${parseFloat(inventory.current_stock).toFixed(2)} ${inventory.display_unit || inventory.unit}`;
            //     document.getElementById('minStockDisplay').textContent = 
            //         `${parseFloat(inventory.min_stock).toFixed(2)} ${inventory.display_unit || inventory.unit}`;
            //     document.getElementById('stockUnitDisplay').textContent = inventory.display_unit || inventory.unit;

            //     // Reset form
            //     document.getElementById('stockPerItem').value = '';
            //     document.getElementById('stockQuantity').value = '1';
            //     document.getElementById('stockPricePerItem').value = inventory.price || '';
            //     document.getElementById('stockNotes').value = '';

            //     this.updateStockCalculations();
            //     modal.classList.remove('hidden');
            // }

            showDeleteModal(type, id) {
                this.currentModalType = type;
                if (type === 'product') {
                    this.itemToDelete = this.products.find(item => item.id === id);
                } else {
                    this.inventoryToDelete = this.inventory.find(item => item.id === id);
                }

                const item = type === 'product' ? this.itemToDelete : this.inventoryToDelete;
                if (!item) return;

                const modal = document.getElementById('deleteModal');
                document.getElementById('deleteMessage').textContent = 
                    `Are you sure you want to delete this ${type === 'product' ? 'product' : 'inventory item'}?`;
                document.getElementById('deleteItemName').textContent = item.name;
                document.getElementById('deleteItemCode').textContent = item.product_code;
                document.getElementById('deleteItemBranch').textContent = item.branch;

                modal.classList.remove('hidden');
            }

fillProductForm(product) {
    document.getElementById('productCode').value = product.product_code;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescType').value = product.description_type;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image;
    
    // Set category AFTER ensuring dropdown is populated
    const productCategory = document.getElementById('productCategory');
    if (productCategory && this.categories && this.categories.length > 0) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
            productCategory.value = product.category;
        }, 50);
    }
    
    if (this.isAdmin) {
        const productBranch = document.getElementById('productBranch');
        if (productBranch) {
            productBranch.value = product.branch;
        }
    }

    this.handleDescTypeChange(product.description_type);
    this.updateImagePreview(product.image);
}

            fillInventoryForm(inventory) {
    console.log('Filling inventory form with:', inventory);
    
    const displayItem = this.convertToDisplayUnit(inventory);
    
    const fields = {
        'inventoryProductCode': displayItem.product_code,
        'inventoryName': displayItem.name,
        'inventoryCategory': displayItem.category,
        'inventoryUnit': displayItem.unit,
        'inventoryDescription': displayItem.description || '',
        'inventoryCurrentStock': '0',
        'inventoryQuantity': '1',
        'inventoryMinStock': displayItem.min_stock,
        'inventorySupplier': displayItem.supplier || '',
        'inventoryPrice': displayItem.price || ''
    };

    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        } else {
            console.warn(`⚠️ Element ${id} not found`);
        }
    }

    // Set branch if admin
    if (this.isAdmin) {
        const inventoryBranch = document.getElementById('inventoryBranch');
        if (inventoryBranch) inventoryBranch.value = displayItem.branch;
    }

    // Show existing stock info
    const existingStockInfo = document.getElementById('existingStockInfo');
    if (existingStockInfo) {
        existingStockInfo.classList.remove('hidden');
        const existingStockDisplay = document.getElementById('existingStockDisplay');
        const existingUnitDisplay = document.getElementById('existingUnitDisplay');
        if (existingStockDisplay) {
            existingStockDisplay.textContent = parseFloat(displayItem.current_stock).toFixed(2);
        }
        if (existingUnitDisplay) {
            existingUnitDisplay.textContent = displayItem.display_unit || displayItem.unit;
        }
    }

    try {
        this.updateInventoryLabels(displayItem.unit);
        this.updateInventoryCalculations();
    } catch (error) {
        console.error('Error updating inventory calculations:', error);
    }
}

resetProductForm() {
    console.log('Resetting product form...');
    
    // Reset fields safely with null checks
    const productCode = document.getElementById('productCode');
    if (productCode) productCode.value = '';
    
    const productName = document.getElementById('productName');
    if (productName) productName.value = '';
    
    const productCategory = document.getElementById('productCategory');
    if (productCategory) productCategory.value = 'Main';
    
    const productDescType = document.getElementById('productDescType');
    if (productDescType) productDescType.value = 'k-street food';
    
    const productPrice = document.getElementById('productPrice');
    if (productPrice) productPrice.value = '';
    
    const productImage = document.getElementById('productImage');
    if (productImage) productImage.value = '';
    
    // Set branch if admin
    if (this.isAdmin) {
        const productBranch = document.getElementById('productBranch');
        if (productBranch) productBranch.value = this.user.branch;
    }

    // Handle description type change
    this.handleDescTypeChange('k-street food');
    
    // Update image preview
    this.updateImagePreview('');
}

            resetInventoryForm() {
    console.log('Resetting inventory form...');
    
    const fields = {
        'inventoryProductCode': '',
        'inventoryName': '',
        'inventoryCategory': 'Raw Material',
        'inventoryUnit': 'pcs',
        'inventoryDescription': '',
        'inventoryCurrentStock': '0',
        'inventoryQuantity': '1',
        'inventoryMinStock': '0',
        'inventorySupplier': '',
        'inventoryPrice': ''
    };

    for (const [id, value] of Object.entries(fields)) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                element.value = value;
            } else {
                element.value = value;
            }
        } else {
            console.warn(`⚠️ Element ${id} not found`);
        }
    }

    // Set branch if admin
    if (this.isAdmin) {
        const inventoryBranch = document.getElementById('inventoryBranch');
        if (inventoryBranch) inventoryBranch.value = this.user.branch;
    }

    // Hide existing stock info
    const existingStockInfo = document.getElementById('existingStockInfo');
    if (existingStockInfo) existingStockInfo.classList.add('hidden');
    
    // Update labels and calculations
    try {
        this.updateInventoryLabels('pcs');
        this.updateInventoryCalculations();
    } catch (error) {
        console.error('Error updating inventory calculations:', error);
    }
}

handleDescTypeChange(descType) {
    const priceField = document.getElementById('productPrice');
    const priceNote = document.getElementById('priceNote');
    const flavorNote = document.getElementById('flavorNote');

    if (!priceField) {
        console.warn('Price field not found');
        return;
    }

    if (descType === 'k-street Flavor') {
        priceField.value = '0';
        priceField.disabled = true;
        priceField.classList.add('bg-gray-100', 'text-gray-500');
        if (priceNote) priceNote.classList.remove('hidden');
        if (flavorNote) flavorNote.classList.remove('hidden');
    } else {
        priceField.disabled = false;
        priceField.classList.remove('bg-gray-100', 'text-gray-500');
        if (priceNote) priceNote.classList.add('hidden');
        if (flavorNote) flavorNote.classList.add('hidden');
    }
}

updateInventoryLabels(unit) {
    const labels = {
        'pcs': 'pcs',
        'kg': 'kg',
        'grams': 'grams',
        'liters': 'liters',
        'packs': 'packs',
        'bottles': 'bottles'
    };

    const currentStockLabel = document.getElementById('currentStockLabel');
    const quantityLabel = document.getElementById('quantityLabel');
    const minStockLabel = document.getElementById('minStockLabel');
    const totalQuantityDisplay = document.getElementById('totalQuantityDisplay');
    const existingUnitDisplay = document.getElementById('existingUnitDisplay');
    const finalUnitDisplay = document.getElementById('finalUnitDisplay');

    if (currentStockLabel) currentStockLabel.textContent = `Stock per Item (${labels[unit]})`;
    if (quantityLabel) quantityLabel.textContent = 'Number of Items';
    if (minStockLabel) minStockLabel.textContent = `Min Stock (${labels[unit]})`;
    if (totalQuantityDisplay) totalQuantityDisplay.textContent = '0 ' + labels[unit];
    if (existingUnitDisplay) existingUnitDisplay.textContent = labels[unit];
    if (finalUnitDisplay) finalUnitDisplay.textContent = labels[unit];
}

            updateInventoryCalculations() {
    const stockPerItemEl = document.getElementById('inventoryCurrentStock');
    const quantityEl = document.getElementById('inventoryQuantity');
    const pricePerItemEl = document.getElementById('inventoryPrice');
    const unitEl = document.getElementById('inventoryUnit');

    if (!stockPerItemEl || !quantityEl || !unitEl) {
        console.warn('Missing inventory calculation elements');
        return;
    }

    const stockPerItem = parseFloat(stockPerItemEl.value) || 0;
    const quantity = parseFloat(quantityEl.value) || 1;
    const pricePerItem = parseFloat(pricePerItemEl?.value) || 0;
    const unit = unitEl.value;

    const totalQuantity = stockPerItem * quantity;
    const totalPrice = pricePerItem * quantity;

    // Get existing stock if editing
    let existingStock = 0;
    if (this.editingInventory) {
        const displayItem = this.convertToDisplayUnit(this.editingInventory);
        existingStock = parseFloat(displayItem.current_stock) || 0;
    }

    const finalStock = existingStock + totalQuantity;

    // Update displays
    const labels = {
        'pcs': 'pcs',
        'kg': 'kg',
        'grams': 'grams',
        'liters': 'liters',
        'packs': 'packs',
        'bottles': 'bottles'
    };

    const totalQuantityDisplay = document.getElementById('totalQuantityDisplay');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const finalStockDisplay = document.getElementById('finalStockDisplay');

    if (totalQuantityDisplay) {
        totalQuantityDisplay.textContent = `${totalQuantity.toFixed(2)} ${labels[unit]}`;
    }
    if (totalPriceDisplay) {
        totalPriceDisplay.textContent = `₱${totalPrice.toFixed(2)}`;
    }
    if (finalStockDisplay) {
        finalStockDisplay.textContent = `${finalStock.toFixed(2)} ${labels[unit]}`;
    }
}

            // updateStockCalculations() {
            //     const stockPerItem = parseFloat(document.getElementById('stockPerItem').value) || 0;
            //     const quantity = parseFloat(document.getElementById('stockQuantity').value) || 1;
            //     const pricePerItem = parseFloat(document.getElementById('stockPricePerItem').value) || 0;
            //     const transactionType = document.getElementById('stockTransactionType').value;
                
            //     if (!this.selectedInventory) return;

            //     const totalStockToAdd = stockPerItem * quantity;
            //     const totalPrice = pricePerItem * quantity;

            //     let finalStock = parseFloat(this.selectedInventory.current_stock);
            //     if (transactionType === 'IN') {
            //         finalStock += totalStockToAdd;
            //     } else {
            //         finalStock -= totalStockToAdd;
            //     }

            //     // Update displays
            //     document.getElementById('totalStockToAdd').textContent = 
            //         `${totalStockToAdd.toFixed(2)} ${this.selectedInventory.display_unit || this.selectedInventory.unit}`;
            //     document.getElementById('totalStockPrice').textContent = 
            //         `₱${totalPrice.toFixed(2)}`;
            //     document.getElementById('finalStockAfterTransaction').textContent = 
            //         `${finalStock.toFixed(2)} ${this.selectedInventory.display_unit || this.selectedInventory.unit}`;
            //     document.getElementById('newPricePerItem').textContent = 
            //         pricePerItem > 0 ? `₱${pricePerItem.toFixed(2)}` : 'No change';
            // }

updateImagePreview(imageUrl) {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImage');

    if (!preview || !img) {
        console.warn('Image preview elements not found');
        return;
    }

    if (imageUrl) {
        img.src = imageUrl;
        img.onerror = () => {
            img.src = 'https://via.placeholder.com/150?text=No+Image';
        };
        preview.classList.remove('hidden');
    } else {
        preview.classList.add('hidden');
    }
}

            saveProduct() {
    // Validation
    const productCode = document.getElementById('productCode').value.trim();
    const productName = document.getElementById('productName').value.trim();
    const productImage = document.getElementById('productImage').value.trim();
    const productPrice = document.getElementById('productPrice').value;

    if (!productCode || !productName || !productImage) {
        alert('Please fill in all required fields!');
        return;
    }

    const descType = document.getElementById('productDescType').value;
    if (descType !== 'k-street Flavor' && !productPrice) {
        alert('Please enter a price for non-flavor items!');
        return;
    }

    // Get branch
    let branch;
    if (this.isAdmin) {
        branch = document.getElementById('productBranch').value;
        if (!branch) {
            alert('Please select a branch!');
            return;
        }
    } else {
        branch = this.user.branch;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('product_code', productCode);
    formData.append('name', productName);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('description_type', descType);
    formData.append('price', descType === 'k-street Flavor' ? '0' : productPrice);
    formData.append('image', productImage);
    formData.append('branch', branch);
    
    // If editing, add ID
    if (this.editingItem) {
        formData.append('id', this.editingItem.id);
    }

    // Send to server
    this.showLoading(true);
    
    fetch('backend/save_products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        this.showLoading(false);
        
        if (data.success) {
            this.showSuccess(data.message);
            document.getElementById('productModal').classList.add('hidden');
            
            // Reload page or refresh table
            location.reload();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        this.showLoading(false);
        alert('Error: ' + error.message);
    });
}

            saveInventory() {
                // Validation
                const productCode = document.getElementById('inventoryProductCode').value.trim();
                const itemName = document.getElementById('inventoryName').value.trim();
                const unit = document.getElementById('inventoryUnit').value;

                if (!productCode || !itemName || !unit) {
                    this.showError('Please fill in all required fields!');
                    return;
                }

                // Get branch
                let branch;
                if (this.isAdmin) {
                    branch = document.getElementById('inventoryBranch').value;
                    if (!branch) {
                        this.showError('Please select a branch!');
                        return;
                    }
                } else {
                    branch = this.user.branch;
                }

                // Get values
                const stockPerItem = parseFloat(document.getElementById('inventoryCurrentStock').value) || 0;
                const quantity = parseFloat(document.getElementById('inventoryQuantity').value) || 1;
                const pricePerItem = parseFloat(document.getElementById('inventoryPrice').value) || 0;

                // Calculate totals
                const totalCurrentStock = stockPerItem * quantity;
                const totalPrice = pricePerItem * quantity;

                // For editing, add to existing stock
                let finalCurrentStock = totalCurrentStock;
                if (this.editingInventory) {
                    finalCurrentStock += parseFloat(this.editingInventory.current_stock);
                }

                // Convert to storage unit if needed
                const itemToSave = this.convertToStorageUnit({
                    product_code: productCode.toUpperCase(),
                    name: itemName,
                    category: document.getElementById('inventoryCategory').value,
                    description: document.getElementById('inventoryDescription').value.trim(),
                    unit: unit,
                    current_stock: finalCurrentStock,
                    min_stock: parseFloat(document.getElementById('inventoryMinStock').value) || 0,
                    supplier: document.getElementById('inventorySupplier').value.trim(),
                    price: pricePerItem,
                    total_price: totalPrice,
                    branch: branch
                });

                // Simulate save
                this.showLoading(true);
                setTimeout(() => {
                    if (this.editingInventory) {
                        // Update existing inventory
                        Object.assign(this.editingInventory, itemToSave);
                        this.showSuccess('Inventory item updated successfully!');
                    } else {
                        // Add new inventory
                        const newInventory = {
                            id: this.inventory.length + 1,
                            ...itemToSave,
                            display_unit: unit === 'liters' ? 'ml' : unit
                        };
                        this.inventory.push(newInventory);
                        this.showSuccess('Inventory item added successfully!');
                    }

                    this.showLoading(false);
                    document.getElementById('inventoryModal').classList.add('hidden');
                    this.renderInventoryTable();
                    // this.updateLowStockCount();
                    this.editingInventory = null;
                }, 1000);
            }

            // processStockTransaction() {
            //     const stockPerItem = parseFloat(document.getElementById('stockPerItem').value);
            //     const quantity = parseFloat(document.getElementById('stockQuantity').value);
            //     const transactionType = document.getElementById('stockTransactionType').value;

            //     if (!stockPerItem || stockPerItem <= 0) {
            //         this.showError('Please enter a valid stock per item!');
            //         return;
            //     }

            //     if (!quantity || quantity <= 0) {
            //         this.showError('Please enter a valid quantity!');
            //         return;
            //     }

            //     const totalStockToAdd = stockPerItem * quantity;
            //     const pricePerItem = parseFloat(document.getElementById('stockPricePerItem').value) || 0;
            //     const totalPriceToAdd = pricePerItem * quantity;

            //     // Check for out of stock
            //     if (transactionType === 'OUT' && totalStockToAdd > this.selectedInventory.current_stock) {
            //         this.showError('Cannot deduct more stock than available!');
            //         return;
            //     }

            //     // Update inventory
            //     this.showLoading(true);
            //     setTimeout(() => {
            //         if (transactionType === 'IN') {
            //             this.selectedInventory.current_stock += totalStockToAdd;
            //             this.selectedInventory.total_price += totalPriceToAdd;
            //         } else {
            //             this.selectedInventory.current_stock -= totalStockToAdd;
            //             this.selectedInventory.total_price -= totalPriceToAdd;
            //         }

            //         if (pricePerItem > 0) {
            //             this.selectedInventory.price = pricePerItem;
            //         }

            //         this.showSuccess(`Stock ${transactionType === 'IN' ? 'added' : 'deducted'} successfully!`);
            //         this.showLoading(false);
            //         document.getElementById('stockModal').classList.add('hidden');
            //         this.renderInventoryTable();
            //         this.updateLowStockCount();
            //         this.selectedInventory = null;
            //     }, 1000);
            // }

            confirmDelete() {
                this.showLoading(true);
                setTimeout(() => {
                    if (this.currentModalType === 'product') {
                        // Remove product
                        const index = this.products.findIndex(item => item.id === this.itemToDelete.id);
                        if (index > -1) {
                            this.products.splice(index, 1);
                        }
                        this.showSuccess('Product deleted successfully!');
                    } else {
                        // Remove inventory
                        const index = this.inventory.findIndex(item => item.id === this.inventoryToDelete.id);
                        if (index > -1) {
                            this.inventory.splice(index, 1);
                        }
                        this.showSuccess('Inventory item deleted successfully!');
                        // this.updateLowStockCount();
                    }

                    this.showLoading(false);
                    document.getElementById('deleteModal').classList.add('hidden');
                    this.renderCurrentTable();
                    this.itemToDelete = null;
                    this.inventoryToDelete = null;
                }, 1000);
            }

            viewProduct(productId) {
                const product = this.products.find(item => item.id === productId);
                if (!product) return;

                const modal = document.getElementById('viewModal');
                document.getElementById('viewProductImage').src = product.image;
                document.getElementById('viewProductCode').textContent = product.product_code;
                document.getElementById('viewProductName').textContent = product.name;
                document.getElementById('viewProductCategory').textContent = product.category;
                document.getElementById('viewProductDescType').textContent = product.description_type;
                document.getElementById('viewProductPrice').textContent = `₱${parseFloat(product.price).toFixed(2)}`;
                document.getElementById('viewProductBranch').textContent = product.branch;

                modal.classList.remove('hidden');
            }

            editProduct(productId) {
                const product = this.products.find(item => item.id === productId);
                if (!product) return;

                this.showProductModal(product);
            }

            editInventory(inventoryId) {
                const inventory = this.inventory.find(item => item.id === inventoryId);
                if (!inventory) return;

                this.showInventoryModal(inventory);
            }

            getStockStatus(item) {
                if (item.current_stock <= 0) {
                    return 'out-of-stock';
                } else if (item.current_stock <= item.min_stock) {
                    return 'low-stock';
                } else {
                    return 'in-stock';
                }
            }

            // updateLowStockCount() {
            //     const lowStockItems = this.inventory.filter(item => this.getStockStatus(item) === 'low-stock');
            //     const lowStockCount = lowStockItems.length;

            //     document.getElementById('lowStockCount').textContent = lowStockCount;
            //     document.getElementById('lowStockItems').textContent = `${lowStockCount} items need restocking`;

            //     // Show/hide alert
            //     const alert = document.getElementById('lowStockAlert');
            //     if (lowStockCount > 0) {
            //         alert.classList.remove('hidden');
            //     } else {
            //         alert.classList.add('hidden');
            //     }
            // }

convertToDisplayUnit(item) {
    if (!item) return item;
    
    if (item.unit === 'liters') {
        return {
            ...item,
            current_stock: item.current_stock * 1000,
            min_stock: item.min_stock * 1000,
            display_unit: 'ml'
        };
    }
    return { ...item, display_unit: item.unit };
}

convertToStorageUnit(item) {
    if (!item) return item;
    
    if (item.unit === 'liters') {
        return {
            ...item,
            current_stock: item.current_stock / 1000,
            min_stock: item.min_stock / 1000
        };
    }
    return item;
}
            showSuccess(message) {
                const modal = document.getElementById('successModal');
                document.getElementById('successTitle').textContent = 'Success!';
                document.getElementById('successMessage').textContent = message;
                modal.classList.remove('hidden');
            }

            showError(message) {
                alert(message); // In production, use a proper modal
            }

            showLoading(show) {
                document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
            }


        }

        // Initialize the system
        document.addEventListener('DOMContentLoaded', function() {
            window.productSystem = new ProductsInventorySystem();
        });
    </script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    
    if (addProductBtn && productModal) {
        addProductBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            productModal.classList.remove('hidden');
            productModal.classList.add('flex');
            productModal.style.display = 'flex';
        });
        
        // Close modal
        const closeButtons = productModal.querySelectorAll('.modal-close, #cancelProduct');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                productModal.classList.add('hidden');
                productModal.style.display = 'none';
            });
        });
    }
    
    // Add Inventory Modal Fix
    const addInventoryBtn = document.getElementById('addInventoryBtn');
    const inventoryModal = document.getElementById('inventoryModal');
    
    if (addInventoryBtn && inventoryModal) {
        addInventoryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            inventoryModal.classList.remove('hidden');
            inventoryModal.classList.add('flex');
            inventoryModal.style.display = 'flex';
        });
        
        // Close modal
        const closeButtons = inventoryModal.querySelectorAll('.modal-close, #cancelInventory');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                inventoryModal.classList.add('hidden');
                inventoryModal.style.display = 'none';
            });
        });
    }
});
</script>
</body>
</html>