import { useState } from "react";

type Screen =
  | "inicio"
  | "ventas"
  | "finanzas"
  | "ia"
  | "marketing"
  | "historial"
  | "config";

export default function App() {
  const [logged, setLogged] = useState(false);
  const [screen, setScreen] = useState<Screen>("inicio");

  if (!logged) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="bg-slate-900 p-8 rounded-2xl w-80">
          <h1 className="text-2xl font-bold mb-6 text-center text-green-400">
            StartSmart
          </h1>

          <input
            placeholder="Correo"
            className="w-full mb-3 p-3 rounded bg-slate-800"
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full mb-4 p-3 rounded bg-slate-800"
          />

          <button
            onClick={() => setLogged(true)}
            className="w-full bg-green-500 hover:bg-green-600 p-3 rounded font-semibold"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-green-400">StartSmart</h1>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 p-5 pb-24">

        {screen === "inicio" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

            <div className="grid grid-cols-2 gap-4">

              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Ventas hoy</p>
                <h3 className="text-xl font-bold">$0</h3>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Ingresos</p>
                <h3 className="text-xl font-bold">$0</h3>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Gastos</p>
                <h3 className="text-xl font-bold">$0</h3>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Ideas nuevas</p>
                <h3 className="text-xl font-bold">0</h3>
              </div>

            </div>
          </div>
        )}

        {screen === "ventas" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Ventas</h2>
            <p className="text-slate-400">Aquí aparecerán tus ventas.</p>
          </div>
        )}

        {screen === "finanzas" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Finanzas</h2>
            <p className="text-slate-400">
              Control de ingresos y gastos.
            </p>
          </div>
        )}

        {screen === "ia" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Asistente IA</h2>
            <p className="text-slate-400">
              Aquí irá el asistente inteligente.
            </p>
          </div>
        )}

        {screen === "marketing" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Marketing</h2>
            <p className="text-slate-400">
              Herramientas de marketing.
            </p>
          </div>
        )}

        {screen === "historial" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Historial</h2>
            <p className="text-slate-400">
              Historial de movimientos.
            </p>
          </div>
        )}

        {screen === "config" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Configuración</h2>
            <p className="text-slate-400">
              Ajustes de la aplicación.
            </p>
          </div>
        )}

      </main>

      {/* MENÚ INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 text-sm">

        <button onClick={() => setScreen("inicio")}>Inicio</button>
        <button onClick={() => setScreen("ventas")}>Ventas</button>
        <button onClick={() => setScreen("finanzas")}>Finanzas</button>
        <button onClick={() => setScreen("ia")}>IA</button>
        <button onClick={() => setScreen("marketing")}>Marketing</button>

      </nav>

    </div>
  );
}
