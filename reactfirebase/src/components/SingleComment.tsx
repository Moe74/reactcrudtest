import { Button, Card, Rating } from "@mui/material";
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
    <Card
      style={{
        marginBottom: "10px",
        padding: "16px",
        backgroundColor: "#ffffff",
        borderLeft: "4px solid lightBlue",
        borderTop: "2px solid lightBlue",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: 8,
      }}
    >
      {isLoggedIn && (userIsAdmin || loggedInEmail === email) && (
        <>
          <Button
            onClick={onHandleDelete}
            style={{
              float: "right",
              backgroundColor: "#ff3d00",
              marginLeft: "6px",
            }}
            variant="contained"
          >
            Delete
          </Button>
          <Button
            onClick={onHandleEdit}
            style={{
              float: "right",
              backgroundColor: "#8bc34a",
            }}
            variant="contained"
          >
            Edit
          </Button>
        </>
      )}
      <div style={{ fontWeight: 600 }}>
        {name} <span style={{ fontWeight: 100 }}>({email})</span>
      </div>
      <small>
        am {timestamp ? formatTimestamp(timestamp) : "No timestamp"}
      </small>
      {rating && (
        <div style={{ display: "flex", alignItems: "center" }}>
          Rating: <Rating value={rating} />
        </div>
      )}
      {comment && (
        <div
          style={{
            paddingLeft: 10,
            borderLeft: "3px double rgba(0,0,0,0.2)",
            marginTop: 10,
          }}
        >
          {comment}
        </div>
      )}
      <br />
      <br />
    </Card>
  );
};
export default SingleComment;
