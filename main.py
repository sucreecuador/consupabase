# ENDPOINT OBTENER PRODUCTOS (Filtros opcionales avanzados)
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
        
        # Filtro por Proveedor/Contacto si se especifica en el input
        if contacto and contacto.strip():
            valor_c = contacto.strip()
            filtrados = [
                p for p in filtrados
                if str(p.get("pro1", "")) == valor_c
                or str(p.get("pro2", "")) == valor_c
                or str(p.get("pro3", "")) == valor_c
                or str(p.get("contacto", "")) == valor_c
            ]

        # Filtro por Nombre / Descripción
        if nombre and nombre.strip():
            val_nom = nombre.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_nom in str(p.get("descripcion", "")).lower()
            ]

        # Filtro por Marca
        if marca and marca.strip():
            val_mar = marca.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_mar in str(p.get("marca", "")).lower()
            ]

        # Filtro por Código de producto o proveedor
        if codigo and codigo.strip():
            val_cod = codigo.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_cod in str(p.get("codigo", "")).lower() 
                or val_cod in str(p.get("codigo_proveedor", "")).lower()
            ]
        
        return filtrados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))