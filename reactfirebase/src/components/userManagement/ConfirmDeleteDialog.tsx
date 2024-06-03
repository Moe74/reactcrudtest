import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface ConfirmDeleteDialogProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    handleDelete: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
    visible,
    setVisible,
    handleDelete,
}) => (
    <Dialog
        header="Confirm Delete"
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
        footer={
            <>
                <Button label="No" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
                <Button label="Yes" icon="pi pi-check" onClick={handleDelete} autoFocus />
            </>
        }
    >
        <p>Are you sure you want to delete this user?</p>
    </Dialog>
);

export default ConfirmDeleteDialog;
