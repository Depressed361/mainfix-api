import type { DirectoryQuery } from '../ports';

export class GetDirectoryBoundary {
  constructor(private readonly dq: DirectoryQuery) {}
  async execute(userId: string) {
    const meta = await this.dq.getUserMeta(userId);
    return meta;
  }
}

