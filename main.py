# main.py
import io
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from starlette.responses import Response
import pandas as pd

app = FastAPI(title="ERP SUCRE - Sistema de Gestión")


# ==========================================
# 1. DESACTIVAR CACHÉ DE ARCHIVOS ESTÁTICOS
# ==========================================
class NoCacheStaticFiles(StaticFiles):
    """
    Desactiva las respuestas 304 Not Modified y fuerza encabezados Cache-Control
    para asegurar que Render y los navegadores recarguen siempre los archivos más recientes.
    """
    def is_not_modified(self, response_headers, request_headers) -> bool:
        return False

    def file_response(self, *args, **kwargs) -> Response:
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response


# Montar la carpeta /web usando NoCacheStaticFiles
app.mount("/web", NoCacheStaticFiles(directory="web", html=True), name="web")


# ==========================================
# Base de Datos de Ejemplo / Simulación
# ==========================================
# Nota: Reemplaza este arreglo con la llamada a tu base de datos Supabase / PostgreSQL / COBOL
DB_PRODUCTOS: List[Dict[str, Any]] = [
    {
        "id": 1, "pro1": 977, "pro2": 141, "pro3": 319, "cod_prov": "GUKINNL01",
        "codigo": "GNT333", "marca": "KINNED", "descripcion": "GUANTES KINNED 2 TALLA L AMARILLO",
        "s_tem": 19, "costo": 10.39, "precio_venta": 18.00
    },
    {
        "id": 2, "pro1": 319, "pro2": None, "pro3": None, "cod_prov": "ALUMINIO 10 AZUL",
        "codigo": "AIS010", "marca": "BOREALSNOW", "descripcion": "AISLANTE ALUMINIO 10 MM ELECTRICO",
        "s_tem": 0, "costo": 6.38, "precio_venta": 9.00
    },
    {
        "id": 3, "pro1": 319, "pro2": None, "pro3": None, "cod_prov": "ALUMINIO 10 NEGRO",
        "codigo": "AIS011", "marca": "BOREALSNOW", "descripcion": "AISLANTE ALUMINIO 10 MM NEGRO",
        "s_tem": 0, "costo": 6.38, "precio_venta": 9.00
    },
    {
        "id": 4, "pro1": 977, "pro2": 141, "pro3": 319, "cod_prov": "CARAI903",
        "codigo": "AIS005", "marca": "BOREALSNOW", "descripcion": "AISLANTE ALUMINIO 12 MM AZUL",
        "s_tem": 16, "costo": 6.75, "precio_venta": 10.00
    },
    {
        "id": 5, "pro1": 319, "pro2": None, "pro3": None, "cod_prov": "CARAI913",
        "codigo": "AIS015", "marca": "OUTDOOR", "descripcion": "AISLANTE ALUMINIO 12 MM NEGRO",
        "s_tem": 0, "costo": 6.75, "precio_venta": 10.00
    },
    {
        "id": 6, "pro1": 977, "pro2": 319, "pro3": None, "cod_prov": "CARAI922",
        "codigo": "AIS009", "marca": "BOREALSNOW", "descripcion": "AISLANTE ALUMINIO 12 MM VERDE",
        "s_tem": 94, "costo": 6.92, "precio_venta": 10.50
    },
    {
        "id": 7, "pro1": 319, "pro2": 319, "pro3": 977, "cod_prov": "ESPONJA 8 MM",
        "codigo": "AIS006", "marca": "BOREALSNOW", "descripcion": "AISLANTE ESPONJA COLOR 8 MM LIVIANO",
        "s_tem": 0, "costo": 5.25, "precio_venta": 8.00
    }
]


def filtrar_lista_productos(criterio: Optional[str], valor: Optional[str]) -> List[Dict[str, Any]]:
    """Filtra la lista de productos según el criterio y valor recibido."""
    if not criterio or not valor:
        return DB_PRODUCTOS

    val = valor.strip().lower()
    mapa_campos = {
        "nombre": "descripcion",
        "descripcion": "descripcion",
        "marca": "marca",
        "codigo": "codigo",
        "contacto": "cod_prov",
        "cod_prov": "cod_prov"
    }
    
    campo_real = mapa_campos.get(criterio.lower(), "descripcion")

    resultados = []
    for p in DB_PRODUCTOS:
        val_campo = str(p.get(campo_real, "") or "").lower()
        if val in val_campo:
            resultados.append(p)
    return resultados


# ==========================================
# 2. ENDPOINTS DE LA API
# ==========================================

@app.get("/api/productos")
def listar_productos(
    criterio: Optional[str] = Query(None),
    valor: Optional[str] = Query(None)
):
    """Retorna la lista de productos filtrada por un solo campo/criterio."""
    return filtrar_lista_productos(criterio, valor)


@app.get("/api/productos/exportar-excel")
def exportar_excel_productos(
    criterio: Optional[str] = Query(None),
    valor: Optional[str] = Query(None),
    vista: str = Query("ventas")
):
    """
    Genera un archivo Excel (.xlsx) estructurado dinámicamente según la vista activa:
    - 'ventas': Columnas orientadas a comercialización (Código, Marca, Descripción, Stock, Precio Venta).
    - 'compras': Columnas orientadas a abastecimiento (PRO1, PRO2, PRO3, Cód. Prov, Código, Marca, Descripción, Stock, Costo, Precio Venta).
    """
    productos = filtrar_lista_productos(criterio, valor)

    if not productos:
        raise HTTPException(status_code=404, detail="No hay productos que coincidan con los criterios para exportar.")

    filas_exportar = []
    for p in productos:
        costo = p.get("costo", 0.0)
        p_venta = p.get("precio_venta", 0.0)
        margen = p_venta - costo

        if vista.lower() == "ventas":
            filas_exportar.append({
                "CÓDIGO": p.get("codigo", ""),
                "MARCA": p.get("marca", ""),
                "DESCRIPCIÓN": p.get("descripcion", ""),
                "STOCK DISPONIBLE": p.get("s_tem", 0),
                "PRECIO DE VENTA ($)": p_venta,
                "MARGEN ESTIMADO ($)": round(margen, 2)
            })
        else:  # vista == 'compras'
            filas_exportar.append({
                "PRO1": p.get("pro1") if p.get("pro1") is not None else "—",
                "PRO2": p.get("pro2") if p.get("pro2") is not None else "—",
                "PRO3": p.get("pro3") if p.get("pro3") is not None else "—",
                "CÓD. PROVEEDOR": p.get("cod_prov", ""),
                "CÓDIGO": p.get("codigo", ""),
                "MARCA": p.get("marca", ""),
                "DESCRIPCIÓN": p.get("descripcion", ""),
                "STOCK (S.TEM)": p.get("s_tem", 0),
                "COSTO ($)": costo,
                "PRECIO VENTA ($)": p_venta
            })

    df = pd.DataFrame(filas_exportar)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        sheet_name = "Vista_Ventas" if vista.lower() == "ventas" else "Vista_Compras"
        df.to_excel(writer, sheet_name=sheet_name, index=False)

    output.seek(0)
    filename = f"reporte_productos_{vista.lower()}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )