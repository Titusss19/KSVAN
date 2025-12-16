class ProductsInventorySystem {
  constructor() {
    this.currentTab = "products";
    this.currentPage = {
      products: 1,
      inventory: 1,
    };
    this.itemsPerPage = 10;
    this.isAdmin = false;
    this.selectedBranch = "all";

    this.user = this.getUserFromPHP();
    this.editingItem = null;
    this.editingInventory = null;
    this.itemToDelete = null;
    this.inventoryToDelete = null;
    this.currentModalType = "product";

    this.products = [];
    this.inventory = [];

    this.init();
  }

  async init() {
    this.setupUser();
    this.bindEvents();

    try {
      await this.loadData();
    } catch (error) {
      console.error("Error in loadData():", error);
      // Show error to user
      alert("Error loading data. Please check console for details.");
    }

    this.renderProductsTable();
  }

  async loadData() {
    try {
      this.showLoading(true);

      // FETCH PRODUCTS ONLY
      const productsResponse = await fetch("backend/fetch_products.php");

      // First, let's see what the response really is
      const responseText = await productsResponse.text();
     

      // Check if response contains HTML error
      if (responseText.includes("<br />") || responseText.includes("<b>")) {
        console.error("PHP error detected in response:", responseText);
        throw new Error("PHP backend returned an error. Check server logs.");
      }

      let productsData;
      try {
        productsData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        console.error("Response was:", responseText);
        throw new Error("Server returned invalid JSON format");
      }

      if (productsData.success) {
        this.products = productsData.products;
      
      } else {
        console.error("Error from server:", productsData.error);
        this.products = [];
        // Show error to user
        this.showError(productsData.error || "Failed to load products");
      }

      // KEEP INVENTORY LOADING AS IS - DON'T CHANGE
      try {
        const inventoryResponse = await fetch("backend/fetch_inventory.php");
        const inventoryText = await inventoryResponse.text();

        let inventoryData;
        try {
          inventoryData = JSON.parse(inventoryText);
        } catch (parseError) {
          console.error("Failed to parse inventory JSON:", parseError);
          // Continue without inventory if it fails
          inventoryData = { success: false, error: "Inventory parse failed" };
        }

        if (inventoryData.success) {
          this.inventory = inventoryData.inventory.map((item) => ({
            ...item,
            display_unit: item.unit === "liters" ? "ml" : item.unit,
            current_stock: parseFloat(item.current_stock),
            min_stock: parseFloat(item.min_stock),
            price: parseFloat(item.price || 0),
            total_price: parseFloat(item.total_price || 0),
          }));
         
        } else {
          console.warn("Inventory load warning:", inventoryData.error);
          this.inventory = [];
        }
      } catch (inventoryError) {
        console.warn("Inventory load failed:", inventoryError);
        this.inventory = [];
      }

      this.showLoading(false);
    } catch (error) {
      this.showLoading(false);
      console.error("Error loading data:", error);
      this.showError("Error loading data: " + error.message);
    }
  }

  getUserFromPHP() {
    const userDataElement = document.getElementById("userData");
    if (userDataElement) {
      try {
        return JSON.parse(userDataElement.textContent);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    return {
      id: 1,
      name: "User",
      email: "user@kstreet.com",
      role: "manager",
      branch: "main",
    };
  }

  setupUser() {
    this.isAdmin = this.user.role === "admin" || this.user.role === "owner";
    if (this.isAdmin) {
      this.selectedBranch = "all";
    } else {
      this.selectedBranch = this.user.branch;
      const branchFilter = document.getElementById("branchFilter");
      if (branchFilter) {
        branchFilter.value = this.user.branch;
        branchFilter.disabled = true;
      }
    }
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll(".tab-btn-kstreet").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".tab-btn-kstreet")
          .forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        this.currentTab = e.currentTarget.dataset.tab;
        this.switchTab(this.currentTab);
      });
    });

    // Branch filter
    const branchFilter = document.getElementById("branchFilter");
    if (branchFilter) {
      branchFilter.addEventListener("change", (e) => {
        this.selectedBranch = e.target.value;
        this.renderCurrentTable();
      });
    }

    // Product search
    document.getElementById("productSearch").addEventListener("input", (e) => {
      const clearBtn = document.getElementById("clearProductSearch");
      clearBtn.classList.toggle("hidden", !e.target.value);
      this.renderProductsTable();
    });

    document
      .getElementById("clearProductSearch")
      .addEventListener("click", () => {
        document.getElementById("productSearch").value = "";
        document.getElementById("clearProductSearch").classList.add("hidden");
        this.renderProductsTable();
      });

    // Inventory search - KEEP AS IS
    document
      .getElementById("inventorySearch")
      .addEventListener("input", (e) => {
        const clearBtn = document.getElementById("clearInventorySearch");
        clearBtn.classList.toggle("hidden", !e.target.value);
        this.renderInventoryTable();
      });

    document
      .getElementById("clearInventorySearch")
      .addEventListener("click", () => {
        document.getElementById("inventorySearch").value = "";
        document.getElementById("clearInventorySearch").classList.add("hidden");
        this.renderInventoryTable();
      });

    // Category filter (text input)
    document.getElementById("categoryFilter").addEventListener("input", () => {
      this.renderProductsTable();
    });

    // Description type filter
    document.getElementById("descTypeFilter").addEventListener("change", () => {
      this.renderProductsTable();
    });

    // Stock filter - KEEP AS IS
    document.getElementById("stockFilter").addEventListener("change", () => {
      this.renderInventoryTable();
    });

    // Add buttons
    document
      .getElementById("addProductBtn")
      .addEventListener("click", () => this.showProductModal());
    document
      .getElementById("addInventoryBtn")
      .addEventListener("click", () => this.showInventoryModal());

    // Modal close buttons
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-overlay");
        modal.classList.add("hidden");
      });
    });

    // Product modal buttons
    document.getElementById("cancelProduct").addEventListener("click", () => {
      document.getElementById("productModal").classList.add("hidden");
    });

    document
      .getElementById("saveProduct")
      .addEventListener("click", () => this.saveProduct());

    // Inventory modal buttons - KEEP AS IS
    document.getElementById("cancelInventory").addEventListener("click", () => {
      document.getElementById("inventoryModal").classList.add("hidden");
    });

    document
      .getElementById("saveInventory")
      .addEventListener("click", () => this.saveInventory());

    // Description type change affects price field
    document
      .getElementById("productDescType")
      .addEventListener("change", (e) => {
        this.handleDescTypeChange(e.target.value);
      });

    // Inventory unit change updates labels - KEEP AS IS
    document.getElementById("inventoryUnit").addEventListener("change", (e) => {
      this.updateInventoryLabels(e.target.value);
    });

    // Inventory calculations - KEEP AS IS
    ["inventoryCurrentStock", "inventoryQuantity", "inventoryPrice"].forEach(
      (id) => {
        document.getElementById(id).addEventListener("input", () => {
          this.updateInventoryCalculations();
        });
      }
    );

    // View modal
    document.getElementById("closeView").addEventListener("click", () => {
      document.getElementById("viewModal").classList.add("hidden");
    });

    // Delete modal
    document.getElementById("cancelDelete").addEventListener("click", () => {
      document.getElementById("deleteModal").classList.add("hidden");
    });

    document
      .getElementById("confirmDelete")
      .addEventListener("click", () => this.confirmDelete());

    // Success modal
    document.getElementById("closeSuccess").addEventListener("click", () => {
      document.getElementById("successModal").classList.add("hidden");
    });

    // Pagination
    document
      .getElementById("productsPrevPage")
      .addEventListener("click", () => this.prevPage("products"));
    document
      .getElementById("productsNextPage")
      .addEventListener("click", () => this.nextPage("products"));
    document
      .getElementById("inventoryPrevPage")
      .addEventListener("click", () => this.prevPage("inventory"));
    document
      .getElementById("inventoryNextPage")
      .addEventListener("click", () => this.nextPage("inventory"));

    // Image preview
    document.getElementById("productImage").addEventListener("input", (e) => {
      this.updateImagePreview(e.target.value);
    });
  }

  switchTab(tab) {
    document
      .querySelectorAll(".content-pane")
      .forEach((p) => p.classList.add("hidden"));
    document.getElementById(`${tab}Content`).classList.remove("hidden");

    // Update search and filter visibility
    document
      .getElementById("productSearchSection")
      .classList.toggle("hidden", tab !== "products");
    document
      .getElementById("inventorySearchSection")
      .classList.toggle("hidden", tab !== "inventory");
    document
      .getElementById("productCategoryFilter")
      .classList.toggle("hidden", tab !== "products");
    document
      .getElementById("productDescFilter")
      .classList.toggle("hidden", tab !== "products");
    document
      .getElementById("inventoryStockFilter")
      .classList.toggle("hidden", tab !== "inventory");
    document
      .getElementById("addProductBtn")
      .classList.toggle("hidden", tab !== "products");
    document
      .getElementById("addInventoryBtn")
      .classList.toggle("hidden", tab !== "inventory");

    this.renderCurrentTable();
  }

  renderCurrentTable() {
    if (this.currentTab === "products") {
      this.renderProductsTable();
    } else {
      this.renderInventoryTable();
    }
  }

  getFilteredProducts() {
    let filtered = [...this.products];

    if (this.selectedBranch !== "all") {
      filtered = filtered.filter((item) => item.branch === this.selectedBranch);
    }

    const searchTerm = document
      .getElementById("productSearch")
      .value.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.product_code.toLowerCase().includes(searchTerm) ||
          (item.category && item.category.toLowerCase().includes(searchTerm))
      );
    }

    const categoryFilter = document
      .getElementById("categoryFilter")
      .value.toLowerCase();
    if (categoryFilter) {
      filtered = filtered.filter(
        (item) =>
          item.category && item.category.toLowerCase().includes(categoryFilter)
      );
    }

    const descFilter = document.getElementById("descTypeFilter").value;
    if (descFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.description_type === descFilter
      );
    }

    return filtered;
  }

  getFilteredInventory() {
    // KEEP INVENTORY FILTERING AS IS
    let filtered = [...this.inventory];

    if (this.selectedBranch !== "all") {
      filtered = filtered.filter((item) => item.branch === this.selectedBranch);
    }

    const searchTerm = document
      .getElementById("inventorySearch")
      .value.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.product_code.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
      );
    }

    const stockFilter = document.getElementById("stockFilter").value;
    if (stockFilter !== "all") {
      filtered = filtered.filter((item) => {
        const status = this.getStockStatus(item);
        return status === stockFilter;
      });
    }

    return filtered;
  }

  renderProductsTable() {
    const filteredProducts = this.getFilteredProducts();
    const paginatedData = this.getPaginatedData(filteredProducts, "products");
    const tableBody = document.getElementById("productsTableBody");
    const emptyState = document.getElementById("productsEmptyState");
    const pagination = document.getElementById("productsPagination");

    if (filteredProducts.length === 0) {
      tableBody.innerHTML = "";
      emptyState.classList.remove("hidden");
      pagination.classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    pagination.classList.remove("hidden");

    const startIndex = (this.currentPage.products - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(
      this.currentPage.products * this.itemsPerPage,
      filteredProducts.length
    );
    const total = filteredProducts.length;

    document.getElementById("productsStart").textContent = startIndex;
    document.getElementById("productsEnd").textContent = endIndex;
    document.getElementById("productsTotal").textContent = total;
    document.getElementById("productsCurrentPage").textContent =
      this.currentPage.products;

    document.getElementById("productsPrevPage").disabled =
      this.currentPage.products === 1;
    document
      .getElementById("productsPrevPage")
      .classList.toggle("disabled", this.currentPage.products === 1);
    document.getElementById("productsNextPage").disabled = this.isLastPage(
      filteredProducts,
      "products"
    );
    document
      .getElementById("productsNextPage")
      .classList.toggle(
        "disabled",
        this.isLastPage(filteredProducts, "products")
      );

    tableBody.innerHTML = paginatedData
      .map(
        (product) => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4 sm:py-4 sm:px-6">
                    <span class="font-semibold text-blue-700 text-xs sm:text-sm">${
                      product.product_code
                    }</span>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6">
                    <div class="flex items-center">
                        <span class="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[150px]">${
                          product.name
                        }</span>
                    </div>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 responsive-hide">
                    <span class="badge-category">${
                      product.category || "Not Set"
                    }</span>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 responsive-hide">
                    <span class="badge-description-type">${
                      product.description_type
                    }</span>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 responsive-hide">
                    <span class="badge-branch">${product.branch}</span>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 font-semibold text-green-600 text-xs sm:text-sm">
                    ₱${parseFloat(product.price).toFixed(2)}
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6">
                    <div class="action-buttons">
                       <button class="btn-icon btn-view" onclick="productSystem.viewProduct(${
                         product.id
                       })" title="View">
                            <i class="fas fa-eye text-xs sm:text-sm"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="productSystem.editProduct(${
                          product.id
                        })" title="Edit">
                            <i class="fas fa-edit text-xs sm:text-sm"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="productSystem.showDeleteModal('product', ${
                          product.id
                        })" title="Delete">
                            <i class="fas fa-trash text-xs sm:text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  }

  renderInventoryTable() {
    // KEEP INVENTORY TABLE RENDERING AS IS
    const filteredInventory = this.getFilteredInventory();
    const paginatedData = this.getPaginatedData(filteredInventory, "inventory");
    const tableBody = document.getElementById("inventoryTableBody");
    const emptyState = document.getElementById("inventoryEmptyState");
    const pagination = document.getElementById("inventoryPagination");

    if (filteredInventory.length === 0) {
      tableBody.innerHTML = "";
      emptyState.classList.remove("hidden");
      pagination.classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    pagination.classList.remove("hidden");

    const startIndex = (this.currentPage.inventory - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(
      this.currentPage.inventory * this.itemsPerPage,
      filteredInventory.length
    );
    const total = filteredInventory.length;

    document.getElementById("inventoryStart").textContent = startIndex;
    document.getElementById("inventoryEnd").textContent = endIndex;
    document.getElementById("inventoryTotal").textContent = total;
    document.getElementById("inventoryCurrentPage").textContent =
      this.currentPage.inventory;

    document.getElementById("inventoryPrevPage").disabled =
      this.currentPage.inventory === 1;
    document
      .getElementById("inventoryPrevPage")
      .classList.toggle("disabled", this.currentPage.inventory === 1);
    document.getElementById("inventoryNextPage").disabled = this.isLastPage(
      filteredInventory,
      "inventory"
    );
    document
      .getElementById("inventoryNextPage")
      .classList.toggle(
        "disabled",
        this.isLastPage(filteredInventory, "inventory")
      );

    tableBody.innerHTML = paginatedData
      .map((item) => {
        const status = this.getStockStatus(item);
        const statusClass =
          status === "in-stock"
            ? "badge-in-stock"
            : status === "low-stock"
            ? "badge-low-stock"
            : "badge-out-of-stock";
        const statusText =
          status === "in-stock"
            ? "In Stock"
            : status === "low-stock"
            ? "Low Stock"
            : "Out of Stock";

        return `
            <tr class="hover:bg-gray-50 transition-colors ${
              status === "low-stock" ? "bg-yellow-50" : ""
            } ${status === "out-of-stock" ? "bg-red-50" : ""}">
                <td class="py-3 px-4 sm:py-4 sm:px-6">
                    <span class="font-semibold text-blue-700 text-xs sm:text-sm">${
                      item.product_code
                    }</span>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[120px]">${
                  item.name
                }</td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 responsive-hide">
                    <span class="badge-category">${item.category}</span>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 font-semibold ${
                  status === "low-stock"
                    ? "text-yellow-600"
                    : status === "out-of-stock"
                    ? "text-red-600"
                    : "text-gray-900"
                } text-xs sm:text-sm">
                    ${parseFloat(item.current_stock).toFixed(2)} ${
          item.display_unit || item.unit
        }
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 text-gray-600 responsive-hide">${parseFloat(
                  item.min_stock
                ).toFixed(2)} ${item.display_unit || item.unit}</td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 text-gray-600 text-xs sm:text-sm">${
                  item.display_unit || item.unit
                }</td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 text-green-600 responsive-hide">
                    ${
                      item.price > 0
                        ? `₱${parseFloat(item.price).toFixed(2)}`
                        : '<span class="text-gray-400">-</span>'
                    }
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 text-blue-600 responsive-hide">
                    ${
                      item.total_price > 0
                        ? `₱${parseFloat(item.total_price).toFixed(2)}`
                        : '<span class="text-gray-400">-</span>'
                    }
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6 responsive-hide">
                    <span class="badge-branch">${item.branch}</span>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6">
                    <span class="${statusClass}">
                        <span class="status-dot ${status}"></span>
                        ${statusText}
                    </span>
                </td>
                <td class="py-3 px-4 sm:py-4 sm:px-6">
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="productSystem.editInventory(${
                          item.id
                        })" title="Edit">
                            <i class="fas fa-edit text-xs sm:text-sm"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="productSystem.showDeleteModal('inventory', ${
                          item.id
                        })" title="Delete">
                            <i class="fas fa-trash text-xs sm:text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
      })
      .join("");
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
      if (type === "products") {
        this.renderProductsTable();
      } else {
        this.renderInventoryTable();
      }
    }
  }

  nextPage(type) {
    const filteredData =
      type === "products"
        ? this.getFilteredProducts()
        : this.getFilteredInventory();
    if (!this.isLastPage(filteredData, type)) {
      this.currentPage[type]++;
      if (type === "products") {
        this.renderProductsTable();
      } else {
        this.renderInventoryTable();
      }
    }
  }

  showProductModal(product = null) {
    this.editingItem = product;
    const modal = document.getElementById("productModal");
    const title = document.getElementById("productModalTitle");
    const branchInfo = document.getElementById("branchInfoSection");

    if (product) {
      title.textContent = "Edit Product";

      // Set form values
      document.getElementById("productCode").value = product.product_code;
      document.getElementById("productName").value = product.name;
      document.getElementById("productCategory").value = product.category || "";
      document.getElementById("productDescType").value =
        product.description_type;
      document.getElementById("productPrice").value = product.price;
      document.getElementById("productImage").value = product.image;

      if (this.isAdmin) {
        const productBranch = document.getElementById("productBranch");
        if (productBranch) {
          productBranch.value = product.branch;
        }
      }

      this.handleDescTypeChange(product.description_type);
      this.updateImagePreview(product.image);
    } else {
      title.textContent = "Add New Product";
      this.resetProductForm();
    }

    if (this.isAdmin) {
      branchInfo.innerHTML = `
        <label class="block text-sm font-medium text-blue-700 mb-2">Select Branch for this Product *</label>
        <select id="productBranch" class="form-select-kstreet">
          ${["main", "north", "south"]
            .map(
              (branch) => `
              <option value="${branch}" ${
                branch === (product?.branch || this.user.branch)
                  ? "selected"
                  : ""
              }>
                ${branch} ${branch === this.user.branch ? "(Your Branch)" : ""}
              </option>
            `
            )
            .join("")}
        </select>
      `;
    } else {
      branchInfo.innerHTML = `
        <p class="text-sm text-blue-700 font-medium">
          This product will be added to: <span class="font-bold">${this.user.branch}</span> branch
        </p>
      `;
    }

    modal.classList.remove("hidden");
  }

  showInventoryModal(inventory = null) {
    // KEEP INVENTORY MODAL AS IS
    this.editingInventory = inventory;

    const modal = document.getElementById("inventoryModal");
    const title = document.getElementById("inventoryModalTitle");

    title.textContent = inventory
      ? "Edit Inventory Item"
      : "Add New Inventory Item";

    try {
      if (inventory) {
        this.fillInventoryForm(inventory);
      } else {
        this.resetInventoryForm();
      }
    } catch (error) {
      console.error("Error setting up inventory form:", error);
    }

    const branchInfo = document.getElementById("inventoryBranchInfo");
    if (branchInfo) {
      if (this.isAdmin) {
        branchInfo.innerHTML = `
          <label class="block text-sm font-medium text-blue-700 mb-2">Select Branch *</label>
          <select id="inventoryBranch" class="form-select-kstreet">
            <option value="main">Main Branch</option>
            <option value="north">North Branch</option>
            <option value="south">South Branch</option>
          </select>
        `;
        if (inventory) {
          const branchSelect = document.getElementById("inventoryBranch");
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

    modal.classList.remove("hidden");
  }

  showDeleteModal(type, id) {
    this.currentModalType = type;
    if (type === "product") {
      this.itemToDelete = this.products.find((item) => item.id === id);
    } else {
      this.inventoryToDelete = this.inventory.find((item) => item.id === id);
    }

    const item =
      type === "product" ? this.itemToDelete : this.inventoryToDelete;
    if (!item) return;

    const modal = document.getElementById("deleteModal");
    document.getElementById(
      "deleteMessage"
    ).textContent = `Are you sure you want to delete this ${
      type === "product" ? "product" : "inventory item"
    }?`;
    document.getElementById("deleteItemName").textContent = item.name;
    document.getElementById("deleteItemCode").textContent = item.product_code;
    document.getElementById("deleteItemBranch").textContent = item.branch;

    modal.classList.remove("hidden");
  }

  fillProductForm(product) {
    document.getElementById("productCode").value = product.product_code;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category || "";
    document.getElementById("productDescType").value = product.description_type;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productImage").value = product.image;

    if (this.isAdmin) {
      const productBranch = document.getElementById("productBranch");
      if (productBranch) {
        productBranch.value = product.branch;
      }
    }

    this.handleDescTypeChange(product.description_type);
    this.updateImagePreview(product.image);
  }

  fillInventoryForm(inventory) {
    // KEEP INVENTORY FORM FILLING AS IS
    const displayItem = this.convertToDisplayUnit(inventory);

    const fields = {
      inventoryProductCode: displayItem.product_code,
      inventoryName: displayItem.name,
      inventoryCategory: displayItem.category,
      inventoryUnit: displayItem.unit,
      inventoryDescription: displayItem.description || "",
      inventoryCurrentStock: "0",
      inventoryQuantity: "1",
      inventoryMinStock: displayItem.min_stock,
      inventorySupplier: displayItem.supplier || "",
      inventoryPrice: displayItem.price || "",
    };

    for (const [id, value] of Object.entries(fields)) {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    }

    if (this.isAdmin) {
      const inventoryBranch = document.getElementById("inventoryBranch");
      if (inventoryBranch) inventoryBranch.value = displayItem.branch;
    }

    const existingStockInfo = document.getElementById("existingStockInfo");
    if (existingStockInfo) {
      existingStockInfo.classList.remove("hidden");
      const existingStockDisplay = document.getElementById(
        "existingStockDisplay"
      );
      const existingUnitDisplay = document.getElementById(
        "existingUnitDisplay"
      );
      if (existingStockDisplay) {
        existingStockDisplay.textContent = parseFloat(
          displayItem.current_stock
        ).toFixed(2);
      }
      if (existingUnitDisplay) {
        existingUnitDisplay.textContent =
          displayItem.display_unit || displayItem.unit;
      }
    }

    try {
      this.updateInventoryLabels(displayItem.unit);
      this.updateInventoryCalculations();
    } catch (error) {
      console.error("Error updating inventory calculations:", error);
    }
  }

  resetProductForm() {
    document.getElementById("productCode").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productDescType").value = "k-street food";
    document.getElementById("productPrice").value = "";
    document.getElementById("productImage").value = "";

    if (this.isAdmin) {
      const productBranch = document.getElementById("productBranch");
      if (productBranch) productBranch.value = this.user.branch;
    }

    this.handleDescTypeChange("k-street food");
    this.updateImagePreview("");
  }

  resetInventoryForm() {
    // KEEP INVENTORY FORM RESET AS IS
    const fields = {
      inventoryProductCode: "",
      inventoryName: "",
      inventoryCategory: "Raw Material",
      inventoryUnit: "pcs",
      inventoryDescription: "",
      inventoryCurrentStock: "0",
      inventoryQuantity: "1",
      inventoryMinStock: "0",
      inventorySupplier: "",
      inventoryPrice: "",
    };

    for (const [id, value] of Object.entries(fields)) {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    }

    if (this.isAdmin) {
      const inventoryBranch = document.getElementById("inventoryBranch");
      if (inventoryBranch) inventoryBranch.value = this.user.branch;
    }

    const existingStockInfo = document.getElementById("existingStockInfo");
    if (existingStockInfo) existingStockInfo.classList.add("hidden");

    try {
      this.updateInventoryLabels("pcs");
      this.updateInventoryCalculations();
    } catch (error) {
      console.error("Error updating inventory calculations:", error);
    }
  }

  handleDescTypeChange(descType) {
    const priceField = document.getElementById("productPrice");
    const priceNote = document.getElementById("priceNote");
    const flavorNote = document.getElementById("flavorNote");

    if (!priceField) return;

    if (descType === "k-street Flavor") {
      priceField.value = "0";
      priceField.disabled = true;
      priceField.classList.add("bg-gray-100", "text-gray-500");
      if (priceNote) priceNote.classList.remove("hidden");
      if (flavorNote) flavorNote.classList.remove("hidden");
    } else {
      priceField.disabled = false;
      priceField.classList.remove("bg-gray-100", "text-gray-500");
      if (priceNote) priceNote.classList.add("hidden");
      if (flavorNote) flavorNote.classList.add("hidden");
    }
  }

  updateInventoryLabels(unit) {
    // KEEP INVENTORY LABELS AS IS
    const labels = {
      pcs: "pcs",
      kg: "kg",
      grams: "grams",
      liters: "liters",
      packs: "packs",
      bottles: "bottles",
    };

    const currentStockLabel = document.getElementById("currentStockLabel");
    const quantityLabel = document.getElementById("quantityLabel");
    const minStockLabel = document.getElementById("minStockLabel");
    const totalQuantityDisplay = document.getElementById(
      "totalQuantityDisplay"
    );
    const existingUnitDisplay = document.getElementById("existingUnitDisplay");
    const finalUnitDisplay = document.getElementById("finalUnitDisplay");

    if (currentStockLabel)
      currentStockLabel.textContent = `Stock per Item (${labels[unit]})`;
    if (quantityLabel) quantityLabel.textContent = "Number of Items";
    if (minStockLabel)
      minStockLabel.textContent = `Min Stock (${labels[unit]})`;
    if (totalQuantityDisplay)
      totalQuantityDisplay.textContent = "0 " + labels[unit];
    if (existingUnitDisplay) existingUnitDisplay.textContent = labels[unit];
    if (finalUnitDisplay) finalUnitDisplay.textContent = labels[unit];
  }

  updateInventoryCalculations() {
    // KEEP INVENTORY CALCULATIONS AS IS
    const stockPerItemEl = document.getElementById("inventoryCurrentStock");
    const quantityEl = document.getElementById("inventoryQuantity");
    const pricePerItemEl = document.getElementById("inventoryPrice");
    const unitEl = document.getElementById("inventoryUnit");

    if (!stockPerItemEl || !quantityEl || !unitEl) {
      console.warn("Missing inventory calculation elements");
      return;
    }

    const stockPerItem = parseFloat(stockPerItemEl.value) || 0;
    const quantity = parseFloat(quantityEl.value) || 1;
    const pricePerItem = parseFloat(pricePerItemEl?.value) || 0;
    const unit = unitEl.value;

    const totalQuantity = stockPerItem * quantity;
    const totalPrice = pricePerItem * quantity;

    let existingStock = 0;
    if (this.editingInventory) {
      const displayItem = this.convertToDisplayUnit(this.editingInventory);
      existingStock = parseFloat(displayItem.current_stock) || 0;
    }

    const finalStock = existingStock + totalQuantity;

    const labels = {
      pcs: "pcs",
      kg: "kg",
      grams: "grams",
      liters: "liters",
      packs: "packs",
      bottles: "bottles",
    };

    const totalQuantityDisplay = document.getElementById(
      "totalQuantityDisplay"
    );
    const totalPriceDisplay = document.getElementById("totalPriceDisplay");
    const finalStockDisplay = document.getElementById("finalStockDisplay");

    if (totalQuantityDisplay) {
      totalQuantityDisplay.textContent = `${totalQuantity.toFixed(2)} ${
        labels[unit]
      }`;
    }
    if (totalPriceDisplay) {
      totalPriceDisplay.textContent = `₱${totalPrice.toFixed(2)}`;
    }
    if (finalStockDisplay) {
      finalStockDisplay.textContent = `${finalStock.toFixed(2)} ${
        labels[unit]
      }`;
    }
  }

  updateImagePreview(imageUrl) {
    const preview = document.getElementById("imagePreview");
    const img = document.getElementById("previewImage");

    if (!preview || !img) return;

    if (imageUrl) {
      img.src = imageUrl;
      img.onerror = () => {
        img.src = "https://via.placeholder.com/150?text=No+Image";
      };
      preview.classList.remove("hidden");
    } else {
      preview.classList.add("hidden");
    }
  }

  saveProduct() {
    const productCode = document.getElementById("productCode").value.trim();
    const productName = document.getElementById("productName").value.trim();
    const productCategory = document
      .getElementById("productCategory")
      .value.trim();
    const productImage = document.getElementById("productImage").value.trim();
    const productPrice = document.getElementById("productPrice").value;

    if (!productCode || !productName || !productCategory || !productImage) {
      alert("Please fill in all required fields!");
      return;
    }

    const descType = document.getElementById("productDescType").value;
    if (descType !== "k-street Flavor" && !productPrice) {
      alert("Please enter a price for non-flavor items!");
      return;
    }

    let branch;
    if (this.isAdmin) {
      branch = document.getElementById("productBranch").value;
      if (!branch) {
        alert("Please select a branch!");
        return;
      }
    } else {
      branch = this.user.branch;
    }

    const formData = new FormData();
    formData.append("product_code", productCode);
    formData.append("name", productName);
    formData.append("category", productCategory);
    formData.append("description_type", descType);
    formData.append(
      "price",
      descType === "k-street Flavor" ? "0" : productPrice
    );
    formData.append("image", productImage);
    formData.append("branch", branch);

    if (this.editingItem) {
      formData.append("id", this.editingItem.id);
    }

    this.showLoading(true);

    fetch("backend/save_products.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        this.showLoading(false);

        if (data.success) {
          this.showSuccess(data.message);
          document.getElementById("productModal").classList.add("hidden");
          // Reload data instead of full page refresh
          this.loadData().then(() => {
            this.renderProductsTable();
          });
        } else {
          alert("Error: " + data.error);
        }
      })
      .catch((error) => {
        this.showLoading(false);
        alert("Error: " + error.message);
      });
  }

  saveInventory() {
    // KEEP INVENTORY SAVE AS IS
    const productCode = document
      .getElementById("inventoryProductCode")
      .value.trim();
    const itemName = document.getElementById("inventoryName").value.trim();
    const unit = document.getElementById("inventoryUnit").value;

    if (!productCode || !itemName || !unit) {
      this.showError("Please fill in all required fields!");
      return;
    }

    let branch;
    if (this.isAdmin) {
      branch = document.getElementById("inventoryBranch").value;
      if (!branch) {
        this.showError("Please select a branch!");
        return;
      }
    } else {
      branch = this.user.branch;
    }

    const stockPerItem =
      parseFloat(document.getElementById("inventoryCurrentStock").value) || 0;
    const quantity =
      parseFloat(document.getElementById("inventoryQuantity").value) || 1;
    const pricePerItem =
      parseFloat(document.getElementById("inventoryPrice").value) || 0;

    const totalCurrentStock = stockPerItem * quantity;
    const totalPrice = pricePerItem * quantity;

    let finalCurrentStock = totalCurrentStock;
    if (this.editingInventory) {
      finalCurrentStock += parseFloat(this.editingInventory.current_stock);
    }

    const itemToSave = this.convertToStorageUnit({
      product_code: productCode.toUpperCase(),
      name: itemName,
      category: document.getElementById("inventoryCategory").value,
      description: document.getElementById("inventoryDescription").value.trim(),
      unit: unit,
      current_stock: finalCurrentStock,
      min_stock:
        parseFloat(document.getElementById("inventoryMinStock").value) || 0,
      supplier: document.getElementById("inventorySupplier").value.trim(),
      price: pricePerItem,
      total_price: totalPrice,
      branch: branch,
    });

    this.showLoading(true);
    setTimeout(() => {
      if (this.editingInventory) {
        Object.assign(this.editingInventory, itemToSave);
        this.showSuccess("Inventory item updated successfully!");
      } else {
        const newInventory = {
          id: this.inventory.length + 1,
          ...itemToSave,
          display_unit: unit === "liters" ? "ml" : unit,
        };
        this.inventory.push(newInventory);
        this.showSuccess("Inventory item added successfully!");
      }

      this.showLoading(false);
      document.getElementById("inventoryModal").classList.add("hidden");
      this.renderInventoryTable();
      this.editingInventory = null;
    }, 1000);
  }

  confirmDelete() {
    this.showLoading(true);
    setTimeout(() => {
      if (this.currentModalType === "product") {
        const index = this.products.findIndex(
          (item) => item.id === this.itemToDelete.id
        );
        if (index > -1) {
          this.products.splice(index, 1);
        }
        this.showSuccess("Product deleted successfully!");
      } else {
        const index = this.inventory.findIndex(
          (item) => item.id === this.inventoryToDelete.id
        );
        if (index > -1) {
          this.inventory.splice(index, 1);
        }
        this.showSuccess("Inventory item deleted successfully!");
      }

      this.showLoading(false);
      document.getElementById("deleteModal").classList.add("hidden");
      this.renderCurrentTable();
      this.itemToDelete = null;
      this.inventoryToDelete = null;
    }, 1000);
  }

  viewProduct(productId) {
    const product = this.products.find((item) => item.id === productId);
    if (!product) return;

    const modal = document.getElementById("viewModal");
    document.getElementById("viewProductImage").src = product.image;
    document.getElementById("viewProductCode").textContent =
      product.product_code;
    document.getElementById("viewProductName").textContent = product.name;
    document.getElementById("viewProductCategory").textContent =
      product.category || "Not Set";
    document.getElementById("viewProductDescType").textContent =
      product.description_type;
    document.getElementById("viewProductPrice").textContent = `₱${parseFloat(
      product.price
    ).toFixed(2)}`;
    document.getElementById("viewProductBranch").textContent = product.branch;

    modal.classList.remove("hidden");
  }

  editProduct(productId) {
    const product = this.products.find((item) => item.id === productId);
    if (!product) return;

    this.showProductModal(product);
  }

  editInventory(inventoryId) {
    // KEEP INVENTORY EDIT AS IS
    const inventory = this.inventory.find((item) => item.id === inventoryId);
    if (!inventory) return;

    this.showInventoryModal(inventory);
  }

  getStockStatus(item) {
    if (item.current_stock <= 0) {
      return "out-of-stock";
    } else if (item.current_stock <= item.min_stock) {
      return "low-stock";
    } else {
      return "in-stock";
    }
  }

  convertToDisplayUnit(item) {
    if (!item) return item;

    if (item.unit === "liters") {
      return {
        ...item,
        current_stock: item.current_stock * 1000,
        min_stock: item.min_stock * 1000,
        display_unit: "ml",
      };
    }
    return { ...item, display_unit: item.unit };
  }

  convertToStorageUnit(item) {
    if (!item) return item;

    if (item.unit === "liters") {
      return {
        ...item,
        current_stock: item.current_stock / 1000,
        min_stock: item.min_stock / 1000,
      };
    }
    return item;
  }

  showSuccess(message) {
    const modal = document.getElementById("successModal");
    document.getElementById("successTitle").textContent = "Success!";
    document.getElementById("successMessage").textContent = message;
    modal.classList.remove("hidden");
  }

  showError(message) {
    alert(message);
  }

  showLoading(show) {
    document.getElementById("loadingOverlay").style.display = show
      ? "flex"
      : "none";
  }
}

// Initialize the system
document.addEventListener("DOMContentLoaded", function () {
  window.productSystem = new ProductsInventorySystem();
});
