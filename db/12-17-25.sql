-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 16, 2025 at 06:51 PM
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
(6, 'asdasd', 'melivojaymark61@gmail.com', NULL, 'info', 'asdasdasd', '2025-12-09 04:45:28', '2025-12-09 04:45:28', 'main', 0);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('on-duty','completed','absent') DEFAULT 'on-duty',
  `work_hours` decimal(5,2) DEFAULT 0.00,
  `ot_hours` decimal(5,2) DEFAULT 0.00,
  `late_hours` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `employee_id`, `date`, `time_in`, `time_out`, `status`, `work_hours`, `ot_hours`, `late_hours`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-12-10', '00:18:38', NULL, 'on-duty', 0.00, 0.00, 0.00, '2025-12-10 15:11:02', '2025-12-10 16:18:38');

-- --------------------------------------------------------

--
-- Table structure for table `cashout`
--

CREATE TABLE `cashout` (
  `id` int(11) NOT NULL,
  `cashier_session_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('withdrawal','deposit') NOT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `edited_by` varchar(255) DEFAULT NULL,
  `edited_at` timestamp NULL DEFAULT NULL,
  `edit_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cashout`
--

INSERT INTO `cashout` (`id`, `cashier_session_id`, `user_id`, `branch`, `amount`, `type`, `reason`, `created_at`, `edited_by`, `edited_at`, `edit_reason`) VALUES
(4, NULL, 6, 'main', 1.00, 'deposit', 'asdasd', '2025-12-16 17:44:07', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(255) NOT NULL,
  `category_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `category_name`) VALUES
(1, 'Main'),
(2, 'Bundle'),
(3, 'Drinks'),
(4, 'Sides');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `daily_rate` decimal(10,2) DEFAULT 0.00,
  `pin` varchar(255) NOT NULL,
  `branch` varchar(100) DEFAULT 'main',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `username`, `email`, `address`, `contact_number`, `daily_rate`, `pin`, `branch`, `created_at`, `updated_at`) VALUES
(1, 'Jay mark Mark', 'JMM', 'melivojaymark61@gmail.com', 'Ramos, Tarlac', '09289242247', 500.00, '$2a$10$rCQveRrWtzIL3giWdPJMlO1QBptpvX3j/IVR7rSykvKPqlMhq3nZO', 'main', '2025-12-10 15:10:54', '2025-12-10 15:10:54');

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
(18, 'ASD', 'asd', 'Raw Material', 'asd', 'pcs', 2.000, 50, 0.000, 0.00, '', '2025-12-09 13:42:59', '2025-12-09 13:42:59', 100.02, 'main');

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
(16, 'Samgyup on the go', 'Food', 200.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CzTFXWhYeRQQ7kNvwFK9TpC&_nc_oc=AdlJdK1IoszYGJhVK7nXm5ttMj5bLuU9FGuJ55EUjWeAxBqzXgsX3bhJ4k2A3SPYcPQ&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=zP57WOG8xPgJckQoLUn65A&oh=00_Afhi2-G1tHouD2M7qtCp12nnvmUBpFoK7pfEm61wyKVFig&oe=692D89AE', '2025-11-27 04:24:47', 'k-street food', 'SAMGYUP', 'main'),
(17, 'Samgyup on the go overload', 'Food', 250.00, 'https://scontent.fcrk1-4.fna.fbcdn.net/v/t39.30808-6/560617965_122118412538990298_7590623155361069859_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=CzTFXWhYeRQQ7kNvwFK9TpC&_nc_oc=AdlJdK1IoszYGJhVK7nXm5ttMj5bLuU9FGuJ55EUjWeAxBqzXgsX3bhJ4k2A3SPYcPQ&_nc_zt=23&_nc_ht=scontent.fcrk1-4.fna&_nc_gid=zP57WOG8xPgJckQoLUn65A&oh=00_Afhi2-G1tHouD2M7qtCp12nnvmUBpFoK7pfEm61wyKVFig&oe=692D89AE', '2025-11-27 04:25:23', 'k-street upgrades', 'SAMGYUP', 'main'),
(18, 'Chogochujang Sauce', 'Food', 20.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E', '2025-11-27 05:39:59', 'k-street add sides', 'CHOGO', 'main'),
(19, 'Kimchi', 'Food', 59.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E', '2025-11-27 05:40:28', 'k-street add sides', 'KIMCHI', 'main'),
(21, 'Plain Rice', 'Food', 15.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E', '2025-11-26 21:41:22', 'k-street add sides', 'RICE', 'main'),
(22, 'Bulgogi Sauce', 'Food', 20.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E', '2025-11-26 21:41:42', 'k-street add sides', 'BULGOGI SAUCE', 'main'),
(23, 'Bulgogi Rice', 'Food', 45.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E', '2025-11-26 21:42:00', 'k-street add sides', 'RICE', 'main'),
(24, 'K Chips', 'Food', 95.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E', '2025-11-26 21:42:23', 'k-street add sides', 'K CHIPS', 'main'),
(25, 'Hotpot Soup', 'Food', 25.00, 'https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E', '2025-11-26 21:42:47', 'k-street add sides', 'SOUP', 'main'),
(29, 'gggg', 'Bundle', 1000.00, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA7AMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAECAwUGB//EAD0QAAIBAwIEAgcFBgUFAAAAAAECAwAEERIhBRMxQVFhBiIyQnGBkSNSU6HBBxQWsdHhFSRDgpIXVGJy8P/EABoBAAMBAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAoEQACAgEDBQABBAMAAAAAAAAAAQIRIQMSEwQFMUFRgWHR8PEUInH/2gAMAwEAAhEDEQA/AOGxSqzHX40xF', '2025-12-03 10:31:46', 'k-street food', 'HHHH', 'main');

-- --------------------------------------------------------

--
-- Table structure for table `notification_logs`
--

CREATE TABLE `notification_logs` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `message` text NOT NULL,
  `notification_type` varchar(50) DEFAULT 'ping',
  `status` varchar(20) DEFAULT 'pending',
  `branch` varchar(100) DEFAULT 'main',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(40, 1, 500.00, 180.00, 0, 320.00, 'Dine In', 'Korean Boneless Chicken', '[{\"id\":9,\"name\":\"Korean Boneless Chicken\",\"quantity\":1,\"price\":180,\"subtotal\":180,\"selectedAddons\":[],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Cash', '2025-12-10 08:24:19', 0, NULL, NULL, NULL, '2025-12-10 08:24:19', 'main'),
(41, 1, 500.00, 254.00, 0, 246.00, 'Dine In', 'Bibimbab', '[{\"id\":11,\"name\":\"Bibimbab\",\"quantity\":1,\"price\":254,\"subtotal\":254,\"selectedAddons\":[{\"id\":24,\"name\":\"K Chips\",\"category\":\"Food\",\"price\":\"95.00\",\"image\":\"https://scontent.fcrk1-1.fna.fbcdn.net/v/t39.30808-6/569617229_122120428976990298_6542263649033165128_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Hk0PgKxTnJIQ7kNvwHs1VZb&_nc_oc=AdmR1lMm0OQQZ3NVc9xwRTyvOOWtH-iVoPNt7hHRHNkwT_5umYg5OIaXIWv_ssWr9sk&_nc_zt=23&_nc_ht=scontent.fcrk1-1.fna&_nc_gid=c8EWDDuJPF3V7XxPmfBSkw&oh=00_AfghVN_Rf0k28J9rDHBFzlfFrcOKvQTA3b1uREm_EhJ94g&oe=692DA50E\",\"created_at\":\"2025-11-27T05:42:23.000Z\",\"description_type\":\"k-street add sides\",\"product_code\":\"K CHIPS\",\"branch\":\"main\"}],\"selectedUpgrade\":null,\"specialInstructions\":\"\"}]', 'Gcash', '2025-12-10 08:26:22', 0, NULL, NULL, NULL, '2025-12-10 08:26:22', 'main');

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
(24, 1, 'melivojaymark61@gmail.com', 'open', 'main', '2025-12-10 14:54:58');

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
(1, 'melivojaymark61@gmail.com', 'Dev', '$2a$12$1rriLmYjgfY6wtUVKxKcleRTEZFm4wjKoJnxZQ0jvjdq5/RAjhobC', '2025-09-28 16:40:45', 'manager', 'Active', 'main', '$2a$10$fECNcyeH1braeoqjYrUMUuB/fP0anH/Ji6jGZjMQbFqLsnPudmhqm'),
(2, 'jaymarkmelivo@yahoo.com', NULL, '$2a$10$5fxJf4kNNMjHTk5ZNe6h5uT64zzygA2.qtuoscK4htVZZgNo0txji', '2025-10-01 07:10:53', 'cashier', 'Active', 'main', NULL),
(3, 'keilahacob26@gmail.com', NULL, '$2a$10$95F1QK9OsdyrRDFSUwclk.4GyjkwjeWTvR.SmVOrzryWOPvC44aA2', '2025-10-01 09:19:39', 'cashier', 'Active', 'K-Street', NULL),
(4, 'melivojaymark2003@gmail.com', 'JayMark', '$2a$12$1rriLmYjgfY6wtUVKxKcleRTEZFm4wjKoJnxZQ0jvjdq5/RAjhobC', '2025-12-01 06:44:30', 'manager', 'Active', 'K-Street', '$2a$10$luKQPya9Wsa5D7CBYwP6duHNkJCJqYLuv2XpzIfD3.11WIdZNU8gi'),
(5, 'greenhavenhelpdesk@gmail.com', 'JMM', '$2a$10$LPfDLSpPSHiUQNAf7pPtuO4NLKVIo1hinwyqiYafrf0JO2G5g.9WG', '2025-12-01 08:11:24', 'cashier', 'Active', 'K-Street', NULL),
(6, 'vien@gmail.com', 'vien', '$2a$12$1rriLmYjgfY6wtUVKxKcleRTEZFm4wjKoJnxZQ0jvjdq5/RAjhobC', '2025-12-04 14:35:35', 'admin', 'Active', 'main', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_date` (`employee_id`,`date`),
  ADD KEY `idx_attendance_employee` (`employee_id`),
  ADD KEY `idx_attendance_date` (`date`);

--
-- Indexes for table `cashout`
--
ALTER TABLE `cashout`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cashier_session_id` (`cashier_session_id`),
  ADD KEY `idx_branch` (`branch`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_session` (`user_id`,`cashier_session_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_employee_branch` (`branch`);

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
-- Indexes for table `notification_logs`
--
ALTER TABLE `notification_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notification_employee` (`employee_id`),
  ADD KEY `idx_notification_branch` (`branch`),
  ADD KEY `idx_notification_created` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_userId` (`userId`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `store_status_log`
--
ALTER TABLE `store_status_log`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `cashout`
--
ALTER TABLE `cashout`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `notification_logs`
--
ALTER TABLE `notification_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `store_status_log`
--
ALTER TABLE `store_status_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cashout`
--
ALTER TABLE `cashout`
  ADD CONSTRAINT `cashout_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_logs`
--
ALTER TABLE `notification_logs`
  ADD CONSTRAINT `notification_logs_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
