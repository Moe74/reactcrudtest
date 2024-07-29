import LogoutIcon from "@mui/icons-material/Logout";
import { AppBar, Button, TextField, Toolbar, Typography } from "@mui/material";
import bcrypt from "bcryptjs";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import app from "../firebaseConfig";
import ConfirmButton from "./ConfirmButton";
import {
  setUserEmail,
  setUserIsAdmin,
  setUserIsLoggedIn,
  setUserName,
  useGlobalState,
} from "./GlobalStates";

type User = {
  id?: string;
  name: string;
  password: string;
  userIsAdmin: boolean;
  email: string;
};

function Header() {
  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [isAdmin] = useGlobalState("userIsAdmin");
  const [name] = useGlobalState("userName");

  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
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

  const handleLogin = async () => {
    console.log("Trying to login with username:", username);
    const user = users.find((user) => user.name === username);
    if (user) {
      console.log("Found user:", user);
    } else {
      console.log("User not found");
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      setUserIsLoggedIn(true);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserIsAdmin(user.userIsAdmin);
      setShowLoginForm(false);
      setUsername("");
      setPassword("");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  const showLogin = () => {
    setUsername("");
    setPassword("");
    setShowLoginForm(!showLoginForm);
  };

  const handleLogout = () => {
    setUserIsLoggedIn(false);
    setUserName("");
    setUserEmail("");
    setUserIsAdmin(false);
  };

  const menuItems = [
    { label: "Home", link: "/" },
    { label: "Übersicht", link: "/read" },
    { label: "Neues Rezept", link: "/write", visible: isLoggedIn && isAdmin },
    { label: "Userverwaltung", link: "/user", visible: isLoggedIn },
    { label: "Spielwiese", link: "/spielwiese", visible: isLoggedIn },
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mayas Rezepte Blog
          </Typography>
          {menuItems.map(
            (item) =>
              (item.visible === undefined || item.visible) && (
                <Button
                  key={item.label}
                  color={"inherit"}
                  style={{
                    marginRight: 10,
                    borderRadius: 0,
                    borderBottom: `3px solid ${
                      location.pathname === item.link ? "#fff" : "transparent"
                    }`,
                  }}
                  component={Link}
                  to={item.link}
                >
                  {item.label}
                </Button>
              )
          )}
          {isLoggedIn ? (
            <ConfirmButton
              action={handleLogout}
              text={`Logout ${name}`}
              icon={<LogoutIcon sx={{ mr: 1 }} />}
            />
          ) : (
            <Button color="inherit" onClick={showLogin}>
              {showLoginForm ? "Cancel" : "Login"}
            </Button>
          )}
        </Toolbar>
      </AppBar>
      {showLoginForm && !isLoggedIn && (
        <div style={{ marginTop: 2, marginRight: 8, float: "right" }}>
          <TextField
            label="Username"
            type="text"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            inputRef={usernameRef}
            style={{ marginRight: 2 }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Tab" && !e.shiftKey) {
                e.preventDefault();
                passwordRef.current?.focus();
              } else {
                handleKeyDown(e);
              }
            }}
          />
          <TextField
            label="Passwort"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginRight: 2 }}
            inputRef={passwordRef}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />
          <Button
            style={{ float: "right", height: 55 }}
            onClick={handleLogin}
            variant="contained"
            color="success"
            disabled={password === "" || username === ""}
          >
            OK
          </Button>
        </div>
      )}
    </>
  );
}

export default Header;
