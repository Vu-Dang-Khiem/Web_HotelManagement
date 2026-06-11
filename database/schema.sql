-- ============================================================
--  HỆ THỐNG QUẢN LÝ KHÁCH SẠN - LƯỢC ĐỒ CƠ SỞ DỮ LIỆU
--  MySQL 8 / MariaDB 10+
--  Chạy file này trước, sau đó chạy: npm run seed
-- ============================================================

DROP DATABASE IF EXISTS hotel_management;
CREATE DATABASE hotel_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE hotel_management;

-- ------------------------------------------------------------
-- 1. Vai trò
-- ------------------------------------------------------------
CREATE TABLE roles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. Người dùng (admin / lễ tân / khách hàng)
-- ------------------------------------------------------------
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  role_id     INT NOT NULL,
  full_name   VARCHAR(150) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  phone       VARCHAR(20) UNIQUE,
  address     VARCHAR(255),
  avatar      VARCHAR(255),
  status      ENUM('active','locked') NOT NULL DEFAULT 'active',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. Loại phòng
-- ------------------------------------------------------------
CREATE TABLE room_types (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  base_price  DECIMAL(12,0) NOT NULL DEFAULT 0,
  capacity    INT NOT NULL DEFAULT 2,
  area        INT,                       -- diện tích m2
  bed_type    VARCHAR(100),              -- loại giường
  view_type   VARCHAR(100),              -- hướng nhìn
  thumbnail   VARCHAR(255),
  status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. Tiện nghi
-- ------------------------------------------------------------
CREATE TABLE amenities (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  icon  VARCHAR(80) DEFAULT 'fa-solid fa-check'
) ENGINE=InnoDB;

-- Tiện nghi theo loại phòng (nhiều - nhiều)
CREATE TABLE room_type_amenities (
  room_type_id INT NOT NULL,
  amenity_id   INT NOT NULL,
  PRIMARY KEY (room_type_id, amenity_id),
  CONSTRAINT fk_rta_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
  CONSTRAINT fk_rta_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Thư viện ảnh của loại phòng
CREATE TABLE room_type_images (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id INT NOT NULL,
  image_url    VARCHAR(255) NOT NULL,
  sort_order   INT DEFAULT 0,
  CONSTRAINT fk_rti_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. Phòng cụ thể
-- ------------------------------------------------------------
CREATE TABLE rooms (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id  INT NOT NULL,
  room_number   VARCHAR(20) NOT NULL UNIQUE,
  floor         INT,
  status        ENUM('available','occupied','maintenance') NOT NULL DEFAULT 'available',
  note          VARCHAR(255),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rooms_type FOREIGN KEY (room_type_id) REFERENCES room_types(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. Dịch vụ
-- ------------------------------------------------------------
CREATE TABLE services (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  price       DECIMAL(12,0) NOT NULL DEFAULT 0,
  unit        VARCHAR(50) DEFAULT 'lần',
  icon        VARCHAR(80) DEFAULT 'fa-solid fa-concierge-bell',
  status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. Khuyến mãi
-- ------------------------------------------------------------
CREATE TABLE promotions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(50) NOT NULL UNIQUE,
  name           VARCHAR(150) NOT NULL,
  description    VARCHAR(255),
  discount_type  ENUM('percent','amount') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(12,0) NOT NULL DEFAULT 0,
  min_total      DECIMAL(12,0) NOT NULL DEFAULT 0,
  start_date     DATE,
  end_date       DATE,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. Đặt phòng
-- ------------------------------------------------------------
CREATE TABLE bookings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(30) NOT NULL UNIQUE,
  user_id        INT,                       -- khách hàng (null nếu lễ tân tạo cho khách vãng lai)
  room_type_id   INT NOT NULL,
  room_id        INT,                       -- phòng được gán (có thể null khi chờ xác nhận)
  guest_name     VARCHAR(150) NOT NULL,
  guest_phone    VARCHAR(20) NOT NULL,
  guest_email    VARCHAR(150),
  check_in       DATE NOT NULL,
  check_out      DATE NOT NULL,
  nights         INT NOT NULL DEFAULT 1,
  adults         INT NOT NULL DEFAULT 1,
  children       INT NOT NULL DEFAULT 0,
  room_price     DECIMAL(12,0) NOT NULL DEFAULT 0,   -- giá/đêm tại thời điểm đặt
  room_total     DECIMAL(12,0) NOT NULL DEFAULT 0,   -- room_price * nights
  services_total DECIMAL(12,0) NOT NULL DEFAULT 0,
  discount       DECIMAL(12,0) NOT NULL DEFAULT 0,
  total_amount   DECIMAL(12,0) NOT NULL DEFAULT 0,
  promotion_id   INT,
  status         ENUM('pending','confirmed','checked_in','checked_out','cancelled') NOT NULL DEFAULT 'pending',
  payment_status ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  payment_method ENUM('cash','card','transfer','momo') DEFAULT 'cash',
  special_request TEXT,
  created_by     INT,                       -- nhân viên tạo (nếu có)
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_book_user  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_book_type  FOREIGN KEY (room_type_id) REFERENCES room_types(id),
  CONSTRAINT fk_book_room  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_book_promo FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
  CONSTRAINT fk_book_staff FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Dịch vụ kèm theo của đơn đặt phòng
CREATE TABLE booking_services (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  booking_id  INT NOT NULL,
  service_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  price       DECIMAL(12,0) NOT NULL DEFAULT 0,   -- giá tại thời điểm đặt
  CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_bs_service FOREIGN KEY (service_id) REFERENCES services(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. Hóa đơn
-- ------------------------------------------------------------
CREATE TABLE invoices (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(30) NOT NULL UNIQUE,
  booking_id     INT NOT NULL,
  subtotal       DECIMAL(12,0) NOT NULL DEFAULT 0,
  discount       DECIMAL(12,0) NOT NULL DEFAULT 0,
  total          DECIMAL(12,0) NOT NULL DEFAULT 0,
  payment_method ENUM('cash','card','transfer','momo') DEFAULT 'cash',
  payment_status ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'paid',
  note           VARCHAR(255),
  issued_by      INT,
  issued_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inv_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_staff   FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. Đánh giá
-- ------------------------------------------------------------
CREATE TABLE reviews (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  room_type_id INT NOT NULL,
  booking_id   INT,
  rating       TINYINT NOT NULL DEFAULT 5,
  comment      TEXT,
  status       ENUM('visible','hidden') NOT NULL DEFAULT 'visible',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rev_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_book FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 11. Liên hệ
-- ------------------------------------------------------------
CREATE TABLE contacts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  phone      VARCHAR(20),
  subject    VARCHAR(200),
  message    TEXT NOT NULL,
  status     ENUM('new','replied') NOT NULL DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Index hỗ trợ truy vấn
-- ------------------------------------------------------------
CREATE INDEX idx_rooms_type     ON rooms(room_type_id);
CREATE INDEX idx_rooms_status   ON rooms(status);
CREATE INDEX idx_book_dates     ON bookings(check_in, check_out);
CREATE INDEX idx_book_status    ON bookings(status);
CREATE INDEX idx_book_user      ON bookings(user_id);
CREATE INDEX idx_reviews_type   ON reviews(room_type_id);
