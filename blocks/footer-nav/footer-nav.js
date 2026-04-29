export default async function decorate(block) {
  // Footer nav is primarily CSS-driven, minimal JS needed
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      // Clean up any extra paragraph wrapping around images
      const pics = cell.querySelectorAll('picture');
      pics.forEach((pic) => {
        const parent = pic.parentElement;
        if (parent && parent.tagName === 'P' && parent.parentElement.tagName === 'P') {
          parent.parentElement.replaceWith(parent);
        }
      });
    });
  });
}
