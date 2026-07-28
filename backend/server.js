const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'momcare-lk-demo-secret';

// ---- In-memory demo data (will be replaced by a real database later) ----

const demoUser = {
  id: 1,
  name: 'Nimasha Perera',
  role: 'mom',
  dueDate: '2026-11-20',
  pregnancyStartDate: '2026-02-13',
  emergencyContacts: [
    { name: 'Kasun Perera (Husband)', phone: '+94 77 123 4567' },
    { name: 'Suwa Seriya Ambulance', phone: '1990' },
  ],
};

let pregnancyProfiles = [
  { userId: 1, lmpDate: '2026-02-13' },
];

let appointments = [
  { id: 1, userId: 1, hospital: 'MOH Office Nugegoda', doctor: 'Dr. Silva', date: '2026-07-30', time: '09:00', type: 'Routine antenatal clinic', notes: 'Bring clinic book and previous reports', reminderEnabled: true, completed: false },
  { id: 2, userId: 1, hospital: 'Castle Street Hospital for Women', doctor: 'Dr. Perera', date: '2026-08-12', time: '10:00', type: 'Ultrasound scan', notes: 'Anomaly scan appointment', reminderEnabled: true, completed: false },
];

let reminders = [
  { id: 1, title: 'Clinic visit – MOH Office Nugegoda', date: '2026-07-30', time: '09:00', done: false },
  { id: 2, title: 'Blood test – Full blood count', date: '2026-08-05', time: '08:30', done: false },
  { id: 3, title: 'Ultrasound scan (anomaly scan)', date: '2026-08-12', time: '10:00', done: false },
];

let healthRecords = [
  { id: 1, date: '2026-07-10', weightKg: 61.5, bpSystolic: 110, bpDiastolic: 72, notes: 'Feeling good' },
  { id: 2, date: '2026-07-17', weightKg: 62.1, bpSystolic: 114, bpDiastolic: 75, notes: 'Mild back pain' },
];

let forumPosts = [
  {
    id: 1,
    author: 'Sanduni',
    weekTag: 'Week 18',
    text: 'Any tips for managing morning sickness while at office meetings?',
    replies: 4,
    createdAt: '2026-07-22T08:30:00Z',
  },
  {
    id: 2,
    author: 'Fathima',
    weekTag: 'Week 30',
    text: 'Which hospitals in Colombo have the best maternity packages?',
    replies: 7,
    createdAt: '2026-07-23T14:10:00Z',
  },
];

let moodLog = [];
let sosEvents = [];
let nextId = 100;

// ---- Auth ----

const users = [
  {
    id: 1,
    name: 'Nimasha Perera',
    email: 'mom@momcare.lk',
    passwordHash: bcrypt.hashSync('mom123', 10),
    role: 'mom',
  },
  {
    id: 2,
    name: 'Kasun Perera',
    email: 'partner@momcare.lk',
    passwordHash: bcrypt.hashSync('partner123', 10),
    role: 'partner',
  },
  {
    id: 3,
    name: 'Dr. Silva',
    email: 'doctor@momcare.lk',
    passwordHash: bcrypt.hashSync('doctor123', 10),
    role: 'doctor',
  },
];
let nextUserId = 4;

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (!['mom', 'partner', 'doctor'].includes(role)) return res.status(400).json({ error: 'Role must be mom, partner or doctor' });
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ error: 'An account with this email already exists' });
  const user = { id: nextUserId++, name, email, passwordHash: bcrypt.hashSync(password, 10), role };
  users.push(user);
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: makeToken(user), user: publicUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: { id: payload.id, name: payload.name, email: payload.email, role: payload.role } });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});


function getAuthUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Please log in to continue' });
  req.user = user;
  next();
}

function pregnancySummary(lmpDate) {
  const lmp = new Date(`${lmpDate}T00:00:00`);
  const today = new Date();
  const elapsedDays = Math.max(0, Math.floor((today - lmp) / 86400000));
  const currentWeek = Math.min(40, Math.max(1, Math.floor(elapsedDays / 7) + 1));
  const currentDay = elapsedDays % 7;
  const due = new Date(lmp);
  due.setDate(due.getDate() + 280);
  return { lmpDate, dueDate: due.toISOString().slice(0, 10), currentWeek, currentDay, progress: Math.min(100, Math.round((elapsedDays / 280) * 100)) };
}

const weekContent = [
  { from: 1, to: 4, size: 'Poppy seed', baby: 'The fertilised egg is implanting and the earliest structures are beginning to form.', mother: 'You may notice tiredness, breast tenderness, or no symptoms at all.', checkup: 'Confirm the pregnancy and ask a healthcare professional about prenatal vitamins.' },
  { from: 5, to: 8, size: 'Raspberry', baby: 'The brain, spinal cord, and early heart structures are developing quickly.', mother: 'Nausea, food aversions, and fatigue are common during these weeks.', checkup: 'Arrange your first antenatal appointment and discuss any medicines you take.' },
  { from: 9, to: 12, size: 'Lime', baby: 'Major organs are formed and continue to mature while tiny limbs become more defined.', mother: 'Morning sickness may continue, and your waist may start to feel different.', checkup: 'Your clinic may offer routine blood tests and dating guidance.' },
  { from: 13, to: 16, size: 'Avocado', baby: 'Bones are hardening, facial features are clearer, and movement is increasing.', mother: 'Energy often improves, although headaches or stretching sensations can occur.', checkup: 'Continue regular antenatal visits and discuss screening options with your clinician.' },
  { from: 17, to: 20, size: 'Bell pepper', baby: 'Hearing is developing and you may begin to feel gentle movements.', mother: 'Your bump is more noticeable and back discomfort may begin.', checkup: 'An anatomy or anomaly scan is commonly planned around this stage.' },
  { from: 21, to: 24, size: 'Corn cob', baby: 'The baby is gaining weight and practising breathing movements.', mother: 'You may experience leg cramps, heartburn, or stronger movements.', checkup: 'Keep scheduled clinic visits and ask about healthy weight gain.' },
  { from: 25, to: 28, size: 'Cauliflower', baby: 'The lungs and nervous system are maturing, and the baby responds to sound.', mother: 'Sleep may become harder and swelling can appear in the feet.', checkup: 'Your care team may discuss blood pressure, anaemia, and glucose screening.' },
  { from: 29, to: 32, size: 'Coconut', baby: 'Rapid brain growth continues while body fat increases.', mother: 'Breathlessness, pelvic pressure, and frequent urination may increase.', checkup: 'Discuss baby movements and your birth plan at upcoming visits.' },
  { from: 33, to: 36, size: 'Pineapple', baby: 'The baby continues gaining weight and may settle into a head-down position.', mother: 'Braxton Hicks contractions and tiredness may become more noticeable.', checkup: 'Appointments may become more frequent; review signs of labour with your clinician.' },
  { from: 37, to: 40, size: 'Watermelon', baby: 'The baby is considered term and continues preparing for birth.', mother: 'Pelvic pressure and irregular contractions are common as labour approaches.', checkup: 'Follow your clinic schedule and seek urgent care for reduced movements, bleeding, severe pain, or fluid leakage.' },
];

function contentForWeek(week) {
  return weekContent.find((item) => week >= item.from && week <= item.to) || weekContent[weekContent.length - 1];
}

// ---- Routes ----

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MomCare LK API' }));

app.get('/api/profile', requireAuth, (req, res) => {
  const profile = pregnancyProfiles.find((item) => item.userId === req.user.id) || pregnancyProfiles[0];
  const summary = pregnancySummary(profile.lmpDate);
  res.json({ ...demoUser, name: req.user.name, ...summary });
});

app.get('/api/pregnancy', requireAuth, (req, res) => {
  const profile = pregnancyProfiles.find((item) => item.userId === req.user.id) || pregnancyProfiles[0];
  const summary = pregnancySummary(profile.lmpDate);
  res.json({ ...summary, weekInfo: contentForWeek(summary.currentWeek) });
});

app.put('/api/pregnancy', requireAuth, (req, res) => {
  const { lmpDate } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lmpDate || '')) return res.status(400).json({ error: 'A valid LMP date is required' });
  const parsed = new Date(`${lmpDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime()) || parsed > new Date()) return res.status(400).json({ error: 'LMP date cannot be in the future' });
  let profile = pregnancyProfiles.find((item) => item.userId === req.user.id);
  if (profile) profile.lmpDate = lmpDate;
  else {
    profile = { userId: req.user.id, lmpDate };
    pregnancyProfiles.push(profile);
  }
  const summary = pregnancySummary(lmpDate);
  res.json({ ...summary, weekInfo: contentForWeek(summary.currentWeek) });
});

app.get('/api/pregnancy/weeks/:week', requireAuth, (req, res) => {
  const week = Number(req.params.week);
  if (!Number.isInteger(week) || week < 1 || week > 40) return res.status(400).json({ error: 'Week must be between 1 and 40' });
  res.json({ week, ...contentForWeek(week) });
});

app.get('/api/appointments', requireAuth, (req, res) => {
  res.json(appointments.filter((item) => item.userId === req.user.id).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)));
});

app.post('/api/appointments', requireAuth, (req, res) => {
  const { hospital, doctor = '', date, time, type = 'Clinic appointment', notes = '', reminderEnabled = true } = req.body;
  if (!hospital || !date || !time) return res.status(400).json({ error: 'Hospital, date, and time are required' });
  const appointment = { id: nextId++, userId: req.user.id, hospital, doctor, date, time, type, notes, reminderEnabled: Boolean(reminderEnabled), completed: false };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

app.put('/api/appointments/:id', requireAuth, (req, res) => {
  const appointment = appointments.find((item) => item.id === Number(req.params.id) && item.userId === req.user.id);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
  const allowed = ['hospital', 'doctor', 'date', 'time', 'type', 'notes', 'reminderEnabled', 'completed'];
  allowed.forEach((key) => { if (req.body[key] !== undefined) appointment[key] = req.body[key]; });
  res.json(appointment);
});

app.delete('/api/appointments/:id', requireAuth, (req, res) => {
  const index = appointments.findIndex((item) => item.id === Number(req.params.id) && item.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Appointment not found' });
  appointments.splice(index, 1);
  res.status(204).send();
});

app.get('/api/reminders', (req, res) => res.json(reminders));
app.post('/api/reminders', (req, res) => {
  const { title, date, time } = req.body;
  const reminder = { id: nextId++, title, date, time, done: false };
  reminders.push(reminder);
  res.status(201).json(reminder);
});
app.patch('/api/reminders/:id', (req, res) => {
  const reminder = reminders.find((r) => r.id === Number(req.params.id));
  if (!reminder) return res.status(404).json({ error: 'Not found' });
  reminder.done = req.body.done ?? reminder.done;
  res.json(reminder);
});

app.get('/api/records', (req, res) => res.json(healthRecords));
app.post('/api/records', (req, res) => {
  const { date, weightKg, bpSystolic, bpDiastolic, notes } = req.body;
  const record = { id: nextId++, date, weightKg, bpSystolic, bpDiastolic, notes };
  healthRecords.push(record);
  res.status(201).json(record);
});

app.get('/api/forum', (req, res) => res.json(forumPosts));
app.post('/api/forum', (req, res) => {
  const { author, weekTag, text } = req.body;
  const post = { id: nextId++, author, weekTag, text, replies: 0, createdAt: new Date().toISOString() };
  forumPosts.unshift(post);
  res.status(201).json(post);
});

app.post('/api/mood', (req, res) => {
  const entry = { id: nextId++, mood: req.body.mood, date: new Date().toISOString() };
  moodLog.push(entry);
  res.status(201).json(entry);
});
app.get('/api/mood', (req, res) => res.json(moodLog));

app.post('/api/sos', (req, res) => {
  const event = {
    id: nextId++,
    location: req.body.location || { lat: 6.9271, lng: 79.8612 },
    contactsNotified: demoUser.emergencyContacts,
    createdAt: new Date().toISOString(),
  };
  sosEvents.push(event);
  res.status(201).json({ message: 'SOS alert sent (simulated)', event });
});

// Simulated AI assistant — will be connected to a real AI API later.
const aiAnswers = [
  { keywords: ['sleep', 'insomnia'], answer: 'Try sleeping on your left side with a pillow between your knees. Avoid screens an hour before bed. If insomnia persists, mention it at your next clinic visit.' },
  { keywords: ['food', 'eat', 'diet', 'nutrition'], answer: 'Focus on iron-rich foods (green leaves, lentils), calcium (milk, curd), and folate. Avoid raw fish, unpasteurised dairy, and limit caffeine to one cup per day.' },
  { keywords: ['pain', 'back'], answer: 'Mild back pain is common. Gentle stretching, warm compresses, and good posture help. Severe or sudden pain should be checked by your doctor immediately.' },
  { keywords: ['kick', 'movement'], answer: 'Most mothers feel movements between weeks 18–25. From week 28, count kicks daily — you should feel 10 movements within 2 hours. If not, contact your clinic.' },
];

app.post('/api/assistant', (req, res) => {
  const q = (req.body.question || '').toLowerCase();
  const match = aiAnswers.find((a) => a.keywords.some((k) => q.includes(k)));
  const answer = match
    ? match.answer
    : 'Thanks for your question! In the full version, our AI assistant will answer any pregnancy-related question. For now, try asking about sleep, diet, back pain, or baby movements. Always consult your doctor or midwife for medical concerns.';
  res.json({ answer, disclaimer: 'This is general guidance, not medical advice.' });
});

app.listen(PORT, () => console.log(`MomCare LK API running on http://localhost:${PORT}`));
