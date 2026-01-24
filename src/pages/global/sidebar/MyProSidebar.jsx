// docs https://github.com/azouaoui-med/react-pro-sidebar
import {useContext, useState} from "react";
import { Menu, Sidebar, MenuItem, SubMenu } from "react-pro-sidebar";
import { useProSidebar } from "react-pro-sidebar";

import { useSidebarContext } from "./sidebarContext";

import { AppContext } from "../../../context/AppContext";

import { Link } from "react-router-dom";
import { tokens } from "../../../theme";
import { useTheme, Box, Typography, IconButton } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SwitchRightOutlinedIcon from "@mui/icons-material/SwitchRightOutlined";
import SwitchLeftOutlinedIcon from "@mui/icons-material/SwitchLeftOutlined";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ReplayIcon from "@mui/icons-material/Replay";

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    return (
        <MenuItem
            active={selected === title}
            style={{ color: colors.grey[100] }}
            onClick={() => setSelected(title)}
            icon={icon}
            routerLink={<Link to={to} />}
        >
            <Typography>{title}</Typography>
        </MenuItem>
    );
};

const MyProSidebar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [selected, setSelected] = useState("Dashboard");
    const { sidebarRTL, setSidebarRTL, sidebarImage } = useSidebarContext();
    const { collapseSidebar, toggleSidebar, collapsed, broken } = useProSidebar();
    const isDark = theme.palette.mode === 'dark';

    const { userData } = useContext(AppContext);

    return (

        <Box
            sx={{
                position: "sticky",
                display: "flex",
                height: "100vh",
                top: 0,
                bottom: 0,
                zIndex: 10000,
                "& .sidebar": {
                    border: "none",
                },
                "& .menu-icon": {
                    backgroundColor: "transparent !important",
                },
                "& .menu-item": {
                    color: `${theme.palette.mode === 'dark' ? colors.greenAccent[500] : colors.grey[100]} !important`,
                    backgroundColor: "transparent !important",
                },

                "& .menu-anchor": {
                    color: `${isDark ? colors.greenAccent[500] : colors.grey[100]} !important`,
                    backgroundColor: "transparent !important",
                    transition: "color 0.2s ease",
                },

                "& .menu-anchor:hover": {
                    color: `${isDark ? colors.blueAccent[500] : colors.primary[700]} !important`,
                    backgroundColor: "transparent !important",
                },

                "& .menu-anchor.ps-active": {
                    color: `${colors.greenAccent[500]} !important`,
                },

                "& .menu-item:hover": {
                    color: `${colors.blueAccent[500]} !important`,
                    backgroundColor: "transparent !important",
                },
                "& .menu-item.active": {
                    color: `${colors.greenAccent[500]} !important`,
                    backgroundColor: "transparent !important",
                },
                "& .ps-submenu-content, & .daWgIu": {
                    backgroundColor: "transparent !important",
                    boxShadow: "none !important",
                    border: "none !important",
                    paddingLeft: "20px !important",
                },
                "& .ps-submenu-content .menu-item.active": {
                    color: `${colors.blueAccent[500]} !important`, // blue active submenu item
                    backgroundColor: "transparent !important",
                },
            }}
        >
            <Sidebar
                breakPoint="md"
                rtl={sidebarRTL}
                backgroundColor={colors.primary[400]}
                image={sidebarImage}
            >
                <Menu iconshape="square">
                    <MenuItem
                        icon={
                            collapsed ? (
                                <MenuOutlinedIcon onClick={() => collapseSidebar()} />
                            ) : sidebarRTL ? (
                                <SwitchLeftOutlinedIcon
                                    onClick={() => setSidebarRTL(!sidebarRTL)}
                                />
                            ) : (
                                <SwitchRightOutlinedIcon
                                    onClick={() => setSidebarRTL(!sidebarRTL)}
                                />
                            )
                        }
                        style={{
                            margin: "10px 0 20px 0",
                            color: colors.grey[100],
                        }}
                    >
                        {!collapsed && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                ml="15px"
                            >
                                <Typography variant="h3" color={colors.grey[100]}>
                                    {userData?.user_role}
                                </Typography>
                                <IconButton
                                    onClick={
                                        broken ? () => toggleSidebar() : () => collapseSidebar()
                                    }
                                >
                                    <CloseOutlinedIcon />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    {!collapsed && (
                        <Box mb="25px">
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                sx={{
                                    "& .avater-image": {
                                        backgroundColor: colors.primary[500],
                                    },
                                }}
                            >
                                <img
                                    className="avater-image"
                                    alt="profile user"
                                    width="100px"
                                    height="100px"
                                    src={userData?.profile_pic ? `data:image/jpeg;base64,${userData.profile_pic}` : "/assets/vms-user-logo.svg"}
                                    style={{ cursor: "pointer", borderRadius: "50%", objectFit: "cover" }}
                                />
                            </Box>
                            <Box textAlign="center">
                                <Typography
                                    variant="h3"
                                    color={colors.grey[100]}
                                    fontWeight="bold"
                                    sx={{ m: "10px 0 0 0" }}
                                >
                                    {userData?.f_name+" "+userData?.l_name}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Box paddingLeft={collapsed ? undefined : "10%"}>
                        <Item
                            title="VMS Dashboard"
                            to="/"
                            icon={<HomeOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="RFI List"
                            to="/rfq-list"
                            icon={<RequestQuoteOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Item
                            title="Create RFI"
                            to="/initiate-vendor"
                            icon={<PersonAddAltIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Item
                            title="Review Pending RFIs"
                            to="/review-vendor"
                            icon={<HowToRegIcon />} // or use <FactCheckIcon />
                            selected={selected}
                            setSelected={setSelected}
                        />
                   
                        <Item
                            title="Vendors List"
                            to="/vendor-list"
                            icon={<PeopleAltOutlinedIcon />}   // ✅ New icon here
                            selected={selected}
                            setSelected={setSelected}
                        />

                      

                        <Item
                            title="Reports"
                            to="#"
                            icon={<BarChartOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                      

                      


                    </Box>
                </Menu>
            </Sidebar>
        </Box>
    );
};

export default MyProSidebar;

