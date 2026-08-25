import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY/SUPABASE_ANON_KEY en Render")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.mount("/web", StaticFiles(directory="web"), name="web")

class Producto(BaseModel):
    codigo: str
    cod_prov: Optional[str] = ""
    marca: Optional[str] = ""
    descripcion: str
    stem: Optional[int] = 0
    costo: Optional[float] = 0.0
    pventa: Optional[float] = 0.0

@app.get("/")
def read_root():
    return FileResponse("web/productos/productos.html")

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