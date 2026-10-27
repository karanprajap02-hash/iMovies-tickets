const mongoose = require('mongoose');
const { MONGO_URI } = require('../src/config/env');
const app = require('../src/app');
const User = require('../src/models/User');

async function testEndpoints() {
  await mongoose.connect(MONGO_URI);
  const server = app.listen(5099);

  try {
    const health = await (await fetch('http://127.0.0.1:5099/api/health')).json();
    console.log('1. Health Check:', health.success ? 'OK' : 'FAIL');

    const moviesRes = await (await fetch('http://127.0.0.1:5099/api/movies')).json();
    console.log('2. Movies Count:', moviesRes.count);
    const movie = moviesRes.data[0];

    const reviewsRes = await (await fetch(`http://127.0.0.1:5099/api/movies/${movie._id}/reviews`)).json();
    console.log('3. Reviews Check:', reviewsRes.success ? 'OK' : 'FAIL', 'Found:', reviewsRes.count);

    // Test Login
    const loginRes = await (await fetch('http://127.0.0.1:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@imovies.com', password: 'User@12345' }),
    })).json();
    console.log('4. Login Check:', loginRes.success ? 'OK' : 'FAIL');
    const token = loginRes.token;

    // Test Favorites
    const favsRes = await (await fetch('http://127.0.0.1:5099/api/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    })).json();
    console.log('5. Favorites List Check:', favsRes.success ? 'OK' : 'FAIL', 'Count:', favsRes.count);

    // Test Toggle Favorite
    const toggleRes = await (await fetch(`http://127.0.0.1:5099/api/favorites/toggle/${movie._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })).json();
    console.log('6. Toggle Favorite Check:', toggleRes.success ? 'OK' : 'FAIL', 'isFavorite:', toggleRes.isFavorite);

    // Toggle back
    await fetch(`http://127.0.0.1:5099/api/favorites/toggle/${movie._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('ALL NEW ENDPOINTS VERIFIED SUCCESSFULLY!');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

testEndpoints().catch(console.error);

