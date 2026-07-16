// =====================================
// CONFIGURAÇÕES
// =====================================

const STORAGE_KEY = "buscamed_nissei_medicamentos";

let medicineToDeleteId = null;
let toastTimer = null;


// =====================================
// DADOS INICIAIS DA PESQUISA
// =====================================

const initialMedicines = [

    {
        id: crypto.randomUUID(),
        nome: "Propranolol",
        dosagem: "40 mg",
        preco: 11.60,
        estoque: "disponivel",
        quantidade: 18,
        atualizadoEm: new Date().toISOString()
    },

    {
        id: crypto.randomUUID(),
        nome: "Hidroclorotiazida",
        dosagem: "25 mg",
        preco: 4.45,
        estoque: "disponivel",
        quantidade: 25,
        atualizadoEm: new Date().toISOString()
    },

    {
        id: crypto.randomUUID(),
        nome: "Furosemida",
        dosagem: "40 mg",
        preco: 16.34,
        estoque: "baixo",
        quantidade: 4,
        atualizadoEm: new Date(
            Date.now() - 86400000
        ).toISOString()
    },

    {
        id: crypto.randomUUID(),
        nome: "Captopril",
        dosagem: "25 mg",
        preco: 10.40,
        estoque: "disponivel",
        quantidade: 32,
        atualizadoEm: new Date(
            Date.now() - 172800000
        ).toISOString()
    },

    {
        id: crypto.randomUUID(),
        nome: "Anlodipino",
        dosagem: "5 mg",
        preco: 13.31,
        estoque: "indisponivel",
        quantidade: 0,
        atualizadoEm: new Date(
            Date.now() - 259200000
        ).toISOString()
    }

];


// =====================================
// ESTADO
// =====================================

let medicines = loadMedicines();


// =====================================
// ELEMENTOS
// =====================================

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const sidebarClose =
    document.getElementById("sidebarClose");

const pageTitle =
    document.getElementById("pageTitle");

const navItems =
    document.querySelectorAll(".nav-item");

const pageSections =
    document.querySelectorAll(".page-section");

const totalMedicamentos =
    document.getElementById("totalMedicamentos");

const totalDisponiveis =
    document.getElementById("totalDisponiveis");

const precoMedio =
    document.getElementById("precoMedio");

const atualizadosHoje =
    document.getElementById("atualizadosHoje");

const recentMedicines =
    document.getElementById("recentMedicines");

const progressText =
    document.getElementById("progressText");

const progressBar =
    document.getElementById("progressBar");

const viewAllButton =
    document.getElementById("viewAllButton");

const dashboardAddButton =
    document.getElementById("dashboardAddButton");

const addMedicineButton =
    document.getElementById("addMedicineButton");

const medicineSearch =
    document.getElementById("medicineSearch");

const stockFilter =
    document.getElementById("stockFilter");

const medicineTableBody =
    document.getElementById("medicineTableBody");

const mobileMedicineList =
    document.getElementById("mobileMedicineList");

const emptyState =
    document.getElementById("emptyState");

const medicineModal =
    document.getElementById("medicineModal");

const medicineForm =
    document.getElementById("medicineForm");

const medicineId =
    document.getElementById("medicineId");

const medicineName =
    document.getElementById("medicineName");

const medicineDosage =
    document.getElementById("medicineDosage");

const medicinePrice =
    document.getElementById("medicinePrice");

const medicineStock =
    document.getElementById("medicineStock");

const medicineQuantity =
    document.getElementById("medicineQuantity");

const modalTitle =
    document.getElementById("modalTitle");

const modalTag =
    document.getElementById("modalTag");

const saveMedicineButton =
    document.getElementById("saveMedicineButton");

const formMessage =
    document.getElementById("formMessage");

const deleteModal =
    document.getElementById("deleteModal");

const deleteMedicineName =
    document.getElementById("deleteMedicineName");

const confirmDeleteButton =
    document.getElementById("confirmDeleteButton");

const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastTitle =
    document.getElementById("toastTitle");

const toastMessage =
    document.getElementById("toastMessage");


// =====================================
// ARMAZENAMENTO
// =====================================

function loadMedicines() {

    try {

        const storedData =
            localStorage.getItem(STORAGE_KEY);

        if (!storedData) {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(initialMedicines)
            );

            return [...initialMedicines];

        }

        const parsedData =
            JSON.parse(storedData);

        if (!Array.isArray(parsedData)) {

            throw new Error(
                "Dados armazenados inválidos."
            );

        }

        return parsedData;

    } catch (error) {

        console.error(
            "Não foi possível carregar os medicamentos:",
            error
        );

        return [...initialMedicines];

    }

}


function saveMedicines() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(medicines)
    );

}


// =====================================
// FORMATAÇÕES
// =====================================

function normalizeText(text) {

    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}


function formatCurrency(value) {

    return Number(value).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


function formatDateTime(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function parsePrice(value) {

    const normalizedValue =
        String(value)
            .replace(/\s/g, "")
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".");

    return Number(normalizedValue);

}


function formatPriceInput(value) {

    const digits =
        value.replace(/\D/g, "");

    if (!digits) {

        return "";

    }

    const number =
        Number(digits) / 100;

    return number.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function getStockLabel(stock) {

    const labels = {
        disponivel: "Disponível",
        baixo: "Estoque baixo",
        indisponivel: "Indisponível"
    };

    return labels[stock] || "Não informado";

}


function isToday(dateString) {

    const date =
        new Date(dateString);

    const today =
        new Date();

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );

}


// =====================================
// NAVEGAÇÃO
// =====================================

const sectionConfig = {

    dashboard: {
        element: document.getElementById(
            "dashboardSection"
        ),
        title: "Visão geral"
    },

    medicamentos: {
        element: document.getElementById(
            "medicamentosSection"
        ),
        title: "Medicamentos"
    },

    configuracoes: {
        element: document.getElementById(
            "configuracoesSection"
        ),
        title: "Configurações"
    }

};


function changeSection(sectionName) {

    const config =
        sectionConfig[sectionName];

    if (!config) {

        return;

    }

    pageSections.forEach(
        section => {
            section.classList.remove("active");
        }
    );

    navItems.forEach(
        item => {
            item.classList.toggle(
                "active",
                item.dataset.section === sectionName
            );
        }
    );

    config.element.classList.add("active");
    pageTitle.textContent = config.title;

    closeSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function openSidebar() {

    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
    document.body.classList.add("sidebar-open");

    menuButton.setAttribute(
        "aria-expanded",
        "true"
    );

}


function closeSidebar() {

    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.classList.remove("sidebar-open");

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );

}


// =====================================
// DASHBOARD
// =====================================

function updateDashboard() {

    const total =
        medicines.length;

    const available =
        medicines.filter(
            medicine =>
                medicine.estoque === "disponivel"
        ).length;

    const average =
        total > 0
            ? medicines.reduce(
                (sum, medicine) =>
                    sum + Number(medicine.preco),
                0
            ) / total
            : 0;

    const updatedToday =
        medicines.filter(
            medicine =>
                isToday(medicine.atualizadoEm)
        ).length;

    const updatedPercentage =
        total > 0
            ? Math.round(
                updatedToday / total * 100
            )
            : 0;

    totalMedicamentos.textContent =
        total;

    totalDisponiveis.textContent =
        available;

    precoMedio.textContent =
        formatCurrency(average);

    atualizadosHoje.textContent =
        updatedToday;

    progressText.textContent =
        `${updatedPercentage}%`;

    progressBar.style.width =
        `${updatedPercentage}%`;

    renderRecentMedicines();

}


function renderRecentMedicines() {

    const recent =
        [...medicines]
            .sort(
                (a, b) =>
                    new Date(b.atualizadoEm) -
                    new Date(a.atualizadoEm)
            )
            .slice(0, 5);

    if (recent.length === 0) {

        recentMedicines.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💊</div>
                <h3>Nenhum medicamento cadastrado</h3>
            </div>
        `;

        return;

    }

    recentMedicines.innerHTML =
        recent.map(
            medicine => `
                <article class="recent-item">

                    <div class="recent-main">

                        <div class="medicine-avatar">
                            💊
                        </div>

                        <div>
                            <strong>
                                ${escapeHtml(medicine.nome)}
                            </strong>

                            <span>
                                ${escapeHtml(medicine.dosagem)}
                                •
                                ${getStockLabel(
                                    medicine.estoque
                                )}
                            </span>
                        </div>

                    </div>

                    <div class="recent-price">

                        <strong>
                            ${formatCurrency(
                                medicine.preco
                            )}
                        </strong>

                        <span class="recent-date">
                            ${formatDate(
                                medicine.atualizadoEm
                            )}
                        </span>

                    </div>

                </article>
            `
        ).join("");

}


// =====================================
// LISTA E FILTROS
// =====================================

function getFilteredMedicines() {

    const search =
        normalizeText(
            medicineSearch.value
        );

    const selectedStock =
        stockFilter.value;

    return medicines
        .filter(
            medicine => {

                const searchableText =
                    normalizeText(
                        `${medicine.nome} ${medicine.dosagem}`
                    );

                const matchesSearch =
                    searchableText.includes(search);

                const matchesStock =
                    selectedStock === "todos" ||
                    medicine.estoque === selectedStock;

                return (
                    matchesSearch &&
                    matchesStock
                );

            }
        )
        .sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        );

}


function renderMedicines() {

    const filteredMedicines =
        getFilteredMedicines();

    emptyState.hidden =
        filteredMedicines.length !== 0;

    medicineTableBody.innerHTML =
        filteredMedicines.map(
            createDesktopRow
        ).join("");

    mobileMedicineList.innerHTML =
        filteredMedicines.map(
            createMobileCard
        ).join("");

}


function createDesktopRow(medicine) {

    return `
        <tr>

            <td>

                <div class="medicine-name-cell">

                    <div class="medicine-avatar">
                        💊
                    </div>

                    <div>
                        <strong>
                            ${escapeHtml(medicine.nome)}
                        </strong>

                        <small>
                            ${medicine.quantidade}
                            unidade(s)
                        </small>
                    </div>

                </div>

            </td>

            <td>
                ${escapeHtml(medicine.dosagem)}
            </td>

            <td>
                <strong class="price-value">
                    ${formatCurrency(medicine.preco)}
                </strong>
            </td>

            <td>
                <span
                    class="stock-badge ${medicine.estoque}"
                >
                    ${getStockLabel(medicine.estoque)}
                </span>
            </td>

            <td class="date-cell">
                ${formatDateTime(
                    medicine.atualizadoEm
                )}
            </td>

            <td>

                <div class="actions">

                    <button
                        type="button"
                        class="action-button edit"
                        data-action="edit"
                        data-id="${medicine.id}"
                        aria-label="Editar ${escapeHtml(
                            medicine.nome
                        )}"
                        title="Editar"
                    >
                        ✎
                    </button>

                    <button
                        type="button"
                        class="action-button delete"
                        data-action="delete"
                        data-id="${medicine.id}"
                        aria-label="Excluir ${escapeHtml(
                            medicine.nome
                        )}"
                        title="Excluir"
                    >
                        🗑
                    </button>

                </div>

            </td>

        </tr>
    `;

}


function createMobileCard(medicine) {

    return `
        <article class="mobile-medicine-card">

            <div class="mobile-card-header">

                <div class="mobile-card-title">

                    <div class="medicine-avatar">
                        💊
                    </div>

                    <div>
                        <h3>
                            ${escapeHtml(medicine.nome)}
                        </h3>

                        <p>
                            ${escapeHtml(medicine.dosagem)}
                        </p>
                    </div>

                </div>

                <strong class="mobile-price">
                    ${formatCurrency(medicine.preco)}
                </strong>

            </div>

            <div class="mobile-card-details">

                <div class="mobile-detail">
                    <span>Estoque</span>

                    <strong>
                        ${getStockLabel(medicine.estoque)}
                    </strong>
                </div>

                <div class="mobile-detail">
                    <span>Quantidade</span>

                    <strong>
                        ${medicine.quantidade}
                        unidade(s)
                    </strong>
                </div>

                <div class="mobile-detail">
                    <span>Atualizado</span>

                    <strong>
                        ${formatDate(
                            medicine.atualizadoEm
                        )}
                    </strong>
                </div>

                <div class="mobile-detail">
                    <span>Status</span>

                    <strong>
                        ${
                            medicine.estoque ===
                            "indisponivel"
                                ? "Sem venda"
                                : "Publicado"
                        }
                    </strong>
                </div>

            </div>

            <div class="mobile-card-actions">

                <button
                    type="button"
                    class="mobile-action edit"
                    data-action="edit"
                    data-id="${medicine.id}"
                >
                    ✎ Editar
                </button>

                <button
                    type="button"
                    class="mobile-action delete"
                    data-action="delete"
                    data-id="${medicine.id}"
                >
                    🗑 Excluir
                </button>

            </div>

        </article>
    `;

}


// =====================================
// MODAL DE MEDICAMENTO
// =====================================

function openCreateModal() {

    medicineForm.reset();

    medicineId.value = "";
    medicineStock.value = "disponivel";
    medicineQuantity.value = "1";

    modalTag.textContent =
        "Novo cadastro";

    modalTitle.textContent =
        "Cadastrar medicamento";

    saveMedicineButton.textContent =
        "Salvar medicamento";

    formMessage.textContent = "";

    openModal(medicineModal);

    setTimeout(
        () => medicineName.focus(),
        100
    );

}


function openEditModal(id) {

    const medicine =
        medicines.find(
            item => item.id === id
        );

    if (!medicine) {

        showToast(
            "Erro",
            "Medicamento não encontrado.",
            "error"
        );

        return;

    }

    medicineId.value =
        medicine.id;

    medicineName.value =
        medicine.nome;

    medicineDosage.value =
        medicine.dosagem;

    medicinePrice.value =
        Number(medicine.preco)
            .toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    medicineStock.value =
        medicine.estoque;

    medicineQuantity.value =
        medicine.quantidade;

    modalTag.textContent =
        "Alteração de cadastro";

    modalTitle.textContent =
        "Editar medicamento";

    saveMedicineButton.textContent =
        "Salvar alterações";

    formMessage.textContent = "";

    openModal(medicineModal);

}


function openModal(modal) {

    modal.classList.add("active");
    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function closeModal(modal) {

    modal.classList.remove("active");
    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        !document.querySelector(
            ".modal.active"
        )
    ) {

        document.body.style.overflow =
            "";

    }

}


// =====================================
// SALVAR MEDICAMENTO
// =====================================

function handleMedicineSubmit(event) {

    event.preventDefault();

    formMessage.textContent = "";

    const id =
        medicineId.value;

    const name =
        medicineName.value.trim();

    const dosage =
        medicineDosage.value.trim();

    const price =
        parsePrice(
            medicinePrice.value
        );

    const stock =
        medicineStock.value;

    const quantity =
        Number(
            medicineQuantity.value
        );

    if (
        name.length < 2 ||
        dosage.length < 1
    ) {

        formMessage.textContent =
            "Informe corretamente o nome e a dosagem.";

        return;

    }

    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {

        formMessage.textContent =
            "Informe um preço válido maior que zero.";

        return;

    }

    if (
        !Number.isInteger(quantity) ||
        quantity < 0
    ) {

        formMessage.textContent =
            "Informe uma quantidade válida.";

        return;

    }

    const normalizedStock =
        quantity === 0
            ? "indisponivel"
            : stock;

    if (id) {

        const index =
            medicines.findIndex(
                medicine =>
                    medicine.id === id
            );

        if (index === -1) {

            formMessage.textContent =
                "Não foi possível localizar o medicamento.";

            return;

        }

        medicines[index] = {

            ...medicines[index],

            nome: name,
            dosagem: dosage,
            preco: price,
            estoque: normalizedStock,
            quantidade: quantity,
            atualizadoEm:
                new Date().toISOString()

        };

        showToast(
            "Medicamento atualizado",
            `${name} foi alterado com sucesso.`
        );

    } else {

        const duplicate =
            medicines.some(
                medicine =>
                    normalizeText(
                        medicine.nome
                    ) === normalizeText(name) &&
                    normalizeText(
                        medicine.dosagem
                    ) === normalizeText(dosage)
            );

        if (duplicate) {

            formMessage.textContent =
                "Esse medicamento e dosagem já estão cadastrados.";

            return;

        }

        medicines.push({

            id: crypto.randomUUID(),
            nome: name,
            dosagem: dosage,
            preco: price,
            estoque: normalizedStock,
            quantidade: quantity,
            atualizadoEm:
                new Date().toISOString()

        });

        showToast(
            "Medicamento cadastrado",
            `${name} foi adicionado ao painel.`
        );

    }

    saveMedicines();
    renderAll();
    closeModal(medicineModal);

}


// =====================================
// EXCLUSÃO
// =====================================

function openDeleteModal(id) {

    const medicine =
        medicines.find(
            item => item.id === id
        );

    if (!medicine) {

        return;

    }

    medicineToDeleteId =
        id;

    deleteMedicineName.textContent =
        `${medicine.nome} ${medicine.dosagem}`;

    openModal(deleteModal);

}


function confirmDelete() {

    if (!medicineToDeleteId) {

        return;

    }

    const medicine =
        medicines.find(
            item =>
                item.id === medicineToDeleteId
        );

    medicines =
        medicines.filter(
            item =>
                item.id !== medicineToDeleteId
        );

    saveMedicines();
    renderAll();

    closeModal(deleteModal);

    showToast(
        "Medicamento excluído",
        medicine
            ? `${medicine.nome} foi removido.`
            : "O medicamento foi removido."
    );

    medicineToDeleteId = null;

}


// =====================================
// TOAST
// =====================================

function showToast(
    title,
    message,
    type = "success"
) {

    clearTimeout(toastTimer);

    toast.classList.remove(
        "active",
        "error"
    );

    if (type === "error") {

        toast.classList.add("error");
        toastIcon.textContent = "!";

    } else {

        toastIcon.textContent = "✓";

    }

    toastTitle.textContent =
        title;

    toastMessage.textContent =
        message;

    requestAnimationFrame(
        () => {
            toast.classList.add("active");
        }
    );

    toastTimer =
        setTimeout(
            () => {
                toast.classList.remove("active");
            },
            3500
        );

}


// =====================================
// SEGURANÇA BÁSICA DE TEXTO
// =====================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================
// RENDERIZAÇÃO
// =====================================

function renderAll() {

    updateDashboard();
    renderMedicines();

}


// =====================================
// EVENTOS
// =====================================

navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {
                changeSection(
                    item.dataset.section
                );
            }
        );

    }
);


menuButton.addEventListener(
    "click",
    openSidebar
);


sidebarClose.addEventListener(
    "click",
    closeSidebar
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebar
);


dashboardAddButton.addEventListener(
    "click",
    openCreateModal
);


addMedicineButton.addEventListener(
    "click",
    openCreateModal
);


viewAllButton.addEventListener(
    "click",
    () => {
        changeSection("medicamentos");
    }
);


medicineSearch.addEventListener(
    "input",
    renderMedicines
);


stockFilter.addEventListener(
    "change",
    renderMedicines
);


medicinePrice.addEventListener(
    "input",
    () => {

        medicinePrice.value =
            formatPriceInput(
                medicinePrice.value
            );

    }
);


medicineQuantity.addEventListener(
    "input",
    () => {

        if (
            Number(medicineQuantity.value) === 0
        ) {

            medicineStock.value =
                "indisponivel";

        }

    }
);


medicineForm.addEventListener(
    "submit",
    handleMedicineSubmit
);


confirmDeleteButton.addEventListener(
    "click",
    confirmDelete
);


document.addEventListener(
    "click",
    event => {

        const actionButton =
            event.target.closest(
                "[data-action]"
            );

        if (!actionButton) {

            return;

        }

        const action =
            actionButton.dataset.action;

        const id =
            actionButton.dataset.id;

        if (action === "edit") {

            openEditModal(id);

        }

        if (action === "delete") {

            openDeleteModal(id);

        }

    }
);


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {
                    closeModal(medicineModal);
                }
            );

        }
    );


document
    .querySelectorAll(
        "[data-close-delete]"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    closeModal(deleteModal);
                    medicineToDeleteId = null;

                }
            );

        }
    );


document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {

            return;

        }

        closeModal(medicineModal);
        closeModal(deleteModal);
        closeSidebar();

    }
);


// =====================================
// INICIALIZAÇÃO
// =====================================

renderAll();