# ENDPOINT OBTENER PRODUCTOS (Carga total de registros sin límite y filtro robusto pro1/pro2/pro3)
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
        # 1. Cargar TODOS los registros de Supabase paginando de 1000 en 1000
        todos_los_productos = []
        offset = 0
        limit = 1000
        
        while True:
            response = supabase.table("productos").select("*").range(offset, offset + limit - 1).execute()
            data = response.data or []
            todos_los_productos.extend(data)
            if len(data) < limit:
                break
            offset += limit

        filtrados = todos_los_productos

        # 2. Filtro por Contacto / Proveedor (Busca el número ÚNICAMENTE en pro1, pro2 o pro3)
        if contacto and contacto.strip():
            val_c = contacto.strip().lower()
            
            def coincide_pro(val):
                if val is None:
                    return False
                # Limpiar texto (convertir float/int a string limpio, ej: 319.0 -> 319)
                str_val = str(val).strip().lower()
                if str_val.endswith(".0"):
                    str_val = str_val[:-2]
                return val_c in str_val

            filtrados = [
                p for p in filtrados
                if coincide_pro(p.get("pro1")) 
                or coincide_pro(p.get("pro2")) 
                or coincide_pro(p.get("pro3"))
            ]

        # 3. Filtro por Nombre / Descripción
        if nombre and nombre.strip():
            val_nom = nombre.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_nom in str(p.get("descripcion", "") or "").lower()
            ]

        # 4. Filtro por Marca
        if marca and marca.strip():
            val_mar = marca.strip().lower()
            filtrados = [
                p for p in filtrados 
                if val_mar in str(p.get("marca", "") or "").lower()
            ]

        # 5. Filtro por Código de producto
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