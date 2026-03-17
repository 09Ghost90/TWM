import React, { useEffect, useState } from 'react';
import { Button, Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import HospedesLista from './HospedesLista';
import api from '../../services/api';
import { cpfMask, cepMask, telefoneMask } from '../utils/Utils';

function Hospedes() {
  const [idHospede, setIdHospede] = useState(0);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [hospedes, setHospedes] = useState([]);
  const [carregaPagina, setCarregaPagina] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const mostrarSucesso = (msg) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(''), 3000);
  };

  const mostrarErro = (msg) => {
    setErro(msg);
    setTimeout(() => setErro(''), 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/hospedes/');
        setHospedes(response.data);
      } catch (err) {
        mostrarErro('Erro ao carregar hóspedes. Verifique se o servidor está ativo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carregaPagina]);

  const salvarHospedes = async (e) => {
    e.preventDefault();
    if (!nome || !email) {
      mostrarErro('Nome e e-mail são obrigatórios.');
      return;
    }
    try {
      const dataToSend = { nome, email, telefone, cpf, cep, rua, numero };

      if (idHospede && idHospede > 0) {
        await api.put(`/hospedes/${idHospede}`, dataToSend);
        mostrarSucesso('Hóspede atualizado com sucesso!');
      } else {
        await api.post('/hospedes/', dataToSend);
        mostrarSucesso('Hóspede cadastrado com sucesso!');
      }
      limparFormulario();
      setCarregaPagina(!carregaPagina);
    } catch (error) {
      mostrarErro('Erro ao salvar hóspede.');
    }
  };

  const limparFormulario = () => {
    setIdHospede(0);
    setNome('');
    setEmail('');
    setTelefone('');
    setCpf('');
    setCep('');
    setRua('');
    setNumero('');
  };

  // Chamada CEP ViaCEP para preencher endereço automaticamente
  const handleFillAddress = async () => {
    const cepLimpo = cep.replace('-', '');
    if (cepLimpo.length !== 8) return;
    try {
      const response = await api.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
        baseURL: '',
      });
      if (!response.data.erro) {
        setRua(response.data.logradouro || '');
      }
    } catch {
      mostrarErro('Erro ao buscar CEP.');
    }
  };

  const handleSelecao = async (id) => {
    try {
      const response = await api.get(`/hospedes/${id}`);
      const d = response.data;
      setIdHospede(d.id_hospede);
      setNome(d.nome);
      setEmail(d.email);
      setTelefone(d.telefone || '');
      setCpf(d.cpf || '');
      setCep(d.cep || '');
      setRua(d.rua || '');
      setNumero(d.numero || '');
    } catch {
      mostrarErro('Erro ao carregar dados do hóspede.');
    }
  };

  const excluirHospede = async () => {
    if (!idHospede || idHospede <= 0) {
      mostrarErro('Selecione um hóspede para excluir.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir este hóspede?')) return;
    try {
      await api.delete(`/hospedes/${idHospede}`);
      mostrarSucesso('Hóspede excluído com sucesso!');
      limparFormulario();
      setCarregaPagina(!carregaPagina);
    } catch {
      mostrarErro('Erro ao excluir hóspede.');
    }
  };

  return (
    <React.Fragment>
      <Card>
        <Card.Header className="bg-primary text-white">
          <h1>Cadastro de Hóspedes</h1>
        </Card.Header>
        <Card.Body>
          {erro && <Alert variant="danger" dismissible onClose={() => setErro('')}>{erro}</Alert>}
          {sucesso && <Alert variant="success">{sucesso}</Alert>}

          <Form onSubmit={salvarHospedes}>
            <Row className="mb-3">
              <Col sm={6}>
                <Form.Group controlId="formBasicNome">
                  <Form.Label>Nome *</Form.Label>
                  <Form.Control type="text" placeholder="Nome completo" onChange={(e) => setNome(e.target.value)} value={nome} required />
                </Form.Group>
              </Col>
              <Col sm={3}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control type="email" placeholder="email@exemplo.com" onChange={(e) => setEmail(e.target.value)} value={email} required />
                </Form.Group>
              </Col>
              <Col sm={3}>
                <Form.Group controlId="formTelefone">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control type="text" placeholder="(00) 00000-0000" onChange={(e) => setTelefone(telefoneMask(e.target.value))} value={telefone} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col sm={3}>
                <Form.Group controlId="formCpf">
                  <Form.Label>CPF</Form.Label>
                  <Form.Control type="text" placeholder="000.000.000-00" onChange={(e) => setCpf(cpfMask(e.target.value))} value={cpf} />
                </Form.Group>
              </Col>
              <Col sm={3}>
                <Form.Group controlId="formCep">
                  <Form.Label>CEP</Form.Label>
                  <Form.Control type="text" placeholder="00000-000" onChange={(e) => setCep(cepMask(e.target.value))} value={cep} onBlur={handleFillAddress} />
                </Form.Group>
              </Col>
              <Col sm={4}>
                <Form.Group controlId="formRua">
                  <Form.Label>Rua</Form.Label>
                  <Form.Control type="text" placeholder="Rua" onChange={(e) => setRua(e.target.value)} value={rua} />
                </Form.Group>
              </Col>
              <Col sm={2}>
                <Form.Group controlId="formNumero">
                  <Form.Label>Número</Form.Label>
                  <Form.Control type="text" placeholder="Nº" onChange={(e) => setNumero(e.target.value)} value={numero} />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mb-3">
              <Button variant="primary" type="submit">
                {idHospede > 0 ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button variant="secondary" onClick={limparFormulario}>Limpar</Button>
              <Button variant="danger" onClick={excluirHospede} disabled={!idHospede || idHospede <= 0}>Excluir</Button>
            </div>

            {loading ? (
              <div className="text-center my-4"><Spinner animation="border" variant="primary" /></div>
            ) : (
              <HospedesLista data={hospedes} handleSelecao={handleSelecao} />
            )}
          </Form>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
}

export default Hospedes;