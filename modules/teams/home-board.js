// Leaderboard section injected into the home page.

const homeWithoutBoard = V.home;
V.home = () =>
  homeWithoutBoard().replace(
    '<div class="grid lg:grid-cols-2 gap-3"><div class="card p-4"><b>Top opportunities</b>',
    leaderboardSection() +
      '<div class="grid lg:grid-cols-2 gap-3"><div class="card p-4"><b>Top opportunities</b>'
  );

// ---------- quote defaults come from Settings ----------
