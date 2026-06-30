export interface CityInfo {
  name: string;
  slug: string;
  region: string;
  lat: number;
  lng: number;
}

/** Coordenadas reales — fuente: 4-runclubs-es-analisis-completo-nuevas-secciones.md §9 */
export const CITY_DETAILS: CityInfo[] = [
  { name: "Madrid", slug: "madrid", region: "Madrid", lat: 40.4168, lng: -3.7038 },
  { name: "Barcelona", slug: "barcelona", region: "Cataluña", lat: 41.3851, lng: 2.1734 },
  { name: "Valencia", slug: "valencia", region: "C. Valenciana", lat: 39.4699, lng: -0.3763 },
  { name: "Sevilla", slug: "sevilla", region: "Andalucía", lat: 37.3886, lng: -5.9823 },
  { name: "Zaragoza", slug: "zaragoza", region: "Aragón", lat: 41.6561, lng: -0.8773 },
  { name: "Málaga", slug: "malaga", region: "Andalucía", lat: 36.7213, lng: -4.4213 },
  { name: "Murcia", slug: "murcia", region: "Región de Murcia", lat: 37.9922, lng: -1.1307 },
  { name: "Palma", slug: "palma", region: "Islas Baleares", lat: 39.5696, lng: 2.6502 },
  {
    name: "Las Palmas de Gran Canaria",
    slug: "las-palmas",
    region: "Canarias",
    lat: 28.1248,
    lng: -15.43,
  },
  { name: "Bilbao", slug: "bilbao", region: "País Vasco", lat: 43.263, lng: -2.935 },
  { name: "Alicante", slug: "alicante", region: "C. Valenciana", lat: 38.3452, lng: -0.481 },
  { name: "Córdoba", slug: "cordoba", region: "Andalucía", lat: 37.8882, lng: -4.7794 },
  { name: "Valladolid", slug: "valladolid", region: "Castilla y León", lat: 41.6523, lng: -4.7245 },
  { name: "Vigo", slug: "vigo", region: "Galicia", lat: 42.2328, lng: -8.7226 },
  { name: "Gijón", slug: "gijon", region: "Asturias", lat: 43.5453, lng: -5.6615 },
  { name: "A Coruña", slug: "a-coruna", region: "Galicia", lat: 43.3623, lng: -8.4115 },
  { name: "Granada", slug: "granada", region: "Andalucía", lat: 37.1773, lng: -3.5986 },
  { name: "Santander", slug: "santander", region: "Cantabria", lat: 43.4623, lng: -3.8099 },
  {
    name: "San Sebastián",
    slug: "san-sebastian",
    region: "País Vasco",
    lat: 43.3183,
    lng: -1.9812,
  },
  { name: "Pamplona", slug: "pamplona", region: "Navarra", lat: 42.8169, lng: -1.6432 },
];

export const CITIES = CITY_DETAILS.map((c) => c.name);

export const CITY_COORDS: Record<string, { lat: number; lng: number }> =
  Object.fromEntries(CITY_DETAILS.map((c) => [c.slug, { lat: c.lat, lng: c.lng }]));

export function getCityBySlug(slug: string): CityInfo | undefined {
  return CITY_DETAILS.find((c) => c.slug === slug);
}
