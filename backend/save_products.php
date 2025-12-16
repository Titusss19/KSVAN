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
    
    // Get form data
    $product_code = trim($_POST['product_code']);
    $name = trim($_POST['name']);
    $category = trim($_POST['category']);  // Now a text field
    $description_type = trim($_POST['description_type']);
    $price = floatval($_POST['price']);
    $image = trim($_POST['image']);
    $branch = trim($_POST['branch']);
    
    // Validate required fields
    if (empty($product_code) || empty($name) || empty($category) || empty($image)) {
        echo json_encode(['success' => false, 'error' => 'All required fields must be filled']);
        exit();
    }
    
    // Check if editing existing product
    if (isset($_POST['id']) && !empty($_POST['id'])) {
        $id = intval($_POST['id']);
        
        // Check if user has permission to edit this product
        $checkStmt = $pdo->prepare("SELECT branch FROM items WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        $existingProduct = $checkStmt->fetch();
        
        if (!$existingProduct) {
            echo json_encode(['success' => false, 'error' => 'Product not found']);
            exit();
        }
        
        // Check permission
        if ($user['role'] !== 'admin' && $user['role'] !== 'owner' && $existingProduct['branch'] !== $user['branch']) {
            echo json_encode(['success' => false, 'error' => 'You do not have permission to edit this product']);
            exit();
        }
        
        // Update product
        $stmt = $pdo->prepare("UPDATE items SET 
            product_code = :product_code,
            name = :name,
            category = :category,
            description_type = :description_type,
            price = :price,
            image = :image,
            branch = :branch
            WHERE id = :id");
        
        $success = $stmt->execute([
            ':product_code' => $product_code,
            ':name' => $name,
            ':category' => $category,
            ':description_type' => $description_type,
            ':price' => $price,
            ':image' => $image,
            ':branch' => $branch,
            ':id' => $id
        ]);
        
        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to update product']);
        }
        
    } else {
        // Insert new product
        $stmt = $pdo->prepare("INSERT INTO items (product_code, name, category, description_type, price, image, branch) 
            VALUES (:product_code, :name, :category, :description_type, :price, :image, :branch)");
        
        $success = $stmt->execute([
            ':product_code' => $product_code,
            ':name' => $name,
            ':category' => $category,
            ':description_type' => $description_type,
            ':price' => $price,
            ':image' => $image,
            ':branch' => $branch
        ]);
        
        if ($success) {
            echo json_encode(['success' => true, 'message' => 'Product added successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to add product']);
        }
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>