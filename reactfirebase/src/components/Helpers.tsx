export interface Fruit {
    fruitName: string;
    fruitDefinition: string;
    fruitId: string;
}


export interface Zutat {
    text: string;
    amount?: number | null;  // Erlaube null zusätzlich zu number und undefined
    unit?: string | null;    // Erlaube null zusätzlich zu string und undefined
}

export interface Rezept {
    rezeptId: string;
    title: string;
    description: string;
    manual: string[];
    ingredients: Zutat[];
    duration: number;
    difficulty: number;
    persons: number;
    image?: string;
    isVegi?: boolean;
}

export function replaceUndefinedWithNull(value: unknown): object {
    if (value === undefined || value === null) {
        return {};
    }
    if (Array.isArray(value)) {
        return value.map(item => replaceUndefinedWithNull(item));
    }
    if (typeof value === 'object') {
        return Object.keys(value).reduce((acc: { [key: string]: unknown }, key) => {
            acc[key] = replaceUndefinedWithNull((value as { [key: string]: unknown })[key]);
            return acc;
        }, {});
    }
    return value as object;
}