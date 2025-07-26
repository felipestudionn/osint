# OSINT Platform - Vercel Deployment

## 🚀 Deployed Version
Esta es la versión frontend de la plataforma OSINT optimizada para Vercel.

## 📁 Estructura para Vercel
```
/
├── index.html          # Página principal (requerida por Vercel)
├── vercel.json         # Configuración de Vercel
├── static/
│   ├── styles.css      # Estilos CSS
│   ├── app.js          # JavaScript funcional
│   └── index.html      # Versión original
└── README-VERCEL.md    # Esta documentación
```

## ⚙️ Configuración
- `vercel.json` redirige todas las rutas a `/static/`
- `index.html` en la raíz es el punto de entrada
- Rutas relativas para archivos estáticos

## 🌐 Funcionalidades
- ✅ Interfaz completa estilo Gemini Live
- ✅ Dashboard interactivo
- ✅ Email Intelligence (frontend)
- ✅ Phone Intelligence (frontend)
- ✅ Search Tools
- ✅ Responsive design

## 📝 Nota
Esta versión solo incluye el frontend. Para funcionalidad completa con backend FastAPI, usar la versión local.

## 🔧 Deploy en Vercel
1. Conectar repositorio GitHub
2. Vercel detectará automáticamente la configuración
3. Deploy automático desde la rama main
