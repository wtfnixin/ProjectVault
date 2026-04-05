import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import api from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mockToken, setMockToken] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
      // Academic Hack: Extract the mock token from the response for the UI demonstration
      if (response.data && response.data.mock_magic_link_token) {
        setMockToken(response.data.mock_magic_link_token);
      }
    } catch (err) {
      console.error('Failed to request password reset:', err);
      // For security, even if it fails, we pretend it succeeded unless network error
      setIsSuccess(true); 
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ gridTemplateColumns: '1fr', maxWidth: '500px' }}>
          <div className="auth-form-section">
            <div className="auth-form-container" style={{ textAlign: 'center' }}>
              <div className="auth-logo" style={{ background: 'var(--primary-50)' }}>
                <ShieldCheck size={32} className="text-gradient" />
              </div>
              <h2 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-2xl)' }}>Check your inbox</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              
              {/* MOCK EMAIL UI SECTION - For presentation purposes only */}
              {mockToken && (
                <div style={{
                  background: 'var(--bg-tertiary)',
                  padding: 'var(--spacing-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-primary)',
                  marginBottom: '2rem',
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                    Mock Email Received
                  </p>
                  <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                    Hi, click the secure button below to reset your password. The link expires in 15 minutes.
                  </p>
                  <Link to={`/reset-password/${mockToken}`} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" fullWidth>
                      Reset My Password
                    </Button>
                  </Link>
                </div>
              )}

              <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ gridTemplateColumns: '1fr', maxWidth: '500px' }}>
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <div className="auth-logo">
                <ShieldCheck size={32} color="var(--primary-600)" />
              </div>
              <h2>Forgot Password?</h2>
              <p>No worries, we'll send you reset instructions.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                Reset Password
              </Button>

              <div className="auth-footer" style={{ borderTop: 'none', marginTop: '1rem', paddingTop: '0' }}>
                <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowLeft size={16} /> Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
