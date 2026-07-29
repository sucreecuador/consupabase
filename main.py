import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# Configuración de credenciales Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://utcqgkeiyqvfxfhjupfc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Sistema Sucre API")

# Habilitar CORS para permitir peticiones desde el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API Sistema Sucre activa y en funcionamiento"}

@app.get("/productos")
def productos(
    page: int = Query(0, ge=0),
    page_size: int = Query(50, ge=1, le=200),
    descripcion: str = "",
    codigo: str = "",
    marca: str = "",
    proveedor: str = ""
):
    try:
        # Consulta base a la tabla "productos" con conteo exacto de registros
        query = supabase.table("productos").select("*", count="exact")

        # Filtros de búsqueda
        if descripcion.strip():
            query = query.ilike("descripcion", f"%{descripcion.strip()}%")
        if codigo.strip():
            query = query.ilike("codigo", f"%{codigo.strip()}%")
        if marca.strip():
            query = query.ilike("marca", f"%{marca.strip()}%")
        if proveedor.strip():
            query = query.ilike("codigo_proveedor", f"%{proveedor.strip()}%")

        # Paginación
        offset = page * page_size
        limit_end = offset + page_size - 1

        res = query.order("id", desc=False).range(offset, limit_end).execute()

        total_records = res.count if res.count is not None else len(res.data)
        total_pages = (total_records + page_size - 1) // page_size if page_size > 0 else 0

        return {
            "data": res.data,
            "page": page,
            "page_size": page_size,
            "total": total_records,
            "total_pages": total_pages
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))