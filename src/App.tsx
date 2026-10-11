import { Relatorio } from "./pages/Relatorio";
import { useAuth, useUser, SignIn, Show } from "@clerk/react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { RotaProtegida } from "./components/RotaProtegida";
import { Salas } from "./pages/Salas";
import { Dashboard } from "./pages/Dashboard";
import { Chamada } from "./pages/Chamada";
import { Pessoas } from "./pages/Pessoas";
import { Membros } from "./pages/Membros";
import { Turmas } from "./pages/Turmas";
import { Trimestres } from "./pages/Trimestres";
import { Licoes } from "./pages/Licoes";
import { Ajustes } from "./pages/Ajustes";
import { EmBreve } from "./pages/EmBreve";
import { useSalas } from "./stores/salas";
import { getSalaAtivaId } from "./lib/sessao";
import { Escala } from "./pages/Escala";

function LoginScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 text-center">
        <span className="text-5xl">📖</span>
        <h1 className="text-3xl font-extrabold text-brand-700 mt-3">
          EBD Inteligente
        </h1>
        <p className="text-slate-500 mt-1">
          Gestão da Escola Bíblica Dominical
        </p>
      </div>
      <div className="w-full max-w-md flex justify-center">
        <SignIn routing="hash" />
      </div>
    </div>
  );
}

function Roteador() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { salas, loading, carregar } = useSalas();

  useEffect(() => {
    if (isSignedIn && user?.id) {
      carregar(user.id);
    }
  }, [isSignedIn, user?.id, carregar]);

  if (!isLoaded) return null;

  const salaAtivaId = getSalaAtivaId();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isSignedIn ? "/salas" : "/login"} replace />}
      />

      <Route
        path="/login"
        element={
          isSignedIn ? <Navigate to="/salas" replace /> : <LoginScreen />
        }
      />

      <Route
        path="/salas"
        element={
          <RotaProtegida>{loading ? null : <Salas />}</RotaProtegida>
        }
      />

      <Route
        path="/app"
        element={
          <RotaProtegida>
            {!salaAtivaId ? (
              <Navigate to="/salas" replace />
            ) : !loading && salas.length === 0 ? (
              <Navigate to="/salas" replace />
            ) : (
              <Layout />
            )}
          </RotaProtegida>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="chamada" element={<Chamada />} />
        <Route path="pessoas" element={<Pessoas />} />
        <Route path="membros" element={<Membros />} />
        <Route path="turmas" element={<Turmas />} />
        <Route path="trimestres" element={<Trimestres />} />
        <Route path="licoes" element={<Licoes />} />
        <Route path="configuracoes" element={<Ajustes />} />
        <Route path="escala" element={<Escala />} />
        <Route path="relatorios" element={<Relatorio />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Show when="signed-out" fallback={<Roteador />}>
      <LoginScreen />
    </Show>
  );
} 