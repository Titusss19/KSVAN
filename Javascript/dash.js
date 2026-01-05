// dash.js - ULTIMATE FIX - ALL EMPLOYEES DISPLAY

const appState = {
  user: window.currentUser || {},
  selectedBranch: "all",
  stats: null,
  users: [],
  announcements: [],
  branches: [],
  loading: {
    stats: false,
    users: false,
    announcements: false,
    branches: false,
    employees: false,
  },
  selectedEmployee: null,
  feedbackModal: { visible: false, title: "", message: "", type: "success" },
};

let employeeStatusCache = {};
let lastUpdateTime = 0;
let employeeCooldowns = {};
let attendanceData = {
  action: "",
  pin: "",
  employeeId: null,
  employeeName: "",
  employeeRole: "",
};

let liveClockInterval = null;
let roleChangeHandlersInitialized = false;
let realTimeSyncInterval = null;
let productRowCounter = 0;
let productsVisible = false;


// ============== OUT SOURCE MODAL FUNCTIONS ==============

function openOutSourceModal() {
  const modal = document.getElementById("outSourceModal");
  if (modal) {
    modal.classList.add("active");

    // Reset form
    document.getElementById("outPersonnelName").value = "";

    // Clear existing rows
    const container = document.getElementById("productRowsContainer");
    if (container) {
      container.innerHTML = "";
    }

    // Reset counter
    productRowCounter = 0;

    // Add one default product row
    addProductRow();

    setTimeout(() => {
      document.getElementById("outPersonnelName").focus();
    }, 100);
  }
}

function closeOutSourceModal() {
  const modal = document.getElementById("outSourceModal");
  if (modal) modal.classList.remove("active");
}

function addProductRow() {
  const container = document.getElementById("productRowsContainer");
  if (!container) return;

  productRowCounter++;
  const rowId = `productRow_${productRowCounter}`;

  const row = document.createElement("div");
  row.id = rowId;
  row.className =
    "flex gap-2 items-start bg-gray-50 p-2 rounded-lg border border-gray-200";
  row.innerHTML = `
        <div class="flex-1 space-y-2">
            <input 
                type="text" 
                id="productDetails_${productRowCounter}" 
                placeholder="Product details (e.g., Item name, quantity, specs)" 
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <input 
                type="number" 
                id="productAmount_${productRowCounter}" 
                placeholder="Amount (₱)" 
                step="0.01" 
                min="0"
                oninput="calculateTotal()"
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
        </div>
        <button 
            onclick="removeProductRow('${rowId}')" 
            class="mt-1 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
            title="Remove product"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

  container.appendChild(row);
  calculateTotal();
}

function removeProductRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    row.remove();
    calculateTotal();
  }
}

function calculateTotal() {
  const container = document.getElementById("productRowsContainer");
  if (!container) return;

  let total = 0;
  const rows = container.querySelectorAll('[id^="productAmount_"]');

  rows.forEach((input) => {
    const value = parseFloat(input.value) || 0;
    total += value;
  });

  const totalEl = document.getElementById("outTotalAmount");
  if (totalEl) {
    totalEl.textContent = `₱${total.toFixed(2)}`;
  }
}

async function submitOutSource() {
  const personnelName = document
    .getElementById("outPersonnelName")
    .value.trim();

  if (!personnelName) {
    showFeedback("Error", "Please enter personnel name", "error");
    return;
  }

  // Collect products
  const products = [];
  let totalAmount = 0;

  const container = document.getElementById("productRowsContainer");
  const rows = container.children;

  if (rows.length === 0) {
    showFeedback("Error", "Please add at least one product", "error");
    return;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const detailsInput = row.querySelector('[id^="productDetails_"]');
    const amountInput = row.querySelector('[id^="productAmount_"]');

    const details = detailsInput ? detailsInput.value.trim() : "";
    const amount = amountInput ? parseFloat(amountInput.value) || 0 : 0;

    if (!details) {
      showFeedback(
        "Error",
        `Please enter product details for row ${i + 1}`,
        "error"
      );
      return;
    }

    if (amount <= 0) {
      showFeedback("Error", `Please enter valid amount for row ${i + 1}`, "error");
      return;
    }

    products.push({ details, amount });
    totalAmount += amount;
  }

  // Build product details string - format: "Details1 (₱100.00), Details2 (₱50.00)"
  let productDetailsString = products
    .map((p) => `${p.details} `)
    .join(", ");

  try {
    const result = await apiCall("addOutSource", {
      personnel_name: personnelName,
      product_details: productDetailsString,
      amount: totalAmount,
      branch: appState.user.branch || "main",
      created_by: appState.user.id,
    });

    if (result.success) {
      showFeedback(
        "Success",
        "Out Source record added successfully",
        "success"
      );
      closeOutSourceModal();
      refreshAll();
    } else {
      showFeedback(
        "Error",
        result.message || "Failed to add Out Source record",
        "error"
      );
    }
  } catch (error) {
    console.error("Out Source Error:", error);
    showFeedback("Error", "Network error. Please try again.", "error");
  }
}


// ============== CRITICAL REAL-TIME FUNCTIONS ==============

async function syncEmployeeStatus() {
  try {
    console.log("🔄 SYNCING ALL EMPLOYEES...");

    const userBranch = appState.user.branch || "main";
    const userRole = appState.user.role || "cashier";

    // Try BOTH APIs for maximum compatibility
    let result = null;

    // First try attendance API (getEmployees)
    try {
      console.log("Trying attendance API...");
      result = await apiCall(
        "getEmployees",
        {
          branch: userRole === "admin" ? appState.selectedBranch : userBranch,
        },
        true
      );

      if (
        result.success &&
        result.employees &&
        Array.isArray(result.employees)
      ) {
        console.log(`✅ Attendance API: ${result.employees.length} employees`);
      }
    } catch (attendanceError) {
      console.log("Attendance API failed:", attendanceError);
      result = null;
    }

    // If attendance API failed or returned no employees, try dashboard API
    if (
      !result ||
      !result.success ||
      !result.employees ||
      result.employees.length === 0
    ) {
      console.log("Trying dashboard API...");
      result = await apiCall(
        "getEmployees",
        {
          branch: userRole === "admin" ? appState.selectedBranch : userBranch,
        },
        false
      );

      if (
        result.success &&
        result.employees &&
        Array.isArray(result.employees)
      ) {
        console.log(`✅ Dashboard API: ${result.employees.length} employees`);
      }
    }

    if (result.success && result.employees && Array.isArray(result.employees)) {
      console.log(`📊 Total employees found: ${result.employees.length}`);

      // Clear and update cache
      employeeStatusCache = {};

      result.employees.forEach((emp) => {
        const employeeId = emp.id || emp.employee_id;
        const full_name = emp.full_name || emp.username || "Employee";
        const branch = emp.branch || userBranch;

        // Determine if on duty - multiple ways to check
        let is_on_duty = false;
        let current_hours = "0";

        if (emp.is_on_duty !== undefined) {
          is_on_duty = emp.is_on_duty === 1 || emp.is_on_duty === true;
        } else if (
          emp.duty_status === "on_duty" &&
          emp.time_in &&
          !emp.time_out
        ) {
          is_on_duty = true;
        }

        // Calculate hours if on duty
        if (is_on_duty && emp.time_in) {
          const timeIn = new Date(emp.time_in);
          const now = new Date();
          const diffMs = now - timeIn;
          const diffHours = diffMs / (1000 * 60 * 60);
          current_hours = diffHours.toFixed(1);
        } else if (emp.current_hours) {
          current_hours = emp.current_hours;
        }

        employeeStatusCache[employeeId] = {
          id: employeeId,
          full_name: full_name,
          branch: branch,
          is_on_duty: is_on_duty,
          current_hours: current_hours,
          last_update: Date.now(),
          raw_data: emp, // Store raw for debugging
        };
      });

      renderEmployeeStatus();
      return true;
    } else {
      console.error("No employees found in any API");
      employeeStatusCache = {};
      renderEmployeeStatus();
      return false;
    }
  } catch (error) {
    console.error("FATAL SYNC ERROR:", error);
    return false;
  }
}

function forceEmployeeStatus(employeeId, isOnDuty) {
  console.log(
    `🔧 FORCING STATUS: ${employeeId} -> ${isOnDuty ? "ON DUTY" : "OFF DUTY"}`
  );

  if (employeeStatusCache[employeeId]) {
    employeeStatusCache[employeeId].is_on_duty = isOnDuty;
    employeeStatusCache[employeeId].last_update = Date.now();
  } else {
    // Create temporary entry
    employeeStatusCache[employeeId] = {
      id: employeeId,
      full_name: attendanceData.employeeName || "Employee",
      branch: appState.user.branch || "main",
      is_on_duty: isOnDuty,
      current_hours: "0",
      last_update: Date.now(),
    };
  }

  renderEmployeeStatus();
  setTimeout(() => syncEmployeeStatus(), 1000); // Full sync after 1 second
}

function renderEmployeeStatus() {
  const container = document.getElementById("employeeStatusList");
  if (!container) {
    console.error("❌ employeeStatusList element not found!");
    return;
  }

  const userBranch = appState.user.branch || "main";
  const employees = Object.values(employeeStatusCache)
    .filter((emp) => emp.branch === userBranch)
    .sort((a, b) => {
      // On duty first, then alphabetically
      if (a.is_on_duty && !b.is_on_duty) return -1;
      if (!a.is_on_duty && b.is_on_duty) return 1;
      return a.full_name.localeCompare(b.full_name);
    });

  console.log(
    `🎯 Rendering ${employees.length} employees for branch: ${userBranch}`
  );

  if (employees.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 text-gray-500 text-sm">
        <div class="mb-2">No employees found in ${userBranch}</div>
        <button onclick="forceSync()" class="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-sm">
          🔄 Try Again
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = employees
    .map((emp) => {
      const statusColor = emp.is_on_duty
        ? "bg-green-100 text-green-600"
        : "bg-gray-100 text-gray-600";
      const statusText = emp.is_on_duty ? "On Duty" : "Off Duty";
      const statusIcon = emp.is_on_duty
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>';

      return `
      <div class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">${
              emp.full_name
            }</p>
            ${
              emp.is_on_duty && parseFloat(emp.current_hours) > 0
                ? `<p class="text-xs text-gray-500">Working ${emp.current_hours}h</p>`
                : emp.is_on_duty
                ? `<p class="text-xs text-gray-500">Currently on duty</p>`
                : ""
            }
          </div>
        </div>
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusColor} flex-shrink-0">
          ${statusIcon}
          <span>${statusText}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

async function loadEmployeeStatus() {
  appState.loading.employees = true;
  updateLoadingIndicators();

  try {
    await syncEmployeeStatus();
  } catch (error) {
    console.error("Load Employee Status Error:", error);
  } finally {
    appState.loading.employees = false;
    updateLoadingIndicators();
  }
}

// ============== ALL YOUR EXISTING FUNCTIONS - KEEP THESE EXACTLY ==============

function setupRoleChangeHandlers() {
  if (roleChangeHandlersInitialized) return;

  const addRoleSelect = document.getElementById("addUserRole");
  const addVoidPinContainer = document.getElementById("voidPinContainer");
  const addVoidPinInput = document.getElementById("addVoidPin");

  if (addRoleSelect && addVoidPinContainer && addVoidPinInput) {
    addRoleSelect.addEventListener("change", function (e) {
      const selectedRole = e.target.value;
      if (selectedRole === "manager" || selectedRole === "admin") {
        addVoidPinContainer.style.display = "block";
        addVoidPinInput.required = true;
      } else {
        addVoidPinContainer.style.display = "none";
        addVoidPinInput.required = false;
        addVoidPinInput.value = "";
      }
    });
  }

  const editRoleSelect = document.getElementById("editUserRole");
  const editVoidPinInput = document.getElementById("editVoidPin");

  if (editRoleSelect && editVoidPinInput) {
    editRoleSelect.addEventListener("change", function (e) {
      const selectedRole = e.target.value;
      if (selectedRole === "cashier") {
        editVoidPinInput.placeholder = "Cashier cannot have Void PIN";
        editVoidPinInput.disabled = true;
        editVoidPinInput.value = "";
      } else {
        editVoidPinInput.placeholder =
          "Enter new PIN or leave blank to keep existing";
        editVoidPinInput.disabled = false;
      }
    });
  }

  roleChangeHandlersInitialized = true;
}

function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  const number = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(number)) return "0";
  if (number % 1 !== 0) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return number.toLocaleString("en-US");
}

function formatPeso(amount) {
  if (amount === null || amount === undefined) return "₱0.00";
  const number = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(number)) return "₱0.00";
  return `₱${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  if (diffInHours > 0)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInMinutes > 0)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

function formatDate(dateString) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function startLiveClock() {
  if (liveClockInterval) clearInterval(liveClockInterval);
  updateLiveClock();
  liveClockInterval = setInterval(updateLiveClock, 1000);
}

function stopLiveClock() {
  if (liveClockInterval) {
    clearInterval(liveClockInterval);
    liveClockInterval = null;
  }
}

function updateLiveClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const timeEl = document.getElementById("attendanceCurrentTime");
  if (timeEl) timeEl.textContent = timeStr;
}

async function apiCall(action, data = {}, useAttendanceAPI = false) {
  const apiUrl = useAttendanceAPI
    ? "backend/attendance_api.php"
    : "backend/dashboard_api.php";
  const formData = new FormData();
  formData.append("action", action);
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  try {
    const response = await fetch(apiUrl, { method: "POST", body: formData });
    const responseText = await response.text();
    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (jsonError) {
      console.error("JSON Parse Error:", jsonError);
      console.error("Response was:", responseText);
      return { success: false, message: "Server error. Please check backend." };
    }
  } catch (error) {
    return { success: false, message: "Network error: " + error.message };
  }
}

function showFeedback(title, message, type = "success") {
  appState.feedbackModal = {
    visible: true,
    title: title,
    message: message,
    type: type,
  };
  updateFeedbackModal();
  setTimeout(() => {
    closeFeedback();
  }, 3000);
}

function closeFeedback() {
  appState.feedbackModal.visible = false;
  const modal = document.getElementById("feedbackModal");
  if (modal) modal.classList.remove("active");
}

function updateFeedbackModal() {
  const modal = document.getElementById("feedbackModal");
  if (!modal) return;
  if (!appState.feedbackModal.visible) {
    modal.classList.remove("active");
    return;
  }
  modal.classList.add("active");
  const title = document.getElementById("feedbackTitle");
  const message = document.getElementById("feedbackMessage");
  if (title) title.textContent = appState.feedbackModal.title;
  if (message) message.textContent = appState.feedbackModal.message;
}

function toggleBranchDropdown() {
  const dropdown = document.getElementById("branchDropdown");
  const chevron = document.getElementById("chevronIcon");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
    if (chevron) {
      chevron.style.transform = dropdown.classList.contains("hidden")
        ? "rotate(0deg)"
        : "rotate(180deg)";
    }
  }
}

function selectBranch(branch) {
  event.preventDefault();
  appState.selectedBranch = branch;
  const branchText = document.getElementById("branchText");
  if (branchText) {
    branchText.textContent = branch === "all" ? "All Branches" : branch;
  }
  const dropdown = document.getElementById("branchDropdown");
  if (dropdown) dropdown.classList.add("hidden");
  refreshAll();
}

async function loadStats() {
  appState.loading.stats = true;
  updateLoadingIndicators();
  try {
    const result = await apiCall("getStats", {
      branch: appState.selectedBranch,
    });
    if (result.success) {
      appState.stats = result.data;
      updateStatsDisplay();
    } else {
      showFeedback("Error", "Failed to load stats", "error");
    }
  } catch (error) {
    showFeedback("Error", "Error loading stats", "error");
  } finally {
    appState.loading.stats = false;
    updateLoadingIndicators();
  }
}


function updateStatsDisplay() {
  if (!appState.stats) return;
  const stats = appState.stats;
  const elements = {
    netSales: formatPeso(stats.grossSales),
    grossSales: formatPeso(stats.netSales),
    voidedAmount: `Voided: -₱${formatNumber(stats.voidedAmount)}`,
    outSourceAmount: `Outsource: -₱${formatNumber(stats.outSourceAmount || 0)}`,
    todayTransactions: formatNumber(stats.todayTransactions),
    todaySales: formatPeso(stats.todaySales),
    inventoryValue: formatPeso(stats.inventoryValue),
    inventoryItems: `${formatNumber(stats.inventoryItemCount)} items in stock`,
    activeEmployees: formatNumber(stats.activeEmployees),
  };
  for (const [id, value] of Object.entries(elements)) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }
  const todayVoided = document.getElementById("todayVoided");
  if (todayVoided && stats.todayVoidedAmount > 0) {
    todayVoided.style.display = "block";
    todayVoided.textContent = `Voided: -₱${formatNumber(
      stats.todayVoidedAmount
    )}`;
  } else if (todayVoided) {
    todayVoided.style.display = "none";
  }
}

async function loadUsers() {
  appState.loading.users = true;
  updateLoadingIndicators();
  try {
    const result = await apiCall("getUsers", {
      branch: appState.selectedBranch,
    });
    if (result.success) {
      appState.users = result.data || [];
      updateUsersDisplay();
    } else {
      showFeedback("Error", "Failed to load users", "error");
    }
  } catch (error) {
    showFeedback("Error", "Error loading users", "error");
  } finally {
    appState.loading.users = false;
    updateLoadingIndicators();
  }
}

function updateUsersDisplay() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  if (appState.users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="py-8 text-center text-gray-500">No users found</td></tr>`;
    return;
  }
  const currentUserRole = appState.user.role || "cashier";
  const canEditDelete = ["admin", "manager"].includes(currentUserRole);
  tbody.innerHTML = appState.users
    .map(
      (user) => `
    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td class="py-4 px-4 text-sm text-gray-600 font-medium">${user.id}</td>
      <td class="py-4 px-4"><span class="text-sm font-medium text-gray-800">${
        user.email
      }</span></td>
      <td class="py-4 px-4"><span class="text-sm font-medium text-gray-800">${
        user.username || "-"
      }</span></td>
      <td class="py-4 px-4">
        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
          user.role === "admin"
            ? "bg-red-500 text-white"
            : user.role === "manager"
            ? "bg-black text-white"
            : "bg-green-100 text-green-700"
        }">
          ${
            user.role === "admin"
              ? "Owner"
              : user.role === "manager"
              ? "Manager"
              : "Cashier"
          }
        </span>
      </td>
      <td class="py-4 px-4">
        ${
          user.void_pin
            ? `<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">PIN Set</span>`
            : `<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">Not Required</span>`
        }
      </td>
      <td class="py-4 px-4">
        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          ${user.branch || "main"}
        </span>
      </td>
      <td class="py-4 px-4 text-sm text-gray-600">${formatDate(
        user.created_at
      )}</td>
      <td class="py-4 px-4">
        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
          user.status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }">
          ${user.status}
        </span>
      </td>
      ${
        canEditDelete
          ? `
      <td class="py-4 px-4">
        <div class="flex items-center gap-2">
          <button onclick="openEditModal(${user.id})" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">Edit</button>
          <button onclick="openDeleteModal(${user.id}, '${user.email}')" class="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">Delete</button>
        </div>
      </td>`
          : `<td class="py-4 px-4 text-center text-gray-400">No Actions</td>`
      }
    </tr>
  `
    )
    .join("");
}

async function loadAnnouncements() {
  appState.loading.announcements = true;
  updateLoadingIndicators();
  try {
    const result = await apiCall("getAnnouncements", {
      branch: appState.selectedBranch,
    });
    if (result.success) {
      appState.announcements = result.data || [];
      updateAnnouncementsDisplay();
    } else {
      console.error("Failed to load announcements:", result.message);
      showFeedback("Error", "Failed to load announcements", "error");
    }
  } catch (error) {
    console.error("Error loading announcements:", error);
    showFeedback("Error", "Error loading announcements", "error");
  } finally {
    appState.loading.announcements = false;
    updateLoadingIndicators();
  }
}

function updateAnnouncementsDisplay() {
  const container = document.getElementById("announcementsContainer");
  if (!container) return;
  if (appState.announcements.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-gray-500">No announcements yet</div>`;
    return;
  }
  container.innerHTML = appState.announcements
    .map(
      (announcement) => `
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h4 class="font-semibold text-gray-800 text-sm">${
            announcement.author || "Admin"
          }</h4>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">${getTimeAgo(
              announcement.created_at
            )}</span>
            ${
              announcement.is_global
                ? `<span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Global</span>`
                : `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${
                    announcement.branch || "main"
                  }</span>`
            }
          </div>
        </div>
      </div>
      <h3 class="font-bold text-gray-800 text-lg mb-2">${
        announcement.title
      }</h3>
      <p class="text-gray-700 text-sm mb-3">${announcement.message}</p>
    </div>
  `
    )
    .join("");
}

function openAnnouncementModal() {
  const modal = document.getElementById("announcementModal");
  if (modal) modal.classList.add("active");
}

function closeAnnouncementModal() {
  const modal = document.getElementById("announcementModal");
  if (modal) modal.classList.remove("active");
}

function openAddUserModal() {
  const roleSelect = document.getElementById("addUserRole");
  const voidPinContainer = document.getElementById("voidPinContainer");
  const voidPinInput = document.getElementById("addVoidPin");
  document.getElementById("addUserEmail").value = "";
  document.getElementById("addUsername").value = "";
  document.getElementById("addPassword").value = "";
  document.getElementById("addConfirmPassword").value = "";
  document.getElementById("addUserBranch").value =
    appState.user.branch || "main";
  document.getElementById("addUserStatus").value = "Active";
  if (roleSelect) roleSelect.value = "cashier";
  if (voidPinInput) voidPinInput.value = "";
  if (voidPinContainer) voidPinContainer.style.display = "none";
  const modal = document.getElementById("addUserModal");
  if (modal) modal.classList.add("active");
}

function closeAddUserModal() {
  const modal = document.getElementById("addUserModal");
  if (modal) modal.classList.remove("active");
}

function openEditModal(userId) {
  const user = appState.users.find((u) => u.id === userId);
  if (!user) {
    showFeedback("Error", "User not found", "error");
    return;
  }
  appState.selectedEmployee = { ...user };
  const editUsername = document.getElementById("editUsername");
  const editEmail = document.getElementById("editEmail");
  const editUserRole = document.getElementById("editUserRole");
  const editUserBranch = document.getElementById("editUserBranch");
  const editUserStatus = document.getElementById("editUserStatus");
  const editVoidPin = document.getElementById("editVoidPin");
  if (editUsername) editUsername.value = user.username || "";
  if (editEmail) editEmail.value = user.email || "";
  if (editUserBranch) editUserBranch.value = user.branch || "main";
  if (editUserStatus) editUserStatus.value = user.status || "Active";
  if (editUserRole) editUserRole.value = user.role || "cashier";
  if (editVoidPin) {
    editVoidPin.value = "";
    editVoidPin.placeholder = "Leave blank to keep existing PIN";
    if (user.role === "cashier") {
      editVoidPin.disabled = true;
      editVoidPin.placeholder = "Cashier cannot have Void PIN";
    } else {
      editVoidPin.disabled = false;
    }
  }
  const modal = document.getElementById("editModal");
  if (modal) modal.classList.add("active");
}

function closeEditModal() {
  const modal = document.getElementById("editModal");
  if (modal) modal.classList.remove("active");
  appState.selectedEmployee = null;
}

function openDeleteModal(userId, email) {
  const user = appState.users.find((u) => u.id === userId);
  if (!user) {
    showFeedback("Error", "User not found", "error");
    return;
  }
  appState.selectedEmployee = { ...user };
  const emailEl = document.getElementById("deleteUserEmail");
  if (emailEl) emailEl.textContent = email;
  const modal = document.getElementById("deleteModal");
  if (modal) modal.classList.add("active");
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) modal.classList.remove("active");
  appState.selectedEmployee = null;
}

async function postAnnouncement() {
  const title = document.getElementById("announcementTitle")?.value || "";
  const message = document.getElementById("announcementMessage")?.value || "";
  const type = document.getElementById("announcementType")?.value || "info";
  if (!title || !message) {
    showFeedback("Warning", "Please fill in both title and message", "warning");
    return;
  }
  try {
    const result = await apiCall("postAnnouncement", {
      title: title,
      message: message,
      type: type,
    });
    if (result.success) {
      document.getElementById("announcementTitle").value = "";
      document.getElementById("announcementMessage").value = "";
      closeAnnouncementModal();
      loadAnnouncements();
      showFeedback("Success", "Announcement posted successfully", "success");
    } else {
      showFeedback(
        "Error",
        result.message || "Failed to post announcement",
        "error"
      );
    }
  } catch (error) {
    console.error("Error posting announcement:", error);
    showFeedback("Error", "Error posting announcement", "error");
  }
}

async function addUser() {
  const emailInput = document.getElementById("addUserEmail");
  const usernameInput = document.getElementById("addUsername");
  const passwordInput = document.getElementById("addPassword");
  const confirmPasswordInput = document.getElementById("addConfirmPassword");
  const roleSelect = document.getElementById("addUserRole");
  const branchInput = document.getElementById("addUserBranch");
  const statusSelect = document.getElementById("addUserStatus");
  const voidPinInput = document.getElementById("addVoidPin");
  if (
    !emailInput ||
    !usernameInput ||
    !passwordInput ||
    !confirmPasswordInput ||
    !roleSelect
  ) {
    console.error("CRITICAL ERROR: Form elements not found!");
    showFeedback("Error", "Form error - please refresh page", "error");
    return;
  }
  const email = emailInput.value.trim();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const role = roleSelect.value;
  const branch = branchInput
    ? branchInput.value.trim()
    : appState.user.branch || "main";
  const status = statusSelect ? statusSelect.value : "Active";
  const void_pin = voidPinInput ? voidPinInput.value : "";
  if (!email || !username || !password || !confirmPassword || !branch) {
    showFeedback(
      "Warning",
      "Please fill in all required fields marked with *",
      "warning"
    );
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFeedback("Error", "Please enter a valid email address", "error");
    return;
  }
  if (username.length < 3) {
    showFeedback("Error", "Username must be at least 3 characters", "error");
    return;
  }
  if (password.length < 6) {
    showFeedback("Error", "Password must be at least 6 characters", "error");
    return;
  }
  if (password !== confirmPassword) {
    showFeedback("Error", "Passwords do not match", "error");
    return;
  }
  if ((role === "manager" || role === "admin") && !void_pin) {
    showFeedback(
      "Error",
      "Void PIN is required for Manager/Owner roles",
      "error"
    );
    return;
  }
  if (void_pin) {
    if (void_pin.length !== 4) {
      showFeedback("Error", "Void PIN must be exactly 4 digits", "error");
      return;
    }
    if (!/^\d+$/.test(void_pin)) {
      showFeedback("Error", "Void PIN must contain only numbers", "error");
      return;
    }
  }
  try {
    const result = await apiCall("addUser", {
      email: email,
      username: username,
      password: password,
      confirmPassword: confirmPassword,
      role: role,
      branch: branch,
      status: status,
      void_pin: void_pin,
    });
    if (result.success) {
      emailInput.value = "";
      usernameInput.value = "";
      passwordInput.value = "";
      confirmPasswordInput.value = "";
      if (voidPinInput) voidPinInput.value = "";
      if (roleSelect) roleSelect.value = "cashier";
      if (branchInput) branchInput.value = appState.user.branch || "main";
      if (statusSelect) statusSelect.value = "Active";
      closeAddUserModal();
      loadUsers();
      showFeedback("Success", "User added successfully", "success");
    } else {
      showFeedback("Error", result.message || "Failed to add user", "error");
    }
  } catch (error) {
    console.error("Error adding user:", error);
    showFeedback("Error", "Error adding user. Please try again.", "error");
  }
}

async function updateUser() {
  if (!appState.selectedEmployee) {
    showFeedback("Error", "No user selected", "error");
    return;
  }
  const emailInput = document.getElementById("editEmail");
  const usernameInput = document.getElementById("editUsername");
  const roleSelect = document.getElementById("editUserRole");
  const branchInput = document.getElementById("editUserBranch");
  const statusSelect = document.getElementById("editUserStatus");
  const voidPinInput = document.getElementById("editVoidPin");
  if (!emailInput || !usernameInput || !roleSelect) {
    console.error("CRITICAL ERROR: Edit form elements not found!");
    showFeedback("Error", "Form error - please refresh page", "error");
    return;
  }
  const email = emailInput.value;
  const username = usernameInput.value;
  const role = roleSelect.value;
  const branch = branchInput ? branchInput.value : "main";
  const status = statusSelect ? statusSelect.value : "Active";
  const void_pin = voidPinInput ? voidPinInput.value : "";
  if (void_pin) {
    if (role === "cashier") {
      showFeedback("Error", "Cashier accounts cannot have Void PIN", "error");
      return;
    }
    if (void_pin.length < 4) {
      showFeedback("Error", "Void PIN must be at least 4 digits", "error");
      return;
    }
    if (!/^\d+$/.test(void_pin)) {
      showFeedback("Error", "Void PIN must contain only numbers", "error");
      return;
    }
  }
  try {
    const result = await apiCall("updateUser", {
      id: appState.selectedEmployee.id,
      email: email,
      username: username,
      role: role,
      branch: branch,
      status: status,
      void_pin: void_pin,
    });
    if (result.success) {
      closeEditModal();
      loadUsers();
      showFeedback("Success", "User updated successfully", "success");
    } else {
      showFeedback("Error", result.message || "Failed to update user", "error");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    showFeedback("Error", "Error updating user. Please try again.", "error");
  }
}

async function confirmDelete() {
  if (!appState.selectedEmployee) {
    showFeedback("Error", "No user selected", "error");
    return;
  }
  try {
    const result = await apiCall("deleteUser", {
      id: appState.selectedEmployee.id,
    });
    if (result.success) {
      closeDeleteModal();
      loadUsers();
      showFeedback("Success", "User deleted successfully", "success");
    } else {
      showFeedback("Error", result.message || "Failed to delete user", "error");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showFeedback("Error", "Error deleting user", "error");
  }
}

function refreshAll() {
  console.log("Refreshing all data...");
  loadStats();
  loadUsers();
  loadAnnouncements();
  loadEmployeeStatus();
}

function refreshAnnouncements() {
  console.log("Refreshing announcements...");
  loadAnnouncements();
}

function refreshUsers() {
  console.log("Refreshing users...");
  loadUsers();
}

function goToAttendance() {
  window.location.href = "attendance.php";
}

function updateLoadingIndicators() {
  const refreshIcon = document.getElementById("refreshIcon");
  if (refreshIcon) {
    const isLoading =
      appState.loading.stats ||
      appState.loading.users ||
      appState.loading.announcements ||
      appState.loading.employees;
    if (isLoading) {
      refreshIcon.classList.add("animate-spin");
    } else {
      refreshIcon.classList.remove("animate-spin");
    }
  }
}

async function loadBranches() {
  appState.loading.branches = true;
  try {
    const result = await apiCall("getBranches", {});
    if (result.success) {
      appState.branches = result.data || [];
      updateBranchDropdown();
    } else {
      console.error("Failed to load branches:", result.message);
      appState.branches = [];
    }
  } catch (error) {
    console.error("Error loading branches:", error);
    appState.branches = [];
  } finally {
    appState.loading.branches = false;
  }
}

function updateBranchDropdown() {
  const dropdown = document.getElementById("branchDropdown");
  if (!dropdown) return;
  const branchOptions = appState.branches
    .map(
      (branch) => `
    <a href="#" onclick="selectBranch('${branch}')" class="w-full px-4 py-2.5 text-left text-xs sm:text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      ${branch}
    </a>
  `
    )
    .join("");
  dropdown.innerHTML = `
    <div class="py-2">
      <a href="#" onclick="selectBranch('all')" class="w-full px-4 py-2.5 text-left text-xs sm:text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        All Branches
        <span class="ml-auto text-red-500" id="allCheck">✓</span>
      </a>
      <div class="border-t border-gray-100 my-1"></div>
      ${branchOptions}
    </div>
  `;
}

// ============== ATTENDANCE FUNCTIONS ==============

function quickTimeIn() {
  attendanceData.action = "timeIn";
  attendanceData.pin = "";
  attendanceData.employeeId = null;
  document.getElementById("pinModalTitle").textContent = "Clock In";
  document.getElementById("pinModalSubtitle").textContent =
    appState.user.username || "Employee";
  const actionBtn = document.getElementById("pinActionButton");
  actionBtn.textContent = "Clock In";
  actionBtn.className = "btn-primary red";
  const pinInput = document.getElementById("attendancePinInput");
  if (pinInput) pinInput.value = "";
  const pinError = document.getElementById("pinError");
  if (pinError) pinError.classList.add("hidden");
  startLiveClock();
  showModal("attendancePinModal");
  setTimeout(() => {
    if (pinInput) pinInput.focus();
  }, 100);
}

function quickTimeOut() {
  attendanceData.action = "timeOut";
  attendanceData.pin = "";
  attendanceData.employeeId = null;
  document.getElementById("pinModalTitle").textContent = "Clock Out";
  document.getElementById("pinModalSubtitle").textContent =
    appState.user.username || "Employee";
  const actionBtn = document.getElementById("pinActionButton");
  actionBtn.textContent = "Clock Out";
  actionBtn.className = "btn-primary";
  const pinInput = document.getElementById("attendancePinInput");
  if (pinInput) pinInput.value = "";
  const pinError = document.getElementById("pinError");
  if (pinError) pinError.classList.add("hidden");
  startLiveClock();
  showModal("attendancePinModal");
  setTimeout(() => {
    if (pinInput) pinInput.focus();
  }, 100);
}

async function verifyPin() {
  const pinInput = document.getElementById("attendancePinInput");
  if (!pinInput) return;
  attendanceData.pin = pinInput.value.trim();
  if (attendanceData.pin.length !== 4) {
    showPinError("Please enter 4-digit PIN");
    return;
  }
  if (!/^\d{4}$/.test(attendanceData.pin)) {
    showPinError("PIN must be numbers only");
    return;
  }

  const now = Date.now();
  const cooldown = 3 * 60 * 1000;
  const action = attendanceData.action;
  const cooldownKey = `${attendanceData.pin}_${action}`;

  if (
    employeeCooldowns[cooldownKey] &&
    now - employeeCooldowns[cooldownKey] < cooldown
  ) {
    const remaining = Math.ceil(
      (cooldown - (now - employeeCooldowns[cooldownKey])) / 1000
    );
    showPinError(
      `Please wait ${remaining} seconds before ${
        action === "timeIn" ? "clocking in" : "clocking out"
      } again`
    );
    return;
  }

  try {
    const checkResult = await apiCall(
      "checkPin",
      { pin: attendanceData.pin },
      true
    );
    if (checkResult.success) {
      attendanceData.employeeId = checkResult.employeeId;
      attendanceData.employeeName = checkResult.employeeName;
      attendanceData.employeeRole = checkResult.employeeRole || "Employee";

      employeeCooldowns[cooldownKey] = now;

      showConfirmationModal();
    } else {
      showPinError(checkResult.message || "Invalid PIN");
    }
  } catch (error) {
    console.error("PIN Verification Error:", error);
    showPinError("System error. Please try again.");
  }
}

function showConfirmationModal() {
  const action = attendanceData.action === "timeIn" ? "Clock In" : "Clock Out";
  document.getElementById(
    "confirmModalTitle"
  ).textContent = `Confirm ${action}`;
  document.getElementById(
    "confirmMessage"
  ).textContent = `Are you sure you want to ${action.toLowerCase()}?`;
  document.getElementById(
    "confirmDetails"
  ).innerHTML = `<strong>${attendanceData.employeeName}</strong><br>${attendanceData.employeeRole}`;
  const actionBtn = document.getElementById("confirmActionButton");
  actionBtn.textContent = `Yes, ${action}`;
  actionBtn.className =
    attendanceData.action === "timeIn" ? "btn-primary red" : "btn-primary";
  closeModal("attendancePinModal");
  showModal("attendanceConfirmModal");
}

async function processAttendanceAction() {
  try {
    const action = attendanceData.action;
    const result = await apiCall(
      action,
      { employeeId: attendanceData.employeeId, pin: attendanceData.pin },
      true
    );

    if (result.success) {
      const isOnDuty = action === "timeIn";
      forceEmployeeStatus(attendanceData.employeeId, isOnDuty);

      setTimeout(() => {
        syncEmployeeStatus();
      }, 500);

      showResultModal(
        "success",
        `${
          action === "timeIn" ? "✅ Clocked in" : "🕒 Clocked out"
        } successfully!`,
        result
      );
    } else {
      showResultModal("error", result.message || `Failed to ${action}`);
    }
  } catch (error) {
    console.error("Attendance Action Error:", error);
    showResultModal("error", "System error: " + error.message);
  }
}

function showResultModal(type, message, data = null) {
  const icon = document.getElementById("resultIcon");
  const titleEl = document.getElementById("resultModalTitle");
  const messageEl = document.getElementById("resultMessage");
  const detailsEl = document.getElementById("resultDetails");

  if (type === "success") {
    icon.style.background = "#10b981";
    icon.innerHTML = "✓";

    setTimeout(() => {
      forceEmployeeStatus(
        attendanceData.employeeId,
        attendanceData.action === "timeIn"
      );
      syncEmployeeStatus();
    }, 100);
  } else {
    icon.style.background = "#ef4444";
    icon.innerHTML = "✗";
  }

  titleEl.textContent = type === "success" ? "Success!" : "Error";
  messageEl.textContent = message;

  if (data && data.summary) {
    detailsEl.innerHTML = `
      <div class="bg-gray-50 p-4 rounded-lg mt-4">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="text-gray-600">Total Hours:</div>
          <div class="font-semibold text-gray-800">${
            data.summary.totalHours || 0
          }h</div>
          <div class="text-gray-600">Regular:</div>
          <div class="font-semibold text-gray-800">${
            data.summary.regularHours || 0
          }h</div>
          <div class="text-gray-600">Overtime:</div>
          <div class="font-semibold text-gray-800">${
            data.summary.overtimeHours || 0
          }h</div>
        </div>
      </div>
    `;
  } else {
    detailsEl.innerHTML = "";
  }

  closeModal("attendanceConfirmModal");
  showModal("attendanceResultModal");
}

function showPinError(message) {
  const errorEl = document.getElementById("pinError");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
    setTimeout(() => errorEl.classList.add("hidden"), 3000);
  }
}

function closeAttendanceModal() {
  closeModal("attendancePinModal");
  stopLiveClock();
}

function closeConfirmModal() {
  closeModal("attendanceConfirmModal");
  showModal("attendancePinModal");
}

function closeResultModal() {
  closeModal("attendanceResultModal");
  attendanceData.pin = "";
  attendanceData.employeeId = null;
  stopLiveClock();

  setTimeout(() => {
    syncEmployeeStatus();
  }, 300);
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show", "active");
    document.body.style.overflow = "hidden";
    if (modalId === "attendancePinModal") {
      startLiveClock();
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show", "active");
    document.body.style.overflow = "auto";
    if (
      modalId === "attendancePinModal" ||
      modalId === "attendanceConfirmModal" ||
      modalId === "attendanceResultModal"
    ) {
      stopLiveClock();
    }
  }
}

// ============== CASH IN/OUT FUNCTIONS ==============

function openCashInModal() {
  const modal = document.getElementById("cashInModal");
  if (modal) {
    modal.classList.add("active");
    const amountInput = document.getElementById("cashInAmount");
    const reasonInput = document.getElementById("cashInReason");
    if (amountInput) amountInput.value = "";
    if (reasonInput) reasonInput.value = "";
    setTimeout(() => {
      if (amountInput) amountInput.focus();
    }, 100);
  }
}

function closeCashInModal() {
  const modal = document.getElementById("cashInModal");
  if (modal) modal.classList.remove("active");
}

async function processCashIn() {
  const amountInput = document.getElementById("cashInAmount");
  const reasonInput = document.getElementById("cashInReason");
  if (!amountInput || !reasonInput) {
    showFeedback("Error", "Form elements not found", "error");
    return;
  }
  const amount = parseFloat(amountInput.value);
  const reason = reasonInput.value.trim();
  if (!amount || amount <= 0) {
    showFeedback("Error", "Please enter a valid amount", "error");
    return;
  }
  if (!reason) {
    showFeedback("Error", "Please enter a reason for cash in", "error");
    return;
  }
  try {
    const result = await apiCall("cashIn", {
      amount: amount,
      type: "deposit",
      reason: reason,
      branch: appState.user.branch || "main",
      user_id: appState.user.id,
    });
    if (result.success) {
      showFeedback(
        "Cash In Successful",
        `₱${amount.toFixed(2)} has been added to the register.`,
        "success"
      );
      closeCashInModal();
      refreshAll();
    } else {
      showFeedback(
        "Error",
        result.message || "Failed to process cash in",
        "error"
      );
    }
  } catch (error) {
    console.error("Cash In Error:", error);
    showFeedback("Error", "Network error. Please try again.", "error");
  }
}

function openCashOutModal() {
  const modal = document.getElementById("cashOutModal");
  if (modal) {
    modal.classList.add("active");
    const amountInput = document.getElementById("cashOutAmount");
    const reasonInput = document.getElementById("cashOutReason");
    if (amountInput) amountInput.value = "";
    if (reasonInput) reasonInput.value = "";
    setTimeout(() => {
      if (amountInput) amountInput.focus();
    }, 100);
  }
}

function closeCashOutModal() {
  const modal = document.getElementById("cashOutModal");
  if (modal) modal.classList.remove("active");
}

async function processCashOut() {
  const amountInput = document.getElementById("cashOutAmount");
  const reasonInput = document.getElementById("cashOutReason");
  if (!amountInput || !reasonInput) {
    showFeedback("Error", "Form elements not found", "error");
    return;
  }
  const amount = parseFloat(amountInput.value);
  const reason = reasonInput.value.trim();
  if (!amount || amount <= 0) {
    showFeedback("Error", "Please enter a valid amount", "error");
    return;
  }
  if (!reason) {
    showFeedback("Error", "Please enter a reason for cash out", "error");
    return;
  }
  try {
    const result = await apiCall("cashOut", {
      amount: amount,
      type: "withdrawal",
      reason: reason,
      branch: appState.user.branch || "main",
      user_id: appState.user.id,
    });
    if (result.success) {
      showFeedback(
        "Cash Out Successful",
        `₱${amount.toFixed(2)} has been removed from the register.`,
        "success"
      );
      closeCashOutModal();
      refreshAll();
    } else {
      showFeedback(
        "Error",
        result.message || "Failed to process cash out",
        "error"
      );
    }
  } catch (error) {
    console.error("Cash Out Error:", error);
    showFeedback("Error", "Network error. Please try again.", "error");
  }
}

// ============== REAL-TIME SYSTEM ==============

function startRealTimeSync() {
  if (realTimeSyncInterval) {
    clearInterval(realTimeSyncInterval);
  }

  realTimeSyncInterval = setInterval(() => {
    const now = Date.now();
    if (now - lastUpdateTime > 3000) {
      syncEmployeeStatus();
      lastUpdateTime = now;
    }
  }, 3000);

  window.addEventListener("focus", () => {
    syncEmployeeStatus();
  });

  window.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      syncEmployeeStatus();
    }
  });
}

// ============== INITIALIZATION ==============

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM LOADED - STARTING REAL-TIME SYSTEM");

  if (typeof currentUser !== "undefined") {
    appState.user = currentUser;

    const branchFilterContainer = document.querySelector(
      ".relative:has(#branchDropdown)"
    );
    if (branchFilterContainer) {
      if (currentUser.role !== "admin") {
        branchFilterContainer.style.display = "none";
        appState.selectedBranch = currentUser.branch || "main";
        const branchText = document.getElementById("branchText");
        if (branchText) {
          branchText.textContent = appState.selectedBranch;
        }
      } else {
        loadBranches();
      }
    }
    const addUserBtn = document.querySelector(
      'button[onclick="openAddUserModal()"]'
    );
    if (addUserBtn && !["admin", "manager"].includes(currentUser.role)) {
      addUserBtn.style.display = "none";
    }
    const addUserBranch = document.getElementById("addUserBranch");
    if (addUserBranch && currentUser.branch) {
      addUserBranch.value = currentUser.branch;
    }
  }

  setupRoleChangeHandlers();
  startLiveClock();
  startRealTimeSync();

  setTimeout(() => {
    loadStats();
    loadUsers();
    loadAnnouncements();

    // Initial sync
    syncEmployeeStatus().then((success) => {
      console.log("Initial sync:", success ? "✅ Success" : "❌ Failed");
      if (!success) {
        setTimeout(() => syncEmployeeStatus(), 2000);
      }
    });
  }, 500);

  console.log("✅ REAL-TIME SYSTEM ACTIVE");
});

// ============== WINDOW EXPORTS ==============

window.quickTimeIn = quickTimeIn;
window.quickTimeOut = quickTimeOut;
window.verifyPin = verifyPin;
window.closeAttendanceModal = closeAttendanceModal;
window.processAttendanceAction = processAttendanceAction;
window.closeConfirmModal = closeConfirmModal;
window.closeResultModal = closeResultModal;
window.showModal = showModal;
window.closeModal = closeModal;
window.refreshAll = refreshAll;
window.refreshAnnouncements = refreshAnnouncements;
window.refreshUsers = refreshUsers;
window.goToAttendance = goToAttendance;
window.toggleBranchDropdown = toggleBranchDropdown;
window.selectBranch = selectBranch;
window.openAnnouncementModal = openAnnouncementModal;
window.closeAnnouncementModal = closeAnnouncementModal;
window.postAnnouncement = postAnnouncement;
window.openAddUserModal = openAddUserModal;
window.closeAddUserModal = closeAddUserModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.updateUser = updateUser;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.addUser = addUser;
window.startLiveClock = startLiveClock;
window.stopLiveClock = stopLiveClock;
window.updateLiveClock = updateLiveClock;
window.loadEmployeeStatus = loadEmployeeStatus;
window.openCashInModal = openCashInModal;
window.closeCashInModal = closeCashInModal;
window.processCashIn = processCashIn;
window.openCashOutModal = openCashOutModal;
window.closeCashOutModal = closeCashOutModal;
window.processCashOut = processCashOut;
window.syncEmployeeStatus = syncEmployeeStatus;
window.forceEmployeeStatus = forceEmployeeStatus;
window.renderEmployeeStatus = renderEmployeeStatus;
window.forceSync = syncEmployeeStatus; // Alias for button
window.openOutSourceModal = openOutSourceModal;
window.closeOutSourceModal = closeOutSourceModal;
window.toggleProducts = toggleProducts;
window.addProductRow = addProductRow;
window.removeProductRow = removeProductRow;
window.calculateTotal = calculateTotal;
window.submitOutSource = submitOutSource;