import React, { useEffect, useState } from "react";
import { Carousel } from "primereact/carousel";
import { get, getDatabase, ref } from "firebase/database";
import app from "../firebaseConfig";
import { imageRezeptUrlPrefix, colors, Rezept } from "./Helpers";
import AverageRating from "./AverageRating";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const RatingContainer = styled.div`
  padding: 10px;
  position: absolute;
  top: 0; // Positionierung oben
  right: 0; // Positionierung rechts
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    color: #fff;
    opacity: 0.8;
  }
`;

const CarouselHome: React.FC = () => {
  const [rezepte, setRezepte] = useState<Rezept[]>([]);
  const navigate = useNavigate(); // Navigation hinzugefuegt

  const fetchData = async () => {
    // die Daten aus der Datenbank holen
    const db = getDatabase(app);
    const dbRef = ref(db, "recipes");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const myData = snapshot.val();
      const tempArray = Object.keys(myData).map((myFireId) => ({
        ...myData[myFireId],
        rezeptId: myFireId,
      }));
      setRezepte(tempArray);
    } else {
      alert("error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recipeTemplate = (recipe: Rezept) => {
    return (
      <div
        style={{ cursor: "pointer", margin: "10px", position: "relative" }} // cursor fuer bessere Sichtbarkeit und Position relativ für RatingContainer
        className="border-1 surface-border border-round m-2 text-center py-5 px-3"
        onClick={() => navigate("/single/" + recipe.rezeptId)} // OnClick auf Rezept Single wechseln
      >
        <div className="mb-3" style={{ position: "relative" }}>
          <img
            src={imageRezeptUrlPrefix + (recipe.image ?? "noImage.webp")}
            alt={recipe.title}
            className="w-6 shadow-2"
            style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 4,
              left: 0,
              right: 0,
              lineHeight: "30px",
              background: "rgba(0,0,0,0.4)",
              color: "white",
              paddingLeft: 10,
            }}
          >
            {recipe.duration} min
          </div>
          <RatingContainer>
            <AverageRating
              color={colors.white}
              firebaseId={recipe.rezeptId ?? ""}
            />
          </RatingContainer>
        </div>
        <div>
          <h4 className="mb-1">{recipe.title}</h4>
        </div>
      </div>
    );
  };

  const responsiveOptions = [
    {
      breakpoint: "1400px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: "767px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "575px",
      numVisible: 1,
      numScroll: 1,
    },
  ];

  return (
    <div className="card">
      <Carousel
        value={rezepte}
        numVisible={3}
        numScroll={3}
        responsiveOptions={responsiveOptions}
        itemTemplate={recipeTemplate}
      />
    </div>
  );
};

export default CarouselHome;
