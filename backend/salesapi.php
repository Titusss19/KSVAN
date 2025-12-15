<?php
// salesapi.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
require_once 'config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$user = $_SESSION['user'];
$method = $_SERVER['REQUEST_METHOD'];
$request = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($method) {
case 'GET':
    if ($request === 'sales') {
        getSales($pdo, $user);
    } elseif ($request === 'branches') {
        getBranches($pdo);
    } elseif ($request === 'order' && isset($_GET['id'])) {
        getOrder($pdo, $_GET['id'], $user);
    } elseif ($request === 'cashier-sessions') {
        getCashierSessions($pdo, $user);
    } elseif ($request === 'cashier-details' && isset($_GET['id'])) {
        getCashierDetails($pdo, $_GET['id'], $user);
    } elseif ($request === 'void-orders') {
        getVoidOrders($pdo, $user);
    } elseif ($request === 'cashout') {
        getCashoutRecords($pdo, $user);
    } else {
        throw new Exception('Invalid request');
    }
    break;
            
case 'POST':
    if ($request === 'void') {
        voidOrder($pdo, $user);
    } elseif ($request === 'verify-pin') {
        verifyManagerPin($pdo);
    } elseif ($request === 'verify-owner-pin') {
        verifyOwnerPin($pdo);
    } elseif ($request === 'cashout') {
        recordCashout($pdo, $user);
    } elseif ($request === 'edit-cashout') {
        editCashout($pdo, $user);
    } else {
        throw new Exception('Invalid request');
    }
    break;
            
        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// ============================================
// GET SALES DATA WITH FILTERS & PAGINATION
// ============================================
function getSales($pdo, $user) {
    // Get filters
    $branch = isset($_GET['branch']) ? $_GET['branch'] : 'all';
    $timeRange = isset($_GET['timeRange']) ? $_GET['timeRange'] : 'all';
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
    $paymentMethod = isset($_GET['payment']) ? $_GET['payment'] : 'all';
    $orderType = isset($_GET['orderType']) ? $_GET['orderType'] : 'all';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause
    $where = ['o.is_void = 0']; // Exclude voided orders
    $params = [];
    
    // Branch filter (admin sees all, others see own branch)
    if ($user['role'] === 'admin' || $user['role'] === 'owner') {
        if ($branch !== 'all') {
            $where[] = 'o.branch = :branch';
            $params[':branch'] = $branch;
        }
    } else {
        $where[] = 'o.branch = :branch';
        $params[':branch'] = $user['branch'];
    }
    
    // Time range filter
    if ($timeRange === 'today') {
        $where[] = 'DATE(o.created_at) = CURDATE()';
    } elseif ($timeRange === 'yesterday') {
        $where[] = 'DATE(o.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
    } elseif ($timeRange === 'week') {
        $where[] = 'o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } elseif ($timeRange === 'month') {
        $where[] = 'o.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    } elseif ($timeRange === 'custom' && $startDate && $endDate) {
        $where[] = 'DATE(o.created_at) BETWEEN :startDate AND :endDate';
        $params[':startDate'] = $startDate;
        $params[':endDate'] = $endDate;
    }
    
    // Payment method filter
    if ($paymentMethod !== 'all') {
        $where[] = 'o.payment_method = :payment';
        $params[':payment'] = $paymentMethod;
    }
    
    // Order type filter
    if ($orderType !== 'all') {
        $where[] = 'o.orderType = :orderType';
        $params[':orderType'] = $orderType;
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM orders o WHERE $whereClause";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get paginated data
    $sql = "SELECT 
                o.*,
                u.username as cashier_name,
                u.email as cashier_email
            FROM orders o
            LEFT JOIN users u ON o.userId = u.id
            WHERE $whereClause
            ORDER BY o.created_at DESC
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $sales = $stmt->fetchAll();
    
    // Format data
    foreach ($sales as &$sale) {
        $sale['total'] = floatval($sale['total']);
        $sale['paidAmount'] = floatval($sale['paidAmount']);
        $sale['changeAmount'] = floatval($sale['changeAmount']);
        $sale['discountApplied'] = (bool)$sale['discountApplied'];
        $sale['is_void'] = (bool)$sale['is_void'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $sales,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

// ============================================
// GET CASHIER SESSIONS
// ============================================
function getCashierSessions($pdo, $user) {
    $branch = isset($_GET['branch']) ? $_GET['branch'] : 'all';
    $timeRange = isset($_GET['timeRange']) ? $_GET['timeRange'] : 'all';
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause for sessions
    $where = ["s.action = 'open'"];
    $params = [];
    
    // Branch filter
    if ($user['role'] === 'admin' || $user['role'] === 'owner') {
        if ($branch !== 'all') {
            $where[] = 's.branch = :branch';
            $params[':branch'] = $branch;
        }
    } else {
        $where[] = 's.branch = :branch';
        $params[':branch'] = $user['branch'];
    }
    
    // Time range filter
    if ($timeRange === 'today') {
        $where[] = 'DATE(s.timestamp) = CURDATE()';
    } elseif ($timeRange === 'yesterday') {
        $where[] = 'DATE(s.timestamp) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
    } elseif ($timeRange === 'week') {
        $where[] = 's.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } elseif ($timeRange === 'month') {
        $where[] = 's.timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    } elseif ($timeRange === 'custom' && $startDate && $endDate) {
        $where[] = 'DATE(s.timestamp) BETWEEN :startDate AND :endDate';
        $params[':startDate'] = $startDate;
        $params[':endDate'] = $endDate;
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total 
                 FROM store_status_log s 
                 WHERE $whereClause";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get sessions with user info
    $sql = "SELECT 
                s.id,
                s.user_id,
                s.user_email,
                s.timestamp as login_time,
                s.branch,
                u.username,
                u.email
            FROM store_status_log s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE $whereClause
            ORDER BY s.timestamp DESC
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $sessions = $stmt->fetchAll();
    
    // For each session, compute sales data
    foreach ($sessions as &$session) {
        $sessionData = computeSessionData($pdo, $session);
        $session = array_merge($session, $sessionData);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $sessions,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

// ============================================
// COMPUTE SESSION DATA
// ============================================
function computeSessionData($pdo, $session) {
    $userId = $session['user_id'];
    $loginTime = $session['login_time'];
    $branch = $session['branch'];
    
    // Find logout time (next close action)
    $logoutSql = "SELECT timestamp as logout_time 
                  FROM store_status_log 
                  WHERE user_id = :userId 
                  AND action = 'close' 
                  AND branch = :branch
                  AND timestamp > :loginTime
                  ORDER BY timestamp ASC 
                  LIMIT 1";
    $logoutStmt = $pdo->prepare($logoutSql);
    $logoutStmt->execute([
        ':userId' => $userId,
        ':branch' => $branch,
        ':loginTime' => $loginTime
    ]);
    $logoutRow = $logoutStmt->fetch();
    $logoutTime = $logoutRow ? $logoutRow['logout_time'] : null;
    
    // Calculate session duration
    if ($logoutTime) {
        $login = new DateTime($loginTime);
        $logout = new DateTime($logoutTime);
        $interval = $login->diff($logout);
        $sessionDuration = $interval->h . 'h ' . $interval->i . 'm';
    } else {
        $sessionDuration = 'Still Active';
    }
    
    // Get starting gross sales (before login)
    $startSalesSql = "SELECT IFNULL(SUM(total), 0) as start_sales 
                      FROM orders 
                      WHERE created_at < :loginTime 
                      AND branch = :branch 
                      AND is_void = 0";
    $startStmt = $pdo->prepare($startSalesSql);
    $startStmt->execute([
        ':loginTime' => $loginTime,
        ':branch' => $branch
    ]);
    $startGrossSales = floatval($startStmt->fetch()['start_sales']);
    
    // Get session sales (during shift, non-voided)
    $sessionSalesSql = "SELECT 
                            o.*,
                            u.username as cashier_name
                        FROM orders o
                        LEFT JOIN users u ON o.userId = u.id
                        WHERE o.userId = :userId 
                        AND o.created_at >= :loginTime 
                        AND (:logoutTime IS NULL OR o.created_at <= :logoutTime)
                        AND o.branch = :branch 
                        AND o.is_void = 0
                        ORDER BY o.created_at ASC";
    $sessionStmt = $pdo->prepare($sessionSalesSql);
    $sessionStmt->execute([
        ':userId' => $userId,
        ':loginTime' => $loginTime,
        ':logoutTime' => $logoutTime,
        ':branch' => $branch
    ]);
    $sessionOrders = $sessionStmt->fetchAll();
    
    // Calculate totals
    $sessionSalesTotal = 0;
    $totalDiscount = 0;
    $paymentMethods = [];
    
    foreach ($sessionOrders as $order) {
        $amount = floatval($order['total']);
        $sessionSalesTotal += $amount;
        
        // Calculate discount (20% discount logic)
        if ($order['discountApplied']) {
            $totalDiscount += ($amount / 0.8) * 0.2;
        }
        
        // Payment methods breakdown
        $method = $order['payment_method'] ?: 'Cash';
        if (!isset($paymentMethods[$method])) {
            $paymentMethods[$method] = [
                'count' => 0,
                'total' => 0
            ];
        }
        $paymentMethods[$method]['count']++;
        $paymentMethods[$method]['total'] += $amount;
    }
    
    $endGrossSales = $startGrossSales + $sessionSalesTotal;
    
    // Get voided orders during session
    $voidSql = "SELECT IFNULL(SUM(total), 0) as void_total,
                       COUNT(*) as void_count
                FROM orders 
                WHERE userId = :userId 
                AND created_at >= :loginTime 
                AND (:logoutTime IS NULL OR created_at <= :logoutTime)
                AND branch = :branch 
                AND is_void = 1";
    $voidStmt = $pdo->prepare($voidSql);
    $voidStmt->execute([
        ':userId' => $userId,
        ':loginTime' => $loginTime,
        ':logoutTime' => $logoutTime,
        ':branch' => $branch
    ]);
    $voidData = $voidStmt->fetch();
    
    return [
        'logout_time' => $logoutTime,
        'session_duration' => $sessionDuration,
        'start_gross_sales' => $startGrossSales,
        'end_gross_sales' => $endGrossSales,
        'session_sales' => $sessionSalesTotal,
        'total_discount' => $totalDiscount,
        'total_void' => floatval($voidData['void_total']),
        'void_count' => intval($voidData['void_count']),
        'transaction_count' => count($sessionOrders),
        'payment_methods' => $paymentMethods
    ];
}

// ============================================
// GET CASHIER SESSION DETAILS
// ============================================
function getCashierDetails($pdo, $sessionId, $user) {
    // Get session info
   // Get session info
$sql = "SELECT 
            s.id,
            s.user_id,
            s.user_email,
            s.timestamp as login_time,
            s.branch,
            s.action,
            u.username,
            u.email
        FROM store_status_log s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = :id";
    
    // Add branch restriction for non-admin
    if ($user['role'] !== 'admin' && $user['role'] !== 'owner') {
        $sql .= " AND s.branch = :branch";
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $sessionId, PDO::PARAM_INT);
    if ($user['role'] !== 'admin' && $user['role'] !== 'owner') {
        $stmt->bindValue(':branch', $user['branch']);
    }
    $stmt->execute();
    
    $session = $stmt->fetch();
    
    if (!$session) {
        throw new Exception('Session not found');
    }
    
    // Compute session data
    $sessionData = computeSessionData($pdo, $session);
    $session = array_merge($session, $sessionData);
    
    // Get all orders during session
    $loginTime = $session['login_time'];
    $logoutTime = $session['logout_time'];
    $userId = $session['user_id'];
    $branch = $session['branch'];
    
    $ordersSql = "SELECT o.* 
                  FROM orders o
                  WHERE o.userId = :userId 
                  AND o.created_at >= :loginTime 
                  AND (:logoutTime IS NULL OR o.created_at <= :logoutTime)
                  AND o.branch = :branch 
                  AND o.is_void = 0
                  ORDER BY o.created_at ASC";
    $ordersStmt = $pdo->prepare($ordersSql);
    $ordersStmt->execute([
        ':userId' => $userId,
        ':loginTime' => $loginTime,
        ':logoutTime' => $logoutTime,
        ':branch' => $branch
    ]);
    
    $session['orders'] = $ordersStmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $session
    ]);
}

// ============================================
// GET VOID ORDERS
// ============================================
function getVoidOrders($pdo, $user) {
    $branch = isset($_GET['branch']) ? $_GET['branch'] : 'all';
    $timeRange = isset($_GET['timeRange']) ? $_GET['timeRange'] : 'all';
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause
    $where = ['o.is_void = 1']; // Only voided orders
    $params = [];
    
    // Branch filter
    if ($user['role'] === 'admin' || $user['role'] === 'owner') {
        if ($branch !== 'all') {
            $where[] = 'o.branch = :branch';
            $params[':branch'] = $branch;
        }
    } else {
        $where[] = 'o.branch = :branch';
        $params[':branch'] = $user['branch'];
    }
    
    // Time range filter
    if ($timeRange === 'today') {
        $where[] = 'DATE(o.voided_at) = CURDATE()';
    } elseif ($timeRange === 'yesterday') {
        $where[] = 'DATE(o.voided_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
    } elseif ($timeRange === 'week') {
        $where[] = 'o.voided_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } elseif ($timeRange === 'month') {
        $where[] = 'o.voided_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    } elseif ($timeRange === 'custom' && $startDate && $endDate) {
        $where[] = 'DATE(o.voided_at) BETWEEN :startDate AND :endDate';
        $params[':startDate'] = $startDate;
        $params[':endDate'] = $endDate;
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM orders o WHERE $whereClause";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get paginated data
    $sql = "SELECT 
                o.*,
                u.username as cashier_name,
                u.email as cashier_email
            FROM orders o
            LEFT JOIN users u ON o.userId = u.id
            WHERE $whereClause
            ORDER BY o.voided_at DESC
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $voidOrders = $stmt->fetchAll();
    
    // Format data
    foreach ($voidOrders as &$order) {
        $order['total'] = floatval($order['total']);
        $order['paidAmount'] = floatval($order['paidAmount']);
        $order['changeAmount'] = floatval($order['changeAmount']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $voidOrders,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

// ============================================
// GET SINGLE ORDER
// ============================================
function getOrder($pdo, $orderId, $user) {
    $sql = "SELECT 
                o.*,
                u.username as cashier_name,
                u.email as cashier_email
            FROM orders o
            LEFT JOIN users u ON o.userId = u.id
            WHERE o.id = :id";
    
    // Add branch restriction for non-admin
    if ($user['role'] !== 'admin' && $user['role'] !== 'owner') {
        $sql .= " AND o.branch = :branch";
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $orderId, PDO::PARAM_INT);
    if ($user['role'] !== 'admin' && $user['role'] !== 'owner') {
        $stmt->bindValue(':branch', $user['branch']);
    }
    $stmt->execute();
    
    $order = $stmt->fetch();
    
    if (!$order) {
        throw new Exception('Order not found');
    }
    
    // Format data
    $order['total'] = floatval($order['total']);
    $order['paidAmount'] = floatval($order['paidAmount']);
    $order['changeAmount'] = floatval($order['changeAmount']);
    $order['discountApplied'] = (bool)$order['discountApplied'];
    $order['is_void'] = (bool)$order['is_void'];
    
    echo json_encode([
        'success' => true,
        'data' => $order
    ]);
}

// ============================================
// GET BRANCHES (for admin)
// ============================================
function getBranches($pdo) {
    $sql = "SELECT DISTINCT branch FROM users WHERE branch IS NOT NULL ORDER BY branch";
    $stmt = $pdo->query($sql);
    $branches = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true,
        'data' => $branches
    ]);
}

// ============================================
// VERIFY MANAGER PIN
// ============================================
function verifyManagerPin($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $pin = $input['pin'] ?? null;
    
    if (!$pin) {
        throw new Exception('PIN is required');
    }
    
    // Find managers/owners with void_pin
    $sql = "SELECT id, username, email, role, void_pin 
            FROM users 
            WHERE (role = 'manager' OR role = 'owner') 
            AND void_pin IS NOT NULL";
    $stmt = $pdo->query($sql);
    $managers = $stmt->fetchAll();
    
    if (empty($managers)) {
        throw new Exception('No manager with PIN found');
    }
    
    // Verify PIN against all managers
    foreach ($managers as $manager) {
        if (password_verify($pin, $manager['void_pin'])) {
            echo json_encode([
                'success' => true,
                'manager' => [
                    'id' => $manager['id'],
                    'username' => $manager['username'],
                    'email' => $manager['email'],
                    'role' => $manager['role']
                ]
            ]);
            return;
        }
    }
    
    throw new Exception('Invalid PIN');
}

// ============================================
// VOID ORDER
// ============================================
function voidOrder($pdo, $user) {
    $input = json_decode(file_get_contents('php://input'), true);
    $orderId = $input['orderId'] ?? null;
    $reason = $input['reason'] ?? null;
    $managerInfo = $input['manager'] ?? null;
    
    if (!$orderId || !$reason) {
        throw new Exception('Order ID and reason are required');
    }
    
    // Get order
    $sql = "SELECT * FROM orders WHERE id = :id";
    if ($user['role'] !== 'admin' && $user['role'] !== 'owner') {
        $sql .= " AND branch = :branch";
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $orderId, PDO::PARAM_INT);
    if ($user['role'] !== 'admin' && $user['role'] !== 'owner') {
        $stmt->bindValue(':branch', $user['branch']);
    }
    $stmt->execute();
    
    $order = $stmt->fetch();
    if (!$order) {
        throw new Exception('Order not found');
    }
    
    if ($order['is_void']) {
        throw new Exception('Order already voided');
    }
    
    // Determine who voided it
    $voidedBy = $user['username'] ?? $user['email'];
    
    // If cashier and manager info provided
    if ($user['role'] === 'cashier' && $managerInfo) {
        $voidedBy = ($managerInfo['username'] ?? $managerInfo['email']) . ' (authorized ' . $voidedBy . ')';
    }
    
    // Update order
    $updateSql = "UPDATE orders 
                  SET is_void = 1,
                      void_reason = :reason,
                      voided_by = :voidedBy,
                      voided_at = NOW()
                  WHERE id = :id";
    
    $updateStmt = $pdo->prepare($updateSql);
    $updateStmt->execute([
        ':reason' => $reason,
        ':voidedBy' => $voidedBy,
        ':id' => $orderId
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Order voided successfully',
        'orderId' => $orderId
    ]);
}

// ============================================
// GET CASH-OUT RECORDS
// ============================================
function getCashoutRecords($pdo, $user) {
    $branch = isset($_GET['branch']) ? $_GET['branch'] : 'all';
    $timeRange = isset($_GET['timeRange']) ? $_GET['timeRange'] : 'all';
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    // Build WHERE clause
    $where = ['1=1'];
    $params = [];
    
    // Branch filter
    if ($user['role'] === 'admin' || $user['role'] === 'owner') {
        if ($branch !== 'all') {
            $where[] = 'c.branch = :branch';
            $params[':branch'] = $branch;
        }
    } else {
        $where[] = 'c.branch = :branch';
        $params[':branch'] = $user['branch'];
    }
    
    // Time range filter
    if ($timeRange === 'today') {
        $where[] = 'DATE(c.created_at) = CURDATE()';
    } elseif ($timeRange === 'yesterday') {
        $where[] = 'DATE(c.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
    } elseif ($timeRange === 'week') {
        $where[] = 'c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } elseif ($timeRange === 'month') {
        $where[] = 'c.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    } elseif ($timeRange === 'custom' && $startDate && $endDate) {
        $where[] = 'DATE(c.created_at) BETWEEN :startDate AND :endDate';
        $params[':startDate'] = $startDate;
        $params[':endDate'] = $endDate;
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM cashout c WHERE $whereClause";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get cashout records
    $sql = "SELECT 
                c.*,
                u.username as cashier_name,
                u.email as cashier_email,
                s.timestamp as session_login_time,
                (SELECT timestamp FROM store_status_log 
                 WHERE user_id = s.user_id 
                 AND action = 'close' 
                 AND branch = s.branch
                 AND timestamp > s.timestamp
                 ORDER BY timestamp ASC 
                 LIMIT 1) as session_logout_time
            FROM cashout c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN store_status_log s ON c.cashier_session_id = s.id
            WHERE $whereClause
            ORDER BY c.created_at DESC
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $cashouts = $stmt->fetchAll();
    
    // Format data
    foreach ($cashouts as &$cashout) {
        $cashout['amount'] = floatval($cashout['amount']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $cashouts,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

// ============================================
// RECORD CASH-OUT (POST)
// ============================================
function recordCashout($pdo, $user) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $type = $input['type'] ?? null;
    $amount = $input['amount'] ?? null;
    $reason = $input['reason'] ?? '';
    
    if (!$type || !$amount) {
        throw new Exception('Type and amount are required');
    }
    
    if (!in_array($type, ['withdrawal', 'deposit'])) {
        throw new Exception('Invalid type. Must be withdrawal or deposit');
    }
    
    if ($amount <= 0) {
        throw new Exception('Amount must be greater than 0');
    }
    
    // Get current active session for this user
    $sessionSql = "SELECT s.id 
                   FROM store_status_log s
                   WHERE s.user_id = :userId 
                   AND s.action = 'open'
                   AND s.branch = :branch
                   AND NOT EXISTS (
                       SELECT 1 FROM store_status_log s2 
                       WHERE s2.user_id = s.user_id 
                       AND s2.action = 'close' 
                       AND s2.branch = s.branch
                       AND s2.timestamp > s.timestamp
                   )
                   ORDER BY s.timestamp DESC 
                   LIMIT 1";
    
    $sessionStmt = $pdo->prepare($sessionSql);
    $sessionStmt->execute([
        ':userId' => $user['id'],
        ':branch' => $user['branch']
    ]);
    
    $session = $sessionStmt->fetch();
    
    if (!$session) {
        throw new Exception('No active cashier session found. Please open POS first.');
    }
    
    // Insert cashout record
    $insertSql = "INSERT INTO cashout 
                  (cashier_session_id, user_id, branch, amount, type, reason, created_at) 
                  VALUES 
                  (:sessionId, :userId, :branch, :amount, :type, :reason, NOW())";
    
    $insertStmt = $pdo->prepare($insertSql);
    $insertStmt->execute([
        ':sessionId' => $session['id'],
        ':userId' => $user['id'],
        ':branch' => $user['branch'],
        ':amount' => $amount,
        ':type' => $type,
        ':reason' => $reason
    ]);
    
    $cashoutId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Cash-out recorded successfully',
        'id' => $cashoutId,
        'type' => $type,
        'amount' => floatval($amount)
    ]);
}

// ============================================
// VERIFY OWNER PIN
// ============================================
function verifyOwnerPin($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $pin = $input['pin'] ?? null;
    
    if (!$pin) {
        throw new Exception('PIN is required');
    }
    
    // Find owner with void_pin
    $sql = "SELECT id, username, email, role, void_pin 
            FROM users 
            WHERE role = 'owner' 
            AND void_pin IS NOT NULL";
    $stmt = $pdo->query($sql);
    $owners = $stmt->fetchAll();
    
    if (empty($owners)) {
        throw new Exception('No owner with PIN found');
    }
    
    // Verify PIN against all owners
    foreach ($owners as $owner) {
        if (password_verify($pin, $owner['void_pin'])) {
            echo json_encode([
                'success' => true,
                'owner' => [
                    'id' => $owner['id'],
                    'username' => $owner['username'],
                    'email' => $owner['email'],
                    'role' => $owner['role']
                ]
            ]);
            return;
        }
    }
    
    throw new Exception('Invalid owner PIN');
}

// ============================================
// EDIT CASH-OUT
// ============================================
function editCashout($pdo, $user) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $cashoutId = $input['cashoutId'] ?? null;
    $type = $input['type'] ?? null;
    $amount = $input['amount'] ?? null;
    $reason = $input['reason'] ?? null;
    $editReason = $input['editReason'] ?? null;
    $ownerInfo = $input['owner'] ?? null;
    
    if (!$cashoutId || !$type || !$amount || !$reason || !$editReason || !$ownerInfo) {
        throw new Exception('All fields are required');
    }
    
    if (!in_array($type, ['withdrawal', 'deposit'])) {
        throw new Exception('Invalid type');
    }
    
    if ($amount <= 0) {
        throw new Exception('Amount must be greater than 0');
    }
    
    // Check if cashout exists
    $checkSql = "SELECT * FROM cashout WHERE id = :id";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':id' => $cashoutId]);
    $existingCashout = $checkStmt->fetch();
    
    if (!$existingCashout) {
        throw new Exception('Cash-out record not found');
    }
    
    // Update cashout
    $updateSql = "UPDATE cashout 
                  SET type = :type,
                      amount = :amount,
                      reason = :reason,
                      edited_by = :editedBy,
                      edited_at = NOW(),
                      edit_reason = :editReason
                  WHERE id = :id";
    
    $editedBy = ($ownerInfo['username'] ?? $ownerInfo['email']) . ' (Owner)';
    
    $updateStmt = $pdo->prepare($updateSql);
    $updateStmt->execute([
        ':type' => $type,
        ':amount' => $amount,
        ':reason' => $reason,
        ':editedBy' => $editedBy,
        ':editReason' => $editReason,
        ':id' => $cashoutId
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Cash-out record updated successfully',
        'id' => $cashoutId
    ]);
}
?>