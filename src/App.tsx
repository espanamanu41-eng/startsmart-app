import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ivfqtuspgxnubwvuubyk.supabase.co",
  "sb_publishable_i7-55XtmSMMv1aistkP-nQ_jqANxYGr"
);

type Screen = "inicio" | "ventas" | "finanzas" | "historial" | "asistente";

type Movimiento = {
  id?: string;
  nombre: string;
  precio: number;
  fecha: string;
  tipo?: "venta" | "gasto";
};

type HistorialFijo = {
  nombre: string;
  movimientos: Movimiento[];
};

type Mensaje = {
  rol: "user" | "assistant";
  texto: string;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("inicio");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [ventas, setVentas] = useState<Movimiento[]>([]);
  const [gastos, setGastos] = useState<Movimiento[]>([]);

  const [historialesFijos, setHistorialesFijos] = useState<HistorialFijo[]>(() => {
    const data = localStorage.getItem("historialesFijos");
    return data ? JSON.parse(data) : [];
  });

  const [producto, setProducto] = useState("");
  const [precio, setPrecio] = useState("");
  const [gastoNombre, setGastoNombre] = useState("");
  const [gastoPrecio, setGastoPrecio] = useState("");
  const [nuevoHistorial, setNuevoHistorial] = useState("");
  const [historialActivo, setHistorialActivo] = useState<number | null>(null);
  const [movNombre, setMovNombre] = useState("");
  const [movPrecio, setMovPrecio] = useState("");

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      rol: "assistant",
      texto: "¡Hola! Soy tu asistente de negocios. Puedo analizar tus finanzas, darte consejos para aumentar ventas o responder preguntas sobre tu emprendimiento. ¿En qué te ayudo hoy?",
    },
  ]);
  const [inputIA, setInputIA] = useState("");
  const [cargandoIA, setCargandoIA] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargandoIA]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      cargarVentas();
      cargarGastos();
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("historialesFijos", JSON.stringify(historialesFijos));
  }, [historialesFijos]);

  async function handleLogin() {
    if (!email || !password) { alert("Debes llenar correo y contraseña"); return; }
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Usuario creado. Revisa tu correo para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function cargarVentas() {
    const { data } = await supabase.from("ventas").select("*").eq("user_id", user.id);
    if (data) setVentas(data);
  }

  async function cargarGastos() {
    const { data } = await supabase.from("gastos").select("*").eq("user_id", user.id);
    if (data) setGastos(data);
  }

  async function agregarVenta() {
    if (!producto || !precio) { alert("Debes llenar producto y precio"); return; }
    await supabase.from("ventas").insert({
      user_id: user.id,
      nombre: producto,
      precio: Number(precio),
      fecha: new Date().toLocaleDateString(),
      tipo: "venta",
    });
    await cargarVentas();
    setProducto("");
    setPrecio("");
  }

  async function agregarGasto() {
    if (!gastoNombre || !gastoPrecio) { alert("Debes llenar gasto y monto"); return; }
    await supabase.from("gastos").insert({
      user_id: user.id,
      nombre: gastoNombre,
      precio: Number(gastoPrecio),
      fecha: new Date().toLocaleDateString(),
      tipo: "gasto",
    });
    await cargarGastos();
    setGastoNombre("");
    setGastoPrecio("");
  }

  async function borrarVenta(i: number) {
    if (!ventas[i].id) return;
    if (confirm("¿Eliminar esta venta?")) {
      await supabase.from("ventas").delete().eq("id", ventas[i].id!);
      await cargarVentas();
    }
  }

  async function borrarGasto(i: number) {
    if (!gastos[i].id) return;
    if (confirm("¿Eliminar este gasto?")) {
      await supabase.from("gastos").delete().eq("id", gastos[i].id!);
      await cargarGastos();
    }
  }

  function crearHistorial() {
    if (!nuevoHistorial) { alert("Escribe nombre"); return; }
    setHistorialesFijos([...historialesFijos, { nombre: nuevoHistorial, movimientos: [] }]);
    setNuevoHistorial("");
  }

  function agregarMovimientoHistorial() {
    if (historialActivo === null) return;
    if (!movNombre || !movPrecio) { alert("Completa los datos"); return; }
    const copia = [...historialesFijos];
    copia[historialActivo].movimientos.push({
      nombre: movNombre,
      precio: Number(movPrecio),
      fecha: new Date().toLocaleDateString(),
    });
    setHistorialesFijos(copia);
    setMovNombre("");
    setMovPrecio("");
  }

  function borrarMovimientoHistorial(index: number) {
    if (historialActivo === null) return;
    if (confirm("¿Eliminar movimiento?")) {
      const copia = [...historialesFijos];
      copia[historialActivo].movimientos = copia[historialActivo].movimientos.filter((_, i) => i !== index);
      setHistorialesFijos(copia);
    }
  }

  async function enviarMensaje() {
    const texto = inputIA.trim();
    if (!texto || cargandoIA) return;
    const nuevosMensajes: Mensaje[] = [...mensajes, { rol: "user", texto }];
    setMensajes(nuevosMensajes);
    setInputIA("");
    setCargandoIA(true);
    try {
      const contexto = `Eres un asistente de negocios para emprendedores.
El negocio del usuario tiene estos datos actuales:
- Ventas registradas: ${ventas.length}
- Total ingresos: $${totalVentas}
- Total gastos: $${totalGastos}
- Ganancia neta: $${ganancia}
Da consejos prácticos, concretos y motivadores. Responde siempre en español. Sé conciso (máximo 3 párrafos).`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          system: contexto,
          messages: nuevosMensajes.map((m) => ({ role: m.rol, content: m.texto })),
        }),
      });
      const data = await response.json();
      const text = data?.content?.[0]?.text;
const respuesta = text ? text : "Error: " + (data?.error?.message ?? "respuesta inesperada");
      setMensajes([...nuevosMensajes, { rol: "assistant", texto: respuesta }]);
    } catch {
      setMensajes([...nuevosMensajes, { rol: "assistant", texto: "Hubo un error al conectar. Intenta de nuevo." }]);
    } finally {
      setCargandoIA(false);
    }
  }

  function handleKeyDownIA(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensaje(); }
  }

  const historialGeneral = [
    ...ventas.map(v => ({ ...v, tipo: "venta" as const })),
    ...gastos.map(g => ({ ...g, tipo: "gasto" as const })),
  ];

  const totalVentas = ventas.reduce((acc, v) => acc + v.precio, 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.precio, 0);
  const ganancia = totalVentas - totalGastos;
  const hoy = new Date().toLocaleDateString();
  const ventasHoy = ventas.filter(v => v.fecha === hoy).reduce((acc, v) => acc + v.precio, 0);

  const finanzasPorDia = historialGeneral.reduce((acc: any, mov) => {
    const existe = acc.find((d: any) => d.fecha === mov.fecha);
    if (existe) {
      if (mov.tipo === "venta") existe.ventas += mov.precio;
      else existe.gastos += mov.precio;
    } else {
      acc.push({ fecha: mov.fecha, ventas: mov.tipo === "venta" ? mov.precio : 0, gastos: mov.tipo === "gasto" ? mov.precio : 0 });
    }
    return acc;
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="bg-slate-900 p-8 rounded-2xl w-80">
          <h1 className="text-2xl font-bold mb-6 text-center text-green-400">StartSmart</h1>
          <input placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800" />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-3 rounded bg-slate-800" />
          <button onClick={handleLogin} className="w-full bg-green-500 p-3 rounded">
            {isRegister ? "Registrarse" : "Iniciar sesión"}
          </button>
          <p onClick={() => setIsRegister(!isRegister)} className="text-center text-sm text-green-400 mt-4 cursor-pointer">
            {isRegister ? "Ya tengo cuenta" : "Crear cuenta"}
          </p>
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
                <p className="text-slate-400 text-sm">Ventas hoy</p>
                <h3 className="text-xl font-bold">${ventasHoy}</h3>
              </div>
              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Ingresos</p>
                <h3 className="text-xl font-bold">${totalVentas}</h3>
              </div>
              <div className="bg-slate-900 p-5 rounded-xl">
                <p className="text-slate-400 text-sm">Gastos</p>
                <h3 className="text-xl font-bold">${totalGastos}</h3>
              </div>
              <div className="bg-slate-900 p-5 rounded-xl col-span-2">
                <p className="text-slate-400 text-sm">Ganancia</p>
                <h3 className="text-xl font-bold text-green-400">${ganancia}</h3>
              </div>
            </div>
            <div className="bg-slate-900 p-5 rounded-xl mt-6">
              <p className="text-slate-400 mb-3">Ventas vs Gastos por día</p>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={finanzasPorDia}>
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ventas" stroke="#22c55e" strokeWidth={3} />
                    <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {screen === "ventas" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Ventas</h2>
            <input placeholder="Producto" value={producto} onChange={(e) => setProducto(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800" />
            <input placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800" />
            <button onClick={agregarVenta} className="bg-green-500 p-3 rounded w-full mb-6">Agregar venta</button>
            {ventas.map((v, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded mb-2 flex justify-between">
                <span>{v.nombre} - ${v.precio}</span>
                <button onClick={() => borrarVenta(i)} className="text-red-400">Eliminar</button>
              </div>
            ))}
          </div>
        )}

        {screen === "finanzas" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gastos</h2>
            <input placeholder="Nombre del gasto" value={gastoNombre} onChange={(e) => setGastoNombre(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800" />
            <input placeholder="Monto" value={gastoPrecio} onChange={(e) => setGastoPrecio(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800" />
            <button onClick={agregarGasto} className="bg-red-500 p-3 rounded w-full mb-6">Agregar gasto</button>
            {gastos.map((g, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded mb-2 flex justify-between">
                <span>{g.nombre} - ${g.precio}</span>
                <button onClick={() => borrarGasto(i)} className="text-red-400">Eliminar</button>
              </div>
            ))}
          </div>
        )}

        {screen === "historial" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Historiales personalizados</h2>
            <input placeholder="Nombre del historial" value={nuevoHistorial} onChange={(e) => setNuevoHistorial(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800" />
            <button onClick={crearHistorial} className="bg-blue-500 p-3 rounded w-full mb-6">Crear historial</button>
            {historialesFijos.map((h, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded mb-3">
                <div className="flex justify-between mb-3">
                  <strong>{h.nombre}</strong>
                  <button onClick={() => setHistorialActivo(historialActivo === i ? null : i)}>
                    {historialActivo === i ? "Cerrar" : "Abrir"}
                  </button>
                </div>
                {historialActivo === i && (
                  <div>
                    <input placeholder="Movimiento" value={movNombre} onChange={(e) => setMovNombre(e.target.value)} className="w-full mb-2 p-2 rounded bg-slate-800" />
                    <input placeholder="Monto" value={movPrecio} onChange={(e) => setMovPrecio(e.target.value)} className="w-full mb-2 p-2 rounded bg-slate-800" />
                    <button onClick={agregarMovimientoHistorial} className="bg-green-500 p-2 rounded w-full mb-3">Agregar</button>
                    {h.movimientos.map((m, j) => (
                      <div key={j} className="flex justify-between text-sm mb-1">
                        <span>{m.nombre} ${m.precio}</span>
                        <button onClick={() => borrarMovimientoHistorial(j)}>❌</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <hr className="my-6 border-slate-700" />
            <h2 className="text-2xl font-bold mb-6">Historial general</h2>
            {historialGeneral.map((m, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded mb-2 flex justify-between">
                <span>{m.nombre} - ${m.precio}</span>
                <span className={m.tipo === "venta" ? "text-green-400" : "text-red-400"}>{m.tipo}</span>
              </div>
            ))}
          </div>
        )}

        {screen === "asistente" && (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Asistente IA</h2>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded-lg">
                <p className="text-slate-400">Ingresos</p>
                <p className="text-green-400 font-bold">${totalVentas}</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <p className="text-slate-400">Gastos</p>
                <p className="text-red-400 font-bold">${totalGastos}</p>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <p className="text-slate-400">Ganancia</p>
                <p className={`font-bold ${ganancia >= 0 ? "text-green-400" : "text-red-400"}`}>${ganancia}</p>
              </div>
            </div>
            <div className="space-y-3 mb-4 overflow-y-auto" style={{ maxHeight: "42vh" }}>
              {mensajes.map((m, i) => (
                <div key={i} className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.rol === "user" ? "bg-purple-600 text-white rounded-br-sm" : "bg-slate-800 text-slate-100 rounded-bl-sm"}`}>
                    {m.rol === "assistant" && <span className="text-purple-400 text-xs font-semibold block mb-1">✦ Asistente</span>}
                    {m.texto}
                  </div>
                </div>
              ))}
              {cargandoIA && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-sm text-sm">
                    <span className="text-purple-400 text-xs font-semibold block mb-1">✦ Asistente</span>
                    <span className="animate-pulse text-slate-400">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2">
              <input
                value={inputIA}
                onChange={(e) => setInputIA(e.target.value)}
                onKeyDown={handleKeyDownIA}
                placeholder="Pregunta algo sobre tu negocio..."
                className="flex-1 p-3 rounded-xl bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={cargandoIA}
              />
              <button
                onClick={enviarMensaje}
                disabled={cargandoIA || !inputIA.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 px-4 rounded-xl transition-colors"
              >
                ➤
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {["¿Cómo aumentar mis ventas?", "Analiza mis finanzas", "Consejos para reducir gastos"].map((s) => (
                <button key={s} onClick={() => setInputIA(s)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 text-sm">
        <button onClick={() => setScreen("inicio")}>Inicio</button>
        <button onClick={() => setScreen("ventas")}>Ventas</button>
        <button onClick={() => setScreen("finanzas")}>Gastos</button>
        <button onClick={() => setScreen("historial")}>Historial</button>
        <button onClick={() => setScreen("asistente")} className="text-purple-400 font-semibold">IA ✦</button>
      </nav>
    </div>
  );
       }
