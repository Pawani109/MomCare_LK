import { useLanguage } from '../context/LanguageContext';

export default function RoleNotice({ role, children }) {
  const { t } = useLanguage();
  const labels = { mom: t.roles.momAccess, partner: t.roles.partnerAccess, doctor: t.roles.doctorAccess };
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <p className="font-semibold">🔒 {labels[role] || t.roles.readOnly}</p>
      <p className="mt-1">{children || t.roles.readOnlyText}</p>
    </div>
  );
}
