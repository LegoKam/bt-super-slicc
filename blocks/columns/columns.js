export default async function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      // No structural changes needed — EDS renders the two cells
      // as the two columns, styled via CSS flex.
      cell.classList.add('columns-col');
    });
  });
}
