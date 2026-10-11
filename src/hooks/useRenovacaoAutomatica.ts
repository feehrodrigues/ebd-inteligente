import { useEffect, useState } from "react";
import { verificarRenovacao, type ResultadoRenovacao } from "../lib/api/salas";

const CHAVE_DISPENSADO = (salaId: string) =>
  `ebd_renovacao_dispensada_${salaId}`;

export function useRenovacaoAutomatica(salaId: string | undefined) {
  const [resultado, setResultado] = useState<ResultadoRenovacao | null>(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (!salaId) return;

    // Se o usuário já dispensou o aviso deste período, não mostra de novo
    const dispensado = localStorage.getItem(CHAVE_DISPENSADO(salaId));
    if (dispensado) return;

    let ativo = true;
    (async () => {
      setVerificando(true);
      try {
        const r = await verificarRenovacao(salaId);
        if (!ativo) return;
        // Só exibe aviso se acabou de criar (ou já existia e ainda não foi dispensado)
        if (r.criado || r.erro === "ja_existia") {
          setResultado(r);
        }
      } catch (e) {
        console.error("Erro ao verificar renovação:", e);
      } finally {
        if (ativo) setVerificando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [salaId]);

  function dispensar() {
    if (salaId) {
      localStorage.setItem(CHAVE_DISPENSADO(salaId), "1");
    }
    setResultado(null);
  }

  return { resultado, verificando, dispensar };
}