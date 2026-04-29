export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  const imageCell = cells[0];
  const textCell = cells[1];

  if (imageCell) imageCell.classList.add('text-promo-image');
  if (textCell) textCell.classList.add('text-promo-text');
}
