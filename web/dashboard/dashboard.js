console.log("DASHBOARD / INDICADORES JS CARGADO ✔");

const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnActualizar").addEventListener("click", cargarIndicadores);
    cargarIndicadores();
});

async function cargarIndicadores() {
    try {
        const [prod, cont, vent, comp] = await Promise.all([
            client.from("productos").select("*", { count: "exact" }),
            client.from("clientes").select("*", { count: "exact" }),
            client.from("ventas").select("*", { count: "exact" }),
            client.from("compras").select("*", { count: "exact" })
        ]);

        document.getElementById("indProductos").textContent = prod.count || 0;
        document.getElementById("indContactos").textContent = cont.count || 0;
        document.getElementById("indVentas").textContent = vent.count || 0;
        document.getElementById("indCompras").textContent = comp.count || 0;

    } catch (err) {
        console.error("Error al cargar indicadores:", err);
        alert("No se pudieron cargar los indicadores.");
    }
}
