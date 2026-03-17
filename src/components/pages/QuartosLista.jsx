import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const statusVariant = {
  'disponível': 'success',
  'ocupado': 'danger',
  'manutenção': 'warning',
};

export default function QuartosLista({ data, handleSelecao, deletarQuarto }) {
  if (!data.length) {
    return <p className="text-muted mt-3">Nenhum quarto cadastrado.</p>;
  }

  return (
    <Table striped bordered hover responsive className="mt-3">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Número</th>
          <th>Tipo</th>
          <th>Preço/diária</th>
          <th>Status</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {data.map((quarto) => (
          <tr key={quarto.id_quarto}>
            <td>
              <input type="radio" name="rdQuarto" onChange={() => handleSelecao(quarto.id_quarto)} />
            </td>
            <td>{quarto.id_quarto}</td>
            <td>{quarto.numero}</td>
            <td>{quarto.tipo}</td>
            <td>R$ {parseFloat(quarto.preco).toFixed(2)}</td>
            <td>
              <Badge bg={statusVariant[quarto.status] || 'secondary'}>{quarto.status}</Badge>
            </td>
            <td>
              <Button variant="danger" size="sm" onClick={() => deletarQuarto(quarto.id_quarto)}>
                Deletar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
