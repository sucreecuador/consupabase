# ENDPOINT OBTENER PRODUCTOS
@app.get("/api/productos")
def get_productos(
    contacto: Optional[str] = None,
    nombre: Optional[str] = None,
    marca: Optional[str] = None,
    codigo: Optional[str] = None
):
    if not supabase:
        raise HTTPException(
            status_code=500, 
            detail="Supabase no está configurado correctamente en las variables de entorno."
        )
    
    try:
        response = supabase.table("productos").select("*").execute()
        filtrados = response.data or []
        
        # Filtro por Código de Proveedor (Busca el número ÚNICAMENTE en pro1, pro2 o pro3)
        if contacto and contacto.strip():
            val_c = contacto.strip().lower()
            filtrados = [
                p for p in filtrados
                if val_c in str(p.get("pro1", "") or "").lower()
                or val_c in str(p.get("pro2", "") or "").lower()
                or val_c in str(p.get("pro3", "") or "").lower()
            ]

        # Filtro por Nombre / Descripción
        if nombre and nombre.strip():
            val_nom = nombre.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_nom in str(p.get("descripcion", "") or "").lower()
            ]

        # Filtro por Marca
        if marca and marca.strip():
            val_mar = marca.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_mar in str(p.get("marca", "") or "").lower()
            ]

        # Filtro por Código de producto
        if codigo and codigo.strip():
            val_cod = codigo.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_cod in str(p.get("codigo", "") or "").lower() 
                or val_cod in str(p.get("codigo_proveedor", "") or "").lower()
            ]
        
        return filtrados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))