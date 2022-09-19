import React from 'react';
import ReactDOM from 'react-dom/client';
import {Route, Routes, BrowserRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import SketchPage from './SketchPage';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
        <Route path="/" element={<App />}>
        </Route>
          
        <Route path="/sketch-page" element={<SketchPage />}>
        </Route>
    </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
