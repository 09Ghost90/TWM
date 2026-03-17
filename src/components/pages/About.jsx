import { Container, Card } from 'react-bootstrap';

function About() {
  return (
    <Container className="mt-4 about-page">
      <Card className="shadow-sm">
        <Card.Body className="about-content">
          <h1>Sobre o Sistema</h1>
          <p>
            O <strong>Sistema de Hotelaria</strong> é uma aplicação web desenvolvida como
            projeto acadêmico da disciplina de <strong>Tecnologias Web e Mobile (TWM)</strong>.
          </p>
          <h5>Tecnologias utilizadas</h5>
          <ul>
            <li><strong>Front-end:</strong> React 19, React Router, React-Bootstrap, Axios, Vite</li>
            <li><strong>Back-end:</strong> Node.js com Express e banco de dados relacional (API REST em localhost:3000)</li>
          </ul>
          <h5>Funcionalidades</h5>
          <ul>
            <li>CRUD completo de Hóspedes (com máscara de CPF/CEP e busca ViaCEP)</li>
            <li>CRUD completo de Quartos (tipos, preços, status)</li>
            <li>Registro de Hospedagens com cálculo automático de diárias e valor total</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default About;