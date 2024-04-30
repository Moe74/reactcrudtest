import * as React from 'react';
import app from "../firebaseConfig";
import {getDatabase, ref, get} from "firebase/database";
import { useNavigate } from 'react-router-dom';
import * as _ from "lodash";

export interface Fruit {
    fruitName: string;
    fruitDefinition: string;
}

function Read() {
    const navigate = useNavigate();
    const[fruitArray, setFruitArray] = React.useState<Fruit[]>([]);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const db = getDatabase(app);
        const dbRef =ref(db, "nature/fruits");
        const snapshot = await get(dbRef);
        if(snapshot.exists()){
            setFruitArray(Object.values(snapshot.val()));
        } else{ alert("error"); }
      }

return (
<div>
<button onClick={() => navigate("/")}>Home</button>
<button onClick={() => navigate("/write")}>Write</button>
<button onClick={fetchData}>Reload Data</button>
<h1>Home</h1>
<div style={{display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: 20}}>
{_.map(fruitArray, (f, i) => {
    return(
        <React.Fragment key={i} >
            <div>{f.fruitName}</div>
            <div>{f.fruitDefinition}</div>
        </React.Fragment >
    );
})}
        </div>

</div>
);
}
export default Read;