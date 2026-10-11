import { useMemo } from "react";
import { useSalas } from "../stores/salas";
import { getSalaAtivaId } from "../lib/sessao";

export function useSalaAtiva() {
  const { salas, membros } = useSalas();
  const salaId = getSalaAtivaId();

  return useMemo(() => {
    const sala = salas.find((s) => s.id === salaId) ?? null;
    const membro = salaId ? membros[salaId] ?? null : null;
    return { sala, membro, papel: membro?.papel ?? null };
  }, [salas, membros, salaId]);
}