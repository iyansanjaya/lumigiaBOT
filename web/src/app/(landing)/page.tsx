"use client";

import Link from "next/link";
import {
  Shield,
  Zap,
  Ticket,
  ShieldAlert,
  ArrowRight,
  Terminal,
  LayoutDashboard,
  Globe,
} from "lucide-react";

/* ─────────────────────── Data ─────────────────────── */
const features = [
  {
    icon: Shield,
    color: "#A78BFA",
    bg: "rgba(124,58,237,0.12)",
    title: "Moderasi",
    desc: "Warn, kick, ban, mute, dan purge. Sistem eskalasi otomatis dan pencatatan lengkap.",
    tags: ["Warn System", "Auto-Escalation", "Mod Logs"],
  },
  {
    icon: Zap,
    color: "#22D3EE",
    bg: "rgba(6,182,212,0.12)",
    title: "Auto-Mod",
    desc: "Spam detection, link filter, word filter dengan regex support.",
    tags: ["Spam Filter", "Link Filter", "Regex Support"],
  },
  {
    icon: Ticket,
    color: "#4ADE80",
    bg: "rgba(34,197,94,0.12)",
    title: "Tiket Support",
    desc: "Sistem tiket lengkap dengan kategori, klaim staff, dan auto-close.",
    tags: ["Categories", "Staff Claim", "Transcripts"],
  },
  {
    icon: ShieldAlert,
    color: "#FACC15",
    bg: "rgba(234,179,8,0.12)",
    title: "Anti-Raid",
    desc: "Deteksi raid real-time dengan lockdown server otomatis.",
    tags: ["Rate Detection", "Auto Lock", "Alerts"],
  },
];

const caps = [
  { icon: Terminal, label: "23+ Commands", desc: "Slash commands lengkap" },
  {
    icon: LayoutDashboard,
    label: "Web Dashboard",
    desc: "Kelola dari browser",
  },
  { icon: Globe, label: "Multi-Bahasa", desc: "Indonesia & English" },
];

/* ═══════════════════════ HALAMAN UTAMA ═══════════════════════ */
export default function LandingPage() {
  return (
    <div>
      {/* ══════ HERO ══════ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(48,54,61,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(48,54,61,0.4) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "500px",
            background:
              "radial-gradient(ellipse, rgba(124,58,237,0.15), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "800px",
            margin: "0 auto",
            padding: "120px 32px 80px",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #30363d",
              background: "#161b22",
              borderRadius: "999px",
              padding: "8px 16px",
              fontSize: "14px",
              color: "#8b949e",
              marginBottom: "40px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#3fb950",
              }}
            />
            Online — Melayani 100+ server
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "24px",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#f0f6fc" }}>Jaga komunitasmu</span>
            <br />
            <span style={{ color: "#A78BFA" }}>tetap aman</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "18px",
              color: "#8b949e",
              maxWidth: "560px",
              margin: "0 auto 48px",
              lineHeight: 1.7,
            }}
          >
            Bot Discord all-in-one untuk moderasi, auto-mod, tiket support, dan
            proteksi anti-raid. Gratis! Itu kan yang kamu mau? Tenang 100% aman.
          </p>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <Link
              href="/api/invite"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#7C3AED",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px 28px",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#6D28D9")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#7C3AED")}
            >
              Undang ke Server
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#161b22",
                color: "#f0f6fc",
                border: "1px solid #30363d",
                borderRadius: "12px",
                padding: "14px 28px",
                fontSize: "16px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "border-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#484f58")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.borderColor = "#30363d")
              }
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ FITUR ══════ */}
      <section
        style={{ borderTop: "1px solid #30363d", padding: "100px 32px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p
              style={{
                color: "#A78BFA",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "12px",
              }}
            >
              Fitur
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: "#f0f6fc",
              }}
            >
              Semua yang kamu butuhkan
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
              gap: "20px",
            }}
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{
                    background: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "16px",
                    padding: "32px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = "#484f58")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "#30363d")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        background: f.bg,
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    >
                      <Icon size={22} style={{ color: f.color }} />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#f0f6fc",
                          marginBottom: "6px",
                        }}
                      >
                        {f.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#8b949e",
                          lineHeight: 1.6,
                        }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginLeft: "58px",
                    }}
                  >
                    {f.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "#21262d",
                          color: "#8b949e",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "12px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ KEMAMPUAN ══════ */}
      <section
        style={{
          borderTop: "1px solid #30363d",
          background: "#161b22",
          padding: "80px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
          }}
        >
          {caps.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(124,58,237,0.12)",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <Icon size={24} style={{ color: "#A78BFA" }} />
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#f0f6fc",
                    marginBottom: "4px",
                  }}
                >
                  {c.label}
                </h3>
                <p style={{ fontSize: "14px", color: "#8b949e" }}>{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════ PREVIEW ══════ */}
      <section
        style={{ borderTop: "1px solid #30363d", padding: "100px 32px" }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p
              style={{
                color: "#A78BFA",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "12px",
              }}
            >
              Preview
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: "#f0f6fc",
              }}
            >
              Mudah digunakan
            </h2>
          </div>

          {/* Mock Discord */}
          <div
            style={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 20px",
                borderBottom: "1px solid #30363d",
                background: "#0d1117",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#f85149",
                  }}
                />
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#d29922",
                  }}
                />
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#3fb950",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "13px",
                  color: "#8b949e",
                  fontFamily: "monospace",
                  marginLeft: "8px",
                }}
              >
                # general
              </span>
            </div>

            {/* Messages */}
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* User */}
              <div style={{ display: "flex", gap: "12px" }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(124,58,237,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#A78BFA",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  A
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        color: "#A78BFA",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      Admin
                    </span>
                    <span style={{ color: "#484f58", fontSize: "12px" }}>
                      Hari ini 14:32
                    </span>
                  </div>
                  <p
                    style={{
                      color: "#f0f6fc",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  >
                    /warn <span style={{ color: "#8b949e" }}>@spammer</span>{" "}
                    <span style={{ color: "#8b949e" }}>alasan:</span>Spam
                    berulang kali
                  </p>
                </div>
              </div>

              {/* Bot response */}
              <div style={{ display: "flex", gap: "12px" }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(63,185,80,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={18} style={{ color: "#3fb950" }} />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        color: "#3fb950",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      LumigiaBOT
                    </span>
                    <span
                      style={{
                        background: "rgba(124,58,237,0.2)",
                        color: "#A78BFA",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      BOT
                    </span>
                    <span style={{ color: "#484f58", fontSize: "12px" }}>
                      Hari ini 14:32
                    </span>
                  </div>
                  <div
                    style={{
                      borderLeft: "4px solid #d29922",
                      background: "rgba(210,153,34,0.08)",
                      borderRadius: "0 8px 8px 0",
                      padding: "16px",
                      maxWidth: "400px",
                    }}
                  >
                    <p
                      style={{
                        color: "#d29922",
                        fontWeight: 600,
                        fontSize: "14px",
                        marginBottom: "12px",
                      }}
                    >
                      ⚠️ Peringatan Diberikan
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <p>
                        <span style={{ color: "#8b949e" }}>User: </span>
                        <span style={{ color: "#f0f6fc" }}>@spammer</span>
                      </p>
                      <p>
                        <span style={{ color: "#8b949e" }}>Alasan: </span>
                        <span style={{ color: "#f0f6fc" }}>
                          Spam berulang kali
                        </span>
                      </p>
                      <p>
                        <span style={{ color: "#8b949e" }}>Total Warns: </span>
                        <span style={{ color: "#d29922", fontWeight: 600 }}>
                          3/5
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section
        style={{
          borderTop: "1px solid #30363d",
          padding: "100px 32px",
          background:
            "linear-gradient(180deg, rgba(124,58,237,0.04) 0%, transparent 60%)",
        }}
      >
        <div
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: "#f0f6fc",
              marginBottom: "16px",
            }}
          >
            Siap melindungi servermu?
          </h2>
          <p
            style={{ fontSize: "16px", color: "#8b949e", marginBottom: "40px" }}
          >
            Tambahkan LumigiaBOT sekarang. Gratis, tanpa batasan.
          </p>
          <Link
            href="/api/invite"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#7C3AED",
              color: "#fff",
              borderRadius: "12px",
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Undang ke Server
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
