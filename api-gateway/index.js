const express = require('express');
const cors = require('cors'); // 🔹 ΠΡΟΣΘΗΚΗ
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();



app.use(cors()); // 🔹 Ενεργοποίηση CORS


// Proxy για user-service με pathRewrite
app.use('/users', createProxyMiddleware({
  target: 'http://user-service:5005',
  changeOrigin: true,
  pathRewrite: {
    '^/users': '' // αφαιρεί το /users από το path
  }
}));

// Proxy για grades-service
app.use('/grades', createProxyMiddleware({
  target: 'http://grades-service:5003',
  changeOrigin: true
}));

// Proxy για stats-service
app.use('/stats', createProxyMiddleware({
  target: 'http://stats-service:5004',
  changeOrigin: true
}));

// Proxy για review-service
app.use('/reviews', createProxyMiddleware({
  target: 'http://review-service:5006',
  changeOrigin: true
}));

app.listen(8080, () => {
  console.log('API Gateway running on port 8080');
});
