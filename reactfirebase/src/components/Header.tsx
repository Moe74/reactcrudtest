import bcrypt from 'bcryptjs';
import { getDatabase, onValue, ref } from 'firebase/database';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import { MenuItem } from 'primereact/menuitem';
import React, { useEffect, useRef, useState } from 'react';
import app from '../firebaseConfig';
import { useAuth } from './AuthContext';

type User = {
    id?: string;
    name: string;
    password: string;
    userIsAdmin: boolean;
    email: string;
};

function Header() {
    const { isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin, setName, setEmail, name } = useAuth();
    const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [users, setUsers] = useState<User[]>([]);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const db = getDatabase(app);
        const usersRef = ref(db, "users");
        onValue(usersRef, (snapshot) => {
            const usersList: User[] = [];
            snapshot.forEach(childSnapshot => {
                usersList.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            setUsers(usersList);
        });
    }, []);

    const handleLogin = async () => {
        const user = users.find((user) => user.name === username);
        if (user && await bcrypt.compare(password, user.password)) {
            setIsLoggedIn(true);
            setName(user.name);
            setEmail(user.email);
            setIsAdmin(user.userIsAdmin);
            setShowLoginForm(false);
            setUsername('');
            setPassword('');
        } else {
            alert("Invalid credentials");
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
        if (event.key === "Enter") {
            handleLogin();
        }
    };

    const showLogin = () => {
        setUsername('');
        setPassword('');
        setShowLoginForm(!showLoginForm)
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setName(null);
        setEmail(null);
        setIsAdmin(false);
    };

    const items: MenuItem[] = [
        {
            label: 'Übersicht',
            icon: 'pi pi-home',
            url: "/"
        },
        {
            label: 'Neues Rezept',
            icon: 'pi pi-star',
            url: "/write",
            visible: isLoggedIn && isAdmin

        },
        {
            label: 'Userverwaltung',
            icon: 'pi pi-users',
            url: "/user",
            visible: isLoggedIn && isAdmin

        },
    ];
    const end = isLoggedIn ?
        <Button label={"Logout " + name} onClick={handleLogout} />
        :
        <Button label={showLoginForm ? "Cancel" : "Login"} onClick={showLogin} />
        ;

    return (
        <>
            <Menubar model={items} end={end} />
            <div>
                {/* <div style={{ background: "rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.3)" }}>
                    <button onClick={() => navigate("/")} className='btn'>ÜBERSICHT</button>
                    {isLoggedIn && isAdmin && (
                        <button onClick={() => navigate("/write")} className='btn'>NEUER EINTRAG</button>
                    )}
                    {isLoggedIn && isAdmin && (
                        <button onClick={() => navigate("/user")} className='btn'>USERVERWALTUNG</button>
                    )}
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className='btn' style={{ float: "right" }}>
                            LOGOUT {name}
                        </button>
                    ) : (
                        <button onClick={showLogin} className='btn' style={{ float: "right" }}>
                            {showLoginForm ? "CANCEL LOGIN" : "LOGIN"}
                        </button>
                    )}
                </div> */}
                {showLoginForm && !isLoggedIn && (
                    <div style={{ marginTop: 2 }}>
                        <button
                            className='btn'
                            style={{ float: "right" }}
                            onClick={handleLogin}
                            ref={buttonRef}
                            onKeyDown={handleKeyDown}
                        >OK</button>
                        <input
                            type="password"
                            placeholder='Dein Vorname klein'
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
                        <input
                            type="text"
                            placeholder='Dein Vorname'
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
