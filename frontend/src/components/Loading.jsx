import React from "react";
import { Activity } from "lucide-react";

export default function Loading({ message = "Checking your session..." }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--bg-main)",
      gap: "1.25rem"
    }}>
      <div style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "4px solid var(--primary-100)",
          borderTopColor: "var(--primary-600)",
          animation: "spin 0.8s linear infinite"
        }} />
        <Activity 
          size={24} 
          style={{
            position: "absolute",
            color: "var(--primary-600)",
            animation: "pulse 1.5s ease-in-out infinite"
          }}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <h2 style={{
          fontSize: "1.35rem",
          fontWeight: "700",
          color: "var(--slate-900)",
          marginBottom: "0.25rem"
        }}>
          Health<span style={{ color: "var(--primary-600)" }}>Saathi</span>
        </h2>
        <p style={{
          fontSize: "0.95rem",
          color: "var(--slate-500)",
          fontWeight: "500"
        }}>
          {message}
        </p>
      </div>
    </div>
  );
}
