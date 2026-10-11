import { supabase } from "../supabase";

/* ============ TIPOS ============ */

export interface DashboardGeral {
  total_matriculados: number;
  total_turmas: number;
  total_domingos: number;
  domingos_com_chamada: number;
  presentes: number;
  faltas: number;
  justificados: number;
  visitantes: number;
  biblias: number;
  revistas: number;
  taxa_presenca: number;
  licoes_total: number;
  licoes_preenchidas: number;
  escala_total: number;
  escala_preenchida: number;
}

export interface DashboardTurma {
  turma_id: string;
  turma_nome: string;
  turma_cor: string;
  turma_faixa: string | null;
  total_alunos: number;
  presentes: number;
  faltas: number;
  justificados: number;
  visitantes: number;
  biblias: number;
  revistas: number;
  taxa_presenca: number;
}

export interface RankingAluno {
  pessoa_id: string;
  pessoa_nome: string;
  turma_nome: string;
  turma_cor: string;
  presentes: number;
  faltas: number;
  justificados: number;
  total_domingos: number;
  taxa_presenca: number;
  faltas_consecutivas: number;
}

export interface EvolucaoDomingo {
  domingo_id: string;
  data: string;
  clima: string | null;
  aula_cancelada: boolean;
  presentes: number;
  faltas: number;
  justificados: number;
  visitantes: number;
  taxa_presenca: number;
}

export interface ProgressoLicoes {
  turma_id: string;
  turma_nome: string;
  turma_cor: string;
  total_domingos: number;
  licoes_preenchidas: number;
  percentual: number;
}

export interface CoberturaEscala {
  turma_id: string;
  turma_nome: string;
  turma_cor: string;
  total_domingos: number;
  designados: number;
  percentual: number;
}

export interface Aniversariante {
  pessoa_id: string;
  pessoa_nome: string;
  data_nascimento: string;
  dia: number;
}

/* ============ FUNÇÕES ============ */

export async function obterDashboardGeral(
  trimestreId: string
): Promise<DashboardGeral> {
  const { data, error } = await supabase.rpc("dashboard_geral", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return data as DashboardGeral;
}

export async function obterDashboardPorTurma(
  trimestreId: string
): Promise<DashboardTurma[]> {
  const { data, error } = await supabase.rpc("dashboard_por_turma", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as DashboardTurma[]) ?? [];
}

export async function obterRankingAlunos(
  trimestreId: string
): Promise<RankingAluno[]> {
  const { data, error } = await supabase.rpc("ranking_alunos", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as RankingAluno[]) ?? [];
}

export async function obterEvolucaoDomingos(
  trimestreId: string
): Promise<EvolucaoDomingo[]> {
  const { data, error } = await supabase.rpc("evolucao_domingos", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as EvolucaoDomingo[]) ?? [];
}

export async function obterProgressoLicoes(
  trimestreId: string
): Promise<ProgressoLicoes[]> {
  const { data, error } = await supabase.rpc("progresso_licoes", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as ProgressoLicoes[]) ?? [];
}

export async function obterCoberturaEscala(
  trimestreId: string
): Promise<CoberturaEscala[]> {
  const { data, error } = await supabase.rpc("cobertura_escala", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as CoberturaEscala[]) ?? [];
}

export async function obterAniversariantes(
  salaId: string,
  mes: number
): Promise<Aniversariante[]> {
  const { data, error } = await supabase.rpc("aniversariantes_mes", {
    p_sala_id: salaId,
    p_mes: mes,
  });
  if (error) throw error;
  return (data as Aniversariante[]) ?? [];
}

export async function obterEvolucaoTurma(
  turmaId: string,
  trimestreId: string
): Promise<EvolucaoDomingo[]> {
  const { data, error } = await supabase.rpc("evolucao_turma", {
    p_turma_id: turmaId,
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as EvolucaoDomingo[]) ?? [];
}

export interface RankingTurmaAluno {
  pessoa_id: string;
  pessoa_nome: string;
  presentes: number;
  faltas: number;
  justificados: number;
  total_domingos: number;
  taxa_presenca: number;
}

export async function obterRankingTurma(
  turmaId: string,
  trimestreId: string
): Promise<RankingTurmaAluno[]> {
  const { data, error } = await supabase.rpc("ranking_turma", {
    p_turma_id: turmaId,
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as RankingTurmaAluno[]) ?? [];
}
/* ============ RANKING GERAL DE ALUNOS ============ */

export interface RankingGeralAluno {
  pessoa_id: string;
  pessoa_nome: string;
  turma_id: string;
  turma_nome: string;
  turma_cor: string;
  presentes: number;
  faltas: number;
  justificados: number;
  total_domingos: number;
  taxa_presenca: number;
  faltas_consecutivas: number;
}

export async function obterRankingGeralAlunos(
  trimestreId: string
): Promise<RankingGeralAluno[]> {
  const { data, error } = await supabase.rpc("ranking_geral_alunos", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as RankingGeralAluno[]) ?? [];
}

/* ============ HISTÓRICO DE UM ALUNO ============ */

export interface HistoricoAluno {
  domingo_data: string;
  clima: string | null;
  aula_cancelada: boolean;
  status: string | null;
}

export async function obterHistoricoAluno(
  pessoaId: string,
  trimestreId: string
): Promise<HistoricoAluno[]> {
  const { data, error } = await supabase.rpc("historico_aluno", {
    p_pessoa_id: pessoaId,
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as HistoricoAluno[]) ?? [];
}
/* ============ INSIGHTS ============ */

export interface InsightsDashboard {
  total_alunos: number;
  taxa_geral: number;
  alunos_risco: number;
  alunos_atencao: number;
  tendencia: "subindo" | "descendo" | "estavel";
  media_recente: number;
  media_anterior: number;
  status: "saudavel" | "atencao" | "risco";
  melhor_domingo: {
    data: string;
    taxa: number;
    presentes: number;
  } | null;
  pior_domingo: {
    data: string;
    taxa: number;
    presentes: number;
  } | null;
  aluno_destaque: {
    pessoa_id: string;
    pessoa_nome: string;
    presentes: number;
    total: number;
    taxa: number;
  } | null;
  turma_destaque: {
    turma_id: string;
    turma_nome: string;
    turma_cor: string;
    taxa: number;
  } | null;
}

export async function obterInsights(
  trimestreId: string
): Promise<InsightsDashboard> {
  const { data, error } = await supabase.rpc("insights_dashboard", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return data as InsightsDashboard;
}
/* ============ COMPARAÇÃO ENTRE TRIMESTRES ============ */

export interface TrimestreMetricas {
  nome: string;
  taxa_presenca: number;
  presentes: number;
  visitantes: number;
  biblias: number;
  revistas: number;
  domingos: number;
}

export interface ComparacaoTrimestres {
  atual: TrimestreMetricas;
  anterior: TrimestreMetricas;
}

export async function obterComparacaoTrimestres(
  trimestreId: string,
  trimestreAnteriorId: string
): Promise<ComparacaoTrimestres> {
  const { data, error } = await supabase.rpc("comparar_trimestres", {
    p_trimestre_id: trimestreId,
    p_trimestre_anterior_id: trimestreAnteriorId,
  });
  if (error) throw error;
  return data as ComparacaoTrimestres;
}