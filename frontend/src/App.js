import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MFA from "./pages/MFA";
import Home from "./pages/Home"
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import CartPage from './components/CartPage';

// Dans vos routes



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mfa" element={<MFA />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/commandes" element={<Orders />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
