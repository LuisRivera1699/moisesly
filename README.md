# Moises Ly — Sistema de alquiler de ternos

SPA para gestionar ubicaciones, ternos, productos, clientes y alquileres. Usa Firebase Authentication y Firestore (plan Spark gratuito).

## Requisitos

- Node.js 20+
- Proyecto Firebase con Authentication y Firestore

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Authentication → Email/Password**
3. Crea usuarios manualmente en Authentication (no hay registro público)
4. Crea una base de datos **Firestore** en modo producción
5. En Configuración del proyecto → Tus apps → Web, copia las credenciales
6. Copia `.env.example` a `.env` y completa los valores:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

7. Despliega las reglas de Firestore:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

(O copia el contenido de `firestore.rules` manualmente en la consola de Firebase.)

## Desarrollo local

```bash
npm install
npm run dev
```

La app estará en `http://localhost:5173`

## Build para producción

```bash
npm run build
npm run preview
```

## Módulos

| Módulo | Descripción |
|--------|-------------|
| Dashboard | Alquileres e ingresos del mes, pendientes de devolución, devoluciones de hoy |
| Ubicaciones | Ubicaciones de almacenaje |
| Ternos | Inventario de ternos con estados |
| Categorías | Categorías de productos de venta |
| Productos | Productos de venta |
| Clientes | Base de clientes |
| Alquileres | Alquileres con sincronización automática del estado del terno |

## Reglas de negocio

- Al crear un alquiler con estado "entregado", el terno pasa a "alquilado"
- Al marcar un alquiler como "devuelto", el terno vuelve a "en tienda"
- No se pueden eliminar ubicaciones con ternos/productos asociados
- No se pueden eliminar categorías con productos asociados
- No se pueden eliminar ternos con alquileres activos

## Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Firebase Auth + Firestore
- react-hook-form + zod
