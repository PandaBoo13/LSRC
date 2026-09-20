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
  `username` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(225) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_account`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_account_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id_audit` bigint NOT NULL AUTO_INCREMENT,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại đối tượng: COURSE, LESSON, CHAPTER, EXAM, QUESTION, ENROLLMENT, USER, CATEGORY...',
  `entity_id` int DEFAULT NULL COMMENT 'ID của đối tượng bị tác động (NULL nếu không có)',
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hành động: CREATE, UPDATE, DELETE, PUBLISH, ARCHIVE, SUBMIT_REVIEW, APPROVE, REJECT, CLONE, ENROLL, CANCEL...',
  `summary` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tóm tắt hành động (tiếng Việt, dễ đọc)',
  `old_value` json DEFAULT NULL COMMENT 'Giá trị trước khi thay đổi',
  `new_value` json DEFAULT NULL COMMENT 'Giá trị sau khi thay đổi',
  `actor_id` int NOT NULL COMMENT 'ID của người thực hiện (User.id_user)',
  `actor_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên người thực hiện',
  `actor_role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Role: ADMIN, TEACHER, STUDENT',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Địa chỉ IP',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm ghi log',
  PRIMARY KEY (`id_audit`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_actor` (`actor_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử hoạt động hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blog_post`
--

DROP TABLE IF EXISTS `blog_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_post` (
  `id_blog` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề bài viết, tối đa 255 ký tự, khuyến nghị ≤ 60 ký tự',
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Slug thân thiện URL, viết thường, không dấu, ngăn cách bằng dấu gạch ngang',
  `short_description` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mô tả ngắn (meta description), tối đa 160 ký tự',
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung HTML đầy đủ, tối thiểu 500 từ, heading hợp lệ',
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh đại diện (featured image)',
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT' COMMENT 'Trạng thái bài viết',
  `author_account_id` int NOT NULL COMMENT 'Tác giả (liên kết bảng account)',
  `published_at` datetime DEFAULT NULL COMMENT 'Thời điểm xuất bản',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete - NULL nếu chưa xóa',
  PRIMARY KEY (`id_blog`),
  UNIQUE KEY `uk_blog_slug` (`slug`),
  KEY `idx_blog_status` (`status`),
  KEY `idx_blog_author` (`author_account_id`),
  KEY `idx_blog_published_at` (`published_at`),
  KEY `idx_blog_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_blog_author` FOREIGN KEY (`author_account_id`) REFERENCES `account` (`id_account`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng bài viết blog';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `parent_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int NOT NULL DEFAULT '0',
  `course_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chapter`),
  KEY `idx_chapter_course` (`course_id`),
  KEY `idx_chapter_order` (`course_id`,`order_index`),
  CONSTRAINT `fk_chapter_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_conversation`
--

DROP TABLE IF EXISTS `chat_conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_conversation` (
  `id_conversation` int NOT NULL AUTO_INCREMENT,
  `conversation_type` enum('PRIVATE','GROUP','COURSE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PRIVATE',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `last_message_id` int DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `message_permission` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EVERYONE',
  PRIMARY KEY (`id_conversation`),
  KEY `idx_conversation_course` (`course_id`),
  CONSTRAINT `fk_conversation_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_message`
--

DROP TABLE IF EXISTS `chat_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_message` (
  `id_message` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `message_type` enum('TEXT','IMAGE','FILE','VIDEO','AUDIO','SYSTEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'TEXT',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_format` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reply_to_message_id` int DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `is_edited` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_message`),
  KEY `idx_message_conversation` (`conversation_id`),
  KEY `idx_message_sender` (`sender_id`),
  CONSTRAINT `fk_message_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversation` (`id_conversation`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=216 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_participant`
--

DROP TABLE IF EXISTS `chat_participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_participant` (
  `id_participant` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `account_id` int NOT NULL,
  `role_in_conversation` enum('OWNER','ADMIN','MODERATOR','MEMBER') COLLATE utf8mb4_unicode_ci DEFAULT 'MEMBER' COMMENT 'Vai trò trong conversation',
  `chat_status` enum('ACTIVE','MUTED','BANNED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE' COMMENT 'Trạng thái chat: ACTIVE (bình thường), MUTED (tạm khóa), BANNED (cấm vĩnh viễn)',
  `muted_until` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm hết mute (NULL nếu không bị mute)',
  `muted_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lý do bị mute',
  `ban_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lý do bị ban',
  `is_admin` tinyint(1) DEFAULT '0',
  `last_read_message_id` int DEFAULT NULL,
  `unread_count` int DEFAULT '0',
  `last_message_preview` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật cuối',
  PRIMARY KEY (`id_participant`),
  UNIQUE KEY `unique_conversation_account` (`conversation_id`,`account_id`),
  KEY `idx_participant_account` (`account_id`),
  CONSTRAINT `fk_participant_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `fk_participant_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversation` (`id_conversation`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `id_course` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `thumbnail_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh bìa khóa học',
  `background_thumbnail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Background cho thumbnail (gradient, pattern, image URL)',
  `background_type` enum('GRADIENT','PATTERN','IMAGE','SOLID') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Loại background',
  `level` enum('ADVANCED','ALL_LEVELS','BEGINNER','INTERMEDIATE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `old_price` decimal(10,2) DEFAULT NULL COMMENT 'Giá gốc trước khi giảm',
  `is_free` tinyint(1) DEFAULT '0',
  `has_certificate` tinyint(1) DEFAULT '0',
  `access_period` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Lifetime' COMMENT 'Thời gian truy cập',
  `outcomes` json DEFAULT NULL COMMENT 'Danh sách mục tiêu đạt được',
  `status` enum('ARCHIVED','DRAFT','PENDING_REVIEW','PUBLISHED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_type` enum('LIVE','SELF_PACED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `progress_type` enum('COMPLETION_BASED','WEIGHTED_GRADE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'COMPLETION_BASED' COMMENT 'COMPLETION_BASED: theo số lượng hoàn thành. WEIGHTED_GRADE: theo trọng số điểm',
  `account_id` int NOT NULL COMMENT 'Giảng viên (account)',
  `category_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Danh mục',
  `published_at` timestamp NULL DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `language` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'vi' COMMENT 'Ngôn ngữ khóa học: vi, en, ja, ko, zh...',
  `prerequisite_course_id` int DEFAULT NULL COMMENT 'Khóa học tiên quyết (nếu có)',
  PRIMARY KEY (`id_course`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_course_slug` (`slug`),
  KEY `idx_course_status` (`status`),
  KEY `idx_course_level` (`level`),
  KEY `idx_course_instructor` (`account_id`),
  KEY `idx_course_category` (`category_id`),
  KEY `idx_course_deleted` (`deleted_at`),
  KEY `idx_course_published` (`status`,`published_at`),
  KEY `idx_course_title` (`title`),
  KEY `idx_course_price` (`price`),
  KEY `idx_course_is_free` (`is_free`),
  KEY `fk_course_prerequisite_course` (`prerequisite_course_id`),
  CONSTRAINT `fk_course_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE RESTRICT,
  CONSTRAINT `fk_course_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_course_prerequisite_course` FOREIGN KEY (`prerequisite_course_id`) REFERENCES `course` (`id_course`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `course_resource`
--

DROP TABLE IF EXISTS `course_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_resource` (
  `id_resource` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `chapter_id` int DEFAULT NULL COMMENT 'Thuộc chương nào',
  `parent_id` int DEFAULT NULL COMMENT 'FK tự tham chiếu: resource thuộc lesson',
  `resource_type` enum('VIDEO','QUIZ','PDF','SLIDE','AUDIO','DOCUMENT','IMAGE','LINK','SCORM','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_index` int DEFAULT '0',
  `is_required` tinyint(1) DEFAULT '0' COMMENT 'Bắt buộc hoàn thành',
  `status` enum('DRAFT','HIDDEN','PUBLISHED','PROCESSING','READY','ERROR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `settings` json DEFAULT NULL COMMENT 'Cấu hình thêm tùy loại',
  `duration` int DEFAULT '0',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_free_preview` tinyint(1) DEFAULT '0',
  `thumbnail_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `file_format` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_attempts` int DEFAULT NULL,
  `passing_score` decimal(5,2) DEFAULT '80.00',
  `time_limit` int DEFAULT NULL,
  `shuffle_questions` bit(1) DEFAULT b'0',
  `hashtag_filter` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lọc câu hỏi: "lesson-1,lesson-2"',
  `total_questions` int DEFAULT NULL COMMENT 'Số câu random mỗi lần',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_resource`),
  KEY `idx_course` (`course_id`),
  KEY `idx_chapter` (`chapter_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_type` (`resource_type`),
  KEY `idx_course_type` (`course_id`,`resource_type`),
  CONSTRAINT `fk_cr_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapter` (`id_chapter`) ON DELETE CASCADE,
  CONSTRAINT `fk_cr_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `fk_cr_parent` FOREIGN KEY (`parent_id`) REFERENCES `course_resource` (`id_resource`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=156 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `issuing_organization` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `credential_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificate_file` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lecturer_profile_id` (`lecturer_profile_id`),
  CONSTRAINT `lecturer_certificate_ibfk_1` FOREIGN KEY (`lecturer_profile_id`) REFERENCES `lecturer_profile` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lecturer_profile`
--

DROP TABLE IF EXISTS `lecturer_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecturer_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL COMMENT 'Giảng viên (account)',
  `specialties` json DEFAULT NULL,
  `expertise` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `experience_years` int DEFAULT '0',
  `education` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `website` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`account_id`),
  CONSTRAINT `fk_lecturer_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lesson_question`
--

DROP TABLE IF EXISTS `lesson_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_question` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int NOT NULL COMMENT 'FK → course_resource',
  `question_id` int NOT NULL COMMENT 'FK → question',
  `order_index` int DEFAULT '0',
  `points` decimal(5,2) DEFAULT '1.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_resource_question` (`resource_id`,`question_id`),
  KEY `idx_question` (`question_id`),
  CONSTRAINT `fk_lq_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id_question`) ON DELETE CASCADE,
  CONSTRAINT `fk_lq_resource` FOREIGN KEY (`resource_id`) REFERENCES `course_resource` (`id_resource`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id_notification` int NOT NULL AUTO_INCREMENT,
  `sender_account_id` int DEFAULT NULL COMMENT 'NULL = system',
  `notification_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CHAT, ORDER, COURSE_PUBLISHED, PROMOTION...',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề thông báo',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung thông báo',
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Loại đối tượng liên quan: course, order, chat, assignment...',
  `reference_id` int DEFAULT NULL COMMENT 'ID đối tượng liên quan',
  `extra_data` json DEFAULT NULL COMMENT 'Dữ liệu mở rộng tùy loại',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo thông báo',
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete - NULL nếu chưa xóa',
  PRIMARY KEY (`id_notification`),
  KEY `idx_notification_type` (`notification_type`),
  KEY `idx_notification_sender` (`sender_account_id`),
  KEY `idx_notification_created` (`created_at`),
  KEY `idx_notification_reference` (`reference_type`,`reference_id`),
  KEY `idx_notification_deleted` (`deleted_at`),
  CONSTRAINT `fk_notification_sender` FOREIGN KEY (`sender_account_id`) REFERENCES `account` (`id_account`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng thông báo chung';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_recipient`
--

DROP TABLE IF EXISTS `notification_recipient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_recipient` (
  `id_recipient` int NOT NULL AUTO_INCREMENT,
  `notification_id` int NOT NULL COMMENT 'ID thông báo',
  `account_id` int NOT NULL COMMENT 'ID người nhận',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '0 = chưa đọc, 1 = đã đọc',
  `read_at` datetime DEFAULT NULL COMMENT 'Thời điểm đọc',
  `received_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm nhận (thêm vào hệ thống)',
  PRIMARY KEY (`id_recipient`),
  UNIQUE KEY `uk_notification_recipient` (`notification_id`,`account_id`),
  KEY `idx_recipient_account` (`account_id`),
  KEY `idx_recipient_read` (`is_read`),
  KEY `idx_recipient_received` (`received_at`),
  CONSTRAINT `fk_recipient_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `fk_recipient_notification` FOREIGN KEY (`notification_id`) REFERENCES `notification` (`id_notification`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=235 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng trạng thái đọc thông báo của từng user';
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
  `account_id` int NOT NULL COMMENT 'Account sở hữu order item',
  `course_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `final_price` decimal(10,2) NOT NULL,
  `enrollment_type` enum('ENROLLED','WAITING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ENROLLED' COMMENT 'Loại đăng ký: ENROLLED (đã ghi danh), WAITING (chờ khai giảng)',
  `progress` decimal(5,2) DEFAULT '0.00' COMMENT 'Tiến độ học (%)',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm hoàn thành',
  `status` enum('ACTIVE','COMPLETED','DROPPED','ARCHIVED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE' COMMENT 'Trạng thái học',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `course_id` (`course_id`),
  KEY `fk_order_item_account` (`account_id`),
  CONSTRAINT `fk_order_item_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `total_amount` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('CANCELLED','FAILED','PAID','PENDING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payment_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `payment_log` json DEFAULT NULL,
  `invoice_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyer_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyer_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_issued_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `paid_currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_amount` decimal(19,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_account` (`account_id`),
  KEY `idx_status` (`status`),
  KEY `idx_transaction` (`transaction_id`),
  CONSTRAINT `fk_orders_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `id_permission` int NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_permission`),
  UNIQUE KEY `permission_name` (`permission_name`),
  KEY `idx_resource_action` (`resource`,`action`),
  KEY `idx_is_default` (`is_default`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `progress`
--

DROP TABLE IF EXISTS `progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `course_id` int NOT NULL,
  `progress_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'COURSE, RESOURCE, ASSIGNMENT, CERTIFICATE...',
  `reference_id` int DEFAULT NULL COMMENT 'FK tùy loại: resource_id, assignment_id...',
  `reference_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Loại reference: course_resource, assignment...',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NOT_STARTED' COMMENT 'NOT_STARTED, IN_PROGRESS, COMPLETED, PASSED, FAILED',
  `progress_percentage` decimal(5,2) DEFAULT '0.00',
  `total_time_spent` int DEFAULT '0',
  `score` decimal(5,2) DEFAULT NULL,
  `max_score` decimal(5,2) DEFAULT NULL,
  `attempts` int DEFAULT '1',
  `is_passed` tinyint(1) DEFAULT '0',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_items` int DEFAULT '0' COMMENT 'Tổng số items cần hoàn thành',
  `completed_items` int DEFAULT '0' COMMENT 'Số items đã hoàn thành',
  `weighted_score` decimal(5,2) DEFAULT NULL,
  `total_weight_percent` decimal(5,2) DEFAULT NULL,
  `extra_data` json DEFAULT NULL COMMENT 'Dữ liệu mở rộng tùy loại progress',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_progress` (`account_id`,`course_id`,`progress_type`,`reference_id`),
  KEY `idx_account` (`account_id`),
  KEY `idx_course` (`course_id`),
  KEY `idx_type` (`progress_type`),
  KEY `idx_reference` (`reference_type`,`reference_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_progress_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `id_question` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL COMMENT 'Khóa học sở hữu câu hỏi',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung câu hỏi',
  `question_type` enum('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','SHORT_ANSWER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` json DEFAULT NULL COMMENT 'Danh sách đáp án: [{"label":"A","content":"..."}]',
  `correct_answer` json DEFAULT NULL COMMENT 'Đáp án đúng: ["A"] hoặc ["A","B"]',
  `explanation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Giải thích đáp án',
  `status` enum('ACTIVE','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `order_index` int DEFAULT NULL,
  `points` decimal(5,2) DEFAULT '1.00',
  `lesson_id` int DEFAULT NULL COMMENT 'FK → course_resource (lesson) mà câu hỏi thuộc về',
  `hashtag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hashtag của lesson, VD: #lesson-1',
  PRIMARY KEY (`id_question`),
  KEY `idx_question_status` (`status`),
  KEY `idx_quiz_order` (`order_index`),
  KEY `idx_question_course` (`course_id`),
  KEY `idx_question_lesson` (`lesson_id`),
  CONSTRAINT `fk_question_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `fk_question_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `course_resource` (`id_resource`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quiz_attempt`
--

DROP TABLE IF EXISTS `quiz_attempt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempt` (
  `id_attempt` int NOT NULL AUTO_INCREMENT,
  `answers` json DEFAULT NULL,
  `attempt_number` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_passed` bit(1) DEFAULT NULL,
  `status` enum('IN_PROGRESS','SUBMITTED','GRADED','TIMEOUT') COLLATE utf8mb4_unicode_ci DEFAULT 'IN_PROGRESS',
  `max_score` decimal(5,2) DEFAULT NULL,
  `passing_score` decimal(5,2) DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `time_spent` int DEFAULT NULL,
  `account_id` int NOT NULL,
  `course_id` int NOT NULL,
  `resource_id` int NOT NULL,
  PRIMARY KEY (`id_attempt`),
  KEY `FKqi3hiqbdlfx5neqmxgifnv8y` (`account_id`),
  KEY `FKfakwrfksgov3e1qjrrym3a9ef` (`course_id`),
  KEY `idx_attempt_resource` (`resource_id`),
  CONSTRAINT `fk_attempt_resource` FOREIGN KEY (`resource_id`) REFERENCES `course_resource` (`id_resource`) ON DELETE CASCADE,
  CONSTRAINT `FKfakwrfksgov3e1qjrrym3a9ef` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`),
  CONSTRAINT `FKqi3hiqbdlfx5neqmxgifnv8y` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quiz_weight`
--

DROP TABLE IF EXISTS `quiz_weight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_weight` (
  `id_weight` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL COMMENT 'Khóa học',
  `resource_id` int NOT NULL,
  `weight_percent` decimal(5,2) NOT NULL COMMENT 'Trọng số % (tổng = 100)',
  `is_final_exam` tinyint(1) DEFAULT '0' COMMENT '1 = bài thi cuối kỳ',
  `is_counted` tinyint(1) DEFAULT '1' COMMENT '1 = tính vào điểm tổng, 0 = không tính',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_weight`),
  UNIQUE KEY `unique_course_resource` (`course_id`,`resource_id`),
  KEY `idx_weight_course` (`course_id`),
  KEY `idx_weight_resource` (`resource_id`),
  CONSTRAINT `fk_weight_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `fk_weight_resource` FOREIGN KEY (`resource_id`) REFERENCES `course_resource` (`id_resource`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Trọng số điểm cho quiz (dùng khi progress_type = WEIGHTED_GRADE)';
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
  `token_hash` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `account_id` int NOT NULL COMMENT 'Người đánh giá (account)',
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_review`),
  UNIQUE KEY `unique_review` (`course_id`,`account_id`),
  KEY `idx_review_course` (`course_id`),
  KEY `idx_review_user` (`account_id`),
  KEY `idx_review_rating` (`rating`),
  CONSTRAINT `fk_review_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id_course`) ON DELETE CASCADE,
  CONSTRAINT `review_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id_role` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_id` int NOT NULL,
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `account_id` (`account_id`),
  CONSTRAINT `fk_user_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`),
  CONSTRAINT `FKc3b4xfbq6rbkkrddsdum8t5f0` FOREIGN KEY (`account_id`) REFERENCES `account` (`id_account`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-14 20:11:28
