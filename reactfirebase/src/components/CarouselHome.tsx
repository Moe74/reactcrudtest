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
import _ from "lodash";

const RatingContainer = styled.div`
  padding: 10px;
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
       /* cursor: pointer;
       margin: 10px;
       position: relative; */

  svg {
    color: #fff;
    opacity: 0.8;
  }
`;

const PaneText = styled.div`
  line-height: 40px;
  padding: 0 10px;
`;
const Pane = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 40px;
  box-shadow: 0 6px 8px -6px #000;
  cursor: pointer;
  transition: all 0.2s ease-out;
  &:hover {
    transform: scale(1.03);
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

  const rezepteWithRating = _.filter(rezepte, (r) => r.rating > 0);
  const sorted = _.orderBy(
    rezepteWithRating,
    ["rating", "title"],
    ["desc", "asc"]
  );

  const recipeTemplate = (recipe: Rezept) => {
    return (
      <Pane
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
        <PaneText>
          {recipe.title}
        </PaneText>
      </Pane>
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
      <Carousel responsive={responsive} swipeable>
        {sorted.map((recipe) => (
          <div key={recipe.rezeptId}>{recipeTemplate(recipe)}</div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselHome;
