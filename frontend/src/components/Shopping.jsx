
import { useCallback, useMemo, useState } from 'react';
import { api } from '../api';
import { Card, SectionTitle } from './Card';
import { useLanguage } from '../context/LanguageContext';
import GooglePlacesMap from './GooglePlacesMap';

const COLOMBO_CENTER = { lat: 6.9271, lng: 79.8612, accuracy: null };

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext && location.hostname !== 'localhost') return reject(new Error('HTTPS_REQUIRED'));
    if (!navigator.geolocation) return reject(new Error('NOT_SUPPORTED'));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      (error) => reject(new Error(error.code === 1 ? 'DENIED' : 'FAILED')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}

const placeIcon = (type) => type === 'hospital' ? '🏥' : type === 'pharmacy' ? '💊' : '🛍️';

const Shopping = () => {
  const { t } = useLanguage();
  const f = t.finder;
  const [location, setLocation] = useState(null);
  const [manualLat, setManualLat] = useState('6.9271');
  const [manualLng, setManualLng] = useState('79.8612');
  const [places, setPlaces] = useState([]);
  const [category, setCategory] = useState('all');
  const [radius, setRadius] = useState(5000);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serviceNotice, setServiceNotice] = useState('');
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');

  const loadPlaces = useCallback(async (coords, nextCategory = category, nextRadius = radius) => {
    if (!coords) return;
    setLoading(true); setError(''); setServiceNotice('');
    try {
      const data = await api.getNearbyPlaces({ ...coords, category: nextCategory, radius: nextRadius });
      const nextPlaces = data.places || [];
      setPlaces(nextPlaces); setSelected(nextPlaces[0] || null); setSource(data.source || '');
      if (data.message) setServiceNotice(data.message);
      if (!nextPlaces.length && !data.message) setError(f.noResults);
    } catch (err) {
      setPlaces([]); setSelected(null); setError(err.message);
    } finally { setLoading(false); }
  }, [category, radius, f.noResults]);

  const locateAndSearch = async () => {
    setLoading(true); setError('');
    try {
      const coords = await getLocation();
      setLocation(coords); setManualLat(String(coords.lat)); setManualLng(String(coords.lng));
      await loadPlaces(coords);
    } catch (err) {
      setError(err.message === 'HTTPS_REQUIRED' ? f.gpsHttps : err.message === 'DENIED' ? t.emergency.denied : err.message === 'NOT_SUPPORTED' ? t.emergency.notSupported : t.emergency.failed);
      setLoading(false);
    }
  };

  const useManualLocation = async () => {
    const lat = Number(manualLat), lng = Number(manualLng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) return setError(f.invalid);
    const coords = { lat, lng, accuracy: null }; setLocation(coords); await loadPlaces(coords);
  };
  const useColombo = async () => { setManualLat(String(COLOMBO_CENTER.lat)); setManualLng(String(COLOMBO_CENTER.lng)); setLocation(COLOMBO_CENTER); await loadPlaces(COLOMBO_CENTER); };

  const filteredPlaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? places.filter((p) => `${p.name} ${p.address} ${p.subtype}`.toLowerCase().includes(q)) : places;
  }, [places, search]);

  const changeCategory = (next) => { setCategory(next); if (location) loadPlaces(location, next, radius); };
  const changeRadius = (e) => { const next = Number(e.target.value); setRadius(next); if (location) loadPlaces(location, category, next); };
  const directionsUrl = selected ? (selected.googleMapsUri || `https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination=${selected.lat},${selected.lng}&travelmode=driving`) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Card>
        <SectionTitle>📍 {f.title}</SectionTitle>
        <p className="text-sm text-gray-500 mb-4">{f.desc}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={locateAndSearch} disabled={loading} className="rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? t.loading : `📍 ${f.useLocation}`}</button>
          <button onClick={useColombo} disabled={loading} className="rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm text-pink-700 disabled:opacity-50">{f.colombo}</button>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] mb-4">
          <input value={manualLat} onChange={(e) => setManualLat(e.target.value)} className="field" placeholder={f.latitude} inputMode="decimal" />
          <input value={manualLng} onChange={(e) => setManualLng(e.target.value)} className="field" placeholder={f.longitude} inputMode="decimal" />
          <button onClick={useManualLocation} disabled={loading} className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{f.searchHere}</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            ['all', f.all], ['hospital', `🏥 ${f.hospitals}`], ['pharmacy', `💊 ${f.pharmacies}`], ['baby_shop', `🛍️ ${f.shops}`],
          ].map(([value, label]) => (
            <button key={value} onClick={() => changeCategory(value)} disabled={!location || loading} className={`px-3 py-1.5 rounded-full text-sm ${category === value ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-700 border border-pink-200'} disabled:opacity-50`}>{label}</button>
          ))}
          <select value={radius} onChange={changeRadius} disabled={!location || loading} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 disabled:opacity-50">
            {[3,5,10,15].map((km) => <option key={km} value={km*1000}>{f.within.replace('{km}', String(km))}</option>)}
          </select>
        </div>

        {location && <p className="mb-3 text-xs text-green-700">{f.centre}: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}{location.accuracy ? ` (±${Math.round(location.accuracy)} m)` : ''}</p>}
        {source && <p className="mb-3 text-xs text-gray-400">{f.source}: {source}</p>}
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {serviceNotice && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{serviceNotice}</div>}

        <GooglePlacesMap center={location || COLOMBO_CENTER} places={filteredPlaces} selected={selected} onSelect={setSelected} />
        <p className="mt-2 text-[11px] text-gray-400">{f.mapNote}</p>
      </Card>

      <Card>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle>{f.results}</SectionTitle>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={f.filter} className="field sm:max-w-xs" />
        </div>
        {!loading && !error && filteredPlaces.length === 0 && <p className="rounded-xl bg-pink-50 p-4 text-sm text-pink-800">{f.start}</p>}
        <div className="space-y-3">
          {filteredPlaces.map((place) => (
            <button key={place.id} onClick={() => setSelected(place)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === place.id ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-white hover:border-pink-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800">{placeIcon(place.type)} {place.name}</p>
                  <p className="mt-1 text-xs capitalize text-purple-500">{String(place.subtype || place.type).replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-sm text-gray-500">{place.address || f.addressUnavailable}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    {place.rating != null && <span>⭐ {place.rating.toFixed(1)}{place.userRatingCount ? ` (${place.userRatingCount})` : ''}</span>}
                    {place.openNow != null && <span className={place.openNow ? 'text-green-600' : 'text-red-500'}>{place.openNow ? f.openNow : f.closedNow}</span>}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-700">{place.distanceKm.toFixed(1)} km</span>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-4 rounded-2xl bg-purple-50 p-4">
            <p className="font-semibold text-purple-800">{f.selected}: {selected.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {directionsUrl && <a href={directionsUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white">{f.directions}</a>}
              {selected.phone && <a href={`tel:${selected.phone.replace(/[^+\d]/g, '')}`} className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700">{t.call}</a>}
              {selected.website && <a href={selected.website} target="_blank" rel="noreferrer" className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700">{t.view}</a>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Shopping;
