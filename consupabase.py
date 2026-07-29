from supabase import create_client, Client
from tabulate import tabulate
import sys

# ============================================================
# CONFIGURACIÓN SUPABASE
# ============================================================

SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ============================================================
# CAMPOS QUE MOSTRAREMOS (para limpiar la tabla)
# ============================================================

CAMPOS = [
    "codigo",
    "marca",
    "descripcion",
    "precio_venta",
    "precio_anterior",
    "costo_prom",
    "saldo",
    "ubicacion",
    "codigo_barra",
]


# ============================================================
# FUNCIONES DE CONSULTA
# ============================================================

def obtener_todos():
    try:
        res = supabase.table("productos").select(",".join(CAMPOS)).execute()
        return res.data
    except Exception as e:
        print(f"\n❌ Error al consultar TODOS: {e}\n")
        return []


def buscar_por_descripcion(texto: str):
    try:
        res = (
            supabase.table("productos")
            .select(",".join(CAMPOS))
            .ilike("descripcion", f"%{texto}%")
            .execute()
        )
        return res.data
    except Exception as e:
        print(f"\n❌ Error al consultar por descripción: {e}\n")
        return []


def buscar_por_codigo(codigo: str):
    try:
        res = (
            supabase.table("productos")
            .select(",".join(CAMPOS))
            .eq("codigo", codigo)
            .execute()
        )
        return res.data
    except Exception as e:
        print(f"\n❌ Error al consultar por código: {e}\n")
        return []


def buscar_por_marca(marca: str):
    try:
        res = (
            supabase.table("productos")
            .select(",".join(CAMPOS))
            .ilike("marca", f"%{marca}%")
            .execute()
        )
        return res.data
    except Exception as e:
        print(f"\n❌ Error al consultar por marca: {e}\n")
        return []


# ============================================================
# FORMATO TABLA
# ============================================================

def mostrar_tabla(data):
    if not data:
        print("\n⚠ No se encontraron resultados.\n")
        return

    print("\n")
    print(tabulate(data, headers="keys", tablefmt="fancy_grid"))
    print("\n")


# ============================================================
# MENÚ INTERACTIVO
# ============================================================

def menu():
    while True:
        print("\n=== CONSULTA PRODUCTO ===")
        print("1. TODOS")
        print("2. POR DESCRIPCIÓN")
        print("3. POR CÓDIGO")
        print("4. POR MARCA")
        print("0. SALIR")

        opcion = input("\nSeleccione una opción: ").strip()

        if opcion == "1":
            mostrar_tabla(obtener_todos())

        elif opcion == "2":
            texto = input("Ingrese parte de la descripción: ").strip()
            mostrar_tabla(buscar_por_descripcion(texto))

        elif opcion == "3":
            codigo = input("Ingrese código exacto: ").strip()
            mostrar_tabla(buscar_por_codigo(codigo))

        elif opcion == "4":
            marca = input("Ingrese marca: ").strip()
            mostrar_tabla(buscar_por_marca(marca))

        elif opcion == "0":
            print("\nSaliendo...\n")
            sys.exit()

        else:
            print("\n⚠ Opción inválida.\n")


# ============================================================
# INICIO
# ============================================================

if __name__ == "__main__":
    menu()
