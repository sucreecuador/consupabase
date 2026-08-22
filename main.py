from fastapi import FastAPI, Query
from typing import Optional

@app.get("/api/productos")
def listar_productos(
    pagina: int = 1,
    porPagina: int = 20,
    ordenColumna: str = "codigo",
    ordenDireccion: str = "asc",
    columnaFiltro: Optional[str] = None,
    valorFiltro: Optional[str] = None,
    # Compatibilidad con parametro anterior
    descripcion: Optional[str] = None 
):
    offset = (pagina - 1) * porPagina

    # Diccionario de columnas
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

    query = supabase.table("productos").select("*", count="exact")

    # 1. Determinar el texto de búsqueda y la columna destino
    texto_buscar = ""
    col_destino = "descripcion"

    if valorFiltro and valorFiltro.strip():
        texto_buscar = valorFiltro.strip()
        col_destino = columnas_permitidas.get(columnaFiltro, "descripcion")
    elif descripcion and descripcion.strip():
        texto_buscar = descripcion.strip()
        col_destino = "descripcion"

    # 2. Aplicar el filtro en Supabase con ilike o eq
    if texto_buscar:
        # Si la columna es numérica (como pro1, saldos o pvp), usamos un filtro de texto cast o ilike
        if col_destino in ["pro1", "saldo_uio", "saldo_gye", "saldo_temp"]:
            # Intenta filtrar por coincidencia exacta o texto
            query = query.or_(f"{col_destino}.ilike.%{texto_buscar}%")
        else:
            query = query.ilike(col_destino, f"%{texto_buscar}%")

    # 3. Orden y Paginacion
    es_asc = (ordenDireccion == "asc")
    col_orden = columnas_permitidas.get(ordenColumna, "codigo")
    
    query = query.order(col_orden, desc=not es_asc).range(offset, offset + porPagina - 1)
    
    respuesta = query.execute()
    total_registros = respuesta.count or 0
    total_paginas = (total_registros + porPagina - 1) // porPagina if total_registros > 0 else 1

    return {
        "data": respuesta.data,
        "total": total_registros,
        "pagina": pagina,
        "totalPaginas": total_paginas
    }