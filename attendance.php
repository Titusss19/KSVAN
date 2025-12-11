<?php
// attendance.php
session_start();
if (!isset($_SESSION['user'])) {
    header('Location: Login.php');
    exit();
}

$activeView = 'attendance';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance - K-STREET</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <?php include 'components/navbar.php'; ?>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Attendance System</h1>
        <div class="bg-white rounded-xl shadow-lg p-6">
            <p class="text-gray-600">Attendance features coming soon...</p>
        </div>
    </div>
</body>
</html>