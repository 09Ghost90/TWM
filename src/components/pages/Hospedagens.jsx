import { useEffect, useState } from 'react';
import { Button, Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import HospedagensLista from './HospedagensLista';
import api from '../../services/api';

function Hospedagens() {
  const [idHospedagem, setIdHospedagem] = useState(0);
  const [hospede, setHospede] = useState('');
  const [quarto, setQuarto] = useState('');
  const [dataEntrada, setDataEntrada] = useState('');
  const [dataSaida, setDataSaida] = useState('');
  const [diarias, setDiarias] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [hospedes, setHospedes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [hospedagens, setHospedagens] = useState([]);
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
        const [hospedagensRes, hospedesRes, quartosRes] = await Promise.all([
          api.get('/hospedagens/'),
          api.get('/hospedes/'),
          api.get('/quartos/'),
        ]);
        setHospedagens(hospedagensRes.data);
        setHospedes(hospedesRes.data);
        setQuartos(quartosRes.data);
      } catch {
        mostrarErro('Erro ao carregar dados. Verifique se o servidor está ativo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carregaPagina]);

  const calcularDiarias = (dataIn, dataSd) => {
    if (dataIn && dataSd) {
      const diff = Math.ceil((new Date(dataSd) - new Date(dataIn)) / (1000 * 60 * 60 * 24));
      const dias = diff > 0 ? diff : 0;
      setDiarias(dias);
      return dias;
    }
    return 0;
  };

  const calcularValorTotal = (dataIn, dataSd, idQuarto) => {
    if (dataIn && dataSd && idQuarto) {
      const dias = calcularDiarias(dataIn, dataSd);
      const quartoSel = quartos.find((q) => q.id_quarto === parseInt(idQuarto));
      if (quartoSel) {
        const total = dias * parseFloat(quartoSel.preco);
        setValorTotal(total);
        return total;
      }
    }
    return 0;
  };

  const handleDataEntrada = (e) => {
    const data = e.target.value;
    setDataEntrada(data);
    if (dataSaida) calcularValorTotal(data, dataSaida, quarto);
  };

  const handleDataSaida = (e) => {
    const data = e.target.value;
    setDataSaida(data);
    if (dataEntrada) calcularValorTotal(dataEntrada, data, quarto);
  };

  const handleQuarto = (e) => {
    const id = e.target.value;
    setQuarto(id);
    if (dataEntrada && dataSaida) calcularValorTotal(dataEntrada, dataSaida, id);
  };

  const limparFormulario = () => {
    setIdHospedagem(0);
    setHospede('');
    setQuarto('');
    setDataEntrada('');
    setDataSaida('');
    setDiarias(0);
    setValorTotal(0);
    setObservacoes('');
  };

  const salvarHospedagem = async (e) => {
    e.preventDefault();
    if (!hospede || !quarto || !dataEntrada || !dataSaida) {
      mostrarErro('Preencha todos os campos obrigatórios (*).');
      return;
    }
    try {
      const dataToSend = {
        id_hospede: parseInt(hospede),
        id_quarto: parseInt(quarto),
        data_entrada: dataEntrada,
        data_saida: dataSaida,
        diarias,
        valor_total: valorTotal,
        observacoes,
      };

      if (idHospedagem && idHospedagem > 0) {
        await api.put(`/hospedagens/${idHospedagem}`, dataToSend);
        mostrarSucesso('Hospedagem atualizada com sucesso!');
      } else {
        await api.post('/hospedagens/', dataToSend);
        mostrarSucesso('Hospedagem registrada com sucesso!');
      }
      limparFormulario();
      setCarregaPagina(!carregaPagina);
    } catch {
      mostrarErro('Erro ao salvar hospedagem.');
    }
  };

  const handleSelecao = async (id) => {
    try {
      const response = await api.get(`/hospedagens/${id}`);
      const d = response.data;
      setIdHospedagem(d.id_hospedagem);
      setHospede(d.id_hospede);
      setQuarto(d.id_quarto);
      setDataEntrada(d.data_entrada);
      setDataSaida(d.data_saida);
      setDiarias(d.diarias);
      setValorTotal(d.valor_total);
      setObservacoes(d.observacoes || '');
    } catch {
      mostrarErro('Erro ao carregar hospedagem.');
    }
  };

  const deletarHospedagem = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta hospedagem?')) return;
    try {
      await api.delete(`/hospedagens/${id}`);
      mostrarSucesso('Hospedagem deletada com sucesso!');
      limparFormulario();
      setCarregaPagina(!carregaPagina);
    } catch {
      mostrarErro('Erro ao deletar hospedagem.');
    }
  };

  return (
    <Card>
      <Card.Header className="bg-success text-white">
        <h1>Movimentação de Quartos e Hóspedes</h1>
      </Card.Header>
      <Card.Body>
        {erro && <Alert variant="danger" dismissible onClose={() => setErro('')}>{erro}</Alert>}
        {sucesso && <Alert variant="success">{sucesso}</Alert>}

        <Form onSubmit={salvarHospedagem}>
          <Row className="mb-3">
            <Col sm={6}>
              <Form.Group controlId="formHospede">
                <Form.Label>Hóspede *</Form.Label>
                <Form.Select onChange={(e) => setHospede(e.target.value)} value={hospede} required>
                  <option value="">Selecione um hóspede</option>
                  {hospedes.map((h) => (
                    <option key={h.id_hospede} value={h.id_hospede}>{h.nome}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="formQuarto">
                <Form.Label>Quarto *</Form.Label>
                <Form.Select onChange={handleQuarto} value={quarto} required>
                  <option value="">Selecione um quarto</option>
                  {quartos.filter((q) => q.status === 'disponível').map((q) => (
                    <option key={q.id_quarto} value={q.id_quarto}>
                      Quarto {q.numero} — {q.tipo} (R$ {parseFloat(q.preco).toFixed(2)})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col sm={3}>
              <Form.Group controlId="formDataEntrada">
                <Form.Label>Data Entrada *</Form.Label>
                <Form.Control type="date" onChange={handleDataEntrada} value={dataEntrada} required />
              </Form.Group>
            </Col>
            <Col sm={3}>
              <Form.Group controlId="formDataSaida">
                <Form.Label>Data Saída *</Form.Label>
                <Form.Control type="date" onChange={handleDataSaida} value={dataSaida} required />
              </Form.Group>
            </Col>
            <Col sm={2}>
              <Form.Group controlId="formDiarias">
                <Form.Label>Diárias</Form.Label>
                <Form.Control type="number" value={diarias} disabled />
              </Form.Group>
            </Col>
            <Col sm={4}>
              <Form.Group controlId="formValorTotal">
                <Form.Label>Valor Total</Form.Label>
                <Form.Control type="text" value={`R$ ${valorTotal.toFixed(2)}`} disabled />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col sm={12}>
              <Form.Group controlId="formObservacoes">
                <Form.Label>Observações</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Observações adicionais" onChange={(e) => setObservacoes(e.target.value)} value={observacoes} />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 mb-3">
            <Button variant="success" type="submit">
              {idHospedagem > 0 ? 'Atualizar' : 'Salvar Hospedagem'}
            </Button>
            <Button variant="secondary" onClick={limparFormulario}>Limpar</Button>
          </div>

          {loading ? (
            <div className="text-center my-4"><Spinner animation="border" variant="success" /></div>
          ) : (
            <HospedagensLista
              data={hospedagens}
              hospedes={hospedes}
              quartos={quartos}
              handleSelecao={handleSelecao}
              deletarHospedagem={deletarHospedagem}
            />
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Hospedagens;
