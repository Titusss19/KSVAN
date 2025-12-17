<?php
// backend/dashboard_api.php - CORRECT VERSION - ADMIN IN DB, OWNER IS DISPLAY ONLY
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

// ===== VALIDATE ROLE - NO MORE CONVERSION! =====
function validateRole($inputRole, $currentUserRole) {
    $inputRole = trim(strtolower($inputRole));
    
    $validRoles = ['cashier', 'manager', 'admin'];
    
    if (!in_array($inputRole, $validRoles)) {
        return ['success' => false, 'message' => 'Invalid role specified'];
    }
    
    // Permission check
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
    
    // NO CONVERSION! Store as-is in database
    return ['success' => true, 'role' => $inputRole];
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
            $stats['netSales'] = $stats['grossSales'] - $stats['voidedAmount'];
            $stats['totalSales'] = $stats['netSales'];
            $stats['voidedOrdersCount'] = intval($salesResult['voided_count'] ?? 0);
            $stats['totalTransactions'] = intval($salesResult['total_orders'] ?? 0) - $stats['voidedOrdersCount'];
        }
        
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

// ===== GET USERS - NO CONVERSION! =====
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
        
        // NO CONVERSION! Return as-is
        // Frontend will handle display conversion
        
        echo formatResponse(true, 'Users retrieved successfully', $users);
        
    } catch (PDOException $e) {
        echo formatResponse(false, 'Error fetching users: ' . $e->getMessage());
    }
}

// ===== ADD USER - NO CONVERSION! =====
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
    
    error_log("=== ADD USER ===");
    error_log("Received role: " . $inputRole);
    
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
    
    // Validate role - NO CONVERSION!
    $roleValidation = validateRole($inputRole, $user['role']);
    if (!$roleValidation['success']) {
        echo formatResponse(false, $roleValidation['message']);
        exit();
    }
    $dbRole = $roleValidation['role']; // This is "admin", "manager", or "cashier"
    
    error_log("Storing in DB: " . $dbRole);
    
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
            
            // Verify
            $verifyQuery = "SELECT id, role, email FROM users WHERE id = ?";
            $verifyStmt = $pdo->prepare($verifyQuery);
            $verifyStmt->execute([$userId]);
            $verifyResult = $verifyStmt->fetch(PDO::FETCH_ASSOC);
            
            $actualRole = $verifyResult['role'] ?? 'NOT_FOUND';
            
            error_log("Verified from DB: " . $actualRole);
            
            echo formatResponse(true, 'User added successfully', [
                'user_id' => $userId,
                'input_role' => $inputRole,
                'stored_role' => $actualRole
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Insert failed: " . $e->getMessage());
            throw $e;
        }
        
    } catch (PDOException $e) {
        error_log("Add User Error: " . $e->getMessage());
        echo formatResponse(false, 'Error adding user: ' . $e->getMessage());
    }
}

// ===== UPDATE USER - NO CONVERSION! =====
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
    
    error_log("=== UPDATE USER ===");
    error_log("User ID: " . $id);
    error_log("Received role: " . $inputRole);
    
    // Validate role - NO CONVERSION!
    $roleValidation = validateRole($inputRole, $user['role']);
    if (!$roleValidation['success']) {
        echo formatResponse(false, $roleValidation['message']);
        exit();
    }
    $dbRole = $roleValidation['role']; // This is "admin", "manager", or "cashier"
    
    error_log("Storing in DB: " . $dbRole);
    
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
            
            error_log("Rows affected: " . $stmt->rowCount());
            
            $pdo->commit();
            
            // Verify
            $verifyQuery = "SELECT id, role, email FROM users WHERE id = ?";
            $verifyStmt = $pdo->prepare($verifyQuery);
            $verifyStmt->execute([$id]);
            $verifyResult = $verifyStmt->fetch(PDO::FETCH_ASSOC);
            
            $actualRole = $verifyResult['role'] ?? 'NOT_FOUND';
            
            error_log("Verified from DB: " . $actualRole);
            
            echo formatResponse(true, 'User updated successfully', [
                'input_role' => $inputRole,
                'stored_role' => $actualRole
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Update failed: " . $e->getMessage());
            throw $e;
        }
        
    } catch (PDOException $e) {
        error_log("Update User Error: " . $e->getMessage());
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

// ===== REST OF THE CODE (announcements, branches, employees, cash, etc.) =====
// Keep all other actions unchanged...

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
            echo formatResponse(true, 'Cash in recorded successfully', ['id' => $pdo->lastInsertId(), 'amount' => $amount, 'type' => 'deposit', 'reason' => $reason, 'branch' => $branch, 'user_id' => $userId, 'created_at' => date('Y-m-d H:i:s')]);
        } else {
            echo formatResponse(false, 'Failed to record cash in');
        }
    } catch (PDOException $e) {
        error_log("Cash In Error: " . $e->getMessage());
        echo formatResponse(false, 'Database error: ' . $e->getMessage());
    }
}

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
            echo formatResponse(true, 'Cash out recorded successfully', ['id' => $pdo->lastInsertId(), 'amount' => $amount, 'type' => 'withdrawal', 'reason' => $reason, 'branch' => $branch, 'user_id' => $userId, 'created_at' => date('Y-m-d H:i:s')]);
        } else {
            echo formatResponse(false, 'Failed to record cash out');
        }
    } catch (PDOException $e) {
        error_log("Cash Out Error: " . $e->getMessage());
        echo formatResponse(false, 'Database error: ' . $e->getMessage());
    }
}

else {
    echo formatResponse(false, 'Invalid action');
}
?>