import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional

# ============================
# CONFIGURACIÓN SUPABASE
# ============================
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================
# INICIALIZAR FASTAPI
# ============================
app = FastAPI()

# Carpeta web completa
app.mount("/web", StaticFiles(directory="web"), name="web")

# ============================
# RUTA HOME (NO TOCAR)
# ============================
@app.get("/")
def home():
    return FileResponse("web/index.html")

# ============================
# API PRODUCTOS
# ============================
class Producto(BaseModel):
    codigo: str
    cod_prov: Optional[str] = ""
    marca: Optional[str] = ""
    descripcion: str
    stem: Optional[int] = 0
    costo: Optional[float] = 0.0
    pventa: Optional[float] = 0.0

@app.get("/api/productos")
def obtener_productos():
    try:
        response = supabase.table("productos").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/productos")
def crear_producto(producto: Producto):
    try:
        data = producto.model_dump()
        response = supabase.table("productos").insert(data).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/productos/{codigo}")
def actualizar_producto(codigo: str, producto: Producto):
    try:
        data = producto.model_dump()
        response = supabase.table("productos").update(data).eq("codigo", codigo).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/productos/{codigo}")
def eliminar_producto(codigo: str):
    try:
        response = supabase.table("productos").delete().eq("codigo", codigo).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================
# API CONTACTOS (NO TOCAR)
# ============================
@app.get("/api/contactos")
def obtener_contactos():
    try:
        response = supabase.table("clientes").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
