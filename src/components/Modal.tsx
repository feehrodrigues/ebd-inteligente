import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  aberto,
  onFechar,
  titulo,
  children,
  larguraMax = "max-w-lg",
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: React.ReactNode;
  larguraMax?: string;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    if (aberto) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onFechar}
    >
      <div
        className={`bg-white w-full ${larguraMax} rounded-t-2xl md:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl md:rounded-t-2xl z-10">
          <h2 className="font-semibold text-slate-800">{titulo}</h2>
          <button onClick={onFechar} className="btn-ghost p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}