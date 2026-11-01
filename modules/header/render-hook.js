// Render wrapper that refreshes the header after each render.

const renderBeforeActions = render;
render = function () {
  renderBeforeActions();
  updateHeader();
};

// Ensure the first visible render uses the active portal and new navigation.
save();
// Later sections define more helpers; the final render() at the end of the file draws the page.
try {
  render();
} catch (e) {}
