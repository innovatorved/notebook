import { Link } from 'react-router-dom';
import { useSession } from '../lib/auth-client';
import { 
  BookIcon, 
  RocketIcon, 
  ShieldLockIcon, 
  SyncIcon,
  ShareIcon,
  ArrowRightIcon
} from '@primer/octicons-react';

export default function Home() {
  const { data: session } = useSession();
  
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-icon">
          <img src="/logo.png" alt="Notebook" style={{ height: '48px', width: 'auto' }} />
        </div>
        
        <h1 className="hero-title">Notebook</h1>
        
        <p className="hero-subtitle">
          Your notes, securely stored in the cloud. 
          Access them from anywhere, anytime.
        </p>
        
        <div className="hero-actions">
          {session ? (
            <Link to="/notes" className="btn btn-primary btn-lg">
              Go to My Notes
              <ArrowRightIcon size={16} />
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary btn-lg">
                <RocketIcon size={16} />
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features">
        <h2 className="features-title">Why Notebook?</h2>
        
        <div className="grid grid-3">
          <div className="feature-card">
            <div className="feature-icon feature-icon-green">
              <ShieldLockIcon size={24} />
            </div>
            <h3>Secure</h3>
            <p>Your notes are protected with modern authentication and encrypted storage.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon feature-icon-blue">
              <SyncIcon size={24} />
            </div>
            <h3>Sync Everywhere</h3>
            <p>Access your notes from any device. Always in sync, always available.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon feature-icon-orange">
              <ShareIcon size={24} />
            </div>
            <h3>Easy Sharing</h3>
            <p>Share notes with anyone using a simple link. No signup required to view.</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      {!session && (
        <section className="cta">
          <h2>Start Taking Notes Today</h2>
          <p className="text-muted">
            Join thousands of users who trust Notebook for their notes.
          </p>
          <Link to="/signup" className="btn btn-primary">
            Create Free Account
          </Link>
        </section>
      )}
    </div>
  );
}
