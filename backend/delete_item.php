<?php
session_start();
header('Content-Type: application/json');

// TEMPORARILY enable errors to see what's wrong
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

// Database connection using PDO
try {
    require_once 'config/database.php'; 
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to load database config: ' . $e->getMessage()]);
    exit();
}

// Check connection (PDO uses $pdo, not $conn)
if (!isset($pdo)) {
    echo json_encode(['success' => false, 'error' => 'Database connection object not found']);
    exit();
}

try {
    // Get POST data
    $type = isset($_POST['type']) ? $_POST['type'] : '';
    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
    
    if (empty($type) || $id <= 0) {
        throw new Exception('Missing required parameters');
    }
    
    // Validate type
    if (!in_array($type, ['product', 'inventory'])) {
        throw new Exception('Invalid type: ' . $type);
    }
    
    // Get user info
    $user = $_SESSION['user'];
    $isAdmin = in_array($user['role'], ['admin', 'owner']);
    
    // Delete based on type
    if ($type === 'product') {
        $table = 'items';
        
        // First check if product exists and user has permission
        $stmt = $pdo->prepare("SELECT id, branch FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        
        if (!$item) {
            throw new Exception('Product not found');
        }
        
        // Check permissions
        if (!$isAdmin && $item['branch'] !== $user['branch']) {
            throw new Exception('You do not have permission to delete this product');
        }
        
        // Delete product
        $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
        
    } else if ($type === 'inventory') {
        $table = 'inventory_items';
        
        // First check if inventory exists and user has permission
        $stmt = $pdo->prepare("SELECT id, branch FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        
        if (!$item) {
            throw new Exception('Inventory item not found');
        }
        
        // Check permissions
        if (!$isAdmin && $item['branch'] !== $user['branch']) {
            throw new Exception('You do not have permission to delete this inventory item');
        }
        
        // Delete inventory
        $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Inventory item deleted successfully'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>