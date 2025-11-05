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
import AdminLogin from './pages/AdminLogin';
import Orders from './pages/Orders';
import AdminOrders from './pages/AdminOrders';
import './App.css';
import Sales from './pages/Sales';
import NewProducts from './pages/NewProducts';
import Popular from './pages/Popular';
import Brands from './pages/Brands';
import Delivery from './pages/Delivery';
import Payment from './pages/Payment';
import Returns from './pages/Returns';
import Partners from './pages/Partners';
import Suppliers from './pages/Suppliers';
import Franchise from './pages/Franchise';
import Advertising from './pages/Advertising';
import Cooperation from './pages/Cooperation';

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
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/category/:name" element={<Category />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/new" element={<NewProducts />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/about" element={<About />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/franchise" element={<Franchise />} />
            <Route path="/advertising" element={<Advertising />} />
            <Route path="/cooperation" element={<Cooperation />} />
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
