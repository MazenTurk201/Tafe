import { useState, type FormEvent } from "react";
// @ts-ignore: allow CSS side-effect import without type declarations
import "./Login.css";

interface LoginProps {
  onSubmit?: (credentials: {
    username: string;
    password: string;
    remember: boolean;
  }) => Promise<void> | void;

  onRegister?: () => void;
}

export default function Login({
  onSubmit,
  onRegister,
}: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      // Connect your backend API here later.
      await onSubmit?.({
        username: username.trim(),
        password,
        remember,
      });
    } catch {
      setError("Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-card">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 19.5H34V29C34 35.0751 29.0751 40 23 40C16.9249 40 12 35.0751 12 29V19.5Z"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M34 22H36.5C40.0899 22 43 24.9101 43 28.5C43 32.0899 40.0899 35 36.5 35H33.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                <path
                  d="M17 12C17 14 15.5 14.5 15.5 16.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                <path
                  d="M23 9C23 11.5 21.5 12 21.5 14.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                <path
                  d="M29 12C29 14 27.5 14.5 27.5 16.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="brand-text">
              <span className="eyebrow">WELCOME BACK</span>
              <h1>Cafe Management System</h1>
              <p>Manage your cafe with simplicity.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username or email</label>

              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M20 21C20 17.6863 17.3137 15 14 15H10C6.68629 15 4 17.6863 4 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="15.5"
                    r="1.2"
                    fill="currentColor"
                  />
                </svg>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 3L21 21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10.6 10.6C10.24 10.96 10.02 11.46 10.02 12C10.02 13.09 10.91 13.98 12 13.98C12.54 13.98 13.04 13.76 13.4 13.4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M9.88 5.08C10.56 4.89 11.27 4.8 12 4.8C17.25 4.8 20.55 9.12 21.5 10.6C21.72 10.94 21.72 11.06 21.5 11.4C20.95 12.26 19.7 13.9 17.8 15.2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M6.3 6.3C4.72 7.43 3.62 8.92 2.5 10.6C2.28 10.94 2.28 11.06 2.5 11.4C3.45 12.88 6.75 17.2 12 17.2C13.13 17.2 14.2 17 15.18 16.62"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2.5 12C3.45 10.52 6.75 6.2 12 6.2C17.25 6.2 20.55 10.52 21.5 12C20.55 13.48 17.25 17.8 12 17.8C6.75 17.8 3.45 13.48 2.5 12Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(event.target.checked)
                  }
                  disabled={loading}
                />
                <span className="checkmark" />
                <span>Remember me</span>
              </label>
            </div>

            {error && (
              <div className="error-message" role="alert">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="sign-in-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10H16M11 5L16 10L11 15"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="create-account">
            <span>Don't have an account?</span>

            <button
              type="button"
              className="create-account-button"
              onClick={onRegister}
              disabled={loading}
            >
              Create Account
            </button>
          </div>

          <footer className="login-footer">
            <span>© {new Date().getFullYear()}</span>
            <span className="footer-dot" />
            <span>Cafe Management System</span>
          </footer>
        </div>
      </section>
    </main>
  );
}