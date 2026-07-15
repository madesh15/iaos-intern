import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post, ApiError } from "../lib/api";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import "./auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organization_name: "",
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  // Password strength meter
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "transparent", pct: 0 };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: "Weak", color: "var(--danger)", pct: 33 };
    if (score <= 3) return { label: "Medium", color: "var(--gold)", pct: 66 };
    return { label: "Strong", color: "var(--success)", pct: 100 };
  };

  const strength = getPasswordStrength(form.password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      // Direct call to signup API without setting global session token immediately
      await post("/api/auth/signup", {
        organization_name: form.organization_name,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });

      setSuccess("Account created successfully! Redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed");
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-brandside">
        <Logo size={38} />
        <div className="auth-brandcopy">
          <h2>Stand up your audit organization in minutes.</h2>
          <p>
            Self-service onboarding. You become the tenant admin and invite your
            team — no IT tickets required.
          </p>
          <ul className="auth-points">
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Your own isolated workspace
            </li>
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Invite and manage your team
            </li>
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Access every audit module
            </li>
          </ul>
        </div>
        <span className="auth-brand-foot">© Cap Corporate</span>
      </div>

      <div className="auth-formside">
        <form className="auth-card" onSubmit={submit}>
          <h1>Create your workspace</h1>
          <p className="auth-lead">Start your organization on IAOS.</p>

          {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

          <div className="field">
            <label>Organization name</label>
            <input
              className="input"
              value={form.organization_name}
              onChange={set("organization_name")}
              placeholder="Acme Holdings"
              disabled={busy || !!success}
              required
            />
          </div>
          <div className="field">
            <label>Your name</label>
            <input
              className="input"
              value={form.full_name}
              onChange={set("full_name")}
              placeholder="Jordan Lee"
              disabled={busy || !!success}
              required
            />
          </div>
          <div className="field">
            <label>Work email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              disabled={busy || !!success}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Choose a strong password"
              disabled={busy || !!success}
              required
            />
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: 3 }}>
                  <span style={{ color: "var(--slate-soft)", fontWeight: 600 }}>Password Strength:</span>
                  <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "var(--line-soft)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${strength.pct}%`, height: "100%", background: strength.color, transition: "width 0.2s" }} />
                </div>
              </div>
            )}
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input
              className="input"
              type="password"
              value={form.confirm_password}
              onChange={set("confirm_password")}
              placeholder="Re-enter your password"
              disabled={busy || !!success}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={busy || !!success}>
            {busy ? "Creating…" : "Create workspace"}
          </button>

          <p className="auth-alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
