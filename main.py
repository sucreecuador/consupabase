from fastapi import FastAPI, Query
from supabase import create_client, Client
import os

app = FastAPI()

# Configuración de cliente Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://tu-proyecto.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "tu-anon-key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Mapeo de columnas permitidas en el Frontend hacia la BD en Supabase
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

@app.get("/api/productos")
def listar_productos(
    pagina: int = Query(1, ge=1),
    porPagina: int = Query(20, ge=1, le=100),
    ordenColumna: str = Query('codigo'),
    ordenDireccion: str = Query('asc'),
    columnaFiltro: str = Query(None),
    valorFiltro: str = Query(None)
):
    try:
        # Validar y resolver columna de ordenación
        col_orden_bd = MAPEO_COLUMNAS.get(ordenColumna, 'codigo')
        es_ascendente = (ordenDireccion.lower() == 'asc')

        # Iniciar consulta base a la tabla productos
        query = supabase.table('productos').select('*', count='exact')

        # Aplicar filtro de búsqueda si existe
        if columnaFiltro and valorFiltro:
            col_filtro_bd = MAPEO_COLUMNAS.get(columnaFiltro, 'descripcion')
            query = query.ilike(col_filtro_bd, f"%{valorFiltro}%")

        # 1. ORDENAR TODA LA BASE DE DATOS
        query = query.order(col_orden_bd, desc=not es_ascendente)

        # 2. APLICAR PAGINACIÓN DE LOS RESULTADOS YA ORDENADOS
        inicio = (pagina - 1) * porPagina
        fin = inicio + porPagina - 1
        query = query.range(inicio, fin)

        # Ejecutar consulta
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