import { 
  InfoIcon, 
  HeartIcon, 
  MarkGithubIcon, 
  BookIcon,
  CodeIcon,
  ShieldLockIcon
} from '@primer/octicons-react';

export default function About() {
  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }}>
      <div className="auth-header" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="auth-icon">
          <InfoIcon size={32} />
        </div>
        <h1>About Notebook</h1>
        <p className="text-muted" style={{ fontSize: 18, marginTop: 'var(--space-2)' }}>
          A modern, secure cloud notebook built with love.
        </p>
      </div>
      
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-body">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <BookIcon size={24} />
            What is Notebook?
          </h2>
          <p>
            Notebook is a cloud-based notebook application that lets you create, 
            organize, and access your notes from anywhere. Built with modern web 
            technologies and a beautiful GitHub-inspired design.
          </p>
        </div>
      </div>
      
      <div className="grid grid-2" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card">
          <div className="card-body">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <CodeIcon size={20} className="text-accent" />
              Technology
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 2 }} className="text-muted">
              <li>• React 19 + Vite 6</li>
              <li>• Express.js 5</li>
              <li>• MongoDB</li>
              <li>• better-auth</li>
              <li>• GitHub Octicons</li>
            </ul>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <ShieldLockIcon size={20} className="text-success" />
              Security
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 2 }} className="text-muted">
              <li>• Secure authentication</li>
              <li>• Encrypted sessions</li>
              <li>• Protected API routes</li>
              <li>• Privacy focused</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="cta">
        <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <HeartIcon size={20} className="text-danger" />
          Made with Love
        </h3>
        <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
          Notebook is an open-source project. Contributions are welcome!
        </p>
        <a 
          href="https://github.com/innovatorved/notebook" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          <MarkGithubIcon size={16} />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
