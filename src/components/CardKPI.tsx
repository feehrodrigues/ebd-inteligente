import type { ReactNode } from "react";

export function CardKPI({
  icone,
  label,
  valor,
  sub,
  cor = "text-brand-600",
}: {
  icone: ReactNode;
  label: string;
  valor: string | number;
  sub?: string;
  cor?: string;
}) {
  return (
    <div className="card flex items-center gap-3">
      <div
        className={`w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center ${cor} shrink-0`}
      >
        {icone}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-xl font-bold ${cor}`}>{valor}</p>
        {sub && <p className="text-[11px] text-slate-400 truncate">{sub}</p>}
      </div>
    </div>
  );
}