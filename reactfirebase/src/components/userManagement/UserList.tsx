import React from "react";
import { User } from "../UserManagement";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import _ from "lodash";
import ConfirmButton from "../ConfirmButton";
import EditIcon from "@mui/icons-material/Edit";

interface UserListProps {
  users: User[];
  isAdmin: boolean;
  handleEdit: (user: User) => void;
  confirmDelete: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  isAdmin,
  handleEdit,
  confirmDelete,
}) => {
  return (
    <div style={{ width: "100%", gridColumnStart: 1, gridColumnEnd: 4 }}>
      <h3>User List</h3>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="left">Email</TableCell>
              <TableCell align="left">Admin</TableCell>
              {isAdmin && <TableCell width={310}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {_.map(users, (user) => {
              const uId = user.id ?? "";
              return (
                <TableRow key={user.name}>
                  <TableCell component="th" scope="row">
                    {user.name}
                  </TableCell>
                  <TableCell align="left">{user.email}</TableCell>
                  <TableCell align="left">
                    {user.userIsAdmin ? "Yes" : "No"}
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(user)}
                        sx={{ float: "right" }}
                      >
                        Edit User
                      </Button>
                      <ConfirmButton
                        text="Delete"
                        action={() => confirmDelete(uId)}
                        sx={{ float: "left" }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserList;
