COLUMNAS_TEXTO = ["codigo", "codigo_proveedor", "naci", "marca", "descripcion", "unidad", "pro1", "pro2", "pro3"]

@app.get("/api/productos")
def listar_productos(
    pagina: int = 1,
    porPagina: int = 20,
    ordenColumna: str = "codigo",
    ordenDireccion: str = "asc",
    columnaFiltro: str = None,
    valorFiltro: str = None
):
    query = supabase.table("productos").select("*", count="exact")
    
    # Solo filtrar por columnas tipo texto para evitar errores de tipo de dato
    if columnaFiltro and valorFiltro and columnaFiltro.lower() in COLUMNAS_TEXTO:
        query = query.ilike(columnaFiltro.lower(), f"%{valorFiltro}%")
        
    inicio = (pagina - 1) * porPagina
    fin = inicio + porPagina - 1
    
    query = query.order(ordenColumna, desc=(ordenDireccion == "desc"))
    query = query.range(inicio, fin)
    
    res = query.execute()
    return {
        "data": res.data,
        "totalPaginas": (res.count // porPagina) + (1 if res.count % porPagina > 0 else 0)
    }