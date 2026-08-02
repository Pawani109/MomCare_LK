import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Card, SectionTitle } from './Card';

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not supported by this browser.'));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      (error) => reject(new Error(error.code === 1 ? 'Location permission was denied. Enable it in your browser settings and try again.' : 'Your location could not be detected.')),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  });
}

const Shopping = () => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [category, setCategory] = useState('all');
  const [radius, setRadius] = useState(5000);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadPlaces = async (coords = location, nextCategory = category, nextRadius = radius) => {
    if (!coords) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getNearbyPlaces({ ...coords, category: nextCategory, radius: nextRadius });
      setPlaces(data.places || []);
      setSelected((data.places || [])[0] || null);
    } catch (err) {
      setPlaces([]);
      setSelected(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const locateAndSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const coords = await getLocation();
      setLocation(coords);
      await loadPlaces(coords);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => { locateAndSearch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPlaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return places;
    return places.filter((place) => `${place.name} ${place.address} ${place.subtype}`.toLowerCase().includes(q));
  }, [places, search]);

  const center = selected || location || DEFAULT_CENTER;
  const delta = 0.025;
  const bbox = `${center.lng - delta},${center.lat - delta},${center.lng + delta},${center.lat + delta}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${center.lat},${center.lng}`)}`;
  const directionsUrl = selected && location
    ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${selected.lat},${selected.lng}&travelmode=driving`
    : null;

  const changeCategory = (next) => {
    setCategory(next);
    loadPlaces(location, next, radius);
  };

  const changeRadius = (event) => {
    const next = Number(event.target.value);
    setRadius(next);
    loadPlaces(location, category, next);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <Card>
        <SectionTitle>🗺️ Nearby Hospitals & Baby Shops</SectionTitle>
        <p className="text-sm text-gray-500 mb-4">Search around your current location. Results are sorted by straight-line distance and come from OpenStreetMap.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {[['all', 'All places'], ['hospital', '🏥 Hospitals'], ['shop', '🛍️ Baby shops']].map(([value, label]) => (
            <button key={value} onClick={() => changeCategory(value)} disabled={!location || loading}
              className={`px-3 py-1.5 rounded-full text-sm ${category === value ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'} disabled:opacity-50`}>
              {label}
            </button>
          ))}
          <select value={radius} onChange={changeRadius} disabled={!location || loading} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 disabled:opacity-50">
            <option value={3000}>Within 3 km</option>
            <option value={5000}>Within 5 km</option>
            <option value={10000}>Within 10 km</option>
          </select>
          <button onClick={locateAndSearch} disabled={loading} className="rounded-full bg-purple-500 px-3 py-1.5 text-sm text-white disabled:opacity-50">
            {loading ? 'Searching…' : '📍 Use my location'}
          </button>
        </div>

        {location && <p className="mb-3 text-xs text-green-700">Location detected{location.accuracy ? ` (approximately ${Math.round(location.accuracy)} m accuracy)` : ''}. Your coordinates are used only for this nearby search.</p>}
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="overflow-hidden rounded-2xl border border-amber-100 bg-gray-100">
          <iframe title="Nearby place map" src={mapUrl} className="h-72 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <p className="mt-2 text-[11px] text-gray-400">Map and place data © OpenStreetMap contributors. Always call ahead to confirm services and opening hours.</p>
      </Card>

      <Card>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle>Nearby results</SectionTitle>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by name or area" className="field sm:max-w-xs" />
        </div>

        {!loading && !error && filteredPlaces.length === 0 && (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">No matching places were found within this radius. Try 10 km or select another category.</p>
        )}

        <div className="space-y-3">
          {filteredPlaces.map((place) => (
            <button key={place.id} onClick={() => setSelected(place)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === place.id ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-white hover:border-amber-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{place.type === 'hospital' ? '🏥' : '🛍️'} {place.name}</p>
                  <p className="mt-1 text-xs capitalize text-purple-500">{String(place.subtype || place.type).replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-sm text-gray-500">{place.address || 'Address not supplied in OpenStreetMap'}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{place.distanceKm.toFixed(1)} km</span>
              </div>
              {(place.phone || place.openingHours) && <p className="mt-2 text-xs text-gray-500">{place.phone ? `☎ ${place.phone}` : ''}{place.phone && place.openingHours ? ' · ' : ''}{place.openingHours ? `🕒 ${place.openingHours}` : ''}</p>}
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-4 rounded-2xl bg-purple-50 p-4">
            <p className="font-semibold text-purple-800">Selected: {selected.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {directionsUrl && <a href={directionsUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white">Get directions</a>}
              {selected.phone && <a href={`tel:${selected.phone.replace(/[^+\d]/g, '')}`} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-purple-700 border border-purple-200">Call</a>}
              {selected.website && <a href={selected.website} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-purple-700 border border-purple-200">Website</a>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Shopping;
