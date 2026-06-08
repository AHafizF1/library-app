/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _internal from "../_internal.js";
import type * as auth from "../auth.js";
import type * as betterAuthSchema from "../betterAuthSchema.js";
import type * as books from "../books.js";
import type * as columns from "../columns.js";
import type * as constants from "../constants.js";
import type * as http from "../http.js";
import type * as importApi from "../importApi.js";
import type * as internalBooks from "../internalBooks.js";
import type * as orgJoinCodes from "../orgJoinCodes.js";
import type * as organizations from "../organizations.js";
import type * as rows from "../rows.js";
import type * as seed from "../seed.js";
import type * as shelves from "../shelves.js";
import type * as tenantAccess from "../tenantAccess.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _internal: typeof _internal;
  auth: typeof auth;
  betterAuthSchema: typeof betterAuthSchema;
  books: typeof books;
  columns: typeof columns;
  constants: typeof constants;
  http: typeof http;
  importApi: typeof importApi;
  internalBooks: typeof internalBooks;
  orgJoinCodes: typeof orgJoinCodes;
  organizations: typeof organizations;
  rows: typeof rows;
  seed: typeof seed;
  shelves: typeof shelves;
  tenantAccess: typeof tenantAccess;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
