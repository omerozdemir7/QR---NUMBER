import React, { useEffect, useState } from 'react';
import { Phone, CheckCircle2, UserCog } from 'lucide-react';

// Örnek Veriler
const contacts = [
  {
    id: 2,
    name: 'ömer',
    role: '',
    phone: '05453995105',
    color: '#3b82f6',
  },
  {
    id: 3,
    name: 'Emre',
    role: '',
    phone: '05452145704',
    color: '#10b981',
  },
  {
    id: 4,
    name: 'Cemal',
    role: '',
    phone: '05378256265',
    color: '#8b5cf6',
  },
];

const STORAGE_KEY = 'activeDriverId';
const URL_PARAM = 'driver';

function App() {
  // Önce URL'den oku (?driver=3), yoksa localStorage'dan oku
  const [activeDriverId, setActiveDriverId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get(URL_PARAM);
    if (fromUrl !== null && fromUrl !== '') {
      const n = Number(fromUrl);
      return Number.isFinite(n) ? n : null;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return null;

    const n = Number(saved);
    return Number.isFinite(n) ? n : null;
  });

  // activeDriverId değişince localStorage + URL güncelle
  useEffect(() => {
    const url = new URL(window.location.href);

    if (activeDriverId === null) {
      localStorage.removeItem(STORAGE_KEY);
      url.searchParams.delete(URL_PARAM);
    } else {
      localStorage.setItem(STORAGE_KEY, String(activeDriverId));
      url.searchParams.set(URL_PARAM, String(activeDriverId));
    }

    // sayfayı yenilemeden linki güncelle
    window.history.replaceState({}, '', url);
  }, [activeDriverId]);

  const handleSetDriver = (id) => {
    setActiveDriverId(id);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Hızlı İletişim</h1>
        <p style={styles.subtitle}>Aktif sürücüyü seçin ve arama yapın</p>
      </header>

      <main style={styles.grid}>
        {contacts.map((contact) => {
          const isActive = activeDriverId === contact.id;

          return (
            <div
              key={contact.id}
              style={{
                ...styles.card,
                border: isActive ? '2px solid #10b981' : '1px solid #f3f4f6',
                backgroundColor: isActive ? '#f0fdf4' : 'white',
              }}
            >
              {/* Aktiflik Durumu Üst Barı */}
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
                  {!!contact.role && <p style={styles.role}>{contact.role}</p>}
                  <p style={styles.phoneDisplay}>
                    {formatPhoneNumber(contact.phone)}
                  </p>
                </div>

                <a
                  href={`tel:${contact.phone}`}
                  style={{
                    ...styles.button,
                    backgroundColor: contact.color || '#10b981',
                  }}
                >
                  <Phone size={20} />
                  <span>ARA</span>
                </a>
              </div>
            </div>
          );
        })}
      </main>

      <footer style={styles.footer}>© 2024 Hızlı Arama Sistemi</footer>
    </div>
  );
}

// Basit bir telefon formatlayıcı (istersen geliştirebiliriz)
function formatPhoneNumber(phoneNumberString) {
  return phoneNumberString;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    paddingBottom: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    borderRadius: '16px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  contentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.025em',
  },
  setDriverBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'transparent',
    border: '1px dashed #9ca3af',
    color: '#6b7280',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  name: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  role: {
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  phoneDisplay: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '0.1rem',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'white',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'opacity 0.2s',
  },
  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.8rem',
    marginTop: 'auto',
  },
};

export default App;
