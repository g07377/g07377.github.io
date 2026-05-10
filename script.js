const yearTarget = document.querySelector('[data-year]');
if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const setActiveLink = () => {
  let current = null;
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= 120) {
      current = section;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('is-active', current && link.getAttribute('href') === `#${current.id}`);
  });
};

setActiveLink();
window.addEventListener('scroll', setActiveLink, { passive: true });