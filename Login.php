<?php
// Login.php - FIXED VERSION WITH BRANCH
session_start();

// Check if already logged in
if (isset($_SESSION['user'])) {
    header('Location: dashboard.php');
    exit();
}

// Default values
$email = $_COOKIE['rememberedEmail'] ?? '';
$remember = !empty($email);
$error = '';
$success = '';

// PROCESS LOGIN
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    
    if (empty($email) || empty($password)) {
        $error = 'Please enter both email and password';
    } else {
        // DATABASE CONNECTION
        $host = 'localhost';
        $dbname = 'db'; // PALITAN KUNG HINDI 'db' ANG DATABASE MO
        $username = 'root';
        $password_db = '';
        
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password_db);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // CHECK USER
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                $error = 'User not found';
            } else {
                // CHECK PASSWORD
                if (password_verify($password, $user['password'])) {
                    // LOGIN SUCCESS - INCLUDE BRANCH!
                    $_SESSION['user'] = [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'username' => $user['username'] ?? $user['email'],
                        'role' => $user['role'],
                        'branch' => $user['branch'] ?? 'main'  // ← ADDED THIS!
                    ];
                    
                    // Remember me
                    if ($remember) {
                        setcookie('rememberedEmail', $email, time() + (86400 * 30), '/');
                    } else {
                        setcookie('rememberedEmail', '', time() - 3600, '/');
                    }
                    
                    // REDIRECT TO DASHBOARD
                    header('Location: dashboard.php');
                    exit();
                } else {
                    $error = 'Invalid password!';
                }
            }
        } catch (PDOException $e) {
            $error = 'Database error: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KSTREET - Login</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <img src="img/kslogo.png" 
                 alt="K-Street Logo" class="mx-auto h-40 w-30">
            
            <h2 class="text-center text-2xl font-bold tracking-tight text-gray-600">
                Sign in to your account
            </h2>
            <p class="mt-1 text-center font-small tracking-tight text-gray-500">
                Enter details to login.
            </p>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <!-- ERROR MESSAGE -->
            <?php if ($error): ?>
            <div class="p-3 mb-4 rounded text-center bg-red-100 text-red-700 border border-red-200">
                <?php echo htmlspecialchars($error); ?>
            </div>
            <?php endif; ?>
            
            <?php if ($success): ?>
            <div class="p-3 mb-4 rounded text-center bg-green-100 text-green-700 border border-green-200">
                <?php echo htmlspecialchars($success); ?>
            </div>
            <?php endif; ?>

            <!-- LOGIN FORM -->
            <form method="POST" action="" class="space-y-6">
                <!-- Email -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <input id="email" name="email" type="email" value="<?php echo htmlspecialchars($email); ?>"
                        required class="mt-2 block w-full rounded-md border px-3 py-1.5 border-gray-300">
                </div>

                <!-- Password -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input id="password" name="password" type="password" required
                        class="mt-2 block w-full rounded-md border px-3 py-1.5 border-gray-300">
                </div>

                <!-- Remember me -->
                <div class="flex items-center">
                    <input id="remember" name="remember" type="checkbox" 
                        <?php echo $remember ? 'checked' : ''; ?>
                        class="h-4 w-4 text-red-600">
                    <label for="remember" class="ml-2 block text-sm text-gray-700">
                        Remember me
                    </label>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
                    Sign In
                </button>
            </form>
        </div>
    </div>
</body>
</html>