/**
 * Export tất cả swagger modules
 * Thêm module mới: import và merge vào paths + schemas
 */
import { customerPaths, customerSchemas } from "./customer.swagger";
import {
  customerGroupPaths,
  customerGroupSchemas,
} from "./customer_group.swagger";
import {
  customerAddressPaths,
  customerAddressSchemas,
} from "./customer_address.swagger";
import { internalPaths, internalSchemas } from "./internal.swagger";

export const swaggerPaths = {
  ...customerPaths,
  ...customerGroupPaths,
  ...customerAddressPaths,
  ...internalPaths,
};

export const swaggerSchemas = {
  ...customerSchemas,
  ...customerGroupSchemas,
  ...customerAddressSchemas,
  ...internalSchemas,
};
