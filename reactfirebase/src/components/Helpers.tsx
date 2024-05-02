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