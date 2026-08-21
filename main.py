from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ============================================================
# Inicialización del ERP
# ============================================================

app = FastAPI(
    title="CONSUPABASE ERP",
    description="Backend del ERP CONSUPABASE",
    version="1.0.0"
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Puedes restringirlo si deseas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Servir carpeta web (HTML, CSS, JS)
# ============================================================

app.mount("/web", StaticFiles(directory="web"), name="web")

# ============================================================
# Rutas base
# ============================================================

@app.get("/")
def root():
    return {
        "status": "ERP CONSUPABASE funcionando",
        "version": "1.0",
        "dashboard": "/web/dashboard/dashboard.html",
        "sidebar": "/web/components/sidebar/sidebar.html"
    }

@app.get("/api/ping")
def ping():
    return {"pong": True}

# ============================================================
# Módulo: Productos (estructura lista)
# ============================================================

@app.get("/api/productos")
def listar_productos():
    return JSONResponse({
        "status": "ok",
        "data": []
    })

@app.post("/api/productos")
def crear_producto(producto: dict):
    return JSONResponse({
        "status": "creado",
        "producto": producto
    })

# ============================================================
# Módulo: Contactos
# ============================================================

@app.get("/api/contactos")
def listar_contactos():
    return {"status": "ok", "data": []}

# ============================================================
# Módulo: Inventario
# ============================================================

@app.get("/api/inventario")
def inventario():
    return {"status": "ok", "data": []}

# ============================================================
# Módulo: Usuarios
# ============================================================

@app.get("/api/usuarios")
def usuarios():
    return {"status": "ok", "data": []}

# ============================================================
# Fin del archivo
# ============================================================
