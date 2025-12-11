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

function updateBranchDropdown() {
  const dropdown = document.getElementById("branchDropdown");
  if (!dropdown) return;

  const branchList = dropdown.querySelector(".py-2");
  if (!branchList) return;

  // Keep the "All Branches" option
  const allBranchesBtn = branchList.querySelector("button:first-child");
  const divider = branchList.querySelector(".border-t");

  // Remove old branches
  const oldBranches = branchList.querySelectorAll("button:not(:first-child)");
  oldBranches.forEach((btn) => {
    if (btn !== divider && !btn.classList.contains("border-t")) {
      btn.remove();
    }
  });

  // Add new branches
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
} // dash.js - COMPLETE FIXED VERSION WITH FULL FUNCTIONALITY

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

// ===== API CALL FUNCTION =====
async function apiCall(action, data = {}) {
  const formData = new FormData();
  formData.append("action", action);

  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }

  try {
    const response = await fetch("backend/dashboard_api.php", {
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
      <td class="py-4 px-4">
        <div class="flex items-center gap-2">
          <button onclick="openEditModal(${
            user.id
          })" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">Edit</button>
          <button onclick="openDeleteModal(${user.id}, '${
        user.email
      }')" class="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
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

  // Populate edit form
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
  const email = document.getElementById("addUserEmail")?.value || "";
  const username = document.getElementById("addUsername")?.value || "";
  const password = document.getElementById("addPassword")?.value || "";
  const confirmPassword =
    document.getElementById("addConfirmPassword")?.value || "";
  const role = document.getElementById("addUserRole")?.value || "cashier";
  const branch = document.getElementById("addUserBranch")?.value || "main";
  const status = document.getElementById("addUserStatus")?.value || "Active";

  if (!email || !username || !password || !confirmPassword) {
    showFeedback("Warning", "Please fill in all required fields", "warning");
    return;
  }

  if (password !== confirmPassword) {
    showFeedback("Error", "Passwords do not match", "error");
    return;
  }

  if (password.length < 6) {
    showFeedback("Error", "Password must be at least 6 characters", "error");
    return;
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
    });

    if (result.success) {
      document.getElementById("addUserEmail").value = "";
      document.getElementById("addUsername").value = "";
      document.getElementById("addPassword").value = "";
      document.getElementById("addConfirmPassword").value = "";
      closeAddUserModal();
      loadUsers();
      showFeedback("Success", "User added successfully", "success");
    } else {
      showFeedback("Error", result.message || "Failed to add user", "error");
    }
  } catch (error) {
    console.error("Error adding user:", error);
    showFeedback("Error", "Error adding user", "error");
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

  try {
    const result = await apiCall("updateUser", {
      id: appState.selectedEmployee.id,
      email: email,
      username: username,
      role: role,
      branch: branch,
      status: status,
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
    showFeedback("Error", "Error updating user", "error");
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

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function () {
  console.log("Dashboard initializing...");

  if (typeof currentUser !== "undefined") {
    appState.user = currentUser;
    console.log("Current user:", currentUser);

    // Hide branch filter for non-admin users
    const branchFilterContainer = document.querySelector(
      ".relative:has(#branchDropdown)"
    );
    if (branchFilterContainer) {
      if (currentUser.role !== "admin" && currentUser.role !== "owner") {
        branchFilterContainer.style.display = "none";
      } else {
        // Load branches only for admin/owner
        loadBranches();
      }
    }
  }

  setTimeout(() => {
    loadStats();
    loadUsers();
    loadAnnouncements();
  }, 500);
});
