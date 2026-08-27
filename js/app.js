"use strict";

const TRANSACTIONS_PER_PAGE = 10;

function getTransactionStorageKey() {

    const currentUser =
        getCurrentUser();

    if (!currentUser) {
        return "expenseTrackerTransactions";
    }

    return `expenseTrackerTransactions_${currentUser.id}`;
}

let transactions = loadTransactions();
let selectedMonth = "all";
let editingTransactionId = null;
let deletingTransactionId = null;
let selectedTransactionType = "all";
let allPage = 1;
let incomePage = 1;
let expensePage = 1;

const transactionCategories = {
    income: ["Salary", "Freelance", "Business", "Other"],
    expense: [
        "Food",
        "Shopping",
        "Rent",
        "Travel",
        "Entertainment",
        "Bills",
        "Other"
    ]
};

const addTransactionButton = document.getElementById("addTransactionButton");
const themeButton = document.getElementById("themeButton");

const transactionModal = document.getElementById("transactionModal");
const closeTransactionModal = document.getElementById("closeTransactionModal");
const cancelTransaction = document.getElementById("cancelTransaction");
const transactionForm = document.getElementById("transactionForm");
const submitTransactionButton = document.getElementById("submitTransactionButton");

const monthFilter = document.getElementById("monthFilter");
const chartBars = document.getElementById("chartBars");
const transactionsList = document.getElementById("transactionsList");
const emptyState = document.getElementById("emptyState");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const totalTransactions = document.getElementById("totalTransactions");

const transactionTabs = document.querySelectorAll(".transaction-tab");
const previousPageButton = document.getElementById("previousPageButton");
const nextPageButton = document.getElementById("nextPageButton");
const paginationInfo = document.getElementById("paginationInfo");
const transactionPagination = document.getElementById("transactionPagination");

const categorySelect = document.getElementById("transactionCategory");
const dateInput = document.getElementById("transactionDate");
const titleInput = document.getElementById("transactionTitle");
const amountInput = document.getElementById("transactionAmount");
const notesInput = document.getElementById("transactionNotes");

const deleteModal = document.getElementById("deleteModal");
const deleteTransactionTitle = document.getElementById("deleteTransactionTitle");
const deleteCancelButton = document.getElementById("deleteCancelButton");
const deleteConfirmButton = document.getElementById("deleteConfirmButton");

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

/* STORAGE */

function loadTransactions() {
    try {
        const savedTransactions =
    localStorage.getItem(
        getTransactionStorageKey()
    );

        if (!savedTransactions) {
            return [];
        }

        const parsedTransactions = JSON.parse(savedTransactions);
        return Array.isArray(parsedTransactions) ? parsedTransactions : [];
    } catch (error) {
        console.error("Unable to load transactions:", error);
        return [];
    }
}

function saveTransactions() {

    localStorage.setItem(
        getTransactionStorageKey(),
        JSON.stringify(transactions)
    );
}

/* HELPERS */

function formatCurrency(amount) {
    return currencyFormatter.format(Number(amount) || 0);
}
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function sortByDate(list) {
    return [...list].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );
}

function getVisibleTransactions() {
    let filteredTransactions = transactions;

    if (selectedMonth !== "all") {
        filteredTransactions = filteredTransactions.filter(transaction =>
            transaction.date.startsWith(selectedMonth)
        );
    }

    if (selectedTransactionType !== "all") {
        filteredTransactions = filteredTransactions.filter(transaction =>
            transaction.type === selectedTransactionType
        );
    }

    return sortByDate(filteredTransactions);
}

/* SUMMARY */

function getSummary(list) {
    let income = 0;
    let expense = 0;

    list.forEach(transaction => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
            income += amount;
        } else {
            expense += amount;
        }
    });

    return {
        income,
        expense,
        balance: income - expense
    };
}

function renderSummary(list) {
    const { income, expense, balance } = getSummary(list);

    totalIncome.textContent = formatCurrency(income);
    totalExpense.textContent = formatCurrency(expense);
    totalBalance.textContent = formatCurrency(balance);
    totalTransactions.textContent = list.length;
}

/* MONTH FILTER */

function renderMonthFilter() {
    const months = [
        ...new Set(
            transactions.map(transaction => transaction.date.slice(0, 7))
        )
    ].sort().reverse();

    monthFilter.innerHTML = '<option value="all">All Months</option>';

    months.forEach(month => {
        const option = document.createElement("option");

        option.value = month;
        option.textContent = new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric"
        }).format(new Date(`${month}-01`));

        monthFilter.appendChild(option);
    });

    monthFilter.value = selectedMonth;
}

/* TRANSACTIONS */

function renderTransactions(list) {
    if (!list.length) {
        transactionsList.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    transactionsList.innerHTML = list.map(transaction => {
        const type = transaction.type === "income" ? "income" : "expense";
        const sign = type === "income" ? "+" : "-";

return `
    <div class="transaction-item ${type}">
        <div class="transaction-main">
            <p class="transaction-title">
                ${escapeHTML(transaction.title)}
            </p>

            <span class="transaction-meta">
                ${escapeHTML(transaction.category)} • ${escapeHTML(transaction.date)}
            </span>
        </div>

        <div class="transaction-amount-wrap">
            <strong class="transaction-amount ${type}">
                ${sign}${formatCurrency(transaction.amount)}
            </strong>

            <span class="transaction-type">
                ${escapeHTML(transaction.type)}
            </span>
        </div>

        <div class="transaction-actions">
            <button
                type="button"
                class="mini-button edit-button"
                data-action="edit"
                data-id="${transaction.id}">
                Edit
            </button>

            <button
                type="button"
                class="mini-button delete-button"
                data-action="delete"
                data-id="${transaction.id}">
                Delete
            </button>
        </div>
    </div>
`;
    }).join("");
}

/* CHART */

function renderChart() {
    const monthMap = {};

const chartTransactions = selectedMonth === "all"
    ? transactions
    : transactions.filter(transaction =>
        transaction.date.startsWith(selectedMonth)
    );

chartTransactions.forEach(transaction => {
        const month = transaction.date.slice(0, 7);

        if (!monthMap[month]) {
            monthMap[month] = {
                income: 0,
                expense: 0
            };
        }

        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
            monthMap[month].income += amount;
        } else {
            monthMap[month].expense += amount;
        }
    });

    const months = Object.keys(monthMap).sort();

    if (!months.length) {
        chartBars.innerHTML =
            '<p class="chart-empty">No chart data yet.</p>';
        return;
    }

    const maxValue = Math.max(
        1,
        ...months.flatMap(month => [
            monthMap[month].income,
            monthMap[month].expense
        ])
    );

    chartBars.innerHTML = months.map(month => {
        const income = monthMap[month].income;
        const expense = monthMap[month].expense;

        const incomeHeight = (income / maxValue) * 100;
        const expenseHeight = (expense / maxValue) * 100;

        const label = new Intl.DateTimeFormat("en-US", {
            month: "short"
        }).format(new Date(`${month}-01`));

        const active = selectedMonth === month ? "active" : "";

        return `
            <div class="chart-column ${active}">
                <div class="bar-stack">
                    <span
                        class="bar bar-income"
                        style="height:${incomeHeight}%">
                    </span>

                    <span
                        class="bar bar-expense"
                        style="height:${expenseHeight}%">
                    </span>
                </div>

                <small>${label}</small>
            </div>
        `;
    }).join("");
}

/* DASHBOARD */

function renderDashboard() {
    const visibleTransactions = getVisibleTransactions();

    renderMonthFilter();
    renderSummary(visibleTransactions);
    renderTransactions(
        getPaginatedTransactions(visibleTransactions)
    );
    renderPagination(visibleTransactions);
    renderChart();
    updateTransactionTabs();
}

function updateTransactionTabs() {
    transactionTabs.forEach(tab => {
        const isActive =
            tab.dataset.type === selectedTransactionType;

        tab.classList.toggle("active", isActive);
    });
}

function handleTransactionTabClick(event) {
    selectedTransactionType = event.currentTarget.dataset.type;

    if (selectedTransactionType === "all") {
        allPage = 1;
    } else if (selectedTransactionType === "income") {
        incomePage = 1;
    } else {
        expensePage = 1;
    }

    renderDashboard();
}

/* PAGINATION */

function getCurrentPage() {
    if (selectedTransactionType === "all") {
        return allPage;
    }

    if (selectedTransactionType === "income") {
        return incomePage;
    }

    return expensePage;
}
function setCurrentPage(page) {
    if (selectedTransactionType === "all") {
        allPage = page;
    } else if (selectedTransactionType === "income") {
        incomePage = page;
    } else {
        expensePage = page;
    }
}

function getPaginatedTransactions(list) {
    const currentPage = getCurrentPage();
    const startIndex =
        (currentPage - 1) * TRANSACTIONS_PER_PAGE;

    return list.slice(
        startIndex,
        startIndex + TRANSACTIONS_PER_PAGE
    );
}

function renderPagination(list) {
    const totalPages = Math.max(
        1,
        Math.ceil(list.length / TRANSACTIONS_PER_PAGE)
    );

    let currentPage = getCurrentPage();

    if (currentPage > totalPages) {
        currentPage = totalPages;
        setCurrentPage(currentPage);
    }

    paginationInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;

    previousPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    transactionPagination.style.display =
        list.length <= TRANSACTIONS_PER_PAGE
            ? "none"
            : "flex";
}

/* CATEGORY */

function updateCategoryOptions() {
    const selectedType = document.querySelector(
        'input[name="transactionType"]:checked'
    );

    if (!selectedType) {
        return;
    }

    const categories =
        transactionCategories[selectedType.value] || [];

    categorySelect.innerHTML =
        '<option value="">Select Category</option>';

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categorySelect.appendChild(option);
    });
}

/* FORM */

function validateTransaction(data) {

    if (!["income", "expense"].includes(data.type)) {
        return "Please select a transaction type.";
    }

    if (!data.title) {
        return "Please enter a transaction title.";
    }

    if (data.title.length > 100) {
        return "Transaction title must be 100 characters or less.";
    }

    if (!Number.isFinite(data.amount) || data.amount <= 0) {
        return "Please enter a valid amount.";
    }

    if (data.amount > 100000000) {
        return "Amount is too large.";
    }

    if (!data.category) {
        return "Please select a category.";
    }

    if (!data.date) {
        return "Please select a date.";
    }

    if (data.notes.length > 500) {
        return "Notes must be 500 characters or less.";
    }

    return null;
}

function resetFormState() {
    editingTransactionId = null;
    transactionForm.dataset.mode = "add";

    submitTransactionButton.innerHTML =
        "<span>+</span> Add Transaction";

    transactionForm.reset();

    const incomeRadio = document.querySelector(
        'input[name="transactionType"][value="income"]'
    );

    if (incomeRadio) {
        incomeRadio.checked = true;
    }

    updateCategoryOptions();
}

function openModal() {
    transactionModal.classList.add("active");
    transactionModal.setAttribute("aria-hidden", "false");

    if (!dateInput.value) {
        const today = new Date();

        const localDate = new Date(
            today.getTime() -
            today.getTimezoneOffset() * 60000
        )
            .toISOString()
            .split("T")[0];

        dateInput.value = localDate;
    }

    updateCategoryOptions();
}

function closeModal() {
    transactionModal.classList.remove("active");
    transactionModal.setAttribute("aria-hidden", "true");

    resetFormState();
}

/* EDIT */

function openEditTransaction(id) {
    const transaction = transactions.find(
        item => item.id === Number(id)
    );

    if (!transaction) {
        return;
    }

    editingTransactionId = transaction.id;
    transactionForm.dataset.mode = "edit";

    const typeRadio = document.querySelector(
        `input[name="transactionType"][value="${transaction.type}"]`
    );

    if (typeRadio) {
        typeRadio.checked = true;
    }

    updateCategoryOptions();

    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    categorySelect.value = transaction.category;
    dateInput.value = transaction.date;
    notesInput.value = transaction.notes || "";

    submitTransactionButton.innerHTML =
        "<span>✏️</span> Update Transaction";

    openModal();
}

/* ADD / UPDATE */

function handleTransactionSubmit(event) {
    event.preventDefault();

    const selectedType = document.querySelector(
        'input[name="transactionType"]:checked'
    );

    const transactionData = {
        type: selectedType ? selectedType.value : "",
        title: titleInput.value.trim(),
        amount: Number(amountInput.value),
        category: categorySelect.value,
        date: dateInput.value,
        notes: notesInput.value.trim()
    };

    const validationError =
        validateTransaction(transactionData);

    if (validationError) {
        alert(validationError);
        return;
    }

    if (
        transactionForm.dataset.mode === "edit" &&
        editingTransactionId !== null
    ) {
        transactions = transactions.map(transaction =>
            transaction.id === editingTransactionId
                ? {
                    ...transaction,
                    ...transactionData
                }
                : transaction
        );
    } else {
        transactions.unshift({
            id: Date.now(),
            ...transactionData
        });
    }

    saveTransactions();
    renderDashboard();
    closeModal();
}

/* DELETE */

function openDeleteModal(id) {
    const transaction = transactions.find(
        item => item.id === Number(id)
    );

    if (!transaction) {
        return;
    }

    deletingTransactionId = transaction.id;
    deleteTransactionTitle.textContent =
        `"${transaction.title}"`;

    deleteModal.classList.add("active");
    deleteModal.setAttribute("aria-hidden", "false");
}

function closeDeleteModal() {
    deletingTransactionId = null;

    deleteModal.classList.remove("active");
    deleteModal.setAttribute("aria-hidden", "true");
}

function confirmDeleteTransaction() {
    if (deletingTransactionId === null) {
        return;
    }

    transactions = transactions.filter(
        transaction =>
            transaction.id !== deletingTransactionId
    );

    saveTransactions();
    renderDashboard();
    closeDeleteModal();
}

/* ACTIONS */

function handleActionClick(event) {
    const button = event.target.closest(
        "button[data-action]"
    );

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    if (action === "edit") {
        openEditTransaction(id);
        return;
    }

    if (action === "delete") {
        openDeleteModal(id);
    }
}

/* THEME */

function loadTheme() {
    const savedTheme =
        localStorage.getItem("expenseTrackerTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        themeButton.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-theme");
        themeButton.textContent = "🌙";
    }
}

function toggleTheme() {
    const isDark =
        document.body.classList.toggle("dark-theme");

    localStorage.setItem(
        "expenseTrackerTheme",
        isDark ? "dark" : "light"
    );

    themeButton.textContent =
        isDark ? "☀️" : "🌙";
}

/* EVENTS */

document
    .querySelectorAll('input[name="transactionType"]')
    .forEach(radio => {
        radio.addEventListener(
            "change",
            updateCategoryOptions
        );
    });

transactionTabs.forEach(tab => {
    tab.addEventListener(
        "click",
        handleTransactionTabClick
    );
});

previousPageButton.addEventListener("click", () => {
    const currentPage = getCurrentPage();

    if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
        renderDashboard();
    }
});

nextPageButton.addEventListener("click", () => {
    const visibleTransactions =
        getVisibleTransactions();

    const totalPages = Math.ceil(
        visibleTransactions.length /
        TRANSACTIONS_PER_PAGE
    );

    const currentPage = getCurrentPage();

    if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
        renderDashboard();
    }
});

addTransactionButton.addEventListener(
    "click",
    openModal
);

closeTransactionModal.addEventListener(
    "click",
    closeModal
);

cancelTransaction.addEventListener(
    "click",
    closeModal
);

transactionModal.addEventListener(
    "click",
    event => {
        if (event.target === transactionModal) {
            closeModal();
        }
    }
);

monthFilter.addEventListener(
    "change",
    event => {
        selectedMonth = event.target.value;

        allPage = 1;
        incomePage = 1;
        expensePage = 1;

        renderDashboard();
    }
);

transactionsList.addEventListener(
    "click",
    handleActionClick
);

transactionForm.addEventListener(
    "submit",
    handleTransactionSubmit
);

themeButton.addEventListener(
    "click",
    toggleTheme
);

deleteCancelButton.addEventListener(
    "click",
    closeDeleteModal
);

deleteConfirmButton.addEventListener(
    "click",
    confirmDeleteTransaction
);

deleteModal.addEventListener(
    "click",
    event => {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    }
);

/* INITIALIZE */

loadTheme();
resetFormState();
renderDashboard();