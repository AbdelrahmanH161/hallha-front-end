export const locales = ["ar", "en"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "ar"

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && locales.includes(value as Locale)
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr"
}

export const dictionary = {
  ar: {
    auth: {
      login: {
        title: "مرحباً بعودتك",
        subtitle: "سجل الدخول إلى لوحة التحكم المتوافقة الخاصة بك",
        emailLabel: "عنوان البريد الإلكتروني",
        emailPlaceholder: "name@company.com",
        passwordLabel: "كلمة المرور",
        passwordPlaceholder: "••••••••",
        forgotPassword: "هل نسيت كلمة المرور؟",
        submit: "تسجيل الدخول",
        signupPrompt: "مستخدم جديد في حليلة؟",
        signupLink: "سجل الآن",
        badges: {
          shariaCertified: "معتمد شرعياً",
          secureEncryption: "تشفير آمن 256-بت",
        },
      },
      register: {
        shell: {
          brand: "حلّلها",
          title: "إعداد مساحة الامتثال الخاصة بك",
          secureBadge: "مؤمن بتشفير 256 بت",
          stepCounterTemplate: "الخطوة {current} من {total}",
        },
        steps: {
          accountBasics: "أساسيات الحساب",
          companyProfile: "ملف الشركة",
          bankConnection: "ربط البنك",
          planSelection: "اختيار الخطة",
        },
        buttons: {
          back: "رجوع",
          continue: "متابعة",
          next: "التالي",
        },
        step1: {
          title: "أساسيات الحساب",
          description: "أنشئ بيانات دخولك لبدء تهيئة مساحة الامتثال الخاصة بك.",
          emailLabel: "عنوان البريد الإلكتروني",
          emailPlaceholder: "name@company.com",
          passwordLabel: "كلمة المرور",
          passwordPlaceholder: "••••••••",
          confirmPasswordLabel: "تأكيد كلمة المرور",
          confirmPasswordPlaceholder: "••••••••",
        },
        step2: {
          title: "ملف الشركة",
          description: "أدخل تفاصيل عملك للتحقق من الامتثال الشرعي.",
          legalNameLabel: "الاسم القانوني للعمل",
          legalNamePlaceholder: "مثال: شركة النور القابضة ذ.م.م",
          registrationNumberLabel: "رقم التسجيل",
          registrationNumberPlaceholder: "سجل تجاري أو رقم تعريف صاحب العمل",
          incorporationCountryLabel: "بلد التأسيس",
          incorporationCountryPlaceholder: "اختر بلداً",
          countries: [
            { value: "ae", label: "الإمارات العربية المتحدة" },
            { value: "sa", label: "المملكة العربية السعودية" },
            { value: "uk", label: "المملكة المتحدة" },
            { value: "us", label: "الولايات المتحدة" },
          ],
          industryLabel: "قطاع الصناعة الرئيسي",
          industries: [
            { value: "retail", label: "التجزئة" },
            { value: "tech", label: "التكنولوجيا" },
            { value: "services", label: "الخدمات" },
          ],
        },
        step3: {
          title: "قم بربط مؤسستك",
          description:
            "اربط حسابك التشغيلي الأساسي بشكل آمن لتمكين التدقيق الآلي للامتثال للشريعة وتتبع المحفظة.",
          searchPlaceholder: "ابحث عن البنك أو المؤسسة الخاصة بك...",
          popularInstitutionsLabel: "مؤسسات شائعة",
          institutions: ["تشيس", "بنك أوف أمريكا", "ولز فارجو", "سيتي", "يو إس بانك"],
          viewAll: "عرض الكل",
          sandboxCta: "الاتصال عبر واجهة برمجة تطبيقات Sandbox",
          plaidNote:
            "مؤمن بواسطة Plaid. نحن لا نخزن أبدًا بيانات اعتماد تسجيل الدخول الخاصة بك.",
        },
        step4: {
          title: "اختر خطتك",
          description:
            "اختر مستوى التوافق مع الشريعة وأدوات التدقيق بالذكاء الاصطناعي التي تناسب حجم عملك. قم بالترقية في أي وقت أثناء نموك.",
          billingMonthly: "شهرياً",
          billingYearly: "سنوياً",
          yearlyDiscount: "-20%",
          plans: {
            startup: {
              title: "الشركات الناشئة",
              description: "تتبع الامتثال الأساسي للمشاريع في مراحلها الأولى.",
              price: "$29",
              period: "/شهر",
              features: [
                { text: "فحص المحفظة الأساسي", included: true },
                { text: "تقارير الامتثال الشهرية", included: true },
                { text: "حتى 100 معاملة/شهر", included: true },
                { text: "الوصول إلى مدقق الذكاء الاصطناعي", included: false },
              ],
              cta: "ابدأ الآن",
            },
            growth: {
              title: "النمو",
              description:
                "أدوات ذكاء اصطناعي متقدمة ومراقبة في الوقت الفعلي للشركات الصغيرة والمتوسطة النامية.",
              price: "$99",
              period: "/شهر",
              popularLabel: "الأكثر شيوعاً",
              features: [
                { text: "كل شيء في الشركات الناشئة، بالإضافة إلى:", included: true },
                { text: "تدقيق المعاملات في الوقت الفعلي", included: true },
                { text: "معاملات غير محدودة", included: true },
                { text: "وصول كامل لدردشة مدقق الذكاء الاصطناعي", included: true, accent: true },
                { text: "محرك حساب التطهير", included: true },
              ],
              cta: "اختر النمو",
            },
            enterprise: {
              title: "الشركات",
              description: "حلول مخصصة للمؤسسات التي تتطلب إشرافاً مخصصاً.",
              price: "مخصص",
              period: "",
              features: [
                { text: "مستشار شرعي مخصص", included: true },
                { text: "تكامل واجهة برمجة التطبيقات (API) مخصص", included: true },
                { text: "خيارات النشر المحلي", included: true },
                { text: "لوحة تحكم بالعلامة البيضاء", included: true },
              ],
              cta: "اتصل بالمبيعات",
            },
          },
          backToCompanyProfile: "العودة إلى الملف التجاري",
        },
      },
    },
    landing: {
      nav: {
        brand: "حلّلها",
        brandAlt: "شعار حلّلها",
        home: "الرئيسية",
        auditor: "المدقق",
        compliance: "الامتثال",
        kyc: "موثق KYC",
        switchLocaleLabel: "English",
        login: "تسجيل الدخول",
      },
      hero: {
        pill: "تمويل إسلامي مدعوم بالذكاء الاصطناعي",
        title: "حلّلها.. مستقبلك المالي، على",
        titleAccent: "أسس شرعية",
        description:
          "المنظومة المالية الحديثة للشركات الصغيرة والمتوسطة. أتمتة الامتثال، وضمان التطهير، وتنمية ثروتك بثقة أخلاقية مطلقة.",
        primaryCta: "ابدأ تدقيقك المجاني",
        secondaryCta: "شاهد عرض المنصة",
      },
      metrics: {
        title: "درجة الصحة الشرعية",
        subtitle: "تحليل المحفظة في الوقت الفعلي",
        score: "98%",
        status: "حلال",
        trend: "+2.4%",
        item1Title: "معاملة حديثة",
        item1Status: "متوافق",
        item2Title: "مراجعة العقد الذكي",
        item2Status: "قيد الانتظار",
      },
      features: {
        title: "منظومة أخلاقية متكاملة",
        description:
          "أدوات على مستوى المؤسسات مبسطة لأصحاب الشركات الصغيرة والمتوسطة للحفاظ على الامتثال الشرعي بنسبة 100٪.",
        items: {
          auditor: {
            title: "المدقق الذكي",
            description:
              "واجهة محادثة مدعومة بالذكاء الاصطناعي تراجع العقود والمعاملات مقابل الفتاوى المعتمدة في الوقت الفعلي.",
          },
          purification: {
            title: "التطهير التلقائي",
            description: "تحديد وعزل مصادر الدخل غير المتوافقة تلقائيًا لتتبع التطهير.",
          },
          contracts: {
            title: "قوالب العقود",
            description:
              "الوصول إلى مكتبة من اتفاقيات المشاركة والمضاربة والمرابحة المدققة مسبقًا والجاهزة للاستخدام.",
          },
          zakat: {
            title: "لوحة تحكم الزكاة",
            description: "حساب آلي للحول والنصاب عبر محفظة أعمالك بأكملها.",
          },
        },
      },
      pricing: {
        title: "تسعير أخلاقي وشفاف",
        period: "/شهر",
        tiers: {
          startup: {
            title: "الشركات الناشئة",
            price: "$49",
            features: ["حاسبة الزكاة الأساسية", "5 مراجعات عقود/شهر"],
            cta: "اختر الباقة",
          },
          growth: {
            title: "نمو الشركات",
            price: "$149",
            highlightLabel: "الأكثر شيوعًا",
            features: ["تدقيق ذكي غير محدود", "تتبع التطهير التلقائي", "مكتبة عقود كاملة"],
            cta: "ابدأ التجربة المجانية",
          },
          enterprise: {
            title: "المؤسسات",
            price: "مخصص",
            features: ["مستشار شرعي مخصص", "ربط واجهة برمجة تطبيقات (API) مخصص"],
            cta: "تواصل مع المبيعات",
          },
        },
      },
      footer: "© 2024 منصة حلّلها. مدققة من قبل هيئة الرقابة الشرعية.",
    },
  },
  en: {
    auth: {
      login: {
        title: "Welcome back",
        subtitle: "Sign in to your compliant dashboard",
        emailLabel: "Email address",
        emailPlaceholder: "name@company.com",
        passwordLabel: "Password",
        passwordPlaceholder: "••••••••",
        forgotPassword: "Forgot your password?",
        submit: "Log in",
        signupPrompt: "New to Hallilha?",
        signupLink: "Sign up",
        badges: {
          shariaCertified: "Shariah certified",
          secureEncryption: "256-bit secure encryption",
        },
      },
      register: {
        shell: {
          brand: "HalalIha",
          title: "Set up your compliance workspace",
          secureBadge: "Secured with 256-bit encryption",
          stepCounterTemplate: "Step {current} of {total}",
        },
        steps: {
          accountBasics: "Account basics",
          companyProfile: "Company profile",
          bankConnection: "Bank connection",
          planSelection: "Plan selection",
        },
        buttons: {
          back: "Back",
          continue: "Continue",
          next: "Next",
        },
        step1: {
          title: "Account basics",
          description: "Create your credentials to start setting up your compliance workspace.",
          emailLabel: "Email address",
          emailPlaceholder: "name@company.com",
          passwordLabel: "Password",
          passwordPlaceholder: "••••••••",
          confirmPasswordLabel: "Confirm password",
          confirmPasswordPlaceholder: "••••••••",
        },
        step2: {
          title: "Company profile",
          description: "Enter your business details to verify Shariah compliance.",
          legalNameLabel: "Legal business name",
          legalNamePlaceholder: "e.g., Al Noor Holdings LLC",
          registrationNumberLabel: "Registration number",
          registrationNumberPlaceholder: "Commercial register or employer ID",
          incorporationCountryLabel: "Country of incorporation",
          incorporationCountryPlaceholder: "Select a country",
          countries: [
            { value: "ae", label: "United Arab Emirates" },
            { value: "sa", label: "Saudi Arabia" },
            { value: "uk", label: "United Kingdom" },
            { value: "us", label: "United States" },
          ],
          industryLabel: "Primary industry",
          industries: [
            { value: "retail", label: "Retail" },
            { value: "tech", label: "Technology" },
            { value: "services", label: "Services" },
          ],
        },
        step3: {
          title: "Connect your institution",
          description:
            "Securely connect your primary operating account to enable automated Shariah compliance auditing and portfolio tracking.",
          searchPlaceholder: "Search for your bank or institution…",
          popularInstitutionsLabel: "Popular institutions",
          institutions: ["Chase", "Bank of America", "Wells Fargo", "Citi", "US Bank"],
          viewAll: "View all",
          sandboxCta: "Connect via Sandbox API",
          plaidNote:
            "Secured by Plaid. We never store your login credentials.",
        },
        step4: {
          title: "Choose your plan",
          description:
            "Pick the Shariah compliance level and AI auditing tools that match your business size. Upgrade anytime as you grow.",
          billingMonthly: "Monthly",
          billingYearly: "Yearly",
          yearlyDiscount: "-20%",
          plans: {
            startup: {
              title: "Startups",
              description: "Basic compliance tracking for early-stage projects.",
              price: "$29",
              period: "/month",
              features: [
                { text: "Basic portfolio scan", included: true },
                { text: "Monthly compliance reports", included: true },
                { text: "Up to 100 transactions/month", included: true },
                { text: "AI auditor chat access", included: false },
              ],
              cta: "Get started",
            },
            growth: {
              title: "Growth",
              description:
                "Advanced AI tools and real-time monitoring for growing SMEs.",
              price: "$99",
              period: "/month",
              popularLabel: "Most popular",
              features: [
                { text: "Everything in Startups, plus:", included: true },
                { text: "Real-time transaction auditing", included: true },
                { text: "Unlimited transactions", included: true },
                { text: "Full AI auditor chat access", included: true, accent: true },
                { text: "Purification calculation engine", included: true },
              ],
              cta: "Choose Growth",
            },
            enterprise: {
              title: "Enterprise",
              description: "Custom solutions for organizations requiring dedicated oversight.",
              price: "Custom",
              period: "",
              features: [
                { text: "Dedicated Shariah advisor", included: true },
                { text: "Custom API integration", included: true },
                { text: "On‑prem deployment options", included: true },
                { text: "White‑label dashboard", included: true },
              ],
              cta: "Contact sales",
            },
          },
          backToCompanyProfile: "Back to company profile",
        },
      },
    },
    landing: {
      nav: {
        brand: "Hallilha",
        brandAlt: "Hallilha logo",
        home: "Home",
        auditor: "Auditor",
        compliance: "Compliance",
        kyc: "KYC verified",
        switchLocaleLabel: "العربية",
        login: "Log in",
      },
      hero: {
        pill: "AI-powered Islamic finance",
        title: "Hallilha… your financial future, on",
        titleAccent: "Shariah-first foundations",
        description:
          "A modern financial system for SMEs. Automate compliance, ensure purification, and grow wealth with complete ethical confidence.",
        primaryCta: "Start your free audit",
        secondaryCta: "Watch the platform demo",
      },
      metrics: {
        title: "Shariah Health Score",
        subtitle: "Real-time portfolio analysis",
        score: "98%",
        status: "Halal",
        trend: "+2.4%",
        item1Title: "Recent transaction",
        item1Status: "Compliant",
        item2Title: "Smart contract review",
        item2Status: "Pending",
      },
      features: {
        title: "A complete ethical system",
        description:
          "Enterprise-grade tools made simple for SMEs to maintain 100% Shariah compliance.",
        items: {
          auditor: {
            title: "Smart auditor",
            description:
              "An AI chat interface that reviews contracts and transactions against approved fatwas in real time.",
          },
          purification: {
            title: "Automatic purification",
            description:
              "Automatically identify and isolate non-compliant income sources to track purification.",
          },
          contracts: {
            title: "Contract templates",
            description:
              "Access a library of pre-audited, ready-to-use Musharakah, Mudarabah, and Murabahah agreements.",
          },
          zakat: {
            title: "Zakat dashboard",
            description:
              "Automatic calculations for hawl and nisab across your entire business portfolio.",
          },
        },
      },
      pricing: {
        title: "Ethical, transparent pricing",
        period: "/month",
        tiers: {
          startup: {
            title: "Startups",
            price: "$49",
            features: ["Basic zakat calculator", "5 contract reviews/month"],
            cta: "Choose plan",
          },
          growth: {
            title: "Growth",
            price: "$149",
            highlightLabel: "Most popular",
            features: [
              "Unlimited smart auditing",
              "Automatic purification tracking",
              "Full contract library",
            ],
            cta: "Start free trial",
          },
          enterprise: {
            title: "Enterprise",
            price: "Custom",
            features: ["Dedicated Shariah advisor", "Custom API integration"],
            cta: "Contact sales",
          },
        },
      },
      footer: "© 2024 Hallilha. Audited by the Shariah Supervisory Board.",
    },
  },
} as const
