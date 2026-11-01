import { evaluateAccountFit } from '../src/services/scorer';
import { InboundSignalPayload } from '../src/models/signal.types';

describe('Account ICP Scoring Engine', () => {
  it('should qualify a high-fit mid-market enterprise account with Kubernetes and AWS', () => {
    const payload: InboundSignalPayload = {
      eventId: '11111111-1111-4111-a111-111111111111',
      timestamp: new Date().toISOString(),
      source: 'clay_enrichment',
      company: {
        companyName: 'Test Corp',
        domain: 'testcorp.io',
        industry: 'Software',
        employeeRange: '50-200',
        country: 'United States',
      },
      contact: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@testcorp.io',
        jobTitle: 'VP of Engineering',
        seniority: 'Executive',
      },
      signals: {
        techSignals: ['AWS', 'Kubernetes'],
        hiringSignals: true,
        intentScore: 90,
      },
    };

    const result = evaluateAccountFit(payload);
    expect(result.fitScore).toBeGreaterThanOrEqual(60);
    expect(result.signalConfidence).toBeGreaterThanOrEqual(60);
    expect(result.recommendation).toBe('QUALIFIED');
  });

  it('should disqualify a small company outside the target employee range', () => {
    const payload: InboundSignalPayload = {
      eventId: '22222222-2222-4222-a222-222222222222',
      timestamp: new Date().toISOString(),
      source: 'clay_enrichment',
      company: {
        companyName: 'Small Shop',
        domain: 'smallshop.com',
        industry: 'Consulting',
        employeeRange: '1-10',
        country: 'Nigeria',
      },
      contact: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@smallshop.com',
        jobTitle: 'Developer',
        seniority: 'Individual Contributor',
      },
      signals: {
        techSignals: ['Heroku'],
        hiringSignals: false,
        intentScore: 10,
      },
    };

    const result = evaluateAccountFit(payload);
    expect(result.recommendation).toBe('DISQUALIFIED');
  });
});