"use client";
import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
import { useSelector } from 'react-redux';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { AppState } from "@/store/store";
import "@/utils/i18n";
import "@/app/api/index";
import "@/app/assets/css/app.css";
import UserAuthContext from "./components/context/UserAuthContext";
import { favoriteListType } from "./components/context/UserAuthContext";

const MyApp = ({ children }: { children: React.ReactNode }) => {
    const theme = ThemeSettings();
    const customizer = useSelector((state: AppState) => state.customizer);
    const [authInfo, setAuthInfo] = useState({})
    const [contextFavoriteList, setContextFavoriteList] = useState<favoriteListType[]>([]);

    const setUserAuthInfo = (auth: any) => {
        setAuthInfo(auth);
    }

    const resetAuthInfo = () => {
        setAuthInfo({});
    }

    return (
        <>
            <UserAuthContext.Provider value={ {authInfo, setUserAuthInfo, resetAuthInfo, contextFavoriteList, setContextFavoriteList }}>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}
                </ThemeProvider>
            </AppRouterCacheProvider>
            </UserAuthContext.Provider>
        </>
    );
};

export default MyApp;
