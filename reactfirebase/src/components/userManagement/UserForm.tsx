import React, { useState } from "react";
import {
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import ExclamationIcon from "@mui/icons-material/ErrorOutline";
import PasswordIcon from "@mui/icons-material/Password";
import { getDatabase, ref, get, update } from "firebase/database";
import bcrypt from "bcryptjs";

interface UserFormProps {
  name: string;
  setName: (name: string) => void;
  setNameError: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  setEmailError: (name: string) => void;
  password: string;
  setPassword: (password: string) => void;
  userIsAdmin: boolean;
  setUserIsAdmin: (userIsAdmin: boolean) => void;
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
  handleSubmit: () => void;
  resetForm: () => void;
  editId: string | null;
  isLoading: boolean;
  nameError: string;
  emailError: string;
}

const UserForm: React.FC<UserFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  setEmailError,
  password,
  setPassword,
  userIsAdmin,
  setUserIsAdmin,
  showPassword,
  setShowPassword,
  handleSubmit,
  resetForm,
  editId,
  isLoading,
  nameError,
  emailError,
  setNameError,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [open, setOpen] = useState(false);

  const saveable = name && email && (password || editId);


  const reset = React.useMemo(() => () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
    setOpen(false);
  }, []);

  const settingName = (val: string) => {
    setName(val);
    setNameError("");
  };

  const settingEmail = (val: string) => {
    setEmail(val);
    setEmailError("");
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Alle Felder müssen ausgefüllt sein");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Neues Passwort und Bestätigung müssen übereinstimmen");
      return;
    }

    const db = getDatabase();
    const userRef = ref(db, `users/${editId}`);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      const isPasswordCorrect = await bcrypt.compare(currentPassword, userData.password);

      if (!isPasswordCorrect) {
        setPasswordError("Das aktuelle Passwort ist falsch");
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await update(userRef, { password: hashedNewPassword });
      // setOpen(false);
      reset();
    } else {
      setPasswordError("Benutzer nicht gefunden");
    }
  };


  return (
    <>
      {/* Form fields */}
      <div style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
        <TextField
          id="name"
          style={{ width: "100%" }}
          label="Name"
          value={name}
          onChange={(e) => settingName(e.target.value)}
          variant={!name ? "outlined" : undefined}
          helperText={nameError ?? undefined}
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
      <div style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
        <TextField
          id="email"
          label="Email"
          style={{ width: "100%" }}
          value={email}
          onChange={(e) => settingEmail(e.target.value)}
          helperText={emailError ?? undefined}
          error={emailError !== ""}
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
          <div style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
            <TextField
              id="password"
              label="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
              type={showPassword ? "text" : "password"}
              variant={!password ? "outlined" : undefined}
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
          <div style={{ gridColumnStart: 1, gridColumnEnd: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPassword}
                  onChange={(e) => setShowPassword(!showPassword)}
                />
              }
              label={
                showPassword ? "Passwort ausblenden" : "Passwort einblenden"
              }
            />
          </div>
        </>
      )}
      <div style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={userIsAdmin}
              onChange={() => setUserIsAdmin(!userIsAdmin)}
            />
          }
          label={userIsAdmin ? "User ist Admin" : "User ist kein Admin"}
        />
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
          color={saveable ? "success" : "error"}
          disabled={!saveable}
          style={{ float: "right" }}
          variant={saveable ? "contained" : "outlined"}
          startIcon={saveable ? <CheckIcon /> : <ExclamationIcon />}
        >
          {saveable ? "Submit" : "MISSING DATA"}
        </Button>
        <Button
          startIcon={<ClearIcon />}
          style={{ float: "right", marginRight: "20px" }}
          variant="contained"
          onClick={resetForm}
        >
          Reset
        </Button>

        {editId && (
          <Button
            startIcon={<PasswordIcon />}
            variant="contained"
            onClick={() => setOpen(true)}
            style={{ float: "left", marginRight: "20px" }}
          >
            Change Password
          </Button>
        )}
      </div>

      {/* Password Change Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogTitle ><PasswordIcon style={{ float: "left", marginTop: 5, marginRight: 10 }} />Passwort ändern</DialogTitle>
        <DialogContent sx={{ p: 3 }} dividers>
          <TextField
            margin="dense"
            label="Aktuelles Passwort"
            type="password"
            required
            fullWidth
            variant="filled"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="off"
          />
          <TextField
            margin="dense"
            label="Neues Passwort"
            type="password"
            fullWidth
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="off"
          />
          <TextField
            margin="dense"
            label="Neues Passwort bestätigen"
            type="password"
            required
            fullWidth
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }} sx={{ p: 3 }}>
          {passwordError ?
            <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error" sx={{ p: 0, pl: 1, pr: 2 }} variant="outlined">
              {passwordError}
            </Alert>
            :
            <div style={{ marginRight: "auto" }} />
          }
          <div style={{ paddingRight: 6 }}>
            <Button onClick={reset}>Cancel</Button>
            <Button onClick={handlePasswordChange} color="primary">
              Senden
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserForm;
