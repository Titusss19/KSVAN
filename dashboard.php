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

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - K-STREET</title>
    <script src="https://cdn.tailwindcss.com"></script>
   <link rel="stylesheet" href="css/dashboard.css">
</head>
<body>
  <?php include 'components/navbar.php'; ?>

    <!-- Main Content -->
    <main class="py-6 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
            <!-- Welcome Banner -->
            <div class="mb-6 rounded-xl shadow-lg p-6" style="background-color: #FF001B;">
                <h1 class="text-2xl font-bold text-white">Welcome, Manager Juan!</h1>
                <p class="text-blue-100 mt-1">Here's what's happening with your business today.</p>
                <div class="mt-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-200">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span class="text-blue-200 text-sm">Branch: Main Street</span>
                </div>
            </div>

            <!-- Header Controls -->
            <div class="mb-6 flex justify-between items-center">
                <h1 class="text-2xl font-bold text-gray-800"></h1>
                <div class="flex gap-2 items-center">
                    <div class="relative">
                        <button onclick="toggleBranchDropdown()" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path>
                            </svg>
                            <span id="branchText">All Branches</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="chevronIcon">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        <div id="branchDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 hidden">
                            <div class="py-2">
                                <a href="#" onclick="selectBranch('all', event)" class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    All Branches
                                    <span class="ml-auto text-red-500" id="allCheck">✓</span>
                                </a>
                                <div class="border-t border-gray-100 my-1"></div>
                                <a href="#" onclick="selectBranch('Main Street', event)" class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    Main Street
                                    <span id="mainCheck"></span>
                                </a>
                                <a href="#" onclick="selectBranch('Downtown', event)" class="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    Downtown
                                    <span id="downCheck"></span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <button onclick="refreshAll()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm transition-all flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6"></path>
                            <path d="M1 20v-6h6"></path>
                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                        </svg>
                        Refresh All
                    </button>

                    <button onclick="goToAttendance()" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Attendance
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <!-- Net Sales -->
                <div class="stat-card" style="background-color: #FF5C6E;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-pink-200 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-pink-600">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-3xl font-bold text-white mb-1">₱45,230.50</div>
                    <div class="text-sm text-white mb-2">Net Sales</div>
                    <div class="text-xs text-white font-medium">All Time</div>
                </div>

                <!-- Gross Sales -->
                <div class="stat-card" style="background-color: #FEC600;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-pink-600">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-3xl font-bold text-white mb-1">₱52,890.00</div>
                    <div class="text-sm text-white mb-2">Gross Sales</div>
                    <div class="text-xs text-white font-medium">Voided: -₱7,659.50</div>
                </div>

                <!-- Today Transactions -->
                <div class="stat-card" style="background-color: #1E2C2E;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-orange-600">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-3xl font-bold text-white mb-1">24</div>
                    <div class="text-sm text-white mb-2">Today Transactions</div>
                    <div class="text-xs text-white font-medium">
                        Net: ₱12,450.00 today
                        <span class="block text-orange-300">Voided: -₱1,250.00</span>
                    </div>
                </div>

                <!-- Inventory Value -->
                <div class="stat-card" style="background-color: #4B3D79; border: 1px solid black;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-3xl font-bold text-white mb-1">₱125,450.00</div>
                    <div class="text-sm text-white mb-2">Inventory Value</div>
                    <div class="text-xs text-white font-medium">1,245 items in stock</div>
                </div>

                <!-- Active Employees -->
                <div class="stat-card" style="background-color: #A3C47C;">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-600">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="text-3xl font-bold text-white mb-1">12</div>
                    <div class="text-sm text-white mb-2">Active Employees</div>
                    <div class="text-xs text-white font-medium">Currently working</div>
                </div>
            </div>

            <!-- Main Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Announcements -->
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-700">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <h3 class="text-lg font-bold text-gray-800">Announcements</h3>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="refreshAnnouncements()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M23 4v6h-6"></path>
                                    <path d="M1 20v-6h6"></path>
                                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                                </svg>
                            </button>
                            <button onclick="openAnnouncementModal()" class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-black hover:to-black rounded-lg flex items-center justify-center shadow-md transition-all transform hover:scale-105">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div class="p-4 border-b border-gray-100">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <h4 class="font-semibold text-gray-800 text-sm">Admin</h4>
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs text-gray-500">Just now</span>
                                            <span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Global</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="p-4">
                                <h3 class="font-bold text-gray-800 text-lg mb-2">Welcome to K-STREET</h3>
                                <p class="text-gray-700 text-sm mb-3">Welcome to the K-STREET management system. Please familiarize yourself with all features.</p>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Information</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div class="flex flex-wrap gap-3 mb-6">
                        <a href="#" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium text-sm">Open POS</a>
                        <a href="#" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm">View Sales Report</a>
                        <a href="#" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium text-sm">Manage Inventory</a>
                    </div>

                    <div class="pt-6 border-t border-gray-200">
                        <h4 class="font-semibold text-gray-700 mb-3">Recent Activity</h4>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm text-gray-800">New sale: ₱12,450.00</p>
                                <p class="text-xs text-gray-500">Today at 2:45 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Employee List -->
            <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-800">System Users</h3>
                    <div class="flex gap-2">
                        <button onclick="refreshUsers()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm transition-all flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                            </svg>
                            Refresh
                        </button>
                        <button onclick="openAddUserModal()" class="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-105 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            Add User
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b-2 border-gray-200 bg-gray-50">
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Username</th>
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Void PIN</th>
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Branch</th>
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td class="py-4 px-4 text-sm text-gray-600 font-medium">1</td>
                                <td class="py-4 px-4 text-sm text-gray-800">juan@kstreet.com</td>
                                <td class="py-4 px-4 text-sm text-gray-800">juan_sales</td>
                                <td class="py-4 px-4">
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                        </svg>
                                        Cashier
                                    </span>
                                </td>
                                <td class="py-4 px-4">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">N/A</span>
                                </td>
                                <td class="py-4 px-4">
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Main Street</span>
                                </td>
                                <td class="py-4 px-4 text-sm text-gray-600">Jan 15, 2024</td>
                                <td class="py-4 px-4">
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                        <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                        Active
                                    </span>
                                </td>
                                <td class="py-4 px-4">
                                    <div class="flex items-center gap-2">
                                        <button onclick="openEditModal(1)" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button onclick="openDeleteModal(1)" class="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td class="py-4 px-4 text-sm text-gray-600 font-medium">2</td>
                                <td class="py-4 px-4 text-sm text-gray-800">maria@kstreet.com</td>
                                <td class="py-4 px-4 text-sm text-gray-800">maria_manager</td>
                                <td class="py-4 px-4">
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-red-700 border border-red-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
                                            <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"></path>
                                        </svg>
                                        Manager
                                    </span>
                                </td>
                                <td class="py-4 px-4">
                                    <div class="flex items-center gap-1">
                                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                            </svg>
                                            PIN Set
                                        </span>
                                    </div>
                                </td>
                                <td class="py-4 px-4">
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Downtown</span>
                                </td>
                                <td class="py-4 px-4 text-sm text-gray-600">Dec 20, 2023</td>
                                <td class="py-4 px-4">
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                        <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                        Active
                                    </span>
                                </td>
                                <td class="py-4 px-4">
                                    <div class="flex items-center gap-2">
                                        <button onclick="openEditModal(2)" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button onclick="openDeleteModal(2)" class="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </div>
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
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">New Announcement</h2>
                <button onclick="closeAnnouncementModal()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <select class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="info">Info (Blue)</option>
                        <option value="success">Success (Green)</option>
                        <option value="warning">Warning (Yellow)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input type="text" placeholder="Enter announcement title" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea placeholder="Enter announcement message" rows="4" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"></textarea>
                </div>

                <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border-2 border-blue-200">
                    <p class="text-sm text-blue-700 font-bold"><span class="font-extrabold">GLOBAL ANNOUNCEMENT</span> - This will be visible to ALL branches automatically</p>
                </div>

                <div class="flex gap-3 pt-2">
                    <button onclick="closeAnnouncementModal()" class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Cancel</button>
                    <button onclick="postAnnouncement()" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">Post Announcement</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Add User Modal -->
    <div id="addUserModal" class="modal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">Add New User</h2>
                <button onclick="closeAddUserModal()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="space-y-4">
                <input type="email" placeholder="Email Address" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all">
                <input type="text" placeholder="Username" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all">
                <input type="password" placeholder="Password (min. 6 characters)" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all">
                <input type="password" placeholder="Confirm Password" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all">
                
                <select class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all">
                    <option>Cashier</option>
                    <option>Manager</option>
                    <option>Owner</option>
                </select>

                <input type="text" placeholder="Branch name (e.g., Main, Branch1)" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all">

                <select class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all">
                    <option>Active</option>
                    <option>Inactive</option>
                </select>

                <div class="flex gap-3 pt-2">
                    <button onclick="closeAddUserModal()" class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Cancel</button>
                    <button onclick="addUser()" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">Add User</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">Edit User</h2>
                <button onclick="closeEditModal()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="space-y-4">
                <input type="text" placeholder="Username" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                <input type="email" placeholder="Email" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                
                <select class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                    <option>Cashier</option>
                    <option>Manager</option>
                    <option>Owner</option>
                </select>

                <input type="text" placeholder="Branch name" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">

                <select class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                    <option>Active</option>
                    <option>Inactive</option>
                </select>

                <div class="flex gap-3 pt-2">
                    <button onclick="closeEditModal()" class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Cancel</button>
                    <button onclick="updateUser()" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">Update</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">Delete User</h2>
                <button onclick="closeDeleteModal()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="mb-6">
                <div class="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </div>
                <p class="text-center text-gray-700 mb-2">Are you sure you want to delete this user?</p>
                <p class="text-center text-sm text-gray-600"><strong>juan@kstreet.com</strong></p>
                <p class="text-center text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>

            <div class="flex gap-3">
                <button onclick="closeDeleteModal()" class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Cancel</button>
                <button onclick="confirmDelete()" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">Delete</button>
            </div>
        </div>
    </div>

    <script>
      

        // Branch Dropdown
        function toggleBranchDropdown() {
            const dropdown = document.getElementById('branchDropdown');
            const chevron = document.getElementById('chevronIcon');
            dropdown.classList.toggle('hidden');
            chevron.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }

        function selectBranch(branch, event) {
            event.preventDefault();
            document.getElementById('branchText').textContent = branch === 'all' ? 'All Branches' : branch;
            document.getElementById('branchDropdown').classList.add('hidden');
            
            // Update checkmarks
            document.getElementById('allCheck').textContent = branch === 'all' ? '✓' : '';
            document.getElementById('mainCheck').textContent = branch === 'Main Street' ? '✓' : '';
            document.getElementById('downCheck').textContent = branch === 'Downtown' ? '✓' : '';
        }

        // Announcement Modal
        function openAnnouncementModal() {
            document.getElementById('announcementModal').classList.add('active');
        }

        function closeAnnouncementModal() {
            document.getElementById('announcementModal').classList.remove('active');
        }

        function postAnnouncement() {
            alert('Announcement posted successfully!');
            closeAnnouncementModal();
        }

        function refreshAnnouncements() {
            alert('Announcements refreshed');
        }

        // Add User Modal
        function openAddUserModal() {
            document.getElementById('addUserModal').classList.add('active');
        }

        function closeAddUserModal() {
            document.getElementById('addUserModal').classList.remove('active');
        }

        function addUser() {
            alert('User added successfully!');
            closeAddUserModal();
        }

        // Edit Modal
        function openEditModal(userId) {
            document.getElementById('editModal').classList.add('active');
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.remove('active');
        }

        function updateUser() {
            alert('User updated successfully!');
            closeEditModal();
        }

        // Delete Modal
        function openDeleteModal(userId) {
            document.getElementById('deleteModal').classList.add('active');
        }

        function closeDeleteModal() {
            document.getElementById('deleteModal').classList.remove('active');
        }

        function confirmDelete() {
            alert('User deleted successfully!');
            closeDeleteModal();
        }

        // General Actions
        function refreshAll() {
            alert('Dashboard refreshed');
        }

        function refreshUsers() {
            alert('Users refreshed');
        }

        function goToAttendance() {
            alert('Navigating to Attendance page');
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('branchDropdown');
            const button = event.target.closest('button');
            
            if (dropdown && !dropdown.contains(event.target) && button && button.onclick !== toggleBranchDropdown) {
                dropdown.classList.add('hidden');
            }
        });

        const API_BASE = 'php/dashboard_api.php';
let currentBranch = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadUsers();
    loadAnnouncements();
});

// ===== STATS =====
async function loadStats() {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getStats&branch=${currentBranch}`
        });
        const data = await response.json();
        
        if (data.success) {
            updateStatsDisplay(data.data);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStatsDisplay(stats) {
    // Update card values (adapt selectors to your HTML)
    document.querySelectorAll('[data-stat="grossSales"]').forEach(el => {
        el.textContent = '₱' + stats.grossSales.toLocaleString('en-US', {minimumFractionDigits: 2});
    });
    
    document.querySelectorAll('[data-stat="netSales"]').forEach(el => {
        el.textContent = '₱' + stats.netSales.toLocaleString('en-US', {minimumFractionDigits: 2});
    });
    
    document.querySelectorAll('[data-stat="todayTransactions"]').forEach(el => {
        el.textContent = stats.todayTransactions;
    });
    
    document.querySelectorAll('[data-stat="inventoryValue"]').forEach(el => {
        el.textContent = '₱' + stats.inventoryValue.toLocaleString('en-US', {minimumFractionDigits: 2});
    });
    
    document.querySelectorAll('[data-stat="activeEmployees"]').forEach(el => {
        el.textContent = stats.activeEmployees;
    });
}

// ===== USERS =====
async function loadUsers() {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getUsers&branch=${currentBranch}`
        });
        const data = await response.json();
        
        if (data.success) {
            displayUsers(data.data);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers(users) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50 transition-colors';
        row.innerHTML = `
            <td class="py-4 px-4 text-sm text-gray-600 font-medium">${user.id}</td>
            <td class="py-4 px-4 text-sm text-gray-800">${user.email}</td>
            <td class="py-4 px-4 text-sm text-gray-800">${user.username || 'N/A'}</td>
            <td class="py-4 px-4">
                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold 
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}">
                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td class="py-4 px-4"><span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">N/A</span></td>
            <td class="py-4 px-4"><span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">${user.branch}</span></td>
            <td class="py-4 px-4 text-sm text-gray-600">${new Date(user.created_at).toLocaleDateString()}</td>
            <td class="py-4 px-4">
                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold 
                    ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                    <div class="w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'} mr-2"></div>
                    ${user.status}
                </span>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                    <button onclick="openEditModal(${user.id})" class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button onclick="openDeleteModal(${user.id}, '${user.email}')" class="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function addUser() {
    const email = prompt('Email:');
    const username = prompt('Username:');
    const password = prompt('Password:');
    const branch = prompt('Branch:', 'main');

    if (!email || !password) return;

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=addUser&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&branch=${branch}&role=cashier&status=Active`
        });
        const data = await response.json();
        
        if (data.success) {
            alert('User added successfully');
            loadUsers();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

async function updateUser(id) {
    const username = prompt('Username:');
    const email = prompt('Email:');
    const branch = prompt('Branch:', 'main');

    if (!username || !email) return;

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=updateUser&id=${id}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&branch=${branch}&role=cashier&status=Active`
        });
        const data = await response.json();
        
        if (data.success) {
            alert('User updated successfully');
            loadUsers();
            closeEditModal();
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure?')) return;

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=deleteUser&id=${id}`
        });
        const data = await response.json();
        
        if (data.success) {
            alert('User deleted successfully');
            loadUsers();
            closeDeleteModal();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// ===== ANNOUNCEMENTS =====
async function loadAnnouncements() {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getAnnouncements&branch=${currentBranch}`
        });
        const data = await response.json();
        
        if (data.success) {
            displayAnnouncements(data.data);
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
    }
}

function displayAnnouncements(announcements) {
    const container = document.querySelector('[data-announcements-container]');
    if (!container) return;

    container.innerHTML = '';
    announcements.forEach(ann => {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow';
        div.innerHTML = `
            <div class="p-4 border-b border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-semibold text-gray-800 text-sm">${ann.author}</h4>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">${new Date(ann.created_at).toLocaleString()}</span>
                            ${ann.is_global ? '<span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Global</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-gray-800 text-lg mb-2">${ann.title}</h3>
                <p class="text-gray-700 text-sm">${ann.message}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

async function postAnnouncement() {
    const title = document.querySelector('[data-announcement-title]')?.value;
    const message = document.querySelector('[data-announcement-message']?.value;
    const type = document.querySelector('[data-announcement-type]')?.value || 'info';

    if (!title || !message) {
        alert('Title and message required');
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=postAnnouncement&title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}&type=${type}`
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Announcement posted');
            closeAnnouncementModal();
            loadAnnouncements();
        }
    } catch (error) {
        console.error('Error posting announcement:', error);
    }
}

// ===== MODALS =====
function openEditModal(userId) {
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function openDeleteModal(userId, email) {
    document.getElementById('deleteModal').classList.add('active');
    document.querySelector('[data-delete-email]').textContent = email;
    window.deleteUserId = userId;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

function confirmDelete() {
    deleteUser(window.deleteUserId);
}

function refreshAll() {
    loadStats();
    loadUsers();
    loadAnnouncements();
}

function selectBranch(branch) {
    currentBranch = branch;
    loadStats();
    loadUsers();
    loadAnnouncements();
}
    </script>
</body>
</html>