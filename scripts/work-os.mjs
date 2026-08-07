import process from 'node:process';
import {
  addComment,
  addSubtask,
  archiveTask,
  blockSubtask,
  createTask,
  fail,
  getAgentQueue,
  publicState,
  readState,
  refreshState,
  reviewSubtask,
  setDecision,
  startSubtask,
  submitSubtask,
  summarizeState,
  unblockSubtask,
  validateWorkOs
} from './work-os-core.mjs';

function parseArgs(tokens) {
  const positionals = [];
  const flags = {};
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = tokens[i + 1];
    if (next === undefined || next.startsWith('--')) {
      flags[key] = true;
      continue;
    }
    if (flags[key] === undefined) flags[key] = next;
    else if (Array.isArray(flags[key])) flags[key].push(next);
    else flags[key] = [flags[key], next];
    i += 1;
  }
  return { positionals, flags };
}

const list = (value) => value === undefined ? [] : Array.isArray(value) ? value : String(value).split(',').map((item) => item.trim()).filter(Boolean);
const bool = (value) => value === true || String(value).toLowerCase() === 'true';

function criteriaFromFlags(flags) {
  const values = list(flags.accept);
  return values.map((value) => {
    const [text, evidenceExpectation] = String(value).split('::');
    return { text: text.trim(), evidenceExpectation: (evidenceExpectation || '').trim() };
  });
}

function evidenceFromFlags(flags) {
  const output = {};
  for (const value of list(flags.evidence)) {
    const index = String(value).indexOf('::');
    if (index < 1) fail('Each --evidence must use REQ-N::evidence reference');
    const requirementId = String(value).slice(0, index).trim();
    const reference = String(value).slice(index + 2).trim();
    if (!output[requirementId]) output[requirementId] = [];
    output[requirementId].push(reference);
  }
  return output;
}

function dimensions(flags) {
  return {
    correctness: Number(flags.correctness),
    verification: Number(flags.verification),
    scopeAdherence: Number(flags.scope),
    safety: Number(flags.safety),
    collaboration: Number(flags.collaboration),
    clarity: Number(flags.clarity)
  };
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function usage() {
  console.log(`Qarğa Work OS CLI

Commands:
  create-task --title <text> [--description <text>] [--type feature] [--priority medium] [--team <name>] [--sprint <name>] [--label <value>] [--due YYYY-MM-DD]
  add-subtask <taskId> --title <text> --agent <agent> --reviewer <agent|project-owner> --points <1-10> --accept "criterion::evidence expectation" [--depends <subtaskId>] [--allow <glob>] [--forbid <glob>] [--gate <text>] [--collaborator <agent>]
  start <taskId> <subtaskId> --agent <agent>
  submit <taskId> <subtaskId> --agent <agent> --summary <text> --evidence "REQ-1::reference" [--evidence "REQ-2::reference"]
  block <taskId> <subtaskId> --actor <agent> --reason <text>
  unblock <taskId> <subtaskId> --actor <coordinator|reviewer>
  review <taskId> <subtaskId> --reviewer <agent> --outcome <accepted|rework|partial|rejected> [quality dimension flags]
  comment <taskId> --author <agent|project-owner> --text <text> [--kind comment|blocker|decision|system]
  decision-open <taskId> --summary <text> [--option <text>]
  decision-resolve <taskId> --summary <text> [--decision-id DEC-123]
  archive <taskId>
  next <agent>
  summary
  validate
  refresh
  state

Review quality flags for accepted/partial/rejected:
  --correctness 0-100 --verification 0-100 --scope 0-100 --safety 0-100 --collaboration 0-100 --clarity 0-100
  [--strength <text>] [--improve <text>] [--notes <text>] [--remaining-risk <text>]
`);
}

const [command, ...raw] = process.argv.slice(2);
const { positionals, flags } = parseArgs(raw);

try {
  switch (command) {
    case 'create-task':
      print(createTask({
        title: flags.title,
        description: flags.description,
        type: flags.type || 'feature',
        priority: flags.priority || 'medium',
        team: flags.team,
        sprint: flags.sprint,
        labels: list(flags.label),
        dueDate: flags.due,
        decisionRequired: bool(flags['needs-decision']),
        decisionSummary: flags['decision-summary'],
        decisionOptions: list(flags.option),
        actor: flags.actor || 'qarga-coordinator'
      }));
      break;
    case 'add-subtask': {
      const [taskId] = positionals;
      if (!taskId) fail('taskId is required');
      print(addSubtask(taskId, {
        title: flags.title,
        description: flags.description,
        assignedAgent: flags.agent,
        reviewerAgent: flags.reviewer,
        basePoints: Number(flags.points),
        collaborators: list(flags.collaborator),
        dependencies: list(flags.depends),
        acceptanceCriteria: criteriaFromFlags(flags),
        allowedFiles: list(flags.allow),
        forbiddenFiles: list(flags.forbid),
        approvalGates: list(flags.gate),
        dueDate: flags.due,
        actor: flags.actor || 'qarga-coordinator'
      }));
      break;
    }
    case 'start': {
      const [taskId, subtaskId] = positionals;
      print(startSubtask(taskId, subtaskId, flags.agent));
      break;
    }
    case 'submit': {
      const [taskId, subtaskId] = positionals;
      print(submitSubtask(taskId, subtaskId, {
        actor: flags.agent,
        summary: flags.summary,
        evidenceByRequirement: evidenceFromFlags(flags)
      }));
      break;
    }
    case 'block': {
      const [taskId, subtaskId] = positionals;
      print(blockSubtask(taskId, subtaskId, { actor: flags.actor, reason: flags.reason }));
      break;
    }
    case 'unblock': {
      const [taskId, subtaskId] = positionals;
      print(unblockSubtask(taskId, subtaskId, { actor: flags.actor }));
      break;
    }
    case 'review': {
      const [taskId, subtaskId] = positionals;
      print(reviewSubtask(taskId, subtaskId, {
        reviewer: flags.reviewer,
        outcome: flags.outcome,
        dimensions: dimensions(flags),
        strengths: list(flags.strength),
        improvementAreas: list(flags.improve),
        notes: flags.notes,
        remainingRisk: flags['remaining-risk']
      }));
      break;
    }
    case 'comment': {
      const [taskId] = positionals;
      print(addComment(taskId, { author: flags.author, text: flags.text, kind: flags.kind || 'comment' }));
      break;
    }
    case 'decision-open': {
      const [taskId] = positionals;
      print(setDecision(taskId, { actor: 'qarga-coordinator', summary: flags.summary, options: list(flags.option), resolve: false }));
      break;
    }
    case 'decision-resolve': {
      const [taskId] = positionals;
      print(setDecision(taskId, { actor: 'project-owner', summary: flags.summary, decisionId: flags['decision-id'], resolve: true }));
      break;
    }
    case 'archive': {
      const [taskId] = positionals;
      print(archiveTask(taskId));
      break;
    }
    case 'next': {
      const [agent] = positionals;
      print(getAgentQueue(agent));
      break;
    }
    case 'summary':
      print(summarizeState());
      break;
    case 'validate': {
      const result = validateWorkOs();
      for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
      for (const error of result.errors) console.error(`ERROR: ${error}`);
      if (result.errors.length) process.exit(1);
      console.log(`Work OS valid: ${readState().tasks.length} task(s), ${result.warnings.length} warning(s).`);
      break;
    }
    case 'refresh':
      print(refreshState());
      break;
    case 'state':
      print(publicState());
      break;
    case undefined:
    case 'help':
    case '--help':
      usage();
      break;
    default:
      fail(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(`Work OS command failed: ${error.message}`);
  process.exit(1);
}
