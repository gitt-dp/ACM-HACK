import React from 'react';

export default function SchemeCard({ scheme }) {
  if (!scheme) return null;

  // Parse eligibility criteria if it's a string
  const criteria = typeof scheme.eligibility_criteria === 'string' 
    ? JSON.parse(scheme.eligibility_criteria) 
    : scheme.eligibility_criteria;

  return (
    <div style={{
      background: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "16px",
      color: "#fff"
    }}>
      {/* Scheme Name */}
      <h3 style={{
        fontSize: "20px",
        fontWeight: "700",
        marginBottom: "8px",
        color: "#fff"
      }}>
        {scheme.name || "Scheme Name"}
      </h3>

      {/* Description */}
      {scheme.description && (
        <p style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.9)",
          marginBottom: "12px",
          lineHeight: "1.5"
        }}>
          {scheme.description}
        </p>
      )}

      {/* Benefit */}
      {scheme.benefit && (
        <div style={{
          background: "rgba(255,255,255,0.15)",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "12px"
        }}>
          <div style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            BENEFIT
          </div>
          <div style={{
            fontSize: "15px",
            fontWeight: "500",
            color: "#fff"
          }}>
            {scheme.benefit}
          </div>
        </div>
      )}

      {/* Application Process */}
      {scheme.application_process && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            HOW TO APPLY
          </div>
          <div style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.9)",
            whiteSpace: "pre-line",
            lineHeight: "1.5"
          }}>
            {scheme.application_process}
          </div>
        </div>
      )}

      {/* Department */}
      {scheme.department && (
        <div style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.6)",
          marginBottom: "12px",
          fontStyle: "italic"
        }}>
          {scheme.department}
        </div>
      )}

      {/* Apply Link */}
      {scheme.apply_link && (
        <a
          href={scheme.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #38A2D7, #561139)",
            color: "#fff",
            textDecoration: "none",
            padding: "10px 20px",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: "600",
            marginTop: "8px",
            transition: "transform 0.2s",
            border: "none",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          Apply Now →
        </a>
      )}

      {/* Eligibility Criteria (collapsible) */}
      {criteria && Object.keys(criteria).length > 0 && (
        <details style={{ marginTop: "16px" }}>
          <summary style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontWeight: "500"
          }}>
            View Eligibility Details
          </summary>
          <div style={{
            marginTop: "10px",
            padding: "10px",
            background: "rgba(0,0,0,0.2)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.8)"
          }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(criteria, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}