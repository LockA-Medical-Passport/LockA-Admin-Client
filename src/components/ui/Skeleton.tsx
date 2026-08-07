import { cn } from "@/lib/utils";

const SHAPES = {
  block: "rounded-lg",
  text: "h-3.5 rounded",
  avatar: "rounded-full",
} as const;

export interface SkeletonProps {
  shape?: keyof typeof SHAPES;
  className?: string;
}

export function Skeleton({ shape = "block", className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-navy-700/60",
        SHAPES[shape],
        shape === "avatar" && "size-10",
        className,
      )}
    />
  );
}
