import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import api from '../../services/api';
import { useAuth } from '../utils/AuthContext';

function ClienteArea() {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [resumo, setResumo] = useState({ quartos_disponiveis: 0, quartos_totais: 0 });
  const [hospedagensRecentes, setHospedagensRecentes] = useState([]);

  useEffect(() => {
    const carregarPainel = async () => {
      setLoading(true);
      setErro('');
      try {
        const response = await api.get('/cliente/painel');
        setResumo(response.data.resumo || { quartos_disponiveis: 0, quartos_totais: 0 });
        setHospedagensRecentes(response.data.hospedagens_recentes || []);
      } catch {
        setErro('Não foi possível carregar a área do cliente.');
      } finally {
        setLoading(false);
      }
    };

    carregarPainel();
  }, []);

  return (
    <Container className="mt-4 dashboard-page">
      <div className="dashboard-hero mb-4">
        <h1>Área do Cliente</h1>
        <p>
          Olá, <strong>{usuario?.nome || 'Cliente'}</strong>. Acompanhe disponibilidade e movimentações recentes do hotel.
        </p>
      </div>

      {erro && <Alert variant="danger">{erro}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Card className="metric-card">
                <Card.Body>
                  <small>Quartos Disponíveis</small>
                  <h3>{resumo.quartos_disponiveis}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="metric-card">
                <Card.Body>
                  <small>Total de Quartos</small>
                  <h3>{resumo.quartos_totais}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="audit-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Hospedagens Recentes</span>
              <Badge bg="info">Cliente</Badge>
            </Card.Header>
            <Card.Body>
              {!hospedagensRecentes.length ? (
                <p className="text-muted mb-0">Nenhuma hospedagem recente disponível.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Quarto</th>
                      <th>Tipo</th>
                      <th>Diárias</th>
                      <th>Valor</th>
                      <th>Entrada</th>
                      <th>Saída</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospedagensRecentes.map((item) => (
                      <tr key={item.id_hospedagem}>
                        <td>{item.numero_quarto || 'N/A'}</td>
                        <td>{item.tipo_quarto || 'N/A'}</td>
                        <td>{item.diarias}</td>
                        <td>R$ {Number(item.valor_total || 0).toFixed(2)}</td>
                        <td>{new Date(item.data_entrada).toLocaleDateString('pt-BR')}</td>
                        <td>{new Date(item.data_saida).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default ClienteArea;
