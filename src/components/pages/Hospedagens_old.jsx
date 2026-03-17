import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import HospedagensLista from './HospedagensLista';
import Card from "react-bootstrap/Card";
import { Row, Col } from 'react-bootstrap';
import axios from "axios";

function Hospedagens() {
  const [hospede, setHospede              ] = useState('');
  const [quarto, setQuarto                ] = useState('');
  const [dataEntrada, setDataEntrada      ] = useState('');
  const [dataSaida, setDataSaida          ] = useState('');
  const [diarias, setDiarias              ] = useState(0);
  const [valorTotal, setValorTotal        ] = useState(0);
  const [observacoes, setObservacoes      ] = useState('');
  const [hospedes, setHospedes            ] = useState([]);
  const [quartos, setQuartos              ] = useState([]);
  const [hospedagens, setHospedagens      ] = useState([]);
  const [carregaPagina, setCarregaPagina] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospedagensRes, hospedesRes, quartosRes] = await Promise.all([
          fetch('http://localhost:3000/hospedagens/'),
          fetch('http://localhost:3000/hospedes/'),
          fetch('http://localhost:3000/quartos/')
        ]);

        if (!hospedagensRes.ok || !hospedesRes.ok || !quartosRes.ok) {
          throw new Error('HTTP error!');
        }

        const hospedagensData = await hospedagensRes.json();
        const hospedesData = await hospedesRes.json();
        const quartosData = await quartosRes.json();

        setHospedagens(hospedagensData);
        setHospedes(hospedesData);
        setQuartos(quartosData);

        console.log("Dados carregados");
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();

    return () => {
      // Cleanup logic here
    };
  }, [carregaPagina]);

  const calcularDiarias = (dataIn, dataSd) => {
    if (dataIn && dataSd) {
      const entrada = new Date(dataIn);
      const saida = new Date(dataSd);
      const diff = Math.ceil((saida - entrada) / (1000 * 60 * 60 * 24));
      setDiarias(diff > 0 ? diff : 0);
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const calcularValorTotal = (dataIn, dataSd, id_quarto) => {
    if (dataIn && dataSd && id_quarto) {
      const dias = calcularDiarias(dataIn, dataSd);
      const quartoSelecionado = quartos.find(q => q.id_quarto === parseInt(id_quarto));
      if (quartoSelecionado) {
        const total = dias * parseFloat(quartoSelecionado.preco);
        setValorTotal(total);
        return total;
      }
    }
    return 0;
  };

  const handleDataEntrada = (event) => {
    const data = event.target.value;
    setDataEntrada(data);
    if (dataSaida) {
      calcularValorTotal(data, dataSaida, quarto);
    }
  };

  const handleDataSaida = (event) => {
    const data = event.target.value;
    setDataSaida(data);
    if (dataEntrada) {
      calcularValorTotal(dataEntrada, data, quarto);
    }
  };

  const handleHospede = (event) => {
    setHospede(event.target.value);
  };

  const handleQuarto = (event) => {
    const id = event.target.value;
    setQuarto(id);
    if (dataEntrada && dataSaida) {
      calcularValorTotal(dataEntrada, dataSaida, id);
    }
  };

  const handleObservacoes = (event) => {
    setObservacoes(event.target.value);
  };

  const salvarHospedagem = async (e) => {
    e.preventDefault();
    try {
      if (!hospede || !quarto || !dataEntrada || !dataSaida) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      const dataToSend = {
        id_hospede: parseInt(hospede),
        id_quarto: parseInt(quarto),
        data_entrada: dataEntrada,
        data_saida: dataSaida,
        diarias: diarias,
        valor_total: valorTotal,
        observacoes: observacoes
      };

      axios.post('http://localhost:3000/hospedagens/', dataToSend)
        .then(function (response) {
          console.log('Success:', response.data);
        });

      setHospede('');
      setQuarto('');
      setDataEntrada('');
      setDataSaida('');
      setDiarias(0);
      setValorTotal(0);
      setObservacoes('');
      setCarregaPagina(!carregaPagina);

    } catch (error) {
      console.error('Error during POST request:', error);
    }
  };

  const handleSelecao = (id) => {
    console.log(id);
    axios.get('http://localhost:3000/hospedagens/' + id)
      .then((response) => {
        setHospede(response.data['id_hospede']);
        setQuarto(response.data['id_quarto']);
        setDataEntrada(response.data['data_entrada']);
        setDataSaida(response.data['data_saida']);
        setDiarias(response.data['diarias']);
        setValorTotal(response.data['valor_total']);
        setObservacoes(response.data['observacoes']);
        console.log(response);
      });
  };

  const deletarHospedagem = (id) => {
    console.log("Deletando hospedagem:", id);
    axios.delete('http://localhost:3000/hospedagens/' + id)
      .then((response) => {
        console.log('Hospedagem deletada com sucesso:', response.data);
        setCarregaPagina(!carregaPagina);
        setHospede('');
        setQuarto('');
        setDataEntrada('');
        setDataSaida('');
        setDiarias(0);
        setValorTotal(0);
        setObservacoes('');
      })
      .catch((error) => {
        console.error('Erro ao deletar hospedagem:', error);
      });
  };

  return (
    <Card>
      <Card.Header className="card-header bg-success text-white">
        <h1>Movimentação de Quartos e Hóspedes</h1>
      </Card.Header>
      <Card.Body>

        <Form>
          <Row>
            <Col sm={6}>
              <Form.Group controlId="formHospede">
                <Form.Label>Hóspede *</Form.Label>
                <Form.Select onChange={handleHospede} value={hospede}>
                  <option value="">Selecione um hóspede</option>
                  {hospedes.map((h) => (
                    <option key={h.id_hospede} value={h.id_hospede}>
                      {h.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="formQuarto">
                <Form.Label>Quarto *</Form.Label>
                <Form.Select onChange={handleQuarto} value={quarto}>
                  <option value="">Selecione um quarto</option>
                  {quartos.filter(q => q.status === 'disponível').map((q) => (
                    <option key={q.id_quarto} value={q.id_quarto}>
                      Quarto {q.numero} - {q.tipo} (R$ {parseFloat(q.preco).toFixed(2)})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={3}>
              <Form.Group controlId="formDataEntrada">
                <Form.Label>Data Entrada *</Form.Label>
                <Form.Control 
                  type="date" 
                  onChange={handleDataEntrada} 
                  value={dataEntrada}
                />
              </Form.Group>
            </Col>
            <Col sm={3}>
              <Form.Group controlId="formDataSaida">
                <Form.Label>Data Saída *</Form.Label>
                <Form.Control 
                  type="date" 
                  onChange={handleDataSaida} 
                  value={dataSaida}
                />
              </Form.Group>
            </Col>
            <Col sm={2}>
              <Form.Group controlId="formDiarias">
                <Form.Label>Diárias</Form.Label>
                <Form.Control 
                  type="number" 
                  value={diarias}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col sm={4}>
              <Form.Group controlId="formValorTotal">
                <Form.Label>Valor Total</Form.Label>
                <Form.Control 
                  type="text" 
                  value={`R$ ${valorTotal.toFixed(2)}`}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={12}>
              <Form.Group controlId="formObservacoes">
                <Form.Label>Observações</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  placeholder="Observações adicionais" 
                  onChange={handleObservacoes} 
                  value={observacoes}
                />
              </Form.Group>
            </Col>
          </Row>

          <br></br>
          <Button variant="success" onClick={salvarHospedagem}>
            Salvar Hospedagem
          </Button>
          <HospedagensLista 
            data={hospedagens} 
            hospedes={hospedes}
            quartos={quartos}
            handleSelecao={handleSelecao}
            deletarHospedagem={deletarHospedagem}
          />
        </Form>
      </Card.Body>

    </Card>
  );
}

export default Hospedagens;
