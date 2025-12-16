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
                        <input type="text" id="productSearch" placeholder="Search by name, code, or category..." class="form-input-kstreet ">
                        <button id="clearProductSearch" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Search for Inventory -->
                <div id="inventorySearchSection" class="w-80 hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search Inventory</label>
                    <div class="relative">
                        <input type="text" id="inventorySearch" placeholder="Search by name, code, or category..." class="form-input-kstreet ">
                        <button id="clearInventorySearch" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Category Filter - Text input instead of dropdown -->
                <div id="productCategoryFilter" class="w-48">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input type="text" id="categoryFilter" placeholder="Filter by category..." class="form-input-kstreet">
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
    <div class="table-container">
        <div class="table-kstreet">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-50">
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
        </div>


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
    <div class="table-container">
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
        </div>
    </div>

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
                        <!-- Category as text field -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <input type="text" id="productCategory" placeholder="Enter category (e.g., Burger, Drink, etc.)" class="form-input-kstreet">
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

    <script src="Javascript/items.js"></script>
</body>
</html>