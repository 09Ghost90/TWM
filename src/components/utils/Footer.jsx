import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="footer-lux py-3 mt-auto">
      <Container className="text-center">
        <small>&copy; {new Date().getFullYear()} Sistema de Hotelaria — TWM</small>
      </Container>
    </footer>
  );
}

export default Footer;
