<?php
// NO whitespace before this line!
session_start();
require_once '../config/database.php'; // FIXED: was 'config/database.php'

// Clean output buffer
if (ob_get_level()) ob_end_clean();
ob_start();

header('Content-Type: application/json; charset=utf-8');

// Disable error display
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Check if user is logged in
if (!isset($_SESSION['user'])) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit();
}

try {
    // Get form data
    $product_code = strtoupper(trim($_POST['product_code'] ?? ''));
    $name = trim($_POST['name'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $description_type = trim($_POST['description_type'] ?? 'k-street food');
    $price = floatval($_POST['price'] ?? 0);
    $image = trim($_POST['image'] ?? '');
    $branch = trim($_POST['branch'] ?? 'main');
    
    // Validate required fields
    if (empty($product_code)) {
        throw new Exception("Product code is required");
    }
    if (empty($name)) {
        throw new Exception("Product name is required");
    }
    if (empty($category)) {
        throw new Exception("Category is required");
    }
    if (empty($image)) {
        throw new Exception("Image URL is required");
    }
    
    // Check if editing or adding new
    if (isset($_POST['id']) && !empty($_POST['id'])) {
        // Update existing product
        $stmt = $pdo->prepare("
            UPDATE items 
            SET product_code = :product_code,
                name = :name,
                category = :category,
                description_type = :description_type,
                price = :price,
                image = :image,
                branch = :branch
            WHERE id = :id
        ");
        
        $stmt->execute([
            ':product_code' => $product_code,
            ':name' => $name,
            ':category' => $category,
            ':description_type' => $description_type,
            ':price' => $price,
            ':image' => $image,
            ':branch' => $branch,
            ':id' => intval($_POST['id'])
        ]);
        
        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Product updated successfully',
            'id' => intval($_POST['id'])
        ]);
        
    } else {
        // Insert new product
        $stmt = $pdo->prepare("
            INSERT INTO items (
                product_code,
                name,
                category,
                description_type,
                price,
                image,
                branch,
                created_at
            ) VALUES (
                :product_code,
                :name,
                :category,
                :description_type,
                :price,
                :image,
                :branch,
                NOW()
            )
        ");
        
        $stmt->execute([
            ':product_code' => $product_code,
            ':name' => $name,
            ':category' => $category,
            ':description_type' => $description_type,
            ':price' => $price,
            ':image' => $image,
            ':branch' => $branch
        ]);
        
        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Product added successfully',
            'id' => intval($pdo->lastInsertId())
        ]);
    }
    
} catch (PDOException $e) {
    ob_clean();
    if ($e->getCode() == 23000) {
        echo json_encode(['success' => false, 'error' => 'Product code already exists for this branch']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
} catch (Exception $e) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

ob_end_flush();
exit();