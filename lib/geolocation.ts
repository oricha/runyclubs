import { CITY_DETAILS, getCityBySlug, type CityInfo } from "@/lib/cities";

const EARTH_RADIUS_KM = 6371;

export interface Coords {
  lat: number;
  lng: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Distancia en km entre dos puntos (fórmula de Haversine). */
export function getDistanceKm(a: Coords, b: Coords): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Devuelve la ciudad española más cercana a unas coordenadas. */
export function findNearestCity(coords: Coords): CityInfo | null {
  if (CITY_DETAILS.length === 0) return null;

  let nearest = CITY_DETAILS[0];
  let minDistance = getDistanceKm(coords, nearest);

  for (let i = 1; i < CITY_DETAILS.length; i++) {
    const city = CITY_DETAILS[i];
    const distance = getDistanceKm(coords, city);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  }

  return nearest;
}

/**
 * Coordenadas de una entidad: prioriza lat/lng propios; si son nulos, usa la ciudad.
 * Preparado para cuando clubs/carreras tengan coordenadas reales en BD.
 */
export function resolveEntityCoords(
  entity: { lat?: number | null; lng?: number | null },
  citySlug: string,
): Coords | null {
  if (entity.lat != null && entity.lng != null) {
    return { lat: entity.lat, lng: entity.lng };
  }

  const city = getCityBySlug(citySlug);
  if (!city) return null;

  return { lat: city.lat, lng: city.lng };
}
