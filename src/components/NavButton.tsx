type Screen =
  | "inicio"
  | "finanzas"
  | "inventario"
  | "tareas"
  | "ia"
  | "config"
  | "ventas"

type Props={
current:Screen
id:Screen
icon:React.ReactNode
label:string
onPress:(v:Screen)=>void
}

export default function NavButton({current,id,icon,label,onPress}:Props){

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
