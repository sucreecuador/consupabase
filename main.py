# main.py
import io
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from starlette.responses import Response
import pandas as pd

app = FastAPI(title="ERP SUCRE API")


# ==========================================
# 1. DESACTIVAR CACHÉ DE ARCHIVOS ESTÁTICOS
# ==========================================
class NoCacheStaticFiles(StaticFiles):
    """
    Desactiva las respuestas 304 Not Modified y fuerza encabezados
    Cache-Control para que los navegadores recarguen siempre la interfaz.
    """
    def is_not_modified(self, response_headers, request_headers) -> bool:
        return False

    def file_response(self, *args, **kwargs) -> Response:
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response


# Montar la carpeta /web usando la versión sin caché
app.mount("/web", NoCacheStaticFiles(directory="web", html=True), name="web")


# ==========================================
# 2. ENDPOINTS DE PRODUCTOS
# ==========================================

# Simulación / Consulta de productos (Reemplazar con tu consulta a la Base de Datos)
@app.get("/api/productos")
def listar_productos(
    nombre: Optional[str] = Query(None),
    marca: Optional[str] = Query(None),
    codigo: Optional[str] = Query(None),
    contacto: Optional[str] = Query(None)
):
    # Aquí va la consulta a tu base de datos Supabase / COBOL / PostgreSQL
    # Ejemplo de estructura de retorno
    return []


@app.get("/api/productos/exportar-excel")
def exportar_excel_proveedor(contacto: Optional[str] = Query(None)):
    """
    Genera y descarga un archivo Excel filtrado por el código de proveedor (ej. 319).
    """
    if not contacto:
        raise HTTPException(status_code=400, detail="Debe especificar un código de contacto/proveedor")

    # TODO: Obtener datos filtrados de tu base de datos por el campo contacto / cod_prov
    # Ejemplo de estructura para el DataFrame:
    datos_ejemplo = [
        {
            "PRO1": 793, "PRO2": None, "PRO3": None,
            "COD_PROV": contacto, "CODIGO": "BOM030", "MARCA": "AMBER",
            "DESCRIPCION": "BOMBA TALLER C/TANQUE HIERRO GRANDE",
            "STOCK": 0, "COSTO": 9.17, "PRECIO_VENTA": 13.00
        }
    ]

    df = pd.DataFrame(datos_ejemplo)

    # Crear el buffer binario en memoria
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Productos_Proveedor", index=False)

    output.seek(0)
    filename = f"productos_proveedor_{contacto}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )