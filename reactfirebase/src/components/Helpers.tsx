
import { getDatabase, query, ref, equalTo, orderByChild, onValue } from "firebase/database";
import app from "../firebaseConfig";
import { Comment } from "./Comments";

export async function calculateAverageRating(firebaseId: string): Promise<number> {
    const db = getDatabase(app);
    const commentsRef = query(ref(db, "comments"), orderByChild("rezeptId"), equalTo(firebaseId));

    return new Promise((resolve, reject) => {
        onValue(commentsRef, (snapshot) => {
            const comments: Comment[] = [];
            snapshot.forEach(childSnapshot => {
                comments.push(childSnapshot.val());
            });

            const ratings = comments
                .map(comment => comment.rating)
                .filter(rating => rating !== null && rating !== undefined) as number[];

            if (ratings.length === 0) {
                resolve(0);
            } else {
                const sum = ratings.reduce((acc, rating) => acc + rating, 0);
                const average = sum / ratings.length;
                const roundedAverage = Math.round(average * 2) / 2;
                resolve(roundedAverage);
            }
        }, reject);
    });
}
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



