/** Opportunity pipeline calculations and stage transitions. */
export const OPPORTUNITY_STAGES = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
export function validateOpportunity(item) {
  const errors = {};
  if (!item?.name?.trim()) errors.name = 'Opportunity name is required';
  if (!(Number(item?.amount) >= 0)) errors.amount = 'Amount must be zero or greater';
  if (!OPPORTUNITY_STAGES.includes(item?.stage)) errors.stage = 'Select a valid stage';
  return { valid: !Object.keys(errors).length, errors };
}
export function pipelineValue(items) { return items.filter((x) => !['Closed Won', 'Closed Lost'].includes(x.stage)).reduce((sum, x) => sum + Number(x.amount || 0), 0); }
export function weightedPipelineValue(items) { return items.reduce((sum, x) => sum + Number(x.amount || 0) * Number(x.probability || 0) / 100, 0); }
export function moveOpportunity(item, stage) {
  if (!OPPORTUNITY_STAGES.includes(stage)) throw new Error('Invalid opportunity stage');
  return { ...item, stage, probability: stage === 'Closed Won' ? 100 : stage === 'Closed Lost' ? 0 : Number(item.probability || 0), updatedAt: new Date().toISOString() };
}
