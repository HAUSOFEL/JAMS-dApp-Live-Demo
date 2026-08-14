/**
 * Static point-of-interest seed for the Kitchener–Waterloo map canvas.
 * Coordinates are percentages within the map surface (0-100), matching MapMarker.
 * Maps 1:1 onto a future `map_pois` table.
 */
export type PoiCategory = "cafe" | "transit" | "art" | "food" | "park"

export interface CityPoi {
  id: string
  name: string
  category: PoiCategory
  /** Neighbourhood / cross-street context shown in the POI card. */
  area: string
  detail: string
  x: number
  y: number
}

export const POI_CATEGORIES: Record<PoiCategory, { label: string; glyph: string }> = {
  cafe: { label: "Cafe", glyph: "☕" },
  transit: { label: "Transit", glyph: "🚊" },
  art: { label: "Art space", glyph: "🎨" },
  food: { label: "Food", glyph: "🍜" },
  park: { label: "Park", glyph: "🌳" },
}

export const CITY_POIS: CityPoi[] = [
  // Uptown Waterloo
  { id: "poi-1", name: "Settlement Co.", category: "cafe", area: "Uptown Waterloo · King St N", detail: "Third-wave espresso bar, opens 7am on jam days.", x: 24, y: 26 },
  { id: "poi-2", name: "Waterloo Public Square", category: "park", area: "Uptown Waterloo", detail: "Open plaza used for the main breaking stage.", x: 31, y: 30 },
  { id: "poi-3", name: "Waterloo Public Square ION", category: "transit", area: "ION Line 1 · Northbound", detail: "Light rail stop, 2 min walk from Stage 1.", x: 37, y: 24 },
  { id: "poi-4", name: "Button Factory Arts", category: "art", area: "Regina St S", detail: "Community art studios + rehearsal floor space.", x: 20, y: 38 },
  { id: "poi-5", name: "Bhima's Warung", category: "food", area: "King St N", detail: "Late-night Indonesian, crew favourite after cyphers.", x: 27, y: 43 },
  { id: "poi-6", name: "Waterloo Park", category: "park", area: "Father David Bauer Dr", detail: "Green space with the outdoor practice pads.", x: 14, y: 32 },

  // Midtown corridor
  { id: "poi-7", name: "Grand River Transit Hub", category: "transit", area: "Midtown · Allen ION", detail: "Bus + ION interchange serving all jam venues.", x: 45, y: 44 },
  { id: "poi-8", name: "Shorty's Coffee", category: "cafe", area: "Midtown · Erb St E", detail: "Cash-only counter, free refills for volunteers.", x: 41, y: 52 },
  { id: "poi-9", name: "Iron Horse Trail Mural", category: "art", area: "Iron Horse Trail", detail: "Rotating graffiti wall, legal paint zone.", x: 52, y: 51 },

  // Downtown Kitchener
  { id: "poi-10", name: "Kitchener Youth Arts Center", category: "art", area: "Downtown Kitchener", detail: "Workshops, floor practice, qualifier bracket venue.", x: 66, y: 58 },
  { id: "poi-11", name: "Kitchener Market ION", category: "transit", area: "ION Line 1 · Charles St", detail: "Closest stop to the practice hub.", x: 72, y: 53 },
  { id: "poi-12", name: "Death Valley's Little Brother", category: "cafe", area: "Queen St S", detail: "Tiny espresso room, standing only.", x: 61, y: 64 },
  { id: "poi-13", name: "Kitchener Market", category: "food", area: "Duke St E", detail: "Saturday market stalls, cheap eats for crews.", x: 76, y: 62 },
  { id: "poi-14", name: "Victoria Park", category: "park", area: "Downtown Kitchener", detail: "Pavilion lawn used for overflow cyphers.", x: 58, y: 71 },
  { id: "poi-15", name: "CAFKA Gallery", category: "art", area: "Gaukel St", detail: "Contemporary art space, projection collabs.", x: 70, y: 70 },
  { id: "poi-16", name: "Gaukel Block Bites", category: "food", area: "Gaukel St", detail: "Food truck lot open past midnight.", x: 64, y: 77 },
  { id: "poi-17", name: "Central Station ION", category: "transit", area: "Duke St W", detail: "Transfer point toward the TO cypher bus.", x: 82, y: 46 },
  { id: "poi-18", name: "Grand Trunk Coffee", category: "cafe", area: "Breithaupt Block", detail: "Warehouse-district roaster with patio.", x: 87, y: 66 },
]

/**
 * Deterministic pseudo-random generator so building footprints stay stable
 * across renders without storing a large hand-written dataset.
 */
function rand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export interface BuildingFootprint {
  id: string
  /** Percentage geometry within the map surface. */
  x: number
  y: number
  w: number
  h: number
  /** Storeys — drives the extrusion height of the 3D block. */
  storeys: number
}

/** Dense urban blocks: two downtown cores plus a connecting midtown corridor. */
export const CITY_BUILDINGS: BuildingFootprint[] = (() => {
  const next = rand(20260814)
  const clusters = [
    { cx: 28, cy: 33, spread: 20, count: 34, maxStoreys: 9 }, // Uptown Waterloo
    { cx: 68, cy: 63, spread: 22, count: 38, maxStoreys: 12 }, // Downtown Kitchener
    { cx: 48, cy: 48, spread: 26, count: 26, maxStoreys: 5 }, // Midtown corridor
  ]

  const out: BuildingFootprint[] = []
  clusters.forEach((c, ci) => {
    for (let i = 0; i < c.count; i++) {
      const w = 2.4 + next() * 4.2
      const h = 2.2 + next() * 3.6
      const x = c.cx + (next() - 0.5) * c.spread
      const y = c.cy + (next() - 0.5) * c.spread
      out.push({
        id: `b-${ci}-${i}`,
        x: Math.max(1, Math.min(96, x)),
        y: Math.max(3, Math.min(94, y)),
        w,
        h,
        storeys: 1 + Math.floor(next() * c.maxStoreys),
      })
    }
  })
  // Paint back-to-front so nearer blocks overlap the ones behind them.
  return out.sort((a, b) => a.y - b.y)
})()
