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
type IconComponent = (props: IconProps) => JSX.Element

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
          {screen === 'inicio' && (
            <div className="stack">
              <Card title="Resumen del mes">
                <div className="metric-grid">
                  <Metric label="Ingresos" value={currency(income)} icon={TrendingUp} />
                  <Metric label="Gastos" value={currency(expense)} icon={TrendingDown} />
                  <Metric label="Ganancia" value={currency(profit)} icon={Sparkles} />
                </div>
              </Card>

              <Card title="Acciones rápidas">
                <div className="quick-grid">
                  <button className="ghost-button" onClick={() => setScreen('finanzas')}>Registrar venta</button>
                  <button className="ghost-button" onClick={() => setScreen('finanzas')}>Agregar gasto</button>
                  <button className="ghost-button" onClick={() => setScreen('inventario')}>Nuevo producto</button>
                  <button className="ghost-button" onClick={() => setScreen('tareas')}>Nueva tarea</button>
                </div>
              </Card>

              <Card title="Consejo IA del día" tone="green">
                <p className="card-copy">{aiTip}</p>
              </Card>

              <Card title="Tareas de hoy">
                <div className="list-stack">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="list-row muted-box">
                      <div>
                        <div className={task.done ? 'line-through' : ''}>{task.title}</div>
                        <small>{task.time}</small>
                      </div>
                      <PriorityTag priority={task.priority} />
                    </div>
                  ))}
                </div>
                <div className="progress-wrap">
                  <small>Progreso diario</small>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${taskProgress}%` }} />
                  </div>
                </div>
              </Card>

              <Card title="Idea para redes" tone="blue">
                <p className="card-copy">{marketingIdeas[0]}</p>
                <button className="secondary-button">Copiar idea</button>
              </Card>
            </div>
          )}

          {screen === 'finanzas' && (
            <div className="stack">
              <SectionHeader title="Finanzas" actionLabel="Agregar" onAction={() => setShowMovementModal(true)} />

              <div className="metric-grid">
                <Metric label="Ingresos" value={currency(income)} icon={TrendingUp} />
                <Metric label="Gastos" value={currency(expense)} icon={TrendingDown} />
                <Metric label="Ganancia" value={currency(profit)} icon={Sparkles} />
              </div>

              <Card>
                <div className="tab-strip">
                  <span className="tab-pill active">Todos</span>
                  <span className="tab-pill">Ingresos</span>
                  <span className="tab-pill">Gastos</span>
                </div>
                <div className="list-stack">
                  {movements.map((movement) => (
                    <div className="list-row" key={movement.id}>
                      <div>
                        <div>{movement.category}</div>
                        <small>{movement.note || 'Sin nota'}</small>
                      </div>
                      <strong className={movement.type === 'ingreso' ? 'positive' : 'negative'}>
                        {movement.type === 'ingreso' ? '+' : '-'}
                        {currency(movement.amount)}
                      </strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {screen === 'inventario' && (
            <div className="stack">
              <SectionHeader title="Inventario" actionLabel="Producto" onAction={() => setShowProductModal(true)} />

              <div className="list-stack">
                {products.map((product) => {
                  const margin = product.price - product.cost
                  return (
                    <Card key={product.id}>
                      <div className="list-row align-start">
                        <div>
                          <div>{product.name}</div>
                          <small>
                            Compra {currency(product.cost)} · Venta {currency(product.price)}
                          </small>
                          <p className="positive margin-top-xs">Margen aprox. {currency(margin)}</p>
                        </div>
                        <span className={product.stock <= 5 ? 'chip chip-danger' : 'chip chip-soft'}>
                          {product.stock <= 5 ? 'Stock bajo' : `Stock ${product.stock}`}
                        </span>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {lowStock > 0 && (
                <Card tone="amber">
                  <div className="alert-row">
                    <AlertCircle size={18} />
                    <p className="card-copy">Tienes {lowStock} producto(s) con stock bajo. Reabastece pronto.</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {screen === 'tareas' && (
            <div className="stack">
              <SectionHeader title="Tareas" actionLabel="Tarea" onAction={() => setShowTaskModal(true)} />
              <div className="list-stack">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <div className="list-row">
                      <div className="task-row">
                        <button
                          className={task.done ? 'task-check task-check-done' : 'task-check'}
                          onClick={() =>
                            setTasks((current) =>
                              current.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)),
                            )
                          }
                        />
                        <div>
                          <div className={task.done ? 'line-through' : ''}>{task.title}</div>
                          <small>{task.time}</small>
                        </div>
                      </div>
                      <PriorityTag priority={task.priority} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {screen === 'ia' && (
            <div className="stack">
              <div className="section-title-wrap">
                <h2>Asistente IA</h2>
                <span className="chip chip-soft">Beta</span>
              </div>

              <div className="suggestion-row">
                {[
                  '¿Cómo puedo vender más esta semana?',
                  '¿Estoy gastando demasiado?',
                  '¿Qué producto debo promocionar?',
                ].map((question) => (
                  <button className="suggestion-pill" key={question} onClick={() => setAiPrompt(question)}>
                    {question}
                  </button>
                ))}
              </div>

              <Card>
                <div className="chat-window">
                  {messages.map((message) => (
                    <div key={message.id} className={message.role === 'user' ? 'chat-row user' : 'chat-row'}>
                      <div className={message.role === 'user' ? 'chat-bubble user' : 'chat-bubble'}>{message.text}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="composer-row">
                <textarea
                  className="textarea"
                  value={aiPrompt}
                  placeholder="Escribe tu pregunta..."
                  onChange={(event) => setAiPrompt(event.target.value)}
                />
                <button className="primary-button" onClick={sendMessage}>Enviar</button>
              </div>
            </div>
          )}

          {screen === 'marketing' && (
            <div className="stack">
              <div className="section-title-wrap">
                <h2>Marketing</h2>
              </div>

              {marketingIdeas.map((idea, index) => (
                <Card key={idea}>
                  <div className="list-row align-start">
                    <div>
                      <small>Idea {index + 1}</small>
                      <p className="card-copy">{idea}</p>
                    </div>
                    <button className="icon-button" aria-label="Copiar idea">
                      <Copy size={16} />
                    </button>
                  </div>
                </Card>
              ))}

              <Card title="Sugerencia automática" tone="green">
                <p className="card-copy">
                  Crea una promoción flash de 24 horas para el producto con más margen y publícala en historias con llamada a la acción directa.
                </p>
              </Card>
            </div>
          )}
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

      {showMovementModal && (
        <Modal title="Nuevo movimiento" onClose={() => setShowMovementModal(false)}>
          <label>
            <span>Tipo</span>
            <select
              className="input"
              value={movementForm.type}
              onChange={(event) => setMovementForm({ ...movementForm, type: event.target.value as MovementType })}
            >
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </label>
          <label>
            <span>Monto</span>
            <input
              className="input"
              value={movementForm.amount}
              onChange={(event) => setMovementForm({ ...movementForm, amount: event.target.value })}
              placeholder="250"
            />
          </label>
          <label>
            <span>Categoría</span>
            <input
              className="input"
              value={movementForm.category}
              onChange={(event) => setMovementForm({ ...movementForm, category: event.target.value })}
              placeholder="Ventas / Insumos"
            />
          </label>
          <label>
            <span>Nota</span>
            <input
              className="input"
              value={movementForm.note}
              onChange={(event) => setMovementForm({ ...movementForm, note: event.target.value })}
              placeholder="Detalle opcional"
            />
          </label>
          <button className="primary-button full-width" onClick={submitMovement}>Guardar</button>
        </Modal>
      )}

      {showProductModal && (
        <Modal title="Agregar producto" onClose={() => setShowProductModal(false)}>
          <label>
            <span>Nombre</span>
            <input className="input" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
          </label>
          <label>
            <span>Stock</span>
            <input className="input" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} />
          </label>
          <label>
            <span>Precio compra</span>
            <input className="input" value={productForm.cost} onChange={(event) => setProductForm({ ...productForm, cost: event.target.value })} />
          </label>
          <label>
            <span>Precio venta</span>
            <input className="input" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} />
          </label>
          <button className="primary-button full-width" onClick={submitProduct}>Guardar</button>
        </Modal>
      )}

      {showTaskModal && (
        <Modal title="Nueva tarea" onClose={() => setShowTaskModal(false)}>
          <label>
            <span>Título</span>
            <input className="input" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
          </label>
          <label>
            <span>Hora</span>
            <input className="input" value={taskForm.time} onChange={(event) => setTaskForm({ ...taskForm, time: event.target.value })} placeholder="16:00" />
          </label>
          <label>
            <span>Prioridad</span>
            <select
              className="input"
              value={taskForm.priority}
              onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value as Priority })}
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </label>
          <button className="primary-button full-width" onClick={submitTask}>Guardar</button>
        </Modal>
      )}
    </div>
  )
}

function Card({
  children,
  title,
  tone,
}: {
  children: React.ReactNode
  title?: string
  tone?: 'green' | 'blue' | 'amber'
}) {
  const toneClass = tone ? `card-${tone}` : ''

  return (
    <section className={`card ${toneClass}`}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
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

function PriorityTag({ priority }: { priority: Priority }) {
  const className =
    priority === 'Alta' ? 'chip chip-danger' : priority === 'Media' ? 'chip chip-warn' : 'chip chip-soft'

  return <span className={className}>{priority}</span>
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <button className="primary-button inline-button" onClick={onAction}>
        <Plus size={16} />
        {actionLabel}
      </button>
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

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
