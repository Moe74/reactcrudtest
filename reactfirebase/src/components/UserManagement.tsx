import React, { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { getDatabase, onValue, push, ref, remove, set, update, get } from 'firebase/database';
import UserForm from './userManagement/UserForm';
import UserList from './userManagement/UserList';
import ChangePasswordDialog from './userManagement/ChangePasswordDialog';
import ConfirmDeleteDialog from './userManagement/ConfirmDeleteDialog';
import app from '../firebaseConfig';
import { useGlobalState } from './GlobalStates';
import { Toast, ToastMessage } from 'primereact/toast';

export type User = {
  id?: string;
  name: string;
  email: string;
  password: string;
  userIsAdmin: boolean;
};

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userIsAdmin, setUserIsAdmin] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoggedIn] = useGlobalState('userIsLoggedIn');
  const [isAdmin] = useGlobalState('userIsAdmin');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const [nameError, setNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');


  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setNameError('');
    setEmailError('');

    if (!name) {
      setNameError('Name ist erforderlich.');
    }

    if (!email) {
      setEmailError('E-Mail ist erforderlich.');
    }

    if (!isValidEmail(email)) {
      setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (nameError || emailError) {
      return;
    }

    setIsLoading(true);

    const db = getDatabase(app);
    const usersRef = ref(db, 'users');

    try {
      const snapshot = await get(usersRef);
      const usersList: User[] = [];
      snapshot.forEach((childSnapshot) => {
        usersList.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });

      const nameExists = usersList.some((user) => user.name === name && user.id !== editId);
      const emailExists = usersList.some((user) => user.email === email && user.id !== editId);

      if (nameExists) {
        setNameError('Name ist bereits vergeben.');
        setIsLoading(false);
        return;
      }

      if (emailExists) {
        setEmailError('E-Mail ist bereits vergeben.');
        setIsLoading(false);
        return;
      }

      const userRef = editId ? ref(db, `users/${editId}`) : push(ref(db, 'users'));

      let newUser: User = {
        name,
        email,
        password: '',
        userIsAdmin,
      };

      if (editId) {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          showMessage(toastCenter, 'error', "Error", "Benutzer nicht gefunden")
          setIsLoading(false);
          return;
        }
        const existingUser = snapshot.val() as User;

        newUser = {
          ...newUser,
          password: existingUser.password,
        };

        await update(userRef, newUser);
        showMessage(toastCenter, 'success', "Info", "Benutzer erfolgreich aktualisiert")
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        newUser = {
          ...newUser,
          password: hashedPassword,
        };

        await set(userRef, newUser);
        showMessage(toastCenter, 'success', "Info", "User erfolgreich angelegt")
      }
      resetForm();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzers: ', error);
      alert('Ein Fehler ist beim Aktualisieren des Benutzers aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const db = getDatabase(app);
    const usersRef = ref(db, 'users');
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
    setPassword(''); // Make sure password is empty initially
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
    setName('');
    setNameError('');
    setEmail('');
    setEmailError('');
    setPassword('');
    setUserIsAdmin(false);
    setEditId(null);
    setShowPassword(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('Current password and new password are required.');
      return;
    }

    const db = getDatabase(app);
    const userRef = ref(db, `users/${editId}`);

    try {
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        alert('User not found.');
        return;
      }

      const user = snapshot.val() as User;

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        showMessage(toastCenter, 'error', "Error", "Current password is incorrect.")
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await update(userRef, { password: hashedNewPassword });

      setShowChangePasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password: ', error);
      alert('An error occurred while changing the password.');
    }
  };
  const toastCenter = React.useRef(null);

  const showMessage = (ref: React.RefObject<Toast>, severity: ToastMessage['severity'], label: string, summary: string) => {
    ref.current?.show({ severity: severity, summary: label, detail: summary, life: 3000 });
  };

  if (!isLoggedIn)
    return (
      <>
        <h3 className="missing">
          Du musst als Admin eingelogged sein um User zu verwalten.
        </h3>
      </>
    );

  return (
    <div>
      <h2>UserManagement.tsx</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr max-content',
          gap: '10px 20px',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {isAdmin && (
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
            setShowChangePasswordDialog={setShowChangePasswordDialog} // Add this prop
          />
        )}
        <UserList users={users} isAdmin={isAdmin} handleEdit={handleEdit} confirmDelete={confirmDelete} />
        {/* <div
          style={{
            border: '1px dashed #9e5f0c',
            padding: 20,
            width: '100%',
            gridColumnStart: 1,
            gridColumnEnd: 4,
            background: '#ebd0ad24',
            color: '#9e5f0c',
          }}
        >
          To-Do:
          <ul>
            <li>Ueberpruefung Name und Email unique</li>
            <li>Ueberpruefung Email valide</li>
          </ul>
        </div> */}
      </div>
      <ConfirmDeleteDialog visible={showDeleteDialog} setVisible={setShowDeleteDialog} handleDelete={handleDelete} />
      <ChangePasswordDialog
        visible={showChangePasswordDialog}
        setVisible={setShowChangePasswordDialog}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        handleChangePassword={handleChangePassword}
      />
      <Toast ref={toastCenter} position="top-center" />
    </div>
  );
}

export default UserManagement;
