import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Deliberately local-only; never load the application .env as test configuration.
const uri = process.env.TEST_MONGO_URI;
assert.ok(uri, 'TEST_MONGO_URI is required (local MongoDB with a gestor_gastos_test_* database)');
const parsed = new URL(uri);
assert.equal(parsed.protocol, 'mongodb:');
assert.ok(['127.0.0.1', 'localhost'].includes(parsed.hostname), 'Tests require a local MongoDB');
assert.match(parsed.pathname, /^\/gestor_gastos_test_[a-z0-9_]+$/);
assert.equal(parsed.search, '');
assert.equal(parsed.username, '');
const dbName = `${parsed.pathname.slice(1)}_${randomUUID().replaceAll('-', '')}`;
process.env.JWT_SECRET = 'req01-test-secret-not-for-production';
process.env.MONGO_URI = uri;
process.env.ACCOUNT_1 = 'Cash';
process.env.ACCOUNT_2 = 'Bank';

const { default: app } = await import('../../dist/app.js');
const { accountModel } = await import('../../dist/models/accounts.model.js');
const { incomeModel } = await import('../../dist/models/income.model.js');
const { spentModel } = await import('../../dist/models/spent.model.js');
const { transferModel } = await import('../../dist/models/transfers.model.js');
const { spentsCategoriesModel } = await import('../../dist/models/spents.categories.model.js');
const { incomesCategoriesModel } = await import('../../dist/models/incomes.categories.model.js');
const id = () => new mongoose.Types.ObjectId();
const A = id(), B = id(), a1 = id(), a2 = id(), b1 = id(), b2 = id();
const catA = id(), catB = id(), globalCat = id(), nullCat = id();
const incomeA = id(), incomeB = id(), spentA = id(), spentB = id(), transferA = id(), transferB = id();
const token = (user = A, options = {}) => jwt.sign({ _id: String(user) }, process.env.JWT_SECRET, { expiresIn: '1h', ...options });
let server, base;
async function request(path, { method = 'GET', body, auth = token() } = {}) {
  const res = await fetch(`${base}${path}`, {
    method, headers: { ...(auth ? { Authorization: `Bearer ${auth}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

before(async () => {
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 3000 });
  await accountModel.create([
    { _id: a1, userId: A, accountName: 'A Cash' }, { _id: a2, userId: A, accountName: 'A Bank' },
    { _id: b1, userId: B, accountName: 'SECRET B Cash' }, { _id: b2, userId: B, accountName: 'SECRET B Bank' },
  ]);
  await spentsCategoriesModel.create([
    { _id: catA, category: 'A Food', userId: A }, { _id: catB, category: 'SECRET B Category', userId: B },
    { _id: globalCat, category: 'Global' }, { _id: nullCat, category: 'Global null', userId: null },
  ]);
  await incomesCategoriesModel.create({ category: 'Salary' });
  await incomeModel.create([
    { _id: incomeA, accountId: a1, category: 'Salary', description: 'A Income', date: '2026-01-01', amount: 1000 },
    { _id: incomeB, accountId: b1, category: 'Salary', description: 'SECRET B Income', date: '2026-01-01', amount: 2000 },
  ]);
  await spentModel.create([
    { _id: spentA, accountId: a1, categoryId: catA, description: 'A Lunch', date: '2026-01-02', amount: 10 },
    { _id: spentB, accountId: b1, categoryId: catB, description: 'SECRET B Lunch', date: '2026-01-02', amount: 20 },
  ]);
  await transferModel.create([
    { _id: transferA, userId: A, accountId: a1, to: a2, fromName: 'A Cash', toName: 'A Bank', date: '2026-01-02', amount: 30 },
    // Historical forged owner: a userId filter alone must not authorize this document.
    { _id: transferB, userId: A, accountId: b1, to: b2, fromName: 'SECRET B Cash', toName: 'SECRET B Bank', date: '2026-01-02', amount: 40 },
  ]);
  server = await new Promise((resolve, reject) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
    s.once('error', reject);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  if (mongoose.connection.readyState === 1) {
    assert.equal(mongoose.connection.name, dbName);
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
});

test('A cannot read a B account', async () => {
  const res = await request(`/api/v2/accounts/${b1}`);
  assert.equal(res.status, 404);
  assert.ok(!JSON.stringify(res.body).includes('SECRET'));
});
test('all transfers are scoped by both account owners, not the claimed userId', async () => {
  const res = await request('/api/v2/transfers/all');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.data.map(x => x.id), [String(transferA)]);
});
test('legacy category routes are removed', async () => {
  assert.equal((await request('/api/incomes-categories', { auth: null })).status, 404);
});

const range = 'startDate=2026-01-01&endDate=2026-01-31';
const movementBody = (accountId = a1) => ({ accountId: String(accountId), amount: 1, category: 'Global', description: 'Test', date: '2026-01-03' });
const transferBody = (from = a1, to = a2) => ({ ...movementBody(from), userId: String(A), to: String(to), fromName: 'fake', toName: 'fake' });
const privateRoutes = [
  ['GET', '/accounts'], ['POST', '/accounts'], ['GET', `/accounts/${a1}`], ['DELETE', `/accounts/${a1}`],
  ...['spents', 'incomes'].flatMap(kind => [
    ['GET', `/${kind}?accountId=${a1}`], ['POST', `/${kind}`], ['GET', `/${kind}/range?accountId=${a1}&${range}`],
    ['GET', `/${kind}/${kind === 'spents' ? spentA : incomeA}`],
    ['PATCH', `/${kind}/${kind === 'spents' ? spentA : incomeA}`],
    ['DELETE', `/${kind}/${kind === 'spents' ? spentA : incomeA}?accountId=${a1}`],
  ]),
  ['POST', '/transfers'], ['GET', `/transfers?accountId=${a1}`], ['GET', '/transfers/all'],
  ['GET', `/transfers/range?accountId=${a1}&${range}`], ['GET', `/transfers/users/${A}`], ['GET', `/transfers/${transferA}`],
  ['GET', `/dashboard/accounts/${a1}/summary?${range}`], ['GET', `/dashboard/users/${A}/accounts-summary?${range}`],
  ['GET', '/spents-categories'], ['POST', '/spents-categories'], ['GET', `/spents-categories/users/${A}`], ['DELETE', `/spents-categories/${catA}`],
  ['GET', '/incomes-categories'], ['POST', '/incomes-categories'], ['DELETE', `/incomes-categories/${globalCat}`],
];
async function snapshot() {
  return JSON.stringify(await Promise.all([accountModel, incomeModel, spentModel, transferModel, spentsCategoriesModel, incomesCategoriesModel]
    .map(model => model.find().sort({ _id: 1 }).lean())));
}

test('every private method rejects missing, invalid, expired and malformed-subject JWTs', async t => {
  const badTokens = [null, 'invalid', jwt.sign({ _id: String(A) }, 'wrong-secret'), token(A, { expiresIn: -1 }),
    jwt.sign({ name: 'No subject' }, process.env.JWT_SECRET), jwt.sign({ _id: { $ne: null } }, process.env.JWT_SECRET)];
  const beforeState = await snapshot();
  for (const [method, path] of privateRoutes) {
    await t.test(`${method} ${path}`, async () => {
      for (const auth of badTokens) assert.equal((await request(`/api/v2${path}`, { method, auth, ...(method === 'POST' || method === 'PATCH' ? { body: {} } : {}) })).status, 401);
    });
  }
  assert.equal(await snapshot(), beforeState);
});

test('every formerly mounted legacy method is 404 with and without a token', async () => {
  const legacy = [
    ['POST', '/auth/login'], ['POST', '/auth/register'], ['GET', `/users/${A}`], ['POST', '/users'],
    ['POST', `/accounts/${A}`], ['GET', `/accounts/${a1}`], ['DELETE', `/accounts/${a1}`],
    ...['spents', 'incomes'].flatMap(kind => [['POST', `/${kind}`], ['GET', `/${kind}/${a1}`],
      ['GET', `/${kind}-range-date/${a1}?${range}`], ['PATCH', `/${kind}/${spentA}`], ['DELETE', `/${kind}/${spentA}`]]),
    ['GET', '/spents'], ['POST', '/transfers'], ['GET', '/transfers'], ['GET', `/transfers/${a1}`], ['GET', `/transfers-range-date/${a1}?${range}`],
    ...['spents-categories', 'incomes-categories'].flatMap(kind => [['GET', `/${kind}`], ['POST', `/${kind}`], ['DELETE', `/${kind}/${catA}`]]),
    ['GET', `/spents-categories/${A}`],
  ];
  const state = await snapshot();
  for (const [method, path] of legacy) for (const auth of [null, token()]) {
    const res = await request(`/api${path}`, { method, auth, ...(['POST', 'PATCH'].includes(method) ? { body: {} } : {}) });
    assert.equal(res.status, 404, `${method} /api${path}`);
  }
  assert.equal(await snapshot(), state);
  assert.equal((await request('/api/v2/accounts')).status, 200);
});

test('own reads succeed and private responses omit foreign data, including account reference arrays', async () => {
  await accountModel.updateOne({ _id: a1 }, { $set: { incomes: [incomeB], spents: [spentB], transfers: [transferB] } });
  const paths = [
    '/accounts', `/accounts?userId=${A}`, `/accounts/${a1}`,
    `/spents?accountId=${a1}`, `/spents/range?accountId=${a1}&${range}`, `/spents/${spentA}`,
    `/incomes?accountId=${a1}`, `/incomes/range?accountId=${a1}&${range}`, `/incomes/${incomeA}`,
    `/transfers?accountId=${a1}`, '/transfers/all', `/transfers/users/${A}`, `/transfers/${transferA}`, `/transfers/range?accountId=${a1}&${range}`,
    `/dashboard/accounts/${a1}/summary?${range}`, `/dashboard/users/${A}/accounts-summary?${range}`,
    '/spents-categories', `/spents-categories/users/${A}`, '/incomes-categories',
  ];
  for (const path of paths) {
    const res = await request(`/api/v2${path}`);
    assert.equal(res.status, 200, path);
    const serialized = JSON.stringify(res.body);
    for (const secret of ['SECRET', String(B), String(b1), String(b2), String(catB), String(incomeB), String(spentB), String(transferB)]) {
      assert.ok(!serialized.includes(secret), `${path} leaked ${secret}`);
    }
  }
  const b = await request(`/api/v2/accounts/${b1}`, { auth: token(B) });
  assert.equal(b.status, 200);
  assert.equal(b.body.data.accountName, 'SECRET B Cash');
});

test('all read selectors for B and random missing IDs return the same 404 as foreign resources', async () => {
  const foreignPaths = [
    `/accounts?userId=${B}`, `/accounts/${b1}`, `/spents?accountId=${b1}`, `/spents/range?accountId=${b1}&${range}`, `/spents/${spentB}`,
    `/incomes?accountId=${b1}`, `/incomes/range?accountId=${b1}&${range}`, `/incomes/${incomeB}`,
    `/transfers?accountId=${b1}`, `/transfers/range?accountId=${b1}&${range}`, `/transfers/users/${B}`, `/transfers/${transferB}`,
    `/dashboard/accounts/${b1}/summary?${range}`, `/dashboard/users/${B}/accounts-summary?${range}`, `/spents-categories/users/${B}`,
  ];
  for (const path of foreignPaths) {
    const res = await request(`/api/v2${path}`);
    assert.equal(res.status, 404, path);
    assert.deepEqual(res.body, { error: { code: 'NOT_FOUND', message: 'Resource not found.' } });
  }
  for (const kind of ['accounts', 'spents', 'incomes', 'transfers']) assert.deepEqual(
    (await request(`/api/v2/${kind}/${id()}`)).body, { error: { code: 'NOT_FOUND', message: 'Resource not found.' } });
});

test('denied writes do not change any persisted document or reference', async () => {
  const cases = [
    ['POST', '/accounts', { accountName: 'Attack', userId: String(B) }, 404],
    ['DELETE', `/accounts/${b1}`, undefined, 404],
    ...['spents', 'incomes'].flatMap(kind => {
      const own = kind === 'spents' ? spentA : incomeA, foreign = kind === 'spents' ? spentB : incomeB;
      return [
        ['POST', `/${kind}`, movementBody(b1), 404],
        ['POST', `/${kind}`, { ...movementBody(), userId: String(B) }, 404],
        ['PATCH', `/${kind}/${foreign}`, { amount: 999 }, 404],
        ['PATCH', `/${kind}/${own}`, { accountId: String(b1) }, 404],
        ['PATCH', `/${kind}/${own}`, { accountId: String(a2) }, 400],
        ['DELETE', `/${kind}/${foreign}?accountId=${a1}`, undefined, 404],
        ['DELETE', `/${kind}/${own}?accountId=${b1}`, undefined, 404],
        ['DELETE', `/${kind}/${own}?accountId=${a2}`, undefined, 400],
      ];
    }),
    ['POST', '/spents', { ...movementBody(), categoryId: String(catB) }, 404],
    ['PATCH', `/spents/${spentA}`, { categoryId: String(catB) }, 404],
    ['POST', '/transfers', transferBody(a1, b1), 404], ['POST', '/transfers', transferBody(b1, a1), 404],
    ['POST', '/transfers', { ...transferBody(), userId: String(B) }, 404],
    ['POST', '/spents-categories', { category: 'Attack', userId: String(B) }, 404],
    ['DELETE', `/spents-categories/${catB}`, undefined, 404],
    ['DELETE', `/spents-categories/${catA}`, undefined, 409],
    ['DELETE', `/spents-categories/${globalCat}`, undefined, 403], ['DELETE', `/spents-categories/${nullCat}`, undefined, 403],
    ['POST', '/incomes-categories', { category: 'Attack' }, 403], ['DELETE', `/incomes-categories/${globalCat}`, undefined, 403],
  ];
  for (const [method, path, body, status] of cases) {
    const state = await snapshot();
    assert.equal((await request(`/api/v2${path}`, { method, body })).status, status, `${method} ${path}`);
    assert.equal(await snapshot(), state, `denied ${method} ${path} changed data`);
  }
});

test('identifiers cannot be objects, arrays or query operators', async () => {
  const cases = [
    ['GET', '/accounts?userId[$ne]=x'], ['GET', '/accounts?userId[]=x'],
    ['GET', '/spents?accountId[$ne]=x'], ['GET', '/incomes?accountId[]=x'], ['GET', '/transfers?accountId[$ne]=x'],
    ['GET', '/accounts/not-an-id'], ['GET', '/spents/not-an-id'], ['GET', '/incomes/not-an-id'], ['GET', '/transfers/not-an-id'],
    ['POST', '/accounts', { accountName: { $ne: null } }],
    ['POST', '/accounts', { accountName: 'Attack', userId: { $ne: null } }],
    ['POST', '/incomes', { ...movementBody(), accountId: [String(a1)] }],
    ['POST', '/transfers', { ...transferBody(), to: { $ne: null } }],
    ['POST', '/spents-categories', { category: 'Attack', userId: [String(A)] }],
  ];
  const state = await snapshot();
  for (const [method, path, body] of cases) assert.equal((await request(`/api/v2${path}`, { method, body })).status, 400, `${method} ${path}`);
  assert.equal(await snapshot(), state);
});

test('historical crossed or orphaned refs do not leak in lists, populated details or aggregates', async () => {
  const crossed = await transferModel.create({ userId: A, accountId: a1, to: b1, fromName: 'A', toName: 'SECRET B Cash', date: '2026-01-02', amount: 900 });
  const orphan = await transferModel.create({ userId: A, accountId: a1, to: id(), fromName: 'A', toName: 'SECRET deleted', date: '2026-01-02', amount: 900 });
  const badSpent = await spentModel.create({ ...movementBody(), categoryId: catB, description: 'SECRET B category ref', amount: 900 });
  const orphanSpent = await spentModel.create({ ...movementBody(), categoryId: id(), description: 'SECRET deleted category', amount: 900 });
  for (const path of [`/transfers?accountId=${a1}`, '/transfers/all', `/transfers/range?accountId=${a1}&${range}`, `/spents?accountId=${a1}`,
    `/spents/range?accountId=${a1}&${range}`, `/dashboard/accounts/${a1}/summary?${range}`, `/dashboard/users/${A}/accounts-summary?${range}`]) {
    const res = await request(`/api/v2${path}`);
    assert.equal(res.status, 200, path);
    assert.ok(!JSON.stringify(res.body).includes('SECRET'), path);
    if (path.startsWith('/dashboard/accounts/')) {
      assert.equal(res.body.data.currentBalance.balance, 960);
      assert.equal(res.body.data.period.totals.spents, 10);
    }
  }
  for (const [kind, doc] of [['transfers', crossed], ['transfers', orphan], ['spents', badSpent], ['spents', orphanSpent]]) {
    assert.equal((await request(`/api/v2/${kind}/${doc._id}`)).status, 404);
  }
});

test('own account, category, income, spent and transfer lifecycle keeps v2 usable', async () => {
  let res = await request('/api/v2/accounts', { method: 'POST', body: { accountName: 'Temporary', userId: String(A), incomes: [String(incomeB)] } });
  assert.equal(res.status, 201);
  const account = res.body.data.id;
  assert.equal(String((await accountModel.findById(account)).userId), String(A));
  assert.deepEqual((await accountModel.findById(account)).incomes, []);
  assert.equal((await request(`/api/v2/accounts/${account}`, { method: 'DELETE' })).status, 204);

  res = await request('/api/v2/spents-categories', { method: 'POST', body: { category: 'Personal new' } });
  assert.equal(res.status, 201);
  const category = res.body.data.id;
  assert.equal(String((await spentsCategoriesModel.findById(category)).userId), String(A));
  assert.equal((await request(`/api/v2/spents-categories/${category}`, { method: 'DELETE' })).status, 204);

  for (const kind of ['incomes', 'spents']) {
    res = await request(`/api/v2/${kind}`, { method: 'POST', body: movementBody() });
    assert.equal(res.status, 201, kind);
    const movement = res.body.data.id;
    res = await request(`/api/v2/${kind}/${movement}`, { method: 'PATCH', body: { accountId: String(a1), description: 'Updated' } });
    assert.equal(res.status, 200, kind);
    assert.equal(res.body.data.description, 'Updated');
    assert.equal((await request(`/api/v2/${kind}/${movement}?accountId=${a1}`, { method: 'DELETE' })).status, 204);
  }
  res = await request('/api/v2/transfers', { method: 'POST', body: transferBody() });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.from.name, 'A Cash');
  assert.equal(res.body.data.to.name, 'A Bank');
  assert.equal(res.body.data.userId, String(A));
  const transfer = res.body.data.id;
  assert.ok((await accountModel.findById(a1)).transfers.some(x => String(x) === transfer));
  assert.ok((await accountModel.findById(a2)).transfers.some(x => String(x) === transfer));
});

test('public register creates only its own initial accounts and login produces a working JWT', async () => {
  const credentials = { email: 'req01@example.test', password: 'Test-only-password', first_name: 'Test', last_name: 'User', accounts: [String(b1)], userId: String(B) };
  const registered = await request('/api/v2/auth/register', { method: 'POST', auth: null, body: credentials });
  assert.equal(registered.status, 201);
  const logged = await request('/api/v2/auth/login', { method: 'POST', auth: null, body: credentials });
  assert.equal(logged.status, 200);
  const auth = logged.body.data.accessToken;
  const owner = jwt.verify(auth, process.env.JWT_SECRET)._id;
  const accounts = await request('/api/v2/accounts', { auth });
  assert.equal(accounts.status, 200);
  assert.equal(accounts.body.data.length, 2);
  const { userModel } = await import('../../dist/models/user.model.js');
  assert.deepEqual((await userModel.findById(owner)).accounts, []);
  for (const account of accounts.body.data) assert.equal(String((await accountModel.findById(account.id)).userId), owner);
  assert.equal((await request(`/api/v2/accounts/${b1}`, { auth })).status, 404);
});

test('uppercase account ObjectIds retain the same transfer totals', async () => {
  const lower = await request(`/api/v2/dashboard/accounts/${a1}/summary?${range}`);
  const upper = await request(`/api/v2/dashboard/accounts/${String(a1).toUpperCase()}/summary?${range}`);
  assert.equal(upper.status, 200);
  assert.deepEqual(upper.body, lower.body);
});

test('own and global category references can be used without exposing another user', async () => {
  for (const categoryId of [catA, globalCat, nullCat]) {
    const res = await request('/api/v2/spents', { method: 'POST', body: { ...movementBody(), categoryId: String(categoryId) } });
    assert.equal(res.status, 201);
    const detail = await request(`/api/v2/spents/${res.body.data.id}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.category.id, String(categoryId));
    assert.equal((await request(`/api/v2/spents/${res.body.data.id}?accountId=${a1}`, { method: 'DELETE' })).status, 204);
  }
});
