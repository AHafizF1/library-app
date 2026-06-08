/**
 * HTTP router — mounts Better Auth routes on Convex.
 *
 * Two lines of wiring, zero caller-facing complexity.
 * All auth endpoints (sign-in, sign-up, session, etc.)
 * are handled automatically by the component.
 */
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

export default http;
