export default function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-muted ${className || 'h-4 w-full'}`} />
  );
}