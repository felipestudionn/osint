# 🔍 OSINT Intelligence Platform

## 🚀 Plataforma OSINT Profesional con Interfaz Web Moderna

Una plataforma completa de inteligencia OSINT (Open Source Intelligence) con interfaz web interactiva, desarrollada en Python con FastAPI y frontend moderno.

![OSINT Platform](https://img.shields.io/badge/OSINT-Platform-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Características Principales

### 🎯 **Funcionalidades OSINT**
- **Email Intelligence**: Análisis completo de direcciones de correo
- **Phone Intelligence**: Investigación de números telefónicos
- **Domain Analysis**: Análisis de dominios y DNS
- **Multi-Engine Search**: Búsquedas en múltiples motores
- **Breach Detection**: Detección de filtraciones de datos
- **Social Media Lookup**: Búsqueda en redes sociales

### 🖥️ **Interfaz Web Moderna**
- **Dashboard Interactivo**: Panel principal con métricas en tiempo real
- **Navegación Intuitiva**: Menú lateral con secciones organizadas
- **Responsive Design**: Compatible con dispositivos móviles
- **Notificaciones**: Sistema de alertas en tiempo real
- **Búsqueda Rápida**: Barra de búsqueda global
- **Exportación**: Reportes en PDF, Excel y JSON

### 🔐 **Sistema de Autenticación**
- **Login/Registro**: Sistema seguro de usuarios
- **Roles y Permisos**: Control de acceso granular
- **Tokens JWT**: Autenticación basada en tokens
- **Sesiones Persistentes**: Mantiene sesión activa

## 📁 Estructura del Proyecto

```
osint_para_hermano/
├── OSINT_PLATFORM_PARA_HERMANO.py  # API principal FastAPI
├── static/                          # Archivos web estáticos
│   ├── index.html                  # Interfaz principal
│   ├── styles.css                  # Estilos CSS
│   └── app.js                      # Lógica JavaScript
├── COMO_USAR_SCRIPT.txt            # Instrucciones básicas
├── QUICK_START_HERMANO.txt         # Comandos rápidos
├── hermano_setup.sh                # Script de instalación
└── README.md                       # Este archivo
```

## 🛠️ Instalación y Configuración

### 1️⃣ **Instalación Rápida**

```bash
# Clonar o descargar el proyecto
cd osint_para_hermano

# Instalar dependencias
pip install fastapi uvicorn httpx requests pydantic[email]

# Ejecutar la plataforma
python3 OSINT_PLATFORM_PARA_HERMANO.py
```

### 2️⃣ **Instalación con Script Automático**

```bash
# Dar permisos de ejecución
chmod +x hermano_setup.sh

# Ejecutar script de instalación
./hermano_setup.sh
```

### 3️⃣ **Instalación Manual**

```bash
# Crear entorno virtual (recomendado)
python3 -m venv osint_env
source osint_env/bin/activate  # Linux/Mac
# osint_env\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt  # Si existe
# O instalar manualmente:
pip install fastapi uvicorn httpx requests pydantic[email]

# Ejecutar
python3 OSINT_PLATFORM_PARA_HERMANO.py
```

## 🌐 Acceso a la Plataforma

Una vez iniciada la aplicación:

### **URLs Principales**
- **Interfaz Web**: http://localhost:8002/
- **API Docs**: http://localhost:8002/docs
- **Health Check**: http://localhost:8002/health
- **API Info**: http://localhost:8002/api

### **Credenciales por Defecto**
```
Email: admin@example.com
Password: admin123
Rol: admin
```

## 🎮 Guía de Uso

### **1. Acceso Inicial**
1. Abrir navegador en `http://localhost:8002`
2. Usar credenciales de demo o registrar nuevo usuario
3. Explorar el dashboard principal

### **2. Dashboard Principal**
- **Estadísticas**: Métricas de investigaciones y actividad
- **Actividad Reciente**: Timeline de acciones realizadas
- **Acciones Rápidas**: Botones para funciones principales

### **3. Investigación de Emails**
1. Ir a "Email Intel" en el menú lateral
2. Introducir dirección de email
3. Seleccionar opciones (breaches, redes sociales)
4. Ver resultados detallados

### **4. Análisis de Teléfonos**
1. Navegar a "Teléfono Intel"
2. Introducir número (formato internacional)
3. Obtener información del carrier y país

### **5. Búsquedas Multi-Motor**
1. Acceder a "Búsquedas"
2. Introducir términos de búsqueda
3. Seleccionar motores (Google, Bing)
4. Revisar resultados agregados

## 🔧 API REST

### **Endpoints Principales**

#### Autenticación
```bash
# Registro
POST /auth/register
{
  "email": "usuario@ejemplo.com",
  "password": "mipassword",
  "role": "analyst"
}

# Login
POST /auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "mipassword"
}

# Perfil
GET /auth/profile
Authorization: Bearer <token>
```

#### Investigaciones
```bash
# Email Intelligence
POST /api/v1/email/investigate
Authorization: Bearer <token>
{
  "email": "target@ejemplo.com",
  "check_breaches": true,
  "check_social": true
}

# Phone Intelligence
GET /api/v1/phone/investigate?phone=+1234567890
Authorization: Bearer <token>

# Multi-Engine Search
GET /api/v1/search/engines?query=osint%20tools&engines=google,bing
Authorization: Bearer <token>
```

## 🎨 Características de la Interfaz

### **Diseño Moderno**
- **Gradientes**: Colores modernos y atractivos
- **Animaciones**: Transiciones suaves y efectos hover
- **Iconografía**: Font Awesome para iconos consistentes
- **Typography**: Fuentes legibles y jerarquía clara

### **Navegación Intuitiva**
- **Sidebar**: Menú lateral colapsible
- **Breadcrumbs**: Navegación contextual
- **Search**: Búsqueda global en tiempo real
- **Notifications**: Sistema de notificaciones toast

### **Responsive Design**
- **Mobile First**: Optimizado para móviles
- **Tablet Support**: Adaptación para tablets
- **Desktop**: Experiencia completa en escritorio

## 📊 Funcionalidades Avanzadas

### **Gestión de Investigaciones**
- Crear y organizar casos
- Historial de búsquedas
- Etiquetado y categorización
- Colaboración en equipo

### **Reportes y Exportación**
- Exportar a PDF profesional
- Datos en Excel para análisis
- JSON para integración con otras herramientas
- Gráficos y visualizaciones

### **Configuración Personalizada**
- Preferencias de usuario
- Configuración de notificaciones
- Gestión de tokens API
- Temas y personalización

## 🔒 Seguridad

### **Autenticación Segura**
- Hashing de contraseñas con PBKDF2
- Tokens JWT seguros
- Sesiones con expiración
- Validación de permisos

### **Buenas Prácticas**
- CORS configurado correctamente
- Validación de entrada con Pydantic
- Manejo seguro de errores
- Logs de auditoría

## 🚀 Desarrollo y Personalización

### **Estructura del Código**
```python
# Backend: FastAPI
- Endpoints REST organizados
- Modelos Pydantic para validación
- Sistema de autenticación modular
- Base de datos en memoria (desarrollo)

# Frontend: Vanilla JavaScript
- Arquitectura orientada a objetos
- Gestión de estado centralizada
- Componentes reutilizables
- API client integrado
```

### **Extensiones Posibles**
- Base de datos PostgreSQL/MySQL
- Integración con APIs externas
- Sistema de plugins
- Análisis de imágenes
- Machine Learning para detección

## 📈 Roadmap

### **Próximas Funcionalidades**
- [ ] Base de datos persistente
- [ ] Análisis de dominios avanzado
- [ ] Integración con Shodan
- [ ] Análisis de imágenes EXIF
- [ ] Geolocalización IP
- [ ] Reportes automatizados
- [ ] API webhooks
- [ ] Modo oscuro
- [ ] Múltiples idiomas

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

### **Problemas Comunes**
- **Puerto ocupado**: Cambiar puerto en el código (línea 406)
- **Dependencias**: Verificar instalación con `pip list`
- **Permisos**: Ejecutar con permisos adecuados

### **Contacto**
- **Issues**: Crear issue en el repositorio
- **Documentación**: Ver `/docs` en la aplicación
- **API Reference**: Swagger UI automático

---

**🔍 OSINT Intelligence Platform - Inteligencia Profesional al Alcance de Todos**

*Desarrollado con ❤️ para la comunidad OSINT*
