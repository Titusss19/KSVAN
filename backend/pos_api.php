<?php
// KSTREET/backend/pos_api.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// SET PHILIPPINES TIMEZONE - FIXED
date_default_timezone_set('Asia/Manila');

require_once 'config/database.php';

// ============================
// HELPER FUNCTIONS
// ============================

function getUserFromHeaders() {
    // Try multiple methods to get the X-User header
    $userData = null;
    
    // Method 1: getallheaders() (Apache)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['X-User'])) {
            $userData = json_decode($headers['X-User'], true);
        }
    }
    
    // Method 2: $_SERVER with HTTP_ prefix (nginx, most servers)
    if (!$userData && isset($_SERVER['HTTP_X_USER'])) {
        $userData = json_decode($_SERVER['HTTP_X_USER'], true);
    }
    
    // Method 3: apache_request_headers()
    if (!$userData && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['X-User'])) {
            $userData = json_decode($headers['X-User'], true);
        }
    }
    
    // Debug log
    if (!$userData) {
        error_log('getUserFromHeaders: No X-User header found');
        error_log('Available headers: ' . print_r($_SERVER, true));
    }
    
    return $userData;
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
        
        // ============================
        // QUEUE ENDPOINTS (NEW)
        // ============================
        case 'add_to_queue':
            addToQueue($pdo);
            break;
            
        case 'get_queue':
            getQueue($pdo);
            break;
            
        case 'get_table_counter':
            getTableCounter($pdo);
            break;
            
        case 'delete_queue':
            deleteQueue($pdo);
            break;
        
        default:
            sendError('Invalid action', 404);
    }
} catch (Exception $e) {
    error_log('POS API Error: ' . $e->getMessage());
    sendError('Internal server error: ' . $e->getMessage(), 500);
}

// ============================
// STORE STATUS FUNCTIONS - FIXED
// ============================

function getStoreStatus($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        error_log('getStoreStatus: User authentication failed');
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
        
        // Convert timestamp to Philippine time for display
        $timestamp = new DateTime($result['timestamp'], new DateTimeZone('UTC'));
        $timestamp->setTimezone(new DateTimeZone('Asia/Manila'));
        $philippineTime = $timestamp->format('Y-m-d H:i:s');
        
        echo json_encode([
            'isOpen' => $result['action'] === 'open',
            'lastAction' => [
                'timestamp' => $philippineTime,
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
        // Get current Philippine time
        $phTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
        $timestamp = $phTime->format('Y-m-d H:i:s');
        
        $stmt = $pdo->prepare("
            INSERT INTO store_status_log (user_id, user_email, action, branch, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([$userId, $userEmail, $action, $userBranch, $timestamp]);
        
        // Format for display
        $displayTime = $phTime->format('h:i:s A');
        
        echo json_encode([
            'success' => true,
            'message' => "Store {$action}ed successfully",
            'logId' => $pdo->lastInsertId(),
            'timestamp' => $timestamp,
            'displayTime' => $displayTime,
            'branch' => $userBranch
        ]);
        
    } catch (PDOException $e) {
        error_log('Error in logStoreAction: ' . $e->getMessage());
        sendError('Failed to log store action: ' . $e->getMessage());
    }
}

// ============================
// ITEMS FUNCTIONS
// ============================

function getItems($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        error_log('getItems: User authentication failed');
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
        error_log('getAllItems: User authentication failed');
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
// ORDERS FUNCTIONS - FIXED TIMEZONE
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
    
    // Get current Philippine time
    $phTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
    $createdAt = $phTime->format('Y-m-d H:i:s');
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO orders 
            (userId, paidAmount, total, discountApplied, changeAmount, orderType, 
             productNames, items, payment_method, branch, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            $userBranch,
            $createdAt
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Order saved successfully',
            'orderId' => $pdo->lastInsertId(),
            'branch' => $userBranch,
            'timestamp' => $createdAt
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
        
        // Format results with Philippine timezone
        $formattedOrders = array_map(function($order) {
            // Convert stored time to Philippine time for display
            if ($order['created_at']) {
                $timestamp = new DateTime($order['created_at'], new DateTimeZone('UTC'));
                $timestamp->setTimezone(new DateTimeZone('Asia/Manila'));
                $displayTime = $timestamp->format('Y-m-d h:i:s A');
            } else {
                $displayTime = $order['created_at'];
            }
            
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
                'created_at' => $displayTime,
                'original_timestamp' => $order['created_at'],
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

// ============================
// QUEUE MANAGEMENT FUNCTIONS (NEW)
// ============================

function addToQueue($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $userId = $input['userId'] ?? null;
    $orderType = $input['orderType'] ?? 'Dine In';
    $items = $input['items'] ?? '[]';
    $discountApplied = $input['discountApplied'] ?? false;
    $employeeDiscountApplied = $input['employeeDiscountApplied'] ?? false;
    $subtotal = $input['subtotal'] ?? 0;
    $total = $input['total'] ?? 0;
    $userBranch = $user['branch'];
    
    if (!$userId) {
        sendError('User ID is required');
    }
    
    // Ensure items is a string
    if (is_array($items)) {
        $items = json_encode($items);
    }
    
    // Get current Philippine time
    $phTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
    $timestamp = $phTime->format('Y-m-d H:i:s');
    $dateOnly = $phTime->format('Y-m-d');
    
    try {
        // Get or increment table counter for today
        $stmt = $pdo->prepare("
            SELECT table_counter 
            FROM queue_table_counter 
            WHERE branch = ? AND date = ?
        ");
        $stmt->execute([$userBranch, $dateOnly]);
        $counterResult = $stmt->fetch();
        
        if ($counterResult) {
            // Increment existing counter
            $tableNumber = (int)$counterResult['table_counter'] + 1;
            
            $stmt = $pdo->prepare("
                UPDATE queue_table_counter 
                SET table_counter = ? 
                WHERE branch = ? AND date = ?
            ");
            $stmt->execute([$tableNumber, $userBranch, $dateOnly]);
        } else {
            // First queue of the day
            $tableNumber = 1;
            
            $stmt = $pdo->prepare("
                INSERT INTO queue_table_counter (branch, date, table_counter)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$userBranch, $dateOnly, $tableNumber]);
        }
        
        // Insert into queue
        $stmt = $pdo->prepare("
            INSERT INTO order_queue 
            (user_id, table_number, order_type, items, discount_applied, 
             employee_discount_applied, subtotal, total, branch, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            (int)$userId,
            $tableNumber,
            $orderType,
            $items,
            $discountApplied ? 1 : 0,
            $employeeDiscountApplied ? 1 : 0,
            (float)$subtotal,
            (float)$total,
            $userBranch,
            $timestamp
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Order added to queue',
            'queueId' => $pdo->lastInsertId(),
            'tableNumber' => $tableNumber,
            'branch' => $userBranch,
            'timestamp' => $timestamp
        ]);
        
    } catch (PDOException $e) {
        error_log('Error in addToQueue: ' . $e->getMessage());
        sendError('Failed to add order to queue: ' . $e->getMessage());
    }
}

function getQueue($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $userBranch = $user['branch'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                q.*,
                u.email as cashier_email
            FROM order_queue q
            LEFT JOIN users u ON q.user_id = u.id
            WHERE q.branch = ?
            ORDER BY q.timestamp DESC
        ");
        
        $stmt->execute([$userBranch]);
        $queue = $stmt->fetchAll();
        
        // Format results
        $formattedQueue = array_map(function($item) {
            if ($item['timestamp']) {
                $timestamp = new DateTime($item['timestamp'], new DateTimeZone('UTC'));
                $timestamp->setTimezone(new DateTimeZone('Asia/Manila'));
                $displayTime = $timestamp->format('Y-m-d h:i:s A');
            } else {
                $displayTime = $item['timestamp'];
            }
            
            return [
                'id' => $item['id'],
                'user_id' => $item['user_id'],
                'cashier_email' => $item['cashier_email'] ?? 'N/A',
                'table_number' => (int)$item['table_number'],
                'order_type' => $item['order_type'],
                'items' => $item['items'],
                'discount_applied' => (int)$item['discount_applied'],
                'employee_discount_applied' => (int)$item['employee_discount_applied'],
                'subtotal' => (float)$item['subtotal'],
                'total' => (float)$item['total'],
                'branch' => $item['branch'],
                'timestamp' => $displayTime,
                'original_timestamp' => $item['timestamp']
            ];
        }, $queue);
        
        echo json_encode($formattedQueue);
        
    } catch (PDOException $e) {
        error_log('Error in getQueue: ' . $e->getMessage());
        sendError('Error fetching queue');
    }
}

function getTableCounter($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $userBranch = $user['branch'];
    
    try {
        $phTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
        $dateOnly = $phTime->format('Y-m-d');
        
        $stmt = $pdo->prepare("
            SELECT table_counter 
            FROM queue_table_counter 
            WHERE branch = ? AND date = ?
        ");
        
        $stmt->execute([$userBranch, $dateOnly]);
        $result = $stmt->fetch();
        
        $tableCounter = $result ? (int)$result['table_counter'] : 0;
        
        echo json_encode([
            'success' => true,
            'tableCounter' => $tableCounter,
            'date' => $dateOnly,
            'branch' => $userBranch
        ]);
        
    } catch (PDOException $e) {
        error_log('Error in getTableCounter: ' . $e->getMessage());
        sendError('Error fetching table counter');
    }
}

function deleteQueue($pdo) {
    $user = getUserFromHeaders();
    
    if (!$user || !isset($user['branch'])) {
        sendError('User authentication required', 401);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $queueId = $input['queueId'] ?? null;
    $userBranch = $user['branch'];
    
    if (!$queueId) {
        sendError('Queue ID is required');
    }
    
    try {
        // Verify queue belongs to user's branch
        $stmt = $pdo->prepare("
            SELECT id FROM order_queue 
            WHERE id = ? AND branch = ?
        ");
        $stmt->execute([$queueId, $userBranch]);
        
        if (!$stmt->fetch()) {
            sendError('Queue not found or access denied', 404);
        }
        
        // Delete queue
        $stmt = $pdo->prepare("
            DELETE FROM order_queue 
            WHERE id = ? AND branch = ?
        ");
        $stmt->execute([$queueId, $userBranch]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Queue deleted successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log('Error in deleteQueue: ' . $e->getMessage());
        sendError('Failed to delete queue: ' . $e->getMessage());
    }
}
?>