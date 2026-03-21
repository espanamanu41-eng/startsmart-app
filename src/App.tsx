import { useMemo, useState, useEffect } from 'react'
import { Home, Wallet, Boxes, CheckSquare, Bot, Megaphone } from 'lucide-react'

type Screen = 'inicio' | 'finanzas' | 'inventario' | 'tareas' | 'ia' | 'marketing'

type Movement = {
  id: number
  type: 'ingreso' | 'gasto'
  amount: number
  category: string
}

type Product = {
  id: number
  name: string
  stock: number
  cost: number
  price: number
}

type Task = {
  id: number
  title: string
  time: string
  done: boolean
}

const currency = (v:number)=>
 new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v)

export default function App(){

const [screen,setScreen]=useState<Screen>('inicio')

const [movements,setMovements]=useState<Movement[]>(()=>{
const saved=localStorage.getItem("movements")
return saved?JSON.parse(saved):[]
})

const [products,setProducts]=useState<Product[]>(()=>{
const saved=localStorage.getItem("products")
return saved?JSON.parse(saved):[]
})

const [tasks,setTasks]=useState<Task[]>(()=>{
const saved=localStorage.getItem("tasks")
return saved?JSON.parse(saved):[]
})

useEffect(()=>{
localStorage.setItem("movements",JSON.stringify(movements))
},[movements])

useEffect(()=>{
localStorage.setItem("products",JSON.stringify(products))
},[products])

useEffect(()=>{
localStorage.setItem("tasks",JSON.stringify(tasks))
},[tasks])

const income=useMemo(()=>movements.filter(m=>m.type==='ingreso').reduce((s,m)=>s+m.amount,0),[movements])
const expense=useMemo(()=>movements.filter(m=>m.type==='gasto').reduce((s,m)=>s+m.amount,0),[movements])
const profit=income-expense

function addMovement(){
const amount=Number(prompt("Monto"))
const type=prompt("Tipo (ingreso/gasto)") as 'ingreso'|'gasto'
const category=prompt("Categoría")||"General"

if(!amount||!type)return

setMovements([
...movements,
{
id:Date.now(),
amount,
type,
category
}
])
}

function addProduct(){
const name=prompt("Nombre producto")
const stock=Number(prompt("Stock"))
const cost=Number(prompt("Costo"))
const price=Number(prompt("Precio"))

if(!name)return

setProducts([
...products,
{
id:Date.now(),
name,
stock,
cost,
price
}
])
}

function addTask(){
const title=prompt("Tarea")
const time=prompt("Hora")

if(!title)return

setTasks([
...tasks,
{
id:Date.now(),
title,
time:time||"",
done:false
}
])
}

return(
<div className="page-shell">
<div className="phone-frame">

<header className="hero-header">
<h1>StartSmart</h1>
</header>

<main className="screen-content">

{screen==='inicio'&&(
<div className="stack">

<Card title="Resumen">
<Metric label="Ingresos" value={currency(income)}/>
<Metric label="Gastos" value={currency(expense)}/>
<Metric label="Ganancia" value={currency(profit)}/>
</Card>

<Card title="Tareas">
<button onClick={addTask}>Agregar tarea</button>

{tasks.map(t=>(
<div key={t.id} className="list-row">
<span>{t.title}</span>

<button
onClick={()=>
setTasks(tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))
}
>

{t.done?'✔':'○'}

</button>

</div>
))}
</Card>

</div>
)}

{screen==='finanzas'&&(
<div className="stack">

<button onClick={addMovement}>Agregar movimiento</button>

<Card title="Movimientos">

{movements.map(m=>(
<div key={m.id} className="list-row">

<span>{m.category}</span>

<strong>
{m.type==='ingreso'?'+':'-'}
{currency(m.amount)}
</strong>

</div>
))}

</Card>

</div>
)}

{screen==='inventario'&&(
<div className="stack">

<button onClick={addProduct}>Agregar producto</button>

{products.map(p=>(
<Card key={p.id}>

<div className="list-row">

<span>{p.name}</span>

<strong>Stock {p.stock}</strong>

</div>

</Card>
))}

</div>
)}

{screen==='tareas'&&(
<div className="stack">

<button onClick={addTask}>Agregar tarea</button>

{tasks.map(t=>(
<Card key={t.id}>

<div className="list-row">

<span>{t.title}</span>

<small>{t.time}</small>

</div>

</Card>
))}

</div>
)}

{screen==='ia'&&(
<Card title="Asistente IA">
<p>Próximamente recomendaciones inteligentes para tu negocio.</p>
</Card>
)}

{screen==='marketing'&&(
<Card title="Marketing">
<p>Publica hoy una promoción en historias para atraer clientes.</p>
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
