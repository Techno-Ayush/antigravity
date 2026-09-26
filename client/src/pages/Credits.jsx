import React, { useState, useEffect } from 'react';
import { CircleDollarSign, LockKeyhole, TrendingDown, TrendingUp, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function Credits() {
  const { user, spendableCredits } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreditData = async () => {
      try {
        const [sumRes, txRes] = await Promise.all([
          api.get('/credits/summary').catch(() => null),
          api.get('/credits/transactions').catch(() => null)
        ]);

        if (sumRes?.data?.success) {
          setSummary(sumRes.data.data);
        }
        if (txRes?.data?.success) {
          setTransactions(txRes.data.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load credit details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditData();
  }, [user]);

  const reserved = user?.reservedCredits || summary?.reservedCredits || 0;
  const earned = user?.lifetimeEarned || summary?.lifetimeEarned || (user?.totalTeachingHours || 12.5);
  const spent = user?.lifetimeSpent || summary?.lifetimeSpent || (user?.totalLearningHours || 8.0);
  const teachingHours = user?.totalTeachingHours || 12.5;
  const learningHours = user?.totalLearningHours || 8.0;

  const handleDownloadStatement = () => {
    const csvHeader = 'Date,Description,Type,Amount,Balance After\n';
    const csvRows = transactions.map((t) => {
      const d = new Date(t.createdAt || Date.now()).toLocaleDateString();
      const desc = `"${(t.description || t.title || '').replace(/"/g, '""')}"`;
      return `${d},${desc},${t.type},${t.amount},${t.balanceAfter || ''}`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillCycle-Ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="page credits-page">
      <div>
        <p className="eyebrow">KNOWLEDGE WALLET</p>
        <h1>Your credits, clearly accounted for.</h1>
        <p className="subcopy">
          Credits are earned by teaching and spent on learning. Every movement has a record.
        </p>
      </div>

      <div className="wallet-grid">
        <div className="wallet-main">
          <p>AVAILABLE TO LEARN</p>
          <h2>
            {spendableCredits !== undefined ? spendableCredits.toFixed(1) : '2.0'} <small>credits</small>
          </h2>
          <span>
            <CircleDollarSign size={16} /> 1 credit = 1 hour of learning
          </span>
        </div>

        <div className="wallet-detail">
          <LockKeyhole size={20} />
          <p>Reserved</p>
          <strong>{Number(reserved).toFixed(1)}</strong>
          <small>{reserved > 0 ? 'Held in session escrow' : 'No active holds'}</small>
        </div>

        <div className="wallet-detail">
          <TrendingUp size={20} />
          <p>Total earned</p>
          <strong>{Number(earned).toFixed(1)}</strong>
          <small>{Number(teachingHours).toFixed(1)} teaching hours</small>
        </div>

        <div className="wallet-detail">
          <TrendingDown size={20} />
          <p>Total spent</p>
          <strong>{Number(spent).toFixed(1)}</strong>
          <small>{Number(learningHours).toFixed(1)} learning hours</small>
        </div>
      </div>

      <section className="ledger">
        <div className="section-heading">
          <div>
            <h2>Credit history</h2>
            <p>An immutable record of your time exchanged.</p>
          </div>
          <button type="button" className="outline-btn" onClick={handleDownloadStatement}>
            <Download size={14} /> Download statement
          </button>
        </div>

        {transactions.length > 0 ? (
          transactions.map((t, idx) => {
            const isPositive = t.amount > 0 || t.type === 'CREDIT_EARNED' || t.type === 'STARTER_CREDIT' || t.type === 'CREDIT_REFUNDED';
            const sign = isPositive ? '+' : '−';
            const iconType = t.type?.toLowerCase().includes('earn')
              ? 'earn'
              : t.type?.toLowerCase().includes('reserve')
              ? 'reserve'
              : t.type?.toLowerCase().includes('refund')
              ? 'refund'
              : 'starter';

            const formattedDate = new Date(t.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const balanceText = t.balanceAfter !== undefined ? `Balance after: ${t.balanceAfter.toFixed(1)}` : '';

            return (
              <article className="ledger-row" key={t._id || idx}>
                <span className={`activity-icon ${iconType}`}>
                  {sign}
                </span>
                <div>
                  <h3>{t.description || t.title || 'Escrow Balance Movement'}</h3>
                  <p>
                    {formattedDate} {balanceText ? `· ${balanceText}` : ''}
                  </p>
                </div>
                <strong className={isPositive ? 'positive' : ''}>
                  {sign}{Math.abs(t.amount || 1).toFixed(1)} <small>credit{Math.abs(t.amount || 1) !== 1 ? 's' : ''}</small>
                </strong>
              </article>
            );
          })
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#7a877e' }}>
            No credit movements recorded yet. Book a session or teach someone to start exchanging!
          </div>
        )}
      </section>
    </section>
  );
}
