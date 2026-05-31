import { useState } from 'react';
import { AppointmentDemo } from './demos/AppointmentDemo';
import { MeetingRoomDemo } from './demos/MeetingRoomDemo';
import { ResourcePlannerDemo } from './demos/ResourcePlannerDemo';
import { TaskTimelineDemo } from './demos/TaskTimelineDemo';
import { ThemePlayground } from './demos/ThemePlayground';

type Tab = 'appointment' | 'meeting' | 'task' | 'resource' | 'theme';

const tabs: { id: Tab; labelFa: string; labelEn: string; icon: string; descFa: string; descEn: string }[] = [
  { id: 'appointment', labelFa: 'رزرو نوبت', labelEn: 'Appointment', icon: '📅', descFa: 'کلینیک پزشکی / آرایشگاه', descEn: 'Clinic / Hair Salon' },
  { id: 'meeting', labelFa: 'اتاق جلسه', labelEn: 'Meeting Room', icon: '🏢', descFa: 'رزرو فضای کاری', descEn: 'Office Space Booking' },
  { id: 'task', labelFa: 'خط زمان وظایف', labelEn: 'Task Timeline', icon: '🗂️', descFa: 'زمان‌بندی وظایف تیم', descEn: 'Team task scheduling' },
  { id: 'resource', labelFa: 'برنامه‌ریز منابع', labelEn: 'Resource Planner', icon: '🧩', descFa: 'برنامه‌ریزی منبع‌محور', descEn: 'Resource-first planning' },
  { id: 'theme', labelFa: 'تم‌ها', labelEn: 'Themes', icon: '🎨', descFa: 'شخصی‌سازی کامل', descEn: 'Full Customization' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('appointment');
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<'fa' | 'en'>('en');

  const isFa = lang === 'fa';

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`} dir={isFa ? 'rtl' : 'ltr'}>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">📆</div>
            <div>
              <div className="brand-name">React Slot Scheduler</div>
              <div className="brand-tagline">
                {isFa ? 'کامپوننت رزرو حرفه‌ای برای React' : 'Professional booking component for React'}
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div className="pill-group">
              <button className={`pill sm ${lang === 'fa' ? 'active' : ''}`} onClick={() => setLang('fa')}>🇮🇷 FA</button>
              <button className={`pill sm ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>🇺🇸 EN</button>
            </div>
            <button className="icon-btn" onClick={() => setIsDark(d => !d)} title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <a className="github-btn" href="https://github.com/omidrahmati2000/react-slot-scheduler" target="_blank" rel="noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badges">
            <span className="badge">TypeScript</span>
            <span className="badge">RTL + LTR</span>
            <span className="badge">Drag & Drop</span>
            <span className="badge">Themeable</span>
            <span className="badge">Zero deps</span>
          </div>
          <h1 className="hero-title">
            {isFa ? 'تقویم حرفه‌ای اسلات' : 'Professional Slot Scheduler'}
          </h1>
          <p className="hero-subtitle">
            {isFa
              ? 'کامپوننت React برای رزرو نوبت، اتاق جلسه و مدیریت زمان‌بندی؛ با پشتیبانی کامل از فارسی، RTL، حالت تیره و کشیدن و رها کردن'
              : 'A React component for appointment booking, room scheduling and time management — with full Persian/RTL support, dark mode and drag & drop'}
          </p>
          <div className="hero-install">
            <code>npm i @omidrahmati/react-slot-scheduler</code>
          </div>
        </div>
      </section>

      <main className="main-content">
        <div className="tabs-bar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-text">
                <span className="tab-label">{isFa ? tab.labelFa : tab.labelEn}</span>
                <span className="tab-desc">{isFa ? tab.descFa : tab.descEn}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'appointment' && <AppointmentDemo isDark={isDark} lang={lang} />}
          {activeTab === 'meeting' && <MeetingRoomDemo isDark={isDark} lang={lang} />}
          {activeTab === 'task' && <TaskTimelineDemo isDark={isDark} lang={lang} />}
          {activeTab === 'resource' && <ResourcePlannerDemo isDark={isDark} lang={lang} />}
          {activeTab === 'theme' && <ThemePlayground isDark={isDark} lang={lang} />}
        </div>
      </main>

      <section className="features-section">
        <div className="features-inner">
          <h2 className="features-title">{isFa ? 'چرا این تقویم؟' : 'Why this calendar?'}</h2>
          <div className="features-grid">
            {[
              { icon: '🌐', titleFa: 'دو زبانه', titleEn: 'Bilingual', descFa: 'پشتیبانی کامل از فارسی و انگلیسی با تغییر خودکار جهت RTL/LTR', descEn: 'Full Persian & English support with automatic RTL/LTR direction switching' },
              { icon: '🎨', titleFa: 'تم‌پذیر', titleEn: 'Fully Themeable', descFa: 'متغیرهای CSS و توکن‌های تم برای شخصی‌سازی کامل ظاهر', descEn: 'CSS variables and theme tokens for complete visual customization' },
              { icon: '✋', titleFa: 'Drag & Drop', titleEn: 'Drag & Drop', descFa: 'جابجایی رزروها با کشیدن و انداختن — کنترل state در اختیار شماست', descEn: 'Rearrange bookings by drag and drop — state control stays with you' },
              { icon: '📱', titleFa: 'ریسپانسیو', titleEn: 'Responsive', descFa: 'نمای روز در موبایل و نمای هفته در دسکتاپ به‌صورت خودکار', descEn: 'Day view on mobile, week view on desktop — automatically' },
              { icon: '⚡', titleFa: 'سبک و سریع', titleEn: 'Lightweight', descFa: 'بدون وابستگی خارجی؛ فقط React به‌عنوان peer dependency', descEn: 'No external dependencies, only React as a peer dep' },
              { icon: '🔷', titleFa: 'TypeScript', titleEn: 'TypeScript', descFa: 'تایپ‌های کامل برای تمام props و callback‌ها', descEn: 'Full types for all props and callbacks' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{isFa ? f.titleFa : f.titleEn}</h3>
                <p className="feature-desc">{isFa ? f.descFa : f.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>Made with ❤️ by <strong>Omid Rahmati</strong></span>
          <span>·</span>
          <span>MIT License</span>
          <span>·</span>
          <a href="https://github.com/omidrahmati2000/react-slot-scheduler" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
