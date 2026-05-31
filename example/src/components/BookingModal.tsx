import { useEffect, useRef, useState } from 'react';

interface Slot {
  date: string;
  startTime: string;
  endTime: string;
}

interface Props {
  slots: Slot[];
  lang: 'fa' | 'en';
  isDark: boolean;
  onConfirm: (data: { title: string; description: string; status: 'booked' | 'blocked' | 'custom' }) => void;
  onClose: () => void;
}

export function BookingModal({ slots, lang, isDark, onConfirm, onClose }: Props) {
  const isFa = lang === 'fa';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'booked' | 'blocked' | 'custom'>('booked');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [title]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onConfirm({ title: title.trim(), description: description.trim(), status });
  };

  const label = (fa: string, en: string) => isFa ? fa : en;

  const slotCount = slots.length;
  const firstSlot = slots[0];
  const lastSlot = slots[slots.length - 1];
  const timeRange = slotCount === 1
    ? `${firstSlot.startTime} – ${firstSlot.endTime}`
    : `${firstSlot.startTime} – ${lastSlot.endTime}`;
  const dateLabel = firstSlot.date;

  const statuses: Array<{ value: 'booked' | 'blocked' | 'custom'; fa: string; en: string; color: string }> = [
    { value: 'booked',  fa: 'رزرو شده',  en: 'Booked',  color: '#fda4af' },
    { value: 'blocked', fa: 'مسدود',     en: 'Blocked', color: '#cbd5e1' },
    { value: 'custom',  fa: 'دیگر',       en: 'Custom',  color: '#67e8f9' },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <div className={`modal-box ${isDark ? 'modal-dark' : ''}`}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {label('ثبت نوبت جدید', 'New Booking')}
            </h3>
            <p className="modal-subtitle">
              {dateLabel} &nbsp;·&nbsp; {timeRange}
              {slotCount > 1 && ` (${slotCount} ${label('اسلات', 'slots')})`}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="close">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Title */}
          <div className="modal-field">
            <label className="modal-label">{label('نام / عنوان', 'Title')}</label>
            <input
              ref={inputRef}
              className="modal-input"
              placeholder={label('مثال: آقای احمدی', 'e.g. Alice — Haircut')}
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={60}
            />
          </div>

          {/* Description */}
          <div className="modal-field">
            <label className="modal-label">{label('توضیحات (اختیاری)', 'Description (optional)')}</label>
            <input
              className="modal-input"
              placeholder={label('مثال: ویزیت عمومی', 'e.g. Confirmed, first visit')}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={80}
            />
          </div>

          {/* Status */}
          <div className="modal-field">
            <label className="modal-label">{label('نوع نوبت', 'Type')}</label>
            <div className="modal-status-group">
              {statuses.map(s => (
                <button
                  key={s.value}
                  className={`modal-status-btn ${status === s.value ? 'active' : ''}`}
                  style={{ '--status-color': s.color } as React.CSSProperties}
                  onClick={() => setStatus(s.value)}
                >
                  <span className="modal-status-dot" style={{ background: s.color }} />
                  {isFa ? s.fa : s.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            {label('انصراف', 'Cancel')}
          </button>
          <button
            className="modal-btn modal-btn-confirm"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            {label('ثبت نوبت', 'Book Slot')}
          </button>
        </div>

        <p className="modal-hint">{label('Ctrl+Enter برای ثبت سریع · Escape برای بستن', 'Ctrl+Enter to confirm · Escape to close')}</p>
      </div>
    </div>
  );
}
