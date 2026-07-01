import assert from 'node:assert/strict';
import { test } from 'node:test';
import mongoose from 'mongoose';

import { AccountService } from '../dist/services/account.service.js';
import { IncomeService } from '../dist/services/income.service.js';
import { SpentService } from '../dist/services/spent.service.js';
import { TransferService } from '../dist/services/transfer.service.js';

const objectId = () => new mongoose.Types.ObjectId();

test('AccountService creates an account response DTO', async () => {
  const userId = objectId().toString();
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
  });

  assert.deepEqual(result, {
    id: accountId.toString(),
    accountName: 'Cash',
    incomes: [],
    spents: [],
    transfers: [],
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
});

test('AccountService rejects duplicate account names for the same user', async () => {
  const service = new AccountService({
    getByName: async () => ({ _id: objectId() }),
  });

  await assert.rejects(
    () => service.create({ accountName: 'Cash', userId: objectId().toString() }),
    (error) => error.code === 'CONFLICT' && error.statusCode === 409
  );
});

test('SpentService validates that a spent has a category or categoryId', async () => {
  const service = new SpentService({}, {});

  await assert.rejects(
    () => service.create({
      accountId: objectId().toString(),
      amount: 100,
      description: 'Lunch',
      date: '2026-01-01',
    }),
    (error) => error.code === 'VALIDATION_ERROR' && error.statusCode === 400
  );
});

test('IncomeService rolls back created income when the account does not exist', async () => {
  let deletedIncomeId = null;

  const incomeDao = {
    create: async (doc) => doc,
    deleteById: async (id) => {
      deletedIncomeId = id;
      return { deletedCount: 1 };
    },
  };

  const accountDao = {
    addIncome: async () => null,
  };

  const service = new IncomeService(incomeDao, accountDao);

  await assert.rejects(
    () => service.create({
      accountId: objectId().toString(),
      amount: 2500,
      category: 'Salary',
      description: 'January salary',
      date: '2026-01-01',
    }),
    (error) => error.code === 'NOT_FOUND' && error.statusCode === 404
  );

  assert.equal(typeof deletedIncomeId, 'string');
});

test('TransferService associates a transfer with both accounts', async () => {
  const userId = objectId().toString();
  const fromId = objectId().toString();
  const toId = objectId().toString();
  const addedTransfers = [];

  const transferDao = {
    create: async (doc) => doc,
  };

  const accountDao = {
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
  });

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
