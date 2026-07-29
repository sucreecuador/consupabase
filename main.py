@app.get("/contactos")
def get_contactos(
    page: int = 0,
    page_size: int = 50,
    nombre: Optional[str] = None,
    ruc: Optional[str] = None
):
    try:
        query = supabase.table("clientes").select("*", count="exact")
        
        if nombre:
            query = query.ilike("nombre", f"%{nombre}%")
        if ruc:
            query = query.ilike("ruc", f"%{ruc}%")
            
        start = page * page_size
        end = start + page_size - 1
        
        response = query.range(start, end).execute()
        
        total_records = response.count if hasattr(response, 'count') and response.count is not None else len(response.data)
        total_pages = math.ceil(total_records / page_size) if page_size > 0 else 1
        
        return {
            "data": response.data,
            "total_records": total_records,
            "total_pages": total_pages,
            "current_page": page
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))