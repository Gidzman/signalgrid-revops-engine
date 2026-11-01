import express from 'express';
import db from './models/db';
import { config } from './config/env';

const app = express();
app.use(express.json());

app.get('/api/metrics', (req, res) => {
  try {
    const totalProcessed = db.prepare('SELECT COUNT(DISTINCT correlationId) as count FROM audit_logs').get() as { count: number };
    const successSyncs = db.prepare("SELECT COUNT(*) as count FROM audit_logs WHERE processingStage = 'SYNCED' AND status = 'SUCCESS'").get() as { count: number };
    const failedSyncs = db.prepare("SELECT COUNT(*) as count FROM audit_logs WHERE processingStage = 'SYNCED' AND status = 'ERROR'").get() as { count: number };
    const disqualified = db.prepare("SELECT COUNT(*) as count FROM audit_logs WHERE processingStage = 'MATCHED' AND status = 'WARNING'").get() as { count: number };
    
    const recentLogs = db.prepare('SELECT correlationId, entityDomain, processingStage, status, attemptCount, errorMessage, createdAt FROM audit_logs ORDER BY id DESC LIMIT 10').all();

    const syncSuccessRate = totalProcessed.count > 0 ? (successSyncs.count / totalProcessed.count) * 100 : 0;

    res.json({
      system: 'SignalGrid GTM Intelligence Engine',
      metrics: {
        totalRecordsProcessed: totalProcessed.count,
        successfulSynchronizations: successSyncs.count,
        failedSynchronizations: failedSyncs.count,
        disqualifiedAccounts: disqualified.count,
        synchronizationSuccessRate: `${syncSuccessRate.toFixed(2)}%`,
      },
      recentAuditLogs: recentLogs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(config.port, () => {
  console.log(`SignalGrid monitoring server active on port ${config.port}`);
});