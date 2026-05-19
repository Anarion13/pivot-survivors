const display = document.querySelector("#display");
const historyDisplay = document.querySelector("#history");
const keypad = document.querySelector(".keypad");

const state = {
    current: "0",
    previous: null,
    operator: null,
    shouldResetDisplay: false,
};

const operators = {
    "+": (left, right) => left + right,
    "-": (left, right) => left - right,
    "*": (left, right) => left * right,
    "/": (left, right) => right === 0 ? NaN : left / right,
};

const operatorLabels = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
};

function updateDisplay() {
    display.value = formatNumber(state.current);

    if (state.operator && state.previous !== null) {
        historyDisplay.textContent = `${formatNumber(state.previous)} ${operatorLabels[state.operator]}`;
        return;
    }

    historyDisplay.innerHTML = "&nbsp;";
}

function formatNumber(value) {
    if (value === "Error") {
        return value;
    }

    if (value.endsWith(".")) {
        return value;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Error";
    }

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 10,
    }).format(number);
}

function inputNumber(number) {
    if (state.current === "Error" || state.shouldResetDisplay) {
        state.current = number;
        state.shouldResetDisplay = false;
        updateDisplay();
        return;
    }

    if (state.current === "0") {
        state.current = number;
    } else if (state.current.replace("-", "").length < 16) {
        state.current += number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (state.current === "Error" || state.shouldResetDisplay) {
        state.current = "0.";
        state.shouldResetDisplay = false;
    } else if (!state.current.includes(".")) {
        state.current += ".";
    }

    updateDisplay();
}

function chooseOperator(operator) {
    if (state.current === "Error") {
        return;
    }

    if (state.operator && !state.shouldResetDisplay) {
        calculate();
    }

    state.previous = state.current;
    state.operator = operator;
    state.shouldResetDisplay = true;
    updateDisplay();
}

function calculate() {
    if (!state.operator || state.previous === null || state.current === "Error") {
        return;
    }

    const result = operators[state.operator](Number(state.previous), Number(state.current));

    if (!Number.isFinite(result)) {
        state.current = "Error";
    } else {
        state.current = normalizeResult(result);
    }

    state.previous = null;
    state.operator = null;
    state.shouldResetDisplay = true;
    updateDisplay();
}

function normalizeResult(number) {
    return Number.parseFloat(number.toPrecision(12)).toString();
}

function clearCalculator() {
    state.current = "0";
    state.previous = null;
    state.operator = null;
    state.shouldResetDisplay = false;
    updateDisplay();
}

function deleteLastDigit() {
    if (state.current === "Error" || state.shouldResetDisplay) {
        state.current = "0";
        state.shouldResetDisplay = false;
    } else {
        state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";
    }

    updateDisplay();
}

function applyPercent() {
    if (state.current === "Error") {
        return;
    }

    state.current = normalizeResult(Number(state.current) / 100);
    updateDisplay();
}

function handleAction(action) {
    switch (action) {
        case "clear":
            clearCalculator();
            break;
        case "delete":
            deleteLastDigit();
            break;
        case "decimal":
            inputDecimal();
            break;
        case "equals":
            calculate();
            break;
        case "percent":
            applyPercent();
            break;
    }
}

keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.number) {
        inputNumber(button.dataset.number);
        return;
    }

    if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
        return;
    }

    handleAction(button.dataset.action);
});

document.addEventListener("keydown", (event) => {
    if (/^[0-9]$/.test(event.key)) {
        inputNumber(event.key);
        return;
    }

    if (["+", "-", "*", "/"].includes(event.key)) {
        chooseOperator(event.key);
        return;
    }

    if (event.key === "." || event.key === ",") {
        inputDecimal();
        return;
    }

    if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
        return;
    }

    if (event.key === "Backspace") {
        deleteLastDigit();
        return;
    }

    if (event.key === "Escape") {
        clearCalculator();
        return;
    }

    if (event.key === "%") {
        applyPercent();
    }
});

updateDisplay();
