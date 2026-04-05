import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavComponent from './NavComponent';

const Userlayout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    return (
        <div className="flex flex-col min-h-screen">
            <NavComponent solid={!isHome} />
            <Outlet />
        </div>
    );
};

export default Userlayout;