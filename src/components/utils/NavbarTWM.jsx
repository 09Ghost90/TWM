import { Link, useNavigate } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { useAuth } from './AuthContext';

function NavbarTWM() {
  const navigate = useNavigate();
  const { usuario, papel, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Navbar expand="lg" className="navbar-lux" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={papel === 'cliente' ? '/cliente/area' : '/dashboard'}>Hotel System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {papel === 'cliente' ? (
              <Nav.Link as={Link} to="/cliente/area">Minha Área</Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/about">Sobre</Nav.Link>
                <Nav.Link as={Link} to="/contato">Contato</Nav.Link>
                <NavDropdown title="Cadastros" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/hospedes">Hóspedes</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/quartos">Quartos</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/hospedagens">Hospedagens</NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
          <div className="d-flex align-items-center gap-2 navbar-user">
            <span className="small">{usuario?.nome || 'Usuário'}</span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default NavbarTWM;
