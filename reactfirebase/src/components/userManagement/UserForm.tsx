import React from "react";
import { Button, FormControlLabel, Switch, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import ExclamationIcon from "@mui/icons-material/ErrorOutline";
import PasswordIcon from "@mui/icons-material/Password";

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
  setShowChangePasswordDialog: (show: boolean) => void; // Add this prop
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
  setShowChangePasswordDialog, // Add this prop
}) => {
  const saveable = name && email && (password || editId);

  const settingName = (val: string) => {
    setName(val);
    setNameError("");
  };

  const settingEmail = (val: string) => {
    setEmail(val);
    setEmailError("");
  };

  return (
    <>
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
            onClick={() => setShowChangePasswordDialog(true)}
            style={{ float: "left", marginRight: "20px" }}
          >
            Change Password
          </Button>
        )}
      </div>
    </>
  );
};

export default UserForm;
