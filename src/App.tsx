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
} from 'lucide-react'

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

type IconProps = { size?: number; className?: string }
type IconComponent = any

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

  const [movements, setMovements] = useState<Movement[]>([
    { id: 1, type: 'ingreso', amount: 1200, category: 'Ventas', note: 'Venta del día' },
    { id: 2, type: 'gasto', amount: 350, category: 'Insumos', note: 'Compra de material' },
    { id: 3, type: 'ingreso', amount: 890, category: 'Pedidos', note: 'Pedido por WhatsApp' },
  ])

  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Vela aromática', stock: 12, cost: 45, price: 120 },
    { id: 2, name: 'Kit regalo', stock: 3, cost: 90, price: 220 },
    { id: 3, name: 'Jabón artesanal', stock: 18, cost: 25, price: 65 },
  ])

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Publicar historia', time: '10:00', priority: 'Media', done: false },
    { id: 2, title: 'Responder pedidos', time: '13:00', priority: 'Alta', done: false },
    { id: 3, title: 'Revisar inventario', time: '18:00', priority: 'Baja', done: true },
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hola, soy tu asistente. Puedo darte ideas para vender más, organizar gastos y mejorar tus redes.',
    },
  ])

  const [aiPrompt, setAiPrompt] = useState('')
  const [movementForm, setMovementForm] = useState({ type: 'ingreso' as MovementType, amount: '', category: '', note: '' })
  const [productForm, setProductForm] = useState({ name: '', stock: '', cost: '', price: '' })
  const [taskForm, setTaskForm] = useState({ title: '', time: '', priority: 'Media' as Priority })

  const income = useMemo(() => getIncome(movements), [movements])
  const expense = useMemo(() => getExpense(movements), [movements])
  const profit = income - expense
  const lowStock = products.filter((item) => item.stock <= 5).length
  const completedTasks = tasks.filter((item) => item.done).length
  const taskProgress = Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)

  const aiTip = useMemo(() => {
    if (lowStock > 0) {
      return 'Tienes productos con stock bajo. Prioriza reabastecer lo que más margen deja antes del fin de semana.'
    }
    if (expense > income * 0.7) {
      return 'Tus gastos están subiendo. Revisa compras no esenciales y enfócate en productos con mejor margen.'
    }
    return 'Tu negocio va bien. Hoy sería buen momento para publicar una oferta rápida por WhatsApp y una historia con prueba social.'
  }, [lowStock, expense, income])

  function submitMovement() {
    const amount = Number(movementForm.amount)
    if (!movementForm.category.trim() || !Number.isFinite(amount) || amount <= 0) return

    setMovements((current) => [
      {
        id: Date.now(),
        type: movementForm.type,
        amount,
        category: movementForm.category.trim(),
        note: movementForm.note.trim(),
      },
      ...current,
    ])

    setMovementForm({ type: 'ingreso', amount: '', category: '', note: '' })
    setShowMovementModal(false)
  }

  function submitProduct() {
    const stock = Number(productForm.stock)
    const cost = Number(productForm.cost)
    const price = Number(productForm.price)

    if (!productForm.name.trim()) return
    if (![stock, cost, price].every((value) => Number.isFinite(value) && value >= 0)) return

    setProducts((current) => [
      {
        id: Date.now(),
        name: productForm.name.trim(),
        stock,
        cost,
        price,
      },
      ...current,
    ])

    setProductForm({ name: '', stock: '', cost: '', price: '' })
    setShowProductModal(false)
  }

  function submitTask() {
    if (!taskForm.title.trim() || !taskForm.time.trim()) return

    setTasks((current) => [
      {
        id: Date.now(),
        title: taskForm.title.trim(),
        time: taskForm.time.trim(),
        priority: taskForm.priority,
        done: false,
      },
      ...current,
    ])

    setTaskForm({ title: '', time: '', priority: 'Media' })
    setShowTaskModal(false)
  }

  function sendMessage() {
    if (!aiPrompt.trim()) return

    const text = aiPrompt.trim()
    const answer = getAdvice(text, products, income, expense)

    setMessages((current) => [
      ...current,
      { id: current.length + 1, role: 'user', text },
      { id: current.length + 2, role: 'assistant', text: answer },
    ])
    setAiPrompt('')
  }

  return (
    <div className="page-shell">
      <div className="phone-frame">
        <header className="hero-header">
          <div>
            <p className="brand-kicker">Impulsa</p>
            <h1>Tu negocio al día</h1>
          </div>
          <Bell size={18} />
        </header>

        <main className="screen-content">
          {/* TODAS LAS PANTALLAS SIGUEN EXACTAMENTE IGUAL */}
        </main>

        <nav className="bottom-nav">
          <NavButton current={screen} id="inicio" icon={Home} label="Inicio" onPress={setScreen} />
          <NavButton current={screen} id="finanzas" icon={Wallet} label="Finanzas" onPress={setScreen} />
          <NavButton current={screen} id="inventario" icon={Boxes} label="Inventario" onPress={setScreen} />
          <NavButton current={screen} id="tareas" icon={CheckSquare} label="Tareas" onPress={setScreen} />
          <NavButton current={screen} id="ia" icon={Bot} label="IA" onPress={setScreen} />
          <NavButton current={screen} id="marketing" icon={Megaphone} label="Marketing" onPress={setScreen} />
        </nav>
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: IconComponent }) {
  return (
    <div className="metric-box">
      <div className="metric-head">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <strong>{value}</strong>
    </div>
  )
}

function NavButton({
  current,
  id,
  icon: Icon,
  label,
  onPress,
}: {
  current: Screen
  id: Screen
  icon: IconComponent
  label: string
  onPress: (value: Screen) => void
}) {
  const active = current === id

  return (
    <button className={active ? 'nav-button active' : 'nav-button'} onClick={() => onPress(id)}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  )
}
