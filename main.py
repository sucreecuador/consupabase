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
    
    # Aplicar filtro solo si hay un valor ingresado
    if columnaFiltro and valorFiltro:
        query = query.ilike(columnaFiltro, f"%{valorFiltro}%")
        
    # Paginación y orden
    inicio = (pagina - 1) * porPagina
    fin = inicio + porPagina - 1
    
    query = query.order(ordenColumna, desc=(ordenDireccion == "desc"))
    query = query.range(inicio, fin)
    
    res = query.execute()
    return {
        "data": res.data,
        "totalPaginas": (res.count // porPagina) + (1 if res.count % porPagina > 0 else 0)
    }