import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading data..." }: LoadingStateProps) {
  return (
    <div className="section-padding min-h-screen flex flex-col items-center justify-center text-muted-foreground">
      <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
      <p className="text-sm uppercase tracking-wider font-medium">{message}</p>
    </div>
  );
}