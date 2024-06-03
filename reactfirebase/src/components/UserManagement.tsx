import bcrypt from "bcryptjs";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import * as React from "react";
import { useState } from "react";
import app from "../firebaseConfig";
import { useGlobalState } from "./GlobalStates";

type User = {
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
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const mayEdit = isLoggedIn && isAdmin;

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

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      alert("Name, email, and password are required.");
      return;
    }

    setIsLoading(true);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      userIsAdmin,
    };

    const db = getDatabase(app);

    if (editId) {
      const userRef = ref(db, `users/${editId}`);
      await update(userRef, newUser);
      alert("User updated successfully");
    } else {
      const newUserRef = push(ref(db, "users"));
      await set(newUserRef, newUser);
      alert("User saved successfully");
    }
    resetForm();
    setIsLoading(false);
  };

  const handleEdit = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Passwort beim Bearbeiten nicht anzeigen.
    setUserIsAdmin(user.userIsAdmin);
    setEditId(user.id || null);
    setShowPassword(false); // Klartextanzeige beim Bearbeiten ausschalten.
  };

  const confirmDelete = (id: string) => {
    setDeleteUserId(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    const db = getDatabase(app);
    const userRef = ref(db, `users/${deleteUserId}`);
    await remove(userRef);
    alert("User deleted successfully");
    setShowDeleteDialog(false);
    setDeleteUserId(null);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setUserIsAdmin(false);
    setEditId(null);
    setShowPassword(false);
  };
  if (!isLoggedIn)
    return (
      <>
        {/* <Header /> */}
        <h3 className="missing">
          Du musst als Admin eingelogged sein um User zu verwalten.
        </h3>
      </>
    );

  const buttons = (user: User) => {
    return (
      <>
        {mayEdit && (
          <>
            <Button
              icon="pi pi-pen-to-square"
              severity="warning"
              aria-label="Edit"
              onClick={() => handleEdit(user)}
              style={{ float: "left", marginRight: 5 }}
            />
          </>
        )}
        <Button
          label="delete"
          severity="success"
          onClick={() => confirmDelete(user.id!)}
          style={{
            float: "left",
            width: mayEdit ? "calc(100% - 50px)" : "100%",
            backgroundColor: "red",
          }}
        />
      </>
    );
  };

  const saveable = name && email && password;

  return (
    <div>
      {/* <Header /> */}
      <h2>UserManagement.tsx</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr max-content",
          gap: "10px 20px",
          alignItems: "center",
          width: "100%",
        }}
      >
        {isAdmin && (
          <>
            <div>Name</div>
            <div>
              <InputText
                style={{ width: "100%" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                invalid={!name}
                variant={!name ? "filled" : undefined}
              />
            </div>
            <div>
              {!name && (
                <span
                  className="pi pi-exclamation-circle"
                  style={{ color: "#D13438", fontSize: "1.5rem" }}
                />
              )}
            </div>
            <div>E-Mail</div>
            <div>
              <InputText
                style={{ width: "100%" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!email}
                variant={!email ? "filled" : undefined}
              />
            </div>
            <div>
              {!email && (
                <span
                  className="pi pi-exclamation-circle"
                  style={{ color: "#D13438", fontSize: "1.5rem" }}
                />
              )}
            </div>
            <div>Password</div>
            <div>
              <InputText
                style={{ width: "100%" }}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!password}
                variant={!password ? "filled" : undefined}
                /*  type="checkbox" */
                checked={showPassword}
              />
            </div>
            <div>
              {!password && (
                <span
                  className="pi pi-exclamation-circle"
                  style={{ color: "#D13438", fontSize: "1.5rem" }}
                />
              )}
            </div>
            <div style={{ gridColumnStart: 2, gridColumnEnd: 4 }}>
              <Checkbox
                inputId="ingredient1"
                name="pizza"
                value="Cheese"
                onChange={(e) => setShowPassword(!showPassword)}
                checked={showPassword}
              />
              <label
                style={{ marginLeft: "10px" }}
                htmlFor="ingredient1"
                className="ml-2"
              >
                Passwort anzeigen
              </label>
            </div>
            {/*      Show Password */}
            <div>Admin?</div>
            <div>
              <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">
                    <Checkbox
                      onChange={() => setUserIsAdmin(!userIsAdmin)}
                      checked={userIsAdmin}
                    />
                  </span>
                  <InputText
                    value={userIsAdmin ? "ja" : "nein"}
                    style={{
                      width: "100%",
                      color: "#323130",
                      pointerEvents: "none",
                    }}
                    variant="filled"
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                gridColumnStart: 1,
                gridColumnEnd: 4,
                background: "#323130",
                height: 1,
              }}
            />
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
              <Button
                onClick={handleSubmit}
                disabled={!saveable}
                className="btn"
                label={saveable ? "Submit" : "MISSING DATA"}
                style={{ float: "right" }}
                severity={saveable ? "success" : "danger"}
                outlined={!saveable}
              />
              <Button
                onClick={resetForm}
                disabled={isLoading}
                className="btn"
                label={"Reset"}
                style={{ float: "right", marginRight: "20px" }}
              />
            </div>
          </>
        )}
        <div style={{ width: "100%", gridColumnStart: 1, gridColumnEnd: 4 }}>
          <h3>User List</h3>
        </div>
        <div style={{ width: "100%", gridColumnStart: 1, gridColumnEnd: 4 }}>
          <DataTable value={users}>
            <Column field="name" header="Name" />
            <Column field="email" header="Email" />
            <Column
              field="userIsAdmin"
              header="Admin"
              body={(rowData) => (rowData.userIsAdmin ? "Yes" : "No")}
            />
            {isAdmin && <Column header="Actions" body={buttons} />}
          </DataTable>
        </div>
        To-Do:
        <ul>
          <li>delete mit konfirmation</li>
          <li>Ueberpruefung Name und Email unique</li>
          <li>Passwort beim Editieren optional ändern</li>
        </ul>
      </div>
      <Dialog
        header="Confirm Delete"
        visible={showDeleteDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowDeleteDialog(false)}
        footer={
          <>
            <Button
              label="No"
              icon="pi pi-times"
              onClick={() => setShowDeleteDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              onClick={handleDelete}
              autoFocus
            />
          </>
        }
      >
        <p>Are you sure you want to delete this user?</p>
      </Dialog>
    </div>
  );
}

export default UserManagement;
