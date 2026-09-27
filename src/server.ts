require('module-alias/register');
require('dotenv').config({
  path: require('path').resolve(`.env_${(process.env.NODE_ENV || 'development').trim()}`),
});
require('dotenv').config();
import App from "./app"
import 'reflect-metadata';

import { CustomerAddressRoute } from "@modules/customer_address";
import { CustomerGroupRoute } from "@modules/customer_group";
import { CustomerRoute } from "@modules/customer";
import { InternalCustomerRoute } from "@modules/internal";
import { AdminRoute } from "@modules/admin";

const routes = [
    new CustomerAddressRoute(),
    new CustomerGroupRoute(),
    new CustomerRoute(),
    new InternalCustomerRoute(),
    new AdminRoute(),
];
const app = new App(routes);

app.listen();