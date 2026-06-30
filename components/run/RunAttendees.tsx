import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { es, t } from "@/lib/i18n/es";

export function RunAttendees({
  count,
  avatars,
}: {
  count: number;
  avatars: string[];
}) {
  if (count <= 0 && avatars.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(es.runDetail.runnersGoing, { count: 0 })}
      </p>
    );
  }

  const displayAvatars = avatars.slice(0, 5);
  const overflow = count - displayAvatars.length;

  return (
    <div className="flex items-center gap-3">
      {displayAvatars.length > 0 ? (
        <div className="flex -space-x-2">
          {displayAvatars.map((src, i) => (
            <Avatar key={`${src}-${i}`} className="h-8 w-8 border-2 border-card">
              <AvatarImage src={src} alt="" />
              <AvatarFallback>•</AvatarFallback>
            </Avatar>
          ))}
          {overflow > 0 ? (
            <Avatar className="h-8 w-8 border-2 border-card">
              <AvatarFallback className="text-xs">+{overflow}</AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {t(es.runDetail.runnersGoing, { count })}
      </p>
    </div>
  );
}
