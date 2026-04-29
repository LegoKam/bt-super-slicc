import { decorateIcons, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop nav layout
const isDesktop = window.matchMedia('(min-width: 900px)');

/** @param {string} pathname */
function isPersonalSection(pathname) {
  return pathname === '/personal.html' || pathname.startsWith('/personal/');
}

/** @param {string} pathname */
function isSuperSection(pathname) {
  return pathname.includes('/superannuation');
}

/**
 * @param {HTMLAnchorElement} link
 * @param {string} pathname
 */
function applyUtilityActiveState(link, pathname) {
  const href = link.getAttribute('href') || '';
  if (href.includes('/personal.html') || href === '/personal.html') {
    if (isPersonalSection(pathname)) {
      link.classList.add('header-utility-link--active');
      link.setAttribute('aria-current', 'page');
    }
  }
}

/**
 * @param {HTMLAnchorElement} link
 * @param {string} pathname
 */
function applyMainNavHighlight(link, pathname) {
  const href = link.getAttribute('href') || '';
  if (isSuperSection(pathname) && href.includes('/superannuation')) {
    link.classList.add('header-main-link--current');
  }
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav?.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
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
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused?.classList.contains('nav-drop');
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    const sectionsEl = focused.closest('.nav-sections');
  if (sectionsEl) toggleAllNavSections(sectionsEl);
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.default-content-wrapper > ul > li').forEach((section) => {
    const val = expanded === true || expanded === 'true';
    section.setAttribute('aria-expanded', val ? 'true' : 'false');
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
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

function iconSpan(name) {
  const s = document.createElement('span');
  s.className = `icon icon-${name}`;
  s.setAttribute('aria-hidden', 'true');
  return s;
}

/**
 * @param {Element} block
 * @returns {boolean} Whether inline authored markup was found
 */
function decorateFromAuthoredMarkup(block) {
  const pictureEl = block.querySelector('picture');
  const brandP = pictureEl?.closest('p');
  const utilityP = [...block.querySelectorAll('p')].find((p) => p !== brandP && p.querySelector('a'));
  const mainNavUl = block.querySelector(':scope > div > ul') || block.querySelector(':scope > ul');

  if (!brandP || !utilityP || !mainNavUl) return false;

  const utilityLinks = [...utilityP.querySelectorAll('a')];
  if (utilityLinks.length < 5) return false;

  const pathname = window.location.pathname;
  const primaryLinks = utilityLinks.slice(0, 4);
  const contactLink = utilityLinks[4];
  const helpLink = utilityLinks[5];
  const loginLink = utilityLinks[6];

  const nav = document.createElement('nav');
  nav.id = 'nav';

  const utilityBar = document.createElement('div');
  utilityBar.className = 'header-utility-bar';
  const utilityInner = document.createElement('div');
  utilityInner.className = 'header-utility-inner';

  const ulPrimary = document.createElement('ul');
  ulPrimary.className = 'header-utility-primary';
  primaryLinks.forEach((a) => {
    const li = document.createElement('li');
    const clone = a.cloneNode(true);
    applyUtilityActiveState(clone, pathname);
    li.append(clone);
    ulPrimary.append(li);
  });

  const ulActions = document.createElement('ul');
  ulActions.className = 'header-utility-actions';

  const contactLi = document.createElement('li');
  const contactA = contactLink.cloneNode(true);
  contactA.prepend(iconSpan('contact'));
  contactLi.append(contactA);

  const helpLi = document.createElement('li');
  const helpA = helpLink.cloneNode(true);
  helpA.prepend(iconSpan('help'));
  helpLi.append(helpA);

  const loginLi = document.createElement('li');
  loginLi.className = 'header-utility-login';
  const loginA = loginLink.cloneNode(true);
  loginA.classList.add('header-login-btn');
  loginA.prepend(iconSpan('user'));
  loginLi.append(loginA);

  ulActions.append(contactLi, helpLi, loginLi);
  utilityInner.append(ulPrimary, ulActions);
  utilityBar.append(utilityInner);

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const logoLink = document.createElement('a');
  logoLink.className = 'header-logo-link';
  logoLink.href = '/index.html';
  logoLink.setAttribute('aria-label', 'BT Home');
  const picture = brandP.querySelector('picture');
  if (picture) logoLink.append(picture.cloneNode(true));
  brand.append(logoLink);

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  const defaultWrap = document.createElement('div');
  defaultWrap.className = 'default-content-wrapper';
  const navUl = mainNavUl.cloneNode(true);
  navUl.querySelectorAll('li > p > a').forEach((a) => {
    applyMainNavHighlight(a, pathname);
  });
  defaultWrap.append(navUl);
  navSections.append(defaultWrap);

  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
    if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
  });

  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.className = 'header-search-btn';
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.innerHTML = '<span class="icon icon-search" aria-hidden="true"></span>';
  tools.append(searchBtn);

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));

  nav.append(utilityBar, hamburger, brand, navSections, tools);

  block.textContent = '';
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  decorateIcons(block);

  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  if (navSections) {
    navSections.querySelectorAll('.nav-drop').forEach((navSection) => {
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  return true;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';

  if (!block.firstElementChild) {
    try {
      const fragment = await loadFragment(navPath);
      while (fragment.firstElementChild) block.append(fragment.firstElementChild);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Header nav fragment failed', err);
      return;
    }
  }

  if (decorateFromAuthoredMarkup(block)) {
    return;
  }

  const legacySections = [...block.children];
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  legacySections.forEach((el) => nav.append(el));

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
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

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
