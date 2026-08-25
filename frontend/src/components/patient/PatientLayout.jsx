import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { unwrap } from "../../utils/format";
import PatientSidebar from "./PatientSidebar";
import PatientNavbar from "./PatientNavbar";

export default function PatientLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Redirect to login when logged out (e.g. after sidebar Logout click)
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // Unread badge for the bell icon
  useEffect(() => {
    let cancelled = false;
    api
      .get("/patients/me/notifications")
      .then((res) => {
        if (!cancelled) {
          const list = unwrap(res, []);
          setUnreadCount(
            Array.isArray(list) ? list.filter((n) => !n.read).length : 0
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="hs-layout">
      <PatientSidebar onNavigate={closeMenu} />
      <div
        className={`hs-overlay${menuOpen ? " show" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div className="hs-main">
        <PatientNavbar
          userName={user?.name || "Patient"}
          unreadCount={unreadCount}
          onMenuClick={() => setMenuOpen((v) => !v)}
        />
        <main className="hs-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
