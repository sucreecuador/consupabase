import io
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import pandas as pd

# Asegúrate de mantener la inicialización existente de tu app de FastAPI y de Supabase arriba:
# app = FastAPI()
# supabase = ...

# =========================================================
# ENDPOINT: OBTENER PRODUCTOS (JSON)
# =========================================================
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
        # Cargar todos los registros paginando en bloques de 1000
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

        # Filtro por Contacto / Proveedor (revisa PRO1, PRO2 y PRO3)
        if contacto and contacto.strip():
            val_c = contacto.strip().lower()
            
            def coincide_pro(val):
                if val is None:
                    return False
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

        # Filtro por Código
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


# =========================================================
# ENDPOINT: EXPORTAR PRODUCTOS POR PROVEEDOR A EXCEL
# =========================================================
@app.get("/api/productos/exportar-excel")
def exportar_excel_proveedor(contacto: str):
    if not supabase:
        raise HTTPException(
            status_code=500, 
            detail="Supabase no está configurado correctamente en las variables de entorno."
        )
    
    try:
        # Cargar todos los registros sin límite
        todos = []
        offset = 0
        limit = 1000
        while True:
            res = supabase.table("productos").select("*").range(offset, offset + limit - 1).execute()
            data = res.data or []
            todos.extend(data)
            if len(data) < limit:
                break
            offset += limit

        val_c = contacto.strip().lower()

        def coincide_pro(val):
            if val is None:
                return False
            str_val = str(val).strip().lower()
            if str_val.endswith(".0"):
                str_val = str_val[:-2]
            return val_c in str_val

        filtrados = [
            p for p in todos
            if coincide_pro(p.get("pro1"))
            or coincide_pro(p.get("pro2"))
            or coincide_pro(p.get("pro3"))
        ]

        if not filtrados:
            raise HTTPException(
                status_code=404, 
                detail="No se encontraron productos para ese código de proveedor."
            )

        # Convertir a DataFrame de Pandas
        df = pd.DataFrame(filtrados)

        # Mapeo de columnas según la estructura del ERP
        columnas_map = {
            "pro1": "PRO1",
            "pro2": "PRO2",
            "pro3": "PRO3",
            "codigo_proveedor": "CÓD. PROV.",
            "codigo": "CÓDIGO",
            "marca": "MARCA",
            "descripcion": "DESCRIPCIÓN",
            "stock_total": "S.TEM",
            "costo": "COSTO",
            "precio_venta": "P.VENTA"
        }

        df = df.rename(columns=columnas_map)

        # Seleccionar únicamente las columnas especificadas si existen
        cols_existentes = [c for c in columnas_map.values() if c in df.columns]
        if cols_existentes:
            df = df[cols_existentes]

        # Generar el archivo Excel en memoria
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name="Productos_Proveedor")
        output.seek(0)

        headers = {
            'Content-Disposition': f'attachment; filename="productos_proveedor_{contacto}.xlsx"'
        }
        return StreamingResponse(
            output, 
            headers=headers, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))