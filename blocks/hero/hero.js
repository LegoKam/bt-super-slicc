export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cell = row.querySelector(':scope > div') || row;
  const picture = cell.querySelector('picture');

  // Build background image layer
  const bgDiv = document.createElement('div');
  bgDiv.className = 'hero-bg';
  if (picture) {
    const img = picture.querySelector('img');
    if (img) img.loading = 'eager';
    bgDiv.append(picture);
    const pictureParent = picture.closest('p');
    if (pictureParent && pictureParent.children.length === 0 && !pictureParent.textContent.trim()) {
      pictureParent.remove();
    }
  }

  // Build content overlay from remaining content
  const contentDiv = document.createElement('div');
  contentDiv.className = 'hero-content';
  const innerDiv = document.createElement('div');
  innerDiv.className = 'hero-content-inner';

  while (cell.firstChild) {
    innerDiv.append(cell.firstChild);
  }

  contentDiv.append(innerDiv);

  block.textContent = '';
  block.append(bgDiv, contentDiv);
}
