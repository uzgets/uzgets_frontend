import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { useTranslation } from "../../context/LanguageContext";
import apiFetch from "../../utils/apiFetch";
import {
  getStarsPurchasePath,
  getPremiumPurchasePath,
} from "../../utils/starsPurchaseRoute";
import { TGSSticker } from "../../components/TGSSticker";
import "./Dashboard.css";

import starsGif from "../../assets/stars.gif";
import premiumGif from "../../assets/premium_gif.gif";
import tilSticker from "../../assets/AnimatedSticker_til.tgs";
import menuIcon from "../../assets/main_icon.png";
import bellsIcon from "../../assets/bells_icon.png";
import statsIcon from "../../assets/stats_icon.png";
import profileIcon from "../../assets/profile_icon.png";


// ================== UTILS ==================
const formatAmount = (num) =>
  Number(num || 0).toLocaleString("ru-RU");

// ================== COMPONENT ==================
export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();

  /* ================= USER ================= */
  const [username, setUsername] = useState(null);
  const [isTelegram, setIsTelegram] = useState(false);

  /* ================= DATA ================= */
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [referralBoard, setReferralBoard] = useState([]);
  const [myRefRank, setMyRefRank] = useState(null);
  const [history, setHistory] = useState([]);

  /* ================= UI ================= */
  const [tab, setTab] = useState("home"); // home | history (iframe legacy)
  const [statsTab, setStatsTab] = useState("sales");
  const [loading, setLoading] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [splashVisible, setSplashVisible] = useState(() => !sessionStorage.getItem("splashShown"));
  const [splashFading, setSplashFading] = useState(false);
  const [showChannelBanner, setShowChannelBanner] = useState(false);
  const [error, setError] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [showComingSoonToast, setShowComingSoonToast] = useState(false);
  const [starsPurchasePath, setStarsPurchasePath] = useState("/stars");
  const [premiumPurchasePath, setPremiumPurchasePath] = useState("/premium");

  /* ================= NOTIFICATIONS ================= */
  const [unreadCount, setUnreadCount] = useState(0);

  /* ================= CHALLENGE ================= */
  const [myTotal, setMyTotal] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const GOAL = 999999;

  const percent = Math.min(
    100,
    Math.round((myTotal / GOAL) * 100)
  );

  // Register user (silent)
  const registerUser = async (user) => {
    try {
      // Check URL parameters for referral code (startapp param in Telegram)
      const params = new URLSearchParams(window.location.search);
      const startParam = WebApp?.initDataUnsafe?.start_param || params.get("startapp") || params.get("ref");

      await apiFetch("/api/referral/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          referral_code: startParam || null,
        }),
      });
    } catch (err) {
      console.error("Auto-register error:", err);
    }
  };

  const loadPurchasePaths = () => {
    apiFetch("/api/app-config")
      .then((r) => r.json())
      .then((cfg) => {
        setStarsPurchasePath(getStarsPurchasePath(cfg));
        setPremiumPurchasePath(getPremiumPurchasePath(cfg));
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadPurchasePaths();
  }, []);

  useEffect(() => {
    if (tab === "home") loadPurchasePaths();
  }, [tab]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadPurchasePaths();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  /* ================= TELEGRAM USER ================= */
  useEffect(() => {
    try {
      WebApp.ready();

      // Ko'k rang o'rnatish (Telegram header va bottom bar uchun)
      const blueColor = "#1a1a2e"; // Dark blue

      WebApp.setHeaderColor(blueColor);
      WebApp.setBackgroundColor(blueColor);
      document.body.style.backgroundColor = blueColor;

      // Telegram expand qilish
      WebApp.expand();

      const tgUser =
        WebApp?.initDataUnsafe?.user?.username ||
        window?.Telegram?.WebApp?.initDataUnsafe?.user?.username;

      const tgUserId =
        WebApp?.initDataUnsafe?.user?.id ||
        window?.Telegram?.WebApp?.initDataUnsafe?.user?.id;

      if (tgUser) {
        const clean = tgUser.replace("@", "");
        setUsername(clean);
        localStorage.setItem("username", clean);
        setIsTelegram(true);
        if (tgUserId) localStorage.setItem("userId", String(tgUserId));

        // Auto register
        registerUser(clean);
      }
    } catch {
      setIsTelegram(false);
    }
  }, []);

  /* ================= 🚀 COMBINED DASHBOARD INIT — Bitta so'rovda barcha ma'lumot ================= */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const uid = localStorage.getItem("userId");
        const params = new URLSearchParams();
        if (username) params.append("username", username);
        if (uid) params.append("user_id", uid);

        const res = await apiFetch(`/api/dashboard/init?${params.toString()}`);
        if (!res.ok) {
          throw new Error('API request failed');
        }
        const json = await res.json();

        // Leaderboard
        setLeaderboard(json.leaderboard?.top10 || []);
        setMyRank(json.leaderboard?.me || null);

        // Referral leaderboard
        setReferralBoard(json.referralLeaderboard?.top10 || []);
        setMyRefRank(json.referralLeaderboard?.me || null);

        // History
        const orders = json.history || [];
        setHistory(orders);

        // Challenge total
        const total = orders
          .filter(o => ["stars_sent", "premium_sent"].includes(o.status))
          .reduce((s, o) => s + Number(o.amount || 0), 0);
        setMyTotal(total);

        // Referral stats
        setReferralBalance(json.referralStats?.referral_balance || 0);
        setReferralCount(json.referralStats?.total_referrals || 0);

        // Unread notifications
        setUnreadCount(json.unreadCount || 0);

        console.log(`🚀 Dashboard yuklandi: ${json.loadTime}ms`);

      } catch (err) {
        console.error("Dashboard init error:", err);
        setError("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [username]);

  /* ================= REFRESH UNREAD NOTIFICATIONS (30s interval) ================= */
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const uid = localStorage.getItem("userId");
        if (!uid) return;
        const res = await apiFetch(`/api/notifications/unread/${uid}`);
        const json = await res.json();
        if (json.success) {
          setUnreadCount(json.unread_count || 0);
        }
      } catch (e) {
        console.error("Unread count error:", e);
      }
    };
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Language confirm function
  const handleLanguageConfirm = () => {
    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
  };

  // Smooth Navigation Handler
  const handleNavClick = (targetTab) => {
    if (tab === targetTab) return;

    // Only show loading for complex tabs (iframes)
    if (targetTab !== 'home') {
       setNavLoading(true);
       setTab(targetTab);

       // Silliq animatsiya uchun delay (white flashni yopish)
       setTimeout(() => {
         setNavLoading(false);
       }, 1500);
    } else {
       // Home is usually fast as it's not an iframe here,
       // but let's give it a small feedback too for consistency or just direct swap
       setTab(targetTab);
    }
  };

  // Telegram BackButton — til modali yoki history overlay
  useEffect(() => {
    const handleBack = () => {
      if (showLanguageModal) {
        setShowLanguageModal(false);
      } else if (tab !== "home") {
        setTab("home");
      }
    };

    try {
      if (tab !== "home" || showLanguageModal) {
        WebApp.BackButton.show();
        WebApp.BackButton.onClick(handleBack);
      } else {
        WebApp.BackButton.hide();
        WebApp.BackButton.offClick(handleBack);
      }
    } catch (e) {
      console.log("WebApp BackButton error:", e);
    }

    return () => {
      try {
        WebApp.BackButton.offClick(handleBack);
      } catch (e) {}
    };
  }, [tab, showLanguageModal]);

  /* ================= SPLASH AUTO-HIDE ================= */
  useEffect(() => {
    if (!splashVisible) return;
    const fadeTimer = setTimeout(() => setSplashFading(true), 1100);
    const hideTimer = setTimeout(() => {
      setSplashVisible(false);
      sessionStorage.setItem("splashShown", "1");
    }, 2000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  /* ================= UI ================= */

  if (splashVisible) {
    return (
      <div
        className={`splash-screen ${splashFading ? "fade-out" : ""}`}
        aria-busy="true"
        aria-label="Loading"
      >
        <div className="splash-content">
          <h1 className="splash-brand-text">
            Uz<span>gets</span>
          </h1>
          <p className="splash-tagline">Stars · Premium</p>
          <div className="splash-loader-bar" aria-hidden="true">
            <div className="loader-progress" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root_dashboard">

      {/* HEADER */}
      <header className="dash-header_dashboard">
        <div className="header-inner_dashboard">
          <h1 className="brand-title_dashboard brand-title--spm">
            <span className="brand-spm-text">
              Uz<span className="brand-spm-pay">gets</span>
            </span>
          </h1>
          <button
            type="button"
            className="notification-btn-dashboard"
            onClick={() => navigate("/notifications")}
            title="Notifications"
          >
            <img src={bellsIcon} alt="notifications" className="notification-btn-img" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
        </div>
      </header>

      <main className="dash-main_dashboard" style={{display: tab === 'home' ? 'flex' : 'none'}}>
        <div className="dashboard-actions-container">
          <div className="action-cards-row action-cards-row--spm">
            <button
              type="button"
              className="action-card-half action-card-half--stars"
              onClick={() => navigate(starsPurchasePath)}
            >
              <img src={starsGif} className="action-card-half__img action-card-half__img--gif" alt="stars" />
              <span className="action-card-half__title">{t("dashboard.buyStars") || "Stars olish"}</span>
            </button>
            <button
              type="button"
              className="action-card-half action-card-half--premium"
              onClick={() => navigate(premiumPurchasePath)}
            >
              <img src={premiumGif} className="action-card-half__img action-card-half__img--gif" alt="premium" />
              <span className="action-card-half__title">{t("dashboard.buyPremium") || "Premium olish"}</span>
            </button>
          </div>

          {/* Referral Invite Banner */}
          <div
            className="referral-invite-banner"
            onClick={() => navigate("/referral")}
          >
            <div className="referral-banner-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="referral-banner-content">
              <div className="referral-banner-text">
                {t("dashboard.referralBanner") || "Taklif qiling, bonus oling"}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION — statistika | asosiy | profil */}
      <div className="bottom-nav_dashboard">
        <button
          type="button"
          className="nav-btn_dashboard"
          onClick={() => navigate("/statistics")}
          title={t("dashboard.statistics") || "Statistika"}
        >
          <div className="nav-icon">
            <img src={statsIcon} alt="Stats" />
          </div>
        </button>

        <button
          type="button"
          className={`nav-btn_dashboard nav-btn--center center-btn ${tab === "home" ? "active" : ""}`}
          onClick={() => handleNavClick("home")}
          title={t("dashboard.home")}
        >
          <div className="nav-icon">
            <img src={menuIcon} alt="Home" />
          </div>
        </button>

        <button
          type="button"
          className="nav-btn_dashboard"
          onClick={() => navigate("/profile")}
          title={t("dashboard.profile") || "Profil"}
        >
          <div className="nav-icon">
            <img src={profileIcon} alt="Profile" />
          </div>
        </button>
      </div>

      {/* COMING SOON TOAST */}
      {showComingSoonToast && (
        <div className="coming-soon-toast">
          🎁 {t("dashboard.comingSoon") || "Tez orada qo'shiladi"}
        </div>
      )}

      {/* NAV LOADING OVERLAY */}
      {navLoading && (
        <div className="nav-loading-overlay">
          <div className="nav-loading-spinner"></div>
          <p className="nav-loading-text">{t("common.loading") || "Yuklanmoqda..."}</p>
        </div>
      )}

      {/* DYNAMIC CONTENT - Only show when not home tab */}
      {tab === "history" && (
        <div className="overlay-modal_dashboard">
          <iframe
            src="/history"
            className="iframe-modal_dashboard"
            title="History"
          ></iframe>
        </div>
      )}



      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="language-modal-overlay" onClick={() => setShowLanguageModal(false)}>
          <div className="language-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sticker-wrap">
              <TGSSticker stickerPath={tilSticker} className="modal-top-sticker" />
            </div>

            <p className="modal-subtitle">{t("common.selectLanguage") || "Tilni tanlang"}</p>

            <div className="language-options">
              <label className={`language-option ${selectedLanguage === 'uz' ? 'selected' : ''}`}>
                <input type="radio" name="language" value="uz" checked={selectedLanguage === 'uz'} onChange={(e) => setSelectedLanguage(e.target.value)} />
                <span className="language-name">O'zbekcha</span>
              </label>
              <label className={`language-option ${selectedLanguage === 'en' ? 'selected' : ''}`}>
                <input type="radio" name="language" value="en" checked={selectedLanguage === 'en'} onChange={(e) => setSelectedLanguage(e.target.value)} />
                <span className="language-name">English</span>
              </label>
              <label className={`language-option ${selectedLanguage === 'ru' ? 'selected' : ''}`}>
                <input type="radio" name="language" value="ru" checked={selectedLanguage === 'ru'} onChange={(e) => setSelectedLanguage(e.target.value)} />
                <span className="language-name">Русский</span>
              </label>
            </div>

            <button className="modal-confirm-btn" onClick={handleLanguageConfirm}>
              {t("common.confirm") || "Tasdiqlash"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
