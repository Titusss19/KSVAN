// sales.js - COMPLETE VERSION WITH FIXED CASHIER SESSION EXPORT
class SalesReport {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalRecords = 0;
    this.salesData = [];
    this.selectedOrder = null;
    this.activeTab = "sales";

    // Cashier report properties
    this.cashierCurrentPage = 1;
    this.cashierTotalPages = 1;
    this.cashierTotalRecords = 0;
    this.cashierData = [];
    this.selectedSession = null;

    // Void report properties
    this.voidCurrentPage = 1;
    this.voidTotalPages = 1;
    this.voidTotalRecords = 0;
    this.voidData = [];

      // Cash-out report properties
  this.cashoutCurrentPage = 1;
  this.cashoutTotalPages = 1;
  this.cashoutTotalRecords = 0;
  this.cashoutData = [];

    console.log("🔍 Checking modals...");
    console.log(
      "receiptModal exists:",
      !!document.getElementById("receiptModal")
    );
    console.log("voidModal exists:", !!document.getElementById("voidModal"));
    console.log(
      "cashierDetailModal exists:",
      !!document.getElementById("cashierDetailModal")
    );
    console.log(
      "loadingOverlay exists:",
      !!document.getElementById("loadingOverlay")
    );

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSales();

    // Load branches if admin
    if (this.isAdmin()) {
      this.loadBranches();
    }
  }

  isAdmin() {
    return (
      window.currentUser &&
      (window.currentUser.role === "admin" ||
        window.currentUser.role === "owner")
    );
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll(".tab-btn-kstreet").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Filter change
    document.getElementById("timeRange").addEventListener("change", (e) => {
      const customRange = document.getElementById("customDateRange");
      if (e.target.value === "custom") {
        customRange.classList.remove("hidden");
      } else {
        customRange.classList.add("hidden");
      }
    });

    // Apply filters
    document.getElementById("applyFilters").addEventListener("click", () => {
      if (this.activeTab === "sales") {
        this.currentPage = 1;
        this.loadSales();
      } else if (this.activeTab === "cashier") {
        this.cashierCurrentPage = 1;
        this.loadCashierSessions();
      } else if (this.activeTab === "void") {
        this.voidCurrentPage = 1;
        this.loadVoidOrders();
      } else if (this.activeTab === 'cashout') {
    this.cashoutCurrentPage = 1;
    this.loadCashoutRecords();
  }
    });

    // Export Excel
    document.getElementById("exportExcel").addEventListener("click", () => {
      if (this.activeTab === "sales") {
        this.exportSalesToExcel();
      } else if (this.activeTab === "cashier") {
        this.exportCashierToExcel();
      } else if (this.activeTab === "void") {
        this.exportVoidToExcel();
      } else if (this.activeTab === 'cashout') {  // ADD THIS
    this.exportCashoutToExcel();
  }
    });

    // Sales Pagination
    document.getElementById("prevPage").addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadSales();
      }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadSales();
      }
    });

    // Cashier Pagination
    const cashierPrevBtn = document.getElementById("cashierPrevPage");
    const cashierNextBtn = document.getElementById("cashierNextPage");

    if (cashierPrevBtn) {
      cashierPrevBtn.addEventListener("click", () => {
        if (this.cashierCurrentPage > 1) {
          this.cashierCurrentPage--;
          this.loadCashierSessions();
        }
      });
    }

    if (cashierNextBtn) {
      cashierNextBtn.addEventListener("click", () => {
        if (this.cashierCurrentPage < this.cashierTotalPages) {
          this.cashierCurrentPage++;
          this.loadCashierSessions();
        }
      });
    }

    // Void Pagination
    const voidPrevBtn = document.getElementById("voidPrevPage");
    const voidNextBtn = document.getElementById("voidNextPage");

    if (voidPrevBtn) {
      voidPrevBtn.addEventListener("click", () => {
        if (this.voidCurrentPage > 1) {
          this.voidCurrentPage--;
          this.loadVoidOrders();
        }
      });
    }

    if (voidNextBtn) {
      voidNextBtn.addEventListener("click", () => {
        if (this.voidCurrentPage < this.voidTotalPages) {
          this.voidCurrentPage++;
          this.loadVoidOrders();
        }
      });
    }

    // Receipt modal close
    const closeReceiptBtn = document.getElementById("closeReceipt");
    if (closeReceiptBtn) {
      closeReceiptBtn.addEventListener("click", () => {
        this.closeModal("receiptModal");
      });
    }

    const printReceiptBtn = document.getElementById("printReceipt");
    if (printReceiptBtn) {
      printReceiptBtn.addEventListener("click", () => {
        this.printReceipt();
      });
    }

    // Void modal close
    const cancelVoidBtn = document.getElementById("cancelVoid");
    if (cancelVoidBtn) {
      cancelVoidBtn.addEventListener("click", () => {
        this.closeModal("voidModal");
      });
    }

    const confirmVoidBtn = document.getElementById("confirmVoid");
    if (confirmVoidBtn) {
      confirmVoidBtn.addEventListener("click", () => {
        this.confirmVoid();
      });
    }

    // Cashier detail modal close
    const closeCashierDetailBtn = document.getElementById("closeCashierDetail");
    if (closeCashierDetailBtn) {
      closeCashierDetailBtn.addEventListener("click", () => {
        this.closeModal("cashierDetailModal");
      });
    }

    const printCashierBtn = document.getElementById("printCashierReport");
    if (printCashierBtn) {
      printCashierBtn.addEventListener("click", () => {
        this.printCashierReport();
      });
    }

    const exportCashierBtn = document.getElementById("exportCashierSession");
    if (exportCashierBtn) {
      exportCashierBtn.addEventListener("click", () => {
        this.exportCashierSessionToExcel();
      });
    }

    // Close all modals with X button or backdrop click
    document.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("modal-close") ||
        e.target.closest(".modal-close")
      ) {
        const modal = e.target.closest(".modal-overlay");
        if (modal) {
          modal.classList.add("hidden");
        }
      }

      if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.add("hidden");
      }
    });

    const cashoutPrevBtn = document.getElementById('cashoutPrevPage');
  const cashoutNextBtn = document.getElementById('cashoutNextPage');
   if (cashoutPrevBtn) {
    cashoutPrevBtn.addEventListener('click', () => {
      if (this.cashoutCurrentPage > 1) {
        this.cashoutCurrentPage--;
        this.loadCashoutRecords();
      }
    });
  }

  if (cashoutNextBtn) {
    cashoutNextBtn.addEventListener('click', () => {
      if (this.cashoutCurrentPage < this.cashoutTotalPages) {
        this.cashoutCurrentPage++;
        this.loadCashoutRecords();
      }
    });
  }

  const cancelEditCashoutBtn = document.getElementById('cancelEditCashout');
  if (cancelEditCashoutBtn) {
    cancelEditCashoutBtn.addEventListener('click', () => {
      this.closeModal('editCashoutModal');
    });
  }

  const confirmEditCashoutBtn = document.getElementById('confirmEditCashout');
  if (confirmEditCashoutBtn) {
    confirmEditCashoutBtn.addEventListener('click', () => {
      this.confirmEditCashout();
    });
  }
  }

  // ============================================
  // TAB SWITCHING
  // ============================================
  switchTab(tab) {
    this.activeTab = tab;

    // Update tab buttons
    document.querySelectorAll(".tab-btn-kstreet").forEach((btn) => {
      if (btn.dataset.tab === tab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Hide all report panes
    document.querySelectorAll(".report-pane").forEach((pane) => {
      pane.classList.add("hidden");
    });

    // Show selected pane and load data
    if (tab === "sales") {
      document.getElementById("salesReport").classList.remove("hidden");
      if (this.salesData.length === 0) {
        this.loadSales();
      }
    } else if (tab === "cashier") {
      document.getElementById("cashierReport").classList.remove("hidden");
      if (this.cashierData.length === 0) {
        this.loadCashierSessions();
      }
    } else if (tab === "void") {
      document.getElementById("voidReport").classList.remove("hidden");
      if (this.voidData.length === 0) {
        this.loadVoidOrders();
      }
    } else if (tab === 'cashout') {
    document.getElementById('cashoutReport').classList.remove('hidden');
    if (this.cashoutData.length === 0) {
      this.loadCashoutRecords();
    }
  }
  }

  // Helper method
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  // ============================================
  // LOAD SALES
  // ============================================
  async loadSales() {
    this.showLoading(true);

    const params = new URLSearchParams({
      action: "sales",
      page: this.currentPage,
      limit: this.itemsPerPage,
      branch: document.getElementById("branchFilter")
        ? document.getElementById("branchFilter").value
        : "all",
      timeRange: document.getElementById("timeRange").value,
      payment: document.getElementById("paymentFilter").value,
      orderType: document.getElementById("orderTypeFilter").value,
    });

    if (document.getElementById("timeRange").value === "custom") {
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
    }

    try {
      const response = await fetch(`backend/salesapi.php?${params.toString()}`);
      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Response was:", responseText);
        throw new Error("Server returned invalid response");
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to load sales");
      }

      this.salesData = result.data;
      this.totalRecords = result.pagination.total;
      this.totalPages = result.pagination.pages;

      this.renderSalesTable();
      this.updatePagination();
    } catch (error) {
      console.error("Error loading sales:", error);
      this.showNotification(
        "error",
        "Failed to load sales data: " + error.message
      );
    } finally {
      this.showLoading(false);
    }
  }

  // ============================================
  // LOAD CASHIER SESSIONS
  // ============================================
  async loadCashierSessions() {
    this.showLoading(true);

    const params = new URLSearchParams({
      action: "cashier-sessions",
      page: this.cashierCurrentPage,
      limit: this.itemsPerPage,
      branch: document.getElementById("branchFilter")
        ? document.getElementById("branchFilter").value
        : "all",
      timeRange: document.getElementById("timeRange").value,
    });

    if (document.getElementById("timeRange").value === "custom") {
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
    }

    try {
      const response = await fetch(`backend/salesapi.php?${params.toString()}`);
      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Response was:", responseText);
        throw new Error("Server returned invalid response");
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to load cashier sessions");
      }

      this.cashierData = result.data;
      this.cashierTotalRecords = result.pagination.total;
      this.cashierTotalPages = result.pagination.pages;

      this.renderCashierTable();
      this.updateCashierPagination();
    } catch (error) {
      console.error("Error loading cashier sessions:", error);
      this.showNotification(
        "error",
        "Failed to load cashier sessions: " + error.message
      );
    } finally {
      this.showLoading(false);
    }
  }

  // ============================================
  // LOAD VOID ORDERS
  // ============================================
  async loadVoidOrders() {
    this.showLoading(true);

    const params = new URLSearchParams({
      action: "void-orders",
      page: this.voidCurrentPage,
      limit: this.itemsPerPage,
      branch: document.getElementById("branchFilter")
        ? document.getElementById("branchFilter").value
        : "all",
      timeRange: document.getElementById("timeRange").value,
    });

    if (document.getElementById("timeRange").value === "custom") {
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
    }

    try {
      const response = await fetch(`backend/salesapi.php?${params.toString()}`);
      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Server returned invalid response");
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to load void orders");
      }

      this.voidData = result.data;
      this.voidTotalRecords = result.pagination.total;
      this.voidTotalPages = result.pagination.pages;

      // Update void count badge
      const voidCountBadge = document.getElementById("voidCount");
      if (voidCountBadge) {
        voidCountBadge.textContent = this.voidTotalRecords;
      }

      this.renderVoidTable();
      this.updateVoidPagination();
    } catch (error) {
      console.error("Error loading void orders:", error);
      this.showNotification(
        "error",
        "Failed to load void orders: " + error.message
      );
    } finally {
      this.showLoading(false);
    }
  }

  async loadBranches() {
    try {
      const response = await fetch("backend/salesapi.php?action=branches");
      const result = await response.json();

      if (result.success) {
        const branchFilter = document.getElementById("branchFilter");
        if (branchFilter) {
          branchFilter.innerHTML = '<option value="all">All Branches</option>';
          result.data.forEach((branch) => {
            branchFilter.innerHTML += `<option value="${branch}">${branch}</option>`;
          });
        }
      }
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  }

  // ============================================
  // RENDER SALES TABLE
  // ============================================
// Updated renderSalesTable() function with merged Cashier/Payment column

renderSalesTable() {
    const tbody = document.getElementById("salesTableBody");
    const emptyState = document.getElementById("salesEmptyState");

    if (this.salesData.length === 0) {
      tbody.innerHTML = "";
      emptyState.classList.remove("hidden");
      document.getElementById("salesPagination").classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    document.getElementById("salesPagination").classList.remove("hidden");

    tbody.innerHTML = this.salesData
      .map(
        (order) => `
            <tr class="hover:bg-red-50 transition-colors duration-150">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    #${order.id}
                    ${
                      order.is_void
                        ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">VOIDED</span>'
                        : ""
                    }
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                    <div class="flex flex-col">
                        <span class="font-medium text-gray-900">${this.formatDate(order.created_at)}</span>
                        <span class="text-xs text-gray-500">${this.formatTimeOnly(order.created_at)}</span>
                    </div>
                </td>
                <td class="px-6 py-4 order-details-cell">
                    <div class="space-y-1">
                        <div class="products-list">
                            ${this.formatProductNames(order)}
                        </div>
                        <div class="order-meta">
                            <span class="amount">₱${parseFloat(order.total).toFixed(2)}</span>
                            <span class="order-type-badge ${this.getOrderTypeClass(order.orderType)}">
                                ${order.orderType}
                            </span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="space-y-1">
                        <div class="text-sm font-medium text-gray-700">
                            ${order.cashier_name || order.cashier_email || "Unknown"}
                        </div>
                        <div class="flex items-center gap-3 text-xs text-gray-600">
                            <div>
                                <span class="text-gray-500">Paid: <br></span>
                                <span class="font-semibold text-green-600">₱${parseFloat(order.paidAmount).toFixed(2)}</span>
                            </div>
                            <div>
                                <span class="text-gray-500">Change: <br></span>
                                <span class="font-semibold text-blue-600">₱${parseFloat(order.changeAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${this.getPaymentMethodClass(order.payment_method)}">
                        ${order.payment_method || "Cash"}
                    </span>
                </td>
                <td class="px-4 py-2 text-center">
                    <div class="flex space-x-2 justify-center">
                        <button onclick="salesReport.viewReceipt(${
                          order.id
                        })" class="bg-gradient-to-r from-black to-black text-white px-4 py-2 rounded-lg hover:from-black hover:to-black transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">
                            View
                        </button>
                        ${
                          !order.is_void
                            ? `
                        <button onclick="salesReport.showVoidModal(${order.id})" class="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">
                            Void
                        </button>
                        `
                            : ""
                        }
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
}

  getOrderTypeClass(orderType) {
    if (orderType === "Dine In") return "order-type-dinein";
    if (orderType === "Take Out") return "order-type-takeout";
    if (orderType === "Delivery") return "order-type-delivery";
    return "order-type-dinein"; // default
  }

  // Helper method to get payment method CSS class
  getPaymentMethodClass(paymentMethod) {
    const method = (paymentMethod || "Cash").toLowerCase();
    if (method.includes("cash")) return "bg-green-100 text-green-800";
    if (method.includes("gcash")) return "bg-blue-100 text-blue-800";
    if (method.includes("grab")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  }

  // ============================================
  // RENDER CASHIER TABLE
  // ============================================
 // Replace your renderCashierTable() method with this merged version:

renderCashierTable() {
    const tbody = document.getElementById("cashierTableBody");
    const emptyState = document.getElementById("cashierEmptyState");

    if (this.cashierData.length === 0) {
      tbody.innerHTML = "";
      emptyState.classList.remove("hidden");
      document.getElementById("cashierPagination").classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    document.getElementById("cashierPagination").classList.remove("hidden");

    tbody.innerHTML = this.cashierData
      .map(
        (session) => `
            <tr class="hover:bg-red-50 transition-colors duration-150">
                ${
                  this.isAdmin()
                    ? `
                <td class="px-6 py-4 text-sm font-medium text-blue-700">
                    ${session.branch || "Unknown"}
                </td>
                `
                    : ""
                }
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    ${session.username || session.user_email || "Unknown"}
                </td>
                
                <!-- MERGED: Session Period (Login + Logout Time) -->
                <td class="px-6 py-4 text-sm text-gray-600">
                    <div class="flex flex-col space-y-1">
                        <span class="font-medium text-gray-900">${this.formatDate(session.login_time)}</span>
                        <div class="flex items-center gap-2 text-xs">
                            <span class="text-green-600 font-semibold">${this.formatTimeOnly(session.login_time)}</span>
                            <span class="text-gray-400">→</span>
                            <span class="${session.logout_time ? 'text-red-600 font-semibold' : 'text-orange-500 font-medium'}">
                                ${session.logout_time ? this.formatTimeOnly(session.logout_time) : 'Still Active'}
                            </span>
                        </div>
                    </div>
                </td>
                
                <td class="px-6 py-4 text-sm text-gray-700 text-center">
                    ${session.session_duration}
                </td>
                
                <!-- MERGED: Sales Summary (Start + End + Session + Discount + Void) -->
                <td class="px-6 py-4">
                    <div class="space-y-1 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">Start:</span>
                            <span class="font-semibold text-gray-700">₱${parseFloat(session.start_gross_sales).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">End:</span>
                            <span class="font-semibold text-gray-700">₱${parseFloat(session.end_gross_sales).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center pt-1 border-t border-gray-200">
                            <span class="text-green-700 font-medium">Session:</span>
                            <span class="font-bold text-green-600">₱${parseFloat(session.session_sales).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center pt-1 border-t border-gray-200">
                            <span class="text-blue-600">Discount:</span>
                            <span class="font-semibold text-blue-600">₱${parseFloat(session.total_discount).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-red-600">Void:</span>
                            <span class="font-semibold text-red-600">
                                ₱${parseFloat(session.total_void).toFixed(2)}
                                ${session.void_count > 0 ? `<span class="text-xs ml-1">(${session.void_count})</span>` : ''}
                            </span>
                        </div>
                    </div>
                </td>
                
                <td class="px-4 py-2 text-center">
                    <button onclick="salesReport.viewCashierDetails(${
                      session.id
                    })" class="bg-gradient-to-r from-black to-black text-white px-4 py-2 rounded-lg hover:from-black hover:to-black transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">
                        View Details
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
}

  // ============================================
  // RENDER VOID TABLE
  // ============================================
// Replace your renderVoidTable() method with this merged version:

renderVoidTable() {
    const tbody = document.getElementById("voidTableBody");
    const emptyState = document.getElementById("voidEmptyState");

    if (this.voidData.length === 0) {
      tbody.innerHTML = "";
      emptyState.classList.remove("hidden");
      document.getElementById("voidPagination").classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    document.getElementById("voidPagination").classList.remove("hidden");

    tbody.innerHTML = this.voidData
      .map(
        (order) => `
            <tr class="hover:bg-red-50 transition-colors duration-150">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    #${order.id}
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">VOIDED</span>
                </td>
                ${
                  this.isAdmin()
                    ? `
                <td class="px-6 py-4 text-sm font-medium text-blue-700">
                    ${order.branch || "Unknown"}
                </td>
                `
                    : ""
                }
                
                <!-- MERGED: Transaction Dates (Void Date + Original Date) -->
                <td class="px-6 py-4">
                    <div class="space-y-1 text-xs">
                        <div class="flex flex-col">
                            <span class="text-red-600 font-semibold">Voided:</span>
                            <span class="text-gray-700">${
                              order.voided_at
                                ? this.formatDate(order.voided_at)
                                : "N/A"
                            }</span>
                            <span class="text-gray-500">${
                              order.voided_at
                                ? this.formatTimeOnly(order.voided_at)
                                : ""
                            }</span>
                        </div>
                        <div class="flex flex-col pt-2 border-t border-gray-200">
                            <span class="text-gray-600 font-semibold">Original:</span>
                            <span class="text-gray-700">${this.formatDate(order.created_at)}</span>
                            <span class="text-gray-500">${this.formatTimeOnly(order.created_at)}</span>
                        </div>
                    </div>
                </td>
                
                <!-- MERGED: Order Details (Products + Amount + Order Type) -->
                <td class="px-6 py-4">
                    <div class="space-y-1">
                        <div class="text-sm text-gray-700 max-w-xs">
                            <div class="line-clamp-2" title="${this.formatProductNames(order)}">
                                ${this.formatProductNames(order)}
                            </div>
                        </div>
                        <div class="flex items-center gap-2 text-xs pt-1">
                            <span class="font-bold text-red-600">₱${parseFloat(order.total).toFixed(2)}</span>
                            <span class="text-gray-400">•</span>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                ${order.orderType}
                            </span>
                        </div>
                    </div>
                </td>
                
                <!-- MERGED: Personnel (Cashier + Voided By) -->
                <td class="px-6 py-4">
                    <div class="space-y-1 text-xs">
                        <div class="flex flex-col">
                            <span class="text-gray-500">Cashier:</span>
                            <span class="text-gray-900 font-medium">${order.cashier_name || order.cashier_email || "Unknown"}</span>
                        </div>
                        <div class="flex flex-col pt-2 border-t border-gray-200">
                            <span class="text-gray-500">Voided by:</span>
                            <span class="text-red-600 font-medium">${order.voided_by || "Admin"}</span>
                        </div>
                    </div>
                </td>
                
                <!-- Void Reason -->
                <td class="px-6 py-4 text-sm text-gray-700">
                    <div class="max-w-xs">
                        ${
                          order.void_reason
                            ? `<span class="text-gray-800">${order.void_reason}</span>`
                            : '<span class="text-gray-500 italic">No reason provided</span>'
                        }
                    </div>
                </td>
                
                <td class="px-4 py-2 text-center">
                    <button onclick="salesReport.viewReceipt(${
                      order.id
                    })" class="bg-gradient-to-r from-black to-black text-white px-4 py-2 rounded-lg hover:from-black hover:to-black transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">
                        View Receipt
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
}

  // ============================================
  // UPDATE PAGINATION
  // ============================================
  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(
      this.currentPage * this.itemsPerPage,
      this.totalRecords
    );

    document.getElementById("salesStart").textContent = start;
    document.getElementById("salesEnd").textContent = end;
    document.getElementById("salesTotal").textContent = this.totalRecords;
    document.getElementById("currentPage").textContent = this.currentPage;

    document.getElementById("prevPage").disabled = this.currentPage === 1;
    document.getElementById("nextPage").disabled =
      this.currentPage === this.totalPages;
  }

  updateCashierPagination() {
    const start = (this.cashierCurrentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(
      this.cashierCurrentPage * this.itemsPerPage,
      this.cashierTotalRecords
    );

    const cashierStartEl = document.getElementById("cashierStart");
    const cashierEndEl = document.getElementById("cashierEnd");
    const cashierTotalEl = document.getElementById("cashierTotal");
    const cashierCurrentPageEl = document.getElementById("cashierCurrentPage");

    if (cashierStartEl) cashierStartEl.textContent = start;
    if (cashierEndEl) cashierEndEl.textContent = end;
    if (cashierTotalEl) cashierTotalEl.textContent = this.cashierTotalRecords;
    if (cashierCurrentPageEl)
      cashierCurrentPageEl.textContent = this.cashierCurrentPage;

    const prevBtn = document.getElementById("cashierPrevPage");
    const nextBtn = document.getElementById("cashierNextPage");

    if (prevBtn) prevBtn.disabled = this.cashierCurrentPage === 1;
    if (nextBtn)
      nextBtn.disabled = this.cashierCurrentPage === this.cashierTotalPages;
  }

  updateVoidPagination() {
    const start = (this.voidCurrentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(
      this.voidCurrentPage * this.itemsPerPage,
      this.voidTotalRecords
    );

    const voidStartEl = document.getElementById("voidStart");
    const voidEndEl = document.getElementById("voidEnd");
    const voidTotalEl = document.getElementById("voidTotal");
    const voidCurrentPageEl = document.getElementById("voidCurrentPage");

    if (voidStartEl) voidStartEl.textContent = start;
    if (voidEndEl) voidEndEl.textContent = end;
    if (voidTotalEl) voidTotalEl.textContent = this.voidTotalRecords;
    if (voidCurrentPageEl) voidCurrentPageEl.textContent = this.voidCurrentPage;

    const prevBtn = document.getElementById("voidPrevPage");
    const nextBtn = document.getElementById("voidNextPage");

    if (prevBtn) prevBtn.disabled = this.voidCurrentPage === 1;
    if (nextBtn)
      nextBtn.disabled = this.voidCurrentPage === this.voidTotalPages;
  }

  // ============================================
  // VIEW CASHIER DETAILS
  // ============================================
  async viewCashierDetails(sessionId) {
    this.showLoading(true);

    try {
      const response = await fetch(
        `backend/salesapi.php?action=cashier-details&id=${sessionId}`
      );
      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid JSON response: " + responseText);
      }

      if (!result.success) {
        throw new Error(result.message);
      }

      const session = result.data;
      this.selectedSession = session;

      // Update modal content
      this.renderCashierDetailModal(session);

      // Show modal
      const modal = document.getElementById("cashierDetailModal");
      if (modal) {
        modal.classList.remove("hidden");
      }
    } catch (error) {
      console.error("View Cashier Details Error:", error);
      this.showNotification(
        "error",
        "Failed to load session details: " + error.message
      );
    } finally {
      this.showLoading(false);
    }
  }

  // ============================================
  // RENDER CASHIER DETAIL MODAL
  // ============================================
  renderCashierDetailModal(session) {
    // Header info
    const cashierBranch = document.getElementById("cashierDetailBranch");
    if (cashierBranch) {
      cashierBranch.textContent = session.branch || window.currentUser.branch;
    }

    // Cashier Info Section
    const cashierInfoSection = document.getElementById("cashierInfoSection");
    if (cashierInfoSection) {
      cashierInfoSection.innerHTML = `
        <h3 class="font-bold text-gray-900 mb-3">CASHIER INFORMATION</h3>
        <div class="space-y-2 text-sm">
          <div><strong>Cashier:</strong> ${
            session.username || session.user_email || "Unknown"
          }</div>
          <div><strong>Email:</strong> ${session.user_email}</div>
          <div><strong>Login Time:</strong> ${this.formatDateTime(
            session.login_time
          )}</div>
          <div><strong>Logout Time:</strong> ${
            session.logout_time
              ? this.formatDateTime(session.logout_time)
              : '<span class="text-orange-500">Still Active</span>'
          }</div>
          <div><strong>Session Duration:</strong> ${
            session.session_duration
          }</div>
        </div>
      `;
    }

    // Sales Summary Section
    const salesSummarySection = document.getElementById("salesSummarySection");
    if (salesSummarySection) {
      let paymentMethodsHtml = "";
      if (
        session.payment_methods &&
        Object.keys(session.payment_methods).length > 0
      ) {
        paymentMethodsHtml = `
          <div class="mt-4 pt-4 border-t border-green-200">
            <h4 class="font-bold text-green-800 mb-2 text-sm">PAYMENT METHODS</h4>
            <div class="space-y-1 text-xs">
              ${Object.entries(session.payment_methods)
                .map(
                  ([method, data]) => `
                <div class="flex justify-between">
                  <span>${method}:</span>
                  <div class="text-right">
                    <span class="font-medium">${data.count} transaction${
                    data.count !== 1 ? "s" : ""
                  }</span>
                    <span class="ml-2 font-bold">₱${parseFloat(
                      data.total
                    ).toFixed(2)}</span>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      }

      salesSummarySection.innerHTML = `
        <h3 class="font-bold text-green-800 mb-3">SALES SUMMARY</h3>
        <div class="space-y-2 text-sm">
          <div><strong>Starting Gross Sales:</strong> ₱${parseFloat(
            session.start_gross_sales
          ).toFixed(2)}</div>
          <div><strong>Ending Gross Sales:</strong> ₱${parseFloat(
            session.end_gross_sales
          ).toFixed(2)}</div>
          <div><strong>Sales During Session:</strong> ₱${parseFloat(
            session.session_sales
          ).toFixed(2)}</div>
          <div><strong>Total Transactions:</strong> ${
            session.transaction_count || 0
          }</div>
          
          <div class="pt-3 border-t border-green-200">
            <div class="flex justify-between">
              <span class="font-medium text-green-800">Total Applied Discount:</span>
              <span class="font-bold text-green-700">₱${parseFloat(
                session.total_discount
              ).toFixed(2)}</span>
            </div>
            <div class="flex justify-between mt-1">
              <span class="font-medium text-red-700">Total Void Amount:</span>
              <span class="font-bold text-red-700">
                ₱${parseFloat(session.total_void).toFixed(2)}
                ${
                  session.void_count > 0
                    ? `<span class="text-xs text-red-600 ml-1">(${
                        session.void_count
                      } transaction${
                        session.void_count !== 1 ? "s" : ""
                      })</span>`
                    : ""
                }
              </span>
            </div>
          </div>

          ${paymentMethodsHtml}
        </div>
      `;
    }

    // Orders Table
    const ordersTableBody = document.getElementById("cashierOrdersTableBody");
    if (ordersTableBody && session.orders && session.orders.length > 0) {
      ordersTableBody.innerHTML = session.orders
        .map(
          (order) => `
        <tr class="hover:bg-gray-50">
          <td class="border border-gray-300 px-3 py-2 text-sm">#${order.id}</td>
          ${
            this.isAdmin()
              ? `<td class="border border-gray-300 px-3 py-2 text-sm">${
                  order.branch || "Unknown"
                }</td>`
              : ""
          }
          <td class="border border-gray-300 px-3 py-2 text-sm">${this.formatProductNames(
            order
          )}</td>
          <td class="border border-gray-300 px-3 py-2 text-sm text-right">₱${parseFloat(
            order.total
          ).toFixed(2)}</td>
          <td class="border border-gray-300 px-3 py-2 text-sm">${
            order.orderType
          }</td>
          <td class="border border-gray-300 px-3 py-2 text-sm">${
            order.payment_method || "Cash"
          }</td>
          <td class="border border-gray-300 px-3 py-2 text-sm">${this.formatTime(
            order.created_at
          )}</td>
        </tr>
      `
        )
        .join("");
    } else if (ordersTableBody) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="${
            this.isAdmin() ? "7" : "6"
          }" class="border border-gray-300 px-3 py-4 text-center text-gray-500">
            No orders during this session
          </td>
        </tr>
      `;
    }
  }

  // ============================================
  // VIEW RECEIPT
  // ============================================
  async viewReceipt(orderId) {
    try {
      const response = await fetch(
        `backend/salesapi.php?action=order&id=${orderId}`
      );
      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid JSON response: " + responseText);
      }

      if (!result.success) {
        throw new Error(result.message);
      }

      const order = result.data;
      this.selectedOrder = order;

      // Update receipt content
      const receiptOrderId = document.getElementById("receiptOrderId");
      const receiptDate = document.getElementById("receiptDate");
      const receiptCashier = document.getElementById("receiptCashier");
      const receiptPayment = document.getElementById("receiptPayment");
      const receiptTotal = document.getElementById("receiptTotal");
      const receiptPaid = document.getElementById("receiptPaid");
      const receiptChange = document.getElementById("receiptChange");
      const receiptItems = document.getElementById("receiptItems");
      const voidStamp = document.getElementById("voidStamp");
      const voidInfo = document.getElementById("voidInfo");
      const voidReason = document.getElementById("voidReason");
      const voidedBy = document.getElementById("voidedBy");
      const voidDate = document.getElementById("voidDate");
      const receiptFooter = document.getElementById("receiptFooter");
      const voidOrderBtn = document.getElementById("voidOrderBtn");

      if (receiptOrderId) receiptOrderId.textContent = order.id;
      if (receiptDate)
        receiptDate.textContent = this.formatDateTime(order.created_at);
      if (receiptCashier)
        receiptCashier.textContent =
          order.cashier_name || order.cashier_email || "Unknown";
      if (receiptPayment)
        receiptPayment.textContent = order.payment_method || "Cash";
      if (receiptTotal)
        receiptTotal.textContent = `₱${parseFloat(order.total).toFixed(2)}`;
      if (receiptPaid)
        receiptPaid.textContent = `₱${parseFloat(order.paidAmount).toFixed(2)}`;
      if (receiptChange)
        receiptChange.textContent = `₱${parseFloat(order.changeAmount).toFixed(
          2
        )}`;

      // Parse and display items
      const items = this.parseItems(order.items);
      const itemsHtml = items
        .map(
          (item) => `
        <div class="flex justify-between">
          <span>${item.name} x${item.quantity}</span>
          <span>₱${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
        </div>
      `
        )
        .join("");

      if (receiptItems) receiptItems.innerHTML = itemsHtml;

      // Handle void info
      if (order.is_void) {
        if (voidStamp) voidStamp.classList.remove("hidden");
        if (voidInfo) voidInfo.classList.remove("hidden");
        if (voidReason)
          voidReason.textContent = order.void_reason || "Not specified";
        if (voidedBy) voidedBy.textContent = order.voided_by || "Admin";
        if (voidDate)
          voidDate.textContent = order.voided_at
            ? this.formatDateTime(order.voided_at)
            : "N/A";
        if (receiptFooter)
          receiptFooter.textContent = "This transaction has been voided";
        if (voidOrderBtn) voidOrderBtn.classList.add("hidden");
      } else {
        if (voidStamp) voidStamp.classList.add("hidden");
        if (voidInfo) voidInfo.classList.add("hidden");
        if (receiptFooter)
          receiptFooter.textContent = "Thank you for your order!";
        if (voidOrderBtn) {
          voidOrderBtn.classList.remove("hidden");
          voidOrderBtn.onclick = () => this.showVoidModal(orderId);
        }
      }

      // Show modal
      const receiptModal = document.getElementById("receiptModal");
      if (receiptModal) {
        receiptModal.classList.remove("hidden");
      }
    } catch (error) {
      console.error("View Receipt Error:", error);
      this.showNotification("error", "Failed to load order: " + error.message);
    }
  }

  // ============================================
  // SHOW VOID MODAL
  // ============================================
  async showVoidModal(orderId) {
    const order = this.salesData.find((o) => o.id === orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return;
    }

    this.selectedOrder = order;

    // Update order info
    const voidOrderInfo = document.getElementById("voidOrderInfo");
    if (voidOrderInfo) {
      voidOrderInfo.innerHTML = `
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="font-semibold">Order #:</span>
            <span>${order.id}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Amount:</span>
            <span class="font-bold">₱${parseFloat(order.total).toFixed(
              2
            )}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Cashier:</span>
            <span>${order.cashier_name || "Unknown"}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Date:</span>
            <span>${this.formatDateTime(order.created_at)}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Branch:</span>
            <span>${order.branch || "main"}</span>
          </div>
        </div>
      `;
    }

    // Clear inputs
    const voidReasonInput = document.getElementById("voidReasonInput");
    const managerPin = document.getElementById("managerPin");
    const pinError = document.getElementById("pinError");
    const pinSection = document.getElementById("pinSection");

    if (voidReasonInput) voidReasonInput.value = "";
    if (managerPin) managerPin.value = "";
    if (pinError) pinError.classList.add("hidden");

    // Show/hide PIN section based on role
    if (pinSection) {
      if (window.currentUser && window.currentUser.role === "cashier") {
        pinSection.classList.remove("hidden");
      } else {
        pinSection.classList.add("hidden");
      }
    }

    // Close receipt modal if open
    const receiptModal = document.getElementById("receiptModal");
    if (receiptModal) receiptModal.classList.add("hidden");

    // Show void modal
    const voidModal = document.getElementById("voidModal");
    if (voidModal) {
      voidModal.classList.remove("hidden");
    }
  }

  // ============================================
  // CONFIRM VOID
  // ============================================
  async confirmVoid() {
    const reason = document.getElementById("voidReasonInput").value.trim();
    const pin = document.getElementById("managerPin")
      ? document.getElementById("managerPin").value.trim()
      : null;

    if (!reason) {
      this.showNotification(
        "warning",
        "Please enter a reason for voiding this order"
      );
      return;
    }

    // If cashier, verify PIN first
    let managerInfo = null;
    if (window.currentUser.role === "cashier") {
      if (!pin) {
        this.showNotification("warning", "Please enter Manager PIN");
        return;
      }

      this.showLoading(true);

      try {
        const verifyResponse = await fetch(
          "backend/salesapi.php?action=verify-pin",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin: pin }),
          }
        );

        const verifyResult = await verifyResponse.json();

        if (!verifyResult.success) {
          const pinError = document.getElementById("pinError");
          if (pinError) {
            pinError.textContent = verifyResult.message || "Invalid PIN";
            pinError.classList.remove("hidden");
          }
          this.showLoading(false);
          return;
        }

        managerInfo = verifyResult.manager;
      } catch (error) {
        console.error("PIN verification error:", error);
        this.showNotification("error", "Failed to verify PIN");
        this.showLoading(false);
        return;
      }
    }

    // Proceed with void
    this.showLoading(true);

    try {
      const response = await fetch("backend/salesapi.php?action=void", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: this.selectedOrder.id,
          reason: reason,
          manager: managerInfo,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // Close modal
      this.closeModal("voidModal");

      // Show success notification
      this.showNotification(
        "success",
        `Order #${this.selectedOrder.id} has been successfully voided`
      );

      // Reload current view
      if (this.activeTab === "sales") {
        this.loadSales();
      } else if (this.activeTab === "void") {
        this.loadVoidOrders();
      }
    } catch (error) {
      console.error("Void order error:", error);
      this.showNotification("error", "Failed to void order: " + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  // ============================================
  // PRINT RECEIPT
  // ============================================
  printReceipt() {
    const receiptContent = document.querySelector(".receipt-kstreet");
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>K-STREET Receipt</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            padding: 20px; 
            max-width: 80mm;
            margin: 0 auto;
          }
          @media print { 
            @page { margin: 0; size: 80mm auto; } 
            body { margin: 1.6cm; } 
          }
          .void-stamp-kstreet {
            color: #dc2626;
            font-weight: bold;
            border: 2px solid #dc2626;
            padding: 10px;
          }
        </style>
      </head>
      <body>${receiptContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  // ============================================
  // PRINT CASHIER REPORT
  // ============================================
  printCashierReport() {
    const session = this.selectedSession;
    if (!session) return;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>K-STREET Cashier Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          @media print { 
            @page { margin: 15mm; } 
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .store-name {
            font-size: 24px;
            font-weight: bold;
            color: #d32f2f;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .summary-box {
            background-color: #f9f9f9;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">K - STREET</div>
          <div>Mc Arthur Highway, Magaspac, Gerona, Tarlac</div>
          <h2>CASHIER SESSION REPORT</h2>
          <div>Branch: ${session.branch || window.currentUser.branch}</div>
        </div>

        <div class="summary-box">
          <h3>CASHIER INFORMATION</h3>
          <p><strong>Cashier:</strong> ${
            session.username || session.user_email
          }</p>
          <p><strong>Login Time:</strong> ${this.formatDateTime(
            session.login_time
          )}</p>
          <p><strong>Logout Time:</strong> ${
            session.logout_time
              ? this.formatDateTime(session.logout_time)
              : "Still Active"
          }</p>
          <p><strong>Session Duration:</strong> ${session.session_duration}</p>
        </div>

        <div class="summary-box">
          <h3>SALES SUMMARY</h3>
          <p><strong>Starting Gross Sales:</strong> ₱${parseFloat(
            session.start_gross_sales
          ).toFixed(2)}</p>
          <p><strong>Ending Gross Sales:</strong> ₱${parseFloat(
            session.end_gross_sales
          ).toFixed(2)}</p>
          <p><strong>Sales During Session:</strong> ₱${parseFloat(
            session.session_sales
          ).toFixed(2)}</p>
          <p><strong>Total Transactions:</strong> ${
            session.transaction_count || 0
          }</p>
          <p style="color: #15803d;"><strong>Total Applied Discount:</strong> ₱${parseFloat(
            session.total_discount
          ).toFixed(2)}</p>
          <p style="color: #dc2626;"><strong>Total Void Amount:</strong> ₱${parseFloat(
            session.total_void
          ).toFixed(2)} ${
      session.void_count > 0
        ? `(${session.void_count} transaction${
            session.void_count !== 1 ? "s" : ""
          })`
        : ""
    }</p>
        </div>

        ${
          session.orders && session.orders.length > 0
            ? `
        <h3>ORDERS DURING SESSION (${session.orders.length} transactions)</h3>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Products</th>
              <th>Total</th>
              <th>Order Type</th>
              <th>Payment</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${session.orders
              .map(
                (order) => `
              <tr>
                <td>#${order.id}</td>
                <td>${this.formatProductNames(order)}</td>
                <td>₱${parseFloat(order.total).toFixed(2)}</td>
                <td>${order.orderType}</td>
                <td>${order.payment_method || "Cash"}</td>
                <td>${this.formatTime(order.created_at)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        `
            : ""
        }

        <div style="text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px dashed #ddd;">
          <p>K-Street POS System</p>
          <p>Printed: ${new Date().toLocaleString("en-PH")}</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 250);
          }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  }

  // ============================================
  // EXPORT SALES TO EXCEL
  // ============================================
  exportSalesToExcel() {
    if (this.salesData.length === 0) {
      this.showNotification("warning", "No data to export");
      return;
    }

    // Calculate statistics
    const totalSales = this.salesData.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );
    const totalPaid = this.salesData.reduce(
      (sum, order) => sum + parseFloat(order.paidAmount),
      0
    );
    const totalChange = this.salesData.reduce(
      (sum, order) => sum + parseFloat(order.changeAmount),
      0
    );
    const totalDiscount = this.salesData.reduce((sum, order) => {
      return (
        sum +
        (order.discountApplied ? (parseFloat(order.total) / 0.8) * 0.2 : 0)
      );
    }, 0);
    const avgTransaction = totalSales / this.salesData.length;

    // Get branch and time range
    const branchFilter = document.getElementById("branchFilter");
    const currentBranch = branchFilter ? branchFilter.value : "all";
    const branchText = currentBranch === "all" ? "All Branches" : currentBranch;

    const timeRange = document.getElementById("timeRange").value;
    const timeRangeText = this.getTimeRangeText(timeRange);

    // Build data array
    const ws_data = [];

    // Row 1: Company Name
    ws_data.push(["K - STREET"]);

    // Row 2: Branch
    ws_data.push([`BRANCH: ${branchText}`]);

    // Row 3: Report Title
    ws_data.push([`Sales Report - Period: ${timeRangeText}`]);

    // Row 4: Empty
    ws_data.push([]);

    // Row 5: Summary Title
    ws_data.push(["SALES SUMMARY"]);

    // Row 6-10: Summary Stats
    ws_data.push([
      `Total Sales: ₱${totalSales.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    ]);
    ws_data.push([`Total Transactions: ${this.salesData.length}`]);
    ws_data.push([
      `Average Transaction: ₱${avgTransaction.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    ]);
    ws_data.push([
      `Total Applied Discount: ₱${totalDiscount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    ]);

    // Row 11: Empty
    ws_data.push([]);

    // Row 12: Table Header
    const headers = this.isAdmin()
      ? [
          "Order #",
          "Branch",
          "Products",
          "Total",
          "Discount",
          "Paid",
          "Change",
          "Cashier",
          "Order Type",
          "Payment",
          "Date & Time",
        ]
      : [
          "Order #",
          "Products",
          "Total",
          "Discount",
          "Paid",
          "Change",
          "Cashier",
          "Order Type",
          "Payment",
          "Date & Time",
        ];
    ws_data.push(headers);

    // Data Rows
    this.salesData.forEach((order) => {
      const row = this.isAdmin()
        ? [
            order.id,
            order.branch || "Unknown",
            this.formatProductNames(order),
            parseFloat(order.total),
            order.discountApplied ? "Yes" : "None",
            parseFloat(order.paidAmount),
            parseFloat(order.changeAmount),
            order.cashier_name || order.cashier_email || "Unknown",
            order.orderType,
            order.payment_method || "Cash",
            this.formatDateTime(order.created_at),
          ]
        : [
            order.id,
            this.formatProductNames(order),
            parseFloat(order.total),
            order.discountApplied ? "Yes" : "None",
            parseFloat(order.paidAmount),
            parseFloat(order.changeAmount),
            order.cashier_name || order.cashier_email || "Unknown",
            order.orderType,
            order.payment_method || "Cash",
            this.formatDateTime(order.created_at),
          ];
      ws_data.push(row);
    });

    // Footer
    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString("en-PH")}`]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Apply styles
    this.applySalesExcelStyles(ws, ws_data.length);

    // Set column widths
    ws["!cols"] = this.isAdmin()
      ? [
          { wch: 10 },
          { wch: 15 },
          { wch: 35 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 25 },
          { wch: 13 },
          { wch: 15 },
          { wch: 22 },
        ]
      : [
          { wch: 10 },
          { wch: 35 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 12 },
          { wch: 25 },
          { wch: 13 },
          { wch: 15 },
          { wch: 22 },
        ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    // Generate filename
    const filename = `K-Street-Sales_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);

    this.showNotification("success", "Excel file exported successfully!");
  }

  // ============================================
  // EXPORT CASHIER TO EXCEL
  // ============================================
  exportCashierToExcel() {
    if (this.cashierData.length === 0) {
      this.showNotification("warning", "No data to export");
      return;
    }

    const totalSessions = this.cashierData.length;
    const totalGrossSales = this.cashierData.reduce(
      (sum, session) => sum + parseFloat(session.session_sales || 0),
      0
    );
    const totalDiscount = this.cashierData.reduce(
      (sum, session) => sum + parseFloat(session.total_discount || 0),
      0
    );
    const totalVoid = this.cashierData.reduce(
      (sum, session) => sum + parseFloat(session.total_void || 0),
      0
    );

    const branchFilter = document.getElementById("branchFilter");
    const currentBranch = branchFilter ? branchFilter.value : "all";
    const branchText = currentBranch === "all" ? "All Branches" : currentBranch;

    const timeRange = document.getElementById("timeRange").value;
    const timeRangeText = this.getTimeRangeText(timeRange);

    const ws_data = [];

    // Row 1: K-STREET Header (Red Background)
    ws_data.push(["K - STREET"]);

    // Row 2: Address
    ws_data.push(["Mc Arthur Highway, Magaspac, Gerona, Tarlac"]);

    // Row 3: Report Title
    ws_data.push(["CASHIER SESSION REPORT"]);

    // Row 4: Branch
    ws_data.push([`BRANCH: ${branchText}`]);

    // Row 5: Empty
    ws_data.push([]);

    // Row 6: CASHIER INFORMATION Header
    ws_data.push(["CASHIER INFORMATION"]);

    // Row 7: Summary Stats
    ws_data.push([`Total Cashier Sessions: ${totalSessions}`]);
    ws_data.push([
      `Total Gross Sales: ₱${totalGrossSales.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`,
    ]);
    ws_data.push([
      `Total Applied Discount: ₱${totalDiscount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`,
    ]);
    ws_data.push([
      `Total Void Amount: ₱${totalVoid.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`,
    ]);

    // Row 11: Empty
    ws_data.push([]);

    // Row 12: Table Headers with background
    const headers = this.isAdmin()
      ? [
          "Branch",
          "Cashier",
          "Login Time",
          "Logout Time",
          "Duration",
          "Start Sales",
          "End Sales",
          "Session Sales",
          "Discount",
          "Void Amount",
        ]
      : [
          "Cashier",
          "Login Time",
          "Logout Time",
          "Duration",
          "Start Sales",
          "End Sales",
          "Session Sales",
          "Discount",
          "Void Amount",
        ];
    ws_data.push(headers);

    // Data Rows
    this.cashierData.forEach((session) => {
      const row = this.isAdmin()
        ? [
            session.branch || "Unknown",
            session.username || session.user_email || "Unknown",
            this.formatDateTime(session.login_time),
            session.logout_time
              ? this.formatDateTime(session.logout_time)
              : "Still Active",
            session.session_duration,
            parseFloat(session.start_gross_sales),
            parseFloat(session.end_gross_sales),
            parseFloat(session.session_sales),
            parseFloat(session.total_discount),
            parseFloat(session.total_void),
          ]
        : [
            session.username || session.user_email || "Unknown",
            this.formatDateTime(session.login_time),
            session.logout_time
              ? this.formatDateTime(session.logout_time)
              : "Still Active",
            session.session_duration,
            parseFloat(session.start_gross_sales),
            parseFloat(session.end_gross_sales),
            parseFloat(session.session_sales),
            parseFloat(session.total_discount),
            parseFloat(session.total_void),
          ];
      ws_data.push(row);
    });

    // Footer
    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString("en-PH")}`]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Apply professional styling
    this.applyCashierReportDesign(ws, ws_data.length, this.isAdmin());

    // Set column widths
    ws["!cols"] = this.isAdmin()
      ? [
          { wch: 18 },
          { wch: 25 },
          { wch: 22 },
          { wch: 22 },
          { wch: 16 },
          { wch: 18 },
          { wch: 18 },
          { wch: 18 },
          { wch: 16 },
          { wch: 16 },
        ]
      : [
          { wch: 25 },
          { wch: 22 },
          { wch: 22 },
          { wch: 16 },
          { wch: 18 },
          { wch: 18 },
          { wch: 18 },
          { wch: 16 },
          { wch: 16 },
        ];

    // Set row heights for better appearance
    ws["!rows"] = [
      { hpt: 30 }, // Row 1: K-STREET
      { hpt: 16 }, // Row 2: Address
      { hpt: 22 }, // Row 3: Title
      { hpt: 16 }, // Row 4: Branch
      { hpt: 10 }, // Row 5: Empty
      { hpt: 20 }, // Row 6: Section header
      { hpt: 16 }, // Row 7-10: Stats
      { hpt: 16 },
      { hpt: 16 },
      { hpt: 16 },
      { hpt: 10 }, // Row 11: Empty
      { hpt: 25 }, // Row 12: Table headers
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cashier Report");

    // Generate filename
    const filename = `K-Street-Cashier_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);

    this.showNotification(
      "success",
      "Cashier Report exported successfully with professional design!"
    );
  }

  // ============================================
  // EXPORT CASHIER SESSION TO EXCEL (INDIVIDUAL) - FIXED VERSION
  // ============================================
  // Replace the exportCashierSessionToExcel function in your sales.js with this:
exportCashierSessionToExcel() {
  const session = this.selectedSession;
  if (!session) {
    this.showNotification("warning", "No session selected");
    return;
  }

  console.log("📊 Export Session Data:", session);

  // FIX: Convert empty array or calculate from orders
  let paymentMethods = {};
  
  if (session.payment_methods && typeof session.payment_methods === 'object' && !Array.isArray(session.payment_methods)) {
    // Backend returned proper object
    paymentMethods = session.payment_methods;
    console.log("✅ Using payment_methods from backend:", paymentMethods);
  } else if (session.orders && session.orders.length > 0) {
    // Calculate from orders
    console.log("⚠️ payment_methods empty/invalid, calculating from orders...");
    session.orders.forEach(order => {
      const method = order.payment_method || "Cash";
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, total: 0 };
      }
      paymentMethods[method].count++;
      paymentMethods[method].total += parseFloat(order.total || 0);
    });
    console.log("✅ Calculated payment_methods:", paymentMethods);
  } else {
    console.log("ℹ️ No orders found, showing empty payment methods table");
  }

  const ws_data = [];

  // ROW 1: K-STREET Header
  ws_data.push(["K - STREET"]);

  // ROW 2: Empty
  ws_data.push([""]);

  // ROW 3: CASHIER SESSION REPORT
  ws_data.push(["CASHIER SESSION REPORT"]);

  // ROW 4: CASHIER INFORMATION Header
  ws_data.push(["CASHIER INFORMATION"]);

  // Cashier Info Data
  ws_data.push(["Cashier Email:", session.user_email]);
  ws_data.push(["Login Time:", this.formatDateTime(session.login_time)]);
  ws_data.push(["Logout Time:", session.logout_time ? this.formatDateTime(session.logout_time) : "Still Active"]);
  ws_data.push(["Session Duration:", session.session_duration || "Still Active"]);

  // Empty row
  ws_data.push([""]);

  // SALES SUMMARY Header
  ws_data.push(["SALES SUMMARY"]);

  // Sales Summary Data
  ws_data.push(["Starting Gross:", parseFloat(session.start_gross_sales || 0)]);
  ws_data.push(["Ending Gross:", parseFloat(session.end_gross_sales || 0)]);
  ws_data.push(["Sales During Session:", parseFloat(session.session_sales || 0)]);
  ws_data.push(["Total Transactions:", session.transaction_count || 0]);
  ws_data.push(["Total Applied Discount:", parseFloat(session.total_discount || 0)]);
  ws_data.push(["Total Void Amount:", parseFloat(session.total_void || 0)]);

  // Empty row
  ws_data.push([""]);

  // PAYMENT METHODS TABLE - ALWAYS SHOW
  ws_data.push(["Payment Method", "Transaction Count", "Total Amount"]);
  
  if (Object.keys(paymentMethods).length > 0) {
    console.log("✅ Adding payment methods data");
    Object.entries(paymentMethods).forEach(([method, data]) => {
      console.log(`  - ${method}: ${data.count} transactions, ₱${data.total}`);
      ws_data.push([method, data.count, parseFloat(data.total)]);
    });
  } else {
    console.log("ℹ️ No payment methods data - showing 'No transactions' row");
    ws_data.push(["No transactions yet", 0, 0]);
  }

  // Empty row after payment methods
  ws_data.push([""]);

  // ORDERS DURING SESSION - ALWAYS SHOW
  ws_data.push(["ORDERS DURING SESSION"]);

  const orderHeaders = this.isAdmin()
    ? ["Order ID", "Products", "Total Amount", "Order Type", "Payment Method", "Transaction Time", "Branch"]
    : ["Order ID", "Products", "Total Amount", "Order Type", "Payment Method", "Transaction Time"];
  ws_data.push(orderHeaders);

  if (session.orders && session.orders.length > 0) {
    console.log(`✅ Adding ${session.orders.length} orders`);
    session.orders.forEach((order) => {
      const row = this.isAdmin()
        ? [
            order.id + (order.is_upgraded ? " [UPGRADED]" : ""),
            this.formatProductNames(order),
            parseFloat(order.total),
            order.orderType,
            order.payment_method || "Cash",
            this.formatTime(order.created_at),
            order.branch || "Unknown",
          ]
        : [
            order.id + (order.is_upgraded ? " [UPGRADED]" : ""),
            this.formatProductNames(order),
            parseFloat(order.total),
            order.orderType,
            order.payment_method || "Cash",
            this.formatTime(order.created_at),
          ];
      ws_data.push(row);
    });
  } else {
    console.log("ℹ️ No orders - showing 'No orders' row");
    const emptyRow = this.isAdmin()
      ? ["-", "No orders during this session", 0, "-", "-", "-", "-"]
      : ["-", "No orders during this session", 0, "-", "-", "-"];
    ws_data.push(emptyRow);
  }

  // Empty row
  ws_data.push([""]);

  // Footer
  const generatedDate = new Date().toLocaleString("en-PH", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  ws_data.push([`Generated: ${generatedDate} | Exported by: ${window.currentUser?.name || "Admin"}`]);

  console.log(`📄 Total rows: ${ws_data.length}`);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Apply styling
  this.applyCashierSessionExactDesign(ws, ws_data.length, session, this.isAdmin());

  // Set column widths
  ws["!cols"] = this.isAdmin()
    ? [
        { wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 18 },
      ]
    : [
        { wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 18 },
      ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Session_${session.user_email.split("@")[0]}`);

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const cashierStr = session.user_email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `K-STREET_Cashier_Report_${cashierStr}_${dateStr}.xlsx`;

  // Download
  XLSX.writeFile(wb, filename);

  console.log("✅ Excel downloaded:", filename);
  this.showNotification("success", "Cashier session report exported successfully!");
}

  // ============================================
  // EXPORT VOID TO EXCEL
  // ============================================
  exportVoidToExcel() {
    if (this.voidData.length === 0) {
      this.showNotification("warning", "No data to export");
      return;
    }

    const totalVoidAmount = this.voidData.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );

    const branchFilter = document.getElementById("branchFilter");
    const currentBranch = branchFilter ? branchFilter.value : "all";
    const branchText = currentBranch === "all" ? "All Branches" : currentBranch;

    const timeRange = document.getElementById("timeRange").value;
    const timeRangeText = this.getTimeRangeText(timeRange);

    // Build data array
    const ws_data = [];

    // Header
    ws_data.push(["K - STREET"]);
    ws_data.push([`BRANCH: ${branchText}`]);
    ws_data.push([`Void Report - Period: ${timeRangeText}`]);
    ws_data.push([]);

    // Summary
    ws_data.push(["VOID SUMMARY"]);
    ws_data.push([`Total Voided Transactions: ${this.voidData.length}`]);
    ws_data.push([
      `Total Void Amount: ₱${totalVoidAmount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`,
    ]);
    ws_data.push([]);

    // Table Headers
    const headers = this.isAdmin()
      ? [
          "Order #",
          "Branch",
          "Void Date",
          "Original Date",
          "Products",
          "Amount",
          "Order Type",
          "Cashier",
          "Voided By",
          "Reason",
        ]
      : [
          "Order #",
          "Void Date",
          "Original Date",
          "Products",
          "Amount",
          "Order Type",
          "Cashier",
          "Voided By",
          "Reason",
        ];
    ws_data.push(headers);

    // Data Rows
    this.voidData.forEach((order) => {
      const row = this.isAdmin()
        ? [
            order.id,
            order.branch || "Unknown",
            order.voided_at ? this.formatDateTime(order.voided_at) : "N/A",
            this.formatDateTime(order.created_at),
            this.formatProductNames(order),
            parseFloat(order.total),
            order.orderType,
            order.cashier_name || order.cashier_email || "Unknown",
            order.voided_by || "Admin",
            order.void_reason || "Not specified",
          ]
        : [
            order.id,
            order.voided_at ? this.formatDateTime(order.voided_at) : "N/A",
            this.formatDateTime(order.created_at),
            this.formatProductNames(order),
            parseFloat(order.total),
            order.orderType,
            order.cashier_name || order.cashier_email || "Unknown",
            order.voided_by || "Admin",
            order.void_reason || "Not specified",
          ];
      ws_data.push(row);
    });

    // Footer
    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString("en-PH")}`]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Apply styles
    this.applyVoidExcelStyles(ws, ws_data.length);

    // Set column widths
    ws["!cols"] = this.isAdmin()
      ? [
          { wch: 10 },
          { wch: 15 },
          { wch: 20 },
          { wch: 20 },
          { wch: 35 },
          { wch: 12 },
          { wch: 13 },
          { wch: 20 },
          { wch: 20 },
          { wch: 30 },
        ]
      : [
          { wch: 10 },
          { wch: 20 },
          { wch: 20 },
          { wch: 35 },
          { wch: 12 },
          { wch: 13 },
          { wch: 20 },
          { wch: 20 },
          { wch: 30 },
        ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Void Report");

    // Generate filename
    const filename = `K-Street-Void_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);

    this.showNotification("success", "Excel file exported successfully!");
  }

  // ============================================
  // EXCEL STYLING HELPERS
  // ============================================
  applySalesExcelStyles(ws, totalRows) {
    // Header style (Row 1)
    if (ws["A1"]) {
      ws["A1"].s = {
        font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 14 },
        fill: { fgColor: { rgb: "FFDC2626" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // Summary title (Row 5)
    if (ws["A5"]) {
      ws["A5"].s = {
        font: { bold: true, size: 11 },
        fill: { fgColor: { rgb: "FFFFCDD2" } },
        alignment: { horizontal: "left" },
      };
    }

    // Discount row (Row 9) - Green
    if (ws["A9"]) {
      ws["A9"].s = {
        font: { bold: true, size: 10, color: { rgb: "FF15803D" } },
        alignment: { horizontal: "left" },
      };
    }

    // Table header row
    const headerRow = 12;
    const numCols = this.isAdmin() ? 11 : 10;
    for (let col = 0; col < numCols; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 10 },
          fill: { fgColor: { rgb: "FFD32F2F" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }
  }

  applyCashierReportDesign(ws, totalRows, isAdmin) {
    const redFill = { fgColor: { rgb: "FFDC2626" } };
    const lightRedFill = { fgColor: { rgb: "FFFFCDD2" } };
    const greenFill = { fgColor: { rgb: "FFF1F5FE" } };
    const headerFill = { fgColor: { rgb: "FF4472C4" } };
    const purpleHeaderFill = { fgColor: { rgb: "FF7030A0" } };
    const blueLightFill = { fgColor: { rgb: "FFDFE9F3" } };

    const whiteFont = { color: { rgb: "FFFFFFFF" }, bold: true, size: 11 };
    const headerFont = { color: { rgb: "FFFFFFFF" }, bold: true, size: 11 };
    const boldFont = { bold: true, size: 11 };
    const regularFont = { size: 10 };
    const smallFont = { size: 9 };

    const centerAlign = {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    };
    const leftAlign = {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    };
    const rightAlign = { horizontal: "right", vertical: "center" };

    // Row 1: K-STREET Header
    const a1 = XLSX.utils.encode_cell({ r: 0, c: 0 });
    ws[a1].s = {
      font: { bold: true, size: 26, color: { rgb: "FFFFFFFF" } },
      fill: redFill,
      alignment: centerAlign,
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: isAdmin ? 9 : 8 } });

    // Row 2: Address
    const a2 = XLSX.utils.encode_cell({ r: 1, c: 0 });
    ws[a2].s = {
      font: { size: 10, color: { rgb: "FF333333" } },
      fill: { fgColor: { rgb: "FFFEF3C7" } },
      alignment: centerAlign,
      border: {
        bottom: { style: "thin" },
      },
    };
    ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: isAdmin ? 9 : 8 } });

    // Row 3: Report Title
    const a3 = XLSX.utils.encode_cell({ r: 2, c: 0 });
    ws[a3].s = {
      font: { bold: true, size: 14, color: { rgb: "FFDC2626" } },
      alignment: centerAlign,
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
    ws["!merges"].push({ s: { r: 2, c: 0 }, e: { r: 2, c: isAdmin ? 9 : 8 } });

    // Row 4: Branch
    const a4 = XLSX.utils.encode_cell({ r: 3, c: 0 });
    ws[a4].s = {
      font: { size: 11, color: { rgb: "FF0E47CB" }, bold: true },
      fill: blueLightFill,
      alignment: centerAlign,
      border: {
        bottom: { style: "thin" },
      },
    };
    ws["!merges"].push({ s: { r: 3, c: 0 }, e: { r: 3, c: isAdmin ? 9 : 8 } });
  }

// Replace the applyCashierSessionExactDesign function in your sales.js with this:

applyCashierSessionExactDesign(ws, totalRows, session, isAdmin) {
  // EXACT color scheme from target image
  const redFill = { fgColor: { rgb: "FFFF0000" } };
  const pinkFill = { fgColor: { rgb: "FFFFC7CE" } };
  const greenFill = { fgColor: { rgb: "FFC6EFCE" } };
  const lightGreenFill = { fgColor: { rgb: "FFE2EFDA" } };
  const lightRedFill = { fgColor: { rgb: "FFFFC7CE" } };
  const purpleFill = { fgColor: { rgb: "FF7030A0" } };
  const blueFill = { fgColor: { rgb: "FFBDD7EE" } };
  const grayFill = { fgColor: { rgb: "FFF2F2F2" } }; // For empty state

  // Font styles
  const whiteBoldFont = { color: { rgb: "FFFFFFFF" }, bold: true, size: 18 };
  const blackBoldFont = { bold: true, size: 11, color: { rgb: "FF000000" } };
  const regularFont = { size: 11, color: { rgb: "FF000000" } };
  const greenFont = { bold: true, size: 11, color: { rgb: "FF00B050" } };
  const blueFont = { bold: true, size: 11, color: { rgb: "FF0070C0" } };
  const redFont = { bold: true, size: 11, color: { rgb: "FFFF0000" } };
  const grayFont = { size: 10, color: { rgb: "FF666666" }, italic: true }; // For empty state

  // Alignment
  const centerAlign = { horizontal: "center", vertical: "center" };
  const leftAlign = { horizontal: "left", vertical: "center" };
  const rightAlign = { horizontal: "right", vertical: "center" };

  // Initialize merges
  if (!ws["!merges"]) ws["!merges"] = [];

  // Helper to ensure cell exists and apply style
  const styleCell = (row, col, style) => {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
    if (!ws[cellRef]) ws[cellRef] = { v: "", t: "s" };
    ws[cellRef].s = style;
    return cellRef;
  };

  const applyBorder = (style) => {
    return {
      ...style,
      border: {
        top: { style: "thin", color: { rgb: "FF000000" } },
        bottom: { style: "thin", color: { rgb: "FF000000" } },
        left: { style: "thin", color: { rgb: "FF000000" } },
        right: { style: "thin", color: { rgb: "FF000000" } }
      }
    };
  };

  const mergeCells = (startRow, startCol, endRow, endCol) => {
    ws["!merges"].push({
      s: { r: startRow, c: startCol },
      e: { r: endRow, c: endCol }
    });
  };

  // ROW 1: K-STREET Header (RED) - MERGE
  styleCell(0, 0, applyBorder({
    font: whiteBoldFont,
    fill: redFill,
    alignment: centerAlign
  }));
  mergeCells(0, 0, 0, isAdmin ? 6 : 5);

  // ROW 2: Empty - MERGE
  mergeCells(1, 0, 1, isAdmin ? 6 : 5);

  // ROW 3: CASHIER SESSION REPORT - MERGE
  styleCell(2, 0, applyBorder({
    font: blackBoldFont,
    alignment: centerAlign
  }));
  mergeCells(2, 0, 2, isAdmin ? 6 : 5);

  // ROW 4: CASHIER INFORMATION Header (PINK) - MERGE
  styleCell(3, 0, applyBorder({
    font: blackBoldFont,
    fill: pinkFill,
    alignment: leftAlign
  }));
  mergeCells(3, 0, 3, isAdmin ? 6 : 5);

  // Rows 5-8: Cashier Info Data - DON'T MERGE, style both columns
  for (let i = 4; i <= 7; i++) {
    styleCell(i, 0, applyBorder({
      font: regularFont,
      alignment: leftAlign
    }));
    styleCell(i, 1, applyBorder({
      font: regularFont,
      alignment: leftAlign
    }));
  }

  // ROW 9: Empty - MERGE
  mergeCells(8, 0, 8, isAdmin ? 6 : 5);

  // ROW 10: SALES SUMMARY Header (GREEN) - MERGE
  styleCell(9, 0, applyBorder({
    font: blackBoldFont,
    fill: greenFill,
    alignment: leftAlign
  }));
  mergeCells(9, 0, 9, isAdmin ? 6 : 5);

  // Row 11: Starting Gross (normal) - DON'T MERGE
  styleCell(10, 0, applyBorder({
    font: regularFont,
    alignment: leftAlign
  }));
  styleCell(10, 1, applyBorder({
    font: regularFont,
    alignment: rightAlign
  }));

  // Row 12: Ending Gross (normal) - DON'T MERGE
  styleCell(11, 0, applyBorder({
    font: regularFont,
    alignment: leftAlign
  }));
  styleCell(11, 1, applyBorder({
    font: regularFont,
    alignment: rightAlign
  }));

  // Row 13: Sales During (GREEN text + light green background) - DON'T MERGE
  styleCell(12, 0, applyBorder({
    font: greenFont,
    fill: lightGreenFill,
    alignment: leftAlign
  }));
  styleCell(12, 1, applyBorder({
    font: greenFont,
    fill: lightGreenFill,
    alignment: rightAlign
  }));

  // Row 14: Total Transact (normal) - DON'T MERGE
  styleCell(13, 0, applyBorder({
    font: regularFont,
    alignment: leftAlign
  }));
  styleCell(13, 1, applyBorder({
    font: regularFont,
    alignment: rightAlign
  }));

  // Row 15: Total Applied (BLUE text) - DON'T MERGE
  styleCell(14, 0, applyBorder({
    font: blueFont,
    alignment: leftAlign
  }));
  styleCell(14, 1, applyBorder({
    font: blueFont,
    alignment: rightAlign
  }));

  // Row 16: Total Void Am (RED text + light pink background) - DON'T MERGE
  styleCell(15, 0, applyBorder({
    font: redFont,
    fill: lightRedFill,
    alignment: leftAlign
  }));
  styleCell(15, 1, applyBorder({
    font: redFont,
    fill: lightRedFill,
    alignment: rightAlign
  }));

  // ROW 17: Empty - MERGE
  mergeCells(16, 0, 16, isAdmin ? 6 : 5);

  // Payment Methods Table starts at row 17 (index 17)
  let nextRow = 17;

  // Payment Methods Header Row (PURPLE) - DON'T MERGE
  for (let col = 0; col < 3; col++) {
    styleCell(nextRow, col, applyBorder({
      font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 11 },
      fill: purpleFill,
      alignment: centerAlign
    }));
  }
  nextRow++;

  // Payment data rows - check if we have actual payment methods or placeholder
  const paymentMethodsCount = session.payment_methods && 
                               typeof session.payment_methods === 'object' && 
                               !Array.isArray(session.payment_methods) ? 
                               Object.keys(session.payment_methods).length : 0;

  if (paymentMethodsCount > 0) {
    // Real payment methods data
    Object.entries(session.payment_methods).forEach(([method, data], index) => {
      styleCell(nextRow, 0, applyBorder({
        font: regularFont,
        alignment: leftAlign
      }));
      
      styleCell(nextRow, 1, applyBorder({
        font: regularFont,
        alignment: centerAlign
      }));
      
      styleCell(nextRow, 2, applyBorder({
        font: regularFont,
        alignment: rightAlign
      }));
      
      // Format currency
      const cellRef = XLSX.utils.encode_cell({ r: nextRow, c: 2 });
      if (ws[cellRef]) {
        ws[cellRef].z = "₱#,##0.00";
      }
      
      nextRow++;
    });
  } else {
    // No transactions - style the placeholder row
    styleCell(nextRow, 0, applyBorder({
      font: grayFont,
      fill: grayFill,
      alignment: leftAlign
    }));
    
    styleCell(nextRow, 1, applyBorder({
      font: grayFont,
      fill: grayFill,
      alignment: centerAlign
    }));
    
    styleCell(nextRow, 2, applyBorder({
      font: grayFont,
      fill: grayFill,
      alignment: rightAlign
    }));
    
    nextRow++;
  }

  // Empty row after payment methods - MERGE
  mergeCells(nextRow, 0, nextRow, isAdmin ? 6 : 5);
  nextRow++;

  // Find ORDERS DURING SESSION row
  let ordersStartRow = -1;
  for (let i = 0; i < totalRows; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
    if (ws[cellRef] && ws[cellRef].v === "ORDERS DURING SESSION") {
      ordersStartRow = i;
      break;
    }
  }

  if (ordersStartRow !== -1) {
    // ORDERS DURING SESSION Header (BLUE) - MERGE
    styleCell(ordersStartRow, 0, applyBorder({
      font: blackBoldFont,
      fill: blueFill,
      alignment: leftAlign
    }));
    mergeCells(ordersStartRow, 0, ordersStartRow, isAdmin ? 6 : 5);

    // Table Header Row (PURPLE) - DON'T MERGE
    const tableHeaderRow = ordersStartRow + 1;
    for (let col = 0; col < (isAdmin ? 7 : 6); col++) {
      styleCell(tableHeaderRow, col, applyBorder({
        font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 11 },
        fill: purpleFill,
        alignment: centerAlign
      }));
    }

    // Order data rows or placeholder - DON'T MERGE
    const hasOrders = session.orders && session.orders.length > 0;
    const orderRowsCount = hasOrders ? session.orders.length : 1; // 1 for placeholder

    for (let i = 0; i < orderRowsCount; i++) {
      const row = tableHeaderRow + i + 1;
      
      for (let col = 0; col < (isAdmin ? 7 : 6); col++) {
        if (hasOrders) {
          // Real order data - normal style
          styleCell(row, col, applyBorder({
            font: regularFont,
            alignment: col === 2 ? rightAlign : leftAlign  // Right-align Total Amount
          }));
          
          // Format currency in Total Amount column (column 2)
          if (col === 2) {
            const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
            if (ws[cellRef]) {
              ws[cellRef].z = "₱#,##0.00";
            }
          }
        } else {
          // Placeholder row - gray italic style
          styleCell(row, col, applyBorder({
            font: grayFont,
            fill: grayFill,
            alignment: col === 1 ? leftAlign : centerAlign
          }));
        }
      }
    }
  }

  // Footer row - MERGE
  const footerRow = totalRows - 1;
  styleCell(footerRow, 0, applyBorder({
    font: { size: 9, color: { rgb: "FF808080" }, italic: true },
    alignment: centerAlign
  }));
  mergeCells(footerRow, 0, footerRow, isAdmin ? 6 : 5);
}

  applyVoidExcelStyles(ws, totalRows) {
    // Styling for void report
    if (ws["A1"]) {
      ws["A1"].s = {
        font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 14 },
        fill: { fgColor: { rgb: "FFDC2626" } },
        alignment: { horizontal: "center" },
      };
    }

    if (ws["A5"]) {
      ws["A5"].s = {
        font: { bold: true, size: 11 },
        fill: { fgColor: { rgb: "FFFFCDD2" } },
      };
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatProductNames(order) {
    if (order.productNames && order.productNames !== "No items") {
      return order.productNames;
    }

    const items = this.parseItems(order.items);
    return items.map((item) => item.name).join(", ") || "No products";
  }

  parseItems(itemsString) {
    if (!itemsString || itemsString === "[]" || itemsString === "{}") {
      return [];
    }

    try {
      const items = JSON.parse(itemsString);
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }

  getTimeRangeText(timeRange) {
    if (timeRange === "all") {
      return "All Time";
    } else if (timeRange === "today") {
      return "Today";
    } else if (timeRange === "yesterday") {
      return "Yesterday";
    } else if (timeRange === "week") {
      return "This Week";
    } else if (timeRange === "month") {
      return "This Month";
    } else if (timeRange === "custom") {
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      return `${startDate} to ${endDate}`;
    }
    return "All Time";
  }

  // Helper function for currency formatting
  formatCurrency(value) {
    const num = parseFloat(value || 0);
    return `P${num.toFixed(2)}`;
  }

  showNotification(type, message) {
    const modal = document.getElementById("notificationModal");
    const icon = document.getElementById("notificationIcon");
    const title = document.getElementById("notificationTitle");
    const msg = document.getElementById("notificationMessage");

    if (!modal || !icon || !title || !msg) {
      console.error("Notification modal elements not found");
      alert(message);
      return;
    }

    // Set icon and colors based on type
    if (type === "success") {
      icon.className =
        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100";
      icon.innerHTML = `
        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
      title.textContent = "Success";
      title.className = "text-lg font-bold text-green-900 mb-1";
    } else if (type === "error") {
      icon.className =
        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100";
      icon.innerHTML = `
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
      title.textContent = "Error";
      title.className = "text-lg font-bold text-red-900 mb-1";
    } else if (type === "warning") {
      icon.className =
        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-100";
      icon.innerHTML = `
        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      `;
      title.textContent = "Warning";
      title.className = "text-lg font-bold text-yellow-900 mb-1";
    } else {
      icon.className =
        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100";
      icon.innerHTML = `
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `;
      title.textContent = "Information";
      title.className = "text-lg font-bold text-blue-900 mb-1";
    }

    msg.textContent = message;
    modal.classList.remove("hidden");
  }

  closeNotification() {
    const modal = document.getElementById("notificationModal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  showLoading(show) {
    const loading = document.getElementById("loadingOverlay");
    if (!loading) return;

    if (show) {
      loading.classList.remove("hidden");
      loading.classList.add("flex");
    } else {
      loading.classList.add("hidden");
      loading.classList.remove("flex");
    }
  }
 async loadCashoutRecords() {
    this.showLoading(true);

    const params = new URLSearchParams({
      action: 'cashout',
      page: this.cashoutCurrentPage,
      limit: this.itemsPerPage,
      branch: document.getElementById('branchFilter') ? document.getElementById('branchFilter').value : 'all',
      timeRange: document.getElementById('timeRange').value
    });

    if (document.getElementById('timeRange').value === 'custom') {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
    }

    try {
      const response = await fetch(`backend/salesapi.php?${params.toString()}`);
      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        console.error('Response was:', responseText);
        throw new Error('Server returned invalid response');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to load cash-out records');
      }

      this.cashoutData = result.data;
      this.cashoutTotalRecords = result.pagination.total;
      this.cashoutTotalPages = result.pagination.pages;

      this.renderCashoutTable();
      this.updateCashoutPagination();
    } catch (error) {
      console.error('Error loading cash-out records:', error);
      this.showNotification('error', 'Failed to load cash-out records: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  renderCashoutTable() {
    const tbody = document.getElementById('cashoutTableBody');
    const emptyState = document.getElementById('cashoutEmptyState');

    if (this.cashoutData.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      document.getElementById('cashoutPagination').classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    document.getElementById('cashoutPagination').classList.remove('hidden');

    tbody.innerHTML = this.cashoutData.map(record => `
      <tr class="hover:bg-red-50 transition-colors duration-150">
        <td class="px-6 py-4 text-sm font-medium text-gray-900">
          #${record.id}
        </td>
        ${this.isAdmin() ? `
        <td class="px-6 py-4 text-sm font-medium text-blue-700">
          ${record.branch || 'Unknown'}
        </td>
        ` : ''}
        <td class="px-6 py-4 text-sm text-gray-600">
          ${this.formatDateTime(record.created_at)}
        </td>
        <td class="px-6 py-4 text-sm font-medium text-gray-700">
          ${record.cashier_name || record.cashier_email || 'Unknown'}
        </td>
        <td class="px-6 py-4 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            record.type === 'withdrawal' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }">
            <i class="fas fa-${record.type === 'withdrawal' ? 'arrow-down' : 'arrow-up'} mr-1"></i>
            ${record.type.charAt(0).toUpperCase() + record.type.slice(1)}
          </span>
        </td>
        <td class="px-6 py-4 text-sm font-bold text-right ${
          record.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
        }">
          ${record.type === 'withdrawal' ? '-' : '+'}₱${parseFloat(record.amount).toFixed(2)}
        </td>
        <td class="px-6 py-4 text-sm text-gray-700">
          <div class="max-w-xs truncate" title="${record.reason || 'No reason provided'}">
            ${record.reason || '<span class="text-gray-400 italic">No reason provided</span>'}
          </div>
        </td>
        <td class="px-6 py-4 text-center">
          <button onclick="salesReport.viewCashierDetails(${record.cashier_session_id})" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium">
            <i class="fas fa-external-link-alt"></i> View Session
          </button>
        </td>
      </tr>
    `).join('');
  }

  updateCashoutPagination() {
    const start = (this.cashoutCurrentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.cashoutCurrentPage * this.itemsPerPage, this.cashoutTotalRecords);

    const cashoutStartEl = document.getElementById('cashoutStart');
    const cashoutEndEl = document.getElementById('cashoutEnd');
    const cashoutTotalEl = document.getElementById('cashoutTotal');
    const cashoutCurrentPageEl = document.getElementById('cashoutCurrentPage');

    if (cashoutStartEl) cashoutStartEl.textContent = start;
    if (cashoutEndEl) cashoutEndEl.textContent = end;
    if (cashoutTotalEl) cashoutTotalEl.textContent = this.cashoutTotalRecords;
    if (cashoutCurrentPageEl) cashoutCurrentPageEl.textContent = this.cashoutCurrentPage;

    const prevBtn = document.getElementById('cashoutPrevPage');
    const nextBtn = document.getElementById('cashoutNextPage');

    if (prevBtn) prevBtn.disabled = this.cashoutCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = this.cashoutCurrentPage === this.cashoutTotalPages;
  }

  exportCashoutToExcel() {
    if (this.cashoutData.length === 0) {
      this.showNotification('warning', 'No data to export');
      return;
    }

    const totalWithdrawals = this.cashoutData
      .filter(r => r.type === 'withdrawal')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
    
    const totalDeposits = this.cashoutData
      .filter(r => r.type === 'deposit')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const netAmount = totalDeposits - totalWithdrawals;

    const branchFilter = document.getElementById('branchFilter');
    const currentBranch = branchFilter ? branchFilter.value : 'all';
    const branchText = currentBranch === 'all' ? 'All Branches' : currentBranch;

    const timeRange = document.getElementById('timeRange').value;
    const timeRangeText = this.getTimeRangeText(timeRange);

    const ws_data = [];

    ws_data.push(['K - STREET']);
    ws_data.push([`BRANCH: ${branchText}`]);
    ws_data.push([`Cash-Out Report - Period: ${timeRangeText}`]);
    ws_data.push([]);

    ws_data.push(['CASH-OUT SUMMARY']);
    ws_data.push([`Total Records: ${this.cashoutData.length}`]);
    ws_data.push([`Total Withdrawals: ₱${totalWithdrawals.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`]);
    ws_data.push([`Total Deposits: ₱${totalDeposits.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`]);
    ws_data.push([`Net Amount: ₱${netAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`]);
    ws_data.push([]);

    const headers = this.isAdmin()
      ? ['ID', 'Branch', 'Date & Time', 'Cashier', 'Type', 'Amount', 'Reason']
      : ['ID', 'Date & Time', 'Cashier', 'Type', 'Amount', 'Reason'];
    ws_data.push(headers);

    this.cashoutData.forEach(record => {
      const row = this.isAdmin()
        ? [
            record.id,
            record.branch || 'Unknown',
            this.formatDateTime(record.created_at),
            record.cashier_name || record.cashier_email || 'Unknown',
            record.type.charAt(0).toUpperCase() + record.type.slice(1),
            parseFloat(record.amount),
            record.reason || 'No reason provided'
          ]
        : [
            record.id,
            this.formatDateTime(record.created_at),
            record.cashier_name || record.cashier_email || 'Unknown',
            record.type.charAt(0).toUpperCase() + record.type.slice(1),
            parseFloat(record.amount),
            record.reason || 'No reason provided'
          ];
      ws_data.push(row);
    });

    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString('en-PH')}`]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    this.applyCashoutExcelStyles(ws, ws_data.length);

    ws['!cols'] = this.isAdmin()
      ? [
          { wch: 8 }, { wch: 15 }, { wch: 22 }, { wch: 25 }, 
          { wch: 12 }, { wch: 15 }, { wch: 40 }
        ]
      : [
          { wch: 8 }, { wch: 22 }, { wch: 25 }, 
          { wch: 12 }, { wch: 15 }, { wch: 40 }
        ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cash-Out Report');

    const filename = `K-Street-CashOut_Report_${currentBranch}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    this.showNotification('success', 'Cash-out report exported successfully!');
  }

  applyCashoutExcelStyles(ws, totalRows) {
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 14 },
        fill: { fgColor: { rgb: 'FFDC2626' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    if (ws['A5']) {
      ws['A5'].s = {
        font: { bold: true, size: 11 },
        fill: { fgColor: { rgb: 'FFFFCDD2' } },
        alignment: { horizontal: 'left' }
      };
    }

    const headerRow = 11;
    const numCols = this.isAdmin() ? 7 : 6;
    for (let col = 0; col < numCols; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 10 },
          fill: { fgColor: { rgb: 'FFD32F2F' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    }
  }

  showEditCashoutModal(cashoutId) {
  const record = this.cashoutData.find(r => r.id === cashoutId);
  if (!record) {
    this.showNotification('error', 'Cash-out record not found');
    return;
  }

  this.selectedCashout = record;

  // Populate form
  const editCashoutInfo = document.getElementById('editCashoutInfo');
  if (editCashoutInfo) {
    editCashoutInfo.innerHTML = `
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="font-semibold">Record #:</span>
          <span>${record.id}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-semibold">Date:</span>
          <span>${this.formatDateTime(record.created_at)}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-semibold">Cashier:</span>
          <span>${record.cashier_name || record.cashier_email || 'Unknown'}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-semibold">Branch:</span>
          <span>${record.branch || 'Unknown'}</span>
        </div>
        ${record.edited_by ? `
        <div class="mt-2 pt-2 border-t border-gray-200">
          <p class="text-xs text-gray-500">Last edited by: ${record.edited_by}</p>
          <p class="text-xs text-gray-500">Edit date: ${this.formatDateTime(record.edited_at)}</p>
          <p class="text-xs text-gray-500">Edit reason: ${record.edit_reason}</p>
        </div>
        ` : ''}
      </div>
    `;
  }

  // Fill in current values
  const typeSelect = document.getElementById('editCashoutType');
  const amountInput = document.getElementById('editCashoutAmount');
  const reasonInput = document.getElementById('editCashoutReason');
  const editReasonInput = document.getElementById('editCashoutEditReason');
  const pinInput = document.getElementById('editCashoutPin');
  const pinError = document.getElementById('editPinError');

  if (typeSelect) typeSelect.value = record.type;
  if (amountInput) amountInput.value = parseFloat(record.amount).toFixed(2);
  if (reasonInput) reasonInput.value = record.reason || '';
  if (editReasonInput) editReasonInput.value = '';
  if (pinInput) pinInput.value = '';
  if (pinError) pinError.classList.add('hidden');

  // Show modal
  const modal = document.getElementById('editCashoutModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// ============================================
// CONFIRM EDIT CASHOUT
// ============================================
async confirmEditCashout() {
  const type = document.getElementById('editCashoutType').value;
  const amount = document.getElementById('editCashoutAmount').value;
  const reason = document.getElementById('editCashoutReason').value.trim();
  const editReason = document.getElementById('editCashoutEditReason').value.trim();
  const pin = document.getElementById('editCashoutPin').value.trim();

  // Validation
  if (!type || !amount || !reason || !editReason) {
    this.showNotification('warning', 'Please fill in all required fields');
    return;
  }

  if (!pin) {
    this.showNotification('warning', 'Please enter owner PIN');
    return;
  }

  if (parseFloat(amount) <= 0) {
    this.showNotification('warning', 'Amount must be greater than 0');
    return;
  }

  this.showLoading(true);

  try {
    // Verify owner PIN first
    const verifyResponse = await fetch('backend/salesapi.php?action=verify-owner-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin })
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      const pinError = document.getElementById('editPinError');
      if (pinError) {
        pinError.textContent = verifyResult.message || 'Invalid owner PIN';
        pinError.classList.remove('hidden');
      }
      this.showLoading(false);
      return;
    }

    const ownerInfo = verifyResult.owner;

    // Proceed with edit
    const editResponse = await fetch('backend/salesapi.php?action=edit-cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cashoutId: this.selectedCashout.id,
        type: type,
        amount: parseFloat(amount),
        reason: reason,
        editReason: editReason,
        owner: ownerInfo
      })
    });

    const editResult = await editResponse.json();

    if (!editResult.success) {
      throw new Error(editResult.message);
    }

    // Close modal
    this.closeModal('editCashoutModal');

    // Show success notification
    this.showNotification('success', `Cash-out record #${this.selectedCashout.id} has been updated successfully`);

    // Reload data
    this.loadCashoutRecords();
  } catch (error) {
    console.error('Edit cashout error:', error);
    this.showNotification('error', 'Failed to edit cash-out: ' + error.message);
  } finally {
    this.showLoading(false);
  }
}

// ============================================
// UPDATE RENDER CASHOUT TABLE - ADD EDIT BUTTON
// ============================================
renderCashoutTable() {
  const tbody = document.getElementById('cashoutTableBody');
  const emptyState = document.getElementById('cashoutEmptyState');

  if (this.cashoutData.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    document.getElementById('cashoutPagination').classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  document.getElementById('cashoutPagination').classList.remove('hidden');

  tbody.innerHTML = this.cashoutData.map(record => `
    <tr class="hover:bg-red-50 transition-colors duration-150">
      <td class="px-6 py-4 text-sm font-medium text-gray-900">
        #${record.id}
        ${record.edited_by ? '<span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title="Edited by ' + record.edited_by + '"><i class="fas fa-edit mr-1"></i>EDITED</span>' : ''}
      </td>
      ${this.isAdmin() ? `
      <td class="px-6 py-4 text-sm font-medium text-blue-700">
        ${record.branch || 'Unknown'}
      </td>
      ` : ''}
      <td class="px-6 py-4 text-sm text-gray-600">
        ${this.formatDateTime(record.created_at)}
      </td>
      <td class="px-6 py-4 text-sm font-medium text-gray-700">
        ${record.cashier_name || record.cashier_email || 'Unknown'}
      </td>
      <td class="px-6 py-4 text-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          record.type === 'withdrawal' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }">
          <i class="fas fa-${record.type === 'withdrawal' ? 'arrow-down' : 'arrow-up'} mr-1"></i>
          ${record.type.charAt(0).toUpperCase() + record.type.slice(1)}
        </span>
      </td>
      <td class="px-6 py-4 text-sm font-bold text-right ${
        record.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
      }">
        ${record.type === 'withdrawal' ? '-' : '+'}₱${parseFloat(record.amount).toFixed(2)}
      </td>
      <td class="px-6 py-4 text-sm text-gray-700">
        <div class="max-w-xs">
          <div class="truncate" title="${record.reason || 'No reason provided'}">
            ${record.reason || '<span class="text-gray-400 italic">No reason provided</span>'}
          </div>
          ${record.edited_by ? `<div class="text-xs text-blue-600 mt-1" title="${record.edit_reason}"><i class="fas fa-info-circle"></i> ${record.edit_reason}</div>` : ''}
        </div>
      </td>
      <td class="px-6 py-4 text-center">
        <div class="flex gap-2 justify-center">
          
          <button onclick="salesReport.showEditCashoutModal(${record.id})" 
                  class="text-green-600 hover:text-green-800 text-sm font-medium"
                  title="Edit Record">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

formatTimeOnly(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

}

function populateSalesTable(salesData) {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';
    
    salesData.forEach((sale, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        
        // Format products list
        const productsText = sale.products.map(p => 
            `${p.name} (${p.quantity}x)`
        ).join(', ');
        
        // Determine order type class
        let orderTypeClass = 'order-type-dinein';
        if (sale.order_type === 'Take Out') orderTypeClass = 'order-type-takeout';
        if (sale.order_type === 'Delivery') orderTypeClass = 'order-type-delivery';
        
        row.innerHTML = `
            <td class="py-4 px-6 text-sm text-gray-900">${index + 1}</td>
            <td class="py-4 px-6 text-sm text-gray-900">${sale.date_time}</td>
            <td class="py-4 px-6 order-details-cell">
                <div class="space-y-1">
                    <div class="products-list">${productsText}</div>
                    <div class="order-meta">
                        <span class="amount">₱${parseFloat(sale.total).toFixed(2)}</span>
                        <span class="order-type-badge ${orderTypeClass}">${sale.order_type}</span>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6 text-sm text-right text-gray-900">₱${parseFloat(sale.paid).toFixed(2)}</td>
            <td class="py-4 px-6 text-sm text-right text-gray-900">₱${parseFloat(sale.change).toFixed(2)}</td>
            <td class="py-4 px-6 text-sm text-gray-900">${sale.cashier}</td>
            <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ${sale.payment_method}
                </span>
            </td>
            <td class="py-4 px-6 text-center">
                <button onclick="viewReceipt(${sale.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-receipt"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.salesReport = new SalesReport();
});