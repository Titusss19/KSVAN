<?php
// backend/dashboard_api.php - FIXED VERSION WITH OUTSOURCE CALCULATION
session_start();

require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
ini_set('display_errors', 0);

$user = $_SESSION['user'];
$action = $_POST['action'] ?? '';

global $pdo;

if ($pdo) {
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}

// ===== HELPER FUNCTIONS =====
function getUserBranch($user) {
    return $user['branch'] ?? 'main';
}

function hasPermission($user, $requiredRole) {
    $userRole = $user['role'] ?? 'cashier';
    $roleHierarchy = ['cashier' => 1, 'manager' => 2, 'admin' => 3];
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
    if ($selectedBranch !== 'all' && ($userRole === 'admin')) {
        return ['WHERE branch = ?', [$selectedBranch]];
    } elseif ($selectedBranch === 'all' && ($userRole !== 'admin')) {
        return ['WHERE branch = ?', [$userBranch]];
    } elseif ($selectedBranch !== 'all') {
        return ['WHERE branch = ?', [$selectedBranch]];
    }
    return ['', []];
}

// ===== VALIDATE ROLE =====
function validateRole($inputRole, $currentUserRole) {
    $inputRole = trim(strtolower($inputRole));
    
    $validRoles = ['cashier', 'manager', 'admin'];
    
    if (!in_array($inputRole, $validRoles)) {
        return ['success' => false, 'message' => 'Invalid role specified'];
    }
    
    if ($inputRole === 'admin') {
        if ($currentUserRole !== 'admin') {
            return ['success' => false, 'message' => 'You do not have permission to create Owner accounts'];
        }
    }
    
    if ($inputRole === 'manager') {
        if (!in_array($currentUserRole, ['admin', 'manager'])) {
            return ['success' => false, 'message' => 'You do not have permission to create Manager accounts'];
        }
    }
    
    return ['success' => true, 'role' => $inputRole];
}

// ===== GET DASHBOARD STATS - WITH OUTSOURCE =====
if ($action === 'getStats') {
    $selectedBranch = $_POST['branch'] ?? 'all';
    $userBranch = getUserBranch($user);
    
    try {
        $stats = [
            'grossSales' => 0,
            'netSales' => 0,
            'voidedAmount' => 0,
            'outSourceAmount' => 0,  // Initialize OutSource
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
        
        // Get Sales Data
        $salesQuery = "SELECT 
            COALESCE(SUM(total), 0) as total_sales,
            COALESCE(SUM(CASE WHEN is_void = 1 THEN total ELSE 0 END), 0) as voided_amount,
            COUNT(*) as total_orders,
            COALESCE(SUM(CASE WHEN is_void = 1 THEN 1 ELSE 0 END), 0) as voided_count
            FROM orders $whereClause";
        
        $stmt = $pdo->prepare($salesQuery);
        $stmt->execute($params);
        $salesResult = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($salesResult) {
            $stats['grossSales'] = floatval($salesResult['total_sales'] ?? 0);
            $stats['voidedAmount'] = floatval($salesResult['voided_amount'] ?? 0);
            $stats['voidedOrdersCount'] = intval($salesResult['voided_count'] ?? 0);
            $stats['totalTransactions'] = intval($salesResult['total_orders'] ?? 0) - $stats['voidedOrdersCount'];
        }
        
        // ===== GET OUTSOURCE AMOUNT =====
        $outSourceQuery = "SELECT COALESCE(SUM(amount), 0) as outsource_total FROM outsource_records $whereClause";
        $stmt = $pdo->prepare($outSourceQuery);
        $stmt->execute($params);
        $outSourceResult = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($outSourceResult) {
            $stats['outSourceAmount'] = floatval($outSourceResult['outsource_total'] ?? 0);
        }
        
        // ===== CALCULATE NET SALES = GROSS - VOIDED - OUTSOURCE =====
        $stats['netSales'] = $stats['grossSales'] - $stats['voidedAmount'] - $stats['outSourceAmount'];
        $stats['totalSales'] = $stats['netSales'];
        
        // Get Today's Data
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
        $todayResult = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($todayResult) {
            $stats['todayGrossSales'] = floatval($todayResult['today_sales'] ?? 0);
            $stats['todayVoidedAmount'] = floatval($todayResult['today_voided'] ?? 0);
            $stats['todaySales'] = $stats['todayGrossSales'] - $stats['todayVoidedAmount'];
            $stats['todayTransactions'] = intval($todayResult['today_orders'] ?? 0) - intval($todayResult['today_voided_count'] ?? 0);
            $stats['todayVoidedOrdersCount'] = intval($todayResult['today_voided_count'] ?? 0);
        }
        
        // Get Inventory Data
        try {
            $inventoryQuery = "SELECT 
                COALESCE(SUM(total_price), 0) as total_value,
                COUNT(*) as item_count
                FROM inventory_items $whereClause";
            
            $stmt = $pdo->prepare($inventoryQuery);
            $stmt->execute($params);
            $inventoryResult = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($inventoryResult) {
                $stats['inventoryValue'] = floatval($inventoryResult['total_value'] ?? 0);
                $stats['inventoryItemCount'] = intval($inventoryResult['item_count'] ?? 0);
            }
        } catch (Exception $e) {
            $stats['inventoryValue'] = 0;
            $stats['inventoryItemCount'] = 0;
        }
        
        // Get Active Employees
        if ($whereClause) {
            $employeesQuery = "SELECT COUNT(*) as active_count FROM users 
                WHERE status = 'Active' AND " . substr($whereClause, 6);
        } else {
            $employeesQuery = "SELECT COUNT(*) as active_count FROM users WHERE status = 'Active'";
        }
        
        $stmt = $pdo->prepare($employeesQuery);
        $stmt->execute($params);
        $employeesResult = $stmt->fetch(PDO::FETCH_ASSOC);
        
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
        if ($user['role'] === 'admin') {
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
        
        echo formatResponse(true, 'Users retrieved successfully', $users);
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error fetching users: ' . $e->getMessage());
    }
}

// ===== ADD USER =====
elseif ($action === 'addUser') {
    if (!hasPermission($user, 'manager')) {
        echo formatResponse(false, 'Insufficient permissions');
        exit();
    }
    
    $email = trim($_POST['email'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $inputRole = trim($_POST['role'] ?? 'cashier');
    $status = $_POST['status'] ?? 'Active';
    $branch = trim($_POST['branch'] ?? getUserBranch($user));
    $void_pin = $_POST['void_pin'] ?? '';
    
    if (empty($email) || empty($password) || empty($confirmPassword)) {
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
    
    $roleValidation = validateRole($inputRole, $user['role']);
    if (!$roleValidation['success']) {
        echo formatResponse(false, $roleValidation['message']);
        exit();
    }
    $dbRole = $roleValidation['role'];
    
    try {
        $checkQuery = "SELECT id FROM users WHERE email = ?";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->execute([$email]);
        
        if ($checkStmt->rowCount() > 0) {
            echo formatResponse(false, 'Email already exists');
            exit();
        }
        
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $hashedVoidPin = null;
        if (!empty($void_pin) && ($dbRole === 'manager' || $dbRole === 'admin')) {
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
        
        $pdo->beginTransaction();
        
        try {
            $insertQuery = "INSERT INTO users (email, username, password, role, status, branch, void_pin, created_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
            $insertStmt = $pdo->prepare($insertQuery);
            $insertStmt->execute([$email, $username, $hashedPassword, $dbRole, $status, $branch, $hashedVoidPin]);
            
            $userId = $pdo->lastInsertId();
            
            $pdo->commit();
            
            echo formatResponse(true, 'User added successfully', ['user_id' => $userId]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error adding user: ' . $e->getMessage());
    }
}

// ===== UPDATE USER =====
elseif ($action === 'updateUser') {
    if (!hasPermission($user, 'manager')) {
        echo formatResponse(false, 'Insufficient permissions');
        exit();
    }
    
    $id = intval($_POST['id'] ?? 0);
    $email = trim($_POST['email'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $inputRole = trim($_POST['role'] ?? 'cashier');
    $status = $_POST['status'] ?? 'Active';
    $branch = trim($_POST['branch'] ?? getUserBranch($user));
    $void_pin = $_POST['void_pin'] ?? '';
    
    $roleValidation = validateRole($inputRole, $user['role']);
    if (!$roleValidation['success']) {
        echo formatResponse(false, $roleValidation['message']);
        exit();
    }
    $dbRole = $roleValidation['role'];
    
    try {
        $hashedVoidPin = null;
        $updateVoidPin = false;
        
        if (isset($_POST['void_pin']) && $_POST['void_pin'] !== '') {
            if ($dbRole === 'manager' || $dbRole === 'admin') {
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
            $hashedVoidPin = null;
            $updateVoidPin = true;
        }
        
        $pdo->beginTransaction();
        
        try {
            if ($updateVoidPin) {
                $updateQuery = "UPDATE users SET email = ?, username = ?, role = ?, status = ?, branch = ?, void_pin = ? WHERE id = ?";
                $stmt = $pdo->prepare($updateQuery);
                $stmt->execute([$email, $username, $dbRole, $status, $branch, $hashedVoidPin, $id]);
            } else {
                $updateQuery = "UPDATE users SET email = ?, username = ?, role = ?, status = ?, branch = ? WHERE id = ?";
                $stmt = $pdo->prepare($updateQuery);
                $stmt->execute([$email, $username, $dbRole, $status, $branch, $id]);
            }
            
            $pdo->commit();
            
            echo formatResponse(true, 'User updated successfully');
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
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
    
    $id = intval($_POST['id'] ?? 0);
    
    try {
        if ($user['role'] !== 'admin') {
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
        if ($userRole === 'admin' && $selectedBranch !== 'all') {
            $query = "SELECT * FROM announcements WHERE is_global = 1 OR branch = ? ORDER BY created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$selectedBranch]);
        } elseif ($userRole === 'admin') {
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
    $title = trim($_POST['title'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $type = $_POST['type'] ?? 'info';
    
    if (empty($title) || empty($message)) {
        echo formatResponse(false, 'Title and message are required');
        exit();
    }
    
    $userBranch = getUserBranch($user);
    $userRole = $user['role'] ?? 'cashier';
    $author = $user['email'] ?? 'Admin';
    
    $isGlobal = ($userRole === 'admin') ? 1 : 0;
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
        if ($user['role'] === 'admin') {
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

// ===== GET EMPLOYEES =====
elseif ($action === 'getEmployees') {
    $selectedBranch = $_POST['branch'] ?? 'all';
    $userBranch = getUserBranch($user);
    $userRole = $user['role'] ?? 'cashier';
    
    try {
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'employees'");
        if ($tableCheck->rowCount() === 0) {
            echo json_encode(['success' => true, 'employees' => [], 'message' => 'Employees table not found']);
            exit();
        }
        
        $columnCheck = $pdo->query("SHOW COLUMNS FROM employees LIKE 'branch'");
        $hasBranchColumn = $columnCheck->rowCount() > 0;
        
        if ($userRole === 'admin') {
            if ($selectedBranch === 'all') {
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
        
        foreach ($employees as &$employee) {
            $employee['is_on_duty'] = $employee['is_on_duty'] > 0;
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
        echo json_encode(['success' => false, 'message' => 'Error fetching employees: ' . $e->getMessage(), 'employees' => []]);
    }
}

// ===== CASH IN =====
elseif ($action === 'cashIn') {
    $amount = floatval($_POST['amount'] ?? 0);
    $reason = trim($_POST['reason'] ?? '');
    $branch = trim($_POST['branch'] ?? getUserBranch($user));
    $userId = intval($_POST['user_id'] ?? $user['id'] ?? 0);
    
    if ($amount <= 0) {
        echo formatResponse(false, 'Amount must be greater than 0');
        exit();
    }
    
    if (empty($reason)) {
        echo formatResponse(false, 'Reason is required');
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO cashout (cashier_session_id, user_id, branch, amount, type, reason, created_at) VALUES (NULL, ?, ?, ?, 'deposit', ?, NOW())");
        $stmt->execute([$userId, $branch, $amount, $reason]);
        
        if ($stmt->rowCount() > 0) {
            echo formatResponse(true, 'Cash in recorded successfully', [
                'id' => $pdo->lastInsertId(),
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
        echo formatResponse(false, 'Database error: ' . $e->getMessage());
    }
}

// ===== CASH OUT =====
elseif ($action === 'cashOut') {
    $amount = floatval($_POST['amount'] ?? 0);
    $reason = trim($_POST['reason'] ?? '');
    $branch = trim($_POST['branch'] ?? getUserBranch($user));
    $userId = intval($_POST['user_id'] ?? $user['id'] ?? 0);
    
    if ($amount <= 0) {
        echo formatResponse(false, 'Amount must be greater than 0');
        exit();
    }
    
    if (empty($reason)) {
        echo formatResponse(false, 'Reason is required');
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO cashout (cashier_session_id, user_id, branch, amount, type, reason, created_at) VALUES (NULL, ?, ?, ?, 'withdrawal', ?, NOW())");
        $stmt->execute([$userId, $branch, $amount, $reason]);
        
        if ($stmt->rowCount() > 0) {
            echo formatResponse(true, 'Cash out recorded successfully', [
                'id' => $pdo->lastInsertId(),
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
        echo formatResponse(false, 'Database error: ' . $e->getMessage());
    }
}

// ===== ADD OUT SOURCE =====
elseif ($action === 'addOutSource') {
    $personnelName = trim($_POST['personnel_name'] ?? '');
    $productDetails = trim($_POST['product_details'] ?? '');
    $amount = floatval($_POST['amount'] ?? 0);
    $branch = trim($_POST['branch'] ?? getUserBranch($user));
    $createdBy = intval($_POST['created_by'] ?? $user['id'] ?? 0);
    
    if (empty($personnelName)) {
        echo formatResponse(false, 'Personnel name is required');
        exit();
    }
    
    if ($amount <= 0) {
        echo formatResponse(false, 'Amount must be greater than 0');
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO outsource_records (branch, created_at, amount, product_details, personnel_name, created_by) VALUES (?, NOW(), ?, ?, ?, ?)");
        $stmt->execute([$branch, $amount, $productDetails, $personnelName, $createdBy]);
        
        if ($stmt->rowCount() > 0) {
            echo formatResponse(true, 'Out Source record added successfully', [
                'id' => $pdo->lastInsertId(),
                'amount' => $amount,
                'branch' => $branch,
                'personnel_name' => $personnelName,
                'product_details' => $productDetails,
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } else {
            echo formatResponse(false, 'Failed to add Out Source record');
        }
    } catch (PDOException $e) {
        echo formatResponse(false, 'Database error: ' . $e->getMessage());
    }
}

else {
    echo formatResponse(false, 'Invalid action');
}
?>