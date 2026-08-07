import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const resolve = (p) => path.resolve(root, p);
const readl = (p) => {
  const file = resolve(p);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
};

const research = readl('.claude/evolution/research.jsonl');
const proposals = readl('.claude/evolution/proposals.jsonl');
const changes = readl('.claude/evolution/changes.jsonl');
const reviews = readl('.claude/evolution/reviews.jsonl');
const pilots = readl('.claude/evolution/pilots.jsonl');

const output = {
  generatedAt: new Date().toISOString(),
  openResearch: [],
  awaitingApproval: [],
  awaitingReview: [],
  pilots: [],
  promotionCandidates: [],
  blocked: []
};

for (const item of research) {
  const relatedProposals = proposals.filter((proposal) => proposal.researchId === item.researchId);
  if (relatedProposals.length === 0) {
    output.openResearch.push({
      researchId: item.researchId,
      problem: item.problem,
      recommendation: item.recommendation
    });
  }
}

for (const proposal of proposals) {
  if (proposal.status === 'draft') {
    output.awaitingApproval.push({
      proposalId: proposal.proposalId,
      researchId: proposal.researchId,
      targetType: proposal.targetType,
      changeSummary: proposal.changeSummary
    });
    continue;
  }

  if (proposal.status !== 'approved') continue;

  const relatedChanges = changes.filter((change) => change.proposalId === proposal.proposalId);
  if (relatedChanges.length === 0) {
    output.blocked.push({
      proposalId: proposal.proposalId,
      reason: 'approved-proposal-not-implemented'
    });
    continue;
  }

  for (const change of relatedChanges) {
    const relatedReviews = reviews.filter((review) => review.changeId === change.changeId);
    if (relatedReviews.length === 0) {
      output.awaitingReview.push({
        proposalId: proposal.proposalId,
        changeId: change.changeId
      });
      continue;
    }

    const approvedForPilot = relatedReviews.some((review) => review.verdict === 'APPROVE_FOR_PILOT');
    if (!approvedForPilot) continue;

    const relatedPilots = pilots.filter((pilot) => pilot.changeId === change.changeId);
    if (relatedPilots.length === 0) {
      output.pilots.push({
        proposalId: proposal.proposalId,
        changeId: change.changeId,
        status: 'NOT_STARTED'
      });
      continue;
    }

    for (const pilot of relatedPilots) {
      output.pilots.push({
        proposalId: proposal.proposalId,
        changeId: change.changeId,
        outcome: pilot.outcome,
        taskCount: pilot.taskIds?.length ?? 0
      });
      if (pilot.outcome === 'KEEP') {
        output.promotionCandidates.push({
          proposalId: proposal.proposalId,
          changeId: change.changeId,
          approvedBy: pilot.approvedBy ?? null
        });
      }
    }
  }
}

fs.writeFileSync(resolve('.claude/evolution/review.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Evolution review: ${output.openResearch.length} open research, ${output.awaitingApproval.length} awaiting approval, ${output.awaitingReview.length} awaiting review, ${output.pilots.length} pilot record(s).`);
