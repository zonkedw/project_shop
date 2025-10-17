import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header/Header';
import Cart from './components/Cart/Cart';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import News from './pages/News';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import ProductDetails from './pages/ProductDetails';
import Favorites from './pages/Favorites';
import Catalog from './pages/Catalog';
import Category from './pages/Category';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Vacancies from './pages/Vacancies';
import './App.css';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCartClick = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);

  return (
    <CartProvider>
      <div className="App">
        <Header onCartClick={handleCartClick} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/news" element={<News />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/category/:name" element={<Category />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/vacancies" element={<Vacancies />} />
          </Routes>
        </main>
        <Footer />
        <Cart isOpen={isCartOpen} onClose={handleCartClose} />
      </div>
    </CartProvider>
  );
}

export default App;
