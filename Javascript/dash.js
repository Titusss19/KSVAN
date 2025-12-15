// dash.js - SIMPLE CLEAN VERSION MATCHING SCREENSHOT

// ===== STATE MANAGEMENT =====
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
  },
  selectedEmployee: null,
  feedbackModal: {
    visible: false,
    title: "",
    message: "",
    type: "success",
  },
};

// ===== ATTENDANCE STATE =====
let attendanceData = {
  action: "",
  pin: "",
  employeeId: null,
  employeeName: "",
  employeeRole: "",
};

// ===== LIVE CLOCK VARIABLE =====
let liveClockInterval = null;

// ===== UTILITY FUNCTIONS =====
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

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
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

// ===== LIVE CLOCK FUNCTIONS =====
function startLiveClock() {
  if (liveClockInterval) {
    clearInterval(liveClockInterval);
  }
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
  if (timeEl) {
    timeEl.textContent = timeStr;
  }
}

// ===== API CALL FUNCTION =====
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
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();
    console.log(`API Response for ${action}:`, responseText.substring(0, 500));

    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (jsonError) {
      console.error(
        "JSON Parse Error for action:",
        action,
        responseText.substring(0, 200)
      );
      return {
        success: false,
        message: "Server error. Please check backend.",
      };
    }
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return {
      success: false,
      message: "Network error: " + error.message,
    };
  }
}

// ===== FEEDBACK MODAL =====
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

// ===== BRANCH FILTER =====
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
  if (dropdown) {
    dropdown.classList.add("hidden");
  }

  loadStats();
  loadUsers();
  loadAnnouncements();
}

// ===== STATS LOADING =====
async function loadStats() {
  appState.loading.stats = true;
  updateLoadingIndicators();

  try {
    console.log("Loading stats for branch:", appState.selectedBranch);
    const result = await apiCall("getStats", {
      branch: appState.selectedBranch,
    });

    if (result.success) {
      appState.stats = result.data;
      updateStatsDisplay();
      console.log("Stats loaded:", result.data);
    } else {
      console.error("Failed to load stats:", result.message);
      showFeedback("Error", "Failed to load stats", "error");
    }
  } catch (error) {
    console.error("Error loading stats:", error);
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
    todayTransactions: formatNumber(stats.todayTransactions),
    todaySales: formatPeso(stats.todaySales),
    inventoryValue: formatPeso(stats.inventoryValue),
    inventoryItems: `${formatNumber(stats.inventoryItemCount)} items in stock`,
    activeEmployees: formatNumber(stats.activeEmployees),
  };

  for (const [id, value] of Object.entries(elements)) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
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

// ===== USERS LOADING =====
async function loadUsers() {
  appState.loading.users = true;
  updateLoadingIndicators();

  try {
    console.log("Loading users for branch:", appState.selectedBranch);
    const result = await apiCall("getUsers", {
      branch: appState.selectedBranch,
    });

    if (result.success) {
      appState.users = result.data || [];
      updateUsersDisplay();
      console.log("Users loaded:", result.data);
    } else {
      console.error("Failed to load users:", result.message);
      showFeedback("Error", "Failed to load users", "error");
    }
  } catch (error) {
    console.error("Error loading users:", error);
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
  const canEditDelete = ["admin", "owner", "manager"].includes(currentUserRole);

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
            ? "bg-purple-100 text-purple-700"
            : user.role === "manager"
            ? "bg-blue-100 text-red-700"
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

function handleRoleChange() {
  const roleSelect = document.getElementById("addUserRole");
  const voidPinContainer = document.getElementById("voidPinContainer");
  const voidPinInput = document.getElementById("addVoidPin");

  if (roleSelect && voidPinContainer && voidPinInput) {
    roleSelect.addEventListener("change", function () {
      if (this.value === "manager" || this.value === "admin") {
        voidPinContainer.style.display = "block";
        voidPinInput.required = true;
      } else {
        voidPinContainer.style.display = "none";
        voidPinInput.required = false;
        voidPinInput.value = "";
      }
    });

    if (roleSelect.value === "manager" || roleSelect.value === "admin") {
      voidPinContainer.style.display = "block";
      voidPinInput.required = true;
    }
  }
}

// ===== ANNOUNCEMENTS LOADING =====
async function loadAnnouncements() {
  appState.loading.announcements = true;
  updateLoadingIndicators();

  try {
    console.log("Loading announcements for branch:", appState.selectedBranch);
    const result = await apiCall("getAnnouncements", {
      branch: appState.selectedBranch,
    });

    if (result.success) {
      appState.announcements = result.data || [];
      updateAnnouncementsDisplay();
      console.log("Announcements loaded:", result.data);
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

// ===== MODALS =====
function openAnnouncementModal() {
  const modal = document.getElementById("announcementModal");
  if (modal) modal.classList.add("active");
}

function closeAnnouncementModal() {
  const modal = document.getElementById("announcementModal");
  if (modal) modal.classList.remove("active");
}

function openAddUserModal() {
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

  if (editUsername) editUsername.value = user.username || "";
  if (editEmail) editEmail.value = user.email || "";
  if (editUserRole) editUserRole.value = user.role || "cashier";
  if (editUserBranch) editUserBranch.value = user.branch || "main";
  if (editUserStatus) editUserStatus.value = user.status || "Active";

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

// ===== ACTIONS =====
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
  const email = document.getElementById("addUserEmail")?.value.trim() || "";
  const username = document.getElementById("addUsername")?.value.trim() || "";
  const password = document.getElementById("addPassword")?.value || "";
  const confirmPassword =
    document.getElementById("addConfirmPassword")?.value || "";
  const role = document.getElementById("addUserRole")?.value || "cashier";
  const branch =
    document.getElementById("addUserBranch")?.value.trim() || "main";
  const status = document.getElementById("addUserStatus")?.value || "Active";
  const void_pin = document.getElementById("addVoidPin")?.value || "";

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
      document.getElementById("addUserEmail").value = "";
      document.getElementById("addUsername").value = "";
      document.getElementById("addPassword").value = "";
      document.getElementById("addConfirmPassword").value = "";
      document.getElementById("addVoidPin").value = "";
      document.getElementById("addUserBranch").value =
        appState.user.branch || "main";

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

  const email = document.getElementById("editEmail")?.value || "";
  const username = document.getElementById("editUsername")?.value || "";
  const role = document.getElementById("editUserRole")?.value || "cashier";
  const branch = document.getElementById("editUserBranch")?.value || "main";
  const status = document.getElementById("editUserStatus")?.value || "Active";
  const void_pin = document.getElementById("editVoidPin")?.value || "";

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
  loadStats();
  loadUsers();
  loadAnnouncements();
  loadEmployeeStatus();
}

function refreshAnnouncements() {
  loadAnnouncements();
}

function refreshUsers() {
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
      appState.loading.announcements;
    if (isLoading) {
      refreshIcon.classList.add("animate-spin");
    } else {
      refreshIcon.classList.remove("animate-spin");
    }
  }
}

// ===== LOAD BRANCHES =====
async function loadBranches() {
  appState.loading.branches = true;

  try {
    console.log("Loading branches for user role:", appState.user.role);
    const result = await apiCall("getBranches", {});

    if (result.success) {
      appState.branches = result.data || [];
      console.log("Branches loaded:", result.data);
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

// ===== LOAD EMPLOYEE STATUS =====
async function loadEmployeeStatus() {
  try {
    console.log("Loading employee status...");
    const result = await apiCall("getEmployees", {}, true); // Use attendance API

    if (result.success) {
      updateEmployeeStatusDisplay(result.employees || []);
      console.log("Employee status loaded:", result.employees);
    } else {
      console.error("Failed to load employee status:", result.message);
      updateEmployeeStatusDisplay([]);
    }
  } catch (error) {
    console.error("Error loading employee status:", error);
    updateEmployeeStatusDisplay([]);
  }
}

function updateEmployeeStatusDisplay(employees) {
  const container = document.getElementById("employeeStatusList");
  if (!container) return;

  if (employees.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 text-gray-500 text-sm">
        No employees found
      </div>
    `;
    return;
  }

  // Sort: on duty first, then alphabetically
  employees.sort((a, b) => {
    if (a.is_on_duty && !b.is_on_duty) return -1;
    if (!a.is_on_duty && b.is_on_duty) return 1;
    return a.full_name.localeCompare(b.full_name);
  });

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
                emp.is_on_duty
                  ? `<p class="text-xs text-gray-500">Working ${
                      emp.current_hours || 0
                    }h</p>`
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

function updateBranchDropdown() {
  const dropdown = document.getElementById("branchDropdown");
  if (!dropdown) return;

  const branchList = dropdown.querySelector(".py-2");
  if (!branchList) return;

  const allBranchesBtn = branchList.querySelector("button:first-child");
  const divider = branchList.querySelector(".border-t");

  const oldBranches = branchList.querySelectorAll("button:not(:first-child)");
  oldBranches.forEach((btn) => {
    if (btn !== divider && !btn.classList.contains("border-t")) {
      btn.remove();
    }
  });

  appState.branches.forEach((branch) => {
    const button = document.createElement("button");
    button.onclick = () => {
      selectBranch(branch);
      return false;
    };
    button.className = `w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
      appState.selectedBranch === branch
        ? "bg-red-50 text-red-600 font-medium"
        : "text-gray-700"
    }`;
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      ${branch}
      ${
        appState.selectedBranch === branch
          ? '<span class="ml-auto text-red-500">✓</span>'
          : ""
      }
    `;
    branchList.appendChild(button);
  });
}

// ============================================
// ATTENDANCE QUICK ACTIONS - SIMPLE VERSION
// ============================================

function quickTimeIn() {
  console.log("quickTimeIn() called");

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
  console.log("quickTimeOut() called");

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
      {
        employeeId: attendanceData.employeeId,
        pin: attendanceData.pin,
      },
      true
    );

    if (result.success) {
      showResultModal(
        "success",
        result.message ||
          `${action === "timeIn" ? "Clocked in" : "Clocked out"} successfully`,
        result
      );
    } else {
      showResultModal("error", result.message || `Failed to ${action}`);
    }
  } catch (error) {
    console.error("Attendance Action Error:", error);
    showResultModal("error", error.message || "System error");
  }
}

function showResultModal(type, message, data = null) {
  const icon = document.getElementById("resultIcon");
  const titleEl = document.getElementById("resultModalTitle");
  const messageEl = document.getElementById("resultMessage");
  const detailsEl = document.getElementById("resultDetails");

  if (type === "success") {
    icon.style.background = "#10b981";
    icon.innerHTML =
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else {
    icon.style.background = "#ef4444";
    icon.innerHTML =
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  }

  titleEl.textContent = type === "success" ? "Success" : "Error";
  messageEl.textContent = message;

  if (data && data.summary) {
    detailsEl.innerHTML = `
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
          <div>Total Hours:</div>
          <div style="font-weight: 600;">${data.summary.totalHours || 0}h</div>
          <div>Regular:</div>
          <div style="font-weight: 600;">${
            data.summary.regularHours || 0
          }h</div>
          <div>Overtime:</div>
          <div style="font-weight: 600;">${
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
}

function showModal(modalId) {
  console.log("showModal:", modalId);
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
  console.log("closeModal:", modalId);
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

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function () {
  console.log("Dashboard initializing...");

  if (typeof currentUser !== "undefined") {
    appState.user = currentUser;
    console.log("Current user:", currentUser);

    const branchFilterContainer = document.querySelector(
      ".relative:has(#branchDropdown)"
    );
    if (branchFilterContainer) {
      if (currentUser.role !== "admin" && currentUser.role !== "owner") {
        branchFilterContainer.style.display = "none";
      } else {
        loadBranches();
      }
    }

    const addUserBtn = document.querySelector(
      'button[onclick="openAddUserModal()"]'
    );
    if (
      addUserBtn &&
      !["admin", "owner", "manager"].includes(currentUser.role)
    ) {
      addUserBtn.style.display = "none";
    }
  }

  handleRoleChange();
  startLiveClock();

  setTimeout(() => {
    loadStats();
    loadUsers();
    loadAnnouncements();
    loadEmployeeStatus();
  }, 500);
});

// ===== EXPORT FUNCTIONS =====
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

