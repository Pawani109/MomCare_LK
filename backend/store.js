// Data-access layer for the MomCare LK MySQL database.
//
// Covers the five tables created for this project: families, users,
// pregnancy_profiles, health_records and health_record_comments.
// Everything else in server.js (appointments, reminders, care comments,
// forum, mood, emergency contacts, SOS) has no table yet and stays in memory.
//
// Rows come out of MySQL in snake_case; the helpers below map them to the
// camelCase shapes the rest of the app and the frontend already expect.
const { query, pool } = require('./db');

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    familyId: row.family_id,
    active: row.active !== 0,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    // family_code is joined in from the families table; only meaningful for the mom.
    familyCode: row.family_code || undefined,
  };
}

function mapPregnancy(row) {
  if (!row) return null;
  return {
    id: row.id,
    familyId: row.family_id,
    momUserId: row.mom_user_id,
    lmpDate: row.lmp_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRecord(row) {
  if (!row) return null;
  const record = {
    id: row.id,
    familyId: row.family_id,
    createdBy: row.created_by,
    type: row.type,
    date: row.date,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
  if (row.updated_at) record.updatedAt = row.updated_at;

  if (row.type === 'weight') {
    record.value = row.value == null ? null : Number(row.value);
    record.unit = row.unit || 'kg';
  }
  if (row.type === 'blood_pressure') {
    record.systolic = row.systolic == null ? null : Number(row.systolic);
    record.diastolic = row.diastolic == null ? null : Number(row.diastolic);
    record.pulse = row.pulse == null ? null : Number(row.pulse);
  }
  if (row.type === 'scan_report') {
    record.title = row.title || 'Scan report';
    record.scanType = row.scan_type || 'Other';
    record.fileName = row.file_name || '';
    record.storedName = row.stored_name || '';
    record.mimeType = row.mime_type || '';
    record.fileSize = row.file_size == null ? null : Number(row.file_size);
  }
  return record;
}

function mapComment(row) {
  if (!row) return null;
  return {
    id: row.id,
    recordId: row.record_id,
    familyId: row.family_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    text: row.text,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// families
// ---------------------------------------------------------------------------

async function findFamilyByCode(code) {
  const rows = await query('SELECT * FROM families WHERE family_code = ? LIMIT 1', [code]);
  return rows[0] || null;
}

// A new mother gets a fresh family with a short unique invitation code
// (e.g. 'MC-7QK4P2'). family_code is VARCHAR(20) UNIQUE, so we retry on the
// rare chance of a collision.
function randomFamilyCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
  let suffix = '';
  for (let i = 0; i < 6; i += 1) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `MC-${suffix}`;
}

async function createFamilyForMom() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const familyCode = randomFamilyCode();
    try {
      const [result] = await pool.execute('INSERT INTO families (family_code) VALUES (?)', [familyCode]);
      return { id: result.insertId, family_code: familyCode };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') continue;
      throw error;
    }
  }
  throw new Error('Could not generate a unique family code, please try again');
}

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

const USER_SELECT = `
  SELECT u.*, f.family_code
  FROM users u
  LEFT JOIN families f ON f.id = u.family_id
`;

async function findUserByEmail(email) {
  const rows = await query(`${USER_SELECT} WHERE LOWER(u.email) = LOWER(?) LIMIT 1`, [email]);
  return mapUser(rows[0]);
}

async function findUserById(id) {
  const rows = await query(`${USER_SELECT} WHERE u.id = ? LIMIT 1`, [id]);
  return mapUser(rows[0]);
}

async function emailExists(email) {
  const rows = await query('SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email]);
  return rows.length > 0;
}

async function createUser({ name, email, passwordHash, role, familyId }) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role, family_id) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, role, familyId ?? null],
  );
  return findUserById(result.insertId);
}

async function touchLastLogin(id) {
  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [id]);
}

async function updateUserPassword(id, passwordHash) {
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

async function setUserActive(id, active) {
  await query('UPDATE users SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
  return findUserById(id);
}

async function listFamilyMembers(familyId) {
  const rows = await query(
    `${USER_SELECT} WHERE u.family_id = ? ORDER BY FIELD(u.role, 'mom', 'partner', 'doctor'), u.id`,
    [familyId],
  );
  return rows.map(mapUser);
}

async function findFamilyMom(familyId) {
  const rows = await query(`${USER_SELECT} WHERE u.family_id = ? AND u.role = 'mom' LIMIT 1`, [familyId]);
  return mapUser(rows[0]);
}

// All non-admin users (used by the super-admin portal).
async function listManagedUsers() {
  const rows = await query(`${USER_SELECT} WHERE u.role <> 'super_admin' ORDER BY u.id`);
  return rows.map(mapUser);
}

// ---------------------------------------------------------------------------
// pregnancy_profiles
// ---------------------------------------------------------------------------

async function findPregnancyByFamily(familyId) {
  const rows = await query('SELECT * FROM pregnancy_profiles WHERE family_id = ? LIMIT 1', [familyId]);
  return mapPregnancy(rows[0]);
}

async function listAllPregnancies() {
  const rows = await query('SELECT * FROM pregnancy_profiles');
  return rows.map(mapPregnancy);
}

async function upsertPregnancy(familyId, momUserId, lmpDate) {
  await query(
    `INSERT INTO pregnancy_profiles (family_id, mom_user_id, lmp_date)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE lmp_date = VALUES(lmp_date), mom_user_id = VALUES(mom_user_id), updated_at = NOW()`,
    [familyId, momUserId, lmpDate],
  );
  return findPregnancyByFamily(familyId);
}

// ---------------------------------------------------------------------------
// health_records
// ---------------------------------------------------------------------------

async function listRecordsByFamily(familyId) {
  const rows = await query(
    'SELECT * FROM health_records WHERE family_id = ? ORDER BY date DESC, id DESC',
    [familyId],
  );
  return rows.map(mapRecord);
}

async function findRecord(id, familyId) {
  const rows = await query('SELECT * FROM health_records WHERE id = ? AND family_id = ? LIMIT 1', [id, familyId]);
  return mapRecord(rows[0]);
}

async function findScanRecord(id, familyId) {
  const rows = await query(
    "SELECT * FROM health_records WHERE id = ? AND family_id = ? AND type = 'scan_report' LIMIT 1",
    [id, familyId],
  );
  return mapRecord(rows[0]);
}

async function createRecord(data) {
  const [result] = await pool.execute(
    `INSERT INTO health_records
       (family_id, created_by, type, date, notes,
        value, unit, systolic, diastolic, pulse,
        title, scan_type, file_name, stored_name, mime_type, file_size)
     VALUES (?, ?, ?, ?, ?,  ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?, ?)`,
    [
      data.familyId, data.createdBy, data.type, data.date, data.notes ?? null,
      data.value ?? null, data.unit ?? null, data.systolic ?? null, data.diastolic ?? null, data.pulse ?? null,
      data.title ?? null, data.scanType ?? null, data.fileName ?? null, data.storedName ?? null,
      data.mimeType ?? null, data.fileSize ?? null,
    ],
  );
  return findRecordById(result.insertId);
}

async function findRecordById(id) {
  const rows = await query('SELECT * FROM health_records WHERE id = ? LIMIT 1', [id]);
  return mapRecord(rows[0]);
}

const RECORD_UPDATE_COLUMNS = {
  date: 'date',
  notes: 'notes',
  value: 'value',
  unit: 'unit',
  systolic: 'systolic',
  diastolic: 'diastolic',
  pulse: 'pulse',
  title: 'title',
  scanType: 'scan_type',
  fileName: 'file_name',
  storedName: 'stored_name',
  mimeType: 'mime_type',
  fileSize: 'file_size',
};

async function updateRecord(id, fields) {
  const sets = [];
  const params = [];
  for (const [key, column] of Object.entries(RECORD_UPDATE_COLUMNS)) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      sets.push(`${column} = ?`);
      params.push(fields[key] ?? null);
    }
  }
  sets.push('updated_at = NOW()');
  params.push(id);
  await query(`UPDATE health_records SET ${sets.join(', ')} WHERE id = ?`, params);
  return findRecordById(id);
}

async function deleteRecord(id) {
  // health_record_comments has ON DELETE CASCADE, so comments go with it.
  await query('DELETE FROM health_records WHERE id = ?', [id]);
}

async function totalHealthRecords() {
  const rows = await query('SELECT COUNT(*) AS c FROM health_records');
  return Number(rows[0].c);
}

async function healthRecordCountsByFamily() {
  const rows = await query(
    "SELECT family_id, COUNT(*) AS total, SUM(type = 'scan_report') AS scans FROM health_records GROUP BY family_id",
  );
  const map = new Map();
  for (const row of rows) {
    map.set(row.family_id, { total: Number(row.total), scans: Number(row.scans) });
  }
  return map;
}

// ---------------------------------------------------------------------------
// health_record_comments
// ---------------------------------------------------------------------------

async function listCommentsByFamily(familyId) {
  const rows = await query(
    'SELECT * FROM health_record_comments WHERE family_id = ? ORDER BY created_at DESC, id DESC',
    [familyId],
  );
  return rows.map(mapComment);
}

async function listCommentsByRecord(recordId) {
  const rows = await query(
    'SELECT * FROM health_record_comments WHERE record_id = ? ORDER BY created_at DESC, id DESC',
    [recordId],
  );
  return rows.map(mapComment);
}

async function createRecordComment(data) {
  const [result] = await pool.execute(
    `INSERT INTO health_record_comments (record_id, family_id, author_id, author_name, author_role, text)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.recordId, data.familyId, data.authorId, data.authorName, data.authorRole, data.text],
  );
  const rows = await query('SELECT * FROM health_record_comments WHERE id = ?', [result.insertId]);
  return mapComment(rows[0]);
}

module.exports = {
  // families
  findFamilyByCode,
  createFamilyForMom,
  // users
  findUserByEmail,
  findUserById,
  emailExists,
  createUser,
  touchLastLogin,
  updateUserPassword,
  setUserActive,
  listFamilyMembers,
  findFamilyMom,
  listManagedUsers,
  // pregnancy
  findPregnancyByFamily,
  listAllPregnancies,
  upsertPregnancy,
  // health records
  listRecordsByFamily,
  findRecord,
  findRecordById,
  findScanRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  totalHealthRecords,
  healthRecordCountsByFamily,
  // comments
  listCommentsByFamily,
  listCommentsByRecord,
  createRecordComment,
};
