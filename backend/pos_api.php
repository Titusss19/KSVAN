<?php
// KSTREET/backend/pos_api.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

// ============================
// HELPER FUNCTIONS
// ============================

function getUserFromHeaders() {
    $headers = getallheaders();
    
    if (isset($headers['X-User'])) {
        $userData = json_decode($headers['X-User'], true);
        return $userData;
    }
    
    return null;
}

function sendResponse($success, $data = [], $message = '') {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ]);
    exit;
}

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit;
}

// ============================
// ROUTING
// ============================

$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        // ============================
        // STORE STATUS ENDPOINTS
        // ============================
        case 'get_store_status':
            getStoreStatus($pdo);
            break;
            
        case 'log_store_action':
            logStoreAction($pdo);
            break;
        
        // ============================
        // ITEMS ENDPOINTS
        // ============================
        case 'get_items':
            getItems($pdo);
            break;
            
        case 'get_all_items':
            getAllItems($pdo);
            break;
        
        // ============================
        // ORDERS ENDPOINTS
        // ============================
        case 'create_order':
            createOrder($pdo);
            break;
            
        case 'get_orders':
            getOrders($pdo);
            break;
        
        default:
            sendError('Invalid action', 404);
    }
} catch (Exception $e) {
    error_log('POS API Error: ' . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage(), 500);
}

// ============================
// STORE STATUS FUNCTIONS
// ============================

function getStoreStatus($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $userBranch = $user['branch'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                s.*,
                u.email as action_by_email
            FROM store_status_log s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.branch = ?
            ORDER BY s.timestamp DESC 
            LIMIT 1
        ");
        
        $stmt->execute([$userBranch]);
        $result = $stmt->fetch();
        
        if (!$result) {
            echo json_encode([
                'isOpen' => false,
                'lastAction' => null,
                'message' => 'Store status not initialized'
            ]);
            exit;
        }
        
        echo json_encode([
            'isOpen' => $result['action'] === 'open',
            'lastAction' => [
                'timestamp' => $result['timestamp'],
                'action' => $result['action'],
                'user_id' => $result['user_id'],
                'branch' => $result['branch'],
                'action_by_email' => $result['action_by_email']
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log('Error in getStoreStatus: ' . $e->getMessage());
        sendError('Error fetching store status');
    }
}

function logStoreAction($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $userId = $input['userId'] ?? null;
    $userEmail = $input['userEmail'] ?? null;
    $action = $input['action'] ?? null;
    $userBranch = $user['branch'];
    
    if (!$userId || !$action) {
        sendError('User ID and action are required');
    }
    
    $validActions = ['open', 'close'];
    if (!in_array($action, $validActions)) {
        sendError('Action must be "open" or "close"');
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO store_status_log (user_id, user_email, action, branch)
            VALUES (?, ?, ?, ?)
        ");
        
        $stmt->execute([$userId, $userEmail, $action, $userBranch]);
        
        echo json_encode([
            'success' => true,
            'message' => "Store {$action}ed successfully",
            'logId' => $pdo->lastInsertId(),
            'timestamp' => date('Y-m-d H:i:s'),
            'branch' => $userBranch
        ]);
        
    } catch (PDOException $e) {
        error_log('Error in logStoreAction: ' . $e->getMessage());
        sendError('Failed to log store action');
    }
}

// ============================
// ITEMS FUNCTIONS
// ============================

function getItems($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $userBranch = $user['branch'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM items 
            WHERE branch = ? 
            ORDER BY created_at DESC
        ");
        
        $stmt->execute([$userBranch]);
        $items = $stmt->fetchAll();
        
        echo json_encode($items);
        
    } catch (PDOException $e) {
        error_log('Error in getItems: ' . $e->getMessage());
        sendError('Error fetching items');
    }
}

function getAllItems($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $userBranch = $user['branch'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM items 
            WHERE branch = ? 
            ORDER BY created_at DESC
        ");
        
        $stmt->execute([$userBranch]);
        $items = $stmt->fetchAll();
        
        echo json_encode($items);
        
    } catch (PDOException $e) {
        error_log('Error in getAllItems: ' . $e->getMessage());
        sendError('Error fetching all items');
    }
}

// ============================
// ORDERS FUNCTIONS
// ============================

function createOrder($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $userId = $input['userId'] ?? null;
    $paidAmount = $input['paidAmount'] ?? 0;
    $total = $input['total'] ?? 0;
    $discountApplied = $input['discountApplied'] ?? false;
    $changeAmount = $input['changeAmount'] ?? 0;
    $orderType = $input['orderType'] ?? 'Dine In';
    $productNames = $input['productNames'] ?? 'No items';
    $items = $input['items'] ?? '[]';
    $paymentMethod = $input['paymentMethod'] ?? 'Cash';
    $userBranch = $user['branch'];
    
    if (!$userId || $paidAmount === null) {
        sendError('Invalid order data: userId and paidAmount are required');
    }
    
    $validPaymentMethods = ['Cash', 'Gcash', 'Gcash + Cash', 'Grab'];
    if (!in_array($paymentMethod, $validPaymentMethods)) {
        $paymentMethod = 'Cash';
    }
    
    // Ensure items is a string
    if (is_array($items)) {
        $items = json_encode($items);
    }
    
    // Convert discountApplied to 0 or 1
    $discountAppliedInt = $discountApplied ? 1 : 0;
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO orders 
            (userId, paidAmount, total, discountApplied, changeAmount, orderType, 
             productNames, items, payment_method, branch)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            (int)$userId,
            (float)$paidAmount,
            (float)$total,
            $discountAppliedInt,
            (float)$changeAmount,
            $orderType,
            $productNames,
            $items,
            $paymentMethod,
            $userBranch
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Order saved successfully',
            'orderId' => $pdo->lastInsertId(),
            'branch' => $userBranch
        ]);
        
    } catch (PDOException $e) {
        error_log('Error in createOrder: ' . $e->getMessage());
        sendError('Failed to save order to database: ' . $e->getMessage());
    }
}

function getOrders($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $userBranch = $user['branch'];
    $userRole = $user['role'] ?? 'cashier';
    
    $branch = isset($_GET['branch']) ? $_GET['branch'] : null;
    
    try {
        $query = "
            SELECT 
                o.*,
                u.email as cashier
            FROM orders o
            LEFT JOIN users u ON o.userId = u.id
        ";
        
        $params = [];
        
        // Branch filtering logic
        if ($branch) {
            if ($branch === 'all') {
                // Admin viewing all branches
                if ($userRole === 'admin' || $userRole === 'owner') {
                    // No WHERE clause needed
                } else {
                    // Non-admin restricted to own branch
                    $query .= " WHERE o.branch = ?";
                    $params[] = $userBranch;
                }
            } else {
                // Specific branch requested
                if ($userRole === 'admin' || $userRole === 'owner') {
                    $query .= " WHERE o.branch = ?";
                    $params[] = $branch;
                } else {
                    // Non-admin can only view their own branch
                    if ($branch === $userBranch) {
                        $query .= " WHERE o.branch = ?";
                        $params[] = $userBranch;
                    } else {
                        // Return empty array
                        echo json_encode([]);
                        exit;
                    }
                }
            }
        } else {
            // No branch filter
            if ($userRole === 'admin' || $userRole === 'owner') {
                // Admin sees all orders
            } else {
                // Non-admin sees only their branch
                $query .= " WHERE o.branch = ?";
                $params[] = $userBranch;
            }
        }
        
        $query .= " ORDER BY o.created_at DESC";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();
        
        // Format results
        $formattedOrders = array_map(function($order) {
            return [
                'id' => $order['id'],
                'userId' => $order['userId'],
                'cashier' => $order['cashier'] ?? 'N/A',
                'total' => (float)($order['total'] ?? $order['paidAmount'] ?? 0),
                'paidAmount' => (float)($order['paidAmount'] ?? 0),
                'changeAmount' => (float)($order['changeAmount'] ?? 0),
                'discountApplied' => (int)($order['discountApplied'] ?? 0),
                'orderType' => $order['orderType'] ?? 'Dine In',
                'productNames' => $order['productNames'] ?? '',
                'items' => $order['items'] ?? '[]',
                'payment_method' => $order['payment_method'] ?? 'Cash',
                'branch' => $order['branch'] ?? 'main',
                'created_at' => $order['created_at'] ?? null,
                'is_void' => (int)($order['is_void'] ?? 0),
                'void_reason' => $order['void_reason'] ?? null,
                'voided_by' => $order['voided_by'] ?? null,
                'voided_at' => $order['voided_at'] ?? null
            ];
        }, $orders);
        
        echo json_encode($formattedOrders);
        
    } catch (PDOException $e) {
        error_log('Error in getOrders: ' . $e->getMessage());
        sendError('Error fetching orders');
    }
}

?>