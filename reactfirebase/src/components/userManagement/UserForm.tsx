import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';

interface UserFormProps {
    name: string;
    setName: (name: string) => void;
    email: string;
    setEmail: (email: string) => void;
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
    setShowChangePasswordDialog, // Add this prop
}) => {
    const saveable = name && email && (password || editId);

    return (
        <>
            <div>Name</div>
            <div>
                <InputText
                    id="name"
                    style={{ width: '100%' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    invalid={!name}
                    variant={!name ? 'filled' : undefined}
                    autoComplete="off"
                />
                {nameError && <small style={{ color: 'red' }}>{nameError}</small>}
            </div>
            <div>
                {!name && (
                    <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />
                )}
            </div>
            <div>E-Mail</div>
            <div>
                <InputText
                    id="email"
                    style={{ width: '100%' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    invalid={!email}
                    variant={!email ? 'filled' : undefined}
                    autoComplete="off"
                />
                {emailError && <small style={{ color: 'red' }}>{emailError}</small>}
            </div>
            <div>
                {!email && (
                    <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />
                )}
            </div>
            {!editId && (
                <>
                    <div>Password</div>
                    <div>
                        <InputText
                            id="password"
                            style={{ width: '100%' }}
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            invalid={!password}
                            variant={!password ? 'filled' : undefined}
                            autoComplete="new-password"
                        />
                    </div>
                    <div>
                        {!password && (
                            <span className="pi pi-exclamation-circle" style={{ color: '#D13438', fontSize: '1.5rem' }} />
                        )}
                    </div>
                    <div style={{ gridColumnStart: 2, gridColumnEnd: 4 }}>
                        <Checkbox
                            inputId="showPassword"
                            value="showPassword"
                            onChange={(e) => setShowPassword(!showPassword)}
                            checked={showPassword}
                        />
                        <label style={{ marginLeft: '10px' }} htmlFor="showPassword" className="ml-2">
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
                            <Checkbox onChange={() => setUserIsAdmin(!userIsAdmin)} checked={userIsAdmin} />
                        </span>
                        <InputText
                            value={userIsAdmin ? 'ja' : 'nein'}
                            style={{ width: '100%', color: '#323130', pointerEvents: 'none' }}
                            variant="filled"
                        />
                    </div>
                </div>
            </div>
            <div style={{ gridColumnStart: 1, gridColumnEnd: 4, background: '#323130', height: 1 }} />
            <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
                <Button
                    onClick={handleSubmit}
                    disabled={!saveable}
                    className="btn"
                    label={saveable ? 'Submit' : 'MISSING DATA'}
                    style={{ float: 'right' }}
                    severity={saveable ? 'success' : 'danger'}
                    outlined={!saveable}
                    icon={saveable ? "pi pi-check" : "pi pi-exclamation-circle"}
                />
                <Button
                    onClick={resetForm}
                    disabled={isLoading}
                    className="btn"
                    label={'Reset'}
                    style={{ float: 'right', marginRight: '20px' }}
                    icon="pi pi-times"
                />
                {editId && (
                    <Button
                        label="Change Password"
                        severity="info"
                        onClick={() => setShowChangePasswordDialog(true)}
                        style={{ float: 'left', marginRight: '20px' }}
                        icon="pi pi-key"
                    />
                )}
            </div>
        </>
    );
};

export default UserForm;
