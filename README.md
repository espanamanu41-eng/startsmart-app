# Impulsa · Prototipo para emprendedores

Este proyecto es un prototipo funcional en React + TypeScript + Vite para una app enfocada en emprendedores principiantes.

## Qué incluye

- Dashboard con ingresos, gastos y ganancias
- Registro básico de movimientos financieros
- Inventario simple con alerta de stock bajo
- Sistema de tareas
- Asistente IA simulado con respuestas por reglas
- Ideas de marketing y contenido
- Interfaz visual tipo app móvil

## Requisitos

- Node.js 18 o superior
- npm

## Cómo ejecutar localmente

```bash
npm install
npm run dev
```

Luego abre la URL local que te muestre Vite.

## Cómo generar build de producción

```bash
npm run build
npm run preview
```

## Cómo subirlo a GitHub

```bash
git init
git add .
git commit -m "Primer commit del prototipo Impulsa"
git branch -M main
git remote add origin TU_URL_DE_GITHUB
git push -u origin main
```

## Cómo desplegarlo gratis

Puedes subirlo directo a:

- Vercel
- Netlify

Ambos detectan automáticamente proyectos Vite.

## Estructura principal

```text
src/
  App.tsx
  main.tsx
  styles.css
index.html
package.json
vite.config.ts
```

## Próximo paso recomendado

Conectar persistencia real con Firebase o Supabase, y luego migrarlo a React Native o Expo si quieres app móvil instalable.
