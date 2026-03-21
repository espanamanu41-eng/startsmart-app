import { useState } from "react"
import "./styles.css"

type Screen = "inicio" | "finanzas" | "inventario" | "tareas" | "ia"

export default function App() {
  const [screen, setScreen] = useState<Screen>("inicio")

  const renderScreen = () => {
    switch (screen) {
      case "inicio":
        return (
          <>
            <h2>Inicio</h2>
            <p>Bienvenido a StartSmart 🚀</p>
          </>
        )

      case "finanzas":
        return (
          <>
            <h2>Finanzas</h2>
            <p>Aquí registrarás ingresos y gastos.</p>
          </>
        )

      case "inventario":
        return (
          <>
            <h2>Inventario</h2>
            <p>Controla tus productos.</p>
          </>
        )

      case "tareas":
        return (
          <>
            <h2>Tareas</h2>
            <p>Organiza pendientes.</p>
          </>
        )

      case "ia":
        return (
          <>
            <h2>IA</h2>
            <p>Asistente para tu negocio.</p>
          </>
        )
    }
  }

  return (
    <div className="app">

      <div className="content">
        <h1>StartSmart</h1>
        {renderScreen()}
      </div>

      <div className="bottom-nav">
        <button onClick={() => setScreen("inicio")}>Inicio</button>
        <button onClick={() => setScreen("finanzas")}>Finanzas</button>
        <button onClick={() => setScreen("inventario")}>Inventario</button>
        <button onClick={() => setScreen("tareas")}>Tareas</button>
        <button onClick={() => setScreen("ia")}>IA</button>
      </div>

    </div>
  )
}
