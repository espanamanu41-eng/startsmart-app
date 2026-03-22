import { useState } from "react";

type Screen =
  | "inicio"
  | "ventas"
  | "finanzas"
  | "ia"
  | "marketing"
  | "historial"
  | "config";

type Movimiento = {
  nombre: string;
  precio: number;
};

export default function App() {

  const [logged, setLogged] = useState(false);
  const [screen, setScreen] = useState<Screen>("inicio");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [ventas, setVentas] = useState<Movimiento[]>([]);
  const [producto, setProducto] = useState("");
  const [precio, setPrecio] = useState("");

  const [gastos, setGastos] = useState<Movimiento[]>([]);
  const [gastoNombre, setGastoNombre] = useState("");
  const [gastoPrecio, setGastoPrecio] = useState("");

  function handleLogin() {
    if (!email || !password) {
      alert("Debes llenar correo y contraseña");
      return;
    }

    setLogged(true);
  }

  function agregarVenta() {
    if (!producto || !precio) {
      alert("Debes llenar producto y precio");
      return;
    }

    const nuevaVenta = {
      nombre: producto,
      precio: Number(precio)
    };

    setVentas([...ventas, nuevaVenta]);
    setProducto("");
    setPrecio("");
  }

  function agregarGasto() {
    if (!gastoNombre || !gastoPrecio) {
      alert("Debes llenar gasto y monto");
      return;
    }

    const nuevoGasto = {
      nombre: gastoNombre,
      precio: Number(gastoPrecio)
    };

    setGastos([...gastos, nuevoGasto]);
    setGastoNombre("");
    setGastoPrecio("");
  }

  const totalVentas = ventas.reduce((acc, v) => acc + v.precio, 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.precio, 0);
  const ganancia = totalVentas - totalGastos;

  if (!logged) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="bg-slate-900 p-8 rounded-2xl w-80">

          <h1 className="text-2xl font-bold mb-6 text-center text-green-400">
            StartSmart
          </h1>

          <input
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 p-3 rounded bg-slate-800"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-slate-800"
          />

          <button
            onClick={handleLogin}
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

      <header className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-green-400">StartSmart</h1>
      </header>

      <main className="flex-1 p-5 pb-24">

        {screen === "inicio" && (
          <div>

            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

            <div className="grid grid-cols-2 gap-4">

              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Ventas registradas</p>
                <h3 className="text-xl font-bold">{ventas.length}</h3>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Ingresos</p>
                <h3 className="text-xl font-bold">${totalVentas}</h3>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Gastos</p>
                <h3 className="text-xl font-bold">${totalGastos}</h3>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Ganancia</p>
                <h3 className="text-xl font-bold text-green-400">${ganancia}</h3>
              </div>

            </div>

          </div>
        )}

        {screen === "ventas" && (
          <div>

            <h2 className="text-2xl font-bold mb-4">Registrar venta</h2>

            <input
              placeholder="Producto"
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              className="w-full mb-3 p-3 rounded bg-slate-800"
            />

            <input
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full mb-3 p-3 rounded bg-slate-800"
            />

            <button
              onClick={agregarVenta}
              className="bg-green-500 hover:bg-green-600 p-3 rounded w-full font-semibold"
            >
              Agregar venta
            </button>

            <div className="mt-6">

              <h3 className="text-lg font-bold mb-2">Historial</h3>

              {ventas.map((v, i) => (
                <div
                  key={i}
                  className="bg-slate-900 p-3 rounded mb-2 flex justify-between"
                >
                  <span>{v.nombre}</span>
                  <span>${v.precio}</span>
                </div>
              ))}

            </div>

          </div>
        )}

        {screen === "finanzas" && (
          <div>

            <h2 className="text-2xl font-bold mb-4">Registrar gasto</h2>

            <input
              placeholder="Nombre del gasto"
              value={gastoNombre}
              onChange={(e) => setGastoNombre(e.target.value)}
              className="w-full mb-3 p-3 rounded bg-slate-800"
            />

            <input
              placeholder="Monto"
              value={gastoPrecio}
              onChange={(e) => setGastoPrecio(e.target.value)}
              className="w-full mb-3 p-3 rounded bg-slate-800"
            />

            <button
              onClick={agregarGasto}
              className="bg-red-500 hover:bg-red-600 p-3 rounded w-full font-semibold"
            >
              Agregar gasto
            </button>

            <div className="mt-6">

              <h3 className="text-lg font-bold mb-2">Historial de gastos</h3>

              {gastos.map((g, i) => (
                <div
                  key={i}
                  className="bg-slate-900 p-3 rounded mb-2 flex justify-between"
                >
                  <span>{g.nombre}</span>
                  <span>${g.precio}</span>
                </div>
              ))}

            </div>

          </div>
        )}

        {screen === "ia" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Asistente IA</h2>
            <p className="text-slate-400">
              Próximamente asistente inteligente para negocios.
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

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 text-sm">

        <button onClick={() => setScreen("inicio")}>Inicio</button>
        <button onClick={() => setScreen("ventas")}>Ventas</button>
        <button onClick={() => setScreen("finanzas")}>Gastos</button>
        <button onClick={() => setScreen("ia")}>IA</button>
        <button onClick={() => setScreen("marketing")}>Marketing</button>

      </nav>

    </div>
  );
}
