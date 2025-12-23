import React, { useEffect, useMemo, useState } from "react";
import { Phone, CheckCircle2, UserCog, LogIn, LogOut, X } from "lucide-react";
import { db, auth } from "./firebase";
import { ref, onValue, set, serverTimestamp } from "firebase/database";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

const contacts = [
  { id: 2, name: "ömer", phone: "000000000", color: "#3b82f6" },
  { id: 3, name: "Emre", phone: "000000000", color: "#10b981" },
  { id: 4, name: "Cemal", phone: "000000000", color: "#8b5cf6" },
  { id: 5, name: "Emin", phone: "000000000", color: "#e01324ff" }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [activeDriverId, setActiveDriverId] = useState(null);
  const [loading, setLoading] = useState(true);

  const contactsById = useMemo(() => {
    const m = new Map();
    contacts.forEach((c) => m.set(c.id, c));
    return m;
  }, []);

  const activeDriverRef = useMemo(() => ref(db, "global/activeDriver"), []);

  useEffect(() => {
    // Giriş yapmış kullanıcıyı takip et
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Veritabanını dinle
    const unsubDb = onValue(activeDriverRef, (snap) => {
      const val = snap.val();
      if (val && typeof val.id === "number") setActiveDriverId(val.id);
      else setActiveDriverId(null);
      setLoading(false);
    });

    return () => { unsubAuth(); unsubDb(); };
  }, [activeDriverRef]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoginForm(false);
      setEmail(""); setPassword("");
    } catch (err) {
      alert("Giriş başarısız! E-posta veya şifre hatalı.");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSetDriver = async (id) => {
    if (!user) return;
    const driver = contactsById.get(id);
    try {
      await set(activeDriverRef, {
        id: driver.id,
        name: driver.name,
        updatedAtServer: serverTimestamp(),
      });
    } catch (e) {
      alert("Hata: Bu işlemi yapmaya yetkiniz yok.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Üst Menü / Login Butonu */}
      <div style={styles.topBar}>
        {user ? (
          <button onClick={handleLogout} style={styles.authToggleBtn}>
            <LogOut size={14} /> Çıkış Yap ({user.email.split('@')[0]})
          </button>
        ) : (
          <button onClick={() => setShowLoginForm(true)} style={styles.authToggleBtn}>
            <LogIn size={14} /> Yönetici Girişi
          </button>
        )}
      </div>

      <header style={styles.header}>
        <h1 style={styles.title}>Hızlı İletişim</h1>
        <p style={styles.subtitle}>
          {loading ? "Yükleniyor..." : activeDriverId 
            ? `Aktif sürücü: ${contactsById.get(activeDriverId)?.name}` 
            : "Aktif sürücü seçilmedi"}
        </p>
      </header>

      {/* Login Modalı */}
      {showLoginForm && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
              <h3>Yönetici Girişi</h3>
              <X onClick={() => setShowLoginForm(false)} style={{cursor:'pointer'}} />
            </div>
            <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
            <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
            <button type="submit" style={styles.loginBtn}>Giriş Yap</button>
          </form>
        </div>
      )}

      <main style={styles.grid}>
        {contacts.map((contact) => {
          const isActive = activeDriverId === contact.id;
          return (
            <div key={contact.id} style={{
              ...styles.card, 
              border: isActive ? "2px solid #10b981" : "1px solid #e5e7eb",
              backgroundColor: isActive ? "#f0fdf4" : "white"
            }}>
              <div style={styles.statusRow}>
                {isActive ? (
                  <span style={styles.activeBadge}><CheckCircle2 size={16} /> ŞU ANKİ SÜRÜCÜ</span>
                ) : (
                  user && ( // 👈 Sadece giriş yapmışsa butonu göster
                    <button onClick={() => handleSetDriver(contact.id)} style={styles.setDriverBtn}>
                      <UserCog size={16} /> Sürücü Yap
                    </button>
                  )
                )}
              </div>
              <div style={styles.contentRow}>
                <div style={styles.info}>
                  <h2 style={styles.name}>{contact.name}</h2>
                  <p style={styles.phoneDisplay}>{contact.phone}</p>
                </div>
                <a href={`tel:${contact.phone}`} style={{ ...styles.button, backgroundColor: contact.color }}>
                  <Phone size={20} /> <span>ARA</span>
                </a>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

const styles = {
  container: { padding: "1rem", maxWidth: "480px", margin: "0 auto" },
  topBar: { display: "flex", justifyContent: "flex-end", marginBottom: "1rem" },
  authToggleBtn: { 
    display: "flex", alignItems: "center", gap: "5px", background: "none", 
    border: "none", color: "#6b7280", fontSize: "0.8rem", cursor: "pointer" 
  },
  header: { textAlign: "center", marginBottom: "2rem" },
  title: { fontSize: "1.5rem", fontWeight: "800", color: "#111827" },
  subtitle: { color: "#6b7280", fontSize: "0.9rem", marginTop: "0.5rem" },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
  },
  loginForm: { 
    backgroundColor: 'white', padding: '20px', borderRadius: '12px', 
    width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px' 
  },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
  loginBtn: { 
    padding: '12px', borderRadius: '8px', border: 'none', 
    backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' 
  },
  grid: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: { borderRadius: "16px", padding: "1rem", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  statusRow: { marginBottom: "0.5rem" },
  contentRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  activeBadge: { 
    display: "inline-flex", alignItems: "center", gap: "4px", color: "#166534", 
    fontSize: "0.75rem", fontWeight: "700", backgroundColor: "#dcfce7", 
    padding: "4px 12px", borderRadius: "99px" 
  },
  setDriverBtn: { 
    display: "inline-flex", alignItems: "center", gap: "4px", color: "#6b7280", 
    fontSize: "0.75rem", border: "1px dashed #9ca3af", background: "none", 
    padding: "4px 12px", borderRadius: "99px", cursor: "pointer" 
  },
  info: { display: "flex", flexDirection: "column" },
  name: { fontSize: "1.1rem", fontWeight: "700" },
  phoneDisplay: { color: "#6b7280", fontSize: "0.85rem" },
  button: { 
    display: "flex", alignItems: "center", gap: "8px", color: "white", 
    padding: "0.75rem 1.5rem", borderRadius: "12px", textDecoration: "none", fontWeight: "700" 
  }
};