import type { DashboardTurma } from "../lib/api/dashboard";

export function TabelaPorTurma({ dados }: { dados: DashboardTurma[] }) {
  if (dados.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        Nenhuma turma
      </div>
    );
  }

  const totais = dados.reduce(
    (acc, t) => ({
      alunos: acc.alunos + t.total_alunos,
      presentes: acc.presentes + t.presentes,
      faltas: acc.faltas + t.faltas,
      justificados: acc.justificados + t.justificados,
      visitantes: acc.visitantes + t.visitantes,
    }),
    { alunos: 0, presentes: 0, faltas: 0, justificados: 0, visitantes: 0 }
  );

  const totalPresencas = totais.presentes + totais.faltas + totais.justificados;
  const taxaGeral = totalPresencas
    ? Math.round((totais.presentes / totalPresencas) * 100)
    : 0;

  function corTaxa(pct: number) {
    if (pct >= 75) return "text-emerald-700 bg-emerald-50";
    if (pct >= 50) return "text-amber-700 bg-amber-50";
    return "text-red-700 bg-red-50";
  }

  return (
    <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase text-slate-500 tracking-wide border-b border-slate-200">
            <th className="py-2 pr-3 font-semibold">Turma</th>
            <th className="py-2 px-2 text-center font-semibold">Alunos</th>
            <th className="py-2 px-2 text-center font-semibold text-emerald-700">
              ✅
            </th>
            <th className="py-2 px-2 text-center font-semibold text-red-700">
              ❌
            </th>
            <th className="py-2 px-2 text-center font-semibold text-amber-700">
              ⚠️
            </th>
            <th className="py-2 px-2 text-center font-semibold text-slate-700">
              👋
            </th>
            <th className="py-2 pl-2 text-right font-semibold">Taxa</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((t) => {
            const totalP =
              t.presentes + t.faltas + t.justificados;
            const pct = totalP
              ? Math.round((t.presentes / totalP) * 100)
              : 0;
            return (
              <tr
                key={t.turma_id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: t.turma_cor }}
                    />
                    <span className="font-medium text-slate-800 truncate">
                      {t.turma_nome}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-center text-slate-600">
                  {t.total_alunos}
                </td>
                <td className="py-2.5 px-2 text-center font-semibold text-emerald-700">
                  {t.presentes}
                </td>
                <td className="py-2.5 px-2 text-center font-semibold text-red-700">
                  {t.faltas}
                </td>
                <td className="py-2.5 px-2 text-center font-semibold text-amber-700">
                  {t.justificados}
                </td>
                <td className="py-2.5 px-2 text-center font-semibold text-slate-700">
                  {t.visitantes}
                </td>
                <td className="py-2.5 pl-2 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${corTaxa(
                      pct
                    )}`}
                  >
                    {pct}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
            <td className="py-3 pr-3 text-slate-900">TOTAL GERAL</td>
            <td className="py-3 px-2 text-center text-slate-900">
              {totais.alunos}
            </td>
            <td className="py-3 px-2 text-center text-emerald-700">
              {totais.presentes}
            </td>
            <td className="py-3 px-2 text-center text-red-700">
              {totais.faltas}
            </td>
            <td className="py-3 px-2 text-center text-amber-700">
              {totais.justificados}
            </td>
            <td className="py-3 px-2 text-center text-slate-700">
              {totais.visitantes}
            </td>
            <td className="py-3 pl-2 text-right">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${corTaxa(
                  taxaGeral
                )}`}
              >
                {taxaGeral}%
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}