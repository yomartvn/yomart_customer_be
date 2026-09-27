/**
 * Parse env string thành số nguyên, trả về default nếu invalid
 */
export const parseEnvInt = (value: string | undefined, defaultVal: number): number => {
  if (!value) return defaultVal;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultVal : parsed;
};
