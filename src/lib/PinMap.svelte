<script module lang="ts">
  let previousCandidateIndex = -1;

  export type MapPin = {
    key: string; name: string; city: string; state: string; country: string;
    latitude: number; longitude: number; firstVisit: string; visits: string;
    type: 'Aquarium' | 'Zoo' | 'Art' | 'Museum' | 'Theater' | 'Nature' | 'Other';
    image: string; note: string;
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';

  let { pins, onselect }: { pins: MapPin[]; onselect: (pin: MapPin) => void } = $props();
  let mapElement: HTMLDivElement;
  let mapLoaded = $state(false);
  let mapError = $state(false);

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
    let candidateIndex = Math.floor(Math.random() * candidates.length);
    if (candidates.length > 1 && candidateIndex === previousCandidateIndex) candidateIndex = (candidateIndex + 1) % candidates.length;
    previousCandidateIndex = candidateIndex;
    return candidates[candidateIndex];
  }

  onMount(() => {
    let disposed = false;
    let cleanup = () => {};

    void import('leaflet').then((leaflet) => {
      if (disposed) return;
      const L = leaflet.default ?? leaflet;
      const map = L.map(mapElement, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
        worldCopyJump: true
      });
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      });
      let failedTiles = 0;
      tiles.on('load', () => { mapLoaded = true; mapError = false; });
      tiles.on('tileerror', () => {
        failedTiles += 1;
        if (failedTiles >= 4 && !mapLoaded) mapError = true;
      });
      tiles.addTo(map);

      for (const pin of pins) {
        const width = 42;
        const height = 42;
        const icon = L.divIcon({
          className: 'pin-map-icon',
          iconSize: [width, height],
          iconAnchor: [width / 2, height / 2],
          html: `<img src="${escapeHtml(pin.image)}" alt=""><span>${escapeHtml(pin.name)}</span>`
        });
        const marker = L.marker([pin.latitude, pin.longitude], { icon, keyboard: true, title: pin.name }).addTo(map);
        marker.on('click', () => onselect(pin));
        marker.on('mouseover focus', () => marker.setZIndexOffset(10_000));
        marker.on('mouseout blur', () => marker.setZIndexOffset(0));
      }

      if (!pins.length) {
        map.setView([20, 0], 2, { animate: false });
      } else {
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
      }

      const resizeObserver = new ResizeObserver(() => map.invalidateSize({ animate: false }));
      resizeObserver.observe(mapElement);
      cleanup = () => { resizeObserver.disconnect(); map.remove(); };
    }).catch((error) => {
      console.error('Unable to initialize the pin map.', error);
      mapError = true;
    });

    return () => { disposed = true; cleanup(); };
  });
</script>

<div class="map" bind:this={mapElement}></div>
{#if !mapLoaded && !mapError}<p class="map-status">Loading map…</p>{/if}
{#if mapError}<p class="map-status error">The map tiles could not load. Check your connection or content blocker, then refresh.</p>{/if}

<style>
  .map { width: 100%; height: 100%; background: #b9c9bd; }
  .map-status { position: absolute; inset: 50% auto auto 50%; z-index: 1001; transform: translate(-50%, -50%); margin: 0; padding: .55rem .8rem; background: #edf0e4e8; color: #302b24; font-size: .8rem; text-align: center; pointer-events: none; }
  .map-status.error { width: min(22rem, calc(100% - 2rem)); }
  :global(.pin-map-icon) { background: transparent; border: 0; }
  :global(.pin-map-icon img) { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 3px 2px #22332b66); transition: transform .2s ease; }
  :global(.pin-map-icon span) { position: absolute; top: 100%; left: 50%; z-index: 1; width: max-content; max-width: 9rem; transform: translateX(-50%); padding: .15rem .3rem; background: #edf0e4ed; color: #302b24; font-family: Georgia, 'Times New Roman', serif; font-size: .67rem; line-height: 1.1; text-align: center; opacity: 0; pointer-events: none; }
  :global(.pin-map-icon:hover), :global(.pin-map-icon:focus) { z-index: 1000 !important; }
  :global(.pin-map-icon:hover img), :global(.pin-map-icon:focus img) { transform: scale(1.12); }
  :global(.pin-map-icon:hover span), :global(.pin-map-icon:focus span) { opacity: 1; }
  :global(.leaflet-control-attribution) { font-size: 8px; }
  @media (prefers-reduced-motion: reduce) { :global(.pin-map-icon img) { transition: none; } }
</style>
