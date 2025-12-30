<?php
session_start();
date_default_timezone_set('Asia/Manila');

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
    die(json_encode(['success' => false, 'error' => 'Database error']));
}

$currentUser = $_SESSION['user'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'addEmployee':
            addEmployee($pdo, $currentUser);
            break;
        case 'getEmployees':
            getEmployees($pdo, $currentUser);
            break;
        case 'getEmployee':
            getEmployee($pdo, $currentUser);
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
        case 'checkPin':
            checkPin($pdo);
            break;
        case 'getSystemSettings':
            getSystemSettings($pdo);
            break;
        case 'getAttendanceLog':
            getAttendanceLog($pdo, $currentUser);
            break;
        case 'updateAttendanceRecord':
            updateAttendanceRecord($pdo, $currentUser);
            break;
        case 'processPayout':
            processPayout($pdo, $currentUser);
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

// ==========================================
// PROCESS PAYOUT - FIXED WITH VOID_PIN (EXACTLY LIKE VOID SYSTEM)
// ==========================================
function processPayout($pdo, $currentUser) {
    $employeeId = intval($_POST['employeeId'] ?? 0);
    $managerPin = $_POST['managerPin'] ?? '';

    if (!$employeeId || empty($managerPin)) {
        throw new Exception('Employee ID and Manager PIN required');
    }

    if (!preg_match('/^\d{4,6}$/', $managerPin)) {
        throw new Exception('Invalid PIN format');
    }

    // ✅ EXACT SAME PATTERN AS VOID SYSTEM
    // Find managers/owners with void_pin (from users table, not employees)
    $stmt = $pdo->prepare("
        SELECT id, username, email, role, void_pin 
        FROM users 
        WHERE (role = 'manager' OR role = 'owner' OR role = 'admin') 
        AND void_pin IS NOT NULL
    ");
    $stmt->execute();
    $managers = $stmt->fetchAll();

    if (empty($managers)) {
        throw new Exception('No manager with PIN found. Please contact administrator.');
    }

    // Verify PIN against all managers (same as void system)
    $authorizedManager = null;
    foreach ($managers as $manager) {
        if (password_verify($managerPin, $manager['void_pin'])) {
            $authorizedManager = $manager;
            break;
        }
    }

    if (!$authorizedManager) {
        throw new Exception('Invalid manager PIN');
    }

    // GET EMPLOYEE DATA
    $userBranch = $currentUser['branch'] ?? 'main';
    $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ? AND branch = ?");
    $stmt->execute([$employeeId, $userBranch]);
    $employee = $stmt->fetch();

    if (!$employee) {
        throw new Exception('Employee not found in your branch');
    }

    // GET TOTAL PAY
    $stmt = $pdo->prepare("
        SELECT 
            SUM(total_pay) as total_earnings,
            SUM(daily_pay) as total_daily_pay,
            SUM(ot_pay) as total_ot_pay,
            COUNT(*) as record_count
        FROM attendance_logs
        WHERE employee_id = ? 
        AND status = 'completed'
        AND total_pay > 0
    ");
    $stmt->execute([$employeeId]);
    $summary = $stmt->fetch();

    $totalEarnings = floatval($summary['total_earnings'] ?? 0);
    $recordCount = intval($summary['record_count'] ?? 0);

    if ($totalEarnings <= 0) {
        throw new Exception('No earnings to pay out');
    }

    // RESET ALL TOTAL PAY TO ZERO
    $stmt = $pdo->prepare("
        UPDATE attendance_logs 
        SET total_pay = 0, daily_pay = 0, ot_pay = 0
        WHERE employee_id = ? 
        AND status = 'completed'
        AND total_pay > 0
    ");
    
    if (!$stmt->execute([$employeeId])) {
        throw new Exception('Failed to reset attendance records');
    }

    // CREATE payout_logs TABLE IF IT DOESN'T EXIST
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS payout_logs (
                payout_id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                processed_by VARCHAR(100) NOT NULL,
                processed_at DATETIME NOT NULL,
                records_count INT NOT NULL,
                FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
    } catch (PDOException $e) {
        // Table might already exist, continue
    }

    // LOG THE PAYOUT (use username/email from authorized manager)
    $processedBy = $authorizedManager['username'] ?? $authorizedManager['email'];
    
    $stmt = $pdo->prepare("
        INSERT INTO payout_logs (employee_id, amount, processed_by, processed_at, records_count)
        VALUES (?, ?, ?, NOW(), ?)
    ");
    $stmt->execute([$employeeId, $totalEarnings, $processedBy, $recordCount]);

    echo json_encode([
        'success' => true,
        'message' => 'Payout processed successfully',
        'summary' => [
            'employeeName' => $employee['full_name'],
            'amountPaid' => $totalEarnings,
            'recordsReset' => $recordCount,
            'processedBy' => $processedBy
        ]
    ]);
}

// ==========================================
// UPDATE ATTENDANCE RECORD
// ==========================================
function updateAttendanceRecord($pdo, $currentUser) {
    $allowedRoles = ['admin', 'owner', 'manager'];
    if (!in_array($currentUser['role'], $allowedRoles)) {
        throw new Exception('No permission to edit attendance');
    }

    $logId = intval($_POST['logId'] ?? 0);
    $employeeId = intval($_POST['employeeId'] ?? 0);
    $date = trim($_POST['date'] ?? '');
    $timeIn = trim($_POST['timeIn'] ?? '');
    $timeOut = trim($_POST['timeOut'] ?? '');
    $regularHours = floatval($_POST['regularHours'] ?? 0);
    $overtimeHours = floatval($_POST['overtimeHours'] ?? 0);
    $dailyPay = floatval($_POST['dailyPay'] ?? 0);
    $overtimePay = floatval($_POST['overtimePay'] ?? 0);

    if (!$logId || !$employeeId || empty($date) || empty($timeIn)) {
        throw new Exception('Required fields missing');
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        throw new Exception('Invalid date format');
    }

    $userBranch = $currentUser['branch'] ?? 'main';
    $stmt = $pdo->prepare("SELECT employee_id FROM employees WHERE employee_id = ? AND branch = ?");
    $stmt->execute([$employeeId, $userBranch]);
    $employee = $stmt->fetch();
    
    if (!$employee) {
        throw new Exception('Employee not found in your branch');
    }

    $timeInDatetime = $date . ' ' . $timeIn;
    $timeOutDatetime = !empty($timeOut) ? ($date . ' ' . $timeOut) : null;

    if (!preg_match('/^\d{2}:\d{2}$/', $timeIn)) {
        throw new Exception('Invalid time format for Time In');
    }
    
    if (!empty($timeOut) && !preg_match('/^\d{2}:\d{2}$/', $timeOut)) {
        throw new Exception('Invalid time format for Time Out');
    }

    $totalHours = $regularHours + $overtimeHours;
    
    if ($timeOutDatetime) {
        try {
            $start = new DateTime($timeInDatetime);
            $end = new DateTime($timeOutDatetime);
            
            if ($end <= $start) {
                throw new Exception('Time out must be after time in');
            }
            
            $interval = $start->diff($end);
            $calculatedHours = $interval->h + ($interval->i / 60) + ($interval->s / 3600);
            $totalHours = round($calculatedHours, 2);
            
            if ($regularHours == 0 && $overtimeHours == 0) {
                $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
                $settings = $stmt->fetch();
                $maxRegularHours = $settings ? $settings['max_regular_hours'] : 8;
                
                if ($totalHours <= $maxRegularHours) {
                    $regularHours = $totalHours;
                    $overtimeHours = 0;
                } else {
                    $regularHours = $maxRegularHours;
                    $overtimeHours = $totalHours - $maxRegularHours;
                }
            }
        } catch (Exception $e) {
            throw new Exception('Invalid time calculation: ' . $e->getMessage());
        }
    }

    $stmt = $pdo->prepare("SELECT daily_rate FROM employees WHERE employee_id = ?");
    $stmt->execute([$employeeId]);
    $employeeData = $stmt->fetch();
    $dailyRate = $employeeData['daily_rate'] ?? 0;

    if ($dailyPay == 0 && $dailyRate > 0 && $regularHours >= 4) {
        $dailyPay = $dailyRate;
    }
    
    if ($overtimePay == 0 && $dailyRate > 0 && $overtimeHours > 0) {
        $hourlyRate = $dailyRate / 8;
        $overtimePay = $overtimeHours * $hourlyRate * 1.25;
    }

    $totalPay = $dailyPay + $overtimePay;
    $status = $timeOutDatetime ? 'completed' : 'on_duty';

    $stmt = $pdo->prepare("
        UPDATE attendance_logs 
        SET date = ?, 
            time_in = ?, 
            time_out = ?, 
            total_hours = ?, 
            regular_hours = ?, 
            ot_hours = ?, 
            daily_pay = ?, 
            ot_pay = ?, 
            total_pay = ?, 
            status = ?
        WHERE log_id = ? AND employee_id = ?
    ");

    $success = $stmt->execute([
        $date,
        $timeInDatetime,
        $timeOutDatetime,
        $totalHours,
        $regularHours,
        $overtimeHours,
        $dailyPay,
        $overtimePay,
        $totalPay,
        $status,
        $logId,
        $employeeId
    ]);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Attendance record updated successfully',
            'summary' => [
                'date' => $date,
                'timeIn' => $timeIn,
                'timeOut' => $timeOut,
                'totalHours' => $totalHours,
                'regularHours' => $regularHours,
                'overtimeHours' => $overtimeHours,
                'dailyPay' => $dailyPay,
                'overtimePay' => $overtimePay,
                'totalPay' => $totalPay
            ]
        ]);
    } else {
        throw new Exception('Failed to update attendance record');
    }
}

// ==========================================
// GET SINGLE ATTENDANCE LOG
// ==========================================
function getAttendanceLog($pdo, $currentUser) {
    $logId = intval($_GET['logId'] ?? 0);
    
    if (!$logId) {
        throw new Exception('Log ID required');
    }

    $userBranch = $currentUser['branch'] ?? 'main';

    $stmt = $pdo->prepare("
        SELECT al.*, e.full_name, e.branch, e.daily_rate 
        FROM attendance_logs al
        JOIN employees e ON al.employee_id = e.employee_id
        WHERE al.log_id = ? AND e.branch = ?
    ");
    $stmt->execute([$logId, $userBranch]);
    $log = $stmt->fetch();

    if (!$log) {
        throw new Exception('Attendance log not found in your branch');
    }

    $timeIn = $log['time_in'] ? date('H:i', strtotime($log['time_in'])) : '';
    $timeOut = $log['time_out'] ? date('H:i', strtotime($log['time_out'])) : '';
    $date = $log['date'] ? date('Y-m-d', strtotime($log['date'])) : '';

    echo json_encode([
        'success' => true,
        'log' => [
            'logId' => $log['log_id'],
            'employeeId' => $log['employee_id'],
            'employeeName' => $log['full_name'],
            'date' => $date,
            'timeIn' => $timeIn,
            'timeOut' => $timeOut,
            'totalHours' => floatval($log['total_hours']),
            'regularHours' => floatval($log['regular_hours']),
            'overtimeHours' => floatval($log['ot_hours']),
            'dailyPay' => floatval($log['daily_pay']),
            'overtimePay' => floatval($log['ot_pay']),
            'totalPay' => floatval($log['total_pay']),
            'status' => $log['status'],
            'dailyRate' => floatval($log['daily_rate'])
        ]
    ]);
}

// ==========================================
// CHECK PIN - FOR QUICK TIME IN/OUT
// ==========================================
function checkPin($pdo) {
    $pin = $_POST['pin'] ?? '';
    
    if (empty($pin)) {
        throw new Exception('PIN required');
    }
    
    if (!preg_match('/^\d{4,6}$/', $pin)) {
        throw new Exception('Invalid PIN format');
    }
    
    $stmt = $pdo->prepare("
        SELECT employee_id, full_name, username, branch, status, pin 
        FROM employees 
        WHERE status = 'active'
    ");
    $stmt->execute();
    $employees = $stmt->fetchAll();
    
    foreach ($employees as $employee) {
        if (password_verify($pin, $employee['pin'] ?? '')) {
            echo json_encode([
                'success' => true,
                'employeeId' => $employee['employee_id'],
                'employeeName' => $employee['full_name'],
                'employeeRole' => $employee['username'],
                'branch' => $employee['branch']
            ]);
            return;
        }
    }
    
    throw new Exception('Invalid PIN');
}

// ==========================================
// ADD EMPLOYEE - AUTO ASSIGN BRANCH
// ==========================================
function addEmployee($pdo, $currentUser) {
    $fullName = trim($_POST['name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $contactNumber = trim($_POST['contactNumber'] ?? '');
    $dailyRate = floatval($_POST['dailyRate'] ?? 0);
    $pin = $_POST['pin'] ?? '';
    
    $branch = $currentUser['branch'] ?? 'main';

    if (empty($fullName) || empty($username) || empty($email) || empty($pin)) {
        throw new Exception('Required fields missing');
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
        INSERT INTO employees (full_name, username, email, address, contact_number, daily_rate, pin, branch, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    ");
    
    $success = $stmt->execute([
        $fullName, 
        $username, 
        $email, 
        $address, 
        $contactNumber, 
        $dailyRate, 
        $hashedPin, 
        $branch
    ]);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Employee added to ' . strtoupper($branch) . ' branch',
            'employeeId' => $pdo->lastInsertId(),
            'branch' => $branch
        ]);
    } else {
        throw new Exception('Failed to add employee');
    }
}

// ==========================================
// GET EMPLOYEES - FILTER BY BRANCH
// ==========================================
function getEmployees($pdo, $currentUser) {
    $userBranch = $currentUser['branch'] ?? 'main';
    
    $stmt = $pdo->prepare("
        SELECT 
            e.employee_id,
            e.full_name,
            e.username,
            e.email,
            e.address,
            e.contact_number,
            e.daily_rate,
            e.branch,
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
        AND e.branch = ?
        GROUP BY e.employee_id
        ORDER BY e.full_name ASC
    ");
    
    $stmt->execute([$userBranch]);
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
        'branch' => $userBranch
    ]);
}

// ==========================================
// GET SINGLE EMPLOYEE - CHECK BRANCH
// ==========================================
function getEmployee($pdo, $currentUser) {
    $employeeId = intval($_GET['id'] ?? 0);
    
    if (!$employeeId) {
        throw new Exception('Employee ID required');
    }

    $userBranch = $currentUser['branch'] ?? 'main';

    $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ? AND branch = ?");
    $stmt->execute([$employeeId, $userBranch]);
    $employee = $stmt->fetch();

    if (!$employee) {
        throw new Exception('Employee not found in your branch');
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
            log_id, date, time_in, time_out,
            total_hours, regular_hours, ot_hours,
            daily_pay, ot_pay, total_pay, status
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
        ]
    ]);
}

// ==========================================
// UPDATE EMPLOYEE - WITH BRANCH EDIT
// ==========================================
function updateEmployee($pdo, $currentUser) {
    $allowedRoles = ['admin', 'owner', 'manager'];
    if (!in_array($currentUser['role'], $allowedRoles)) {
        throw new Exception('No permission to edit');
    }

    $employeeId = intval($_POST['id'] ?? 0);
    $fullName = trim($_POST['name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $contactNumber = trim($_POST['contactNumber'] ?? '');
    $dailyRate = floatval($_POST['dailyRate'] ?? 0);
    $newBranch = trim($_POST['branch'] ?? '');

    if (!$employeeId || empty($fullName) || empty($username) || empty($email)) {
        throw new Exception('Required fields missing');
    }

    $userBranch = $currentUser['branch'] ?? 'main';

    $stmt = $pdo->prepare("SELECT employee_id, branch FROM employees WHERE employee_id = ? AND branch = ?");
    $stmt->execute([$employeeId, $userBranch]);
    $existingEmployee = $stmt->fetch();
    
    if (!$existingEmployee) {
        throw new Exception('Employee not found in your branch');
    }

    $stmt = $pdo->prepare("SELECT employee_id FROM employees WHERE (username = ? OR email = ?) AND employee_id != ?");
    $stmt->execute([$username, $email, $employeeId]);
    if ($stmt->fetch()) {
        throw new Exception('Username or email already exists');
    }

    $finalBranch = !empty($newBranch) ? $newBranch : $existingEmployee['branch'];

    $stmt = $pdo->prepare("
        UPDATE employees 
        SET full_name = ?, username = ?, email = ?, address = ?, 
            contact_number = ?, daily_rate = ?, branch = ?
        WHERE employee_id = ?
    ");
    
    if ($stmt->execute([$fullName, $username, $email, $address, $contactNumber, $dailyRate, $finalBranch, $employeeId])) {
        $message = 'Employee updated';
        if ($finalBranch !== $existingEmployee['branch']) {
            $message .= ' and moved to ' . strtoupper($finalBranch) . ' branch';
        }
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'branch' => $finalBranch
        ]);
    } else {
        throw new Exception('Failed to update employee');
    }
}

// ==========================================
// DELETE EMPLOYEE - CHECK BRANCH
// ==========================================
function deleteEmployee($pdo, $currentUser) {
    $allowedRoles = ['admin', 'owner', 'manager'];
    if (!in_array($currentUser['role'], $allowedRoles)) {
        throw new Exception('No permission to delete');
    }

    $employeeId = intval($_POST['id'] ?? 0);
    
    if (!$employeeId) {
        throw new Exception('Employee ID required');
    }

    $userBranch = $currentUser['branch'] ?? 'main';

    $stmt = $pdo->prepare("SELECT employee_id FROM employees WHERE employee_id = ? AND branch = ?");
    $stmt->execute([$employeeId, $userBranch]);
    $employee = $stmt->fetch();
    
    if (!$employee) {
        throw new Exception('Employee not found in your branch');
    }

    $stmt = $pdo->prepare("UPDATE employees SET status = 'inactive' WHERE employee_id = ?");
    
    if ($stmt->execute([$employeeId])) {
        echo json_encode([
            'success' => true,
            'message' => 'Employee deleted'
        ]);
    } else {
        throw new Exception('Failed to delete employee');
    }
}

// ==========================================
// RESET PIN - CHECK BRANCH
// ==========================================
function resetPin($pdo, $currentUser) {
    $allowedRoles = ['admin', 'owner', 'manager'];
    if (!in_array($currentUser['role'], $allowedRoles)) {
        throw new Exception('No permission to reset PIN');
    }

    $employeeId = intval($_POST['employeeId'] ?? 0);
    $newPin = $_POST['newPin'] ?? '';

    if (!$employeeId || empty($newPin)) {
        throw new Exception('Employee ID and PIN required');
    }

    if (!preg_match('/^\d{4,6}$/', $newPin)) {
        throw new Exception('PIN must be 4-6 digits');
    }

    $userBranch = $currentUser['branch'] ?? 'main';

    $stmt = $pdo->prepare("SELECT employee_id FROM employees WHERE employee_id = ? AND branch = ?");
    $stmt->execute([$employeeId, $userBranch]);
    $employee = $stmt->fetch();
    
    if (!$employee) {
        throw new Exception('Employee not found in your branch');
    }

    $hashedPin = password_hash($newPin, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE employees SET pin = ? WHERE employee_id = ?");
    
    if ($stmt->execute([$hashedPin, $employeeId])) {
        $stmt = $pdo->prepare("DELETE FROM pin_attempts WHERE employee_id = ?");
        $stmt->execute([$employeeId]);

        echo json_encode(['success' => true, 'message' => 'PIN reset successfully']);
    } else {
        throw new Exception('Failed to reset PIN');
    }
}

// ==========================================
// TIME IN/OUT FUNCTIONS
// ==========================================
function timeIn($pdo) {
    $employeeId = intval($_POST['employeeId'] ?? 0);
    $pin = $_POST['pin'] ?? '';

    if (!$employeeId || empty($pin)) {
        throw new Exception('Employee ID and PIN required');
    }

    $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ? AND status = 'active'");
    $stmt->execute([$employeeId]);
    $employee = $stmt->fetch();

    if (!$employee) {
        throw new Exception('Employee not found');
    }

    if (!password_verify($pin, $employee['pin'])) {
        throw new Exception('Incorrect PIN');
    }

    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("
        INSERT INTO attendance_logs (employee_id, date, time_in, status)
        VALUES (?, CURDATE(), ?, 'on_duty')
    ");
    
    if ($stmt->execute([$employeeId, $now])) {
        echo json_encode([
            'success' => true,
            'message' => 'Clocked in successfully',
            'employeeName' => $employee['full_name'],
            'timeIn' => $now
        ]);
    } else {
        throw new Exception('Failed to clock in');
    }
}

function timeOut($pdo) {
    $employeeId = intval($_POST['employeeId'] ?? 0);
    $pin = $_POST['pin'] ?? '';

    if (!$employeeId || empty($pin)) {
        throw new Exception('Employee ID and PIN required');
    }

    $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ? AND status = 'active'");
    $stmt->execute([$employeeId]);
    $employee = $stmt->fetch();

    if (!$employee) {
        throw new Exception('Employee not found');
    }

    if (!password_verify($pin, $employee['pin'])) {
        throw new Exception('Incorrect PIN');
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
        throw new Exception('No active clock-in found');
    }

    $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
    $settings = $stmt->fetch();
    
    $minHoursToPay = $settings ? $settings['min_hours_to_pay'] : 4;
    $maxRegularHours = $settings ? $settings['max_regular_hours'] : 8;

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
        } else {
            $regularHours = $maxRegularHours;
            $otHours = $totalHours - $maxRegularHours;
            $dailyPay = $employee['daily_rate'];
        }
    }

    $totalPay = $dailyPay + $otPay;
    $now = date('Y-m-d H:i:s');

    $stmt = $pdo->prepare("
        UPDATE attendance_logs 
        SET time_out = ?, total_hours = ?, regular_hours = ?, ot_hours = ?,
            daily_pay = ?, ot_pay = ?, total_pay = ?, status = 'completed'
        WHERE log_id = ?
    ");
    
    if ($stmt->execute([$now, $totalHours, $regularHours, $otHours, $dailyPay, $otPay, $totalPay, $log['log_id']])) {
        echo json_encode([
            'success' => true,
            'message' => 'Clocked out successfully',
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

function checkStatus($pdo) {
    $employeeId = intval($_GET['employeeId'] ?? 0);
    
    if (!$employeeId) {
        throw new Exception('Employee ID required');
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
    if ($log && $log['status'] === 'on_duty' && !$log['time_out']) {
        $isOnDuty = true;
    }

    echo json_encode([
        'success' => true,
        'isOnDuty' => $isOnDuty,
        'log' => $log
    ]);
}

function getSystemSettings($pdo) {
    $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
    $settings = $stmt->fetch();
    
    if (!$settings) {
        $stmt = $pdo->prepare("INSERT INTO system_settings (min_hours_to_pay, max_regular_hours) VALUES (4, 8)");
        $stmt->execute();
        $stmt = $pdo->query("SELECT * FROM system_settings LIMIT 1");
        $settings = $stmt->fetch();
    }
    
    echo json_encode(['success' => true, 'settings' => $settings]);
}

?>