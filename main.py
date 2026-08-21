from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncpg

app = FastAPI()

# ============================================================
#  CONEXIÓN A BASE DE DATOS
# ============================================================

async def get_db():
    return await asyncpg.connect(
        user="postgres",
        password="postgres",
        database="postgres",
        host="localhost"
    )

# ============================================================
#  CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
#  CLIENTES (CONTACTOS)
# ============================================================

@app.get("/clientes")
async def get_clientes(nombre: str = ""):
    db = await get_db()

    query = """
        SELECT
            id,
            nombre,
            razon_social,
            telefono1,
            email,
            categoria
        FROM public.clientes
        WHERE nombre ILIKE '%' || $1 || '%'
        ORDER BY nombre ASC
    """

    rows = await db.fetch(query, nombre)
    await db.close()

    return {
        "data": [
            {
                "id": r["id"],
                "nombre": r["nombre"],
                "empresa": r["razon_social"],
                "telefono": r["telefono1"],
                "email": r["email"],
                "tipo": r["categoria"]
            }
            for r in rows
        ]
    }


@app.get("/clientes/{id}")
async def get_cliente(id: int):
    db = await get_db()

    query = """
        SELECT
            id,
            nombre,
            razon_social,
            telefono1,
            email,
            categoria
        FROM public.clientes
        WHERE id = $1
    """

    r = await db.fetchrow(query, id)
    await db.close()

    if not r:
        return {"error": "No existe"}

    return {
        "id": r["id"],
        "nombre": r["nombre"],
        "empresa": r["razon_social"],
        "telefono": r["telefono1"],
        "email": r["email"],
        "tipo": r["categoria"]
    }


@app.post("/clientes")
async def crear_cliente(data: dict):
    db = await get_db()

    query = """
        INSERT INTO public.clientes
        (codigo_cliente, nombre, razon_social, telefono1, email, categoria)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    """

    new_id = await db.fetchval(
        query,
        data.get("codigo_cliente", ""),
        data.get("nombre", ""),
        data.get("empresa", ""),
        data.get("telefono", ""),
        data.get("email", ""),
        data.get("tipo", "")
    )

    await db.close()
    return {"id": new_id}


@app.put("/clientes/{id}")
async def actualizar_cliente(id: int, data: dict):
    db = await get_db()

    query = """
        UPDATE public.clientes
        SET nombre = $1,
            razon_social = $2,
            telefono1 = $3,
            email = $4,
            categoria = $5
        WHERE id = $6
    """

    await db.execute(
        query,
        data.get("nombre", ""),
        data.get("empresa", ""),
        data.get("telefono", ""),
        data.get("email", ""),
        data.get("tipo", ""),
        id
    )

    await db.close()
    return {"status": "ok"}


@app.delete("/clientes/{id}")
async def eliminar_cliente(id: int):
    db = await get_db()
    await db.execute("DELETE FROM public.clientes WHERE id = $1", id)
    await db.close()
    return {"status": "ok"}


# ============================================================
#  PRODUCTOS
# ============================================================

@app.get("/productos")
async def get_productos(
    descripcion: str = "",
    pagina: int = 1,
    porPagina: int = 20,
    ordenColumna: str = "descripcion",
    ordenDireccion: str = "asc"
):
    db = await get_db()

    # Sanitizar columnas permitidas
    columnas_validas = ["codigo", "descripcion", "marca", "proveedor", "stock", "precio"]
    if ordenColumna not in columnas_validas:
        ordenColumna = "descripcion"

    if ordenDireccion not in ["asc", "desc"]:
        ordenDireccion = "asc"

    offset = (pagina - 1) * porPagina

    query = f"""
        SELECT
            id,
            codigo,
            descripcion,
            marca,
            proveedor,
            stock,
            precio
        FROM public.productos
        WHERE descripcion ILIKE '%' || $1 || '%'
        ORDER BY {ordenColumna} {ordenDireccion}
        LIMIT $2 OFFSET $3
    """

    rows = await db.fetch(query, descripcion, porPagina, offset)

    total = await db.fetchval(
        "SELECT COUNT(*) FROM public.productos WHERE descripcion ILIKE '%' || $1 || '%'",
        descripcion
    )

    await db.close()

    totalPaginas = (total // porPagina) + (1 if total % porPagina else 0)

    return {
        "total": total,
        "totalPaginas": totalPaginas,
        "data": [
            {
                "id": r["id"],
                "codigo": r["codigo"],
                "descripcion": r["descripcion"],
                "marca": r["marca"],
                "proveedor": r["proveedor"],
                "stock": r["stock"],
                "precio": r["precio"]
            }
            for r in rows
        ]
    }


@app.get("/productos/{id}")
async def get_producto(id: int):
    db = await get_db()

    r = await db.fetchrow(
        """
        SELECT id, codigo, descripcion, marca, proveedor, stock, precio
        FROM public.productos
        WHERE id = $1
        """,
        id
    )

    await db.close()

    if not r:
        return {"error": "No existe"}

    return dict(r)


@app.post("/productos")
async def crear_producto(data: dict):
    db = await get_db()

    query = """
        INSERT INTO public.productos
        (codigo, descripcion, marca, proveedor, stock, precio)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    """

    new_id = await db.fetchval(
        query,
        data.get("codigo", ""),
        data.get("descripcion", ""),
        data.get("marca", ""),
        data.get("proveedor", ""),
        data.get("stock", 0),
        data.get("precio", 0)
    )

    await db.close()
    return {"id": new_id}


@app.put("/productos/{id}")
async def actualizar_producto(id: int, data: dict):
    db = await get_db()

    query = """
        UPDATE public.productos
        SET codigo = $1,
            descripcion = $2,
            marca = $3,
            proveedor = $4,
            stock = $5,
            precio = $6
        WHERE id = $7
    """

    await db.execute(
        query,
        data.get("codigo", ""),
        data.get("descripcion", ""),
        data.get("marca", ""),
        data.get("proveedor", ""),
        data.get("stock", 0),
        data.get("precio", 0),
        id
    )

    await db.close()
    return {"status": "ok"}


@app.delete("/productos/{id}")
async def eliminar_producto(id: int):
    db = await get_db()
    await db.execute("DELETE FROM public.productos WHERE id = $1", id)
    await db.close()
    return {"status": "ok"}
