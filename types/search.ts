export interface SearchResultItem {
  id: string;
  kind: "carrera" | "club";
  title: string;
  subtitle?: string;
  href: string;
}

export const MIN_QUERY_LENGTH = 2;
