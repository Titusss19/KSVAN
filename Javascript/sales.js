class SalesReport {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalRecords = 0;
    this.salesData = [];
    this.selectedOrder = null;

    // DEBUG: Check if modals exist
    console.log("🔍 Checking modals...");
    console.log(
      "receiptModal exists:",
      !!document.getElementById("receiptModal")
    );
    console.log("voidModal exists:", !!document.getElementById("voidModal"));
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
    // Check session or localStorage for user role
    return (
      window.currentUser &&
      (window.currentUser.role === "admin" ||
        window.currentUser.role === "owner")
    );
  }

  bindEvents() {
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
      this.currentPage = 1;
      this.loadSales();
    });

    // Export Excel
    document.getElementById("exportExcel").addEventListener("click", () => {
      this.exportToExcel();
    });

    // Pagination
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

    // Close all modals with X button or backdrop click
    document.addEventListener("click", (e) => {
      // X button click
      if (
        e.target.classList.contains("modal-close") ||
        e.target.closest(".modal-close")
      ) {
        const modal = e.target.closest(".modal-overlay");
        if (modal) {
          modal.classList.add("hidden");
        }
      }

      // Backdrop click
      if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.add("hidden");
      }
    });
  }

  // Helper method
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

    // Add custom date range if selected
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

      // ADD THIS: Get raw response text first
      const responseText = await response.text();
      console.log("RAW RESPONSE:", responseText);

      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Response was:", responseText);
        throw new Error(
          "Server returned invalid response. Check console for details."
        );
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
      alert("Failed to load sales data: " + error.message);
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
                <td class="px-3 py-1 text-sm text-gray-600">
                    ${this.formatDateTime(order.created_at)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <div class="line-clamp-2" title="${this.formatProductNames(
                      order
                    )}">
                        ${this.formatProductNames(order)}
                    </div>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    ₱${parseFloat(order.total).toFixed(2)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 text-right">
                    ₱${parseFloat(order.paidAmount).toFixed(2)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 text-right">
                    ₱${parseFloat(order.changeAmount).toFixed(2)}
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-700">
                    ${order.cashier_name || order.cashier_email || "Unknown"}
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-small text-black">
                        ${order.orderType}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-small text-black">
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

    // Update button states
    document.getElementById("prevPage").disabled = this.currentPage === 1;
    document.getElementById("nextPage").disabled =
      this.currentPage === this.totalPages;
  }

  async viewReceipt(orderId) {
    try {
      const response = await fetch(
        `backend/salesapi.php?action=order&id=${orderId}`
      );

      const responseText = await response.text();
      console.log("Response text:", responseText);

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

      // Update receipt content with NULL CHECKS
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
              <span>₱${((item.price || 0) * (item.quantity || 1)).toFixed(
                2
              )}</span>
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

      // Show modal with NULL CHECK
      const receiptModal = document.getElementById("receiptModal");
      if (receiptModal) {
        receiptModal.classList.remove("hidden");
      } else {
        console.error("Receipt modal not found in DOM");
      }
    } catch (error) {
      console.error("View Receipt Error:", error);
      alert("Failed to load order: " + error.message);
    }
  }

  async showVoidModal(orderId) {
    const order = this.salesData.find((o) => o.id === orderId);
    if (!order) {
      console.error("Order not found:", orderId);
      return;
    }

    this.selectedOrder = order;

    // Update order info with NULL CHECK
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

    // Clear inputs with NULL CHECKS
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
    } else {
      console.error("Void modal not found in DOM");
    }
  }

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

  exportToExcel() {
    if (this.salesData.length === 0) {
      alert("No data to export");
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
    const voidOrders = this.salesData.filter((order) => order.is_void);
    const totalVoidAmount = voidOrders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );
    const avgTransaction = totalSales / this.salesData.length;

    // Get total discount
    const totalDiscount = this.salesData.reduce((sum, order) => {
      return (
        sum +
        (order.discountApplied ? parseFloat(order.discountAmount || 0) : 0)
      );
    }, 0);

    // Get unique dates
    const uniqueDates = [
      ...new Set(
        this.salesData.map((order) => {
          const date = new Date(order.created_at);
          return date.toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          });
        })
      ),
    ]
      .slice(0, 5)
      .join(", ");

    // Get branch and time range
    const branchFilter = document.getElementById("branchFilter");
    const currentBranch = branchFilter ? branchFilter.value : "all";
    const branchText = currentBranch === "all" ? "All Branches" : currentBranch;

    const timeRange = document.getElementById("timeRange").value;
    const timeRangeText =
      timeRange === "all"
        ? "All Time"
        : timeRange === "today"
        ? "Today"
        : timeRange === "yesterday"
        ? "Yesterday"
        : timeRange === "week"
        ? "This Week"
        : timeRange === "month"
        ? "This Month"
        : timeRange === "custom"
        ? `${document.getElementById("startDate").value} to ${
            document.getElementById("endDate").value
          }`
        : "All Time";

    // ==================== BUILD DATA ====================
    const ws_data = [];

    // Header styles
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 14 },
      fill: { fgColor: { rgb: "FFDC2626" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const subHeaderStyle = {
      font: { bold: true, size: 11 },
      fill: { fgColor: { rgb: "FFE3F2FD" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const summaryTitleStyle = {
      font: { bold: true, size: 11 },
      fill: { fgColor: { rgb: "FFFFCDD2" } },
      alignment: { horizontal: "left", vertical: "center" },
    };

    const summaryTextStyle = {
      font: { bold: true, size: 10 },
      alignment: { horizontal: "left", vertical: "center" },
    };

    const tableHeaderStyle = {
      font: { bold: true, color: { rgb: "FFFFFFFF" }, size: 10 },
      fill: { fgColor: { rgb: "FFD32F2F" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "FF000000" } },
        bottom: { style: "thin", color: { rgb: "FF000000" } },
        left: { style: "thin", color: { rgb: "FF000000" } },
        right: { style: "thin", color: { rgb: "FF000000" } },
      },
    };

    const dataStyleEven = {
      alignment: { horizontal: "left", vertical: "center" },
      fill: { fgColor: { rgb: "FFFFFFFF" } },
    };

    const dataStyleOdd = {
      alignment: { horizontal: "left", vertical: "center" },
      fill: { fgColor: { rgb: "FFFFEBEE" } },
    };

    const numberStyle = {
      alignment: { horizontal: "right", vertical: "center" },
      numFmt: "#,##0.00",
    };

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

    // Row 6-12: Summary Stats
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
    ws_data.push([
      `Total Void Amount: ₱${totalVoidAmount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} (${voidOrders.length} transactions)`,
    ]);
    ws_data.push([`Transaction Dates: ${uniqueDates}`]);

    // Row 13: Empty
    ws_data.push([]);

    // Row 14: Table Header
    ws_data.push([
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
    ]);

    // Data Rows
    this.salesData.forEach((order) => {
      ws_data.push([
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
      ]);
    });

    // Footer
    ws_data.push([]);
    ws_data.push([
      `Generated on: ${new Date().toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // ==================== APPLY STYLES ====================

    // Company Name (A1)
    ws["A1"].s = headerStyle;

    // Branch (A2)
    ws["A2"].s = subHeaderStyle;

    // Report Title (A3)
    ws["A3"].s = {
      font: { size: 10, italic: true },
      fill: { fgColor: { rgb: "FFFFEBEE" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Summary Title (A5)
    ws["A5"].s = summaryTitleStyle;

    // Summary Stats (A6-A11)
    for (let row = 6; row <= 11; row++) {
      const cell = ws[`A${row}`];
      if (cell) {
        if (row === 9) {
          // Discount line - green
          cell.s = {
            font: { bold: true, size: 10, color: { rgb: "FF15803D" } },
            alignment: { horizontal: "left", vertical: "center" },
          };
        } else if (row === 10) {
          // Void line - red
          cell.s = {
            font: { bold: true, size: 10, color: { rgb: "FFDC2626" } },
            alignment: { horizontal: "left", vertical: "center" },
          };
        } else {
          cell.s = summaryTextStyle;
        }
      }
    }

    // Table Headers (Row 14)
    const headerRow = 14;
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].forEach((col) => {
      const cellRef = `${col}${headerRow}`;
      if (ws[cellRef]) {
        ws[cellRef].s = tableHeaderStyle;
      }
    });

    // Data Rows - Alternating colors
    const dataStartRow = 15;
    const dataEndRow = dataStartRow + this.salesData.length - 1;

    for (let row = dataStartRow; row <= dataEndRow; row++) {
      const isOdd = (row - dataStartRow) % 2 === 0;
      const baseStyle = isOdd ? dataStyleOdd : dataStyleEven;

      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].forEach((col, idx) => {
        const cellRef = `${col}${row}`;
        if (ws[cellRef]) {
          // Apply base style
          ws[cellRef].s = { ...baseStyle };

          // Apply number format for amount columns (C, E, F)
          if (col === "C" || col === "E" || col === "F") {
            ws[cellRef].s = {
              ...baseStyle,
              ...numberStyle,
              fill: baseStyle.fill,
            };
          }
        }
      });
    }

    // Footer
    const footerRow = dataEndRow + 2;
    if (ws[`A${footerRow}`]) {
      ws[`A${footerRow}`].s = {
        font: { size: 9, italic: true, color: { rgb: "FF666666" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // ==================== SET DIMENSIONS ====================

    // Column widths
    ws["!cols"] = [
      { wch: 10 }, // Order #
      { wch: 35 }, // Products
      { wch: 12 }, // Total
      { wch: 12 }, // Discount
      { wch: 12 }, // Paid
      { wch: 12 }, // Change
      { wch: 25 }, // Cashier
      { wch: 13 }, // Order Type
      { wch: 15 }, // Payment
      { wch: 22 }, // Date
    ];

    // Row heights
    ws["!rows"] = [];
    ws["!rows"][0] = { hpt: 30 }; // Company header
    ws["!rows"][13] = { hpt: 25 }; // Table header

    // Merge cells
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Company name
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Branch
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }, // Report title
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // Summary title
      { s: { r: 5, c: 0 }, e: { r: 5, c: 9 } }, // Stats lines
      { s: { r: 6, c: 0 }, e: { r: 6, c: 9 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 9 } },
      { s: { r: 8, c: 0 }, e: { r: 8, c: 9 } },
      { s: { r: 9, c: 0 }, e: { r: 9, c: 9 } },
      { s: { r: 10, c: 0 }, e: { r: 10, c: 9 } },
      { s: { r: footerRow - 1, c: 0 }, e: { r: footerRow - 1, c: 9 } }, // Footer
    ];

    // Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    // Generate filename
    const filename = `K-Street-Sales_Report_${currentBranch}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
  }

  // Helper functions
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
  showNotification(type, message) {
    const modal = document.getElementById("notificationModal");
    const icon = document.getElementById("notificationIcon");
    const title = document.getElementById("notificationTitle");
    const msg = document.getElementById("notificationMessage");

    if (!modal || !icon || !title || !msg) {
      console.error("Notification modal elements not found");
      alert(message); // Fallback to alert
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
      // info
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
