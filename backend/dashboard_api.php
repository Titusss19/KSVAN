<!-- FILE 1: php/dashboard_api.php -->
<!-- Paste this in your backend/dashboard_api.php -->

<?php
session_start();
header('Content-Type: application/json');

// Include database connection
require_once '../config/database.php';

// Check authentication
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user = $_SESSION['user'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        
        // ===== GET STATS =====
        case 'getStats':
            $branch = $_POST['branch'] ?? 'all';
            $stats = getStats($conn, $user, $branch);
            echo json_encode(['success' => true, 'data' => $stats]);
            break;

        // ===== GET USERS =====
        case 'getUsers':
            $branch = $_POST['branch'] ?? $user['branch'];
            $users = getUsers($conn, $user, $branch);
            echo json_encode(['success' => true, 'data' => $users]);
            break;

        // ===== ADD USER =====
        case 'addUser':
            $email = $_POST['email'] ?? '';
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            $role = $_POST['role'] ?? 'cashier';
            $branch = $_POST['branch'] ?? 'main';
            $status = $_POST['status'] ?? 'Active';

            if (!$email || !$password) {
                echo json_encode(['success' => false, 'message' => 'Email and password required']);
                break;
            }

            $result = addUser($conn, $email, $username, $password, $role, $branch, $status);
            echo json_encode($result);
            break;

        // ===== UPDATE USER =====
        case 'updateUser':
            $id = $_POST['id'] ?? 0;
            $email = $_POST['email'] ?? '';
            $username = $_POST['username'] ?? '';
            $role = $_POST['role'] ?? 'cashier';
            $branch = $_POST['branch'] ?? 'main';
            $status = $_POST['status'] ?? 'Active';

            $result = updateUser($conn, $id, $email, $username, $role, $branch, $status);
            echo json_encode($result);
            break;

        // ===== DELETE USER =====
        case 'deleteUser':
            $id = $_POST['id'] ?? 0;
            $result = deleteUser($conn, $id);
            echo json_encode($result);
            break;

        // ===== GET ANNOUNCEMENTS =====
        case 'getAnnouncements':
            $branch = $_POST['branch'] ?? $user['branch'];
            $announcements = getAnnouncements($conn, $user, $branch);
            echo json_encode(['success' => true, 'data' => $announcements]);
            break;

        // ===== POST ANNOUNCEMENT =====
        case 'postAnnouncement':
            $title = $_POST['title'] ?? '';
            $message = $_POST['message'] ?? '';
            $type = $_POST['type'] ?? 'info';

            if (!$title || !$message) {
                echo json_encode(['success' => false, 'message' => 'Title and message required']);
                break;
            }

            $result = postAnnouncement($conn, $title, $message, $type, $user);
            echo json_encode($result);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

// ============================================
// FUNCTIONS
// ============================================

function getStats($conn, $user, $branch) {
    $branch_filter = ($branch === 'all' || $user['role'] === 'admin') ? '' : " AND branch = '{$branch}'";

    // Get Gross Sales
    $query = "SELECT SUM(total) as gross_sales, COUNT(*) as total_orders FROM orders WHERE is_void = 0{$branch_filter}";
    $result = $conn->query($query);
    $sales_data = $result->fetch_assoc();

    // Get Voided Orders
    $query = "SELECT SUM(total) as voided_amount, COUNT(*) as voided_count FROM orders WHERE is_void = 1{$branch_filter}";
    $result = $conn->query($query);
    $voided_data = $result->fetch_assoc();

    // Get Inventory Total
    $query = "SELECT SUM(total_price) as inventory_value, COUNT(*) as item_count FROM inventory_items{$branch_filter}";
    $result = $conn->query($query);
    $inventory_data = $result->fetch_assoc();

    // Get Active Employees
    $query = "SELECT COUNT(*) as active_count FROM users WHERE status = 'Active'{$branch_filter}";
    $result = $conn->query($query);
    $employees_data = $result->fetch_assoc();

    // Today's Stats
    $today = date('Y-m-d');
    $query = "SELECT SUM(total) as today_sales, COUNT(*) as today_transactions FROM orders 
              WHERE DATE(created_at) = '{$today}' AND is_void = 0{$branch_filter}";
    $result = $conn->query($query);
    $today_data = $result->fetch_assoc();

    return [
        'grossSales' => floatval($sales_data['gross_sales'] ?? 0),
        'netSales' => floatval(($sales_data['gross_sales'] ?? 0) - ($voided_data['voided_amount'] ?? 0)),
        'voidedAmount' => floatval($voided_data['voided_amount'] ?? 0),
        'voidedCount' => intval($voided_data['voided_count'] ?? 0),
        'todaySales' => floatval($today_data['today_sales'] ?? 0),
        'todayTransactions' => intval($today_data['today_transactions'] ?? 0),
        'inventoryValue' => floatval($inventory_data['inventory_value'] ?? 0),
        'inventoryItemCount' => intval($inventory_data['item_count'] ?? 0),
        'activeEmployees' => intval($employees_data['active_count'] ?? 0)
    ];
}

function getUsers($conn, $user, $branch) {
    if ($user['role'] === 'admin') {
        $query = "SELECT id, email, username, role, status, branch, created_at FROM users ORDER BY created_at DESC";
        $result = $conn->query($query);
    } else {
        $query = "SELECT id, email, username, role, status, branch, created_at FROM users WHERE branch = ? ORDER BY created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $branch);
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    return $users;
}

function addUser($conn, $email, $username, $password, $role, $branch, $status) {
    // Check if email exists
    $check_query = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($check_query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        return ['success' => false, 'message' => 'Email already exists'];
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Insert user
    $insert_query = "INSERT INTO users (email, username, password, role, status, branch) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insert_query);
    $stmt->bind_param("ssssss", $email, $username, $hashed_password, $role, $status, $branch);

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'User added successfully', 'userId' => $conn->insert_id];
    } else {
        return ['success' => false, 'message' => 'Failed to add user'];
    }
}

function updateUser($conn, $id, $email, $username, $role, $branch, $status) {
    $update_query = "UPDATE users SET email = ?, username = ?, role = ?, status = ?, branch = ? WHERE id = ?";
    $stmt = $conn->prepare($update_query);
    $stmt->bind_param("sssssi", $email, $username, $role, $status, $branch, $id);

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'User updated successfully'];
    } else {
        return ['success' => false, 'message' => 'Failed to update user'];
    }
}

function deleteUser($conn, $id) {
    $delete_query = "DELETE FROM users WHERE id = ?";
    $stmt = $conn->prepare($delete_query);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'User deleted successfully'];
    } else {
        return ['success' => false, 'message' => 'Failed to delete user'];
    }
}

function getAnnouncements($conn, $user, $branch) {
    if ($user['role'] === 'admin') {
        $query = "SELECT * FROM announcements ORDER BY is_global DESC, created_at DESC";
        $result = $conn->query($query);
    } else {
        $query = "SELECT * FROM announcements WHERE is_global = 1 OR branch = ? ORDER BY is_global DESC, created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $branch);
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $announcements = [];
    while ($row = $result->fetch_assoc()) {
        $announcements[] = $row;
    }
    return $announcements;
}

function postAnnouncement($conn, $title, $message, $type, $user) {
    $author = $user['email'];
    $is_global = ($user['role'] === 'admin') ? 1 : 0;
    $branch = $is_global ? NULL : $user['branch'];

    $insert_query = "INSERT INTO announcements (title, message, author, type, is_global, branch) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insert_query);
    $stmt->bind_param("ssssis", $title, $message, $author, $type, $is_global, $branch);

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Announcement posted', 'announcementId' => $conn->insert_id];
    } else {
        return ['success' => false, 'message' => 'Failed to post announcement'];
    }
}

?>


