import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');

  const contentWrapper = fragment.querySelector('.default-content-wrapper');
  if (!contentWrapper) return;

  const children = [...contentWrapper.children];

  // Top row: logo + social icons
  const topRow = document.createElement('div');
  topRow.className = 'footer-top';

  const logoContainer = document.createElement('div');
  logoContainer.className = 'footer-logo';

  const socialContainer = document.createElement('div');
  socialContainer.className = 'footer-social';

  // Nav links rows
  const navContainer = document.createElement('div');
  navContainer.className = 'footer-nav';

  // Disclaimer
  const disclaimerContainer = document.createElement('div');
  disclaimerContainer.className = 'footer-disclaimer';

  children.forEach((el) => {
    if (el.tagName === 'P' && el.querySelector('picture')) {
      const img = el.querySelector('img');
      if (img && img.alt && img.alt.includes('logo')) {
        logoContainer.append(el);
      } else {
        socialContainer.append(el);
      }
    } else if (el.tagName === 'UL') {
      navContainer.append(el);
    } else if (el.tagName === 'P') {
      disclaimerContainer.append(el);
    }
  });

  topRow.append(logoContainer, socialContainer);
  footer.append(topRow, navContainer, disclaimerContainer);
  block.append(footer);
}
