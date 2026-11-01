import db from '../models/db';
import { InboundSignalPayload, InboundSignalSchema, AuditLogRecord } from '../models/signal.types';
import { evaluateAccountFit } from './scorer';
import { syncContactToHubSpot, HubSpotContactPayload } from './hubspotService';
import { executeWithRetry } from './retryService';
import { config } from '../config/env';
import crypto from 'crypto';

export interface ProcessingResult {
  correlationId: string;
  success: boolean;
  stage: string;
  message: string;
}

export async function processInboundPayload(rawPayload: unknown): Promise<ProcessingResult> {
  const correlationId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const validationResult = InboundSignalSchema.safeParse(rawPayload);
  
  if (!validationResult.success) {
    const errorMsg = JSON.stringify(validationResult.error.format());
    persistAuditLog({
      correlationId,
      entityDomain: 'unknown',
      processingStage: 'VALIDATED',
      status: 'ERROR',
      attemptCount: 1,
      payloadSnapshot: JSON.stringify(rawPayload),
      errorMessage: errorMsg,
      createdAt: timestamp,
    });
    return {
      correlationId,
      success: false,
      stage: 'VALIDATED',
      message: `Payload validation failed: ${errorMsg}`,
    };
  }

  const payload = validationResult.data;
  const domain = payload.company.domain;

  persistAuditLog({
    correlationId,
    entityDomain: domain,
    processingStage: 'VALIDATED',
    status: 'SUCCESS',
    attemptCount: 1,
    payloadSnapshot: JSON.stringify(payload),
    createdAt: timestamp,
  });

  const scoreResult = evaluateAccountFit(payload);

  if (scoreResult.recommendation === 'DISQUALIFIED') {
    persistAuditLog({
      correlationId,
      entityDomain: domain,
      processingStage: 'MATCHED',
      status: 'WARNING',
      attemptCount: 1,
      payloadSnapshot: JSON.stringify({ payload, scoreResult }),
      errorMessage: 'Account disqualified based on ICP scoring rules.',
      createdAt: timestamp,
    });
    return {
      correlationId,
      success: true,
      stage: 'MATCHED',
      message: 'Payload processed. Account disqualified by scoring engine.',
    };
  }

  const hsPayload: HubSpotContactPayload = {
    properties: {
      email: payload.contact.email,
      firstname: payload.contact.firstName,
      lastname: payload.contact.lastName,
      jobtitle: payload.contact.jobTitle,
      company: payload.company.companyName,
      domain: payload.company.domain,
    }
  };

  // Execute HubSpot sync wrapped with retry resilience (Max 3 attempts, 500ms initial backoff)
  const retryResult = await executeWithRetry(
    async () => {
      const res = await syncContactToHubSpot(hsPayload, config.hubspotAccessToken);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    3,
    500
  );

  if (!retryResult.success) {
    persistAuditLog({
      correlationId,
      entityDomain: domain,
      processingStage: 'SYNCED',
      status: 'ERROR',
      attemptCount: retryResult.attempts,
      payloadSnapshot: JSON.stringify({ payload, scoreResult }),
      errorMessage: `HubSpot Sync Failed after ${retryResult.attempts} attempts: ${retryResult.error?.message}`,
      createdAt: timestamp,
    });
    return {
      correlationId,
      success: false,
      stage: 'SYNCED',
      message: `HubSpot sync failed after ${retryResult.attempts} attempts: ${retryResult.error?.message}`,
    };
  }

  persistAuditLog({
    correlationId,
    entityDomain: domain,
    processingStage: 'SYNCED',
    status: 'SUCCESS',
    attemptCount: retryResult.attempts,
    payloadSnapshot: JSON.stringify({ payload, scoreResult, hsResponse: retryResult.data }),
    createdAt: timestamp,
  });

  return {
    correlationId,
    success: true,
    stage: 'SYNCED',
    message: `Payload synchronized with HubSpot in ${retryResult.attempts} attempt(s).`,
  };
}

function persistAuditLog(record: AuditLogRecord): void {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (correlationId, entityDomain, processingStage, status, attemptCount, payloadSnapshot, errorMessage, createdAt)
    VALUES (@correlationId, @entityDomain, @processingStage, @status, @attemptCount, @payloadSnapshot, @errorMessage, @createdAt)
  `);
  stmt.run({
    correlationId: record.correlationId,
    entityDomain: record.entityDomain,
    processingStage: record.processingStage,
    status: record.status,
    attemptCount: record.attemptCount,
    payloadSnapshot: record.payloadSnapshot,
    errorMessage: record.errorMessage || null,
    createdAt: record.createdAt,
  });
}