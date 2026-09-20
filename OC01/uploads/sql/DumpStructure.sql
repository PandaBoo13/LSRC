-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: test
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id_account` int NOT NULL AUTO_INCREMENT,
  `username` varchar(225) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(225) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_account`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_account_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `account_permission`
--

DROP TABLE IF EXISTS `account_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_permission` (
  `id_account_permission` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_account_permission`),
  UNIQUE KEY `unique_account_permission` (`account_id`,`permission_id`),
  KEY `fk_ap_permission` (`permission_id`),
  KEY `idx_ap_account` (`account_id`),
  KEY `idx_ap_active` (`is_active`),
  CONSTRAINT `fk_ap_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `fk_ap_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id_permission`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_id` (`account_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `course_id` int NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cart_course` (`cart_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `cart_item_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_item_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `parent_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_active` (`is_active`),
  KEY `idx_name_parent` (`name`,`parent_id`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chapter`
--

DROP TABLE IF EXISTS `chapter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapter` (
  `id_chapter` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `order_index` int NOT NULL DEFAULT '0',
  `course_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chapter`),
  KEY `idx_chapter_course` (`course_id`),
  KEY `idx_chapter_order` (`course_id`,`order_index`),
  CONSTRAINT `fk_chapter_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `id_course` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh bìa khóa học',
  `level` enum('ADVANCED','ALL_LEVELS','BEGINNER','INTERMEDIATE') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `old_price` decimal(10,2) DEFAULT NULL COMMENT 'Giá gốc trước khi giảm',
  `is_free` tinyint(1) DEFAULT '0',
  `has_certificate` tinyint(1) DEFAULT '0',
  `access_period` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Lifetime' COMMENT 'Thời gian truy cập',
  `outcomes` json DEFAULT NULL COMMENT 'Danh sách mục tiêu đạt được',
  `status` enum('ARCHIVED','DRAFT','PUBLISHED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_type` enum('LIVE','SELF_PACED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructor_id` int NOT NULL COMMENT 'Giảng viên',
  `category_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Danh mục',
  `published_at` timestamp NULL DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_course`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_course_slug` (`slug`),
  KEY `idx_course_status` (`status`),
  KEY `idx_course_level` (`level`),
  KEY `idx_course_instructor` (`instructor_id`),
  KEY `idx_course_category` (`category_id`),
  KEY `idx_course_deleted` (`deleted_at`),
  KEY `idx_course_published` (`status`,`published_at`),
  KEY `idx_course_title` (`title`),
  KEY `idx_course_price` (`price`),
  KEY `idx_course_is_free` (`is_free`),
  CONSTRAINT `fk_course_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_course_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `user` (`id_user`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_prerequisite`
--

DROP TABLE IF EXISTS `course_prerequisite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_prerequisite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `prerequisite_course_id` int NOT NULL,
  `is_required` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_prerequisite` (`course_id`,`prerequisite_course_id`),
  KEY `prerequisite_course_id` (`prerequisite_course_id`),
  CONSTRAINT `course_prerequisite_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `course_prerequisite_ibfk_2` FOREIGN KEY (`prerequisite_course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_progress`
--

DROP TABLE IF EXISTS `course_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrollment_id` int DEFAULT NULL,
  `total_lessons` int DEFAULT '0',
  `completed_lessons` int DEFAULT '0',
  `progress_percentage` decimal(5,2) DEFAULT '0.00',
  `total_time_spent` int DEFAULT '0',
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `status` enum('COMPLETED','IN_PROGRESS','NOT_STARTED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_course_progress` (`account_id`,`course_id`),
  UNIQUE KEY `UKbwfipgbrhvhcvrkhwfh3bk1as` (`account_id`,`course_id`),
  KEY `course_id` (`course_id`),
  KEY `FKeuvbnatsbkd8dqj07oee2nxxn` (`enrollment_id`),
  CONSTRAINT `course_progress_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `course_progress_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `FKeuvbnatsbkd8dqj07oee2nxxn` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment` (`id_enrollment`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enrollment`
--

DROP TABLE IF EXISTS `enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment` (
  `id_enrollment` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `account_id` int NOT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `progress` decimal(5,2) DEFAULT '0.00' COMMENT 'Tiến độ học (%)',
  `status` enum('ACTIVE','ARCHIVED','COMPLETED','DROPPED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `enrollment_type` enum('ENROLLED','WAITING') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('FAILED','FREE','PAID','PENDING','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Phương thức thanh toán',
  `payment_amount` decimal(10,2) DEFAULT NULL COMMENT 'Số tiền đã thanh toán',
  `payment_date` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm thanh toán',
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã giao dịch',
  PRIMARY KEY (`id_enrollment`),
  UNIQUE KEY `unique_enrollment` (`course_id`,`account_id`),
  KEY `idx_enrollment_account` (`account_id`),
  KEY `idx_enrollment_course` (`course_id`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_enrollment_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollment_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT '0.00',
  `invoice_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lecturer_certificate`
--

DROP TABLE IF EXISTS `lecturer_certificate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecturer_certificate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lecturer_profile_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuing_organization` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `credential_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificate_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lecturer_profile_id` (`lecturer_profile_id`),
  CONSTRAINT `lecturer_certificate_ibfk_1` FOREIGN KEY (`lecturer_profile_id`) REFERENCES `lecturer_profile` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lecturer_profile`
--

DROP TABLE IF EXISTS `lecturer_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecturer_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `specialties` json DEFAULT NULL,
  `expertise` text COLLATE utf8mb4_unicode_ci,
  `experience_years` int DEFAULT '0',
  `education` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `lecturer_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lesson`
--

DROP TABLE IF EXISTS `lesson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson` (
  `id_lesson` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `duration` int DEFAULT '0' COMMENT 'Tổng thời lượng (giây)',
  `order_index` int NOT NULL DEFAULT '0',
  `is_free_preview` tinyint(1) DEFAULT '0',
  `settings` json DEFAULT NULL,
  `status` enum('DRAFT','HIDDEN','PUBLISHED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chapter_id` int DEFAULT NULL,
  `course_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_lesson`),
  KEY `idx_lesson_chapter` (`chapter_id`),
  KEY `idx_lesson_order` (`chapter_id`,`order_index`),
  KEY `idx_lesson_course` (`course_id`),
  KEY `idx_lesson_status` (`status`),
  CONSTRAINT `fk_lesson_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapter` (`id_chapter`) ON DELETE CASCADE,
  CONSTRAINT `fk_lesson_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lesson_progress`
--

DROP TABLE IF EXISTS `lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_progress` (
  `id_progress` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `account_id` int NOT NULL COMMENT 'FK tới account',
  `enrollment_id` int NOT NULL COMMENT 'FK tới enrollment',
  `course_id` int NOT NULL,
  `status` enum('COMPLETED','IN_PROGRESS','NOT_STARTED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `progress_percentage` decimal(5,2) DEFAULT '0.00' COMMENT 'Tiến độ 0-100%',
  `time_spent` int DEFAULT '0' COMMENT 'Tổng thời gian đã học (giây)',
  `score` decimal(5,2) DEFAULT NULL,
  `max_score` decimal(5,2) DEFAULT NULL,
  `attempts` int DEFAULT '1' COMMENT 'Số lần thử',
  `is_passed` tinyint(1) DEFAULT '0' COMMENT 'Đạt yêu cầu',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú của học viên',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_progress`),
  UNIQUE KEY `unique_lesson_progress` (`lesson_id`,`account_id`),
  UNIQUE KEY `UKqrqv18ix4bmmflwi85g6d59xw` (`account_id`,`lesson_id`,`enrollment_id`),
  KEY `idx_progress_account` (`account_id`),
  KEY `idx_progress_enrollment` (`enrollment_id`),
  KEY `idx_progress_course` (`course_id`),
  KEY `idx_progress_course_account` (`course_id`,`account_id`),
  KEY `idx_progress_status` (`status`),
  CONSTRAINT `fk_progress_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment` (`id_enrollment`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id_lesson`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lesson_resource`
--

DROP TABLE IF EXISTS `lesson_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_resource` (
  `id_resource` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `resource_type` enum('AUDIO','DOCUMENT','IMAGE','LINK','OTHER','PDF','SCORM','SLIDE','VIDEO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `file_format` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT '0',
  `order_index` int NOT NULL DEFAULT '0',
  `is_required` tinyint(1) DEFAULT '1',
  `status` enum('ERROR','PROCESSING','READY','UPLOADING') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_resource`),
  KEY `idx_resource_lesson` (`lesson_id`),
  KEY `idx_resource_order` (`lesson_id`,`order_index`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_resource_status` (`status`),
  CONSTRAINT `fk_resource_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id_lesson`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `course_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('CANCELLED','FAILED','PAID','PENDING') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `payment_method` enum('BANK_TRANSFER','CARD','MOMO','PAYPAL','STRIPE','VNPAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('CANCELLED','FAILED','PENDING','SUCCESS') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response` text COLLATE utf8mb4_unicode_ci,
  `payment_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_log`
--

DROP TABLE IF EXISTS `payment_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int DEFAULT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_data` text COLLATE utf8mb4_unicode_ci,
  `response_data` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payment_id` (`payment_id`),
  CONSTRAINT `payment_log_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `id_permission` int NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_permission`),
  UNIQUE KEY `permission_name` (`permission_name`),
  KEY `idx_resource_action` (`resource`,`action`),
  KEY `idx_is_default` (`is_default`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `id_question` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung câu hỏi',
  `question_type` enum('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','SHORT_ANSWER') COLLATE utf8mb4_unicode_ci DEFAULT 'SINGLE_CHOICE',
  `options` json DEFAULT NULL COMMENT 'Mảng lựa chọn: ["A", "B", "C", "D"]',
  `correct_answer` json DEFAULT NULL COMMENT 'Mảng đáp án đúng: ["A"] hoặc ["A","C"]',
  `points` decimal(5,2) DEFAULT '1.00',
  `order_index` int DEFAULT '0',
  `explanation` text COLLATE utf8mb4_unicode_ci COMMENT 'Giải thích đáp án',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_question`),
  KEY `idx_quiz_order` (`quiz_id`,`order_index`),
  CONSTRAINT `question_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id_quiz`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quiz`
--

DROP TABLE IF EXISTS `quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz` (
  `id_quiz` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL COMMENT 'Quiz thuộc khóa học nào',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `passing_score` decimal(5,2) DEFAULT '80.00',
  `time_limit` int DEFAULT '15' COMMENT 'Thời gian (phút)',
  `max_attempts` int DEFAULT '3' COMMENT 'Số lần làm tối đa',
  `shuffle_questions` tinyint(1) DEFAULT '0' COMMENT 'Xáo trộn câu hỏi',
  `show_result_immediately` tinyint(1) DEFAULT '1' COMMENT 'Hiện kết quả ngay',
  `status` enum('DRAFT','PUBLISHED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_quiz`),
  KEY `idx_course` (`course_id`),
  CONSTRAINT `quiz_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quiz_attempt`
--

DROP TABLE IF EXISTS `quiz_attempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempt` (
  `id_attempt` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `account_id` int NOT NULL,
  `enrollment_id` int DEFAULT NULL,
  `course_id` int NOT NULL,
  `score` decimal(5,2) DEFAULT '0.00',
  `max_score` decimal(5,2) DEFAULT '100.00',
  `passing_score` decimal(5,2) DEFAULT '80.00',
  `is_passed` tinyint(1) DEFAULT '0',
  `attempt_number` int DEFAULT '1',
  `answers` json DEFAULT NULL COMMENT 'Câu trả lời của học viên',
  `time_spent` int DEFAULT '0' COMMENT 'Thời gian làm bài (giây)',
  `started_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_attempt`),
  KEY `idx_quiz` (`quiz_id`),
  KEY `idx_account` (`account_id`),
  KEY `idx_course` (`course_id`),
  KEY `FK1mfvh50tb8kir4uvilp6btaaw` (`enrollment_id`),
  CONSTRAINT `FK1mfvh50tb8kir4uvilp6btaaw` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollment` (`id_enrollment`),
  CONSTRAINT `fk_attempt_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `fk_attempt_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `fk_attempt_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id_quiz`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `token_hash` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_refresh_token_account` (`account_id`),
  CONSTRAINT `fk_refresh_token_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `id_review` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_review`),
  UNIQUE KEY `unique_review` (`course_id`,`user_id`),
  KEY `idx_review_course` (`course_id`),
  KEY `idx_review_user` (`user_id`),
  KEY `idx_review_rating` (`rating`),
  CONSTRAINT `fk_review_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `review_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id_role` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_id` int NOT NULL,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `account_id` (`account_id`),
  CONSTRAINT `fk_user_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`),
  CONSTRAINT `FKc3b4xfbq6rbkkrddsdum8t5f0` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `course_id` int NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`account_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 12:20:04
