<?php
// backend/register_api.php
header('Content-Type: application/json');
require_once 'config/database.php';

$input = json_decode(file_get_contents('php://input'), true);

// Extract data
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$confirmPassword = $input['confirmPassword'] ?? '';
$role = $input['role'] ?? 'cashier';
$username = $input['username'] ?? '';
$status = $input['status'] ?? 'Active';
$branch = $input['branch'] ?? 'main';
$void_pin = $input['void_pin'] ?? null;

// Validation
if (empty($email) || empty($password) || empty($confirmPassword)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit();
}

if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
    exit();
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit();
}

// Check if email exists
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->rowCount() > 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    exit();
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Convert frontend role to database role
$dbRole = $role;
if ($dbRole === 'admin') {
    $dbRole = 'owner';
}

// Hash void_pin if provided
$hashedVoidPin = null;
if ($void_pin && strlen($void_pin) >= 4) {
    $hashedVoidPin = password_hash($void_pin, PASSWORD_DEFAULT);
}

// Insert user
$stmt = $pdo->prepare("
    INSERT INTO users (email, username, password, role, status, branch, void_pin) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

$finalUsername = $username ?: explode('@', $email)[0];

try {
    $stmt->execute([
        $email,
        $finalUsername,
        $hashedPassword,
        $dbRole,
        $status,
        $branch,
        $hashedVoidPin
    ]);
    
    $userId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully',
        'userId' => $userId,
        'role' => $role
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error creating account',
        'error' => $e->getMessage()
    ]);
}
?>