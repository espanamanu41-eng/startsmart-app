import { useMemo, useState, useEffect } from "react";
import { Bell, Home, Wallet, Boxes, CheckSquare, Bot, Megaphone, Settings, LogOut } from "lucide-react";

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

  const [user,setUser] = useState<string | null>(null)
  const [email,setEmail] = useState("")
  const [screen, setScreen] = useState<Screen>("inicio");

  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  /* cargar usuario */

  useEffect(()=>{

    const savedUser = localStorage.getItem("user")

    if(savedUser){
      setUser(savedUser)
    }

  },[])

  /* cargar datos del usuario */

  useEffect(()=>{

    if(!user) return

    const m = localStorage.getItem("movements-"+user)
    const p = localStorage.getItem("products-"+user)
    const t = localStorage.getItem("tasks-"+user)

    if(m) setMovements(JSON.parse(m))
    if(p) setProducts(JSON.parse(p))
    if(t) setTasks(JSON.parse(t))

  },[user])

  /* guardar datos */

  useEffect(()=>{
    if(user){
      localStorage.setItem("movements-"+user,JSON.stringify(movements))
    }
  },[movements,user])

  useEffect(()=>{
    if(user){
      localStorage.setItem("products-"+user,JSON.stringify(products))
    }
  },[products,user])

  useEffect(()=>{
    if(user){
      localStorage.setItem("tasks-"+user,JSON.stringify(tasks))
    }
  },[tasks,user])

  const income = useMemo(
    () => movements.filter(m=>m.type==="ingreso").reduce((s,m)=>s+m.amount,0),
    [movements]
  )

  const expense = useMemo(
    () => movements.filter(m=>m.type==="gasto").reduce((s,m)=>s+m.amount,0),
    [movements]
  )

  const profit = income - expense

  function login(){

    if(!email) return

    setUser(email)

    localStorage.setItem("user",email)

  }

  function logout(){

    localStorage.removeItem("user")

    setUser(null)

  }

  function addMovement(type:"ingreso"|"gasto"){

    const amount = Number(prompt("Monto"))
    const category = prompt("Categoría") || "General"

    if(!amount) return

    setMovements([
      ...movements,
      {
        id:Date.now(),
        type,
        amount,
        category
      }
    ])
  }

  function addProduct(){

    const name = prompt("Nombre del producto")
    const stock = Number(prompt("Stock"))

    if(!name) return

    setProducts([
      ...products,
      {
        id:Date.now(),
        name,
        stock
      }
    ])
  }

  function addTask(){

    const title = prompt("Nueva tarea")

    if(!title) return

    setTasks([
      ...tasks,
      {
        id:Date.now(),
        title,
        done:false
      }
    ])
  }

  function toggleTask(id:number){

    setTasks(
      tasks.map(t =>
        t.id===id ? {...t,done:!t.done} : t
      )
    )
  }

  /* LOGIN SCREEN */

  if(!user){

    return(

<div style={{padding:40,fontFamily:"system-ui"}}>

<h1>StartSmart</h1>

<p>Accede a tu negocio</p>

<input
placeholder="Correo"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<br/><br/>

<button onClick={login}>
Entrar
</button>

</div>

)

  }

  return(

<div className="page-shell">

<div className="phone-frame">

<header className="hero-header">

<div>
<p className="brand-kicker">StartSmart</p>
<h1>Tu negocio</h1>
</div>

<button onClick={logout}>
<LogOut size={18}/>
</button>

</header>

<main className="screen-content">

{screen==="inicio" &&(

<div className="stack">

<Card title="Resumen">

<Metric label="Ingresos" value={currency(income)}/>
<Metric label="Gastos" value={currency(expense)}/>
<Metric label="Ganancia" value={currency(profit)}/>

</Card>

</div>

)}

{screen==="finanzas" &&(

<div className="stack">

<button onClick={()=>addMovement("ingreso")}>
+ Ingreso
</button>

<button onClick={()=>addMovement("gasto")}>
+ Gasto
</button>

{movements.map(m=>(

<Card key={m.id}>

<div className="list-row">

<span>{m.category}</span>

<strong>
{m.type==="ingreso"?"+":"-"}
{currency(m.amount)}
</strong>

</div>

</Card>

))}

</div>

)}

{screen==="inventario" &&(

<div className="stack">

<button onClick={addProduct}>
+ Producto
</button>

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

{screen==="tareas" &&(

<div className="stack">

<button onClick={addTask}>
+ Tarea
</button>

{tasks.map(t=>(

<Card key={t.id}>

<div className="list-row">

<span>{t.title}</span>

<button onClick={()=>toggleTask(t.id)}>
{t.done?"✔":"○"}
</button>

</div>

</Card>

))}

</div>

)}

{screen==="ia" &&(

<Card title="Asistente IA">

<p>Consejo: publica una promoción hoy.</p>

</Card>

)}

{screen==="marketing" &&(

<Card title="Marketing">

<p>Publica historias mostrando tu producto.</p>

</Card>

)}

{screen==="config" &&(

<Card title="Configuración">

<p>Más opciones próximamente.</p>

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

{title && <h3>{title}</h3>}

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

function NavButton({
current,
id,
icon,
label,
onPress
}:{
current:Screen
id:Screen
icon:React.ReactNode
label:string
onPress:(v:Screen)=>void
}){

return(

<button
className={current===id?"nav-button active":"nav-button"}
onClick={()=>onPress(id)}
>

{icon}
<span>{label}</span>

</button>

)

}
