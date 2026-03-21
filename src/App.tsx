import { useMemo, useState, useEffect } from "react"
import { Home, Wallet, Boxes, Settings, ShoppingCart, Receipt } from "lucide-react"

type Screen =
| "inicio"
| "finanzas"
| "inventario"
| "ventas"
| "historial"
| "config"

type Movement={
id:number
type:"ingreso"|"gasto"
amount:number
category:string
payment?:string
}

type Product={
id:number
name:string
stock:number
price:number
}

const currency=(v:number)=>
new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(v)

export default function App(){

const[screen,setScreen]=useState<Screen>("inicio")
const[businessName,setBusinessName]=useState("Mi Negocio")

const[movements,setMovements]=useState<Movement[]>([])
const[products,setProducts]=useState<Product[]>([])

useEffect(()=>{

const saved=localStorage.getItem("startsmart-data")

if(saved){

const data=JSON.parse(saved)

setMovements(data.movements||[])
setProducts(data.products||[])
setBusinessName(data.businessName||"Mi Negocio")

}

},[])

useEffect(()=>{

localStorage.setItem("startsmart-data",
JSON.stringify({movements,products,businessName})
)

},[movements,products,businessName])

const income=useMemo(()=>movements.filter(m=>m.type==="ingreso").reduce((s,m)=>s+m.amount,0),[movements])
const expense=useMemo(()=>movements.filter(m=>m.type==="gasto").reduce((s,m)=>s+m.amount,0),[movements])

const profit=income-expense

const cashTotal=movements.filter(m=>m.payment==="efectivo").reduce((s,m)=>s+m.amount,0)
const cardTotal=movements.filter(m=>m.payment==="tarjeta").reduce((s,m)=>s+m.amount,0)
const transferTotal=movements.filter(m=>m.payment==="transferencia").reduce((s,m)=>s+m.amount,0)

function addProduct(){

const name=prompt("Nombre producto")
const stock=Number(prompt("Stock"))
const price=Number(prompt("Precio"))

if(!name)return

setProducts([...products,{id:Date.now(),name,stock,price}])

}

function editProduct(product:Product){

const newPrice=Number(prompt("Nuevo precio",String(product.price)))
const newStock=Number(prompt("Nuevo stock",String(product.stock)))

setProducts(products.map(p=>
p.id===product.id
?{...p,price:newPrice,stock:newStock}
:p
))

}

function deleteProduct(product:Product){

if(!confirm("Eliminar producto?"))return

setProducts(products.filter(p=>p.id!==product.id))

}

function sellProduct(product:Product){

if(product.stock<=0){

alert("Sin stock")
return

}

const method=prompt("Pago:\n1 efectivo\n2 tarjeta\n3 transferencia")

let payment="efectivo"

if(method==="2")payment="tarjeta"
if(method==="3")payment="transferencia"

setProducts(products.map(p=>p.id===product.id?{...p,stock:p.stock-1}:p))

setMovements([...movements,{
id:Date.now(),
type:"ingreso",
amount:product.price,
category:"Venta",
payment
}])

}

function quickSale(){

const amount=Number(prompt("Cantidad"))

const method=prompt("Pago:\n1 efectivo\n2 tarjeta\n3 transferencia")

let payment="efectivo"

if(method==="2")payment="tarjeta"
if(method==="3")payment="transferencia"

setMovements([...movements,{
id:Date.now(),
type:"ingreso",
amount,
category:"Venta rápida",
payment
}])

}

return(

<div className="page-shell">

<div className="phone-frame">

<header className="hero-header">

<p className="brand-kicker">{businessName}</p>
<h1>StartSmart</h1>

</header>

<main className="screen-content">

{screen==="inicio"&&(

<div className="stack">

<Card title="Resumen">

<Metric label="Ingresos" value={currency(income)}/>
<Metric label="Gastos" value={currency(expense)}/>
<Metric label="Ganancia" value={currency(profit)}/>

</Card>

<Card title="Caja">

<Metric label="Efectivo" value={currency(cashTotal)}/>
<Metric label="Tarjeta" value={currency(cardTotal)}/>
<Metric label="Transferencia" value={currency(transferTotal)}/>

</Card>

</div>

)}

{screen==="finanzas"&&(

<Card title="Movimientos">

{movements.map(m=>(

<div key={m.id} className="list-row">

<span>{m.category} {m.payment?`(${m.payment})`:""}</span>

<strong>{m.type==="ingreso"?"+":"-"}{currency(m.amount)}</strong>

</div>

))}

<button onClick={quickSale}>Venta rápida</button>

</Card>

)}

{screen==="inventario"&&(

<div className="stack">

{products.map(p=>(

<Card key={p.id}>

<div className="list-row">

<span>{p.name}</span>

<strong>{currency(p.price)} | Stock {p.stock}</strong>

</div>

<button onClick={()=>editProduct(p)}>Editar</button>
<button onClick={()=>deleteProduct(p)}>Eliminar</button>

</Card>

))}

<button onClick={addProduct}>Agregar producto</button>

</div>

)}

{screen==="ventas"&&(

<div className="stack">

{products.map(p=>(

<Card key={p.id}>

<div className="list-row">

<span>{p.name}</span>

<strong>{currency(p.price)}</strong>

</div>

<button onClick={()=>sellProduct(p)}>Vender</button>

</Card>

))}

</div>

)}

{screen==="historial"&&(

<Card title="Historial de ventas">

{movements.filter(m=>m.type==="ingreso").map(m=>(

<div key={m.id} className="list-row">

<span>{m.category} {m.payment?`(${m.payment})`:""}</span>

<strong>{currency(m.amount)}</strong>

</div>

))}

</Card>

)}

</main>

<nav className="bottom-nav">

<NavButton current={screen} id="inicio" icon={<Home size={18}/>} label="Inicio" onPress={setScreen}/>
<NavButton current={screen} id="ventas" icon={<ShoppingCart size={18}/>} label="Ventas" onPress={setScreen}/>
<NavButton current={screen} id="finanzas" icon={<Wallet size={18}/>} label="Finanzas" onPress={setScreen}/>
<NavButton current={screen} id="inventario" icon={<Boxes size={18}/>} label="Inventario" onPress={setScreen}/>
<NavButton current={screen} id="historial" icon={<Receipt size={18}/>} label="Historial" onPress={setScreen}/>
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

<button className={current===id?"nav-button active":"nav-button"} onClick={()=>onPress(id)}>

{icon}

<span>{label}</span>

</button>

)

}
