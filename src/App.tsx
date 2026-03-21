import { useMemo, useState, useEffect } from "react"
import { Home, Wallet, Boxes, CheckSquare, Bot, Megaphone, Settings } from "lucide-react"

type Screen =
  | "inicio"
  | "finanzas"
  | "inventario"
  | "tareas"
  | "ia"
  | "marketing"
  | "config"

type Movement = {
  id: number
  type: "ingreso" | "gasto"
  amount: number
  category: string
}

type Product = {
  id: number
  name: string
  stock: number
}

type Task = {
  id: number
  title: string
  done: boolean
}

const currency = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(v)

export default function App() {
  const [screen, setScreen] = useState<Screen>("inicio")

  const [businessName, setBusinessName] = useState("Mi Negocio")

  const [movements, setMovements] = useState<Movement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const [aiInput, setAiInput] = useState("")
  const [aiMessages, setAiMessages] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("startsmart-data")
    if (saved) {
      const data = JSON.parse(saved)
      setMovements(data.movements || [])
      setProducts(data.products || [])
      setTasks(data.tasks || [])
      setBusinessName(data.businessName || "Mi Negocio")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "startsmart-data",
      JSON.stringify({
        movements,
        products,
        tasks,
        businessName,
      })
    )
  }, [movements, products, tasks, businessName])

  const income = useMemo(
    () =>
      movements
        .filter((m) => m.type === "ingreso")
        .reduce((s, m) => s + m.amount, 0),
    [movements]
  )

  const expense = useMemo(
    () =>
      movements
        .filter((m) => m.type === "gasto")
        .reduce((s, m) => s + m.amount, 0),
    [movements]
  )

  const profit = income - expense

  function addMovement() {
    const amount = Number(prompt("Cantidad"))
    const type = prompt("Tipo: ingreso o gasto") as "ingreso" | "gasto"
    const category = prompt("Categoría") || ""

    if (!amount || !type) return

    setMovements([
      ...movements,
      {
        id: Date.now(),
        amount,
        type,
        category,
      },
    ])
  }

  function addProduct() {
    const name = prompt("Nombre producto")
    const stock = Number(prompt("Stock"))

    if (!name) return

    setProducts([
      ...products,
      {
        id: Date.now(),
        name,
        stock,
      },
    ])
  }

  function addTask() {
    const title = prompt("Nueva tarea")

    if (!title) return

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title,
        done: false,
      },
    ])
  }

  function sendAI() {
    if (!aiInput) return

    const reply =
      "Consejo IA: intenta publicar hoy en redes y ofrecer una promoción."

    setAiMessages([...aiMessages, "Tú: " + aiInput, reply])
    setAiInput("")
  }

  return (
    <div className="page-shell">
      <div className="phone-frame">

        <header className="hero-header">
          <div>
            <p className="brand-kicker">{businessName}</p>
            <h1>StartSmart</h1>
          </div>
        </header>

        <main className="screen-content">

          {screen === "inicio" && (
            <div className="stack">

              <Card title="Resumen">
                <Metric label="Ingresos" value={currency(income)} />
                <Metric label="Gastos" value={currency(expense)} />
                <Metric label="Ganancia" value={currency(profit)} />
              </Card>

              <Card title="Tareas">
                {tasks.map((t) => (
                  <div key={t.id} className="list-row">
                    <span>{t.title}</span>
                    <button
                      onClick={() =>
                        setTasks(
                          tasks.map((x) =>
                            x.id === t.id ? { ...x, done: !x.done } : x
                          )
                        )
                      }
                    >
                      {t.done ? "✔" : "○"}
                    </button>
                  </div>
                ))}

                <button onClick={addTask}>+ Agregar tarea</button>
              </Card>
            </div>
          )}

          {screen === "finanzas" && (
            <div className="stack">

              <Card title="Movimientos">
                {movements.map((m) => (
                  <div key={m.id} className="list-row">
                    <span>{m.category}</span>
                    <strong>
                      {m.type === "ingreso" ? "+" : "-"}
                      {currency(m.amount)}
                    </strong>
                  </div>
                ))}

                <button onClick={addMovement}>
                  + Agregar movimiento
                </button>
              </Card>
            </div>
          )}

          {screen === "inventario" && (
            <div className="stack">
              {products.map((p) => (
                <Card key={p.id}>
                  <div className="list-row">
                    <span>{p.name}</span>
                    <strong>Stock {p.stock}</strong>
                  </div>
                </Card>
              ))}

              <button onClick={addProduct}>+ Agregar producto</button>
            </div>
          )}

          {screen === "tareas" && (
            <div className="stack">
              {tasks.map((t) => (
                <Card key={t.id}>
                  <div className="list-row">
                    <span>{t.title}</span>
                    <strong>{t.done ? "✔" : "Pendiente"}</strong>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {screen === "ia" && (
            <Card title="Asistente IA">

              <div style={{marginBottom:10}}>
                {aiMessages.map((m, i) => (
                  <p key={i}>{m}</p>
                ))}
              </div>

              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Pregunta algo..."
              />

              <button onClick={sendAI}>Enviar</button>

            </Card>
          )}

          {screen === "marketing" && (
            <Card title="Ideas de Marketing">
              <p>Publica hoy una promoción en historias.</p>
              <p>Ofrece un descuento por tiempo limitado.</p>
            </Card>
          )}

          {screen === "config" && (
            <Card title="Configuración">

              <p>Nombre del negocio</p>

              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />

            </Card>
          )}

        </main>

        <nav className="bottom-nav">

          <NavButton current={screen} id="inicio" icon={<Home size={18}/>} label="Inicio" onPress={setScreen}/>
          <NavButton current={screen} id="finanzas" icon={<Wallet size={18}/>} label="Finanzas" onPress={setScreen}/>
          <NavButton current={screen} id="inventario" icon={<Boxes size={18}/>} label="Inventario" onPress={setScreen}/>
          <NavButton current={screen} id="tareas" icon={<CheckSquare size={18}/>} label="Tareas" onPress={setScreen}/>
          <NavButton current={screen} id="ia" icon={<Bot size={18}/>} label="IA" onPress={setScreen}/>
          <NavButton current={screen} id="marketing" icon={<Megaphone size={18}/>} label="Marketing" onPress={setScreen}/>
          <NavButton current={screen} id="config" icon={<Settings size={18}/>} label="Config" onPress={setScreen}/>

        </nav>

      </div>
    </div>
  )
}

function Card({title,children}:{title?:string,children:React.ReactNode}){
  return(
    <section className="card">
      {title&&<h3>{title}</h3>}
      {children}
    </section>
  )
}

function Metric({label,value}:{label:string,value:string}){
  return(
    <div className="metric-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function NavButton({current,id,icon,label,onPress}:{current:Screen,id:Screen,icon:React.ReactNode,label:string,onPress:(v:Screen)=>void}){
  return(
    <button className={current===id?'nav-button active':'nav-button'} onClick={()=>onPress(id)}>
      {icon}
      <span>{label}</span>
    </button>
  )
}
