export function DateBlock({ date }: { date: Date }) {
  const dia = date.getDate();
  const mes = date
    .toLocaleDateString("es-ES", { month: "short" })
    .toUpperCase()
    .replace(".", "");

  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary">
      <span className="text-lg font-semibold leading-none">{dia}</span>
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
        {mes}
      </span>
    </div>
  );
}
