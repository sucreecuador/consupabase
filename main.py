import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from supabase import create_client, Client

# Inicialización de la app FastAPI
app = FastAPI(title="ERP Sucre API")

# Configuración de cliente Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://tu-proyecto.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "tu-anon-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Columnas de texto permitidas para la operación .ilike()
COLUMNAS_TEXTO = {
    "codigo", "codigo_proveedor", "naci", "marca", 
    "descripcion", "unidad", "pro1", "pro2", "pro3"
}

# Redirección automática de la raíz a la interfaz web
@app.get("/")
def read_root():
    return RedirectResponse(url="/web/index.html")

# Endpoint principal para listar y filtrar productos
@app.get("/api/productos")
def listar_productos(
    pagina: int = Query(1, ge=1),
    porPagina: int = Query(20, ge=1, le=100),
    ordenColumna: str = "codigo",
    ordenDireccion: str = "asc",
    columnaFiltro: Optional[str] = None,
    valorFiltro: Optional[str] = None
):
    query = supabase.table("productos").select("*", count="exact")
    
    # Filtrar solo si hay un valor ingresado y la columna es de tipo texto
    if columnaFiltro and valorFiltro and valorFiltro.strip() != "":
        col = columnaFiltro.lower()
        if col in COLUMNAS_TEXTO:
            query = query.ilike(col, f"%{valorFiltro.strip()}%")

    # Paginación
    inicio = (pagina - 1) * porPagina
    fin = inicio + porPagina - 1
    
    # Ordenamiento seguro
    col_order = ordenColumna.lower() if ordenColumna.lower() in COLUMNAS_TEXTO else "codigo"
    query = query.order(col_order, desc=(ordenDireccion.lower() == "desc"))
    query = query.range(inicio, fin)
    
    res = query.execute()
    
    total = res.count if res.count else 0
    total_paginas = (total // porPagina) + (1 if total % porPagina > 0 else 0)
    
    return {
        "data": res.data,
        "totalPaginas": total_paginas or 1
    }

# Endpoint para actualizar un producto existente
@app.put("/api/productos/{codigo}")
def actualizar_producto(codigo: str, datos: dict):
    try:
        res = supabase.table("productos").update(datos).eq("codigo", codigo).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint para eliminar un producto
@app.delete("/api/productos/{codigo}")
def eliminar_producto(codigo: str):
    try:
        res = supabase.table("productos").delete().eq("codigo", codigo).execute()
        return {"status": "deleted", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Montar carpeta pública de frontend al final
app.mount("/web", StaticFiles(directory="web", html=True), name="web")