import { useGlobalState } from './GlobalStates';
import { formatTimestamp } from './Helpers';

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
    const { onHandleEdit, onHandleDelete, email, name, timestamp, rating, comment } = p;
    const [isLoggedIn] = useGlobalState("userIsLoggedIn");
    const [userIsAdmin] = useGlobalState("userIsAdmin");
    const [loggedInEmail] = useGlobalState("userEmail");
    return (
        <div
            style={{
                marginBottom: 10,
                borderTop: "1px solid grey",
                padding: 10,
            }}
        >
            {isLoggedIn && (userIsAdmin || (loggedInEmail === email)) && (
                <>
                    <button
                        onClick={onHandleEdit}
                        className="btn"
                        style={{ float: "right" }}
                    >
                        Edit
                    </button>
                    <button
                        onClick={onHandleDelete}
                        className="btn"
                        style={{ float: "right" }}
                    >
                        Delete
                    </button>
                </>
            )}
            <div style={{ fontWeight: 600 }}>
                {name}{" "}
                <span style={{ fontWeight: 100 }}>({email})</span>
            </div>
            <small>
                am{" "}
                {timestamp
                    ? formatTimestamp(timestamp)
                    : "No timestamp"}
            </small>
            {rating && <div>Rating: {rating}</div>}
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
        </div>
    );
}
export default SingleComment;