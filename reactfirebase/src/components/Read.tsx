import { Box, Button, Icon, Rating, TextField } from "@mui/material";
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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

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

  /* const [selectedProducts, setSelectedProducts] = React.useState<Rezept[]>([]);
  /* const dt = React.useRef<DataGrid<Rezept[]>>(null);  */
  /* const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <Button variant="outlined" startIcon={<SearchOutlinedIcon />}>
        <TextField
          type="search"
          id="filled-basic"
          label="Search..."
          variant="filled"
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            setGlobalFilter(target.value);
          }}
        ></TextField>
      </Button>
    </div>
  );  */

  const columns: GridColDef[] = [
    {
      field: "image",
      headerName: "Image",
      width: 50,
      renderCell: (params) => (
        <img
          src={`${process.env.PUBLIC_URL}/images/rezepte/${params.value}`}
          alt={params.row.title}
          style={{ width: "50px", height: "50px" }}
        />
      ),
    },
    {
      field: "title",
      headerName: "Titel",
      width: 300,
    },
    {
      field: "description",
      headerName: "Beschreibung",
      minWidth: 350,
    },
    {
      field: "duration",
      headerName: "Dauer",
      type: "number",
      width: 130,
      renderCell: (params) => formatMinuteToHours(params.row.duration),
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
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
}
export default Read;
