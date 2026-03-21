import { useState } from "react";

type Screen =
  | "inicio"
  | "finanzas"
  | "inventario"
  | "tareas"
  | "ia"
  | "marketing";

export default function App() {
  const [screen, setScreen] = useState<Screen>("inicio");

  const renderScreen = () => {
    switch (screen) {
      case "inicio":
        return (
          <div>
            <h2>Dashboard</h2>
            <p>Bienvenido a StartSmart 🚀</p>
            <p>Aquí verás el resumen de tu negocio.</p>
          </div>
        );

      case "finanzas":
        return (
          <div>
            <h2>Finanzas</h2>
            <p>Registra ingresos y gastos.</p>
          </div>
        );

      case "inventario":
        return (
          <div>
            <h2>Inventario</h2>
            <p>Controla productos y stock.</p>
          </div>
        );

      case "tareas":
        return (
          <div>
            <h2>Tareas</h2>
            <p>Organiza pendientes de tu negocio.</p>
          </div>
        );

      case "ia":
        return (
          <div>
            <h2>Asistente IA</h2>
            <p>Obtén consejos para tu negocio.</p>
          </div>
        );

      case "marketing":
        return (
          <div>
            <h2>Marketing</h2>
            <p>Ideas para promocionar tus productos.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1>StartSmart</h1>

      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setScreen("inicio")}>Inicio</button>
        <button onClick={() => setScreen("finanzas")}>Finanzas</button>
        <button onClick={() => setScreen("inventario")}>Inventario</button>
        <button onClick={() => setScreen("tareas")}>Tareas</button>
        <button onClick={() => setScreen("ia")}>IA</button>
        <button onClick={() => setScreen("marketing")}>Marketing</button>
      </nav>

      <div>{renderScreen()}</div>
    </div>
  );
}
