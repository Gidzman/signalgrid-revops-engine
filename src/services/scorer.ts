import { InboundSignalPayload } from '../models/signal.types';

export interface ScoreResult {
  fitScore: number; // 0 - 100
  signalConfidence: number; // 0 - 100
  scoringReasons: string[];
  recommendation: 'QUALIFIED' | 'NEEDS_REVIEW' | 'DISQUALIFIED';
}

export function evaluateAccountFit(payload: InboundSignalPayload): ScoreResult {
  let fitScore = 0;
  let signalConfidence = 50; // Baseline confidence
  const reasons: string[] = [];

  // 1. Employee Count Scoring (Target: 50 - 500)
  const empRange = payload.company.employeeRange || '';
  if (empRange.includes('50-200') || empRange.includes('201-500')) {
    fitScore += 30;
    reasons.push('Company size matches ideal mid-market profile (50-500).');
  } else if (empRange.includes('500+')) {
    fitScore += 15;
    reasons.push('Enterprise size (500+) - higher deal complexity.');
  } else {
    reasons.push('Company size outside primary target range.');
  }

  // 2. Tech Stack Signals (AWS, Kubernetes, Terraform)
  const techSignals = payload.signals.techSignals.map((s) => s.toLowerCase());
  if (techSignals.includes('kubernetes') || techSignals.includes('k8s')) {
    fitScore += 25;
    signalConfidence += 20;
    reasons.push('Verified Kubernetes tech signal (+25 fit, +20 confidence).');
  }
  if (techSignals.includes('aws')) {
    fitScore += 15;
    reasons.push('AWS cloud infrastructure verified (+15 fit).');
  }

  // 3. Hiring Signals
  if (payload.signals.hiringSignals) {
    fitScore += 15;
    signalConfidence += 10;
    reasons.push('Active hiring signals detected in DevOps/Engineering (+15 fit).');
  }

  // 4. Decision Maker Seniority
  const title = payload.contact.jobTitle.toLowerCase();
  if (title.includes('cto') || title.includes('vp') || title.includes('director') || title.includes('head')) {
    fitScore += 15;
    reasons.push('Target decision-maker contact seniority matched (+15 fit).');
  }

  fitScore = Math.min(fitScore, 100);
  signalConfidence = Math.min(signalConfidence, 100);

  let recommendation: 'QUALIFIED' | 'NEEDS_REVIEW' | 'DISQUALIFIED' = 'DISQUALIFIED';
  if (fitScore >= 60 && signalConfidence >= 60) {
    recommendation = 'QUALIFIED';
  } else if (fitScore >= 40) {
    recommendation = 'NEEDS_REVIEW';
  }

  return {
    fitScore,
    signalConfidence,
    scoringReasons: reasons,
    recommendation,
  };
}