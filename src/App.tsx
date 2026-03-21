import { useMemo, useState } from 'react'
import { Bell, Home, Wallet, Boxes, CheckSquare, Bot, Megaphone } from 'lucide-react'

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

const [movements]=useState<Movement[]>([
{id:1,type:'ingreso',amount:1200,category:'Ventas'},
{id:2,type:'gasto',amount:350,category:'Material'}
])

const [products]=useState<Product[]>([
{id:1,name:'Vela aromática',stock:12,cost:45,price:120},
{id:2,name:'Kit regalo',stock:3,cost:90,price:220}
])

const [tasks,setTasks]=useState<Task[]>([
{id:1,title:'Publicar historia',time:'10:00',done:false},
{id:2,title:'Responder pedidos',time:'13:00',done:false}
])

const income=useMemo(()=>movements.filter(m=>m.type==='ingreso').reduce((s,m)=>s+m.amount,0),[movements])
const expense=useMemo(()=>movements.filter(m=>m.type==='gasto').reduce((s,m)=>s+m.amount,0),[movements])
const profit=income-expense

return(
<div className="page-shell">
<div className="phone-frame">

<header className="hero-header">
<div>
<p className="brand-kicker">Impulsa</p>
<h1>Tu negocio</h1>
</div>
<Bell size={18}/>
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
{tasks.map(t=>(
<div key={t.id} className="list-row">
<span>{t.title}</span>
<button onClick={()=>setTasks(tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>
{t.done?'✔':'○'}
</button>
</div>
))}
</Card>

</div>
)}

{screen==='finanzas'&&(
<div className="stack">

<Card title="Movimientos">
{movements.map(m=>(
<div key={m.id} className="list-row">
<span>{m.category}</span>
<strong>{m.type==='ingreso'?'+':'-'}{currency(m.amount)}</strong>
</div>
))}
</Card>

</div>
)}

{screen==='inventario'&&(
<div className="stack">
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
