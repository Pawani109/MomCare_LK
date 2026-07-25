import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, SectionTitle } from './Card';

const places = [
  { name: 'Castle Street Hospital for Women', type: 'hospital', distance: '2.1 km', city: 'Colombo 08' },
  { name: 'De Soysa Hospital for Women', type: 'hospital', distance: '3.4 km', city: 'Colombo 08' },
  { name: 'Ninewells Hospital', type: 'hospital', distance: '5.0 km', city: 'Colombo 05' },
  { name: 'Baby Cheramy Store', type: 'shop', distance: '1.2 km', city: 'Nugegoda' },
  { name: 'Mothercare Lanka', type: 'shop', distance: '2.8 km', city: 'Colombo 03' },
  { name: 'Kiddies & Toys', type: 'shop', distance: '3.1 km', city: 'Dehiwala' },
];

const Shopping = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const list = places.filter((p) => filter === 'all' || p.type === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Card>
        <SectionTitle>🗺️ {t.finder}</SectionTitle>
        <p className="text-sm text-gray-500 mb-4">{t.finderDesc}</p>
        <div className="flex gap-2 mb-4">
          {['all', 'hospital', 'shop'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-sm capitalize ${filter === f ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {f === 'all' ? 'All' : f === 'hospital' ? '🏥 Hospitals' : '🛍️ Baby Shops'}
            </button>
          ))}
        </div>
        <ul className="space-y-2">
          {list.map((p) => (
            <li key={p.name} className="flex justify-between items-center bg-amber-50/50 border border-amber-100 rounded-xl px-3 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">{p.type === 'hospital' ? '🏥' : '🛍️'} {p.name}</p>
                <p className="text-xs text-gray-500">{p.city}</p>
              </div>
              <span className="text-amber-600 font-medium">{p.distance}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Shopping;
