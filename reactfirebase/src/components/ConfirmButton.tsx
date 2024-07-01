import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, ButtonGroup, IconButton, SxProps, Theme } from '@mui/material';
import * as React from 'react';

interface ConfirmButtonProps {
    action?: () => void;
    style?: React.CSSProperties | undefined;
    text?: string;
    asIconButton?: boolean;
    sx?: SxProps<Theme>;
}

const ConfirmButton = (p: ConfirmButtonProps) => {
    const { action, style, text, asIconButton, sx } = p;
    const [confirmOpen, setconfirmOpen] = React.useState<boolean>(false);

    const onAction = React.useMemo(() => () => {
        if (action) {
            setconfirmOpen(false);
            action();
        }
    }, [action]);

    return (
        <>
            {asIconButton ?
                <>
                    <IconButton style={style} sx={sx} onClick={() => setconfirmOpen(!confirmOpen)}>
                        {confirmOpen ?
                            <CancelIcon />
                            :
                            <DeleteIcon />
                        }
                    </IconButton>
                    {confirmOpen &&
                        <>
                            <IconButton style={style} sx={sx} onClick={onAction} color='error'>
                                <DeleteIcon />
                            </IconButton>
                        </>
                    }
                </>
                :
                <ButtonGroup style={style} sx={sx}>
                    {confirmOpen &&
                        <Button variant="contained" color="error" onClick={onAction}>
                            <CheckIcon sx={{ mr: 1 }} /> yes
                        </Button>
                    }
                    <Button
                        onClick={() => setconfirmOpen(!confirmOpen)}
                        color={confirmOpen ? undefined : "error"}
                        variant={"contained"}
                        sx={{ background: confirmOpen ? "#000" : undefined }}
                    >
                        {!confirmOpen && <DeleteIcon sx={{ mr: text ? 1 : 0 }} />}
                        {confirmOpen ? "no" : text}
                    </Button>
                </ButtonGroup >
            }
        </>
    );
}
export default ConfirmButton;