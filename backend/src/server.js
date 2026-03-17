import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;
const sessions = new Map();

app.use(cors({ origin: '*' }));
app.use(express.json());

function parsePositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function calcDiarias(dataEntrada, dataSaida) {
  const inDate = new Date(dataEntrada);
  const outDate = new Date(dataSaida);
  const diffMs = outDate - inDate;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

function hashPassword(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function getBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ erro: 'Token ausente. Faça login para continuar.' });
  }

  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }

  req.usuario = session.usuario;
  req.token = token;
  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.usuario || req.usuario.papel !== role) {
      return res.status(403).json({ erro: 'Acesso negado para este perfil.' });
    }
    return next();
  };
}

const requireAdmin = [requireAuth, requireRole('admin')];
const requireCliente = [requireAuth, requireRole('cliente')];

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'sistema-hotelaria-backend' });
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const db = await getDb();
    const usuario = await db.get(
      'SELECT id_usuario, nome, email, senha_hash, papel FROM usuarios WHERE email = ?',
      [email]
    );

    if (!usuario || usuario.senha_hash !== hashPassword(senha)) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = generateToken();
    const usuarioPublico = {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    };

    sessions.set(token, {
      usuario: usuarioPublico,
      criadoEm: Date.now(),
    });

    return res.json({
      token,
      usuario: usuarioPublico,
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao autenticar usuário.' });
  }
});

app.post('/auth/cliente/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const db = await getDb();
    const cliente = await db.get(
      'SELECT id_cliente, nome, email, senha_hash FROM clientes WHERE email = ?',
      [email]
    );

    if (!cliente || cliente.senha_hash !== hashPassword(senha)) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = generateToken();
    const usuarioPublico = {
      id_cliente: cliente.id_cliente,
      nome: cliente.nome,
      email: cliente.email,
      papel: 'cliente',
    };

    sessions.set(token, {
      usuario: usuarioPublico,
      criadoEm: Date.now(),
    });

    return res.json({ token, usuario: usuarioPublico });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao autenticar cliente.' });
  }
});

app.post('/auth/logout', requireAuth, async (req, res) => {
  sessions.delete(req.token);
  res.status(204).send();
});

app.get('/auth/me', requireAuth, async (req, res) => {
  res.json({ usuario: req.usuario });
});

app.get('/cliente/painel', requireCliente, async (req, res) => {
  try {
    const db = await getDb();
    const quartosDisponiveis = await db.get("SELECT COUNT(*) as total FROM quartos WHERE status = 'disponível'");
    const quartosTotais = await db.get('SELECT COUNT(*) as total FROM quartos');
    const hospedagensRecentes = await db.all(
      `SELECT h.id_hospedagem, h.data_entrada, h.data_saida, h.diarias, h.valor_total,
              q.numero as numero_quarto, q.tipo as tipo_quarto
       FROM hospedagens h
       LEFT JOIN quartos q ON q.id_quarto = h.id_quarto
       ORDER BY h.id_hospedagem DESC
       LIMIT 5`
    );

    res.json({
      cliente: req.usuario,
      resumo: {
        quartos_disponiveis: quartosDisponiveis.total,
        quartos_totais: quartosTotais.total,
      },
      hospedagens_recentes: hospedagensRecentes,
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar painel do cliente.' });
  }
});

app.use('/hospedes', ...requireAdmin);
app.use('/quartos', ...requireAdmin);
app.use('/hospedagens', ...requireAdmin);

app.get('/hospedes/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM hospedes ORDER BY id_hospede DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar hóspedes.' });
  }
});

app.get('/hospedes/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const db = await getDb();
    const row = await db.get('SELECT * FROM hospedes WHERE id_hospede = ?', id);
    if (!row) return res.status(404).json({ erro: 'Hóspede não encontrado.' });

    res.json(row);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar hóspede.' });
  }
});

app.post('/hospedes/', async (req, res) => {
  try {
    const { nome, email, telefone, cpf, cep, rua, numero } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO hospedes (nome, email, telefone, cpf, cep, rua, numero)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, telefone || null, cpf || null, cep || null, rua || null, numero || null]
    );

    const created = await db.get('SELECT * FROM hospedes WHERE id_hospede = ?', result.lastID);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar hóspede.' });
  }
});

app.put('/hospedes/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const { nome, email, telefone, cpf, cep, rua, numero } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
    }

    const db = await getDb();
    const exists = await db.get('SELECT id_hospede FROM hospedes WHERE id_hospede = ?', id);
    if (!exists) return res.status(404).json({ erro: 'Hóspede não encontrado.' });

    await db.run(
      `UPDATE hospedes
       SET nome = ?, email = ?, telefone = ?, cpf = ?, cep = ?, rua = ?, numero = ?
       WHERE id_hospede = ?`,
      [nome, email, telefone || null, cpf || null, cep || null, rua || null, numero || null, id]
    );

    const updated = await db.get('SELECT * FROM hospedes WHERE id_hospede = ?', id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar hóspede.' });
  }
});

app.delete('/hospedes/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const db = await getDb();
    const result = await db.run('DELETE FROM hospedes WHERE id_hospede = ?', id);
    if (!result.changes) return res.status(404).json({ erro: 'Hóspede não encontrado.' });

    res.status(204).send();
  } catch (error) {
    res.status(409).json({ erro: 'Não foi possível remover hóspede vinculado a hospedagens.' });
  }
});

app.get('/quartos/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM quartos ORDER BY id_quarto DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar quartos.' });
  }
});

app.get('/quartos/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const db = await getDb();
    const row = await db.get('SELECT * FROM quartos WHERE id_quarto = ?', id);
    if (!row) return res.status(404).json({ erro: 'Quarto não encontrado.' });

    res.json(row);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar quarto.' });
  }
});

app.post('/quartos/', async (req, res) => {
  try {
    const { numero, tipo, preco, descricao, status } = req.body;
    if (!numero || !tipo || preco === undefined || preco === null) {
      return res.status(400).json({ erro: 'Número, tipo e preço são obrigatórios.' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO quartos (numero, tipo, preco, descricao, status)
       VALUES (?, ?, ?, ?, ?)`,
      [numero, tipo, Number(preco), descricao || null, status || 'disponível']
    );

    const created = await db.get('SELECT * FROM quartos WHERE id_quarto = ?', result.lastID);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar quarto.' });
  }
});

app.put('/quartos/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const { numero, tipo, preco, descricao, status } = req.body;
    if (!numero || !tipo || preco === undefined || preco === null) {
      return res.status(400).json({ erro: 'Número, tipo e preço são obrigatórios.' });
    }

    const db = await getDb();
    const exists = await db.get('SELECT id_quarto FROM quartos WHERE id_quarto = ?', id);
    if (!exists) return res.status(404).json({ erro: 'Quarto não encontrado.' });

    await db.run(
      `UPDATE quartos
       SET numero = ?, tipo = ?, preco = ?, descricao = ?, status = ?
       WHERE id_quarto = ?`,
      [numero, tipo, Number(preco), descricao || null, status || 'disponível', id]
    );

    const updated = await db.get('SELECT * FROM quartos WHERE id_quarto = ?', id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar quarto.' });
  }
});

app.delete('/quartos/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const db = await getDb();
    const result = await db.run('DELETE FROM quartos WHERE id_quarto = ?', id);
    if (!result.changes) return res.status(404).json({ erro: 'Quarto não encontrado.' });

    res.status(204).send();
  } catch (error) {
    res.status(409).json({ erro: 'Não foi possível remover quarto vinculado a hospedagens.' });
  }
});

app.get('/hospedagens/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM hospedagens ORDER BY id_hospedagem DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar hospedagens.' });
  }
});

app.get('/hospedagens/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const db = await getDb();
    const row = await db.get('SELECT * FROM hospedagens WHERE id_hospedagem = ?', id);
    if (!row) return res.status(404).json({ erro: 'Hospedagem não encontrada.' });

    res.json(row);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar hospedagem.' });
  }
});

app.post('/hospedagens/', async (req, res) => {
  try {
    const { id_hospede, id_quarto, data_entrada, data_saida, diarias, valor_total, observacoes } = req.body;
    if (!id_hospede || !id_quarto || !data_entrada || !data_saida) {
      return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
    }

    const db = await getDb();

    const hospedeExists = await db.get('SELECT id_hospede FROM hospedes WHERE id_hospede = ?', id_hospede);
    const quarto = await db.get('SELECT id_quarto, preco FROM quartos WHERE id_quarto = ?', id_quarto);
    if (!hospedeExists) return res.status(404).json({ erro: 'Hóspede não encontrado.' });
    if (!quarto) return res.status(404).json({ erro: 'Quarto não encontrado.' });

    const diariasCalc = Number.isFinite(Number(diarias)) ? Number(diarias) : calcDiarias(data_entrada, data_saida);
    const valorCalc = Number.isFinite(Number(valor_total)) ? Number(valor_total) : diariasCalc * Number(quarto.preco);

    const result = await db.run(
      `INSERT INTO hospedagens (id_hospede, id_quarto, data_entrada, data_saida, diarias, valor_total, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_hospede, id_quarto, data_entrada, data_saida, diariasCalc, valorCalc, observacoes || null]
    );

    await db.run("UPDATE quartos SET status = 'ocupado' WHERE id_quarto = ?", id_quarto);

    const created = await db.get('SELECT * FROM hospedagens WHERE id_hospedagem = ?', result.lastID);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar hospedagem.' });
  }
});

app.put('/hospedagens/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const { id_hospede, id_quarto, data_entrada, data_saida, diarias, valor_total, observacoes } = req.body;
    if (!id_hospede || !id_quarto || !data_entrada || !data_saida) {
      return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
    }

    const db = await getDb();
    const exists = await db.get('SELECT * FROM hospedagens WHERE id_hospedagem = ?', id);
    if (!exists) return res.status(404).json({ erro: 'Hospedagem não encontrada.' });

    const hospedeExists = await db.get('SELECT id_hospede FROM hospedes WHERE id_hospede = ?', id_hospede);
    const quarto = await db.get('SELECT id_quarto, preco FROM quartos WHERE id_quarto = ?', id_quarto);
    if (!hospedeExists) return res.status(404).json({ erro: 'Hóspede não encontrado.' });
    if (!quarto) return res.status(404).json({ erro: 'Quarto não encontrado.' });

    const diariasCalc = Number.isFinite(Number(diarias)) ? Number(diarias) : calcDiarias(data_entrada, data_saida);
    const valorCalc = Number.isFinite(Number(valor_total)) ? Number(valor_total) : diariasCalc * Number(quarto.preco);

    await db.run(
      `UPDATE hospedagens
       SET id_hospede = ?, id_quarto = ?, data_entrada = ?, data_saida = ?, diarias = ?, valor_total = ?, observacoes = ?
       WHERE id_hospedagem = ?`,
      [id_hospede, id_quarto, data_entrada, data_saida, diariasCalc, valorCalc, observacoes || null, id]
    );

    if (exists.id_quarto !== Number(id_quarto)) {
      await db.run("UPDATE quartos SET status = 'disponível' WHERE id_quarto = ?", exists.id_quarto);
    }
    await db.run("UPDATE quartos SET status = 'ocupado' WHERE id_quarto = ?", id_quarto);

    const updated = await db.get('SELECT * FROM hospedagens WHERE id_hospedagem = ?', id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar hospedagem.' });
  }
});

app.delete('/hospedagens/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ erro: 'ID inválido.' });

    const db = await getDb();
    const existing = await db.get('SELECT * FROM hospedagens WHERE id_hospedagem = ?', id);
    if (!existing) return res.status(404).json({ erro: 'Hospedagem não encontrada.' });

    await db.run('DELETE FROM hospedagens WHERE id_hospedagem = ?', id);
    await db.run("UPDATE quartos SET status = 'disponível' WHERE id_quarto = ?", existing.id_quarto);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir hospedagem.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

(async () => {
  await getDb();
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
  });
})();
