import { useState } from "react";

type Screen = "inicio" | "ventas" | "finanzas" | "ia" | "marketing" | "historial" | "config";

export default function App() {
  const [logged, setLogged] = useState(false);
  const [screen, setScreen] = useState<Screen>("inicio");

  if (!logged) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <div className="bg-slate-900 p-8 rounded-2xl w-80">
          <h1 className="text-2xl font-bold mb-6 text-center text-green-400">
            StartSmart
          </h1>

          <input
            placeholder="Correo"
            className="w-full mb-3 p-2 rounded bg-slate-800"
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full mb-4 p-2 rounded bg-slate-800"
          />

          <button
            onClick={() => setLogged(true)}
            className="w-full bg-green-500 hover:bg-green-600 p-2 rounded"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white">

      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-bold text-green-400">StartSmart</h1>

        <nav className="flex flex-col gap-3 text-sm">
          <button onClick={() => setScreen("inicio")} className="text-left hover:text-green-400">Inicio</button>
          <button onClick={() => setScreen("ventas")} className="text-left hover:text-green-400">Ventas</button>
          <button onClick={() => setScreen("finanzas")} className="text-left hover:text-green-400">Finanzas</button>
          <button onClick={() => setScreen("ia")} className="text-left hover:text-green-400">IA</button>
          <button onClick={() => setScreen("marketing")} className="text-left hover:text-green-400">Marketing</button>
          <button onClick={() => setScreen("historial")} className="text-left hover:text-green-400">Historial</button>
          <button onClick={() => setScreen("config")} className="text-left hover:text-green-400">Configuración</button>
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-auto">

        {screen === "inicio" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Ventas hoy</p>
                <h3 className="text-2xl font-bold">$0</h3>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Ingresos</p>
                <h3 className="text-2xl font-bold">$0</h3>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Gastos</p>
                <h3 className="text-2xl font-bold">$0</h3>
              </div>
            </div>
          </div>
        )}

        {screen === "ventas" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Ventas</h2>
            <p className="text-slate-400">Aquí aparecerán tus ventas.</p>
          </div>
        )}

        {screen === "finanzas" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Finanzas</h2>
            <p className="text-slate-400">Control de ingresos y gastos.</p>
          </div>
        )}

        {screen === "ia" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Asistente IA</h2>
            <p className="text-slate-400">Aquí irá el asistente inteligente.</p>
          </div>
        )}

        {screen === "marketing" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Marketing</h2>
            <p className="text-slate-400">Herramientas de marketing.</p>
          </div>
        )}

        {screen === "historial" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Historial</h2>
            <p className="text-slate-400">Historial de movimientos.</p>
          </div>
        )}

        {screen === "config" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Configuración</h2>
            <p className="text-slate-400">Ajustes de la aplicación.</p>
          </div>
        )}

      </main>
    </div>
  );
}
