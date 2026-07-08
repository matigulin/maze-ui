import type { Transaction } from 'sequelize';
import { Op } from 'sequelize';
import { ConflictError } from './errors.js';
import { Stock } from '../models/catalog.js';

interface StockLine {
  variant_id: string | null;
  quantity: number;
}

function stockLines(items: StockLine[]) {
  return items.filter((item): item is { variant_id: string; quantity: number } => Boolean(item.variant_id));
}

export async function releaseOrderStockReservations(
  items: StockLine[],
  transaction: Transaction,
): Promise<void> {
  const lines = stockLines(items);
  if (lines.length === 0) return;

  const variantIds = [...lines.map((line) => line.variant_id)].sort();
  const quantityByVariant = new Map(lines.map((line) => [line.variant_id, line.quantity]));

  const stocks = await Stock.findAll({
    where: { variant_id: { [Op.in]: variantIds } },
    order: [['variant_id', 'ASC']],
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  for (const stock of stocks) {
    const releaseQty = quantityByVariant.get(stock.variant_id) ?? 0;
    const nextReserved = Math.max(0, stock.reserved_quantity - releaseQty);
    await stock.update({ reserved_quantity: nextReserved }, { transaction });
  }
}

export async function fulfillOrderStock(
  items: StockLine[],
  transaction: Transaction,
): Promise<void> {
  const lines = stockLines(items);
  if (lines.length === 0) return;

  const variantIds = [...lines.map((line) => line.variant_id)].sort();
  const quantityByVariant = new Map(lines.map((line) => [line.variant_id, line.quantity]));

  const stocks = await Stock.findAll({
    where: { variant_id: { [Op.in]: variantIds } },
    order: [['variant_id', 'ASC']],
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  if (stocks.length !== variantIds.length) {
    throw new ConflictError('ORDER_OUT_OF_STOCK', 'Insufficient stock for one or more items');
  }

  for (const stock of stocks) {
    const needed = quantityByVariant.get(stock.variant_id) ?? 0;
    if (stock.quantity < needed || stock.reserved_quantity < needed) {
      throw new ConflictError('ORDER_OUT_OF_STOCK', 'Insufficient stock for one or more items');
    }

    await stock.update(
      {
        quantity: stock.quantity - needed,
        reserved_quantity: stock.reserved_quantity - needed,
      },
      { transaction },
    );
  }
}
