// Seed the MomCare LK database with the four demo accounts (and a little
// starter data) so the existing demo logins keep working after the switch
// from in-memory data to MySQL.
//
//   Demo logins:
//     mom@momcare.lk      / mom123      (family code MC-1001)
//     partner@momcare.lk  / partner123
//     doctor@momcare.lk   / doctor123
//     admin@momcare.lk    / admin123    (super admin, no family)
//
// Usage:  npm run seed
// Safe to re-run: it skips seeding if a users row already exists.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function seed() {
  const conn = await pool.getConnection();
  try {
    const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM users');
    if (count > 0) {
      console.log(`users table already has ${count} row(s); skipping seed.`);
      return;
    }

    await conn.beginTransaction();

    // 1. family (family_code is derived from the id -> MC-1001 for id 1)
    const [famResult] = await conn.query('INSERT INTO families (family_code) VALUES (?)', ['TMP-seed']);
    const familyId = famResult.insertId;
    const familyCode = `MC-${1000 + familyId}`;
    await conn.query('UPDATE families SET family_code = ? WHERE id = ?', [familyCode, familyId]);

    // 2. users
    const hash = (pw) => bcrypt.hashSync(pw, 10);
    const [momResult] = await conn.query(
      'INSERT INTO users (name, email, password_hash, role, family_id) VALUES (?, ?, ?, ?, ?)',
      ['Nimasha Perera', 'mom@momcare.lk', hash('mom123'), 'mom', familyId],
    );
    const momId = momResult.insertId;

    await conn.query(
      'INSERT INTO users (name, email, password_hash, role, family_id) VALUES (?, ?, ?, ?, ?)',
      ['Kasun Perera', 'partner@momcare.lk', hash('partner123'), 'partner', familyId],
    );
    await conn.query(
      'INSERT INTO users (name, email, password_hash, role, family_id) VALUES (?, ?, ?, ?, ?)',
      ['Dr. Silva', 'doctor@momcare.lk', hash('doctor123'), 'doctor', familyId],
    );
    await conn.query(
      'INSERT INTO users (name, email, password_hash, role, family_id) VALUES (?, ?, ?, ?, ?)',
      ['MomCare Super Admin', 'admin@momcare.lk', hash('admin123'), 'super_admin', null],
    );

    // 3. pregnancy profile
    await conn.query(
      'INSERT INTO pregnancy_profiles (family_id, mom_user_id, lmp_date) VALUES (?, ?, ?)',
      [familyId, momId, '2026-02-13'],
    );

    // 4. a couple of starter health records + one doctor comment
    const [weightRec] = await conn.query(
      `INSERT INTO health_records (family_id, created_by, type, date, notes, value, unit)
       VALUES (?, ?, 'weight', ?, ?, ?, 'kg')`,
      [familyId, momId, '2026-07-10', 'Feeling good', 61.5],
    );
    const [bpRec] = await conn.query(
      `INSERT INTO health_records (family_id, created_by, type, date, notes, systolic, diastolic, pulse)
       VALUES (?, ?, 'blood_pressure', ?, ?, ?, ?, ?)`,
      [familyId, momId, '2026-07-17', 'Measured after resting', 114, 75, 78],
    );
    void weightRec;

    await conn.query(
      `INSERT INTO health_record_comments (record_id, family_id, author_id, author_name, author_role, text)
       VALUES (?, ?, ?, ?, 'doctor', ?)`,
      [
        bpRec.insertId,
        familyId,
        momId + 2, // the doctor account inserted third
        'Dr. Silva',
        'This reading is within the expected range. Continue monitoring at the same time of day.',
      ],
    );

    await conn.commit();
    console.log(`Seeded family ${familyCode} with 4 demo accounts, 1 pregnancy profile, 2 health records.`);
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  } finally {
    conn.release();
  }
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error.message);
    pool.end().finally(() => process.exit(1));
  });
