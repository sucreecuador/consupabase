from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
import os

app = FastAPI(title="ERP Sucre API")

# Configuración de cliente Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://tu-proyecto.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "tu-anon-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Mapeo de columnas del Frontend a campos en la base de datos Supabase
MAPEO_COLUMNAS = {
    'codigo': 'codigo',
    'naci': 'naci',
    'marca': 'marca',
    'descripcion': 'descripcion',
    'unidad': 'unidad',
    'precio_venta': 'precio_venta',
    'saldo_temp': 'saldo_temp',
    'codigo_proveedor': 'codigo_proveedor',
    'saldo': 'saldo',
    'costo_prom': 'costo_prom',
    'pro1': 'pro1'
}

# Endpoint principal de consulta de productos (Soporta /api/productos y /api/productos/)
@app.get("/api/productos")
@app.get("/api/productos/")
def listar_productos(
    pagina: int = Query(1, ge=1),
    porPagina: int = Query(20, ge=1, le=100),
    ordenColumna: str = Query('codigo'),
    ordenDireccion: str = Query('asc'),
    columnaFiltro: str = Query(None),
    valorFiltro: str = Query(None)
):
    try:
        col_orden_bd = MAPEO_COLUMNAS.get(ordenColumna, 'codigo')
        es_ascendente = (ordenDireccion.lower() == 'asc')

        query = supabase.table('productos').select('*', count='exact')

        if columnaFiltro and valorFiltro:
            col_filtro_bd = MAPEO_COLUMNAS.get(columnaFiltro, 'descripcion')
            query = query.ilike(col_filtro_bd, f"%{valorFiltro}%")

        # Ordenar toda la base de datos en Supabase
        query = query.order(col_orden_bd, desc=not es_ascendente)

        # Paginar resultados
        inicio = (pagina - 1) * porPagina
        fin = inicio + porPagina - 1
        query = query.range(inicio, fin)

        respuesta = query.execute()

        total_registros = respuesta.count if respuesta.count is not None else 0
        total_paginas = (total_registros + porPagina - 1) // porPagina if total_registros > 0 else 1

        return {
            "data": respuesta.data,
            "totalRegistros": total_registros,
            "totalPaginas": total_paginas,
            "paginaActual": pagina
        }

    except Exception as e:
        return {"data": [], "totalRegistros": 0, "totalPaginas": 1, "error": str(e)}

# Endpoint de actualización
@app.put("/api/productos/{codigo}")
@app.put("/api/productos/{codigo}/")
def actualizar_producto(codigo: str, datos: dict):
    try:
        respuesta = supabase.table('productos').update(datos).eq('codigo', codigo).execute()
        return {"status": "ok", "data": respuesta.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Endpoint de eliminación
@app.delete("/api/productos/{codigo}")
@app.delete("/api/productos/{codigo}/")
def eliminar_producto(codigo: str):
    try:
        respuesta = supabase.table('productos').delete().eq('codigo', codigo).execute()
        return {"status": "ok", "data": respuesta.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Servir archivos estáticos del Frontend
if os.path.exists("web"):
    app.mount("/static", StaticFiles(directory="web"), name="static")

    @app.get("/")
    def read_root():
        return FileResponse("web/index.html")

    @app.get("/{file_name}")
    def read_static_file(file_name: str):
        file_path = os.path.join("web", file_name)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        raise HTTPException(status_code=404, detail="Archivo no encontrado")