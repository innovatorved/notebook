import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
    </>
  );
}
