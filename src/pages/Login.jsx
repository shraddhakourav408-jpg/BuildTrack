import { useState } from "react";
import {
  HardHat,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter email and password."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const validEmail =
        "admin@buildtrack.com";

      const validPassword =
        "admin123";

      if (
        email.trim().toLowerCase() ===
          validEmail &&
        password === validPassword
      ) {
        if (rememberMe) {
          localStorage.setItem(
            "buildtrack_logged_in",
            "true"
          );
        } else {
          sessionStorage.setItem(
            "buildtrack_logged_in",
            "true"
          );
        }

        localStorage.setItem(
          "buildtrack_user",
          JSON.stringify({
            name: "Shraddha Kourav",
            email:
              "admin@buildtrack.com",
            role: "Administrator",
          })
        );

        onLogin();
      } else {
        setError(
          "Invalid email or password."
        );
      }

      setLoading(false);
    }, 700);
  };

  return (
    <div className="login-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fa;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          color: #172033;
        }

        /* ==========================================
           LEFT SIDE
        ========================================== */

        .login-left {
          width: 52%;
          min-height: 100vh;
          background:
            linear-gradient(
              145deg,
              #101827 0%,
              #17263d 55%,
              #263b5b 100%
            );
          color: white;
          padding: 48px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .login-left::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          right: -180px;
          top: -180px;
          background:
            rgba(255,255,255,.05);
        }

        .login-left::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          left: -160px;
          bottom: -150px;
          background:
            rgba(255,255,255,.04);
        }

        .login-brand {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-brand-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          background: white;
          color: #172033;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-brand-name {
          font-size: 21px;
          font-weight: 800;
        }

        .login-brand-subtitle {
          font-size: 10px;
          color: #98a4b7;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }

        .login-hero {
          position: relative;
          z-index: 2;
          max-width: 580px;
        }

        .login-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border-radius: 20px;
          background:
            rgba(255,255,255,.08);
          color: #cbd4e2;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .8px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .login-hero h1 {
          margin: 0;
          font-size: 44px;
          line-height: 1.08;
          letter-spacing: -1.4px;
        }

        .login-hero h1 span {
          color: #b9c6d9;
        }

        .login-hero p {
          max-width: 480px;
          color: #9ba8ba;
          font-size: 14px;
          line-height: 1.7;
          margin-top: 17px;
        }

        .login-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 28px;
          max-width: 500px;
        }

        .login-feature {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px;
          border-radius: 10px;
          background:
            rgba(255,255,255,.05);
          color: #d0d8e4;
          font-size: 11px;
        }

        .login-feature svg {
          color: #dce4ef;
        }

        .login-footer-left {
          position: relative;
          z-index: 2;
          color: #748196;
          font-size: 10px;
        }

        /* ==========================================
           RIGHT SIDE
        ========================================== */

        .login-right {
          flex: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #f7f8fa;
        }

        .login-card {
          width: 100%;
          max-width: 430px;
          background: white;
          border: 1px solid #e5e8ed;
          border-radius: 20px;
          padding: 34px;
          box-shadow:
            0 20px 55px
            rgba(18,28,43,.08);
        }

        .mobile-brand {
          display: none;
        }

        .login-card-header {
          margin-bottom: 25px;
        }

        .login-card-header h2 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -.5px;
        }

        .login-card-header p {
          color: #858f9e;
          font-size: 12px;
          margin: 7px 0 0;
        }

        /* ==========================================
           ERROR
        ========================================== */

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px;
          background: #fff0ed;
          border: 1px solid #ffd5ce;
          border-radius: 9px;
          color: #b63b2e;
          font-size: 11px;
          margin-bottom: 15px;
        }

        /* ==========================================
           FORM
        ========================================== */

        .login-field {
          margin-bottom: 17px;
        }

        .login-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #4d5767;
          margin-bottom: 7px;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform:
            translateY(-50%);
          color: #8b95a4;
        }

        .login-input {
          width: 100%;
          height: 46px;
          border: 1px solid #dfe3e8;
          border-radius: 10px;
          outline: none;
          padding:
            0 42px;
          font-size: 12px;
          color: #172033;
          background: #fbfcfd;
          transition: .18s;
        }

        .login-input:focus {
          background: white;
          border-color: #8794a7;
          box-shadow:
            0 0 0 3px
            rgba(23,32,51,.06);
        }

        .password-toggle {
          position: absolute;
          right: 9px;
          top: 50%;
          transform:
            translateY(-50%);
          border: none;
          background: transparent;
          color: #7d8795;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
        }

        .password-toggle:hover {
          background: #f1f3f6;
        }

        /* ==========================================
           OPTIONS
        ========================================== */

        .login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 3px 0 21px;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          color: #707a89;
          cursor: pointer;
        }

        .remember input {
          accent-color: #172033;
          width: 13px;
          height: 13px;
        }

        .forgot {
          border: none;
          background: transparent;
          color: #40516b;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        /* ==========================================
           LOGIN BUTTON
        ========================================== */

        .login-button {
          width: 100%;
          height: 47px;
          border: none;
          border-radius: 10px;
          background: #172033;
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: .2s;
        }

        .login-button:hover {
          background: #26354d;
          transform:
            translateY(-1px);
        }

        .login-button:disabled {
          opacity: .65;
          cursor: not-allowed;
          transform: none;
        }

        /* ==========================================
           SECURITY
        ========================================== */

        .security-note {
          margin-top: 20px;
          padding-top: 17px;
          border-top:
            1px solid #edf0f3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #929aa7;
          font-size: 9px;
        }

        .demo-note {
          margin-top: 15px;
          padding: 10px;
          background: #f5f7fa;
          border-radius: 8px;
          text-align: center;
          font-size: 9px;
          color: #8b94a1;
        }

        /* ==========================================
           MOBILE
        ========================================== */

        @media(max-width: 850px) {

          .login-left {
            display: none;
          }

          .login-right {
            min-height: 100vh;
            padding: 18px;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            margin-bottom: 23px;
          }

          .mobile-brand-icon {
            width: 35px;
            height: 35px;
            border-radius: 9px;
            background: #172033;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-brand strong {
            font-size: 17px;
          }

          .login-card {
            max-width: 440px;
            padding: 27px 22px;
          }

        }

        @media(max-width: 420px) {

          .login-right {
            padding: 12px;
          }

          .login-card {
            padding: 24px 18px;
            border-radius: 16px;
          }

          .login-card-header h2 {
            font-size: 24px;
          }

          .login-features {
            grid-template-columns: 1fr;
          }

        }

      `}</style>


      {/* ==========================================
          LEFT PANEL
      ========================================== */}

      <section className="login-left">

        <div className="login-brand">

          <div className="login-brand-icon">
            <HardHat size={25} />
          </div>

          <div>

            <div className="login-brand-name">
              BuildTrack
            </div>

            <div className="login-brand-subtitle">
              Site Management
            </div>

          </div>

        </div>


        <div className="login-hero">

          <div className="login-hero-tag">
            <ShieldCheck size={13} />
            Secure Project Management
          </div>

          <h1>
            Manage your
            <br />
            <span>
              construction site
            </span>
            <br />
            smarter.
          </h1>

          <p>
            One powerful workspace for
            workforce, vehicles, fuel,
            materials, maintenance and
            project reporting.
          </p>


          <div className="login-features">

            <div className="login-feature">
              <CheckCircle2 size={15} />
              Workforce Management
            </div>

            <div className="login-feature">
              <CheckCircle2 size={15} />
              Fleet Management
            </div>

            <div className="login-feature">
              <CheckCircle2 size={15} />
              Material Tracking
            </div>

            <div className="login-feature">
              <CheckCircle2 size={15} />
              Smart Reports
            </div>

          </div>

        </div>


        <div className="login-footer-left">
          © 2026 BuildTrack · Construction
          Site Management System
        </div>

      </section>


      {/* ==========================================
          RIGHT PANEL
      ========================================== */}

      <section className="login-right">

        <div style={{ width: "100%" }}>

          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="mobile-brand-icon">
              <HardHat size={19} />
            </div>

            <strong>
              BuildTrack
            </strong>

          </div>


          <div className="login-card">

            <div className="login-card-header">

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to continue to
                your project dashboard.
              </p>

            </div>


            {/* ERROR */}

            {error && (

              <div className="login-error">

                <AlertTriangle
                  size={15}
                />

                <span>
                  {error}
                </span>

              </div>

            )}


            <form
              onSubmit={
                handleLogin
              }
            >

              {/* EMAIL */}

              <div className="login-field">

                <label className="login-label">
                  Email Address
                </label>

                <div className="login-input-wrap">

                  <Mail
                    className="login-input-icon"
                    size={17}
                  />

                  <input
                    className="login-input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    autoComplete="email"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="login-field">

                <label className="login-label">
                  Password
                </label>

                <div className="login-input-wrap">

                  <Lock
                    className="login-input-icon"
                    size={17}
                  />

                  <input
                    className="login-input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >

                    {showPassword ? (
                      <EyeOff
                        size={16}
                      />
                    ) : (
                      <Eye
                        size={16}
                      />
                    )}

                  </button>

                </div>

              </div>


              {/* OPTIONS */}

              <div className="login-options">

                <label className="remember">

                  <input
                    type="checkbox"
                    checked={
                      rememberMe
                    }
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />

                  Remember me

                </label>


                <button
                  type="button"
                  className="forgot"
                  onClick={() =>
                    alert(
                      "Please contact the administrator to reset your password."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>


              {/* LOGIN */}

              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >

                {loading
                  ? "Signing in..."
                  : "Sign in to BuildTrack"}

                {!loading && (
                  <ArrowRight
                    size={16}
                  />
                )}

              </button>

            </form>


            {/* DEMO */}

            <div className="demo-note">

              Demo Login:
              <strong>
                {" "}
                admin@buildtrack.com
              </strong>
              {" / "}
              <strong>
                admin123
              </strong>

            </div>


            {/* SECURITY */}

            <div className="security-note">

              <ShieldCheck
                size={13}
              />

              Your project workspace
              is protected.

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;