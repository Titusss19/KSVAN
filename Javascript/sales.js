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

    // Out Source report properties
    this.outCurrentPage = 1;
    this.outTotalPages = 1;
    this.outTotalRecords = 0;
    this.outData = [];

    console.log("🔍 Sales Report initialized");
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSales();
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
      } else if (this.activeTab === "cashout") {
        this.cashoutCurrentPage = 1;
        this.loadCashoutRecords();
      } else if (this.activeTab === "out") {
        this.outCurrentPage = 1;
        this.loadOutSourceRecords();
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
      } else if (this.activeTab === "cashout") {
        this.exportCashoutToExcel();
      } else if (this.activeTab === "out") {
        this.exportOutSourceToExcel();
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

    // Cashout Pagination
    const cashoutPrevBtn = document.getElementById("cashoutPrevPage");
    const cashoutNextBtn = document.getElementById("cashoutNextPage");
    if (cashoutPrevBtn) {
      cashoutPrevBtn.addEventListener("click", () => {
        if (this.cashoutCurrentPage > 1) {
          this.cashoutCurrentPage--;
          this.loadCashoutRecords();
        }
      });
    }
    if (cashoutNextBtn) {
      cashoutNextBtn.addEventListener("click", () => {
        if (this.cashoutCurrentPage < this.cashoutTotalPages) {
          this.cashoutCurrentPage++;
          this.loadCashoutRecords();
        }
      });
    }

    // Out Source Pagination
    const outPrevBtn = document.getElementById("outPrevPage");
    const outNextBtn = document.getElementById("outNextPage");
    if (outPrevBtn) {
      outPrevBtn.addEventListener("click", () => {
        if (this.outCurrentPage > 1) {
          this.outCurrentPage--;
          this.loadOutSourceRecords();
        }
      });
    }
    if (outNextBtn) {
      outNextBtn.addEventListener("click", () => {
        if (this.outCurrentPage < this.outTotalPages) {
          this.outCurrentPage++;
          this.loadOutSourceRecords();
        }
      });
    }

    // Modal close buttons
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

    const closeOutDetailBtn = document.getElementById("closeOutDetail");
    if (closeOutDetailBtn) {
      closeOutDetailBtn.addEventListener("click", () => {
        this.closeModal("outDetailModal");
      });
    }

    const printOutDetailBtn = document.getElementById("printOutDetail");
    if (printOutDetailBtn) {
      printOutDetailBtn.addEventListener("click", () => {
        this.printOutDetail();
      });
    }

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

    const cancelEditCashoutBtn = document.getElementById("cancelEditCashout");
    if (cancelEditCashoutBtn) {
      cancelEditCashoutBtn.addEventListener("click", () => {
        this.closeModal("editCashoutModal");
      });
    }

    const confirmEditCashoutBtn = document.getElementById("confirmEditCashout");
    if (confirmEditCashoutBtn) {
      confirmEditCashoutBtn.addEventListener("click", () => {
        this.confirmEditCashout();
      });
    }
  }

  switchTab(tab) {
    this.activeTab = tab;

    document.querySelectorAll(".tab-btn-kstreet").forEach((btn) => {
      if (btn.dataset.tab === tab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    document.querySelectorAll(".report-pane").forEach((pane) => {
      pane.classList.add("hidden");
    });

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
    } else if (tab === "cashout") {
      document.getElementById("cashoutReport").classList.remove("hidden");
      if (this.cashoutData.length === 0) {
        this.loadCashoutRecords();
      }
    } else if (tab === "out") {
      document.getElementById("outReport").classList.remove("hidden");
      if (this.outData.length === 0) {
        this.loadOutSourceRecords();
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
    }
  }

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

  async loadCashoutRecords() {
    this.showLoading(true);
    const params = new URLSearchParams({
      action: "cashout",
      page: this.cashoutCurrentPage,
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
        throw new Error(result.message || "Failed to load cash-out records");
      }

      this.cashoutData = result.data;
      this.cashoutTotalRecords = result.pagination.total;
      this.cashoutTotalPages = result.pagination.pages;

      this.renderCashoutTable();
      this.updateCashoutPagination();
    } catch (error) {
      console.error("Error loading cash-out records:", error);
      this.showNotification(
        "error",
        "Failed to load cash-out records: " + error.message
      );
    } finally {
      this.showLoading(false);
    }
  }

  async loadOutSourceRecords() {
    this.showLoading(true);
    const params = new URLSearchParams({
      action: "outsource",
      page: this.outCurrentPage,
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

    console.log(
      "📤 OutSource Request:",
      `backend/salesapi.php?${params.toString()}`
    );

    try {
      const response = await fetch(`backend/salesapi.php?${params.toString()}`);
      const responseText = await response.text();
      console.log("📥 OutSource Response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ JSON Parse Error:", e);
        throw new Error("Server returned invalid JSON");
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to load outsource records");
      }

      this.outData = result.data || [];
      this.outTotalRecords = result.pagination?.total || 0;
      this.outTotalPages = result.pagination?.pages || 1;

      console.log("✅ OutSource loaded:", this.outData.length, "records");

      this.renderOutSourceTable();
      this.updateOutSourcePagination();
    } catch (error) {
      console.error("❌ OutSource Error:", error);
      this.showNotification(
        "error",
        "Failed to load outsource: " + error.message
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
            <span class="font-medium text-gray-900">${this.formatDate(
              order.created_at
            )}</span>
            <span class="text-xs text-gray-500">${this.formatTimeOnly(
              order.created_at
            )}</span>
          </div>
        </td>
        <td class="px-6 py-4 order-details-cell">
          <div class="space-y-1">
            <div class="products-list">${this.formatProductNames(order)}</div>
            <div class="order-meta">
              <span class="amount">₱${parseFloat(order.total).toFixed(2)}</span>
              <span class="order-type-badge ${this.getOrderTypeClass(
                order.orderType
              )}">${order.orderType}</span>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="space-y-1">
            <div class="text-sm font-medium text-gray-700">${
              order.cashier_name || order.cashier_email || "Unknown"
            }</div>
            <div class="flex items-center gap-3 text-xs text-gray-600">
              <div><span class="text-gray-500">Paid: <br></span><span class="font-semibold text-green-600">₱${parseFloat(
                order.paidAmount
              ).toFixed(2)}</span></div>
              <div><span class="text-gray-500">Change: <br></span><span class="font-semibold text-blue-600">₱${parseFloat(
                order.changeAmount
              ).toFixed(2)}</span></div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${this.getPaymentMethodClass(
            order.payment_method
          )}">
            ${order.payment_method || "Cash"}
          </span>
        </td>
        <td class="px-4 py-2 text-center">
          <div class="flex space-x-2 justify-center">
            <button onclick="salesReport.viewReceipt(${
              order.id
            })" class="bg-gradient-to-r from-black to-black text-white px-4 py-2 rounded-lg hover:from-black hover:to-black transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">View</button>
            ${
              !order.is_void
                ? `<button onclick="salesReport.showVoidModal(${order.id})" class="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">Void</button>`
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
    return "order-type-dinein";
  }

  getPaymentMethodClass(paymentMethod) {
    const method = (paymentMethod || "Cash").toLowerCase();
    if (method.includes("cash")) return "bg-green-100 text-green-800";
    if (method.includes("gcash")) return "bg-blue-100 text-blue-800";
    if (method.includes("grab")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  }

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
            ? `<td class="px-6 py-4 text-sm font-medium text-blue-700">${
                session.branch || "Unknown"
              }</td>`
            : ""
        }
        <td class="px-6 py-4 text-sm font-medium text-gray-900">${
          session.username || session.user_email || "Unknown"
        }</td>
        <td class="px-6 py-4 text-sm text-gray-600">
          <div class="flex flex-col space-y-1">
            <span class="font-medium text-gray-900">${this.formatDate(
              session.login_time
            )}</span>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-green-600 font-semibold">${this.formatTimeOnly(
                session.login_time
              )}</span>
              <span class="text-gray-400">→</span>
              <span class="${
                session.logout_time
                  ? "text-red-600 font-semibold"
                  : "text-orange-500 font-medium"
              }">
                ${
                  session.logout_time
                    ? this.formatTimeOnly(session.logout_time)
                    : "Still Active"
                }
              </span>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 text-sm text-gray-700 text-center">${
          session.session_duration
        }</td>
        <td class="px-6 py-4">
          <div class="space-y-1 text-xs">
            <div class="flex justify-between items-center"><span class="text-gray-500">Start:</span><span class="font-semibold text-gray-700">₱${parseFloat(
              session.start_gross_sales
            ).toFixed(2)}</span></div>
            <div class="flex justify-between items-center"><span class="text-gray-500">End:</span><span class="font-semibold text-gray-700">₱${parseFloat(
              session.end_gross_sales
            ).toFixed(2)}</span></div>
            <div class="flex justify-between items-center pt-1 border-t border-gray-200"><span class="text-green-700 font-medium">Session:</span><span class="font-bold text-green-600">₱${parseFloat(
              session.session_sales
            ).toFixed(2)}</span></div>
            <div class="flex justify-between items-center pt-1 border-t border-gray-200"><span class="text-blue-600">Discount:</span><span class="font-semibold text-blue-600">₱${parseFloat(
              session.total_discount
            ).toFixed(2)}</span></div>
            <div class="flex justify-between items-center"><span class="text-red-600">Void:</span><span class="font-semibold text-red-600">₱${parseFloat(
              session.total_void
            ).toFixed(2)} ${
          session.void_count > 0
            ? `<span class="text-xs ml-1">(${session.void_count})</span>`
            : ""
        }</span></div>
          </div>
        </td>
        <td class="px-4 py-2 text-center">
          <button onclick="salesReport.viewCashierDetails(${
            session.id
          })" class="bg-gradient-to-r from-black to-black text-white px-4 py-2 rounded-lg hover:from-black hover:to-black transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">View Details</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

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
            ? `<td class="px-6 py-4 text-sm font-medium text-blue-700">${
                order.branch || "Unknown"
              }</td>`
            : ""
        }
        <td class="px-6 py-4">
          <div class="space-y-1 text-xs">
            <div class="flex flex-col">
              <span class="text-red-600 font-semibold">Voided:</span>
              <span class="text-gray-700">${
                order.voided_at ? this.formatDate(order.voided_at) : "N/A"
              }</span>
              <span class="text-gray-500">${
                order.voided_at ? this.formatTimeOnly(order.voided_at) : ""
              }</span>
            </div>
            <div class="flex flex-col pt-2 border-t border-gray-200">
              <span class="text-gray-600 font-semibold">Original:</span>
              <span class="text-gray-700">${this.formatDate(
                order.created_at
              )}</span>
              <span class="text-gray-500">${this.formatTimeOnly(
                order.created_at
              )}</span>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="space-y-1">
            <div class="text-sm text-gray-700 max-w-xs">
              <div class="line-clamp-2" title="${this.formatProductNames(
                order
              )}">${this.formatProductNames(order)}</div>
            </div>
            <div class="flex items-center gap-2 text-xs pt-1">
              <span class="font-bold text-red-600">₱${parseFloat(
                order.total
              ).toFixed(2)}</span>
              <span class="text-gray-400">•</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">${
                order.orderType
              }</span>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="space-y-1 text-xs">
            <div class="flex flex-col"><span class="text-gray-500">Cashier:</span><span class="text-gray-900 font-medium">${
              order.cashier_name || order.cashier_email || "Unknown"
            }</span></div>
            <div class="flex flex-col pt-2 border-t border-gray-200"><span class="text-gray-500">Voided by:</span><span class="text-red-600 font-medium">${
              order.voided_by || "Admin"
            }</span></div>
          </div>
        </td>
        <td class="px-6 py-4 text-sm text-gray-700">
          <div class="max-w-xs">${
            order.void_reason
              ? `<span class="text-gray-800">${order.void_reason}</span>`
              : '<span class="text-gray-500 italic">No reason provided</span>'
          }</div>
        </td>
        <td class="px-4 py-2 text-center">
          <button onclick="salesReport.viewReceipt(${
            order.id
          })" class="bg-gradient-to-r from-black to-black text-white px-4 py-2 rounded-lg hover:from-black hover:to-black transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">View Receipt</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  renderCashoutTable() {
    const tbody = document.getElementById("cashoutTableBody");
    const emptyState = document.getElementById("cashoutEmptyState");

    if (this.cashoutData.length === 0) {
      tbody.innerHTML = "";
      emptyState.classList.remove("hidden");
      document.getElementById("cashoutPagination").classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    document.getElementById("cashoutPagination").classList.remove("hidden");

    tbody.innerHTML = this.cashoutData
      .map(
        (record) => `
      <tr class="hover:bg-red-50 transition-colors duration-150">
        <td class="px-6 py-4 text-sm font-medium text-gray-900">
          #${record.id}
          ${
            record.edited_by
              ? '<span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title="Edited by ' +
                record.edited_by +
                '"><i class="fas fa-edit mr-1"></i>EDITED</span>'
              : ""
          }
        </td>
        ${
          this.isAdmin()
            ? `<td class="px-6 py-4 text-sm font-medium text-blue-700">${
                record.branch || "Unknown"
              }</td>`
            : ""
        }
        <td class="px-6 py-4 text-sm text-gray-600">${this.formatDateTime(
          record.created_at
        )}</td>
        <td class="px-6 py-4 text-sm font-medium text-gray-700">${
          record.cashier_name || record.cashier_email || "Unknown"
        }</td>
        <td class="px-6 py-4 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            record.type === "withdrawal"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }">
            <i class="fas fa-${
              record.type === "withdrawal" ? "arrow-down" : "arrow-up"
            } mr-1"></i>
            ${record.type.charAt(0).toUpperCase() + record.type.slice(1)}
          </span>
        </td>
        <td class="px-6 py-4 text-sm font-bold text-right ${
          record.type === "withdrawal" ? "text-red-600" : "text-green-600"
        }">
          ${record.type === "withdrawal" ? "-" : "+"}₱${parseFloat(
          record.amount
        ).toFixed(2)}
        </td>
        <td class="px-6 py-4 text-sm text-gray-700">
          <div class="max-w-xs">
            <div class="truncate" title="${
              record.reason || "No reason provided"
            }">
              ${
                record.reason ||
                '<span class="text-gray-400 italic">No reason provided</span>'
              }
            </div>
            ${
              record.edited_by
                ? `<div class="text-xs text-blue-600 mt-1" title="${record.edit_reason}"><i class="fas fa-info-circle"></i> ${record.edit_reason}</div>`
                : ""
            }
          </div>
        </td>
        <td class="px-6 py-4 text-center">
          <div class="flex gap-2 justify-center">
            <button onclick="salesReport.showEditCashoutModal(${
              record.id
            })" class="text-green-600 hover:text-green-800 text-sm font-medium" title="Edit Record"><i class="fas fa-edit"></i></button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  }

  renderOutSourceTable() {
    const tbody = document.getElementById("outTableBody");
    const emptyState = document.getElementById("outEmptyState");

    if (this.outData.length === 0) {
      tbody.innerHTML = "";
      emptyState.classList.remove("hidden");
      document.getElementById("outPagination").classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    document.getElementById("outPagination").classList.remove("hidden");

    tbody.innerHTML = this.outData
      .map(
        (record) => `
      <tr class="hover:bg-red-50 transition-colors duration-150">
        <td class="px-6 py-4 text-sm text-gray-600">
          <div class="flex flex-col">
            <span class="font-medium text-gray-900">${this.formatDate(
              record.created_at
            )}</span>
            <span class="text-xs text-gray-500">${this.formatTimeOnly(
              record.created_at
            )}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-sm font-bold text-right text-red-600">₱${parseFloat(
          record.amount || 0
        ).toFixed(2)}</td>
        <td class="px-6 py-4">
          <div class="text-sm text-gray-900 max-w-md">${
            record.product_details || "No details"
          }</div>
        </td>
        <td class="px-6 py-4 text-sm font-medium text-gray-700">${
          record.personnel_name || record.personnel_email || "Unknown"
        }</td>
        <td class="px-6 py-4 text-center">
          <button onclick="salesReport.viewOutSourceDetail(${
            record.id
          })" class="bg-gradient-to-r from-black to-black text-white px-4 py-2 rounded-lg hover:from-black hover:to-black transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md">View Details</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

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

  updateCashoutPagination() {
    const start = (this.cashoutCurrentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(
      this.cashoutCurrentPage * this.itemsPerPage,
      this.cashoutTotalRecords
    );
    const cashoutStartEl = document.getElementById("cashoutStart");
    const cashoutEndEl = document.getElementById("cashoutEnd");
    const cashoutTotalEl = document.getElementById("cashoutTotal");
    const cashoutCurrentPageEl = document.getElementById("cashoutCurrentPage");
    if (cashoutStartEl) cashoutStartEl.textContent = start;
    if (cashoutEndEl) cashoutEndEl.textContent = end;
    if (cashoutTotalEl) cashoutTotalEl.textContent = this.cashoutTotalRecords;
    if (cashoutCurrentPageEl)
      cashoutCurrentPageEl.textContent = this.cashoutCurrentPage;
    const prevBtn = document.getElementById("cashoutPrevPage");
    const nextBtn = document.getElementById("cashoutNextPage");
    if (prevBtn) prevBtn.disabled = this.cashoutCurrentPage === 1;
    if (nextBtn)
      nextBtn.disabled = this.cashoutCurrentPage === this.cashoutTotalPages;
  }

  updateOutSourcePagination() {
    const start = (this.outCurrentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(
      this.outCurrentPage * this.itemsPerPage,
      this.outTotalRecords
    );
    const outStartEl = document.getElementById("outStart");
    const outEndEl = document.getElementById("outEnd");
    const outTotalEl = document.getElementById("outTotal");
    const outCurrentPageEl = document.getElementById("outCurrentPage");
    if (outStartEl) outStartEl.textContent = start;
    if (outEndEl) outEndEl.textContent = end;
    if (outTotalEl) outTotalEl.textContent = this.outTotalRecords;
    if (outCurrentPageEl) outCurrentPageEl.textContent = this.outCurrentPage;
    const prevBtn = document.getElementById("outPrevPage");
    const nextBtn = document.getElementById("outNextPage");
    if (prevBtn) prevBtn.disabled = this.outCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = this.outCurrentPage === this.outTotalPages;
  }

  // ============================================
  // VIEW CASHIER DETAILS - MISSING METHOD
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
      this.renderCashierDetailModal(session);
      const modal = document.getElementById("cashierDetailModal");
      if (modal) {
        modal.classList.remove("hidden");
      }
    } catch (error) {
      console.error("View Cashier Details Error:", error);
      this.showNotification(
        "error",
        "Failed to load session: " + error.message
      );
    } finally {
      this.showLoading(false);
    }
  }

  // ============================================
  // RENDER CASHIER DETAIL MODAL - MISSING METHOD
  // ============================================
  renderCashierDetailModal(session) {
    const cashierBranch = document.getElementById("cashierDetailBranch");
    if (cashierBranch) {
      cashierBranch.textContent = session.branch || window.currentUser.branch;
    }

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
                  ([method, data]) => {
                    // Handle Gcash + Cash split
                    if (method === 'Gcash + Cash') {
                      const gcashTotal = data.gcash_total || 0;
                      const cashTotal = data.cash_total || 0;
                      return `
                <div class="flex justify-between">
                  <span>├─ Gcash:</span>
                  <div class="text-right">
                    <span class="font-medium">${data.count} transaction${
                    data.count !== 1 ? "s" : ""
                  }</span>
                    <span class="ml-2 font-bold">₱${parseFloat(
                      gcashTotal
                    ).toFixed(2)}</span>
                  </div>
                </div>
                <div class="flex justify-between">
                  <span>└─ Cash:</span>
                  <div class="text-right">
                    <span class="font-medium">${data.count} transaction${
                    data.count !== 1 ? "s" : ""
                  }</span>
                    <span class="ml-2 font-bold">₱${parseFloat(
                      cashTotal
                    ).toFixed(2)}</span>
                  </div>
                </div>
              `;
                    } else {
                      return `
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
              `;
                    }
                  }
                )
                .join("")}
            </div>
          </div>
        `;
      }

      salesSummarySection.innerHTML = `
        <h3 class="font-bold text-green-800 mb-3">SALES SUMMARY</h3>
        <div class="space-y-2 text-sm">
          <div><strong>Initial Cash Amount:</strong> ₱${parseFloat(
            session.initial_cash_amount || 0
          ).toFixed(2)}</div>
          <div><strong>Starting Gross Sales:</strong> ₱${parseFloat(
            session.start_gross_sales
          ).toFixed(2)}</div>
          <div><strong>Ending Gross Sales:</strong> ₱${parseFloat(
            session.end_gross_sales
          ).toFixed(2)}</div>
          <div><strong>Sales During Session:</strong> ₱${parseFloat(
            session.session_sales
          ).toFixed(2)}</div>
          <div><strong>Total Cash Drawer:</strong> ₱${parseFloat(
            (parseFloat(session.initial_cash_amount || 0) + parseFloat(session.session_sales || 0))
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
  // VIEW OUT SOURCE DETAIL
  // ============================================
  async viewOutSourceDetail(recordId) {
    this.showLoading(true);
    try {
      const response = await fetch(
        `backend/salesapi.php?action=outsource-detail&id=${recordId}`
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
      const record = result.data;
      this.renderOutSourceDetailModal(record);
      const modal = document.getElementById("outDetailModal");
      if (modal) {
        modal.classList.remove("hidden");
      }
    } catch (error) {
      console.error("View OutSource Detail Error:", error);
      this.showNotification("error", "Failed to load record: " + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  renderOutSourceDetailModal(record) {
    const elements = {
      outDetailId: record.id,
      outDetailBranch: record.branch || "Unknown",
      outDetailDate: this.formatDateTime(record.created_at),
      outDetailPersonnel:
        record.personnel_name || record.personnel_email || "Unknown",
      outDetailTotal: `₱${parseFloat(record.amount || 0).toFixed(2)}`,
    };
    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
    const productsEl = document.getElementById("outDetailProducts");
    if (productsEl) {
      productsEl.innerHTML = `<div class="text-sm text-gray-900 whitespace-pre-wrap">${
        record.product_details || "No product details"
      }</div>`;
    }
  }

  printOutDetail() {
    const modal = document.getElementById("outDetailModal");
    if (!modal) return;
    const printContent = modal.querySelector(".receipt-kstreet").innerHTML;
    const printWindow = window.open("", "_blank", "width=350,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Out Source Receipt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Courier New', monospace; }
          body { width: 80mm; padding: 5mm; font-size: 12px; }
          .receipt-kstreet { width: 100%; }
          @media print { body { padding: 2mm; } }
        </style>
      </head>
      <body>
        <div class="receipt-kstreet">${printContent}</div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // ============================================
  // EXPORT METHODS
  // ============================================
  exportOutSourceToExcel() {
    if (this.outData.length === 0) {
      this.showNotification("warning", "No data to export");
      return;
    }
    const totalAmount = this.outData.reduce(
      (sum, r) => sum + parseFloat(r.amount || 0),
      0
    );
    const branchFilter = document.getElementById("branchFilter");
    const currentBranch = branchFilter ? branchFilter.value : "all";
    const branchText = currentBranch === "all" ? "All Branches" : currentBranch;
    const timeRange = document.getElementById("timeRange").value;
    const timeRangeText = this.getTimeRangeText(timeRange);
    const ws_data = [];
    ws_data.push(["K - STREET"]);
    ws_data.push([`BRANCH: ${branchText}`]);
    ws_data.push([`Out Source Report - Period: ${timeRangeText}`]);
    ws_data.push([]);
    ws_data.push(["OUT SOURCE SUMMARY"]);
    ws_data.push([`Total Records: ${this.outData.length}`]);
    ws_data.push([
      `Total Amount: ₱${totalAmount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`,
    ]);
    ws_data.push([]);
    const headers = ["Date & Time", "Amount", "Product Details", "Personnel"];
    ws_data.push(headers);
    this.outData.forEach((record) => {
      const row = [
        this.formatDateTime(record.created_at),
        parseFloat(record.amount || 0),
        record.product_details || "No details",
        record.personnel_name || record.personnel_email || "Unknown",
      ];
      ws_data.push(row);
    });
    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString("en-PH")}`]);
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws["!cols"] = [{ wch: 22 }, { wch: 15 }, { wch: 50 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Out Source Report");
    const filename = `K-Street-OutSource_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, filename);
    this.showNotification(
      "success",
      "Out Source report exported successfully!"
    );
  }

  // ============================================
  // VIEW RECEIPT - MISSING METHOD
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
  // VOID METHODS - MISSING METHODS
  // ============================================
  async showVoidModal(orderId) {
    const order = this.salesData.find((o) => o.id === orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return;
    }

    this.selectedOrder = order;

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

    const voidReasonInput = document.getElementById("voidReasonInput");
    const managerPin = document.getElementById("managerPin");
    const pinError = document.getElementById("pinError");
    const pinSection = document.getElementById("pinSection");

    if (voidReasonInput) voidReasonInput.value = "";
    if (managerPin) managerPin.value = "";
    if (pinError) pinError.classList.add("hidden");

    if (pinSection) {
      if (window.currentUser && window.currentUser.role === "cashier") {
        pinSection.classList.remove("hidden");
      } else {
        pinSection.classList.add("hidden");
      }
    }

    const receiptModal = document.getElementById("receiptModal");
    if (receiptModal) receiptModal.classList.add("hidden");

    const voidModal = document.getElementById("voidModal");
    if (voidModal) {
      voidModal.classList.remove("hidden");
    }
  }

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

      this.closeModal("voidModal");

      this.showNotification(
        "success",
        `Order #${this.selectedOrder.id} has been successfully voided`
      );

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
  // PRINT METHODS
  // ============================================
  printCashierReport() {
    const session = this.selectedSession;
    if (!session) {
      console.error("No session selected");
      this.showNotification("error", "No session selected to print");
      return;
    }

    console.log("🖨️ Printing session:", session);

    // Calculate payment methods if needed
    let paymentMethods = {};
    if (
      session.payment_methods &&
      typeof session.payment_methods === "object" &&
      !Array.isArray(session.payment_methods)
    ) {
      paymentMethods = session.payment_methods;
    } else if (session.orders && session.orders.length > 0) {
      session.orders.forEach((order) => {
        const method = order.payment_method || "Cash";
        if (!paymentMethods[method]) {
          paymentMethods[method] = { count: 0, total: 0 };
        }
        paymentMethods[method].count++;
        paymentMethods[method].total += parseFloat(order.total || 0);
      });
    }

    const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Cashier Session Report</title>
        <meta charset="UTF-8">
        <style>
    /* RESET EVERYTHING */
    * {
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        line-height: 1.4 !important;
        font-family: 'Courier New', monospace !important;
    }
    
    @page {
        size: 80mm auto !important;
        margin: 0 !important;
    }
    
    html, body {
        width: 80mm !important;
        height: auto !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: white !important;
        color: black !important;
        font-size: 16px !important;
        overflow: visible !important;
    }
    
    body {
        padding: 1mm !important;
        margin: 0 auto !important;
        width: 80mm !important;
        min-height: auto !important;
    }
    
    .receipt {
        width: 80mm !important;
        margin: 0 auto !important;
        padding: 1mm !important;
        text-align: center !important;
        overflow: visible !important;
    }
    
    /* HEADER */
    .store-name {
        font-size: 18px !important;
        font-weight: bold !important;
        text-transform: uppercase;
        margin: 0.4mm 0 !important;
    }
    
    .store-address {
        font-size: 17px !important;
        margin: 0.4mm 0 !important;
    }
    
    .report-title {
        font-size: 18px !important;
        font-weight: bold !important;
        margin: 0.4mm 0 !important;
    }
    
    .divider {
        font-size: 16px !important;
        margin: 0.9mm 0 !important;
        padding: 0 !important;
    }
    
    /* SECTION INFO */
    .info {
        font-size: 17px !important;
        text-align: left !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        table-layout: fixed !important;
    }
    
    .info td {
        font-size: 17px !important;
        padding: 0.4mm 0 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        white-space: normal !important;
    }
    
    .info td:first-child {
        width: 35% !important;
        font-weight: bold !important;
        vertical-align: top !important;
    }
    
    .info td:last-child {
        width: 65% !important;
        word-break: break-all !important;
    }
    
    /* SECTION HEADERS */
    .section-header {
        font-size: 17px !important;
        font-weight: bold !important;
        text-align: left !important;
        margin: 0.4mm 0 !important;
        page-break-after: avoid !important;
    }
    
    /* SALES TABLE */
    .sales-table {
        width: 100% !important;
        font-size: 16px !important;
        border-collapse: collapse !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-inside: auto !important;
    }
    
    .sales-table td {
        padding: 0.4mm 0 !important;
        vertical-align: top !important;
        font-weight: bold !important;
    }
    
    .sales-table tr {
        page-break-inside: avoid !important;
    }
    
    .sales-label {
        text-align: left !important;
        width: 60% !important;
        font-size: 16px !important;
    }
    
    .sales-value {
        text-align: right !important;
        width: 40% !important;
        font-size: 16px !important;
    }
    
    /* PAYMENT METHODS TABLE */
    .payment-table {
        width: 100% !important;
        font-size: 16px !important;
        border-collapse: collapse !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-inside: auto !important;
    }
    
    .payment-table td {
        padding: 0.4mm 0 !important;
        vertical-align: top !important;
    }
    
    .payment-table tr {
        page-break-inside: avoid !important;
    }
    
    .payment-method {
        text-align: left !important;
        width: 40% !important;
        font-size: 16px !important;
        font-weight: bold !important;
    }
    
    .payment-count {
        text-align: center !important;
        width: 20% !important;
        font-size: 16px !important;
    }
    
    .payment-amount {
        text-align: right !important;
        width: 40% !important;
        font-size: 16px !important;
        font-weight: bold !important;
    }
    
    /* ORDERS TABLE */
    .orders-table {
        width: 100% !important;
        font-size: 14px !important;
        border-collapse: collapse !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-inside: auto !important;
    }
    
    .orders-table td {
        padding: 0.4mm 0 !important;
        vertical-align: top !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
    }
    
    .orders-table tr {
        page-break-inside: avoid !important;
    }
    
    .order-id {
        text-align: left !important;
        width: 20% !important;
        font-size: 14px !important;
        font-weight: bold !important;
    }
    
    .order-details {
        text-align: left !important;
        width: 50% !important;
        font-size: 14px !important;
        word-wrap: break-word !important;
        white-space: normal !important;
    }
    
    .order-amount {
        text-align: right !important;
        width: 30% !important;
        font-size: 14px !important;
        font-weight: bold !important;
    }
    
    /* TOTALS */
    .totals {
        width: 100% !important;
        font-size: 16px !important;
        margin: 0.9mm 0 0 !important;
        padding: 0 !important;
        border-top: 2px solid black !important;
    }
    
    .totals td {
        padding: 0.4mm 0 !important;
        font-weight: bold !important;
    }
    
    .grand-total {
        font-weight: 900 !important;
        font-size: 16px !important;
        border-top: 2px solid black !important;
        border-bottom: 2px solid black !important;
    }
    
    .grand-total td {
        font-weight: 900 !important;
    }
    
    /* FOOTER */
    .footer {
        font-size: 12px !important;
        margin: 0.6mm 0 0 !important;
        padding: 0 !important;
    }
    
    .footer div {
        margin: 0.4mm 0 !important;
    }
    
    .transaction-info {
        font-size: 12px !important;
        color: #666 !important;
        margin: 0.6mm 0 0 !important;
        padding: 0 !important;
    }
    
    /* PRINT BUTTON (FOR PREVIEW ONLY) */
    .no-print {
        display: block !important;
        text-align: center !important;
        margin-top: 10mm !important;
        padding: 5mm !important;
    }
    
    /* PRINT SPECIFIC */
    @media print {
        .no-print {
            display: none !important;
        }
        
        html, body {
            overflow: visible !important;
        }
        
        .receipt {
            padding: 0.5mm !important;
            overflow: visible !important;
        }
        
        body {
            padding: 0.5mm !important;
        }
    }
</style>
    </head>
    <body>
        <div class="receipt">
            <!-- HEADER -->
            <div class="store-name">K-STREET TARLAC</div>
            <div class="store-address">Mc Arthur Highway, Magaspac</div>
            <div class="store-address">Gerona, Tarlac</div>
            
            <div class="divider">=============================</div>
            
            <div class="report-title">CASHIER SESSION REPORT</div>
            
            <div class="divider">=============================</div>
            
            <!-- CASHIER INFORMATION -->
            <div class="section-header">CASHIER INFORMATION</div>
            <table class="info">
                <tr>
                    <td><strong>Cashier:</strong></td>
                    <td>${
                      (session.username || session.user_email || "Unknown")
                        .length > 20
                        ? (session.username || session.user_email).substring(
                            0,
                            17
                          ) + "..."
                        : session.username || session.user_email || "Unknown"
                    }
                    </td>
                </tr>
                <tr>
                    <td><strong>Email:</strong></td>
                    <td>${
                      session.user_email.length > 25
                        ? session.user_email.substring(0, 22) + "..."
                        : session.user_email
                    }
                    </td>
                </tr>
                <tr>
                    <td><strong>Branch:</strong></td>
                    <td>${
                      session.branch || window.currentUser?.branch || "main"
                    }</td>
                </tr>
                <tr>
                    <td><strong>Login:</strong></td>
                    <td style="font-size: 15px !important;">${this.formatDateTime(
                      session.login_time
                    )}</td>
                </tr>
                <tr>
                    <td><strong>Logout:</strong></td>
                    <td style="font-size: 15px !important;">
                        ${
                          session.logout_time
                            ? this.formatDateTime(session.logout_time)
                            : "Still Active"
                        }
                    </td>
                </tr>
                <tr>
                    <td><strong>Duration:</strong></td>
                    <td>${session.session_duration}</td>
                </tr>
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <!-- SALES SUMMARY -->
            <div class="section-header">SALES SUMMARY</div>
            <table class="sales-table">
                <tr>
                    <td class="sales-label">Start Gross:</td>
                    <td class="sales-value">₱${parseFloat(
                      session.start_gross_sales
                    ).toFixed(2)}</td>
                </tr>
                <tr>
                    <td class="sales-label">End Gross:</td>
                    <td class="sales-value">₱${parseFloat(
                      session.end_gross_sales
                    ).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1px solid black;">
                    <td class="sales-label">Session Sales:</td>
                    <td class="sales-value">₱${parseFloat(
                      session.session_sales
                    ).toFixed(2)}</td>
                </tr>
                <tr>
                    <td class="sales-label">Total Transactions:</td>
                    <td class="sales-value">${
                      session.transaction_count || 0
                    }</td>
                </tr>
                <tr>
                    <td class="sales-label">Total Discount:</td>
                    <td class="sales-value">₱${parseFloat(
                      session.total_discount
                    ).toFixed(2)}</td>
                </tr>
                <tr>
                    <td class="sales-label">Total Void:</td>
                    <td class="sales-value">₱${parseFloat(
                      session.total_void
                    ).toFixed(2)}</td>
                </tr>
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <!-- PAYMENT METHODS -->
            <div class="section-header">PAYMENT METHODS</div>
            <table class="payment-table">
                ${this.generatePaymentMethodsSection(paymentMethods)}
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <!-- ORDERS DURING SESSION -->
            <div class="section-header">ORDERS (${
              session.orders ? session.orders.length : 0
            })</div>
            <table class="orders-table">
                ${this.generateOrdersSection(session)}
            </table>
            
            <div class="divider">=============================</div>
            
            <!-- FOOTER -->
            <div class="footer">
                <div style="font-weight: bold;">*** END OF REPORT ***</div>
            </div>
            
            <div class="transaction-info">
                <div>Report Generated:</div>
                <div>${new Date()
                  .toLocaleString("en-PH", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Asia/Manila",
                  })
                  .replace(",", "")}</div>
            </div>
        </div>
        
        <!-- AUTO PRINT SCRIPT -->
        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 300);
            };
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') window.close();
                if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                    e.preventDefault();
                    window.print();
                }
            });
        </script>
    </body>
    </html>
    `;

    // OPEN IN NEW WINDOW
    const printWindow = window.open("", "_blank", "width=350,height=600");
    if (!printWindow) {
      this.showNotification(
        "error",
        "Failed to open print window. Please allow popups."
      );
      return;
    }

    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();

    console.log("✅ Print window opened successfully");
  }

  // ============================================
  // HELPER: GENERATE PAYMENT METHODS SECTION
  // ============================================
  generatePaymentMethodsSection(paymentMethods) {
    if (!paymentMethods || Object.keys(paymentMethods).length === 0) {
      return `
      <tr>
        <td colspan="3" style="text-align: center; font-style: italic; color: #666;">
          No payment methods recorded
        </td>
      </tr>
    `;
    }

    let html = "";
    Object.entries(paymentMethods).forEach(([method, data]) => {
      // Handle "Gcash + Cash" specially
      if (method === "Gcash + Cash") {
        // For split payments, show both Gcash and Cash separately
        const gcashTotal = data.gcash_total || 0;
        const cashTotal = data.cash_total || 0;
        
        html += `
      <tr>
        <td class="payment-method">├─ Gcash</td>
        <td class="payment-count">${data.count}x</td>
        <td class="payment-amount">₱${parseFloat(gcashTotal).toFixed(2)}</td>
      </tr>
      <tr>
        <td class="payment-method">└─ Cash</td>
        <td class="payment-count">${data.count}x</td>
        <td class="payment-amount">₱${parseFloat(cashTotal).toFixed(2)}</td>
      </tr>
    `;
      } else {
        html += `
      <tr>
        <td class="payment-method">${method}</td>
        <td class="payment-count">${data.count}x</td>
        <td class="payment-amount">₱${parseFloat(data.total).toFixed(2)}</td>
      </tr>
    `;
      }
    });

    return html;
  }

  // ============================================
  // HELPER: GENERATE ORDERS SECTION
  // ============================================
  generateOrdersSection(session) {
    if (!session.orders || session.orders.length === 0) {
      return `
      <tr>
        <td colspan="3" style="text-align: center; font-style: italic; color: #666;">
          No orders during this session
        </td>
      </tr>
    `;
    }

    let html = "";
    session.orders.forEach((order) => {
      const productNames = this.formatProductNames(order);
      const shortName =
        productNames.length > 30
          ? productNames.substring(0, 27) + "..."
          : productNames;

      html += `
      <tr>
        <td class="order-id">#${order.id}</td>
        <td class="order-details">${shortName}</td>
        <td class="order-amount">₱${parseFloat(order.total).toFixed(2)}</td>
      </tr>
    `;
    });

    return html;
  }

  // ============================================
  // PRINT RECEIPT - THERMAL PRINTER OPTIMIZED
  // ============================================
  printReceipt() {
    const order = this.selectedOrder;
    if (!order) {
      console.error("No order selected");
      return;
    }

    const items = this.parseItems(order.items);

    const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Receipt</title>
        <meta charset="UTF-8">
        <style>
            * {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                line-height: 1.4 !important;
                font-family: 'Courier New', monospace !important;
            }
            
            @page {
                size: 80mm auto !important;
                margin: 0 !important;
            }
            
            html, body {
                width: 80mm !important;
                height: auto !important;
                margin: 0 auto !important;
                padding: 0 !important;
                background: white !important;
                color: black !important;
                font-size: 16px !important;
            }
            
            body {
                padding: 1mm !important;
                margin: 0 auto !important;
                width: 80mm !important;
            }
            
            .receipt {
                width: 80mm !important;
                margin: 0 auto !important;
                padding: 1mm !important;
                text-align: center !important;
            }
            
            .store-name {
                font-size: 18px !important;
                font-weight: bold !important;
                text-transform: uppercase;
                margin: 0.4mm 0 !important;
            }
            
            .store-address {
                font-size: 17px !important;
                margin: 0.4mm 0 !important;
            }
            
            .divider {
                font-size: 16px !important;
                margin: 0.9mm 0 !important;
                padding: 0 !important;
            }
            
            .info {
                font-size: 17px !important;
                text-align: left !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }
            
            .info td {
                font-size: 17px !important;
                padding: 0.4mm 0 !important;
            }
            
            .items-header {
                font-size: 17px !important;
                font-weight: bold !important;
                text-align: left !important;
                margin: 0.4mm 0 !important;
            }
            
            .items-table {
                width: 100% !important;
                font-size: 16px !important;
                border-collapse: collapse !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .items-table td {
                padding: 0.4mm 0 !important;
                vertical-align: top !important;
            }
            
            .item-name {
                text-align: left !important;
                width: 50% !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }
            
            .item-qty {
                text-align: center !important;
                width: 15% !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }
            
            .item-price {
                text-align: right !important;
                width: 35% !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }
            
            .item-addons {
                font-size: 16px !important;
                font-style: italic !important;
                padding-left: 2mm !important;
                text-align: left !important;
            }
            
            .item-notes {
                font-size: 16px !important;
                font-style: italic !important;
                padding-left: 2mm !important;
                text-align: left !important;
                color: #666 !important;
            }
            
            .totals {
                width: 100% !important;
                font-size: 16px !important;
                margin: 0.9mm 0 0 !important;
                padding: 0 !important;
                border-top: 1px solid black !important;
            }
            
            .totals td {
                padding: 0.4mm 0 !important;
                font-weight: bold !important;
            }
            
            .grand-total {
                font-weight: 900 !important;
                font-size: 16px !important;
                border-top: 2px solid black !important;
                border-bottom: 2px solid black !important;
            }
            
            .grand-total td {
                font-weight: 900 !important;
            }
            
            .footer {
                font-size: 12px !important;
                margin: 0.6mm 0 0 !important;
                padding: 0 !important;
            }
            
            .footer div {
                margin: 0.4mm 0 !important;
            }
            
            .transaction-info {
                font-size: 12px !important;
                color: #666 !important;
                margin: 0.6mm 0 0 !important;
                padding: 0 !important;
            }
            
            .transaction-info br {
                margin: 0.4mm 0 !important;
            }
            
            .void-stamp {
                color: red !important;
                font-weight: bold !important;
                font-size: 18px !important;
                border: 2px solid red !important;
                margin: 0.9mm 0 !important;
                padding: 0.9mm !important;
            }
            
            .void-info {
                font-size: 16px !important;
                background: #fee !important;
                margin: 0.9mm 0 !important;
                padding: 0.9mm !important;
            }
            
            .void-info div {
                margin: 0.4mm 0 !important;
            }
            
            .no-print {
                display: none !important;
            }
            
            .receipt {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            @media print {
                .no-print {
                    display: none !important;
                }
                
                .receipt {
                    padding: 0.5mm !important;
                }
                
                body {
                    padding: 0.5mm !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <!-- HEADER -->
            <div class="store-name">K-STREET TARLAC</div>
            <div class="store-address">Mc Arthur Highway, Magaspac</div>
            <div class="store-address">Gerona, Tarlac</div>
            
            <div class="divider">=============================</div>
            
            ${
              order.is_void
                ? '<div class="void-stamp">*** VOIDED ***</div><div class="divider">=============================</div>'
                : ""
            }
            
            <!-- TRANSACTION INFO -->
            <table class="info">
                <tr>
                    <td><strong>Order #:</strong></td>
                    <td>${order.id}</td>
                </tr>
                <tr>
                    <td><strong>Cashier:</strong></td>
                    <td>${
                      order.cashier_name || order.cashier_email || "Unknown"
                    }</td>
                </tr>
                <tr>
                    <td><strong>Type:</strong></td>
                    <td>${order.orderType}</td>
                </tr>
                <tr>
                    <td><strong>Payment:</strong></td>
                    <td>${order.payment_method || "Cash"}</td>
                </tr>
                <tr>
                    <td><strong>Date:</strong></td>
                    <td>${this.formatDateTime(order.created_at)}</td>
                </tr>
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <!-- ITEMS -->
            <div class="items-header">ORDER ITEMS:</div>
            <table class="items-table">
                ${items
                  .map(
                    (item) => `
                    <tr>
                        <td class="item-name">${item.name}</td>
                        <td class="item-qty">x${item.quantity}</td>
                        <td class="item-price">₱${(
                          (item.price || 0) * (item.quantity || 1)
                        ).toFixed(2)}</td>
                    </tr>
                    ${
                      item.addons && item.addons.length > 0
                        ? `
                        <tr>
                            <td colspan="3" class="item-addons">
                                + ${item.addons.join(", ")}
                            </td>
                        </tr>
                    `
                        : ""
                    }
                    ${
                      item.notes
                        ? `
                        <tr>
                            <td colspan="3" class="item-notes">
                                Note: ${item.notes}
                            </td>
                        </tr>
                    `
                        : ""
                    }
                `
                  )
                  .join("")}
            </table>
            
            <div class="divider">-----------------------------</div>
            
            <!-- TOTALS -->
            <table class="totals">
                <tr class="grand-total">
                    <td style="text-align: left; width: 60%;">TOTAL:</td>
                    <td style="text-align: right; width: 40%;">₱${parseFloat(
                      order.total
                    ).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="text-align: left;">Amount Paid:</td>
                    <td style="text-align: right;">₱${parseFloat(
                      order.paidAmount
                    ).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="text-align: left;">Change:</td>
                    <td style="text-align: right;">₱${parseFloat(
                      order.changeAmount
                    ).toFixed(2)}</td>
                </tr>
            </table>
            
            ${
              order.is_void
                ? `
                <div class="divider">-----------------------------</div>
                <div class="void-info">
                    <div style="color: #dc2626; font-weight: bold;">VOID INFORMATION:</div>
                    <div><strong>Reason:</strong> ${
                      order.void_reason || "Not specified"
                    }</div>
                    <div><strong>Voided By:</strong> ${
                      order.voided_by || "Admin"
                    }</div>
                    <div><strong>Date:</strong> ${
                      order.voided_at
                        ? this.formatDateTime(order.voided_at)
                        : "N/A"
                    }</div>
                </div>
            `
                : ""
            }
            
            <div class="divider">=============================</div>
            
            <!-- FOOTER -->
            <div class="footer">
                ${
                  order.is_void
                    ? '<div style="color: red; font-weight: bold;">*** VOIDED TRANSACTION ***</div>'
                    : '<div>Thank you for dining with us!</div><div>Please come again!</div><div style="font-weight: bold;">*** THIS IS YOUR OFFICIAL RECEIPT ***</div>'
                }
            </div>
            
            <div class="transaction-info">
                <div>Transaction ID: ${this.generateTransactionCode(
                  order.id
                )}</div>
                <div>Printed: ${new Date()
                  .toLocaleString("en-PH", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                  .replace(",", "")}</div>
            </div>
        </div>
        
        <!-- PREVIEW CONTROLS -->
        <div class="no-print" style="text-align: center; margin-top: 5mm;">
            <button onclick="window.print()" style="
                padding: 5px 10px;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 3px;
                font-size: 11px;
                cursor: pointer;
                margin: 2px;
            ">
                🖨️ Print
            </button>
            <button onclick="window.close()" style="
                padding: 5px 10px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 3px;
                font-size: 11px;
                cursor: pointer;
                margin: 2px;
            ">
                ✕ Close
            </button>
        </div>
        
        <!-- AUTO PRINT SCRIPT -->
        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 300);
            };
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') window.close();
                if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                    e.preventDefault();
                    window.print();
                }
            });
        </script>
    </body>
    </html>
    `;

    // OPEN IN NEW WINDOW
    const printWindow = window.open("", "_blank", "width=350,height=600");
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
  }

  // ============================================
  // EXPORT TO EXCEL METHODS
  // ============================================
  exportSalesToExcel() {
    if (this.salesData.length === 0) {
      this.showNotification("warning", "No data to export");
      return;
    }

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

    const branchFilter = document.getElementById("branchFilter");
    const currentBranch = branchFilter ? branchFilter.value : "all";
    const branchText = currentBranch === "all" ? "All Branches" : currentBranch;

    const timeRange = document.getElementById("timeRange").value;
    const timeRangeText = this.getTimeRangeText(timeRange);

    const ws_data = [];

    ws_data.push(["K - STREET"]);
    ws_data.push([`BRANCH: ${branchText}`]);
    ws_data.push([`Sales Report - Period: ${timeRangeText}`]);
    ws_data.push([]);
    ws_data.push(["SALES SUMMARY"]);
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

    ws_data.push([]);

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

    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString("en-PH")}`]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
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

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    const filename = `K-Street-Sales_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    XLSX.writeFile(wb, filename);

    this.showNotification("success", "Excel file exported successfully!");
  }

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

    ws_data.push(["K - STREET"]);
    ws_data.push(["Mc Arthur Highway, Magaspac, Gerona, Tarlac"]);
    ws_data.push(["CASHIER SESSION REPORT"]);
    ws_data.push([`BRANCH: ${branchText}`]);
    ws_data.push([]);
    ws_data.push(["CASHIER INFORMATION"]);
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

    ws_data.push([]);

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

    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString("en-PH")}`]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
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

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cashier Report");

    const filename = `K-Street-Cashier_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    XLSX.writeFile(wb, filename);

    this.showNotification("success", "Cashier Report exported successfully!");
  }

  exportCashierSessionToExcel() {
    const session = this.selectedSession;
    if (!session) {
      this.showNotification("warning", "No session selected");
      return;
    }

    let paymentMethods = {};

    if (
      session.payment_methods &&
      typeof session.payment_methods === "object" &&
      !Array.isArray(session.payment_methods)
    ) {
      paymentMethods = session.payment_methods;
    } else if (session.orders && session.orders.length > 0) {
      session.orders.forEach((order) => {
        const method = order.payment_method || "Cash";
        if (!paymentMethods[method]) {
          paymentMethods[method] = { count: 0, total: 0 };
        }
        paymentMethods[method].count++;
        paymentMethods[method].total += parseFloat(order.total || 0);
      });
    }

    const ws_data = [];

    ws_data.push(["K - STREET"]);
    ws_data.push([""]);
    ws_data.push(["CASHIER SESSION REPORT"]);
    ws_data.push(["CASHIER INFORMATION"]);
    ws_data.push(["Cashier Email:", session.user_email]);
    ws_data.push(["Login Time:", this.formatDateTime(session.login_time)]);
    ws_data.push([
      "Logout Time:",
      session.logout_time
        ? this.formatDateTime(session.logout_time)
        : "Still Active",
    ]);
    ws_data.push([
      "Session Duration:",
      session.session_duration || "Still Active",
    ]);

    ws_data.push([""]);
    ws_data.push(["SALES SUMMARY"]);
    ws_data.push([
      "Starting Gross:",
      parseFloat(session.start_gross_sales || 0),
    ]);
    ws_data.push(["Ending Gross:", parseFloat(session.end_gross_sales || 0)]);
    ws_data.push([
      "Sales During Session:",
      parseFloat(session.session_sales || 0),
    ]);
    ws_data.push(["Total Transactions:", session.transaction_count || 0]);
    ws_data.push([
      "Total Applied Discount:",
      parseFloat(session.total_discount || 0),
    ]);
    ws_data.push(["Total Void Amount:", parseFloat(session.total_void || 0)]);

    ws_data.push([""]);
    ws_data.push(["Payment Method", "Transaction Count", "Total Amount"]);

    if (Object.keys(paymentMethods).length > 0) {
      Object.entries(paymentMethods).forEach(([method, data]) => {
        ws_data.push([method, data.count, parseFloat(data.total)]);
      });
    } else {
      ws_data.push(["No transactions yet", 0, 0]);
    }

    ws_data.push([""]);
    ws_data.push(["ORDERS DURING SESSION"]);

    const orderHeaders = this.isAdmin()
      ? [
          "Order ID",
          "Products",
          "Total Amount",
          "Order Type",
          "Payment Method",
          "Transaction Time",
          "Branch",
        ]
      : [
          "Order ID",
          "Products",
          "Total Amount",
          "Order Type",
          "Payment Method",
          "Transaction Time",
        ];
    ws_data.push(orderHeaders);

    if (session.orders && session.orders.length > 0) {
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
      const emptyRow = this.isAdmin()
        ? ["-", "No orders during this session", 0, "-", "-", "-", "-"]
        : ["-", "No orders during this session", 0, "-", "-", "-"];
      ws_data.push(emptyRow);
    }

    ws_data.push([""]);
    const generatedDate = new Date().toLocaleString("en-PH", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    ws_data.push([
      `Generated: ${generatedDate} | Exported by: ${
        window.currentUser?.name || "Admin"
      }`,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws["!cols"] = this.isAdmin()
      ? [
          { wch: 25 },
          { wch: 40 },
          { wch: 15 },
          { wch: 15 },
          { wch: 20 },
          { wch: 18 },
          { wch: 18 },
        ]
      : [
          { wch: 25 },
          { wch: 40 },
          { wch: 15 },
          { wch: 15 },
          { wch: 20 },
          { wch: 18 },
        ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `Session_${session.user_email.split("@")[0]}`
    );

    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const cashierStr = session.user_email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `K-STREET_Cashier_Report_${cashierStr}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);

    this.showNotification(
      "success",
      "Cashier session report exported successfully!"
    );
  }

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

    const ws_data = [];

    ws_data.push(["K - STREET"]);
    ws_data.push([`BRANCH: ${branchText}`]);
    ws_data.push([`Void Report - Period: ${timeRangeText}`]);
    ws_data.push([]);
    ws_data.push(["VOID SUMMARY"]);
    ws_data.push([`Total Voided Transactions: ${this.voidData.length}`]);
    ws_data.push([
      `Total Void Amount: ₱${totalVoidAmount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
      })}`,
    ]);
    ws_data.push([]);

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

    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString("en-PH")}`]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
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

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Void Report");

    const filename = `K-Street-Void_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    XLSX.writeFile(wb, filename);

    this.showNotification("success", "Excel file exported successfully!");
  }

  // ============================================
  // OTHER MISSING METHODS
  // ============================================
  exportCashoutToExcel() {
    if (this.cashoutData.length === 0) {
      this.showNotification("warning", "No data to export");
      return;
    }

    const totalWithdrawal = this.cashoutData
      .filter((r) => r.type === "withdrawal")
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const totalDeposit = this.cashoutData
      .filter((r) => r.type === "deposit")
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const netCashflow = totalDeposit - totalWithdrawal;

    const branchFilter = document.getElementById("branchFilter");
    const currentBranch = branchFilter ? branchFilter.value : "all";
    const branchText = currentBranch === "all" ? "All Branches" : currentBranch;

    const timeRange = document.getElementById("timeRange").value;
    const timeRangeText = this.getTimeRangeText(timeRange);

    const ws_data = [];

    ws_data.push(["K - STREET"]);
    ws_data.push([`BRANCH: ${branchText}`]);
    ws_data.push([`Cash-out Report - Period: ${timeRangeText}`]);
    ws_data.push([]);
    ws_data.push(["CASH-OUT SUMMARY"]);
    ws_data.push([`Total Records: ${this.cashoutData.length}`]);
    ws_data.push([`Total Withdrawal: ₱${totalWithdrawal.toFixed(2)}`]);
    ws_data.push([`Total Deposit: ₱${totalDeposit.toFixed(2)}`]);
    ws_data.push([`Net Cash Flow: ₱${netCashflow.toFixed(2)}`]);
    ws_data.push([]);

    const headers = this.isAdmin()
      ? ["ID", "Branch", "Date", "Cashier", "Type", "Amount", "Reason"]
      : ["ID", "Date", "Cashier", "Type", "Amount", "Reason"];

    ws_data.push(headers);

    this.cashoutData.forEach((record) => {
      const row = this.isAdmin()
        ? [
            record.id,
            record.branch || "Unknown",
            this.formatDateTime(record.created_at),
            record.cashier_name || record.cashier_email || "Unknown",
            record.type,
            parseFloat(record.amount),
            record.reason || "",
          ]
        : [
            record.id,
            this.formatDateTime(record.created_at),
            record.cashier_name || record.cashier_email || "Unknown",
            record.type,
            parseFloat(record.amount),
            record.reason || "",
          ];
      ws_data.push(row);
    });

    ws_data.push([]);
    ws_data.push([`Generated: ${new Date().toLocaleString("en-PH")}`]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cash-out Report");

    const filename = `K-Street-Cashout_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, filename);

    this.showNotification("success", "Cash-out report exported successfully!");
  }

  showEditCashoutModal(recordId) {
    // Add implementation if needed
    console.log("Edit cashout:", recordId);
    this.showNotification("info", "Edit cashout feature coming soon");
  }

  confirmEditCashout() {
    // Add implementation if needed
    console.log("Confirm edit cashout");
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

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  formatTimeOnly(dateString) {
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
    if (timeRange === "all") return "All Time";
    else if (timeRange === "today") return "Today";
    else if (timeRange === "yesterday") return "Yesterday";
    else if (timeRange === "week") return "This Week";
    else if (timeRange === "month") return "This Month";
    else if (timeRange === "custom") {
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      return `${startDate} to ${endDate}`;
    }
    return "All Time";
  }

  formatCurrency(value) {
    const num = parseFloat(value || 0);
    return `P${num.toFixed(2)}`;
  }

  generateTransactionCode(orderId) {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `KST-${date.getFullYear().toString().slice(-2)}${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${date
      .getDate()
      .toString()
      .padStart(2, "0")}-${orderId}${random}`;
  }

  showNotification(type, message) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
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
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.salesReport = new SalesReport();
});
