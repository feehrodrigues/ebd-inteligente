import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Rect,
  pdf,
} from "@react-pdf/renderer";
import { formatarData, formatarDataLonga } from "../lib/dates";
import type { RelatorioDia } from "../lib/api/relatorio";
import type { Clima } from "../lib/types";

const CLIMA_LABEL: Record<Clima, string> = {
  bom: "Bom",
  nublado: "Nublado",
  ameacador: "Ameaçador",
  chuvoso: "Chuvoso",
  tempestuoso: "Tempestuoso",
};

/* ============ CORES ============ */
const COR = {
  azul: "#2563eb",
  azulClaro: "#eff6ff",
  verde: "#16a34a",
  verdeClaro: "#ecfdf5",
  vermelho: "#dc2626",
  vermelhoClaro: "#fef2f2",
  amarelo: "#d97706",
  amareloClaro: "#fffbeb",
  cinza: "#64748b",
  cinzaClaro: "#f1f5f9",
  borda: "#e2e8f0",
  texto: "#0f172a",
  textoSutil: "#475569",
};

/* ============ ÍCONES SVG ============ */

function IconeCheck({ cor = COR.verde, tamanho = 10 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={cor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconeX({ cor = COR.vermelho, tamanho = 10 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={cor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconeAlerta({ cor = COR.amarelo, tamanho = 10 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={cor} strokeWidth="2" fill="none" />
      <Path d="M12 8v4" stroke={cor} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="12" cy="16" r="0.8" fill={cor} />
    </Svg>
  );
}

function IconePessoa({ cor = COR.cinza, tamanho = 10 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="4" stroke={cor} strokeWidth="2" fill="none" />
      <Path
        d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"
        stroke={cor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function IconeTrofeu({ cor = COR.amarelo, tamanho = 11 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"
        stroke={cor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconeEstrela({ cor = COR.azul, tamanho = 11 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={cor}
        strokeWidth="2"
        fill={cor}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconeSeta({ cor = COR.verde, tamanho = 11, paraBaixo = false }: { cor?: string; tamanho?: number; paraBaixo?: boolean }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" style={{ transform: paraBaixo ? "rotate(180deg)" : undefined }}>
      <Path
        d="M12 19V5M5 12l7-7 7 7"
        stroke={cor}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconeBiblia({ cor = COR.azul, tamanho = 14 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2zM10 7h6M10 11h6"
        stroke={cor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconeLivro({ cor = COR.azul, tamanho = 14 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        stroke={cor}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconeCancelado({ cor = COR.vermelho, tamanho = 12 }: { cor?: string; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={cor} strokeWidth="2" fill="none" />
      <Path d="M16 2v4M8 2v4M3 10h18M9 16l6-6M9 10l6 6" stroke={cor} strokeWidth="2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/* ============ ESTILOS ============ */

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COR.texto,
    backgroundColor: "#ffffff",
  },

  /* Cabeçalho */
  headerBarra: {
    height: 4,
    backgroundColor: COR.azul,
    borderRadius: 2,
    marginBottom: 14,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 7.5,
    color: COR.textoSutil,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
    fontWeight: "bold",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: COR.azul,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 10,
    color: COR.cinza,
  },

  /* Alerta cancelada */
  alertaCancelada: {
    backgroundColor: COR.vermelhoClaro,
    border: `1pt solid #fecaca`,
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertaTexto: {
    color: "#991b1b",
    fontSize: 10,
    fontWeight: "bold",
  },
  alertaSub: {
    color: "#b91c1c",
    fontSize: 8.5,
    marginTop: 2,
  },

  /* KPI Grid */
  kpiGrid: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  kpiBox: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  kpiIcone: {
    marginBottom: 3,
  },
  kpiLabel: {
    fontSize: 6.5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
    fontWeight: "bold",
  },
  kpiValor: {
    fontSize: 18,
    fontWeight: "bold",
  },

  /* Comparativo */
  comparativo: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comparativoTitulo: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  comparativoSub: {
    fontSize: 8,
  },

  /* Seção */
  secao: {
    marginBottom: 14,
  },
  secaoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: "bold",
    color: COR.texto,
  },

  /* Tabela */
  tabela: {
    border: `1pt solid ${COR.borda}`,
    borderRadius: 6,
    overflow: "hidden",
  },
  tabelaHeader: {
    flexDirection: "row",
    backgroundColor: COR.cinzaClaro,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottom: `1pt solid ${COR.borda}`,
    alignItems: "center",
  },
  tabelaLinha: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottom: `0.5pt solid #f1f5f9`,
    alignItems: "center",
  },
  tabelaLinhaFinal: {
    flexDirection: "row",
    backgroundColor: COR.azulClaro,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  colTurma: { flex: 2.4, paddingHorizontal: 3, flexDirection: "row", alignItems: "center", gap: 5 },
  colNum: { flex: 0.7, textAlign: "center", paddingHorizontal: 2 },
  colTaxa: { flex: 1, textAlign: "right", paddingHorizontal: 4 },
  th: {
    fontSize: 6.5,
    textTransform: "uppercase",
    color: COR.textoSutil,
    letterSpacing: 0.5,
    fontWeight: "bold",
  },
  td: { fontSize: 9, color: COR.texto },
  tdBold: { fontSize: 9, fontWeight: "bold" },
  dotTurma: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  /* Materiais */
  materiais: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  materialBox: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: COR.azulClaro,
    border: `1pt solid #bfdbfe`,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  materialLabel: {
    fontSize: 8,
    color: "#1e40af",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "bold",
  },
  materialValor: {
    fontSize: 20,
    fontWeight: "bold",
    color: COR.azul,
    marginTop: 1,
  },

  /* Destaques */
  destaqueBox: {
    padding: 11,
    borderRadius: 6,
    backgroundColor: COR.amareloClaro,
    border: `1pt solid #fde68a`,
    marginBottom: 14,
  },
  destaqueTitulo: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  destaqueLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  destaqueTexto: {
    fontSize: 9,
    color: "#1c1917",
    flex: 1,
  },
  destaqueNome: {
    fontWeight: "bold",
  },

  /* Rodapé */
  rodape: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    textAlign: "center",
    fontSize: 7,
    color: "#94a3b8",
    paddingTop: 8,
    borderTop: `0.5pt solid ${COR.borda}`,
  },
});

/* ============ DOCUMENTO ============ */

function PdfDocumento({ dados }: { dados: RelatorioDia }) {
  const { domingo, trimestre, geral, comparativo, turmas, destaques } = dados;
  const delta = comparativo.delta_taxa;

  const totalAusentes = turmas.reduce(
    (s, t) => s + t.faltas + t.justificados,
    0
  );

  const comparativoCores =
    delta === null || delta === 0
      ? { bg: COR.cinzaClaro, text: COR.textoSutil }
      : delta > 0
      ? { bg: COR.verdeClaro, text: "#065f46" }
      : { bg: COR.vermelhoClaro, text: "#991b1b" };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Barra decorativa topo */}
        <View style={styles.headerBarra} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>EBD Inteligente · Relatório do Domingo</Text>
          <Text style={styles.titulo}>{formatarDataLonga(domingo.data)}</Text>
          <Text style={styles.subtitulo}>
            {trimestre.nome}
            {domingo.clima ? `  ·  Clima: ${CLIMA_LABEL[domingo.clima as Clima]}` : ""}
          </Text>
        </View>

        {/* Alerta de cancelamento */}
        {domingo.aula_cancelada && (
          <View style={styles.alertaCancelada}>
            <IconeCancelado cor={COR.vermelho} tamanho={14} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertaTexto}>Aula cancelada</Text>
              {domingo.motivo_cancelamento && (
                <Text style={styles.alertaSub}>{domingo.motivo_cancelamento}</Text>
              )}
            </View>
          </View>
        )}

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiBox, { backgroundColor: COR.cinzaClaro }]}>
            <Text style={[styles.kpiLabel, { color: COR.textoSutil }]}>
              Matriculados
            </Text>
            <Text style={[styles.kpiValor, { color: "#334155" }]}>
              {geral.total_matriculados}
            </Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: COR.verdeClaro }]}>
            <View style={styles.kpiIcone}>
              <IconeCheck cor={COR.verde} tamanho={11} />
            </View>
            <Text style={[styles.kpiLabel, { color: "#065f46" }]}>Presentes</Text>
            <Text style={[styles.kpiValor, { color: COR.verde }]}>
              {geral.presentes}
            </Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: COR.vermelhoClaro }]}>
            <View style={styles.kpiIcone}>
              <IconeX cor={COR.vermelho} tamanho={11} />
            </View>
            <Text style={[styles.kpiLabel, { color: "#991b1b" }]}>Ausentes</Text>
            <Text style={[styles.kpiValor, { color: COR.vermelho }]}>
              {totalAusentes}
            </Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: COR.amareloClaro }]}>
            <View style={styles.kpiIcone}>
              <IconePessoa cor={COR.amarelo} tamanho={11} />
            </View>
            <Text style={[styles.kpiLabel, { color: "#92400e" }]}>Visitantes</Text>
            <Text style={[styles.kpiValor, { color: COR.amarelo }]}>
              {geral.visitantes}
            </Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: COR.azulClaro }]}>
            <Text style={[styles.kpiLabel, { color: "#1e40af" }]}>Taxa</Text>
            <Text style={[styles.kpiValor, { color: COR.azul }]}>
              {geral.taxa_presenca}%
            </Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: COR.cinzaClaro }]}>
            <Text style={[styles.kpiLabel, { color: COR.textoSutil }]}>
              Total no dia
            </Text>
            <Text style={[styles.kpiValor, { color: "#334155" }]}>
              {geral.presentes + geral.visitantes}
            </Text>
          </View>
        </View>

        {/* Comparativo */}
        {comparativo.tem_anterior && delta !== null && (
          <View
            style={[styles.comparativo, { backgroundColor: comparativoCores.bg }]}
          >
            {delta > 0 && <IconeSeta cor={comparativoCores.text} tamanho={14} />}
            {delta < 0 && <IconeSeta cor={comparativoCores.text} tamanho={14} paraBaixo />}
            <View style={{ flex: 1 }}>
              <Text style={[styles.comparativoTitulo, { color: comparativoCores.text }]}>
                {delta > 0
                  ? `Subiu ${delta}% vs. domingo anterior`
                  : delta < 0
                  ? `Desceu ${Math.abs(delta)}% vs. domingo anterior`
                  : "Igual ao domingo anterior"}
              </Text>
              <Text style={[styles.comparativoSub, { color: comparativoCores.text }]}>
                {comparativo.presentes_anterior} presentes antes ·{" "}
                {comparativo.taxa_anterior}%
              </Text>
            </View>
          </View>
        )}

        {/* Tabela por turma */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <IconePessoa cor={COR.azul} tamanho={13} />
            <Text style={styles.secaoTitulo}>Detalhamento por turma</Text>
          </View>

          <View style={styles.tabela}>
            <View style={styles.tabelaHeader}>
              <Text style={[styles.th, styles.colTurma]}>Turma</Text>
              <Text style={[styles.th, styles.colNum]}>Mat.</Text>
              <Text style={[styles.th, styles.colNum, { color: COR.verde }]}>
                Pres.
              </Text>
              <Text style={[styles.th, styles.colNum, { color: COR.vermelho }]}>
                Aus.
              </Text>
              <Text style={[styles.th, styles.colNum, { color: COR.amarelo }]}>
                Just.
              </Text>
              <Text style={[styles.th, styles.colNum]}>Vis.</Text>
              <Text style={[styles.th, styles.colNum, { color: COR.azul }]}>
                Bíb.
              </Text>
              <Text style={[styles.th, styles.colNum, { color: COR.azul }]}>
                Rev.
              </Text>
              <Text style={[styles.th, styles.colTaxa]}>Taxa</Text>
            </View>

            {turmas.map((t) => {
              const total = t.presentes + t.faltas + t.justificados;
              const pct =
                total > 0 ? Math.round((t.presentes / total) * 100) : 0;
              return (
                <View key={t.turma_id} style={styles.tabelaLinha}>
                  <View style={styles.colTurma}>
                    <View
                      style={[styles.dotTurma, { backgroundColor: t.turma_cor }]}
                    />
                    <Text style={styles.td}>{t.turma_nome}</Text>
                  </View>
                  <Text style={[styles.td, styles.colNum]}>{t.total_alunos}</Text>
                  <Text
                    style={[styles.tdBold, styles.colNum, { color: COR.verde }]}
                  >
                    {t.presentes}
                  </Text>
                  <Text
                    style={[styles.tdBold, styles.colNum, { color: COR.vermelho }]}
                  >
                    {t.faltas}
                  </Text>
                  <Text
                    style={[styles.td, styles.colNum, { color: COR.amarelo }]}
                  >
                    {t.justificados}
                  </Text>
                  <Text style={[styles.td, styles.colNum]}>{t.visitantes}</Text>
                  <Text style={[styles.td, styles.colNum, { color: COR.azul }]}>
                    {t.biblias}
                  </Text>
                  <Text style={[styles.td, styles.colNum, { color: COR.azul }]}>
                    {t.revistas}
                  </Text>
                  <Text style={[styles.tdBold, styles.colTaxa]}>{pct}%</Text>
                </View>
              );
            })}

            <View style={styles.tabelaLinhaFinal}>
              <View style={styles.colTurma}>
                <Text style={[styles.tdBold, { color: COR.azul }]}>
                  TOTAL GERAL
                </Text>
              </View>
              <Text style={[styles.tdBold, styles.colNum]}>
                {geral.total_matriculados}
              </Text>
              <Text
                style={[styles.tdBold, styles.colNum, { color: COR.verde }]}
              >
                {geral.presentes}
              </Text>
              <Text
                style={[styles.tdBold, styles.colNum, { color: COR.vermelho }]}
              >
                {turmas.reduce((s, t) => s + t.faltas, 0)}
              </Text>
              <Text
                style={[styles.tdBold, styles.colNum, { color: COR.amarelo }]}
              >
                {turmas.reduce((s, t) => s + t.justificados, 0)}
              </Text>
              <Text style={[styles.tdBold, styles.colNum]}>
                {geral.visitantes}
              </Text>
              <Text style={[styles.tdBold, styles.colNum, { color: COR.azul }]}>
                {geral.biblias}
              </Text>
              <Text style={[styles.tdBold, styles.colNum, { color: COR.azul }]}>
                {geral.revistas}
              </Text>
              <Text style={[styles.tdBold, styles.colTaxa, { color: COR.azul }]}>
                {geral.taxa_presenca}%
              </Text>
            </View>
          </View>
        </View>

        {/* Materiais */}
        <View style={styles.materiais}>
          <View style={styles.materialBox}>
            <IconeBiblia cor={COR.azul} tamanho={18} />
            <View>
              <Text style={styles.materialLabel}>Bíblias</Text>
              <Text style={styles.materialValor}>{geral.biblias}</Text>
            </View>
          </View>
          <View style={styles.materialBox}>
            <IconeLivro cor={COR.azul} tamanho={18} />
            <View>
              <Text style={styles.materialLabel}>Revistas</Text>
              <Text style={styles.materialValor}>{geral.revistas}</Text>
            </View>
          </View>
        </View>

        {/* Destaques */}
        {(destaques.melhor_turma ||
          destaques.aluno_destaque ||
          destaques.turma_mais_visitantes) && (
          <View style={styles.destaqueBox}>
            <View style={styles.destaqueTitulo}>
              <IconeEstrela cor={COR.amarelo} tamanho={12} />
              <Text>Destaques do dia</Text>
            </View>

            {destaques.melhor_turma && (
              <View style={styles.destaqueLinha}>
                <IconeTrofeu cor={COR.amarelo} tamanho={11} />
                <Text style={styles.destaqueTexto}>
                  Melhor taxa:{" "}
                  <Text style={styles.destaqueNome}>
                    {destaques.melhor_turma.turma_nome}
                  </Text>{" "}
                  ({destaques.melhor_turma.taxa}%)
                </Text>
              </View>
            )}

            {destaques.aluno_destaque &&
              destaques.aluno_destaque.presentes > 0 && (
                <View style={styles.destaqueLinha}>
                  <IconeEstrela cor={COR.azul} tamanho={11} />
                  <Text style={styles.destaqueTexto}>
                    Aluno destaque:{" "}
                    <Text style={styles.destaqueNome}>
                      {destaques.aluno_destaque.pessoa_nome}
                    </Text>{" "}
                    ({destaques.aluno_destaque.presentes} presenças)
                  </Text>
                </View>
              )}

            {destaques.turma_mais_visitantes && (
              <View style={styles.destaqueLinha}>
                <IconePessoa cor={COR.verde} tamanho={11} />
                <Text style={styles.destaqueTexto}>
                  Mais visitantes:{" "}
                  <Text style={styles.destaqueNome}>
                    {destaques.turma_mais_visitantes.turma_nome}
                  </Text>{" "}
                  ({destaques.turma_mais_visitantes.visitantes})
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Rodapé */}
        <Text style={styles.rodape} fixed>
          EBD Inteligente · Gerado em{" "}
          {formatarData(new Date().toISOString().slice(0, 10))}
        </Text>
      </Page>
    </Document>
  );
}

/** Gera e faz o download do PDF */
export async function gerarPdfRelatorio(
  dados: RelatorioDia,
  nomeArquivo?: string
) {
  const blob = await pdf(<PdfDocumento dados={dados} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo ?? `relatorio-ebd-${dados.domingo.data}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}