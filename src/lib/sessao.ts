const CHAVE_SALA = "ebd_sala_ativa_id";
const CHAVE_PERIODO = (salaId: string) => `ebd_periodo_${salaId}`;

/* ---------- Sala ativa ---------- */

export function getSalaAtivaId(): string | null {
  return localStorage.getItem(CHAVE_SALA);
}

export function setSalaAtivaId(id: string) {
  localStorage.setItem(CHAVE_SALA, id);
}

export function limparSalaAtiva() {
  localStorage.removeItem(CHAVE_SALA);
}

/* ---------- Período selecionado (por sala) ---------- */

export function getPeriodoSelecionadoId(salaId: string): string | null {
  return localStorage.getItem(CHAVE_PERIODO(salaId));
}

export function setPeriodoSelecionadoId(salaId: string, trimestreId: string) {
  localStorage.setItem(CHAVE_PERIODO(salaId), trimestreId);
}

export function limparPeriodoSelecionado(salaId: string) {
  localStorage.removeItem(CHAVE_PERIODO(salaId));
}