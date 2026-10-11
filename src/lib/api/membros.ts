import { supabase } from "../supabase";
import type { SalaMembro } from "../types";

export interface SolicitacaoPendente {
  id: string;
  user_id: string;
  user_nome: string | null;
  user_email: string | null;
  created_at: string;
}

export interface MembroAtivo extends SalaMembro {
  pessoa_nome?: string | null;
}

export async function listarSolicitacoes(
  salaId: string
): Promise<SolicitacaoPendente[]> {
  const { data, error } = await supabase.rpc("solicitacoes_pendentes", {
    p_sala_id: salaId,
  });
  if (error) throw error;
  return (data as SolicitacaoPendente[]) ?? [];
}

export async function listarMembros(salaId: string): Promise<SalaMembro[]> {
  const { data, error } = await supabase
    .from("sala_membros")
    .select("*")
    .eq("sala_id", salaId)
    .eq("ativo", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as SalaMembro[]) ?? [];
}

export async function aprovarSolicitacao(input: {
  solicitacaoId: string;
  pessoaId: string | null;
  papel: "admin" | "professor" | "aluno";
  aprovadorId: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("aprovar_solicitacao", {
    p_solicitacao_id: input.solicitacaoId,
    p_pessoa_id: input.pessoaId,
    p_papel: input.papel,
    p_aprovador_id: input.aprovadorId,
  });
  if (error) throw error;
  return data as string;
}

export async function rejeitarSolicitacao(
  solicitacaoId: string,
  aprovadorId: string
): Promise<void> {
  const { error } = await supabase.rpc("rejeitar_solicitacao", {
    p_solicitacao_id: solicitacaoId,
    p_aprovador_id: aprovadorId,
  });
  if (error) throw error;
}

export async function removerMembro(membroId: string): Promise<void> {
  const { error } = await supabase
    .from("sala_membros")
    .update({ ativo: false })
    .eq("id", membroId);
  if (error) throw error;
}