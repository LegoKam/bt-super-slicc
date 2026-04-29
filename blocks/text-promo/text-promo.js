export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cell = row.querySelector(':scope > div') || row;
  const picture = cell.querySelector('picture');

  const imageDiv = document.createElement('div');
  imageDiv.className = 'text-promo-image';
  if (picture) {
    const pictureParent = picture.parentElement;
    imageDiv.append(picture);
    if (pictureParent?.tagName === 'P' && !pictureParent.children.length && !pictureParent.textContent.trim()) {
      pictureParent.remove();
    }
  }

  const textDiv = document.createElement('div');
  textDiv.className = 'text-promo-text';
  while (cell.firstChild) {
    textDiv.append(cell.firstChild);
  }

  block.textContent = '';
  block.append(imageDiv, textDiv);
}
