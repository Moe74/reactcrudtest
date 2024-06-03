import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

interface ChangePasswordDialogProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    currentPassword: string;
    setCurrentPassword: (currentPassword: string) => void;
    newPassword: string;
    setNewPassword: (newPassword: string) => void;
    handleChangePassword: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
    visible,
    setVisible,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    handleChangePassword,
}) => (
    <Dialog
        header="Change Password"
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
        footer={
            <>
                <Button label="Cancel" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
                <Button label="Change" icon="pi pi-check" onClick={handleChangePassword} autoFocus />
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
                    style={{ width: '100%' }}
                />
            </div>
            <div>
                <label htmlFor="newPassword">New Password</label>
                <InputText
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    </Dialog>
);

export default ChangePasswordDialog;
