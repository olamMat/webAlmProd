# Reporte Dashboard Professional

Dashboard moderno y elegante construido con Vue 3, Vite y Tailwind CSS para la visualización y exportación de reportes de producción.

## Características

- 📊 **Métricas en tiempo real:** Visualización de KPIs clave.
- 📋 **Tabla de Datos:** Visualización detallada de registros con soporte para formatos de fecha complejos.
- 📥 **Exportación a Excel:** Descarga instantánea de los datos visibles en formato `.xlsx`.
- 🔗 **Proxy Integrado:** Sistema de proxy para evitar problemas de CORS con APIs externas.
- 🤖 **Auto-inicio:** Scripts para configurar el inicio automático en Windows.

## Requisitos

- Node.js (v18 o superior)
- npm

## Instalación

```bash
# Instalar dependencias
npm install
```

## Ejecución

### Modo Desarrollo (Recomendado)

```bash
# Iniciar el dashboard y el proxy de Vite
npm run dev
```
El dashboard estará disponible en [http://localhost:4006](http://localhost:4006).

### Scripts de Automatización

En la carpeta `scripts/` encontrarás:

- `start-dashboard.ps1`: Inicia el proxy intermedio y el servidor de desarrollo.
- `install-task.ps1`: Registra una tarea en Windows para iniciar el dashboard automáticamente al iniciar sesión.

## Configuración

- **Puerto del Dashboard:** 4006
- **Puerto del Proxy Intermedio:** 4007
- **API Target:** GitHub Raw (configurable en `vite.config.ts` y `proxy-server.js`)

---
Desarrollado para Reporte Produc &copy; 2026
