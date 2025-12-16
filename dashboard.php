<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - K-STREET</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="css/dashboard.css">
    <style>
        /* Additional custom styles for responsiveness */
        @media (max-width: 640px) {
            .stat-card {
                padding: 16px !important;
            }
            .stat-card .text-3xl {
                font-size: 1.5rem !important;
            }
            .modal-content {
                max-width: 95% !important;
                margin: 1rem !important;
            }
        }
        
        @media (max-width: 768px) {
            .grid-cols-5 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
        }
        
        @media (max-width: 480px) {
            .grid-cols-5 {
                grid-template-columns: 1fr !important;
            }
            .flex-wrap {
                flex-wrap: wrap !important;
            }
        }
        
        /* Prevent horizontal scroll */
        body, html {
            overflow-x: hidden !important;
            max-width: 100vw !important;
        }
        
        /* Responsive table */
        @media (max-width: 1024px) {
            table {
                display: block;
                overflow-x: auto;
                white-space: nowrap;
            }
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen overflow-x-hidden">
    <?php 
    session_start();
    
    // Check if user is logged in
    if (!isset($_SESSION['user'])) {
        header('Location: login.php');
        exit();
    }
    
    $user = $_SESSION['user'];
    $activeView = 'dashboard';
    $currentUser = $user;
    ?>
    
    <?php include 'components/navbar.php'; ?>

    <!-- Main Content -->
    <main class="content-wrapper px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 overflow-x-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- Welcome Banner -->
            <div class="mb-4 sm:mb-6 rounded-xl shadow-lg p-4 sm:p-6" style="background-color: #FF001B;">
                <h1 class="text-xl sm:text-2xl font-bold text-white" id="welcomeTitle">
                    Welcome, <?php echo htmlspecialchars($user['username'] ?? 'User'); ?>!
                </h1>
                <p class="text-blue-100 mt-1 text-sm sm:text-base">Here's what's happening with your business today.</p>
                <div class="mt-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-200">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span class="text-blue-200 text-xs sm:text-sm" id="userBranch">
                        Branch: <?php echo htmlspecialchars($user['branch'] ?? 'main'); ?>
                    </span>
                </div>
            </div>

            <!-- Header Controls -->
            <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                <div class="w-full sm:w-auto">
                    <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p class="text-gray-600 text-xs sm:text-sm mt-1">Real-time business analytics and management</p>
                </div>
                <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto mt-2 sm:mt-0">
                    <div class="relative flex-grow sm:flex-grow-0">
                        <button onclick="toggleBranchDropdown()" class="w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between gap-2 shadow-sm transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path>
                            </svg>
                            <span id="branchText" class="truncate">All Branches</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="chevronIcon">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        <div id="branchDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 hidden">
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
                                <!-- Branches will be loaded dynamically -->
                            </div>
                        </div>
                    </div>

                    <button onclick="refreshAll()" class="flex-grow sm:flex-grow-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm">
                        <svg id="refreshIcon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6"></path>
                            <path d="M1 20v-6h6"></path>
                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                        </svg>
                        <span class="hidden sm:inline">Refresh All</span>
                        <span class="sm:hidden">Refresh</span>
                    </button>

                    <button onclick="goToAttendance()" class="flex-grow sm:flex-grow-0 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span class="hidden sm:inline">Attendance</span>
                        <span class="sm:hidden">Attend</span>
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <!-- Net Sales -->
                <div class="stat-card" style="background-color: #FF5C6E;">
                    <div class="flex items-center justify-between mb-2 sm:mb-4">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-pink-200 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" sm:width="20" sm:height="20" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-pink-600">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1" id="netSales">₱0.00</div>
                    <div class="text-xs sm:text-sm text-white mb-1 sm:mb-2">Net Sales</div>
                    <div class="text-xs text-white font-medium">All Time</div>
                </div>

                <!-- Gross Sales -->
                <div class="stat-card" style="background-color: #FEC600;">
                    <div class="flex items-center justify-between mb-2 sm:mb-4">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" sm:width="20" sm:height="20" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-pink-600">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1" id="grossSales">₱0.00</div>
                    <div class="text-xs sm:text-sm text-white mb-1 sm:mb-2">Gross Sales</div>
                    <div class="text-xs text-white font-medium" id="voidedAmount">Voided: ₱0.00</div>
                </div>

                <!-- Today Transactions -->
                <div class="stat-card" style="background-color: #1E2C2E;">
                    <div class="flex items-center justify-between mb-2 sm:mb-4">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" sm:width="20" sm:height="20" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-orange-600">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1" id="todayTransactions">0</div>
                    <div class="text-xs sm:text-sm text-white mb-1 sm:mb-2">Today Transactions</div>
                    <div class="text-xs text-white font-medium">
                        Net: <span id="todaySales">₱0.00</span> today
                        <span class="block text-orange-300" id="todayVoided" style="display: none;">Voided: ₱0.00</span>
                    </div>
                </div>

                <!-- Inventory Value -->
                <div class="stat-card" style="background-color: #4B3D79; border: 1px solid black;">
                    <div class="flex items-center justify-between mb-2 sm:mb-4">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" sm:width="20" sm:height="20" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1" id="inventoryValue">₱0.00</div>
                    <div class="text-xs sm:text-sm text-white mb-1 sm:mb-2">Inventory Value</div>
                    <div class="text-xs text-white font-medium" id="inventoryItems">0 items in stock</div>
                </div>

                <!-- Active Employees -->
                <div class="stat-card" style="background-color: #A3C47C;">
                    <div class="flex items-center justify-between mb-2 sm:mb-4">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" sm:width="20" sm:height="20" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-600">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1" id="activeEmployees">0</div>
                    <div class="text-xs sm:text-sm text-white mb-1 sm:mb-2">Active Employees</div>
                    <div class="text-xs text-white font-medium">Currently working</div>
                </div>
            </div>

            <!-- Main Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <!-- Announcements -->
                <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                    <div class="flex justify-between items-center mb-3 sm:mb-4">
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-700">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <h3 class="text-base sm:text-lg font-bold text-gray-800">Announcements</h3>
                        </div>
                        <div class="flex gap-1 sm:gap-2">
                            <button onclick="refreshAnnouncements()" class="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                                <svg id="refreshAnnouncementsIcon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 4v6h-6"></path>
                                    <path d="M1 20v-6h6"></path>
                                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                                </svg>
                            </button>
                            <?php if(in_array($user['role'] ?? 'cashier', ['admin', 'owner', 'manager', 'cashier'])): ?>
                            <button onclick="openAnnouncementModal()" class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-black hover:to-black rounded-lg flex items-center justify-center shadow-md transition-all transform hover:scale-105">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar" id="announcementsContainer">
                        <div class="text-center py-6 sm:py-8 text-gray-500 text-sm">
                            Loading announcements...
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
<div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
    <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Quick Actions</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 sm:mb-6">
        <a href="pos.php" class="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition font-medium text-xs sm:text-sm text-center">Open POS</a>
        <a href="sales_report.php" class="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition font-medium text-xs sm:text-sm text-center">Sales Report</a>
        <a href="items.php" class="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition font-medium text-xs sm:text-sm text-center">Inventory</a>
        <button onclick="quickTimeIn()" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition font-medium text-xs sm:text-sm">Time In</button>
        <button onclick="quickTimeOut()" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition font-medium text-xs sm:text-sm">Time Out</button>
        <button onclick="openCashInModal()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg transition font-medium text-xs sm:text-sm">Cash In</button>
        <button onclick="openCashOutModal()" class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition font-medium text-xs sm:text-sm">Cash Out</button>
    </div>

    <div class="pt-4 sm:pt-6 border-t border-gray-200">
        <h4 class="font-semibold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Employee Status</h4>
        <div class="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar" id="employeeStatusList">
            <div class="text-center py-3 sm:py-4 text-gray-500 text-xs sm:text-sm">
                Loading employees...
            </div>
        </div>
    </div>
</div>
            </div>

            <!-- System Users -->
            <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <h3 class="text-base sm:text-lg font-bold text-gray-800">System Users</h3>
                    <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button onclick="refreshUsers()" class="flex-grow sm:flex-grow-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm">
                            <svg id="refreshUsersIcon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                            </svg>
                            <span class="hidden sm:inline">Refresh</span>
                            <span class="sm:hidden">Refresh</span>
                        </button>
                        <?php 
                        $userRole = $user['role'] ?? 'cashier';
                        $allowedRoles = ['admin', 'owner', 'manager'];
                        if(in_array($userRole, $allowedRoles)): 
                        ?>
                        <button onclick="openAddUserModal()" class="flex-grow sm:flex-grow-0 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-xs sm:text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            <span class="hidden sm:inline">Add User</span>
                            <span class="sm:hidden">Add</span>
                        </button>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full min-w-[800px]">
                        <thead>
                            <tr class="border-b-2 border-gray-200 bg-gray-50">
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">ID</th>
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">Email</th>
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">Username</th>
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">Role</th>
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">Void PIN</th>
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">Branch</th>
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">Created</th>
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                                <?php if(in_array($userRole, $allowedRoles)): ?>
                                <th class="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                                <?php endif; ?>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <tr>
                                <td colspan="<?php echo in_array($userRole, $allowedRoles) ? 9 : 8; ?>" class="py-6 text-center text-gray-500 text-sm">
                                    Loading users...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <!-- Add Announcement Modal -->
    <div id="announcementModal" class="modal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg sm:text-xl font-bold text-gray-800">New Announcement</h2>
                <button onclick="closeAnnouncementModal()" class="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="space-y-3 sm:space-y-4">
                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Type</label>
                    <select id="announcementType" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm">
                        <option value="info">Info (Blue)</option>
                        <option value="success">Success (Green)</option>
                        <option value="warning">Warning (Yellow)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Title</label>
                    <input type="text" id="announcementTitle" placeholder="Enter announcement title" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm">
                </div>

                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Message</label>
                    <textarea id="announcementMessage" placeholder="Enter announcement message" rows="3" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm"></textarea>
                </div>

                <?php if(in_array($user['role'] ?? 'cashier', ['admin', 'owner'])): ?>
                <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-2 sm:p-3 rounded-lg border-2 border-blue-200">
                    <p class="text-xs sm:text-sm text-blue-700 font-bold"><span class="font-extrabold">GLOBAL ANNOUNCEMENT</span> - Visible to ALL branches</p>
                </div>
                <?php else: ?>
                <div class="bg-gradient-to-r from-green-50 to-green-100 p-2 sm:p-3 rounded-lg border-2 border-green-200">
                    <p class="text-xs sm:text-sm text-green-700 font-bold"><span class="font-extrabold">BRANCH ANNOUNCEMENT</span> - Visible only to your branch</p>
                </div>
                <?php endif; ?>

                <div class="flex gap-2 sm:gap-3 pt-2">
                    <button onclick="closeAnnouncementModal()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">Cancel</button>
                    <button onclick="postAnnouncement()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm">Post Announcement</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Add User Modal -->
    <div id="addUserModal" class="modal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg sm:text-xl font-bold text-gray-800">Add New User</h2>
                <button onclick="closeAddUserModal()" class="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="space-y-3 sm:space-y-4">
                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Email Address <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input type="email" id="addUserEmail" placeholder="user@example.com" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
                    <p class="text-xs text-gray-500 mt-1">Must be a valid email address</p>
                </div>
                
                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Username <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input type="text" id="addUsername" placeholder="Enter username" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
                    <p class="text-xs text-gray-500 mt-1">Minimum 3 characters</p>
                </div>
                
                <div id="voidPinContainer" style="display: none;">
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Void PIN <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input type="password" id="addVoidPin" placeholder="Enter 4-digit PIN" maxlength="4" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
                    <p class="text-xs text-gray-500 mt-1">4-digit numbers only (required for Manager/Owner)</p>
                </div>
                
                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Password <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input type="password" id="addPassword" placeholder="Minimum 6 characters" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
                </div>
                
                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Confirm Password <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input type="password" id="addConfirmPassword" placeholder="Re-enter password" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
                </div>
                
                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Role <span class="text-red-500 ml-1">*</span>
                    </label>
                    <select id="addUserRole" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
                        <option value="cashier">Cashier</option>
                        <?php if(in_array($user['role'] ?? 'cashier', ['admin', 'owner', 'manager'])): ?>
                        <option value="manager">Manager</option>
                        <?php endif; ?>
                        <?php if(in_array($user['role'] ?? 'cashier', ['admin', 'owner'])): ?>
                        <option value="admin">Owner</option>
                        <?php endif; ?>
                    </select>
                </div>
                
                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Branch <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input type="text" id="addUserBranch" placeholder="e.g., Main, Branch1" value="<?php echo htmlspecialchars($user['branch'] ?? 'main'); ?>" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
                </div>
                
                <div>
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Status <span class="text-red-500 ml-1">*</span>
                    </label>
                    <select id="addUserStatus" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                
                <div class="bg-gradient-to-r from-red-50 to-red-100 p-2 sm:p-3 rounded-lg border-2 border-red-200">
                    <p class="text-xs sm:text-sm text-red-700 font-bold">
                        <span class="font-extrabold">IMPORTANT:</span> 
                        All fields marked with <span class="text-red-500">*</span> are required.
                        Email and Username must be unique.
                    </p>
                </div>

                <div class="flex gap-2 sm:gap-3 pt-2">
                    <button onclick="closeAddUserModal()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">Cancel</button>
                    <button onclick="addUser()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm">Add User</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg sm:text-xl font-bold text-gray-800">Edit User</h2>
                <button onclick="closeEditModal()" class="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="space-y-3 sm:space-y-4">
                <input type="text" id="editUsername" placeholder="Username" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm">
                <input type="email" id="editEmail" placeholder="Email" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm">
                <input type="password" id="editVoidPin" placeholder="Leave blank to keep existing PIN" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm">
                <select id="editUserRole" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm">
                    <option value="cashier">Cashier</option>
                    <?php if(in_array($user['role'] ?? 'cashier', ['admin', 'owner', 'manager'])): ?>
                    <option value="manager">Manager</option>
                    <?php endif; ?>
                    <?php if(in_array($user['role'] ?? 'cashier', ['admin', 'owner'])): ?>
                    <option value="admin">Owner</option>
                    <?php endif; ?>
                </select>

                <input type="text" id="editUserBranch" placeholder="Branch name" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm">

                <select id="editUserStatus" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <div class="flex gap-2 sm:gap-3 pt-2">
                    <button onclick="closeEditModal()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">Cancel</button>
                    <button onclick="updateUser()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm">Update</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg sm:text-xl font-bold text-gray-800">Delete User</h2>
                <button onclick="closeDeleteModal()" class="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="mb-4">
                <div class="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" sm:width="32" sm:height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </div>
                <p class="text-center text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Are you sure you want to delete this user?</p>
                <p class="text-center text-xs sm:text-sm text-gray-600"><strong id="deleteUserEmail">user@example.com</strong></p>
                <p class="text-center text-xs text-gray-500 mt-1">This action cannot be undone.</p>
            </div>

            <div class="flex gap-2 sm:gap-3">
                <button onclick="closeDeleteModal()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">Cancel</button>
                <button onclick="confirmDelete()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm">Delete</button>
            </div>
        </div>
    </div>

    <!-- Feedback Modal -->
    <div id="feedbackModal" class="modal">
        <div class="modal-content">
            <div class="mb-4">
                <h3 class="text-lg sm:text-xl font-bold text-center mb-1 sm:mb-2" id="feedbackTitle">Success!</h3>
                <p class="text-center text-gray-700 text-sm sm:text-base" id="feedbackMessage">Operation completed successfully.</p>
            </div>
            <div class="flex justify-center">
                <button onclick="closeFeedback()" class="px-4 py-2 sm:px-6 sm:py-3 bg-red-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base">
                    Okay
                </button>
            </div>
        </div>
    </div>

    <!-- ATTENDANCE PIN MODAL -->
    <div id="attendancePinModal" class="modal">
        <div class="modal-content">
            <button class="close-btn" onclick="closeAttendanceModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <h2 class="modal-title" id="pinModalTitle">Clock Out</h2>
            <p class="modal-subtitle" id="pinModalSubtitle">Jay mark Barbacena Melivo</p>

            <div class="time-section">
                <p class="time-label">Current Time</p>
                <p class="time-value" id="attendanceCurrentTime">02:01:38 AM</p>
            </div>

            <div class="pin-section">
                <label class="pin-label">Enter PIN</label>
                <input 
                    type="password" 
                    id="attendancePinInput"
                    class="pin-input"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="• • • •"
                    onkeypress="if(event.key==='Enter') verifyPin()"
                />
                <div id="pinError" class="pin-error hidden"></div>
            </div>

            <div class="modal-buttons">
                <button id="pinActionButton" class="btn-primary" onclick="verifyPin()">Clock Out</button>
                <button class="btn-secondary" onclick="closeAttendanceModal()">Cancel</button>
            </div>
        </div>
    </div>

    <!-- ATTENDANCE CONFIRMATION MODAL -->
    <div id="attendanceConfirmModal" class="modal">
        <div class="modal-content">
            <button class="close-btn" onclick="closeConfirmModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <h2 class="modal-title" id="confirmModalTitle">Confirm Clock Out</h2>
            <p class="modal-subtitle" id="confirmMessage">Are you sure you want to clock out?</p>

            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                <p id="confirmDetails" style="margin: 0; font-size: 13px; color: #333; text-align: center;"></p>
            </div>

            <div class="modal-buttons">
                <button id="confirmActionButton" class="btn-primary" onclick="processAttendanceAction()">Yes, Clock Out</button>
                <button class="btn-secondary" onclick="closeConfirmModal()">Cancel</button>
            </div>
        </div>
    </div>

    <!-- ATTENDANCE RESULT MODAL -->
    <div id="attendanceResultModal" class="modal">
        <div class="modal-content">
            <button class="close-btn" onclick="closeResultModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div style="text-align: center; margin-bottom: 12px;">
                <div id="resultIcon" style="width: 48px; height: 48px; margin: 0 auto; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            </div>

            <h2 class="modal-title" id="resultModalTitle" style="text-align: center;">Success</h2>
            <p id="resultMessage" style="font-size: 13px; color: #666; text-align: center; margin: 8px 0 12px 0;"></p>

            <div id="resultDetails"></div>

            <button class="btn-primary" onclick="closeResultModal()" style="width: 100%; margin-top: 12px;">Done</button>
        </div>
    </div>

    <div id="cashInModal" class="modal">
    <div class="modal-content">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">Cash In</h2>
            <button onclick="closeCashInModal()" class="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <div class="space-y-3 sm:space-y-4">
            <div>
                <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Amount <span class="text-red-500 ml-1">*</span>
                </label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                    <input type="number" id="cashInAmount" placeholder="0.00" step="0.01" min="0" class="w-full pl-8 pr-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm">
                </div>
            </div>

            <div>
                <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Reason <span class="text-red-500 ml-1">*</span>
                </label>
                <textarea id="cashInReason" placeholder="e.g., Initial capital, Sales revenue, etc." rows="3" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-sm"></textarea>
            </div>

            <div class="bg-gradient-to-r from-emerald-50 to-emerald-100 p-2 sm:p-3 rounded-lg border-2 border-emerald-200">
                <p class="text-xs sm:text-sm text-emerald-700 font-bold">
                    <span class="font-extrabold">CASH IN:</span> Add money to the register
                </p>
            </div>

            <div class="flex gap-2 sm:gap-3 pt-2">
                <button onclick="closeCashInModal()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">Cancel</button>
                <button onclick="processCashIn()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm">Submit</button>
            </div>
        </div>
    </div>
</div>

<!-- Cash Out Modal -->
<div id="cashOutModal" class="modal">
    <div class="modal-content">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">Cash Out</h2>
            <button onclick="closeCashOutModal()" class="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <div class="space-y-3 sm:space-y-4">
            <div>
                <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Amount <span class="text-red-500 ml-1">*</span>
                </label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                    <input type="number" id="cashOutAmount" placeholder="0.00" step="0.01" min="0" class="w-full pl-8 pr-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm">
                </div>
            </div>

            <div>
                <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Reason <span class="text-red-500 ml-1">*</span>
                </label>
                <textarea id="cashOutReason" placeholder="e.g., Bank deposit, Expense payment, etc." rows="3" class="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none text-sm"></textarea>
            </div>

            <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-2 sm:p-3 rounded-lg border-2 border-orange-200">
                <p class="text-xs sm:text-sm text-orange-700 font-bold">
                    <span class="font-extrabold">CASH OUT:</span> Remove money from the register
                </p>
            </div>

            <div class="flex gap-2 sm:gap-3 pt-2">
                <button onclick="closeCashOutModal()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">Cancel</button>
                <button onclick="processCashOut()" class="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm">Submit</button>
            </div>
        </div>
    </div>
</div>


    <!-- Pass PHP user data to JavaScript -->
    <script>
        window.currentUser = <?php echo json_encode($user); ?>;
    </script>

    <!-- Include the dash.js file -->
    <script src="Javascript/dash.js"></script>
</body>
</html>