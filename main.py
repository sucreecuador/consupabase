from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import math
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL", "TU_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY", "TU_SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/productos")
def get_productos(
    page: int = 0,
    page_size: int = 50,
    descripcion: Optional[str] = None,
    codigo: Optional[str] = None,
    marca: Optional[str] = None,
    proveedor: Optional[str] = None
):
    try:
        query = supabase.table("productos").select("*", count="exact")
        
        if descripcion:
            query = query.ilike("descripcion", f"%{descripcion}%")
        if codigo:
            query = query.ilike("codigo", f"%{codigo}%")
        if marca:
            query = query.ilike("marca", f"%{marca}%")
        if proveedor:
            query = query.ilike("proveedor", f"%{proveedor}%")
            
        start = page * page_size
        end = start + page_size - 1
        
        response = query.range(start, end).execute()
        
        total_records = response.count if hasattr(response, 'count') and response.count is not None else len(response.data)
        total_pages = math.ceil(total_records / page_size) if page_size > 0 else 1
        
        return {
            "data": response.data,
            "total_records": total_records,
            "total_pages": total_pages,
            "current_page": page
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/contactos")
def get_contactos(
    page: int = 0,
    page_size: int = 50,
    nombre: Optional[str] = None,
    ruc: Optional[str] = None
):
    try:
        query = supabase.table("clientes").select("*", count="exact")
        
        if nombre:
            query = query.ilike("nombre", f"%{nombre}%")
        if ruc:
            query = query.ilike("ruc", f"%{ruc}%")
            
        start = page * page_size
        end = start + page_size - 1
        
        response = query.range(start, end).execute()
        
        total_records = response.count if hasattr(response, 'count') and response.count is not None else len(response.data)
        total_pages = math.ceil(total_records / page_size) if page_size > 0 else 1
        
        return {
            "data": response.data,
            "total_records": total_records,
            "total_pages": total_pages,
            "current_page": page
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))