import { AsyncLocalStorage } from 'async_hooks';

type ContextStore = { requestId?: string };

/**
 * Contexto por solicitud para propagar requestId a los logs.
 */
class RequestContext {
  private als = new AsyncLocalStorage<ContextStore>();

  run(requestId: string, callback: () => void) {
    this.als.run({ requestId }, callback);
  }

  getRequestId(): string | undefined {
    return this.als.getStore()?.requestId;
  }
}

export const requestContext = new RequestContext();
