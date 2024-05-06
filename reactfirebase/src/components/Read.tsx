import { equalTo, get, getDatabase, orderByChild, query, ref, remove } from 'firebase/database';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import app from "../firebaseConfig";
import { useAuth } from './AuthContext';
import AverageRating from "./AverageRating";
import Header from './Header';
import { Rezept } from './Helpers';

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
        const db = getDatabase();
        const rezeptRef = ref(db, "recipes/" + rezParam);
        const commentsRef = query(ref(db, "comments"), orderByChild('rezeptId'), equalTo(rezParam));

        try {
            const commentsSnapshot = await get(commentsRef);

            if (commentsSnapshot.exists()) {
                const comments = commentsSnapshot.val();
                for (const commentKey in comments) {
                    const commentRef = ref(db, "comments/" + commentKey);
                    await remove(commentRef);
                }
            }
            await remove(rezeptRef);
            window.location.reload();
        } catch (error) {
            console.error("Fehler beim Löschen des Rezepts und seiner Kommentare: ", error);
        }
    }
    const mayEdit = isLoggedIn && isAdmin;

    const imageBodyTemplate = (rezept: Rezept) => {
        return <img src={`./images/rezepte/${rezept.image}`} alt={rezept.image} style={{ width: 40, height: 40 }} />;
    };
    const actionsBodyTemplate = (rezept: Rezept) => {
        return <>
            {mayEdit && (
                <>
                    <Button rounded icon="pi pi-trash" severity="danger" aria-label="Delete" onClick={() => deleteRezept(rezept.rezeptId)} disabled={!allowDel} style={{ float: "left", marginRight: 5 }} />

                    <Button rounded icon="pi pi-pen-to-square" severity="warning" aria-label="Edit" onClick={() => navigate("/edit/" + rezept.rezeptId)} style={{ float: "left", marginRight: 5 }} />
                </>
            )}
            <Button rounded label="OPEN" severity="success" onClick={() => navigate("/single/" + rezept.rezeptId)} style={{ float: "left" }} />
        </>
            ;
    };

    const ratingBodyTemplate = (rezept: Rezept) => {
        return <AverageRating firebaseId={rezept.rezeptId ?? ""} />;
    };
    const [selectedProducts, setSelectedProducts] = React.useState<Rezept[]>([]);
    const dt = React.useRef<DataTable<Rezept[]>>(null);
    const [globalFilter, setGlobalFilter] = React.useState<string>('');
    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            {mayEdit &&
                <div style={{ float: "right", marginTop: 10 }}>
                    <Checkbox inputId="ingredient1" onChange={() => setAllowDel(!allowDel)} checked={allowDel} />
                    <label htmlFor="ingredient1" style={{ marginLeft: 5 }}>Löschen aktivieren</label>
                </div>
            }

            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" placeholder="Search..." onInput={(e) => { const target = e.target as HTMLInputElement; setGlobalFilter(target.value); }} />
            </IconField>
        </div>
    );
    return (
        <div>
            <Header />
            <h2>Read.tsx</h2>

            <DataTable
                ref={dt}
                value={rezepte}
                selection={selectedProducts}
                onSelectionChange={(e) => {
                    if (Array.isArray(e.value)) {
                        setSelectedProducts(e.value);
                    }
                }}
                stripedRows
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                globalFilter={globalFilter}
                header={header}
                selectionMode="multiple"
            >
                <Column header="Image" body={imageBodyTemplate}></Column>
                <Column field="title" header="Titel" sortable ></Column>
                <Column field="description" header="Beschreibung"></Column>
                <Column field="duration" header="Dauer" sortable></Column>
                <Column field="difficulty" header="Schwierigkeit" sortable></Column>
                <Column field="rating" header="Ratings" body={ratingBodyTemplate} sortable></Column>
                <Column header="Actions" body={actionsBodyTemplate} style={{ width: mayEdit ? 190 : 100 }}></Column>

            </DataTable>
        </div >
    );
}
export default Read;
