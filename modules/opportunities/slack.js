// Slack share (logged on the opportunity timeline).

// Slack share (records the share on the timeline)
function shareToSlack() {
  const o = cur();
  if (!o) return;
  logOpp(o.id, 'sync', `Deal shared to #deals in Slack by ${currentUser().name || 'user'}`);
  save();
  toast('Shared to #deals in Slack');
  render();
}
