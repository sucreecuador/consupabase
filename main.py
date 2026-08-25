import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client

app = FastAPI(title="ERP SUCRE API")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialización de Supabase con variables de entorno
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Error inicializando Supabase: {e}")

# Esquemas de datos para Creación y Edición
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

# Redirección de la raíz '/' a la vista de productos
@app.get("/")
def read_root():
    return RedirectResponse(url="/web/productos/productos.html")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "supabase_connected": supabase is not None}

# ENDPOINT OBTENER PRODUCTOS (Filtros opcionales)
@app.get("/api/productos")
def get_productos(
    contacto: Optional[str] = None,
    nombre: Optional[str] = None,
    marca: Optional[str] = None,
    codigo: Optional[str] = None
):
    if not supabase:
        raise HTTPException(
            status_code=500, 
            detail="Supabase no está configurado correctamente en las variables de entorno."
        )
    
    try:
        response = supabase.table("productos").select("*").execute()
        filtrados = response.data or []
        
        # Filtro por Proveedor / Contacto
        if contacto and contacto.strip():
            val_c = contacto.strip()
            filtrados = [
                p for p in filtrados
                if str(p.get("pro1", "")) == val_c
                or str(p.get("pro2", "")) == val_c
                or str(p.get("pro3", "")) == val_c
                or str(p.get("contacto", "")) == val_c
            ]

        # Filtro por Nombre / Descripción
        if nombre and nombre.strip():
            val_nom = nombre.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_nom in str(p.get("descripcion", "")).lower()
            ]

        # Filtro por Marca
        if marca and marca.strip():
            val_mar = marca.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_mar in str(p.get("marca", "")).lower()
            ]

        # Filtro por Código de producto o proveedor
        if codigo and codigo.strip():
            val_cod = codigo.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_cod in str(p.get("codigo", "")).lower() 
                or val_cod in str(p.get("codigo_proveedor", "")).lower()
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

# Servir archivos estáticos de la carpeta web
if os.path.exists("web"):
    app.mount("/web", StaticFiles(directory="web", html=True), name="web")