<?php
// backend/config/database.php - Database Connection

// Database configuration for XAMPP
$host = 'localhost';
$dbname = 'db';         // PALITAN MO ITO SA "db"
$username = 'root';     // Default XAMPP username
$password = '';         // Default XAMPP password (empty)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->query("SELECT 1");
    
} catch (PDOException $e) {
    die(json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]));
}
?>