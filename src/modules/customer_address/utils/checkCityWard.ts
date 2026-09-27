import database from "@core/config/database";
import { databaseName } from "@core/utils/database_name";

/**
 * Kiểm tra city_id có tồn tại trong bảng city
 */
export const checkCityExists = async (cityId: number): Promise<boolean> => {
  const result = await database.executeQuery(
    `SELECT 1 FROM ${databaseName.city} WHERE id = ? LIMIT 1`,
    [cityId]
  );
  return Array.isArray(result) && result.length > 0;
};

/**
 * Kiểm tra ward_id có tồn tại trong bảng ward và thuộc city_id
 */
export const checkWardExistsAndBelongToCity = async (wardId: number, cityId: number): Promise<boolean> => {
  const result = await database.executeQuery(
    `SELECT 1 FROM ${databaseName.ward} WHERE id = ? AND city_id = ? LIMIT 1`,
    [wardId, cityId]
  );
  return Array.isArray(result) && result.length > 0;
};

/**
 * Kiểm tra ward_id có tồn tại trong bảng ward
 */
export const checkWardExists = async (wardId: number): Promise<boolean> => {
  const result = await database.executeQuery(
    `SELECT 1 FROM ${databaseName.ward} WHERE id = ? LIMIT 1`,
    [wardId]
  );
  return Array.isArray(result) && result.length > 0;
};
