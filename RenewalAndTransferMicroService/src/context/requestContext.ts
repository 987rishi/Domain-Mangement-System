import { AsyncLocalStorage } from "async_hooks";

interface RequestContext {
  correlationId: string;
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
