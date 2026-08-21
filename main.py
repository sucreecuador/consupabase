from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ============================================================
# CORS (permite que el frontend cargue recursos sin bloqueo)
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Puedes restringirlo si deseas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Servir carpeta web/ (HTML, CSS, JS, imágenes)
# ============================================================
app.mount("/web", StaticFiles(directory="web"), name="web")

# ============================================================
# Endpoint raíz
# ============================================================
@app.get("/")
def root():
    return {
        "status": "ERP CONSUPABASE funcionando",
        "version": "1.0",
        "frontend": "/web/index.html",
        "sidebar": "/web/components/sidebar/sidebar.html"
    }

# ============================================================
# Ejemplo de endpoint API (puedes agregar más)
# ============================================================
@app.get("/api/ping")
def ping():
    return {"pong": True}

# ============================================================
# Aquí puedes agregar tus módulos:
# /api/productos
# /api/contactos
# /api/inventario
# /api/reportes
# /api/usuarios
# ============================================================
