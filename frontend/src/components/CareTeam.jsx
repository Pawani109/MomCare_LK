import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, SectionTitle } from './Card';

const roleLabel = { mom: 'Mother', partner: 'Partner', doctor: 'Doctor / Midwife' };
const categoryLabel = { general: 'General care', appointment: 'Appointment', health: 'Health record', pregnancy: 'Pregnancy tracker' };

export default function CareTeam() {
  const { user } = useAuth();
  const [access, setAccess] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ category: 'general', text: '' });
  const [message, setMessage] = useState('');

  const load = async () => {
    const [accessData, commentsData] = await Promise.all([api.getAccess(), api.getCareComments()]);
    setAccess(accessData);
    setComments(commentsData);
  };

  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.addCareComment(form);
      setForm({ category: 'general', text: '' });
      setMessage('Comment added successfully.');
      await load();
    } catch (error) { setMessage(error.message); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Card className="bg-gradient-to-r from-violet-500 to-pink-500 !border-0 text-white">
        <p className="text-sm opacity-85">Signed in with</p>
        <p className="text-2xl font-bold mt-1">{roleLabel[user.role]}</p>
        <p className="text-sm mt-2 opacity-90">
          {user.role === 'mom' && 'You own and manage your pregnancy, appointment, and health information.'}
          {user.role === 'partner' && 'You can view shared family information and add supportive comments. Editing remains with the mother.'}
          {user.role === 'doctor' && 'You can review shared clinical information and add professional comments. You cannot edit the mother’s records.'}
        </p>
      </Card>

      <Card>
        <SectionTitle>👥 Linked care team</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-3">
          {access?.members?.map((member) => (
            <div key={member.id} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="font-semibold text-gray-800">{member.name}</p>
              <p className="text-sm text-purple-600 mt-1">{roleLabel[member.role]}</p>
              <p className="text-xs text-gray-400 mt-1">{member.email}</p>
            </div>
          ))}
        </div>
        {user.role === 'mom' && access?.familyCode && (
          <div className="mt-4 rounded-xl border border-pink-200 bg-pink-50 p-4">
            <p className="text-sm font-semibold text-pink-700">Family invitation code</p>
            <p className="text-2xl font-bold tracking-widest text-gray-800 mt-1">{access.familyCode}</p>
            <p className="text-xs text-gray-500 mt-1">Share this code only with your trusted partner or healthcare professional.</p>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>🔐 Permission summary</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b"><th className="py-2">Area</th><th className="py-2">Mother</th><th className="py-2">Partner</th><th className="py-2">Doctor / Midwife</th></tr></thead>
            <tbody>
              {[
                ['Pregnancy dates', 'View & edit', 'View only', 'View only'],
                ['Appointments', 'Add, edit & delete', 'View only', 'View only'],
                ['Health records', 'View & add', 'View only', 'View only'],
                ['Care comments', 'Add', 'Add', 'Add'],
              ].map((row) => <tr key={row[0]} className="border-b border-gray-50">{row.map((cell, i) => <td key={cell} className={`py-2 pr-3 ${i === 0 ? 'font-medium text-gray-700' : 'text-gray-500'}`}>{cell}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionTitle>💬 Care team comments</SectionTitle>
        <form onSubmit={submit} className="space-y-3 mb-5">
          <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {Object.entries(categoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <textarea className="field min-h-24" required maxLength={1000} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder={user.role === 'doctor' ? 'Add clinical guidance or a note for the mother...' : 'Add a note for the care team...'} />
          <button className="rounded-xl bg-purple-500 px-5 py-2.5 text-white font-medium hover:bg-purple-600">Add comment</button>
        </form>
        {message && <p className="mb-3 text-sm text-purple-600">{message}</p>}
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div><p className="font-semibold text-gray-800">{comment.authorName}</p><p className="text-xs text-purple-600">{roleLabel[comment.authorRole]} · {categoryLabel[comment.category]}</p></div>
                <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('en-US')}</p>
              </div>
              <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
