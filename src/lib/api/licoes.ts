    import { supabase } from "../supabase";

export interface LicaoTurma {
  domingo_id: string;
  domingo_data: string;
  domingo_ativo: boolean;
  domingo_cancelado: boolean;
  domingo_clima: string | null;
  licao_id: string | null;
  tema: string | null;
}

export async function listarLicoesDaTurma(
  turmaId: string,
  trimestreId: string
): Promise<LicaoTurma[]> {
  const { data, error } = await supabase.rpc("licoes_da_turma", {
    p_turma_id: turmaId,
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as LicaoTurma[]) ?? [];
}

/** Upsert: cria se não existe, atualiza se existe */
export async function salvarLicao(input: {
  domingo_id: string;
  turma_id: string;
  tema: string;
}): Promise<void> {
  // Se o tema está vazio, remove a lição
  if (!input.tema.trim()) {
    const { error } = await supabase
      .from("licoes")
      .delete()
      .eq("domingo_id", input.domingo_id)
      .eq("turma_id", input.turma_id);
    if (error) throw error;
    return;
  }

  // Upsert: se existe atualiza, se não existe insere
  const { error } = await supabase.from("licoes").upsert(
    {
      domingo_id: input.domingo_id,
      turma_id: input.turma_id,
      tema: input.tema.trim(),
    },
    { onConflict: "domingo_id,turma_id" }
  );
  if (error) throw error;
}