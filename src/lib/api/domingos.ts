import { supabase } from "../supabase";
import type { Domingo } from "../types";

export async function obterDomingo(id: string): Promise<Domingo | null> {
  const { data, error } = await supabase
    .from("domingos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Domingo | null;
}

export async function listarDomingosDoPeriodo(
  trimestreId: string
): Promise<Domingo[]> {
  const { data, error } = await supabase
    .from("domingos")
    .select("*")
    .eq("trimestre_id", trimestreId)
    .eq("ativo", true)
    .order("data", { ascending: true });
  if (error) throw error;
  return (data as Domingo[]) ?? [];
}

export async function atualizarDomingo(
  id: string,
  patch: Partial<
    Pick<Domingo, "clima" | "aula_cancelada" | "motivo_cancelamento" | "observacao_dia">
  >
): Promise<Domingo> {
  const { data, error } = await supabase
    .from("domingos")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Domingo;
}

export async function domingoPadrao(trimestreId: string): Promise<Domingo | null> {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data: proximo } = await supabase
    .from("domingos")
    .select("*")
    .eq("trimestre_id", trimestreId)
    .eq("ativo", true)
    .gte("data", hoje)
    .order("data", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (proximo) return proximo as Domingo;

  const { data: ultimo } = await supabase
    .from("domingos")
    .select("*")
    .eq("trimestre_id", trimestreId)
    .eq("ativo", true)
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (ultimo as Domingo) ?? null;
}