<?php
// backend/attendance_api.php - SIMPLIFIED
session_start();

date_default_timezone_set('Asia/Manila');

ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit();
}

require_once __DIR__ . '/config/database.php';

try {
    $pdo->exec("SET time_zone = '+08:00'");
} catch (PDOException $e) {
    die(json_encode([
        'success' => false,
        'error' => 'Database timezone error: ' . $e->getMessage()
    ]));
}

$currentUser = $_SESSION['user'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

error_log("Attendance API - Action: " . $action);

try {
    switch ($action) {
        case 'addEmployee':
            addEmployee($pdo);
            break;
        case 'getEmployees':
            getEmployees($pdo);
            break;
        case 'getEmployee':
            getEmployee($pdo);
            break;
        case 'updateEmployee':
            updateEmployee($pdo, $currentUser);
            break;
        case 'deleteEmployee':
            deleteEmployee($pdo, $currentUser);
            break;
        case 'timeIn':
            timeIn($pdo);
            break;
        case 'timeOut':
            timeOut($pdo);
            break;
        case 'resetPin':
            resetPin($pdo, $currentUser);
            break;
        case 'checkStatus':
            checkStatus($pdo);
            break;
        case 'getSystemSettings':
            getSystemSettings($pdo);
            break;
        case 'testConnection':
            testConnection($pdo);
            break;
        case 'checkPin':
            checkPin($pdo);
            break;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action: ' . $action]);
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function testConnection($pdo) {
    echo json_encode([
        'success' => true,
        'message' => 'Database connected successfully',
        'pdo' => get_class($pdo),
        'current_time' => date('Y-m-d H:i:s'),
        'timezone' => date_default_timezone_get()
    ]);
}

function checkPin($pdo) {
    $pin = $_POST['pin'] ?? '';
    
    if (empty($pin) || strlen($pin) !== 4 || !is_numeric($pin)) {
        echo json_encode(['success' => false, 'message' => 'Invalid PIN format']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM employees WHERE status = 'active'");
    $stmt->execute();
    $employees = $stmt->fetchAll();
    
    $found = false;
    $employeeData = null;
    
    foreach ($employees as $employee) {
        if (password_verify($pin, $employee['pin'])) {
            $found = true;
            $employeeData = $employee;
            break;
        }
    }
    
    if ($found && $employeeData) {
        echo json_encode([
            'success' => true,
            'employeeId' => $employeeData['employee_id'],
            'employeeName' => $employeeData['full_name'],
            'employeeRole' => $employeeData['role'] ?? 'Employee'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid PIN or employee not found']);
    }
}

function addEmployee($pdo) {
    $fullName = trim($_POST['name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $contactNumber = trim($_POST['contactNumber'] ?? '');
    $dailyRate = floatval($_POST['dailyRate'] ?? 0);
    $pin = $_POST['pin'] ?? '';

    if (empty($fullName) || empty($username) || empty($email) || empty($address) || empty($contactNumber) || empty($pin)) {
        throw new Exception('All required fields must be filled');
    }

    if (!preg_match('/^\d{4,6}$/', $pin)) {
        throw new Exception('PIN must be 4-6 digits');
    }

    $stmt = $pdo->prepare("SELECT employee_id FROM employees WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        throw new Exception('Username or email already exists');
    }

    $hashedPin = password_hash($pin, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO employees (full_name, username, email, address, contact_number, daily_rate, pin, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    ");
    
    $success = $stmt->execute([$fullName, $username, $email, $address, $contactNumber, $dailyRate, $hashedPin]);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Employee added successfully',
            'employeeId' => $pdo->lastInsertId()
        ]);
    } else {
        throw new Exception('Failed to add employee to database');
    }
}

function getEmployees($pdo) {
    $stmt = $pdo->query("
        SELECT 
            e.employee_id,
            e.full_name,
            e.username,
            e.email,
            e.address,
            e.contact_number,
            e.daily_rate,
            e.status as employee_status,
            e.created_at,
            al.time_in,
            al.time_out,
            al.status as duty_status
        FROM employees e
        LEFT JOIN (
            SELECT employee_id, time_in, time_out, status
            FROM attendance_logs
            WHERE date = CURDATE()
            AND status = 'on_duty'
            AND time_out IS NULL
            ORDER BY log_id DESC
        ) al ON e.employee_id = al.employee_id
        WHERE e.status = 'active'
        GROUP BY e.employee_id
        ORDER BY e.full_name ASC
    ");
    
    $employees = $stmt->fetchAll();
    
    foreach ($employees as &$employee) {
        $employee['is_on_duty'] = ($employee['duty_status'] === 'on_duty' && $employee['time_in'] && !$employee['time_out']);
        
        if ($employee['is_on_duty']) {
            $timeIn = new DateTime($employee['time_in']);
            $now = new DateTime();
            $interval = $timeIn->diff($now);
            $employee['current_hours'] = round($interval->h + ($interval->i / 60) + ($interval->s / 3600), 2);
        } else {
            $employee['current_hours'] = 0;
        }
    }
    
    echo json_encode([
        'success' => true,
        'employees' => $employees,
        'total' => count($employees),
        'current_time' => date('Y-m-d H:i:s')
    ]);
}

function getEmployee($pdo) {
    $employeeId = intval($_GET['id'] ?? 0);
    
    if (!$employeeId) {
        throw new Exception('Employee ID is required');
    }

    $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ?");
    $stmt->execute([$employeeId]);
    $employee = $stmt->fetch();

    if (!$employee) {
        throw new Exception('Employee not found');
    }

    $stmt = $pdo->prepare("
        SELECT * FROM attendance_logs 
        WHERE employee_id = ? 
        AND date = CURDATE() 
        AND status = 'on_duty'
        AND time_out IS NULL
        ORDER BY log_id DESC 
        LIMIT 1
    ");
    $stmt->execute([$employeeId]);
    $todayLog = $stmt->fetch();
    $employee['is_on_duty'] = $todayLog ? true : false;

    $startDate = $_GET['startDate'] ?? date('Y-m-01');
    $endDate = $_GET['endDate'] ?? date('Y-m-d');

    $stmt = $pdo->prepare("
        SELECT 
            log_id,
            date,
            time_in,
            time_out,
            total_hours,
            regular_hours,
            ot_hours,
            daily_pay,
            ot_pay,
            total_pay,
            status
        FROM attendance_logs
        WHERE employee_id = ? 
        AND date BETWEEN ? AND ?
        ORDER BY date DESC, time_in DESC
    ");
    $stmt->execute([$employeeId, $startDate, $endDate]);
    $attendanceRecords = $stmt->fetchAll();

    $totalRegularHours = 0;
    $totalOvertimeHours = 0;
    $totalDailyPay = 0;
    $totalOtPay = 0;
    
    foreach ($attendanceRecords as $record) {
        if ($record['status'] === 'completed') {
            $totalRegularHours += $record['regular_hours'];
            $totalOvertimeHours += $record['ot_hours'];
            $totalDailyPay += $record['daily_pay'];
            $totalOtPay += $record['ot_pay'];
        }
    }

    $completedDates = array_unique(array_column(
        array_filter($attendanceRecords, fn($r) => $r['status'] === 'completed'),
        'date'
    ));
    $daysWorked = count($completedDates);

    echo json_encode([
        'success' => true,
        'employee' => $employee,
        'attendance' => $attendanceRecords,
        'summary' => [
            'daysWorked' => $daysWorked,
            'totalRegularHours' => round($totalRegularHours, 2),
            'totalOvertimeHours' => round($totalOvertimeHours, 2),
            'totalDailyPay' => round($totalDailyPay, 2),
            'totalOtPay' => round($totalOtPay, 2),
            'totalEarnings' => round($totalDailyPay + $totalOtPay, 2)
        ],
        'dateRange' => [
            'start' => $startDate,
            'end' => $endDate
        ]
    ]);
}

function updateEmployee($pdo, $currentUser) {
    $allowedRoles = ['admin', 'owner', 'manager'];
    if (!in_array($currentUser['role'], $allowedRoles)) {
        throw new Exception('You do not have permission to edit employees');
    }

    $employeeId = intval($_POST['id'] ?? 0);
    $fullName = trim($_POST['name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $contactNumber = trim($_POST['contactNumber'] ?? '');
    $dailyRate = floatval($_POST['dailyRate'] ?? 0);

    if (!$employeeId || empty($fullName) || empty($username) || empty($email)) {
        throw new Exception('Required fields are missing');
    }

    $stmt = $pdo->prepare("SELECT employee_id FROM employees WHERE (username = ? OR email = ?) AND employee_id != ?");
    $stmt->execute([$username, $email, $employeeId]);
    if ($stmt->fetch()) {
        throw new Exception('Username or email already exists');
    }

    $stmt = $pdo->prepare("
        UPDATE employees 
        SET full_name = ?, username = ?, email = ?, address = ?, 
            contact_number = ?, daily_rate = ?
        WHERE employee_id = ?
    ");
    
    if ($stmt->execute([$fullName, $username, $email, $address, $contactNumber, $dailyRate, $employeeId])) {
        echo json_encode([
            'success' => true,
            'message' => 'Employee updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update employee');
    }
}

function deleteEmployee($pdo, $currentUser) {
    $allowedRoles = ['admin', 'owner', 'manager'];
    if (!in_array($currentUser['role'], $allowedRoles)) {
        throw new Exception('You do not have permission to delete employees');
    }

    $employeeId = intval($_POST['id'] ?? 0);
    
    if (!$employeeId) {
        throw new Exception('Employee ID is required');
    }

    $stmt = $pdo->prepare("UPDATE employees SET status = 'inactive' WHERE employee_id = ?");
    
    if ($stmt->execute([$employeeId])) {
        echo json_encode([
            'success' => true,
            'message' => 'Employee deleted successfully'
        ]);
    } else {
        throw new Exception('Failed to delete employee');
    }
}

function checkLockStatus($pdo, $employeeId) {
    $stmt = $pdo->prepare("
        SELECT locked_until 
        FROM pin_attempts 
        WHERE employee_id = ? 
        AND locked_until IS NOT NULL 
        AND locked_until > NOW()
        ORDER BY attempt_id DESC 
        LIMIT 1
    ");
    $stmt->execute([$employeeId]);
    $result = $stmt->fetch();
    
    if ($result) {
        $lockedUntil = new DateTime($result['locked_until']);
        $now = new DateTime();
        $diff = $now->diff($lockedUntil);
        $secondsRemaining = ($diff->h * 3600) + ($diff->i * 60) + $diff->s;
        
        return [
            'locked' => true,
            'until' => $result['locked_until'],
            'seconds' => $secondsRemaining
        ];
    }
    
    return ['locked' => false];
}

function recordFailedAttempt($pdo, $employeeId) {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM pin_attempts 
        WHERE employee_id = ? 
        AND attempt_time > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        AND locked_until IS NULL
    ");
    $stmt->execute([$employeeId]);
    $result = $stmt->fetch();
    $failedCount = $result['count'];
    
    if ($failedCount >= 2) {
        $lockedUntil = date('Y-m-d H:i:s', strtotime('+3 minutes'));
        $stmt = $pdo->prepare("
            INSERT INTO pin_attempts (employee_id, attempt_time, locked_until)
            VALUES (?, NOW(), ?)
        ");
        $stmt->execute([$employeeId, $lockedUntil]);
        
        return [
            'locked' => true,
            'message' => 'Account locked for 3 minutes due to multiple failed attempts'
        ];
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO pin_attempts (employee_id, attempt_time)
            VALUES (?, NOW())
        ");
        $stmt->execute([$employeeId]);
        
        $remaining = 3 - ($failedCount + 1);
        return [
            'locked' => false,
            'attemptsRemaining' => $remaining
        ];
    }
}

function timeIn($pdo) {
    $employeeId = intval($_POST['employeeId'] ?? 0);
    $pin = $_POST['pin'] ?? '';

    if (!$employeeId || empty($pin)) {
        throw new Exception('Employee ID and PIN are required');
    }

    $lockStatus = checkLockStatus($pdo, $employeeId);
    if ($lockStatus['locked']) {
        throw new Exception('Account is locked. Please try again in ' . ceil($lockStatus['seconds'] / 60) . ' minutes.');
    }

    $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ? AND status = 'active'");
    $stmt->execute([$employeeId]);
    $employee = $stmt->fetch();

    if (!$employee) {
        throw new Exception('Employee not found');
    }

    if (!password_verify($pin, $employee['pin'])) {
        $attemptResult = recordFailedAttempt($pdo, $employeeId);
        
        if ($attemptResult['locked']) {
            throw new Exception($attemptResult['message']);
        } else {
            throw new Exception('Incorrect PIN. ' . $attemptResult['attemptsRemaining'] . ' attempts remaining.');
        }
    }

    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("
        INSERT INTO attendance_logs (employee_id, date, time_in, status)
        VALUES (?, CURDATE(), ?, 'on_duty')
    ");
    
    if ($stmt->execute([$employeeId, $now])) {
        $stmt = $pdo->prepare("DELETE FROM pin_attempts WHERE employee_id = ? AND attempt_time < DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $stmt->execute([$employeeId]);

        echo json_encode([
            'success' => true,
            'message' => 'Clocked in successfully',
            'employeeName' => $employee['full_name'],
            'timeIn' => $now,
            'currentTime' => date('Y-m-d H:i:s'),
            'timezone' => date_default_timezone_get()
        ]);
    } else {
        throw new Exception('Failed to clock in');
    }
}

function timeOut($pdo) {
    $employeeId = intval($_POST['employeeId'] ?? 0);
    $pin = $_POST['pin'] ?? '';

    if (!$employeeId || empty($pin)) {
        throw new Exception('Employee ID and PIN are required');
    }

    $lockStatus = checkLockStatus($pdo, $employeeId);
    if ($lockStatus['locked']) {
        throw new Exception('Account is locked. Please try again in ' . ceil($lockStatus['seconds'] / 60) . ' minutes.');
    }

    $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ? AND status = 'active'");
    $stmt->execute([$employeeId]);
    $employee = $stmt->fetch();

    if (!$employee) {
        throw new Exception('Employee not found');
    }

    if (!password_verify($pin, $employee['pin'])) {
        $attemptResult = recordFailedAttempt($pdo, $employeeId);
        
        if ($attemptResult['locked']) {
            throw new Exception($attemptResult['message']);
        } else {
            throw new Exception('Incorrect PIN. ' . $attemptResult['attemptsRemaining'] . ' attempts remaining.');
        }
    }

    $stmt = $pdo->prepare("
        SELECT * FROM attendance_logs 
        WHERE employee_id = ? 
        AND date = CURDATE() 
        AND status = 'on_duty'
        AND time_in IS NOT NULL 
        AND time_out IS NULL
        ORDER BY log_id DESC 
        LIMIT 1
    ");
    $stmt->execute([$employeeId]);
    $log = $stmt->fetch();

    if (!$log) {
        throw new Exception('No active time-in record found for today. Please clock in first.');
    }

    $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
    $settings = $stmt->fetch();
    
    if (!$settings) {
        $minHoursToPay = 4;
        $maxRegularHours = 8;
    } else {
        $minHoursToPay = $settings['min_hours_to_pay'];
        $maxRegularHours = $settings['max_regular_hours'];
    }

    $timeIn = new DateTime($log['time_in']);
    $timeOut = new DateTime();
    $interval = $timeIn->diff($timeOut);
    $totalHours = round($interval->h + ($interval->i / 60) + ($interval->s / 3600), 2);

    $regularHours = 0;
    $otHours = 0;
    $dailyPay = 0;
    $otPay = 0;

    if ($totalHours >= $minHoursToPay) {
        if ($totalHours <= $maxRegularHours) {
            $regularHours = $totalHours;
            $dailyPay = $employee['daily_rate'];
            $otHours = 0;
            $otPay = 0;
        } else {
            $regularHours = $maxRegularHours;
            $otHours = $totalHours - $maxRegularHours;
            $dailyPay = $employee['daily_rate'];
            $otPay = 0;
        }
    }

    $totalPay = $dailyPay + $otPay;
    $now = date('Y-m-d H:i:s');

    $stmt = $pdo->prepare("
        UPDATE attendance_logs 
        SET time_out = ?, 
            total_hours = ?,
            regular_hours = ?,
            ot_hours = ?,
            daily_pay = ?,
            ot_pay = ?,
            total_pay = ?,
            status = 'completed'
        WHERE log_id = ?
    ");
    
    if ($stmt->execute([
        $now,
        $totalHours,
        $regularHours,
        $otHours,
        $dailyPay,
        $otPay,
        $totalPay,
        $log['log_id']
    ])) {
        echo json_encode([
            'success' => true,
            'message' => 'Clocked out successfully',
            'employeeName' => $employee['full_name'],
            'timeIn' => $log['time_in'],
            'timeOut' => $now,
            'currentTime' => date('Y-m-d H:i:s'),
            'timezone' => date_default_timezone_get(),
            'summary' => [
                'totalHours' => $totalHours,
                'regularHours' => $regularHours,
                'overtimeHours' => $otHours,
                'dailyPay' => $dailyPay,
                'overtimePay' => $otPay,
                'totalPay' => $totalPay,
                'meetsMinimum' => $totalHours >= $minHoursToPay
            ]
        ]);
    } else {
        throw new Exception('Failed to clock out');
    }
}

function resetPin($pdo, $currentUser) {
    $allowedRoles = ['admin', 'owner', 'manager'];
    if (!in_array($currentUser['role'], $allowedRoles)) {
        throw new Exception('You do not have permission to reset PINs');
    }

    $employeeId = intval($_POST['employeeId'] ?? 0);
    $newPin = $_POST['newPin'] ?? '';

    if (!$employeeId || empty($newPin)) {
        throw new Exception('Employee ID and new PIN are required');
    }

    if (!preg_match('/^\d{4,6}$/', $newPin)) {
        throw new Exception('PIN must be 4-6 digits');
    }

    $hashedPin = password_hash($newPin, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("UPDATE employees SET pin = ? WHERE employee_id = ?");
    
    if ($stmt->execute([$hashedPin, $employeeId])) {
        $stmt = $pdo->prepare("DELETE FROM pin_attempts WHERE employee_id = ?");
        $stmt->execute([$employeeId]);

        echo json_encode([
            'success' => true,
            'message' => 'PIN reset successfully'
        ]);
    } else {
        throw new Exception('Failed to reset PIN');
    }
}

function checkStatus($pdo) {
    $employeeId = intval($_GET['employeeId'] ?? 0);
    
    if (!$employeeId) {
        throw new Exception('Employee ID is required');
    }

    $stmt = $pdo->prepare("
        SELECT time_in, time_out, status 
        FROM attendance_logs 
        WHERE employee_id = ? AND date = CURDATE()
        ORDER BY log_id DESC 
        LIMIT 1
    ");
    $stmt->execute([$employeeId]);
    $log = $stmt->fetch();

    $isOnDuty = false;
    $canTimeIn = true;
    $canTimeOut = false;

    if ($log) {
        if ($log['status'] === 'on_duty' && !$log['time_out']) {
            $isOnDuty = true;
            $canTimeIn = true;
            $canTimeOut = true;
        } else if ($log['status'] === 'completed') {
            $canTimeIn = true;
            $canTimeOut = false;
        }
    }

    echo json_encode([
        'success' => true,
        'isOnDuty' => $isOnDuty,
        'canTimeIn' => $canTimeIn,
        'canTimeOut' => $canTimeOut,
        'log' => $log,
        'currentTime' => date('Y-m-d H:i:s'),
        'timezone' => date_default_timezone_get()
    ]);
}

function getSystemSettings($pdo) {
    $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
    $settings = $stmt->fetch();
    
    if (!$settings) {
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (min_hours_to_pay, max_regular_hours)
            VALUES (4, 8)
        ");
        $stmt->execute();
        
        $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
        $settings = $stmt->fetch();
    }
    
    echo json_encode([
        'success' => true,
        'settings' => $settings,
        'currentTime' => date('Y-m-d H:i:s'),
        'timezone' => date_default_timezone_get()
    ]);
}
?>