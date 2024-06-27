import * as React from "react";
import { useGlobalState } from "./GlobalStates";
import { Button, Rating, TextField } from "@mui/material";
import { calculateAllowRate } from "./Helpers";

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
    onChangeRating: (
        event: React.SyntheticEvent<Element, Event>,
        value: number | null
    ) => void;
    hasGivenRating: boolean;
    isLoading: boolean;
    onResetForm: () => void;
    onSubmitForm: () => void;
    editId: string | null;
}

const CommentForm = (p: CommentFormProps) => {
    const [ratingFigure, setRatingFigure] = React.useState<number>(0);
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
    React.useEffect(() => {
        if (rating) setRatingFigure(rating);
    }, [rating]);

    const [isLoggedIn] = useGlobalState("userIsLoggedIn");
    const [userEmail] = useGlobalState("userEmail");
    const [userIsAdmin] = useGlobalState("userIsAdmin");
    const editMode = editId !== null;
    const userIsAuthor = userEmail === email;
    const allowRate = calculateAllowRate(
        editMode,
        hasGivenRating,
        userIsAuthor,
        userIsAdmin
    );

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
                <TextField label="Name" variant="outlined" value={name} disabled />
            ) : (
                <TextField
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={onChangeName}
                    color={name ? "success" : undefined}
                    error={!name}
                    required
                />
            )}

            <div>Email</div>
            {isLoggedIn ? (
                <TextField label="Email" variant="outlined" value={email} disabled />
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
                    required
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
                    value={ratingFigure ?? undefined}
                    onChange={onChangeRating}
                    disabled={!allowRate}
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
            <Button
                onClick={onResetForm}
                disabled={isLoading}
                variant="contained"
                color="secondary"
                style={{ marginRight: "8px" }}
            >
                Reset
            </Button>
            <Button
                onClick={onSubmitForm}
                disabled={isLoading}
                variant="contained"
                color="primary"
                style={{ marginRight: "8px" }}
            >
                {editId ? "Update" : "Submit"}
            </Button>
        </div>
    );
};
export default CommentForm;
