import { useEffect, useState } from 'react';
import { Button, Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import QuartosLista from './QuartosLista';
import api from '../../services/api';

function Quartos() {
  const [idQuarto, setIdQuarto] = useState(0);
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('disponível');
  const [quartos, setQuartos] = useState([]);
  const [carregaPagina, setCarregaPagina] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const mostrarSucesso = (msg) => { setSucesso(msg); setTimeout(() => setSucesso(''), 3000); };
  const mostrarErro = (msg) => { setErro(msg); setTimeout(() => setErro(''), 5000); };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/quartos/');
        setQuartos(response.data);
      } catch {
        mostrarErro('Erro ao carregar quartos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carregaPagina]);

  const limparFormulario = () => {
    setIdQuarto(0);
    setNumero('');
    setTipo('');
    setPreco('');
    setDescricao('');
    setStatus('disponível');
  };

  const salvarQuarto = async (e) => {
    e.preventDefault();
    if (!numero || !tipo || !preco) {
      mostrarErro('Número, tipo e preço são obrigatórios.');
      return;
    }
    try {
      const dataToSend = {
        numero,
        tipo,
        preco: parseFloat(preco),
        descricao,
        status,
      };

      if (idQuarto && idQuarto > 0) {
        await api.put(`/quartos/${idQuarto}`, dataToSend);
        mostrarSucesso('Quarto atualizado com sucesso!');
      } else {
        await api.post('/quartos/', dataToSend);
        mostrarSucesso('Quarto cadastrado com sucesso!');
      }
      limparFormulario();
      setCarregaPagina(!carregaPagina);
    } catch {
      mostrarErro('Erro ao salvar quarto.');
    }
  };

  const handleSelecao = async (id) => {
    try {
      const response = await api.get(`/quartos/${id}`);
      const d = response.data;
      setIdQuarto(d.id_quarto);
      setNumero(d.numero);
      setTipo(d.tipo);
      setPreco(d.preco);
      setDescricao(d.descricao);
      setStatus(d.status);
    } catch {
      mostrarErro('Erro ao carregar quarto.');
    }
  };

  const deletarQuarto = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este quarto?')) return;
    try {
      await api.delete(`/quartos/${id}`);
      mostrarSucesso('Quarto deletado com sucesso!');
      limparFormulario();
      setCarregaPagina(!carregaPagina);
    } catch {
      mostrarErro('Erro ao deletar quarto.');
    }
  };

  return (
    <Card>
      <Card.Header className="bg-primary text-white">
        <h1>Cadastro de Quartos</h1>
      </Card.Header>
      <Card.Body>
        {erro && <Alert variant="danger" dismissible onClose={() => setErro('')}>{erro}</Alert>}
        {sucesso && <Alert variant="success">{sucesso}</Alert>}

        <Form onSubmit={salvarQuarto}>
          <Row className="mb-3">
            <Col sm={3}>
              <Form.Group controlId="formBasicNumero">
                <Form.Label>Número *</Form.Label>
                <Form.Control type="text" placeholder="Nº do quarto" onChange={(e) => setNumero(e.target.value)} value={numero} required />
              </Form.Group>
            </Col>
            <Col sm={3}>
              <Form.Group controlId="formBasicTipo">
                <Form.Label>Tipo *</Form.Label>
                <Form.Select onChange={(e) => setTipo(e.target.value)} value={tipo} required>
                  <option value="">Selecione o tipo</option>
                  <option value="solteiro">Solteiro</option>
                  <option value="casal">Casal</option>
                  <option value="duplo">Duplo</option>
                  <option value="suite">Suite</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={3}>
              <Form.Group controlId="formBasicPreco">
                <Form.Label>Preço/diária *</Form.Label>
                <Form.Control type="number" placeholder="0.00" onChange={(e) => setPreco(e.target.value)} value={preco} step="0.01" min="0" required />
              </Form.Group>
            </Col>
            <Col sm={3}>
              <Form.Group controlId="formBasicStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select onChange={(e) => setStatus(e.target.value)} value={status}>
                  <option value="disponível">Disponível</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="manutenção">Manutenção</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm={12}>
              <Form.Group controlId="formBasicDescricao">
                <Form.Label>Descrição</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Descrição do quarto" onChange={(e) => setDescricao(e.target.value)} value={descricao} />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 mb-3">
            <Button variant="primary" type="submit">
              {idQuarto > 0 ? 'Atualizar' : 'Salvar'}
            </Button>
            <Button variant="secondary" onClick={limparFormulario}>Limpar</Button>
          </div>

          {loading ? (
            <div className="text-center my-4"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <QuartosLista data={quartos} handleSelecao={handleSelecao} deletarQuarto={deletarQuarto} />
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Quartos;
