<?php
session_start();
require_once 'config/database.php';  // config is inside backend folder

header('Content-Type: application/json; charset=utf-8');

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

try {
    $user = $_SESSION['user'];
    
    // Build query based on user role - FETCHING DATA, NOT SAVING
    if ($user['role'] === 'admin' || $user['role'] === 'owner') {
        $stmt = $pdo->prepare("SELECT * FROM items ORDER BY id DESC");
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("SELECT * FROM items WHERE branch = :branch ORDER BY id DESC");
        $stmt->execute([':branch' => $user['branch']]);
    }
    
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'products' => $products
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

exit();
?>