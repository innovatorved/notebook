import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './lib/auth-client';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Notes from './pages/Notes';
import About from './pages/About';
import SharedNote from './pages/SharedNote';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { data: session, isPending } = useSession();
  
  if (isPending) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Public Route - Redirect if already logged in
function PublicRoute({ children }) {
  const { data: session, isPending } = useSession();
  
  if (isPending) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (session) {
    return <Navigate to="/notes" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/note/:id" element={<SharedNote />} />
        
        {/* Auth Routes - Redirect if logged in */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/notes" element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
