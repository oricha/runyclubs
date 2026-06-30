import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function AvatarStack({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  const display = Math.min(count, 3);
  const overflow = count - display;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {Array.from({ length: display }).map((_, i) => (
          <Avatar key={i} className="h-6 w-6 border-2 border-card">
            <AvatarImage src="" alt="" />
            <AvatarFallback className="text-[10px]">
              {i === display - 1 && overflow > 0 ? `+${overflow + 1}` : "•"}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {count > 0 ? (
        <span className="ml-2 text-xs text-muted-foreground">{count}</span>
      ) : null}
    </div>
  );
}
