export function EmBreve({ titulo }: { titulo: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <div className="card text-center py-12">
        <div className="text-5xl mb-3">🚧</div>
        <p className="text-slate-600">
          Esta tela será construída em uma próxima parte.
        </p>
      </div>
    </div>
  );
}