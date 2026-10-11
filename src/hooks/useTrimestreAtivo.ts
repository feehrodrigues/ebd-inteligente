import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Trimestre } from "../lib/types";

export function useTrimestreAtivo(salaId: string | undefined) {
  const [trimestre, setTrimestre] = useState<Trimestre | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!salaId) {
      setTrimestre(null);
      setCarregando(false);
      return;
    }
    let ativo = true;
    (async () => {
      setCarregando(true);
      const { data, error } = await supabase
        .from("trimestres")
        .select("*")
        .eq("sala_id", salaId)
        .eq("ativo", true)
        .order("ordem", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!ativo) return;
      if (error) console.error(error);
      setTrimestre((data as Trimestre) ?? null);
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [salaId]);

  return { trimestre, carregando };
}