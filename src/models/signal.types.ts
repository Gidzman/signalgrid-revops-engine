import { z } from 'zod';

// Zod Schema for Incoming Enrichment & Signal Payload Validation
export const InboundSignalSchema = z.object({
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  source: z.enum(['clay_enrichment', 'webhook_simulator', 'manual_import']),
  company: z.object({
    companyName: z.string().min(1),
    domain: z.string().min(3), // e.g., "cloudscale.io"
    industry: z.string().optional(),
    employeeRange: z.string().optional(),
    country: z.string().optional(),
  }),
  contact: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    jobTitle: z.string(),
    seniority: z.string().optional(),
  }),
  signals: z.object({
    techSignals: z.array(z.string()).default([]),
    hiringSignals: z.boolean().default(false),
    intentScore: z.number().min(0).max(100).default(0),
  }),
});

export type InboundSignalPayload = z.infer<typeof InboundSignalSchema>;

// Audit Record Interface for SQLite Persistence
export interface AuditLogRecord {
  correlationId: string;
  entityDomain: string;
  processingStage: 'RECEIVED' | 'VALIDATED' | 'MATCHED' | 'SYNCED' | 'FAILED' | 'DEAD_LETTER';
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  attemptCount: number;
  payloadSnapshot: string; // JSON stringified payload
  errorMessage?: string;
  createdAt: string;
}