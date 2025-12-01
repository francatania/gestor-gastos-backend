import mongoose, { model, connect, disconnect } from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();
const { Schema } = mongoose;


const MONGO_URI =
  process.env.MONGO_URI



const accountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  { collection: 'accounts' }
);

const spentsCategoriesSchema = new Schema(
  {
    category: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
  },
  { collection: 'spentscategories' }
);

const spentSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'accounts', required: true },
    category: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'spentscategories' },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
  },
  { collection: 'spents', timestamps: true }
);

const Account = model('AccountMigration', accountSchema);
const SpentCategory = model('SpentCategoryMigration', spentsCategoriesSchema);
const Spent = model('SpentMigration', spentSchema);

(async () => {
  try {
    console.log('Conectando a MongoDB DEV...');
    console.log('MONGO_URI =', MONGO_URI);
    await connect(MONGO_URI);
    console.log('✅ Conectado');


    console.log('Cargando cuentas (accountId -> userId)...');
    const accounts = await Account.find({}, { _id: 1, userId: 1 }).lean();
    console.log(`Se encontraron ${accounts.length} cuentas`);

    const accountToUserMap = new Map();
    for (const acc of accounts) {
      if (!acc._id || !acc.userId) continue;
      accountToUserMap.set(acc._id.toString(), acc.userId.toString());
    }

    console.log('Cargando categorías (spentscategories)...');
    const categories = await SpentCategory.find({}, { _id: 1, category: 1, userId: 1 }).lean();
    console.log(`Se encontraron ${categories.length} categorías`);

    const specificCategoryMap = new Map(); 
    const genericCategoryMap = new Map();  

    for (const cat of categories) {
      if (!cat.category) continue;
      const normalizedName = normalizeCategory(cat.category);

      if (cat.userId) {
        const key = buildSpecificKey(cat.userId.toString(), normalizedName);
        specificCategoryMap.set(key, cat._id);
      } else {

        genericCategoryMap.set(normalizedName, cat._id);
      }
    }


    console.log('Buscando spents sin categoryId...');
    const query = {
      $or: [{ categoryId: { $exists: false } }, { categoryId: null }],
    };

    const spentsToMigrate = await Spent.find(query).lean();
    console.log(`Spents a migrar: ${spentsToMigrate.length}`);

    if (spentsToMigrate.length === 0) {
      console.log('No hay spents para migrar. Nada que hacer.');
      await disconnect();
      process.exit(0);
    }

    let processed = 0;
    let updated = 0;
    let withoutUser = 0;
    let withoutCategoryMatch = 0;

    for (const spent of spentsToMigrate) {
      processed++;

      const accountId = spent.accountId?.toString();
      if (!accountId) {
        console.warn(`⚠️ Spent ${spent._id} sin accountId`);
        withoutUser++;
        continue;
      }

      const userId = accountToUserMap.get(accountId);
      if (!userId) {
        console.warn(`⚠️ No se encontró userId para accountId=${accountId} (spentId=${spent._id})`);
        withoutUser++;
        continue;
      }

      const normalizedName = normalizeCategory(spent.category);

      const specificKey = buildSpecificKey(userId, normalizedName);
      let categoryId = specificCategoryMap.get(specificKey);

      if (!categoryId) {
        categoryId = genericCategoryMap.get(normalizedName);
      }

      if (!categoryId) {
        console.warn(
          `⚠️ No se encontró categoría (ni específica ni genérica) para userId=${userId}, category="${spent.category}" (spentId=${spent._id})`
        );
        withoutCategoryMatch++;
        continue;
      }

      await Spent.updateOne({ _id: spent._id }, { $set: { categoryId } });
      updated++;

      if (processed % 100 === 0) {
        console.log(
          `Progreso: procesados=${processed}, actualizados=${updated}, sinUser=${withoutUser}, sinMatch=${withoutCategoryMatch}`
        );
      }
    }

    console.log('==============================');
    console.log('✅ Migración finalizada (con fallback a genéricas)');
    console.log(`Total procesados:         ${processed}`);
    console.log(`Total actualizados:       ${updated}`);
    console.log(`Sin userId de cuenta:     ${withoutUser}`);
    console.log(`Sin categoría encontrada: ${withoutCategoryMatch}`);
    console.log('==============================');

    await disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en la migración:', err);
    await disconnect();
    process.exit(1);
  }
})();

function normalizeCategory(categoryName) {
  return (categoryName || '').trim().toLowerCase();
}

function buildSpecificKey(userId, normalizedName) {
  return `${userId}::${normalizedName}`;
}