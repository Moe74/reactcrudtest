import { getDatabase, query, ref, equalTo, orderByChild, onValue } from "firebase/database";
import * as React from "react";
import app from "../firebaseConfig";

interface AverageRatingProps {
    firebaseId: string;
}

const AverageRating: React.FC<AverageRatingProps> = ({ firebaseId }) => {
    const [averageRating, setAverageRating] = React.useState<number | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const db = getDatabase(app);
        const commentsRef = query(ref(db, "comments"), orderByChild("rezeptId"), equalTo(firebaseId));

        const listener = onValue(commentsRef, (snapshot) => {
            const ratings: number[] = [];
            snapshot.forEach(childSnapshot => {
                const rating = childSnapshot.val().rating;
                if (rating !== null && rating !== undefined) {
                    ratings.push(rating);
                }
            });

            if (ratings.length === 0) {
                setAverageRating(0);
            } else {
                const sum = ratings.reduce((acc, rating) => acc + rating, 0);
                const average = sum / ratings.length;
                const roundedAverage = Math.round(average * 2) / 2;
                setAverageRating(roundedAverage);
            }
            setError(null);
        }, (error) => {
            setError(`Error fetching average rating: ${error.message}`);
        });

        return () => listener();
    }, [firebaseId]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            {averageRating !== null
                ? averageRating === 0
                    ? "n/v"
                    : averageRating
                : "Loading average rating..."}
        </>
    );
};

export default AverageRating;
