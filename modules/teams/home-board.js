// Leaderboard section injected into the home page.

const homeWithoutBoard = V.home;
V.home = () =>
  homeWithoutBoard().replace(
    '<!--dash-board-->',
    `<div class="mb-3">${leaderboardSection()}</div>`
  );

// ---------- quote defaults come from Settings ----------
