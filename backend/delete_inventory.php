<?php
session_start();
require_once 'config/database.php';

header('Content-Type: application/json; charset=utf-8');

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

try {
    $user = $_SESSION['user'];
    
    if (!isset($_POST['id'])) {
        echo json_encode(['success' => false, 'error' => 'Inventory ID is required']);
        exit();
    }

    $inventoryId = intval($_POST['id']);
    
    // Check if inventory exists and if user has permission
    $checkStmt = $pdo->prepare("SELECT branch FROM inventory WHERE id = :id");
    $checkStmt->execute([':id' => $inventoryId]);
    $inventory = $checkStmt->fetch();
    
    if (!$inventory) {
        echo json_encode(['success' => false, 'error' => 'Inventory item not found']);
        exit();
    }
    
    // Check permission
    if ($user['role'] !== 'admin' && $user['role'] !== 'owner' && $inventory['branch'] !== $user['branch']) {
        echo json_encode(['success' => false, 'error' => 'You do not have permission to delete this inventory item']);
        exit();
    }
    
    // Delete inventory
    $stmt = $pdo->prepare("DELETE FROM inventory WHERE id = :id");
    $success = $stmt->execute([':id' => $inventoryId]);

    if ($success && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Inventory item deleted successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to delete inventory item'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>