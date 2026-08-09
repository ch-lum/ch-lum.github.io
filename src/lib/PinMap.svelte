<script module lang="ts">
  export type MapPin = {
    key: string; name: string; city: string; state: string; country: string;
    latitude: number; longitude: number; firstVisit: string; visits: string;
    type: 'Aquarium' | 'Zoo' | 'Art' | 'Museum' | 'Other';
    width: number; height: number; image: string; note: string;
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';

  let { pins, onselect }: { pins: MapPin[]; onselect: (pin: MapPin) => void } = $props();
  let mapElement: HTMLDivElement;

  function escapeHtml(value: string) {
    return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
  }

  function startingGroup() {
    const candidates: { level: 'city' | 'state' | 'country'; pins: MapPin[] }[] = [];
    const addGroups = (level: 'city' | 'state' | 'country', keyFor: (pin: MapPin) => string) => {
      const groups = new Map<string, MapPin[]>();
      for (const pin of pins) {
        const key = keyFor(pin).trim().toLowerCase();
        if (!key || key.includes('unknown')) continue;
        groups.set(key, [...(groups.get(key) ?? []), pin]);
      }
      for (const groupedPins of groups.values()) if (groupedPins.length >= 3) candidates.push({ level, pins: groupedPins });
    };
    addGroups('city', (pin) => `${pin.city}|${pin.state}|${pin.country}`);
    addGroups('state', (pin) => pin.state ? `${pin.state}|${pin.country}` : '');
    addGroups('country', (pin) => pin.country);
    if (!candidates.length) return { level: 'country' as const, pins };
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  onMount(() => {
    let disposed = false;
    let cleanup = () => {};

    void import('leaflet').then((leaflet) => {
      if (disposed) return;
      const L = leaflet.default;
      const map = L.map(mapElement, { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const seen = new Map<string, number>();

      for (const pin of pins) {
        const location = `${pin.latitude.toFixed(3)},${pin.longitude.toFixed(3)}`;
        const duplicate = seen.get(location) ?? 0;
        seen.set(location, duplicate + 1);
        const angle = duplicate * 2.4;
        const latitude = pin.latitude + (duplicate ? Math.sin(angle) * .025 * duplicate : 0);
        const longitude = pin.longitude + (duplicate ? Math.cos(angle) * .025 * duplicate : 0);
        const width = Math.max(32, pin.width * 38);
        const height = Math.max(32, pin.height * 38);
        const icon = L.divIcon({
          className: 'pin-map-icon',
          iconSize: [width, height],
          iconAnchor: [width / 2, height / 2],
          html: `<img src="${escapeHtml(pin.image)}" alt=""><span>${escapeHtml(pin.name)}</span>`
        });
        L.marker([latitude, longitude], { icon, keyboard: true, title: pin.name }).addTo(map).on('click', () => onselect(pin));
      }

      const start = startingGroup();
      const startLatitudes = start.pins.map((pin) => pin.latitude);
      const startLongitudes = start.pins.map((pin) => pin.longitude);
      const minLat = Math.min(...startLatitudes), maxLat = Math.max(...startLatitudes);
      const minLon = Math.min(...startLongitudes), maxLon = Math.max(...startLongitudes);
      const center: [number, number] = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
      if (maxLat - minLat < .001 && maxLon - minLon < .001) {
        map.setView(center, start.level === 'city' ? 11 : start.level === 'state' ? 7 : 5, { animate: false });
      } else {
        map.fitBounds([[minLat, minLon], [maxLat, maxLon]], {
          padding: [45, 45],
          maxZoom: start.level === 'city' ? 11 : start.level === 'state' ? 7 : 5,
          animate: false
        });
      }

      const resizeObserver = new ResizeObserver(() => map.invalidateSize({ animate: false }));
      resizeObserver.observe(mapElement);
      cleanup = () => { resizeObserver.disconnect(); map.remove(); };
    });

    return () => { disposed = true; cleanup(); };
  });
</script>

<div class="map" bind:this={mapElement}></div>

<style>
  .map { width: 100%; height: 100%; background: #b9c9bd; }
  :global(.pin-map-icon) { background: transparent; border: 0; }
  :global(.pin-map-icon img) { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 3px 2px #22332b66); transition: transform .2s ease; }
  :global(.pin-map-icon span) { position: absolute; top: 100%; left: 50%; width: max-content; max-width: 9rem; transform: translateX(-50%); padding: .15rem .3rem; background: #edf0e4ed; color: #302b24; font-family: Georgia, 'Times New Roman', serif; font-size: .67rem; line-height: 1.1; text-align: center; opacity: 0; pointer-events: none; }
  :global(.pin-map-icon:hover), :global(.pin-map-icon:focus) { z-index: 1000 !important; }
  :global(.pin-map-icon:hover img), :global(.pin-map-icon:focus img) { transform: scale(1.12); }
  :global(.pin-map-icon:hover span), :global(.pin-map-icon:focus span) { opacity: 1; }
  :global(.leaflet-control-attribution) { font-size: 8px; }
  @media (prefers-reduced-motion: reduce) { :global(.pin-map-icon img) { transition: none; } }
</style>
