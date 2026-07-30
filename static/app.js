function renderPagination(currentPage, totalPages) {
    const pagination = document.getElementById("pagination");

    pagination.innerHTML = `
        <button id="prevPage" class="pagination-btn">Anterior</button>
        <span class="pagination-info">Página ${currentPage} de ${totalPages}</span>
        <button id="nextPage" class="pagination-btn">Siguiente</button>
        <input id="gotoPage" type="number" class="pagination-input" min="1" max="${totalPages}">
        <button id="goButton" class="pagination-btn">Ir</button>
    `;

    document.getElementById("prevPage").onclick = () => {
        if (currentPage > 1) loadPage(currentPage - 1);
    };

    document.getElementById("nextPage").onclick = () => {
        if (currentPage < totalPages) loadPage(currentPage + 1);
    };

    document.getElementById("goButton").onclick = () => {
        const page = parseInt(document.getElementById("gotoPage").value);
        if (page >= 1 && page <= totalPages) loadPage(page);
    };
}
