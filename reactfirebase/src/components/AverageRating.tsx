import { getDatabase, onValue, ref } from "firebase/database";
import * as React from "react";
import app from "../firebaseConfig";
import styled from "styled-components";

const OuterContainer = styled.span<{ col: string }>`
  color: ${(p) => p.col};
`;

interface AverageRatingProps {
  firebaseId: string;
  color?: string;
}

const AverageRating: React.FC<AverageRatingProps> = ({ firebaseId, color }) => {
  const [averageRating, setAverageRating] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const db = getDatabase(app);
    const recipeRef = ref(db, `recipes/${firebaseId}`);

    const listener = onValue(
      recipeRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && data.rating !== undefined && data.rating !== null) {
          setAverageRating(data.rating);
        } else {
          setAverageRating(0);
        }
        setError(null);
      },
      (error) => {
        setError(`Error fetching average rating: ${error.message}`);
      }
    );

    return () => {
      // Es ist wichtig, den Listener zu entfernen, wenn die Komponente unmounted wird
      listener();
    };
  }, [firebaseId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (averageRating === null) {
    return <div>Loading average rating...</div>;
  }

  const fullStars = Math.floor(averageRating);
  const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  const colorTrue = color ?? "black";

  return (
    <OuterContainer col={colorTrue}>
      {Array(fullStars)
        .fill(<span className="pi pi-star-fill" style={{ marginRight: 1 }} />)
        .map((star, index) => (
          <React.Fragment key={index}>{star}</React.Fragment>
        ))}
      {halfStar > 0 && (
        <>
          <span className="pi pi-star-half-fill" style={{ marginRight: 1 }} />
          <span
            className="pi pi-star"
            style={{ transform: "translateX(-100%)", marginRight: "-15px" }}
          />
        </>
      )}
      {Array(emptyStars)
        .fill(<span className="pi pi-star" style={{ marginRight: 1 }} />)
        .map((star, index) => (
          <React.Fragment key={index}>{star}</React.Fragment>
        ))}
    </OuterContainer>
  );
};

export default AverageRating;
