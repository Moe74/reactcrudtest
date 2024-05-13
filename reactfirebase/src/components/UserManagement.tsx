import bcrypt from 'bcryptjs';
import { getDatabase, onValue, push, ref, remove, set, update } from "firebase/database";
import * as React from 'react';
import app from "../firebaseConfig";
import { useAuth } from "./AuthContext";

type User = {
    id?: string;
    name: string;
    email: string;
    password: string;
    userIsAdmin: boolean;
};

function UserManagement() {
    const [users, setUsers] = React.useState<User[]>([]);
    const [name, setName] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [userIsAdmin, setUserIsAdmin] = React.useState<boolean>(false);
    const [editId, setEditId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const { isLoggedIn, isAdmin } = useAuth();
    const mayEdit = isLoggedIn && isAdmin;

    React.useEffect(() => {
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
        setPassword(''); // Passwort beim Bearbeiten nicht anzeigen.
        setUserIsAdmin(user.userIsAdmin);
        setEditId(user.id || null);
        setShowPassword(false); // Klartextanzeige beim Bearbeiten ausschalten.
    };

    const handleDelete = async (id: string) => {
        const db = getDatabase(app);
        const userRef = ref(db, `users/${id}`);
        await remove(userRef);
        alert("User deleted successfully");
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setUserIsAdmin(false);
        setEditId(null);
        setShowPassword(false);
    };
    if (!mayEdit)
        return (
            <>
                {/* <Header /> */}
                <h3 className="missing">Du musst als Admin eingelogged sein um neue Rezepte anzulegen</h3>
            </>
        );
    return (
        <div>
            {/* <Header /> */}
            <h2>UserManagement.tsx</h2>
            <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "10px 20px", alignItems: "center" }}>
                <div>Name</div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <div>Email</div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div>Password</div>
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                /> Show Password

                <div>Admin</div>
                <input
                    type="checkbox"
                    checked={userIsAdmin}
                    onChange={(e) => setUserIsAdmin(e.target.checked)}
                />

                <button onClick={resetForm} disabled={isLoading} className="btn">
                    Reset
                </button>
                <button onClick={handleSubmit} disabled={isLoading || !name || !email || !password} className="btn">
                    {editId ? "Update" : "Submit"}
                </button>

                <div style={{ gridColumn: "1 / span 2" }}>
                    <h3>User List</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Admin</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.userIsAdmin ? "Yes" : "No"}</td>
                                    <td>
                                        <button onClick={() => handleEdit(user)} className="btn">Edit</button>
                                        <button onClick={() => handleDelete(user.id!)} className="btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;
