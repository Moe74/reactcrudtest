import { getDatabase, onValue, ref } from "firebase/database";
import * as React from "react";
import app from "../firebaseConfig";
import styled from "styled-components";
import { Rating } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/StarBorder';



const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    // color: '#ff6d75',
  },
  '& .MuiRating-iconHover': {
    // color: '#ff3d47',
  },
});

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
      listener();
    };
  }, [firebaseId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (averageRating === null) {
    return <div>Loading average rating...</div>;
  }


  return (
    <StyledRating
      name="customized-color"
      value={averageRating}
      precision={0.5}
      readOnly
      icon={<FavoriteIcon fontSize="inherit" />}
      emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
    />
  );
};

export default AverageRating;
