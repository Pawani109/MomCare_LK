/* eslint-disable react/prop-types */
const labels = {
  mom: 'Mother access',
  partner: 'Partner access',
  doctor: 'Doctor / Midwife access',
};

export default function RoleNotice({ role, children }) {
  if (role === 'mom') return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <p className="font-semibold">🔒 {labels[role] || 'Read-only access'}</p>
      <p className="mt-1">{children || 'You can view the mother’s shared information, but you cannot change it.'}</p>
    </div>
  );
}
