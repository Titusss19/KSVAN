<?php
// KSTREET/components/navbar.php

$user = $_SESSION['user'] ?? null;
$activeView = $activeView ?? 'dashboard';

if (!$user) return;

$isAdminOrOwner = $user['role'] === 'admin' || $user['role'] === 'owner';
$isCashier = $user['role'] === 'cashier';
$isManager = $user['role'] === 'manager';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - K-STREET</title>
    <script src="https://cdn.tailwindcss.com"></script>
     <link rel="stylesheet" href="css/navbar.css">
    
</head><!-- Loading Overlay -->
<div id="page-loader" class="fixed inset-0 bg-slate-900 bg-opacity-50 backdrop-blur-sm z-50 hidden items-center justify-center">
    <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
        <p class="text-white text-sm">Loading...</p>
    </div>
</div>

<header class="bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-50 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Left Section - Logo and System Name -->
            <div class="flex items-center space-x-4">
                <div class="rounded-lg p-2 flex items-center justify-center w-10 h-10">
                    <img src="img/kslogo.png" alt="K-Street Logo" class="w-12 h-12">
                </div>
                <div>
                    <h1 class="text-red-600 font-bold text-xl leading-none">K-STREET</h1>
                </div>
            </div>

            <!-- Center Section - Navigation Links -->
            <nav class="flex items-center space-x-1">
                <!-- Dashboard Button - Visible to all -->
                <a href="dashboard.php" 
                   data-page="dashboard"
                   class="nav-link flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 
                   <?php echo $activeView === 'dashboard' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'; ?>"
                   title="Dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span class="text-sm font-medium">Dashboard</span>
                </a>

                <!-- POS Button - Hide if user is owner/admin -->
                <?php if (!$isAdminOrOwner): ?>
                <a href="pos.php"
                   data-page="pos"
                   class="nav-link flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 
                   <?php echo $activeView === 'pos' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'; ?>"
                   title="Point of Sale">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="8" cy="21" r="1"/>
                        <circle cx="19" cy="21" r="1"/>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg>
                    <span class="text-sm font-medium">POS</span>
                </a>
                <?php endif; ?>

                <!-- Sales Button - Show for ALL users including cashier -->
                <?php if ($isAdminOrOwner || $isManager || $isCashier): ?>
                <a href="sales.php"
                   data-page="sales"
                   class="nav-link flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 
                   <?php echo $activeView === 'sales' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'; ?>"
                   title="Sales Reports">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        <path d="M12 11h4"/>
                        <path d="M12 16h4"/>
                        <path d="M8 11h.01"/>
                        <path d="M8 16h.01"/>
                    </svg>
                    <span class="text-sm font-medium">Reports</span>
                </a>
                <?php endif; ?>

                <!-- Items Button - Hide for cashier, show for manager/admin/owner -->
                <?php if ($isAdminOrOwner || $isManager): ?>
                <a href="items.php"
                   data-page="items"
                   class="nav-link flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 
                   <?php echo $activeView === 'items' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'; ?>"
                   title="Inventory">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                        <path d="M18 14h-8"/>
                        <path d="M15 18h-5"/>
                        <path d="M10 6h8v4h-8V6Z"/>
                    </svg>
                    <span class="text-sm font-medium">Inventory</span>
                </a>
                <?php endif; ?>
            </nav>

                <!-- User Profile Section - CLICKABLE FOR DROPDOWN -->
                <div class="relative">
                    <button id="user-section" 
                            class="flex items-center space-x-3 pl-4 border-l border-slate-700 cursor-pointer hover:bg-slate-700/50 rounded-lg px-3 py-2 transition-all duration-200">
                        <div class="bg-red-600 rounded-lg p-2 flex items-center justify-center w-9 h-9">
                            <span class="user-avatar-text text-white font-bold text-sm">
                                <?php echo strtoupper(substr($user['username'] ?? $user['name'] ?? 'U', 0, 2)); ?>
                            </span>
                        </div>
                        <div class="text-left">
                            <p class="user-display-name text-white text-sm font-medium">
                                <?php echo htmlspecialchars($user['username'] ?? $user['name'] ?? 'User'); ?>
                            </p>
                            <p class="user-display-role text-gray-400 text-xs capitalize">
                                <?php echo htmlspecialchars($user['role'] ?? ''); ?>
                            </p>
                        </div>
                        <!-- Dropdown Arrow -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 transition-transform duration-200" id="dropdown-arrow">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div id="user-dropdown" 
                         class="hidden absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
                        <!-- User Info -->
                        <div class="px-4 py-3 border-b border-slate-700">
                            <p class="text-white font-medium text-sm" id="dropdown-username">
                                <?php echo htmlspecialchars($user['username'] ?? $user['name'] ?? 'User'); ?>
                            </p>
                            <p class="text-gray-400 text-xs mt-1" id="dropdown-email">
                                <?php echo htmlspecialchars($user['email'] ?? ''); ?>
                            </p>
                            <p class="text-gray-500 text-xs mt-1">
                                Branch: <span class="text-red-400"><?php echo htmlspecialchars($user['branch'] ?? 'main'); ?></span>
                            </p>
                        </div>

                                    <!-- Account Settings Link -->
<a href="#" 
   id="dropdown-account-settings"
   class="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors duration-200">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
    <span class="text-sm font-medium">Account Settings</span>
</a>

<div class="border-t border-slate-700 my-1"></div>

<!-- Logout stays here -->

                        <!-- Logout Button -->
                        <a href="logout.php" 
                           id="dropdown-logout"
                           class="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            <span class="text-sm font-medium">Logout</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Account Settings Modal -->
<div id="account-settings-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
    <div class="bg-slate-800 rounded-lg shadow-xl w-full max-w-[95%] sm:max-w-md md:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
            <h3 class="text-white font-semibold text-base sm:text-lg">Account Settings</h3>
            <button id="close-modal" class="text-gray-400 hover:text-white p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>

        <!-- Modal Body -->
        <div class="p-3 sm:p-6 space-y-3 sm:space-y-4">
            
            <!-- Username -->
            <div>
                <label class="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Username</label>
                <input type="text" id="edit-username" 
                       class="w-full bg-slate-700 text-white px-2 sm:px-3 py-2 text-sm sm:text-base rounded border border-slate-600 focus:border-red-500 focus:outline-none">
            </div>

            <!-- Email (Read-only) -->
            <div>
                <label class="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Email</label>
                <input type="email" id="edit-email" readonly
                       class="w-full bg-slate-900 text-gray-400 px-2 sm:px-3 py-2 text-sm sm:text-base rounded border border-slate-600 cursor-not-allowed">
            </div>

            <!-- Current Password -->
            <div>
                <label class="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Current Password</label>
                <input type="password" id="current-password" placeholder="Enter to change password"
                       class="w-full bg-slate-700 text-white px-2 sm:px-3 py-2 text-sm sm:text-base rounded border border-slate-600 focus:border-red-500 focus:outline-none">
            </div>

            <!-- New Password -->
            <div id="new-password-group" class="hidden">
                <label class="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">New Password</label>
                <input type="password" id="new-password" placeholder="Minimum 6 characters"
                       class="w-full bg-slate-700 text-white px-2 sm:px-3 py-2 text-sm sm:text-base rounded border border-slate-600 focus:border-red-500 focus:outline-none">
            </div>

            <!-- Confirm Password -->
            <div id="confirm-password-group" class="hidden">
                <label class="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Confirm New Password</label>
                <input type="password" id="confirm-password" placeholder="Re-enter new password"
                       class="w-full bg-slate-700 text-white px-2 sm:px-3 py-2 text-sm sm:text-base rounded border border-slate-600 focus:border-red-500 focus:outline-none">
            </div>

            <!-- Void PIN (Manager/Admin only) -->
            <div id="void-pin-section" class="hidden">
                <label class="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Void PIN (4-6 digits)</label>
                <input type="password" id="edit-void-pin" placeholder="Enter new PIN (optional)" maxlength="6"
                       class="w-full bg-slate-700 text-white px-2 sm:px-3 py-2 text-sm sm:text-base rounded border border-slate-600 focus:border-red-500 focus:outline-none">
                <p class="text-xs text-gray-500 mt-1">Leave blank to keep current PIN</p>
            </div>

            <!-- Role & Branch (Read-only) - Stacks on mobile -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                    <label class="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Role</label>
                    <input type="text" id="edit-role" readonly
                           class="w-full bg-slate-900 text-gray-400 px-2 sm:px-3 py-2 text-sm sm:text-base rounded border border-slate-600 cursor-not-allowed capitalize">
                </div>
                <div>
                    <label class="block text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Branch</label>
                    <input type="text" id="edit-branch" readonly
                           class="w-full bg-slate-900 text-gray-400 px-2 sm:px-3 py-2 text-sm sm:text-base rounded border border-slate-600 cursor-not-allowed">
                </div>
             </div>

        </div>

        <!-- Modal Footer - Remove sticky, add proper spacing -->
        <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 border-t border-slate-700 bg-slate-800">
            <button type="button" id="cancel-btn" class="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                Cancel
            </button>
            <button type="button" id="save-settings-btn" class="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Save Changes
            </button>
        </div>
        
    </div>
</div>

</header>

<!-- Include navbar JavaScript -->
<script src="Javascript/navbar.js"></script>

