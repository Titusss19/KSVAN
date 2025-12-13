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
            } else {
                throw new Exception('Invalid request');
            }
            break;
            
        case 'POST':
            if ($request === 'void') {
                voidOrder($pdo, $user);
            } elseif ($request === 'verify-pin') {
                verifyManagerPin($pdo);
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
?>