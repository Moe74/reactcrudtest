import { Alert, Button, Rating, TextField } from "@mui/material";
import * as React from "react";
import { useGlobalState } from "./GlobalStates";
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
    const [ratingFigure, setRatingFigure] = React.useState<number | null>(0);
    const [disableSend, setDisableSend] = React.useState<boolean>(true);


    const { emailError, ratingError, name, onChangeName, email, onChangeEmail, comment, onChangeComment, rating, onChangeRating, hasGivenRating, isLoading, onResetForm, onSubmitForm, editId, } = p;


    React.useEffect(() => {
        if (name && email && !(rating === null && comment === null))
            setDisableSend(false);
    }, [email, name, rating, comment]);

    React.useEffect(() => {
        setRatingFigure(null);
        if (rating)
            setRatingFigure(rating);
    }, [rating, ratingFigure]);



    const [isLoggedIn] = useGlobalState("userIsLoggedIn");
    const [userEmail] = useGlobalState("userEmail");
    const [userIsAdmin] = useGlobalState("userIsAdmin");
    const editMode = editId !== null;
    const userIsAuthor = userEmail === email;
    const allowRate = calculateAllowRate(editMode, hasGivenRating, userIsAuthor, userIsAdmin);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr",
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



            <div>
                {editId ?
                    (ratingFigure && ratingFigure > 0) ?
                        allowRate ?
                            <TextField
                                label="Deine Bewertung"
                                InputProps={{
                                    startAdornment: (
                                        <Rating value={ratingFigure ?? undefined} onChange={onChangeRating} />
                                    )
                                }}
                                variant="outlined"
                                fullWidth
                                error={ratingError !== null}
                                helperText={ratingError ?? undefined}
                            />
                            :
                            <Alert severity="info">Du kanst für dieses Rezept kein weiteres Rating abgeben</Alert>
                        :
                        <Alert severity="info">Du kanst für dieses Rezept kein weiteres Rating abgeben</Alert>
                    :
                    hasGivenRating ?
                        <Alert severity="info">Du kanst für dieses Rezept kein weiteres Rating abgeben</Alert>
                        :
                        <TextField
                            label="Deine Bewertung"
                            InputProps={{
                                startAdornment: (
                                    <Rating value={ratingFigure ?? undefined} onChange={onChangeRating} />
                                )
                            }}
                            variant="outlined"
                            fullWidth
                            error={ratingError !== null}
                            helperText={ratingError ?? undefined}
                        />
                }
            </div>

            <TextField
                label="Kommentar"
                variant="outlined"
                value={comment || ""}
                onChange={onChangeComment}
                multiline
                minRows={2}
                maxRows={4}
            />
            <div>
                <Button
                    onClick={onResetForm}
                    disabled={isLoading}
                    variant="contained"
                    color="primary"
                    style={{ marginRight: "8px", float: "left", width: "max-content" }}
                >
                    Reset
                </Button>
                <Button
                    onClick={onSubmitForm}
                    disabled={isLoading || disableSend}
                    variant="contained"
                    color="success"
                    style={{ marginRight: "8px", float: "right", width: "max-content" }}
                >
                    {editId ? "Update" : "Submit"}
                </Button>
            </div>
        </div>
    );
};
export default CommentForm;
