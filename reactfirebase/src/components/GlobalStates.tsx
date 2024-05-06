import { createGlobalState } from "react-hooks-global-state";

interface GlobalStates {

    // Rezepte Overview
    defaultFilterIsVegi: boolean;
    defaultFilterDurations: string;
    defaultFilterDifficulty: string;
    defaultFilterRating: string;

    // Rezepte Detail
    defaultPersons: number;



    //Zutaten
    selectedIngredients: Set<string>;
    searchTerm: string;
    showOnlyWithIngrediants: boolean;
}

const { setGlobalState, useGlobalState } = createGlobalState<GlobalStates>({

    // Rezepte Overview
    defaultFilterIsVegi: false,
    defaultFilterDurations: "alle",
    defaultFilterDifficulty: "alle",
    defaultFilterRating: "alle",

    // Rezepte Detail
    defaultPersons: 4,



    //Zutaten
    selectedIngredients: new Set(),
    searchTerm: "",
    showOnlyWithIngrediants: false

});

export { setGlobalState, useGlobalState };
