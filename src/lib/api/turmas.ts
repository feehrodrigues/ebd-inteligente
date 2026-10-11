import { supabase } from "../supabase";
import type { Turma } from "../types";

export interface TurmaComContagens extends Turma {
  total_alunos: number;
  total_professores: number;
}

export async function listarTurmas(
  salaId: string,
  trimestreId: string
): Promise<TurmaComContagens[]> {
  const { data, error } = await supabase.rpc("turmas_da_sala", {
    p_sala_id: salaId,
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as TurmaComContagens[]) ?? [];
}

export async function criarTurma(input: {
  sala_id: string;
  nome: string;
  faixa: string;
  cor: string;
  ordem: number;
}): Promise<Turma> {
  const { data, error } = await supabase
    .from("turmas")
    .insert({
      sala_id: input.sala_id,
      nome: input.nome.trim(),
      faixa: input.faixa.trim() || null,
      cor: input.cor,
      ordem: input.ordem,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Turma;
}

export async function atualizarTurma(
  id: string,
  patch: Partial<Pick<Turma, "nome" | "faixa" | "cor" | "ordem" | "ativa">>
): Promise<Turma> {
  const { data, error } = await supabase
    .from("turmas")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Turma;
}

export async function inativarTurma(id: string): Promise<void> {
  const { error } = await supabase
    .from("turmas")
    .update({ ativa: false })
    .eq("id", id);
  if (error) throw error;
}

export async function reativarTurma(id: string): Promise<void> {
  const { error } = await supabase
    .from("turmas")
    .update({ ativa: true })
    .eq("id", id);
  if (error) throw error;
}

export async function proximaOrdem(salaId: string): Promise<number> {
  const { data, error } = await supabase
    .from("turmas")
    .select("ordem")
    .eq("sala_id", salaId)
    .order("ordem", { ascending: false })
    .limit(1);
  if (error) throw error;
  return ((data?.[0]?.ordem as number) ?? 0) + 1;
}