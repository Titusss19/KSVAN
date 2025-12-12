<?php
// KSTREET/backend/navbar_api.php
session_start();
header('Content-Type: application/json');

require_once 'config/database.php';

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle GET request - Get current user info
if ($method === 'GET') {
    if (!isset($_SESSION['user'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Not logged in'
        ]);
        exit;
    }

    $userId = $_SESSION['user']['id'];

    try {
        // Fetch fresh user data from database
        $stmt = $pdo->prepare("
            SELECT id, email, username, role, status, branch 
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user) {
            // Convert database role to frontend role
            $frontendRole = $user['role'];
            if ($frontendRole === 'owner') {
                $frontendRole = 'admin';
            }

            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'username' => $user['username'] ?: explode('@', $user['email'])[0],
                    'role' => $frontendRole,
                    'status' => $user['status'],
                    'branch' => $user['branch']
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
        }
    } catch (PDOException $e) {
        error_log("Error fetching user: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Database error'
        ]);
    }
}

// Handle POST request - Update session (if needed)
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action']) && $data['action'] === 'refresh') {
        if (!isset($_SESSION['user'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Not logged in'
            ]);
            exit;
        }

        $userId = $_SESSION['user']['id'];

        try {
            $stmt = $pdo->prepare("
                SELECT id, email, username, role, status, branch 
                FROM users 
                WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if ($user) {
                // Update session with fresh data
                $frontendRole = $user['role'] === 'owner' ? 'admin' : $user['role'];
                
                $_SESSION['user'] = [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'username' => $user['username'] ?: explode('@', $user['email'])[0],
                    'name' => $user['username'] ?: explode('@', $user['email'])[0],
                    'role' => $frontendRole,
                    'status' => $user['status'],
                    'branch' => $user['branch']
                ];

                echo json_encode([
                    'success' => true,
                    'message' => 'Session refreshed',
                    'user' => $_SESSION['user']
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'User not found'
                ]);
            }
        } catch (PDOException $e) {
            error_log("Error refreshing session: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Database error'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
    }
}

// Handle invalid methods
else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?>