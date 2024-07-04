import EditIcon from "@mui/icons-material/Edit";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import _ from "lodash";
import React from "react";
import ConfirmButton from "../ConfirmButton";
import { User } from "../UserManagement";

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
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
        <TableHead>
          <TableRow>
            <TableCell >Name</TableCell>
            <TableCell align="left">Email</TableCell>
            <TableCell align="left">Admin</TableCell>
            {isAdmin && <TableCell style={{ width: 125 }} sx={{ padding: "5px 0" }} />}
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
                  <TableCell sx={{ padding: "5px 0" }}>
                    <IconButton
                      onClick={() => handleEdit(user)}
                      sx={{ float: "right" }}
                    >
                      <EditIcon />
                    </IconButton>
                    <ConfirmButton
                      text="Delete"
                      action={() => confirmDelete(uId)}
                      sx={{ float: "right" }}
                      asIconButton
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserList;
