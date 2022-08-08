import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'antd/dist/antd.min.css';
import { Layout } from 'antd'
import Header from './components/layouts/Header';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Layout>
    <Header />
    <App />
  </Layout>
);


