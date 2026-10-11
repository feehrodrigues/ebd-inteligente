import { useEffect, useState } from "react";
import { listarSolicitacoes } from "../lib/api/membros";

export function useContarSolicitacoes(salaId: string | undefined) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!salaId) return;
    let ativo = true;
    (async () => {
      try {
        const s = await listarSolicitacoes(salaId);
        if (ativo) setTotal(s.length);
      } catch {
        // silencioso
      }
    })();
    return () => {
      ativo = false;
    };
  }, [salaId]);

  return total;
}