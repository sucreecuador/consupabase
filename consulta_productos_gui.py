import tkinter as tk
from tkinter import ttk, messagebox
from supabase import create_client, Client

# ============================================================
# CONFIGURACIÓN SUPABASE
# ============================================================

SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================
# CAMPOS
# ============================================================

CAMPOS_VISTA1 = [
    "codigo",
    "codigo_proveedor",
    "marca",
    "descripcion",
    "precio_venta",
    "costo_prom",
    "saldo",
    "peso",
    "medidas"
]

CAMPOS_VISTA2 = [
    "codigo",
    "codigo_proveedor",
    "marca",
    "descripcion",
    "precio_venta",
    "costo_prom",
    "saldo",
    "saldo_bext",   # reemplaza PESO
    "saldo_temp"    # reemplaza MEDIDAS
]

CAMPOS = CAMPOS_VISTA1.copy()

# ============================================================
# VARIABLES GLOBALES
# ============================================================

PAGE_SIZE = 50
current_page = 0
current_filter = None
current_column = None
total_rows = 0

sort_column = None
sort_direction = "asc"

vista_actual = 1   # 1 = normal, 2 = saldos

tree = None


# ============================================================
# CONSULTA SUPABASE
# ============================================================

def consulta_supabase(page=0, filtro=None, columna=None):
    global total_rows, sort_column, sort_direction, vista_actual

    try:
        offset = page * PAGE_SIZE
        limit_end = offset + PAGE_SIZE - 1

        columnas = CAMPOS_VISTA1 if vista_actual == 1 else CAMPOS_VISTA2

        query = supabase.table("productos").select(",".join(columnas), count="exact")

        if filtro and columna:
            query = query.ilike(columna, f"{filtro}%")

        if sort_column:
            query = query.order(sort_column, desc=(sort_direction == "desc"))

        res = query.range(offset, limit_end).execute()

        total_rows = res.count
        return res.data

    except Exception as e:
        messagebox.showerror("Error", f"Error al consultar:\n{e}")
        return []


# ============================================================
# INTERFAZ GRÁFICA
# ============================================================

def crear_app():
    global current_page, current_filter, current_column, sort_column, sort_direction, vista_actual, CAMPOS, tree

    root = tk.Tk()
    root.title("Consulta de Productos - Sucre")
    root.geometry("1400x750")
    root.configure(bg="#f3f3f7")

    style = ttk.Style()
    style.theme_use("clam")

    # Estilo general de botones
    style.configure("TButton",
        background="#2563eb",
        foreground="#fff",
        padding=6,
        font=("Segoe UI", 10, "bold")
    )
    style.map("TButton",
        background=[("active", "#1d4ed8")]
    )

    # Estilo especial para botones Vista 1 y Vista 2
    style.configure("Vista.TButton",
        background="#facc15",   # AMARILLO
        foreground="#000",
        padding=6,
        font=("Segoe UI", 10, "bold")
    )
    style.map("Vista.TButton",
        background=[("active", "#eab308")]  # Amarillo más fuerte
    )

    # ===================== PRIMERA LÍNEA (BUSQUEDA + VISTAS) =====================

    frame_top = ttk.Frame(root)
    frame_top.pack(fill="x", padx=20, pady=15)

    lbl_desc = ttk.Label(frame_top, text="Descripción:")
    lbl_desc.grid(row=0, column=0, sticky="w", padx=5)
    entry_desc = ttk.Entry(frame_top, width=25)
    entry_desc.grid(row=0, column=1, sticky="w", padx=5)

    lbl_cod = ttk.Label(frame_top, text="Código:")
    lbl_cod.grid(row=0, column=2, sticky="w", padx=5)
    entry_cod = ttk.Entry(frame_top, width=15)
    entry_cod.grid(row=0, column=3, sticky="w", padx=5)

    lbl_marca = ttk.Label(frame_top, text="Marca:")
    lbl_marca.grid(row=0, column=4, sticky="w", padx=5)
    entry_marca = ttk.Entry(frame_top, width=15)
    entry_marca.grid(row=0, column=5, sticky="w", padx=5)

    lbl_prov = ttk.Label(frame_top, text="Proveedor:")
    lbl_prov.grid(row=0, column=6, sticky="w", padx=5)
    entry_prov = ttk.Entry(frame_top, width=15)
    entry_prov.grid(row=0, column=7, sticky="w", padx=5)

    # ===== BOTONES VISTA 1 Y VISTA 2 EN LA LÍNEA SUPERIOR =====

    def activar_vista1():
        global vista_actual, CAMPOS, tree
        vista_actual = 1
        CAMPOS = CAMPOS_VISTA1.copy()
        tree.destroy()
        construir_tabla()
        data = consulta_supabase(current_page, current_filter, current_column)
        actualizar_tabla(data)

    def activar_vista2():
        global vista_actual, CAMPOS, tree
        vista_actual = 2
        CAMPOS = CAMPOS_VISTA2.copy()
        tree.destroy()
        construir_tabla()
        data = consulta_supabase(current_page, current_filter, current_column)
        actualizar_tabla(data)

    btn_v1 = ttk.Button(frame_top, text="Vista 1", style="Vista.TButton", command=activar_vista1)
    btn_v1.grid(row=0, column=8, padx=10)

    btn_v2 = ttk.Button(frame_top, text="Vista 2", style="Vista.TButton", command=activar_vista2)
    btn_v2.grid(row=0, column=9, padx=10)

    # ===================== BOTONES DE BÚSQUEDA =====================

    frame_buttons = ttk.Frame(root)
    frame_buttons.pack(fill="x", padx=20, pady=10)

    btn_desc = ttk.Button(frame_buttons, text="Buscar por descripción",
                          command=lambda: cargar_filtro(entry_desc.get().strip(), "descripcion"))
    btn_desc.grid(row=0, column=0, padx=5, pady=5)

    btn_cod = ttk.Button(frame_buttons, text="Buscar por código",
                         command=lambda: cargar_filtro(entry_cod.get().strip(), "codigo"))
    btn_cod.grid(row=0, column=1, padx=5, pady=5)

    btn_marca = ttk.Button(frame_buttons, text="Buscar por marca",
                           command=lambda: cargar_filtro(entry_marca.get().strip(), "marca"))
    btn_marca.grid(row=0, column=2, padx=5, pady=5)

    btn_prov = ttk.Button(frame_buttons, text="Buscar por proveedor",
                          command=lambda: cargar_filtro(entry_prov.get().strip(), "codigo_proveedor"))
    btn_prov.grid(row=0, column=3, padx=5, pady=5)

    btn_todos = ttk.Button(frame_buttons, text="Mostrar todos",
                           command=lambda: cargar_filtro(None, None))
    btn_todos.grid(row=0, column=4, padx=5, pady=5)

    # ===================== TABLA =====================

    frame_table = ttk.Frame(root)
    frame_table.pack(fill="both", expand=True, padx=20, pady=10)

    def construir_tabla():
        global tree

        tree = ttk.Treeview(frame_table, columns=CAMPOS, show="headings")

        def ordenar_por_columna(col):
            global sort_column, sort_direction, current_page
            if sort_column == col:
                sort_direction = "desc" if sort_direction == "asc" else "asc"
            else:
                sort_column = col
                sort_direction = "asc"
            current_page = 0
            data = consulta_supabase(current_page, current_filter, current_column)
            actualizar_tabla(data)

        for col in CAMPOS:
            tree.heading(col, text=col.upper(), command=lambda c=col: ordenar_por_columna(c))
            tree.column(col, width=150, anchor="w")

        scroll_y = ttk.Scrollbar(frame_table, orient="vertical", command=tree.yview)
        scroll_x = ttk.Scrollbar(frame_table, orient="horizontal", command=tree.xview)
        tree.configure(yscrollcommand=scroll_y.set, xscrollcommand=scroll_x.set)

        tree.grid(row=0, column=0, sticky="nsew")
        scroll_y.grid(row=0, column=1, sticky="ns")
        scroll_x.grid(row=1, column=0, sticky="ew")

        frame_table.rowconfigure(0, weight=1)
        frame_table.columnconfigure(0, weight=1)

        tree.tag_configure("oddrow", background="#ffffff")
        tree.tag_configure("evenrow", background="#f1f5f9")

    construir_tabla()

    # ===================== PAGINACIÓN =====================

    frame_pages = ttk.Frame(root)
    frame_pages.pack(fill="x", padx=20, pady=10)

    btn_prev = ttk.Button(frame_pages, text="← Anterior",
                          command=lambda: cambiar_pagina(-1, tree, lbl_page))
    btn_prev.grid(row=0, column=0, padx=10)

    lbl_page = ttk.Label(frame_pages, text="Página 1 de 1")
    lbl_page.grid(row=0, column=1, padx=10)

    btn_next = ttk.Button(frame_pages, text="Siguiente →",
                          command=lambda: cambiar_pagina(1, tree, lbl_page))
    btn_next.grid(row=0, column=2, padx=10)

    lbl_ir = ttk.Label(frame_pages, text="Ir a página:")
    lbl_ir.grid(row=0, column=3, padx=10)

    entry_ir = ttk.Entry(frame_pages, width=10)
    entry_ir.grid(row=0, column=4, padx=10)

    btn_ir = ttk.Button(frame_pages, text="Ir",
                        command=lambda: ir_a_pagina(entry_ir.get(), tree, lbl_page))
    btn_ir.grid(row=0, column=5, padx=10)

    # ===================== FUNCIONES =====================

    def actualizar_tabla(data):
        for row in tree.get_children():
            tree.delete(row)

        for index, item in enumerate(data):
            values = [item.get(col, "") for col in CAMPOS]
            tag = "evenrow" if index % 2 == 0 else "oddrow"
            tree.insert("", "end", values=values, tags=(tag,))

        total_pages = max(1, (total_rows + PAGE_SIZE - 1) // PAGE_SIZE)
        lbl_page.config(text=f"Página {current_page + 1} de {total_pages}")

    def cargar_filtro(filtro, columna):
        global current_page, current_filter, current_column
        current_page = 0
        current_filter = filtro
        current_column = columna
        data = consulta_supabase(current_page, current_filter, current_column)
        actualizar_tabla(data)

    def cambiar_pagina(delta, tree_widget, label_page):
        global current_page, current_filter, current_column

        total_pages = max(1, (total_rows + PAGE_SIZE - 1) // PAGE_SIZE)
        nueva = current_page + delta

        if nueva < 0 or nueva >= total_pages:
            return

        current_page = nueva

        data = consulta_supabase(current_page, current_filter, current_column)
        actualizar_tabla(data)

    def ir_a_pagina(num, tree_widget, label_page):
        global current_page, current_filter, current_column

        try:
            num = int(num) - 1
        except:
            messagebox.showerror("Error", "Número inválido")
            return

        total_pages = max(1, (total_rows + PAGE_SIZE - 1) // PAGE_SIZE)

        if num < 0 or num >= total_pages:
            messagebox.showerror("Error", "Página fuera de rango")
            return

        current_page = num

        data = consulta_supabase(current_page, current_filter, current_column)
        actualizar_tabla(data)

    # ===================== CARGAR PRIMERA PÁGINA =====================

    cargar_filtro(None, None)
    root.mainloop()


if __name__ == "__main__":
    crear_app()
