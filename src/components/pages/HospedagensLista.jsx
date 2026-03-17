import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

export default function HospedagensLista({ data, hospedes, quartos, handleSelecao, deletarHospedagem }) {
  const getNomeHospede = (id) => hospedes.find((h) => h.id_hospede === id)?.nome || 'N/A';
  const getNumeroQuarto = (id) => quartos.find((q) => q.id_quarto === id)?.numero || 'N/A';
  const getTipoQuarto = (id) => quartos.find((q) => q.id_quarto === id)?.tipo || 'N/A';

  const formatarData = (data) => new Date(data).toLocaleDateString('pt-BR');

  if (!data.length) {
    return <p className="text-muted mt-3">Nenhuma hospedagem registrada.</p>;
  }

  return (
    <Table striped bordered hover responsive className="mt-3">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Hóspede</th>
          <th>Quarto</th>
          <th>Entrada</th>
          <th>Saída</th>
          <th>Diárias</th>
          <th>Valor Total</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {data.map((h) => (
          <tr key={h.id_hospedagem}>
            <td><input type="radio" name="rdHospedagem" onChange={() => handleSelecao(h.id_hospedagem)} /></td>
            <td>{h.id_hospedagem}</td>
            <td>{getNomeHospede(h.id_hospede)}</td>
            <td>
              <Badge bg="info">{getNumeroQuarto(h.id_quarto)}</Badge>{' '}
              {getTipoQuarto(h.id_quarto)}
            </td>
            <td>{formatarData(h.data_entrada)}</td>
            <td>{formatarData(h.data_saida)}</td>
            <td>{h.diarias}</td>
            <td>R$ {parseFloat(h.valor_total).toFixed(2)}</td>
            <td>
              <Button variant="danger" size="sm" onClick={() => deletarHospedagem(h.id_hospedagem)}>
                Deletar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
