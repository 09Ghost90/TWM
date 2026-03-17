import './App.css';
import Dashboard from './components/pages/Dashboard';
import ClienteArea from './components/pages/ClienteArea';
import Contato from './components/pages/Contato';
import About from './components/pages/About';
import Hospedes from './components/pages/Hospedes';
import Quartos from './components/pages/Quartos';
import Hospedagens from './components/pages/Hospedagens';
import Login from './components/pages/Login';
import NavbarTWM from './components/utils/NavbarTWM';
import Footer from './components/utils/Footer';
import ErrorBoundary from './components/utils/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/utils/AuthContext';
import RequireAuth from './components/utils/RequireAuth';
import { Container, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function NotFound() {
  return (
    <Container className="mt-5 text-center">
      <Alert variant="warning">
        <h2>404 — Página não encontrada</h2>
        <p>A página que você procura não existe.</p>
      </Alert>
    </Container>
  );
}

function AppShell() {
  const location = useLocation();
  const { isAuthenticated, papel } = useAuth();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isLoginPage && isAuthenticated && <NavbarTWM />}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={(
              <RequireAuth>
                <Navigate to={papel === 'cliente' ? '/cliente/area' : '/dashboard'} replace />
              </RequireAuth>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <RequireAuth role="admin">
                <Dashboard />
              </RequireAuth>
            )}
          />
          <Route
            path="/cliente/area"
            element={(
              <RequireAuth role="cliente">
                <ClienteArea />
              </RequireAuth>
            )}
          />
          <Route
            path="/about"
            element={(
              <RequireAuth role="admin">
                <About />
              </RequireAuth>
            )}
          />
          <Route
            path="/contato"
            element={(
              <RequireAuth role="admin">
                <Contato />
              </RequireAuth>
            )}
          />
          <Route
            path="/hospedes"
            element={(
              <RequireAuth role="admin">
                <Hospedes />
              </RequireAuth>
            )}
          />
          <Route
            path="/quartos"
            element={(
              <RequireAuth role="admin">
                <Quartos />
              </RequireAuth>
            )}
          />
          <Route
            path="/hospedagens"
            element={(
              <RequireAuth role="admin">
                <Hospedagens />
              </RequireAuth>
            )}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isLoginPage && isAuthenticated && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppShell />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
