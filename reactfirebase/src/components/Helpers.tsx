import {
  getDatabase,
  query,
  ref,
  equalTo,
  orderByChild,
  onValue,
} from "firebase/database";
import app from "../firebaseConfig";
import { Comment } from "./Comments";
import { RefObject } from "react";
import React from "react";

export async function calculateAverageRating(
  firebaseId: string
): Promise<number> {
  const db = getDatabase(app);
  const commentsRef = query(
    ref(db, "comments"),
    orderByChild("rezeptId"),
    equalTo(firebaseId)
  );

  return new Promise((resolve, reject) => {
    onValue(
      commentsRef,
      (snapshot) => {
        const comments: Comment[] = [];
        snapshot.forEach((childSnapshot) => {
          comments.push(childSnapshot.val());
        });

        const ratings = comments
          .map((comment) => comment.rating)
          .filter(
            (rating) => rating !== null && rating !== undefined
          ) as number[];

        if (ratings.length === 0) {
          resolve(0);
        } else {
          const sum = ratings.reduce((acc, rating) => acc + rating, 0);
          const average = sum / ratings.length;
          const roundedAverage = Math.round(average * 2) / 2;
          resolve(roundedAverage);
        }
      },
      reject
    );
  });
}
export interface Fruit {
  fruitName: string;
  fruitDefinition: string;
  fruitId: string;
}

export interface Zutat {
  text: string;
  amount?: number | null; // Erlaube null zusätzlich zu number und undefined
  unit?: string | null; // Erlaube null zusätzlich zu string und undefined
}

export interface Rezept {
  rezeptId: string;
  title: string;
  description: string;
  rating: number;
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
    return value.map((item) => replaceUndefinedWithNull(item));
  }
  if (typeof value === "object") {
    return Object.keys(value).reduce((acc: { [key: string]: unknown }, key) => {
      acc[key] = replaceUndefinedWithNull(
        (value as { [key: string]: unknown })[key]
      );
      return acc;
    }, {});
  }
  return value as object;
}

export const publicUrl = process.env.PUBLIC_URL;
export const imageLayouttUrlPrefix = process.env.PUBLIC_URL + "../images/";
export const imageRezeptUrlPrefix = imageLayouttUrlPrefix + "/rezepte/";

export const colors = {
  redDark: "#950014",
  blueDark: "#001495",
  greenDark: "#149514",
  yellowDark: "#949514",
  orangeDark: "#945014",
  purpleDark: "#541495",
  tealDark: "#149595",
  pinkDark: "#950054",
  brownDark: "#945414",
  greyDark: "#313639",

  redLight: "#B82E2E",
  blueLight: "#2E5CB8",
  blueVeryLight: "#92aee6",
  greenLight: "#2EB85C",
  yellowLight: "#B8B82E",
  orangeLight: "#B85C2E",
  purpleLight: "#5C2EB8",
  tealLight: "#2EB8B8",
  pinkLight: "#B82E5C",
  brownLight: "#5C2E2E",
  greyLight: "#B8B8B8",
  greyMiddleLight: "rgb(230, 230, 230)",
  greyVeryLight: "#f1f1f1",
  black: "#000000",
  white: "#FFFFFF",
};

export const chefHatActive = (
  <svg
    fill={colors.redLight}
    height="18px"
    width="18px"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 219.792 219.792"
  >
    <g>
      <path
        d="M159.4,25.975c-0.916,0-1.836,0.024-2.759,0.07C146.664,9.856,129.195,0,109.896,0c-19.3,0-36.769,9.856-46.744,26.045
		c-0.923-0.047-1.844-0.07-2.76-0.07c-30.306,0-54.961,24.656-54.961,54.962c0,25.355,17.397,47.182,41.432,53.264v78.092
		c0,4.143,3.357,7.5,7.5,7.5h111.066c4.143,0,7.5-3.357,7.5-7.5v-78.088c24.031-6.084,41.432-27.917,41.432-53.268
		C214.361,50.631,189.706,25.975,159.4,25.975z M157.929,204.792H61.863v-14.136h20.639h27.395h27.396h20.638V204.792z
		 M164.485,120.563c-3.747,0.476-6.556,3.663-6.556,7.44v50.152h-14.388v-46.779c0-3.452-2.798-6.25-6.25-6.25
		c-3.452,0-6.25,2.798-6.25,6.25v46.779h-14.896v-46.779c0-3.452-2.798-6.25-6.25-6.25c-3.452,0-6.25,2.798-6.25,6.25v46.779H88.752
		v-46.779c0-3.452-2.798-6.25-6.25-6.25c-3.452,0-6.25,2.798-6.25,6.25v46.779H61.863V128.73c0.008-0.085,0.015-0.17,0.021-0.255
		c0.248-3.952-2.618-7.416-6.547-7.912c-19.899-2.51-34.905-19.546-34.905-39.626c0-22.035,17.927-39.962,39.961-39.962
		c1.929,0,3.893,0.144,5.842,0.431c3.221,0.472,6.374-1.184,7.813-4.102C80.837,23.546,94.575,15,109.896,15
		c15.32,0,29.058,8.547,35.852,22.305c1.439,2.917,4.587,4.571,7.814,4.101c1.944-0.286,3.908-0.431,5.838-0.431
		c22.034,0,39.961,17.927,39.961,39.962C199.361,101.005,184.368,118.04,164.485,120.563z"
      />
    </g>
  </svg>
);
export const chefHatInactive = (
  <svg
    fill={colors.greyLight}
    height="18px"
    width="18px"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 219.792 219.792"
  >
    <g>
      <path
        d="M159.4,25.975c-0.916,0-1.836,0.024-2.759,0.07C146.664,9.856,129.195,0,109.896,0c-19.3,0-36.769,9.856-46.744,26.045
		c-0.923-0.047-1.844-0.07-2.76-0.07c-30.306,0-54.961,24.656-54.961,54.962c0,25.355,17.397,47.182,41.432,53.264v78.092
		c0,4.143,3.357,7.5,7.5,7.5h111.066c4.143,0,7.5-3.357,7.5-7.5v-78.088c24.031-6.084,41.432-27.917,41.432-53.268
		C214.361,50.631,189.706,25.975,159.4,25.975z M157.929,204.792H61.863v-14.136h20.639h27.395h27.396h20.638V204.792z
		 M164.485,120.563c-3.747,0.476-6.556,3.663-6.556,7.44v50.152h-14.388v-46.779c0-3.452-2.798-6.25-6.25-6.25
		c-3.452,0-6.25,2.798-6.25,6.25v46.779h-14.896v-46.779c0-3.452-2.798-6.25-6.25-6.25c-3.452,0-6.25,2.798-6.25,6.25v46.779H88.752
		v-46.779c0-3.452-2.798-6.25-6.25-6.25c-3.452,0-6.25,2.798-6.25,6.25v46.779H61.863V128.73c0.008-0.085,0.015-0.17,0.021-0.255
		c0.248-3.952-2.618-7.416-6.547-7.912c-19.899-2.51-34.905-19.546-34.905-39.626c0-22.035,17.927-39.962,39.961-39.962
		c1.929,0,3.893,0.144,5.842,0.431c3.221,0.472,6.374-1.184,7.813-4.102C80.837,23.546,94.575,15,109.896,15
		c15.32,0,29.058,8.547,35.852,22.305c1.439,2.917,4.587,4.571,7.814,4.101c1.944-0.286,3.908-0.431,5.838-0.431
		c22.034,0,39.961,17.927,39.961,39.962C199.361,101.005,184.368,118.04,164.485,120.563z"
      />
    </g>
  </svg>
);

export function useElementWidth<T extends HTMLElement>(
  ref: RefObject<T>
): number {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [ref]);
  return width;
}

type ConversionResult = {
  value: number;
  unit: string;
};

export function convertUnits(value: number, unit: string): ConversionResult {
  if ((unit === "g" || unit === "ml") && value > 1000) {
    return {
      value: Math.round((value / 1000) * 100) / 100,
      unit: unit === "g" ? "kg" : "l",
    };
  } else {
    return {
      value,
      unit,
    };
  }
}
export const themeSettings = {
  mainBackgroundColor: colors.greyVeryLight,
  mainTextColor: "#495057",
  sidebarLeftBackgroundColor: colors.greyDark,
  sidebarLeftFontColor: colors.white,
  sidebarRightBackgroundColor: colors.greyMiddleLight,
  sidebarRightFontColor: colors.black,
  menuBackgroundColor: colors.white,
};

export const breakpoints = {
  largeDesktop: 1920,
  desktop: 1440,
  smallDesktop: 1080,
  tablet: 768,
  mobile: 440,
};
