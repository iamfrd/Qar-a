import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const base = path.join(root, '.claude/skill-evolution');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const readLines = (name) => fs.existsSync(path.join(base, name))
  ? fs.readFileSync(path.join(base, name), 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
  : [];
const candidates = readJson('candidates.json').candidates;
const evaluations = readLines('evaluations.jsonl');
const pilots = readLines('pilots.jsonl');
const feedback = readLines('feedback-history.jsonl');
const frontier = readJson('frontier.json');
const review = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  activeCandidates: [],
  blockedPromotions: [],
  staleCandidates: [],
  provenSkills: [],
  rejectedCandidates: [],
  frontier: frontier.capabilities ?? {}
};
for (const candidate of candidates) {
  const candidateEvaluations = evaluations.filter((item) => item.candidateId === candidate.candidateId);
  const candidatePilots = pilots.filter((item) => item.candidateId === candidate.candidateId);
  const candidateFeedback = feedback.filter((item) => item.candidateId === candidate.candidateId);
  const row = {
    candidateId: candidate.candidateId,
    targetName: candidate.targetName,
    status: candidate.status,
    evaluations: candidateEvaluations.length,
    pilots: candidatePilots.length,
    feedback: candidateFeedback.length
  };
  if (['CANDIDATE', 'BENCHMARKING', 'PILOT'].includes(candidate.status)) review.activeCandidates.push(row);
  if (candidate.status === 'PROVEN') review.provenSkills.push(row);
  if (candidate.status === 'REJECTED') review.rejectedCandidates.push(row);
  if (candidate.status === 'CANDIDATE' && candidateEvaluations.length === 0) review.blockedPromotions.push({ ...row, reason: 'Missing independent evaluation' });
  if (candidate.status === 'BENCHMARKING' && !candidateEvaluations.some((item) => item.recommendation === 'ADVANCE_TO_PILOT')) review.blockedPromotions.push({ ...row, reason: 'No evaluation has advanced the candidate to pilot' });
  if (candidate.status === 'PILOT' && !candidatePilots.some((item) => item.outcome === 'KEEP')) review.blockedPromotions.push({ ...row, reason: 'Successful three-task pilot not recorded' });
}
fs.writeFileSync(path.join(base, 'review.json'), JSON.stringify(review, null, 2) + '\n');
console.log(`Skill evolution: ${review.activeCandidates.length} active, ${review.provenSkills.length} proven, ${review.rejectedCandidates.length} rejected, ${review.blockedPromotions.length} blocked.`);
