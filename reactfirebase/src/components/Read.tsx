import { Box, Rating } from "@mui/material";
import { get, getDatabase, ref } from "firebase/database";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import app from "../firebaseConfig";
import AverageRating from "./AverageRating";
import { useGlobalState } from "./GlobalStates";
import {
  Rezept,
  chefHatActive,
  chefHatInactive,
  formatMinuteToHours,
} from "./Helpers";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

function Read() {
  const navigate = useNavigate();
  const [rezepte, setRezepte] = React.useState<Rezept[]>([]);
  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [isAdmin] = useGlobalState("userIsAdmin");

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const db = getDatabase(app);
    const dbRef = ref(db, "recipes");
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const myData = snapshot.val();
      const tempArray = Object.keys(myData).map((myFireId) => {
        return {
          ...myData[myFireId],
          rezeptId: myFireId,
        };
      });
      setRezepte(tempArray);
    } else {
      alert("error");
    }
  };

  const mayEdit = isLoggedIn && isAdmin;

  const imageBodyTemplate = (rezept: Rezept) => {
    const imagePath = `${process.env.PUBLIC_URL}/images/rezepte/${rezept.image}`;
    return (
      <img
        src={imagePath}
        alt={rezept.image}
        style={{ width: 40, height: 40 }}
      />
    );
  };

  const actionsBodyTemplate = (rezept: Rezept) => {
    return (
      <>
        {mayEdit && (
          <>
            <Button
              icon="pi pi-pen-to-square"
              severity="warning"
              aria-label="Edit"
              onClick={() => navigate("/edit/" + rezept.rezeptId)}
              style={{ float: "left", marginRight: 5 }}
            />
          </>
        )}
        <Button
          label="open"
          severity="success"
          onClick={() => navigate("/single/" + rezept.rezeptId)}
          style={{
            float: "left",
            width: mayEdit ? "calc(100% - 50px)" : "100%",
          }}
        />
      </>
    );
  };

  const ratingBodyTemplate = (rezept: Rezept) => {
    return <AverageRating firebaseId={rezept.rezeptId ?? ""} />;
  };
  const durationBodyTemplate = (rezept: Rezept) => {
    return formatMinuteToHours(rezept.duration);
  };
  const difficultyBodyTemplate = (rezept: Rezept) => {
    return (
      <Rating
        defaultValue={rezept.difficulty}
        icon={chefHatActive}
        emptyIcon={chefHatInactive}
        max={3}
        readOnly
      />
    );
  };
  const [selectedProducts, setSelectedProducts] = React.useState<Rezept[]>([]);
  const dt = React.useRef<DataTable<Rezept[]>>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Search..."
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            setGlobalFilter(target.value);
          }}
        />
      </IconField>
    </div>
  );

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "firstName",
      headerName: "First name",
      width: 150,
      editable: true,
    },
    {
      field: "lastName",
      headerName: "Last name",
      width: 150,
      editable: true,
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      width: 110,
      editable: true,
    },
    {
      field: "fullName",
      headerName: "Full name",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 160,
      valueGetter: (value, row) =>
        `${row.firstName || ""} ${row.lastName || ""}`,
    },
  ];

  const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
    { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
    { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
    { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
    { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
    { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
    { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
    { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  ];

  return (
    <div style={{ padding: 40 }}>
      {/* <Header /> */}
      <h2>Read.tsx</h2>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
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
        <Column field="title" header="Titel" sortable></Column>
        <Column field="description" header="Beschreibung"></Column>
        <Column
          field="duration"
          header="Dauer"
          body={durationBodyTemplate}
          sortable
        ></Column>
        <Column
          field="difficulty"
          header="Schwierigkeit"
          body={difficultyBodyTemplate}
          sortable
        ></Column>
        <Column
          field="rating"
          header="Ratings"
          body={ratingBodyTemplate}
          sortable
          style={{ width: 120 }}
        ></Column>
        <Column
          header="Actions"
          body={actionsBodyTemplate}
          style={{ width: mayEdit ? 150 : 50 }}
        ></Column>
      </DataTable>
    </div>
  );
}
export default Read;
