import React, { useEffect, useState } from 'react';
import { FaShoppingCart, FaSearch, FaCreditCard, FaTimes } from 'react-icons/fa';

export default function EcommerceProductPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart_v1')) || []);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [credPhone, setCredPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [rewards, setRewards] = useState(() => Number(localStorage.getItem('cred_rewards') || 0));

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('https://fakestoreapi.com/products');
        const data = await res.json();
        setProducts(data);
        setFiltered(data);
        const cats = Array.from(new Set(data.map(p => p.category)));
        setCategories(cats);
      } catch (e) {
        console.error('Failed to fetch products', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => localStorage.setItem('cart_v1', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('cred_rewards', String(rewards)), [rewards]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    let list = products.slice();
    if (selectedCategory !== 'all') list = list.filter(p => p.category === selectedCategory);
    if (q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    setFiltered(list);
  }, [query, selectedCategory, products]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
  };

  const updateQty = (id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  const removeFromCart = id => setCart(prev => prev.filter(i => i.id !== id));
  const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

  const startCredPayment = () => {
    if (!cart.length) return alert('Cart is empty');
    setShowCheckout(true);
    setOtpSent(false);
    setPaymentSuccess(false);
    setOtp('');
  };

  const sendOtp = () => {
    if (!/^\d{10}$/.test(credPhone)) return alert('Enter a valid 10-digit phone number');
    setOtpSent(true);
    const mock = Math.floor(100000 + Math.random() * 900000);
    console.log('Mock OTP:', mock);
    sessionStorage.setItem('mock_otp', String(mock));
    alert('Mock OTP sent — check console');
  };

  const verifyOtp = () => {
    const mock = sessionStorage.getItem('mock_otp');
    if (!mock) return alert('OTP not generated');
    if (otp === mock) {
      setPaymentSuccess(true);
      setRewards(prev => prev + Math.round(cartTotal() * 0.02));
      setCart([]);
      sessionStorage.removeItem('mock_otp');
    } else alert('Invalid OTP');
  };

  // --- Styles as JS objects ---
  const styles = {
    container: { fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f5f5f5' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    logo: { fontWeight: 'bold', fontSize: 20, color: '#4f46e5' },
    searchCategory: { display: 'flex', alignItems: 'center', gap: 10 },
    input: { padding: '5px', borderRadius: 5, border: '1px solid #ccc' },
    select: { padding: '5px', borderRadius: 5, border: '1px solid #ccc' },
    cartInfo: { display: 'flex', alignItems: 'center', gap: 10 },
    button: { padding: '5px 10px', borderRadius: 5, border: 'none', cursor: 'pointer' },
    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 15, padding: 20 },
    productCard: { background: '#fff', padding: 10, borderRadius: 10, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
    productImg: { maxHeight: 150, objectFit: 'contain', marginBottom: 10 },
    buttons: { display: 'flex', gap: 5, marginTop: 'auto' },
    cartDrawer: { position: 'fixed', top: 0, right: 0, width: 300, height: '100%', background: '#fff', boxShadow: '-2px 0 8px rgba(0,0,0,0.2)', padding: 10, overflowY: 'auto', zIndex: 100 },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
    modalContent: { background: '#fff', padding: 20, borderRadius: 10, width: '90%', maxWidth: 400 },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>CREDshop</div>
        <div style={styles.searchCategory}>
          <FaSearch />
          <input style={styles.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." />
          <select style={styles.select} value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={styles.cartInfo}>
          <div>Rewards: {rewards} pts</div>
          <button style={{ ...styles.button, background: '#4f46e5', color: '#fff' }} onClick={() => setShowCart(true)}><FaShoppingCart /> {cart.length}</button>
        </div>
      </header>

      <main>
        {loading ? <div style={{ textAlign: 'center', padding: 50 }}>Loading...</div> :
          <div style={styles.productGrid}>
            {filtered.map(p => (
              <div key={p.id} style={styles.productCard}>
                <img style={styles.productImg} src={p.image} alt={p.title} />
                <h3>{p.title}</h3>
                <p>{p.category}</p>
                <div>₹{Math.round(p.price * 80)}</div>
                <div style={styles.buttons}>
                  <button style={{ ...styles.button, background: '#4f46e5', color: '#fff' }} onClick={() => addToCart(p)}>Add</button>
                  <button style={{ ...styles.button, background: '#eee' }} onClick={() => setSelectedProduct(p)}>Quick View</button>
                </div>
              </div>
            ))}
          </div>
        }
      </main>

      {showCart && (
        <div style={styles.cartDrawer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2>Your Cart</h2>
            <button style={styles.button} onClick={() => setShowCart(false)}><FaTimes /></button>
          </div>
          {cart.length === 0 ? <p>Cart is empty</p> :
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                <img src={item.image} style={{ width: 50, height: 50, objectFit: 'contain' }} />
                <div>{item.title} x {item.qty}</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))
          }
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>Total: ₹{Math.round(cartTotal() * 80)}</div>
            <button style={{ ...styles.button, background: '#22c55e', color: '#fff' }} onClick={() => { setShowCart(false); startCredPayment(); }}><FaCreditCard /> Pay with CRED</button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div style={styles.modal} onClick={() => setSelectedProduct(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <img style={{ maxWidth: '100%', height: 200, objectFit: 'contain' }} src={selectedProduct.image} />
            <h2>{selectedProduct.title}</h2>
            <p>{selectedProduct.description}</p>
            <div>₹{Math.round(selectedProduct.price * 80)}</div>
            <button style={{ ...styles.button, background: '#4f46e5', color: '#fff' }} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>Add to Cart</button>
            <button style={{ ...styles.button, background: '#22c55e', color: '#fff' }} onClick={() => { setSelectedProduct(null); startCredPayment(); }}>Buy with CRED</button>
          </div>
        </div>
      )}

      {showCheckout && (
        <div style={styles.modal} onClick={() => setShowCheckout(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>CRED Quick Pay</h3>
            <input style={styles.input} value={credPhone} onChange={e => setCredPhone(e.target.value)} placeholder="Phone number" />
            {!otpSent ? <button style={{ ...styles.button, background: '#4f46e5', color: '#fff', marginTop: 10 }} onClick={sendOtp}>Send OTP</button> :
              <>
                <input style={{ ...styles.input, marginTop: 10 }} value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" />
                <button style={{ ...styles.button, background: '#22c55e', color: '#fff', marginTop: 10 }} onClick={verifyOtp}>Verify & Pay</button>
              </>}
            {paymentSuccess && <p style={{ color: 'green', fontWeight: 'bold', marginTop: 10 }}>Payment successful! Rewards credited.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
