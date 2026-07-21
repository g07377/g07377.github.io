const translations = window.siteTranslations || {};
const DEFAULT_LOCALE = 'en';
const LANGUAGE_STORAGE_KEY = 'natural-intelligence-studio-language';

const matchSupportedLocale = (languageTag) => {
  if (!languageTag) {
    return null;
  }

  const normalized = String(languageTag).trim().toLowerCase().replace(/_/g, '-');
  const baseLanguage = normalized.split('-')[0];

  if (baseLanguage === 'en') {
    return 'en';
  }

  if (baseLanguage === 'ja') {
    return 'ja';
  }

  if (baseLanguage === 'ko') {
    return 'ko';
  }

  const isTraditionalChinese = normalized === 'zh-hant'
    || normalized.startsWith('zh-hant-')
    || /^zh-(tw|hk|mo)(-|$)/.test(normalized);

  return isTraditionalChinese ? 'zh-Hant' : null;
};

const detectDeviceLocale = () => {
  const preferredLanguages = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language];

  for (const languageTag of preferredLanguages) {
    const locale = matchSupportedLocale(languageTag);
    if (locale && translations[locale]) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
};

const getStoredLanguage = () => {
  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage && translations[storedLanguage] ? storedLanguage : null;
  } catch (_error) {
    return null;
  }
};

const storeLanguage = (locale) => {
  try {
    if (locale) {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } else {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    }
  } catch (_error) {
    // The page still works when browser privacy settings disable local storage.
  }
};

const getTranslation = (locale, key) => {
  return translations[locale]?.strings?.[key]
    ?? translations[DEFAULT_LOCALE]?.strings?.[key]
    ?? null;
};

const updateStructuredData = (locale) => {
  const structuredDataTarget = document.getElementById('structured-data');
  const description = getTranslation(locale, 'meta.schemaDescription');

  if (!structuredDataTarget || !description) {
    return;
  }

  try {
    const structuredData = JSON.parse(structuredDataTarget.textContent);
    structuredData.description = description;
    structuredDataTarget.textContent = JSON.stringify(structuredData);
  } catch (_error) {
    // Keep the valid English fallback if the structured data cannot be updated.
  }
};

const applyLocale = (requestedLocale) => {
  const locale = translations[requestedLocale] ? requestedLocale : DEFAULT_LOCALE;
  const localeConfig = translations[locale] || translations[DEFAULT_LOCALE];

  if (!localeConfig) {
    return DEFAULT_LOCALE;
  }

  document.documentElement.lang = localeConfig.lang;
  document.documentElement.dataset.locale = locale;

  document.querySelectorAll('[data-i18n]').forEach((target) => {
    const value = getTranslation(locale, target.dataset.i18n);
    if (value === null) {
      return;
    }

    const attributeName = target.dataset.i18nAttr;
    if (attributeName) {
      target.setAttribute(attributeName, value);
    } else {
      target.textContent = value;
    }
  });

  const openGraphLocale = document.querySelector('[data-og-locale]');
  if (openGraphLocale) {
    openGraphLocale.setAttribute('content', localeConfig.ogLocale);
  }

  updateStructuredData(locale);
  return locale;
};

const languageSelect = document.querySelector('[data-language-select]');
const storedLanguage = getStoredLanguage();
applyLocale(storedLanguage || detectDeviceLocale());

if (languageSelect) {
  languageSelect.value = storedLanguage || 'auto';
  languageSelect.addEventListener('change', () => {
    const selectedLanguage = languageSelect.value;

    if (selectedLanguage === 'auto') {
      storeLanguage(null);
      applyLocale(detectDeviceLocale());
      return;
    }

    storeLanguage(selectedLanguage);
    applyLocale(selectedLanguage);
  });
}

window.addEventListener('languagechange', () => {
  if (!getStoredLanguage()) {
    applyLocale(detectDeviceLocale());
  }
});

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
