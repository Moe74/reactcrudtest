import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { get, getDatabase, ref } from "firebase/database";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import Carousel, { ResponsiveType } from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useNavigate } from "react-router-dom";
import app from "../firebaseConfig";
import AverageRating from "./AverageRating";
import {
  colors,
  formatMinuteToHours,
  imageRezeptUrlPrefix,
  responsiveCarousel,
  Rezept,
} from "./Helpers";
import {
  OpenField,
  Pane,
  PaneImage,
  PaneText,
  RatingContainer,
} from "./LayoutSC";

interface CarouselHomeProps {
  cWidth: number;
}

const CarouselHome = (p: CarouselHomeProps) => {
  const [rezepte, setRezepte] = useState<Rezept[]>([]);
  const [visCols, setvisCols] =
    React.useState<ResponsiveType>(responsiveCarousel);

  React.useEffect(() => {
    setvisCols(responsiveCarousel);
  }, [p.cWidth]);

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
      <Pane>
        <PaneImage
          image={imageRezeptUrlPrefix + (recipe.image ?? "noImage.webp")}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
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
        </PaneImage>

        <PaneText onClick={() => navigate("/single/" + recipe.rezeptId)}>
          {recipe.title}
          <OpenField>
            open <ChevronRightIcon sx={{ float: "right", mt: 1.1, ml: 1 }} />
          </OpenField>
        </PaneText>
      </Pane>
    );
  };

  return (
    <div className="card">
      <Carousel
        responsive={visCols}
        ssr={true}
        autoPlaySpeed={3000}
        centerMode={false}
        draggable
        infinite
        minimumTouchDrag={80}
        slidesToSlide={1}
        swipeable
      >
        {sorted.map((recipe) => (
          <div key={recipe.rezeptId}>{recipeTemplate(recipe)}</div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselHome;
