import { eachDayOfInterval, parseISO, isSunday, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function gerarDomingos(inicio: string, fim: string): string[] {
  const dias = eachDayOfInterval({
    start: parseISO(inicio),
    end: parseISO(fim),
  });
  return dias
    .filter((d) => isSunday(d))
    .map((d) => format(d, "yyyy-MM-dd"));
}

export function formatarData(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy");
}

export function formatarDataLonga(iso: string): string {
  const txt = format(parseISO(iso), "EEEE, d 'de' MMMM", { locale: ptBR });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

export function formatarMesAno(iso: string): string {
  const txt = format(parseISO(iso), "MMM/yyyy", { locale: ptBR });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

export function limitesTrimestre(ano: number, tri: 1 | 2 | 3 | 4) {
  const map = {
    1: { ini: `${ano}-01-01`, fim: `${ano}-03-31`, nome: `1º Trimestre ${ano}` },
    2: { ini: `${ano}-04-01`, fim: `${ano}-06-30`, nome: `2º Trimestre ${ano}` },
    3: { ini: `${ano}-07-01`, fim: `${ano}-09-30`, nome: `3º Trimestre ${ano}` },
    4: { ini: `${ano}-10-01`, fim: `${ano}-12-31`, nome: `4º Trimestre ${ano}` },
  } as const;
  return { ...map[tri], ano };
}

export function limitesPeriodo(
  ano: number,
  tipo: "bimestre" | "trimestre" | "semestre" | "ano",
  indice: number
) {
  const ranges: Record<string, [string, string][]> = {
    bimestre: [
      [`${ano}-01-01`, `${ano}-02-28`],
      [`${ano}-03-01`, `${ano}-04-30`],
      [`${ano}-05-01`, `${ano}-06-30`],
      [`${ano}-07-01`, `${ano}-08-31`],
      [`${ano}-09-01`, `${ano}-10-31`],
      [`${ano}-11-01`, `${ano}-12-31`],
    ],
    trimestre: [
      [`${ano}-01-01`, `${ano}-03-31`],
      [`${ano}-04-01`, `${ano}-06-30`],
      [`${ano}-07-01`, `${ano}-09-30`],
      [`${ano}-10-01`, `${ano}-12-31`],
    ],
    semestre: [
      [`${ano}-01-01`, `${ano}-06-30`],
      [`${ano}-07-01`, `${ano}-12-31`],
    ],
    ano: [[`${ano}-01-01`, `${ano}-12-31`]],
  };
  const r = ranges[tipo][indice - 1];
  return { ini: r[0], fim: r[1] };
}