import type { DirectoryCommand } from '../domain/ports';

export class DirectoryCommandStub implements DirectoryCommand {
  async createVendorTeam(p: { companyId: string; name: string; active?: boolean }): Promise<{ teamId: string }> {
    // Stub: generate a fake id; integration should override with real directory command
    return { teamId: `team-${Math.random().toString(36).slice(2, 10)}` };
  }
  async addTeamMembers(_p: { teamId: string; userIds: string[] }): Promise<void> {
    // no-op stub
  }
  async setTeamTypeVendor(_teamId: string): Promise<void> {
    // no-op stub
  }
}

