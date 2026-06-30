export function WeatherWidgetSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border p-4">
      <div className="mb-3 h-6 w-32 rounded bg-muted" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}
