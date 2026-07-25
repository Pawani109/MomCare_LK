const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

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

// ---- Routes ----

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MomCare LK API' }));

app.get('/api/profile', (req, res) => {
  const start = new Date(demoUser.pregnancyStartDate);
  const now = new Date();
  const week = Math.min(40, Math.max(1, Math.floor((now - start) / (7 * 24 * 3600 * 1000)) + 1));
  res.json({ ...demoUser, currentWeek: week });
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
