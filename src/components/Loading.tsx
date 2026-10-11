import { Loader2 } from "lucide-react";

export function Loading({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <Loader2 className="animate-spin mb-3" size={32} />
      <p className="text-sm">{texto}</p>
    </div>
  );
}