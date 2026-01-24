import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
} from "@mui/material";
import { sendAccessRequest } from "../../services/admin/accessReqService"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

const ReqAccess = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRequestAccess = async () => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                requested_module: 4,
            };
            const response = await sendAccessRequest(payload);
            console.log("Access request response:", response);

            if (response?.status === 201) {
                setSuccess(true);
            } else {
                setError("Something went wrong...");
            }
        } catch (err) {
            console.error("Access request error:", err);
            setError(err?.response?.data?.error || "Server error.");
        } finally {
            setLoading(false);
        }
    };

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
                        sx={{ fontWeight: 700, color: "#111", fontSize: "2rem" }}
                    >
                        Access Request Required
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "#444", fontSize: "1.1rem" }}
                    >
                        You currently do not have access to the Vendor Management System (VMS) Portal.
                    </Typography>

                    {success ? (
                        <>
                            <Alert severity="success" sx={{ fontSize: "1rem", width: "100%" }}>
                                Your request has been submitted successfully.
                            </Alert>
                            <Button
                                variant="contained"
                                onClick={() => navigate("/login")}
                                sx={{
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    fontSize: "1rem",
                                    px: 4,
                                    mt: 2,
                                    py: 1.2,
                                    "&:hover": {
                                        backgroundColor: "#222",
                                    },
                                }}
                            >
                                Back to Login
                            </Button>
                        </>

                    ) : (
                        <>
                            <Typography
                                variant="body1"
                                sx={{ mb: 3, color: "#555", fontSize: "1.05rem" }}
                            >
                                Please submit an access request to proceed.
                            </Typography>

                            <Button
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                onClick={handleRequestAccess}
                                sx={{
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    fontSize: "1rem",

                                    py: 1.2,
                                    "&:hover": {
                                        backgroundColor: "#222",
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    "Submit Access Request"
                                )}
                            </Button>
                        </>
                    )}

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mt: 3, fontSize: "1rem", width: "100%" }}
                        >
                            {error}
                        </Alert>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default ReqAccess;
 
 