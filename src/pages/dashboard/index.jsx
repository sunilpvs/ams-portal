import {
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmittedRfqCount, getActiveVendorCount } from "../../services/vms/dashboardCountService";

// Icons
import TrafficIcon from "@mui/icons-material/Traffic";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";

const Dashboard = () => {
  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [entityCount, setEntityCount] = useState(0);
  const [submittedRfqCount, setSubmittedRfqCount] = useState(0);
  const [activeVendorCount, setActiveVendorCount] = useState(0);

  useEffect(() => {
    const response = async () => {
      try {
        const rfqCountResponse = await getSubmittedRfqCount();
        const activeVendorCountResponse = await getActiveVendorCount();
        setSubmittedRfqCount(rfqCountResponse.data.submitted_count || 0);
        setActiveVendorCount(activeVendorCountResponse.data.active_vendor_count || 0);
      }
      catch (error) {
        console.error("Error fetching submitted RFQ count:", error);
      }
    };
    response();
  }, []);



  return (
    <Box m="20px">
      {/* HEADER */}
      <Box
        display={smScreen ? "flex" : "block"}
        flexDirection={smScreen ? "row" : "column"}
        justifyContent={smScreen ? "space-between" : "start"}
        alignItems={smScreen ? "center" : "start"}
        m="10px 0"
      >
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

     {/* GRID & STATBOXES */}
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {/* Pending Access Requests */}
       


       

        {/* EXTRA BOXES */}
        {[
         
        
      
        ].map((item, index) => (
          <Grid xs={12} sm={6} md={4} key={index}>
            <Box
              backgroundColor="#1F2A40"
              borderRadius="16px"
              p={3}
              textAlign="center"
              boxShadow="0px 2px 6px rgba(0,0,0,0.1)"
              minHeight="180px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Typography
                variant="h6"
                fontWeight="600"
                color="#4CCEAC"
                mb={1}
                fontSize="20px"
              >
                {item.title}
              </Typography>

              <Typography
                variant="body1"
                color="#edededff"
                fontSize="18px"
                mb={1.5}
                sx={{ lineHeight: 1.4 }}
              >
                {item.desc}
              </Typography>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#4CCEAC",
                  color: "#231e1eff",
                  "&:hover": { backgroundColor: "#feffffff" },
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "6px 16px",
                  marginTop: "4px",
                }}
                onClick={() => navigate(item.route)}
              >
                Go to {item.title}
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
