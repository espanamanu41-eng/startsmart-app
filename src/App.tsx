import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"

type Screen = "inicio" | "ventas" | "finanzas" | "historial";

type Movimiento = {
nombre:string
precio:number
fecha:string
tipo?: "venta" | "gasto"
}

type HistorialFijo = {
nombre:string
movimientos:Movimiento[]
}

export default function App(){

const [logged,setLogged]=useState(false)
const [screen,setScreen]=useState<Screen>("inicio")

const [email,setEmail]=useState("")
const [password,setPassword]=useState("")
const [isRegister,setIsRegister]=useState(false)

const [ventas, setVentas] = useState<Movimiento[]>([]);

const [gastos, setGastos] = useState<Movimiento[]>([])

const [historialesFijos,setHistorialesFijos]=useState<HistorialFijo[]>(()=>{
const data=localStorage.getItem("historialesFijos")
return data?JSON.parse(data):[]
})

const [producto,setProducto]=useState("")
const [precio,setPrecio]=useState("")
const [user, setUser] = useState<any>(null)

const [gastoNombre,setGastoNombre]=useState("")
const [gastoPrecio,setGastoPrecio]=useState("")

 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser)
  })

  return () => unsubscribe()
}, []) 

const cargarVentas = async () => {
 if(!user) return
  const snapshot = await getDocs(collection(db, "users", user.uid, "ventas"));
  const datos:any[] = [];

 snapshot.forEach((doc) => {
  datos.push({
    id: doc.id,
    ...doc.data()
  });
});

  setVentas(datos);
};
const cargarGastos = async () => {
  if(!user) return

  const snapshot = await getDocs(
    collection(db, "users", user.uid, "gastos")
  );

  const datos:any[] = [];

  snapshot.forEach((doc) => {
    datos.push({
      id: doc.id,
      ...doc.data()
    });
  });

  setGastos(datos);
};
useEffect(() => {
  if (user) {
    cargarVentas();
    cargarGastos();
  }
}, [user]);
 
const [nuevoHistorial,setNuevoHistorial]=useState("")
const [historialActivo,setHistorialActivo]=useState<number|null>(null)
const [movNombre,setMovNombre]=useState("")
const [movPrecio,setMovPrecio]=useState("")

useEffect(()=>{
localStorage.setItem("historialesFijos",JSON.stringify(historialesFijos))
},[historialesFijos])

async function handleLogin(){

if(!email||!password){
alert("Debes llenar correo y contraseña")
return
}

try {

if(isRegister){
  await createUserWithEmailAndPassword(auth, email, password)
  alert("Usuario creado")
}else{
  await signInWithEmailAndPassword(auth, email, password)
  alert("Bienvenido")
}

} catch (error:any){
  alert(error.message)
}

}

  async function agregarVenta(){

if(!producto||!precio){
alert("Debes llenar producto y precio")
return
}

const nuevaVenta={
nombre:producto,
precio:Number(precio),
fecha:new Date().toLocaleDateString(),
tipo:"venta"
}


// guardar en Firebase
await addDoc(collection(db,"ventas"),nuevaVenta)
await cargarVentas()
    
setProducto("")
setPrecio("")
}


async function agregarGasto(){

if(!gastoNombre||!gastoPrecio){
alert("Debes llenar gasto y monto")
return
}

const nuevoGasto={
nombre:gastoNombre,
precio:Number(gastoPrecio),
fecha:new Date().toLocaleDateString(),
tipo:"gasto"
}

// guardar en Firebase
await addDoc(collection(db,"gastos"),nuevoGasto)

// recargar
await cargarGastos()

setGastoNombre("")
setGastoPrecio("")
}

async function borrarVenta(i:number){

if(!ventas[i].id) return

if(confirm("¿Eliminar esta venta?")){

await deleteDoc(doc(db, "ventas", ventas[i].id!))

await cargarVentas()

}

}

async function borrarGasto(i:number){

if(!gastos[i].id) return

if(confirm("¿Eliminar este gasto?")){

await deleteDoc(doc(db, "gastos", gastos[i].id))

await cargarGastos()

}
}

function crearHistorial(){

if(!nuevoHistorial){
alert("Escribe nombre")
return
}

setHistorialesFijos([...historialesFijos,{
nombre:nuevoHistorial,
movimientos:[]
}])

setNuevoHistorial("")
}

function agregarMovimientoHistorial(){

if(historialActivo===null) return

if(!movNombre||!movPrecio){
alert("Completa los datos")
return
}

const copia=[...historialesFijos]

copia[historialActivo].movimientos.push({
nombre:movNombre,
precio:Number(movPrecio),
fecha:new Date().toLocaleDateString()
})

setHistorialesFijos(copia)

setMovNombre("")
setMovPrecio("")
}

function borrarMovimientoHistorial(index:number){

if(historialActivo===null) return

if(confirm("¿Eliminar movimiento?")){

const copia=[...historialesFijos]

copia[historialActivo].movimientos=
copia[historialActivo].movimientos.filter((_,i)=>i!==index)

setHistorialesFijos(copia)

}

}

const historialGeneral=[
...ventas.map(v=>({...v,tipo:"venta"})),
...gastos.map(g=>({...g,tipo:"gasto"}))
]

const totalVentas=ventas.reduce((acc,v)=>acc+v.precio,0)
const totalGastos=gastos.reduce((acc,g)=>acc+g.precio,0)
const ganancia=totalVentas-totalGastos

const hoy=new Date().toLocaleDateString()

const ventasHoy=ventas
.filter(v=>v.fecha===hoy)
.reduce((acc,v)=>acc+v.precio,0)

const finanzasPorDia = historialGeneral.reduce((acc:any,mov)=>{

const existe = acc.find((d:any)=>d.fecha === mov.fecha)

if(existe){

if(mov.tipo === "venta"){
existe.ventas += mov.precio
}else{
existe.gastos += mov.precio
}

}else{

acc.push({
fecha: mov.fecha,
ventas: mov.tipo === "venta" ? mov.precio : 0,
gastos: mov.tipo === "gasto" ? mov.precio : 0
})

}

return acc

},[])

if(!logged){

return(

<div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">

<div className="bg-slate-900 p-8 rounded-2xl w-80">

<h1 className="text-2xl font-bold mb-6 text-center text-green-400">
StartSmart
</h1>

<input placeholder="Correo"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full mb-3 p-3 rounded bg-slate-800"/>

<input type="password"
placeholder="Contraseña"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full mb-4 p-3 rounded bg-slate-800"/>

<button
onClick={isRegister?handleRegister:handleLogin}
className="w-full bg-green-500 p-3 rounded">
{isRegister?"Registrarse":"Iniciar sesión"}
</button>

<p
onClick={()=>setIsRegister(!isRegister)}
className="text-center text-sm text-green-400 mt-4 cursor-pointer">
{isRegister?"Ya tengo cuenta":"Crear cuenta"}
</p>

</div>
</div>
)
}

return(

<div className="flex flex-col min-h-screen bg-slate-950 text-white">

<header className="p-4 border-b border-slate-800">
<h1 className="text-xl font-bold text-green-400">StartSmart</h1>
</header>

<main className="flex-1 p-5 pb-24">

{screen==="inicio"&&(

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

<div className="bg-slate-900 p-5 rounded-xl">
<p className="text-slate-400 text-sm">Ganancia</p>
<h3 className="text-xl font-bold text-green-400">${ganancia}</h3>
</div>

</div>

<div className="bg-slate-900 p-5 rounded-xl mt-6">

<p className="text-slate-400 mb-3">
Ventas vs Gastos por día
</p>

<div style={{width:"100%",height:250}}>

<ResponsiveContainer>

<LineChart data={finanzasPorDia}>

<XAxis dataKey="fecha"/>
<YAxis/>
<Tooltip/>

<Line type="monotone" dataKey="ventas" stroke="#22c55e" strokeWidth={3}/>
<Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3}/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

</div>

)}

{screen==="ventas"&&(

<div>

<h2 className="text-2xl font-bold mb-6">Ventas</h2>

<input placeholder="Producto" value={producto} onChange={(e)=>setProducto(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800"/>

<input placeholder="Precio" value={precio} onChange={(e)=>setPrecio(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800"/>

<button onClick={agregarVenta} className="bg-green-500 p-3 rounded w-full mb-6">
Agregar venta
</button>

{ventas.map((v,i)=>(

<div key={i} className="bg-slate-900 p-3 rounded mb-2 flex justify-between">
<span>{v.nombre} - ${v.precio}</span>
<button onClick={()=>borrarVenta(i)} className="text-red-400">Eliminar</button>
</div>

))}

</div>

)}

{screen==="finanzas"&&(

<div>

<h2 className="text-2xl font-bold mb-6">Gastos</h2>

<input placeholder="Nombre del gasto" value={gastoNombre} onChange={(e)=>setGastoNombre(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800"/>

<input placeholder="Monto" value={gastoPrecio} onChange={(e)=>setGastoPrecio(e.target.value)} className="w-full mb-3 p-3 rounded bg-slate-800"/>

<button onClick={agregarGasto} className="bg-red-500 p-3 rounded w-full mb-6">
Agregar gasto
</button>

{gastos.map((g,i)=>(

<div key={i} className="bg-slate-900 p-3 rounded mb-2 flex justify-between">
<span>{g.nombre} - ${g.precio}</span>
<button onClick={()=>borrarGasto(i)} className="text-red-400">Eliminar</button>
</div>

))}

</div>

)}

{screen==="historial"&&(

<div>

<h2 className="text-2xl font-bold mb-6 text-blue-400">
Historiales personalizados
</h2>

<input placeholder="Nombre del historial"
value={nuevoHistorial}
onChange={(e)=>setNuevoHistorial(e.target.value)}
className="w-full mb-3 p-3 rounded bg-slate-800"/>

<button onClick={crearHistorial} className="bg-blue-500 p-3 rounded w-full mb-6">
Crear historial
</button>

{historialesFijos.map((h,i)=>(

<div key={i} className="bg-slate-900 p-4 rounded mb-3">

<div className="flex justify-between mb-3">
<strong>{h.nombre}</strong>

<button onClick={()=>setHistorialActivo(historialActivo===i ? null : i)}>
{historialActivo===i ? "Cerrar" : "Abrir"}
</button>

</div>

{historialActivo===i&&(

<div>

<input placeholder="Movimiento"
value={movNombre}
onChange={(e)=>setMovNombre(e.target.value)}
className="w-full mb-2 p-2 rounded bg-slate-800"/>

<input placeholder="Monto"
value={movPrecio}
onChange={(e)=>setMovPrecio(e.target.value)}
className="w-full mb-2 p-2 rounded bg-slate-800"/>

<button onClick={agregarMovimientoHistorial}
className="bg-green-500 p-2 rounded w-full mb-3">
Agregar
</button>

{h.movimientos.map((m,j)=>(

<div key={j} className="flex justify-between text-sm mb-1">
<span>{m.nombre} ${m.precio}</span>
<button onClick={()=>borrarMovimientoHistorial(j)}>❌</button>
</div>

))}

</div>

)}

</div>

))}

<hr className="my-6 border-slate-700"/>

<h2 className="text-2xl font-bold mb-6">
Historial general
</h2>

{historialGeneral.map((m,i)=>(

<div key={i} className="bg-slate-900 p-3 rounded mb-2 flex justify-between">
<span>{m.nombre} - ${m.precio}</span>
<span className={m.tipo==="venta"?"text-green-400":"text-red-400"}>
{m.tipo}
</span>
</div>

))}

</div>

)}

</main>

<nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 text-sm">

<button onClick={()=>setScreen("inicio")}>Inicio</button>
<button onClick={()=>setScreen("ventas")}>Ventas</button>
<button onClick={()=>setScreen("finanzas")}>Gastos</button>
<button onClick={()=>setScreen("historial")}>Historial</button>

</nav>

</div>

)

  }
