from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

# Modelo Pydantic para los datos de la empresa
class EmpresaConfig(BaseModel):
    nombre_comercial: str
    ruc: str
    direccion: str
    telefono: str

# ENDPOINT: OBTENER CONFIGURACIÓN
@app.get("/api/configuracion/empresa")
async def obtener_configuracion_empresa():
    try:
        response = supabase.table("configuracion_empresa").select("*").limit(1).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ENDPOINT: GUARDAR CONFIGURACIÓN
@app.post("/api/configuracion/empresa")
async def guardar_configuracion_empresa(config: EmpresaConfig):
    try:
        payload = {
            "id": 1,  # ID único de configuración general
            "nombre_comercial": config.nombre_comercial,
            "ruc": config.ruc,
            "direccion": config.direccion,
            "telefono": config.telefono
        }
        # Realiza upsert en Supabase
        response = supabase.table("configuracion_empresa").upsert(payload).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))