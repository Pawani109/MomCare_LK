-- Adds the appointments table (clinic appointments were previously in-memory only).
-- Run against the momcare database:  mysql -u <user> -p momcare < migrations/001_appointments.sql
USE momcare;

CREATE TABLE IF NOT EXISTS appointments (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  family_id         INT UNSIGNED  NOT NULL,
  created_by        INT UNSIGNED  NOT NULL,               -- mom's user id
  hospital          VARCHAR(200)  NOT NULL,
  doctor            VARCHAR(150)  NULL,
  date              DATE          NOT NULL,
  time              TIME          NOT NULL,
  type              VARCHAR(100)  NOT NULL DEFAULT 'Clinic appointment',
  notes             TEXT          NULL,
  reminder_enabled  TINYINT(1)    NOT NULL DEFAULT 1,
  completed         TINYINT(1)    NOT NULL DEFAULT 0,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NULL,

  KEY idx_appointments_family_date (family_id, date),
  KEY idx_appointments_created_by (created_by),
  CONSTRAINT fk_appointments_family
    FOREIGN KEY (family_id) REFERENCES families(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appointments_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
