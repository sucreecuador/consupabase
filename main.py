import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client

app = FastAPI(title="ERP SUCRE API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL o SUPABASE_KEY no están configuradas.")
    supabase: Optional[Client] = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Esquemas Pydantic para Productos
class ProductoCreate(BaseModel):
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    marca: Optional[str] = None
    unidad: Optional[str] = None
    precio_venta: Optional[float] = 0.0
    costo_prom: Optional[float] = 0.0
    saldo_temp: Optional[int] = 0
    pro1: Optional[str] = None
    pro2: Optional[str] = None
    pro3: Optional[str] = None
    codigo_proveedor: Optional[str] = None

class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    marca: Optional[str] = None
    unidad: Optional[str] = None
    precio_venta: Optional[float] = None
    costo_prom: Optional[float] = None
    saldo_temp: Optional[int] = None
    pro1: Optional[str] = None
    pro2: Optional[str] = None
    pro3: Optional[str] = None
    codigo_proveedor: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {"status": "ok", "supabase_connected": supabase is not None}

# ENDPOINT OBTENER PRODUCTOS (Filtrado forzado en backend por Proveedor 319)
@app.get("/api/productos")
def get_productos(contacto: str = "319"):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase no está configurado")
    
    try:
        response = supabase.table("productos").select("*").execute()
        todos = response.data or []
        
        if not contacto:
            return todos

        # Filtrado estricto en el backend Python por pro1, pro2, pro3 o contacto
        filtrados = [
            p for p in todos
            if str(p.get("pro1", "")) == str(contacto)
            or str(p.get("pro2", "")) == str(contacto)
            or str(p.get("pro3", "")) == str(contacto)
            or str(p.get("contacto", "")) == str(contacto)
        ]
        
        return filtrados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/productos")
def create_producto(producto: ProductoCreate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase no está configurado")
    
    try:
        data = producto.dict(exclude_unset=True)
        response = supabase.table("productos").insert(data).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/productos/{producto_id}")
def update_producto(producto_id: int, producto: ProductoUpdate):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase no está configurado")
    
    try:
        data = producto.dict(exclude_unset=True)
        response = supabase.table("productos").update(data).eq("id", producto_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/productos/{producto_id}")
def delete_producto(producto_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase no está configurado")
    
    try:
        response = supabase.table("productos").delete().eq("id", producto_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Servir archivos estáticos del frontend
if os.path.exists("web"):
    app.mount("/web", StaticFiles(directory="web", html=True), name="web")