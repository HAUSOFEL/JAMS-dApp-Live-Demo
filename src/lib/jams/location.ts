export type LocationAccuracy = "precise" | "approximate" | "manual"

export interface CityHub {
  id: string
  city: string
  region: string
  country: string
  lat: number
  lng: number
  /** Whether sample jams exist for this city in the demo. */
  hasJams: boolean
  timeZones?: string[]
}

export interface UserLocation {
  hubId: string
  accuracy: LocationAccuracy
  lat?: number
  lng?: number
}

export const CITY_HUBS: CityHub[] = [
  { id: "kw", city: "Kitchener-Waterloo", region: "ON", country: "Canada", lat: 43.4643, lng: -80.5204, hasJams: true },
  { id: "toronto", city: "Toronto", region: "ON", country: "Canada", lat: 43.6532, lng: -79.3832, hasJams: false, timeZones: ["America/Toronto"] },
  { id: "montreal", city: "Montreal", region: "QC", country: "Canada", lat: 45.5019, lng: -73.5674, hasJams: false, timeZones: ["America/Montreal"] },
  { id: "vancouver", city: "Vancouver", region: "BC", country: "Canada", lat: 49.2827, lng: -123.1207, hasJams: false, timeZones: ["America/Vancouver"] },
  { id: "nyc", city: "New York", region: "NY", country: "USA", lat: 40.7128, lng: -74.006, hasJams: false, timeZones: ["America/New_York"] },
  { id: "la", city: "Los Angeles", region: "CA", country: "USA", lat: 34.0522, lng: -118.2437, hasJams: false, timeZones: ["America/Los_Angeles"] },
  { id: "paris", city: "Paris", region: "IDF", country: "France", lat: 48.8566, lng: 2.3522, hasJams: false, timeZones: ["Europe/Paris"] },
  { id: "london", city: "London", region: "ENG", country: "UK", lat: 51.5072, lng: -0.1276, hasJams: false, timeZones: ["Europe/London"] },
  { id: "seoul", city: "Seoul", region: "", country: "South Korea", lat: 37.5665, lng: 126.978, hasJams: false, timeZones: ["Asia/Seoul"] },
  { id: "tokyo", city: "Tokyo", region: "", country: "Japan", lat: 35.6762, lng: 139.6503, hasJams: false, timeZones: ["Asia/Tokyo"] },
]

export const DEFAULT_HUB_ID = "kw"

export const getHub = (id: string): CityHub => CITY_HUBS.find((h) => h.id === id) ?? CITY_HUBS[0]!

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function nearestHub(lat: number, lng: number): CityHub {
  return CITY_HUBS.reduce((best, h) =>
    distanceKm(lat, lng, h.lat, h.lng) < distanceKm(lat, lng, best.lat, best.lng) ? h : best,
  )
}

/** Approximate city from the device time zone — no GPS or network lookup. */
export function approximateHubFromTimeZone(tz: string) {
  return CITY_HUBS.find((h) => h.timeZones?.includes(tz)) ?? getHub(DEFAULT_HUB_ID)
}

/** Nearest city that has jams, with distance from the given hub. */
export function nearestJamHub(from: CityHub) {
  const withJams = CITY_HUBS.filter((h) => h.hasJams)
  const hub = withJams.reduce((best, h) =>
    distanceKm(from.lat, from.lng, h.lat, h.lng) < distanceKm(from.lat, from.lng, best.lat, best.lng) ? h : best,
  )
  return { hub, km: Math.round(distanceKm(from.lat, from.lng, hub.lat, hub.lng)) }
}
