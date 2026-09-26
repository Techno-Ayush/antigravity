import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Coins,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Overview() {
  const navigate = useNavigate();
  const { user, spendableCredits } = useAuth();

  return (
    <section className="page">
      {/* Hero Section */}
      <div className="welcome-row">
        <div>
          <p className="eyebrow">PEER-TO-PEER SKILL EXCHANGE • TIME-BANK PLATFORM</p>
          <h1>Your knowledge becomes currency.</h1>
          <p className="subcopy">
            Teach what you know. Earn time credits. Learn what you want. A full-stack exchange where zero money changes hands.
          </p>
        </div>
        <button className="dark-btn action-btn" onClick={() => navigate('/dashboard')}>
          Open Dashboard <ArrowRight size={17} />
        </button>
      </div>

      {/* Credit Banner - The Core Mechanism */}
      <section className="credit-banner">
        <div>
          <p className="eyebrow">THE TIME-BANK CREDIT ECONOMY</p>
          <h2>1 Hour = 1 Credit</h2>
          <p>
            Your balance: {spendableCredits !== undefined ? spendableCredits.toFixed(1) : '3.0'} available credits · 1 credit equals 1 hour of learning
          </p>
        </div>
        <div className="credit-cycle">
          <span><GraduationCap size={18} /> Teach (1h)</span>
          <ArrowRight size={18} />
          <span><Coins size={18} /> Earn (+1 Cr)</span>
          <ArrowRight size={18} />
          <span><UsersRound size={18} /> Learn (1h)</span>
        </div>
        <button className="light-btn" onClick={() => navigate('/discover')}>
          Explore skills <ChevronRight size={16} />
        </button>
      </section>

      {/* Trust Safeguards Grid */}
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-icon green"><Coins size={20} /></span>
          <div>
            <p>STARTER CREDITS</p>
            <strong>+3.0 Credits</strong>
            <small>Free initial balance</small>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon gold"><CheckCircle2 size={20} /></span>
          <div>
            <p>ESCROW PROTECTION</p>
            <strong>Two Confirmations</strong>
            <small>Both confirm completion</small>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon purple"><RefreshCw size={20} /></span>
          <div>
            <p>ASYNC CIRCULATION</p>
            <strong>No Direct Barter</strong>
            <small>Earn from A, learn from B</small>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon blue"><Sparkles size={20} /></span>
          <div>
            <p>MATCHING ENGINE</p>
            <strong>100% Deterministic</strong>
            <small>Rule-based, explainable</small>
          </div>
        </div>

        <div className="stat">
          <span className="stat-icon rose"><ShieldCheck size={20} /></span>
          <div>
            <p>ZERO MONEY INVOLVED</p>
            <strong>Time Currency</strong>
            <small>Equal value for every hour</small>
          </div>
        </div>
      </div>

      {/* Two Column: The Barter Problem Solved & How It Works */}
      <div className="two-column">
        {/* Left Column: The Barter Problem Solved */}
        <section>
          <div className="section-heading">
            <div>
              <h2>Solving the classic barter problem</h2>
              <p>Why direct barter breaks down and how asynchronous circulation fixes it.</p>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e4e9e3', borderRadius: '7px', padding: '22px' }}>
            <div style={{ background: '#faecea', border: '1px solid #f6cfc9', borderRadius: '6px', padding: '14px', marginBottom: '14px' }}>
              <strong style={{ display: 'block', color: '#a73e31', fontSize: '12px', marginBottom: '4px' }}>
                THE CLASSIC BARTER DILEMMA (DOUBLE COINCIDENCE OF WANTS)
              </strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#6e2b22', lineHeight: 1.5 }}>
                "Rahul wants to learn Guitar from Priya, but Priya doesn't want Rahul's Excel skill. Direct barter fails and no learning happens."
              </p>
            </div>

            <div style={{ background: '#edf5ed', border: '1px solid #d5e8d8', borderRadius: '6px', padding: '14px' }}>
              <strong style={{ display: 'block', color: '#2b6346', fontSize: '12px', marginBottom: '4px' }}>
                THE TIME-BANK CREDIT SOLUTION (SKILLCYCLE)
              </strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#274e3e', lineHeight: 1.5 }}>
                "Rahul teaches Excel to Sneha → Rahul earns +1 credit.<br />
                Rahul spends that 1 credit learning Guitar from Priya.<br />
                Priya later spends her credit learning Spanish from Amit."
              </p>
            </div>

            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #edf0eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#68776f' }}>
                Every participant's knowledge becomes spending power.
              </span>
              <button className="dark-btn" onClick={() => navigate('/credits')}>
                View credit ledger
              </button>
            </div>
          </div>

          <div className="skills-callout" style={{ marginTop: '22px' }}>
            <div>
              <p className="eyebrow">READY TO PARTICIPATE</p>
              <h3>List what you can teach today.</h3>
              <p>Offer 1 hour of your knowledge to unlock your next skill.</p>
            </div>
            <button className="dark-btn" onClick={() => navigate('/profile')}>
              Add skills
            </button>
          </div>
        </section>

        {/* Right Column: 5-Step Session Lifecycle */}
        <section>
          <div className="section-heading">
            <div>
              <h2>How an exchange works</h2>
              <p>A step-by-step verified workflow designed for campus safety.</p>
            </div>
          </div>

          <div className="activity-list">
            <div className="activity">
              <span className="activity-icon earn">1</span>
              <div>
                <strong>List skills you know & skills you want</strong>
                <small>Profiles declare teaching offerings and learning goals</small>
              </div>
            </div>

            <div className="activity">
              <span className="activity-icon reserve">2</span>
              <div>
                <strong>Discover deterministic matches</strong>
                <small>Ranked by exact skill overlap, format, and reputation</small>
              </div>
            </div>

            <div className="activity">
              <span className="activity-icon reserve">3</span>
              <div>
                <strong>Request a session (1 hour = 1 credit held)</strong>
                <small>Cost is locked in escrow hold — spendable credits update safely</small>
              </div>
            </div>

            <div className="activity">
              <span className="activity-icon earn">4</span>
              <div>
                <strong>Meet & exchange knowledge</strong>
                <small>Coordinated via integrated real-time messaging</small>
              </div>
            </div>

            <div className="activity">
              <span className="activity-icon starter">5</span>
              <div>
                <strong>Double confirmation & credit transfer</strong>
                <small>Both confirm completion → teacher receives credit instantly</small>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
            <button className="dark-btn" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
            <button className="outline-btn" style={{ flex: 1 }} onClick={() => navigate('/discover')}>
              Search Teachers
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
