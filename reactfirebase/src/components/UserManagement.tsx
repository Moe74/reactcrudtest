import bcrypt from "bcryptjs";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
  get,
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
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  const mayEdit = isLoggedIn && isAdmin;

  const handleSubmit = async () => {
    if (!name || !email) {
      alert("Name und E-Mail sind erforderlich.");
      return;
    }

    setIsLoading(true);

    const db = getDatabase(app);
    const userRef = editId ? ref(db, `users/${editId}`) : push(ref(db, "users"));

    let newUser: User = {
      name,
      email,
      password: "",
      userIsAdmin,
    };

    try {
      if (editId) {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          alert("Benutzer nicht gefunden.");
          setIsLoading(false);
          return;
        }
        const existingUser = snapshot.val() as User;

        newUser = {
          ...newUser,
          password: existingUser.password,
        };

        await update(userRef, newUser);
        alert("Benutzer erfolgreich aktualisiert");
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        newUser = {
          ...newUser,
          password: hashedPassword,
        };

        await set(userRef, newUser);
        alert("Benutzer erfolgreich gespeichert");
      }
      resetForm();
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Benutzers: ", error);
      alert("Ein Fehler ist beim Aktualisieren des Benutzers aufgetreten.");
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
  };

  const confirmDelete = (id: string) => {
    setDeleteUserId(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    const db = getDatabase(app);
    const userRef = ref(db, `users/${deleteUserId}`);
    await remove(userRef);
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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Current password and new password are required.");
      return;
    }

    const db = getDatabase(app);
    const userRef = ref(db, `users/${editId}`);


    try {
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        alert("User not found.");
        return;
      }

      const user = snapshot.val() as User;

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        alert("Current password is incorrect.");
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await update(userRef, { password: hashedNewPassword });

      setShowChangePasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error changing password: ", error);
      alert("An error occurred while changing the password.");
    }
  };

  if (!isLoggedIn)
    return (
      <>
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
          severity="danger"
          onClick={() => confirmDelete(user.id!)}
          style={{
            float: "left",
          }}
        />
      </>
    );
  };

  const saveable = name && email && (password || editId);

  return (
    <div>
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
            {!editId && (
              <>
                <div>Password</div>
                <div>
                  <InputText
                    style={{ width: "100%" }}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    invalid={!password}
                    variant={!password ? "filled" : undefined}
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
                    inputId="showPassword"
                    value="showPassword"
                    onChange={(e) => setShowPassword(!showPassword)}
                    checked={showPassword}
                  />
                  <label
                    style={{ marginLeft: "10px" }}
                    htmlFor="showPassword"
                    className="ml-2"
                  >
                    Passwort anzeigen
                  </label>
                </div>
              </>
            )}
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
              {editId && (
                <Button
                  label="Change Password"
                  severity="info"
                  onClick={() => setShowChangePasswordDialog(true)}
                  style={{ float: "right", marginRight: "20px" }}
                />
              )}
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
        <div style={{ border: "1px dashed #9e5f0c", padding: 20, width: "100%", gridColumnStart: 1, gridColumnEnd: 4, background: "#ebd0ad24", color: "#9e5f0c" }}>
          To-Do:
          <ul>
            <li>Ueberpruefung Name und Email unique</li>
            <li>Ueberpruefung Email valide</li>
          </ul>
        </div>
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
      <Dialog
        header="Change Password"
        visible={showChangePasswordDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowChangePasswordDialog(false)}
        footer={
          <>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowChangePasswordDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Change"
              icon="pi pi-check"
              onClick={handleChangePassword}
              autoFocus
            />
          </>
        }
      >
        <div>
          <div>
            <label htmlFor="currentPassword">Current Password</label>
            <InputText
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label htmlFor="newPassword">New Password</label>
            <InputText
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default UserManagement;
