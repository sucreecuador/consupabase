// Datos simulados
document.getElementById("productos-count").innerText = "128 productos";
document.getElementById("contactos-count").innerText = "54 contactos";
document.getElementById("inventario-count").innerText = "3,240 unidades";

// Gráfico con Chart.js
const ctx = document.getElementById('chart-rotacion');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
            label: 'Rotación',
            data: [120, 150, 180, 160, 200, 240],
            borderWidth: 3,
            borderColor: '#005bbb',
            backgroundColor: 'rgba(0,91,187,0.2)'
        }]
    }
});
