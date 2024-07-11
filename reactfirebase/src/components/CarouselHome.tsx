import React, { useEffect, useState } from "react";
import { get, getDatabase, ref } from "firebase/database";
import app from "../firebaseConfig";
import {
  imageRezeptUrlPrefix,
  colors,
  Rezept,
  formatMinuteToHours,
} from "./Helpers";
import AverageRating from "./AverageRating";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const RatingContainer = styled.div`
  padding: 10px;
  position: absolute;
  top: 0;
  right: 0;
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
  const navigate = useNavigate();

  const fetchData = async () => {
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
        style={{ cursor: "pointer", margin: "10px", position: "relative" }}
        className="border-1 surface-border border-round m-2 text-center py-5 px-3"
        onClick={() => navigate("/single/" + recipe.rezeptId)}
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
            {formatMinuteToHours(recipe.duration)}
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

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <div className="card">
      <Carousel responsive={responsive}>
        {rezepte.map((recipe) => (
          <div key={recipe.rezeptId}>{recipeTemplate(recipe)}</div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselHome;
