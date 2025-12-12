<?php
// KSTREET/backend/update_profile.php
session_start();
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

try {
    require_once  'config/database.php';

    if (!isset($_SESSION['user'])) {
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $_SESSION['user']['id'];
    
    $username = $data['username'] ?? '';
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    $voidPin = $data['void_pin'] ?? '';

    if (empty($username)) {
        echo json_encode(['success' => false, 'message' => 'Username required']);
        exit;
    }

    // Get current user data
    $stmt = $pdo->prepare("SELECT password, role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    // Build update query
    $updateFields = ['username = ?'];
    $params = [$username];

    // If changing password
    if (!empty($currentPassword)) {
        if (!password_verify($currentPassword, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            exit;
        }

        if (strlen($newPassword) < 6) {
            echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters']);
            exit;
        }

        $updateFields[] = 'password = ?';
        $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
    }

    // If updating void PIN (only for manager/admin)
    if (!empty($voidPin) && ($user['role'] === 'manager' || $user['role'] === 'owner')) {
        if (strlen($voidPin) < 4 || strlen($voidPin) > 6) {
            echo json_encode(['success' => false, 'message' => 'Void PIN must be 4-6 digits']);
            exit;
        }

        $updateFields[] = 'void_pin = ?';
        $params[] = password_hash($voidPin, PASSWORD_DEFAULT);
    }

    // Add user ID to params
    $params[] = $userId;

    // Execute update
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Update session
    $_SESSION['user']['username'] = $username;
    $_SESSION['user']['name'] = $username;

    echo json_encode(['success' => true, 'message' => 'Settings updated successfully']);

} catch (Exception $e) {
    error_log("Update profile error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>