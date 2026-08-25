import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { currentDoctor, getNotifications } from "../../data/doctorMockData";
import {
  BellIcon,
  CalendarIcon,
  DashboardIcon,
  HeartPulseIcon,
  LogOutIcon,
  UsersIcon,
} from "../common/Icons";

export default function DoctorLayout({ children, activePageTitle = "Doctor Dashboard" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = getNotifications();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out from the Doctor Portal?")) {
      if (logout) logout();
      navigate("/login");
    }
  };

  const isActive = (path) => {
    if (path === "/doctor/dashboard") {
      return location.pathname === "/doctor" || location.pathname === "/doctor/dashboard" || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="doctor-dashboard-layout">
      {/* 1. Clean Compact Sidebar (220-240px) */}
      <aside className="doctor-sidebar-compact">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <HeartPulseIcon size={22} />
          </div>
          <span className="brand-text">HealthSaathi</span>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-menu">
          <Link
            to="/doctor/dashboard"
            className={`sidebar-link ${isActive("/doctor/dashboard") ? "active" : ""}`}
          >
            <DashboardIcon size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/doctor/patients"
            className={`sidebar-link ${isActive("/doctor/patients") ? "active" : ""}`}
          >
            <UsersIcon size={18} />
            <span>Patients</span>
          </Link>

          <Link
            to="/doctor/appointments"
            className={`sidebar-link ${isActive("/doctor/appointments") ? "active" : ""}`}
          >
            <CalendarIcon size={18} />
            <span>Appointments</span>
          </Link>

          <Link
            to="/doctor/follow-ups"
            className={`sidebar-link ${isActive("/doctor/follow-ups") ? "active" : ""}`}
          >
            <CalendarIcon size={18} />
            <span>Follow-ups</span>
          </Link>

          <button className="sidebar-link sidebar-logout-link" onClick={handleLogout}>
            <LogOutIcon size={18} />
            <span>Logout</span>
          </button>
        </nav>

        {/* Doctor Bottom Profile */}
        <div className="sidebar-doctor-profile">
          <div className="doc-avatar-circle">{currentDoctor.avatarInitials || "DR"}</div>
          <div className="doc-profile-text">
            <span className="doc-name">{currentDoctor.name}</span>
            <span className="doc-role">{currentDoctor.title}</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="doctor-main-panel">
        {/* Simple Top Header Bar */}
        <header className="doctor-top-bar">
          <div>
            <h1 className="main-title">{activePageTitle}</h1>
            <p className="main-greeting">Good morning, {currentDoctor.name}</p>
          </div>

          <div className="top-bar-actions">
            <button
              className="notification-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <BellIcon size={20} />
              <span className="bell-badge-dot"></span>
            </button>

            {showNotifications && (
              <div className="notif-dropdown-box">
                <div className="notif-box-head">
                  <strong>Notifications</strong>
                  <button
                    className="notif-close-x"
                    onClick={() => setShowNotifications(false)}
                  >
                    ✕
                  </button>
                </div>
                <ul className="notif-box-list">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <span className="notif-time">{n.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Page Children */}
        <main className="doctor-main-scroll">{children}</main>
      </div>
    </div>
  );
}
