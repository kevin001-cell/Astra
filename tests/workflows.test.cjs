const test = require('node:test');
const assert = require('node:assert/strict');
const { createWorkflow, normalizeWorkflowAction } = require('../src/workflows.cjs');

test('workflows only keep declarative allowlist actions', () => {
  assert.equal(normalizeWorkflowAction({ type: 'shell', command: 'calc' }), null);
  const result = createWorkflow({}, { name: '开始工作', actions: [{ type: 'open-tool', id: 'calculator' }, { type: 'set-volume', value: 30 }] }, 'wf1', 1);
  assert.equal(result.workflow.actions.length, 2);
});
