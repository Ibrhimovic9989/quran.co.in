// Persistence for developer API clients. Usage counting is throttled in memory
// so a busy key doesn't cause a DB write per request.

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Fields safe to return to the owner — never the hash or the plaintext key. */
const publicSelect = {
  id: true,
  name: true,
  keyPrefix: true,
  scopes: true,
  tier: true,
  revoked: true,
  requestCount: true,
  lastUsedAt: true,
  createdAt: true,
} as const;

@Injectable()
export class ApiKeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  // In-memory usage buffer: clientId -> requests since last flush.
  private readonly pending = new Map<string, number>();
  private readonly lastFlush = new Map<string, number>();
  private static readonly FLUSH_MS = 30_000;

  async create(input: { name: string; ownerId: string; hash: string; prefix: string }) {
    return this.prisma.apiClient.create({
      data: {
        name: input.name,
        ownerId: input.ownerId,
        keyHash: input.hash,
        keyPrefix: input.prefix,
      },
      select: publicSelect,
    });
  }

  /**
   * Full record (incl. revoked flag) for guard validation — keyed by hash.
   * Pulls the owner's Ask-access state so the Ask gate can authorize in one hop.
   */
  findByHash(hash: string) {
    return this.prisma.apiClient.findUnique({
      where: { keyHash: hash },
      include: { owner: { select: { askAccess: true } } },
    });
  }

  listByOwner(ownerId: string) {
    return this.prisma.apiClient.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      select: publicSelect,
    });
  }

  /** Revoke — scoped to the owner so one user can't revoke another's key. */
  async revoke(id: string, ownerId: string): Promise<boolean> {
    const res = await this.prisma.apiClient.updateMany({
      where: { id, ownerId },
      data: { revoked: true },
    });
    return res.count > 0;
  }

  /** Record a use; flushes to the DB at most once per client per FLUSH_MS. */
  recordUsage(id: string): void {
    this.pending.set(id, (this.pending.get(id) ?? 0) + 1);
    const now = Date.now();
    if (now - (this.lastFlush.get(id) ?? 0) < ApiKeyRepository.FLUSH_MS) return;
    this.lastFlush.set(id, now);
    const count = this.pending.get(id) ?? 0;
    this.pending.set(id, 0);
    if (count === 0) return;
    this.prisma.apiClient
      .update({ where: { id }, data: { requestCount: { increment: count }, lastUsedAt: new Date() } })
      .catch(() => {/* best-effort telemetry — never fail a request over it */});
  }
}
