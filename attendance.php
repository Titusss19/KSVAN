<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit();
}

$user = $_SESSION['user'];
$activeView = 'attendance';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance Portal - K-STREET</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/attendance.css">
</head>
<body class="bg-slate-50">
    <!-- Include Navbar -->
    <?php include 'components/navbar.php'; ?>

    <!-- Main Container -->
    <div class="min-h-screen">
        <!-- Header -->
        <div class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div class="max-w-7xl mx-auto px-8 py-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <img src="assets/kslogo.png" alt="K-Street Logo" class="h-16 w-auto" onerror="this.style.display='none'">
                        <div>
                            <h1 class="text-3xl font-bold text-slate-900">K-STREET Attendance</h1>
                            <p class="text-sm text-slate-500 mt-1" id="currentDateTime">Loading...</p>
                        </div>
                    </div>
                    <button onclick="showAddEmployeeModal()" class="btn-primary text-white px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add Employee
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-8 py-8">
            <!-- Search and Stats -->
            <div class="mb-8">
                <div class="flex items-center gap-4 mb-6">
                    <div class="flex-1 relative">
                        <svg class="absolute left-3 top-3 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input 
                            type="text" 
                            id="searchInput"
                            placeholder="Search by name, username, or email..."
                            class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                            oninput="filterEmployees()"
                        >
                    </div>
                    <div class="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-slate-200">
                        <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span class="text-sm font-medium text-slate-700" id="employeeCount">0 / 0</span>
                    </div>
                </div>
            </div>

            <!-- Employee List -->
            <div id="employeeList" class="space-y-3">
                <!-- Employees will be loaded here -->
                <div class="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <h3 class="text-lg font-semibold text-slate-900 mb-2">No employees yet</h3>
                    <p class="text-sm text-slate-500">Create your first employee record to get started</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Employee Modal -->
    <div id="addEmployeeModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 class="font-semibold text-slate-900 text-lg">Add Employee</h2>
                <button onclick="closeModal('addEmployeeModal')" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form id="addEmployeeForm" class="p-6 space-y-4">
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                    <input type="text" name="name" required placeholder="Enter full name" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Username *</label>
                    <input type="text" name="username" required placeholder="Enter username" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Email *</label>
                    <input type="email" name="email" required placeholder="Enter email" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Address *</label>
                    <input type="text" name="address" required placeholder="Enter address" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Contact Number *</label>
                    <input type="tel" name="contactNumber" required placeholder="Enter contact number" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">Daily Rate (Optional)</label>
                    <input type="number" name="dailyRate" placeholder="Enter daily rate" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">PIN (4+ digits) *</label>
                    <input type="password" name="pin" required placeholder="Enter PIN" minlength="4" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm">
                    <p class="text-xs text-slate-500 mt-1">Required for time in/out authentication</p>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 btn-primary text-white py-2 rounded-lg font-medium text-sm">
                        Add Employee
                    </button>
                    <button type="button" onclick="closeModal('addEmployeeModal')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2 rounded-lg font-medium text-sm">
                        Cancel
                    </button>
                </div>
                <p class="text-xs text-slate-500 text-center">* Required fields</p>
            </form>
        </div>
    </div>

    <!-- View Employee Modal -->
    <div id="viewEmployeeModal" class="modal">
        <div class="modal-content" style="max-width: 900px;">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 class="font-semibold text-slate-900 text-lg">Employee Details</h2>
                <div class="flex items-center gap-2">
                    <button onclick="downloadDTR()" class="icon-button bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm px-3 py-2 rounded-lg flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download DTR
                    </button>
                    <button onclick="closeModal('viewEmployeeModal')" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div id="viewEmployeeContent" class="p-6">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>
    </div>

    <!-- Time In/Out Modal -->
    <div id="timeInOutModal" class="modal">
        <div class="modal-content" style="max-width: 450px;">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 class="font-semibold text-slate-900" id="timeInOutTitle">Clock In</h2>
                    <p class="text-sm text-slate-500 mt-1" id="timeInOutName">Employee Name</p>
                </div>
                <button onclick="closeModal('timeInOutModal')" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <div class="p-6 space-y-5">
                <div>
                    <p class="text-sm text-slate-700 font-medium mb-2">Current Time</p>
                    <p class="text-3xl font-bold text-red-600" id="modalCurrentTime">00:00:00 AM</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-900 mb-2">Enter PIN</label>
                    <input 
                        type="password" 
                        id="pinInput"
                        inputmode="numeric"
                        placeholder="••••"
                        class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 text-center text-lg font-bold tracking-widest"
                        onkeypress="if(event.key==='Enter') processTimeInOut()"
                    >
                    <p id="pinError" class="text-sm text-red-600 mt-1 text-center hidden"></p>
                </div>

                <div class="flex gap-3 pt-2">
                    <button onclick="processTimeInOut()" class="flex-1 btn-primary text-white py-2 rounded-lg font-medium text-sm" id="timeInOutButton">
                        Clock In
                    </button>
                    <button onclick="closeModal('timeInOutModal')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2 rounded-lg font-medium text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Success/Error Modal -->
    <div id="notificationModal" class="modal">
        <div class="modal-content" style="max-width: 400px;">
            <div class="px-6 py-4 border-b border-slate-200">
                <div class="flex items-center gap-3">
                    <div id="notificationIcon" class="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                        <span class="text-xl text-green-600">✓</span>
                    </div>
                    <p class="font-semibold text-slate-900" id="notificationTitle">Success</p>
                </div>
            </div>
            <div class="p-6">
                <p class="text-slate-700 text-sm mb-6" id="notificationMessage">Operation completed successfully</p>
                <button onclick="closeModal('notificationModal')" class="w-full btn-primary text-white py-2 rounded-lg font-medium text-sm">
                    Done
                </button>
            </div>
        </div>
    </div>

    <!-- Load JavaScript -->
    <script>
        // Pass PHP user data to JavaScript
        const currentUser = <?php echo json_encode($user); ?>;
    </script>
    <script src="Javascript/attendance.js"></script>
</body>
</html>
