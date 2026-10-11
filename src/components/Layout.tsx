import { useContarSolicitacoes } from "../hooks/useContarSolicitacoes";
import { ShieldCheck } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { UserButton } from "@clerk/react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  GraduationCap,
  CalendarDays,
  CalendarCheck,
  BookOpen,
  BarChart3,
  Settings,
  ArrowLeftRight,
} from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { usePeriodo } from "../hooks/usePeriodo";
import { limparSalaAtiva } from "../lib/sessao";
import { SeletorPeriodo } from "./SeletorPeriodo";

const NAV = [
  { to: "/app",              label: "Dashboard",  icon: LayoutDashboard, end: true },
  { to: "/app/chamada",      label: "Chamada",    icon: ClipboardCheck },
  { to: "/app/pessoas",      label: "Pessoas",    icon: Users },
  { to: "/app/membros", label: "Membros", icon: ShieldCheck },
  { to: "/app/turmas",       label: "Turmas",     icon: GraduationCap },
  { to: "/app/trimestres",   label: "Períodos",   icon: CalendarDays },
  { to: "/app/escala", label: "Escala", icon: CalendarCheck },
  { to: "/app/licoes",       label: "Lições",     icon: BookOpen },
  { to: "/app/relatorios", label: "Relatório", icon: BarChart3 },
  { to: "/app/configuracoes",label: "Ajustes",    icon: Settings },
];

export function Layout() {
  const nav = useNavigate();
  const { sala } = useSalaAtiva();
  const { periodo, periodos, selecionar } = usePeriodo(sala?.id);
  const pendentes = useContarSolicitacoes(sala?.id);

  function trocarSala() {
    limparSalaAtiva();
    nav("/salas");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex md:flex-col sticky top-0 z-30">
        <div className="hidden md:block p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📖</span>
            <div className="min-w-0">
              <p className="font-bold text-brand-700 leading-tight">
                EBD Inteligente
              </p>
              <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                {sala?.nome}
              </p>
            </div>
          </div>
          <button
            onClick={trocarSala}
            className="btn-ghost text-xs w-full justify-start"
          >
            <ArrowLeftRight size={14} /> Trocar sala
          </button>
        </div>

        <nav className="flex md:flex-col flex-1 overflow-x-auto md:overflow-visible">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
  key={to}
  to={to}
  end={end}
  className={({ isActive }) =>
    `flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
      isActive
        ? "text-brand-700 bg-brand-50 md:border-r-2 md:border-brand-600"
        : "text-slate-600 hover:bg-slate-50"
    }`
  }
>
  <Icon size={18} />
  <span>{label}</span>
  {to === "/app/membros" && pendentes > 0 && (
    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {pendentes}
    </span>
  )}
</NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center justify-between p-4 border-t border-slate-200">
          <span className="text-xs text-slate-500">Sua conta</span>
          <UserButton />
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {/* Header desktop */}
        <header className="hidden md:flex items-center justify-between gap-3 p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="text-sm text-slate-500">
            {sala?.nome && <span>{sala.nome}</span>}
          </div>
          <SeletorPeriodo
            periodoAtual={periodo}
            periodos={periodos}
            onSelecionar={selecionar}
          />
        </header>

        {/* Header mobile */}
        <header className="md:hidden flex items-center justify-between gap-2 p-3 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">📖</span>
            <div className="min-w-0">
              <p className="font-bold text-brand-700 text-sm leading-tight truncate max-w-[140px]">
                {sala?.nome}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <SeletorPeriodo
              periodoAtual={periodo}
              periodos={periodos}
              onSelecionar={selecionar}
            />
            <button onClick={trocarSala} className="btn-ghost p-2">
              <ArrowLeftRight size={16} />
            </button>
            <UserButton />
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}