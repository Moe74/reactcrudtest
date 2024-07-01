import EditIcon from '@mui/icons-material/Edit';
import { Card, CardActionArea, CardContent, CardHeader, IconButton, Paper, Rating } from "@mui/material";
import ConfirmButton from "./ConfirmButton";
import { useGlobalState } from "./GlobalStates";
import { formatTimestamp } from "./Helpers";

interface SingleCommentProps {
  onHandleEdit: () => void;
  onHandleDelete: () => void;
  email: string;
  name: string;
  timestamp?: string | undefined;
  rating?: number | null | undefined;
  comment?: string | null | undefined;
}

const SingleComment = (p: SingleCommentProps) => {
  const {
    onHandleEdit,
    onHandleDelete,
    email,
    name,
    timestamp,
    rating,
    comment,
  } = p;
  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [userIsAdmin] = useGlobalState("userIsAdmin");
  const [loggedInEmail] = useGlobalState("userEmail");
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title={name}
        subheader={`am ${timestamp ? formatTimestamp(timestamp) : "No timestamp"}`}
        action={isLoggedIn && (userIsAdmin || loggedInEmail === email) ?
          <CardActionArea sx={{ pt: 1, pb: 1 }}>
            <IconButton sx={{ float: "right", mr: 1 }} onClick={onHandleEdit} >
              <EditIcon />
            </IconButton>
            <ConfirmButton sx={{ float: "right", ml: 2, mr: 1 }} asIconButton action={onHandleDelete} />
          </CardActionArea>
          : undefined
        }
      />
      <CardContent>

        {rating && (
          <Rating value={rating} size='large' sx={{ mt: -2 }} readOnly />
        )}
        {comment && (
          <Paper elevation={3} sx={{ p: 3, mt: rating ? 2 : 0 }}>
            {comment}
          </Paper>
        )}
      </CardContent>
      {/* {isLoggedIn && (userIsAdmin || loggedInEmail === email) &&
        <CardActionArea sx={{ pt: 1, pb: 1 }}>
          <IconButton sx={{ float: "right", mr: 1 }} onClick={onHandleEdit} >
            <EditIcon />
          </IconButton>
          <ConfirmButton sx={{ float: "left", ml: 1 }} asIconButton action={onHandleDelete} />
        </CardActionArea>
      } */}
    </Card>
  );
};
export default SingleComment;
