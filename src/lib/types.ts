export type PapelSala = "admin" | "professor" | "aluno";
export type TipoPessoa = "aluno" | "professor" | "ambos";
export type PapelTurma = "aluno" | "professor";
export type StatusMatricula = "ativa" | "suspensa";
export type StatusPresenca = "P" | "F" | "J";
export type Clima = "bom" | "nublado" | "ameacador" | "chuvoso" | "tempestuoso";
export type TipoDivisao = "bimestre" | "trimestre" | "semestre" | "ano" | "custom";

export interface Sala {
  id: string;
  nome: string;
  codigo_entrada: string;
  criada_por: string;
  ativa: boolean;
  created_at: string;
}

export interface SalaMembro {
  id: string;
  sala_id: string;
  user_id: string;
  user_nome: string | null;
  user_email: string | null;
  papel: PapelSala;
  ativo: boolean;
  created_at: string;
}

export interface SolicitacaoSala {
  id: string;
  sala_id: string;
  user_id: string;
  user_nome: string | null;
  user_email: string | null;
  pessoa_id: string | null;
  status: "pendente" | "aprovada" | "rejeitada";
  respondido_por: string | null;
  respondido_em: string | null;
  created_at: string;
}

export interface Pessoa {
  id: string;
  sala_id: string;
  nome: string;
  telefone: string | null;
  data_nascimento: string | null;
  tipo: TipoPessoa;
  user_id: string | null;
  ativo: boolean;
  created_at: string;
}

export interface Turma {
  id: string;
  sala_id: string;
  nome: string;
  faixa: string | null;
  cor: string;
  ordem: number;
  ativa: boolean;
  created_at: string;
}

export interface Trimestre {
  id: string;
  sala_id: string;
  nome: string;
  tipo_divisao: TipoDivisao;
  data_inicio: string;
  data_fim: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface Domingo {
  id: string;
  trimestre_id: string;
  data: string;
  ativo: boolean;
  tema: string | null;
  aula_cancelada: boolean;
  motivo_cancelamento: string | null;
  clima: Clima | null;
  observacao_dia: string | null;
  created_at: string;
}

export interface Matricula {
  id: string;
  sala_id: string;
  pessoa_id: string;
  turma_id: string;
  trimestre_id: string;
  papel_na_turma: PapelTurma;
  status: StatusMatricula;
  created_at: string;
}

export interface Presenca {
  id: string;
  domingo_id: string;
  pessoa_id: string;
  turma_id: string;
  status: StatusPresenca;
  observacao: string | null;
  registrado_por: string | null;
  registrado_em: string;
}

export interface Visitante {
  id: string;
  domingo_id: string;
  turma_id: string;
  nome: string;
  observacao: string | null;
  created_at: string;
}

export interface ContagemDia {
  id: string;
  domingo_id: string;
  turma_id: string;
  biblias: number;
  revistas: number;
  biblias_manual: boolean;
  revistas_manual: boolean;
}