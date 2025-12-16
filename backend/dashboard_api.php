<?php
// backend/dashboard_api.php - UPDATED WITH VOID PIN SUPPORT
session_start();

require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
ini_set('display_errors', 0);

$user = $_SESSION['user'];
$action = $_POST['action'] ?? '';

global $pdo;

// ===== HELPER FUNCTIONS =====
function getUserBranch($user) {
    return $user['branch'] ?? 'main';
}

function hasPermission($user, $requiredRole) {
    $userRole = $user['role'] ?? 'cashier';
    $roleHierarchy = ['cashier' => 1, 'manager' => 2, 'admin' => 3, 'owner' => 4];
    return ($roleHierarchy[$userRole] ?? 0) >= ($roleHierarchy[$requiredRole] ?? 0);
}

function formatResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    return json_encode($response);
}

function buildBranchFilter($selectedBranch, $userBranch, $userRole) {
    if ($selectedBranch !== 'all' && ($userRole === 'admin' || $userRole === 'owner')) {
        return ['WHERE branch = ?', [$selectedBranch]];
    } elseif ($selectedBranch === 'all' && ($userRole !== 'admin' && $userRole !== 'owner')) {
        return ['WHERE branch = ?', [$userBranch]];
    } elseif ($selectedBranch !== 'all') {
        return ['WHERE branch = ?', [$selectedBranch]];
    }
    return ['', []];
}

// ===== GET DASHBOARD STATS =====
if ($action === 'getStats') {
    $selectedBranch = $_POST['branch'] ?? 'all';
    $userBranch = getUserBranch($user);
    
    try {
        $stats = [
            'grossSales' => 0,
            'netSales' => 0,
            'voidedAmount' => 0,
            'todaySales' => 0,
            'todayGrossSales' => 0,
            'todayVoidedAmount' => 0,
            'todayTransactions' => 0,
            'totalSales' => 0,
            'inventoryValue' => 0,
            'inventoryItemCount' => 0,
            'totalTransactions' => 0,
            'activeEmployees' => 0,
            'voidedOrdersCount' => 0,
            'todayVoidedOrdersCount' => 0
        ];
        
        list($whereClause, $params) = buildBranchFilter($selectedBranch, $userBranch, $user['role']);
        
        // 1. Calculate sales stats
        $salesQuery = "SELECT 
            COALESCE(SUM(total), 0) as total_sales,
            COALESCE(SUM(CASE WHEN is_void = 1 THEN total ELSE 0 END), 0) as voided_amount,
            COUNT(*) as total_orders,
            COALESCE(SUM(CASE WHEN is_void = 1 THEN 1 ELSE 0 END), 0) as voided_count
            FROM orders $whereClause";
        
        $stmt = $pdo->prepare($salesQuery);
        $stmt->execute($params);
        $salesResult = $stmt->fetch();
        
        if ($salesResult) {
            $stats['grossSales'] = floatval($salesResult['total_sales'] ?? 0);
            $stats['voidedAmount'] = floatval($salesResult['voided_amount'] ?? 0);
            $stats['netSales'] = $stats['grossSales'] - $stats['voidedAmount'];
            $stats['totalSales'] = $stats['netSales'];
            $stats['voidedOrdersCount'] = intval($salesResult['voided_count'] ?? 0);
            $stats['totalTransactions'] = intval($salesResult['total_orders'] ?? 0) - $stats['voidedOrdersCount'];
        }
        
        // 2. Today's stats
        $today = date('Y-m-d');
        if ($whereClause) {
            $todayQuery = "SELECT 
                COALESCE(SUM(total), 0) as today_sales,
                COALESCE(SUM(CASE WHEN is_void = 1 THEN total ELSE 0 END), 0) as today_voided,
                COUNT(*) as today_orders,
                COALESCE(SUM(CASE WHEN is_void = 1 THEN 1 ELSE 0 END), 0) as today_voided_count
                FROM orders 
                WHERE DATE(created_at) = ? AND " . substr($whereClause, 6);
            $todayParams = array_merge([$today], $params);
        } else {
            $todayQuery = "SELECT 
                COALESCE(SUM(total), 0) as today_sales,
                COALESCE(SUM(CASE WHEN is_void = 1 THEN total ELSE 0 END), 0) as today_voided,
                COUNT(*) as today_orders,
                COALESCE(SUM(CASE WHEN is_void = 1 THEN 1 ELSE 0 END), 0) as today_voided_count
                FROM orders 
                WHERE DATE(created_at) = ?";
            $todayParams = [$today];
        }
        
        $stmt = $pdo->prepare($todayQuery);
        $stmt->execute($todayParams);
        $todayResult = $stmt->fetch();
        
        if ($todayResult) {
            $stats['todayGrossSales'] = floatval($todayResult['today_sales'] ?? 0);
            $stats['todayVoidedAmount'] = floatval($todayResult['today_voided'] ?? 0);
            $stats['todaySales'] = $stats['todayGrossSales'] - $stats['todayVoidedAmount'];
            $stats['todayTransactions'] = intval($todayResult['today_orders'] ?? 0) - intval($todayResult['today_voided_count'] ?? 0);
            $stats['todayVoidedOrdersCount'] = intval($todayResult['today_voided_count'] ?? 0);
        }
        
        // 3. Inventory value
        try {
            $inventoryQuery = "SELECT 
                COALESCE(SUM(total_price), 0) as total_value,
                COUNT(*) as item_count
                FROM inventory_items $whereClause";
            
            $stmt = $pdo->prepare($inventoryQuery);
            $stmt->execute($params);
            $inventoryResult = $stmt->fetch();
            
            if ($inventoryResult) {
                $stats['inventoryValue'] = floatval($inventoryResult['total_value'] ?? 0);
                $stats['inventoryItemCount'] = intval($inventoryResult['item_count'] ?? 0);
            }
        } catch (Exception $e) {
            $stats['inventoryValue'] = 0;
            $stats['inventoryItemCount'] = 0;
        }
        
        // 4. Active employees
        if ($whereClause) {
            $employeesQuery = "SELECT COUNT(*) as active_count FROM users 
                WHERE status = 'Active' AND " . substr($whereClause, 6);
        } else {
            $employeesQuery = "SELECT COUNT(*) as active_count FROM users WHERE status = 'Active'";
        }
        
        $stmt = $pdo->prepare($employeesQuery);
        $stmt->execute($params);
        $employeesResult = $stmt->fetch();
        
        if ($employeesResult) {
            $stats['activeEmployees'] = intval($employeesResult['active_count'] ?? 0);
        }
        
        echo formatResponse(true, 'Stats retrieved successfully', $stats);
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error fetching stats: ' . $e->getMessage());
    }
}

// ===== GET USERS =====
elseif ($action === 'getUsers') {
    $selectedBranch = $_POST['branch'] ?? 'all';
    
    try {
        if ($user['role'] === 'admin' || $user['role'] === 'owner') {
            if ($selectedBranch === 'all') {
                $query = "SELECT id, email, username, role, status, branch, created_at, void_pin FROM users ORDER BY created_at DESC";
                $stmt = $pdo->prepare($query);
                $stmt->execute();
            } else {
                $query = "SELECT id, email, username, role, status, branch, created_at, void_pin FROM users WHERE branch = ? ORDER BY created_at DESC";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$selectedBranch]);
            }
        } else {
            $userBranch = getUserBranch($user);
            $query = "SELECT id, email, username, role, status, branch, created_at, void_pin FROM users WHERE branch = ? ORDER BY created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$userBranch]);
        }
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($users as &$userRow) {
            if ($userRow['role'] === 'owner') {
                $userRow['role'] = 'admin';
            }
        }
        
        echo formatResponse(true, 'Users retrieved successfully', $users);
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error fetching users: ' . $e->getMessage());
    }
}

// ===== ADD USER - WITH VOID PIN SUPPORT =====
elseif ($action === 'addUser') {
    if (!hasPermission($user, 'manager')) {
        echo formatResponse(false, 'Insufficient permissions');
        exit();
    }
    
    $email = $_POST['email'] ?? '';
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $role = $_POST['role'] ?? 'cashier';
    $status = $_POST['status'] ?? 'Active';
    $branch = $_POST['branch'] ?? getUserBranch($user);
    $void_pin = $_POST['void_pin'] ?? '';
    
    if (!$email || !$password || !$confirmPassword) {
        echo formatResponse(false, 'Email and password are required');
        exit();
    }
    
    if ($password !== $confirmPassword) {
        echo formatResponse(false, 'Passwords do not match');
        exit();
    }
    
    if (strlen($password) < 6) {
        echo formatResponse(false, 'Password must be at least 6 characters');
        exit();
    }
    
    try {
        $checkQuery = "SELECT id FROM users WHERE email = ?";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->execute([$email]);
        
        if ($checkStmt->rowCount() > 0) {
            echo formatResponse(false, 'Email already exists');
            exit();
        }
        
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // ===== VOID PIN HANDLING =====
        $hashedVoidPin = null;
        if ($void_pin && ($role === 'manager' || $role === 'admin')) {
            // Validate void_pin
            if (strlen($void_pin) < 4) {
                echo formatResponse(false, 'Void PIN must be at least 4 digits');
                exit();
            }
            if (!preg_match('/^\d+$/', $void_pin)) {
                echo formatResponse(false, 'Void PIN must contain only numbers');
                exit();
            }
            $hashedVoidPin = password_hash($void_pin, PASSWORD_DEFAULT);
        }
        
        $dbRole = $role === 'admin' ? 'owner' : $role;
        
        $insertQuery = "INSERT INTO users (email, username, password, role, status, branch, void_pin, created_at) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        $insertStmt = $pdo->prepare($insertQuery);
        $insertStmt->execute([$email, $username, $hashedPassword, $dbRole, $status, $branch, $hashedVoidPin]);
        
        if ($insertStmt->rowCount() > 0) {
            echo formatResponse(true, 'User added successfully');
        } else {
            echo formatResponse(false, 'Failed to add user');
        }
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error adding user: ' . $e->getMessage());
    }
}

// ===== UPDATE USER - WITH VOID PIN SUPPORT =====
elseif ($action === 'updateUser') {
    if (!hasPermission($user, 'manager')) {
        echo formatResponse(false, 'Insufficient permissions');
        exit();
    }
    
    $id = $_POST['id'] ?? 0;
    $email = $_POST['email'] ?? '';
    $username = $_POST['username'] ?? '';
    $role = $_POST['role'] ?? 'cashier';
    $status = $_POST['status'] ?? 'Active';
    $branch = $_POST['branch'] ?? getUserBranch($user);
    $void_pin = $_POST['void_pin'] ?? '';
    
    try {
        $dbRole = $role === 'admin' ? 'owner' : $role;
        
        // ===== VOID PIN HANDLING =====
        $hashedVoidPin = null;
        $updateVoidPin = false;
        
        if (isset($_POST['void_pin']) && $_POST['void_pin'] !== '') {
            // User provided a new void_pin
            if ($dbRole === 'manager' || $dbRole === 'owner') {
                if (strlen($void_pin) < 4) {
                    echo formatResponse(false, 'Void PIN must be at least 4 digits');
                    exit();
                }
                if (!preg_match('/^\d+$/', $void_pin)) {
                    echo formatResponse(false, 'Void PIN must contain only numbers');
                    exit();
                }
                $hashedVoidPin = password_hash($void_pin, PASSWORD_DEFAULT);
                $updateVoidPin = true;
            }
        } else if (isset($_POST['void_pin']) && $_POST['void_pin'] === '') {
            // User explicitly cleared void_pin
            $hashedVoidPin = null;
            $updateVoidPin = true;
        }
        // If void_pin is not in POST, we don't update it
        
        if ($updateVoidPin) {
            // Update with void_pin
            $updateQuery = "UPDATE users SET email = ?, username = ?, role = ?, status = ?, branch = ?, void_pin = ? WHERE id = ?";
            $stmt = $pdo->prepare($updateQuery);
            $stmt->execute([$email, $username, $dbRole, $status, $branch, $hashedVoidPin, $id]);
        } else {
            // Update without changing void_pin
            $updateQuery = "UPDATE users SET email = ?, username = ?, role = ?, status = ?, branch = ? WHERE id = ?";
            $stmt = $pdo->prepare($updateQuery);
            $stmt->execute([$email, $username, $dbRole, $status, $branch, $id]);
        }
        
        if ($stmt->rowCount() > 0) {
            echo formatResponse(true, 'User updated successfully');
        } else {
            echo formatResponse(false, 'No changes made or user not found');
        }
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error updating user: ' . $e->getMessage());
    }
}

// ===== DELETE USER =====
elseif ($action === 'deleteUser') {
    if (!hasPermission($user, 'manager')) {
        echo formatResponse(false, 'Insufficient permissions');
        exit();
    }
    
    $id = $_POST['id'] ?? 0;
    
    try {
        if ($user['role'] !== 'admin' && $user['role'] !== 'owner') {
            $userBranch = getUserBranch($user);
            $checkQuery = "SELECT id FROM users WHERE id = ? AND branch = ?";
            $checkStmt = $pdo->prepare($checkQuery);
            $checkStmt->execute([$id, $userBranch]);
            
            if ($checkStmt->rowCount() === 0) {
                echo formatResponse(false, 'You can only delete users from your own branch');
                exit();
            }
        }
        
        $deleteQuery = "DELETE FROM users WHERE id = ?";
        $deleteStmt = $pdo->prepare($deleteQuery);
        $deleteStmt->execute([$id]);
        
        if ($deleteStmt->rowCount() > 0) {
            echo formatResponse(true, 'User deleted successfully');
        } else {
            echo formatResponse(false, 'User not found');
        }
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error deleting user: ' . $e->getMessage());
    }
}

// ===== GET ANNOUNCEMENTS =====
elseif ($action === 'getAnnouncements') {
    $selectedBranch = $_POST['branch'] ?? 'all';
    $userBranch = getUserBranch($user);
    $userRole = $user['role'] ?? 'cashier';
    
    try {
        if (($userRole === 'admin' || $userRole === 'owner') && $selectedBranch !== 'all') {
            $query = "SELECT * FROM announcements WHERE is_global = 1 OR branch = ? ORDER BY created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$selectedBranch]);
        } elseif ($userRole === 'admin' || $userRole === 'owner') {
            $query = "SELECT * FROM announcements ORDER BY created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute();
        } else {
            $query = "SELECT * FROM announcements WHERE is_global = 1 OR branch = ? ORDER BY created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$userBranch]);
        }
        
        $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo formatResponse(true, 'Announcements retrieved successfully', $announcements);
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error fetching announcements: ' . $e->getMessage());
    }
}

// ===== POST ANNOUNCEMENT =====
elseif ($action === 'postAnnouncement') {
    $title = $_POST['title'] ?? '';
    $message = $_POST['message'] ?? '';
    $type = $_POST['type'] ?? 'info';
    
    if (!$title || !$message) {
        echo formatResponse(false, 'Title and message are required');
        exit();
    }
    
    $userBranch = getUserBranch($user);
    $userRole = $user['role'] ?? 'cashier';
    $author = $user['email'] ?? 'Admin';
    
    $isGlobal = ($userRole === 'admin' || $userRole === 'owner') ? 1 : 0;
    $branch = $isGlobal ? null : $userBranch;
    
    try {
        $query = "INSERT INTO announcements (title, message, type, branch, is_global, author, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$title, $message, $type, $branch, $isGlobal, $author]);
        
        if ($stmt->rowCount() > 0) {
            echo formatResponse(true, 'Announcement posted successfully');
        } else {
            echo formatResponse(false, 'Failed to post announcement');
        }
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error posting announcement: ' . $e->getMessage());
    }
}

// ===== GET BRANCHES =====
elseif ($action === 'getBranches') {
    try {
        if ($user['role'] === 'admin' || $user['role'] === 'owner') {
            $query = "SELECT DISTINCT branch FROM users WHERE branch IS NOT NULL AND branch != '' ORDER BY branch";
            $stmt = $pdo->prepare($query);
            $stmt->execute();
        } else {
            $userBranch = getUserBranch($user);
            $query = "SELECT DISTINCT branch FROM users WHERE branch = ? ORDER BY branch";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$userBranch]);
        }
        
        $branches = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        echo formatResponse(true, 'Branches retrieved successfully', $branches);
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error fetching branches: ' . $e->getMessage());
    }
}

// ===== GET EMPLOYEES (FOR DASHBOARD) =====
elseif ($action === 'getEmployees') {
    $selectedBranch = $_POST['branch'] ?? 'all';
    $userBranch = getUserBranch($user);
    $userRole = $user['role'] ?? 'cashier';
    
    try {
        // Check if employees table exists
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'employees'");
        if ($tableCheck->rowCount() === 0) {
            echo json_encode([
                'success' => true,
                'employees' => [],
                'message' => 'Employees table not found'
            ]);
            exit();
        }
        
        // Check if employees table has branch column
        $columnCheck = $pdo->query("SHOW COLUMNS FROM employees LIKE 'branch'");
        $hasBranchColumn = $columnCheck->rowCount() > 0;
        
        if ($userRole === 'admin' || $userRole === 'owner') {
            if ($selectedBranch === 'all') {
                if ($hasBranchColumn) {
                    $query = "SELECT e.*, 
                             (SELECT COUNT(*) FROM attendance_logs al 
                              WHERE al.employee_id = e.employee_id 
                              AND DATE(al.date) = CURDATE() 
                              AND al.status = 'on_duty' 
                              AND al.time_out IS NULL) as is_on_duty
                             FROM employees e 
                             WHERE e.status = 'active' 
                             ORDER BY e.full_name ASC";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute();
                } else {
                    $query = "SELECT e.*, 
                             (SELECT COUNT(*) FROM attendance_logs al 
                              WHERE al.employee_id = e.employee_id 
                              AND DATE(al.date) = CURDATE() 
                              AND al.status = 'on_duty' 
                              AND al.time_out IS NULL) as is_on_duty
                             FROM employees e 
                             WHERE e.status = 'active' 
                             ORDER BY e.full_name ASC";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute();
                }
            } else {
                if ($hasBranchColumn) {
                    $query = "SELECT e.*, 
                             (SELECT COUNT(*) FROM attendance_logs al 
                              WHERE al.employee_id = e.employee_id 
                              AND DATE(al.date) = CURDATE() 
                              AND al.status = 'on_duty' 
                              AND al.time_out IS NULL) as is_on_duty
                             FROM employees e 
                             WHERE e.status = 'active' 
                             AND e.branch = ? 
                             ORDER BY e.full_name ASC";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute([$selectedBranch]);
                } else {
                    $query = "SELECT e.*, 
                             (SELECT COUNT(*) FROM attendance_logs al 
                              WHERE al.employee_id = e.employee_id 
                              AND DATE(al.date) = CURDATE() 
                              AND al.status = 'on_duty' 
                              AND al.time_out IS NULL) as is_on_duty
                             FROM employees e 
                             WHERE e.status = 'active' 
                             ORDER BY e.full_name ASC";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute();
                }
            }
        } else {
            // For non-admin users, only show employees from their branch
            if ($hasBranchColumn) {
                $query = "SELECT e.*, 
                         (SELECT COUNT(*) FROM attendance_logs al 
                          WHERE al.employee_id = e.employee_id 
                          AND DATE(al.date) = CURDATE() 
                          AND al.status = 'on_duty' 
                          AND al.time_out IS NULL) as is_on_duty
                         FROM employees e 
                         WHERE e.status = 'active' 
                         AND e.branch = ? 
                         ORDER BY e.full_name ASC";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$userBranch]);
            } else {
                $query = "SELECT e.*, 
                         (SELECT COUNT(*) FROM attendance_logs al 
                          WHERE al.employee_id = e.employee_id 
                          AND DATE(al.date) = CURDATE() 
                          AND al.status = 'on_duty' 
                          AND al.time_out IS NULL) as is_on_duty
                         FROM employees e 
                         WHERE e.status = 'active' 
                         ORDER BY e.full_name ASC";
                $stmt = $pdo->prepare($query);
                $stmt->execute();
            }
        }
        
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process the results
        foreach ($employees as &$employee) {
            $employee['is_on_duty'] = $employee['is_on_duty'] > 0;
            // If no branch column, set default branch
            if (!$hasBranchColumn) {
                $employee['branch'] = $userBranch;
            }
        }
        
        echo json_encode([
            'success' => true,
            'employees' => $employees,
            'branch' => $selectedBranch !== 'all' ? $selectedBranch : $userBranch,
            'has_branch_column' => $hasBranchColumn
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching employees: ' . $e->getMessage(),
            'employees' => []
        ]);
    }
}

// ===== CASH IN HANDLER =====
elseif ($action === 'cashIn') {
    $amount = floatval($_POST['amount'] ?? 0);
    $reason = trim($_POST['reason'] ?? '');
    $branch = trim($_POST['branch'] ?? getUserBranch($user));
    $userId = intval($_POST['user_id'] ?? $user['id'] ?? 0);
    
    // Validation
    if ($amount <= 0) {
        echo formatResponse(false, 'Amount must be greater than 0');
        exit();
    }
    
    if (empty($reason)) {
        echo formatResponse(false, 'Reason is required');
        exit();
    }
    
    try {
        // Just insert directly - no session needed!
        $stmt = $pdo->prepare("
            INSERT INTO cashout (
                cashier_session_id,
                user_id, 
                branch, 
                amount, 
                type, 
                reason, 
                created_at
            ) VALUES (NULL, ?, ?, ?, 'deposit', ?, NOW())
        ");
        
        $stmt->execute([
            $userId,
            $branch,
            $amount,
            $reason
        ]);
        
        if ($stmt->rowCount() > 0) {
            $insertId = $pdo->lastInsertId();
            
            echo formatResponse(true, 'Cash in recorded successfully', [
                'id' => $insertId,
                'amount' => $amount,
                'type' => 'deposit',
                'reason' => $reason,
                'branch' => $branch,
                'user_id' => $userId,
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } else {
            echo formatResponse(false, 'Failed to record cash in');
        }
        
    } catch (PDOException $e) {
        error_log("Cash In Error: " . $e->getMessage());
        echo formatResponse(false, 'Database error: ' . $e->getMessage());
    }
}

// ===== CASH OUT HANDLER =====
elseif ($action === 'cashOut') {
    $amount = floatval($_POST['amount'] ?? 0);
    $reason = trim($_POST['reason'] ?? '');
    $branch = trim($_POST['branch'] ?? getUserBranch($user));
    $userId = intval($_POST['user_id'] ?? $user['id'] ?? 0);
    
    // Validation
    if ($amount <= 0) {
        echo formatResponse(false, 'Amount must be greater than 0');
        exit();
    }
    
    if (empty($reason)) {
        echo formatResponse(false, 'Reason is required');
        exit();
    }
    
    try {
        // Just insert directly - no session needed!
        $stmt = $pdo->prepare("
            INSERT INTO cashout (
                cashier_session_id,
                user_id, 
                branch, 
                amount, 
                type, 
                reason, 
                created_at
            ) VALUES (NULL, ?, ?, ?, 'withdrawal', ?, NOW())
        ");
        
        $stmt->execute([
            $userId,
            $branch,
            $amount,
            $reason
        ]);
        
        if ($stmt->rowCount() > 0) {
            $insertId = $pdo->lastInsertId();
            
            echo formatResponse(true, 'Cash out recorded successfully', [
                'id' => $insertId,
                'amount' => $amount,
                'type' => 'withdrawal',
                'reason' => $reason,
                'branch' => $branch,
                'user_id' => $userId,
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } else {
            echo formatResponse(false, 'Failed to record cash out');
        }
        
    } catch (PDOException $e) {
        error_log("Cash Out Error: " . $e->getMessage());
        echo formatResponse(false, 'Database error: ' . $e->getMessage());
    }
}

// ===== GET CASH TRANSACTIONS (OPTIONAL - FOR REPORTS) =====
elseif ($action === 'getCashTransactions') {
    $selectedBranch = $_POST['branch'] ?? 'all';
    $startDate = $_POST['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
    $endDate = $_POST['end_date'] ?? date('Y-m-d');
    $type = $_POST['type'] ?? 'all'; // 'all', 'deposit', 'withdrawal'
    $userBranch = getUserBranch($user);
    $userRole = $user['role'] ?? 'cashier';
    
    try {
        $query = "
            SELECT 
                c.*,
                u.username,
                u.email
            FROM cashout c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE DATE(c.created_at) BETWEEN ? AND ?
        ";
        
        $params = [$startDate, $endDate];
        
        // Apply branch filter
        if ($userRole === 'admin' || $userRole === 'owner') {
            if ($selectedBranch !== 'all') {
                $query .= " AND c.branch = ?";
                $params[] = $selectedBranch;
            }
        } else {
            $query .= " AND c.branch = ?";
            $params[] = $userBranch;
        }
        
        // Apply type filter
        if ($type !== 'all') {
            $query .= " AND c.type = ?";
            $params[] = $type;
        }
        
        $query .= " ORDER BY c.created_at DESC LIMIT 100";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate summary
        $totalDeposits = 0;
        $totalWithdrawals = 0;
        
        foreach ($transactions as $row) {
            if ($row['type'] === 'deposit') {
                $totalDeposits += floatval($row['amount']);
            } else {
                $totalWithdrawals += floatval($row['amount']);
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $transactions,
            'summary' => [
                'total_deposits' => $totalDeposits,
                'total_withdrawals' => $totalWithdrawals,
                'net_amount' => $totalDeposits - $totalWithdrawals,
                'count' => count($transactions)
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Get Cash Transactions Error: " . $e->getMessage());
        echo formatResponse(false, 'Failed to retrieve transactions: ' . $e->getMessage());
    }
}

// ===== GET CASH SUMMARY (OPTIONAL - FOR DASHBOARD STATS) =====
elseif ($action === 'getCashSummary') {
    $selectedBranch = $_POST['branch'] ?? 'all';
    $period = $_POST['period'] ?? 'today'; // 'today', 'week', 'month', 'all'
    $userBranch = getUserBranch($user);
    $userRole = $user['role'] ?? 'cashier';
    
    try {
        // Build date condition
        $dateCondition = "";
        switch ($period) {
            case 'today':
                $dateCondition = "DATE(created_at) = CURDATE()";
                break;
            case 'week':
                $dateCondition = "created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                break;
            case 'month':
                $dateCondition = "created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                break;
            default:
                $dateCondition = "1=1";
        }
        
        $query = "
            SELECT 
                type,
                COUNT(*) as count,
                SUM(amount) as total,
                AVG(amount) as average
            FROM cashout
            WHERE $dateCondition
        ";
        
        $params = [];
        
        // Apply branch filter
        if ($userRole === 'admin' || $userRole === 'owner') {
            if ($selectedBranch !== 'all') {
                $query .= " AND branch = ?";
                $params[] = $selectedBranch;
            }
        } else {
            $query .= " AND branch = ?";
            $params[] = $userBranch;
        }
        
        $query .= " GROUP BY type";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Build summary
        $summary = [
            'deposits' => ['count' => 0, 'total' => 0, 'average' => 0],
            'withdrawals' => ['count' => 0, 'total' => 0, 'average' => 0]
        ];
        
        foreach ($results as $row) {
            if ($row['type'] === 'deposit') {
                $summary['deposits'] = [
                    'count' => intval($row['count']),
                    'total' => floatval($row['total']),
                    'average' => floatval($row['average'])
                ];
            } else {
                $summary['withdrawals'] = [
                    'count' => intval($row['count']),
                    'total' => floatval($row['total']),
                    'average' => floatval($row['average'])
                ];
            }
        }
        
        $summary['net_cash_flow'] = $summary['deposits']['total'] - $summary['withdrawals']['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $summary,
            'period' => $period,
            'branch' => $selectedBranch !== 'all' ? $selectedBranch : $userBranch
        ]);
        
    } catch (PDOException $e) {
        error_log("Get Cash Summary Error: " . $e->getMessage());
        echo formatResponse(false, 'Failed to generate summary: ' . $e->getMessage());
    }
}

// ===== DEFAULT RESPONSE =====
else {
    echo formatResponse(false, 'Invalid action');
}
?>