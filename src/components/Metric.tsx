type Props={
label:string
value:string
}

export default function Metric({label,value}:Props){

return(

<div className="metric-box">

<span>{label}</span>
<strong>{value}</strong>

</div>

)

}
