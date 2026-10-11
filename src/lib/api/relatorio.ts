import { supabase } from "../supabase";

export interface RelatorioDia {
  domingo: {
    id: string;
    data: string;
    clima: string | null;
    aula_cancelada: boolean;
    motivo_cancelamento: string | null;
    tema: string | null;
  };
  trimestre: {
    id: string;
    nome: string;
  };
  geral: {
    total_matriculados: number;
    presentes: number;
    faltas: number;
    justificados: number;
    visitantes: number;
    biblias: number;
    revistas: number;
    taxa_presenca: number;
    total_pessoas: number;
  };
  comparativo: {
    tem_anterior: boolean;
    presentes_anterior: number;
    taxa_anterior: number;
    delta_taxa: number | null;
    delta_presentes: number | null;
  };
  turmas: {
    turma_id: string;
    turma_nome: string;
    turma_cor: string;
    turma_faixa: string | null;
    ordem: number;
    total_alunos: number;
    presentes: number;
    faltas: number;
    justificados: number;
    visitantes: number;
    biblias: number;
    revistas: number;
  }[];
  destaques: {
    melhor_turma: {
      turma_id: string;
      turma_nome: string;
      turma_cor: string;
      presentes: number;
      total_alunos: number;
      taxa: number;
    } | null;
    aluno_destaque: {
      pessoa_id: string;
      pessoa_nome: string;
      presentes: number;
    } | null;
    turma_mais_visitantes: {
      turma_id: string;
      turma_nome: string;
      turma_cor: string;
      visitantes: number;
    } | null;
  };
}

export async function obterRelatorioDia(
  domingoId: string
): Promise<RelatorioDia> {
  const { data, error } = await supabase.rpc("relatorio_dia", {
    p_domingo_id: domingoId,
  });
  if (error) throw error;
  if ((data as any)?.erro) throw new Error((data as any).erro);
  return data as RelatorioDia;
}