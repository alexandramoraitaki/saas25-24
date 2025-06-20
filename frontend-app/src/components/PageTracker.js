// src/components/PageTracker.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PageTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const excluded = ["/login", "/"]; // μην αποθηκεύεις login
        const history = JSON.parse(localStorage.getItem("customHistory")) || [];

        const last = history[history.length - 1];
        const current = location.pathname;

        if (!excluded.includes(current) && current !== last) {
            localStorage.setItem("customHistory", JSON.stringify([...history, current]));
        }
    }, [location.pathname]);

    return null;
};

export default PageTracker;
