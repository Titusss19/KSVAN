-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 13, 2025 at 07:54 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT 'Admin',
  `content` text DEFAULT NULL,
  `type` enum('info','success','warning') DEFAULT 'info',
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `branch` varchar(50) DEFAULT 'main',
  `is_global` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `author`, `content`, `type`, `message`, `created_at`, `updated_at`, `branch`, `is_global`) VALUES
(1, 'System Update', 'Admin', NULL, 'info', '', '2025-10-01 07:44:39', '2025-12-03 06:21:21', 'main', 0),
(2, 'Sales Record', 'Admin', NULL, 'success', '', '2025-10-01 07:44:39', '2025-12-03 06:21:21', 'main', 0),
(3, 'Team Meeting', 'Admin', NULL, 'warning', '', '2025-10-01 07:44:39', '2025-12-03 06:21:21', 'main', 0),
(4, 'HELLOO', 'Admin', NULL, 'success', '', '2025-10-01 07:52:16', '2025-12-03 06:21:21', 'main', 0),
(5, 'asdas', 'melivojaymark2003@gmail.com', NULL, 'info', 'asdasdsad', '2025-12-04 13:53:05', '2025-12-04 13:53:05', NULL, 1),
(6, 'asdasd', 'melivojaymark61@gmail.com', NULL, 'info', 'asdasdasd', '2025-12-09 04:45:28', '2025-12-09 04:45:28', 'main', 0),
(7, 'asdasdas', 'melivojaymark61@gmail.com', NULL, 'info', 'dasdasdasd', '2025-12-11 17:15:10', '2025-12-11 17:15:10', 'main', 0),
(8, 'global', 'vien@gmail.com', NULL, 'info', 'global', '2025-12-11 17:45:51', '2025-12-11 17:45:51', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `log_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_in` datetime DEFAULT NULL,
  `time_out` datetime DEFAULT NULL,
  `total_hours` decimal(5,2) DEFAULT NULL,
  `regular_hours` decimal(5,2) DEFAULT 0.00,
  `ot_hours` decimal(5,2) DEFAULT 0.00,
  `daily_pay` decimal(10,2) DEFAULT 0.00,
  `ot_pay` decimal(10,2) DEFAULT 0.00,
  `total_pay` decimal(10,2) DEFAULT 0.00,
  `status` enum('on_duty','completed') DEFAULT 'on_duty',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_logs`
--

INSERT INTO `attendance_logs` (`log_id`, `employee_id`, `date`, `time_in`, `time_out`, `total_hours`, `regular_hours`, `ot_hours`, `daily_pay`, `ot_pay`, `total_pay`, `status`, `created_at`) VALUES
(1, 1, '2025-12-13', '2025-12-13 16:24:22', '2025-12-13 22:12:38', 5.80, 5.80, 0.00, 400.00, 0.00, 400.00, 'completed', '2025-12-13 08:24:22'),
(2, 1, '2025-12-13', '2025-12-13 22:13:37', '2025-12-13 22:13:41', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 'completed', '2025-12-13 14:13:37');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `daily_rate` decimal(10,2) DEFAULT 0.00,
  `pin` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `full_name`, `username`, `email`, `address`, `contact_number`, `daily_rate`, `pin`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Jay mark Barbacena Melivo', 'KSTKEI', 'melivojaymark61@gmail.com', 'Ramos, Tarlac', '09289242247', 400.00, '$2y$10$Q9Uy.llrVWNFk5QHuic1xujsH/XZKptb21hFSAla/VK8rgIE0JioG', 'active', '2025-12-13 08:22:28', '2025-12-13 08:22:28');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

CREATE TABLE `inventory_items` (
  `id` int(11) NOT NULL,
  `product_code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `unit` varchar(50) NOT NULL,
  `current_stock` decimal(10,3) DEFAULT 0.000,
  `price` decimal(10,0) NOT NULL,
  `min_stock` decimal(10,3) DEFAULT 0.000,
  `cost_per_unit` decimal(10,2) DEFAULT 0.00,
  `supplier` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_price` decimal(10,2) DEFAULT 0.00,
  `branch` varchar(50) DEFAULT 'main'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_items`
--

INSERT INTO `inventory_items` (`id`, `product_code`, `name`, `category`, `description`, `unit`, `current_stock`, `price`, `min_stock`, `cost_per_unit`, `supplier`, `created_at`, `updated_at`, `total_price`, `branch`) VALUES
(15, 'ZZZ', 'beed', 'Raw Material', 'asdasd', 'grams', 1500.000, 256, 0.000, 0.00, '', '2025-12-05 03:59:53', '2025-12-05 03:59:53', 768.00, 'main'),
(16, 'SDAD', 'asdasd', 'Raw Material', 'asdsad', 'pcs', 71.000, 20, 0.000, 0.00, '', '2025-12-05 04:15:37', '2025-12-09 13:24:18', 80.00, 'main'),
(17, 'ASD', 'asda', 'Raw Material', 'asdasd', 'pcs', 23.000, 1, 2.000, 0.00, '', '2025-12-09 13:24:53', '2025-12-09 13:24:53', 1.00, 'main'),
(18, 'ASD', 'asd', 'Raw Material', 'asd', 'pcs', 2.000, 50, 0.000, 0.00, '', '2025-12-09 13:42:59', '2025-12-09 13:42:59', 100.02, 'main'),
(19, 'QWEQWEQWE', 'pork strips', 'Meat', 'asdasdasd', 'liters', 0.075, 25, 0.000, 0.00, 'asdasdas', '2025-12-11 18:08:06', '2025-12-11 18:08:06', 75.00, 'main'),
(20, 'ASDASD', 'asdasdasd', 'Raw Material', 'asdasdasd', 'bottles', 60.000, 270, 0.000, 0.00, '', '2025-12-11 18:09:11', '2025-12-11 18:09:11', 540.00, 'main');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `description_type` varchar(50) DEFAULT 'k-street food',
  `product_code` varchar(255) NOT NULL,
  `branch` varchar(50) DEFAULT 'main'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `name`, `category`, `price`, `image`, `created_at`, `description_type`, `product_code`, `branch`) VALUES
(35, 'K-CHICKEN', 'Main', 145.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=vxd1Ji_njXdNZDdnpzzFPg&oh=00_AflSboZ9W8xqQ9l8Lgv5BpEsAC7WAlDDEHp80F-cBzF-gg&oe=69437E3C', '2025-12-13 16:35:27', 'k-street food', 'K-CHICKEN', 'main'),
(36, 'K-CHICKEN GREEN APPLE', 'Food', 189.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:36:45', 'k-street upgrades', 'K-CHICKEN', 'main'),
(37, 'K-CHICKEN SEOUL STRAWBERRY', 'Food', 189.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:37:08', 'k-street upgrades', 'K-CHICKEN', 'main'),
(38, 'K-CHICKEN SEOUL BERRY BURST', 'Food', 189.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:37:40', 'k-street upgrades', 'K-CHICKEN', 'main'),
(39, 'K-CHICKEN SEOUL LEMONADE', 'Food', 189.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:38:01', 'k-street upgrades', 'K-CHICKEN', 'main'),
(40, 'K-CHICKEN SEOUL APPLE LEMONADE', 'Food', 189.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:38:11', 'k-street upgrades', 'K-CHICKEN', 'main'),
(41, 'K-CHICKEN SEOUL STRAWBERY LEMONADE', 'Food', 189.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:38:27', 'k-street upgrades', 'K-CHICKEN', 'main'),
(42, 'K-CHICKEN BLUEBERRY LEMONADE', 'Food', 189.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:39:01', 'k-street upgrades', 'K-CHICKEN', 'main'),
(43, 'HOUSE SPECIAL', 'Food', 0.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:40:34', 'k-street Flavor', 'K-CHICKEN', 'main'),
(44, 'KOREAN CHICKEN', 'Food', 0.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:40:51', 'k-street Flavor', 'K-CHICKEN', 'main'),
(45, 'SRIRACHA LEMON', 'Food', 0.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:41:06', 'k-street Flavor', 'K-CHICKEN', 'main'),
(46, 'HICKORY BBQ', 'Food', 0.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:41:34', 'k-street Flavor', 'K-CHICKEN', 'main'),
(47, 'BUFFALO MAPLE', 'Food', 0.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:42:03', 'k-street Flavor', 'K-CHICKEN', 'main'),
(48, 'CHILI CHOCO', 'Food', 0.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/560784745_122118412550990298_4125891598523691306_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGz7-gGJYEw-4RvQG20Uh2x1UW1ysOdaTnVRbXKw51pOaZyV8JnxTywpDoq1e4PPxU7poNaAVTvUvGCxVwVicJ2&_nc_ohc=hlqaNqFma_YQ7kNvwG9mWtX&_nc_oc=AdlTAci_KVxjaUXeYQoyoE0vTyqvj1zr6GM58Xk-9uAsRFg-SuOxGFY8e_9WEjycrl0&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_AflJ-y3BnC-mG0wMQPUJBkAJ8UdRv8oyxQybfqpC2_2Vkg&oe=69', '2025-12-13 16:42:15', 'k-street Flavor', 'K-CHICKEN', 'main'),
(49, 'BARKADA BOX 6PCS', 'Main', 359.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/565655757_122118412580990298_6586409642454680581_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFJVSP4NmZT1fXbQWpz15kHdMz24KAHTH10zPbgoAdMfaCmZ74G9PUO2VyZQgOdJSAyRTmGn5F0kpVtEpXRz2KV&_nc_ohc=fG-N1C1e-w0Q7kNvwH589m5&_nc_oc=AdkAAWRCorn2W_3xFGYv1Gz6McRNsBuZAs6GK53m2naQnS58cCyRdrMK75mMI6Xlwaw&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=hFAgWtHS8nVBGToxFvAYSw&oh=00_AfmTuidaEMclec6gdcyI2zPu_r4dOPoAARZtCc9ZmMVGkA&oe=69', '2025-12-13 16:43:40', 'k-street food', 'BARKADA BOX', 'main'),
(50, 'BARKADA BOX 8PCS', 'Food', 499.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/565655757_122118412580990298_6586409642454680581_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFJVSP4NmZT1fXbQWpz15kHdMz24KAHTH10zPbgoAdMfaCmZ74G9PUO2VyZQgOdJSAyRTmGn5F0kpVtEpXRz2KV&_nc_ohc=fG-N1C1e-w0Q7kNvwH589m5&_nc_oc=AdkAAWRCorn2W_3xFGYv1Gz6McRNsBuZAs6GK53m2naQnS58cCyRdrMK75mMI6Xlwaw&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_Afm3GFGZlUf8WnkdGcglhwLWwAGAfnYoBGM4Ro2GxDRWhg&oe=69', '2025-12-13 16:44:00', 'k-street upgrades', 'BARKADA BOX', 'main'),
(51, 'BARKADA BOX 8PCS', 'Food', 719.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/565655757_122118412580990298_6586409642454680581_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFJVSP4NmZT1fXbQWpz15kHdMz24KAHTH10zPbgoAdMfaCmZ74G9PUO2VyZQgOdJSAyRTmGn5F0kpVtEpXRz2KV&_nc_ohc=fG-N1C1e-w0Q7kNvwH589m5&_nc_oc=AdkAAWRCorn2W_3xFGYv1Gz6McRNsBuZAs6GK53m2naQnS58cCyRdrMK75mMI6Xlwaw&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=SzkQccPgqAsImuI3ngdbFA&oh=00_Afm3GFGZlUf8WnkdGcglhwLWwAGAfnYoBGM4Ro2GxDRWhg&oe=69', '2025-12-13 16:44:11', 'k-street upgrades', 'BARKADA BOX', 'main'),
(52, 'MUNCH & SHARE', 'Sides', 749.00, 'https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/560036745_122118412652990298_7654829718188224608_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEpzlBXVb2EF5VpdAMPpE-lE9Tjh0eN9HMT1OOHR430c3NqbR_Gx-dxdpnXy_KivDJ6hrV0tsYxIJ00uO6cjLe6&_nc_ohc=o9nAdaagRNYQ7kNvwEzyk9e&_nc_oc=AdmTiXS_QYjhCaP56eJ2gpJrQL73QOPMFSDhOGwZgsPwbv3jHG-CY1U0_vVmDMi695Q&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=r8LFjo_ISL7f3tqDRkIGlg&oh=00_AfmT9VTK7oqVHZQt2y9oXf9ks0xZBEYbnUDYPGN1GXkQHg&oe=69436A1A', '2025-12-13 16:45:12', 'k-street food', 'MUNCH & SHARE', 'main'),
(53, 'MUNCH & SHARE', 'Food', 999.00, 'https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/560036745_122118412652990298_7654829718188224608_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEpzlBXVb2EF5VpdAMPpE-lE9Tjh0eN9HMT1OOHR430c3NqbR_Gx-dxdpnXy_KivDJ6hrV0tsYxIJ00uO6cjLe6&_nc_ohc=o9nAdaagRNYQ7kNvwEzyk9e&_nc_oc=AdmTiXS_QYjhCaP56eJ2gpJrQL73QOPMFSDhOGwZgsPwbv3jHG-CY1U0_vVmDMi695Q&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=r8LFjo_ISL7f3tqDRkIGlg&oh=00_AfmT9VTK7oqVHZQt2y9oXf9ks0xZBEYbnUDYPGN1GXkQHg&oe=69436A1A', '2025-12-13 16:45:25', 'k-street upgrades', 'MUNCH & SHARE', 'main'),
(54, 'FUSION FEAST', 'Bundle', 649.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/561141002_122118412616990298_9137613075966772877_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHFJzHKTmgGmPbHsWYCE4zNzLrUg7hZlfPMutSDuFmV85eEc0G86k45MN6Pj3eepFDK8Bsd-boxRo_ZWweKI7m1&_nc_ohc=jyfaxCBFoDkQ7kNvwFzibin&_nc_oc=AdnUP_Zx2dnc8B3wqTAO71AJj8n982zla_MZk4dK_3WJf-rem6hQFYRQj5oPZleG6Is&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=ChRFQe5izO4zb_5KxYD4zA&oh=00_AfmpVcv3Np3HbW6K6S6HpQ0mB9rfpWTb5cSJXnERFjBSGw&oe=694355A4', '2025-12-13 16:45:57', 'k-street food', 'FUSION FEAST', 'main'),
(55, 'FUSION FEAST', 'Food', 849.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/561141002_122118412616990298_9137613075966772877_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHFJzHKTmgGmPbHsWYCE4zNzLrUg7hZlfPMutSDuFmV85eEc0G86k45MN6Pj3eepFDK8Bsd-boxRo_ZWweKI7m1&_nc_ohc=jyfaxCBFoDkQ7kNvwFzibin&_nc_oc=AdnUP_Zx2dnc8B3wqTAO71AJj8n982zla_MZk4dK_3WJf-rem6hQFYRQj5oPZleG6Is&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=ChRFQe5izO4zb_5KxYD4zA&oh=00_AfmpVcv3Np3HbW6K6S6HpQ0mB9rfpWTb5cSJXnERFjBSGw&oe=694355A4', '2025-12-13 16:46:07', 'k-street upgrades', 'FUSION FEAST', 'main'),
(56, 'COKE MISMO', 'Drinks', 25.00, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABQcEBgIDCAH/xABAEAABAwIDAwkEBwYHAAAAAAAAAQIDBBEFEiEGEzEHIjJBQlGBobEUYXHBI3KRktHh8DNSYpOj8RU0Q1OCg6L/xAAaAQEAAgMBAAAAAAAAAAAAAAAAAQQCAwUG/8QAKREBAAICAQMDAwQDAAAAAAAAAAECAxEEEiExBRNhUaGxQZHB0RUiMv/aAAwDAQACEQMRAD8AvAAAA', '2025-12-13 16:51:48', 'k-street food', 'COKE MISMO', 'main'),
(57, 'SPRITE MISMO', 'Drinks', 25.00, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAoAMBEQACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAwQCBQYBB//EADUQAAICAgAEBAMFBwUAAAAAAAABAgMEEQUSITEGE0FRInGRFSMyYYEUFkJiobHBByQzY9H/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAQIDBAUG/8QAMhEBAAEDAwIEAQsFAAAAAAAAAAECAxEEITEFEhNBUWEUIjNCQ3GBkbHB4fAVI5LR8f/aAAwDAQACEQMRAD8A+4gAAAAAA', '2025-12-13 17:00:45', 'k-street food', 'SPRITE MISMO', 'main'),
(58, 'ROYAL MISMO', 'Drinks', 25.00, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAlAMBEQACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYCAwQBB//EADIQAAIBAwMBBwMDBAMBAAAAAAECAAMEEQUSITEGEyJBUWFxMoGxFBXBJDORoUNy0SP/xAAbAQEAAgMBAQAAAAAAAAAAAAAAAwUCBAYBB//EADIRAAIBAwMCBAMIAgMAAAAAAAABAgMEEQUSITFBE1FhcTJCsSIjMzSBocHRUuEGFZH/2gAMAwEAAhEDEQA/APuMAQBAEAQBA', '2025-12-13 17:01:25', 'k-street food', 'ROYAL MISMO', 'main'),
(59, 'BOTTLED WATER', 'Drinks', 20.00, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxASDxIPDxAQEA8WEA8QEBUVERUVFRgXFRUWFhUVFRcYHSggGBslGxUVITEhJikrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGislICUuKy0tKy0uLS0vLSstLS0tNS0rLzUtLTctLS0tLTctNy0tLS0vLS8tKy0vLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAAAQMEBQYHAgj/xAA+EAACAQIEAgcFBgQFBQAAAAAAAQIDEQQSITEFQQYTIlFhcZEyQoGhsQczYnLB0RQjkrIkUoLC0hU0U+Hw/8QAGgEBAQADAQEAAAAAAAAAAAAAAAQBAgMFBv/EACoRAQEAAgEEAAMIAwAAAAAAAAABAhEDBBIhMTJBUQUTImFxgaHwM5Hx/9oADAMBAAIRAxEAPwDuIAAAA', '2025-12-13 17:02:22', 'k-street food', 'BOTTLED WATER', 'main'),
(60, 'BOTTLED WATER', 'Drinks', 25.00, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxASDxIPDxAQEA8WEA8QEBUVERUVFRgXFRUWFhUVFRcYHSggGBslGxUVITEhJikrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGislICUuKy0tKy0uLS0vLSstLS0tNS0rLzUtLTctLS0tLTctNy0tLS0vLS8tKy0vLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAAAQMEBQYHAgj/xAA+EAACAQIEAgcFBgQFBQAAAAAAAQIDEQQSITEFQQYTIlFhcZEyQoGhsQczYnLB0RQjkrIkUoLC0hU0U+Hw/8QAGgEBAQADAQEAAAAAAAAAAAAAAAQBAgMFBv/EACoRAQEAAgEEAAMIAwAAAAAAAAABAhEDBBIhMTJBUQUTImFxgaHwM5Hx/9oADAMBAAIRAxEAPwDuIAAAA', '2025-12-13 17:02:30', 'k-street food', 'BOTTLED WATER', 'main'),
(61, 'K-POP CHICKEN', 'Main', 119.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 17:09:56', 'k-street food', 'K-POP CHICKEN', 'main'),
(62, 'KOREAN', 'Food', 0.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 17:10:25', 'k-street Flavor', 'K-POP CHICKEN', 'main'),
(63, 'DAK BULGOGI', 'Food', 0.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 17:10:36', 'k-street Flavor', 'K-POP CHICKEN', 'main'),
(64, 'SIGNITURE', 'Food', 0.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 17:10:53', 'k-street Flavor', 'K-POP CHICKEN', 'main'),
(65, 'BIBIMBAP PORK', 'Main', 159.00, 'https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeH-7-LHEOXVaFroA7JBqmtMkVtrVbjRJ9CRW2tVuNEn0NQSg4ZNq9u1vWHSRWriwiCpgovsxtB7y6QZwKwbmRs8&_nc_ohc=bJ1wZj7aSnYQ7kNvwHSE3iV&_nc_oc=AdnYKL5JUny0P3EcX9FUd-iCrXC1BDZ6GNT2KUROengC4bRFFKlcVDgueocDOe9Qgx0&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=DIOPV2TWI7mem5cq_9BJEw&oh=00_Aflid8x61BzeqIh8-ZBAuvhukgcsybwK4Tca2pv0gMsJ2w&oe=69437031', '2025-12-13 17:12:59', 'k-street food', 'BIBIMBAP', 'main'),
(66, 'BIBIMBAP BEEF', 'Food', 0.00, 'https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeH-7-LHEOXVaFroA7JBqmtMkVtrVbjRJ9CRW2tVuNEn0NQSg4ZNq9u1vWHSRWriwiCpgovsxtB7y6QZwKwbmRs8&_nc_ohc=bJ1wZj7aSnYQ7kNvwHSE3iV&_nc_oc=AdnYKL5JUny0P3EcX9FUd-iCrXC1BDZ6GNT2KUROengC4bRFFKlcVDgueocDOe9Qgx0&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=DIOPV2TWI7mem5cq_9BJEw&oh=00_Aflid8x61BzeqIh8-ZBAuvhukgcsybwK4Tca2pv0gMsJ2w&oe=69437031', '2025-12-13 17:13:29', 'k-street Flavor', 'BIBIMBAP', 'main'),
(67, 'BULGOGI BEEF', 'Main', 159.00, 'https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEj4tUIDHx3_sokz01ksFTif7WTDd8Jny9_tZMN3wmfLygvHa0CxVAc9xQgC29ijV_SQRTl4X_tluTpg-sx_xv_&_nc_ohc=n9kbDgiOLfUQ7kNvwEtA-9E&_nc_oc=AdlSWiQ1NYipGRqP4KZUXgyCwFkRxrYAgNj326f4UX8awWAlTCVKaeEO1l6UMmk-iWY&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=AKVPPNk0MW5qKpyfl4pInQ&oh=00_Afll0ZMOKl4vY-j4WeF9Ne7EMbV5Q-qvTUF7_9z4SMT3cQ&oe=69438297', '2025-12-13 17:14:16', 'k-street food', 'BULGOGI BEEF', 'main'),
(68, 'BULGOGI PORK', 'Food', 149.00, 'https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEj4tUIDHx3_sokz01ksFTif7WTDd8Jny9_tZMN3wmfLygvHa0CxVAc9xQgC29ijV_SQRTl4X_tluTpg-sx_xv_&_nc_ohc=n9kbDgiOLfUQ7kNvwEtA-9E&_nc_oc=AdlSWiQ1NYipGRqP4KZUXgyCwFkRxrYAgNj326f4UX8awWAlTCVKaeEO1l6UMmk-iWY&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=AKVPPNk0MW5qKpyfl4pInQ&oh=00_Afll0ZMOKl4vY-j4WeF9Ne7EMbV5Q-qvTUF7_9z4SMT3cQ&oe=69438297', '2025-12-13 17:14:50', 'k-street upgrades', 'BULGOGI BEEF', 'main'),
(69, 'SAMGYUP ON THE GO PORK', 'Main', 159.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFczkZcxgUBBaDBQLEPC7mWbpTclx3T_S5ulNyXHdP9Lq4Szag_ufq0dITjZswZfqrVxs2zxQcGDUX-Tm3TQkQb&_nc_ohc=j-K5r1VrCDcQ7kNvwHFkBcx&_nc_oc=AdmM5TtSQZ5hbjB4ImUqd2lxxxeBUeGUfTgyMEi84I5ps9if_-cZQRs7EbPjW4XmUks&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=AdL9EKtQ6CFC6E3ELsT2RA&oh=00_AfkMR0QWe3ozlvMkIGPhXD4koFJyC9DuD0PhIKMoFydXMA&oe=694382AE', '2025-12-13 17:16:20', 'k-street food', 'SAMGYUP ON THE GO', 'main'),
(70, 'SAMGYUP ON THE GO BEEF', 'Food', 189.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFczkZcxgUBBaDBQLEPC7mWbpTclx3T_S5ulNyXHdP9Lq4Szag_ufq0dITjZswZfqrVxs2zxQcGDUX-Tm3TQkQb&_nc_ohc=j-K5r1VrCDcQ7kNvwHFkBcx&_nc_oc=AdmM5TtSQZ5hbjB4ImUqd2lxxxeBUeGUfTgyMEi84I5ps9if_-cZQRs7EbPjW4XmUks&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=AdL9EKtQ6CFC6E3ELsT2RA&oh=00_AfkMR0QWe3ozlvMkIGPhXD4koFJyC9DuD0PhIKMoFydXMA&oe=694382AE', '2025-12-13 17:19:55', 'k-street upgrades', 'SAMGYUP ON THE GO', 'main'),
(71, 'K STIR FRY NOODLES', 'Main', 119.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/565768821_122118414740990298_703880326805243702_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFxRimc-xPVO5U74i56OreORLMlRdfaCABEsyVF19oIAHPCzxID65mvI4HKtmazvhl7nmwp8N3k9IX8_4AMmJgs&_nc_ohc=LfxkiOMg8b4Q7kNvwGaBH5A&_nc_oc=AdnP0hLowy9Z7uaYkv4GogosZOI5Qe9UACc7myaLoPRwvp9MExWInBrdOUkFnTGocHM&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=xrEaIQA10lRtlJmw-4MODQ&oh=00_Afm91GFcNbv0bMo-utUoFBYmfudJJnR7IEPQo8QhXPi7Ew&oe=69436D41', '2025-12-13 17:21:04', 'k-street food', 'K STIR FRY NOODLES', 'main'),
(72, 'RAMEON PORK', 'Main', 179.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/565077308_122118414572990298_7107752836660246599_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeH02ycyAyi9FrHCIyXDhtBLIRiU_0GhGYEhGJT_QaEZgYQSRIrSQuX35uuQkOYXo0K6BdwFqIh8FZvD2Jb2EIu5&_nc_ohc=03CE-UtWNtQQ7kNvwH2zOiq&_nc_oc=Adk9rjMo06p5z_-ujuSeUlmPdKOZ0ztaQN8j3BIVQE_IYmnRB3KjDGdf103n4OjM4Rc&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=BBVcccexLMGdbi96SAIOdg&oh=00_AflRSM3UaHg45BFoTe85GF5JulzhW6aS962JL2QBFa8-Gg&oe=694372EC', '2025-12-13 17:21:32', 'k-street food', 'RAMEON', 'main'),
(73, 'RAMEON BEEF', 'Food', 189.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/565077308_122118414572990298_7107752836660246599_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeH02ycyAyi9FrHCIyXDhtBLIRiU_0GhGYEhGJT_QaEZgYQSRIrSQuX35uuQkOYXo0K6BdwFqIh8FZvD2Jb2EIu5&_nc_ohc=03CE-UtWNtQQ7kNvwH2zOiq&_nc_oc=Adk9rjMo06p5z_-ujuSeUlmPdKOZ0ztaQN8j3BIVQE_IYmnRB3KjDGdf103n4OjM4Rc&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=BBVcccexLMGdbi96SAIOdg&oh=00_AflRSM3UaHg45BFoTe85GF5JulzhW6aS962JL2QBFa8-Gg&oe=694372EC', '2025-12-13 17:21:46', 'k-street upgrades', 'RAMEON', 'main'),
(74, 'MANDU STEAMED', 'Sides', 99.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/561631210_122118414644990298_8456727481639252095_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFqq60dXs_Y68n9i4tx6B7q1VjFIkBv-cTVWMUiQG_5xJaWkGXlTaSu7B-WIg7qCRjNpmdDS5nzjZkkHCnfYYm1&_nc_ohc=BlS1lM0s5rMQ7kNvwFVtuck&_nc_oc=AdnTlyITz9IZMZk1aFwYOx8ixchXrnRUBqkfYH1kNQhmFyeBtPmCk_MDImwYN_KFu5w&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=K5lwT5fAwMsrAf481e4OsQ&oh=00_Afk2lwPGfCuKkXKuwrwravFrqDi8qdYLlOgS8CBAuZkRWA&oe=694375BB', '2025-12-13 17:22:46', 'k-street food', 'MANDU', 'main'),
(75, 'MANDU FRIED', 'Food', 0.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/561631210_122118414644990298_8456727481639252095_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFqq60dXs_Y68n9i4tx6B7q1VjFIkBv-cTVWMUiQG_5xJaWkGXlTaSu7B-WIg7qCRjNpmdDS5nzjZkkHCnfYYm1&_nc_ohc=BlS1lM0s5rMQ7kNvwFVtuck&_nc_oc=AdnTlyITz9IZMZk1aFwYOx8ixchXrnRUBqkfYH1kNQhmFyeBtPmCk_MDImwYN_KFu5w&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=K5lwT5fAwMsrAf481e4OsQ&oh=00_Afk2lwPGfCuKkXKuwrwravFrqDi8qdYLlOgS8CBAuZkRWA&oe=694375BB', '2025-12-13 17:23:09', 'k-street Flavor', 'MANDU', 'main'),
(76, 'PORK', 'Food', 0.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/561631210_122118414644990298_8456727481639252095_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFqq60dXs_Y68n9i4tx6B7q1VjFIkBv-cTVWMUiQG_5xJaWkGXlTaSu7B-WIg7qCRjNpmdDS5nzjZkkHCnfYYm1&_nc_ohc=BlS1lM0s5rMQ7kNvwFVtuck&_nc_oc=AdnTlyITz9IZMZk1aFwYOx8ixchXrnRUBqkfYH1kNQhmFyeBtPmCk_MDImwYN_KFu5w&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=K5lwT5fAwMsrAf481e4OsQ&oh=00_Afk2lwPGfCuKkXKuwrwravFrqDi8qdYLlOgS8CBAuZkRWA&oe=694375BB', '2025-12-13 17:24:04', 'k-street Flavor', 'MANDU', 'main'),
(77, 'BEEF', 'Food', 0.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/561631210_122118414644990298_8456727481639252095_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFqq60dXs_Y68n9i4tx6B7q1VjFIkBv-cTVWMUiQG_5xJaWkGXlTaSu7B-WIg7qCRjNpmdDS5nzjZkkHCnfYYm1&_nc_ohc=BlS1lM0s5rMQ7kNvwFVtuck&_nc_oc=AdnTlyITz9IZMZk1aFwYOx8ixchXrnRUBqkfYH1kNQhmFyeBtPmCk_MDImwYN_KFu5w&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=K5lwT5fAwMsrAf481e4OsQ&oh=00_Afk2lwPGfCuKkXKuwrwravFrqDi8qdYLlOgS8CBAuZkRWA&oe=694375BB', '2025-12-13 17:24:11', 'k-street Flavor', 'MANDU', 'main'),
(78, 'VAGETABLE', 'Food', 0.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/561631210_122118414644990298_8456727481639252095_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFqq60dXs_Y68n9i4tx6B7q1VjFIkBv-cTVWMUiQG_5xJaWkGXlTaSu7B-WIg7qCRjNpmdDS5nzjZkkHCnfYYm1&_nc_ohc=BlS1lM0s5rMQ7kNvwFVtuck&_nc_oc=AdnTlyITz9IZMZk1aFwYOx8ixchXrnRUBqkfYH1kNQhmFyeBtPmCk_MDImwYN_KFu5w&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=K5lwT5fAwMsrAf481e4OsQ&oh=00_Afk2lwPGfCuKkXKuwrwravFrqDi8qdYLlOgS8CBAuZkRWA&oe=694375BB', '2025-12-13 17:24:19', 'k-street Flavor', 'MANDU', 'main'),
(79, 'DOSIRAK BEEF BULGOGI', 'Main', 219.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/562428694_122118412622990298_8165107731657172055_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFPuqeXVMilEvyQTDk8Gtt3QcArHTlsGLNBwCsdOWwYs4ZdAWHvOKLV1bviJuntJarHK7bEjWxIYF3RY85mGwze&_nc_ohc=M3UHACBGWicQ7kNvwHvb2Ta&_nc_oc=AdkROug7Yv0ztvqgaLb-LDYCu4_8hJ83qElp15wLuVPZC24oLi8LURE9-USITzxflM0&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=aEx5Qf9Grt3nEtWqxA9lgw&oh=00_AflpvV83jF36bWmwwsNiTIwJiWSBfoEntIf0kGfidLgn1A&oe=69437E0D', '2025-12-13 17:27:15', 'k-street food', 'K PREMIUM', 'main'),
(80, 'DOSIRAK KIIMCHI PORK', 'Food', 219.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/562428694_122118412622990298_8165107731657172055_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFPuqeXVMilEvyQTDk8Gtt3QcArHTlsGLNBwCsdOWwYs4ZdAWHvOKLV1bviJuntJarHK7bEjWxIYF3RY85mGwze&_nc_ohc=M3UHACBGWicQ7kNvwHvb2Ta&_nc_oc=AdkROug7Yv0ztvqgaLb-LDYCu4_8hJ83qElp15wLuVPZC24oLi8LURE9-USITzxflM0&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=aEx5Qf9Grt3nEtWqxA9lgw&oh=00_AflpvV83jF36bWmwwsNiTIwJiWSBfoEntIf0kGfidLgn1A&oe=69437E0D', '2025-12-13 17:27:52', 'k-street upgrades', 'K PREMIUM', 'main'),
(81, 'DOSIRAK CHICKEN KATSU', 'Food', 219.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/562428694_122118412622990298_8165107731657172055_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFPuqeXVMilEvyQTDk8Gtt3QcArHTlsGLNBwCsdOWwYs4ZdAWHvOKLV1bviJuntJarHK7bEjWxIYF3RY85mGwze&_nc_ohc=M3UHACBGWicQ7kNvwHvb2Ta&_nc_oc=AdkROug7Yv0ztvqgaLb-LDYCu4_8hJ83qElp15wLuVPZC24oLi8LURE9-USITzxflM0&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=aEx5Qf9Grt3nEtWqxA9lgw&oh=00_AflpvV83jF36bWmwwsNiTIwJiWSBfoEntIf0kGfidLgn1A&oe=69437E0D', '2025-12-13 17:28:19', 'k-street upgrades', 'K PREMIUM', 'main'),
(82, 'FISHCAKE', 'Sides', 45.00, 'https://scontent.fcrk1-2.fna.fbcdn.net/v/t39.30808-6/561728605_122118414650990298_1414331048637307037_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGJD5UXORROoVjK9SOK78MDmq9jnpLScDmar2OektJwOal6VBnrS7FXEGA_3eZhrfEDwFvAXcijIcb6_0NJwtf7&_nc_ohc=SSlABgmyTPwQ7kNvwHmgj79&_nc_oc=Adm9OG2e0HSSVUiA7C1WgpgR1l_HcwHKuxOalpe_F_GuPAvjVCjoyaRe8-tx-J33d0w&_nc_zt=23&_nc_ht=scontent.fcrk1-2.fna&_nc_gid=60jpwNR_vQpRrTCrm7_dJQ&oh=00_Afkjv4FmLIpuj9xgB6mNtNfNMARUSfeNKPV4NGOCGl6zbQ&oe=69438592', '2025-12-13 17:29:49', 'k-street food', 'FISHCAKE', 'main'),
(83, 'LOBSTER BALL', 'Sides', 99.00, 'https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560560300_122118414806990298_5147054841421340357_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHwbYnC1GBZ-6XWKd8gzuVFO1YsBz4Mu7c7ViwHPgy7t9_uBnzF5jIdKvJVXtYi45j7EtVF56kfVLoOaeIWT1Ju&_nc_ohc=BQmX35XvbFMQ7kNvwGhG4xt&_nc_oc=AdnYLFm_rLY7BNsUKE1FbYWjdG_WYd_njAiGp1wYgH4ZgtYBFAkWFt97I-pvHzxqHgo&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=5_y5o51FkrpLMt-i9HIIVA&oh=00_AfmhMX7GuwmOGvrg0VEY5hfiE3DEK3xnloXCFCAjFm85Sw&oe=694378FC', '2025-12-13 17:40:03', 'k-street food', 'LOBSTER BALL', 'main'),
(84, 'TTEOKBOKKI', 'Sides', 45.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/559704775_122118414488990298_8965386101484859073_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEbz7-ZsMwXQGfjKav8PIi66E_LwTXs-yjoT8vBNez7KGlDFDNH8kNHbYBWfGCjYz6KrrjoAqCMNA4w_MGxG24C&_nc_ohc=nQQZ74jMqIsQ7kNvwFxdm2I&_nc_oc=AdkcoF6T21jwDbOCKqMFObSFV79NxcsNAkmGEssSjr84Lo6f-_srBqdsxiJMOFZfYNg&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=BWtNvnonZAV2F9wKqM3Ekw&oh=00_AfmMQo5Q3xNP73FMKYSwIQ3RDuTFDDC0Adp_7Low-U4A9A&oe=6943758E', '2025-12-13 17:40:57', 'k-street food', 'TTEOKBOKKI', 'main'),
(85, 'CLASSIC CORNDOG', 'Sides', 95.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/558948735_122118414722990298_6309699967761949758_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFwNwYyPD7BBaWX4pW4OhduUlHuWShby85SUe5ZKFvLzt9-Y7URgWhK3n92hMCixbLQMRejM2Mp2bpqyWmFaQlO&_nc_ohc=qc3hS6hLqKsQ7kNvwED34HD&_nc_oc=Adn2eE84aOinkA0H5zbKYaQI3dabygced73wmVp-au0U81fiDcT50PBZ8_MGTWdlqrw&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=yeeSWLZxCKgiey4GRn7cVg&oh=00_Afm4Kfs8eX9PfglOUBWRm2olhLSpdCMBg9hN-s4dp2Mr3Q&oe=694390D1', '2025-12-13 17:41:25', 'k-street food', 'CLASSIC CORNDOG', 'main'),
(86, 'CLASSIC MOZA', 'Sides', 110.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 17:42:05', 'k-street food', 'CLASSIC MOZA', 'main'),
(87, 'K CHIPS', 'Sides', 95.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 17:44:29', 'k-street food', 'K CHIPS', 'main'),
(88, 'HOTPOT SOUP', 'Sides', 25.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:00:27', 'k-street food', 'SIDE', 'main'),
(89, 'KIMCHI', 'Sides', 59.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:01:20', 'k-street food', 'SIDE', 'main'),
(90, 'PLAIN RICE', 'Sides', 15.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:02:28', 'k-street food', 'SIDE', 'main'),
(91, 'BULGOGI RICE', 'Sides', 45.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:05:10', 'k-street food', 'SIDE', 'main'),
(92, 'SIGNATURE RICE', 'Sides', 45.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:05:30', 'k-street food', 'SIDE', 'main'),
(93, 'BULGOGI SAUCE', 'Sides', 20.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:06:05', 'k-street food', 'SIDE', 'main'),
(94, 'CHOGOCHUJANG', 'Sides', 20.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:06:33', 'k-street food', 'SIDE', 'main'),
(95, 'K-CHIPS', 'Food', 95.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:11:18', 'k-street add sides', 'K-EXTRAS', 'main'),
(96, 'HOTPOT SOUP', 'Food', 25.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:11:35', 'k-street add sides', 'K-EXTRAS', 'main'),
(97, 'HOTPOT SOUP', 'Food', 59.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:11:46', 'k-street add sides', 'K-EXTRAS', 'main'),
(98, 'KIMCHI', 'Food', 59.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:12:04', 'k-street add sides', 'K-EXTRAS', 'main'),
(99, 'PLAIN RICE', 'Food', 15.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:12:23', 'k-street add sides', 'K-EXTRAS', 'main'),
(100, 'BULGOGI RICE', 'Food', 45.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:12:39', 'k-street add sides', 'K-EXTRAS', 'main'),
(101, 'SIGNATURE RICE', 'Food', 45.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:13:43', 'k-street add sides', 'K-EXTRAS', 'main'),
(102, 'BULGOGI SAUCE', 'Food', 20.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:14:22', 'k-street add sides', 'K-EXTRAS', 'main'),
(103, 'CHOGOCHUJANG', 'Food', 20.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEAXCWwf0TF0kZEkxXnW8qJLrmbm3d9s0wuuZubd32zTKzDt2uw5lzvlouUfck9nM_6bYyW2rtwFxzH4o4LRCrF&_nc_ohc=JzgPkqu_qXcQ7kNvwFTiXox&_nc_oc=Adkt65LsyOTklWoINWAUuZ56ZA5eatBMbKVmoCYc238cxU1SXFUEubJSNX30hbPAwPo&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=PfxWb-bmhjEK_xNkrQduYw&oh=00_AflIyz3wJc3sRmYpTB5lcLGqQbDy8NipHkHXkFR2rcroOw&oe=694365CE', '2025-12-13 18:14:42', 'k-street add sides', 'K-EXTRAS', 'main');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `paidAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discountApplied` tinyint(1) DEFAULT 0,
  `changeAmount` decimal(10,2) DEFAULT 0.00,
  `orderType` varchar(50) DEFAULT 'Dine In',
  `productNames` text DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `payment_method` varchar(50) DEFAULT 'Cash',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_void` tinyint(1) DEFAULT 0,
  `void_reason` text DEFAULT NULL,
  `voided_by` varchar(100) DEFAULT NULL,
  `voided_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `branch` varchar(50) DEFAULT 'main'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `userId`, `paidAmount`, `total`, `discountApplied`, `changeAmount`, `orderType`, `productNames`, `items`, `payment_method`, `created_at`, `is_void`, `void_reason`, `voided_by`, `voided_at`, `updated_at`, `branch`) VALUES
(1, 1, 500.00, 149.00, 0, 351.00, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-02 12:20:34', 1, 'cc', 'Admin', '2025-12-02 12:22:11', '2025-12-03 06:21:21', 'main'),
(2, 1, 500.00, 200.00, 0, 300.00, 'Dine In', 'Samgyup on the go', '[{\"id\":16,\"name\":\"Samgyup on the go\",\"quantity\":1,\"price\":200,\"subtotal\":200,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-02 12:31:47', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(3, 1, 500.00, 359.00, 0, 141.00, 'Dine In', 'Samgyup on the go, Bibimbab', '[{\"id\":16,\"name\":\"Samgyup on the go\",\"quantity\":1,\"price\":200,\"subtotal\":200,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"},{\"id\":11,\"name\":\"Bibimbab\",\"quantity\":1,\"price\":159,\"subtotal\":159,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-02 12:31:53', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(4, 1, 1000.00, 558.00, 0, 442.00, 'Dine In', 'Samgyup on the go, Bibimbab, [UPGRADED] Bibimbab Overload', '[{\"id\":16,\"name\":\"Samgyup on the go\",\"quantity\":1,\"price\":200,\"subtotal\":200,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"},{\"id\":11,\"name\":\"Bibimbab\",\"quantity\":1,\"price\":159,\"subtotal\":159,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"},{\"id\":11,\"name\":\"[UPGRADED] Bibimbab Overload\",\"quantity\":1,\"price\":199,\"subtotal\":199,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":12,\"name\":\"Bibimbab Overload\",\"category\":\"Food\",\"price\":\"199.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kVnvMu83Ee4Q7kNvwFbFlZQ&_nc_oc=AdkcmQgDz4Xhl_cK6nBlBJGHXz0C7MBjzezfanG-WJb5Bs7fNmTvzD5DyxKHHxVaBRA&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=KX9FCayAogz_27bq0YRXSw&oh=00_AfgtxOm-czBepuXJrLfxtDK3AhQriQLoT-0wj-TIy0mnOg&oe=692D06B1\",\"created_at\":\"2025-11-26T15:32:44.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BIBIMBAB\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-02 12:32:02', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(5, 1, 1000.00, 20.00, 0, 980.00, 'Dine In', '[CHILI CHOCO FLAVOR] Korean Boneless Chicken', '[{\"id\":9,\"name\":\"[CHILI CHOCO FLAVOR] Korean Boneless Chicken\",\"quantity\":1,\"price\":20,\"subtotal\":20,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\"}],\"selectedUpgrade\":{\"id\":27,\"name\":\"CHILI CHOCO\",\"category\":\"Food\",\"price\":\"0.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/571397224_122120428946990298_114953131984761379_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Loh_EOAUGEcQ7kNvwEt6ngd&_nc_oc=Adl2D7LUVr0HUuOU9gWBDYkqskVv3slPSsLDi_ZFmM7H8IhSS5JcG3E216vpLLBQ53g&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=1uEyS7f01yyzdJfRZgsYmA&oh=00_Afi6UQZ_XmYiE4cV9pN2E280APfg-ICKjWyVoizcBnmntg&oe=69331B77\",\"created_at\":\"2025-12-01T10:31:37.000Z\",\"description_type\":\"k-street Flavor\",\"product_code\":\"CHICKEN KOR\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-02 12:32:09', 1, 'cc', 'Admin', '2025-12-02 12:32:20', '2025-12-03 06:21:21', 'main'),
(6, 1, 500.00, 180.00, 0, 320.00, 'Take-Out', '[CHILI CHOCO FLAVOR] Korean Boneless Chicken', '[{\"id\":9,\"name\":\"[CHILI CHOCO FLAVOR] Korean Boneless Chicken\",\"quantity\":1,\"price\":180,\"subtotal\":180,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":27,\"name\":\"CHILI CHOCO\",\"category\":\"Food\",\"price\":\"0.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/571397224_122120428946990298_114953131984761379_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Loh_EOAUGEcQ7kNvwEt6ngd&_nc_oc=Adl2D7LUVr0HUuOU9gWBDYkqskVv3slPSsLDi_ZFmM7H8IhSS5JcG3E216vpLLBQ53g&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=1uEyS7f01yyzdJfRZgsYmA&oh=00_Afi6UQZ_XmYiE4cV9pN2E280APfg-ICKjWyVoizcBnmntg&oe=69331B77\",\"created_at\":\"2025-12-01T10:31:37.000Z\",\"description_type\":\"k-street Flavor\",\"product_code\":\"CHICKEN KOR\"},\"specialInstructions\":\"\"}]', 'Gcash', '2025-12-02 12:38:26', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(7, 1, 500.00, 430.00, 0, 70.00, 'Take-Out', '[CHILI CHOCO FLAVOR] Korean Boneless Chicken, [UPGRADED] Samgyup on the go overload', '[{\"id\":9,\"name\":\"[CHILI CHOCO FLAVOR] Korean Boneless Chicken\",\"quantity\":1,\"price\":180,\"subtotal\":180,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":27,\"name\":\"CHILI CHOCO\",\"category\":\"Food\",\"price\":\"0.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/571397224_122120428946990298_114953131984761379_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Loh_EOAUGEcQ7kNvwEt6ngd&_nc_oc=Adl2D7LUVr0HUuOU9gWBDYkqskVv3slPSsLDi_ZFmM7H8IhSS5JcG3E216vpLLBQ53g&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=1uEyS7f01yyzdJfRZgsYmA&oh=00_Afi6UQZ_XmYiE4cV9pN2E280APfg-ICKjWyVoizcBnmntg&oe=69331B77\",\"created_at\":\"2025-12-01T10:31:37.000Z\",\"description_type\":\"k-street Flavor\",\"product_code\":\"CHICKEN KOR\"},\"specialInstructions\":\"\"},{\"id\":16,\"name\":\"[UPGRADED] Samgyup on the go overload\",\"quantity\":1,\"price\":250,\"subtotal\":250,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":17,\"name\":\"Samgyup on the go overload\",\"category\":\"Food\",\"price\":\"250.00\",\"image\":\"https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CzTFXWhYeRQQ7kNvwFK9TpC&_nc_oc=AdlJdK1IoszYGJhVK7nXm5ttMj5bLuU9FGuJ55EUjWeAxBqzXgsX3bhJ4k2A3SPYcPQ&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=zP57WOG8xPgJckQoLUn65A&oh=00_Afhi2-G1tHouD2M7qtCp12nnvmUBpFoK7pfEm61wyKVFig&oe=692D89AE\",\"created_at\":\"2025-11-27T04:25:23.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"SAMGYUP\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-02 12:38:43', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(8, 1, 500.00, 180.00, 0, 320.00, 'Take-Out', '[CHILI CHOCO FLAVOR] Korean Boneless Chicken', '[{\"id\":9,\"name\":\"[CHILI CHOCO FLAVOR] Korean Boneless Chicken\",\"quantity\":1,\"price\":180,\"subtotal\":180,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":27,\"name\":\"CHILI CHOCO\",\"category\":\"Food\",\"price\":\"0.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/571397224_122120428946990298_114953131984761379_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Loh_EOAUGEcQ7kNvwEt6ngd&_nc_oc=Adl2D7LUVr0HUuOU9gWBDYkqskVv3slPSsLDi_ZFmM7H8IhSS5JcG3E216vpLLBQ53g&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=1uEyS7f01yyzdJfRZgsYmA&oh=00_Afi6UQZ_XmYiE4cV9pN2E280APfg-ICKjWyVoizcBnmntg&oe=69331B77\",\"created_at\":\"2025-12-01T10:31:37.000Z\",\"description_type\":\"k-street Flavor\",\"product_code\":\"CHICKEN KOR\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-02 12:38:51', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(9, 1, 500.00, 180.00, 0, 320.00, 'Take-Out', '[CHILI CHOCO FLAVOR] Korean Boneless Chicken', '[{\"id\":9,\"name\":\"[CHILI CHOCO FLAVOR] Korean Boneless Chicken\",\"quantity\":1,\"price\":180,\"subtotal\":180,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":27,\"name\":\"CHILI CHOCO\",\"category\":\"Food\",\"price\":\"0.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/571397224_122120428946990298_114953131984761379_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Loh_EOAUGEcQ7kNvwEt6ngd&_nc_oc=Adl2D7LUVr0HUuOU9gWBDYkqskVv3slPSsLDi_ZFmM7H8IhSS5JcG3E216vpLLBQ53g&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=1uEyS7f01yyzdJfRZgsYmA&oh=00_Afi6UQZ_XmYiE4cV9pN2E280APfg-ICKjWyVoizcBnmntg&oe=69331B77\",\"created_at\":\"2025-12-01T10:31:37.000Z\",\"description_type\":\"k-street Flavor\",\"product_code\":\"CHICKEN KOR\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-02 12:38:54', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(10, 1, 500.00, 175.20, 1, 324.80, 'Dine In', '[UPGRADED] Bibimbab Overload', '[{\"id\":11,\"name\":\"[UPGRADED] Bibimbab Overload\",\"quantity\":1,\"price\":219,\"subtotal\":219,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\"}],\"selectedUpgrade\":{\"id\":12,\"name\":\"Bibimbab Overload\",\"category\":\"Food\",\"price\":\"199.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kVnvMu83Ee4Q7kNvwFbFlZQ&_nc_oc=AdkcmQgDz4Xhl_cK6nBlBJGHXz0C7MBjzezfanG-WJb5Bs7fNmTvzD5DyxKHHxVaBRA&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=KX9FCayAogz_27bq0YRXSw&oh=00_AfgtxOm-czBepuXJrLfxtDK3AhQriQLoT-0wj-TIy0mnOg&oe=692D06B1\",\"created_at\":\"2025-11-26T15:32:44.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BIBIMBAB\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-02 13:05:02', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(11, 1, 500.00, 219.00, 0, 281.00, 'Dine In', '[UPGRADED] Bibimbab Overload', '[{\"id\":11,\"name\":\"[UPGRADED] Bibimbab Overload\",\"quantity\":1,\"price\":219,\"subtotal\":219,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\"}],\"selectedUpgrade\":{\"id\":12,\"name\":\"Bibimbab Overload\",\"category\":\"Food\",\"price\":\"199.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kVnvMu83Ee4Q7kNvwFbFlZQ&_nc_oc=AdkcmQgDz4Xhl_cK6nBlBJGHXz0C7MBjzezfanG-WJb5Bs7fNmTvzD5DyxKHHxVaBRA&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=KX9FCayAogz_27bq0YRXSw&oh=00_AfgtxOm-czBepuXJrLfxtDK3AhQriQLoT-0wj-TIy0mnOg&oe=692D06B1\",\"created_at\":\"2025-11-26T15:32:44.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BIBIMBAB\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-02 13:25:40', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(12, 1, 500.00, 250.00, 0, 250.00, 'Dine In', '[UPGRADED] Samgyup on the go overload', '[{\"id\":16,\"name\":\"[UPGRADED] Samgyup on the go overload\",\"quantity\":1,\"price\":250,\"subtotal\":250,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":17,\"name\":\"Samgyup on the go overload\",\"category\":\"Food\",\"price\":\"250.00\",\"image\":\"https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CzTFXWhYeRQQ7kNvwFK9TpC&_nc_oc=AdlJdK1IoszYGJhVK7nXm5ttMj5bLuU9FGuJ55EUjWeAxBqzXgsX3bhJ4k2A3SPYcPQ&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=zP57WOG8xPgJckQoLUn65A&oh=00_Afhi2-G1tHouD2M7qtCp12nnvmUBpFoK7pfEm61wyKVFig&oe=692D89AE\",\"created_at\":\"2025-11-27T04:25:23.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"SAMGYUP\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-02 14:48:44', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(13, 1, 500.00, 159.00, 0, 341.00, 'Dine In', 'Beef Bulgogi', '[{\"id\":14,\"name\":\"Beef Bulgogi\",\"quantity\":1,\"price\":159,\"subtotal\":159,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Grab', '2025-12-02 15:23:55', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(14, 1, 500.00, 135.20, 1, 364.80, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":169,\"subtotal\":169,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\"}],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-02 15:24:17', 0, NULL, NULL, NULL, '2025-12-03 06:21:21', 'main'),
(15, 5, 500.00, 135.20, 1, 364.80, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":169,\"subtotal\":169,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\",\"branch\":\"K-Street\"}],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"K-Street\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-03 06:58:28', 0, NULL, NULL, NULL, '2025-12-03 06:58:28', 'main'),
(16, 4, 500.00, 199.00, 0, 301.00, 'Dine In', '[UPGRADED] Bibimbab Overload', '[{\"id\":11,\"name\":\"[UPGRADED] Bibimbab Overload\",\"quantity\":1,\"price\":199,\"subtotal\":199,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":12,\"name\":\"Bibimbab Overload\",\"category\":\"Food\",\"price\":\"199.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kVnvMu83Ee4Q7kNvwFbFlZQ&_nc_oc=AdkcmQgDz4Xhl_cK6nBlBJGHXz0C7MBjzezfanG-WJb5Bs7fNmTvzD5DyxKHHxVaBRA&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=KX9FCayAogz_27bq0YRXSw&oh=00_AfgtxOm-czBepuXJrLfxtDK3AhQriQLoT-0wj-TIy0mnOg&oe=692D06B1\",\"created_at\":\"2025-11-26T15:32:44.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BIBIMBAB\",\"branch\":\"K-Street\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-03 07:00:34', 0, NULL, NULL, NULL, '2025-12-03 07:00:34', 'main'),
(17, 1, 500.00, 169.00, 0, 331.00, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":169,\"subtotal\":169,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\",\"branch\":\"K-Street\"}],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"K-Street\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-03 07:01:18', 0, NULL, NULL, NULL, '2025-12-03 07:01:18', 'main'),
(18, 1, 500.00, 180.00, 0, 320.00, 'Dine In', '[CHILI CHOCO FLAVOR] Korean Boneless Chicken', '[{\"id\":9,\"name\":\"[CHILI CHOCO FLAVOR] Korean Boneless Chicken\",\"quantity\":1,\"price\":180,\"subtotal\":180,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":27,\"name\":\"CHILI CHOCO\",\"category\":\"Food\",\"price\":\"0.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/571397224_122120428946990298_114953131984761379_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Loh_EOAUGEcQ7kNvwEt6ngd&_nc_oc=Adl2D7LUVr0HUuOU9gWBDYkqskVv3slPSsLDi_ZFmM7H8IhSS5JcG3E216vpLLBQ53g&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=1uEyS7f01yyzdJfRZgsYmA&oh=00_Afi6UQZ_XmYiE4cV9pN2E280APfg-ICKjWyVoizcBnmntg&oe=69331B77\",\"created_at\":\"2025-12-01T10:31:37.000Z\",\"description_type\":\"k-street Flavor\",\"product_code\":\"CHICKEN KOR\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-03 09:25:27', 0, NULL, NULL, NULL, '2025-12-03 09:25:27', 'main'),
(19, 1, 500.00, 149.00, 0, 351.00, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-04 05:29:16', 0, NULL, NULL, NULL, '2025-12-04 05:29:16', 'main'),
(20, 1, 500.00, 149.00, 0, 351.00, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Grab', '2025-12-04 09:00:27', 0, NULL, NULL, NULL, '2025-12-04 09:00:27', 'main'),
(25, 1, 1000.00, 756.20, 0, 243.80, 'Dine In', '[UPGRADED] Bibimbab Overload', '[{\"id\":11,\"name\":\"[UPGRADED] Bibimbab Overload\",\"quantity\":4,\"price\":199,\"subtotal\":796,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":12,\"name\":\"Bibimbab Overload\",\"category\":\"Food\",\"price\":\"199.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kVnvMu83Ee4Q7kNvwFbFlZQ&_nc_oc=AdkcmQgDz4Xhl_cK6nBlBJGHXz0C7MBjzezfanG-WJb5Bs7fNmTvzD5DyxKHHxVaBRA&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=KX9FCayAogz_27bq0YRXSw&oh=00_AfgtxOm-czBepuXJrLfxtDK3AhQriQLoT-0wj-TIy0mnOg&oe=692D06B1\",\"created_at\":\"2025-11-26T15:32:44.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BIBIMBAB\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-04 15:11:50', 1, 'cc', 'melivojaymark61@gmail.com', '2025-12-09 07:41:24', '2025-12-09 07:41:24', 'main'),
(26, 1, 500.00, 119.20, 1, 380.80, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-04 15:12:37', 0, NULL, NULL, NULL, '2025-12-04 15:12:37', 'main'),
(27, 1, 500.00, 270.00, 0, 230.00, 'Dine In', '[UPGRADED] Samgyup on the go overload', '[{\"id\":16,\"name\":\"[UPGRADED] Samgyup on the go overload\",\"quantity\":1,\"price\":270,\"subtotal\":270,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\",\"branch\":\"main\"}],\"selectedUpgrade\":{\"id\":17,\"name\":\"Samgyup on the go overload\",\"category\":\"Food\",\"price\":\"250.00\",\"image\":\"https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CzTFXWhYeRQQ7kNvwFK9TpC&_nc_oc=AdlJdK1IoszYGJhVK7nXm5ttMj5bLuU9FGuJ55EUjWeAxBqzXgsX3bhJ4k2A3SPYcPQ&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=zP57WOG8xPgJckQoLUn65A&oh=00_Afhi2-G1tHouD2M7qtCp12nnvmUBpFoK7pfEm61wyKVFig&oe=692D89AE\",\"created_at\":\"2025-11-27T04:25:23.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"SAMGYUP\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-05 03:20:42', 1, 'asdasd', 'melivojaymark61@gmail.com', '2025-12-09 06:23:55', '2025-12-09 06:23:55', 'main'),
(28, 1, 500.00, 141.55, 1, 358.45, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-05 03:20:58', 1, 's', 'melivojaymark61@gmail.com', '2025-12-09 05:50:41', '2025-12-09 05:50:41', 'main'),
(29, 1, 500.00, 189.05, 1, 310.95, 'Dine In', '[UPGRADED] Bibimbab Overload', '[{\"id\":11,\"name\":\"[UPGRADED] Bibimbab Overload\",\"quantity\":1,\"price\":199,\"subtotal\":199,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":12,\"name\":\"Bibimbab Overload\",\"category\":\"Food\",\"price\":\"199.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kVnvMu83Ee4Q7kNvwFbFlZQ&_nc_oc=AdkcmQgDz4Xhl_cK6nBlBJGHXz0C7MBjzezfanG-WJb5Bs7fNmTvzD5DyxKHHxVaBRA&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=KX9FCayAogz_27bq0YRXSw&oh=00_AfgtxOm-czBepuXJrLfxtDK3AhQriQLoT-0wj-TIy0mnOg&oe=692D06B1\",\"created_at\":\"2025-11-26T15:32:44.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BIBIMBAB\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-05 03:21:26', 1, 'sdasd', 'melivojaymark61@gmail.com', '2025-12-09 05:49:55', '2025-12-09 05:49:55', 'main'),
(30, 1, 500.00, 237.50, 1, 262.50, 'Dine In', '[UPGRADED] Samgyup on the go overload', '[{\"id\":16,\"name\":\"[UPGRADED] Samgyup on the go overload\",\"quantity\":1,\"price\":250,\"subtotal\":250,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":17,\"name\":\"Samgyup on the go overload\",\"category\":\"Food\",\"price\":\"250.00\",\"image\":\"https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CzTFXWhYeRQQ7kNvwFK9TpC&_nc_oc=AdlJdK1IoszYGJhVK7nXm5ttMj5bLuU9FGuJ55EUjWeAxBqzXgsX3bhJ4k2A3SPYcPQ&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=zP57WOG8xPgJckQoLUn65A&oh=00_Afhi2-G1tHouD2M7qtCp12nnvmUBpFoK7pfEm61wyKVFig&oe=692D89AE\",\"created_at\":\"2025-11-27T04:25:23.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"SAMGYUP\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-05 03:22:39', 1, 'asdasd', 'melivojaymark61@gmail.com', '2025-12-09 05:49:30', '2025-12-09 05:49:30', 'main'),
(31, 5, 1000.00, 1000.00, 0, 0.00, 'Dine In', 'gggg', '[{\"id\":29,\"name\":\"gggg\",\"quantity\":1,\"price\":1000,\"subtotal\":1000,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-09 06:26:03', 0, NULL, NULL, NULL, '2025-12-09 06:26:03', 'K-Street'),
(32, 5, 1000.00, 1000.00, 0, 0.00, 'Dine In', 'gggg', '[{\"id\":29,\"name\":\"gggg\",\"quantity\":1,\"price\":1000,\"subtotal\":1000,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-09 06:26:39', 0, NULL, NULL, NULL, '2025-12-09 06:26:39', 'K-Street'),
(33, 5, 1000.00, 1000.00, 0, 0.00, 'Dine In', 'gggg', '[{\"id\":29,\"name\":\"gggg\",\"quantity\":1,\"price\":1000,\"subtotal\":1000,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-09 07:37:59', 1, ' cc', 'greenhavenhelpdesk@gmail.com (Authorized by: melivojaymark2003@gmail.com)', '2025-12-09 15:08:32', '2025-12-09 15:08:32', 'K-Street'),
(34, 1, 500.00, 204.00, 0, 296.00, 'Dine In', 'Bibimbab', '[{\"id\":11,\"name\":\"Bibimbab\",\"quantity\":1,\"price\":204,\"subtotal\":204,\"selectedAddons\":[{\"id\":23,\"name\":\"Bulgogi Rice\",\"category\":\"Food\",\"price\":\"45.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:42:00.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"RICE\",\"branch\":\"main\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-09 10:19:45', 0, NULL, NULL, NULL, '2025-12-09 10:19:45', 'main'),
(35, 1, 500.00, 159.00, 0, 341.00, 'Dine In', 'Bibimbab', '[{\"id\":11,\"name\":\"Bibimbab\",\"quantity\":1,\"price\":159,\"subtotal\":159,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-09 15:53:20', 0, NULL, NULL, NULL, '2025-12-09 15:53:20', 'main'),
(36, 1, 23000.00, 22847.20, 1, 152.80, 'Dine In', '[UPGRADED] Samgyup on the go overload, [UPGRADED] Beef Bulgogi Overload', '[{\"id\":16,\"name\":\"[UPGRADED] Samgyup on the go overload\",\"quantity\":73,\"price\":250,\"subtotal\":18250,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":17,\"name\":\"Samgyup on the go overload\",\"category\":\"Food\",\"price\":\"250.00\",\"image\":\"https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CzTFXWhYeRQQ7kNvwFK9TpC&_nc_oc=AdlJdK1IoszYGJhVK7nXm5ttMj5bLuU9FGuJ55EUjWeAxBqzXgsX3bhJ4k2A3SPYcPQ&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=zP57WOG8xPgJckQoLUn65A&oh=00_Afhi2-G1tHouD2M7qtCp12nnvmUBpFoK7pfEm61wyKVFig&oe=692D89AE\",\"created_at\":\"2025-11-27T04:25:23.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"SAMGYUP\",\"branch\":\"main\"},\"specialInstructions\":\"\"},{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":61,\"price\":169,\"subtotal\":10309,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\",\"branch\":\"main\"}],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-10 04:34:17', 0, NULL, NULL, NULL, '2025-12-10 04:34:17', 'main'),
(37, 5, 1000.00, 1000.00, 0, 0.00, 'Dine In', 'gggg', '[{\"id\":29,\"name\":\"gggg\",\"quantity\":1,\"price\":1000,\"subtotal\":1000,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-10 05:48:34', 0, NULL, NULL, NULL, '2025-12-10 05:48:34', 'K-Street'),
(38, 1, 1000.00, 179.00, 0, 821.00, 'Dine In', 'Beef Bulgogi', '[{\"id\":14,\"name\":\"Beef Bulgogi\",\"quantity\":1,\"price\":179,\"subtotal\":179,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:39:59.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\",\"branch\":\"main\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-10 08:19:16', 0, NULL, NULL, NULL, '2025-12-10 08:19:16', 'main'),
(39, 1, 500.00, 180.00, 0, 320.00, 'Dine In', 'Korean Boneless Chicken', '[{\"id\":9,\"name\":\"Korean Boneless Chicken\",\"quantity\":1,\"price\":180,\"subtotal\":180,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-10 08:22:31', 0, NULL, NULL, NULL, '2025-12-10 08:22:31', 'main'),
(40, 1, 500.00, 180.00, 0, 320.00, 'Dine In', 'Korean Boneless Chicken', '[{\"id\":9,\"name\":\"Korean Boneless Chicken\",\"quantity\":1,\"price\":180,\"subtotal\":180,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-10 08:24:19', 1, 'asdas', 'vien', '2025-12-11 18:15:16', '2025-12-11 18:15:16', 'main'),
(41, 1, 500.00, 254.00, 0, 246.00, 'Dine In', 'Bibimbab', '[{\"id\":11,\"name\":\"Bibimbab\",\"quantity\":1,\"price\":254,\"subtotal\":254,\"selectedAddons\":[{\"id\":24,\"name\":\"K Chips\",\"category\":\"Food\",\"price\":\"95.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:42:23.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"K CHIPS\",\"branch\":\"main\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash', '2025-12-10 08:26:22', 1, 'asdasdasd', 'vien', '2025-12-11 18:13:03', '2025-12-11 18:13:03', 'main'),
(42, 1, 500.00, 169.00, 0, 331.00, 'Take-Out', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":169,\"subtotal\":169,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:39:59\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\",\"branch\":\"main\"}],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26 23:41:08\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-12 05:44:38', 0, NULL, NULL, NULL, '2025-12-12 05:44:38', 'main'),
(43, 1, 500.00, 169.00, 0, 331.00, 'Take-Out', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":169,\"subtotal\":169,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:39:59\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\",\"branch\":\"main\"}],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26 23:41:08\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-12 05:44:38', 0, NULL, NULL, NULL, '2025-12-12 05:44:38', 'main'),
(44, 1, 500.00, 149.00, 0, 351.00, 'Take-Out', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26 23:41:08\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-12 05:45:07', 0, NULL, NULL, NULL, '2025-12-12 05:45:07', 'main'),
(45, 1, 500.00, 149.00, 0, 351.00, 'Take-Out', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26 23:41:08\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Cash', '2025-12-12 05:45:07', 0, NULL, NULL, NULL, '2025-12-12 05:45:07', 'main'),
(46, 1, 500.00, 159.20, 1, 340.80, 'Take-Out', '[UPGRADED] Bibimbab Overload', '[{\"id\":11,\"name\":\"[UPGRADED] Bibimbab Overload\",\"quantity\":1,\"price\":199,\"subtotal\":199,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":12,\"name\":\"Bibimbab Overload\",\"category\":\"Food\",\"price\":\"199.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kVnvMu83Ee4Q7kNvwFbFlZQ&_nc_oc=AdkcmQgDz4Xhl_cK6nBlBJGHXz0C7MBjzezfanG-WJb5Bs7fNmTvzD5DyxKHHxVaBRA&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=KX9FCayAogz_27bq0YRXSw&oh=00_AfgtxOm-czBepuXJrLfxtDK3AhQriQLoT-0wj-TIy0mnOg&oe=692D06B1\",\"created_at\":\"2025-11-26 23:32:44\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BIBIMBAB\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Grab', '2025-12-12 05:57:59', 0, NULL, NULL, NULL, '2025-12-12 05:57:59', 'main'),
(47, 1, 500.00, 159.20, 1, 340.80, 'Take-Out', '[UPGRADED] Bibimbab Overload', '[{\"id\":11,\"name\":\"[UPGRADED] Bibimbab Overload\",\"quantity\":1,\"price\":199,\"subtotal\":199,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":12,\"name\":\"Bibimbab Overload\",\"category\":\"Food\",\"price\":\"199.00\",\"image\":\"https://scontent.fcrk1-3.fna.fbcdn.net/v/t39.30808-6/561635971_122118412736990298_7601191258947981719_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kVnvMu83Ee4Q7kNvwFbFlZQ&_nc_oc=AdkcmQgDz4Xhl_cK6nBlBJGHXz0C7MBjzezfanG-WJb5Bs7fNmTvzD5DyxKHHxVaBRA&_nc_zt=23&_nc_ht=scontent.fcrk1-3.fna&_nc_gid=KX9FCayAogz_27bq0YRXSw&oh=00_AfgtxOm-czBepuXJrLfxtDK3AhQriQLoT-0wj-TIy0mnOg&oe=692D06B1\",\"created_at\":\"2025-11-26 23:32:44\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BIBIMBAB\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Grab', '2025-12-12 05:57:59', 0, NULL, NULL, NULL, '2025-12-12 05:57:59', 'main'),
(48, 1, 500.00, 204.25, 1, 295.75, 'Dine In', 'Samgyup on the go', '[{\"id\":16,\"name\":\"Samgyup on the go\",\"quantity\":1,\"price\":215,\"subtotal\":215,\"selectedAddons\":[{\"id\":21,\"name\":\"Plain Rice\",\"category\":\"Food\",\"price\":\"15.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:41:22\",\"description_type\":\"k-street add sides\",\"product_code\":\"RICE\",\"branch\":\"main\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-12 05:58:39', 0, NULL, NULL, NULL, '2025-12-12 05:58:39', 'main'),
(49, 1, 500.00, 254.00, 0, 246.00, 'Dine In', 'Bibimbab', '[{\"id\":11,\"name\":\"Bibimbab\",\"quantity\":1,\"price\":254,\"subtotal\":254,\"selectedAddons\":[{\"id\":24,\"name\":\"K Chips\",\"category\":\"Food\",\"price\":\"95.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:42:23\",\"description_type\":\"k-street add sides\",\"product_code\":\"K CHIPS\",\"branch\":\"main\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-12 06:02:22', 0, NULL, NULL, NULL, '2025-12-12 06:02:22', 'main');
INSERT INTO `orders` (`id`, `userId`, `paidAmount`, `total`, `discountApplied`, `changeAmount`, `orderType`, `productNames`, `items`, `payment_method`, `created_at`, `is_void`, `void_reason`, `voided_by`, `voided_at`, `updated_at`, `branch`) VALUES
(50, 1, 1000.00, 830.00, 0, 170.00, 'Dine In', 'Samgyup on the go, [UPGRADED] Samgyup on the go overload', '[{\"id\":16,\"name\":\"Samgyup on the go\",\"quantity\":1,\"price\":400,\"subtotal\":400,\"selectedAddons\":[{\"id\":21,\"name\":\"Plain Rice\",\"category\":\"Food\",\"price\":\"15.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:41:22\",\"description_type\":\"k-street add sides\",\"product_code\":\"RICE\",\"branch\":\"main\"},{\"id\":22,\"name\":\"Bulgogi Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:41:42\",\"description_type\":\"k-street add sides\",\"product_code\":\"BULGOGI SAUCE\",\"branch\":\"main\"},{\"id\":23,\"name\":\"Bulgogi Rice\",\"category\":\"Food\",\"price\":\"45.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:42:00\",\"description_type\":\"k-street add sides\",\"product_code\":\"RICE\",\"branch\":\"main\"},{\"id\":24,\"name\":\"K Chips\",\"category\":\"Food\",\"price\":\"95.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:42:23\",\"description_type\":\"k-street add sides\",\"product_code\":\"K CHIPS\",\"branch\":\"main\"},{\"id\":25,\"name\":\"Hotpot Soup\",\"category\":\"Food\",\"price\":\"25.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:42:47\",\"description_type\":\"k-street add sides\",\"product_code\":\"SOUP\",\"branch\":\"main\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"},{\"id\":16,\"name\":\"[UPGRADED] Samgyup on the go overload\",\"quantity\":1,\"price\":430,\"subtotal\":430,\"selectedAddons\":[{\"id\":20,\"name\":\"Signiture rice\",\"category\":\"Food\",\"price\":\"45.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:41:02\",\"description_type\":\"k-street add sides\",\"product_code\":\"SIGNITURE RICE\",\"branch\":\"main\"},{\"id\":21,\"name\":\"Plain Rice\",\"category\":\"Food\",\"price\":\"15.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:41:22\",\"description_type\":\"k-street add sides\",\"product_code\":\"RICE\",\"branch\":\"main\"},{\"id\":24,\"name\":\"K Chips\",\"category\":\"Food\",\"price\":\"95.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:42:23\",\"description_type\":\"k-street add sides\",\"product_code\":\"K CHIPS\",\"branch\":\"main\"},{\"id\":25,\"name\":\"Hotpot Soup\",\"category\":\"Food\",\"price\":\"25.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:42:47\",\"description_type\":\"k-street add sides\",\"product_code\":\"SOUP\",\"branch\":\"main\"}],\"selectedUpgrade\":{\"id\":17,\"name\":\"Samgyup on the go overload\",\"category\":\"Food\",\"price\":\"250.00\",\"image\":\"https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CzTFXWhYeRQQ7kNvwFK9TpC&_nc_oc=AdlJdK1IoszYGJhVK7nXm5ttMj5bLuU9FGuJ55EUjWeAxBqzXgsX3bhJ4k2A3SPYcPQ&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=zP57WOG8xPgJckQoLUn65A&oh=00_Afhi2-G1tHouD2M7qtCp12nnvmUBpFoK7pfEm61wyKVFig&oe=692D89AE\",\"created_at\":\"2025-11-27 12:25:23\",\"description_type\":\"k-street upgrades\",\"product_code\":\"SAMGYUP\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-12 06:35:54', 0, NULL, NULL, NULL, '2025-12-12 06:35:54', 'main'),
(51, 4, 1000.00, 1000.00, 0, 0.00, 'Dine In', 'gggg', '[{\"id\":29,\"name\":\"gggg\",\"quantity\":1,\"price\":1000,\"subtotal\":1000,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash', '2025-12-12 12:15:12', 0, NULL, NULL, NULL, '2025-12-12 12:15:12', 'K-Street'),
(52, 4, 124123.00, 124123.00, 0, 0.00, 'Dine In', 'asdasdasd', '[{\"id\":31,\"name\":\"asdasdasd\",\"quantity\":1,\"price\":124123,\"subtotal\":124123,\"selectedAddons\":[{\"id\":34,\"name\":\"asdasd\",\"category\":\"Food\",\"price\":\"123123.00\",\"image\":\"asdasd\",\"created_at\":\"2025-12-12 20:22:09\",\"description_type\":\"k-street add sides\",\"product_code\":\"AADSDS\",\"branch\":\"K-Street\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-12 12:22:56', 0, NULL, NULL, NULL, '2025-12-12 12:22:56', 'K-Street'),
(53, 1, 1000.00, 149.00, 0, 851.00, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26T15:41:08.000Z\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-12 12:28:32', 0, NULL, NULL, NULL, '2025-12-12 12:28:32', 'main'),
(54, 1, 1000.00, 200.00, 0, 800.00, 'Dine In', 'Korean Boneless Chicken', '[{\"id\":9,\"name\":\"Korean Boneless Chicken\",\"quantity\":1,\"price\":200,\"subtotal\":200,\"selectedAddons\":[{\"id\":18,\"name\":\"Chogochujang Sauce\",\"category\":\"Food\",\"price\":\"20.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27 13:39:59\",\"description_type\":\"k-street add sides\",\"product_code\":\"CHOGO\",\"branch\":\"main\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash', '2025-12-12 13:22:43', 0, NULL, NULL, NULL, '2025-12-12 13:22:43', 'main'),
(55, 1, 1000.00, 119.20, 1, 880.80, 'Dine In', '[UPGRADED] Beef Bulgogi Overload', '[{\"id\":14,\"name\":\"[UPGRADED] Beef Bulgogi Overload\",\"quantity\":1,\"price\":149,\"subtotal\":149,\"selectedAddons\":[],\"selectedUpgrade\":{\"id\":13,\"name\":\"Beef Bulgogi Overload\",\"category\":\"Food\",\"price\":\"149.00\",\"image\":\"https://scontent.fcrk1-5.fna.fbcdn.net/v/t39.30808-6/560575829_122118412544990298_713504536235988920_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=3POsYcKcefAQ7kNvwHg3eVJ&_nc_oc=AdnTUI0VxZkkwXGWU7Rf_UhsKMS04gD2O902FwvE6vWVs5wrbVUQvEZ7Bji1Q6zbf3c&_nc_zt=23&_nc_ht=scontent.fcrk1-5.fna&_nc_gid=UH1LSEBfijxizSMBXz5Eqw&oh=00_AfjKsObrU-KRHrxKB9kmsU8w987gg1EthvoM9gDtqWsm1w&oe=692CE0D7\",\"created_at\":\"2025-11-26 23:41:08\",\"description_type\":\"k-street upgrades\",\"product_code\":\"BEEF BULGOGI\",\"branch\":\"main\"},\"specialInstructions\":\"\"}]', 'Gcash + Cash', '2025-12-13 15:12:55', 1, 'sdasd', 'Dev', '2025-12-13 23:20:01', '2025-12-13 15:20:01', 'main');

-- --------------------------------------------------------

--
-- Table structure for table `pin_attempts`
--

CREATE TABLE `pin_attempts` (
  `attempt_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `attempt_time` datetime DEFAULT current_timestamp(),
  `locked_until` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_status_log`
--

CREATE TABLE `store_status_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `action` enum('open','close') NOT NULL,
  `branch` varchar(100) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_status_log`
--

INSERT INTO `store_status_log` (`id`, `user_id`, `user_email`, `action`, `branch`, `timestamp`) VALUES
(1, 1, 'admin@example.com', 'open', 'main', '2025-12-03 08:47:39'),
(2, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-03 09:08:59'),
(3, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-03 09:12:17'),
(4, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-03 17:45:55'),
(5, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-03 17:46:08'),
(6, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-04 15:12:26'),
(7, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-04 15:12:29'),
(8, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-05 03:21:17'),
(9, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-05 03:21:19'),
(10, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-05 03:22:08'),
(11, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-05 03:22:22'),
(12, 5, 'greenhavenhelpdesk@gmail.com', 'open', 'K-Street', '2025-12-09 06:25:56'),
(13, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-09 17:17:16'),
(14, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-09 17:17:19'),
(15, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-10 07:27:23'),
(16, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-10 07:27:35'),
(17, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-10 08:19:23'),
(18, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-10 08:22:05'),
(19, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-10 14:07:22'),
(20, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-10 14:07:27'),
(21, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-10 14:07:30'),
(22, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-10 14:07:32'),
(23, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-10 14:28:59'),
(24, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-10 14:54:58'),
(25, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-11 18:17:04'),
(26, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-11 18:17:14'),
(27, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-12 05:43:19'),
(28, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-12 05:43:23'),
(29, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-12 05:43:52'),
(30, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-12 05:43:54'),
(31, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-12 05:49:27'),
(32, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-12 05:57:25'),
(33, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-12 05:57:33'),
(34, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-12 05:57:36'),
(35, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-12 05:57:40'),
(36, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-12 05:57:43'),
(37, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-12 05:58:26'),
(38, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-12 05:58:28'),
(39, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-12 06:02:10'),
(40, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-12 06:02:12'),
(41, 5, 'greenhavenhelpdesk@gmail.com', 'close', 'K-Street', '2025-12-12 06:11:26'),
(42, 5, 'greenhavenhelpdesk@gmail.com', 'open', 'K-Street', '2025-12-12 06:12:00'),
(43, 5, 'greenhavenhelpdesk@gmail.com', 'close', 'K-Street', '2025-12-12 06:12:28'),
(44, 4, 'melivojaymark2003@gmail.com', 'open', 'K-Street', '2025-12-12 12:11:52'),
(45, 4, 'melivojaymark2003@gmail.com', 'close', 'K-Street', '2025-12-12 12:12:07'),
(46, 4, 'melivojaymark2003@gmail.com', 'open', 'K-Street', '2025-12-12 12:14:40'),
(47, 4, 'melivojaymark2003@gmail.com', 'close', 'K-Street', '2025-12-12 12:16:26'),
(48, 4, 'melivojaymark2003@gmail.com', 'open', 'K-Street', '2025-12-12 12:16:27'),
(49, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-12 13:38:56'),
(50, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-12 13:39:06'),
(51, 1, 'melivojaymark61@gmail.com', 'close', 'main', '2025-12-13 17:03:39'),
(52, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-13 17:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `min_hours_to_pay` decimal(5,2) DEFAULT 4.00,
  `max_regular_hours` decimal(5,2) DEFAULT 8.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `min_hours_to_pay`, `max_regular_hours`, `created_at`, `updated_at`) VALUES
(1, 4.00, 8.00, '2025-12-13 08:21:43', '2025-12-13 08:21:43');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` enum('admin','manager','cashier') DEFAULT 'cashier',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `branch` varchar(50) DEFAULT 'main',
  `void_pin` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `created_at`, `role`, `status`, `branch`, `void_pin`) VALUES
(1, 'melivojaymark61@gmail.com', 'Dev', '$2a$10$y50HAJzpM/GKfrjn4fGlZuLSPCvnNuj00LIH9CYW3yH7aRGwHO.GW', '2025-09-28 16:40:45', 'manager', 'Active', 'main', '$2a$10$fECNcyeH1braeoqjYrUMUuB/fP0anH/Ji6jGZjMQbFqLsnPudmhqm'),
(2, 'jaymarkmelivo@yahoo.com', NULL, '$2a$10$5fxJf4kNNMjHTk5ZNe6h5uT64zzygA2.qtuoscK4htVZZgNo0txji', '2025-10-01 07:10:53', 'cashier', 'Active', 'main', NULL),
(3, 'keilahacob26@gmail.com', '', '$2a$10$95F1QK9OsdyrRDFSUwclk.4GyjkwjeWTvR.SmVOrzryWOPvC44aA2', '2025-10-01 09:19:39', 'manager', 'Active', 'K-Street', '$2y$10$8TvylhN8sYGJo7QHuJo/Y.TA.enrk763lOeGroHMZsvkuGum0El4W'),
(4, 'melivojaymark2003@gmail.com', 'JayMark', '$2a$10$Snj3E8kFWSnChGr8fXURk.1DpJBb3s6Yd87DNnScldf49Ju58sHAy', '2025-12-01 06:44:30', 'manager', 'Active', 'K-Street', '$2a$10$luKQPya9Wsa5D7CBYwP6duHNkJCJqYLuv2XpzIfD3.11WIdZNU8gi'),
(5, 'greenhavenhelpdesk@gmail.com', 'JMM', '$2a$10$LPfDLSpPSHiUQNAf7pPtuO4NLKVIo1hinwyqiYafrf0JO2G5g.9WG', '2025-12-01 08:11:24', 'cashier', 'Active', 'K-Street', NULL),
(6, 'vien@gmail.com', 'vien', '$2a$10$sqG8WAEYc5OJdhjZOk8HYuH5QnMFQRuGJR.acukhB4xBjE.7WLNsu', '2025-12-04 14:35:35', 'admin', 'Active', 'main', NULL),
(7, 'aass@gmail.com', 'asdsad', '$2y$10$txhTfIvWYGMJdmKWiqKByePOO98a8jmbX8glOeDPHS1XnERwL4gOq', '2025-12-12 16:09:39', 'manager', 'Active', 'main', '$2y$10$hObANAnGN0v0Wh9H7Q4i0uqb/Es5SWFtgTyLrfeOxgrqxe/EdQsF.');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_userId` (`userId`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `pin_attempts`
--
ALTER TABLE `pin_attempts`
  ADD PRIMARY KEY (`attempt_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_attempt_time` (`attempt_time`);

--
-- Indexes for table `store_status_log`
--
ALTER TABLE `store_status_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `pin_attempts`
--
ALTER TABLE `pin_attempts`
  MODIFY `attempt_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_status_log`
--
ALTER TABLE `store_status_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD CONSTRAINT `attendance_logs_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `pin_attempts`
--
ALTER TABLE `pin_attempts`
  ADD CONSTRAINT `pin_attempts_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
