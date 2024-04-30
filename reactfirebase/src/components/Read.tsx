import * as React from 'react';
import app from "../firebaseConfig";
import {getDatabase, ref, get, remove} from "firebase/database";
import { useNavigate } from 'react-router-dom';
import * as _ from "lodash";

export interface Fruit {
    fruitName: string;
    fruitDefinition: string;
    fruitId: string;
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
            const myData = snapshot.val();
            const tempArray = Object.keys(myData).map(myFireId => {
                return{
                    ...myData[myFireId], 
                    fruitId: myFireId
                }
            })
            setFruitArray(tempArray);
        } else{ alert("error"); }
      }

      const deleteFruit = async (fruitParam : string) => {
        const db = getDatabase(app);
        const dbRef =ref(db, "nature/fruits/" + fruitParam);
        await remove(dbRef);
        window.location.reload();
      }

return (
<div>
<button onClick={() => navigate("/")}>Home</button>
<button onClick={() => navigate("/write")}>Write</button>
<button onClick={fetchData}>Reload Data</button>
<h1>Edit</h1>
<div style={{display: "grid", gridTemplateColumns: "max-content max-content max-content max-content max-content", columnGap: 20}}>
{_.map(fruitArray, (f, i) => {
    return(
        <React.Fragment key={i} >
            <div>{f.fruitName}</div>
            <div>{f.fruitDefinition}</div>
            <div>{f.fruitId}</div>
            <div><button onClick={() => deleteFruit(f.fruitId)}>DEL</button></div>
            <div><button onClick={() => navigate("/edit/" + f.fruitId)}>EDIT</button></div>
        </React.Fragment >
    );
})}
        </div>

</div>
);
}
export default Read;