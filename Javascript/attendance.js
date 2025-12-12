// attendance.js - K-STREET Attendance Portal JavaScript
// ============================
// GLOBAL VARIABLES
// ============================
let employees = [];
let selectedEmployee = null;
let currentTime = new Date();
let searchTerm = "";

// ============================
// INITIALIZATION
// ============================
document.addEventListener("DOMContentLoaded", function () {
  console.log("Attendance System Initializing...");

  // Load employees from localStorage
  loadEmployeesFromStorage();

  // Update current time
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  // Setup form handler
  document
    .getElementById("addEmployeeForm")
    .addEventListener("submit", handleAddEmployee);

  // Render initial list
  renderEmployeeList();

  console.log("✅ Attendance System Ready!");
});

// ============================
// TIME FUNCTIONS
// ============================
function updateCurrentTime() {
  currentTime = new Date();
  const timeString =
    currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    " • " +
    currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  document.getElementById("currentDateTime").textContent = timeString;

  // Update modal time if open
  const modalTime = document.getElementById("modalCurrentTime");
  if (modalTime) {
    modalTime.textContent = currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================
// STORAGE FUNCTIONS
// ============================
function saveEmployeesToStorage() {
  localStorage.setItem("kstreet_employees", JSON.stringify(employees));
  console.log("Employees saved:", employees.length);
}

function loadEmployeesFromStorage() {
  const stored = localStorage.getItem("kstreet_employees");
  if (stored) {
    employees = JSON.parse(stored);
    console.log("Employees loaded:", employees.length);
  }
}

// ============================
// MODAL FUNCTIONS
// ============================
function showAddEmployeeModal() {
  document.getElementById("addEmployeeModal").classList.add("active");
  document.getElementById("addEmployeeForm").reset();
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
  if (modalId === "timeInOutModal") {
    document.getElementById("pinInput").value = "";
    document.getElementById("pinError").classList.add("hidden");
  }
}

function showNotification(type, message) {
  const modal = document.getElementById("notificationModal");
  const icon = document.getElementById("notificationIcon");
  const title = document.getElementById("notificationTitle");
  const msg = document.getElementById("notificationMessage");

  if (type === "success") {
    icon.className =
      "w-10 h-10 rounded-full flex items-center justify-center bg-green-100";
    icon.innerHTML = '<span class="text-xl text-green-600">✓</span>';
    title.textContent = "Success";
  } else {
    icon.className =
      "w-10 h-10 rounded-full flex items-center justify-center bg-red-100";
    icon.innerHTML = '<span class="text-xl text-red-600">!</span>';
    title.textContent = "Error";
  }

  msg.textContent = message;
  modal.classList.add("active");
}

// ============================
// EMPLOYEE FUNCTIONS
// ============================
function handleAddEmployee(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Validation
  if (
    !data.name ||
    !data.username ||
    !data.email ||
    !data.address ||
    !data.contactNumber ||
    !data.pin
  ) {
    showNotification("error", "Please fill in all required fields");
    return;
  }

  if (data.pin.length < 4) {
    showNotification("error", "PIN must be at least 4 digits");
    return;
  }

  const newEmployee = {
    id: Date.now(),
    name: data.name,
    username: data.username,
    email: data.email,
    address: data.address,
    contactNumber: data.contactNumber,
    dailyRate: data.dailyRate || "",
    pin: data.pin,
    attendanceRecords: [],
    joinDate: new Date().toISOString(),
    isOnDuty: false,
    currentTimeIn: null,
  };

  employees.push(newEmployee);
  saveEmployeesToStorage();
  renderEmployeeList();
  closeModal("addEmployeeModal");
  showNotification("success", `${newEmployee.name} added successfully`);
}

function deleteEmployee(id, name) {
  if (confirm(`Delete ${name}? This action cannot be undone.`)) {
    employees = employees.filter((emp) => emp.id !== id);
    saveEmployeesToStorage();
    renderEmployeeList();
    showNotification("success", `${name} removed from system`);
  }
}

function viewEmployee(id) {
  selectedEmployee = employees.find((emp) => emp.id === id);
  if (!selectedEmployee) return;

  const stats = getAttendanceStats(selectedEmployee);
  const records = selectedEmployee.attendanceRecords || [];

  let recordsHTML = "";
  if (records.length > 0) {
    recordsHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-2 text-left font-semibold text-slate-900">Date</th>
              <th class="px-4 py-2 text-left font-semibold text-slate-900">Time In</th>
              <th class="px-4 py-2 text-left font-semibold text-slate-900">Time Out</th>
              <th class="px-4 py-2 text-left font-semibold text-slate-900">Status</th>
              <th class="px-4 py-2 text-left font-semibold text-slate-900">Hours</th>
            </tr>
          </thead>
          <tbody>
            ${[...records]
              .reverse()
              .map((record) => {
                const workData = calculateWorkHours(
                  record.timeIn,
                  record.timeOut
                );
                return `
                <tr class="border-b border-slate-200 hover:bg-slate-50">
                  <td class="px-4 py-3 text-slate-900">${formatDate(
                    record.date
                  )}</td>
                  <td class="px-4 py-3 text-slate-900 font-medium">${
                    record.timeIn
                  }</td>
                  <td class="px-4 py-3 text-slate-900 font-medium">
                    ${
                      record.timeOut ||
                      '<span class="text-blue-600 font-semibold">On Duty</span>'
                    }
                  </td>
                  <td class="px-4 py-3">
                    <span class="badge ${
                      record.status === "completed"
                        ? "badge-green"
                        : "badge-blue"
                    }">
                      ${record.status === "completed" ? "Completed" : "On Duty"}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-900">${workData.display}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  } else {
    recordsHTML =
      '<p class="text-sm text-slate-500 text-center py-8">No attendance records yet</p>';
  }

  const content = `
    <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
      <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
        selectedEmployee.isOnDuty
          ? "bg-gradient-to-br from-green-400 to-green-600"
          : "bg-gradient-to-br from-red-400 to-red-600"
      }">
        ${selectedEmployee.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3 class="font-semibold text-slate-900">${selectedEmployee.name}</h3>
        <p class="text-sm text-slate-500">@${selectedEmployee.username}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-slate-50 rounded-lg p-4">
        <p class="text-xs text-slate-600 font-medium mb-2">Email</p>
        <p class="text-sm text-slate-900 break-all">${
          selectedEmployee.email
        }</p>
      </div>
      <div class="bg-slate-50 rounded-lg p-4">
        <p class="text-xs text-slate-600 font-medium mb-2">Address</p>
        <p class="text-sm text-slate-900">${selectedEmployee.address || "—"}</p>
      </div>
      <div class="bg-slate-50 rounded-lg p-4">
        <p class="text-xs text-slate-600 font-medium mb-2">Contact Number</p>
        <p class="text-sm text-slate-900">${
          selectedEmployee.contactNumber || "—"
        }</p>
      </div>
      <div class="bg-slate-50 rounded-lg p-4">
        <p class="text-xs text-slate-600 font-medium mb-2">Daily Rate</p>
        <p class="text-sm font-bold text-red-600">${
          selectedEmployee.dailyRate ? `₱${selectedEmployee.dailyRate}` : "—"
        }</p>
      </div>
    </div>

    <div class="bg-slate-50 rounded-lg p-4 mb-6">
      <p class="text-xs text-slate-600 font-medium mb-3">Summary</p>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <p class="text-2xl font-bold text-slate-900">${stats.total}</p>
          <p class="text-xs text-slate-600">Total</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-green-600">${stats.completed}</p>
          <p class="text-xs text-slate-600">Completed</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-blue-600">${stats.onDuty}</p>
          <p class="text-xs text-slate-600">On Duty</p>
        </div>
      </div>
    </div>

    <div>
      <p class="text-xs text-slate-600 font-medium mb-3">Attendance History</p>
      ${recordsHTML}
    </div>
  `;

  document.getElementById("viewEmployeeContent").innerHTML = content;
  document.getElementById("viewEmployeeModal").classList.add("active");
}

function openTimeInOut(id) {
  selectedEmployee = employees.find((emp) => emp.id === id);
  if (!selectedEmployee) return;

  document.getElementById("timeInOutTitle").textContent =
    selectedEmployee.isOnDuty ? "Clock Out" : "Clock In";
  document.getElementById("timeInOutName").textContent = selectedEmployee.name;
  document.getElementById("timeInOutButton").textContent =
    selectedEmployee.isOnDuty ? "Clock Out" : "Clock In";
  document.getElementById("pinInput").value = "";
  document.getElementById("pinError").classList.add("hidden");

  document.getElementById("timeInOutModal").classList.add("active");
}

function processTimeInOut() {
  const pin = document.getElementById("pinInput").value;
  const errorEl = document.getElementById("pinError");

  if (!pin) {
    errorEl.textContent = "Enter PIN";
    errorEl.classList.remove("hidden");
    return;
  }

  if (selectedEmployee.pin !== pin) {
    errorEl.textContent = "Incorrect PIN";
    errorEl.classList.remove("hidden");
    document.getElementById("pinInput").value = "";
    return;
  }

  const now = new Date();
  const timeString = formatTime(now);
  const today = now.toISOString().split("T")[0];

  if (!selectedEmployee.isOnDuty) {
    // Time In
    selectedEmployee.isOnDuty = true;
    selectedEmployee.currentTimeIn = now.toISOString();
    selectedEmployee.attendanceRecords.push({
      date: today,
      timeIn: timeString,
      timeOut: null,
      status: "on-duty",
      fullDate: now.toISOString(),
    });
    showNotification(
      "success",
      `${selectedEmployee.name} clocked in successfully`
    );
  } else {
    // Time Out
    const todayIndex = selectedEmployee.attendanceRecords.findIndex(
      (r) => r.date === today && r.timeOut === null
    );

    if (todayIndex !== -1) {
      selectedEmployee.attendanceRecords[todayIndex].timeOut = timeString;
      selectedEmployee.attendanceRecords[todayIndex].status = "completed";
      selectedEmployee.isOnDuty = false;
      selectedEmployee.currentTimeIn = null;
      showNotification(
        "success",
        `${selectedEmployee.name} clocked out successfully`
      );
    }
  }

  // Update employee in array
  employees = employees.map((emp) =>
    emp.id === selectedEmployee.id ? selectedEmployee : emp
  );
  saveEmployeesToStorage();
  renderEmployeeList();
  closeModal("timeInOutModal");
}

// ============================
// RENDER FUNCTIONS
// ============================
function renderEmployeeList() {
  const container = document.getElementById("employeeList");
  const filteredEmployees = filterEmployeesBySearch();

  // Update count
  document.getElementById(
    "employeeCount"
  ).textContent = `${filteredEmployees.length} / ${employees.length}`;

  if (filteredEmployees.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white rounded-lg border border-slate-200">
        <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">${
          employees.length === 0 ? "No employees yet" : "No results found"
        }</h3>
        <p class="text-sm text-slate-500">${
          employees.length === 0
            ? "Create your first employee record to get started"
            : "Try adjusting your search criteria"
        }</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredEmployees
    .map((emp) => {
      const todayRecord = getTodayRecord(emp);
      const stats = getAttendanceStats(emp);

      return `
        <div class="bg-white rounded-lg border border-slate-200 p-6 card-hover">
          <div class="flex items-start justify-between gap-6">
            <!-- Employee Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-slate-900 text-sm">${
                      emp.name
                    }</h3>
                    ${
                      emp.isOnDuty
                        ? `
                      <span class="badge badge-green">
                        <span class="w-2 h-2 bg-green-600 rounded-full pulse-animation"></span>
                        On Duty
                      </span>
                    `
                        : ""
                    }
                  </div>
                  <p class="text-xs text-slate-500">@${emp.username}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div class="stat-card">
                  <p class="text-xs text-slate-600 font-medium mb-1">Email</p>
                  <p class="text-xs text-slate-900 truncate font-medium">${
                    emp.email
                  }</p>
                </div>
                <div class="stat-card">
                  <p class="text-xs text-slate-600 font-medium mb-1">Contact</p>
                  <p class="text-xs text-red-600 font-bold">${
                    emp.contactNumber || "—"
                  }</p>
                </div>
                <div class="stat-card">
                  <p class="text-xs text-slate-600 font-medium mb-1">Records</p>
                  <p class="text-xs text-slate-900 font-bold">${stats.total}</p>
                </div>
                <div class="stat-card">
                  <p class="text-xs text-slate-600 font-medium mb-1">Completed</p>
                  <p class="text-xs text-green-600 font-bold">${
                    stats.completed
                  }</p>
                </div>
                <div class="stat-card">
                  <p class="text-xs text-slate-600 font-medium mb-1">Today</p>
                  <p class="text-xs font-bold ${
                    todayRecord
                      ? emp.isOnDuty
                        ? "text-green-600"
                        : "text-blue-600"
                      : "text-slate-400"
                  }">
                    ${
                      todayRecord
                        ? emp.isOnDuty
                          ? "On Duty"
                          : "Clocked Out"
                        : "—"
                    }
                  </p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 flex-shrink-0">
              <button onclick="openTimeInOut(${emp.id})" class="icon-button ${
        emp.isOnDuty
          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
          : "bg-green-50 text-green-600 hover:bg-green-100"
      } font-semibold text-xs flex items-center gap-1 px-3 py-2">
                ${
                  emp.isOnDuty
                    ? `
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Out
                `
                    : `
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  In
                `
                }
              </button>
              <button onclick="viewEmployee(${
                emp.id
              })" class="icon-button bg-slate-100 text-slate-600 hover:bg-slate-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              <button onclick="deleteEmployee(${emp.id}, '${
        emp.name
      }')" class="icon-button bg-red-50 text-red-600 hover:bg-red-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function filterEmployees() {
  searchTerm = document.getElementById("searchInput").value;
  renderEmployeeList();
}

function filterEmployeesBySearch() {
  if (!searchTerm) return employees;

  return employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// ============================
// UTILITY FUNCTIONS
// ============================
function getTodayRecord(employee) {
  const today = new Date().toISOString().split("T")[0];
  return employee.attendanceRecords?.find((record) => record.date === today);
}

function getAttendanceStats(employee) {
  const records = employee.attendanceRecords || [];
  return {
    total: records.length,
    completed: records.filter((r) => r.timeOut).length,
    onDuty: records.filter((r) => !r.timeOut && r.timeIn).length,
  };
}

function calculateWorkHours(timeIn, timeOut) {
  if (!timeIn || !timeOut) return { display: "—", hours: 0 };

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes, seconds] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const inSeconds = parseTime(timeIn);
  const outSeconds = parseTime(timeOut);
  const diffSeconds = outSeconds - inSeconds;
  const hours = diffSeconds / 3600;

  return {
    display: `${hours.toFixed(2)}h`,
    hours: hours,
  };
}

// ============================
// PDF GENERATION
// ============================
function downloadDTR() {
  if (!selectedEmployee) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const stats = getAttendanceStats(selectedEmployee);
  const records = selectedEmployee.attendanceRecords || [];

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("DAILY TIME RECORD (DTR)", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text("K-Street Gerona, Tarlac", 105, 28, { align: "center" });

  // Employee Info
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("EMPLOYEE INFORMATION", 20, 45);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  let y = 55;
  doc.text(`Name: ${selectedEmployee.name}`, 20, y);
  doc.text(`Username: @${selectedEmployee.username}`, 20, (y += 7));
  doc.text(`Email: ${selectedEmployee.email}`, 20, (y += 7));
  doc.text(`Address: ${selectedEmployee.address || "N/A"}`, 20, (y += 7));
  doc.text(`Contact: ${selectedEmployee.contactNumber || "N/A"}`, 20, (y += 7));
  doc.text(
    `Daily Rate: ${
      selectedEmployee.dailyRate ? "₱" + selectedEmployee.dailyRate : "N/A"
    }`,
    20,
    (y += 7)
  );

  // Stats
  y += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`Total Days: ${stats.total}`, 20, y);
  doc.text(`Completed: ${stats.completed}`, 80, y);
  doc.text(`On Duty: ${stats.onDuty}`, 140, y);

  // Records Table
  y += 15;
  doc.setFontSize(14);
  doc.text("ATTENDANCE HISTORY", 20, y);

  y += 10;
  if (records.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["Date", "Time In", "Time Out", "Hours", "Status"]],
      body: records.reverse().map((record) => {
        const workData = calculateWorkHours(record.timeIn, record.timeOut);
        return [
          formatDate(record.date),
          record.timeIn,
          record.timeOut || "On Duty",
          workData.display,
          record.status === "completed" ? "Completed" : "On Duty",
        ];
      }),
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38] },
    });
  } else {
    doc.text("No attendance records yet", 20, y);
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.save(
    `DTR_${selectedEmployee.name.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
}
