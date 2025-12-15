<?php
header('Content-Type: application/json');
session_start();

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit();
}

// Include database connection
require_once __DIR__ . '/config/database.php';

try {
    // Fetch all categories
    $stmt = $pdo->prepare("SELECT id, category_name FROM category ORDER BY category_name ASC");
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>