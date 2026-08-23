import os
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# ------------------------------------------------------------------
# CONFIGURACIÓN DE SUPABASE Y FASTAPI
# ------------------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    # Asegúrate de tener configuradas las variables de entorno en Render
    print("WARNING: SUPABASE_URL o SUPABASE_KEY no están definidas.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(
    title="API ERP Sucre",
    description="Sistema de gestión de productos e inventario",
    version="1.0.0"
)

# Permitir solicitudes CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# ENDPOINT PRINCIPAL DE PRODUCTOS
# ------------------------------------------------------------------
@app.get("/api/productos")
def listar_productos(
    pagina: int = Query(1, ge=1),
    porPagina: int = Query(20, ge=1, le=100),
    ordenColumna: str = Query("codigo"),
    ordenDireccion: str = Query("asc"),
    columnaFiltro: Optional[str] = Query(None),
    valorFiltro: Optional[str] = Query(None),
    descripcion: Optional[str] = Query(None) # Compatibilidad con versión previa
):
    offset = (pagina - 1) * porPagina

    # Mapeo de columnas permitidas para evitar Inyección SQL / Errores
    columnas_permitidas = {
        "codigo": "codigo",
        "codigo_proveedor": "codigo_proveedor",
        "descripcion": "descripcion",
        "naci": "naci",
        "marca": "marca",
        "uni": "uni",
        "pvp": "pvp",
        "saldo_temp": "saldo_temp",
        "saldo_uio": "saldo_uio",
        "saldo_gye": "saldo_gye",
        "costo_prom": "costo_prom",
        "pro1": "pro1"
    }

    # Definir columna de ordenamiento válida
    col_orden = columnas_permitidas.get(ordenColumna, "codigo")
    es_asc = (ordenDireccion.lower() == "asc")

    # Iniciar consulta
    query = supabase.table("productos").select("*", count="exact")

    # Determinar parámetro de búsqueda
    texto_buscar = ""
    col_buscar = "descripcion"

    if valorFiltro and valorFiltro.strip():
        texto_buscar = valorFiltro.strip()
        col_buscar = columnas_permitidas.get(columnaFiltro, "descripcion")
    elif descripcion and descripcion.strip():
        texto_buscar = descripcion.strip()
        col_buscar = "descripcion"

    # Aplicar Filtro en Supabase
    if texto_buscar:
        # PostgreSQL / Supabase requiere castear a texto si la columna es numérica o float
        if col_buscar in ["pro1", "saldo_uio", "saldo_gye", "saldo_temp", "pvp", "costo_prom"]:
            # Filtro por ilike utilizando casteo implícito a string
            query = query.filter(col_buscar, "like", f"%{texto_buscar}%")
        else:
            query = query.ilike(col_buscar, f"%{texto_buscar}%")

    # Aplicar Orden y Paginación
    query = query.order(col_orden, desc=not es_asc).range(offset, offset + porPagina - 1)

    try:
        respuesta = query.execute()
        total_registros = respuesta.count if respuesta.count is not None else 0
        total_paginas = (total_registros + porPagina - 1) // porPagina if total_registros > 0 else 1

        return {
            "data": respuesta.data,
            "total": total_registros,
            "pagina": pagina,
            "totalPaginas": total_paginas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la consulta a la BD: {str(e)}")

# ------------------------------------------------------------------
# ARCHIVOS ESTÁTICOS Y RUTA RAÍZ
# ------------------------------------------------------------------
# Servir la carpeta 'web' para el HTML/JS/CSS frontend
if os.path.exists("web"):
    app.mount("/web", StaticFiles(directory="web", html=True), name="web")

@app.get("/")
def read_root():
    return {"status": "API Online", "docs": "/docs"}