import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('.nav-hamburger button')?.focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused?.classList.contains('nav-drop');
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    const sectionsEl = focused.closest('.nav-sections');
    if (sectionsEl) toggleAllNavSections(sectionsEl);
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  const collapseAll = expanded || isDesktop.matches ? 'false' : 'true';
  toggleAllNavSections(navSections, collapseAll);
  button?.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Find the top-level nav UL (not a nested sub-menu UL inside an LI).
 * @param {ParentNode} root
 * @returns {HTMLUListElement | null}
 */
function findMainNavUl(root) {
  const candidates = [...root.querySelectorAll('ul')];
  return candidates.find((ul) => !ul.closest('li')) ?? null;
}

/**
 * Utility strip paragraph: most links (pipe-separated row).
 * @param {ParentNode} root
 * @returns {HTMLParagraphElement | null}
 */
function findUtilityLinksParagraph(root) {
  const paragraphs = [...root.querySelectorAll('p')];
  const scored = paragraphs.map((p) => ({
    p,
    n: p.querySelectorAll('a').length,
  }));
  scored.sort((a, b) => b.n - a.n);
  return scored[0]?.n >= 4 ? scored[0].p : null;
}

function buildNavTools(linksP) {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';

  const leftLinks = document.createElement('div');
  leftLinks.className = 'nav-tools-left';
  const rightLinks = document.createElement('div');
  rightLinks.className = 'nav-tools-right';

  const allLinks = [...linksP.querySelectorAll('a')];
  let splitIndex = allLinks.findIndex((a) => a.textContent.trim() === 'Contact Us');
  if (splitIndex < 0) splitIndex = Math.min(4, allLinks.length);

  allLinks.forEach((a, i) => {
    const item = document.createElement('a');
    item.href = a.href;
    item.textContent = a.textContent;
    item.className = 'nav-tools-link';

    if (i < splitIndex) {
      leftLinks.append(item);
    } else {
      if (a.textContent.trim() === 'Login') {
        item.classList.add('nav-tools-login');
      }
      rightLinks.append(item);
    }
  });

  tools.append(leftLinks, rightLinks);
  return tools;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) {
    // eslint-disable-next-line no-console
    console.warn('Header: nav fragment could not be loaded:', navPath);
    return;
  }

  const logoPicture = fragment.querySelector('picture');
  const logoImg = fragment.querySelector('img[alt*="BT"], img[alt*="bt"], img[alt*="logo"]')
    || fragment.querySelector('.default-content-wrapper img');

  const linksP = findUtilityLinksParagraph(fragment);
  const mainUl = findMainNavUl(fragment);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  if (logoPicture) {
    const brandLink = document.createElement('a');
    brandLink.href = '/';
    brandLink.setAttribute('aria-label', 'Home');
    brandLink.append(logoPicture.cloneNode(true));
    navBrand.append(brandLink);
  } else if (logoImg) {
    const brandLink = document.createElement('a');
    brandLink.href = '/';
    brandLink.setAttribute('aria-label', 'Home');
    brandLink.append(logoImg.cloneNode(true));
    navBrand.append(brandLink);
  }

  const navTools = linksP ? buildNavTools(linksP) : document.createElement('div');
  if (!linksP) navTools.className = 'nav-tools';

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (mainUl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'default-content-wrapper';
    wrapper.append(mainUl.cloneNode(true));
    navSections.append(wrapper);
  }

  const navSearch = document.createElement('div');
  navSearch.className = 'nav-search';
  navSearch.innerHTML = '<button type="button" aria-label="Search"><span class="icon icon-search" aria-hidden="true"></span></button>';

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));

  nav.append(navTools, hamburger, navBrand, navSections, navSearch);
  decorateIcons(navSearch);
  nav.setAttribute('aria-expanded', 'false');

  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
