import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { User } from '../UserManagement';

interface UserListProps {
    users: User[];
    isAdmin: boolean;
    handleEdit: (user: User) => void;
    confirmDelete: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, isAdmin, handleEdit, confirmDelete }) => {
    const buttons = (user: User) => (
        <>
            {isAdmin && (
                <>
                    <Button
                        icon="pi pi-pen-to-square"
                        severity="warning"
                        aria-label="Edit"
                        onClick={() => handleEdit(user)}
                        style={{ float: 'left', marginRight: 5 }}
                        tooltip='Edit User'
                        tooltipOptions={{ position: 'left' }}
                    />
                </>
            )}
            <Button
                icon="pi pi-trash"
                severity="danger"
                onClick={() => confirmDelete(user.id!)}
                style={{ float: 'left' }}
                tooltip='Delete User'
                tooltipOptions={{ position: 'right' }}
            />
        </>
    );

    return (
        <div style={{ width: '100%', gridColumnStart: 1, gridColumnEnd: 4 }}>
            <h3>User List</h3>
            <DataTable value={users}>
                <Column field="name" header="Name" />
                <Column field="email" header="Email" />
                <Column field="userIsAdmin" header="Admin" body={(rowData) => (rowData.userIsAdmin ? 'Yes' : 'No')} />
                {isAdmin && <Column header="Actions" body={buttons} style={{ width: 110 }} />}
            </DataTable>
        </div>
    );
};

export default UserList;
