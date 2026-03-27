import { useCallback, useEffect, useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import type {
  Category,
  NomineeSummary,
  VoteNomineeResponse,
  VoteStats,
  VoterListResponse,
} from './types';

const API_BASE = import.meta.env.API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '/api';
const ACCESS_TOKEN_KEY = 'gca-admin-token';
const PAGE_SIZE = 12;

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const getInitialRange = () => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY) ?? '');
  const [tokenInput, setTokenInput] = useState(authToken);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(getInitialRange);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [stats, setStats] = useState<VoteStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nominees, setNominees] = useState<NomineeSummary[]>([]);
  const [nomineeLoading, setNomineeLoading] = useState(false);
  const [nomineeError, setNomineeError] = useState<string | null>(null);

  const [votedPage, setVotedPage] = useState(1);
  const [notVotedPage, setNotVotedPage] = useState(1);
  const [votedData, setVotedData] = useState<VoterListResponse | null>(null);
  const [notVotedData, setNotVotedData] = useState<VoterListResponse | null>(null);
  const [voterLoading, setVoterLoading] = useState(false);
  const [voterError, setVoterError] = useState<string | null>(null);

  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    setTokenInput(authToken);
  }, [authToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 450);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const callApi = useCallback(
    async <T,>(path: string) => {
      const headers: Record<string, string> = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const response = await fetch(`${API_BASE}${path}`, { headers });
      if (!response.ok) {
        const fallback = await response.text().catch(() => '');
        throw new Error(fallback || response.statusText);
      }
      return response.json() as Promise<T>;
    },
    [authToken],
  );

  useEffect(() => {
    let cancelled = false;
    callApi<Category[]>('/categories')
      .then((data) => { if (!cancelled) setCategories(data); })
      .catch((error) => { console.error('Failed to load categories', error); });
    return () => { cancelled = true; };
  }, [callApi]);

  useEffect(() => {
    if (!selectedCategory && categories.length) {
      setSelectedCategory(categories[0].slug);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (!authToken) {
      setStats(null);
      setStatsError('Đăng nhập bằng access token để xem thống kê.');
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    const query = new URLSearchParams();
    if (dateRange.startDate) query.set('startDate', dateRange.startDate);
    if (dateRange.endDate) query.set('endDate', dateRange.endDate);
    const path = `/admin/votes/stats${query.toString() ? `?${query.toString()}` : ''}`;
    callApi<VoteStats>(path)
      .then((payload) => setStats(payload))
      .catch((error) => setStatsError(error.message))
      .finally(() => setStatsLoading(false));
  }, [authToken, callApi, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (!authToken) {
      setVotedData(null);
      setNotVotedData(null);
      setVoterError('Các danh sách cần access token để xem.');
      return;
    }
    setVoterLoading(true);
    setVoterError(null);
    const buildParams = (hasVoted: boolean, page: number) => {
      const params = new URLSearchParams();
      params.set('hasVoted', hasVoted ? 'true' : 'false');
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (dateRange.startDate) params.set('startDate', dateRange.startDate);
      if (dateRange.endDate) params.set('endDate', dateRange.endDate);
      return params;
    };
    Promise.all([
      callApi<VoterListResponse>(`/admin/voters?${buildParams(true, votedPage).toString()}`),
      callApi<VoterListResponse>(`/admin/voters?${buildParams(false, notVotedPage).toString()}`),
    ])
      .then(([voted, notVoted]) => { setVotedData(voted); setNotVotedData(notVoted); })
      .catch((error) => { setVoterError(error.message); setVotedData(null); setNotVotedData(null); })
      .finally(() => setVoterLoading(false));
  }, [authToken, callApi, dateRange.endDate, dateRange.startDate, debouncedSearch, votedPage, notVotedPage]);

  useEffect(() => {
    setVotedPage(1);
    setNotVotedPage(1);
  }, [debouncedSearch, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (!selectedCategory) return;
    setNomineeLoading(true);
    setNomineeError(null);
    const query = new URLSearchParams();
    if (dateRange.startDate) query.set('startDate', dateRange.startDate);
    if (dateRange.endDate) query.set('endDate', dateRange.endDate);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    Promise.all([
      callApi<VoteNomineeResponse[]>(`/categories/${selectedCategory}/nominees`),
      callApi<Record<string, number>>(`/votes/${selectedCategory}/results${suffix}`),
    ])
      .then(([nomineeList, totals]) => {
        const summary = (nomineeList as Array<{
          id: string;
          name: string;
          description?: string;
          imageUrl?: string;
          imageUrls?: string[];
        }>)
          .map((nominee) => ({
            id: nominee.id,
            name: nominee.name,
            description: nominee.description,
            imageUrl: nominee.imageUrl || nominee.imageUrls?.[0],
            votes: totals[nominee.id] ?? 0,
          }))
          .sort((a, b) => b.votes - a.votes);
        setNominees(summary);
      })
      .catch((error) => {
        console.error('Nominee fetch', error);
        setNomineeError('Không thể tải dữ liệu ứng viên.');
        setNominees([]);
      })
      .finally(() => setNomineeLoading(false));
  }, [callApi, dateRange.endDate, dateRange.startDate, selectedCategory]);

  const handleTokenSave = () => {
    const trimmed = tokenInput.trim();
    localStorage.setItem(ACCESS_TOKEN_KEY, trimmed);
    setAuthToken(trimmed);
    setAuthMessage(trimmed ? 'Access token đã được lưu.' : 'Token trống, bạn cần nhập lại.');
  };

  const handleTokenClear = (message = 'Token đã bị xóa.') => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setAuthToken('');
    setTokenInput('');
    setAuthMessage(message);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setLoginError('Cần nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(body || response.statusText);
      }
      const payload = await response.json();
      const accessToken: string | undefined = payload?.accessToken;
      if (!accessToken) throw new Error('Không nhận được access token từ máy chủ.');
      setAuthToken(accessToken);
      setTokenInput(accessToken);
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      setAuthMessage('Đăng nhập thành công.');
      setUsername('');
      setPassword('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Đăng nhập thất bại.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => handleTokenClear('Đã đăng xuất.');

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const isAuthenticated = Boolean(authToken);

  return (
    <div>
      {isAuthenticated ? (
        <HomePage
          dateRange={dateRange}
          onDateChange={handleDateChange}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          stats={stats}
          statsLoading={statsLoading}
          statsError={statsError}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          nominees={nominees}
          nomineeLoading={nomineeLoading}
          nomineeError={nomineeError}
          voterLoading={voterLoading}
          voterError={voterError}
          votedData={votedData}
          notVotedData={notVotedData}
          votedPage={votedPage}
          notVotedPage={notVotedPage}
          onVotedPageChange={setVotedPage}
          onNotVotedPageChange={setNotVotedPage}
          onLogout={handleLogout}
          callApi={callApi}
        />
      ) : (
        <LoginPage
          username={username}
          password={password}
          tokenInput={tokenInput}
          loginLoading={loginLoading}
          loginError={loginError}
          authMessage={authMessage}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onTokenInputChange={setTokenInput}
          onLogin={handleLogin}
          onApplyToken={handleTokenSave}
          onClearToken={() => handleTokenClear('Token đã bị xóa.')}
        />
      )}
    </div>
  );
}

export default App;