import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@supabase/supabase-js";
import { Store, Info, Share2, Bell, HelpCircle, LogOut, ChevronDown, ChevronUp, Plus, Check, Package } from "lucide-react";

const supabase = createClient(
  "https://ivfqtuspgxnubwvuubyk.supabase.co",
  "sb_publishable_i7-55XtmSMMv1aistkP-nQ_jqANxYGr"
);

const VAPID_PUBLIC_KEY = "BJRvbwSKnhHjgUFPx3WHa0pYe0WGDOjw4OFmwlJxqluJPe8ZqnRssNFLsohFcOXoklUANZW0bIEE5bPfLUlGdgo";

type Screen = "inicio" | "ventas" | "finanzas" | "historial" | "inventario" | "asistente";
type Movimiento = { id?: string; nombre: string; precio: number; fecha: string; tipo?: "venta" | "gasto" };
type HistorialFijo = { id?: string; nombre: string; movimientos: Movimiento[] };
type Mensaje = { rol: "user" | "assistant"; texto: string };
type ModalConfig = { mensaje: string; onConfirm: () => void };
type Producto = { id?: string; nombre: string; stock: number; precio?: number; alerta_stock?: number };

const DIAS_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HORARIOS_DEFAULT = DIAS_LABELS.map((_, i) => ({
  activo: i < 5,
  apertura: i < 5 ? "09:00" : "10:00",
  cierre: i < 5 ? "19:00" : "15:00",
}));

const MSGS_MANANA = [
  "¡Nuevo día, nueva oportunidad de vender! 🚀",
  "¡Buenos días! Hoy puede ser tu mejor día de ventas 💪",
  "¡Arriba! Tu negocio te necesita hoy 🔥",
  "Cada venta cuenta. ¡Empieza fuerte! ⚡",
  "¡El éxito empieza con el primer cliente del día! 🌟",
];
const MSGS_MEDIO = [
  "¿Ya registraste tus ventas de esta mañana? 📊",
  "Mitad del día — ¿cómo van las ventas? Anótalas 📝",
  "¡No dejes para después! Registra tus movimientos 💰",
  "Un negocio ordenado es un negocio exitoso. ¡Anota! ✍️",
];
const MSGS_NOCHE = [
  "¿Ya cerraste el día? No olvides anotar todo 🌙",
  "Último recordatorio del día — ¿registraste todo? ✅",
  "Buen trabajo hoy. Ahora anota tus ventas finales 📈",
  "¡No pierdas ni un peso! Registra antes de cerrar 💼",
];

function calcMedioDia(apertura: string, cierre: string) {
  const [h1] = apertura.split(":").map(Number);
  const [h2] = cierre.split(":").map(Number);
  return `${String(Math.floor((h1 + h2) / 2)).padStart(2, "0")}:00`;
}

function calcCierreNotif(cierre: string) {
  const [h, m] = cierre.split(":").map(Number);
  const total = h * 60 + m - 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function suscribirPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  } catch (e) {
    return null;
  }
}

function ModalConfirm({ config, onClose }: { config: ModalConfig; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-white text-base mb-6 text-center">{config.mensaje}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 font-medium">Cancelar</button>
          <button onClick={() => { config.onConfirm(); onClose(); }} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, sublabel, onClick, danger = false, children, expanded }: any) {
  return (
    <div className="mb-1">
      <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${danger ? "hover:bg-red-500/10" : "hover:bg-slate-800"}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? "bg-red-500/10" : "bg-slate-800"}`}>
          <Icon size={16} className={danger ? "text-red-400" : "text-slate-300"} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${danger ? "text-red-400" : "text-white"}`}>{label}</p>
          {sublabel && <p className="text-slate-500 text-xs">{sublabel}</p>}
        </div>
        {children !== undefined && (expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />)}
      </button>
      {children}
    </div>
  );
}

function NotificacionesPanel() {
  const [horarios, setHorarios] = useState(() => {
    const saved = localStorage.getItem("horarios");
    return saved ? JSON.parse(saved) : HORARIOS_DEFAULT;
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const toggleDia = (idx: number) => {
    const copia = [...horarios];
    copia[idx] = { ...copia[idx], activo: !copia[idx].activo };
    setHorarios(copia);
  };

  const updateHorario = (idx: number, campo: string, valor: string) => {
    const copia = [...horarios];
    copia[idx] = { ...copia[idx], [campo]: valor };
    setHorarios(copia);
  };

  const handleGuardar = async () => {
    setCargando(true);
    localStorage.setItem("horarios", JSON.stringify(horarios));
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        const sub = await suscribirPush();
        if (sub) {
          const { data: { user } } = await supabase.auth.getUser();
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: sub.toJSON(), user_id: user?.id, horarios }),
          });
        }
        setGuardado(true);
        setTimeout(() => { setGuardado(false); setDiaSeleccionado(null); }, 2000);
      } else {
        alert("Necesitas permitir notificaciones en tu navegador.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="px-3 pb-3 space-y-3">
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Toca un día para configurarlo</p>
        <div className="flex gap-1">
          {DIAS_LABELS.map((dia, idx) => (
            <button key={dia} onClick={() => setDiaSeleccionado(diaSeleccionado === idx ? null : idx)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                !horarios[idx].activo ? "bg-slate-800 text-slate-600 line-through"
                : diaSeleccionado === idx ? "bg-green-500 text-white"
                : "bg-green-500/20 text-green-400"
              }`}>{dia}</button>
          ))}
        </div>
      </div>

      {diaSeleccionado !== null && (
        <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white font-medium text-sm">{DIAS_LABELS[diaSeleccionado]}</p>
            <button onClick={() => toggleDia(diaSeleccionado)}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${horarios[diaSeleccionado].activo ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
              {horarios[diaSeleccionado].activo ? "Marcar cerrado" : "Marcar abierto"}
            </button>
          </div>
          {horarios[diaSeleccionado].activo && (
            <>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Apertura</p>
                  <input type="time" value={horarios[diaSeleccionado].apertura}
                    onChange={(e) => updateHorario(diaSeleccionado, "apertura", e.target.value)}
                    className="w-full bg-slate-700 text-white p-2 rounded-lg text-sm outline-none" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Cierre</p>
                  <input type="time" value={horarios[diaSeleccionado].cierre}
                    onChange={(e) => updateHorario(diaSeleccionado, "cierre", e.target.value)}
                    className="w-full bg-slate-700 text-white p-2 rounded-lg text-sm outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-wider">Notificaciones del día</p>
                {[
                  { emoji: "🌅", label: "Apertura", hora: horarios[diaSeleccionado].apertura, msg: MSGS_MANANA[0] },
                  { emoji: "☀️", label: "Mediodía", hora: calcMedioDia(horarios[diaSeleccionado].apertura, horarios[diaSeleccionado].cierre), msg: MSGS_MEDIO[0] },
                  { emoji: "🌙", label: "Cierre", hora: calcCierreNotif(horarios[diaSeleccionado].cierre), msg: MSGS_NOCHE[0] },
                ].map(({ emoji, label, hora, msg }) => (
                  <div key={label} className="bg-slate-700/50 rounded-xl p-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm">{emoji}</span>
                      <span className="text-slate-300 text-xs font-medium">{label}</span>
                      <span className="ml-auto text-green-400 text-xs font-medium">{hora}</span>
                    </div>
                    <p className="text-slate-500 text-xs pl-6">{msg}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Resumen semanal</p>
        <div className="space-y-1">
          {DIAS_LABELS.map((dia, idx) => (
            <div key={dia} className="flex items-center justify-between text-xs">
              <span className={horarios[idx].activo ? "text-white" : "text-slate-600"}>{dia}</span>
              {horarios[idx].activo
                ? <span className="text-slate-400">{horarios[idx].apertura} — {horarios[idx].cierre}</span>
                : <span className="text-slate-600">Cerrado</span>}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleGuardar} disabled={cargando}
        className={`w-full p-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${guardado ? "bg-green-600" : "bg-green-500"} text-white disabled:opacity-50`}>
        {cargando ? "Guardando..." : guardado ? <><Check size={14} /> Activado</> : "Activar notificaciones"}
      </button>
    </div>
  );
}

function SidePanel({ user, onClose, setScreen, inventario }: { user: any; onClose: () => void; setScreen: (s: any) => void; inventario: any[] }) {
  const [nombreNegocio, setNombreNegocio] = useState(() => localStorage.getItem("nombreNegocio") || "");
  const [guardadoNombre, setGuardadoNombre] = useState(false);
  const [editando, setEditando] = useState(false);
  const [sobreApp, setSobreApp] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [foto, setFoto] = useState<string | null>(() => localStorage.getItem("fotoPerfil"));
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGuardarNombre = () => {
    localStorage.setItem("nombreNegocio", nombreNegocio);
    setGuardadoNombre(true);
    setTimeout(() => { setGuardadoNombre(false); setEditando(false); onClose(); }, 1200);
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setFoto(url);
        localStorage.setItem("fotoPerfil", url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompartir = () => {
    if (navigator.share) {
      navigator.share({ title: "StartSmart", text: "Controla tu negocio con IA", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado al portapapeles");
    }
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("sessionVerified");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute top-0 left-0 h-full w-72 bg-slate-900 flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 pt-12 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-2xl cursor-pointer overflow-hidden border-2 border-green-500/30"
                onClick={() => fileRef.current?.click()}>
                {foto ? <img src={foto} className="w-full h-full object-cover" alt="perfil" />
                  : <span>{(localStorage.getItem("nombreNegocio") || user?.email || "U")[0].toUpperCase()}</span>}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center cursor-pointer" onClick={() => fileRef.current?.click()}>
                <Plus size={10} className="text-white" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </div>
            <div>
              <p className="text-white font-bold text-base">{localStorage.getItem("nombreNegocio") || "Mi negocio"}</p>
              <p className="text-slate-400 text-xs">{user?.email}</p>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full mt-1 inline-block">Plan gratuito</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <MenuItem icon={Store} label="Nombre del negocio" sublabel={localStorage.getItem("nombreNegocio") || "Sin nombre"} onClick={() => setEditando(!editando)} expanded={editando}>
            {editando && (
              <div className="px-3 pb-3">
                <input value={nombreNegocio} onChange={(e) => setNombreNegocio(e.target.value)}
                  className="w-full bg-slate-800 text-white p-2 rounded-lg text-sm outline-none mb-2 border border-slate-700/50" placeholder="Nombre de tu negocio" />
                <button onClick={handleGuardarNombre}
                  className={`w-full p-2 rounded-lg text-sm font-medium ${guardadoNombre ? "bg-green-600" : "bg-green-500"} text-white`}>
                  {guardadoNombre ? "✓ Guardado" : "Guardar"}
                </button>
              </div>
            )}
          </MenuItem>
          <MenuItem icon={Bell} label="Notificaciones" sublabel="Recordatorios diarios" onClick={() => setNotifOpen(!notifOpen)} expanded={notifOpen}>
            {notifOpen && <NotificacionesPanel />}
          </MenuItem>
          <MenuItem icon={Info} label="Acerca de la app" onClick={() => setSobreApp(!sobreApp)} expanded={sobreApp}>
            {sobreApp && (
              <div className="mx-3 mb-2 p-3 bg-slate-800 rounded-xl">
                <p className="text-white text-xs font-medium mb-1">StartSmart v1.0</p>
                <p className="text-slate-400 text-xs leading-relaxed">App para emprendedores que quieren controlar sus finanzas y crecer con ayuda de IA.</p>
              </div>
            )}
          </MenuItem>
          <MenuItem icon={Package} label="Inventario" sublabel={`${inventario?.length || 0} productos`} onClick={() => { setScreen("inventario"); onClose(); }} />
          <MenuItem icon={HelpCircle} label="Ayuda" onClick={() => {}} />
          <div className="border-t border-slate-800 my-3" />
          <MenuItem icon={LogOut} label="Cerrar sesión" onClick={handleCerrarSesion} danger />
        </div>
        <div className="p-4 border-t border-slate-800">
          <p className="text-slate-600 text-xs text-center">StartSmart v1.0</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("inicio");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [nombreNegocio, setNombreNegocio] = useState(() => localStorage.getItem("nombreNegocio") || "StartSmart");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(() => localStorage.getItem("fotoPerfil"));
  const [hayActualizacion, setHayActualizacion] = useState(false);

  const [ventas, setVentas] = useState<Movimiento[]>([]);
  const [gastos, setGastos] = useState<Movimiento[]>([]);
  const [historialesFijos, setHistorialesFijos] = useState<HistorialFijo[]>([]);
  const [inventario, setInventario] = useState<Producto[]>([]);

  const [producto, setProducto] = useState("");
  const [precio, setPrecio] = useState("");
  const [gastoNombre, setGastoNombre] = useState("");
  const [gastoPrecio, setGastoPrecio] = useState("");
  const [nuevoHistorial, setNuevoHistorial] = useState("");
  const [historialActivo, setHistorialActivo] = useState<number | null>(null);
  const [movNombre, setMovNombre] = useState("");
  const [movPrecio, setMovPrecio] = useState("");
  const [modal, setModal] = useState<ModalConfig | null>(null);

  // Inventario form
  const [invNombre, setInvNombre] = useState("");
  const [invStock, setInvStock] = useState("");
  const [invPrecio, setInvPrecio] = useState("");
  const [invAlerta, setInvAlerta] = useState("5");

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: "assistant", texto: "¡Hola! Soy tu asistente de negocios. Puedo analizar tus finanzas, darte consejos para aumentar ventas o responder preguntas sobre tu emprendimiento. ¿En qué te ayudo hoy?" },
  ]);
  const [inputIA, setInputIA] = useState("");
  const [cargandoIA, setCargandoIA] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes, cargandoIA]);

  useEffect(() => {
    if (!panelOpen) {
      setNombreNegocio(localStorage.getItem("nombreNegocio") || "StartSmart");
      setFotoPerfil(localStorage.getItem("fotoPerfil"));
    }
  }, [panelOpen]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setHayActualizacion(true);
            }
          });
        });
      });
    }
  }, []);

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
    if (!user) return;
    if (!sessionStorage.getItem("sessionVerified")) {
      supabase.auth.signOut();
      setUser(null);
      return;
    }
    cargarVentas();
    cargarGastos();
    cargarHistoriales();
    cargarInventario();
  }, [user]);

  const mostrarModal = (mensaje: string, onConfirm: () => void) => setModal({ mensaje, onConfirm });

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
        sessionStorage.setItem("sessionVerified", "true");
      }
    } catch (error: any) { alert(error.message); }
  }

  async function cargarVentas() {
    const { data } = await supabase.from("ventas").select("*").eq("user_id", user.id);
    if (data) setVentas(data);
  }

  async function cargarGastos() {
    const { data } = await supabase.from("gastos").select("*").eq("user_id", user.id);
    if (data) setGastos(data);
  }

  async function cargarHistoriales() {
    const { data } = await supabase.from("historiales_personalizados").select("*").eq("user_id", user.id);
    if (data) setHistorialesFijos(data.map(h => ({ ...h, movimientos: h.movimientos || [] })));
  }

  async function cargarInventario() {
    const { data } = await supabase.from("inventario").select("*").eq("user_id", user.id);
    if (data) setInventario(data);
  }

  async function agregarVenta() {
    if (!producto || !precio) { alert("Debes llenar producto y precio"); return; }
    await supabase.from("ventas").insert({ user_id: user.id, nombre: producto, precio: Number(precio), fecha: new Date().toLocaleDateString(), tipo: "venta" });
    await cargarVentas();
    setProducto(""); setPrecio("");
  }

  async function agregarGasto() {
    if (!gastoNombre || !gastoPrecio) { alert("Debes llenar gasto y monto"); return; }
    await supabase.from("gastos").insert({ user_id: user.id, nombre: gastoNombre, precio: Number(gastoPrecio), fecha: new Date().toLocaleDateString(), tipo: "gasto" });
    await cargarGastos();
    setGastoNombre(""); setGastoPrecio("");
  }

  async function borrarVenta(i: number) {
    if (!ventas[i].id) return;
    mostrarModal("¿Eliminar esta venta?", async () => {
      await supabase.from("ventas").delete().eq("id", ventas[i].id!);
      await cargarVentas();
    });
  }

  async function borrarGasto(i: number) {
    if (!gastos[i].id) return;
    mostrarModal("¿Eliminar este gasto?", async () => {
      await supabase.from("gastos").delete().eq("id", gastos[i].id!);
      await cargarGastos();
    });
  }

  async function crearHistorial() {
    if (!nuevoHistorial) { alert("Escribe nombre"); return; }
    const { error } = await supabase.from("historiales_personalizados").insert({ user_id: user.id, nombre: nuevoHistorial, movimientos: [] });
    if (error) { alert("Error: " + error.message); return; }
    await cargarHistoriales();
    setNuevoHistorial("");
  }

  async function agregarMovimientoHistorial() {
    if (historialActivo === null) return;
    if (!movNombre || !movPrecio) { alert("Completa los datos"); return; }
    const h = historialesFijos[historialActivo];
    const nuevosMovimientos = [...h.movimientos, { nombre: movNombre, precio: Number(movPrecio), fecha: new Date().toLocaleDateString() }];
    await supabase.from("historiales_personalizados").update({ movimientos: nuevosMovimientos }).eq("id", h.id);
    await cargarHistoriales();
    setMovNombre(""); setMovPrecio("");
  }

  async function borrarMovimientoHistorial(index: number) {
    if (historialActivo === null) return;
    mostrarModal("¿Eliminar este movimiento?", async () => {
      const h = historialesFijos[historialActivo];
      const nuevosMovimientos = h.movimientos.filter((_, i) => i !== index);
      await supabase.from("historiales_personalizados").update({ movimientos: nuevosMovimientos }).eq("id", h.id);
      await cargarHistoriales();
    });
  }

  async function agregarProducto() {
    if (!invNombre || !invStock) { alert("Debes llenar nombre y stock"); return; }
    await supabase.from("inventario").insert({
      user_id: user.id,
      nombre: invNombre,
      stock: Number(invStock),
      precio: invPrecio ? Number(invPrecio) : null,
      alerta_stock: invAlerta ? Number(invAlerta) : 5,
    });
    await cargarInventario();
    setInvNombre(""); setInvStock(""); setInvPrecio(""); setInvAlerta("5");
  }

  async function actualizarStock(id: string, delta: number, stockActual: number) {
    const nuevoStock = Math.max(0, stockActual + delta);
    await supabase.from("inventario").update({ stock: nuevoStock }).eq("id", id);
    await cargarInventario();
  }

  async function borrarProducto(id: string) {
    mostrarModal("¿Eliminar este producto?", async () => {
      await supabase.from("inventario").delete().eq("id", id);
      await cargarInventario();
    });
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
- Productos en inventario: ${inventario.length}
- Productos con stock bajo: ${inventario.filter(p => p.stock <= (p.alerta_stock || 5)).length}
Da consejos prácticos, concretos y motivadores. Responde siempre en español. Sé conciso (máximo 3 párrafos).`;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
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
  const productosStockBajo = inventario.filter(p => p.stock <= (p.alerta_stock || 5));

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

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">Cargando...</div>;

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

      {hayActualizacion && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white text-sm p-3 flex justify-between items-center">
          <span>🆕 Nueva versión disponible</span>
          <button onClick={() => { navigator.serviceWorker.getRegistration().then((reg) => { reg?.waiting?.postMessage("SKIP_WAITING"); window.location.reload(); }); }}
            className="bg-white text-green-600 font-bold px-3 py-1 rounded-lg text-xs">Actualizar</button>
        </div>
      )}

      {modal && <ModalConfirm config={modal} onClose={() => setModal(null)} />}
      {panelOpen && <SidePanel user={user} onClose={() => setPanelOpen(false)} setScreen={setScreen} inventario={inventario} />}

      <header className="p-4 border-b border-slate-800 flex items-center gap-3">
        {fotoPerfil && (
          <div className="w-7 h-7 rounded-full overflow-hidden border border-green-500/30 cursor-pointer" onClick={() => setPanelOpen(true)}>
            <img src={fotoPerfil} className="w-full h-full object-cover" alt="perfil" />
          </div>
        )}
        <h1 className="text-xl font-bold text-green-400 cursor-pointer select-none" onClick={() => setPanelOpen(true)}>{nombreNegocio}</h1>
        {productosStockBajo.length > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            ⚠️ {productosStockBajo.length} stock bajo
          </span>
        )}
      </header>

      <main className="flex-1 p-5 pb-24">

        {screen === "inicio" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-5 rounded-xl"><p className="text-slate-400 text-sm">Ventas registradas</p><h3 className="text-xl font-bold">{ventas.length}</h3></div>
              <div className="bg-slate-900 p-5 rounded-xl"><p className="text-slate-400 text-sm">Ventas hoy</p><h3 className="text-xl font-bold">${ventasHoy}</h3></div>
              <div className="bg-slate-900 p-5 rounded-xl"><p className="text-slate-400 text-sm">Ingresos</p><h3 className="text-xl font-bold">${totalVentas}</h3></div>
              <div className="bg-slate-900 p-5 rounded-xl"><p className="text-slate-400 text-sm">Gastos</p><h3 className="text-xl font-bold">${totalGastos}</h3></div>
              <div className="bg-slate-900 p-5 rounded-xl col-span-2"><p className="text-slate-400 text-sm">Ganancia</p><h3 className="text-xl font-bold text-green-400">${ganancia}</h3></div>
            </div>
            {productosStockBajo.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
                <p className="text-red-400 text-sm font-medium mb-2">⚠️ Stock bajo</p>
                {productosStockBajo.map((p, i) => (
                  <p key={i} className="text-slate-300 text-xs">{p.nombre} — {p.stock} unidades</p>
                ))}
              </div>
            )}
            <div className="bg-slate-900 p-5 rounded-xl mt-6">
              <p className="text-slate-400 mb-3">Ventas vs Gastos por día</p>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={finanzasPorDia}>
                    <XAxis dataKey="fecha" /><YAxis /><Tooltip />
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

        {screen === "inventario" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-orange-400">Inventario</h2>
            <input placeholder="Nombre del producto" value={invNombre} onChange={(e) => setInvNombre(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800" />
            <div className="flex gap-2 mb-3">
              <input placeholder="Stock" value={invStock} onChange={(e) => setInvStock(e.target.value)} className="flex-1 p-3 rounded bg-slate-800" />
              <input placeholder="Precio" value={invPrecio} onChange={(e) => setInvPrecio(e.target.value)} className="flex-1 p-3 rounded bg-slate-800" />
            </div>
            <input placeholder="Alerta cuando stock sea menor a (default: 5)" value={invAlerta} onChange={(e) => setInvAlerta(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800" />
            <button onClick={agregarProducto} className="bg-orange-500 p-3 rounded w-full mb-6">Agregar producto</button>

            {inventario.map((p) => (
              <div key={p.id} className={`p-3 rounded mb-2 ${p.stock <= (p.alerta_stock || 5) ? "bg-red-500/10 border border-red-500/20" : "bg-slate-900"}`}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">{p.nombre}</span>
                    {p.precio && <span className="text-slate-400 text-xs ml-2">${p.precio}</span>}
                  </div>
                  <button onClick={() => borrarProducto(p.id!)} className="text-red-400 text-xs">Eliminar</button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => actualizarStock(p.id!, -1, p.stock)} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold">−</button>
                  <span className={`font-bold text-lg ${p.stock <= (p.alerta_stock || 5) ? "text-red-400" : "text-white"}`}>{p.stock}</span>
                  <button onClick={() => actualizarStock(p.id!, 1, p.stock)} className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold">+</button>
                  <span className="text-slate-500 text-xs ml-1">unidades</span>
                  {p.stock <= (p.alerta_stock || 5) && <span className="text-red-400 text-xs ml-auto">⚠️ Stock bajo</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {screen === "asistente" && (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Asistente IA</h2>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded-lg"><p className="text-slate-400">Ingresos</p><p className="text-green-400 font-bold">${totalVentas}</p></div>
              <div className="bg-slate-900 p-2 rounded-lg"><p className="text-slate-400">Gastos</p><p className="text-red-400 font-bold">${totalGastos}</p></div>
              <div className="bg-slate-900 p-2 rounded-lg"><p className="text-slate-400">Ganancia</p><p className={`font-bold ${ganancia >= 0 ? "text-green-400" : "text-red-400"}`}>${ganancia}</p></div>
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
              <input value={inputIA} onChange={(e) => setInputIA(e.target.value)} onKeyDown={handleKeyDownIA}
                placeholder="Pregunta algo sobre tu negocio..."
                className="flex-1 p-3 rounded-xl bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={cargandoIA} />
              <button onClick={enviarMensaje} disabled={cargandoIA || !inputIA.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 px-4 rounded-xl transition-colors">➤</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {["¿Cómo aumentar mis ventas?", "Analiza mis finanzas", "Revisa mi inventario"].map((s) => (
                <button key={s} onClick={() => setInputIA(s)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors">{s}</button>
              ))}
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 text-xs">
        <button onClick={() => setScreen("inicio")} className={screen === "inicio" ? "text-green-400" : "text-slate-400"}>Inicio</button>
        <button onClick={() => setScreen("ventas")} className={screen === "ventas" ? "text-green-400" : "text-slate-400"}>Ventas</button>
        <button onClick={() => setScreen("finanzas")} className={screen === "finanzas" ? "text-green-400" : "text-slate-400"}>Gastos</button>
        <button onClick={() => setScreen("historial")} className={screen === "historial" ? "text-green-400" : "text-slate-400"}>Historial</button>
        <button onClick={() => setScreen("asistente")} className={screen === "asistente" ? "text-purple-400 font-semibold" : "text-slate-400"}>IA ✦</button>
      </nav>
    </div>
  );
}
