import database from "@core/config/database";
import { databaseName } from "@core/utils/database_name";
import { RowDataPacket } from "mysql2/promise";

const GENDER_LABELS: Record<number, string> = {
  0: "Nữ",
  1: "Nam",
  2: "Khác",
};

const PUBLISH_LABELS: Record<number, string> = {
  0: "Ẩn",
  1: "Hiện",
};

const ADDRESS_TYPE_LABELS: Record<string, string> = {
  nha_rieng: "Nhà riêng",
  van_phong: "Văn phòng",
};

const toPublishName = (publish: unknown) =>
  PUBLISH_LABELS[Number(publish)] ?? (publish == null ? null : String(publish));

const toGenderName = (gender: unknown) =>
  gender == null ? null : GENDER_LABELS[Number(gender)] ?? String(gender);

const toAddressTypeName = (addressType: unknown) =>
  addressType == null
    ? null
    : ADDRESS_TYPE_LABELS[String(addressType)] ?? String(addressType);

export type CustomerLogSnapshot = {
  id: number;
  code: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  birthdate: string | Date | null;
  gender: number | null;
  gender_name: string | null;
  publish: number | null;
  publish_name: string | null;
  seller_id: number | null;
  group_id: number | null;
  group_name: string | null;
};

export type CustomerAddressLogSnapshot = {
  id: number;
  name: string | null;
  phone: string | null;
  address_type: string | null;
  address_type_name: string | null;
  publish: number | null;
  publish_name: string | null;
  is_default: number | null;
  customer_id: number | null;
  customer_code: string | null;
  customer_name: string | null;
  seller_id: number | null;
  city_id: number | null;
  city_name: string | null;
  ward_id: number | null;
  ward_name: string | null;
  address: string | null;
  full_address: string | null;
};

export type CustomerGroupLogSnapshot = {
  id: number;
  code: string | null;
  name: string | null;
  publish: number | null;
  publish_name: string | null;
  seller_id: number | null;
};

export const getCustomerSnapshotForLog = async (
  id: number
): Promise<CustomerLogSnapshot | null> => {
  const result = await database.executeQuery(
    `
    SELECT
      c.id, c.code, c.name, c.phone, c.email, c.birthdate, c.gender, c.publish,
      c.seller_id, c.group_id, cg.name AS group_name
    FROM ${databaseName.customer} c
    LEFT JOIN ${databaseName.customer_group} cg ON cg.id = c.group_id
    WHERE c.id = ?
    `,
    [id]
  );
  const [row] = (result as RowDataPacket[]) ?? [];
  if (!row) return null;

  return {
    id: Number(row.id),
    code: row.code ?? null,
    name: row.name ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    birthdate: row.birthdate ?? null,
    gender: row.gender == null ? null : Number(row.gender),
    gender_name: toGenderName(row.gender),
    publish: row.publish == null ? null : Number(row.publish),
    publish_name: toPublishName(row.publish),
    seller_id: row.seller_id == null ? null : Number(row.seller_id),
    group_id: row.group_id == null ? null : Number(row.group_id),
    group_name: row.group_name ?? null,
  };
};

export const getCustomerAddressSnapshotForLog = async (
  id: number
): Promise<CustomerAddressLogSnapshot | null> => {
  const result = await database.executeQuery(
    `
    SELECT
      ca.id, ca.name, ca.phone, ca.address_type, ca.publish, ca.is_default,
      ca.customer_id, ca.city_id, ca.ward_id, ca.address,
      c.code AS customer_code, c.name AS customer_name, c.seller_id,
      city.name AS city_name, w.name AS ward_name,
      CONCAT_WS(', ', TRIM(ca.address), w.name, city.name) AS full_address
    FROM ${databaseName.customer_address} ca
    LEFT JOIN ${databaseName.customer} c ON c.id = ca.customer_id
    LEFT JOIN ${databaseName.city} city ON city.id = ca.city_id
    LEFT JOIN ${databaseName.ward} w ON w.id = ca.ward_id
    WHERE ca.id = ?
    `,
    [id]
  );
  const [row] = (result as RowDataPacket[]) ?? [];
  if (!row) return null;

  return {
    id: Number(row.id),
    name: row.name ?? null,
    phone: row.phone ?? null,
    address_type: row.address_type ?? null,
    address_type_name: toAddressTypeName(row.address_type),
    publish: row.publish == null ? null : Number(row.publish),
    publish_name: toPublishName(row.publish),
    is_default: row.is_default == null ? null : Number(row.is_default),
    customer_id: row.customer_id == null ? null : Number(row.customer_id),
    customer_code: row.customer_code ?? null,
    customer_name: row.customer_name ?? null,
    seller_id: row.seller_id == null ? null : Number(row.seller_id),
    city_id: row.city_id == null ? null : Number(row.city_id),
    city_name: row.city_name ?? null,
    ward_id: row.ward_id == null ? null : Number(row.ward_id),
    ward_name: row.ward_name ?? null,
    address: row.address ?? null,
    full_address: row.full_address ?? null,
  };
};

export const getCustomerGroupSnapshotForLog = async (
  id: number
): Promise<CustomerGroupLogSnapshot | null> => {
  const result = await database.executeQuery(
    `
    SELECT id, code, name, publish, seller_id
    FROM ${databaseName.customer_group}
    WHERE id = ?
    `,
    [id]
  );
  const [row] = (result as RowDataPacket[]) ?? [];
  if (!row) return null;

  return {
    id: Number(row.id),
    code: row.code ?? null,
    name: row.name ?? null,
    publish: row.publish == null ? null : Number(row.publish),
    publish_name: toPublishName(row.publish),
    seller_id: row.seller_id == null ? null : Number(row.seller_id),
  };
};
