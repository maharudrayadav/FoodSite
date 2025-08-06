// src/pages/CartPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // UPDATED IMPORT
import './CartPage.css';

const CartPage = () => {
  const { 
    cart, 
    cartTotal, 
    removeFromCart, 
    updateQuantity,
    clearCart 
  } = useCart(); // UPDATED HOOK

  const handleCheckout = () => {
    alert('Order placed successfully!');
    clearCart();
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h2>Your Cart</h2>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/" className="btn primary-btn">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.itemId} className="cart-item">
            <div className="item-info">
              <img 
                src={item.imageId} 
                alt={item.name} 
                className="cart-item-image"
              />
              <div>
                <h3>{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="item-controls">
              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.itemId)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
            <div className="item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="total-section">
          <h3>Total: ${cartTotal.toFixed(2)}</h3>
        </div>
        <div className="cart-actions">
          <button 
            onClick={clearCart} 
            className="btn secondary-btn"
          >
            Clear Cart
          </button>
          <button 
            onClick={handleCheckout} 
            className="btn primary-btn"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;