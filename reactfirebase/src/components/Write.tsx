import * as React from 'react';
import app from "../firebaseConfig";
import {getDatabase, ref, set, push} from "firebase/database";
import { useNavigate } from 'react-router-dom';

function Write() {
    const navigate = useNavigate();

    const[inputValue1, setInputValue1] = React.useState<string>("");
    const[inputValue2, setInputValue2] = React.useState<string>("");

    const saveData = async () => {
        const db = getDatabase(app);
        const newDocRef = push(ref(db, "nature/fruits"));
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
<button onClick={() => navigate("/")}>Home</button>
<button onClick={() => navigate("/write")}>Write</button>
    <h1>WRITE</h1>
    <input type="text" placeholder='fruit name' value={inputValue1} onChange={(e) => setInputValue1(e.target.value)}/>
    <input type="text" placeholder='fruit definition' value={inputValue2} onChange={(e) => setInputValue2(e.target.value)}/>
    <br/>
    <button onClick={saveData}>SAVE DATA</button>
</div>
);
}
export default Write;