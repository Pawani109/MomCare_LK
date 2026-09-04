-- MomCare LK — database schema
-- Run against the `momcare` database:  mysql -u <user> -p momcare < schema.sql
USE momcare;

-- ---------------------------------------------------------
-- 1. families
-- One row per mother's family. Partner and doctor accounts
-- join an existing family via its family_code.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS families (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_code  VARCHAR(20)  NOT NULL,                -- e.g. 'MC-1005'
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_families_code (family_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------
-- 2. users
-- Mom, partner, doctor share the same family_id.
-- super_admin has no family (family_id = NULL).
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(150)    NOT NULL,
  email          VARCHAR(190)    NOT NULL,
  password_hash  VARCHAR(255)    NOT NULL,
  role           ENUM('mom','partner','doctor','super_admin') NOT NULL,
  family_id      INT UNSIGNED    NULL,
  active         TINYINT(1)      NOT NULL DEFAULT 1,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at  DATETIME        NULL,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_family (family_id),
  CONSTRAINT fk_users_family
    FOREIGN KEY (family_id) REFERENCES families(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------
-- 3. pregnancy_profiles
-- One active pregnancy profile per family (drives the
-- week/due-date tracker).
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pregnancy_profiles (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id    INT UNSIGNED NOT NULL,
  mom_user_id  INT UNSIGNED NOT NULL,
  lmp_date     DATE         NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NULL,
  UNIQUE KEY uq_pregnancy_family (family_id),
  KEY idx_pregnancy_mom (mom_user_id),
  CONSTRAINT fk_pregnancy_family
    FOREIGN KEY (family_id) REFERENCES families(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pregnancy_mom
    FOREIGN KEY (mom_user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------
-- 4. health_records
-- One table for all three record types (weight, blood
-- pressure, scan report). Type-specific columns are nullable
-- and only populated for the matching type.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS health_records (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id    INT UNSIGNED NOT NULL,
  created_by   INT UNSIGNED NOT NULL,                -- mom's user id
  type         ENUM('weight','blood_pressure','scan_report') NOT NULL,
  date         DATE         NOT NULL,
  notes        TEXT         NULL,

  -- type = 'weight'
  value        DECIMAL(5,2) NULL,                    -- 25.00-250.00
  unit         VARCHAR(10)  NULL DEFAULT 'kg',

  -- type = 'blood_pressure'
  systolic     SMALLINT UNSIGNED NULL,
  diastolic    SMALLINT UNSIGNED NULL,
  pulse        SMALLINT UNSIGNED NULL,

  -- type = 'scan_report'
  title        VARCHAR(150) NULL,
  scan_type    VARCHAR(50)  NULL,
  file_name    VARCHAR(255) NULL,                    -- original upload name
  stored_name  VARCHAR(255) NULL,                    -- name on disk in /uploads/scan-reports
  mime_type    VARCHAR(100) NULL,
  file_size    INT UNSIGNED NULL,                    -- bytes, max ~8MB enforced in app

  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NULL,

  KEY idx_records_family_date (family_id, date),
  KEY idx_records_created_by (created_by),
  CONSTRAINT fk_records_family
    FOREIGN KEY (family_id) REFERENCES families(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_records_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------
-- 5. health_record_comments
-- Comments any family member (esp. the linked doctor) can
-- leave on a specific health record.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS health_record_comments (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id    INT UNSIGNED NOT NULL,
  family_id    INT UNSIGNED NOT NULL,
  author_id    INT UNSIGNED NOT NULL,
  author_name  VARCHAR(150) NOT NULL,                -- denormalized for fast reads
  author_role  VARCHAR(20)  NOT NULL,
  text         TEXT         NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_comments_record (record_id),
  KEY idx_comments_family (family_id),
  CONSTRAINT fk_comments_record
    FOREIGN KEY (record_id) REFERENCES health_records(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_comments_family
    FOREIGN KEY (family_id) REFERENCES families(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_comments_author
    FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
