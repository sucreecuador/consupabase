from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from supabase import create_client, Client

SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="API ERP SUCRE")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClienteModel(BaseModel):
    codigo_cliente: str
    categoria: Optional[str] = None
    nombre: Optional[str] = None
    razon_social: Optional[str] = None
    ruc: Optional[str] = None
    ciudad: Optional[str] = None
    direccion: Optional[str] = None
    telefono1: Optional[str] = None
    telefono2: Optional[str] = None
    telefono3: Optional[str] = None
    email: Optional[str] = None
    transporte: Optional[str] = None
    banco_datos_pago: Optional[str] = None
    coment_c: Optional[str] = None
    necesi_c: Optional[str] = None
    fecnac_c: Optional[str] = None
    fecha_nacimiento: Optional[str] = None

@app.get("/clientes")
def obtener_clientes():
    try:
        res = supabase.table("clientes").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/clientes/{codigo}")
def obtener_cliente(codigo: str):
    try:
        res = supabase.table("clientes").select("*").eq("codigo_cliente", codigo).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/clientes/{codigo}")
def actualizar_cliente(codigo: str, cliente: ClienteModel):
    try:
        data = cliente.dict(exclude_unset=True)
        res = supabase.table("clientes").upsert(data, on_conflict="codigo_cliente").execute()
        return {"mensaje": "Cliente actualizado exitosamente", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/clientes/{codigo}")
def eliminar_cliente(codigo: str):
    try:
        res = supabase.table("clientes").delete().eq("codigo_cliente", codigo).execute()
        return {"mensaje": "Cliente eliminado exitosamente", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))