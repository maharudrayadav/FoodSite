import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { categories, restaurants, loading } = useContext(AuthContext);
  if (loading) {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading the freshest data...</p>
    </div>
  );
}
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Delicious food delivered to your doorstep</h1>
          <p>Order from your favorite restaurants with just a few clicks</p>
          <Link to="/signup" className="btn primary-btn">Get Started</Link>
        </div>
      </section>

      <section className="categories-section">
        <h2>Food Categories</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <Link 
              to={`/category/${category.categoryId}`} 
              key={category.categoryId} 
              className="category-card"
            >
              <div className="category-image">
                <img src={category.imageId} alt={category.name} />
              </div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-restaurants">
        <h2>Featured Restaurants</h2>
        <div className="restaurants-grid">
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="restaurant-card">
              <div className="restaurant-image">
                <img src={restaurant.imageId} alt={restaurant.name} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
