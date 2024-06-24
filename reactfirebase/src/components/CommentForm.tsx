import * as React from "react";
import { useGlobalState } from "./GlobalStates";
import { RatingChangeEvent } from "primereact/rating";
import { Rating, TextField } from "@mui/material";

interface CommentFormProps {
    emailError: string | null;
    ratingError: string | null;
    name: string;
    onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
    email: string;
    onChangeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
    comment: string | null;
    onChangeComment: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rating: number | null;
    // onChangeRating: (e: RatingChangeEvent) => void;
    onChangeRating: ((event: React.SyntheticEvent<Element, Event>, value: number | null) => void)
    hasGivenRating: boolean;
    isLoading: boolean;
    onResetForm: () => void;
    onSubmitForm: () => void;
    editId: string | null;
}

const CommentForm = (p: CommentFormProps) => {
    const {
        emailError,
        ratingError,
        name,
        onChangeName,
        email,
        onChangeEmail,
        comment,
        onChangeComment,
        rating,
        onChangeRating,
        hasGivenRating,
        isLoading,
        onResetForm,
        onSubmitForm,
        editId,
    } = p;
    const [isLoggedIn] = useGlobalState("userIsLoggedIn");
    const [userEmail] = useGlobalState("userEmail");
    const [userIsAdmin] = useGlobalState("userIsAdmin");

    const allowRate =
        (editId && userEmail === email && !hasGivenRating)
        || (editId && userIsAdmin && !hasGivenRating)
        || (!editId && !hasGivenRating)
        ;

    const ratingIsDisabled = !editId ? (hasGivenRating ? true : false) : ((userEmail === email) && hasGivenRating ? true : userIsAdmin && hasGivenRating ? true : false);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                gap: "10px 20px",
                alignItems: "center",
            }}
        >
            <div />
            {isLoggedIn ? (
                <TextField
                    label="Name"
                    variant="outlined"
                    value={name}
                    disabled
                />
            ) : (
                <TextField
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={onChangeName}
                    color={name ? "success" : undefined}
                    error={!name}
                />
            )}

            <div>Email</div>
            {isLoggedIn ? (
                <TextField
                    label="Email"
                    variant="outlined"
                    value={email}
                    disabled
                />
            ) : (
                <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    value={email}
                    onChange={onChangeEmail}
                    color={!emailError ? "success" : undefined}
                    error={!email || emailError !== null}
                    helperText={emailError ?? undefined}
                />
            )}

            <div>Comment (optional)</div>
            <TextField
                label="Comment (optional)"
                variant="outlined"
                value={comment || ""}
                onChange={onChangeComment}
                multiline
                minRows={2}
                maxRows={4}
            />

            <div>Rating (optional, 1-5)</div>
            <div>
                {/* <Rating
                    value={rating ?? undefined}
                    cancel={false}
                    onChange={onChangeRating}
                    disabled={!allowRate}
                /> */}
                <Rating
                    value={rating ?? undefined}
                    onChange={onChangeRating}
                // disabled={!allowRate}
                // disabled={ratingIsDisabled}


                />
            </div>
            {ratingError && (
                <>
                    <div />
                    <div className="missing">{ratingError}</div>
                </>
            )}

            {hasGivenRating && (
                <>
                    <div />
                    <div className="info">
                        You have already given a rating for this recipe.
                    </div>
                </>
            )}

            <button onClick={onResetForm} disabled={isLoading} className="btn">
                Reset
            </button>
            <button
                onClick={onSubmitForm}
                disabled={isLoading || !name || !email || (!comment && rating === null)}
                className="btn"
            >
                {editId ? "Update" : "Submit"}
            </button>
        </div>
    );
};
export default CommentForm;
