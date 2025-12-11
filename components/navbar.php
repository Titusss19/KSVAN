<?php
// KSTREET/components/navbar.php

$user = $_SESSION['user'] ?? null;
$activeView = $activeView ?? 'dashboard';

if (!$user) return;

$isAdminOrOwner = $user['role'] === 'admin' || $user['role'] === 'owner';
$isCashier = $user['role'] === 'cashier';
$isManager = $user['role'] === 'manager';
?>

<header class="bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-10 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Left Section - Logo and System Name -->
            <div class="flex items-center space-x-4">
                <div class=" rounded-lg p-2 flex items-center justify-center w-10 h-10">
                    <span class="text-white font-bold text-lg w-30 h-30"><img src="img/kslogo.png" alt="" class="w-12 h-12">
</span>
                </div>
                <div>
                    <h1 class="text-white font-bold text-lg leading-none">K-STREET</h1>
                    
                </div>
            </div>

            <!-- Center Section - Navigation Links -->
            <nav class="flex items-center space-x-1">
                <!-- Dashboard Button - Visible to all -->
                <a href="dashboard.php" 
                   class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 
                   <?php echo $activeView === 'dashboard' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'; ?>"
                   title="Dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="18" height="18" 
                         viewBox="0 0 24 24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2" 
                         stroke-linecap="round" 
                         stroke-linejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span class="text-sm font-medium">Dashboard</span>
                </a>

                <!-- POS Button - Hide if user is owner/admin -->
                <?php if (!$isAdminOrOwner): ?>
                <a href="pos.php" 
                   class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 
                   <?php echo $activeView === 'pos' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'; ?>"
                   title="Point of Sale">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="18" height="18" 
                         viewBox="0 0 24 24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2" 
                         stroke-linecap="round" 
                         stroke-linejoin="round">
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
                   class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 
                   <?php echo $activeView === 'sales' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'; ?>"
                   title="Sales Reports">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="18" height="18" 
                         viewBox="0 0 24 24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2" 
                         stroke-linecap="round" 
                         stroke-linejoin="round">
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        <path d="M12 11h4"/>
                        <path d="M12 16h4"/>
                        <path d="M8 11h.01"/>
                        <path d="M8 16h.01"/>
                    </svg>
                    <span class="text-sm font-medium">Sales Reports</span>
                </a>
                <?php endif; ?>

                <!-- Items Button - Hide for cashier, show for manager/admin/owner -->
                <?php if ($isAdminOrOwner || $isManager): ?>
                <a href="items.php" 
                   class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 
                   <?php echo $activeView === 'items' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'; ?>"
                   title="Inventory">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="18" height="18" 
                         viewBox="0 0 24 24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2" 
                         stroke-linecap="round" 
                         stroke-linejoin="round">
                        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                        <path d="M18 14h-8"/>
                        <path d="M15 18h-5"/>
                        <path d="M10 6h8v4h-8V6Z"/>
                    </svg>
                    <span class="text-sm font-medium">Inventory</span>
                </a>
                <?php endif; ?>
            </nav>

            <!-- Right Section - User Info and Logout -->
            <div class="flex items-center space-x-4">
                <!-- Users Button - Optional (visible to admin/owner) -->
                <?php if ($isAdminOrOwner): ?>
                <a href="users.php" 
                   class="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
                   title="Users">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="18" height="18" 
                         viewBox="0 0 24 24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2" 
                         stroke-linecap="round" 
                         stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span class="text-sm font-medium">Users</span>
                </a>
                <?php endif; ?>

                <!-- Settings Button - Optional (visible to admin/owner) -->
                <?php if ($isAdminOrOwner): ?>
                <a href="settings.php" 
                   class="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
                   title="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="18" height="18" 
                         viewBox="0 0 24 24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2" 
                         stroke-linecap="round" 
                         stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m3.08-3.08l4.24-4.24"/>
                    </svg>
                    <span class="text-sm font-medium">Settings</span>
                </a>
                <?php endif; ?>

                <!-- User Profile Section -->
                <div class="flex items-center space-x-3 pl-4 border-l border-slate-700">
                    <div class="bg-red-600 rounded-lg p-2 flex items-center justify-center w-9 h-9">
                        <span class="text-white font-bold text-sm">
                            <?php echo strtoupper(substr($user['name'] ?? 'U', 0, 2)); ?>
                        </span>
                    </div>
                    <div>
                        <p class="text-white text-sm font-medium"><?php echo htmlspecialchars($user['name'] ?? 'User'); ?></p>
                        <p class="text-gray-400 text-xs capitalize"><?php echo htmlspecialchars($user['role'] ?? ''); ?></p>
                    </div>
                </div>

                <!-- Logout Button -->
                <a href="logout.php" 
                   class="text-gray-300 hover:text-white transition-colors p-2"
                   title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         width="20" height="20" 
                         viewBox="0 0 24 24" 
                         fill="none" 
                         stroke="currentColor" 
                         stroke-width="2" 
                         stroke-linecap="round" 
                         stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</header>