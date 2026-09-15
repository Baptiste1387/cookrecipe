/**
 * RG-104 : Convertit une fraction (ex "1/2") ou une chaîne décimale en flottant.
 */
export function parseQuantityInput(val) {
    if (!val || val.toString().trim() === '') return null;
    const strVal = val.toString().trim().replace(',', '.');
    if (strVal.includes('/')) {
        const parts = strVal.split('/');
        if (parts.length === 2) {
            const num = parseFloat(parts[0]);
            const den = parseFloat(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
        }
    }
    const parsed = parseFloat(strVal);
    return isNaN(parsed) ? null : parsed;
}

/**
 * RG-201 & RG-203 : Règle de trois et formatage de la quantité.
 */
export function calculateQuantity(qty, currentServings, defaultServings) {
    if (qty === null || qty === undefined || qty === 0) return null; // RG-202
    const adjusted = qty * (currentServings / defaultServings);
    if (Number.isInteger(adjusted)) return adjusted.toString();
    return (Math.round(adjusted * 100) / 100).toString().replace('.', ',');
}