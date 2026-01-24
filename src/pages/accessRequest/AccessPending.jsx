import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AccessPending = () => {
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
                sx={{ fontWeight: 700, color: "#111", fontSize: "2rem" }}
            >
              Access Request Pending
            </Typography>

            <Typography
                variant="body1"
                sx={{ mb: 3, color: "#444", fontSize: "1.1rem" }}
            >
              Your access request has been submitted and is currently under review
              by the administrator.
            </Typography>

            <Typography
                variant="body2"
                sx={{ mb: 4, color: "#666", fontSize: "1rem" }}
            >
              You will be notified once your access is approved.
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

export default AccessPending;
 
 