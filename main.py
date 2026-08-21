from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

# ============================================================
# CONFIGURACIÓN SUPABASE
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(title="CONSUPABASE ERP")

# CORS para permitir frontend desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # puedes restringir si quieres
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# SERVIR FRONTEND (carpeta web/)
# ============================================================

app.mount("/web", StaticFiles(directory="web"), name="web")

@app.get("/")
def root():
    return FileResponse("web/index.html")

# ============================================================
# API: PRODUCTOS
# ============================================================

@app.get("/productos")
def get_productos(
    page: int = Query(0, ge=0),
    page_size: int = Query(50, ge=1, le=500),
    descripcion: str | None = None
):
    """
    Endpoint de productos con paginación real.
    """
    query = supabase.table("productos")

    # Filtro opcional
    if descripcion:
        query = query.ilike("descripcion", f"%{descripcion}%")

    # Obtener total
    total = query.select("*", count="exact").execute().count

    # Paginación
    start = page * page_size
    end = start + page_size - 1

    data = (
        query.select("*")
        .range(start, end)
        .execute()
        .data
    )

    return {
        "data": data,
        "count": total,
        "page": page,
        "page_size": page_size,
    }

# ============================================================
# API: DASHBOARD
# ============================================================

@app.get("/dashboard")
def dashboard():
    """
    Datos del dashboard (ejemplo: total de productos).
    """
    total = (
        supabase.table("productos")
        .select("*", count="exact")
        .execute()
        .count
    )

    return {
        "total_productos": total,
        "status": "ok"
    }

# ============================================================
# API: SALUD
# ============================================================

@app.get("/health")
def health():
    return {"status": "running", "service": "consupabase-api"}
