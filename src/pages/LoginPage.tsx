type LoginPageProps = {
  username: string;
  password: string;
  tokenInput: string;
  loginLoading: boolean;
  loginError: string | null;
  authMessage: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTokenInputChange: (value: string) => void;
  onLogin: () => void;
  onApplyToken: () => void;
  onClearToken: () => void;
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

  .lp-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f4f0;
    padding: 24px;
  }

  .lp-card {
    background: #fff;
    border: 1px solid #e4e2dc;
    border-radius: 16px;
    padding: 40px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }

  .lp-title {
    font-size: 18px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 0 0 28px;
    letter-spacing: -0.3px;
  }

  .lp-field {
    margin-bottom: 12px;
  }

  .lp-input {
    width: 100%;
    box-sizing: border-box;
    height: 42px;
    padding: 0 14px;
    border: 1px solid #e0ded8;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    background: #fafaf8;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }

  .lp-input:focus {
    border-color: #1a1a1a;
    background: #fff;
  }

  .lp-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .lp-btn-primary {
    width: 100%;
    height: 42px;
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 4px;
    transition: opacity 0.15s;
  }

  .lp-btn-primary:hover:not(:disabled) {
    opacity: 0.85;
  }

  .lp-btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .lp-error {
    font-size: 13px;
    color: #c0392b;
    margin: 10px 0 0;
  }

  .lp-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
    color: #b0ae a8;
    font-size: 12px;
    color: #aaa8a0;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .lp-divider::before,
  .lp-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e4e2dc;
  }

  .lp-token-label {
    font-size: 13px;
    color: #666;
    margin: 0 0 10px;
  }

  .lp-token-row {
    display: flex;
    gap: 8px;
  }

  .lp-token-row .lp-input {
    flex: 1;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
  }

  .lp-btn-sm {
    height: 42px;
    padding: 0 14px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s, background 0.15s;
    border: none;
  }

  .lp-btn-apply {
    background: #1a1a1a;
    color: #fff;
  }

  .lp-btn-apply:hover:not(:disabled) { opacity: 0.85; }
  .lp-btn-apply:disabled { opacity: 0.35; cursor: not-allowed; }

  .lp-btn-clear {
    background: #f0ede8;
    color: #555;
  }

  .lp-btn-clear:hover { background: #e8e4de; }

  .lp-hint {
    font-size: 12px;
    color: #aaa8a0;
    margin: 10px 0 0;
    line-height: 1.5;
  }

  .lp-note {
    font-size: 12px;
    color: #2e7d32;
    margin: 8px 0 0;
  }
`;

export function LoginPage({
  username,
  password,
  loginLoading,
  loginError,
  onUsernameChange,
  onPasswordChange,
  onLogin,
}: LoginPageProps) {
  return (
    <>
      <style>{styles}</style>
      <div className="lp-root">
        <div className="lp-card">
          {/* Login section */}
          <p className="lp-title">Đăng nhập admin</p>

          <div className="lp-field">
            <input
              className="lp-input"
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="Tên đăng nhập"
              disabled={loginLoading}
            />
          </div>

          <div className="lp-field">
            <input
              className="lp-input"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Mật khẩu"
              disabled={loginLoading}
              onKeyDown={(e) => e.key === 'Enter' && onLogin()}
            />
          </div>

          <button
            className="lp-btn-primary"
            type="button"
            onClick={onLogin}
            disabled={loginLoading}
          >
            {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          {loginError && <p className="lp-error">{loginError}</p>}
        </div>
      </div>
    </>
  );
}

export default LoginPage;