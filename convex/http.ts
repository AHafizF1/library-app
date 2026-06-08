/**
 * HTTP router — mounts Better Auth routes on Convex.
 *
 * Two lines of wiring, zero caller-facing complexity.
 * All auth endpoints (sign-in, sign-up, session, etc.)
 * are handled automatically by the component.
 */
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { uploadImage, createBook, getOrg } from "./importApi";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({ path: "/importImage", method: "POST", handler: uploadImage });
http.route({ path: "/importBook", method: "POST", handler: createBook });
http.route({ path: "/getOrg", method: "GET", handler: getOrg });

export default http;
