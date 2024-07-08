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


  const columns: GridColDef[] = [
    {
      field: 'image',
      headerName: 'Image',
      width: 50,
      renderCell: (params) => (
        <img src={`${process.env.PUBLIC_URL}/images/rezepte/${params.value}`} alt={params.row.title} style={{ width: '50px', height: '50px' }} />
      ),
    },
    {
      field: 'title',
      headerName: 'Titel',
      width: 300
    },
    {
      field: 'description',
      headerName: 'Beschreibung',
      minWidth: 350,
    },
    {
      field: 'duration',
      headerName: 'Dauer',
      type: 'number',
      width: 130,
      renderCell: (params) => (
        formatMinuteToHours(params.row.duration)
      ),
    },

    {
      field: 'difficulty',
      headerName: 'Schwierigkeit',
      type: 'number',
      width: 130,
      renderCell: (params) => (
        <Rating
          defaultValue={params.row.difficulty}
          icon={chefHatActive}
          emptyIcon={chefHatInactive}
          max={3}
          readOnly
        />
      ),
    },

    {
      field: 'rating',
      headerName: 'Rating',
      type: 'number',
      width: 140,
      renderCell: (params) => (
        <AverageRating firebaseId={params.row.id ?? ""} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <>
          {mayEdit && (
            <>
              <Button
                icon="pi pi-pen-to-square"
                severity="warning"
                aria-label="Edit"
                onClick={() => navigate("/edit/" + params.row.id)}
                style={{ float: "left", marginRight: 5 }}
              />
            </>
          )}
          <Button
            label="open"
            severity="success"
            onClick={() => navigate("/single/" + params.row.id)}
            style={{
              float: "left",
              width: mayEdit ? "calc(100% - 50px)" : "100%",
            }}
          />
        </>
      ),
      width: 150,
    },
  ];

  const rows = rezepte.map((rezept) => ({
    id: rezept.rezeptId,
    image: rezept.image,
    title: rezept.title,
    description: rezept.description,
    duration: rezept.duration,
    difficulty: rezept.difficulty,
    rating: rezept.rating,
  }));



  return (
    <div style={{ padding: 40 }}>
      {/* <Header /> */}
      <h2>Read.tsx</h2>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          sx={{ width: "100%" }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10
              },
            },
          }}
          pageSizeOptions={[10]}
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
