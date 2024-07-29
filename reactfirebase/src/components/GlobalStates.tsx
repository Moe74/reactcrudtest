import { createGlobalState } from "react-hooks-global-state";

interface GlobalStates {
  // Rezepte Overview
  defaultFilterIsVegi: boolean;
  defaultFilterDurations: string;
  defaultFilterDifficulty: string;
  defaultFilterRating: string;

  // Rezepte Detail
  defaultPersons: number;

  // Zutaten
  selectedIngredients: Set<string>;
  searchTerm: string;
  showOnlyWithIngrediants: boolean;

  // User Data
  userIsLoggedIn: boolean;
  userIsAdmin: boolean;
  userEmail: string;
  userName: string;
}

const initialState: GlobalStates = {
  // Rezepte Overview
  defaultFilterIsVegi: false,
  defaultFilterDurations: "alle",
  defaultFilterDifficulty: "alle",
  defaultFilterRating: "alle",

  // Rezepte Detail
  defaultPersons: 4,

  // Zutaten
  selectedIngredients: new Set(),
  searchTerm: "",
  showOnlyWithIngrediants: false,

  // User Data
  userIsLoggedIn: sessionStorage.getItem("userIsLoggedIn") === "true",
  userIsAdmin: sessionStorage.getItem("userIsAdmin") === "true",
  userEmail: sessionStorage.getItem("userEmail") || "",
  userName: sessionStorage.getItem("userName") || "",
};

const { setGlobalState: baseSetGlobalState, useGlobalState } =
  createGlobalState<GlobalStates>(initialState);

// Utility function to sync state with sessionStorage
const syncStateWithSessionStorage = (key: keyof GlobalStates, value: any) => {
  sessionStorage.setItem(key, String(value));
};

// Custom setter functions
const setUserIsLoggedIn = (value: boolean) => {
  baseSetGlobalState("userIsLoggedIn", value);
  syncStateWithSessionStorage("userIsLoggedIn", value);
};

const setUserIsAdmin = (value: boolean) => {
  baseSetGlobalState("userIsAdmin", value);
  syncStateWithSessionStorage("userIsAdmin", value);
};

const setUserEmail = (value: string) => {
  baseSetGlobalState("userEmail", value);
  syncStateWithSessionStorage("userEmail", value);
};

const setUserName = (value: string) => {
  baseSetGlobalState("userName", value);
  syncStateWithSessionStorage("userName", value);
};

// Override setGlobalState to sync with sessionStorage
const setGlobalState = <K extends keyof GlobalStates>(
  key: K,
  value: GlobalStates[K]
) => {
  baseSetGlobalState(key, value);
  syncStateWithSessionStorage(key, value);
};

export {
  useGlobalState,
  setGlobalState,
  setUserIsLoggedIn,
  setUserIsAdmin,
  setUserEmail,
  setUserName,
};
