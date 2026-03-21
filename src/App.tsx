import { useState } from "react"
import "./styles.css"

type Screen = "inicio" | "finanzas" | "inventario" | "tareas" | "ia" | "marketing"

export default function App() {
  const [screen, setScreen] = useState<Screen>("inicio")

  const renderScreen = () => {
    switch (screen) {
      case "inicio":
        return (
          <div>
            <h2>Dashboard</h2>
            <p>Bienvenido a StartSmart 🚀</p>
            <p>Aquí verás el resumen de tu negocio.</p>
          </div>
        )

      case "finanzas":
        return (
          <div>
            <h2>Finanzas</h2>
            <p>Aquí podrás registrar ingresos y gastos.</p>
          </div>
        )

      case "inventario":
        return (
          <div>
            <h2>Inventario</h2>
            <p>Aquí controlarás tus productos y stock.</p>
          </div>
        )

      case "tareas":
        return (
          <div>
            <h2>Tareas</h2>
            <p>Organiza pendientes de tu negocio.</p>
          </div>
        )

      case "ia":
        return (
          <div>
            <h2>Asistente IA</h2>
            <p>Obtén recomendaciones para mejorar tu negocio.</p>
          </div>
        )

      case "marketing":
        return (
          <div>
            <h2>Marketing</h2>
            <p>Ideas para promocionar tus productos.</p>
          </div>
        )
    }
  }

  return (
    <div className="app">

      <div className="sidebar">
        <h1>StartSmart</h1>

        <button onClick={() => setScreen("inicio")}>Inicio</button>
        <button onClick={() => setScreen("finanzas")}>Finanzas</button>
        <button onClick={() => setScreen("inventario")}>Inventario</button>
        <button onClick={() => setScreen("tareas")}>Tareas</button>
        <button onClick={() => setScreen("ia")}>IA</button>
        <button onClick={() => setScreen("marketing")}>Marketing</button>
      </div>

      <div className="main">
        {renderScreen()}
      </div>

    </div>
  )
}
