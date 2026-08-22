from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os

app = FastAPI(title="ERP Sucre API")

# Endpoint para obtener productos desde la base de datos (Supabase)
@app.get("/api/productos")
async def obtener_productos(
    descripcion: str = Query("", alias="descripcion"),
    pagina: int = Query(1, alias="pagina"),
    por_pagina: int = Query(20, alias="porPagina"),
    orden_columna: str = Query("descripcion", alias="ordenColumna"),
    orden_direccion: str = Query("asc", alias="ordenDireccion")
):
    # AQUÍ MANTIENES TU LÓGICA DE CONSULTA A SUPABASE
    # Ejemplo de estructura de retorno esperada por la tabla:
    return {
        "data": [],
        "totalPaginas": 1
    }

# Montar frontend web
if os.path.exists("web"):
    app.mount("/web", StaticFiles(directory="web", html=True), name="web")

@app.get("/")
def read_root():
    return RedirectResponse(url="/web/productos/index.html")