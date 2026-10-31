/** Lead qualification and conversion helpers. */
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Disqualified', 'Converted'];
export function qualifyLead(lead, updates = {}) {
  const next = { ...lead, ...updates };
  if (!next.name?.trim() || !next.company?.trim()) throw new Error('Lead name and company are required');
  return { ...next, status: 'Qualified', qualifiedAt: new Date().toISOString() };
}
export function convertLead(lead, accountId, contactId) {
  if (!lead || lead.status === 'Converted') throw new Error('Lead cannot be converted');
  if (!accountId) throw new Error('An account is required for conversion');
  return { ...lead, status: 'Converted', accountId, contactId: contactId || null, convertedAt: new Date().toISOString() };
}
