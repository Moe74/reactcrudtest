import { get, getDatabase, ref } from "firebase/database";
import * as React from 'react';
import { useParams } from 'react-router-dom';
import app from "../firebaseConfig";
import AverageRating from "./AverageRating";
import Comments from "./Comments";
import Header from "./Header";
import { Rezept } from "./Helpers";

function Single() {
    const { firebaseId } = useParams();
    const [recipe, setRecipe] = React.useState<Rezept | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            const db = getDatabase(app);
            const dbRef = ref(db, `recipes/${firebaseId}`);
            const snapshot = await get(dbRef);
            if (snapshot.exists()) {
                setRecipe(snapshot.val() as Rezept);
            } else {
                alert("Keine Daten gefunden!");
            }
        }
        fetchData();
    }, [firebaseId]);

    return (
        <div>
            <Header />
            <h2>Single.tsx</h2>
            {recipe ?
                <>
                    <img src={`../images/rezepte/${recipe.image ?? "noImage.webp"}`} alt={recipe.title} style={{ height: 200, float: "right" }} />
                    <strong>Id:</strong> {firebaseId}
                    <br />
                    <strong>Rating:</strong> <AverageRating firebaseId={firebaseId ?? ""} />
                    <br />
                    <strong>Title:</strong> {recipe.title}
                    <br />
                    <strong>Description:</strong> {recipe.description}
                    <br />
                    <strong>Duration:</strong> {recipe.duration} Minuten
                    <br />
                    <strong>Difficulty:</strong> {recipe.difficulty}
                    <br />
                    <strong>Persons:</strong> {recipe.persons}
                    <br />
                    <strong>Vegetarian:</strong> {recipe.isVegi ? "Yes" : "No"}
                    <br />
                    <strong>Manual Steps:</strong>
                    <ul>
                        {recipe.manual.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ul>
                    <strong>Ingredients:</strong>
                    <ul>
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient.text} - {ingredient.amount} {ingredient.unit}</li>
                        ))}
                    </ul>
                    <div style={{ padding: 10, border: "1px double rgba(0,0,0,0.2)", marginTop: 10 }}>
                        <Comments />
                    </div>
                </>
                :
                <p>Loading...</p>
            }
        </div>
    );
}
export default Single;