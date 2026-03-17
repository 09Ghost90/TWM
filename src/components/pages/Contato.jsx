import { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';

function Contato() {
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    e.target.reset();
    setTimeout(() => setEnviado(false), 4000);
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h1>Contato</h1>
        </Card.Header>
        <Card.Body>
          {enviado && <Alert variant="success">Mensagem enviada com sucesso!</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="contatoNome">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control type="text" placeholder="Seu nome" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="contatoEmail">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control type="email" placeholder="seu@email.com" required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="contatoAssunto">
              <Form.Label>Assunto</Form.Label>
              <Form.Control type="text" placeholder="Assunto" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="contatoMensagem">
              <Form.Label>Mensagem</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Sua mensagem" required />
            </Form.Group>
            <Button variant="primary" type="submit">Enviar</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Contato;