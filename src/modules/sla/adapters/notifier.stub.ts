import type { Notifier } from '../domain/ports';

export class NoopNotifier implements Notifier { async notifyBreach(): Promise<void> { /* noop */ } }

