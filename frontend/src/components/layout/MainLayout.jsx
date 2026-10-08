import Navbar from './Navbar.jsx';

export default function MainLayout({ children, vip = false }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar vip={vip} />

      {/* separación por el navbar fijo */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}