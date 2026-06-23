// UI translations for The One Journal.
//
// Only static chrome and admin-managed category names are translated here.
// Article bodies, news ticker headlines fetched from the DB, and job posts
// stay in whatever language the editor authored them in.
//
// Locale codes match the BCP-47 / DB `languages.code` values: en, ar, si, ta.

export const SUPPORTED_LOCALES = ['en', 'ar', 'si', 'ta'];
export const DEFAULT_LOCALE = 'en';
export const RTL_LOCALES = new Set(['ar']);

// Resolve which locale code to use for a given admin-defined language. The
// language's `code` is the source of truth (so category translations stored
// under that code apply directly). Falls back to a best-guess by name if the
// admin hasn't entered a code yet, then to English.
export function resolveLocale(language) {
  if (!language) return DEFAULT_LOCALE;
  const rawCode = (language.code || '').toLowerCase().trim();
  // Take the language part of BCP-47 codes ("en-US" → "en") so they line up
  // with the translation keys both admins and the bundled UI strings use.
  const code = rawCode.split(/[-_]/)[0];
  if (/^[a-z]{2,8}$/.test(code)) return code;
  const name = (language.name || '').trim().toLowerCase();
  if (name.includes('arab') || name === 'العربية') return 'ar';
  if (name.includes('sinhal') || name === 'සිංහල') return 'si';
  if (name.includes('tamil') || name === 'தமிழ்') return 'ta';
  if (name.includes('english')) return 'en';
  return DEFAULT_LOCALE;
}

// Category and sub-tag names live entirely in the DB. Each row carries a
// `translations` JSON map (e.g. {"ar":"دولي","si":"ජාත්‍යන්තර"}) which the
// admin edits per language. We look the active locale up in that map and fall
// back to the original `name` if no translation has been entered yet.
export function localizedName(entity, locale) {
  if (!entity) return '';
  const tr = entity.translations;
  if (tr && typeof tr === 'object' && locale && tr[locale]) {
    const val = String(tr[locale]).trim();
    if (val) return val;
  }
  return entity.name || '';
}

const STRINGS = {
  en: {
    'nav.foreignJobs': 'Foreign Jobs',
    'nav.advertise': 'Advertise With Us',
    'nav.partnerContent': 'Partner Content',
    'nav.displayBanner': 'Display Banner Ads',
    'nav.socialMedia': 'Social Media Promotion',
    'nav.addOnService': 'Add-On Service',
    'nav.ratesPricing': 'Rates & Pricing',
    'nav.searchPlaceholder': 'Search breaking news, lifestyle stories, or partner content...',
    'nav.clearClose': 'Clear & Close',
    'nav.home': 'Home',
    'nav.back': 'Go back',
    'nav.openMenu': 'Open Menu',
    'nav.closeMenu': 'Close Menu',
    'nav.searchToggle': 'Toggle Search',

    'ticker.breakingNews': 'Breaking News',

    'home.language': 'Language:',
    'home.trending': 'Trending',
    'home.viewAll': 'View All',
    'home.liveUpdates': 'Live Updates',
    'home.live': 'Live',
    'home.noLiveUpdates': 'No live updates at this moment.',
    'home.sponsored': 'Sponsored',
    'home.minRead': 'min read',
    'home.views': 'views',
    'home.totalViews': 'Total website views',

    'footer.otherSections': 'Other Sections',
    'footer.company': 'Company',
    'footer.aboutUs': 'About Us',
    'footer.careers': 'Careers',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.contactUs': 'Contact Us',
    'footer.advertise': 'Advertise With Us',
    'footer.meetTeam': 'Meet Our Team',
    'footer.disclaimer': 'Disclaimer',
    'footer.backToTop': 'Back to Top',
    'footer.siteMap': 'Site Map',
    'footer.rights': 'All rights reserved.',
    'footer.description': 'The One Journal is your premier source for breaking news, in-depth reports, business insights, technological developments, and global updates. We deliver accurate, timely, and trusted journalism directly to our readers.',
  },
  ar: {
    'nav.foreignJobs': 'وظائف في الخارج',
    'nav.advertise': 'أعلن معنا',
    'nav.partnerContent': 'محتوى الشركاء',
    'nav.displayBanner': 'إعلانات بانر',
    'nav.socialMedia': 'الترويج عبر وسائل التواصل',
    'nav.addOnService': 'خدمة إضافية',
    'nav.ratesPricing': 'الأسعار',
    'nav.searchPlaceholder': 'ابحث في الأخبار العاجلة، قصص نمط الحياة، أو محتوى الشركاء...',
    'nav.clearClose': 'مسح وإغلاق',
    'nav.home': 'الرئيسية',
    'nav.back': 'رجوع',
    'nav.openMenu': 'فتح القائمة',
    'nav.closeMenu': 'إغلاق القائمة',
    'nav.searchToggle': 'تبديل البحث',

    'ticker.breakingNews': 'أخبار عاجلة',

    'home.language': 'اللغة:',
    'home.trending': 'الأكثر رواجاً',
    'home.viewAll': 'عرض الكل',
    'home.liveUpdates': 'تحديثات مباشرة',
    'home.live': 'مباشر',
    'home.noLiveUpdates': 'لا توجد تحديثات مباشرة حالياً.',
    'home.sponsored': 'مُموَّل',
    'home.minRead': 'دقيقة قراءة',
    'home.views': 'مشاهدة',
    'home.totalViews': 'إجمالي مشاهدات الموقع',

    'footer.otherSections': 'أقسام أخرى',
    'footer.company': 'الشركة',
    'footer.aboutUs': 'من نحن',
    'footer.careers': 'وظائف',
    'footer.privacyPolicy': 'سياسة الخصوصية',
    'footer.terms': 'الشروط والأحكام',
    'footer.contactUs': 'اتصل بنا',
    'footer.advertise': 'أعلن معنا',
    'footer.meetTeam': 'تعرف على فريقنا',
    'footer.disclaimer': 'إخلاء المسؤولية',
    'footer.backToTop': 'العودة للأعلى',
    'footer.siteMap': 'خريطة الموقع',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.description': 'ذا ون جورنال هو مصدرك الأول للأخبار العاجلة والتقارير المعمقة ورؤى الأعمال والتطورات التكنولوجية والتحديثات العالمية. نقدم صحافة دقيقة وموثوقة وفي الوقت المناسب لقرائنا مباشرة.',
  },
  si: {
    'nav.foreignJobs': 'විදේශ රැකියා',
    'nav.advertise': 'අප සමඟ ප්‍රචාරණය',
    'nav.partnerContent': 'හවුල්කාර අන්තර්ගතය',
    'nav.displayBanner': 'බැනර් දැන්වීම්',
    'nav.socialMedia': 'සමාජ මාධ්‍ය ප්‍රවර්ධනය',
    'nav.addOnService': 'අමතර සේවාව',
    'nav.ratesPricing': 'මිල ගණන්',
    'nav.searchPlaceholder': 'හදිසි පුවත්, ජීවන රටා කථා හෝ හවුල්කාර අන්තර්ගත සොයන්න...',
    'nav.clearClose': 'හිස් කර වසන්න',
    'nav.home': 'මුල් පිටුව',
    'nav.back': 'ආපසු',
    'nav.openMenu': 'මෙනුව විවෘත කරන්න',
    'nav.closeMenu': 'මෙනුව වසන්න',
    'nav.searchToggle': 'සෙවුම',

    'ticker.breakingNews': 'හදිසි පුවත්',

    'home.language': 'භාෂාව:',
    'home.trending': 'ප්‍රවණතාවය',
    'home.viewAll': 'සියල්ල බලන්න',
    'home.liveUpdates': 'සජීවී යාවත්කාලීන',
    'home.live': 'සජීවී',
    'home.noLiveUpdates': 'මේ මොහොතේ සජීවී යාවත්කාලීන නොමැත.',
    'home.sponsored': 'අනුග්‍රහයෙන්',
    'home.minRead': 'මිනිත්තු කියවීම',
    'home.views': 'නැරඹුම්',
    'home.totalViews': 'වෙබ් අඩවියේ මුළු නැරඹුම්',

    'footer.otherSections': 'වෙනත් කොටස්',
    'footer.company': 'සමාගම',
    'footer.aboutUs': 'අප ගැන',
    'footer.careers': 'වෘත්තීන්',
    'footer.privacyPolicy': 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය',
    'footer.terms': 'නියම සහ කොන්දේසි',
    'footer.contactUs': 'අප හා සම්බන්ධ වන්න',
    'footer.advertise': 'අප සමඟ ප්‍රචාරණය',
    'footer.meetTeam': 'අපගේ කණ්ඩායම',
    'footer.disclaimer': 'වගකීමෙන් ඉවත්වීම',
    'footer.backToTop': 'ඉහළට යන්න',
    'footer.siteMap': 'වෙබ් අඩවි සිතියම',
    'footer.rights': 'සියලුම හිමිකම් ඇවිරිණි.',
    'footer.description': 'ද වන් ජර්නල් යනු හදිසි පුවත්, ගැඹුරු වාර්තා, ව්‍යාපාරික තීක්ෂ්ණතාවන්, තාක්ෂණික වර්ධනයන් සහ ගෝලීය යාවත්කාලීන සඳහා ඔබගේ ප්‍රමුඛතම ප්‍රභවයයි.',
  },
  ta: {
    'nav.foreignJobs': 'வெளிநாட்டு வேலைகள்',
    'nav.advertise': 'எங்களுடன் விளம்பரம்',
    'nav.partnerContent': 'கூட்டாளர் உள்ளடக்கம்',
    'nav.displayBanner': 'பேனர் விளம்பரங்கள்',
    'nav.socialMedia': 'சமூக ஊடக விளம்பரம்',
    'nav.addOnService': 'கூடுதல் சேவை',
    'nav.ratesPricing': 'விலை விவரம்',
    'nav.searchPlaceholder': 'முக்கிய செய்திகள், வாழ்க்கை முறை கதைகள் அல்லது கூட்டாளர் உள்ளடக்கத்தைத் தேடவும்...',
    'nav.clearClose': 'அழித்து மூடு',
    'nav.home': 'முகப்பு',
    'nav.back': 'பின்செல்',
    'nav.openMenu': 'பட்டியலைத் திற',
    'nav.closeMenu': 'பட்டியலை மூடு',
    'nav.searchToggle': 'தேடலை மாற்று',

    'ticker.breakingNews': 'முக்கிய செய்திகள்',

    'home.language': 'மொழி:',
    'home.trending': 'டிரெண்டிங்',
    'home.viewAll': 'அனைத்தையும் காண்க',
    'home.liveUpdates': 'நேரலை புதுப்பிப்புகள்',
    'home.live': 'நேரலை',
    'home.noLiveUpdates': 'இப்போதைக்கு நேரலை புதுப்பிப்புகள் இல்லை.',
    'home.sponsored': 'வழங்குநர்',
    'home.minRead': 'நிமிட வாசிப்பு',
    'home.views': 'பார்வைகள்',
    'home.totalViews': 'மொத்த வலைத்தள பார்வைகள்',

    'footer.otherSections': 'மற்ற பகுதிகள்',
    'footer.company': 'நிறுவனம்',
    'footer.aboutUs': 'எங்களைப் பற்றி',
    'footer.careers': 'வேலை வாய்ப்புகள்',
    'footer.privacyPolicy': 'தனியுரிமைக் கொள்கை',
    'footer.terms': 'விதிமுறைகள் & நிபந்தனைகள்',
    'footer.contactUs': 'தொடர்பு கொள்ள',
    'footer.advertise': 'எங்களுடன் விளம்பரம்',
    'footer.meetTeam': 'எங்கள் குழுவை சந்திக்கவும்',
    'footer.disclaimer': 'பொறுப்புத் துறப்பு',
    'footer.backToTop': 'மேலே செல்',
    'footer.siteMap': 'தள வரைபடம்',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    'footer.description': 'த ஒன் ஜர்னல் முக்கிய செய்திகள், ஆழமான அறிக்கைகள், வணிக பார்வைகள், தொழில்நுட்ப வளர்ச்சி மற்றும் உலகளாவிய புதுப்பிப்புகளுக்கான உங்கள் முதன்மை மூலமாகும்.',
  },
};

export function translate(locale, key) {
  const table = STRINGS[locale] || STRINGS[DEFAULT_LOCALE];
  return table[key] ?? STRINGS[DEFAULT_LOCALE][key] ?? key;
}

// BCP-47 codes the browser's Intl APIs understand for our locales.
const INTL_LOCALE = {
  en: 'en-US',
  ar: 'ar',
  si: 'si-LK',
  ta: 'ta-IN',
};
export function intlLocale(locale) {
  return INTL_LOCALE[locale] || INTL_LOCALE[DEFAULT_LOCALE];
}
