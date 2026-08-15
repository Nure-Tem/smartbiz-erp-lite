export type Language = 'en' | 'am' | 'om';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromoo' },
];

export type TranslationKey =
  | 'nav.dashboard'
  | 'nav.products'
  | 'nav.categories'
  | 'nav.customers'
  | 'nav.sales'
  | 'nav.inventory'
  | 'nav.reports'
  | 'nav.settings'
  | 'nav.workspace'
  | 'nav.logout'
  | 'nav.signOut'
  | 'nav.signingOut'
  | 'nav.openNav'
  | 'nav.openAccount'
  | 'nav.loading'
  | 'nav.profileUnavailable'
  | 'nav.checkingSession'
  | 'nav.unableLoadProfile'
  | 'brand.liteEdition'
  | 'brand.businessWorkspace'
  | 'common.save'
  | 'common.cancel'
  | 'common.edit'
  | 'common.delete'
  | 'common.search'
  | 'common.saving'
  | 'common.name'
  | 'common.phone'
  | 'common.email'
  | 'common.address'
  | 'common.quantity'
  | 'common.total'
  | 'common.all'
  | 'common.retry'
  | 'common.noEmail'
  | 'auth.signIn'
  | 'auth.signingIn'
  | 'auth.register'
  | 'auth.forgotPassword'
  | 'auth.password'
  | 'auth.email'
  | 'auth.noAccount'
  | 'auth.createOne'
  | 'auth.welcomeBack'
  | 'auth.signInFailed'
  | 'auth.signInSubtitle'
  | 'auth.heroTitle'
  | 'auth.heroSubtitle'
  | 'auth.copyright'
  | 'payment.method'
  | 'payment.allMethods'
  | 'payment.cash'
  | 'payment.bank'
  | 'payment.credit'
  | 'payment.telebirr'
  | 'payment.ebirr'
  | 'sales.title'
  | 'sales.description'
  | 'sales.addSale'
  | 'sales.newSale'
  | 'sales.newSaleDesc'
  | 'sales.customer'
  | 'sales.walkIn'
  | 'sales.selectCustomer'
  | 'sales.selectPayment'
  | 'sales.lineItems'
  | 'sales.addItem'
  | 'sales.selectProduct'
  | 'sales.saveSale'
  | 'sales.recorded'
  | 'sales.noSales'
  | 'sales.noSalesDesc'
  | 'sales.searchPlaceholder'
  | 'sales.invoice'
  | 'sales.date'
  | 'sales.partialInventory'
  | 'customers.title'
  | 'customers.description'
  | 'customers.new'
  | 'customers.edit'
  | 'customers.save'
  | 'customers.created'
  | 'customers.updated'
  | 'customers.deleted'
  | 'customers.creditBalance'
  | 'customers.creditDesc'
  | 'customers.tin'
  | 'customers.noCustomers'
  | 'customers.noCustomersDesc'
  | 'customers.searchPlaceholder'
  | 'customers.deleteTitle'
  | 'customers.deleteDesc'
  | 'stock.out'
  | 'stock.low'
  | 'stock.inStock'
  | 'language.label';

type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  'nav.dashboard': 'Dashboard',
  'nav.products': 'Products',
  'nav.categories': 'Categories',
  'nav.customers': 'Customers',
  'nav.sales': 'Sales',
  'nav.inventory': 'Inventory',
  'nav.reports': 'Reports',
  'nav.settings': 'Settings',
  'nav.workspace': 'Workspace',
  'nav.logout': 'Sign out',
  'nav.signOut': 'Sign out',
  'nav.signingOut': 'Signing out...',
  'nav.openNav': 'Open navigation',
  'nav.openAccount': 'Open account menu',
  'nav.loading': 'Loading...',
  'nav.profileUnavailable': 'Profile unavailable',
  'nav.checkingSession': 'Checking session...',
  'nav.unableLoadProfile': 'Unable to load profile',
  'brand.liteEdition': 'Lite edition',
  'brand.businessWorkspace': 'Business workspace',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.search': 'Search',
  'common.saving': 'Saving...',
  'common.name': 'Name',
  'common.phone': 'Phone',
  'common.email': 'Email',
  'common.address': 'Address',
  'common.quantity': 'Quantity',
  'common.total': 'Total',
  'common.all': 'All',
  'common.retry': 'Retry',
  'common.noEmail': 'No email',
  'auth.signIn': 'Sign in',
  'auth.signingIn': 'Signing in...',
  'auth.register': 'Register',
  'auth.forgotPassword': 'Forgot password?',
  'auth.password': 'Password',
  'auth.email': 'Email',
  'auth.noAccount': 'No account?',
  'auth.createOne': 'Create one',
  'auth.welcomeBack': 'Welcome back',
  'auth.signInFailed': 'Sign in failed',
  'auth.signInSubtitle': 'Enter your credentials to access your workspace.',
  'auth.heroTitle': 'Sign in to manage inventory, sales and customers.',
  'auth.heroSubtitle':
    'A focused workspace for day-to-day stock control, invoicing and team operations.',
  'auth.copyright': '© 2026 SmartBiz ERP Lite',
  'payment.method': 'Payment method',
  'payment.allMethods': 'All methods',
  'payment.cash': 'Cash',
  'payment.bank': 'Bank',
  'payment.credit': 'Credit',
  'payment.telebirr': 'Telebirr',
  'payment.ebirr': 'eBirr',
  'sales.title': 'Sales',
  'sales.description':
    'Invoice history. Recording a sale saves the invoice, deducts stock, and writes an inventory log.',
  'sales.addSale': 'Add sale',
  'sales.newSale': 'New sale',
  'sales.newSaleDesc': 'Pick a customer, add products and confirm the invoice total.',
  'sales.customer': 'Customer',
  'sales.walkIn': 'Walk-in customer',
  'sales.selectCustomer': 'Select customer',
  'sales.selectPayment': 'Select payment method',
  'sales.lineItems': 'Line items',
  'sales.addItem': 'Add item',
  'sales.selectProduct': 'Select product',
  'sales.saveSale': 'Save sale',
  'sales.recorded': 'Sale recorded',
  'sales.noSales': 'No sales found',
  'sales.noSalesDesc': 'Invoices will appear here once sales are recorded.',
  'sales.searchPlaceholder': 'Search invoice or customer',
  'sales.invoice': 'Invoice',
  'sales.date': 'Date',
  'sales.partialInventory': 'Sale saved but inventory could not be fully updated.',
  'customers.title': 'Customers',
  'customers.description': 'Contact details and outstanding credit for every buyer.',
  'customers.new': 'New customer',
  'customers.edit': 'Edit customer',
  'customers.save': 'Save customer',
  'customers.created': 'Customer created',
  'customers.updated': 'Customer updated',
  'customers.deleted': 'Customer deleted',
  'customers.creditBalance': 'Credit balance',
  'customers.creditDesc': 'Credit balance tracks what the customer still owes.',
  'customers.tin': 'TIN Number',
  'customers.noCustomers': 'No customers yet',
  'customers.noCustomersDesc': 'Add your first customer to start tracking sales and credit.',
  'customers.searchPlaceholder': 'Search name, email or phone',
  'customers.deleteTitle': 'Delete customer?',
  'customers.deleteDesc': 'Their sales history stays intact, but the profile is removed.',
  'stock.out': 'Out of stock',
  'stock.low': 'Low stock',
  'stock.inStock': 'In stock',
  'language.label': 'Language',
};

const am: Dictionary = {
  ...en,
  'nav.dashboard': 'ዳሽቦርድ',
  'nav.products': 'ምርቶች',
  'nav.categories': 'ምድቦች',
  'nav.customers': 'ደንበኞች',
  'nav.sales': 'ሽያጭ',
  'nav.inventory': 'ክምችት',
  'nav.reports': 'ሪፖርቶች',
  'nav.settings': 'ቅንብሮች',
  'nav.workspace': 'የስራ ቦታ',
  'nav.logout': 'ውጣ',
  'nav.signOut': 'ውጣ',
  'nav.signingOut': 'በመውጣት ላይ...',
  'nav.openNav': 'አሰሳ ክፈት',
  'nav.openAccount': 'መለያ ምናሌ ክፈት',
  'nav.loading': 'በመጫን ላይ...',
  'nav.profileUnavailable': 'መለያ አልተገኘም',
  'nav.checkingSession': 'ክፍለ ጊዜ በመፈተሽ ላይ...',
  'nav.unableLoadProfile': 'መለያ መጫን አልተሳካም',
  'brand.liteEdition': 'Lite ስሪት',
  'brand.businessWorkspace': 'የንግድ የስራ ቦታ',
  'common.save': 'አስቀምጥ',
  'common.cancel': 'ሰርዝ',
  'common.edit': 'አርትዕ',
  'common.delete': 'ሰርዝ',
  'common.search': 'ፈልግ',
  'common.saving': 'በመቀመጥ ላይ...',
  'common.name': 'ስም',
  'common.phone': 'ስልክ',
  'common.email': 'ኢሜይል',
  'common.address': 'አድራሻ',
  'common.quantity': 'ብዛት',
  'common.total': 'ጠቅላላ',
  'common.all': 'ሁሉ',
  'common.retry': 'እንደገና ሞክር',
  'common.noEmail': 'ኢሜይል የለም',
  'auth.signIn': 'ግባ',
  'auth.signingIn': 'በመግባት ላይ...',
  'auth.register': 'ተመዝገብ',
  'auth.forgotPassword': 'የይለፍ ቃል ረሳኽ?',
  'auth.password': 'የይለፍ ቃል',
  'auth.email': 'ኢሜይል',
  'auth.noAccount': 'መለያ የለዎት?',
  'auth.createOne': 'አንድ ፍጠር',
  'auth.welcomeBack': 'እንኳን ደህና መጡ',
  'auth.signInFailed': 'መግባት አልተሳካም',
  'auth.signInSubtitle': 'የስራ ቦታዎን ለመጠቀም የመለያ መረጃዎን ያስገቡ።',
  'auth.heroTitle': 'ክምችት፣ ሽያጭ እና ደንበኞችን ለማስተዳደር ግቡ።',
  'auth.heroSubtitle': 'ለዕለታዊ ክምችት፣ ደረሰኝ እና የቡድን ስራ ተስማሚ የስራ ቦታ።',
  'payment.method': 'የመክፈያ ዘዴ',
  'payment.allMethods': 'ሁሉም ዘዴዎች',
  'payment.cash': 'ጥሬ ገንዘብ',
  'payment.bank': 'ባንክ',
  'payment.credit': 'ክሬዲት',
  'payment.telebirr': 'ቴሌብር',
  'payment.ebirr': 'eBirr',
  'sales.title': 'ሽያጭ',
  'sales.description':
    'የደረሰኝ ታሪክ። ሽያጭ መቀመጥ ክምችት ይቀንሳል እና የክምችት መዝገብ ይፃፋል።',
  'sales.addSale': 'ሽያጭ ጨምር',
  'sales.newSale': 'አዲስ ሽያጭ',
  'sales.newSaleDesc': 'ደንበኛ ይምረጡ፣ ምርቶች ያክሉ እና ጠቅላላውን ያረጋግጡ።',
  'sales.customer': 'ደንበኛ',
  'sales.walkIn': 'የሚመጣ ደንበኛ',
  'sales.selectCustomer': 'ደንበኛ ይምረጡ',
  'sales.selectPayment': 'የመክፈያ ዘዴ ይምረጡ',
  'sales.lineItems': 'የዕቃ ዝርዝር',
  'sales.addItem': 'ዕቃ ጨምር',
  'sales.selectProduct': 'ምርት ይምረጡ',
  'sales.saveSale': 'ሽያጭ አስቀምጥ',
  'sales.recorded': 'ሽያጭ ተመዝግቧል',
  'sales.noSales': 'ሽያጭ አልተገኘም',
  'sales.noSalesDesc': 'ሽያጮች ካስመዘገቡ ደረሰኞች እዚህ ይታያሉ።',
  'sales.searchPlaceholder': 'ደረሰኝ ወይም ደንበኛ ፈልግ',
  'sales.invoice': 'ደረሰኝ',
  'sales.date': 'ቀን',
  'customers.title': 'ደንበኞች',
  'customers.description': 'የደንበኞች ዝርዝር እና ቀሪ ክሬዲት።',
  'customers.new': 'አዲስ ደንበኛ',
  'customers.edit': 'ደንበኛ አርትዕ',
  'customers.save': 'ደንበኛ አስቀምጥ',
  'customers.created': 'ደንበኛ ተፈጥረ',
  'customers.updated': 'ደንበኛ ተዘምነ',
  'customers.deleted': 'ደንበኛ ተሰርዘ',
  'customers.creditBalance': 'የክሬዲት ቀሪ',
  'customers.creditDesc': 'ደንበኛው የተቀረ ገንዘብ።',
  'customers.tin': 'TIN ቁጥር',
  'customers.noCustomers': 'ደንበኛ አልተገኘም',
  'customers.noCustomersDesc': 'ደንበኞችን ለመከታተል የመጀመሪያ ደንበኛ ያክሉ።',
  'customers.searchPlaceholder': 'ስም፣ ኢሜይል ወይም ስልክ ፈልግ',
  'customers.deleteTitle': 'ደንበኛ ሰርዝ?',
  'customers.deleteDesc': 'የሽያጭ ታሪክ ይቀራል፣ መለያው ይሰረዛል።',
  'stock.out': 'ክምችት አልቀረ',
  'stock.low': 'ዝቅተኛ ክምችት',
  'stock.inStock': 'በክምችት ውስጥ',
  'language.label': 'ቋንቋ',
};

const om: Dictionary = {
  ...en,
  'nav.dashboard': 'Daashboordii',
  'nav.products': 'Oomishaalee',
  'nav.categories': 'Ramaddiiwwan',
  'nav.customers': 'Maamiltoota',
  'nav.sales': 'Gurgurtaa',
  'nav.inventory': 'Kuusaa',
  'nav.reports': 'Gabaasota',
  'nav.settings': 'Qindaa\'ina',
  'nav.workspace': 'Bakka hojii',
  'nav.logout': 'Ba\'i',
  'nav.signOut': 'Ba\'i',
  'nav.signingOut': 'Ba\'aa jira...',
  'nav.openNav': 'Qajeelfama bani',
  'nav.openAccount': 'Menuu akkaawuntii bani',
  'nav.loading': 'Fe\'aa jira...',
  'nav.profileUnavailable': 'Profile hin argamne',
  'nav.checkingSession': 'Session ilaalaa jira...',
  'nav.unableLoadProfile': 'Profile fe\'uu hin dandeenye',
  'brand.liteEdition': 'Lite edition',
  'brand.businessWorkspace': 'Bakka hojii daldalaa',
  'common.save': 'Olkaa\'i',
  'common.cancel': 'Haqi',
  'common.edit': 'Gulaali',
  'common.delete': 'Haqi',
  'common.search': 'Barbaadi',
  'common.saving': 'Olkaa\'aa jira...',
  'common.name': 'Maqaa',
  'common.phone': 'Bilbila',
  'common.email': 'Imeelii',
  'common.address': 'Teessoo',
  'common.quantity': 'Baay\'ina',
  'common.total': 'Waliigala',
  'common.all': 'Hunda',
  'common.retry': 'Irra deebi\'ii yaali',
  'common.noEmail': 'Imeelii hin jiru',
  'auth.signIn': 'Seeni',
  'auth.signingIn': 'Seenaa jira...',
  'auth.register': 'Galmaa\'i',
  'auth.forgotPassword': 'Jecha iccitii dagattee?',
  'auth.password': 'Jecha iccitii',
  'auth.email': 'Imeelii',
  'auth.noAccount': 'Akkaawuntii hin qabduu?',
  'auth.createOne': 'Tokko uumi',
  'auth.welcomeBack': 'Baga nagaan deebitan',
  'auth.signInFailed': 'Seenuu hin milkoofne',
  'auth.signInSubtitle': 'Bakka hojii kee arguuf odeeffannoo kee galchi.',
  'auth.heroTitle': 'Kuusaa, gurgurtaa fi maamiltoota bulchuuf seeni.',
  'auth.heroSubtitle': 'Bakka hojii guyyaa guyyaa kuusaa fi gurgurtaa.',
  'payment.method': 'Mala kaffaltii',
  'payment.allMethods': 'Mala hunda',
  'payment.cash': 'Maallaqa qarshii',
  'payment.bank': 'Baankii',
  'payment.credit': 'Kireeditii',
  'payment.telebirr': 'Telebirr',
  'payment.ebirr': 'eBirr',
  'sales.title': 'Gurgurtaa',
  'sales.description':
    'Seenaa waraqaa. Gurgurtaa olkaa\'uun kuusaa ni hir\'ata fi galmee kuusaa ni barreessa.',
  'sales.addSale': 'Gurgurtaa dabali',
  'sales.newSale': 'Gurgurtaa haaraa',
  'sales.newSaleDesc': 'Maamila filadhu, oomishaalee dabali fi waliigala mirkaneessi.',
  'sales.customer': 'Maamila',
  'sales.walkIn': 'Maamila dhufaa',
  'sales.selectCustomer': 'Maamila filadhu',
  'sales.selectPayment': 'Mala kaffaltii filadhu',
  'sales.lineItems': 'Tarree oomishaalee',
  'sales.addItem': 'Oomisha dabali',
  'sales.selectProduct': 'Oomisha filadhu',
  'sales.saveSale': 'Gurgurtaa olkaa\'i',
  'sales.recorded': 'Gurgurtaan galmaa\'e',
  'sales.noSales': 'Gurgurtaa hin argamne',
  'sales.noSalesDesc': 'Gurgurtaan erga galmaa\'ee booda waraqaa asitti mul\'ata.',
  'sales.searchPlaceholder': 'Waraqaa ykn maamila barbaadi',
  'sales.invoice': 'Waraqaa',
  'sales.date': 'Guyyaa',
  'customers.title': 'Maamiltoota',
  'customers.description': 'Odeeffannoo maamiltootaa fi kireeditii hafe.',
  'customers.new': 'Maamila haaraa',
  'customers.edit': 'Maamila gulaali',
  'customers.save': 'Maamila olkaa\'i',
  'customers.created': 'Maamila uumame',
  'customers.updated': 'Maamila haaromfame',
  'customers.deleted': 'Maamila haqame',
  'customers.creditBalance': 'Kireeditii hafe',
  'customers.creditDesc': 'Maamilaan kan hafe.',
  'customers.tin': 'Lakkoofsa TIN',
  'customers.noCustomers': 'Maamila hin jiru',
  'customers.noCustomersDesc': 'Maamila jalqabaa dabali.',
  'customers.searchPlaceholder': 'Maqaa, imeelii ykn bilbila barbaadi',
  'customers.deleteTitle': 'Maamila haquu?',
  'customers.deleteDesc': 'Seenaa gurgurtaa ni hafa, profile ni haqama.',
  'stock.out': 'Kuusaa dhume',
  'stock.low': 'Kuusaa gadi aanaa',
  'stock.inStock': 'Kuusaadha',
  'language.label': 'Afaan',
};

export const translations: Record<Language, Dictionary> = { en, am, om };

export function translate(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}

export function paymentMethodKey(value: string): TranslationKey {
  const k = value.toLowerCase();
  if (k === 'cash') return 'payment.cash';
  if (k === 'bank') return 'payment.bank';
  if (k === 'credit') return 'payment.credit';
  if (k === 'telebirr') return 'payment.telebirr';
  if (k === 'ebirr') return 'payment.ebirr';
  return 'payment.cash';
}
