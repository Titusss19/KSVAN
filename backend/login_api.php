<?php
session_start();
header('Content-Type: application/json');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit();
}

try {
    $host = 'localhost';
    $dbname = 'db';
    $username = 'root';
    $password_db = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password_db);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit();
    }
    
    // SET SESSION WITH BRANCH!
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'username' => $user['username'] ?? $user['email'],
        'role' => $user['role'],
        'branch' => $user['branch'] ?? 'main'  // ← ADDED THIS!
    ];
    
    echo json_encode([
        'success' => true,
        'user' => $_SESSION['user']
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>