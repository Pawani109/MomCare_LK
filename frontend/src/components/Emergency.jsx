import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, SectionTitle } from './Card';
import { useLanguage } from '../context/LanguageContext';

const emptyContact = { name: '', relationship: '', phone: '', priority: 1 };

function getCurrentLocation(messages) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(messages.notSupported));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }),
      (error) => reject(new Error(error.code === 1
        ? messages.denied
        : messages.failed)),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  });
}

function smsLink(phone, message) {
  const separator = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
  return `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
}

const Emergency = () => {
  const { t } = useLanguage();
  const et = t.emergency;
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [permissions, setPermissions] = useState({ canManage: false, canTrigger: false });
  const [form, setForm] = useState(emptyContact);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [latest, setLatest] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [contactData, history] = await Promise.all([api.getEmergencyContacts(), api.getSosHistory()]);
      setContacts(contactData.contacts);
      setPermissions({ canManage: contactData.canManage, canTrigger: contactData.canTrigger });
      setEvents(history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)),
    [contacts],
  );

  const resetForm = () => {
    setForm(emptyContact);
    setEditingId(null);
  };

  const saveContact = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      if (editingId) await api.updateEmergencyContact(editingId, form);
      else await api.addEmergencyContact(form);
      resetForm();
      setNotice(editingId ? 'Emergency contact updated.' : 'Emergency contact saved.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const editContact = (contact) => {
    setEditingId(contact.id);
    setForm({ name: contact.name, relationship: contact.relationship, phone: contact.phone, priority: contact.priority });
  };

  const removeContact = async (id) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    try {
      await api.deleteEmergencyContact(id);
      setNotice('Emergency contact removed.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const triggerSos = async () => {
    if (!permissions.canTrigger || sending) return;
    setSending(true);
    setError('');
    setNotice(et.requesting);
    let location = null;
    try {
      location = await getCurrentLocation(et);
    } catch (locationError) {
      const continueWithoutLocation = window.confirm(`${locationError.message}\n\nSend the SOS without location?`);
      if (!continueWithoutLocation) {
        setSending(false);
        setNotice('SOS cancelled. No alert was created.');
        return;
      }
    }

    try {
      const result = await api.sendSos({ location });
      setLatest(result.event);
      setEvents((current) => [result.event, ...current]);
      setNotice('SOS prepared. Confirm the share action on your device.');

      if (navigator.share) {
        try {
          await navigator.share({ title: 'MomCare LK SOS', text: result.event.message });
          setNotice('SOS shared using your device share sheet. Please also call if danger is immediate.');
        } catch (shareError) {
          if (shareError.name !== 'AbortError') setNotice('SOS prepared. Use the SMS or call buttons below.');
        }
      } else {
        setNotice('SOS prepared. This browser cannot open a share sheet, so use the SMS or call buttons below.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <Card className="text-center border-2 border-red-100">
        <SectionTitle>🚨 {et.title}</SectionTitle>
        <p className="text-sm text-gray-600 max-w-xl mx-auto mb-2">
          Captures your current location and prepares an emergency message for your saved contacts.
        </p>
        <p className="text-xs text-red-600 mb-6">
          In immediate danger, call your local emergency service. A browser cannot silently send an SMS without your confirmation.
        </p>
        <button
          type="button"
          onClick={triggerSos}
          disabled={!permissions.canTrigger || sending || contacts.length === 0}
          className="w-44 h-44 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-2xl font-bold shadow-xl shadow-red-200 hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:hover:scale-100"
          aria-label="Send emergency SOS"
        >
          {sending ? et.locating : et.button}
        </button>
        {!permissions.canTrigger && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
            Doctor/midwife access is view-only for SOS. Only the mother or linked partner can trigger an alert.
          </p>
        )}
        {permissions.canTrigger && contacts.length === 0 && !loading && (
          <p className="mt-4 text-sm text-amber-700">{et.needContact}</p>
        )}
        {notice && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">{notice}</p>}
        {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}
      </Card>

      {latest && (
        <Card>
          <SectionTitle>{et.history}</SectionTitle>
          <p className="text-sm text-gray-700 whitespace-pre-line bg-red-50 border border-red-100 rounded-xl p-3">{latest.message}</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            {latest.contacts.map((contact) => (
              <div key={contact.id} className="border border-gray-200 rounded-xl p-3">
                <p className="font-medium text-gray-800">{contact.name}</p>
                <p className="text-xs text-gray-500 mb-2">{contact.relationship || 'Emergency contact'} · {contact.phone}</p>
                <div className="flex gap-2">
                  <a href={smsLink(contact.phone, latest.message)} className="flex-1 text-center rounded-lg bg-purple-100 text-purple-700 px-3 py-2 text-sm font-medium">{et.sms}</a>
                  <a href={`tel:${contact.phone}`} className="flex-1 text-center rounded-lg bg-red-500 text-white px-3 py-2 text-sm font-medium">{et.call}</a>
                </div>
              </div>
            ))}
          </div>
          {latest.mapUrl && <a href={latest.mapUrl} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-blue-600 underline">{et.openMaps}</a>}
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <SectionTitle>📞 {et.contacts}</SectionTitle>
          <span className="text-xs text-gray-500">{contacts.length}/5 saved</span>
        </div>

        {permissions.canManage && (
          <form onSubmit={saveContact} className="grid sm:grid-cols-2 gap-3 bg-pink-50 border border-pink-100 rounded-xl p-4 mb-4">
            <input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={et.name} className="rounded-lg border-gray-200" />
            <input maxLength={50} value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder={et.relationship} className="rounded-lg border-gray-200" />
            <input required inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={et.phone} className="rounded-lg border-gray-200" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="rounded-lg border-gray-200">
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>Priority {value}</option>)}
            </select>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="rounded-lg bg-pink-500 text-white px-4 py-2 text-sm font-medium">{editingId ? et.updateContact : et.saveContact}</button>
              {editingId && <button type="button" onClick={resetForm} className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm">{t.cancel}</button>}
            </div>
          </form>
        )}

        {loading ? <p className="text-sm text-gray-400">Loading contacts…</p> : (
          <div className="space-y-2">
            {sortedContacts.map((contact) => (
              <div key={contact.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-red-100 bg-red-50/40 rounded-xl px-3 py-3">
                <div>
                  <p className="font-medium text-gray-800">{contact.priority}. {contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.relationship || 'Emergency contact'} · {contact.phone}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${contact.phone}`} className="rounded-lg bg-red-500 text-white px-3 py-2 text-sm">{et.call}</a>
                  {permissions.canManage && <button type="button" onClick={() => editContact(contact)} className="rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm">Edit</button>}
                  {permissions.canManage && <button type="button" onClick={() => removeContact(contact.id)} className="rounded-lg bg-white border border-red-200 text-red-600 px-3 py-2 text-sm">Delete</button>}
                </div>
              </div>
            ))}
            {!contacts.length && <p className="text-sm text-gray-500">No emergency contacts saved.</p>}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>🕘 SOS history</SectionTitle>
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-xl p-3 text-sm">
              <div className="flex justify-between gap-3">
                <p className="font-medium text-gray-800">Triggered by {event.triggeredByName}</p>
                <time className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleString()}</time>
              </div>
              <p className="text-xs text-gray-500 mt-1">{event.location ? `Location captured (±${Math.round(event.location.accuracy || 0)} m)` : 'Sent without location'} · {event.contacts.length} contact(s)</p>
            </div>
          ))}
          {!events.length && <p className="text-sm text-gray-500">No SOS events have been created.</p>}
        </div>
      </Card>

      <p className="text-xs text-gray-400 text-center">Signed in as {user?.role === 'doctor' ? 'Doctor / Midwife' : user?.role}.</p>
    </div>
  );
};

export default Emergency;
