import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/routes/ProtectedRoute';
import HomePage from './pages/HomePage';
import CarteleraPage from './pages/CarteleraPage';
import PreventaPage from './pages/PreventaPage';
import PromotionsPage from './pages/PromotionsPage';
import ContactoPage from './pages/ContactoPage';
import LoginPage from './pages/LoginPage';
import ReservationPage from './pages/ReservationPage';
import AsientosPage from './pages/AsientosPage';
import PagoPage from './pages/PagoPage';
import DashboardPage from './pages/DashboardPage';
import InformacionPage from './pages/InformacionPage'; 
import DulceriaPage from './pages/DulceriaPage'; 
import CinegoldPlusPage from './pages/CinegoldPlusPage'; 

function App() {
  return (
    <div className="min-h-screen bg-cinemaBg text-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cartelera" element={<CarteleraPage />} />
          <Route path="/preventa" element={<PreventaPage />} />
          <Route path="/promociones" element={<PromotionsPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/funciones/:id" element={<ReservationPage />} />
          <Route path="/asientos" element={<AsientosPage />} />
          <Route path="/pago" element={<PagoPage />} />
          <Route element={<ProtectedRoute roles={['Administrador', 'SuperAdmin']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="/informacion" element={<InformacionPage />} />
          <Route path="/DulceriaPage" element={<DulceriaPage />} /> 
           <Route path="/CinegoldPlusPage" element={<CinegoldPlusPage />} /> 
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
