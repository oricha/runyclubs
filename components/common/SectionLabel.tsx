import { cn } from "@/lib/utils";

type SectionLabelProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function SectionLabel<T extends React.ElementType = "span">({
  as,
  className,
  children,
  ...props
}: SectionLabelProps<T>) {
  const Component = as ?? "span";
  return (
    <Component
      className={cn(
        "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
