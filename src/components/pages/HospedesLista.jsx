import React from 'react';
import { Table } from 'react-bootstrap';

export default function HospedesLista({ data, handleSelecao }) {
  if (!data.length) {
    return <p className="text-muted mt-3">Nenhum hóspede cadastrado.</p>;
  }

  return (
    <Table striped bordered hover responsive className="mt-3">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>CPF</th>
        </tr>
      </thead>
      <tbody>
        {data.map((hospede) => (
          <tr key={hospede.id_hospede}>
            <td>
              <input type="radio" name="rdHospede" onChange={() => handleSelecao(hospede.id_hospede)} />
            </td>
            <td>{hospede.id_hospede}</td>
            <td>{hospede.nome}</td>
            <td>{hospede.email}</td>
            <td>{hospede.telefone || '—'}</td>
            <td>{hospede.cpf || '—'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}