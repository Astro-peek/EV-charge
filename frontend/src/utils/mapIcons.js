import L from "leaflet";

// Custom User Marker Icon (Pulsing Dot)
export const userIcon = L.divIcon({
  className: "user-marker-icon",
  html: '<div class="user-marker-pulse"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom Premium Station Icon (Green Square with Zap)
export const premiumStationIcon = L.divIcon({
  className: "custom-station-icon",
  html: `
    <div class="station-marker-outer">
      <div class="station-marker-inner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path>
          <line x1="10" y1="9" x2="10" y2="15"></line>
          <polyline points="14 12 10 12"></polyline>
          <path d="M22 11h-4"></path>
          <path d="M22 15h-4"></path>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Selected Premium Station Icon (Gold/Blue)
export const selectedStationIcon = L.divIcon({
  className: "custom-station-icon selected-station",
  html: `
    <div class="station-marker-outer" style="background: #eab308; box-shadow: 0 4px 16px rgba(234, 179, 8, 0.6); transform: scale(1.15);">
      <div class="station-marker-inner" style="color: #fff;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path>
          <line x1="10" y1="9" x2="10" y2="15"></line>
          <polyline points="14 12 10 12"></polyline>
          <path d="M22 11h-4"></path>
          <path d="M22 15h-4"></path>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Custom Unselected Station Icon (Small Gray Dot)
export const unselectedStationIcon = L.divIcon({
  className: "unselected-station-icon",
  html: `
    <div style="width: 20px; height: 20px; background: #94a3b8; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);"></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});
