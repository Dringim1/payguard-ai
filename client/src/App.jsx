import { useEffect, useMemo, useState } from "react";
import "./App.css";

const transactions = [
  {
    id: "PAY-20481",
    customer: "James Wilson",
    email: "james@example.com",
    amount: 245.00,
    date: "Nov 02, 2026 · 16:42",
    status: "Completed",
    risk: "Low",
    reason: "Transaction pattern appears normal.",
  },
  {
    id: "PAY-20480",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    amount: 1890.00,
    date: "Nov 02, 2026 · 16:18",
    status: "Pending",
    risk: "High",
    reason: "Unusually high transaction amount.",
  },
  {
    id: "PAY-20479",
    customer: "Michael Brown",
    email: "michael@example.com",
    amount: 75.50,
    date: "Nov 02, 2026 · 15:56",
    status: "Completed",
    risk: "Low",
    reason: "No unusual activity detected by demo rules.",
  },
  {
    id: "PAY-20478",
    customer: "Emma Davis",
    email: "emma@example.com",
    amount: 3200.00,
    date: "Nov 02, 2026 · 15:31",
    status: "Under Review",
    risk: "High",
    reason: "High transaction amount requires review.",
  },
  {
    id: "PAY-20477",
    customer: "Daniel Smith",
    email: "daniel@example.com",
    amount: 450.00,
    date: "Nov 02, 2026 · 14:49",
    status: "Completed",
    risk: "Medium",
    reason: "Transaction differs from the demo baseline.",
  },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [paypalStatus, setPaypalStatus] = useState({
    loading: true,
    connected: false,
  });
const [orderAmount, setOrderAmount] = useState("10.00");
const [orderLoading, setOrderLoading] = useState(false);
const [orderError, setOrderError] = useState("");
const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("http://localhost:3001/api/paypal/status")
      .then((response) => {
        if (!response.ok) {
          throw new Error("PayPal status request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (active) {
          setPaypalStatus({
            loading: false,
            connected: data.connected === true,
          });
        }
      })
      .catch(() => {
        if (active) {
          setPaypalStatus({
            loading: false,
            connected: false,
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.customer.toLowerCase().includes(search.toLowerCase()) ||
        transaction.id.toLowerCase().includes(search.toLowerCase());

      const matchesRisk =
        riskFilter === "All" || transaction.risk === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [search, riskFilter]);

  const money = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  const createSandboxOrder = async () => {
  const amount = Number(orderAmount);

  if (!Number.isFinite(amount) || amount < 0.01 || amount > 10000) {
    setOrderError("Enter an amount between $0.01 and $10,000.");
    return;
  }

  setOrderLoading(true);
  setOrderError("");
  setCreatedOrder(null);

  try {
    const response = await fetch(
      "http://localhost:3001/api/paypal/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not create Sandbox order.");
    }

    setCreatedOrder(data);
  } catch (error) {
    setOrderError(error.message);
  } finally {
    setOrderLoading(false);
  }
};


  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">P</div>
          <div>
            <h2>PayGuard<span>AI</span></h2>
            <p>PAYMENT INTELLIGENCE</p>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {[
            ["Overview", "◫"],
            ["Transactions", "⇄"],
            ["Risk Analysis", "◈"],
            ["Investigations", "⌕"],
          ].map(([name, icon]) => (
            <button
              key={name}
              className={`nav-item ${activePage === name ? "active" : ""}`}
              onClick={() => setActivePage(name)}
            >
              <span className="nav-icon">{icon}</span>
              {name}
              {name === "Risk Analysis" && (
                <span className="nav-count">2</span>
              )}
            </button>
          ))}
        </nav>

        <div className="nav-label settings-label">PREFERENCES</div>

        <nav className="navigation">
          <button
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
            onClick={() => setActivePage("Settings")}
          >
            <span className="nav-icon">⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-card">
  <span
    className={`connection-dot ${
      paypalStatus.connected ? "connected" : ""
    }`}
  ></span>
  <div>
    <strong>
      {paypalStatus.loading
        ? "Checking PayPal..."
        : paypalStatus.connected
          ? "PayPal connected"
          : "PayPal disconnected"}
    </strong>
    <small>
      {paypalStatus.loading
        ? "Checking Sandbox connection"
        : paypalStatus.connected
          ? "Sandbox · Authenticated"
          : "Sandbox · Connection unavailable"}
    </small>
  </div>
</div>

          <div className="profile">
            <div className="avatar">AH</div>
            <div>
              <strong>Administrator</strong>
              <small>Project workspace</small>
            </div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {activePage}
          </div>
          <div className="topbar-right">
            <span className="environment-badge">
              <span></span> SANDBOX PREVIEW
            </span>
            <button className="notification-button" aria-label="Notifications">
              ♧
            </button>
            <div className="top-avatar">AH</div>
          </div>
        </header>

        <div className="page-container">
          <section className="welcome-section">
            <div>
              <div className="eyebrow">PAYMENT SECURITY WORKSPACE</div>
              <h1>
                {activePage === "Overview"
                  ? "Security overview"
                  : activePage}
              </h1>
              <p>
                Monitor payment activity and investigate potential risks.
              </p>
            </div>
            <div className="date-display">
              <span>◷</span> November 2, 2026
            </div>
          </section>

          <div className="demo-notice">
            <span className="notice-icon">ⓘ</span>
            <div>
              <strong>Demonstration environment</strong>
              <span>
                All transactions and risk indicators on this dashboard are
                sample data. No live PayPal account is connected.
              </span>
            </div>
          </div>
<section className="panel order-panel">
  <div className="panel-header">
    <div>
      <h3>Create Sandbox order</h3>
      <p>Create a test payment through PayPal Sandbox.</p>
    </div>
  </div>

  <div className="order-form">
    <label htmlFor="order-amount">Amount (USD)</label>
    <input
      id="order-amount"
      type="number"
      min="0.01"
      max="10000"
      step="0.01"
      value={orderAmount}
      onChange={(event) => setOrderAmount(event.target.value)}
    />

    <button
      className="primary-button"
      onClick={createSandboxOrder}
      disabled={orderLoading || !paypalStatus.connected}
    >
      {orderLoading ? "Creating order..." : "Create Sandbox order"}
    </button>
  </div>

  {orderError && (
    <p className="order-error">{orderError}</p>
  )}

  {createdOrder && (
    <div className="order-result">
      <strong>Sandbox order created</strong>
      <p>Order ID: {createdOrder.orderId}</p>
      <p>Amount: ${createdOrder.amount}</p>
      <p>Status: {createdOrder.status}</p>
      <a
        href={createdOrder.approvalUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open PayPal approval page →
      </a>
      <p>Creating an order does not mean payment has been completed.</p>
    </div>
  )}
</section>
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total transactions</span>
                <span className="stat-icon blue">⇄</span>
              </div>
              <h2>1,284</h2>
              <div className="stat-caption">Sample activity</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Flagged for review</span>
                <span className="stat-icon orange">⚑</span>
              </div>
              <h2>24</h2>
              <div className="stat-caption warning-text">
                Requires investigation
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>High-risk alerts</span>
                <span className="stat-icon red">!</span>
              </div>
              <h2>08</h2>
              <div className="stat-caption">Sample risk indicators</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Under investigation</span>
                <span className="stat-icon purple">⌕</span>
              </div>
              <h2>12</h2>
              <div className="stat-caption">Open demo cases</div>
            </div>
          </section>

          <section className="content-grid">
            <div className="panel transactions-panel">
              <div className="panel-header">
                <div>
                  <h3>Recent transactions</h3>
                  <p>Review payment activity and risk indicators.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActivePage("Transactions")}
                >
                  View all →
                </button>
              </div>

              <div className="table-controls">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <select
                  value={riskFilter}
                  onChange={(event) => setRiskFilter(event.target.value)}
                  aria-label="Filter by risk"
                >
                  <option value="All">All risk levels</option>
                  <option value="Low">Low risk</option>
                  <option value="Medium">Medium risk</option>
                  <option value="High">High risk</option>
                </select>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>TRANSACTION</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>RISK LEVEL</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <strong>{transaction.customer}</strong>
                          <small>{transaction.id}</small>
                        </td>
                        <td className="amount">
                          {money(transaction.amount)}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${transaction.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`risk-badge ${transaction.risk.toLowerCase()}`}
                          >
                            {transaction.risk}
                          </span>
                        </td>
                        <td>
                          <button
                            className="row-button"
                            onClick={() =>
                              setSelectedTransaction(transaction)
                            }
                            aria-label={`View ${transaction.id}`}
                          >
                            →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTransactions.length === 0 && (
                  <div className="empty-state">
                    No matching transactions found.
                  </div>
                )}
              </div>
            </div>

            <div className="panel alerts-panel">
              <div className="panel-header">
                <div>
                  <h3>Risk alerts</h3>
                  <p>Sample indicators requiring attention.</p>
                </div>
                <span className="alert-number">2</span>
              </div>

              <div className="alert-item high-alert">
                <div className="alert-symbol">!</div>
                <div className="alert-details">
                  <strong>Unusual transaction amount</strong>
                  <p>
                    Sarah Johnson · PAY-20480
                  </p>
                  <small>High risk · Sample rule</small>
                </div>
              </div>

              <div className="alert-item high-alert">
                <div className="alert-symbol">!</div>
                <div className="alert-details">
                  <strong>High-value payment review</strong>
                  <p>
                    Emma Davis · PAY-20478
                  </p>
                  <small>High risk · Sample rule</small>
                </div>
              </div>

              <div className="alert-footer">
                These are illustrative alerts generated from sample
                transaction records.
              </div>
            </div>
          </section>

          {selectedTransaction && (
            <div
              className="modal-backdrop"
              onClick={() => setSelectedTransaction(null)}
            >
              <div
                className="detail-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-header">
                  <div>
                    <span className="eyebrow">TRANSACTION DETAILS</span>
                    <h3>{selectedTransaction.id}</h3>
                  </div>
                  <button
                    className="close-button"
                    onClick={() => setSelectedTransaction(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="detail-row">
                  <span>Customer</span>
                  <strong>{selectedTransaction.customer}</strong>
                </div>
                <div className="detail-row">
                  <span>Email</span>
                  <strong>{selectedTransaction.email}</strong>
                </div>
                <div className="detail-row">
                  <span>Amount</span>
                  <strong>{money(selectedTransaction.amount)}</strong>
                </div>
                <div className="detail-row">
                  <span>Payment status</span>
                  <strong>{selectedTransaction.status}</strong>
                </div>
                <div className="detail-row">
                  <span>Risk level</span>
                  <strong>{selectedTransaction.risk}</strong>
                </div>

                <div className="analysis-box">
                  <strong>Demo rule explanation</strong>
                  <p>{selectedTransaction.reason}</p>
                  <small>
                    This is an illustrative rule result, not a confirmed
                    fraud finding or an AI-generated assessment.
                  </small>
                </div>

                <button
                  className="primary-button modal-button"
                  onClick={() => setSelectedTransaction(null)}
                >
                  Close details
                </button>
              </div>
            </div>
          )}

          <footer className="page-footer">
            <span>PayGuard AI · Payment security assistant</span>
            <span>Prototype v0.1.0</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;