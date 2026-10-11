import type { ReactNode } from "react";

export function Empty({
  emoji = "📭",
  titulo,
  descricao,
  acao,
}: {
  emoji?: string;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-5xl mb-3">{emoji}</div>
      <h3 className="text-lg font-semibold text-slate-700">{titulo}</h3>
      {descricao && (
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {descricao}
        </p>
      )}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}