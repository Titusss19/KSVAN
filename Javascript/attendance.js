let employees = [];
let selectedEmployee = null;
let currentTime = new Date();
let searchTerm = "";
let systemSettings = {
  minHoursToPay: 4,
  maxRegularHours: 8,
};

// ============================
// INITIALIZATION
// ============================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Attendance System Initializing...");

  // Hide loading screen after 1 second
  setTimeout(() => {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
    }
    const contentWrapper = document.querySelector(".content-wrapper");
    if (contentWrapper) {
      contentWrapper.style.opacity = "1";
    }
  }, 1000);

  // Update current time
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  // Setup form handlers
  const addEmployeeForm = document.getElementById("addEmployeeForm");
  if (addEmployeeForm) {
    addEmployeeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleAddEmployee(e);
    });
  }

  const editEmployeeForm = document.getElementById("editEmployeeForm");
  if (editEmployeeForm) {
    console.log("✅ Edit form found and attaching submit listener");
    editEmployeeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleEditEmployee(e);
    });
  } else {
    console.warn("⚠️ Edit employee form not found on initial load");
  }

  // Setup search
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterEmployees);
  }

  // Setup PIN input
  const pinInput = document.getElementById("pinInput");
  if (pinInput) {
    pinInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        processTimeInOut();
      }
    });
  }

  // Load system settings and employees
  loadSystemSettings();
  loadEmployees();

  console.log("✅ Attendance System Ready!");
});

// ============================
// MODAL FUNCTIONS - SIMPLE & CLEAN
// ============================
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      const firstInput = modal.querySelector('input:not([type="hidden"])');
      if (firstInput) firstInput.focus();
    }, 100);

    console.log("✅ Modal shown:", modalId);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    console.log("✅ Modal closed:", modalId);
  }

  if (modalId === "timeInOutModal") {
    const pinInput = document.getElementById("pinInput");
    const pinError = document.getElementById("pinError");
    if (pinInput) pinInput.value = "";
    if (pinError) {
      pinError.textContent = "";
      pinError.classList.add("hidden");
    }
  }
  if (modalId === "resetPinModal") {
    const newPin = document.getElementById("newPin");
    const confirmPin = document.getElementById("confirmPin");
    if (newPin) newPin.value = "";
    if (confirmPin) confirmPin.value = "";
  }
}

function showAddEmployeeModal() {
  const form = document.getElementById("addEmployeeForm");
  if (form) form.reset();
  showModal("addEmployeeModal");
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
  if (event.target.classList && event.target.classList.contains("modal")) {
    event.target.classList.remove("show");
    document.body.style.overflow = "auto";
  }
});

// Prevent modal from closing when clicking inside modal-content
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".modal-content").forEach((modalContent) => {
    modalContent.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  });
});

// Escape key to close modal
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const openModals = document.querySelectorAll(".modal.show");
    openModals.forEach((modal) => {
      modal.classList.remove("show");
      document.body.style.overflow = "auto";
    });
  }
});

// ============================
// API FUNCTIONS
// ============================
async function apiRequest(endpoint, options = {}) {
  try {
    console.log(`📡 API Request to: ${endpoint}`, options);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    options.signal = controller.signal;

    const response = await fetch(endpoint, options);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("📨 Raw API Response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ JSON Parse Error:", e);
      throw new Error("Invalid JSON response from server");
    }

    if (!data.success) {
      throw new Error(data.error || "Unknown error occurred");
    }

    return data;
  } catch (error) {
    console.error("❌ API Error:", error);
    showNotification("error", "Error: " + error.message);
    throw error;
  }
}

// ============================
// LOAD FUNCTIONS
// ============================
async function loadSystemSettings() {
  try {
    const data = await apiRequest(
      "backend/attendance_api.php?action=getSystemSettings"
    );
    if (data.settings) {
      systemSettings = {
        minHoursToPay: parseFloat(data.settings.min_hours_to_pay),
        maxRegularHours: parseFloat(data.settings.max_regular_hours),
      };
      console.log("✅ System settings loaded:", systemSettings);
    }
  } catch (error) {
    console.error("❌ Failed to load system settings:", error);
  }
}

async function loadEmployees() {
  try {
    console.log("🔄 Loading employees...");
    const data = await apiRequest(
      "backend/attendance_api.php?action=getEmployees"
    );
    employees = data.employees || [];
    console.log(`✅ Loaded ${employees.length} employees`);
    renderEmployeeList();
  } catch (error) {
    console.error("❌ Failed to load employees:", error);
    const container = document.getElementById("employeeList");
    if (container) {
      container.innerHTML = `
                <div class="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <div class="text-red-600 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-slate-900 mb-2">Failed to load employees</h3>
                    <p class="text-sm text-slate-500">${error.message}</p>
                    <button onclick="loadEmployees()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Retry
                    </button>
                </div>
            `;
    }
  }
}

// ============================
// ADD EMPLOYEE
// ============================
async function handleAddEmployee(e) {
  e.preventDefault();
  console.log("Adding employee...");

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const required = [
    "name",
    "username",
    "email",
    "address",
    "contactNumber",
    "pin",
  ];
  for (const field of required) {
    if (!data[field]?.trim()) {
      showNotification("error", `Please fill in ${field}`);
      return;
    }
  }

  if (!/^\d{4,6}$/.test(data.pin)) {
    showNotification("error", "PIN must be 4-6 digits");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("action", "addEmployee");
    params.append("name", data.name);
    params.append("username", data.username);
    params.append("email", data.email);
    params.append("address", data.address);
    params.append("contactNumber", data.contactNumber);
    params.append("dailyRate", data.dailyRate || 0);
    params.append("pin", data.pin);

    const result = await apiRequest("backend/attendance_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    closeModal("addEmployeeModal");
    showNotification("success", `${data.name} added successfully`);
    form.reset();
    await loadEmployees();
  } catch (error) {
    console.error("Add Employee Error:", error);
    showNotification("error", error.message);
  }
}

// ============================
// EDIT EMPLOYEE - FIXED
// ============================
function openEditEmployee(employeeId) {
  console.log("🔧 Opening edit modal for employee:", employeeId);

  const employee = employees.find((e) => e.employee_id == employeeId);

  if (!employee) {
    console.error("❌ Employee not found:", employeeId);
    showNotification("error", "Employee not found");
    return;
  }

  console.log("✅ Employee found:", employee);
  selectedEmployee = employee;

  // Populate form fields
  const editForm = document.getElementById("editEmployeeForm");
  if (!editForm) {
    console.error("❌ Edit form not found in DOM");
    return;
  }

  // Set all form fields
  document.getElementById("editEmployeeId").value = employee.employee_id;
  document.getElementById("editName").value = employee.full_name || "";
  document.getElementById("editUsername").value = employee.username || "";
  document.getElementById("editEmail").value = employee.email || "";
  document.getElementById("editAddress").value = employee.address || "";
  document.getElementById("editContactNumber").value =
    employee.contact_number || "";
  document.getElementById("editDailyRate").value = employee.daily_rate || 0;

  console.log("✅ Form fields populated");

  // Show the modal
  showModal("editEmployeeModal");

  console.log("✅ Modal displayed");
}

async function handleEditEmployee(e) {
  e.preventDefault();
  console.log("📝 Submitting edit employee form...");

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  console.log("Form data:", data);

  // Validation
  if (!data.id || !data.id.trim()) {
    showNotification("error", "Employee ID missing");
    return;
  }

  if (!data.name?.trim()) {
    showNotification("error", "Please enter employee name");
    return;
  }

  if (!data.username?.trim()) {
    showNotification("error", "Please enter username");
    return;
  }

  if (!data.email?.trim()) {
    showNotification("error", "Please enter email");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("action", "updateEmployee");
    params.append("id", data.id);
    params.append("name", data.name);
    params.append("username", data.username);
    params.append("email", data.email);
    params.append("address", data.address || "");
    params.append("contactNumber", data.contactNumber || "");
    params.append("dailyRate", data.dailyRate || 0);

    console.log("📡 Sending update request...");

    const result = await apiRequest("backend/attendance_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    console.log("✅ Update successful:", result);

    closeModal("editEmployeeModal");
    showNotification("success", "Employee updated successfully");
    await loadEmployees();
  } catch (error) {
    console.error("❌ Edit Employee Error:", error);
    showNotification("error", error.message || "Failed to update employee");
  }
}

// ============================
// RESET PIN
// ============================
function openResetPin(employeeId) {
  const employee = employees.find((e) => e.employee_id == employeeId);
  if (!employee) {
    showNotification("error", "Employee not found");
    return;
  }

  selectedEmployee = employee;
  document.getElementById("resetPinEmployeeId").value = employee.employee_id;
  document.getElementById("resetPinEmployeeName").textContent =
    employee.full_name;
  document.getElementById("newPin").value = "";
  document.getElementById("confirmPin").value = "";

  showModal("resetPinModal");
}

async function handleResetPin(e) {
  e.preventDefault();

  const employeeId = document.getElementById("resetPinEmployeeId").value;
  const newPin = document.getElementById("newPin").value;
  const confirmPin = document.getElementById("confirmPin").value;

  if (!/^\d{4,6}$/.test(newPin)) {
    showNotification("error", "PIN must be 4-6 digits");
    return;
  }

  if (newPin !== confirmPin) {
    showNotification("error", "PINs do not match");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("action", "resetPin");
    params.append("employeeId", employeeId);
    params.append("newPin", newPin);

    const result = await apiRequest("backend/attendance_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    closeModal("resetPinModal");
    showNotification("success", "PIN reset successfully");
  } catch (error) {
    console.error("Reset PIN Error:", error);
    showNotification("error", error.message);
  }
}

// ============================
// TIME IN/OUT
// ============================
function openTimeInOut(employeeId) {
  selectedEmployee = employees.find((e) => e.employee_id == employeeId);
  if (!selectedEmployee) {
    console.error("Employee not found:", employeeId);
    showNotification("error", "Employee not found");
    return;
  }

  const title = document.getElementById("timeInOutTitle");
  const name = document.getElementById("timeInOutName");
  const button = document.getElementById("timeInOutButton");

  const isOnDuty = selectedEmployee.is_on_duty;

  if (isOnDuty) {
    if (title) title.textContent = "Clock Out";
    if (button) {
      button.textContent = "Clock Out";
      button.className =
        "flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-sm hover:shadow-lg transition-all";
    }
  } else {
    if (title) title.textContent = "Clock In";
    if (button) {
      button.textContent = "Clock In";
      button.className =
        "flex-1 btn-primary text-white py-3 rounded-lg font-medium text-sm hover:shadow-lg transition-all";
    }
  }

  if (name) name.textContent = selectedEmployee.full_name;
  showModal("timeInOutModal");

  setTimeout(() => {
    const pinInput = document.getElementById("pinInput");
    if (pinInput) pinInput.focus();
  }, 100);
}

async function processTimeInOut() {
  const pinInput = document.getElementById("pinInput");
  const errorEl = document.getElementById("pinError");

  if (!pinInput || !errorEl) return;

  const pin = pinInput.value;
  errorEl.textContent = "";
  errorEl.classList.add("hidden");

  if (!pin) {
    errorEl.textContent = "Enter PIN";
    errorEl.classList.remove("hidden");
    return;
  }

  if (!/^\d{4,6}$/.test(pin)) {
    errorEl.textContent = "PIN must be 4-6 digits";
    errorEl.classList.remove("hidden");
    return;
  }

  if (!selectedEmployee) {
    errorEl.textContent = "No employee selected";
    errorEl.classList.remove("hidden");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("employeeId", selectedEmployee.employee_id);
    params.append("pin", pin);

    const isOnDuty = selectedEmployee.is_on_duty;
    const action = isOnDuty ? "timeOut" : "timeIn";
    params.append("action", action);

    console.log("Time Action:", action);

    const result = await apiRequest("backend/attendance_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    closeModal("timeInOutModal");

    if (action === "timeOut" && result.summary) {
      const summary = result.summary;
      let message = `✅ Clocked out successfully!\n\n`;
      message += `Total Hours: ${summary.totalHours}h\n`;
      message += `Regular: ${summary.regularHours}h\n`;
      message += `Overtime: ${summary.overtimeHours}h\n`;
      message += `Daily Pay: ₱${summary.dailyPay.toFixed(2)}\n`;
      message += `Total: ₱${summary.totalPay.toFixed(2)}`;

      if (!summary.meetsMinimum) {
        message += "\n\n⚠️ Did not meet minimum hours (4h) - No pay";
      }

      showNotification("success", message);
    } else {
      showNotification(
        "success",
        result.message || "Action completed successfully"
      );
    }

    await loadEmployees();
  } catch (error) {
    errorEl.textContent = error.message || "Operation failed";
    errorEl.classList.remove("hidden");
    pinInput.value = "";
    pinInput.focus();
  }
}

// ============================
// RENDER FUNCTIONS
// ============================
function renderEmployeeList() {
  const container = document.getElementById("employeeList");
  if (!container) {
    console.error("❌ Employee list container not found!");
    return;
  }

  const filteredEmployees = filterEmployeesBySearch();

  const countEl = document.getElementById("employeeCount");
  if (countEl) {
    countEl.textContent = `${filteredEmployees.length} / ${employees.length}`;
  }

  if (filteredEmployees.length === 0) {
    container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-lg border border-slate-200">
                <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h3 class="text-lg font-semibold text-slate-900 mb-2">${
                  employees.length === 0
                    ? "No employees yet"
                    : "No results found"
                }</h3>
                <p class="text-sm text-slate-500">${
                  employees.length === 0
                    ? "Click 'Add Employee' to create your first employee"
                    : "Try adjusting your search terms"
                }</p>
            </div>
        `;
    return;
  }

  const canEdit =
    currentUser && ["admin", "owner", "manager"].includes(currentUser.role);

  container.innerHTML = filteredEmployees
    .map((emp) => {
      const isOnDuty = emp.is_on_duty;
      const safeName = emp.full_name.replace(/'/g, "\\'");

      return `
            <div class="bg-white rounded-lg border border-slate-200 p-6 card-hover">
                <div class="flex items-start justify-between gap-6">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-slate-900 text-lg">${
                                      emp.full_name
                                    }</h3>
                                    ${
                                      isOnDuty
                                        ? `<span class="badge badge-green">
                                            <span class="w-2 h-2 bg-green-600 rounded-full pulse-animation"></span>
                                            Currently On Duty
                                        </span>`
                                        : ""
                                    }
                                </div>
                                <p class="text-xs text-slate-500 mt-1">@${
                                  emp.username
                                }</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div class="stat-card">
                                <p class="text-xs text-slate-600 font-medium mb-1">Email</p>
                                <p class="text-sm text-slate-900 truncate font-medium">${
                                  emp.email
                                }</p>
                            </div>
                            <div class="stat-card">
                                <p class="text-xs text-slate-600 font-medium mb-1">Contact</p>
                                <p class="text-sm text-red-600 font-bold">${
                                  emp.contact_number || "—"
                                }</p>
                            </div>
                            <div class="stat-card">
                                <p class="text-xs text-slate-600 font-medium mb-1">Daily Rate</p>
                                <p class="text-sm text-green-600 font-bold">₱${parseFloat(
                                  emp.daily_rate || 0
                                ).toFixed(2)}</p>
                            </div>
                            <div class="stat-card">
                                <p class="text-xs text-slate-600 font-medium mb-1">Status</p>
                                <p class="text-sm font-bold ${
                                  isOnDuty ? "text-green-600" : "text-slate-400"
                                }">
                                    ${isOnDuty ? "On Duty" : "Off Duty"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2 flex-shrink-0">
                        <button onclick="openTimeInOut(${
                          emp.employee_id
                        })" class="icon-button ${
        isOnDuty
          ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          : "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
      } font-semibold text-sm flex items-center gap-1 px-4 py-2">
                            ${
                              isOnDuty
                                ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                Clock Out`
                                : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                </svg>
                                Clock In`
                            }
                        </button>
                        <button onclick="viewEmployee(${
                          emp.employee_id
                        })" class="icon-button bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        ${
                          canEdit
                            ? `
                        <button type="button" onclick="openEditEmployee(${emp.employee_id})" class="icon-button bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200" title="Edit Employee">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button type="button" onclick="openResetPin(${emp.employee_id})" class="icon-button bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200" title="Reset PIN">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                            </svg>
                        </button>
                        <button type="button" onclick="deleteEmployee(${emp.employee_id}, '${safeName}')" class="icon-button bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

function filterEmployees() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchTerm = searchInput.value.toLowerCase();
  } else {
    searchTerm = "";
  }
  renderEmployeeList();
}

function filterEmployeesBySearch() {
  if (!searchTerm) return employees;

  return employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchTerm) ||
      emp.username.toLowerCase().includes(searchTerm) ||
      emp.email.toLowerCase().includes(searchTerm) ||
      (emp.contact_number && emp.contact_number.includes(searchTerm))
  );
}

// ============================
// VIEW EMPLOYEE
// ============================
async function viewEmployee(employeeId) {
  try {
    const data = await apiRequest(
      `backend/attendance_api.php?action=getEmployee&id=${employeeId}`
    );

    if (data.success) {
      selectedEmployee = data.employee;
      renderEmployeeDetails(data);
      showModal("viewEmployeeModal");
    }
  } catch (error) {
    console.error("Error viewing employee:", error);
    showNotification("error", "Failed to load employee details");
  }
}

function renderEmployeeDetails(data) {
  const content = document.getElementById("viewEmployeeContent");
  if (!content) return;

  const employee = data.employee;
  const attendance = data.attendance || [];
  const summary = data.summary || {};
  const firstLetter = employee.full_name.charAt(0).toUpperCase();

  const groupedByDate = {};
  attendance.forEach((record) => {
    const date = record.date;
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(record);
  });

  content.innerHTML = `
    <div class="employee-details-minimal">
      <div class="employee-profile-minimal">
        <div class="employee-avatar-minimal">${firstLetter}</div>
        <h2 class="employee-name-minimal">${employee.full_name}</h2>
        <p class="employee-username-minimal">@${employee.username}</p>
      </div>

      <div class="info-grid-minimal">
        <div class="info-item-minimal">
          <span class="info-label-minimal">Email</span>
          <span class="info-value-minimal">${employee.email}</span>
        </div>
        <div class="info-item-minimal">
          <span class="info-label-minimal">Contact</span>
          <span class="info-value-minimal">${
            employee.contact_number || "N/A"
          }</span>
        </div>
        <div class="info-item-minimal">
          <span class="info-label-minimal">Address</span>
          <span class="info-value-minimal">${employee.address || "N/A"}</span>
        </div>
        <div class="info-item-minimal">
          <span class="info-label-minimal">Daily Rate</span>
          <span class="info-value-minimal daily-rate">₱${parseFloat(
            employee.daily_rate || 0
          ).toFixed(2)}</span>
        </div>
        <div class="info-item-minimal">
          <span class="info-label-minimal">Status</span>
          <span class="info-value-minimal">
            <span class="status-pill-minimal ${
              employee.status === "active"
                ? "status-completed-minimal"
                : "status-onduty-minimal"
            }">
              ${employee.status === "active" ? "Active" : "Inactive"}
            </span>
          </span>
        </div>
        <div class="info-item-minimal">
          <span class="info-label-minimal">Member Since</span>
          <span class="info-value-minimal">${formatDate(
            employee.created_at
          )}</span>
        </div>
      </div>

      <div class="attendance-summary-minimal">
        <div class="summary-stats-minimal">
          <div class="stat-card-minimal">
            <div class="stat-label-minimal">Total Sessions</div>
            <div class="stat-value-minimal">${attendance.length}</div>
          </div>
          <div class="stat-card-minimal">
            <div class="stat-label-minimal">Total Hours</div>
            <div class="stat-value-minimal">${(
              (summary.totalRegularHours || 0) +
              (summary.totalOvertimeHours || 0)
            ).toFixed(2)}h</div>
          </div>
          <div class="stat-card-minimal">
            <div class="stat-label-minimal">Total Earnings</div>
            <div class="stat-value-minimal earnings">₱${(
              summary.totalEarnings || 0
            ).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div class="date-filters-minimal">
        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
          <select id="periodSelect" class="date-input-minimal" style="flex: 1;" onchange="changePeriodFilter(${
            employee.employee_id
          })">
            <option value="thisMonth" selected>This Month</option>
            <option value="thisWeek">This Week</option>
            <option value="custom">Custom Range</option>
          </select>
          
          <div id="customDateRange" style="display: none; flex: 2; gap: 8px; align-items: center;">
            <input type="date" id="startDate" value="${
              data.dateRange.start
            }" class="date-input-minimal" style="flex: 1;">
            <span style="color: var(--text-light);">to</span>
            <input type="date" id="endDate" value="${
              data.dateRange.end
            }" class="date-input-minimal" style="flex: 1;">
          </div>
          
          <button onclick="refreshAttendance(${
            employee.employee_id
          })" class="filter-btn-minimal" id="filterButton">
            Apply Filter
          </button>
        </div>
      </div>

      <div class="attendance-records-section">
        ${
          attendance.length > 0
            ? Object.entries(groupedByDate)
                .map(
                  ([date, sessions]) => `
                <div class="date-group" style="margin-bottom: 2rem;">
                  <h4 class="date-header">
                    ${formatDate(date)}
                  </h4>
                  <table class="attendance-table-minimal" style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 0.75rem; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Session</th>
                        <th style="padding: 0.75rem; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Time In</th>
                        <th style="padding: 0.75rem; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Time Out</th>
                        <th style="padding: 0.75rem; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Hours</th>
                        <th style="padding: 0.75rem; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Pay</th>
                        <th style="padding: 0.75rem; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${sessions
                        .map(
                          (record, index) => `
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                          <td style="padding: 0.75rem; font-size: 12px;">Session ${
                            index + 1
                          }</td>
                          <td style="padding: 0.75rem; font-size: 12px; font-weight: 600;">${formatTime(
                            record.time_in
                          )}</td>
                          <td style="padding: 0.75rem; font-size: 12px; font-weight: 600;">${
                            record.time_out ? formatTime(record.time_out) : "—"
                          }</td>
                          <td style="padding: 0.75rem; font-size: 12px; color: #3b82f6; font-weight: 600;">${
                            record.total_hours
                              ? parseFloat(record.total_hours).toFixed(2) + "h"
                              : "—"
                          }</td>
                          <td style="padding: 0.75rem; font-size: 12px; color: ${
                            record.total_pay > 0 ? "#10b981" : "#9ca3af"
                          }; font-weight: 600;">
                            ₱${parseFloat(record.total_pay || 0).toFixed(2)}
                          </td>
                          <td style="padding: 0.75rem; font-size: 12px;">
                            <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 11px; font-weight: 600; background-color: ${
                              record.status === "completed"
                                ? "#d1fae5"
                                : "#dbeafe"
                            }; color: ${
                            record.status === "completed"
                              ? "#065f46"
                              : "#1e40af"
                          }">
                              ${
                                record.status === "completed"
                                  ? "Completed"
                                  : "On Duty"
                              }
                            </span>
                          </td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
                )
                .join("")
            : `<div class="empty-state-minimal" style="text-align: center; padding: 3rem 1rem; color: #6b7280;">
                <h3 class="empty-title-minimal" style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">No Attendance Records</h3>
                <p style="font-size: 0.875rem;">No attendance data found for the selected period</p>
              </div>`
        }
      </div>
    </div>
  `;

  calculateAndSetDateRange("thisMonth");
}

function changePeriodFilter(employeeId) {
  const periodSelect = document.getElementById("periodSelect");
  const customDateRange = document.getElementById("customDateRange");
  const filterButton = document.getElementById("filterButton");

  if (periodSelect.value === "custom") {
    customDateRange.style.display = "flex";
    filterButton.textContent = "Apply";
  } else {
    customDateRange.style.display = "none";
    filterButton.textContent = "Apply Filter";
    calculateAndSetDateRange(periodSelect.value);
    refreshAttendance(employeeId);
  }
}

function calculateAndSetDateRange(period) {
  const today = new Date();
  let startDate, endDate;

  switch (period) {
    case "thisWeek":
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(today);
      startDate.setDate(today.getDate() - diffToMonday);
      endDate = new Date(today);
      break;

    case "thisMonth":
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      break;
  }

  const formatDateString = (date) => {
    return date.toISOString().split("T")[0];
  };

  if (document.getElementById("startDate")) {
    document.getElementById("startDate").value = formatDateString(startDate);
    document.getElementById("endDate").value = formatDateString(endDate);
  }

  return { start: formatDateString(startDate), end: formatDateString(endDate) };
}

async function refreshAttendance(employeeId) {
  const periodSelect = document.getElementById("periodSelect");
  let startDate, endDate;

  if (periodSelect.value === "custom") {
    startDate = document.getElementById("startDate")?.value;
    endDate = document.getElementById("endDate")?.value;

    if (!startDate || !endDate) {
      showNotification(
        "error",
        "Please select both start and end dates for custom range"
      );
      return;
    }
  } else {
    const dateRange = calculateAndSetDateRange(periodSelect.value);
    startDate = dateRange.start;
    endDate = dateRange.end;
  }

  try {
    const data = await apiRequest(
      `backend/attendance_api.php?action=getEmployee&id=${employeeId}&startDate=${startDate}&endDate=${endDate}`
    );

    if (data.success) {
      selectedEmployee = data.employee;
      renderEmployeeDetails(data);
    }
  } catch (error) {
    console.error("Error refreshing attendance:", error);
    showNotification("error", "Failed to refresh attendance data");
  }
}

// ============================
// DELETE EMPLOYEE
// ============================
async function deleteEmployee(employeeId, employeeName) {
  if (
    !confirm(
      `Are you sure you want to delete "${employeeName}"?\n\nThis will mark the employee as inactive.`
    )
  ) {
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("action", "deleteEmployee");
    params.append("id", employeeId);

    const data = await apiRequest("backend/attendance_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    showNotification(
      "success",
      data.message || "Employee deleted successfully"
    );
    await loadEmployees();
  } catch (error) {
    showNotification("error", error.message);
  }
}

// ============================
// HELPER FUNCTIONS
// ============================
function updateCurrentTime() {
  currentTime = new Date();

  const dateTimeElement = document.getElementById("currentDateTime");
  if (dateTimeElement) {
    const dateTimeString = currentTime.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    dateTimeElement.textContent = dateTimeString;
  }

  const modalTimeElement = document.getElementById("modalCurrentTime");
  if (modalTimeElement) {
    modalTimeElement.textContent = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }
}

function showNotification(type, message) {
  const modal = document.getElementById("notificationModal");
  const icon = document.getElementById("notificationIcon");
  const title = document.getElementById("notificationTitle");
  const msg = document.getElementById("notificationMessage");

  if (!modal || !icon || !title || !msg) return;

  if (type === "success") {
    icon.className =
      "w-10 h-10 rounded-full flex items-center justify-center bg-green-100";
    icon.innerHTML =
      '<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    title.textContent = "Success";
  } else {
    icon.className =
      "w-10 h-10 rounded-full flex items-center justify-center bg-red-100";
    icon.innerHTML =
      '<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    title.textContent = "Error";
  }

  msg.textContent = message;
  showModal("notificationModal");
}

function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

function formatTime(timeString) {
  if (!timeString) return "—";
  try {
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return timeString;
  }
}

// ============================
// DOWNLOAD DTR
// ============================
async function downloadDTR() {
  if (!selectedEmployee) {
    showNotification("error", "No employee selected");
    return;
  }

  try {
    const periodSelect = document.getElementById("periodSelect");
    let startDate, endDate;

    if (periodSelect.value === "custom") {
      startDate = document.getElementById("startDate")?.value;
      endDate = document.getElementById("endDate")?.value;

      if (!startDate || !endDate) {
        showNotification(
          "error",
          "Please select both start and end dates for custom range"
        );
        return;
      }
    } else {
      const dateRange = calculateAndSetDateRange(periodSelect.value);
      startDate = dateRange.start;
      endDate = dateRange.end;
    }

    const data = await apiRequest(
      `backend/attendance_api.php?action=getEmployee&id=${selectedEmployee.employee_id}&startDate=${startDate}&endDate=${endDate}`
    );

    if (!data.success) throw new Error("Failed to get employee data");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica");
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, 210, 50, "F");

    doc.setFillColor(255, 255, 255);
    doc.circle(20, 25, 12, "F");

    try {
      doc.addImage("img/kslogo.png", "PNG", 10, 15, 20, 20);
    } catch (e) {
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("K", 20, 28, { align: "center" });
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DAILY TIME RECORD", 40, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Period: " +
        formatDateForPDF(startDate) +
        " - " +
        formatDateForPDF(endDate),
      40,
      30
    );
    doc.text(
      "Generated: " +
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      40,
      36
    );

    let y = 60;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 35, 3, 3, "F");

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(data.employee.full_name, 40, y + 12);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("@" + data.employee.username, 40, y + 18);
    doc.text(data.employee.email, 40, y + 24);
    doc.text(data.employee.contact_number || "N/A", 40, y + 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Daily Rate:", 155, y + 15);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    const dailyRateText =
      "P" + parseFloat(data.employee.daily_rate || 0).toFixed(2);
    doc.text(dailyRateText, 155, y + 22);

    y += 45;
    const totalHours = (
      (data.summary.totalRegularHours || 0) +
      (data.summary.totalOvertimeHours || 0)
    ).toFixed(2);
    const regularHours = (data.summary.totalRegularHours || 0).toFixed(2);
    const otHours = (data.summary.totalOvertimeHours || 0).toFixed(2);
    const totalEarnings = (data.summary.totalEarnings || 0).toFixed(2);

    const summaryData = [
      {
        label: "Total Sessions",
        value: data.attendance.length.toString(),
        color: [59, 130, 246],
      },
      {
        label: "Total Hours",
        value: totalHours + "h",
        color: [139, 92, 246],
      },
      {
        label: "Regular Hours",
        value: regularHours + "h",
        color: [34, 197, 94],
      },
      {
        label: "OT Hours",
        value: otHours + "h",
        color: [234, 179, 8],
      },
      {
        label: "Total Earnings",
        value: "P" + totalEarnings,
        color: [5, 150, 105],
      },
    ];

    const cardWidth = 36;
    const cardHeight = 20;
    const startX = 15;
    const gap = 2;

    summaryData.forEach((item, index) => {
      const x = startX + (cardWidth + gap) * index;

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "S");

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(item.label, x + cardWidth / 2, y + 7, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...item.color);
      doc.text(item.value, x + cardWidth / 2, y + 15, { align: "center" });
    });

    y += 30;

    if (data.attendance && data.attendance.length > 0) {
      const groupedByDate = {};
      data.attendance.forEach((record) => {
        const date = record.date;
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(record);
      });

      Object.entries(groupedByDate).forEach(([date, sessions], dateIndex) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(220, 38, 38);
        doc.roundedRect(15, y, 180, 8, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(formatDateForPDF(date), 20, y + 5.5);

        y += 10;

        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 8, "F");
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");

        const headers = [
          "Session",
          "Time In",
          "Time Out",
          "Hours",
          "Pay",
          "Status",
        ];
        const colWidths = [25, 30, 30, 25, 35, 25];
        let xPos = 18;

        headers.forEach((header, i) => {
          doc.text(header, xPos, y + 5.5);
          xPos += colWidths[i];
        });

        y += 8;

        sessions.forEach((record, index) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }

          if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(15, y, 180, 8, "F");
          }

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);

          xPos = 18;
          const timeInStr = formatTimeForPDF(record.time_in);
          const timeOutStr = record.time_out
            ? formatTimeForPDF(record.time_out)
            : "—";
          const hoursStr = record.total_hours
            ? parseFloat(record.total_hours).toFixed(2) + "h"
            : "—";
          const payStr = "P" + parseFloat(record.total_pay || 0).toFixed(2);
          const statusStr = record.status === "completed" ? "Done" : "Active";

          const rowData = [
            "#" + (index + 1),
            timeInStr,
            timeOutStr,
            hoursStr,
            payStr,
            statusStr,
          ];

          rowData.forEach((cell, i) => {
            if (i === 4) {
              doc.setFont("helvetica", "bold");
              doc.setTextColor(
                record.total_pay > 0 ? 5 : 156,
                record.total_pay > 0 ? 150 : 163,
                record.total_pay > 0 ? 105 : 175
              );
            } else if (i === 5) {
              doc.setFont("helvetica", "bold");
              if (record.status === "completed") {
                doc.setTextColor(5, 150, 105);
              } else {
                doc.setTextColor(59, 130, 246);
              }
            } else {
              doc.setFont("helvetica", "normal");
              doc.setTextColor(51, 65, 85);
            }

            doc.text(cell, xPos, y + 5.5);
            xPos += colWidths[i];
          });

          y += 8;
        });

        y += 5;
      });
    } else {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, y, 180, 30, 3, 3, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text("No attendance records found for this period", 105, y + 18, {
        align: "center",
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 285, 195, 285);

      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text("K-STREET Attendance System", 15, 290);
      doc.text(
        "Page " + i.toString() + " of " + pageCount.toString(),
        195,
        290,
        { align: "right" }
      );
    }

    const fileName =
      "DTR_" +
      data.employee.full_name.replace(/\s+/g, "_") +
      "_" +
      new Date().toISOString().split("T")[0] +
      ".pdf";
    doc.save(fileName);

    showNotification("success", "DTR downloaded successfully");
  } catch (error) {
    console.error("PDF generation error:", error);
    showNotification("error", "Failed to generate PDF: " + error.message);
  }
}

function formatDateForPDF(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatTimeForPDF(timeString) {
  if (!timeString) return "—";
  try {
    const date = new Date(`1970-01-01T${timeString}`);
    return date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "");
  } catch {
    return timeString;
  }
}

// ============================
// GLOBAL EXPORTS
// ============================
window.showAddEmployeeModal = showAddEmployeeModal;
window.showModal = showModal;
window.closeModal = closeModal;
window.openTimeInOut = openTimeInOut;
window.processTimeInOut = processTimeInOut;
window.viewEmployee = viewEmployee;
window.deleteEmployee = deleteEmployee;
window.refreshAttendance = refreshAttendance;
window.downloadDTR = downloadDTR;
window.loadEmployees = loadEmployees;
window.changePeriodFilter = changePeriodFilter;
window.calculateAndSetDateRange = calculateAndSetDateRange;
window.openEditEmployee = openEditEmployee;
window.handleEditEmployee = handleEditEmployee;
window.openResetPin = openResetPin;
window.handleResetPin = handleResetPin;
window.filterEmployees = filterEmployees;
