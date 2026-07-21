export default function SettingsPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Module Settings</h2>

      <div style={{ display: "grid", gap: 16, maxWidth: 600 }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 12 }}>General Configuration</h4>
          <div className="field">
            <label>Module Name</label>
            <input className="input" defaultValue="Logistics & Freight" disabled />
          </div>
          <div className="field">
            <label>Default Currency</label>
            <select className="input">
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
          <div className="field">
            <label>Risk Score Threshold</label>
            <input className="input" type="number" defaultValue={60} />
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 12 }}>Analytics Configuration</h4>
          <div className="field">
            <label>Rate Compliance Threshold (%)</label>
            <input className="input" type="number" defaultValue={5} />
          </div>
          <div className="field">
            <label>Weight Variance Threshold (%)</label>
            <input className="input" type="number" defaultValue={10} />
          </div>
          <div className="field">
            <label>Route Distance Variance Threshold (%)</label>
            <input className="input" type="number" defaultValue={10} />
          </div>
          <div className="field">
            <label>SLA Breach Threshold (days)</label>
            <input className="input" type="number" defaultValue={1} />
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 12 }}>Notifications</h4>
          <div className="field">
            <label>
              <input type="checkbox" defaultChecked style={{ marginRight: 8 }} />
              Alert on duplicate billing detection
            </label>
          </div>
          <div className="field">
            <label>
              <input type="checkbox" defaultChecked style={{ marginRight: 8 }} />
              Alert on rate compliance violation
            </label>
          </div>
          <div className="field">
            <label>
              <input type="checkbox" defaultChecked style={{ marginRight: 8 }} />
              Alert on SLA breach
            </label>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: "fit-content" }}>Save Settings</button>
      </div>
    </div>
  );
}
