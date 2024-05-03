import { get, getDatabase, ref, remove } from "firebase/database";
import * as _ from "lodash";
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import app from "../firebaseConfig";
import Header from './Header';
import { Rezept } from './Helpers';
import AverageRating from "./AverageRating";
import { useAuth } from './AuthContext';

function Read() {
    const navigate = useNavigate();
    const [rezepte, setRezepte] = React.useState<Rezept[]>([]);
    const [allowDel, setAllowDel] = React.useState<boolean>(false);
    const { isLoggedIn, isAdmin } = useAuth();

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const db = getDatabase(app);
        const dbRef = ref(db, "recipes");
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const myData = snapshot.val();
            const tempArray = Object.keys(myData).map(myFireId => {
                return {
                    ...myData[myFireId],
                    rezeptId: myFireId
                }
            })
            setRezepte(tempArray);
        } else {
            alert("error");
        }
    }

    const deleteRezept = async (rezParam: string) => {
        const db = getDatabase(app);
        const dbRef = ref(db, "recipes/" + rezParam);
        await remove(dbRef);
        window.location.reload();
    }
    const mayEdit = isLoggedIn && isAdmin;
    return (
        <div>
            <Header />
            <h2>Read.tsx</h2>
            <div style={{ display: "grid", gridTemplateColumns: "40px max-content 1fr max-content max-content max-content max-content max-content max-content", columnGap: 30, alignItems: "center" }}>
                <div style={{ lineHeight: "50px", fontWeight: 600 }}></div>
                <div style={{ lineHeight: "50px", fontWeight: 600 }}>Titel</div>
                <div style={{ lineHeight: "50px", fontWeight: 600 }}>Beschreibung</div>
                <div style={{ lineHeight: "50px", fontWeight: 600 }}>Dauer</div>
                <div style={{ lineHeight: "50px", fontWeight: 600 }}>Schwierigkeit</div>
                <div style={{ lineHeight: "50px", fontWeight: 600 }}>Rating</div>
                {mayEdit ? (
                    <>
                        <div style={{ lineHeight: "50px", fontWeight: 600 }}><input type="checkbox" checked={allowDel} onChange={() => setAllowDel(!allowDel)} style={{ cursor: "pointer", float: "left", marginTop: 6, marginRight: 5 }} /> Delete</div>
                        <div style={{ lineHeight: "50px", fontWeight: 600 }}>Edit</div>
                    </>
                ) :
                    <><div /><div /></>}
                <div style={{ lineHeight: "50px", fontWeight: 600 }}>Open</div>
                {_.map(rezepte, (f, i) => {
                    return (
                        <React.Fragment key={i} >
                            <div><img src={`./images/rezepte/${f.image ?? "noImage.webp"}`} alt={f.title} style={{ width: 40, height: 40 }} /></div>
                            <div>{f.title}</div>
                            <div>{f.description}</div>
                            <div>{f.duration}</div>
                            <div>{f.difficulty}</div>
                            <div><AverageRating firebaseId={f.rezeptId ?? ""} /></div>
                            {mayEdit ? (
                                <>
                                    <div><button onClick={() => deleteRezept(f.rezeptId)} disabled={!allowDel} className='btn'>DEL</button></div>
                                    <div><button onClick={() => navigate("/edit/" + f.rezeptId)} className='btn'>EDIT</button></div>
                                </>
                            ) :
                                <><div /><div /></>}
                            <div><button onClick={() => navigate("/single/" + f.rezeptId)} className='btn'>OPEN</button></div>
                        </React.Fragment >
                    );
                })}
            </div>
        </div >
    );
}
export default Read;
