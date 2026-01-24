import React, { useState, useContext, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import {
  useTheme,
  Box,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Badge,
  Typography,
} from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useProSidebar } from "react-pro-sidebar";
import { logoutUser } from "../../services/auth/auth";
import { getSubmittedRfqCount } from "../../services/vms/dashboardCountService";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { toggleSidebar, broken, rtl } = useProSidebar();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [submittedRfqCount, setSubmittedRfqCount] = useState(0);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    handleUserMenuClose();
  };

  const handleActivityLogClick = () => {
    navigate("/activity");
    handleUserMenuClose();
  };

  const handleLogoutClick = async () => {
    await logoutUser();
    handleUserMenuClose();
  };

  const handleNotificationClick = () => {
    navigate("/rfq-list");
  };

  // refresh every 30 seconds
  useEffect(() => {
    const response = async () => {
      try {
        const rfqCountResponse = await getSubmittedRfqCount();
        setSubmittedRfqCount(rfqCountResponse.data.submitted_count || 0);
      }
      catch (error) {
        console.error("Error fetching submitted RFQ count:", error);
      }
    };
    response();
    const interval = setInterval(response, 30000); // 30 seconds
    return () => clearInterval(interval);
  },

    []);

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* Left: Sidebar Toggle + Search */}
      <Box display="flex" alignItems="center">
        {broken && !rtl && (
          <IconButton sx={{ mr: 1 }} onClick={() => toggleSidebar()}>
            <MenuOutlinedIcon />
          </IconButton>
        )}

        <Box
          display="flex"
          backgroundColor={colors.primary[400]}
          p={0.2}
          borderRadius={1}
          alignItems="center"
        >
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search" />
          <IconButton type="button">
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Right: Icons */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* Light/Dark mode toggle */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>

        {/* Notifications with badge */}
        <IconButton onClick={handleNotificationClick}>
          <Badge
            badgeContent={submittedRfqCount}
            color="error"
            showZero // ✅ Always show badge
          >
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>

        {/* Settings */}
        {/* <IconButton>
            <SettingsOutlinedIcon />
          </IconButton> */}

        {/* User Menu */}
        <IconButton
          onClick={handleUserMenuOpen}
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <PersonOutlinedIcon />
        </IconButton>

        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
          <MenuItem onClick={handleActivityLogClick}>Activity Log</MenuItem>
          <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
        </Menu>

        {broken && rtl && (
          <IconButton sx={{ ml: 1 }} onClick={() => toggleSidebar()}>
            <MenuOutlinedIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default Topbar;

