
import { useEffect, useRef, useState } from 'react';

let loaderPromise;
function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const callback = `momcareGoogleMapsReady_${Date.now()}`;
    window[callback] = () => {
      delete window[callback];
      resolve(window.google.maps);
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callback}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Google Maps JavaScript API could not be loaded.'));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

const markerIcon = (type) => type === 'hospital' ? '🏥' : type === 'pharmacy' ? '💊' : '🛍️';

const GooglePlacesMap = ({ center, places, selected, onSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const [error, setError] = useState('');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current || !center) return;
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled) return;
        if (!mapInstance.current) {
          mapInstance.current = new maps.Map(mapRef.current, {
            center: { lat: center.lat, lng: center.lng },
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
        } else {
          mapInstance.current.setCenter({ lat: center.lat, lng: center.lng });
        }
      })
      .catch((err) => setError(err.message));
    return () => { cancelled = true; };
  }, [apiKey, center?.lat, center?.lng]);

  useEffect(() => {
    if (!apiKey || !mapInstance.current || !window.google?.maps) return;
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: center.lat, lng: center.lng });

    places.forEach((place) => {
      const marker = new window.google.maps.Marker({
        map: mapInstance.current,
        position: { lat: place.lat, lng: place.lng },
        title: place.name,
        label: { text: markerIcon(place.type), fontSize: '20px' },
      });
      marker.addListener('click', () => onSelect?.(place));
      markers.current.push(marker);
      bounds.extend(marker.getPosition());
    });
    if (places.length) mapInstance.current.fitBounds(bounds, 60);
  }, [apiKey, places, center, onSelect]);

  useEffect(() => {
    if (selected && mapInstance.current) {
      mapInstance.current.panTo({ lat: selected.lat, lng: selected.lng });
      if ((mapInstance.current.getZoom() || 0) < 15) mapInstance.current.setZoom(15);
    }
  }, [selected]);

  if (!apiKey) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-pink-100 bg-pink-50 p-6 text-center text-sm text-pink-800">
        Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env to display the interactive Google map. Place search can still work through the backend.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-pink-100 bg-gray-100">
      {error ? <div className="flex h-72 items-center justify-center p-6 text-sm text-red-600">{error}</div> : <div ref={mapRef} className="h-80 w-full" />}
    </div>
  );
};

export default GooglePlacesMap;
