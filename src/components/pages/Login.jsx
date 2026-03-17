import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tipoLogin, setTipoLogin] = useState('admin');
  const [email, setEmail] = useState('admin@hotelaria.com');
  const [senha, setSenha] = useState('admin123');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const auth = await login(email, senha, tipoLogin);
      const destino = auth?.usuario?.papel === 'cliente' ? '/cliente/area' : from;
      navigate(destino, { replace: true });
    } catch (error) {
      const msg = error?.response?.data?.erro || 'Não foi possível autenticar. Verifique email e senha.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-page py-5">
      <Row className="justify-content-center align-items-center g-4">
        <Col lg={10}>
          <Card className="login-card overflow-hidden">
            <Row className="g-0">
              <Col md={6} className="login-panel p-4 p-md-5 d-flex flex-column justify-content-center">
                <h1 className="mb-3">Acesso ao Sistema</h1>
                <p className="mb-4">
                  Escolha seu perfil para entrar como administrador ou cliente.
                </p>
                <div className="login-chip">Sistema de Hotelaria</div>
              </Col>
              <Col md={6} className="p-4 p-md-5">
                <h3 className="mb-4">Entrar</h3>
                {erro && <Alert variant="danger">{erro}</Alert>}

                <div className="d-flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={tipoLogin === 'admin' ? 'primary' : 'outline-light'}
                    onClick={() => {
                      setTipoLogin('admin');
                      setEmail('admin@hotelaria.com');
                      setSenha('admin123');
                    }}
                    className="flex-fill"
                  >
                    Administrador
                  </Button>
                  <Button
                    type="button"
                    variant={tipoLogin === 'cliente' ? 'primary' : 'outline-light'}
                    onClick={() => {
                      setTipoLogin('cliente');
                      setEmail('cliente@hotelaria.com');
                      setSenha('cliente123');
                    }}
                    className="flex-fill"
                  >
                    Cliente
                  </Button>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tipoLogin === 'admin' ? 'admin@hotelaria.com' : 'cliente@hotelaria.com'}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="loginSenha">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Sua senha"
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                    {loading ? 'Entrando...' : 'Acessar painel'}
                  </Button>
                </Form>

                <small className="d-block mt-3 text-muted">
                  {tipoLogin === 'admin'
                    ? 'Credenciais admin: admin@hotelaria.com / admin123'
                    : 'Credenciais cliente: cliente@hotelaria.com / cliente123'}
                </small>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
