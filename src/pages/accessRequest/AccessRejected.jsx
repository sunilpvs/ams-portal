import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AccessRejected = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#000",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    maxWidth: 500,
                    width: "100%",
                    bgcolor: "#fff",
                    borderRadius: 3,
                    p: 5,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                    }}
                >
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: 700, color: "#b00020", fontSize: "2rem" }}
                    >
                        Access Request Rejected
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "#444", fontSize: "1.1rem" }}
                    >
                        Unfortunately, your access request to the Vendor Management System (VMS) Portal was rejected by the IT administrator.
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ mb: 4, color: "#666", fontSize: "1rem" }}
                    >
                        Please contact your administrator for further assistance.
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/login")}
                        sx={{
                            backgroundColor: "#000",
                            color: "#fff",
                            fontSize: "1rem",
                            px: 4,
                            py: 1.2,
                            "&:hover": {
                                backgroundColor: "#222",
                            },
                        }}
                    >
                        Back to Login
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AccessRejected;
 
 