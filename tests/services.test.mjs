import assert from 'node:assert/strict';
import { test } from 'node:test';
import mongoose from 'mongoose';

import { AccountService } from '../dist/services/account.service.js';
import { AccountBalanceService } from '../dist/services/account-balance.service.js';
import { DashboardService } from '../dist/services/dashboard.service.js';
import { IncomeService } from '../dist/services/income.service.js';
import { SpentService } from '../dist/services/spent.service.js';
import { TransferService } from '../dist/services/transfer.service.js';

const objectId = () => new mongoose.Types.ObjectId();
const actor = objectId().toString();

test('AccountService creates an account response DTO', async () => {
  const userId = actor;
  const accountId = objectId();
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-02T00:00:00.000Z');

  const service = new AccountService({
    getByName: async () => null,
    create: async (data) => ({
      _id: accountId,
      accountName: data.accountName,
      userId: new mongoose.Types.ObjectId(data.userId),
      incomes: [],
      spents: [],
      transfers: [],
      createdAt,
      updatedAt,
    }),
  });

  const result = await service.create({
    accountName: 'Cash',
    userId,
  }, actor);

  assert.deepEqual(result, {
    id: accountId.toString(),
    accountName: 'Cash',
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
});

test('AccountService rejects duplicate account names for the same user', async () => {
  const service = new AccountService({
    getByName: async () => ({ _id: objectId() }),
  });

  await assert.rejects(
    () => service.create({ accountName: 'Cash', userId: actor }, actor),
    (error) => error.code === 'CONFLICT' && error.statusCode === 409
  );
});

test('SpentService validates that a spent has a category or categoryId', async () => {
  const service = new SpentService({}, {}, {}, {});

  await assert.rejects(
    () => service.create({
      accountId: objectId().toString(),
      amount: 100,
      description: 'Lunch',
      date: '2026-01-01',
    }, actor),
    (error) => error.code === 'VALIDATION_ERROR' && error.statusCode === 400
  );
});

test('SpentService rejects a spent that would leave a negative balance', async () => {
  const accountId = objectId().toString();
  const service = new SpentService(
    {},
    { requireOwned: async () => ({ _id: accountId }) },
    {
      ensureCanSpend: async () => {
        const error = new Error('Insufficient account balance.');
        error.code = 'VALIDATION_ERROR';
        error.statusCode = 400;
        throw error;
      },
    },
    {}
  );

  await assert.rejects(
    () => service.create({
      accountId,
      amount: 500,
      category: 'Food',
      description: 'Lunch',
      date: '2026-01-01',
    }, actor),
    (error) => error.code === 'VALIDATION_ERROR' && error.statusCode === 400
  );
});

test('AccountBalanceService calculates current balance', async () => {
  const accountId = objectId();
  const otherAccountId = objectId();
  const service = new AccountBalanceService(
    {
      getById: async () => ({ _id: accountId }),
    },
    {
      getByAccount: async () => [
        spent(accountId, 100, 'Food', '2026-01-05'),
        spent(accountId, 50, 'Transport', '2025-12-10'),
      ],
    },
    {
      getByAccount: async () => [
        income(accountId, 1000, 'Salary', '2026-01-01'),
        income(accountId, 300, 'Bonus', '2025-12-01'),
      ],
    },
    {
      getByAccount: async () => [
        transfer(accountId, otherAccountId, 200, '2026-01-07'),
        transfer(otherAccountId, accountId, 75, '2025-12-15'),
      ],
    }
  );

  const result = await service.getCurrentBalance(accountId.toString(), actor);

  assert.deepEqual(result, {
    incomes: 1300,
    spents: 150,
    incomingTransfers: 75,
    outgoingTransfers: 200,
    balance: 1025,
  });
});

test('IncomeService checks ownership before creating an income', async () => {
  let writes = 0;
  const service = new IncomeService({ create: async () => { writes++; } }, {
    requireOwned: async () => {
      const error = new Error('Resource not found.');
      error.code = 'NOT_FOUND'; error.statusCode = 404;
      throw error;
    },
  });
  await assert.rejects(() => service.create({ accountId: objectId().toString(), amount: 2500,
    category: 'Salary', description: 'Salary', date: '2026-01-01' }, actor),
    error => error.code === 'NOT_FOUND' && error.statusCode === 404);
  assert.equal(writes, 0);
});

test('TransferService associates a transfer with both accounts', async () => {
  const userId = actor;
  const fromId = objectId().toString();
  const toId = objectId().toString();
  const addedTransfers = [];

  const transferDao = {
    create: async (doc) => doc,
  };

  const accountDao = {
    requireOwned: async id => ({ _id: id, accountName: id === fromId ? 'Cash' : 'Bank' }),
    addTransfer: async (accountId, transferId) => {
      addedTransfers.push({ accountId, transferId });
      return { _id: accountId };
    },
  };

  const service = new TransferService(transferDao, accountDao);

  const result = await service.create({
    userId,
    accountId: fromId,
    fromName: 'Cash',
    to: toId,
    toName: 'Bank',
    date: '2026-01-01',
    amount: 500,
  }, actor);

  assert.equal(result.userId, userId);
  assert.equal(result.from.id, fromId);
  assert.equal(result.from.name, 'Cash');
  assert.equal(result.to.id, toId);
  assert.equal(result.to.name, 'Bank');
  assert.equal(addedTransfers.length, 2);
  assert.deepEqual(
    addedTransfers.map((entry) => entry.accountId),
    [fromId, toId]
  );
});

test('DashboardService returns all-time balance and period summary separately', async () => {
  const accountId = objectId();
  const otherAccountId = objectId();
  const account = {
    _id: accountId,
    accountName: 'Cash',
  };

  const accountBalanceService = {
    getCurrentBalance: async () => ({
      incomes: 1300,
      spents: 150,
      incomingTransfers: 75,
      outgoingTransfers: 200,
      balance: 1025,
    }),
  };

  const service = new DashboardService(
    {
      getById: async () => account,
    },
    {
      getByAccount: async () => [
        spent(accountId, 100, 'Food', '2026-01-05'),
        spent(accountId, 50, 'Transport', '2025-12-10'),
      ],
      getByDateRangeAndAccount: async () => [
        spent(accountId, 100, 'Food', '2026-01-05'),
      ],
    },
    {
      getByAccount: async () => [
        income(accountId, 1000, 'Salary', '2026-01-01'),
        income(accountId, 300, 'Bonus', '2025-12-01'),
      ],
      getByDateRangeAndAccount: async () => [
        income(accountId, 1000, 'Salary', '2026-01-01'),
      ],
    },
    {
      getByDateRangeAndAccount: async () => [
        transfer(accountId, otherAccountId, 200, '2026-01-07'),
      ],
    },
    accountBalanceService
  );

  const result = await service.getAccountSummary(accountId.toString(), {
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  }, actor);

  assert.equal(result.account.id, accountId.toString());
  assert.equal(result.currentBalance.incomes, 1300);
  assert.equal(result.currentBalance.spents, 150);
  assert.equal(result.currentBalance.incomingTransfers, 75);
  assert.equal(result.currentBalance.outgoingTransfers, 200);
  assert.equal(result.currentBalance.balance, 1025);
  assert.deepEqual(result.period.totals, {
    incomes: 1000,
    spents: 100,
    incomingTransfers: 0,
    outgoingTransfers: 200,
    net: 700,
  });
  assert.deepEqual(result.period.charts.spentsByCategory, [
    { category: 'Food', amount: 100 },
  ]);
  assert.deepEqual(result.period.charts.incomesByCategory, [
    { category: 'Salary', amount: 1000 },
  ]);
  assert.deepEqual(result.period.charts.spentsByMonth, [
    { month: '2026-01', amount: 100 },
  ]);
  assert.deepEqual(result.period.charts.incomesByMonth, [
    { month: '2026-01', amount: 1000 },
  ]);
});

test('DashboardService returns compact summaries for all user accounts', async () => {
  const userId = new mongoose.Types.ObjectId(actor);
  const firstAccountId = objectId();
  const secondAccountId = objectId();

  const service = new DashboardService(
    {
      getByUserId: async () => [
        { _id: firstAccountId, accountName: 'Cash' },
        { _id: secondAccountId, accountName: 'Bank' },
      ],
    },
    {
      getByAccount: async (accountId) => [spent(accountId, 10, 'Food', '2026-01-03')],
      getByDateRangeAndAccount: async (startDate, endDate, accountId) => [
        spent(accountId, 10, 'Food', '2026-01-03'),
      ],
    },
    {
      getByAccount: async (accountId) => [income(accountId, 100, 'Salary', '2026-01-01')],
      getByDateRangeAndAccount: async (startDate, endDate, accountId) => [
        income(accountId, 100, 'Salary', '2026-01-01'),
      ],
    },
    {
      getByDateRangeAndAccount: async () => [],
    },
    {
      getCurrentBalance: async () => ({
        incomes: 100,
        spents: 10,
        incomingTransfers: 0,
        outgoingTransfers: 0,
        balance: 90,
      }),
    }
  );

  const result = await service.getUserAccountsSummary(userId.toString(), {
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  }, actor);

  assert.equal(result.length, 2);
  assert.equal(result[0].currentBalance.balance, 90);
  assert.equal(result[0].period.net, 90);
  assert.equal(result[1].currentBalance.balance, 90);
  assert.equal(result[1].period.net, 90);
});

test('DashboardService rejects invalid account ids', async () => {
  const service = new DashboardService({}, {}, {}, {}, {});

  await assert.rejects(
    () => service.getAccountSummary('invalid-id', {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    }, actor),
    (error) => error.code === 'VALIDATION_ERROR' && error.statusCode === 400
  );
});

const spent = (accountId, amount, category, date) => ({
  _id: objectId(),
  accountId,
  category,
  description: category,
  date: new Date(`${date}T00:00:00.000Z`),
  amount,
});

const income = (accountId, amount, category, date) => ({
  _id: objectId(),
  accountId,
  category,
  description: category,
  date: new Date(`${date}T00:00:00.000Z`),
  amount,
});

const transfer = (fromAccountId, toAccountId, amount, date) => ({
  _id: objectId(),
  userId: objectId(),
  accountId: fromAccountId,
  fromName: 'From',
  to: toAccountId,
  toName: 'To',
  date: new Date(`${date}T00:00:00.000Z`),
  amount,
});

for (const [name, Service] of [['Income', IncomeService], ['Spent', SpentService]]) {
  test(`${name}Service compensates its newly created document if the account disappears`, async () => {
    let compensated = false;
    const dao = { create: async doc => { doc.deleteOne = async () => { compensated = true; }; return doc; } };
    const accounts = { requireOwned: async () => ({}), [`add${name}`]: async () => null };
    const service = new Service(dao, accounts, { ensureCanSpend: async () => {} }, {});
    await assert.rejects(() => service.create({ accountId: objectId().toString(), category: 'Test',
      description: 'Test', date: '2026-01-01', amount: 1 }, actor), error => error.code === 'NOT_FOUND');
    assert.equal(compensated, true);
  });
}

test('TransferService compensates both references and its document when a destination disappears', async () => {
  let compensated = false;
  const removed = [];
  const from = objectId().toString(), to = objectId().toString();
  const service = new TransferService({ create: async doc => { doc.deleteOne = async () => { compensated = true; }; return doc; } }, {
    requireOwned: async id => ({ _id: id, accountName: 'Test' }),
    addTransfer: async id => id === from ? {} : null,
    removeTransfer: async id => { removed.push(id); },
  });
  await assert.rejects(() => service.create({ userId: actor, accountId: from, to, date: '2026-01-01', amount: 1 }, actor),
    error => error.code === 'NOT_FOUND');
  assert.equal(compensated, true);
  assert.deepEqual(removed.sort(), [from, to].sort());
});
