import React, { useEffect, useMemo, useState } from "react";
import { Phone, CheckCircle2, UserCog } from "lucide-react";

import { db } from "./firebase";
import { ref, onValue, set, serverTimestamp } from "firebase/database";

// Örnek Veriler
const contacts = [
  { id: 2, name: "ömer", phone: "05453995105", color: "#3b82f6" },
  { id: 3, name: "Emre", phone: "05452145704", color: "#10b981" },
  { id: 4, name: "Cemal", phone: "05520261256", color: "#8b5cf6" },
  { id: 4, name: "Emin", phone: "05378256265", color: "#e01324ff" }
];

export default function App() {
  const contactsById = useMemo(() => {
    const m = new Map();
    contacts.forEach((c) => m.set(c.id, c));
    return m;
  }, []);

  const [activeDriverId, setActiveDriverId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Herkes için ortak alan (DB yolu)
  const activeDriverRef = useMemo(() => ref(db, "global/activeDriver"), []);

  // Sayfa açılınca: DB'yi canlı dinle
  useEffect(() => {
    const unsub = onValue(
      activeDriverRef,
      (snap) => {
        const val = snap.val();

        if (val && typeof val.id === "number") {
          setActiveDriverId(val.id);
        } else {
          setActiveDriverId(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("DB okuma hatası:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [activeDriverRef]);

  // Butona basınca: DB'ye yaz
  const handleSetDriver = async (id) => {
    const driver = contactsById.get(id);
    if (!driver) return;

    try {
      await set(activeDriverRef, {
        id: driver.id,
        name: driver.name,
        updatedAtServer: serverTimestamp(),
      });
    } catch (e) {
      console.error("DB yazma hatası:", e);
      alert("Sürücü güncellenemedi. İnternetini kontrol et.");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Hızlı İletişim</h1>
        <p style={styles.subtitle}>
          {loading
            ? "Yükleniyor..."
            : activeDriverId
            ? `Aktif sürücü: ${contactsById.get(activeDriverId)?.name ?? "Bilinmiyor"}`
            : "Aktif sürücü seçilmedi"}
        </p>
      </header>

      <main style={styles.grid}>
        {contacts.map((contact) => {
          const isActive = activeDriverId === contact.id;

          return (
            <div
              key={contact.id}
              style={{
                ...styles.card,
                border: isActive ? "2px solid #10b981" : "1px solid #f3f4f6",
                backgroundColor: isActive ? "#f0fdf4" : "white",
              }}
            >
              <div style={styles.statusRow}>
                {isActive ? (
                  <span style={styles.activeBadge}>
                    <CheckCircle2 size={16} />
                    ŞU ANKİ SÜRÜCÜ
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDriver(contact.id)}
                    style={styles.setDriverBtn}
                  >
                    <UserCog size={16} />
                    Sürücü Yap
                  </button>
                )}
              </div>

              <div style={styles.contentRow}>
                <div style={styles.info}>
                  <h2 style={styles.name}>{contact.name}</h2>
                  <p style={styles.phoneDisplay}>{contact.phone}</p>
                </div>

                <a
                  href={`tel:${contact.phone}`}
                  style={{ ...styles.button, backgroundColor: contact.color }}
                >
                  <Phone size={20} />
                  <span>ARA</span>
                </a>
              </div>
            </div>
          );
        })}
      </main>

      <footer style={styles.footer}>
        <div>© 2025 Hızlı Arama Sistemi</div>
        <div>Ömer ÖZDEMİR tarafından geliştirilmiştir</div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    paddingBottom: "2rem",
  },
  header: { textAlign: "center", marginBottom: "0.5rem" },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "0.25rem",
  },
  subtitle: { color: "#6b7280", fontSize: "0.95rem" },
  grid: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: {
    borderRadius: "16px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  statusRow: { display: "flex", justifyContent: "flex-start" },
  contentRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  setDriverBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    backgroundColor: "transparent",
    border: "1px dashed #9ca3af",
    color: "#6b7280",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  info: { display: "flex", flexDirection: "column", gap: "0.25rem" },
  name: { fontSize: "1.1rem", fontWeight: "600", color: "#1f2937" },
  phoneDisplay: { fontSize: "0.8rem", color: "#9ca3af" },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "white",
    padding: "0.75rem 1.25rem",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "0.8rem",
    marginTop: "auto",
  },
};
