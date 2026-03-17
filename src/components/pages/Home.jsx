import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Container className="mt-4 home-page">
      <div className="text-center mb-4 home-hero">
        <h1>Sistema de Hotelaria</h1>
        <p className="lead">Gerencie hóspedes, quartos e hospedagens de forma prática.</p>
      </div>

      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center home-card-body">
              <Card.Title>Hóspedes</Card.Title>
              <Card.Text>Cadastre, edite e gerencie os hóspedes do hotel.</Card.Text>
              <Button as={Link} to="/hospedes" variant="primary">Acessar</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center home-card-body">
              <Card.Title>Quartos</Card.Title>
              <Card.Text>Cadastre quartos, defina tipos, preços e status.</Card.Text>
              <Button as={Link} to="/quartos" variant="primary">Acessar</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center home-card-body">
              <Card.Title>Hospedagens</Card.Title>
              <Card.Text>Registre check-in, check-out e controle diárias.</Card.Text>
              <Button as={Link} to="/hospedagens" variant="success">Acessar</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;