import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner, Table, Button, Form, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../utils/AuthContext';

function Dashboard() {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [hospedes, setHospedes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [hospedagens, setHospedagens] = useState([]);
  const [ajusteTarifaPct, setAjusteTarifaPct] = useState(6);
  const [reducaoManutencaoPct, setReducaoManutencaoPct] = useState(30);
  const [captacaoHospedesPct, setCaptacaoHospedesPct] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErro('');
      try {
        const [hospedesRes, quartosRes, hospedagensRes] = await Promise.all([
          api.get('/hospedes/'),
          api.get('/quartos/'),
          api.get('/hospedagens/'),
        ]);

        setHospedes(hospedesRes.data);
        setQuartos(quartosRes.data);
        setHospedagens(hospedagensRes.data);
      } catch {
        setErro('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const resumo = useMemo(() => {
    const quartosDisponiveis = quartos.filter((q) => q.status === 'disponível').length;
    const quartosOcupados = quartos.filter((q) => q.status === 'ocupado').length;
    const quartosManutencao = quartos.filter((q) => q.status === 'manutenção').length;
    const receitaTotal = hospedagens.reduce((acc, h) => acc + Number(h.valor_total || 0), 0);
    const taxaOcupacao = quartos.length ? (quartosOcupados / quartos.length) * 100 : 0;
    const ticketMedio = hospedagens.length ? receitaTotal / hospedagens.length : 0;

    return {
      totalHospedes: hospedes.length,
      totalQuartos: quartos.length,
      quartosDisponiveis,
      quartosOcupados,
      quartosManutencao,
      totalHospedagens: hospedagens.length,
      receitaTotal,
      taxaOcupacao,
      ticketMedio,
    };
  }, [hospedes, quartos, hospedagens]);

  const ultimasHospedagens = hospedagens.slice(0, 5);

  const nomeHospede = (id) => hospedes.find((h) => h.id_hospede === id)?.nome || 'N/A';
  const numeroQuarto = (id) => quartos.find((q) => q.id_quarto === id)?.numero || 'N/A';

  const alertas = useMemo(() => {
    const lista = [];

    if (resumo.taxaOcupacao > 85) {
      lista.push({ tipo: 'danger', texto: `Taxa de ocupação crítica: ${resumo.taxaOcupacao.toFixed(1)}%` });
    } else if (resumo.taxaOcupacao > 70) {
      lista.push({ tipo: 'warning', texto: `Taxa de ocupação em atenção: ${resumo.taxaOcupacao.toFixed(1)}%` });
    } else {
      lista.push({ tipo: 'success', texto: `Taxa de ocupação estável: ${resumo.taxaOcupacao.toFixed(1)}%` });
    }

    if (resumo.quartosManutencao > 0) {
      lista.push({ tipo: 'warning', texto: `${resumo.quartosManutencao} quarto(s) em manutenção.` });
    }

    if (!resumo.totalHospedagens) {
      lista.push({ tipo: 'danger', texto: 'Nenhuma hospedagem registrada. Verifique operação.' });
    }

    return lista;
  }, [resumo]);

  const eventosAuditoria = useMemo(() => {
    return hospedagens
      .slice()
      .sort((a, b) => new Date(b.data_entrada) - new Date(a.data_entrada))
      .slice(0, 6)
      .map((item) => ({
        id: item.id_hospedagem,
        titulo: `Check-in ${nomeHospede(item.id_hospede)}`,
        detalhe: `Quarto ${numeroQuarto(item.id_quarto)} • ${item.diarias} diária(s) • R$ ${Number(item.valor_total || 0).toFixed(2)}`,
        data: new Date(item.data_entrada).toLocaleDateString('pt-BR'),
      }));
  }, [hospedagens, hospedes, quartos]);

  const distribuicaoStatus = useMemo(() => {
    if (!resumo.totalQuartos) {
      return { disponivelPct: 0, ocupadoPct: 0, manutencaoPct: 0 };
    }

    return {
      disponivelPct: (resumo.quartosDisponiveis / resumo.totalQuartos) * 100,
      ocupadoPct: (resumo.quartosOcupados / resumo.totalQuartos) * 100,
      manutencaoPct: (resumo.quartosManutencao / resumo.totalQuartos) * 100,
    };
  }, [resumo]);

  const simulacao = useMemo(() => {
    const baseReceita = resumo.receitaTotal;
    const efeitoTarifa = 1 + ajusteTarifaPct / 100;
    const efeitoCaptacao = 1 + captacaoHospedesPct / 100;
    const receitaProjetada = baseReceita * efeitoTarifa * efeitoCaptacao;

    const manutencaoRecuperada = Math.round((resumo.quartosManutencao * reducaoManutencaoPct) / 100);
    const ocupacaoProjetada = Math.min(100, resumo.taxaOcupacao + manutencaoRecuperada * 4 + captacaoHospedesPct * 0.25);

    const indiceRisco = Math.max(
      0,
      Math.min(
        100,
        65 + resumo.quartosManutencao * 8 - reducaoManutencaoPct * 0.4 - captacaoHospedesPct * 0.15
      )
    );

    return {
      receitaProjetada,
      ganhoReceita: receitaProjetada - baseReceita,
      ocupacaoProjetada,
      indiceRisco,
      manutencaoRecuperada,
    };
  }, [resumo, ajusteTarifaPct, reducaoManutencaoPct, captacaoHospedesPct]);

  const recomendacoesIA = useMemo(() => {
    const sugestoes = [];

    if (resumo.taxaOcupacao >= 80) {
      sugestoes.push({
        prioridade: 'Alta',
        confianca: 92,
        titulo: 'Ajustar tarifa dinâmica para alta demanda',
        detalhe: 'Taxa de ocupação elevada detectada. Recomenda-se reajuste de 8% a 12% nas próximas reservas para quartos premium.',
      });
    } else if (resumo.taxaOcupacao <= 45) {
      sugestoes.push({
        prioridade: 'Média',
        confianca: 85,
        titulo: 'Ativar campanha de baixa ocupação',
        detalhe: 'Ocupação abaixo do ideal. Sugerir pacote de 2 diárias com upgrade de categoria para aumentar conversão.',
      });
    }

    if (resumo.quartosManutencao > 0) {
      sugestoes.push({
        prioridade: 'Alta',
        confianca: 95,
        titulo: 'Priorizar manutenção corretiva',
        detalhe: `${resumo.quartosManutencao} quarto(s) indisponível(is). Realocar equipe técnica para reduzir impacto na disponibilidade.` ,
      });
    }

    if (resumo.ticketMedio < 700 && resumo.totalHospedagens > 0) {
      sugestoes.push({
        prioridade: 'Média',
        confianca: 81,
        titulo: 'Sugerir upsell de serviços',
        detalhe: 'Ticket médio abaixo da meta. Ofereça café premium, late checkout e transfer para elevar receita por estadia.',
      });
    }

    if (!sugestoes.length) {
      sugestoes.push({
        prioridade: 'Baixa',
        confianca: 88,
        titulo: 'Operação estável no momento',
        detalhe: 'Sem desvios críticos. Manter monitoramento e revisar indicadores em janelas de 24 horas.',
      });
    }

    return sugestoes.slice(0, 3);
  }, [resumo]);

  return (
    <Container className="mt-4 dashboard-page">
      <div className="dashboard-hero mb-4">
        <h1>Painel de Auditoria Operacional</h1>
        <p>
          Bem-vindo, <strong>{usuario?.nome || 'Administrador'}</strong>. Monitore conformidade, ocupação e movimentações críticas em tempo real.
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
            <Col md={4} lg={3}>
              <Card className="metric-card">
                <Card.Body>
                  <small>Hóspedes</small>
                  <h3>{resumo.totalHospedes}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} lg={3}>
              <Card className="metric-card">
                <Card.Body>
                  <small>Quartos</small>
                  <h3>{resumo.totalQuartos}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} lg={3}>
              <Card className="metric-card">
                <Card.Body>
                  <small>Taxa Ocupação</small>
                  <h3>{resumo.taxaOcupacao.toFixed(1)}%</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} lg={3}>
              <Card className="metric-card metric-card-gold">
                <Card.Body>
                  <small>Receita Total</small>
                  <h3>R$ {resumo.receitaTotal.toFixed(2)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={8}>
              <Card className="mb-4 audit-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>Radar de Alertas</span>
                  <Badge bg="dark">Auditoria</Badge>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    {alertas.map((item, index) => (
                      <Alert key={`${item.texto}-${index}`} variant={item.tipo} className="mb-0">
                        {item.texto}
                      </Alert>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-4 audit-card ai-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>IA Simulada de Recomendações</span>
                  <Badge bg="secondary">Mock</Badge>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    {recomendacoesIA.map((item, idx) => (
                      <div className="ai-recommendation" key={`${item.titulo}-${idx}`}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong>{item.titulo}</strong>
                          <span className={`ai-priority ai-priority-${item.prioridade.toLowerCase()}`}>
                            {item.prioridade}
                          </span>
                        </div>
                        <p className="mb-1 small text-muted">{item.detalhe}</p>
                        <small>Confiança da IA: {item.confianca}%</small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-4 audit-card simulation-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>Laboratório de Decisão (What-if)</span>
                  <Badge bg="primary">Inovação</Badge>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Label>Ajuste de tarifa (%)</Form.Label>
                      <Form.Range min={-10} max={25} value={ajusteTarifaPct} onChange={(e) => setAjusteTarifaPct(Number(e.target.value))} />
                      <small>{ajusteTarifaPct}%</small>
                    </Col>
                    <Col md={4}>
                      <Form.Label>Redução da manutenção (%)</Form.Label>
                      <Form.Range min={0} max={100} value={reducaoManutencaoPct} onChange={(e) => setReducaoManutencaoPct(Number(e.target.value))} />
                      <small>{reducaoManutencaoPct}%</small>
                    </Col>
                    <Col md={4}>
                      <Form.Label>Captação de hóspedes (%)</Form.Label>
                      <Form.Range min={0} max={40} value={captacaoHospedesPct} onChange={(e) => setCaptacaoHospedesPct(Number(e.target.value))} />
                      <small>{captacaoHospedesPct}%</small>
                    </Col>
                  </Row>

                  <Row className="g-3 mt-2">
                    <Col md={4}>
                      <div className="simulation-kpi">
                        <small>Receita projetada</small>
                        <h5>R$ {simulacao.receitaProjetada.toFixed(2)}</h5>
                        <p className="mb-0">Ganho: R$ {simulacao.ganhoReceita.toFixed(2)}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="simulation-kpi">
                        <small>Ocupação projetada</small>
                        <h5>{simulacao.ocupacaoProjetada.toFixed(1)}%</h5>
                        <p className="mb-0">Quartos recuperados: {simulacao.manutencaoRecuperada}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="simulation-kpi">
                        <small>Índice de risco operacional</small>
                        <h5>{simulacao.indiceRisco.toFixed(0)}/100</h5>
                        <ProgressBar
                          now={simulacao.indiceRisco}
                          variant={simulacao.indiceRisco > 70 ? 'danger' : simulacao.indiceRisco > 45 ? 'warning' : 'success'}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>Últimas Hospedagens</span>
                  <Badge bg="info">Top 5</Badge>
                </Card.Header>
                <Card.Body>
                  {!ultimasHospedagens.length ? (
                    <p className="text-muted mb-0">Nenhuma hospedagem registrada.</p>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Hóspede</th>
                          <th>Quarto</th>
                          <th>Diárias</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimasHospedagens.map((item) => (
                          <tr key={item.id_hospedagem}>
                            <td>{nomeHospede(item.id_hospede)}</td>
                            <td>{numeroQuarto(item.id_quarto)}</td>
                            <td>{item.diarias}</td>
                            <td>R$ {Number(item.valor_total || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="mb-4 audit-card">
                <Card.Header>Distribuição de Status</Card.Header>
                <Card.Body>
                  <div className="status-line mb-3">
                    <div className="status-label-wrap">
                      <span>Disponível</span>
                      <strong>{resumo.quartosDisponiveis}</strong>
                    </div>
                    <div className="status-track">
                      <div className="status-fill status-fill-ok" style={{ width: `${distribuicaoStatus.disponivelPct}%` }} />
                    </div>
                  </div>
                  <div className="status-line mb-3">
                    <div className="status-label-wrap">
                      <span>Ocupado</span>
                      <strong>{resumo.quartosOcupados}</strong>
                    </div>
                    <div className="status-track">
                      <div className="status-fill status-fill-danger" style={{ width: `${distribuicaoStatus.ocupadoPct}%` }} />
                    </div>
                  </div>
                  <div className="status-line">
                    <div className="status-label-wrap">
                      <span>Manutenção</span>
                      <strong>{resumo.quartosManutencao}</strong>
                    </div>
                    <div className="status-track">
                      <div className="status-fill status-fill-warning" style={{ width: `${distribuicaoStatus.manutencaoPct}%` }} />
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-4 audit-card">
                <Card.Header>Trilha de Auditoria</Card.Header>
                <Card.Body>
                  {!eventosAuditoria.length ? (
                    <p className="text-muted mb-0">Sem eventos recentes.</p>
                  ) : (
                    <ul className="audit-timeline">
                      {eventosAuditoria.map((evento) => (
                        <li key={evento.id}>
                          <p className="mb-1"><strong>{evento.titulo}</strong></p>
                          <p className="mb-1 text-muted small">{evento.detalhe}</p>
                          <small>{evento.data}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card.Body>
              </Card>

              <Card className="audit-card">
                <Card.Header>Ações Rápidas</Card.Header>
                <Card.Body className="d-grid gap-2">
                  <Button as={Link} to="/hospedes" variant="primary">Gerenciar Hóspedes</Button>
                  <Button as={Link} to="/quartos" variant="primary">Gerenciar Quartos</Button>
                  <Button as={Link} to="/hospedagens" variant="success">Gerenciar Hospedagens</Button>
                  <Button as={Link} to="/about" variant="outline-light">Sobre o Projeto</Button>
                  <div className="compliance-chip mt-2">
                    Ticket médio: <strong>R$ {resumo.ticketMedio.toFixed(2)}</strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default Dashboard;
