export function BarrasPresenca({
  presentes,
  faltas,
  justificados,
}: {
  presentes: number;
  faltas: number;
  justificados: number;
}) {
  const total = presentes + faltas + justificados;

  if (total === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        Sem chamadas ainda
      </div>
    );
  }

  const dados = [
    {
      label: "Presentes",
      emoji: "✅",
      valor: presentes,
      cor: "bg-emerald-500",
      corTexto: "text-emerald-700",
    },
    {
      label: "Faltas",
      emoji: "❌",
      valor: faltas,
      cor: "bg-red-500",
      corTexto: "text-red-700",
    },
    {
      label: "Justificados",
      emoji: "⚠️",
      valor: justificados,
      cor: "bg-amber-500",
      corTexto: "text-amber-700",
    },
  ];

  return (
    <div className="space-y-4">
      {dados.map((d) => {
        const pct = total > 0 ? Math.round((d.valor / total) * 100) : 0;
        return (
          <div key={d.label}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm text-slate-700 flex items-center gap-2">
                <span>{d.emoji}</span> {d.label}
              </span>
              <div className="flex items-baseline gap-3">
                <span className={`text-2xl font-bold ${d.corTexto}`}>
                  {d.valor}
                </span>
                <span className="text-sm text-slate-400 font-medium w-12 text-right">
                  {pct}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${d.cor} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}