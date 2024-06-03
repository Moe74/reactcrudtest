import bcrypt from "bcryptjs";
import { getDatabase, onValue, ref } from "firebase/database";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { MenuItem } from "primereact/menuitem";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import app from "../firebaseConfig";
import {
  useGlobalState,
  setUserIsLoggedIn,
  setUserIsAdmin,
  setUserEmail,
  setUserName,
} from "./GlobalStates";
import { InputText } from "primereact/inputtext";

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  //   useEffect(() => {
  //     const db = getDatabase(app);
  //     const usersRef = ref(db, "users");
  //     onValue(usersRef, (snapshot) => {
  //       const usersList: User[] = [];
  //       snapshot.forEach((childSnapshot) => {
  //         usersList.push({ id: childSnapshot.key, ...childSnapshot.val() });
  //       });
  //       setUsers(usersList);
  //     });
  //   }, []);

  //   const handleLogin = async () => {
  //     const user = users.find((user) => user.name === username);
  //     if (user && (await bcrypt.compare(password, user.password))) {
  //       setUserIsLoggedIn(true);
  //       setUserName(user.name);
  //       setUserEmail(user.email);
  //       setUserIsAdmin(user.userIsAdmin);
  //       setShowLoginForm(false);
  //       setUsername("");
  //       setPassword("");
  //     } else {
  //       alert("Invalid credentials");
  //     }
  //   };

  useEffect(() => {
    const db = getDatabase(app);
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((childSnapshot) => {
        usersList.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      console.log("Fetched users:", usersList); // Debugging-Ausgabe
      setUsers(usersList);
    });
  }, []);

  const handleLogin = async () => {
    console.log("Trying to login with username:", username); // Debugging-Ausgabe
    const user = users.find((user) => user.name === username);
    if (user) {
      console.log("Found user:", user); // Debugging-Ausgabe
    } else {
      console.log("User not found"); // Debugging-Ausgabe
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

  const items: MenuItem[] = [
    {
      label: "Home",
      icon: "pi pi-home",
      template: (item, options) => (
        <Link
          to="/"
          className={options.className}
          style={{ textDecoration: "none" }}
        >
          {item.label}
        </Link>
      ),
    },
    {
      label: "Übersicht",
      icon: "pi pi-table",
      template: (item, options) => (
        <Link
          to="/read"
          className={options.className}
          style={{ textDecoration: "none" }}
        >
          {item.label}
        </Link>
      ),
    },
    {
      label: "Neues Rezept",
      icon: "pi pi-star",
      visible: isLoggedIn && isAdmin,
      template: (item, options) => (
        <Link
          to="/write"
          className={options.className}
          style={{ textDecoration: "none" }}
        >
          {item.label}
        </Link>
      ),
    },
    {
      label: "Userverwaltung",
      icon: "pi pi-users",
      visible: isLoggedIn,
      template: (item, options) => (
        <Link
          to="/user"
          className={options.className}
          style={{ textDecoration: "none" }}
        >
          {item.label}
        </Link>
      ),
    },
  ];

  const end = isLoggedIn ? (
    <Button label={"Logout " + name} onClick={handleLogout} />
  ) : (
    <Button label={showLoginForm ? "Cancel" : "Login"} onClick={showLogin} />
  );
  return (
    <>
      <Menubar model={items} end={end} />
      <div>
        {showLoginForm && !isLoggedIn && (
          <div style={{ marginTop: 2 }}>
            <Button
              className="btn"
              style={{ float: "right" }}
              onClick={handleLogin}
              /* ref={buttonRef} */
              onKeyDown={handleKeyDown}
            >
              OK
            </Button>
            <InputText
              type="password"
              placeholder="Dein Vorname klein"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              ref={passwordRef}
              style={{ float: "right", marginRight: 2 }}
              onKeyDown={(e) => {
                if (e.key === "Tab" && e.shiftKey === false) {
                  e.preventDefault();
                  buttonRef.current?.focus();
                } else {
                  handleKeyDown(e);
                }
              }}
            />
            <InputText
              type="text"
              placeholder="Dein Vorname"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              ref={usernameRef}
              autoFocus
              style={{ float: "right", marginRight: 2 }}
              onKeyDown={(e) => {
                if (e.key === "Tab" && e.shiftKey === false) {
                  e.preventDefault();
                  passwordRef.current?.focus();
                } else {
                  handleKeyDown(e);
                }
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Header;
