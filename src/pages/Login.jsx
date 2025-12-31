import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth-client';
import { SignInIcon, AlertIcon } from '@primer/octicons-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await signIn.email({ email, password });
      
      if (result.error) {
        setError(result.error.message || 'Invalid email or password');
      } else {
        navigate('/notes');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="auth-icon">
          <SignInIcon size={32} />
        </div>
        <h1>Sign in to Notebook</h1>
      </div>
      
      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <AlertIcon size={16} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <SignInIcon size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <p className="auth-footer">
        New to Notebook? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}
