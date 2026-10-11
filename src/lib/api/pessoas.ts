import { supabase } from "../supabase";
import type { Pessoa, TipoPessoa } from "../types";

export interface PessoaComTurmas extends Pessoa {
  total_turmas: number;
  total_turmas_professor: number;
}

export async function listarPessoas(salaId: string): Promise<PessoaComTurmas[]> {
  const { data, error } = await supabase.rpc("pessoas_da_sala", {
    p_sala_id: salaId,
  });
  if (error) throw error;
  return (data as PessoaComTurmas[]) ?? [];
}

export async function criarPessoa(input: {
  sala_id: string;
  nome: string;
  telefone?: string | null;
  data_nascimento?: string | null;
  tipo: TipoPessoa;
}): Promise<Pessoa> {
  const { data, error } = await supabase
    .from("pessoas")
    .insert({
      sala_id: input.sala_id,
      nome: input.nome.trim(),
      telefone: input.telefone?.trim() || null,
      data_nascimento: input.data_nascimento || null,
      tipo: input.tipo,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Pessoa;
}

export async function atualizarPessoa(
  id: string,
  patch: Partial<Pick<Pessoa, "nome" | "telefone" | "data_nascimento" | "tipo" | "ativo">>
): Promise<Pessoa> {
  const { data, error } = await supabase
    .from("pessoas")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Pessoa;
}

export async function inativarPessoa(id: string): Promise<void> {
  const { error } = await supabase
    .from("pessoas")
    .update({ ativo: false })
    .eq("id", id);
  if (error) throw error;
}

export async function reativarPessoa(id: string): Promise<void> {
  const { error } = await supabase
    .from("pessoas")
    .update({ ativo: true })
    .eq("id", id);
  if (error) throw error;
}