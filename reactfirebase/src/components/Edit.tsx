import * as React from 'react';
import app from "../firebaseConfig";
import {getDatabase, ref, set,get} from "firebase/database";
import { useNavigate, useParams } from 'react-router-dom';

function Edit() {
    const navigate = useNavigate();
    const {firebaseId} = useParams();

    const[inputValue1, setInputValue1] = React.useState<string>("");
    const[inputValue2, setInputValue2] = React.useState<string>("");

    React.useEffect(() => {
        const fetchData =  async () => {
            const db = getDatabase(app);
            const dbRef = ref(db, "nature/fruits/"+firebaseId);
            const snapshot = await get(dbRef);

            if(snapshot.exists()){               
                const targetObject = snapshot.val();
                setInputValue1(targetObject.fruitName);
                setInputValue2(targetObject.fruitDefinition);
            } else{ alert("error"); }
        }
        fetchData();
    }, [firebaseId]);

    const overwriteData = async () => {
        const db = getDatabase(app);
        const newDocRef =ref(db, "nature/fruits/" + firebaseId);
        set(newDocRef, {
          fruitName: inputValue1,
          fruitDefinition: inputValue2
        }).then(() => {
          alert("data saved successfully");
          navigate("/");
        }).catch((error) => {
          alert(`error: ${error.message}`); 
        })
      }

return (
<div>
    <h1>Edit</h1>
    <input type="text" placeholder='fruit name' value={inputValue1} onChange={(e) => setInputValue1(e.target.value)}/>
    <input type="text" placeholder='fruit definition' value={inputValue2} onChange={(e) => setInputValue2(e.target.value)}/>
    <br/>
    <button onClick={overwriteData}>UPDATE</button>
    <button onClick={() => navigate("/")}>ABBRECHEN</button>
</div>
);
}
export default Edit;