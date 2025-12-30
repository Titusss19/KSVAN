// GLOBAL VARIABLES
let employees = [];
let selectedEmployee = null;
let selectedAttendanceLog = null;
let currentTime = new Date();
let searchTerm = "";
let currentAttendancePage = 1;
let attendancePerPage = 4;
let cachedEmployeeData = null;
let systemSettings = {
  minHoursToPay: 4,
  maxRegularHours: 8,
};

// INITIALIZATION
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Attendance System Initializing...");

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

  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  const addEmployeeForm = document.getElementById("addEmployeeForm");
  if (addEmployeeForm) {
    addEmployeeForm.addEventListener("submit", handleAddEmployee);
  }

  const editEmployeeForm = document.getElementById("editEmployeeForm");
  if (editEmployeeForm) {
    editEmployeeForm.addEventListener("submit", handleEditEmployee);
  }

  const editTimeForm = document.getElementById("editTimeForm");
  if (editTimeForm) {
    editTimeForm.addEventListener("submit", handleEditTime);
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterEmployees);
  }

  const pinInput = document.getElementById("pinInput");
  if (pinInput) {
    pinInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        processTimeInOut();
      }
    });
  }

  loadSystemSettings();
  loadEmployees();

  console.log("✅ Attendance System Ready!");
});

// MODAL FUNCTIONS
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      const firstInput = modal.querySelector('input:not([type="hidden"])');
      if (firstInput) firstInput.focus();
    }, 100);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
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

  if (modalId === "viewEmployeeModal") {
    cachedEmployeeData = null;
    currentAttendancePage = 1;
  }
}

function showAddEmployeeModal() {
  const form = document.getElementById("addEmployeeForm");
  if (form) form.reset();
  showModal("addEmployeeModal");
}

// MODAL EVENT LISTENERS
document.addEventListener("click", function (event) {
  if (event.target.classList && event.target.classList.contains("modal")) {
    event.target.classList.remove("show");
    document.body.style.overflow = "auto";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".modal-content").forEach((modalContent) => {
    modalContent.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  });
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const openModals = document.querySelectorAll(".modal.show");
    openModals.forEach((modal) => {
      modal.classList.remove("show");
      document.body.style.overflow = "auto";
    });
  }
});

// API FUNCTIONS
async function apiRequest(endpoint, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    options.signal = controller.signal;

    const response = await fetch(endpoint, options);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
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

// LOAD FUNCTIONS
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
    }
  } catch (error) {
    console.error("❌ Failed to load system settings:", error);
  }
}

async function loadEmployees() {
  try {
    const data = await apiRequest(
      "backend/attendance_api.php?action=getEmployees"
    );
    employees = data.employees || [];
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

// ADD EMPLOYEE
async function handleAddEmployee(e) {
  e.preventDefault();

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
    showNotification(
      "success",
      result.message || `${data.name} added successfully`
    );
    form.reset();
    await loadEmployees();
  } catch (error) {
    console.error("Add Employee Error:", error);
    showNotification("error", error.message);
  }
}

// EDIT EMPLOYEE
function openEditEmployee(employeeId) {
  const employee = employees.find((e) => e.employee_id == employeeId);

  if (!employee) {
    showNotification("error", "Employee not found in your branch");
    return;
  }

  selectedEmployee = employee;

  const editForm = document.getElementById("editEmployeeForm");
  if (!editForm) {
    console.error("❌ Edit form not found in DOM");
    return;
  }

  document.getElementById("editEmployeeId").value = employee.employee_id;
  document.getElementById("editName").value = employee.full_name || "";
  document.getElementById("editUsername").value = employee.username || "";
  document.getElementById("editEmail").value = employee.email || "";
  document.getElementById("editAddress").value = employee.address || "";
  document.getElementById("editContactNumber").value =
    employee.contact_number || "";
  document.getElementById("editDailyRate").value = employee.daily_rate || 0;

  showModal("editEmployeeModal");
}

async function handleEditEmployee(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

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

    const result = await apiRequest("backend/attendance_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    closeModal("editEmployeeModal");
    showNotification("success", "Employee updated successfully");
    await loadEmployees();
  } catch (error) {
    console.error("❌ Edit Employee Error:", error);
    showNotification("error", error.message || "Failed to update employee");
  }
}

// EDIT ATTENDANCE TIME
async function openEditTime(logId, employeeId) {
  try {
    const data = await apiRequest(
      `backend/attendance_api.php?action=getAttendanceLog&logId=${logId}`
    );

    if (data.success && data.log) {
      selectedAttendanceLog = data.log;

      document.getElementById("editTimeLogId").value = data.log.logId;
      document.getElementById("editTimeEmployeeId").value = data.log.employeeId;
      document.getElementById("editTimeDate").value =
        data.log.date || getCurrentDate();
      document.getElementById("editTimeIn").value = data.log.timeIn || "08:00";
      document.getElementById("editTimeOut").value = data.log.timeOut || "";
      document.getElementById("editRegularHours").value =
        data.log.regularHours || 0;
      document.getElementById("editOvertimeHours").value =
        data.log.overtimeHours || 0;
      document.getElementById("editDailyPay").value = data.log.dailyPay || 0;
      document.getElementById("editOvertimePay").value =
        data.log.overtimePay || 0;

      showModal("editTimeModal");
    } else {
      throw new Error(data.error || "Failed to load attendance log");
    }
  } catch (error) {
    console.error("❌ Error loading attendance log:", error);
    showNotification(
      "error",
      "Failed to load attendance data: " + error.message
    );
  }
}

async function handleEditTime(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (!data.logId || !data.employeeId || !data.date || !data.timeIn) {
    showNotification("error", "Date and Time In are required");
    return;
  }

  if (data.timeOut && data.timeOut <= data.timeIn) {
    showNotification("error", "Time Out must be after Time In");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("action", "updateAttendanceRecord");
    params.append("logId", data.logId);
    params.append("employeeId", data.employeeId);
    params.append("date", data.date);
    params.append("timeIn", data.timeIn);
    params.append("timeOut", data.timeOut || "");
    params.append("regularHours", data.regularHours || 0);
    params.append("overtimeHours", data.overtimeHours || 0);
    params.append("dailyPay", data.dailyPay || 0);
    params.append("overtimePay", data.overtimePay || 0);

    const result = await apiRequest("backend/attendance_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    closeModal("editTimeModal");

    if (result.summary) {
      const summary = result.summary;
      let message = `✅ Attendance record updated!\n\n`;
      message += `Date: ${summary.date}\n`;
      message += `Time In: ${summary.timeIn}\n`;
      if (summary.timeOut) {
        message += `Time Out: ${summary.timeOut}\n`;
      }
      message += `Total Hours: ${summary.totalHours}h\n`;
      message += `Regular: ${summary.regularHours}h\n`;
      message += `Overtime: ${summary.overtimeHours}h\n`;
      message += `Daily Pay: ₱${summary.dailyPay.toFixed(2)}\n`;
      message += `Overtime Pay: ₱${summary.overtimePay.toFixed(2)}\n`;
      message += `Total Pay: ₱${summary.totalPay.toFixed(2)}`;

      showNotification("success", message);
    } else {
      showNotification("success", "Attendance record updated successfully");
    }

    if (selectedEmployee) {
      await viewEmployee(selectedEmployee.employee_id);
    }
  } catch (error) {
    console.error("❌ Edit Time Error:", error);
    showNotification("error", error.message);
  }
}

// RESET PIN
function openResetPin(employeeId) {
  const employee = employees.find((e) => e.employee_id == employeeId);
  if (!employee) {
    showNotification("error", "Employee not found in your branch");
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

// TIME IN/OUT
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

// DTR DOWNLOAD FUNCTION
async function downloadDTR(employeeId) {
  try {
    console.log("Downloading DTR for employee ID:", employeeId);

    if (!employeeId || employeeId === "undefined") {
      throw new Error(
        "Employee ID is missing. Please select an employee first."
      );
    }

    if (isNaN(employeeId) || employeeId <= 0) {
      throw new Error(`Invalid employee ID: ${employeeId}`);
    }

    if (typeof html2canvas === "undefined" || typeof jspdf === "undefined") {
      showNotification(
        "error",
        "PDF libraries not loaded. Please refresh the page."
      );
      return;
    }

    showNotification("info", "Generating DTR PDF... Please wait.");

    const data = await apiRequest(
      `backend/attendance_api.php?action=getEmployee&id=${employeeId}`
    );

    if (!data.success || !data.employee) {
      throw new Error("Failed to load employee data");
    }

    const employee = data.employee;
    const attendance = data.attendance || [];

    if (attendance.length === 0) {
      showNotification(
        "warning",
        "No attendance records found for this employee."
      );
      return;
    }

    const totalWorkDays = attendance.filter(
      (a) => parseFloat(a.total_hours) >= 4
    ).length;
    const totalHours = attendance.reduce(
      (sum, a) => sum + (parseFloat(a.total_hours) || 0),
      0
    );
    const totalRegularHours = attendance.reduce(
      (sum, a) => sum + (parseFloat(a.regular_hours) || 0),
      0
    );
    const totalOvertime = attendance.reduce(
      (sum, a) => sum + (parseFloat(a.ot_hours) || 0),
      0
    );
    const totalDailyPay = attendance.reduce(
      (sum, a) => sum + (parseFloat(a.daily_pay) || 0),
      0
    );
    const totalOvertimePay = attendance.reduce(
      (sum, a) => sum + (parseFloat(a.ot_pay) || 0),
      0
    );
    const totalPay = totalDailyPay + totalOvertimePay;

    const dates = attendance.map((a) => new Date(a.date));
    const startDate =
      dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
    const endDate =
      dates.length > 0 ? new Date(Math.max(...dates)) : new Date();

    const periodText = `${startDate.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} to ${endDate.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;

const maxRecords = 15;
const pageRecords = attendance.slice(0, maxRecords); // First 15 records lang

const { jsPDF } = jspdf;
const pdf = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4",
});

// Single page lang, no loop
const dtrContent = document.createElement("div");
dtrContent.style.cssText = `
  width: 800px;
  padding: 30px;
  background: white;
  font-family: 'Arial', sans-serif;
  position: fixed;
  left: -9999px;
  top: 0;
`;

dtrContent.innerHTML = `
  <div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #dc2626; padding-bottom: 15px;">
    <h1 style="margin: 0; color: #dc2626; font-size: 24px; font-weight: bold; letter-spacing: 2px;">K-STREET ATTENDANCE SYSTEM</h1>
    <h2 style="margin: 8px 0 0 0; color: #64748b; font-size: 16px; font-weight: normal;">DAILY TIME RECORD (DTR)</h2>
    <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">Period: ${periodText}</p>
  </div>

  <div style="background: #f8fafc; border-left: 4px solid #dc2626; padding: 15px 20px; margin-bottom: 20px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 5px 0; width: 25%;"><strong style="color: #475569;">Employee Name:</strong></td>
        <td style="padding: 5px 0; color: #1e293b;">${employee.full_name}</td>
        <td style="padding: 5px 0; width: 20%;"><strong style="color: #475569;">Employee ID:</strong></td>
        <td style="padding: 5px 0; color: #1e293b;">${employee.employee_id}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0;"><strong style="color: #475569;">Email:</strong></td>
        <td style="padding: 5px 0; color: #1e293b;">${employee.email}</td>
        <td style="padding: 5px 0;"><strong style="color: #475569;">Contact:</strong></td>
        <td style="padding: 5px 0; color: #1e293b;">${
          employee.contact_number || "N/A"
        }</td>
      </tr>
      <tr>
        <td style="padding: 5px 0;"><strong style="color: #475569;">Branch:</strong></td>
        <td style="padding: 5px 0; color: #1e293b;">${(
          employee.branch || "main"
        ).toUpperCase()}</td>
        <td style="padding: 5px 0;"><strong style="color: #475569;">Daily Rate:</strong></td>
        <td style="padding: 5px 0; color: #059669; font-weight: bold;">₱${parseFloat(
          employee.daily_rate || 0
        ).toFixed(2)}</td>
      </tr>
    </table>
  </div>

  <div style="margin-bottom: 15px;">
    <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Attendance Records (Latest 15 Records)</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
      <thead>
        <tr style="background: #dc2626; color: white;">
          <th style="padding: 8px; text-align: left; border: 1px solid #b91c1c;">Date</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #b91c1c;">Time In</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #b91c1c;">Time Out</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #b91c1c;">Total Hrs</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #b91c1c;">OT Hrs</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #b91c1c;">Daily Pay</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #b91c1c;">Total Pay</th>
        </tr>
      </thead>
      <tbody>
        ${
          pageRecords.length > 0
            ? pageRecords
                .map((record, index) => {
                  const totalHrs = parseFloat(record.total_hours || 0);
                  const bgColor = index % 2 === 0 ? "#f8fafc" : "white";
                  return `
            <tr style="background: ${bgColor};">
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; white-space: nowrap;">${formatDateShort(
                record.date
              )}</td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${
                record.time_in ? formatTime(record.time_in) : "—"
              }</td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${
                record.time_out ? formatTime(record.time_out) : "—"
              }</td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${
                totalHrs >= 4 ? "#059669" : "#dc2626"
              };">${totalHrs.toFixed(2)}h</td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; color: #d97706;">${parseFloat(
                record.ot_hours || 0
              ).toFixed(2)}h</td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; color: #059669;">₱${parseFloat(
                record.daily_pay || 0
              ).toFixed(2)}</td>
              <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #059669;">₱${parseFloat(
                record.total_pay || 0
              ).toFixed(2)}</td>
            </tr>
          `;
                })
                .join("")
            : `<tr><td colspan="7" style="padding: 20px; text-align: center; color: #64748b; border: 1px solid #e2e8f0;">No records found</td></tr>`
        }
      </tbody>
    </table>
  </div>

  <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #059669; border-radius: 8px; padding: 15px; margin-top: 20px;">
    <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Summary (Latest 15 Records)</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px; background: white; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #475569; font-size: 12px;">Days Worked (≥4h):</span>
            <strong style="color: #2563eb; font-size: 18px;">${totalWorkDays} days</strong>
          </div>
        </td>
        <td style="width: 10px;"></td>
        <td style="padding: 8px; background: white; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #475569; font-size: 12px;">Total Hours:</span>
            <strong style="color: #059669; font-size: 18px;">${totalHours.toFixed(
              2
            )}h</strong>
          </div>
        </td>
      </tr>
      <tr style="height: 8px;"></tr>
      <tr>
        <td style="padding: 8px; background: white; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #475569; font-size: 12px;">Regular Hours:</span>
            <strong style="color: #059669; font-size: 18px;">${totalRegularHours.toFixed(
              2
            )}h</strong>
          </div>
        </td>
        <td style="width: 10px;"></td>
        <td style="padding: 8px; background: white; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #475569; font-size: 12px;">Overtime Hours:</span>
            <strong style="color: #d97706; font-size: 18px;">${totalOvertime.toFixed(
              2
            )}h</strong>
          </div>
        </td>
      </tr>
      <tr style="height: 8px;"></tr>
      <tr>
        <td colspan="3" style="padding: 12px; background: white; border-radius: 4px; border: 2px solid #059669;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #1e293b; font-size: 16px; font-weight: bold;">TOTAL EARNINGS:</span>
            <strong style="color: #059669; font-size: 24px;">₱${totalPay.toFixed(
              2
            )}</strong>
          </div>
        </td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="margin: 0; color: #94a3b8; font-size: 9px;">This is a computer-generated document. No signature required.</p>
    <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 9px;">Generated on ${new Date().toLocaleString(
      "en-PH"
    )}</p>
  </div>
`;

document.body.appendChild(dtrContent);

const canvas = await html2canvas(dtrContent, {
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: "#ffffff",
});

document.body.removeChild(dtrContent);

const imgWidth = 210;
const imgHeight = (canvas.height * imgWidth) / canvas.width;
const imgData = canvas.toDataURL("image/png");

pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

// End of PDF generation - no more pages

const fileName = `DTR_${employee.full_name.replace(/\s+/g, "_")}_${new Date()
  .toISOString()
  .slice(0, 10)}.pdf`;
pdf.save(fileName);

showNotification("success", `DTR downloaded successfully! (15 records)`);
  } catch (error) {
    console.error("❌ DTR Download Error:", error);
    showNotification("error", "Failed to generate DTR: " + error.message);
  }
}

async function downloadCurrentEmployeeDTR() {
  try {
    if (!cachedEmployeeData || !cachedEmployeeData.employee) {
      showNotification(
        "error",
        "No employee data available. Please refresh the page or select an employee first."
      );
      return;
    }

    const employeeId = cachedEmployeeData.employee.employee_id;
    if (!employeeId || employeeId <= 0) {
      showNotification("error", "Invalid employee ID");
      return;
    }

    console.log("Downloading DTR for employee ID:", employeeId);
    await downloadDTR(employeeId);
  } catch (error) {
    console.error("❌ Error in downloadCurrentEmployeeDTR:", error);
    showNotification("error", "Failed to download DTR: " + error.message);
  }
}

async function downloadEmployeeDTR(employeeId, employeeName) {
  try {
    if (!employeeId || employeeId <= 0) {
      showNotification("error", "Invalid employee ID for " + employeeName);
      return;
    }

    console.log("Downloading DTR for:", employeeName, "ID:", employeeId);

    showNotification(
      "info",
      `Generating DTR for ${employeeName}... Please wait.`
    );

    await downloadDTR(employeeId);
  } catch (error) {
    console.error("❌ Error downloading DTR:", error);
    showNotification("error", "Failed to generate DTR: " + error.message);
  }
}

// RENDER EMPLOYEE LIST
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
            ? "No employees in your branch yet"
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
      const branchName = emp.branch || "main";

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
                    <span class="badge badge-blue">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      ${branchName.toUpperCase()}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1">@${emp.username}</p>
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
              <button onclick="downloadEmployeeDTR(${
                emp.employee_id
              }, '${safeName}')" 
                      class="icon-button bg-red-50 text-red-600 hover:bg-red-100 border-red-200" 
                      title="Download DTR">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
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

// VIEW EMPLOYEE WITH PAGINATION
async function viewEmployee(employeeId) {
  try {
    const data = await apiRequest(
      `backend/attendance_api.php?action=getEmployee&id=${employeeId}`
    );

    if (data.success && data.employee) {
      selectedEmployee = data.employee;
      cachedEmployeeData = data;
      currentAttendancePage = 1;
      renderEmployeeDetails(cachedEmployeeData);
      showModal("viewEmployeeModal");
    } else {
      throw new Error(data.error || "Employee not found");
    }
  } catch (error) {
    console.error("❌ Error viewing employee:", error);
    showNotification(
      "error",
      "Failed to load employee details: " + error.message
    );
  }
}

function renderEmployeeDetails(data) {
  const content = document.getElementById("viewEmployeeContent");
  if (!content) {
    console.error("❌ viewEmployeeContent element not found!");
    return;
  }

  const employee = data.employee;
  const attendance = data.attendance || [];
  const firstLetter = employee.full_name.charAt(0).toUpperCase();
  const branchName = employee.branch || "main";

  window.currentViewingEmployeeId = employee.employee_id;

  const totalWorkDays = attendance.filter((a) => a.total_hours >= 4).length;
  const totalHours = attendance.reduce(
    (sum, a) => sum + (parseFloat(a.total_hours) || 0),
    0
  );
  const totalOvertime = attendance.reduce(
    (sum, a) => sum + (parseFloat(a.ot_hours) || 0),
    0
  );
  const totalPay = attendance.reduce(
    (sum, a) => sum + (parseFloat(a.total_pay) || 0),
    0
  );

  const totalPages = Math.ceil(attendance.length / attendancePerPage);
  const startIndex = (currentAttendancePage - 1) * attendancePerPage;
  const endIndex = startIndex + attendancePerPage;
  const paginatedAttendance = attendance.slice(startIndex, endIndex);

  let attendanceRows = "";
  if (paginatedAttendance.length > 0) {
    paginatedAttendance.forEach((record, index) => {
      const timeIn = record.time_in ? formatTime(record.time_in) : "—";
      const timeOut = record.time_out ? formatTime(record.time_out) : "—";
      const totalHours = parseFloat(record.total_hours || 0);
      const overtimeHours = parseFloat(record.ot_hours || 0);
      const dailyPay = parseFloat(record.daily_pay || 0);
      const recordTotalPay = parseFloat(record.total_pay || 0);

      const canEdit =
        currentUser && ["admin", "owner", "manager"].includes(currentUser.role);
      const editButton = canEdit
        ? `
        <td class="py-3 px-4 text-sm whitespace-nowrap">
          <button onclick="openEditTime(${record.log_id}, ${employee.employee_id})" 
                  class="text-indigo-600 hover:text-indigo-900 text-xs font-medium px-2 py-1 hover:bg-indigo-50 rounded transition-colors"
                  title="Edit Time Record">
            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit
          </button>
        </td>
      `
        : "";

      attendanceRows += `
        <tr class="border-t border-slate-100 hover:bg-slate-50">
          <td class="py-3 px-4 text-sm whitespace-nowrap">${formatDate(
            record.date
          )}</td>
          <td class="py-3 px-4 text-sm whitespace-nowrap">${timeIn}</td>
          <td class="py-3 px-4 text-sm whitespace-nowrap">${timeOut}</td>
          <td class="py-3 px-4 text-sm font-medium ${
            totalHours >= 4 ? "text-green-600" : "text-red-600"
          } whitespace-nowrap">
            ${totalHours.toFixed(2)}h
          </td>
          <td class="py-3 px-4 text-sm text-amber-600 whitespace-nowrap">${overtimeHours.toFixed(
            2
          )}h</td>
          <td class="py-3 px-4 text-sm text-green-600 font-semibold whitespace-nowrap">₱${dailyPay.toFixed(
            2
          )}</td>
          <td class="py-3 px-4 text-sm text-green-600 font-bold whitespace-nowrap">₱${recordTotalPay.toFixed(
            2
          )}</td>
          ${editButton}
        </tr>
      `;
    });
  } else {
    attendanceRows = `
      <tr>
        <td colspan="8" class="py-8 text-center text-slate-400">
          No attendance records found
        </td>
      </tr>
    `;
  }

  let paginationHTML = "";
  if (totalPages > 1) {
    paginationHTML = `
      <div class="flex items-center justify-center gap-2 mt-4">
        <button onclick="changeAttendancePage(${currentAttendancePage - 1})" 
                ${currentAttendancePage === 1 ? "disabled" : ""}
                class="px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  currentAttendancePage === 1
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }">
          ← Previous
        </button>
        
        <div class="flex items-center gap-1">
          ${Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentAttendancePage <= 3) {
              pageNum = i + 1;
            } else if (currentAttendancePage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentAttendancePage - 2 + i;
            }

            if (pageNum < 1 || pageNum > totalPages) return "";

            return `
              <button onclick="changeAttendancePage(${pageNum})" 
                      class="w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentAttendancePage === pageNum
                          ? "bg-red-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }">
                ${pageNum}
              </button>
            `;
          }).join("")}
        </div>
        
        <button onclick="changeAttendancePage(${currentAttendancePage + 1})" 
                ${currentAttendancePage === totalPages ? "disabled" : ""}
                class="px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  currentAttendancePage === totalPages
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }">
          Next →
        </button>
      </div>
    `;
  }

  const canEdit =
    currentUser && ["admin", "owner", "manager"].includes(currentUser.role);
  const tableHeaders = canEdit
    ? `
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Date</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Time In</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Time Out</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Total Hours</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Overtime</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Daily Pay</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Total Pay</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Actions</th>
  `
    : `
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Date</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Time In</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Time Out</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Total Hours</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Overtime</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Daily Pay</th>
    <th class="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Total Pay</th>
  `;

  content.innerHTML = `
    <div class="modal-scroll-container space-y-6 pb-6">
      <div class="sticky top-0 z-10 bg-white pb-4 border-b border-slate-200">
        <div class="flex items-center gap-4 p-4">
          <div class="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
            ${firstLetter}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold text-slate-900 truncate">${
              employee.full_name
            }</h2>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-sm text-slate-600 truncate">@${
                employee.username
              }</span>
              <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full whitespace-nowrap">
                ${branchName.toUpperCase()}
              </span>
              <span class="px-2 py-0.5 ${
                employee.is_on_duty
                  ? "bg-green-100 text-green-800"
                  : "bg-slate-100 text-slate-800"
              } text-xs font-semibold rounded-full whitespace-nowrap">
                ${employee.is_on_duty ? "ON DUTY" : "OFF DUTY"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div class="p-3 bg-white border border-slate-200 rounded-lg">
          <p class="text-xs text-slate-500 mb-1 truncate">Email</p>
          <p class="text-sm font-medium text-slate-900 truncate" title="${
            employee.email
          }">${employee.email}</p>
        </div>
        <div class="p-3 bg-white border border-slate-200 rounded-lg">
          <p class="text-xs text-slate-500 mb-1">Contact</p>
          <p class="text-sm font-medium text-red-600 truncate">${
            employee.contact_number || "N/A"
          }</p>
        </div>
        <div class="p-3 bg-white border border-slate-200 rounded-lg">
          <p class="text-xs text-slate-500 mb-1">Address</p>
          <p class="text-sm font-medium text-slate-900 truncate" title="${
            employee.address || "N/A"
          }">${employee.address || "N/A"}</p>
        </div>
        <div class="p-3 bg-white border border-slate-200 rounded-lg">
          <p class="text-xs text-slate-500 mb-1">Daily Rate</p>
          <p class="text-lg font-bold text-green-600">₱${parseFloat(
            employee.daily_rate || 0
          ).toFixed(2)}</p>
        </div>
        <div class="p-3 bg-white border border-slate-200 rounded-lg">
          <p class="text-xs text-slate-500 mb-1">Member Since</p>
          <p class="text-sm font-medium text-slate-900 whitespace-nowrap">${formatDate(
            employee.created_at
          )}</p>
        </div>
        <div class="p-3 bg-white border border-slate-200 rounded-lg">
          <p class="text-xs text-slate-500 mb-1">PIN Status</p>
          <p class="text-sm font-medium ${
            employee.pin ? "text-green-600" : "text-red-600"
          }">
            ${employee.pin ? "PIN Set" : "No PIN"}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <p class="text-xs text-blue-700 mb-1">Total Work Days</p>
          <p class="text-xl font-bold text-blue-800">${totalWorkDays}</p>
        </div>
        <div class="p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
          <p class="text-xs text-green-700 mb-1">Total Hours</p>
          <p class="text-xl font-bold text-green-800">${totalHours.toFixed(
            2
          )}h</p>
        </div>
        <div class="p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg">
          <p class="text-xs text-amber-700 mb-1">Total Overtime</p>
          <p class="text-xl font-bold text-amber-800">${totalOvertime.toFixed(
            2
          )}h</p>
        </div>
        <div class="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
          <p class="text-xs text-emerald-700 mb-1">Total Pay</p>
          <p class="text-xl font-bold text-emerald-800">₱${totalPay.toFixed(
            2
          )}</p>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div class="p-4 border-b border-slate-200 bg-slate-50">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-slate-900">Attendance Records</h3>
              <p class="text-sm text-slate-500">
                Showing ${startIndex + 1}-${Math.min(
    endIndex,
    attendance.length
  )} of ${attendance.length} records
                ${
                  totalPages > 1
                    ? `(Page ${currentAttendancePage} of ${totalPages})`
                    : ""
                }
              </p>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <span class="text-xs text-slate-600">Show:</span>
                <select onchange="changeAttendancePerPage(this.value)" class="text-xs border border-slate-300 rounded px-2 py-1">
                  <option value="4" ${
                    attendancePerPage === 4 ? "selected" : ""
                  }>4</option>
                  <option value="10" ${
                    attendancePerPage === 10 ? "selected" : ""
                  }>10</option>
                  <option value="20" ${
                    attendancePerPage === 20 ? "selected" : ""
                  }>20</option>
                  <option value="50" ${
                    attendancePerPage === 50 ? "selected" : ""
                  }>50</option>
                </select>
              </div>
              ${
                attendance.length > 0
                  ? `<button onclick="downloadCurrentEmployeeDTR()" type="button"
                      class="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download DTR
                    </button>
                    <button onclick="openPayoutModal(${
                      employee.employee_id
                    })" type="button"
                      class="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Pay Out
                    </button>`
                  : ""
              }
            </div>
          </div>
        </div>
        
        <div class="attendance-table-container">
          <table class="w-full">
            <thead class="bg-slate-50 sticky top-0">
              <tr>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${attendanceRows}
            </tbody>
          </table>
        </div>
        
        ${
          attendance.length > 0 && totalPages > 1
            ? `
          <div class="p-4 border-t border-slate-200 bg-slate-50">
            ${paginationHTML}
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

// PAGINATION FUNCTIONS
function changeAttendancePage(page) {
  if (!cachedEmployeeData) {
    console.error("No cached employee data available");
    return;
  }

  const totalPages = Math.ceil(
    (cachedEmployeeData.attendance || []).length / attendancePerPage
  );

  if (page >= 1 && page <= totalPages && page !== currentAttendancePage) {
    currentAttendancePage = page;
    renderEmployeeDetails(cachedEmployeeData);
  }
}

function changeAttendancePerPage(perPage) {
  const newPerPage = parseInt(perPage);
  if (newPerPage && newPerPage > 0 && newPerPage !== attendancePerPage) {
    attendancePerPage = newPerPage;
    currentAttendancePage = 1;

    if (cachedEmployeeData) {
      renderEmployeeDetails(cachedEmployeeData);
    }
  }
}

// DELETE EMPLOYEE
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

// PAY OUT FUNCTIONS
function openPayoutModal(employeeId) {
  const employee = employees.find((e) => e.employee_id == employeeId);
  if (!employee) {
    showNotification("error", "Employee not found");
    return;
  }

  const totalPay = cachedEmployeeData?.summary?.totalEarnings || 0;

  if (totalPay <= 0) {
    showNotification("error", "No earnings to pay out");
    return;
  }

  document.getElementById("payoutEmployeeId").value = employeeId;
  document.getElementById("payoutEmployeeName").textContent = employee.full_name;
  document.getElementById("payoutAmount").textContent = `₱${totalPay.toFixed(2)}`;
  document.getElementById("managerPin").value = "";

  showModal("payoutModal");
}

async function handlePayout(e) {
  e.preventDefault();

  const employeeId = document.getElementById("payoutEmployeeId").value;
  const managerPin = document.getElementById("managerPin").value;

  if (!managerPin || !/^\d{4,6}$/.test(managerPin)) {
    showNotification("error", "Invalid manager PIN");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("action", "processPayout");
    params.append("employeeId", employeeId);
    params.append("managerPin", managerPin);

    const result = await apiRequest("backend/attendance_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    closeModal("payoutModal");

    if (result.summary) {
      const summary = result.summary;
      let message = `✅ Payout Successful!\n\n`;
      message += `Employee: ${summary.employeeName}\n`;
      message += `Amount Paid: ₱${summary.amountPaid.toFixed(2)}\n`;
      message += `Records Reset: ${summary.recordsReset}\n`;
      message += `Processed by: ${summary.processedBy}`;

      showNotification("success", message);
    } else {
      showNotification("success", result.message || "Payout processed successfully");
    }

    if (selectedEmployee) {
      await viewEmployee(selectedEmployee.employee_id);
    }
  } catch (error) {
    console.error("❌ Payout Error:", error);
    showNotification("error", error.message);
  }
}

// HELPER FUNCTIONS
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
  } else if (type === "info") {
    icon.className =
      "w-10 h-10 rounded-full flex items-center justify-center bg-blue-100";
    icon.innerHTML =
      '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    title.textContent = "Info";
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
      (emp.contact_number && emp.contact_number.includes(searchTerm)) ||
      (emp.branch && emp.branch.toLowerCase().includes(searchTerm))
  );
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateShort(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeString) {
  if (!timeString) return "—";
  const time = new Date(timeString);
  return time.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// GLOBAL EXPORTS
window.showAddEmployeeModal = showAddEmployeeModal;
window.showModal = showModal;
window.closeModal = closeModal;
window.openTimeInOut = openTimeInOut;
window.processTimeInOut = processTimeInOut;
window.viewEmployee = viewEmployee;
window.deleteEmployee = deleteEmployee;
window.downloadDTR = downloadDTR;
window.downloadCurrentEmployeeDTR = downloadCurrentEmployeeDTR;
window.downloadEmployeeDTR = downloadEmployeeDTR;
window.loadEmployees = loadEmployees;
window.openEditEmployee = openEditEmployee;
window.handleEditEmployee = handleEditEmployee;
window.openResetPin = openResetPin;
window.handleResetPin = handleResetPin;
window.filterEmployees = filterEmployees;
window.changeAttendancePage = changeAttendancePage;
window.changeAttendancePerPage = changeAttendancePerPage;
window.openEditTime = openEditTime;
window.handleEditTime = handleEditTime;
window.openPayoutModal = openPayoutModal;
window.handlePayout = handlePayout;

console.log("✅ ATTENDANCE.JS WITH PAYOUT SYSTEM LOADED!");