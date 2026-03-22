import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Screen = "inicio" | "ventas" | "finanzas" | "historial" | "marketing";

type Movimiento = {
  nombre: string;
  precio: number;
  fecha: string;
  tipo?: "venta" | "gasto";
};

export default function App() {

const [logged, setLogged] = useState(false);
const [screen, setScreen] = useState<Screen>("inicio");

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isRegister, setIsRegister] = useState(false);

const [ventas, setVentas] = useState<Movimiento[]>(() => {
const data = localStorage.getItem("ventas");
return data ? JSON.parse(data) : [];
});

const [gastos, setGastos] = useState<Movimiento[]>(() => {
const data = localStorage.getItem("gastos");
return data ? JSON.parse(data) : [];
});

const [producto, setProducto] = useState("");
const [precio, setPrecio] = useState("");

const [gastoNombre, setGastoNombre] = useState("");
const [gastoPrecio, setGastoPrecio] = useState("");

useEffect(()=>{
localStorage.setItem("ventas",JSON.stringify(ventas))
},[ventas])

useEffect(()=>{
localStorage.setItem("gastos",JSON.stringify(gastos))
},[gastos])

function handleLogin(){

if(!email || !password){
alert("Debes llenar correo y contraseña")
return
}

const savedUser = localStorage.getItem("user")

if(!savedUser){
alert("Usuario no registrado")
return
}

const user = JSON.parse(savedUser)

if(user.email === email && user.password === password){
setLogged(true)
}else{
alert("Correo o contraseña incorrectos")
}

}

function handleRegister(){

if(!email || !password){
alert("Debes llenar correo y contraseña")
return
}

localStorage.setItem("user",JSON.stringify({email,password}))

alert("Usuario registrado")
setIsRegister(false)

}

function agregarVenta(){

if(!producto || !precio){
alert("Debes llenar producto y precio")
return
}

const nuevaVenta = {
nombre:producto,
precio:Number(precio),
fecha:new Date().toLocaleDateString(),
tipo:"venta"
}

setVentas([...ventas,nuevaVenta])
setProducto("")
setPrecio("")

}

function agregarGasto(){

if(!gastoNombre || !gastoPrecio){
alert("Debes llenar gasto y monto")
return
}

const nuevoGasto = {
nombre:gastoNombre,
precio:Number(gastoPrecio),
fecha:new Date().toLocaleDateString(),
tipo:"gasto"
}

setGastos([...gastos,nuevoGasto])
setGastoNombre("")
setGastoPrecio("")

}

function borrarVenta(index:number){
if(!confirm("¿Eliminar venta?")) return
setVentas(ventas.filter((_,i)=> i !== index))
}

function borrarGasto(index:number){
if(!confirm("¿Eliminar gasto?")) return
setGastos(gastos.filter((_,i)=> i !== index))
}

const historialGeneral = [
...ventas.map(v => ({...v,tipo:"venta"})),
...gastos.map(g => ({...g,tipo:"gasto"}))
].sort((a,b)=> new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

const totalVentas = ventas.reduce((acc,v)=> acc + v.precio,0)
const totalGastos = gastos.reduce((acc,g)=> acc + g.precio,0)
const ganancia = totalVentas - totalGastos

const hoy = new Date().toLocaleDateString()

const ventasHoy = ventas
.filter(v=> v.fecha === hoy)
.reduce((acc,v)=> acc + v.precio,0)

const ventasPorDia = ventas.reduce((acc:any,venta)=>{

const existe = acc.find((d:any)=> d.fecha === venta.fecha)

if(existe){
existe.total += venta.precio
}else{
acc.push({
fecha:venta.fecha,
total:venta.precio
})
}

return acc

},[])

const finanzasPorDia = historialGeneral.reduce((acc:any,mov)=>{

const existe = acc.find((d:any)=> d.fecha === mov.fecha)

if(existe){

if(mov.tipo === "venta"){
existe.ventas += mov.precio
}else{
existe.gastos += mov.precio
}

}else{

acc.push({
fecha:mov.fecha,
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

<input
placeholder="Correo"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="w-full mb-3 p-3 rounded bg-slate-800"
/>

<input
type="password"
placeholder="Contraseña"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="w-full mb-4 p-3 rounded bg-slate-800"
/>

<button
onClick={isRegister ? handleRegister : handleLogin}
className="w-full bg-green-500 p-3 rounded"
>
{isRegister ? "Registrarse" : "Iniciar sesión"}
</button>

<p
onClick={()=> setIsRegister(!isRegister)}
className="text-center text-sm text-green-400 mt-4 cursor-pointer"
>
{isRegister ? "Ya tengo cuenta" : "Crear cuenta"}
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

<div className="bg-slate-900 p-5 rounded-xl">
<p className="text-slate-400 text-sm">Ganancia</p>
<h3 className="text-xl font-bold text-green-400">${ganancia}</h3>
</div>

</div>

<div className="bg-slate-900 p-5 rounded-xl mt-6">

<p className="text-slate-400 mb-3">
Ventas por día
</p>

<div style={{width:"100%",height:250}}>

<ResponsiveContainer>

<LineChart data={ventasPorDia}>

<XAxis dataKey="fecha"/>
<YAxis/>
<Tooltip/>

<Line
type="monotone"
dataKey="total"
stroke="#22c55e"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

<div className="bg-slate-900 p-5 rounded-xl mt-6">

<p className="text-slate-400 mb-3">
Ventas vs Gastos
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

{screen === "ventas" && (

<div>

<h2 className="text-2xl font-bold mb-6">Ventas</h2>

<input
placeholder="Producto"
value={producto}
onChange={(e)=>setProducto(e.target.value)}
className="w-full mb-3 p-3 rounded bg-slate-800"
/>

<input
placeholder="Precio"
value={precio}
onChange={(e)=>setPrecio(e.target.value)}
className="w-full mb-3 p-3 rounded bg-slate-800"
/>

<button
onClick={agregarVenta}
className="bg-green-500 p-3 rounded w-full mb-6"
>
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

{screen === "finanzas" && (

<div>

<h2 className="text-2xl font-bold mb-6">Gastos</h2>

<input
placeholder="Nombre del gasto"
value={gastoNombre}
onChange={(e)=>setGastoNombre(e.target.value)}
className="w-full mb-3 p-3 rounded bg-slate-800"
/>

<input
placeholder="Monto"
value={gastoPrecio}
onChange={(e)=>setGastoPrecio(e.target.value)}
className="w-full mb-3 p-3 rounded bg-slate-800"
/>

<button
onClick={agregarGasto}
className="bg-red-500 p-3 rounded w-full mb-6"
>
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

{screen === "historial" && (

<div>

<h2 className="text-2xl font-bold mb-6">Historial</h2>

{historialGeneral.map((m,i)=>(
<div key={i} className="bg-slate-900 p-3 rounded mb-2 flex justify-between">
<span>{m.nombre} - ${m.precio}</span>
<span className={m.tipo === "venta" ? "text-green-400":"text-red-400"}>
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
