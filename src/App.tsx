import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  Bot,
  Boxes,
  CheckSquare,
  Copy,
  Home,
  Megaphone,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  LucideProps
} from 'lucide-react'

// ✅ FIX REAL AQUÍ
type IconComponent = React.ComponentType<LucideProps>

type Screen = 'inicio' | 'finanzas' | 'inventario' | 'tareas' | 'ia' | 'marketing'
type MovementType = 'ingreso' | 'gasto'
type Priority = 'Alta' | 'Media' | 'Baja'

type Movement = {
  id: number
  type: MovementType
  amount: number
  category: string
  note: string
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
  priority: Priority
  done: boolean
}

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const currency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)

const marketingIdeas = [
  'Sube una historia mostrando tu producto más vendido en uso.',
  'Haz un combo por 24 horas para mover inventario lento.',
  'Publica un testimonio de cliente con llamada a la acción.',
  'Graba un reel corto del antes y después del producto.',
]

function getIncome(movements: Movement[]) {
  return movements.filter((item) => item.type === 'ingreso').reduce((sum, item) => sum + item.amount, 0)
}

function getExpense(movements: Movement[]) {
  return movements.filter((item) => item.type === 'gasto').reduce((sum, item) => sum + item.amount, 0)
}

function getBestProduct(products: Product[]) {
  if (products.length === 0) return null
  return [...products].sort((a, b) => b.price - b.cost - (a.price - a.cost))[0]
}

function getAdvice(prompt: string, products: Product[], income: number, expense: number) {
  const text = prompt.toLowerCase()

  if (text.includes('gasto') || text.includes('gastando')) {
    return expense > income * 0.7
      ? 'Tus gastos están altos. Revisa compras no esenciales y enfócate en productos con mejor margen.'
      : 'Tus gastos están controlados. Mantén registro diario para detectar cambios rápido.'
  }

  if (text.includes('promocionar') || text.includes('producto')) {
    const best = getBestProduct(products)
    return best
      ? `Te conviene promocionar ${best.name}, porque tiene buen margen y stock suficiente para una campaña rápida.`
      : 'Primero agrega productos para poder recomendar cuál promocionar.'
  }

  if (text.includes('vender')) {
    return 'Para vender más esta semana, promociona tu producto con mejor margen, crea una oferta con tiempo limitado y publica testimonios.'
  }

  return 'Revisa tus productos más rentables y publica hoy una promoción sencilla con urgencia clara.'
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('inicio')
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)

  const [movements, setMovements] = useState<Movement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [aiPrompt, setAiPrompt] = useState('')
  const [movementForm, setMovementForm] = useState({ type: 'ingreso' as MovementType, amount: '', category: '', note: '' })
  const [productForm, setProductForm] = useState({ name: '', stock: '', cost: '', price: '' })
  const [taskForm, setTaskForm] = useState({ title: '', time: '', priority: 'Media' as Priority })

  const income = useMemo(() => getIncome(movements), [movements])
  const expense = useMemo(() => getExpense(movements), [movements])
  const profit = income - expense

  return (
    <div>
      <h1>App funcionando 🚀</h1>
      <p>Ingresos: {currency(income)}</p>
      <p>Gastos: {currency(expense)}</p>
      <p>Ganancia: {currency(profit)}</p>

      <TrendingUp size={20} />
      <Wallet size={20} />
      <Home size={20} />
    </div>
  )
}
