import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'hotelaria.db');

let db;

async function seedDatabaseIfEmpty(database) {
  const usuariosCount = await database.get('SELECT COUNT(*) as total FROM usuarios');
  const clientesCount = await database.get('SELECT COUNT(*) as total FROM clientes');
  const hospedesCount = await database.get('SELECT COUNT(*) as total FROM hospedes');
  const quartosCount = await database.get('SELECT COUNT(*) as total FROM quartos');
  const hospedagensCount = await database.get('SELECT COUNT(*) as total FROM hospedagens');

  if (!usuariosCount.total) {
    await database.run(
      `INSERT INTO usuarios (nome, email, senha_hash, papel)
       VALUES (?, ?, ?, ?)`,
      [
        'Administrador',
        'admin@hotelaria.com',
        '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        'admin',
      ]
    );
  }

  if (!clientesCount.total) {
    await database.run(
      `INSERT INTO clientes (nome, email, senha_hash)
       VALUES (?, ?, ?)`,
      [
        'Cliente Demo',
        'cliente@hotelaria.com',
        '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9',
      ]
    );
  }

  // Seed only once when all main tables are empty.
  if (hospedesCount.total || quartosCount.total || hospedagensCount.total) {
    return;
  }

  await database.exec('BEGIN TRANSACTION');
  try {
    await database.run(
      `INSERT INTO hospedes (nome, email, telefone, cpf, cep, rua, numero)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Ana Beatriz Lima', 'ana.lima@email.com', '(11) 99876-4321', '123.456.789-10', '01310-100', 'Avenida Paulista', '1578']
    );

    await database.run(
      `INSERT INTO hospedes (nome, email, telefone, cpf, cep, rua, numero)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Carlos Eduardo Souza', 'carlos.souza@email.com', '(21) 98765-2200', '987.654.321-00', '22041-001', 'Avenida Atlantica', '1702']
    );

    await database.run(
      `INSERT INTO hospedes (nome, email, telefone, cpf, cep, rua, numero)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Fernanda Rocha', 'fernanda.rocha@email.com', '(31) 99123-4455', '456.123.789-20', '30130-110', 'Rua da Bahia', '985']
    );

    await database.run(
      `INSERT INTO quartos (numero, tipo, preco, descricao, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['101', 'suite', 890, 'Suite premium com vista panoramica e banheira.', 'ocupado']
    );

    await database.run(
      `INSERT INTO quartos (numero, tipo, preco, descricao, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['203', 'casal', 420, 'Quarto casal confortavel com varanda.', 'disponível']
    );

    await database.run(
      `INSERT INTO quartos (numero, tipo, preco, descricao, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['305', 'duplo', 510, 'Quarto duplo executivo com mesa de trabalho.', 'disponível']
    );

    await database.run(
      `INSERT INTO quartos (numero, tipo, preco, descricao, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['401', 'solteiro', 280, 'Quarto solteiro compacto para estadias curtas.', 'manutenção']
    );

    await database.run(
      `INSERT INTO hospedagens (id_hospede, id_quarto, data_entrada, data_saida, diarias, valor_total, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [1, 1, '2026-03-15', '2026-03-18', 3, 2670, 'Hospede VIP solicitou check-out expresso.']
    );

    await database.exec('COMMIT');
  } catch (error) {
    await database.exec('ROLLBACK');
    throw error;
  }
}

export async function getDb() {
  if (db) return db;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      papel TEXT NOT NULL DEFAULT 'admin'
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hospedes (
      id_hospede INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT,
      cpf TEXT,
      cep TEXT,
      rua TEXT,
      numero TEXT
    );

    CREATE TABLE IF NOT EXISTS quartos (
      id_quarto INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL,
      tipo TEXT NOT NULL,
      preco REAL NOT NULL,
      descricao TEXT,
      status TEXT NOT NULL DEFAULT 'disponível'
    );

    CREATE TABLE IF NOT EXISTS hospedagens (
      id_hospedagem INTEGER PRIMARY KEY AUTOINCREMENT,
      id_hospede INTEGER NOT NULL,
      id_quarto INTEGER NOT NULL,
      data_entrada TEXT NOT NULL,
      data_saida TEXT NOT NULL,
      diarias INTEGER NOT NULL,
      valor_total REAL NOT NULL,
      observacoes TEXT,
      FOREIGN KEY (id_hospede) REFERENCES hospedes(id_hospede) ON DELETE RESTRICT,
      FOREIGN KEY (id_quarto) REFERENCES quartos(id_quarto) ON DELETE RESTRICT
    );
  `);

  await seedDatabaseIfEmpty(db);

  return db;
}
