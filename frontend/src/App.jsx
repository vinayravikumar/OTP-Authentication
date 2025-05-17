import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmailForm from './components/EmailForm';
import OtpForm from './components/OtpForm';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  const [showOtpForm, setShowOtpForm] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={
              showOtpForm ? (
                <OtpForm onOtpSuccess={() => setShowOtpForm(false)} />
              ) : (
                <EmailForm onEmailSubmit={() => setShowOtpForm(true)} />
              )
            } 
          />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
