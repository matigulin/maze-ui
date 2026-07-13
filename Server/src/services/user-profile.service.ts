import { randomUUID } from 'node:crypto';
import { NotFoundError } from '../lib/errors.js';
import { Product } from '../models/catalog.js';
import {
  Favorite,
  User,
  UserAddress,
  UserCompany,
  UserConsent,
} from '../models/user.js';
import { listProductSummariesByIds } from './catalog.service.js';

function mapUser(user: User) {
  return {
    id: user.id,
    phone: user.phone,
    firstName: user.get('first_name') as string | null,
    lastName: user.get('last_name') as string | null,
    middleName: user.get('middle_name') as string | null,
    email: user.get('email') as string | null,
    gender: user.get('gender') as string | null,
    birthDate: (user.get('birth_date') as string | null) ?? null,
    subscribeEmail: user.get('subscribe_email') as boolean,
    subscribeSms: user.get('subscribe_sms') as boolean,
  };
}

function mapAddress(address: UserAddress) {
  return {
    id: address.id,
    type: address.get('type') as string,
    city: address.get('city') as string,
    street: address.get('street') as string,
    house: address.get('house') as string,
    building: (address.get('building') as string | null) ?? null,
    apartment: (address.get('apartment') as string | null) ?? null,
    floor: (address.get('floor') as string | null) ?? null,
    isDefault: address.get('is_default') as boolean,
  };
}

function mapCompany(company: UserCompany) {
  return {
    id: company.id,
    name: company.get('name') as string,
    inn: company.get('inn') as string,
    kpp: (company.get('kpp') as string | null) ?? null,
    address: company.get('legal_address') as string,
  };
}

export async function getMe(userId: string) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return mapUser(user);
}

export async function updateMe(
  userId: string,
  input: {
    firstName?: string;
    lastName?: string;
    middleName?: string | null;
    email?: string;
    gender?: 'male' | 'female' | null;
    birthDate?: string | null;
    subscribeEmail?: boolean;
    subscribeSms?: boolean;
  },
  ipAddress?: string | null,
) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updates: Record<string, unknown> = {};
  if (input.firstName !== undefined) updates.first_name = input.firstName;
  if (input.lastName !== undefined) updates.last_name = input.lastName;
  if (input.middleName !== undefined) {
    updates.middle_name = input.middleName?.trim() ? input.middleName.trim() : null;
  }
  if (input.email !== undefined) updates.email = input.email;
  if (input.gender !== undefined) updates.gender = input.gender;
  if (input.birthDate !== undefined) updates.birth_date = input.birthDate;

  if (input.subscribeEmail !== undefined && input.subscribeEmail !== user.get('subscribe_email')) {
    updates.subscribe_email = input.subscribeEmail;
    await UserConsent.create({
      id: randomUUID(),
      user_id: userId,
      channel: 'email',
      granted: input.subscribeEmail,
      ip_address: ipAddress ?? null,
    });
  }

  if (input.subscribeSms !== undefined && input.subscribeSms !== user.get('subscribe_sms')) {
    updates.subscribe_sms = input.subscribeSms;
    await UserConsent.create({
      id: randomUUID(),
      user_id: userId,
      channel: 'sms',
      granted: input.subscribeSms,
      ip_address: ipAddress ?? null,
    });
  }

  if (Object.keys(updates).length > 0) {
    await user.update(updates);
  }

  return mapUser(user);
}

export async function listAddresses(userId: string) {
  const rows = await UserAddress.findAll({
    where: { user_id: userId },
    order: [['is_default', 'DESC'], ['created_at', 'DESC']],
  });
  return rows.map(mapAddress);
}

export async function createAddress(
  userId: string,
  input: {
    type: 'home' | 'work';
    city: string;
    street: string;
    house: string;
    flat?: string;
    building?: string;
    floor?: string;
    isDefault?: boolean;
  },
) {
  if (input.isDefault) {
    await UserAddress.update({ is_default: false }, { where: { user_id: userId } });
  }

  const address = await UserAddress.create({
    id: randomUUID(),
    user_id: userId,
    type: input.type,
    city: input.city,
    street: input.street,
    house: input.house,
    building: input.building ?? null,
    apartment: input.flat ?? null,
    floor: input.floor ?? null,
    is_default: input.isDefault ?? false,
  });

  return mapAddress(address);
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: Partial<{
    type: 'home' | 'work';
    city: string;
    street: string;
    house: string;
    flat: string;
    building: string;
    floor: string;
    isDefault: boolean;
  }>,
) {
  const address = await UserAddress.findOne({ where: { id: addressId, user_id: userId } });
  if (!address) {
    throw new NotFoundError('Address not found');
  }

  if (input.isDefault) {
    await UserAddress.update({ is_default: false }, { where: { user_id: userId } });
  }

  await address.update({
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.city !== undefined ? { city: input.city } : {}),
    ...(input.street !== undefined ? { street: input.street } : {}),
    ...(input.house !== undefined ? { house: input.house } : {}),
    ...(input.building !== undefined ? { building: input.building } : {}),
    ...(input.flat !== undefined ? { apartment: input.flat } : {}),
    ...(input.floor !== undefined ? { floor: input.floor } : {}),
    ...(input.isDefault !== undefined ? { is_default: input.isDefault } : {}),
  });

  return mapAddress(address);
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await UserAddress.findOne({ where: { id: addressId, user_id: userId } });
  if (!address) {
    throw new NotFoundError('Address not found');
  }
  await address.destroy();
}

export async function listCompanies(userId: string) {
  const rows = await UserCompany.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
  });
  return rows.map(mapCompany);
}

export async function createCompany(
  userId: string,
  input: { name: string; inn: string; kpp?: string; address: string },
) {
  const company = await UserCompany.create({
    id: randomUUID(),
    user_id: userId,
    name: input.name,
    inn: input.inn,
    kpp: input.kpp ?? null,
    legal_address: input.address,
  });
  return mapCompany(company);
}

export async function updateCompany(
  userId: string,
  companyId: string,
  input: Partial<{ name: string; inn: string; kpp: string; address: string }>,
) {
  const company = await UserCompany.findOne({ where: { id: companyId, user_id: userId } });
  if (!company) {
    throw new NotFoundError('Company not found');
  }

  await company.update({
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.inn !== undefined ? { inn: input.inn } : {}),
    ...(input.kpp !== undefined ? { kpp: input.kpp } : {}),
    ...(input.address !== undefined ? { legal_address: input.address } : {}),
  });

  return mapCompany(company);
}

export async function deleteCompany(userId: string, companyId: string) {
  const company = await UserCompany.findOne({ where: { id: companyId, user_id: userId } });
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  await company.destroy();
}

export async function updateConsents(
  userId: string,
  input: { subscribeEmail?: boolean; subscribeSms?: boolean; source?: string },
  ipAddress?: string | null,
) {
  return updateMe(
    userId,
    {
      subscribeEmail: input.subscribeEmail,
      subscribeSms: input.subscribeSms,
    },
    ipAddress,
  );
}

export async function listFavorites(userId: string) {
  const rows = await Favorite.findAll({
    where: { user_id: userId },
    attributes: ['product_id'],
  });
  const productIds = rows.map((row) => row.product_id);
  return listProductSummariesByIds(productIds);
}

export async function addFavorite(userId: string, productId: string) {
  const product = await Product.findOne({
    where: { id: productId, is_published: true },
    attributes: ['id'],
  });
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  await Favorite.findOrCreate({
    where: { user_id: userId, product_id: productId },
    defaults: { user_id: userId, product_id: productId },
  });
}

export async function removeFavorite(userId: string, productId: string) {
  const deleted = await Favorite.destroy({
    where: { user_id: userId, product_id: productId },
  });
  if (!deleted) {
    throw new NotFoundError('Favorite not found');
  }
}
