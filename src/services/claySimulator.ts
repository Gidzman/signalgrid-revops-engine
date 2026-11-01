import { InboundSignalPayload } from '../models/signal.types';

export function generateSyntheticPayloads(): InboundSignalPayload[] {
  return [
    {
      eventId: '11111111-1111-4111-a111-111111111111',
      timestamp: new Date().toISOString(),
      source: 'clay_enrichment',
      company: {
        companyName: 'Apex Cloud Solutions',
        domain: 'apexcloud.io',
        industry: 'Software & Technology',
        employeeRange: '50-200',
        country: 'United States',
      },
      contact: {
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.jenkins@apexcloud.io',
        jobTitle: 'VP of Engineering',
        seniority: 'Executive',
      },
      signals: {
        techSignals: ['AWS', 'Kubernetes', 'Docker', 'Terraform'],
        hiringSignals: true,
        intentScore: 85,
      },
    },
    {
      eventId: '22222222-2222-4222-a222-222222222222',
      timestamp: new Date().toISOString(),
      source: 'clay_enrichment',
      company: {
        companyName: 'Micro DevTools Ltd',
        domain: 'microdevtools.com',
        industry: 'Developer Tools',
        employeeRange: '1-10',
        country: 'United Kingdom',
      },
      contact: {
        firstName: 'Alex',
        lastName: 'Russo',
        email: 'alex@microdevtools.com',
        jobTitle: 'Junior Developer',
        seniority: 'Individual Contributor',
      },
      signals: {
        techSignals: ['Heroku'],
        hiringSignals: false,
        intentScore: 20,
      },
    },
  ];
}