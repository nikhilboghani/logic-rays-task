const BASE_URL = (import.meta.env?.VITE_API_URL || "/api").replace(/\/+$/, "");

async function request(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error(`API returned an invalid response (HTTP ${response.status})`);
    }

    if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || `Request failed (HTTP ${response.status})`);
    }
    if (!Array.isArray(result.data?.selectedBoxes) ||
        !result.data.selectedBoxes.every(id => Number.isInteger(id) && id >= 0 && id < 64)) {
        throw new Error("API returned invalid grid data");
    }
    return { ...result.data, selectedBoxes: [...new Set(result.data.selectedBoxes)] };
}

export function getGrid(options = {}) {
    return request("/grid", options);
}

export function saveGrid(selectedBoxes) {
    return request("/grid", {
        method: "PUT",
        body: JSON.stringify({ selectedBoxes: [...new Set(selectedBoxes)] }),
    });
}

export function resetGrid() {
    return request("/grid", { method: "DELETE" });
}
