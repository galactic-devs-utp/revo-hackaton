# RevoLink — Plataforma de Suministro Circular e Industria Sostenible

RevoLink es una plataforma integrada B2B que conecta la oferta de materias primas industriales recicladas y homologadas con simuladores de impacto económico/CO2 y un chatbot inteligente con tecnología RAG (Retrieval-Augmented Generation) para el cumplimiento de normativas ambientales (como el D.S. 024-2021-MINAM).

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalados los siguientes entornos antes de iniciar:
* **Node.js** (versión 18 o superior)
* **Python** (versión 3.9 o superior)
* Acceso a un proyecto en **Supabase** (Base de Datos Postgres)
* Una **API Key de Gemini** para el funcionamiento del chatbot (Terra AI)

---

## 📂 Estructura del Proyecto

El repositorio está dividido en dos partes principales:
1. `backend/`: API construida en Flask (Python) encargada de procesar las normativas legales en PDF, vectorizar el texto con FAISS y responder a consultas usando el SDK de Gemini.
2. `frontend/`: Aplicación de interfaz de usuario interactiva construida en React, TypeScript y TailwindCSS con Vite.

---

## 🚀 Configuración y Ejecución del Backend

El backend gestiona el sistema RAG (procesamiento de PDFs y el agente inteligente Terra AI).

### 1. Preparar el Entorno Virtual de Python
Abre una terminal y navega hasta el directorio del backend:
```bash
cd backend
```

Crea y activa el entorno virtual de Python:
* **Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .venv\Scripts\activate
  ```
* **Linux / macOS:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

### 2. Instalar las Dependencias
Con el entorno virtual activo, instala los paquetes requeridos:
```bash
pip install -r requeriments.txt
```

### 3. Configurar las Variables de Entorno
Crea o edita un archivo llamado `.env` dentro de la carpeta `backend/` con las siguientes credenciales:
```env
# API Key de Google Gemini
GEMINI_API_KEY=tu_api_key_de_gemini

# Conexión directa a Supabase (PostgreSQL) para operaciones si aplica
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=tu_anon_key_de_supabase
```

### 4. Generar el PDF Base de Regulaciones (Opcional)
Si necesitas compilar las regulaciones ambientales peruanas en un solo documento PDF de conocimiento para la IA, ejecuta:
```bash
python generate_pdf.py
```
*(Esto creará el archivo `backend/data/regulations.pdf`)*

### 5. Iniciar el Servidor Flask
Inicia el backend en el entorno local:
```bash
python app.py
```
El servidor del backend correrá en `http://localhost:5000/`.

---

## 💻 Configuración y Ejecución del Frontend

El frontend contiene la interfaz de usuario, el catálogo de productos homologados, el simulador de cotizaciones B2B y el chatbot flotante.

### 1. Instalar las Dependencias de Node
Abre una terminal nueva, navega hasta la carpeta del frontend e instala las dependencias de Node:
```bash
cd frontend
npm install
```

### 2. Configurar las Variables de Entorno del Cliente
Crea o edita un archivo llamado `.env` dentro de la carpeta `frontend/` con las credenciales de conexión cliente a Supabase:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 3. Iniciar el Servidor de Desarrollo (Vite)
Para iniciar la interfaz interactiva localmente, ejecuta:
```bash
npm run dev
```
La aplicación web se abrirá automáticamente en tu navegador en `http://localhost:5173/` (o el puerto que indique la consola).

---

## 💡 Flujo de Trabajo en la Plataforma

1. **Catálogo y Simulador B2B:** La pantalla por defecto te permite navegar entre los productos homologados y estimar volúmenes requeridos, presupuesto (F.O.B.) y mitigación de CO2 según el tipo de aplicación del proyecto.
2. **Chatbot Inteligente (Terra AI):** Haz clic en el ícono flotante de avatar casual en la esquina inferior derecha para abrir el panel mediano del chatbot. Puedes preguntarle sobre el cumplimiento de normativas como el *D.S. 024-2021-MINAM*.