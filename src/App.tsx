import {
  Search,
  Database,
  Calculator,
  Calendar,
  CheckCircle2,
  Languages,
  Wallet,
  Mail,
  Phone,
  MapPin,
  Crown,
  Info,
  Bell,
  ArrowRight,
  FileText,
  Globe,
  Clock,
  Filter,
  ChevronRight,
  Lock,
  CreditCard,
  User,
  LogOut,
  Upload,
  Plus,
  Loader2,
  Download,
  X,
  Check,
  GraduationCap,
  Camera,
  Save,
  Edit2,
  ShieldCheck,
  History,
  Settings,
  Moon,
  Sun,
  Key,
  AlertTriangle,
  AlertCircle,
  Map as MapIcon
} from 'lucide-react';
import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- API Configuration ---
// Dev: Vite proxy '/api' -> 'https://scholarmap.uz' (CORS fix)
// Prod: to'g'ridan-to'g'ri URL
const IS_DEV = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = IS_DEV ? '/api/v1' : 'https://scholarmap.uz/api/v1';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      return true;
    }
  } catch { }
  return false;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
      return fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }
  return res;
}

// --- Translations ---
const TRANSLATIONS = {
  uz: {
    dashboard: "Grantlar Bazasi",
    profile: "Shaxsiy Kabinet",
    search: "Mos Grantlar Qidirish",
    eligibility: "Grant Imkoniyatlarini Baholash",
    deadlines: "Muddatlar va Eslatmalar",
    stepByStep: "Bosqichma-bosqich Yo'riqnoma",
    translation: "Hujjatlarni Tarjima Qilish",
    funding: "Moliyalashtirish va Grantlar",
    premium: "Premium Obuna",
    logout: "Chiqish",
    edit: "Tahrirlash",
    save: "Saqlash",
    cancel: "Bekor qilish",
    firstName: "Ism",
    lastName: "Familiya",
    middleName: "Sharifi",
    phone: "Telefon raqam",
    email: "Elektron pochta (Gmail)",
    security: "Xavfsizlik",
    changePassword: "Parolni o'zgartirish",
    preferences: "Afzalliklar",
    darkMode: "Tungi rejim",
    systemLanguage: "Tizim tili",
    notifications: "Bildirishnomalar (Email)",
    premiumTitle: "Premium Obuna",
    premiumDesc: "Barcha imkoniyatlardan foydalaning",
    premiumUpgrade: "Obunani yangilash",
    joinedDate: "A'zo bo'lingan",
    freePlan: "Bepul Reja",
    premiumPlan: "Premium",
    changePhoto: "Rasmni o'zgartirish",
    newPassword: "Yangi parol",
    confirmPassword: "Parolni tasdiqlang",
    passwordChanged: "Parol muvaffaqiyatli o'zgartirildi!",
    errorMatch: "Parollar mos kelmadi",
    errorShort: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
    grantDatabase: "Grantlar Bazasi",
    officialSourcesOnly: "Faqat rasmiy manbalar",
    searchPlaceholder: "Grant yoki universitet nomini kiriting...",
    educationLevel: "Ta'lim darajasi",
    filter: "Filtr",
    grantAmount: "Grant miqdori",
    deadline: "Oxirgi muddat",
    openingDate: "Qabul boshlanishi",
    officialSite: "Rasmiy sayt",
    searchGrants: "Grantlarni qidirish",
    selectCountry: "Davlatni tanlang",
    university: "Universitet",
    selectUniversity: "Universitetni tanlang",
    major: "Yo'nalish",
    openingTime: "Qabul boshlanishi",
    openingTimeDesc: "Grant qabulining boshlanish vaqti",
    fullGrants: "To'liq grantlar",
    fullGrantsDesc: "Barcha xarajatlarni qoplaydigan grantlar",
    notificationsDesc: "Bildirishnomalar va eslatmalar",
    profileData: "Profil ma'lumotlari",
    eligibilityChance: "Loyiqlik ehtimoli",
    downloadReport: "Hisobotni yuklab olish",
    eligibilityResult: "Loyiqlik natijasi",
    calendar: "Kalendar",
    urgent: "Shoshilinch",
    remindMe: "Eslatib o'tish",
    premiumSubtitle: "Premium imkoniyatlar",
    monthly: "Oylik",
    month: "oy",
    yearly: "Yillik",
    bestValue: "Eng foydali",
    year: "yil",
    fullAccess: "To'liq kirish",
    personalConsultation: "Shaxsiy maslahat",
    realTimeUpdates: "Real vaqtda yangilanishlar",
    paymentMethods: "To'lov usullari",
    cardNumber: "Karta raqami",
    choosePayment: "To'lov usulini tanlang",
    choosePlan: "Rejani tanlash",
    welcomeBack: "Xush kelibsiz",
    password: "Parol",
    login: "Kirish",
    forgotPassword: "Parolni unutdingizmi?",
    register: "Ro'yxatdan o'tish",
    fromLang: "Qaysi tildan",
    toLang: "Qaysi tilga",
    uzbek: "O'zbek tili",
    russian: "Rus tili",
    english: "Ingliz tili",
    german: "Nemis tili",
    french: "Fransuz tili",
    japanese: "Yapon tili",
    uploadFile: "Faylni yuklang",
    uploadFormat: "PDF, DOCX yoki JPG formatida (Max 10MB)",
    notary: "Notarial tasdiqlash",
    officialDocs: "Rasmiy hujjatlar uchun",
    translating: "Tarjima qilinmoqda...",
    sendToTranslate: "Tarjimaga yuborish",
    translationResult: "Tarjima natijasi",
    fundingTitle: "Moliyalashtirishga Tayyorlash",
    fundingDesc: "EYUF, Yoshlar Ittifoqi va boshqa moliyalashtirish manbalari bo'yicha ekspert yo'riqnomasi.",
    fundingSources: [
      { name: "EYUF (El-yurt umidi jamg'armasi)", color: "blue" },
      { name: "Yoshlar Ittifoqi Grantlari", color: "emerald" },
      { name: "Xalqaro Tashkilotlar", color: "amber" },
      { name: "Xususiy Fondlar", color: "indigo" }
    ],
    appAcceptance: "Arizalar qabuli",
    selectionStages: "Tanlov bosqichlari",
    viewGuide: "Yo'riqnomani ko'rish",
    mayJune: "May - Iyun",
    stages3: "3 ta",
    countries: ["Turkiya", "AQSH", "Buyuk Britaniya", "Germaniya", "Kanada", "Avstraliya", "Yaponiya", "Janubiy Koreya", "Xitoy", "Fransiya", "Italiya", "Ispaniya", "Niderlandiya", "Shvetsiya", "Shveytsariya", "Norvegiya", "Daniya", "Finlandiya", "Belgiya", "Avstriya", "Irlandiya", "Yangi Zelandiya", "Singapur", "Malayziya", "BAA", "Saudiya Arabistoni", "Qatar", "Polsha", "Chexiya", "Vengriya", "Portugaliya", "Gretsiya", "Braziliya", "Meksika", "Argentina", "Chili", "Janubiy Afrika", "Misr", "Isroil", "Hindiston"],
    majors: ["Axborot Texnologiyalari", "Iqtisodiyot", "Tibbiyot", "Muhandislik", "Huquqshunoslik", "Xalqaro munosabatlar", "Arxitektura", "Psixologiya", "Biologiya", "San'at va Dizayn"],
    levels: ["Bakalavr", "Magistratura", "PhD", "Tadqiqot"],
    full: "To'liq",
    living: "Yashash xarajatlari",
    tuition: "O'qish puli",
    stipend: "Stipendiya",
    scholarship: "Grant",
    guideTitle: "Grantga Topshirish Yo'riqnomasi",
    guideDesc: "Har bir qadamni kuzatib boring va muvaffaqiyatga erishing.",
    steps: [
      { title: "Universitet tanlash", desc: "Sizning yo'nalishingizga mos TOP universitetlarni saralash." },
      { title: "CV tayyorlash", desc: "Xalqaro standartlarga mos professional CV (Resume) yaratish." },
      { title: "Hujjatlarni tayyorlash", desc: "Passport, Diplom, Transcript va boshqa asosiy hujjatlar." },
      { title: "Motivation Letter yozish", desc: "Nima uchun aynan sizni tanlashlari kerakligi haqida insho." },
      { title: "Tavsiyanomalar olish", desc: "O'qituvchi yoki ish beruvchidan tavsiyanomalar." },
      { title: "Ariza topshirish", desc: "Rasmiy portal orqali arizani yuborish." }
    ],
    continue: "Davom etish",
    importantNote: "Muhim eslatma",
    scholarMapNote: "ScholarMap orqali siz dunyoning eng nufuzli universitetlariga grant yutib olish imkoniyatiga ega bo'lasiz. Ma'lumotlarimiz 100% ishonchli manbalardan olinadi.",
    scholarMapNoteTitle: "ScholarMap Eslatmasi",
    gpaRange: "GPA (3.0 - 5.0)",
    ieltsRange: "IELTS (5.5 - 9.0)",
    eligibilityText: "Sizning ko'rsatkichlaringiz tanlangan yo'nalish bo'yicha yuqori natija bermoqda.",
    timeline: "Timeline",
    premiumServices: "Premium Xizmatlar",
    markAllAsRead: "Hammasini o'qilgan deb belgilash",
    noNotifications: "Hozircha sizda bildirishnomalar mavjud emas",
    noNotificationsDesc: "Yangi xabarlar kelganda shu yerda ko'rinadi",
    viewAllNotifications: "Barcha bildirishnomalarni ko'rish",
    premiumStart: "Premium obunani boshlang",
    premiumSub: "Ko'proq imkoniyat, aniqroq natija",
    yearlyPlan: "Yillik",
    monthlyPlan: "Oylik",
    recommended: "Tavsiya etiladi",
    yearlyDesc: "Yiliga bir marta to'lov (2 oy bepul)",
    monthlyDesc: "Har oy to'lov",
    freeTrial: "30 kun bepul sinov. To'lov ma'lumotlari keyingi bosqichda kiritiladi.",
    premiumFeatures: "Premiumda ochiladigan imkoniyatlar",
    feature1: "AI orqali chuqur grant tahlili",
    feature2: "Batafsil qabul ehtimoli hisoboti",
    feature3: "CV va profil bo'yicha premium tavsiyalar",
    feature4: "Motivatsion xat va ariza bo'yicha yordam",
    feature5: "Notarial tasdiq va rasmiylashtirish yo'l-yo'riqlari",
    feature6: "Kengaytirilgan deadline nazorati",
    finishPayment: "To'lovni yakunlang",
    paymentSub: "Tanlangan tarif bo'yicha obunani faollashtiring",
    selected: "TANLANDI",
    paymeSub: "Mahalliy to'lov tizimi",
    clickSub: "Tez va qulay to'lov",
    stripeSub: "Xalqaro (Visa, MasterCard)",
    back: "Orqaga",
    redirecting: "To'lov tizimiga yo'naltirilmoqda...",
    todayTrial: "Bugun — 30 kunlik bepul sinov",
    todayTrialDesc: "Barcha premium imkoniyatlarni cheklovsiz sinab ko'ring",
    day23Remind: "23-kun — eslatma",
    day23RemindDesc: "Obuna tugashidan oldin sizga maxsus eslatma yuboramiz",
    day30Active: "30-kun — obuna faollashadi",
    day30ActiveDesc: "Agar bekor qilmasangiz, tanlangan tarif bo'yicha davom etadi",
    flexiblePayment: "Moslashuvchan to'lov",
    yearlySaveDesc: "Yillik obuna bilan ko'proq tejang",
    startToday: "Bugun boshlang — 30 kun bepul",
    cancelAnytime: "Istalgan vaqtda bekor qilishingiz mumkin.",
    today: "Bugun",
    trialStart: "Bepul sinov boshlanadi",
    day23: "23-kun",
    reminderSent: "Eslatma yuboriladi",
    day30: "30-kun",
    subscriptionStart: "Obuna boshlanadi",
    completePayment: "To'lovni yakunlang",
    completePaymentDesc: "Tanlangan tarif bo'yicha obunani faollashtiring",
    choosePaymentMethod: "To'lov usulini tanlang"
  },
  en: {
    dashboard: "Grants Database",
    profile: "Personal Cabinet",
    search: "Find Matching Grants",
    eligibility: "Grant Opportunity Assessment",
    deadlines: "Deadlines & Reminders",
    stepByStep: "Step-by-Step Guide",
    translation: "Document Translation",
    funding: "Funding & Grants",
    premium: "Premium Subscription",
    logout: "Logout",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    firstName: "First Name",
    lastName: "Last Name",
    middleName: "Middle Name",
    phone: "Phone Number",
    email: "Email (Gmail)",
    security: "Security",
    changePassword: "Change Password",
    preferences: "Preferences",
    darkMode: "Dark Mode",
    systemLanguage: "System Language",
    notifications: "Notifications (Email)",
    premiumTitle: "Premium Subscription",
    premiumDesc: "Unlock all features",
    premiumUpgrade: "Upgrade Subscription",
    joinedDate: "Joined",
    freePlan: "Free Plan",
    premiumPlan: "Premium",
    changePhoto: "Change Photo",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    passwordChanged: "Password changed successfully!",
    errorMatch: "Passwords do not match",
    errorShort: "Password must be at least 6 characters",
    grantDatabase: "Grants Database",
    officialSourcesOnly: "Official sources only",
    searchPlaceholder: "Enter grant or university name...",
    educationLevel: "Education Level",
    filter: "Filter",
    grantAmount: "Grant Amount",
    deadline: "Deadline",
    openingDate: "Application Opens",
    officialSite: "Official Site",
    searchGrants: "Search Grants",
    selectCountry: "Select Country",
    university: "University",
    selectUniversity: "Select University",
    major: "Major",
    openingTime: "Application Opens",
    openingTimeDesc: "Grant application start time",
    fullGrants: "Full Grants",
    fullGrantsDesc: "Grants covering all expenses",
    notificationsDesc: "Notifications and reminders",
    profileData: "Profile Data",
    eligibilityChance: "Eligibility Chance",
    downloadReport: "Download Report",
    eligibilityResult: "Eligibility Result",
    calendar: "Calendar",
    urgent: "Urgent",
    remindMe: "Remind Me",
    premiumSubtitle: "Premium Features",
    monthly: "Monthly",
    month: "month",
    yearly: "Yearly",
    bestValue: "Best Value",
    year: "year",
    fullAccess: "Full Access",
    personalConsultation: "Personal Consultation",
    realTimeUpdates: "Real-time Updates",
    paymentMethods: "Payment Methods",
    cardNumber: "Card Number",
    choosePayment: "Choose Payment Method",
    choosePlan: "Choose Plan",
    welcomeBack: "Welcome Back",
    password: "Password",
    login: "Login",
    forgotPassword: "Forgot Password?",
    register: "Register",
    fromLang: "From language",
    toLang: "To language",
    uzbek: "Uzbek",
    russian: "Russian",
    english: "English",
    german: "German",
    french: "French",
    japanese: "Japanese",
    uploadFile: "Upload file",
    uploadFormat: "PDF, DOCX or JPG format (Max 10MB)",
    notary: "Notary certification",
    officialDocs: "For official documents",
    translating: "Translating...",
    sendToTranslate: "Send to translate",
    translationResult: "Translation result",
    fundingTitle: "Funding Preparation",
    fundingDesc: "Expert guidance on EYUF, Youth Union, and other funding sources.",
    fundingSources: [
      { name: "EYUF (El-yurt umidi foundation)", color: "blue" },
      { name: "Youth Union Grants", color: "emerald" },
      { name: "International Organizations", color: "amber" },
      { name: "Private Foundations", color: "indigo" }
    ],
    appAcceptance: "Application acceptance",
    selectionStages: "Selection stages",
    viewGuide: "View guide",
    mayJune: "May - June",
    stages3: "3 stages",
    countries: ["Turkey", "USA", "United Kingdom", "Germany", "Canada", "Australia", "Japan", "South Korea", "China", "France", "Italy", "Spain", "Netherlands", "Sweden", "Switzerland", "Norway", "Denmark", "Finland", "Belgium", "Austria", "Ireland", "New Zealand", "Singapore", "Malaysia", "UAE", "Saudi Arabia", "Qatar", "Poland", "Czech Republic", "Hungary", "Portugal", "Greece", "Brazil", "Mexico", "Argentina", "Chile", "South Africa", "Egypt", "Israel", "India"],
    majors: ["Information Technology", "Economics", "Medicine", "Engineering", "Law", "International Relations", "Architecture", "Psychology", "Biology", "Art & Design"],
    levels: ["Bachelor", "Master", "PhD", "Research"],
    full: "Full",
    living: "Living expenses",
    tuition: "Tuition fee",
    stipend: "Stipend",
    scholarship: "Scholarship",
    guideTitle: "Grant Application Guide",
    guideDesc: "Follow each step and achieve success.",
    steps: [
      { title: "University Selection", desc: "Sorting TOP universities suitable for your field." },
      { title: "CV Preparation", desc: "Creating a professional CV (Resume) according to international standards." },
      { title: "Document Preparation", desc: "Passport, Diploma, Transcript and other basic documents." },
      { title: "Writing Motivation Letter", desc: "An essay about why exactly they should choose you." },
      { title: "Getting Recommendations", desc: "Recommendations from a teacher or employer." },
      { title: "Submitting Application", desc: "Sending the application through the official portal." }
    ],
    continue: "Continue",
    importantNote: "Important Note",
    scholarMapNote: "Through ScholarMap, you have the opportunity to win grants to the world's most prestigious universities. Our information is obtained from 100% reliable sources.",
    scholarMapNoteTitle: "ScholarMap Note",
    gpaRange: "GPA (3.0 - 5.0)",
    ieltsRange: "IELTS (5.5 - 9.0)",
    eligibilityText: "Your indicators are showing high results in the selected field.",
    timeline: "Timeline",
    premiumServices: "Premium Services",
    markAllAsRead: "Mark all as read",
    noNotifications: "You currently have no notifications",
    noNotificationsDesc: "New messages will appear here when they arrive",
    viewAllNotifications: "View all notifications",
    premiumStart: "Start Premium Subscription",
    premiumSub: "More opportunities, more accurate results",
    yearlyPlan: "Yearly",
    monthlyPlan: "Monthly",
    recommended: "Recommended",
    yearlyDesc: "Billed annually (2 months free)",
    monthlyDesc: "Billed monthly",
    freeTrial: "30-day free trial. Payment details entered in the next step.",
    premiumFeatures: "Premium Features",
    feature1: "Deep grant analysis via AI",
    feature2: "Detailed eligibility report",
    feature3: "Premium CV & profile recommendations",
    feature4: "Motivation letter & application assistance",
    feature5: "Notary & documentation guidance",
    feature6: "Advanced deadline monitoring",
    finishPayment: "Finish Payment",
    paymentSub: "Activate subscription with selected plan",
    selected: "SELECTED",
    paymeSub: "Local payment system",
    clickSub: "Fast and convenient payment",
    stripeSub: "International (Visa, MasterCard)",
    back: "Back",
    redirecting: "Redirecting to payment system...",
    todayTrial: "Today — 30-day free trial",
    todayTrialDesc: "Try all premium features without limits",
    day23Remind: "Day 23 — reminder",
    day23RemindDesc: "We'll send you a special reminder before subscription ends",
    day30Active: "Day 30 — subscription activates",
    day30ActiveDesc: "If you don't cancel, it will continue with the selected plan",
    flexiblePayment: "Flexible payment",
    yearlySaveDesc: "Save more with annual subscription",
    startToday: "Start today — 30 days free",
    cancelAnytime: "You can cancel anytime.",
    today: "Today",
    trialStart: "Free trial starts",
    day23: "Day 23",
    reminderSent: "Reminder will be sent",
    day30: "Day 30",
    subscriptionStart: "Subscription starts",
    completePayment: "Complete payment",
    completePaymentDesc: "Activate subscription with selected plan",
    choosePaymentMethod: "Choose payment method"
  },
  ru: {
    dashboard: "База Грантов",
    profile: "Личный Кабинет",
    search: "Поиск Подходящих Грантов",
    eligibility: "Оценка возможностей гранта",
    deadlines: "Сроки и Напоминания",
    stepByStep: "Пошаговое Руководство",
    translation: "Перевод Документов",
    funding: "Финансирование и Гранты",
    premium: "Премиум Подписка",
    logout: "Выйти",
    edit: "Редактировать",
    save: "Сохранить",
    cancel: "Отмена",
    firstName: "Имя",
    lastName: "Фамилия",
    middleName: "Отчество",
    phone: "Номер телефона",
    email: "Электронная почта (Gmail)",
    security: "Безопасность",
    changePassword: "Изменить пароль",
    preferences: "Предпочтения",
    darkMode: "Темный режим",
    systemLanguage: "Язык системы",
    notifications: "Уведомления (Email)",
    premiumTitle: "Премиум Подписка",
    premiumDesc: "Используйте все возможности",
    premiumUpgrade: "Обновить подписку",
    joinedDate: "Дата регистрации",
    freePlan: "Бесплатный План",
    premiumPlan: "Премиум",
    changePhoto: "Изменить фото",
    newPassword: "Новый пароль",
    confirmPassword: "Подтвердите пароль",
    passwordChanged: "Пароль успешно изменен!",
    errorMatch: "Пароли не совпадают",
    errorShort: "Пароль должен быть не менее 6 символов",
    grantDatabase: "База Грантов",
    officialSourcesOnly: "Только официальные источники",
    searchPlaceholder: "Введите название гранта или университета...",
    educationLevel: "Уровень образования",
    filter: "Фильтр",
    grantAmount: "Сумма гранта",
    deadline: "Крайний срок",
    openingDate: "Начало приема",
    officialSite: "Официальный сайт",
    searchGrants: "Поиск грантов",
    selectCountry: "Выберите страну",
    university: "Университет",
    selectUniversity: "Выберите университет",
    major: "Специальность",
    openingTime: "Начало приема",
    openingTimeDesc: "Время начала приема заявок",
    fullGrants: "Полные гранты",
    fullGrantsDesc: "Гранты, покрывающие все расходы",
    notificationsDesc: "Уведомления и напоминания",
    profileData: "Данные профиля",
    eligibilityChance: "Шанс соответствия",
    downloadReport: "Скачать отчет",
    eligibilityResult: "Результат соответствия",
    calendar: "Календарь",
    urgent: "Срочно",
    remindMe: "Напомнить мне",
    premiumSubtitle: "Премиум возможности",
    monthly: "Ежемесячно",
    month: "месяц",
    yearly: "Ежегодно",
    bestValue: "Лучшая цена",
    year: "год",
    fullAccess: "Полный доступ",
    personalConsultation: "Личная консультация",
    realTimeUpdates: "Обновления в реальном времени",
    paymentMethods: "Способы оплаты",
    cardNumber: "Номер карты",
    choosePayment: "Выберите способ оплаты",
    choosePlan: "Выбрать план",
    welcomeBack: "С возвращением",
    password: "Пароль",
    login: "Войти",
    forgotPassword: "Забыли пароль?",
    register: "Регистрация",
    fromLang: "С языка",
    toLang: "На язык",
    uzbek: "Узбекский",
    russian: "Русский",
    english: "Английский",
    german: "Немецкий",
    french: "Французский",
    japanese: "Японский",
    uploadFile: "Загрузить файл",
    uploadFormat: "В формате PDF, DOCX или JPG (Макс 10МБ)",
    notary: "Нотариальное заверение",
    officialDocs: "Для официальных документов",
    translating: "Переводится...",
    sendToTranslate: "Отправить на перевод",
    translationResult: "Результат перевода",
    fundingTitle: "Подготовка к финансированию",
    fundingDesc: "Экспертное руководство по EYUF, Союзу молодежи и другим источникам финансирования.",
    fundingSources: [
      { name: "EYUF (Фонд Эль-юрт умиди)", color: "blue" },
      { name: "Гранты Союза молодежи", color: "emerald" },
      { name: "Международные организации", color: "amber" },
      { name: "Частные фонды", color: "indigo" }
    ],
    appAcceptance: "Прием заявок",
    selectionStages: "Этапы отбора",
    viewGuide: "Посмотреть руководство",
    mayJune: "Май - Июнь",
    stages3: "3 этапа",
    countries: ["Турция", "США", "Великобритания", "Германия", "Канада", "Австралия", "Япония", "Южная Корея", "Китай", "Франция", "Италия", "Испания", "Нидерланды", "Швеция", "Швейцария", "Норвегия", "Дания", "Финляндия", "Бельгия", "Австрия", "Ирландия", "Новая Зеландия", "Сингапур", "Малайзия", "ОАЭ", "Саудовская Аравия", "Катар", "Польша", "Чехия", "Венгрия", "Португалия", "Греция", "Бразилия", "Мексика", "Аргентина", "Чили", "Южная Африка", "Египет", "Израиль", "Индия"],
    majors: ["Информационные Технологии", "Экономика", "Медицина", "Инженерия", "Юриспруденция", "Международные отношения", "Архитектура", "Психология", "Биология", "Искусство и Дизайн"],
    levels: ["Бакалавриат", "Магистратура", "PhD", "Исследование"],
    full: "Полный",
    living: "Расходы на проживание",
    tuition: "Плата за обучение",
    stipend: "Стипендия",
    scholarship: "Грант",
    guideTitle: "Руководство по подаче на грант",
    guideDesc: "Следуйте каждому шагу и добивайтесь успеха.",
    steps: [
      { title: "Выбор университета", desc: "Подбор ТОП университетов, подходящих для вашего направления." },
      { title: "Подготовка CV", desc: "Создание профессионального CV (резюме) по международным стандартам." },
      { title: "Подготовка документов", desc: "Паспорт, диплом, транскрипт и другие основные документы." },
      { title: "Написание мотивационного письма", desc: "Эссе о том, почему именно вас должны выбрать." },
      { title: "Получение рекомендаций", desc: "Рекомендации от преподавателя или работодателя." },
      { title: "Подача заявки", desc: "Отправка заявки через официальный портал." }
    ],
    continue: "Продолжить",
    importantNote: "Важное примечание",
    premiumStart: "Начните Premium подписку",
    premiumSub: "Больше возможностей, точнее результаты",
    yearlyPlan: "Ежегодно",
    monthlyPlan: "Ежемесячно",
    recommended: "Рекомендуется",
    yearlyDesc: "Оплата раз в год (2 месяца бесплатно)",
    monthlyDesc: "Ежемесячная оплата",
    freeTrial: "30 дней бесплатного пробного периода. Платежные данные вводятся на следующем этапе.",
    premiumFeatures: "Возможности Premium",
    feature1: "Глубокий анализ грантов через AI",
    feature2: "Подробный отчет о шансах",
    feature3: "Premium рекомендации по CV и профилю",
    feature4: "Помощь с мотивационным письмом и заявкой",
    feature5: "Руководство по нотариальному заверению",
    feature6: "Расширенный мониторинг дедлайнов",
    finishPayment: "Завершить оплату",
    paymentSub: "Активируйте подписку по выбранному тарифу",
    selected: "ВЫБРАНО",
    paymeSub: "Местная платежная система",
    clickSub: "Быстрая и удобная оплата",
    stripeSub: "Международная (Visa, MasterCard)",
    back: "Назад",
    redirecting: "Перенаправление в платежную систему...",
    todayTrial: "Сегодня — 30 дней бесплатно",
    todayTrialDesc: "Попробуйте все возможности без ограничений",
    day23Remind: "23-й день — напоминание",
    day23RemindDesc: "Мы отправим вам напоминание до окончания подписки",
    day30Active: "30-й день — активация подписки",
    day30ActiveDesc: "Если не отменено, продолжается по тарифу",
    scholarMapNote: "Через ScholarMap у вас есть возможность выиграть гранты в самые престижные университеты мира. Наша информация получена из 100% надежных источников.",
    scholarMapNoteTitle: "Примечание ScholarMap",
    gpaRange: "GPA (3.0 - 5.0)",
    ieltsRange: "IELTS (5.5 - 9.0)",
    eligibilityText: "Ваши показатели показывают высокие результаты в выбранной области.",
    timeline: "Таймлайн",
    premiumServices: "Премиум Услуги",
    markAllAsRead: "Отметить все как прочитанные",
    noNotifications: "У вас пока нет уведомлений",
    noNotificationsDesc: "Новые сообщения появятся здесь, когда они придут",
    viewAllNotifications: "Посмотреть все уведомления",
    flexiblePayment: "Гибкая оплата",
    yearlySaveDesc: "Экономьте больше с годовой подпиской",
    startToday: "Начните сегодня — 30 дней бесплатно",
    cancelAnytime: "Вы можете отменить в любое время.",
    today: "Сегодня",
    trialStart: "Начало бесплатного периода",
    day23: "23-й день",
    reminderSent: "Будет отправлено напоминание",
    day30: "30-й день",
    subscriptionStart: "Начало подписки",
    completePayment: "Завершите оплату",
    completePaymentDesc: "Активируйте подписку по выбранному тарифу",
    choosePaymentMethod: "Выберите способ оплаты",
  }
};

// --- Types ---
type Section = 'database' | 'search' | 'eligibility' | 'deadlines' | 'step-by-step' | 'translation' | 'funding' | 'premium' | 'profile';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  isRead: boolean;
}

interface University {
  id: string;
  name: string;
  country: string;
  grantType: string;
  amount: string;
  deadline: string;
  openingDate: string;
  link: string;
  photo?: string;
  matchProbability?: number;
}

// --- Constants & Mock Data ---
const COUNTRIES = [
  "Turkiya", "AQSH", "Buyuk Britaniya", "Germaniya", "Kanada", "Avstraliya", "Yaponiya", "Janubiy Koreya", "Xitoy", "Fransiya",
  "Italiya", "Ispaniya", "Niderlandiya", "Shvetsiya", "Shveytsariya", "Norvegiya", "Daniya", "Finlandiya", "Belgiya", "Avstriya",
  "Irlandiya", "Yangi Zelandiya", "Singapur", "Malayziya", "BAA", "Saudiya Arabistoni", "Qatar", "Polsha", "Chexiya", "Vengriya",
  "Portugaliya", "Gretsiya", "Braziliya", "Meksika", "Argentina", "Chili", "Janubiy Afrika", "Misr", "Isroil", "Hindiston"
];

const MAJORS = [
  "Axborot Texnologiyalari", "Iqtisodiyot", "Tibbiyot", "Muhandislik", "Huquqshunoslik",
  "Xalqaro munosabatlar", "Arxitektura", "Psixologiya", "Biologiya", "San'at va Dizayn"
];

const MOCK_UNIVERSITIES: University[] = [
  { id: '1', name: 'Istanbul Technical University', country: 'Turkiya', grantType: 'Türkiye Bursları', amount: 'To\'liq + Stipendiya', deadline: '2026-02-20', openingDate: '2025-10-01', link: 'https://www.itu.edu.tr', photo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '2', name: 'Harvard University', country: 'AQSH', grantType: 'Financial Aid', amount: '$75,000', deadline: '2026-05-15', openingDate: '2025-08-01', link: 'https://www.harvard.edu', photo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '3', name: 'University of Oxford', country: 'Buyuk Britaniya', grantType: 'Rhodes Scholarship', amount: '£50,000', deadline: '2026-01-20', openingDate: '2025-12-01', link: 'https://www.ox.ac.uk', photo: 'https://images.unsplash.com/photo-1563200022-77761805741f?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '4', name: 'Technical University of Munich', country: 'Germaniya', grantType: 'DAAD', amount: '€12,000/yil', deadline: '2026-07-15', openingDate: '2025-09-01', link: 'https://www.tum.de', photo: 'https://images.unsplash.com/photo-1523050853063-9158a65d2057?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '5', name: 'University of Toronto', country: 'Kanada', grantType: 'Lester B. Pearson', amount: 'To\'liq', deadline: '2026-01-15', openingDate: '2025-09-01', link: 'https://www.utoronto.ca', photo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '6', name: 'Massachusetts Institute of Technology (MIT)', country: 'AQSH', grantType: 'MIT Scholarship', amount: 'To\'liq + $35,000', deadline: '2026-04-12', openingDate: '2025-10-01', link: 'https://www.mit.edu', photo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '7', name: 'Stanford University', country: 'AQSH', grantType: 'Knight-Hennessy', amount: 'To\'liq + Yashash', deadline: '2026-01-10', openingDate: '2025-08-01', link: 'https://www.stanford.edu', photo: 'https://images.unsplash.com/photo-1533664488202-6af66d26c44a?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '8', name: 'University of Cambridge', country: 'Buyuk Britaniya', grantType: 'Gates Cambridge', amount: 'To\'liq + £20,000', deadline: '2026-01-05', openingDate: '2025-09-01', link: 'https://www.cam.ac.uk', photo: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '9', name: 'ETH Zurich', country: 'Shveytsariya', grantType: 'Excellence Scholarship', amount: 'CHF 12,000', deadline: '2026-12-15', openingDate: '2026-11-01', link: 'https://ethz.ch', photo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '10', name: 'National University of Singapore (NUS)', country: 'Singapur', grantType: 'NUS Global Merit', amount: 'To\'liq + Stipendiya', deadline: '2026-03-15', openingDate: '2025-10-15', link: 'https://www.nus.edu.sg', photo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '11', name: 'University College London (UCL)', country: 'Buyuk Britaniya', grantType: 'Global Masters', amount: '£15,000', deadline: '2026-04-27', openingDate: '2026-01-15', link: 'https://www.ucl.ac.uk', photo: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '12', name: 'Imperial College London', country: 'Buyuk Britaniya', grantType: 'President\'s PhD', amount: 'To\'liq + £22,000', deadline: '2026-01-06', openingDate: '2025-10-01', link: 'https://www.imperial.ac.uk', photo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '13', name: 'Princeton University', country: 'AQSH', grantType: 'Graduate Fellowship', amount: 'To\'liq + $40,000', deadline: '2026-01-15', openingDate: '2025-09-01', link: 'https://www.princeton.edu', photo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '14', name: 'Yale University', country: 'AQSH', grantType: 'Yale Scholarship', amount: 'To\'liq + Yashash', deadline: '2026-01-02', openingDate: '2025-08-15', link: 'https://www.yale.edu', photo: 'https://images.unsplash.com/photo-1523050853063-9158a65d2057?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '15', name: 'Columbia University', country: 'AQSH', grantType: 'Need-Based Grant', amount: 'To\'liq', deadline: '2026-02-15', openingDate: '2025-10-01', link: 'https://www.columbia.edu', photo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '16', name: 'University of Edinburgh', country: 'Shotlandiya', grantType: 'Global Scholarship', amount: '£10,000', deadline: '2026-05-30', openingDate: '2026-01-01', link: 'https://www.ed.ac.uk', photo: 'https://images.unsplash.com/photo-1563200022-77761805741f?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '17', name: 'University of Tokyo', country: 'Yaponiya', grantType: 'MEXT Scholarship', amount: 'To\'liq + Stipendiya', deadline: '2026-06-15', openingDate: '2026-04-01', link: 'https://www.u-tokyo.ac.jp', photo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '18', name: 'Seoul National University', country: 'Janubiy Koreya', grantType: 'GKS Scholarship', amount: 'To\'liq + Stipendiya', deadline: '2026-03-30', openingDate: '2026-02-01', link: 'https://www.snu.ac.kr', photo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '19', name: 'Tsinghua University', country: 'Xitoy', grantType: 'Schwarzman Scholars', amount: 'To\'liq + Yashash', deadline: '2025-09-20', openingDate: '2025-04-15', link: 'https://www.tsinghua.edu.cn', photo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '20', name: 'University of Melbourne', country: 'Avstraliya', grantType: 'Graduate Research', amount: 'To\'liq + $34,000', deadline: '2026-10-31', openingDate: '2026-01-01', link: 'https://www.unimelb.edu.au', photo: 'https://images.unsplash.com/photo-1523050853063-9158a65d2057?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '21', name: 'McGill University', country: 'Kanada', grantType: 'McCall MacBain', amount: 'To\'liq + Yashash', deadline: '2025-09-25', openingDate: '2025-06-01', link: 'https://www.mcgill.ca', photo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '22', name: 'Delft University of Technology', country: 'Niderlandiya', grantType: 'Justus & Louise', amount: 'To\'liq + Stipendiya', deadline: '2025-12-01', openingDate: '2025-10-01', link: 'https://www.tudelft.nl', photo: 'https://images.unsplash.com/photo-1563200022-77761805741f?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '23', name: 'University of Amsterdam', country: 'Niderlandiya', grantType: 'Excellence Scholarship', amount: '€25,000', deadline: '2026-01-15', openingDate: '2025-11-01', link: 'https://www.uva.nl', photo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '24', name: 'Karolinska Institute', country: 'Shvetsiya', grantType: 'KI Global Master\'s', amount: 'To\'liq (Tuition)', deadline: '2026-01-15', openingDate: '2025-10-15', link: 'https://ki.se', photo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '25', name: 'University of Copenhagen', country: 'Daniya', grantType: 'Danish Government', amount: 'To\'liq + Stipendiya', deadline: '2026-01-15', openingDate: '2025-11-01', link: 'https://www.ku.dk', photo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '26', name: 'LMU Munich', country: 'Germaniya', grantType: 'LMU Excellence', amount: '€1,000/oy', deadline: '2026-05-15', openingDate: '2026-03-01', link: 'https://www.lmu.de', photo: 'https://images.unsplash.com/photo-1523050853063-9158a65d2057?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '27', name: 'Nanyang Technological University', country: 'Singapur', grantType: 'Nanyang Scholarship', amount: 'To\'liq + Yashash', deadline: '2026-03-15', openingDate: '2025-10-01', link: 'https://www.ntu.edu.sg', photo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '28', name: 'Australian National University', country: 'Avstraliya', grantType: 'Chancellor\'s Int\'l', amount: '50% Tuition', deadline: '2026-12-31', openingDate: '2026-01-01', link: 'https://www.anu.edu.au', photo: 'https://images.unsplash.com/photo-1563200022-77761805741f?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '29', name: 'Kyoto University', country: 'Yaponiya', grantType: 'ADB-JSP', amount: 'To\'liq + Yashash', deadline: '2026-05-20', openingDate: '2026-01-15', link: 'https://www.kyoto-u.ac.jp', photo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '30', name: 'KAIST', country: 'Janubiy Koreya', grantType: 'KAIST International', amount: 'To\'liq + Stipendiya', deadline: '2026-01-15', openingDate: '2025-09-01', link: 'https://www.kaist.ac.kr', photo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '31', name: 'Peking University', country: 'Xitoy', grantType: 'Yenching Academy', amount: 'To\'liq + Yashash', deadline: '2025-12-01', openingDate: '2025-08-15', link: 'https://www.pku.edu.cn', photo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '32', name: 'University of Sydney', country: 'Avstraliya', grantType: 'Vice-Chancellor\'s', amount: '$40,000', deadline: '2026-01-15', openingDate: '2025-10-01', link: 'https://www.sydney.edu.au', photo: 'https://images.unsplash.com/photo-1523050853063-9158a65d2057?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '33', name: 'University of British Columbia', country: 'Kanada', grantType: 'Karen McKellin', amount: 'To\'liq', deadline: '2025-12-01', openingDate: '2025-09-01', link: 'https://www.ubc.ca', photo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '34', name: 'Heidelberg University', country: 'Germaniya', grantType: 'Amirana Scholarship', amount: '€1,000/oy', deadline: '2026-07-15', openingDate: '2026-05-01', link: 'https://www.uni-heidelberg.de', photo: 'https://images.unsplash.com/photo-1563200022-77761805741f?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '35', name: 'PSL University', country: 'Fransiya', grantType: 'PSL Excellence', amount: '€1,200/oy', deadline: '2026-03-15', openingDate: '2026-01-01', link: 'https://psl.eu', photo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '36', name: 'Sorbonne University', country: 'Fransiya', grantType: 'Eiffel Excellence', amount: '€1,181/oy', deadline: '2026-01-10', openingDate: '2025-10-01', link: 'https://www.sorbonne-universite.fr', photo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '37', name: 'Cornell University', country: 'AQSH', grantType: 'Tata Scholarship', amount: 'To\'liq', deadline: '2026-01-02', openingDate: '2025-08-15', link: 'https://www.cornell.edu', photo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '38', name: 'Johns Hopkins University', country: 'AQSH', grantType: 'Financial Aid', amount: 'To\'liq', deadline: '2026-01-05', openingDate: '2025-09-01', link: 'https://www.jhu.edu', photo: 'https://images.unsplash.com/photo-1523050853063-9158a65d2057?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '39', name: 'University of Chicago', country: 'AQSH', grantType: 'Odyssey Scholarship', amount: 'To\'liq + Stipendiya', deadline: '2026-01-02', openingDate: '2025-08-15', link: 'https://www.uchicago.edu', photo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=800&h=600' },
  { id: '40', name: 'King\'s College London', country: 'Buyuk Britaniya', grantType: 'Desmond Tutu', amount: '£1,000', deadline: '2026-03-31', openingDate: '2026-01-01', link: 'https://www.kcl.ac.uk', photo: 'https://images.unsplash.com/photo-1563200022-77761805741f?auto=format&fit=crop&q=80&w=800&h=600' },
];

// --- Components ---

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  premium = false,
  isDarkMode = false
}: {
  icon: any,
  label: string,
  active: boolean,
  onClick: () => void,
  premium?: boolean,
  isDarkMode?: boolean
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active
        ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
        : isDarkMode
          ? "text-slate-400 hover:bg-slate-800 hover:text-white"
          : "text-slate-600 hover:bg-slate-100"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : isDarkMode ? "text-slate-500 group-hover:text-brand-blue" : "text-slate-400 group-hover:text-brand-blue")} />
    <span className="font-medium text-sm text-left flex-1">{label}</span>
    {premium && (
      <Crown className={cn("w-4 h-4", active ? "text-premium-gold" : "text-premium-gold")} />
    )}
    {active && <ChevronRight className="w-4 h-4" />}
  </button>
);

const PremiumBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-premium-gold/10 text-premium-gold text-[10px] font-bold uppercase tracking-wider border border-premium-gold/20">
    <Crown className="w-3 h-3" />
    Premium
  </span>
);

const UniversityLogo = ({ name, link }: { name: string, link?: string }) => {
  const [error, setError] = useState(false);
  const domain = useMemo(() => {
    if (!link) return null;
    try {
      return new URL(link).hostname.replace('www.', '');
    } catch {
      return null;
    }
  }, [link]);

  // Use Google Favicon API as it works reliably
  if (domain && !error) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt={name}
        className="w-8 h-8 object-contain"
        onError={() => setError(true)}
      />
    );
  }

  // Fallback: colored circle with first letter
  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-full h-full rounded-xl flex items-center justify-center text-white font-black text-xl uppercase"
      style={{ background: color }}
    >
      {name.charAt(0)}
    </div>
  );
};

const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <div className="absolute inset-0 bg-brand-blue/20 rounded-xl blur-lg animate-pulse" />
    <div className="relative w-full h-full bg-gradient-to-br from-brand-blue to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 border border-white/20">
      <GraduationCap className="w-1/2 h-1/2 text-white" strokeWidth={2.5} />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
        <MapIcon className="w-2 h-2 text-white" />
      </div>
    </div>
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<Section>('database');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [premiumStep, setPremiumStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'uz' | 'en' | 'ru'>('uz');
  const t = TRANSLATIONS[language];

  // --- Auth state ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ email: '', password: '', first_name: '', last_name: '', phone_number: '' });
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // --- Universities from API ---
  const [apiUniversities, setApiUniversities] = useState<University[]>([]);
  const [isLoadingUnis, setIsLoadingUnis] = useState(false);
  const [uniSearchQuery, setUniSearchQuery] = useState('');

  // --- Eslatmalar (reminders) from API ---
  const [eslatmalar, setEslatmalar] = useState<any[]>([]);
  const [isLoadingEslatmalar, setIsLoadingEslatmalar] = useState(false);
  const [searchPageResults, setSearchPageResults] = useState<University[]>([]);


  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    email: '',
    photo: '',
    isPremium: false,
    joinedDate: '',
    savedGrants: 0,
    applications: 0
  });

  // Load universities from API - fetch all pages
  useEffect(() => {
    if (!isLoggedIn) return;
    setIsLoadingUnis(true);
    const fetchAll = async () => {
      let url = `${API_BASE}/universiteties/?page=1`;
      const all: University[] = [];
      const token = localStorage.getItem('access_token');
      while (url) {
        const res = await fetch(url, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
        const data = await res.json();
        if (data.results) {
          data.results.forEach((u: any) => all.push({
            id: String(u.id),
            name: u.university_name,
            country: u.state,
            grantType: u.grant_name,
            amount: u.grand_amount,
            deadline: u.reception_end,
            openingDate: u.reception_start,
            link: '',
            photo: '',
          }));
        }
        url = data.next || null;
        if (all.length > 200) break; // safety limit
      }
      setApiUniversities(all);
      setIsLoadingUnis(false);
    };
    fetchAll().catch(() => setIsLoadingUnis(false));
  }, [isLoggedIn]);

  // Load user profile from API
  useEffect(() => {
    if (!isLoggedIn || !currentUserId) return;
    apiFetch(`/users/${currentUserId}/`)
      .then(r => r.json())
      .then(data => {
        setUserProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          middleName: data.sharif || '',
          phone: data.phone_number || '',
          email: data.email || '',
          photo: data.image || '',
          isPremium: false,
          joinedDate: data.created_at ? data.created_at.split('T')[0] : '',
          savedGrants: 0,
          applications: 0,
        });
        setProfileForm({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          middleName: data.sharif || '',
          phone: data.phone_number || '',
          email: data.email || '',
          photo: data.image || '',
          isPremium: false,
          joinedDate: data.created_at ? data.created_at.split('T')[0] : '',
          savedGrants: 0,
          applications: 0,
        });
      })
      .catch(() => { });
  }, [isLoggedIn, currentUserId]);

  // Load eslatmalar from API - only current user's
  useEffect(() => {
    if (!isLoggedIn || !currentUserId) return;
    setIsLoadingEslatmalar(true);
    apiFetch(`/eslatmalar/?user=${currentUserId}`)
      .then(r => r.json())
      .then(data => { if (data.results) setEslatmalar(data.results); })
      .catch(() => { })
      .finally(() => setIsLoadingEslatmalar(false));
  }, [isLoggedIn, currentUserId]);

  // Notifications from eslatmalar - only current user's
  useEffect(() => {
    if (!isLoggedIn || !currentUserId) return;
    apiFetch(`/eslatmalar/?user=${currentUserId}`)
      .then(r => r.json())
      .then(data => {
        if (data.results) {
          const notifs = data.results.slice(0, 5).map((e: any) => ({
            id: String(e.id),
            title: e.eslatma_matni?.substring(0, 50) || 'Eslatma',
            message: e.eslatma_matni || '',
            time: e.qolgan_kun ? `${e.qolgan_kun} qoldi` : e.created_at?.split('T')[0] || '',
            type: (e.qolgan_kun && parseInt(e.qolgan_kun) <= 7) ? 'warning' : 'info' as 'warning' | 'info',
            isRead: false,
          }));
          setNotifications(notifs);
        }
      })
      .catch(() => { });
  }, [isLoggedIn, currentUserId]);
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError("Email va parol kiriting");
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh || '');
        // Get current user - use email filter directly
        let found: any = null;
        try {
          // First try exact email filter (faster, more reliable)
          const emailRes = await fetch(`${API_BASE}/users/?email=${encodeURIComponent(loginEmail)}`, {
            headers: { 'Authorization': `Bearer ${data.access}` },
          });
          const emailData = await emailRes.json();
          found = emailData.results?.find((u: any) => u.email === loginEmail) || emailData.results?.[0];

          // Fallback: search query
          if (!found) {
            const searchRes = await fetch(`${API_BASE}/users/?search=${encodeURIComponent(loginEmail)}`, {
              headers: { 'Authorization': `Bearer ${data.access}` },
            });
            const searchData = await searchRes.json();
            found = searchData.results?.find((u: any) => u.email === loginEmail) || searchData.results?.[0];
            // If still not found, iterate pages
            if (!found && searchData.next) {
              let nextUrl = searchData.next;
              while (nextUrl && !found) {
                const pageRes = await fetch(nextUrl, { headers: { 'Authorization': `Bearer ${data.access}` } });
                const pageData = await pageRes.json();
                found = pageData.results?.find((u: any) => u.email === loginEmail);
                nextUrl = pageData.next;
              }
            }
          }
        } catch { }
        if (found) {
          setCurrentUserId(found.id);
          // Fetch full user data from /users/{id}/ — the list endpoint may omit some fields
          try {
            const fullRes = await fetch(`${API_BASE}/users/${found.id}/`, {
              headers: { 'Authorization': `Bearer ${data.access}` },
            });
            const fullUser = fullRes.ok ? await fullRes.json() : found;
            const profileData = {
              firstName: fullUser.first_name || found.first_name || '',
              lastName: fullUser.last_name || found.last_name || '',
              middleName: fullUser.sharif || found.sharif || '',
              phone: fullUser.phone_number || found.phone_number || '',
              email: fullUser.email || found.email || '',
              photo: fullUser.image || found.image || '',
              isPremium: false,
              joinedDate: (fullUser.created_at || found.created_at || '').split('T')[0],
              savedGrants: 0,
              applications: 0,
            };
            setUserProfile(profileData);
            setProfileForm(profileData);
          } catch {
            const profileData = {
              firstName: found.first_name || '',
              lastName: found.last_name || '',
              middleName: found.sharif || '',
              phone: found.phone_number || '',
              email: found.email || '',
              photo: found.image || '',
              isPremium: false,
              joinedDate: found.created_at ? found.created_at.split('T')[0] : '',
              savedGrants: 0,
              applications: 0,
            };
            setUserProfile(profileData);
            setProfileForm(profileData);
          }
        }
        setIsLoggedIn(true);
      } else {
        setLoginError(data.detail || data.non_field_errors?.[0] || "Email yoki parol noto'g'ri");
      }
    } catch {
      setLoginError("Serverga ulanishda xatolik");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- Register handler ---
  const handleRegister = async () => {
    if (!regForm.email || !regForm.password) {
      setRegError("Email va parol majburiy");
      return;
    }
    setIsRegistering(true);
    setRegError('');
    try {
      const res = await fetch(`${API_BASE}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (res.ok && (res.status === 200 || res.status === 201)) {
        // Auto-login after register
        setLoginEmail(regForm.email);
        setLoginPassword(regForm.password);
        setShowRegister(false);
        alert("Ro'yxatdan o'tdingiz! Kirish tugmasini bosing.");
      } else {
        const errMsg = Object.values(data).flat().join(', ');
        setRegError(errMsg || "Xatolik yuz berdi");
      }
    } catch {
      setRegError("Serverga ulanishda xatolik");
    } finally {
      setIsRegistering(false);
    }
  };
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    country: 'O\'zbekiston'
  });
  const [gpa, setGpa] = useState<string>("3.5");
  const [ielts, setIelts] = useState<string>("6.5");
  const [selectedMajor, setSelectedMajor] = useState<string>(TRANSLATIONS.uz.majors[0]);
  const [searchCountry, setSearchCountry] = useState<string>("");
  const [searchLevel, setSearchLevel] = useState<string>("Bakalavr");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(userProfile);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async () => {
    if (currentUserId) {
      try {
        // Upload photo separately via multipart/form-data if a new photo was selected
        if (pendingPhotoFile) {
          const formData = new FormData();
          formData.append('image', pendingPhotoFile);
          const token = localStorage.getItem('access_token');
          await fetch(`https://scholarmap.uz/api/v1/users/${currentUserId}/`, {
            method: 'PATCH',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData,
          });
          setPendingPhotoFile(null);
        }
        // Update other profile fields as JSON
        await apiFetch(`/users/${currentUserId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: profileForm.firstName,
            last_name: profileForm.lastName,
            sharif: profileForm.middleName,
            phone_number: profileForm.phone,
          }),
        });
      } catch { }
    }
    setUserProfile(profileForm);
    setIsEditingProfile(false);
  };


  const handlePasswordChange = async () => {
    if (!passwordForm.current) {
      setPasswordError('Joriy parolni kiriting');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError(t.errorMatch);
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError(t.errorShort);
      return;
    }
    try {
      const res = await apiFetch(`/auth/users/set_password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: passwordForm.new, current_password: passwordForm.current }),
      });
      if (res.ok) {
        alert(t.passwordChanged);
        setIsChangingPassword(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
        setPasswordError('');
      } else {
        const data = await res.json();
        setPasswordError(data.current_password?.[0] || data.detail || 'Xatolik yuz berdi');
      }
    } catch {
      setPasswordError('Serverga ulanishda xatolik');
    }
  };

  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Toast notification state
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Eslatma modal state
  const [eslatmaModal, setEslatmaModal] = useState<{ uni: any } | null>(null);
  const [eslatmaType, setEslatmaType] = useState<'gmail' | 'bot'>('gmail');
  const [eslatmaChatId, setEslatmaChatId] = useState<string>('');
  const [eslatmaDate, setEslatmaDate] = useState<string>('');

  const [notarySelected, setNotarySelected] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'payme' | 'click' | 'stripe' | null>(null);
  const [sourceLang, setSourceLang] = useState<string>("O'zbek tili");
  const [targetLang, setTargetLang] = useState<string>("Ingliz tili");
  const [translationResult, setTranslationResult] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setTranslationResult(""); // Clear previous result
    }
  };

  const handleTranslate = async () => {
    if (!uploadedFile) {
      alert("Iltimos, avval hujjatni yuklang.");
      return;
    }
    setIsTranslating(true);
    setTranslationResult("");
    try {
      const langCodeMap: Record<string, string> = {
        "O'zbek tili": "uz", "Rus tili": "ru", "Ingliz tili": "en",
        "Nemis tili": "de", "Fransuz tili": "fr", "Yapon tili": "ja",
      };
      const targetCode = langCodeMap[targetLang] || "en";

      // Try /ai-chat/ (handles PDF), fallback to /super-ai-translate/
      const tryTranslate = async (endpoint: string, fd: FormData) => {
        return apiFetch(endpoint, { method: 'POST', body: fd });
      };

      const fd1 = new FormData();
      fd1.append('file', uploadedFile);
      fd1.append('target_lang', targetCode);
      fd1.append('response_type', 'text');
      fd1.append('text', `${sourceLang} tilidan ${targetLang} tiliga professional tarjima qil`);

      let res = await tryTranslate(`/ai-chat/`, fd1);

      if (!res.ok) {
        const fd2 = new FormData();
        fd2.append('file', uploadedFile);
        fd2.append('target_lang', targetCode);
        fd2.append('response_type', 'text');
        res = await tryTranslate(`/super-ai-translate/`, fd2);
      }

      if (res.ok) {
        const data = await res.json();
        const result = data.text || data.response || data.result || JSON.stringify(data);
        // Clean up JSON error wrapper if present
        if (typeof result === 'string' && result.startsWith('{"error"')) {
          const parsed = JSON.parse(result);
          alert(`Backend xatosi: ${parsed.error}`);
        } else {
          // Clean literal \n escape sequences → real newlines, strip outer quotes
          const cleaned = result
            .replace(/^"|"$/g, '')          // remove surrounding double-quotes
            .replace(/\\n/g, '\n')           // literal \n → real newline
            .replace(/\\t/g, '\t')           // literal \t → tab
            .replace(/\\"/g, '"');           // unescape \" → "
          setTranslationResult(cleaned);

        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Tarjima xatosi: ${errData.error || errData.detail || errData.text || res.statusText}`);
      }
    } catch (error: any) {
      alert(`Ulanishda xatolik: ${error.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const downloadAsPDF = () => {
    if (!translationResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235); // Brand blue
    doc.text("ScholarMap - Tarjima Natijasi", margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`${sourceLang} -> ${targetLang}`, margin, 28);

    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, 32, pageWidth - margin, 32);

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85); // Slate 700

    const splitText = doc.splitTextToSize(translationResult, maxLineWidth);

    // Handle pagination
    let cursorY = 42;
    const pageHeight = doc.internal.pageSize.getHeight();

    splitText.forEach((line: string) => {
      if (cursorY > pageHeight - 20) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, margin, cursorY);
      cursorY += 7;
    });

    doc.save(`ScholarMap_Tarjima_${targetLang.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadEligibilityReport = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('ScholarMap - Loyiqlik Hisoboti', margin, 22);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`GPA: ${gpa}   |   IELTS: ${ielts}   |   Yo'nalish: ${selectedMajor}`, margin, 32);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 36, pageWidth - margin, 36);
    // Score
    doc.setFontSize(36);
    doc.setTextColor(37, 99, 235);
    doc.text(`~${eligibilityScore}%`, margin, 62);
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('Loyiqlik ehtimoli', margin, 72);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const note = doc.splitTextToSize(
      "Sizning ko'rsatkichlaringiz tanlangan yo'nalish bo'yicha yuqori natija bermoqda. ScholarMap tahlili asosida tuzilgan.",
      pageWidth - margin * 2
    );
    doc.text(note, margin, 82);
    // Top universities
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 96, pageWidth - margin, 96);
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text('Eng mos universitetlar', margin, 106);
    topMatchedUniversities.forEach((uni, idx) => {
      const y = 116 + idx * 20;
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text(`${idx + 1}. ${uni.name}`, margin, y);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`   ${uni.country} | ${uni.grantType} | ${uni.amount}`, margin, y + 6);
      doc.setTextColor(37, 99, 235);
      doc.text(`${uni.matchPct}%`, pageWidth - margin - 10, y, { align: 'right' });
    });
    doc.save('ScholarMap_Eligibility_Report.pdf');
  };

  const chartData = useMemo(() => [
    { name: 'GPA', value: Math.min(100, (parseFloat(gpa) / 5) * 100), full: 100 },
    { name: 'IELTS', value: Math.min(100, (parseFloat(ielts) / 9) * 100), full: 100 },
    { name: 'Hujjatlar', value: 75, full: 100 },
    { name: 'Tajriba', value: 60, full: 100 },
  ], [gpa, ielts]);

  // Calculate real eligibility % based on GPA, IELTS and selected major
  const eligibilityScore = useMemo(() => {
    const g = parseFloat(gpa) || 0;
    const i = parseFloat(ielts) || 0;
    const gpaScore = Math.min(100, (g / 5) * 100);          // max 5.0
    const ieltsScore = Math.min(100, ((i - 4) / 5) * 100); // 4–9 scale
    const majorBonus = selectedMajor ? 10 : 0;
    return Math.round(Math.min(100, (gpaScore * 0.4 + ieltsScore * 0.5 + majorBonus)));
  }, [gpa, ielts, selectedMajor]);

  // Top-5 matched universities based on user profile
  const topMatchedUniversities = useMemo(() => {
    const allUnis = apiUniversities.length > 0 ? apiUniversities : MOCK_UNIVERSITIES;
    const g = parseFloat(gpa) || 0;
    const i = parseFloat(ielts) || 0;
    return allUnis
      .map(uni => {
        const gpaScore = Math.min(100, (g / 5) * 100);
        const ieltsScore = Math.min(100, ((i - 4) / 5) * 100);
        // Bonus if major keyword matches grant type or university name
        const majorMatch = selectedMajor &&
          (uni.grantType?.toLowerCase().includes(selectedMajor.toLowerCase()) ||
           uni.name?.toLowerCase().includes(selectedMajor.toLowerCase())) ? 15 : 0;
        // Small randomisation per-university so they differ
        const seed = (uni.id.charCodeAt(0) + uni.id.charCodeAt(uni.id.length - 1)) % 10;
        const matchPct = Math.min(99, Math.round(gpaScore * 0.35 + ieltsScore * 0.45 + majorMatch + seed));
        return { ...uni, matchPct };
      })
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 5);
  }, [apiUniversities, gpa, ielts, selectedMajor]);

  const getTranslatedUni = (uni: University) => {
    const countryMap: Record<string, string> = {
      'USA': t.countries[1],
      'UK': t.countries[2],
      'Germany': t.countries[3],
      'Canada': t.countries[4],
      'Australia': t.countries[5],
      'Japan': t.countries[6],
      'South Korea': t.countries[7],
      'China': t.countries[8],
      'France': t.countries[9],
      'Switzerland': t.countries[14],
      'Singapore': t.countries[22],
    };

    const amountMap: Record<string, string> = {
      'full_stipend': `${t.full} + ${t.stipend}`,
      'full_living': `${t.full} + ${t.living}`,
      'full_80k': `${t.full} ($80,000+)`,
      'tuition_100': `${t.tuition} 100%`,
      'full_18k': `${t.full} + £18,000`,
      'full_20k': `${t.full} + £20,000`,
      'chf_12k': `CHF 12,000/${t.month}`,
      'gbp_15k': `£15,000`,
      'full_22k': `${t.full} + £22,000`,
    };

    return {
      ...uni,
      country: countryMap[uni.country] || uni.country,
      amount: amountMap[uni.amount] || uni.amount
    };
  };

  const renderSection = () => {
    // Use API universities if loaded, fallback to MOCK
    const activeUniversities = apiUniversities.length > 0 ? apiUniversities : MOCK_UNIVERSITIES;
    switch (activeSection) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8"
          >
            {/* Profile Header Card */}
            <div className={cn(
              "rounded-[2.5rem] border overflow-hidden transition-colors",
              isDarkMode ? "bg-slate-800 border-slate-700 shadow-2xl" : "bg-white border-slate-100 shadow-xl"
            )}>
              <div className="h-40 bg-gradient-to-r from-brand-blue to-purple-600 relative">
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 flex flex-col md:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className={cn(
                      "w-32 h-32 rounded-full p-1 shadow-2xl transition-colors",
                      isDarkMode ? "bg-slate-800" : "bg-white"
                    )}>
                      <div className={cn(
                        "w-full h-full rounded-full flex items-center justify-center overflow-hidden border transition-colors",
                        isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-100 border-slate-100"
                      )}>
                        {profileForm.photo ? (
                          <img src={profileForm.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className={cn("w-12 h-12", isDarkMode ? "text-slate-500" : "text-slate-300")} />
                        )}
                      </div>
                    </div>
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg border-4 transition-colors" style={{ borderColor: isDarkMode ? '#1e293b' : '#ffffff' }}>
                      <Camera className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                  </div>
                  <div className="mb-2 pb-1 text-center md:text-left">
                    <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                      {userProfile.lastName} {userProfile.firstName} {userProfile.middleName}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                      {userProfile.isPremium ? (
                        <span className="px-3 py-1 bg-amber-400 text-amber-900 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-400/20">
                          <Crown className="w-3 h-3" /> {t.premiumPlan}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                          {t.freePlan}
                        </span>
                      )}
                      <span className="text-white/80 text-xs font-medium">{t.joinedDate}: {userProfile.joinedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-8">
                  {!isEditingProfile ? (
                    <button
                      onClick={() => {
                        setProfileForm(userProfile);
                        setIsEditingProfile(true);
                      }}
                      className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-xl transition-all flex items-center gap-2 border border-white/20"
                    >
                      <Edit2 className="w-4 h-4" /> {t.edit}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileForm(userProfile);
                        }}
                        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand-blue/20"
                      >
                        <Save className="w-4 h-4" /> {t.save}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-24 md:pt-20 pb-8 px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Form Card */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", isDarkMode ? "text-slate-400" : "text-slate-400")}>{t.firstName}</label>
                        <input
                          type="text"
                          disabled={!isEditingProfile}
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          className={cn(
                            "w-full px-5 py-3.5 rounded-2xl border outline-none focus:ring-4 transition-all font-medium",
                            isDarkMode
                              ? "bg-slate-700 border-slate-600 text-white focus:ring-brand-blue/20 disabled:bg-slate-800 disabled:text-slate-500"
                              : "bg-white border-slate-200 text-slate-800 focus:ring-brand-blue/10 disabled:bg-slate-50 disabled:text-slate-500"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lastName}</label>
                        <input
                          type="text"
                          disabled={!isEditingProfile}
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          className={cn(
                            "w-full px-5 py-3.5 rounded-2xl border outline-none focus:ring-4 transition-all font-medium",
                            isDarkMode
                              ? "bg-slate-700 border-slate-600 text-white focus:ring-brand-blue/20 disabled:bg-slate-800 disabled:text-slate-500"
                              : "bg-white border-slate-200 text-slate-800 focus:ring-brand-blue/10 disabled:bg-slate-50 disabled:text-slate-500"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.middleName}</label>
                        <input
                          type="text"
                          disabled={!isEditingProfile}
                          value={profileForm.middleName}
                          onChange={(e) => setProfileForm({ ...profileForm, middleName: e.target.value })}
                          className={cn(
                            "w-full px-5 py-3.5 rounded-2xl border outline-none focus:ring-4 transition-all font-medium",
                            isDarkMode
                              ? "bg-slate-700 border-slate-600 text-white focus:ring-brand-blue/20 disabled:bg-slate-800 disabled:text-slate-500"
                              : "bg-white border-slate-200 text-slate-800 focus:ring-brand-blue/10 disabled:bg-slate-50 disabled:text-slate-500"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.phone}</label>
                        <input
                          type="text"
                          disabled={!isEditingProfile}
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className={cn(
                            "w-full px-5 py-3.5 rounded-2xl border outline-none focus:ring-4 transition-all font-medium",
                            isDarkMode
                              ? "bg-slate-700 border-slate-600 text-white focus:ring-brand-blue/20 disabled:bg-slate-800 disabled:text-slate-500"
                              : "bg-white border-slate-200 text-slate-800 focus:ring-brand-blue/10 disabled:bg-slate-50 disabled:text-slate-500"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.email}</label>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            disabled={!isEditingProfile}
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className={cn(
                              "w-full pl-14 pr-5 py-3.5 rounded-2xl border outline-none focus:ring-4 transition-all font-medium",
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-white focus:ring-brand-blue/20 disabled:bg-slate-800 disabled:text-slate-500"
                                : "bg-white border-slate-200 text-slate-800 focus:ring-brand-blue/10 disabled:bg-slate-50 disabled:text-slate-500"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security & Password */}
                  <div className="space-y-6">
                    <div className={cn(
                      "rounded-3xl p-6 border transition-colors",
                      isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="w-5 h-5 text-brand-blue" />
                        <h3 className={cn("text-sm font-bold uppercase tracking-widest", isDarkMode ? "text-brand-blue" : "text-brand-blue")}>{t.security}</h3>
                      </div>

                      {!isChangingPassword ? (
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className={cn(
                            "w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                            isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <Key className="w-4 h-4" /> {t.changePassword}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <input
                              type="password"
                              placeholder="Joriy parol"
                              value={passwordForm.current}
                              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                              className={cn(
                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm",
                                isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-200"
                              )}
                            />
                          </div>
                          <div className="space-y-1">
                            <input
                              type="password"
                              placeholder={t.newPassword}
                              value={passwordForm.new}
                              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                              className={cn(
                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm",
                                isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-200"
                              )}
                            />
                          </div>
                          <div className="space-y-1">
                            <input
                              type="password"
                              placeholder={t.confirmPassword}
                              value={passwordForm.confirm}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                              className={cn(
                                "w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm",
                                isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-200"
                              )}
                            />
                          </div>
                          {passwordError && <p className="text-red-500 text-[10px] font-bold">{passwordError}</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setIsChangingPassword(false);
                                setPasswordForm({ current: '', new: '', confirm: '' });
                                setPasswordError('');
                              }}
                              className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                            >
                              {t.cancel}
                            </button>
                            <button
                              onClick={handlePasswordChange}
                              className="flex-1 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg shadow-lg shadow-brand-blue/20"
                            >
                              {t.save}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={cn(
                      "rounded-3xl p-6 border transition-colors",
                      isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-100"
                    )}>
                      <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-5 h-5 text-indigo-500" />
                        <h3 className={cn("text-sm font-bold uppercase tracking-widest", isDarkMode ? "text-indigo-400" : "text-indigo-500")}>{t.preferences}</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Moon className={cn("w-4 h-4", isDarkMode ? "text-brand-blue" : "text-slate-400")} />
                            <span className={cn("text-sm font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>{t.darkMode}</span>
                          </div>
                          <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-colors duration-300",
                              isDarkMode ? "bg-brand-blue" : "bg-slate-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300",
                              isDarkMode ? "right-1" : "left-1"
                            )} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-sm font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>{t.systemLanguage}</span>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className={cn(
                              "text-xs font-bold rounded-lg px-2 py-1 outline-none transition-colors",
                              isDarkMode ? "bg-slate-800 text-white border-slate-600" : "bg-white text-slate-700 border border-slate-200"
                            )}
                          >
                            <option value="uz">O'zbekcha</option>
                            <option value="en">English</option>
                            <option value="ru">Русский</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Card */}
            <div className={cn(
              "rounded-[2.5rem] p-8 border shadow-2xl relative overflow-hidden group transition-colors",
              isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-900 border-slate-800"
            )}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-blue/20 transition-all" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{t.premiumTitle}</h3>
                    <p className="text-slate-400 font-medium">{t.premiumDesc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="w-full md:w-auto px-10 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-blue/20 uppercase tracking-widest text-xs"
                >
                  {t.premiumUpgrade}
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 'database':
        return (
          <motion.div
            key="database"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className={cn("text-2xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{t.grantDatabase}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={uniSearchQuery}
                  onChange={e => setUniSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setIsLoadingUnis(true);
                      const params = new URLSearchParams();
                      if (uniSearchQuery) {
                        params.append('university_name', uniSearchQuery);
                        params.append('state', uniSearchQuery);
                        params.append('search', uniSearchQuery);
                      }
                      if (searchLevel) params.append('level', searchLevel);
                      apiFetch(`/universiteties/?${params.toString()}`)
                        .then(r => r.json())
                        .then(data => {
                          if (data.results) {
                            setApiUniversities(data.results.map((u: any) => ({
                              id: String(u.id), name: u.university_name, country: u.state,
                              grantType: u.grant_name, amount: u.grand_amount,
                              deadline: u.reception_end, openingDate: u.reception_start,
                              link: u.link || '', photo: u.photo || '',
                            })));
                          }
                        })
                        .catch(() => { })
                        .finally(() => setIsLoadingUnis(false));
                    }
                  }}
                  placeholder={t.searchPlaceholder}
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all font-medium",
                    isDarkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-brand-blue/30" : "bg-white border-slate-200 focus:ring-brand-blue/20"
                  )}
                />
              </div>
              <select
                value={searchLevel}
                onChange={e => setSearchLevel(e.target.value)}
                className={cn(
                  "px-4 py-4 rounded-2xl border outline-none font-medium transition-all appearance-none cursor-pointer",
                  isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-700"
                )}>
                <option value="">{t.educationLevel}</option>
                {t.levels.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
              <button
                onClick={() => {
                  setIsLoadingUnis(true);
                  const params = new URLSearchParams();
                  if (uniSearchQuery) {
                    params.append('university_name', uniSearchQuery);
                    params.append('state', uniSearchQuery);
                    params.append('search', uniSearchQuery);
                  }
                  if (searchLevel) params.append('level', searchLevel);
                  apiFetch(`/universiteties/?${params.toString()}`)
                    .then(r => r.json())
                    .then(data => {
                      if (data.results) {
                        setApiUniversities(data.results.map((u: any) => ({
                          id: String(u.id), name: u.university_name, country: u.state,
                          grantType: u.grant_name, amount: u.grand_amount,
                          deadline: u.reception_end, openingDate: u.reception_start,
                          link: u.link || '', photo: u.photo || '',
                        })));
                      }
                    })
                    .catch(() => { })
                    .finally(() => setIsLoadingUnis(false));
                }}
                className="bg-brand-blue text-white px-6 py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-3 active:scale-[0.98]">
                <Filter className="w-5 h-5" />
                {t.filter}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {isLoadingUnis ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
                </div>
              ) : activeUniversities.map((uniRaw) => {
                const uni = getTranslatedUni(uniRaw);
                return (
                  <div key={uni.id} className={cn(
                    "p-6 rounded-3xl border shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group",
                    isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-100"
                  )}>
                    <div className="flex items-center gap-5 relative z-10">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-colors overflow-hidden",
                        isDarkMode ? "bg-slate-700" : "bg-blue-50"
                      )}>
                        <UniversityLogo name={uni.name} link={uni.link} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={cn("text-lg font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{uni.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className={cn(
                            "text-xs font-medium",
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          )}>
                            {uni.country} • {uni.grantType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">GRANT SUMMASI</p>
                        <p className={cn("text-lg font-bold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>{uni.amount}</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">DEADLINE</p>
                        <p className="text-lg font-bold text-red-500">{uni.deadline}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEslatmaModal({ uni });
                            setEslatmaDate(uni.deadline || '');
                            setEslatmaType('gmail');
                          }}
                          className={cn(
                            "p-2.5 rounded-xl transition-all",
                            isDarkMode ? "bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-50 text-slate-400 hover:text-brand-blue"
                          )}>
                          <Bell className="w-5 h-5" />
                        </button>
                        <a
                          href={uni.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-[0.98]",
                            isDarkMode
                              ? "bg-slate-700 text-white hover:bg-slate-600 shadow-slate-900/20"
                              : "bg-[#1a1c1e] text-white hover:bg-black shadow-slate-900/20"
                          )}
                        >
                          Rasmiy sayt <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'search':
        return (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 max-w-5xl mx-auto"
          >
            <div className={cn(
              "p-8 rounded-[2.5rem] border shadow-2xl transition-colors",
              isDarkMode ? "bg-slate-800 border-slate-700 shadow-slate-950/50" : "bg-white border-slate-100 shadow-slate-200/50"
            )}>
              <h2 className={cn("text-2xl font-black tracking-tight mb-8", isDarkMode ? "text-white" : "text-slate-800")}>{t.searchGrants}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.selectCountry}</label>
                  <select
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className={cn(
                      "w-full px-5 py-4 rounded-2xl border outline-none font-medium transition-all appearance-none cursor-pointer",
                      isDarkMode ? "bg-slate-900 border-slate-700 text-white focus:ring-brand-blue/30" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-brand-blue/20"
                    )}
                  >
                    <option value="">{t.selectCountry}</option>
                    {t.countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.university}</label>
                  <select
                    className={cn(
                      "w-full px-5 py-4 rounded-2xl border outline-none font-medium transition-all appearance-none cursor-pointer",
                      isDarkMode ? "bg-slate-900 border-slate-700 text-white focus:ring-brand-blue/30" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-brand-blue/20"
                    )}
                  >
                    <option>{t.selectUniversity}</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.major}</label>
                  <select
                    value={selectedMajor}
                    onChange={e => setSelectedMajor(e.target.value)}
                    className={cn(
                    "w-full px-5 py-4 rounded-2xl border outline-none font-medium transition-all appearance-none cursor-pointer",
                    isDarkMode ? "bg-slate-900 border-slate-700 text-white focus:ring-brand-blue/30" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-brand-blue/20"
                  )}>
                    <option value="">{t.major}</option>
                    {t.majors.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.educationLevel}</label>
                  <select
                    value={searchLevel}
                    onChange={(e) => setSearchLevel(e.target.value)}
                    className={cn(
                      "w-full px-5 py-4 rounded-2xl border outline-none font-medium transition-all appearance-none cursor-pointer",
                      isDarkMode ? "bg-slate-900 border-slate-700 text-white focus:ring-brand-blue/30" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-brand-blue/20"
                    )}
                  >
                    {t.levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsLoadingUnis(true);
                  setSearchPageResults([]);
                  const params = new URLSearchParams();
                  if (searchCountry) params.append('state', searchCountry);
                  if (searchLevel && searchLevel !== t.educationLevel) params.append('level', searchLevel);
                  if (selectedMajor) params.append('directions', selectedMajor);
                  apiFetch(`/universiteties/?${params.toString()}`)
                    .then(r => r.json())
                    .then(async data => {
                      let all: University[] = (data.results || []).map((u: any) => ({
                        id: String(u.id), name: u.university_name, country: u.state,
                        grantType: u.grant_name, amount: u.grand_amount,
                        deadline: u.reception_end, openingDate: u.reception_start,
                        link: u.link || '', photo: u.photo || '',
                      }));
                      let nextUrl = data.next;
                      while (nextUrl) {
                        const token = localStorage.getItem('access_token');
                        const r2 = await fetch(nextUrl, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
                        const d2 = await r2.json();
                        (d2.results || []).forEach((u: any) => all.push({
                          id: String(u.id), name: u.university_name, country: u.state,
                          grantType: u.grant_name, amount: u.grand_amount,
                          deadline: u.reception_end, openingDate: u.reception_start,
                          link: u.link || '', photo: u.photo || '',
                        }));
                        nextUrl = d2.next;
                        if (all.length > 500) break;
                      }
                      // Fallback to MOCK if API returned nothing
                      if (all.length === 0) {
                        all = MOCK_UNIVERSITIES.filter(u => {
                          const cm = !searchCountry || u.country.toLowerCase().includes(searchCountry.toLowerCase());
                          const mm = !selectedMajor || u.grantType?.toLowerCase().includes(selectedMajor.toLowerCase());
                          return cm && mm;
                        });
                        if (all.length === 0) all = MOCK_UNIVERSITIES.slice(0, 10);
                      }
                      setSearchPageResults(all);
                    })
                    .catch(() => { })
                    .finally(() => setIsLoadingUnis(false));
                }}
                className="w-full mt-10 bg-brand-blue text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 shadow-2xl shadow-brand-blue/30 transition-all flex items-center justify-center gap-4 active:scale-[0.98]">
                <Search className="w-6 h-6" />
                {t.searchGrants}
              </button>
            </div>

            {/* Search results appear here on same page */}
            {isLoadingUnis && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
              </div>
            )}
            {!isLoadingUnis && searchPageResults.length > 0 && (
              <div className="space-y-4">
                <h3 className={cn("text-lg font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>
                  {searchPageResults.length} ta natija topildi
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {searchPageResults.map(uni => (
                    <div key={uni.id} className={cn(
                      "p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-lg",
                      isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"
                    )}>
                      <UniversityLogo name={uni.name} link={uni.link} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-black text-base tracking-tight truncate", isDarkMode ? "text-white" : "text-slate-800")}>{uni.name}</p>
                        <p className={cn("text-xs font-medium mt-0.5", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                          <MapPin className="inline w-3 h-3 mr-1" />{uni.country} • {uni.grantType}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1 shrink-0">
                        <span className="text-sm font-black text-emerald-500">{uni.amount}</span>
                        <span className={cn("text-xs font-bold", new Date(uni.deadline) < new Date() ? "text-red-500" : "text-brand-blue")}>
                          {uni.deadline}
                        </span>
                      </div>
                      {uni.link && (
                        <a href={uni.link} target="_blank" rel="noreferrer"
                          className="shrink-0 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all flex items-center gap-1.5">
                          Rasmiy sayt <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!isLoadingUnis && searchPageResults.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cn(
                  "p-8 rounded-3xl border transition-colors",
                  isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-brand-soft-blue border-brand-blue/10"
                )}>
                  <Clock className="w-10 h-10 text-brand-blue mb-5" />
                  <h4 className={cn("font-black text-lg tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{t.openingTime}</h4>
                  <p className={cn("text-sm font-medium mt-2 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-600")}>{t.openingTimeDesc}</p>
                </div>
                <div className={cn(
                  "p-8 rounded-3xl border transition-colors",
                  isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-emerald-50 border-emerald-200"
                )}>
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-5" />
                  <h4 className={cn("font-black text-lg tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{t.fullGrants}</h4>
                  <p className={cn("text-sm font-medium mt-2 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-600")}>{t.fullGrantsDesc}</p>
                </div>
                <div className={cn(
                  "p-8 rounded-3xl border transition-colors",
                  isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-amber-50 border-amber-200"
                )}>
                  <Bell className="w-10 h-10 text-amber-500 mb-5" />
                  <h4 className={cn("font-black text-lg tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{t.notifications}</h4>
                  <p className={cn("text-sm font-medium mt-2 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-600")}>{t.notificationsDesc}</p>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'eligibility':
        return (
          <motion.div
            key="eligibility"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <div className="lg:col-span-1 space-y-6">
              <div className={cn(
                "p-8 rounded-[2.5rem] border shadow-xl transition-colors",
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
              )}>
                <h3 className={cn("text-xl font-black tracking-tight mb-8", isDarkMode ? "text-white" : "text-slate-800")}>{t.profileData}</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.gpaRange}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="3"
                      max="5"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border outline-none font-medium transition-all",
                        isDarkMode ? "bg-slate-900 border-slate-700 text-white focus:ring-brand-blue/30" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-brand-blue/20"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.ieltsRange}</label>
                    <input
                      type="number"
                      step="0.5"
                      min="5.5"
                      max="9"
                      value={ielts}
                      onChange={(e) => setIelts(e.target.value)}
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border outline-none font-medium transition-all",
                        isDarkMode ? "bg-slate-900 border-slate-700 text-white focus:ring-brand-blue/30" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-brand-blue/20"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.major}</label>
                    <select
                      value={selectedMajor}
                      onChange={(e) => setSelectedMajor(e.target.value)}
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border outline-none font-medium transition-all appearance-none cursor-pointer",
                        isDarkMode ? "bg-slate-900 border-slate-700 text-white focus:ring-brand-blue/30" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-brand-blue/20"
                      )}
                    >
                      {t.majors.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-brand-blue p-8 rounded-[2.5rem] text-white shadow-2xl shadow-brand-blue/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                <h4 className="font-black text-xl tracking-tight mb-2 relative z-10">{t.eligibilityChance}</h4>
                <div className="text-5xl font-black mb-4 relative z-10">~{eligibilityScore}%</div>
                <p className="text-blue-100 text-sm font-medium leading-relaxed relative z-10">{t.eligibilityText}</p>
                <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                  <button onClick={downloadEligibilityReport} className="w-full bg-white text-brand-blue py-4 rounded-2xl font-black hover:bg-blue-50 transition-all active:scale-[0.98]">
                    {t.downloadReport}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className={cn(
                "p-10 rounded-[2.5rem] border shadow-2xl transition-colors",
                isDarkMode ? "bg-slate-800 border-slate-700 shadow-slate-950/50" : "bg-white border-slate-100 shadow-slate-200/50"
              )}>
                <h3 className={cn("text-2xl font-black tracking-tight mb-10", isDarkMode ? "text-white" : "text-slate-800")}>{t.eligibilityResult}</h3>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700 }} />
                      <YAxis hide />
                      <RechartsTooltip
                        cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                        contentStyle={{
                          borderRadius: '20px',
                          border: 'none',
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }}
                      />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : index === 1 ? '#10b981' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {topMatchedUniversities.map((uniRaw, i) => {
                    const uni = getTranslatedUni(uniRaw);
                    const pct = (uniRaw as any).matchPct ?? 90;
                    const pctColor = pct >= 85 ? 'text-emerald-500' : pct >= 70 ? 'text-amber-500' : 'text-red-400';
                    return (
                      <div key={uni.id} className={cn(
                        "p-5 rounded-3xl border transition-all flex items-center justify-between group hover:shadow-xl",
                        isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-100"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-colors",
                            isDarkMode ? "bg-slate-700 text-slate-400 group-hover:text-brand-blue" : "bg-slate-50 text-slate-400 group-hover:text-brand-blue"
                          )}>
                            {i < 9 ? `0${i + 1}` : i + 1}
                          </div>
                          <div>
                            <p className={cn("font-bold tracking-tight text-sm", isDarkMode ? "text-white" : "text-slate-800")}>{uni.name}</p>
                            <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest mt-0.5">{uni.grantType || t.fullGrants}: {uni.amount || '100%'}</p>
                          </div>
                        </div>
                        <div className={cn("font-black text-lg", pctColor)}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'deadlines':
  return (
    <motion.div
      key="deadlines"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-3xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{t.deadlines}</h2>
          <p className={cn("text-slate-500 font-medium mt-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.timeline}</p>
        </div>
        <div className={cn(
          "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm",
          isDarkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"
        )}>
          <AlertCircle className="w-5 h-5" />
          {t.importantNote}
        </div>
      </div>

      {/* User's saved eslatmalar from API - beautiful cards */}
      <div className={cn("rounded-[2rem] border overflow-hidden", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-xl")}>
        <div className={cn("px-8 py-5 flex items-center justify-between border-b", isDarkMode ? "border-slate-700 bg-slate-900/40" : "border-slate-100 bg-slate-50/50")}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand-blue" />
            </div>
            <h3 className={cn("font-black text-base tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>
              Sizning eslatmalaringiz
              <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-blue text-white text-xs font-bold">{eslatmalar.length}</span>
            </h3>
          </div>
          {isLoadingEslatmalar && <Loader2 className="w-5 h-5 animate-spin text-brand-blue" />}
        </div>
        {eslatmalar.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Bell className={cn("w-10 h-10", isDarkMode ? "text-slate-600" : "text-slate-300")} />
            <p className={cn("text-sm font-medium", isDarkMode ? "text-slate-500" : "text-slate-400")}>Hali eslatma qo'shilmagan. Quyidan universitet tanlang.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {eslatmalar.map((e: any) => {
              const daysLeft = e.qolgan_kun ? parseInt(e.qolgan_kun) : null;
              const isUrgent = daysLeft !== null && daysLeft <= 30;
              return (
                <div key={e.id} className={cn("flex items-center gap-5 px-8 py-5 transition-colors group", isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50/80")}>
                  {/* Day counter badge */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black",
                    isUrgent
                      ? "bg-red-500 text-white"
                      : (isDarkMode ? "bg-brand-blue/20 text-brand-blue" : "bg-brand-blue/10 text-brand-blue")
                  )}>
                    <span className="text-xl leading-none">{daysLeft ?? '—'}</span>
                    <span className="text-[9px] uppercase tracking-wider mt-0.5">kun</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-bold text-sm leading-snug", isDarkMode ? "text-white" : "text-slate-800")}>{e.eslatma_matni}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {e.tugash_kun && (
                        <span className={cn("flex items-center gap-1 text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                          <Clock className="w-3.5 h-3.5" />
                          Muddat: <span className={cn("font-bold", isUrgent ? "text-red-500" : "")}>{e.tugash_kun}</span>
                        </span>
                      )}
                      {e.eslatma_kun && (
                        <span className={cn("flex items-center gap-1 text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                          <Calendar className="w-3.5 h-3.5" />
                          {e.eslatma_kun}
                        </span>
                      )}
                      {e.ogohlantirish_sms && (
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
                          {e.ogohlantirish_sms}
                        </span>
                      )}
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white animate-pulse">
                          Shoshilinch!
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={async () => {
                      await apiFetch(`/eslatmalar/${e.id}/`, { method: 'DELETE' });
                      setEslatmalar(prev => prev.filter((x: any) => x.id !== e.id));
                    }}
                    className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100", isDarkMode ? "bg-red-900/30 hover:bg-red-900/60 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-400")}
                  ><X className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {isLoadingEslatmalar ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : null}
        {activeUniversities.map((uniRaw, idx) => {
          const uni = getTranslatedUni(uniRaw);
          return (
            <div key={uni.id} className={cn(
              "p-8 rounded-[2.5rem] border transition-all flex flex-col md:flex-row md:items-center gap-8 group hover:shadow-2xl",
              idx === 0
                ? (isDarkMode ? "border-red-900/50 bg-red-950/20 shadow-red-950/20" : "border-red-200 bg-red-50/30 shadow-red-100/50")
                : (isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-100 shadow-slate-200/50")
            )}>
              <div className="flex-1 flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-inner",
                  idx === 0
                    ? (isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-500")
                    : (isDarkMode ? "bg-blue-900/20 text-brand-blue" : "bg-blue-50 text-brand-blue")
                )}>
                  {idx === 0 ? <AlertTriangle className="w-8 h-8" /> : <GraduationCap className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className={cn("text-xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{uni.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                      isDarkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                    )}>
                      {uni.grantType}
                    </span>
                    {uni.deadline && (() => {
                      const days = Math.ceil((new Date(uni.deadline).getTime() - Date.now()) / 86400000);
                      return days <= 30 && days >= 0 ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white animate-pulse">
                          {t.urgent}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10">
                <div className="text-center md:text-right">
                  <p className="text-[10px] uppercase text-slate-400 mb-1 tracking-widest">{t.openingDate || "Ochilish sanasi"}</p>
                  <p className={cn("text-lg font-bold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                    {uni.openingDate || '—'}
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] uppercase text-slate-400 mb-1 tracking-widest">{t.deadline}</p>
                  <p className={cn("text-lg font-bold", idx === 0 ? "text-red-500" : (isDarkMode ? "text-white" : "text-slate-800"))}>{uni.deadline || '—'}</p>
                </div>
                <div className={cn("h-10 w-px hidden md:block", isDarkMode ? "bg-slate-700" : "bg-slate-200")} />
                <button
                  onClick={() => {
                    setEslatmaModal({ uni });
                    setEslatmaDate(uni.deadline || '');
                    setEslatmaType('gmail');
                  }}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all active:scale-[0.98]",
                    isDarkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                  )}>
                  <Plus className="w-5 h-5" />
                  {t.remindMe}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

      case 'step-by-step':
  return (
    <motion.div
      key="step-by-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <PremiumBadge />
        <h2 className={cn("text-3xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{t.guideTitle}</h2>
        <p className={cn("text-slate-500 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.guideDesc}</p>
      </div>

      <div className="space-y-6">
        {t.steps.map((step, i) => (
          <div key={i} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 font-black",
                i === 0 ? "bg-emerald-500 border-emerald-500 text-white" :
                  i === 1 ? "border-brand-blue text-brand-blue" :
                    isDarkMode ? "border-slate-700 text-slate-600" : "border-slate-200 text-slate-300"
              )}>
                {i === 0 ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
              </div>
              {i !== t.steps.length - 1 && <div className={cn("w-0.5 h-full my-2", isDarkMode ? "bg-slate-800" : "bg-slate-100")} />}
            </div>
            <div className={cn(
              "flex-1 p-6 rounded-2xl border transition-all",
              i === 1
                ? (isDarkMode ? "border-brand-blue bg-brand-blue/5 shadow-lg shadow-brand-blue/5" : "border-brand-blue bg-brand-soft-blue shadow-lg shadow-brand-blue/5")
                : (isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-100 bg-white shadow-sm")
            )}>
              <h4 className={cn("font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{step.title}</h4>
              <p className={cn("text-sm font-medium mt-1 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>{step.desc}</p>
              {i === 1 && (
                <button className="mt-4 text-brand-blue text-sm font-black flex items-center gap-1 hover:underline">
                  {t.continue} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

      case 'translation':
  return (
    <motion.div
      key="translation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className={cn("p-8 rounded-3xl border shadow-xl", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <PremiumBadge />
            <h2 className={cn("text-2xl font-bold mt-2", isDarkMode ? "text-white" : "text-slate-800")}>{t.translation}</h2>
          </div>
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isDarkMode ? "bg-amber-500/10" : "bg-amber-50")}>
            <FileText className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className={cn("text-sm font-semibold", isDarkMode ? "text-slate-400" : "text-slate-600")}>{t.fromLang}</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all",
                isDarkMode ? "bg-slate-700 border-slate-600 text-white focus:ring-brand-blue/20" : "bg-white border-slate-200 focus:ring-brand-blue/20"
              )}
            >
              <option>{t.uzbek}</option>
              <option>{t.russian}</option>
              <option>{t.english}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={cn("text-sm font-semibold", isDarkMode ? "text-slate-400" : "text-slate-600")}>{t.toLang}</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all",
                isDarkMode ? "bg-slate-700 border-slate-600 text-white focus:ring-brand-blue/20" : "bg-white border-slate-200 focus:ring-brand-blue/20"
              )}
            >
              <option>{t.english}</option>
              <option>{t.german}</option>
              <option>{t.french}</option>
              <option>{t.japanese}</option>
              <option>{t.russian}</option>
              <option>{t.uzbek}</option>
            </select>
          </div>
        </div>

        <div
          onClick={() => document.getElementById('fileInput')?.click()}
          className={cn(
            "border-2 border-dashed rounded-3xl p-12 text-center space-y-4 transition-all cursor-pointer group relative",
            uploadedFile ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-brand-blue hover:bg-slate-50"
          )}
        >
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.docx,.jpg,.png"
          />
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors",
            uploadedFile ? "bg-emerald-100" : (isDarkMode ? "bg-slate-700 group-hover:bg-brand-blue/20" : "bg-slate-100 group-hover:bg-brand-soft-blue")
          )}>
            {uploadedFile ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand-blue" />}
          </div>
          <div>
            <p className={cn("font-bold", isDarkMode ? "text-slate-200" : "text-slate-700")}>
              {uploadedFile ? uploadedFile.name : t.uploadFile}
            </p>
            <p className="text-sm text-slate-400">
              {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : t.uploadFormat}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-2xl gap-4">
          <button
            onClick={() => setNotarySelected(!notarySelected)}
            className={cn(
              "flex items-center gap-4 p-3 rounded-xl border-2 transition-all w-full md:w-auto",
              notarySelected
                ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                : "border-transparent bg-white text-slate-600 hover:border-slate-200"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors",
              notarySelected ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-400"
            )}>
              <CheckCircle2 className={cn("w-6 h-6", notarySelected ? "block" : "hidden")} />
              <Globe className={cn("w-6 h-6", notarySelected ? "hidden" : "block")} />
            </div>
            <div className="text-left">
              <p className={cn("text-sm font-bold", notarySelected ? "text-amber-700" : (isDarkMode ? "text-slate-300" : "text-slate-700"))}>{t.notary}</p>
              <p className="text-xs opacity-70">{t.officialDocs}</p>
            </div>
          </button>
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !uploadedFile}
            className={cn(
              "w-full md:w-auto text-white px-10 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2",
              isTranslating || !uploadedFile
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-brand-blue hover:bg-blue-700 shadow-brand-blue/20"
            )}
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.translating}
              </>
            ) : (
              <>
                <Languages className="w-5 h-5" />
                {t.sendToTranslate}
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {translationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-12 space-y-6"
            >
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h3 className={cn("font-bold", isDarkMode ? "text-white" : "text-slate-800")}>{t.translationResult}</h3>
                    <p className="text-xs text-slate-500">{sourceLang} → {targetLang}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTranslationResult("");
                      setUploadedFile(null);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Tozalash"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                  <button
                    onClick={downloadAsPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'uz' ? 'PDF Yuklab olish' : language === 'ru' ? 'Скачать PDF' : 'Download PDF'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 p-4 md:p-12 rounded-[2rem] flex justify-center">
                <div className="bg-white w-full max-w-[800px] min-h-[1000px] shadow-2xl rounded-sm p-12 md:p-20 relative font-serif text-slate-800 leading-relaxed">
                  {/* Document Header Decoration */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-blue" />

                  <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-6">
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-1">ScholarMap AI</h4>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Rasmiy tarjima hujjati</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-sans">Sana: {new Date().toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 font-sans">ID: #SM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none">
                    <Markdown>{translationResult}</Markdown>
                  </div>

                  <div className="mt-20 pt-8 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-300 font-sans uppercase tracking-widest">
                    <span>ScholarMap Premium Service</span>
                    <span>scholar-map.uz</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

      case 'funding':
  return (
    <motion.div
      key="funding"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="relative z-10">
          <PremiumBadge />
          <h2 className="text-4xl font-black mt-6 tracking-tight">{t.fundingTitle}</h2>
          <p className="text-indigo-100 mt-3 max-w-xl text-lg leading-relaxed">{t.fundingDesc}</p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <Wallet className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {t.fundingSources.map((fund: any, i: number) => (
          <div key={i} className={cn(
            "p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all group",
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
          )}>
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                fund.color === 'blue' ? "bg-blue-50 text-blue-600" :
                  fund.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                    fund.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
              )}>
                <Wallet className="w-6 h-6" />
              </div>
              <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 group-hover:text-brand-blue transition-colors">
                <Info className="w-5 h-5" />
              </button>
            </div>
            <h4 className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-slate-800")}>{fund.name}</h4>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                {t.appAcceptance}: {t.mayJune}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                {t.selectionStages}: {t.stages3}
              </div>
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all duration-300 flex items-center justify-center gap-2 group">
              {t.viewGuide}
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );

      case 'premium':
  return (
    <motion.div
      key="premium"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto px-4 py-8 space-y-12"
    >
      {/* Header Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors",
            isDarkMode ? "bg-brand-blue/20 border-brand-blue/30 text-brand-blue" : "bg-brand-blue/10 border-brand-blue/20 text-brand-blue"
          )}
        >
          <Crown className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">ScholarMap Premium</span>
        </motion.div>
        <h2 className={cn("text-4xl md:text-6xl font-black tracking-tight leading-tight", isDarkMode ? "text-white" : "text-slate-900")}>
          {t.premiumTitle}
        </h2>
        <p className={cn("text-lg md:text-xl font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
          {t.premiumSubtitle}
        </p>
      </div>

      {/* Pricing Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <button
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            "relative p-8 rounded-[2.5rem] border-2 transition-all duration-300 text-left group",
            billingCycle === 'monthly'
              ? (isDarkMode ? "border-brand-blue bg-slate-800 shadow-2xl shadow-brand-blue/20" : "border-brand-blue bg-white shadow-2xl shadow-brand-blue/10")
              : (isDarkMode ? "border-slate-700 bg-slate-800/50 hover:border-slate-600" : "border-slate-100 bg-slate-50/50 hover:border-slate-200")
          )}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              billingCycle === 'monthly' ? "bg-brand-blue text-white" : (isDarkMode ? "bg-slate-700 text-slate-500 group-hover:bg-slate-600" : "bg-slate-200 text-slate-400 group-hover:bg-slate-300")
            )}>
              <Calendar className="w-6 h-6" />
            </div>
            {billingCycle === 'monthly' && (
              <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h3 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{t.monthly}</h3>
          <p className="text-slate-500 text-sm font-bold mb-4">{t.flexiblePayment}</p>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-black", isDarkMode ? "text-white" : "text-slate-900")}>$2</span>
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">/ {t.month}</span>
          </div>
        </button>

        {/* Yearly Plan */}
        <button
          onClick={() => setBillingCycle('yearly')}
          className={cn(
            "relative p-8 rounded-[2.5rem] border-2 transition-all duration-300 text-left group overflow-hidden",
            billingCycle === 'yearly'
              ? (isDarkMode ? "border-brand-blue bg-slate-800 shadow-2xl shadow-brand-blue/20" : "border-brand-blue bg-white shadow-2xl shadow-brand-blue/10")
              : (isDarkMode ? "border-slate-700 bg-slate-800/50 hover:border-slate-600" : "border-slate-100 bg-slate-50/50 hover:border-slate-200")
          )}
        >
          <div className="absolute top-0 right-0">
            <div className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-widest">
              {t.save} $4
            </div>
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              billingCycle === 'yearly' ? "bg-brand-blue text-white" : (isDarkMode ? "bg-slate-700 text-slate-500 group-hover:bg-slate-600" : "bg-slate-200 text-slate-400 group-hover:bg-slate-300")
            )}>
              <Crown className="w-6 h-6" />
            </div>
            {billingCycle === 'yearly' && (
              <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{t.yearly}</h3>
            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-black rounded-full uppercase tracking-widest">{t.bestValue}</span>
          </div>
          <p className="text-slate-500 text-sm font-bold mb-4">{t.yearlySaveDesc}</p>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-black", isDarkMode ? "text-white" : "text-slate-900")}>$20</span>
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">/ {t.year}</span>
          </div>
        </button>
      </div>

      {/* Free Trial Timeline */}
      <div className={cn(
        "max-w-4xl mx-auto rounded-[2.5rem] p-8 md:p-12 border shadow-2xl transition-colors",
        isDarkMode ? "bg-slate-800 border-slate-700 shadow-slate-950/50" : "bg-white border-slate-100 shadow-slate-200/50"
      )}>
        <div className="text-center mb-12 space-y-2">
          <h3 className={cn("text-2xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{t.startToday}</h3>
          <p className={cn("text-sm font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.cancelAnytime}</p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className={cn("absolute top-5 left-0 w-full h-0.5 hidden md:block", isDarkMode ? "bg-slate-700" : "bg-slate-100")} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-black shadow-lg shadow-brand-blue/20">
                1
              </div>
              <div>
                <h4 className={cn("font-black text-sm uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>{t.today}</h4>
                <p className={cn("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.trialStart}</p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-center text-center space-y-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors",
                isDarkMode ? "bg-slate-700 text-slate-500" : "bg-white border-2 border-slate-200 text-slate-400"
              )}>
                23
              </div>
              <div>
                <h4 className={cn("font-black text-sm uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>{t.day23}</h4>
                <p className={cn("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.reminderSent}</p>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors",
                isDarkMode ? "bg-slate-700 text-slate-500" : "bg-white border-2 border-slate-200 text-slate-400"
              )}>
                30
              </div>
              <div>
                <h4 className={cn("font-black text-sm uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>{t.day30}</h4>
                <p className={cn("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>{t.subscriptionStart}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Payment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Premium Features List */}
        <div className={cn(
          "rounded-[2.5rem] p-8 md:p-10 border shadow-2xl transition-colors",
          isDarkMode ? "bg-slate-800 border-slate-700 shadow-slate-950/50" : "bg-white border-slate-100 shadow-slate-200/50"
        )}>
          <h3 className={cn("text-2xl font-black tracking-tight mb-8", isDarkMode ? "text-white" : "text-slate-900")}>{t.premiumSubtitle}</h3>
          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: Search, title: t.fullAccess, color: "text-blue-500", bg: isDarkMode ? "bg-blue-500/10" : "bg-blue-50" },
              { icon: Calculator, title: t.eligibilityChance, color: "text-emerald-500", bg: isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50" },
              { icon: FileText, title: t.personalConsultation, color: "text-purple-500", bg: isDarkMode ? "bg-purple-500/10" : "bg-purple-50" },
              { icon: User, title: t.profileData, color: "text-amber-500", bg: isDarkMode ? "bg-amber-500/10" : "bg-amber-50" },
              { icon: Languages, title: t.translation, color: "text-indigo-500", bg: isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50" },
              { icon: Bell, title: t.deadlines, color: "text-red-500", bg: isDarkMode ? "bg-red-500/10" : "bg-red-50" },
              { icon: CheckCircle2, title: t.realTimeUpdates, color: "text-cyan-500", bg: isDarkMode ? "bg-cyan-500/10" : "bg-cyan-50" },
              { icon: Database, title: t.grantDatabase, color: "text-rose-500", bg: isDarkMode ? "bg-rose-500/10" : "bg-rose-50" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 group"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", feature.bg)}>
                  <feature.icon className={cn("w-6 h-6", feature.color)} />
                </div>
                <span className={cn("font-black tracking-tight text-sm", isDarkMode ? "text-slate-300" : "text-slate-700")}>{feature.title}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className={cn(
          "rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl space-y-8 relative overflow-hidden transition-colors",
          isDarkMode ? "bg-slate-950 shadow-slate-950/50" : "bg-slate-900 shadow-slate-900/20"
        )}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-[80px] -mr-32 -mt-32" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight">{t.paymentMethods}</h3>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center p-1">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M19.141 31.396L22.28 16.596H25.419L22.28 31.396H19.141ZM35.454 16.945C34.846 16.702 33.957 16.5 32.846 16.5C30.086 16.5 28.141 17.96 28.12 20.057C28.1 21.608 29.496 22.472 30.552 22.988C31.635 23.518 32 23.854 31.998 24.327C31.995 25.05 31.135 25.371 30.34 25.371C29.135 25.371 28.435 25.025 27.88 24.77L27.24 27.74C28.06 28.12 29.5 28.44 30.98 28.46C34 28.46 32.01 26.98 32.03 24.84C32.04 23.72 31.37 22.88 30.04 22.24C29.24 21.84 28.12 21.48 28.12 20.52C28.12 19.8 28.92 19.04 30.64 19.04C31.96 19.04 32.88 19.32 33.6 19.64L34.24 16.67C33.6 16.39 32.68 16.11 31.48 16.11C28.72 16.11 26.77 17.57 26.75 19.67C26.73 21.22 28.13 22.08 29.18 22.6C30.26 23.13 30.63 23.46 30.63 23.94C30.62 24.66 29.76 24.98 28.97 24.98C27.76 24.98 27.06 24.64 26.51 24.39L25.87 27.36C26.69 27.74 28.13 28.06 29.61 28.08C32.63 28.08 34.61 26.6 34.63 24.46C34.64 23.34 33.97 22.5 32.64 21.86C31.84 21.46 30.72 21.1 30.72 20.14C30.72 19.42 31.52 18.66 33.24 18.66C34.56 18.66 35.48 18.94 36.2 19.26L36.84 16.29C36.2 16.01 35.28 15.73 34.08 15.73C31.32 15.73 29.37 17.19 29.35 19.29C29.33 20.84 30.73 21.7 31.78 22.22C32.86 22.75 33.23 23.56C33.22 24.28 32.36 24.6 31.57 24.6C30.36 24.6 29.66 24.26 29.11 24.01L28.47 26.98C29.29 27.36 30.73 27.68 32.21 27.7C35.23 27.7 37.21 26.22 37.23 24.08C37.24 22.96 36.57 22.12 35.24 21.48C34.44 21.08 33.32 20.72 33.32 19.76C33.32 19.04 34.12 18.28 35.84 18.28C37.16 18.28 38.08 18.56 38.8 18.88L39.44 15.91C38.8 15.63 37.88 15.35 36.68 15.35C33.92 15.35 31.97 16.81 31.95 18.91C31.93 20.46 33.33 21.32 34.38 21.84C35.46 22.37 35.83 22.7 35.83 23.18C35.82 23.9 34.96 24.22 34.17 24.22C32.96 24.22 32.26 23.88 31.71 23.63L31.07 26.6C31.89 26.98 33.33 27.3 34.81 27.32C37.83 27.32 39.81 25.84 39.83 23.7C39.84 22.58 39.17 21.74 37.84 21.1C37.04 20.7 35.92 20.34 35.92 19.38C35.92 18.66 36.72 17.9 38.44 17.9C39.76 17.9 40.68 18.18 41.4 18.5L42.04 15.53C41.4 15.25 40.48 14.97 39.28 14.97C36.52 14.97 34.57 16.43 34.55 18.53C34.53 20.08 35.93 20.94 36.98 21.46C38.06 21.99 38.43 22.32 38.43 22.8C38.42 23.52 37.56 23.84 36.77 23.84C35.56 23.84 34.86 23.5 34.31 23.25L33.67 26.22C34.49 26.6 35.93 26.92 37.41 26.94C40.43 26.94 42.41 25.46 42.43 23.32C42.44 22.2 41.77 21.36 40.44 20.72C39.64 20.32 38.52 19.96 38.52 19" fill="white" />
                  </svg>
                </div>
                <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center p-1">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="18" cy="24" r="12" fill="#EB001B" fillOpacity="0.8" />
                    <circle cx="30" cy="24" r="12" fill="#F79E1B" fillOpacity="0.8" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black tracking-tight">{t.choosePayment}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'payme', name: 'Payme', sub: t.paymeSub, color: 'bg-[#00BAE0]', icon: 'P' },
                  { id: 'click', name: 'Click', sub: t.clickSub, color: 'bg-[#00A3FF]', icon: 'C' },
                  { id: 'stripe', name: 'Stripe', sub: t.stripeSub, color: 'bg-[#635BFF]', icon: 'S' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-left relative group overflow-hidden",
                      paymentMethod === method.id
                        ? "border-white bg-white/10 shadow-xl"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-white mb-3 shadow-lg", method.color)}>
                      {method.icon}
                    </div>
                    <p className="font-black text-sm">{method.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{method.sub}</p>
                    {paymentMethod === method.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.cardNumber || "Karta raqami"}</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardDetails.number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || '';
                      setCardDetails({ ...cardDetails, number: formatted });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Muddati (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (val.length >= 2) {
                        val = val.slice(0, 2) + '/' + val.slice(2);
                      }
                      setCardDetails({ ...cardDetails, expiry: val });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVC kodi</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                      setCardDetails({ ...cardDetails, cvc: val });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Davlat</label>
                <select
                  value={cardDetails.country}
                  onChange={(e) => setCardDetails({ ...cardDetails, country: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all appearance-none"
                >
                  <option className="bg-slate-900">O'zbekiston</option>
                  <option className="bg-slate-900">AQSH</option>
                  <option className="bg-slate-900">Turkiya</option>
                  <option className="bg-slate-900">Qozog'iston</option>
                  <option className="bg-slate-900">Rossiya</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button className="w-full h-16 bg-gradient-to-r from-brand-blue to-purple-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-brand-blue/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                {t.choosePlan}
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                To‘lov xavfsiz amalga oshiriladi. Siz istalgan vaqtda obunani bekor qilishingiz mumkin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="text-center">
        <p className="text-[10px] text-slate-400">
          Davom etish orqali siz foydalanish shartlariga rozilik bildirasiz.
        </p>
      </div>
    </motion.div>
  );

      default:
  return null;
}
  };

return (
  <div className={cn(
    "min-h-screen transition-colors duration-500",
    isDarkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
  )}>
    <AnimatePresence mode="wait">
      {!isLoggedIn ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-900 transition-colors duration-500"
        >
          {/* Background Decorations */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

          <div className="w-full max-w-md relative z-10">
            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8 transition-colors duration-500 shadow-slate-950/50">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Logo className="w-20 h-20" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white">ScholarMap</h1>
                <p className="text-sm font-black tracking-tight text-slate-400">{t.welcomeBack}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">{t.email}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-brand-blue" />
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      value={loginEmail}
                      onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-black tracking-tight text-white focus:ring-2 focus:ring-brand-blue/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1 text-slate-400">{t.password}</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-brand-blue" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-black tracking-tight text-white focus:ring-2 focus:ring-brand-blue/50"
                    />
                  </div>
                </div>
                {loginError && (
                  <p className="text-red-400 text-xs font-bold ml-1">{loginError}</p>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-brand-blue text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-2xl shadow-brand-blue/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-60"
                >
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t.login}<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>

                <div className="flex items-center justify-between px-1">
                  <button className="text-xs font-black tracking-tight hover:underline text-slate-400">{t.forgotPassword}</button>
                  <button
                    onClick={() => { setShowRegister(true); setLoginError(''); }}
                    className="text-xs font-black tracking-tight text-brand-blue hover:underline"
                  >{t.register}</button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/50">
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <span className="text-white font-bold block mb-1">Muhim eslatma:</span>
                    ScholarMap orqali siz dunyoning eng nufuzli universitetlariga grant yutib olish imkoniyatiga ega bo'lasiz. Ma'lumotlarimiz 100% ishonchli manbalardan olinadi.
                  </p>
                </div>
              </div>
            </div>

            {/* Register Modal */}
            {showRegister && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white">Ro'yxatdan o'tish</h2>
                    <button onClick={() => setShowRegister(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'email', placeholder: 'Email *', type: 'email' },
                      { key: 'password', placeholder: 'Parol *', type: 'password' },
                      { key: 'first_name', placeholder: 'Ism', type: 'text' },
                      { key: 'last_name', placeholder: 'Familiya', type: 'text' },
                      { key: 'phone_number', placeholder: '+998901234567', type: 'tel' },
                    ].map(f => (
                      <input
                        key={f.key}
                        type={f.type}
                        placeholder={f.placeholder}
                        value={(regForm as any)[f.key]}
                        onChange={e => setRegForm({ ...regForm, [f.key]: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-white text-sm font-medium outline-none focus:ring-2 focus:ring-brand-blue/50"
                      />
                    ))}
                    {regError && <p className="text-red-400 text-xs font-bold">{regError}</p>}
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full bg-brand-blue text-white py-4 rounded-2xl font-black text-base hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ro'yxatdan o'tish"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col md:flex-row bg-slate-50"
        >
          {/* --- Sidebar --- */}
          <aside className={cn(
            "w-full md:w-72 border-r flex flex-col shrink-0 z-20 transition-colors",
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Logo className="w-10 h-10" />
                </div>
                <h1 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>ScholarMap</h1>
              </div>

              <nav className="space-y-1">
                <SidebarItem
                  icon={Database}
                  label={t.dashboard}
                  active={activeSection === 'database'}
                  onClick={() => setActiveSection('database')}
                  isDarkMode={isDarkMode}
                />
                <SidebarItem
                  icon={User}
                  label={t.profile}
                  active={activeSection === 'profile'}
                  onClick={() => setActiveSection('profile')}
                  isDarkMode={isDarkMode}
                />
                <SidebarItem
                  icon={Search}
                  label={t.search}
                  active={activeSection === 'search'}
                  onClick={() => setActiveSection('search')}
                  isDarkMode={isDarkMode}
                />
                <SidebarItem
                  icon={Calculator}
                  label={t.eligibility}
                  active={activeSection === 'eligibility'}
                  onClick={() => setActiveSection('eligibility')}
                  isDarkMode={isDarkMode}
                />
                <SidebarItem
                  icon={Calendar}
                  label={t.deadlines}
                  active={activeSection === 'deadlines'}
                  onClick={() => setActiveSection('deadlines')}
                  isDarkMode={isDarkMode}
                />

                <div className="pt-6 pb-2 px-4">
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-slate-500" : "text-slate-400")}>{t.premiumServices}</p>
                </div>

                <SidebarItem
                  icon={CheckCircle2}
                  label={t.stepByStep}
                  active={activeSection === 'step-by-step'}
                  onClick={() => setActiveSection('step-by-step')}
                  premium
                  isDarkMode={isDarkMode}
                />
                <SidebarItem
                  icon={Languages}
                  label={t.translation}
                  active={activeSection === 'translation'}
                  onClick={() => setActiveSection('translation')}
                  premium
                  isDarkMode={isDarkMode}
                />
                <SidebarItem
                  icon={Wallet}
                  label={t.funding}
                  active={activeSection === 'funding'}
                  onClick={() => setActiveSection('funding')}
                  premium
                  isDarkMode={isDarkMode}
                />
                <SidebarItem
                  icon={Crown}
                  label={t.premium}
                  active={isPremiumModalOpen || activeSection === 'premium'}
                  onClick={() => setIsPremiumModalOpen(true)}
                  isDarkMode={isDarkMode}
                />
              </nav>
            </div>

            <div className={cn("mt-auto p-6 border-t transition-colors", isDarkMode ? "border-slate-800" : "border-slate-100")}>
              <div className={cn("p-4 rounded-2xl space-y-3", isDarkMode ? "bg-slate-800/50" : "bg-slate-50")}>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <MapPin className="w-4 h-4 text-brand-blue" />
                  <span className={isDarkMode ? "text-slate-400" : ""}>Xorazm, O'zbekiston</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Phone className="w-4 h-4 text-brand-blue" />
                  <span className={isDarkMode ? "text-slate-400" : ""}>+998 94 279 76 66</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Mail className="w-4 h-4 text-brand-blue" />
                  <span className={isDarkMode ? "text-slate-400" : ""}>{userProfile.email}</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setIsLoggedIn(false);
                    setCurrentUserId(null);
                    setApiUniversities([]);
                    setEslatmalar([]);
                    setLoginEmail('');
                    setLoginPassword('');
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t.logout}
                </button>
              </div>
            </div>
          </aside>

          {/* --- Main Content --- */}
          <main className={cn(
            "flex-1 flex flex-col h-screen overflow-hidden transition-colors",
            isDarkMode ? "bg-slate-900" : "bg-slate-50"
          )}>
            {/* Header Banner */}
            <header className={cn(
              "border-b px-8 py-4 flex items-center justify-between shrink-0 transition-colors",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <div className="flex items-center gap-4">
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all flex items-center gap-2",
                      isDarkMode ? "bg-slate-800 text-brand-blue" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </button>
                  <div className={cn("w-px h-6 mx-2", isDarkMode ? "bg-slate-800" : "bg-slate-200")} />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className={cn(
                      "text-xs font-bold rounded-xl px-3 py-2 outline-none transition-colors appearance-none cursor-pointer",
                      isDarkMode ? "bg-slate-800 text-white border-slate-700" : "bg-slate-100 text-slate-700 border-transparent"
                    )}
                  >
                    <option value="uz">UZ</option>
                    <option value="en">EN</option>
                    <option value="ru">RU</option>
                  </select>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={cn(
                      "p-2 rounded-full transition-all relative group",
                      isNotificationsOpen
                        ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                        : isDarkMode ? "bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500"
                    )}
                  >
                    <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="fixed inset-0 z-40"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                        >
                          <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-slate-800 tracking-tight">{t.notifications}</h3>
                            {notifications.length > 0 && (
                              <button
                                onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
                                className="text-[10px] font-bold text-brand-blue hover:underline"
                              >
                                {t.markAllAsRead}
                              </button>
                            )}
                          </div>
                          <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                  <Bell className="w-8 h-8 text-slate-300" />
                                </div>
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-700">{t.noNotifications}</p>
                                  <p className="text-xs text-slate-400">{t.noNotificationsDesc}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="divide-y divide-slate-50">
                                {notifications.map(notification => (
                                  <div
                                    key={notification.id}
                                    className={cn(
                                      "p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer relative",
                                      !notification.isRead && "bg-brand-blue/5"
                                    )}
                                  >
                                    {!notification.isRead && (
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue" />
                                    )}
                                    <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                      notification.type === 'warning' ? "bg-amber-100 text-amber-600" :
                                        notification.type === 'success' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                      {notification.type === 'warning' ? <Clock className="w-5 h-5" /> :
                                        notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-bold text-slate-800 leading-tight">{notification.title}</p>
                                      <p className="text-xs text-slate-500 leading-relaxed">{notification.message}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">{notification.time}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {notifications.length > 0 && (
                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                              <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">{t.viewAllNotifications}</button>
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <div className={cn("w-px h-6", isDarkMode ? "bg-slate-800" : "bg-slate-200")} />

                <button
                  onClick={() => setActiveSection('profile')}
                  className="flex items-center gap-3 group"
                >
                  <div className="text-right hidden md:block">
                    <p className={cn("text-sm font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-800")}>{userProfile.firstName}</p>
                    <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                      {userProfile.isPremium ? t.premiumPlan : t.freePlan}
                    </p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-xl p-0.5 transition-transform group-hover:scale-105",
                    isDarkMode ? "bg-slate-800" : "bg-slate-100"
                  )}>
                    <div className={cn(
                      "w-full h-full rounded-lg flex items-center justify-center overflow-hidden",
                      isDarkMode ? "bg-slate-700" : "bg-white"
                    )}>
                      {userProfile.photo ? (
                        <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className={cn("text-xs font-bold", isDarkMode ? "text-slate-400" : "text-brand-blue")}>
                          {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                {renderSection()}
              </AnimatePresence>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Premium Modal */}
    <AnimatePresence>
      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsPremiumModalOpen(false);
              setTimeout(() => setPremiumStep(1), 300);
            }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[760px] h-[520px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsPremiumModalOpen(false);
                setTimeout(() => setPremiumStep(1), 300);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {premiumStep === 1 ? (
                  <motion.div
                    key="step1"
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction < 0 ? 100 : -100 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0 flex"
                  >
                    {/* Left Side: Plans & Features */}
                    <div className={cn(
                      "w-[60%] p-8 flex flex-col justify-between border-r",
                      isDarkMode ? "border-slate-700" : "border-slate-100"
                    )}>
                      <div className="space-y-4">
                        <div className="space-y-0.5">
                          <h2 className={cn("text-xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                            {t.premiumStart}
                          </h2>
                          <p className="text-slate-500 text-xs font-medium">
                            {t.premiumSub}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => setBillingCycle('yearly')}
                            className={cn(
                              "w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left relative group overflow-hidden",
                              billingCycle === 'yearly'
                                ? "border-brand-blue bg-brand-blue/5 shadow-md shadow-brand-blue/10"
                                : (isDarkMode ? "border-slate-700 bg-slate-800/50 hover:border-slate-600" : "border-slate-100 bg-white hover:border-slate-200")
                            )}
                          >
                            {billingCycle === 'yearly' && (
                              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                            )}
                            <div className="flex items-center gap-3 relative z-10">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                billingCycle === 'yearly' ? "border-brand-blue bg-brand-blue" : "border-slate-300"
                              )}>
                                {billingCycle === 'yearly' && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={cn("font-bold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>{t.yearlyPlan} — $20</span>
                                  <span className="px-2 py-0.5 bg-brand-blue text-white text-[8px] font-bold rounded-full uppercase tracking-wider">{t.recommended}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">{t.yearlyDesc}</span>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                              "w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left group",
                              billingCycle === 'monthly'
                                ? "border-brand-blue bg-brand-blue/5 shadow-md shadow-brand-blue/10"
                                : (isDarkMode ? "border-slate-700 bg-slate-800/50 hover:border-slate-600" : "border-slate-100 bg-white hover:border-slate-200")
                            )}
                          >
                            <div className="flex items-center gap-3 relative z-10">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                billingCycle === 'monthly' ? "border-brand-blue bg-brand-blue" : "border-slate-300"
                              )}>
                                {billingCycle === 'monthly' && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <span className={cn("font-bold text-sm block", isDarkMode ? "text-white" : "text-slate-900")}>{t.monthlyPlan} — $2</span>
                                <span className="text-[10px] text-slate-500 font-medium">{t.monthlyDesc}</span>
                              </div>
                            </div>
                          </button>
                          <p className="text-[10px] text-slate-400 font-medium text-center mt-1">
                            {t.freeTrial}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {t.premiumFeatures}
                          </h3>
                          <div className="grid grid-cols-1 gap-1.5">
                            {[
                              { icon: "🎯", text: t.feature1 },
                              { icon: "📊", text: t.feature2 },
                              { icon: "📄", text: t.feature3 },
                              { icon: "✍️", text: t.feature4 },
                              { icon: "🧾", text: t.feature5 },
                              { icon: "⏰", text: t.feature6 }
                            ].map((f, i) => (
                              <div key={i} className={cn("flex items-center gap-2 text-[12px] font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>
                                <span className={cn("w-4 h-4 flex items-center justify-center rounded-md shrink-0 text-xs", isDarkMode ? "bg-slate-800" : "bg-slate-50")}>{f.icon}</span>
                                <span>{f.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setDirection(1);
                          setPremiumStep(2);
                        }}
                        className="w-full py-3.5 bg-brand-blue text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-brand-blue/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
                      >
                        {t.continue}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* Right Side: Timeline */}
                    <div className={cn(
                      "w-[40%] p-10 flex flex-col justify-center relative overflow-hidden",
                      isDarkMode ? "bg-slate-900/50" : "bg-slate-50/50"
                    )}>
                      {/* Decorative background elements */}
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl" />
                      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

                      <div className="space-y-10 relative">
                        {/* Vertical Line with Gradient */}
                        <div className={cn(
                          "absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-blue",
                          isDarkMode ? "via-slate-700 to-slate-700" : "via-slate-200 to-slate-200"
                        )} />

                        <div className="relative flex gap-4 group">
                          <div className={cn(
                            "w-6 h-6 rounded-full bg-brand-blue border-4 shadow-lg shadow-brand-blue/20 z-10 shrink-0 transition-transform group-hover:scale-110",
                            isDarkMode ? "border-slate-800" : "border-white"
                          )} />
                          <div className="space-y-1">
                            <h4 className={cn("text-[13px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{t.todayTrial}</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                              {t.todayTrialDesc}
                            </p>
                          </div>
                        </div>

                        <div className="relative flex gap-4 group">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-4 shadow-sm z-10 shrink-0 transition-transform group-hover:scale-110",
                            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                          )} />
                          <div className="space-y-1">
                            <h4 className={cn("text-[13px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{t.day23Remind}</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                              {t.day23RemindDesc}
                            </p>
                          </div>
                        </div>

                        <div className="relative flex gap-4 group">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-4 shadow-sm z-10 shrink-0 transition-transform group-hover:scale-110",
                            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                          )} />
                          <div className="space-y-1">
                            <h4 className={cn("text-[13px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{t.day30Active}</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                              {t.day30ActiveDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction < 0 ? 100 : -100 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0 flex"
                  >
                    {/* Left Side: Payment Selection */}
                    <div className={cn(
                      "w-[60%] p-10 flex flex-col justify-between border-r",
                      isDarkMode ? "border-slate-700" : "border-slate-100"
                    )}>
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h2 className={cn("text-2xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                            {t.completePayment}
                          </h2>
                          <p className="text-slate-500 text-sm font-medium">
                            {t.completePaymentDesc}
                          </p>
                        </div>

                        {/* Selected Plan Summary */}
                        <div className={cn(
                          "p-4 rounded-2xl border flex items-center justify-between",
                          isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-100"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                              <Crown className="w-5 h-5" />
                            </div>
                            <div>
                              <span className={cn("font-bold block", isDarkMode ? "text-white" : "text-slate-900")}>
                                {billingCycle === 'yearly' ? `${t.yearlyPlan} — $20` : `${t.monthlyPlan} — $2`}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {billingCycle === 'yearly' ? t.yearlyDesc : t.monthlyDesc}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-brand-blue">{t.selected}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {t.choosePaymentMethod}
                          </h3>
                          <div className="grid grid-cols-1 gap-2.5">
                            {[
                              {
                                id: 'payme',
                                name: 'Payme',
                                sub: 'Mahalliy to‘lov tizimi',
                                color: '#00C1AF',
                                icon: (
                                  <img
                                    src="https://cdn.payme.uz/logo/payme_color.svg"
                                    alt="Payme"
                                    className="w-10 h-10 object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                )
                              },
                              {
                                id: 'click',
                                name: 'Click',
                                sub: 'Tez va qulay to‘lov',
                                color: '#0099FF',
                                icon: (
                                  <svg viewBox="0 0 120 40" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                      <linearGradient id="click-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#22D3EE" />
                                        <stop offset="100%" stopColor="#1D4ED8" />
                                      </linearGradient>
                                    </defs>
                                    <path
                                      fill="url(#click-gradient)"
                                      d="M20,2 C8,2 2,8 2,20 C2,32 8,38 20,38 C32,38 38,32 38,20 C38,8 32,2 20,2 Z M21,27 C17,27 13.5,24 13.5,20 C13.5,16 17,13 21,13 C25,13 28.5,16 28.5,20 C28.5,24 25,27 21,27 Z"
                                    />
                                    <text
                                      x="45"
                                      y="28"
                                      fontFamily="Arial, Helvetica, sans-serif"
                                      fontWeight="bold"
                                      fontSize="24"
                                      fill={isDarkMode ? "white" : "black"}
                                    >
                                      click
                                    </text>
                                  </svg>
                                )
                              },
                              {
                                id: 'stripe',
                                name: 'Stripe',
                                sub: 'Xalqaro (Visa, MasterCard)',
                                color: '#635BFF',
                                icon: (
                                  <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                                    alt="Stripe"
                                    className="w-12 h-12 object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                )
                              }
                            ].map((method) => (
                              <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id as any)}
                                onDoubleClick={() => {
                                  if (method.id) {
                                    setPaymentMethod(method.id as any);
                                    alert("To‘lov tizimiga yo‘naltirilmoqda...");
                                    setIsPremiumModalOpen(false);
                                    setPremiumStep(1);
                                    setPaymentMethod(null);
                                  }
                                }}
                                className={cn(
                                  "w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden",
                                  paymentMethod === method.id
                                    ? "border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                    : (isDarkMode ? "border-slate-700 bg-slate-800/50 hover:border-slate-600" : "border-slate-100 bg-white hover:border-slate-200")
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0",
                                    paymentMethod === method.id ? "bg-white/20" : (isDarkMode ? "bg-slate-900" : "bg-slate-50")
                                  )}
                                  style={{ color: paymentMethod === method.id ? '#fff' : method.color }}
                                >
                                  {method.icon}
                                </div>
                                <div className="flex-1">
                                  <span className={cn(
                                    "font-bold text-base block leading-none mb-1",
                                    paymentMethod === method.id ? "text-white" : (isDarkMode ? "text-white" : "text-slate-900")
                                  )}>
                                    {method.name}
                                  </span>
                                  <span className={cn(
                                    "text-[11px] font-medium",
                                    paymentMethod === method.id ? "text-white/70" : "text-slate-500"
                                  )}>
                                    {method.sub}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-medium text-center">
                          30 kun bepul sinov mavjud. To‘lov sinov muddati tugagach boshlanadi.
                        </p>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => {
                            setDirection(-1);
                            setPremiumStep(1);
                          }}
                          className={cn(
                            "flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]",
                            isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          Orqaga
                        </button>
                        <button
                          disabled={!paymentMethod}
                          onClick={() => {
                            alert("To‘lov tizimiga yo‘naltirilmoqda...");
                            setIsPremiumModalOpen(false);
                            setPremiumStep(1);
                            setPaymentMethod(null);
                          }}
                          className={cn(
                            "flex-[2] py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                            paymentMethod
                              ? "bg-brand-blue text-white hover:shadow-xl hover:shadow-brand-blue/20"
                              : (isDarkMode ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed")
                          )}
                        >
                          Davom etish
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Right Side: Timeline Update */}
                    <div className={cn(
                      "w-[40%] p-10 flex flex-col justify-center relative overflow-hidden",
                      isDarkMode ? "bg-slate-900/50" : "bg-slate-50/50"
                    )}>
                      {/* Decorative background elements */}
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl" />
                      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

                      <div className="space-y-10 relative">
                        <div className={cn(
                          "absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-blue",
                          isDarkMode ? "via-slate-700 to-slate-700" : "via-slate-200 to-slate-200"
                        )} />

                        <div className="relative flex gap-4 group">
                          <div className={cn(
                            "w-6 h-6 rounded-full bg-brand-blue border-4 shadow-lg shadow-brand-blue/20 z-10 shrink-0 transition-transform group-hover:scale-110",
                            isDarkMode ? "border-slate-800" : "border-white"
                          )} />
                          <div className="space-y-1">
                            <h4 className={cn("text-[13px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>Bugun — bepul sinov faollashadi</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                              Barcha premium imkoniyatlardan darhol foydalanasiz
                            </p>
                          </div>
                        </div>

                        <div className="relative flex gap-4 group">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-4 shadow-sm z-10 shrink-0 transition-transform group-hover:scale-110",
                            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                          )} />
                          <div className="space-y-1">
                            <h4 className={cn("text-[13px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>30-kun — eslatma yuboriladi</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                              Obuna boshlanishidan oldin sizga xabar beramiz
                            </p>
                          </div>
                        </div>

                        <div className="relative flex gap-4 group">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-4 shadow-sm z-10 shrink-0 transition-transform group-hover:scale-110",
                            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                          )} />
                          <div className="space-y-1">
                            <h4 className={cn("text-[13px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>Keyin — avtomatik davom etadi</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                              Bekor qilinmasa, tanlangan tarif bo‘yicha davom etadi
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    {/* ===== TOAST NOTIFICATION ===== */}
    {toast && (
      <div className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm transition-all animate-bounce",
        toast.type === 'success' ? "bg-emerald-500 text-white" :
          toast.type === 'error' ? "bg-red-500 text-white" : "bg-brand-blue text-white"
      )}>
        {toast.type === 'success' ? <Check className="w-5 h-5" /> :
          toast.type === 'error' ? <X className="w-5 h-5" /> :
            <Bell className="w-5 h-5" />}
        {toast.msg}
      </div>
    )}

    {/* ===== ESLATMA MODAL ===== */}
    {eslatmaModal && (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={cn(
          "w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden",
          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        )}>
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-blue to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">Eslatma qo'shish</h3>
                  <p className="text-white/70 text-xs mt-0.5">Bildirishnoma turini tanlang</p>
                </div>
              </div>
              <button onClick={() => setEslatmaModal(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-5">
            {/* University info */}
            <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-slate-700" : "bg-slate-50")}>
              <p className={cn("font-black text-sm", isDarkMode ? "text-white" : "text-slate-800")}>{eslatmaModal.uni.name}</p>
              <p className={cn("text-xs mt-1 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                {eslatmaModal.uni.grantType} • Muddat: <span className="text-red-500 font-bold">{eslatmaModal.uni.deadline}</span>
              </p>
            </div>

            {/* Notification type */}
            <div className="space-y-2">
              <label className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                Qayerga xabar yuborilsin?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEslatmaType('gmail')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm border-2 transition-all",
                    eslatmaType === 'gmail'
                      ? "border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                      : (isDarkMode ? "border-slate-600 text-slate-400 hover:border-slate-500" : "border-slate-200 text-slate-500 hover:border-brand-blue")
                  )}
                >
                  <Mail className="w-4 h-4" />
                  Gmail
                </button>
                <button
                  onClick={() => setEslatmaType('bot')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm border-2 transition-all",
                    eslatmaType === 'bot'
                      ? "border-[#2AABEE] bg-[#2AABEE] text-white shadow-lg shadow-[#2AABEE]/20"
                      : (isDarkMode ? "border-slate-600 text-slate-400 hover:border-slate-500" : "border-slate-200 text-slate-500 hover:border-[#2AABEE]")
                  )}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
                  </svg>
                  Telegram Bot
                </button>
              </div>
              {eslatmaType === 'gmail' && (
                <p className={cn("text-xs font-medium mt-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  📧 {userProfile.email || 'email manzilingizga'} ga xabar yuboriladi
                </p>
              )}
              {eslatmaType === 'bot' && (
                <div className="space-y-2 mt-1">
                  <p className={cn("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    🤖 Botga ulaning:{' '}
                    <a
                      href="https://t.me/scholarmap_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2AABEE] font-bold hover:underline"
                    >
                      @scholarmap_bot
                    </a>
                  </p>
                  <input
                    type="text"
                    placeholder="Telegram Chat ID (botdan /start bosing)"
                    value={eslatmaChatId}
                    onChange={e => setEslatmaChatId(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl border outline-none font-medium text-xs transition-all",
                      isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400"
                    )}
                  />
                </div>
              )}
            </div>

            {/* Reminder date */}
            <div className="space-y-2">
              <label className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                Eslatma sanasi
              </label>
              <input
                type="date"
                value={eslatmaDate}
                onChange={e => setEslatmaDate(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-2xl border outline-none font-medium transition-all",
                  isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex gap-3">
            <button
              onClick={() => setEslatmaModal(null)}
              className={cn("flex-1 py-3 rounded-2xl font-black text-sm", isDarkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500")}
            >
              Bekor qilish
            </button>
            <button
              onClick={async () => {
                if (!currentUserId || !eslatmaModal) return;
                try {
                  const res = await apiFetch(`/eslatmalar/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      eslatma_matni: `${eslatmaModal.uni.name} - ${eslatmaModal.uni.grantType} muddati: ${eslatmaModal.uni.deadline}`,
                      universitet: Number(eslatmaModal.uni.id),
                      user: currentUserId,
                      eslatma_kun: eslatmaDate || eslatmaModal.uni.deadline,
                      ogohlantirish_sms: eslatmaType === 'bot' ? 'bot' : 'gmail',
                      ...(eslatmaType === 'bot' && eslatmaChatId ? { chat_id: eslatmaChatId } : {}),
                    }),
                  });
                  if (res.ok) {
                    const newE = await res.json();
                    setEslatmalar(prev => [...prev, newE]);
                    setEslatmaModal(null);
                    setEslatmaChatId('');
                    showToast(`✅ Eslatma qo'shildi! ${eslatmaType === 'gmail' ? 'Gmail' : 'Telegram Bot'} orqali xabar olasiz.`, 'success');
                  } else {
                    showToast("Xatolik yuz berdi", 'error');
                  }
                } catch {
                  showToast("Serverga ulanishda xatolik", 'error');
                }
              }}
              className="flex-2 flex-grow py-3 px-6 rounded-2xl font-black text-sm bg-brand-blue text-white hover:bg-blue-700 shadow-lg shadow-brand-blue/20 transition-all flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Eslatma qo'shish
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}