import bcrypt from "bcryptjs";
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import React from "react";
import app from "../firebaseConfig";
import { useGlobalState } from "./GlobalStates";
import UserForm from "./userManagement/UserForm";
import UserList from "./userManagement/UserList";
import { breakpoints, isValidEmail, useElementWidth } from "./Helpers";
import { Card, CardContent, Grid, Paper, Typography, Snackbar, Alert } from "@mui/material";

export type User = {
  id?: string;
  name: string;
  email: string;
  password: string;
  userIsAdmin: boolean;
};

function UserManagement() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [name, setName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [userIsAdmin, setUserIsAdmin] = React.useState<boolean>(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [isAdmin] = useGlobalState("userIsAdmin");
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);

  const [nameError, setNameError] = React.useState<string>("");
  const [emailError, setEmailError] = React.useState<string>("");

  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error">("success");

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const divRef = React.useRef<HTMLDivElement>(null);
  const contentWidth = useElementWidth(divRef);

  const handleSubmit = async () => {
    setNameError("");
    setEmailError("");

    if (!name) {
      setNameError("Name ist erforderlich.");
    }

    if (!email) {
      setEmailError("E-Mail ist erforderlich.");
    }

    if (!isValidEmail(email)) {
      setEmailError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }

    if (nameError || emailError) {
      return;
    }

    setIsLoading(true);

    const db = getDatabase(app);
    const usersRef = ref(db, "users");

    try {
      const snapshot = await get(usersRef);
      const usersList: User[] = [];
      snapshot.forEach((childSnapshot) => {
        usersList.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });

      const nameExists = usersList.some(
        (user) => user.name === name && user.id !== editId
      );
      const emailExists = usersList.some(
        (user) => user.email === email && user.id !== editId
      );

      if (nameExists) {
        setNameError("Name ist bereits vergeben.");
        setIsLoading(false);
        return;
      }

      if (emailExists) {
        setEmailError("E-Mail ist bereits vergeben.");
        setIsLoading(false);
        return;
      }

      const userRef = editId
        ? ref(db, `users/${editId}`)
        : push(ref(db, "users"));

      let newUser: User = {
        name,
        email,
        password: "",
        userIsAdmin,
      };

      if (editId) {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          showMessage("error", "Benutzer nicht gefunden");
          setIsLoading(false);
          return;
        }
        const existingUser = snapshot.val() as User;

        newUser = {
          ...newUser,
          password: existingUser.password,
        };

        await update(userRef, newUser);
        showMessage("success", "Benutzer erfolgreich aktualisiert");
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        newUser = {
          ...newUser,
          password: hashedPassword,
        };

        await set(userRef, newUser);
        showMessage("success", "User erfolgreich angelegt");
      }
      resetForm();
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Benutzers: ", error);
      showMessage("error", "Ein Fehler ist beim Aktualisieren des Benutzers aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const db = getDatabase(app);
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((childSnapshot) => {
        usersList.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setUsers(usersList);
    });
  }, []);

  const handleEdit = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setUserIsAdmin(user.userIsAdmin);
    setEditId(user.id || null);
    setShowPassword(false);

    // Scroll the container to the top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  React.useEffect(() => {
    const prepareDelete = async () => {
      if (deleteUserId !== null) {
        const db = getDatabase(app);
        const userRef = ref(db, `users/${deleteUserId}`);
        await remove(userRef);
        setDeleteUserId(null);
      }
    };

    prepareDelete();
  }, [deleteUserId]);

  const settingDelete = (id: string) => {
    setDeleteUserId(id);
  };

  const resetForm = () => {
    setName("");
    setNameError("");
    setEmail("");
    setEmailError("");
    setPassword("");
    setUserIsAdmin(false);
    setEditId(null);
    setShowPassword(false);
  };

  const showMessage = (severity: "success" | "error", message: string) => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (!isLoggedIn)
    return (
      <>
        <h3 className="missing">
          Du musst als Admin eingelogged sein um User zu verwalten.
        </h3>
      </>
    );

  const mobileView = contentWidth <= breakpoints.smallDesktop;

  return (
    <div
      ref={scrollContainerRef}
      style={{ overflow: "auto", height: "100%", padding: 40 }}
    >
      <div ref={divRef}>
        <Card variant="outlined" sx={{ mt: 5 }} style={{ padding: 40 }}>
          <CardContent>
            <Grid container spacing={2}>
              {isAdmin && (
                <Grid item xs={mobileView ? 12 : 4}>
                  <Typography
                    style={{ fontWeight: "bold", marginBottom: 5 }}
                    color="text.primary"
                  >
                    User Edit
                  </Typography>

                  <Paper
                    elevation={1}
                    sx={{ p: 5, background: "rgba(0,0,0,0.03)" }}
                  >
                    <UserForm
                      name={name}
                      setName={setName}
                      setNameError={setNameError}
                      email={email}
                      setEmail={setEmail}
                      setEmailError={setEmailError}
                      password={password}
                      setPassword={setPassword}
                      userIsAdmin={userIsAdmin}
                      setUserIsAdmin={setUserIsAdmin}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      handleSubmit={handleSubmit}
                      resetForm={resetForm}
                      editId={editId}
                      isLoading={isLoading}
                      nameError={nameError}
                      emailError={emailError}
                    />
                  </Paper>
                </Grid>
              )}
              <Grid item xs={mobileView ? 12 : 8}>
                <Typography
                  style={{ fontWeight: "bold", marginBottom: 5 }}
                  color="text.primary"
                >
                  User List
                </Typography>
                <Paper elevation={1} sx={{ p: 5 }}>
                  <UserList
                    users={users}
                    isAdmin={isAdmin}
                    handleEdit={handleEdit}
                    confirmDelete={settingDelete}
                  />
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default UserManagement;
