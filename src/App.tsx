import { useMemo, useState } from "react";
import { Bell, Home, Wallet, Boxes, CheckSquare, Bot, Megaphone, Settings } from "lucide-react";

type Screen =
  | "inicio"
  | "finanzas"
  | "inventario"
  | "tareas"
  | "ia"
  | "marketing"
  | "config";

type Movement = {
  id: number;
  type: "ingreso" | "gasto";
  amount: number;
  category: string;
};

type Product = {
  id: number;
  name: string;
  stock: number;
  cost: number;
  price: number;
};

type Task = {
  id: number;
  title: string;
  done: boolean;
};

const currency = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(v);

export default function App() {
  const [screen, setScreen] = useState<Screen>("inicio");

  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const income = useMemo(
    () =>
      movements
        .filter((m) => m.type === "ingreso")
        .reduce((s, m) => s + m.amount, 0),
    [movements]
  );

  const expense = useMemo(
    () =>
      movements
        .filter((m) => m.type === "gasto")
        .reduce((s, m) => s + m.amount, 0),
    [movements]
  );

  const profit = income - expense;

  function addMovement() {
    const amount = Number(prompt("Monto"));
    const type = prompt("Tipo: ingreso o gasto") as "ingreso" | "gasto";
    const category = prompt("Categoría") || "General";

    if (!amount || !type) return;

    setMovements([
      ...movements,
      {
        id: Date.now(),
        type,
        amount,
        category,
      },
    ]);
  }

  function addProduct() {
    const name = prompt("Nombre del producto");
    const stock = Number(prompt("Stock"));
    const cost = Number(prompt("Costo"));
    const price = Number(prompt("Precio"));

    if (!name) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        name,
        stock,
        cost,
        price,
      },
    ]);
  }

  function addTask() {
    const title = prompt("Nueva tarea");
    if (!title) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title,
        done: false,
      },
    ]);
  }

  function toggleTask(id: number) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function sendMessage() {
    if (!input) return;

    const userMsg = { from: "user", text: input };

    let response = "Intenta publicar hoy una promoción.";

    if (input.includes("vender")) {
      response = "Publica una promoción en historias hoy a las 7pm.";
    }

    if (input.includes("clientes")) {
      response = "Ofrece descuento a clientes frecuentes.";
    }

    const aiMsg = { from: "ai", text: response };

    setMessages([...messages, userMsg, aiMsg]);
    setInput("");
  }

  return (
    <div className="phone-frame">
      <header className="hero-header">
        <div>
          <p className="brand-kicker">Impulsa</p>
          <h1>Tu negocio</h1>
        </div>
        <Bell size={18} />
      </header>

      <main className="screen-content">

        {screen === "inicio" && (
          <div className="stack">
            <Card title="Resumen">
              <Metric label="Ingresos" value={currency(income)} />
              <Metric label="Gastos" value={currency(expense)} />
              <Metric label="Ganancia" value={currency(profit)} />
            </Card>
          </div>
        )}

        {screen === "finanzas" && (
          <div className="stack">
            <button onClick={addMovement}>+ Agregar movimiento</button>

            {movements.map((m) => (
              <Card key={m.id}>
                <div className="list-row">
                  <span>{m.category}</span>
                  <strong>
                    {m.type === "ingreso" ? "+" : "-"}
                    {currency(m.amount)}
                  </strong>
                </div>
              </Card>
            ))}
          </div>
        )}

        {screen === "inventario" && (
          <div className="stack">
            <button onClick={addProduct}>+ Agregar producto</button>

            {products.map((p) => (
              <Card key={p.id}>
                <div className="list-row">
                  <span>{p.name}</span>
                  <strong>Stock {p.stock}</strong>
                </div>
              </Card>
            ))}
          </div>
        )}

        {screen === "tareas" && (
          <div className="stack">
            <button onClick={addTask}>+ Nueva tarea</button>

            {tasks.map((t) => (
              <Card key={t.id}>
                <div className="list-row">
                  <span>{t.title}</span>
                  <button onClick={() => toggleTask(t.id)}>
                    {t.done ? "✔" : "○"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {screen === "ia" && (
          <div className="stack">
            <Card title="Asistente IA">
              <div>
                {messages.map((m, i) => (
                  <p key={i}>
                    <strong>{m.from === "user" ? "Tú:" : "IA:"}</strong>{" "}
                    {m.text}
                  </p>
                ))}
              </div>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta algo..."
              />

              <button onClick={sendMessage}>Enviar</button>
            </Card>
          </div>
        )}

        {screen === "marketing" && (
          <Card title="Ideas de marketing">
            <p>Publica hoy una historia mostrando tu producto.</p>
            <p>Ofrece 10% de descuento por tiempo limitado.</p>
          </Card>
        )}

        {screen === "config" && (
          <Card title="Configuración">
            <p>Nombre del negocio</p>
            <p>Moneda</p>
            <p>Modo oscuro (próximamente)</p>
          </Card>
        )}

      </main>

      <nav className="bottom-nav">
        <NavButton current={screen} id="inicio" icon={<Home size={18} />} label="Inicio" onPress={setScreen}/>
        <NavButton current={screen} id="finanzas" icon={<Wallet size={18} />} label="Finanzas" onPress={setScreen}/>
        <NavButton current={screen} id="inventario" icon={<Boxes size={18} />} label="Inventario" onPress={setScreen}/>
        <NavButton current={screen} id="tareas" icon={<CheckSquare size={18} />} label="Tareas" onPress={setScreen}/>
        <NavButton current={screen} id="ia" icon={<Bot size={18} />} label="IA" onPress={setScreen}/>
        <NavButton current={screen} id="marketing" icon={<Megaphone size={18} />} label="Marketing" onPress={setScreen}/>
        <NavButton current={screen} id="config" icon={<Settings size={18} />} label="Config" onPress={setScreen}/>
      </nav>
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="card">
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NavButton({
  current,
  id,
  icon,
  label,
  onPress,
}: {
  current: Screen;
  id: Screen;
  icon: React.ReactNode;
  label: string;
  onPress: (v: Screen) => void;
}) {
  return (
    <button
      className={current === id ? "nav-button active" : "nav-button"}
      onClick={() => onPress(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
