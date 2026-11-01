import { initializeDatabase } from './models/db';
import { generateSyntheticPayloads } from './services/claySimulator';
import { processInboundPayload } from './services/integrationService';
import db from './models/db';

db.prepare('DELETE FROM audit_logs').run();
initializeDatabase();

async function runPipeline() {
  console.log('Executing integration pipeline and CRM synchronization...');
  const payloads = generateSyntheticPayloads();

  for (const payload of payloads) {
    const result = await processInboundPayload(payload);
    console.log(`[ID: ${result.correlationId.slice(0, 8)}...] Stage: ${result.stage} | Status: ${result.success ? 'SUCCESS' : 'FAILED'} | Message: ${result.message}`);
  }

  const logs = db.prepare('SELECT correlationId, entityDomain, processingStage, status FROM audit_logs').all();
  console.log('\nPersistent Audit Store Records:');
  logs.forEach((log: any) => {
    console.log(`Domain: ${log.entityDomain} | Stage: ${log.processingStage} | Status: ${log.status}`);
  });
}

runPipeline();