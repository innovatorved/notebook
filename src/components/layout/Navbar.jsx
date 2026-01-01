import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession, signOut } from '../../lib/auth-client';
import { 
  BookIcon, 
  HomeIcon, 
  InfoIcon, 
  SignInIcon, 
  SignOutIcon, 
  PersonAddIcon,
  NoteIcon,
  SearchIcon
} from '@primer/octicons-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  
  const isActive = (path) => location.pathname === path;
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Notebook" style={{ height: '28px', width: 'auto' }} />
          <span>Notebook</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`header-nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <HomeIcon size={16} />
            <span>Home</span>
          </Link>
          
          {session && (
            <Link 
              to="/notes" 
              className={`header-nav-link ${isActive('/notes') ? 'active' : ''}`}
            >
              <NoteIcon size={16} />
              <span>My Notes</span>
            </Link>
          )}
          
          <Link 
            to="/about" 
            className={`header-nav-link ${isActive('/about') ? 'active' : ''}`}
          >
            <InfoIcon size={16} />
            <span>About</span>
          </Link>
        </nav>
        
        {/* Search - Only when logged in */}
        {session && (
          <div className="header-search search-input">
            <SearchIcon size={16} />
            <input 
              type="search"
              className="form-control"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        
        {/* Auth Actions */}
        <div className="header-actions">
          {isPending ? (
            <div className="spinner"></div>
          ) : session ? (
            <>
              <div className="header-user">
                {session.user.name || session.user.email}
              </div>
              <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
                <SignOutIcon size={14} />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <SignInIcon size={14} />
                <span>Sign in</span>
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <PersonAddIcon size={14} />
                <span>Sign up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
