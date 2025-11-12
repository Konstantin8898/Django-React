import './App.css';
import React, { useEffect } from 'react';
import Header from './components/main-page/main-page-header/header';
import Footer from './components/main-page/main-page-footer/footer';
import LoginForm from './components/main-page/auth/login/login';
import RegistrationForm from './components/main-page/auth/registration/registration';
import Content from './components/main-page/content/content';

function App() {
  const [showRegistration, setShowRegistration] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [token, setToken] = React.useState(null);
  const [user, setUser] = React.useState(null);

  const saveToken = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    if (token) {
      fetch('http://127.0.0.1:8000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      }).catch(() => {});
    }
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };
  
  useEffect(() => {
    const handleUnload = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        navigator.sendBeacon(
          'http://127.0.0.1:8000/logout',
          JSON.stringify({ token: storedToken })
        );
      }
    };
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  const handleRegistration = () => {
    setShowRegistration(!showRegistration);
  };

  return (
    <div className="App">
      <Header user={user} isAuthenticated={isAuthenticated} onLogout={logout} />
      <section className="app-section">
        {isAuthenticated ? (
          <Content token={token} setUser={setUser} />
        ) : (
          <>
            {showRegistration ? (
              <RegistrationForm 
                onRegister={handleRegistration}
                onBack={() => setShowRegistration(false)}
              />
            ) : (
              <LoginForm 
                onLogin={saveToken}
                onShowRegister={() => setShowRegistration(true)}
              />
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}

export default App;
