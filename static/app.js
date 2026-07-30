function renderPagination(currentPage, totalPages) {
    const pagination = document.getElementById("pagination");

    pagination.innerHTML = `
        <button id="prevPage">< Anterior</button>
        Página ${currentPage} de ${totalPages}
        <button id="nextPage">Siguiente ></button>
        <input id="gotoPage" type="number" min="1" max="${totalPages}">
        <button id="goButton">Ir</button>
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
