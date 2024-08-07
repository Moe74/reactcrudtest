import { Box, Button, Rating } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { get, getDatabase, ref } from "firebase/database";
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

  const columns: GridColDef[] = [
    {
      field: "image",
      sortable: false,
      filterable: false,
      headerName: "Image",
      width: 70,
      renderCell: (params) => (
        <img
          src={`${process.env.PUBLIC_URL}/images/rezepte/${params.value}`}
          alt={params.row.title}
          style={{ width: "40px", height: "40px", marginTop: 5 }}
        />
      ),
    },
    {
      field: "title",
      headerName: "Titel",
      minWidth: 300,
      flex: 0.5,
    },
    {
      field: "description",
      headerName: "Beschreibung",
      minWidth: 350,
      flex: 1,
    },
    {
      field: "duration",
      headerName: "Dauer",
      width: 130,
      renderCell: (params) => formatMinuteToHours(params.row.duration),
    },
    {
      field: "vegi",
      headerName: "vegi",
      type: "boolean",
      width: 40,
      align: "center",
    },

    {
      field: "difficulty",
      headerName: "Schwierigkeit",
      width: 140,
      renderCell: (params) => (
        <div style={{ marginTop: 4 }}>
          <Rating
            defaultValue={params.row.difficulty}
            icon={chefHatActive}
            emptyIcon={chefHatInactive}
            max={3}
            readOnly
          />
        </div>
      ),
    },

    {
      field: "rating",
      headerName: "Rating",
      width: 140,
      renderCell: (params) => (
        <div style={{ marginTop: 7 }}>
          <AverageRating firebaseId={params.row.id ?? ""} />
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            marginTop: 8,
          }}
        >
          {mayEdit && (
            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={() => navigate("/edit/" + params.row.id)}
              style={{
                marginRight: 5,
              }}
            >
              Edit
            </Button>
          )}
        </div>
      ),
      width: 100,
    },
  ];

  const filteredColumns = isAdmin ? columns : columns.slice(0, -1);

  const rows = rezepte.map((rezept) => ({
    id: rezept.rezeptId,
    image: rezept.image,
    title: rezept.title,
    description: rezept.description,
    duration: rezept.duration,
    vegi: rezept.isVegi,
    difficulty: rezept.difficulty,
    rating: rezept.rating,
  }));

  return (
    <div style={{ padding: 40 }}>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          onRowClick={(params) => navigate("/single/" + params.row.id)}
          columns={filteredColumns}
          autoHeight
          sx={{
            width: "100%",
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Box>
    </div>
  );
}
export default Read;
