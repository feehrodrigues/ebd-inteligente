import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Sala, SalaMembro } from "../lib/types";

interface SalasState {
  salas: Sala[];
  membros: Record<string, SalaMembro>;
  loading: boolean;
  erro: string | null;

  carregar: (userId: string) => Promise<void>;
  limpar: () => void;
  recarregar: () => Promise<void>;
  _userId: string | null;
}

export const useSalas = create<SalasState>((set, get) => ({
  salas: [],
  membros: {},
  loading: false,
  erro: null,
  _userId: null,

  carregar: async (userId) => {
    set({ loading: true, erro: null, _userId: userId });
    try {
      const { data: membros, error: errMembros } = await supabase
        .from("sala_membros")
        .select("*")
        .eq("user_id", userId)
        .eq("ativo", true);

      if (errMembros) throw errMembros;
      if (!membros || membros.length === 0) {
        set({ salas: [], membros: {}, loading: false });
        return;
      }

      const ids = membros.map((m) => m.sala_id);
      const { data: salas, error: errSalas } = await supabase
        .from("salas")
        .select("*")
        .in("id", ids);

      if (errSalas) throw errSalas;

      const mapa: Record<string, SalaMembro> = {};
      membros.forEach((m) => {
        mapa[m.sala_id] = m;
      });

      set({
        salas: (salas as Sala[]) ?? [],
        membros: mapa,
        loading: false,
      });
    } catch (e: any) {
      set({ erro: e.message ?? "Erro ao carregar salas", loading: false });
    }
  },

  recarregar: async () => {
    const uid = get()._userId;
    if (uid) await get().carregar(uid);
  },

  limpar: () =>
    set({ salas: [], membros: {}, loading: false, erro: null, _userId: null }),
}));