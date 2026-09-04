// Ensure a single super-admin account exists in the database.
//
// The app never lets anyone register as super_admin (that role is created here,
// out of band). Run this once after setting up the database:
//
//   npm run create-admin
//
// Credentials default to the demo values but can be overridden via env:
//   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
//
// Safe to re-run: if the account already exists it just resets the password
// (and reactivates it), so it is also the way to recover a locked-out admin.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const email = (process.env.ADMIN_EMAIL || 'admin@momcare.lk').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'admin123';
const name = process.env.ADMIN_NAME || 'MomCare Super Admin';

async function main() {
  const passwordHash = bcrypt.hashSync(password, 10);
  const [rows] = await pool.query('SELECT id, role FROM users WHERE LOWER(email) = ? LIMIT 1', [email]);

  if (rows.length === 0) {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role, family_id, active) VALUES (?, ?, ?, ?, NULL, 1)',
      [name, email, passwordHash, 'super_admin'],
    );
    console.log(`Created super-admin account:  ${email}  /  ${password}`);
    return;
  }

  if (rows[0].role !== 'super_admin') {
    console.error(`An account with ${email} already exists but its role is "${rows[0].role}", not super_admin.`);
    console.error('Choose a different ADMIN_EMAIL or remove that account first.');
    process.exitCode = 1;
    return;
  }

  await pool.query(
    'UPDATE users SET name = ?, password_hash = ?, active = 1 WHERE id = ?',
    [name, passwordHash, rows[0].id],
  );
  console.log(`Super-admin account already existed — password reset:  ${email}  /  ${password}`);
}

main()
  .catch((error) => {
    console.error('create-admin failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
