export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  const imageCell = cells[0]; // contains the <picture>
  const textCell = cells[1]; // contains h1, p, CTA

  // Build background image layer
  const bgDiv = document.createElement('div');
  bgDiv.className = 'hero-bg';
  const picture = imageCell?.querySelector('picture');
  if (picture) {
    bgDiv.append(picture);
  }

  // Build content overlay
  const contentDiv = document.createElement('div');
  contentDiv.className = 'hero-content';

  const innerDiv = document.createElement('div');
  innerDiv.className = 'hero-content-inner';

  if (textCell) {
    // Move all children from text cell into inner content div
    while (textCell.firstChild) {
      innerDiv.append(textCell.firstChild);
    }
  }

  contentDiv.append(innerDiv);

  // Clear block and rebuild
  block.textContent = '';
  block.append(bgDiv, contentDiv);
}
