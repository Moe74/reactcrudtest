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
  IconButton,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import ExclamationIcon from "@mui/icons-material/ErrorOutline";
import PasswordIcon from "@mui/icons-material/Password";
import BackIcon from "@mui/icons-material/ArrowBack";
import { getDatabase, ref, get, update } from "firebase/database";
import bcrypt from "bcryptjs";
import { colors, useElementWidth } from "../Helpers";

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


  const divRef = React.useRef<HTMLDivElement>(null);
  const contentWidth = useElementWidth(divRef);


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

  const isDisabled = !editId && name === "" && email === "" && password === "" && !userIsAdmin;
  return (
    <div ref={divRef}>
      <TextField
        id="name"
        style={{ width: "100%", marginTop: -2 }}
        label="Name"
        value={name}
        onChange={(e) => settingName(e.target.value)}
        variant={!name ? "outlined" : undefined}
        helperText={nameError ?? undefined}
        required
        error={nameError !== ""}
        margin="dense"
        autoComplete="off"
      />


      <TextField
        id="email"
        label="Email"
        style={{ width: "100%" }}
        value={email}
        onChange={(e) => settingEmail(e.target.value)}
        helperText={emailError ?? undefined}
        error={emailError !== ""}
        margin="dense"
        autoComplete="off"
        required
      />

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
              margin="dense"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <FormControlLabel
              control={<Switch checked={showPassword} onChange={(e) => setShowPassword(!showPassword)} />}
              label={showPassword ? "Passwort ausblenden" : "Passwort einblenden"}
              sx={{ mt: 1 }}
            />
          </div>
        </>
      )}
      <div style={{ width: "100%", height: 40 }}>
        <div style={{ float: "left" }}>
          <FormControlLabel
            control={<Switch checked={userIsAdmin} onChange={() => setUserIsAdmin(!userIsAdmin)} />}
            label={userIsAdmin ? "User ist Admin" : "User ist kein Admin"}
          />
        </div>
        {editId && (
          <div style={{ float: contentWidth < 390 ? "left" : "right" }}>
            <Button
              startIcon={<PasswordIcon />}
              variant="text"
              onClick={() => setOpen(true)}
            >
              Change Password
            </Button>
          </div>
        )}
      </div>

      <div style={{ background: colors.greyMiddleLight, height: 1, marginTop: contentWidth < 390 ? 40 : 10, marginBottom: 10, width: "100%" }} />
      <div style={{ paddingBottom: 20, marginTop: 20 }}>

        <Button
          onClick={handleSubmit}
          color={saveable ? "success" : "error"}
          disabled={!saveable}
          style={{ float: "right" }}
          variant={saveable ? "contained" : "outlined"}
          startIcon={saveable ? <CheckIcon /> : <ExclamationIcon />}
        >
          {saveable ? (editId ? "User ändern" : "User anlegen") : "Fehlende Daten"}
        </Button>
        {contentWidth < 330 ?
          <IconButton onClick={resetForm} style={{ float: "left" }}>
            {editId ? <BackIcon /> : <ClearIcon />}
          </IconButton>
          :
          <Button
            startIcon={editId ? <BackIcon /> : <ClearIcon />}
            style={{ float: "left" }}
            // variant="contained"
            onClick={resetForm}
            disabled={isDisabled}
            variant={!isDisabled ? "contained" : "outlined"}
          >
            {editId ? "Abbrechen" : "Reset"}
          </Button>
        }
      </div>

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
    </div>
  );
};

export default UserForm;
