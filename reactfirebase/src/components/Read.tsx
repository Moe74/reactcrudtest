import EditIcon from "@mui/icons-material/Edit";
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
      type: "number",
      width: 130,
      renderCell: (params) => formatMinuteToHours(params.row.duration),
    },
    {
      field: "vegi",
      headerName: "vegetarisch",
      type: "boolean",
      width: 130,
    },

    {
      field: "difficulty",
      headerName: "Schwierigkeit",
      type: "number",
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
      field: "rating",
      headerName: "Rating",
      type: "number",
      width: 140,
      renderCell: (params) => (
        <AverageRating firebaseId={params.row.id ?? ""} />
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
            marginTop: 7,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {mayEdit && (
            <>
              <Button
                variant="contained"
                color="warning"
                onClick={() => navigate("/edit/" + params.row.id)}
                style={{ float: "left", marginRight: 5 }}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            </>
          )}
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate("/single/" + params.row.id)}
            style={{
              float: "left",
              width: mayEdit ? "calc(100% - 50px)" : "100%",
            }}
          >
            Open
          </Button>
        </div>
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
    vegi: rezept.isVegi,
    difficulty: rezept.difficulty,
    rating: rezept.rating,
  }));

  return (
    <div style={{ padding: 40 }}>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          sx={{ width: "100%" }}
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
