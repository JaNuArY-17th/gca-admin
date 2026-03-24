import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import type { Category, NomineeSummary, VoterListResponse, VoteStats, DateRange } from '../types';

type HomePageProps = {
  dateRange: DateRange;
  onDateChange: (field: 'startDate' | 'endDate', value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  stats: VoteStats | null;
  statsLoading: boolean;
  statsError: string | null;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  nominees: NomineeSummary[];
  nomineeLoading: boolean;
  nomineeError: string | null;
  voterLoading: boolean;
  voterError: string | null;
  votedData: VoterListResponse | null;
  notVotedData: VoterListResponse | null;
  votedPage: number;
  notVotedPage: number;
  onVotedPageChange: (page: number) => void;
  onNotVotedPageChange: (page: number) => void;
  onLogout: () => void;
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .hp {
    font-family: 'Sora', sans-serif;
    min-height: 100vh;
    background: #0d0d0f;
    color: #e8e6e1;
    --accent: #c8f04a;
    --accent-dim: rgba(200,240,74,0.12);
    --border: rgba(255,255,255,0.07);
    --surface: rgba(255,255,255,0.04);
    --surface-hover: rgba(255,255,255,0.07);
    --muted: #6b6965;
    --mono: 'JetBrains Mono', monospace;
  }

  .hp-layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    grid-template-rows: auto 1fr;
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .hp-sidebar {
    grid-row: 1 / 3;
    background: #111114;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 28px 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .hp-logo {
    padding: 0 20px 28px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 20px;
  }

  .hp-logo-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--accent-dim);
    border: 1px solid rgba(200,240,74,0.2);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 10px;
  }

  .hp-logo-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: hpPulse 2s infinite;
    flex-shrink: 0;
  }

  @keyframes hpPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .hp-logo-title {
    font-size: 13px;
    font-weight: 500;
    color: #e8e6e1;
    margin: 0;
    line-height: 1.4;
  }

  .hp-logo-sub {
    font-size: 11px;
    color: var(--muted);
    margin: 2px 0 0;
  }

  .hp-nav {
    flex: 1;
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .hp-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 400;
    color: var(--muted);
    cursor: pointer;
    border: none;
    background: none;
    text-align: left;
    width: 100%;
    transition: background 0.15s, color 0.15s;
    font-family: 'Sora', sans-serif;
  }

  .hp-nav-item:hover { background: var(--surface); color: #e8e6e1; }
  .hp-nav-item.hp-active { background: var(--accent-dim); color: var(--accent); }

  .hp-nav-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .hp-nav-item.hp-active .hp-nav-icon { opacity: 1; }

  .hp-sidebar-footer {
    padding: 16px 12px 0;
    border-top: 1px solid var(--border);
    margin-top: auto;
  }

  .hp-logout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13px;
    color: var(--muted);
    cursor: pointer;
    border: none;
    background: none;
    font-family: 'Sora', sans-serif;
    width: 100%;
    transition: background 0.15s, color 0.15s;
  }

  .hp-logout:hover { background: rgba(255,80,80,0.08); color: #ff6b6b; }

  /* ── Topbar ── */
  .hp-topbar {
    grid-column: 2;
    background: #111114;
    border-bottom: 1px solid var(--border);
    padding: 14px 32px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .hp-filter-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .hp-input {
    height: 34px;
    padding: 0 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: #e8e6e1;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
    color-scheme: dark;
  }

  .hp-input:focus {
    border-color: rgba(200,240,74,0.4);
    background: rgba(255,255,255,0.06);
  }

  .hp-input::placeholder { color: var(--muted); }

  .hp-search-wrap {
    flex: 1;
    min-width: 180px;
  }

  .hp-search-wrap .hp-input { width: 100%; }

  .hp-divider-v {
    width: 1px;
    height: 18px;
    background: var(--border);
    flex-shrink: 0;
  }

  .hp-arrow { color: var(--muted); font-size: 13px; }

  /* ── Main body ── */
  .hp-body {
    grid-column: 2;
    padding: 28px 32px 64px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    overflow-y: auto;
  }

  .hp-page-header { display: flex; flex-direction: column; gap: 3px; }

  .hp-page-title {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.3px;
    margin: 0;
    color: #fff;
  }

  .hp-page-sub { font-size: 13px; color: var(--muted); margin: 0; }

  /* ── Stats ── */
  .hp-stat-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .hp-stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .hp-stat-card:hover { border-color: rgba(255,255,255,0.12); }

  .hp-stat-card::before {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 80px; height: 80px;
    background: radial-gradient(circle, var(--accent-dim) 0%, transparent 70%);
    border-radius: 50%;
  }

  .hp-stat-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 10px;
  }

  .hp-stat-value {
    font-family: var(--mono);
    font-size: 32px;
    font-weight: 500;
    color: #fff;
    margin: 0 0 6px;
    letter-spacing: -1px;
    line-height: 1;
  }

  .hp-stat-value.hp-accent { color: var(--accent); }

  .hp-stat-meta { font-size: 12px; color: var(--muted); margin: 0; }
  .hp-stat-error { font-size: 12px; color: #ff6b6b; margin: 8px 0 0; }

  /* ── Charts row ── */
  .hp-charts-row {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 14px;
  }

  /* ── Card ── */
  .hp-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 24px;
  }

  .hp-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  .hp-card-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 3px;
  }

  .hp-card-sub { font-size: 11px; color: var(--muted); margin: 0; }

  .hp-select {
    height: 30px;
    padding: 0 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
    border-radius: 7px;
    color: #e8e6e1;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    outline: none;
    cursor: pointer;
    flex-shrink: 0;
  }

  .hp-select option { background: #1a1a1e; }

  /* Tooltip */
  .hp-tooltip {
    background: #1e1e22;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'Sora', sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }

  .hp-tooltip-label { font-size: 11px; color: var(--muted); margin: 0 0 4px; }
  .hp-tooltip-value {
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 500;
    color: var(--accent);
    margin: 0;
  }

  .hp-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    font-size: 13px;
    color: var(--muted);
  }

  /* Pie center label */
  .hp-pie-center {
    text-align: center;
    margin-top: 8px;
  }

  .hp-pie-pct {
    font-family: var(--mono);
    font-size: 24px;
    font-weight: 500;
    color: var(--accent);
  }

  .hp-pie-label { font-size: 12px; color: var(--muted); margin-left: 5px; }

  /* ── Tables ── */
  .hp-tables-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .hp-table-wrap {
    overflow-x: auto;
    border-radius: 10px;
    border: 1px solid var(--border);
  }

  .hp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
  }

  .hp-table th {
    padding: 10px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  .hp-table td {
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #ccc;
    white-space: nowrap;
  }

  .hp-table tbody tr:last-child td { border-bottom: none; }
  .hp-table tbody tr:hover td { background: var(--surface-hover); color: #e8e6e1; }

  .hp-mc {
    font-family: var(--mono);
    font-size: 11.5px;
    color: var(--muted);
  }

  .hp-badge-live {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 20px;
    background: rgba(74,222,128,0.1);
    color: #4ade80;
  }

  /* ── Pagination ── */
  .hp-pagination {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
  }

  .hp-page-btn {
    height: 30px;
    padding: 0 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: #aaa;
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .hp-page-btn:hover:not(:disabled) { background: var(--surface-hover); color: #e8e6e1; }
  .hp-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .hp-page-info {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
  }

  .hp-note { font-size: 12px; color: var(--muted); margin: 0 0 10px; }
  .hp-error { font-size: 12px; color: #ff6b6b; margin: 0 0 10px; }

  @media (max-width: 1024px) {
    .hp-layout { grid-template-columns: 1fr; }
    .hp-sidebar { display: none; }
    .hp-topbar, .hp-body { grid-column: 1; }
    .hp-charts-row { grid-template-columns: 1fr; }
    .hp-tables-row { grid-template-columns: 1fr; }
    .hp-stat-row { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 600px) {
    .hp-stat-row { grid-template-columns: 1fr; }
    .hp-body { padding: 20px 16px 48px; }
    .hp-topbar { padding: 12px 16px; }
  }
`;

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="hp-tooltip">
      <p className="hp-tooltip-label">{payload[0]?.payload?.fullName ?? label}</p>
      <p className="hp-tooltip-value">{payload[0].value.toLocaleString()} phiếu</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="hp-tooltip">
      <p className="hp-tooltip-label">{payload[0].name}</p>
      <p className="hp-tooltip-value">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

type Tab = 'overview' | 'voters';

export function HomePage({
  dateRange,
  onDateChange,
  searchTerm,
  onSearchTermChange,
  stats,
  statsLoading,
  statsError,
  categories,
  selectedCategory,
  onSelectCategory,
  nominees,
  nomineeLoading,
  nomineeError,
  voterLoading,
  voterError,
  votedData,
  notVotedData,
  votedPage,
  notVotedPage,
  onVotedPageChange,
  onNotVotedPageChange,
  onLogout,
}: HomePageProps) {
  const [tab, setTab] = useState<Tab>('overview');

  const votedPages = votedData ? Math.max(1, Math.ceil(votedData.total / votedData.pageSize)) : 1;
  const notVotedPages = notVotedData ? Math.max(1, Math.ceil(notVotedData.total / notVotedData.pageSize)) : 1;

  const barData = nominees.slice(0, 10).map((n) => ({
    name: n.name.length > 13 ? n.name.slice(0, 13) + '…' : n.name,
    fullName: n.name,
    votes: n.votes,
  }));

  const votedTotal = votedData?.total ?? stats?.totalVoters ?? 0;
  const notVotedTotal = notVotedData?.total ?? 0;
  const totalAll = votedTotal + notVotedTotal;
  const pieData = [
    { name: 'Đã vote', value: votedTotal },
    { name: 'Chưa vote', value: notVotedTotal },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="hp">
        <div className="hp-layout">

          {/* Sidebar */}
          <aside className="hp-sidebar">
            <div className="hp-logo">
              <div className="hp-logo-badge">
                <span className="hp-logo-dot" />
                GCA 2025
              </div>
              <p className="hp-logo-title">Vote Monitoring</p>
              <p className="hp-logo-sub">Ban tổ chức</p>
            </div>

            <nav className="hp-nav">
              <button
                className={`hp-nav-item${tab === 'overview' ? ' hp-active' : ''}`}
                onClick={() => setTab('overview')}
              >
                <svg className="hp-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" />
                  <rect x="9" y="1" width="6" height="6" rx="1.5" />
                  <rect x="1" y="9" width="6" height="6" rx="1.5" />
                  <rect x="9" y="9" width="6" height="6" rx="1.5" />
                </svg>
                Tổng quan
              </button>
              <button
                className={`hp-nav-item${tab === 'voters' ? ' hp-active' : ''}`}
                onClick={() => setTab('voters')}
              >
                <svg className="hp-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="5.5" cy="5" r="2.5" />
                  <path d="M1 13c0-2.5 2-4.5 4.5-4.5" strokeLinecap="round" />
                  <circle cx="11" cy="5" r="2.5" />
                  <path d="M8 13c0-2.5 1.8-4.5 4-4.5" strokeLinecap="round" />
                </svg>
                Danh sách voter
              </button>
            </nav>

            <div className="hp-sidebar-footer">
              <button className="hp-logout" onClick={onLogout}>
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" strokeLinecap="round" />
                  <path d="M10 11l3-3-3-3M13 8H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </aside>

          {/* Topbar */}
          <div className="hp-topbar">
            <span className="hp-filter-label">Từ</span>
            <input
              className="hp-input"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => onDateChange('startDate', e.target.value)}
            />
            <span className="hp-arrow">→</span>
            <input
              className="hp-input"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => onDateChange('endDate', e.target.value)}
            />
            <div className="hp-divider-v" />
            <div className="hp-search-wrap">
              <input
                className="hp-input"
                placeholder="Tìm tên, MSSV..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
              />
            </div>
          </div>

          {/* Body */}
          <main className="hp-body">

            {tab === 'overview' && (
              <>
                <div className="hp-page-header">
                  <h1 className="hp-page-title">Tổng quan bình chọn</h1>
                  <p className="hp-page-sub">{dateRange.startDate} — {dateRange.endDate}</p>
                </div>

                {/* Stats */}
                <div className="hp-stat-row">
                  <div className="hp-stat-card">
                    <p className="hp-stat-eyebrow">Người đã vote</p>
                    <p className="hp-stat-value hp-accent">
                      {statsLoading ? '—' : stats ? stats.totalVoters.toLocaleString() : '—'}
                    </p>
                    <p className="hp-stat-meta">Trong khoảng thời gian đã chọn</p>
                    {statsError && <p className="hp-stat-error">{statsError}</p>}
                  </div>
                  <div className="hp-stat-card">
                    <p className="hp-stat-eyebrow">Chưa vote</p>
                    <p className="hp-stat-value">
                      {notVotedData ? notVotedData.total.toLocaleString() : '—'}
                    </p>
                    <p className="hp-stat-meta">Chưa tham gia bình chọn</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="hp-charts-row">
                  {/* Bar chart */}
                  <div className="hp-card">
                    <div className="hp-card-head">
                      <div>
                        <p className="hp-card-title">Lượt vote theo hạng mục</p>
                        <p className="hp-card-sub">Top 10 — sắp xếp giảm dần</p>
                      </div>
                      <select
                        className="hp-select"
                        value={selectedCategory}
                        onChange={(e) => onSelectCategory(e.target.value)}
                        disabled={!categories.length}
                      >
                        {categories.length
                          ? categories.map((c) => <option key={c.id} value={c.slug}>{c.title}</option>)
                          : <option value="">Đang tải...</option>}
                      </select>
                    </div>

                    {nomineeLoading && <div className="hp-empty">Đang tải dữ liệu...</div>}
                    {!nomineeLoading && nomineeError && <div className="hp-empty">{nomineeError}</div>}
                    {!nomineeLoading && !nominees.length && !nomineeError && (
                      <div className="hp-empty">Không có dữ liệu trong khoảng này.</div>
                    )}
                    {!nomineeLoading && barData.length > 0 && (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b6965', fontSize: 11, fontFamily: 'Sora' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: '#6b6965', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                          <Bar dataKey="votes" radius={[6, 6, 0, 0]} maxBarSize={40}>
                            {barData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={
                                  i === 0 ? '#c8f04a' :
                                  i === 1 ? '#9abd34' :
                                  i === 2 ? '#718b25' :
                                  'rgba(200,240,74,0.2)'
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Pie chart */}
                  <div className="hp-card">
                    <div className="hp-card-head">
                      <div>
                        <p className="hp-card-title">Tỉ lệ tham gia</p>
                        <p className="hp-card-sub">Đã / chưa vote</p>
                      </div>
                    </div>

                    {totalAll === 0 ? (
                      <div className="hp-empty">Không có dữ liệu</div>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={82}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell fill="#c8f04a" />
                              <Cell fill="rgba(255,255,255,0.08)" />
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                            <Legend
                              iconType="circle"
                              iconSize={7}
                              formatter={(v) => (
                                <span style={{ fontSize: 11, color: '#9b9893', fontFamily: 'Sora' }}>{v}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="hp-pie-center">
                          <span className="hp-pie-pct">
                            {Math.round((votedTotal / totalAll) * 100)}%
                          </span>
                          <span className="hp-pie-label">tham gia</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === 'voters' && (
              <>
                <div className="hp-page-header">
                  <h1 className="hp-page-title">Danh sách voter</h1>
                  <p className="hp-page-sub">Xem chi tiết người dùng đã / chưa tham gia bình chọn</p>
                </div>

                <div className="hp-tables-row">
                  {/* Đã vote */}
                  <div className="hp-card">
                    <div className="hp-card-head">
                      <div>
                        <p className="hp-card-title">Đã vote</p>
                        <p className="hp-card-sub">
                          {votedData ? `${votedData.total.toLocaleString()} bản ghi` : '—'}
                        </p>
                      </div>
                      <span className="hp-badge-live">● Live</span>
                    </div>

                    {voterError && <p className="hp-error">{voterError}</p>}
                    {voterLoading && <p className="hp-note">Đang tải...</p>}
                    {votedData && (
                      <>
                        <div className="hp-table-wrap">
                          <table className="hp-table">
                            <thead>
                              <tr>
                                <th>MSSV</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                {/* <th>Phiếu</th> */}
                                <th>Thời gian vote</th>
                              </tr>
                            </thead>
                            <tbody>
                              {votedData.items.map((row) => (
                                <tr key={row.id}>
                                  <td className="hp-mc">{row.mssv}</td>
                                  <td>{row.fullname}</td>
                                  <td className="hp-mc">{row.email}</td>
                                  {/* <td className="hp-mc">{row.votesInRange}</td> */}
                                  <td className="hp-mc">
                                    {row.lastVotedAt
                                      ? new Date(row.lastVotedAt).toLocaleString('vi-VN')
                                      : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="hp-pagination">
                          <button
                            className="hp-page-btn"
                            onClick={() => onVotedPageChange(Math.max(votedPage - 1, 1))}
                            disabled={votedPage <= 1}
                          >← Trước</button>
                          <span className="hp-page-info">{votedPage} / {votedPages}</span>
                          <button
                            className="hp-page-btn"
                            onClick={() => onVotedPageChange(Math.min(votedPage + 1, votedPages))}
                            disabled={votedPage >= votedPages}
                          >Sau →</button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Chưa vote */}
                  <div className="hp-card">
                    <div className="hp-card-head">
                      <div>
                        <p className="hp-card-title">Chưa vote</p>
                        <p className="hp-card-sub">
                          {notVotedData ? `${notVotedData.total.toLocaleString()} bản ghi` : '—'}
                        </p>
                      </div>
                    </div>

                    {voterLoading && <p className="hp-note">Đang tải...</p>}
                    {notVotedData && (
                      <>
                        <div className="hp-table-wrap">
                          <table className="hp-table">
                            <thead>
                              <tr>
                                <th>MSSV</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                {/* <th>Lần cuối</th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {notVotedData.items.map((row) => (
                                <tr key={row.id}>
                                  <td className="hp-mc">{row.mssv}</td>
                                  <td>{row.fullname}</td>
                                  <td className="hp-mc">{row.email}</td>
                                  {/* <td className="hp-mc">
                                    {row.lastVotedAt
                                      ? new Date(row.lastVotedAt).toLocaleString('vi-VN')
                                      : '—'}
                                  </td> */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="hp-pagination">
                          <button
                            className="hp-page-btn"
                            onClick={() => onNotVotedPageChange(Math.max(notVotedPage - 1, 1))}
                            disabled={notVotedPage <= 1}
                          >← Trước</button>
                          <span className="hp-page-info">{notVotedPage} / {notVotedPages}</span>
                          <button
                            className="hp-page-btn"
                            onClick={() => onNotVotedPageChange(Math.min(notVotedPage + 1, notVotedPages))}
                            disabled={notVotedPage >= notVotedPages}
                          >Sau →</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
}

export default HomePage;