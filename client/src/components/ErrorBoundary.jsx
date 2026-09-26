import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SkillCycle Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="page" style={{ paddingTop: '80px', textAlign: 'center' }}>
          <div style={{ maxWidth: '480px', margin: 'auto', background: '#fff', border: '1px solid #e3e9e2', borderRadius: '8px', padding: '32px' }}>
            <AlertCircle size={40} color="#b75b4e" style={{ margin: '0 auto 14px' }} />
            <h2 style={{ font: '700 22px Fraunces, serif', marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ color: '#68776f', fontSize: '13px', marginBottom: '20px' }}>
              We've protected the session state. Click below to return to your dashboard.
            </p>
            <button className="dark-btn" onClick={this.handleReset}>
              <RefreshCw size={15} /> Return to Dashboard
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
