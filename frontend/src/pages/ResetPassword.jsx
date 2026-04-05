import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Shield } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import api from '../services/api';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ gridTemplateColumns: '1fr', maxWidth: '500px' }}>
          <div className="auth-form-section">
            <div className="auth-form-container" style={{ textAlign: 'center' }}>
              <div className="auth-logo" style={{ background: 'var(--success-50)' }}>
                <Shield size={32} color="var(--success-700)" />
              </div>
              <h2 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-2xl)' }}>Password Reset!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Your password has been changed successfully. You will be redirected to the login page momentarily.
              </p>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="primary" fullWidth>
                  Continue to Sign In
                </Button>
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
                <Lock size={32} color="var(--primary-600)" />
              </div>
              <h2>Set New Password</h2>
              <p>Your new password must be securely hashed.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <Input
                label="New Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                required
              />
              
              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                Update Password
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
