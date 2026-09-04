-- Wipe all MomCare data and reset auto-increment counters.
-- Run this in DBeaver, then `npm run seed` to reload the demo accounts.
USE momcare;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE health_record_comments;
TRUNCATE TABLE health_records;
TRUNCATE TABLE pregnancy_profiles;
TRUNCATE TABLE users;
TRUNCATE TABLE families;
SET FOREIGN_KEY_CHECKS = 1;
