import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const D = (v: number | string) => new Prisma.Decimal(v);

const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);

async function main() {
  console.log("→ پاک‌سازی داده‌های قبلی…");
  await db.auditLog.deleteMany();
  await db.aiMessage.deleteMany();
  await db.aiConversation.deleteMany();
  await db.note.deleteMany();
  await db.task.deleteMany();
  await db.activity.deleteMany();
  await db.dealItem.deleteMany();
  await db.deal.deleteMany();
  await db.stage.deleteMany();
  await db.pipeline.deleteMany();
  await db.product.deleteMany();
  await db.lead.deleteMany();
  await db.contact.deleteMany();
  await db.company.deleteMany();
  await db.user.deleteMany();

  console.log("→ ساخت کاربران…");
  const password = await bcrypt.hash("demo1234", 10);

  const [admin, manager, rep] = await Promise.all([
    db.user.create({
      data: {
        email: "admin@firoozeh.ir",
        passwordHash: password,
        name: "سارا موسوی",
        role: "admin",
        title: "مدیرعامل",
        avatarHue: 180,
      },
    }),
    db.user.create({
      data: {
        email: "manager@firoozeh.ir",
        passwordHash: password,
        name: "رضا کریمی",
        role: "manager",
        title: "مدیر فروش",
        avatarHue: 40,
      },
    }),
    db.user.create({
      data: {
        email: "rep@firoozeh.ir",
        passwordHash: password,
        name: "نگار احمدی",
        role: "rep",
        title: "کارشناس فروش",
        avatarHue: 300,
      },
    }),
  ]);

  console.log("→ ساخت قیف فروش…");
  const pipeline = await db.pipeline.create({
    data: { name: "قیف فروش اصلی", isDefault: true },
  });

  const stageDefs = [
    { name: "تماس اولیه", order: 1, probability: 10, tone: "neutral" },
    { name: "نیازسنجی", order: 2, probability: 25, tone: "turquoise" },
    { name: "ارائه پیشنهاد", order: 3, probability: 50, tone: "turquoise" },
    { name: "مذاکره", order: 4, probability: 75, tone: "saffron" },
    { name: "قرارداد", order: 5, probability: 90, tone: "moss" },
  ];

  const stages = [];
  for (const s of stageDefs) {
    stages.push(
      await db.stage.create({ data: { ...s, pipelineId: pipeline.id } }),
    );
  }

  console.log("→ ساخت شرکت‌ها…");
  const companyDefs = [
    { name: "صنایع فولاد آریا", industry: "تولید", size: "201-1000", city: "اصفهان", domain: "aria-steel.ir" },
    { name: "فناوری داده پارس", industry: "نرم‌افزار", size: "51-200", city: "تهران", domain: "parsdata.ir" },
    { name: "بیمه آرامش", industry: "بیمه", size: "201-1000", city: "تهران", domain: "aramesh-ins.ir" },
    { name: "پخش دارویی سلامت", industry: "دارو", size: "51-200", city: "شیراز", domain: "salamat-pharma.ir" },
    { name: "گروه ساختمانی البرز", industry: "ساختمان", size: "1000+", city: "کرج", domain: "alborz-group.ir" },
    { name: "فروشگاه زنجیره‌ای ترنج", industry: "خرده‌فروشی", size: "201-1000", city: "مشهد", domain: "toranj.ir" },
    { name: "معدن مس سرچشمه نوین", industry: "معدن", size: "1000+", city: "کرمان", domain: "sarcheshmeh-n.ir" },
    { name: "استارتاپ ابری رایان", industry: "نرم‌افزار", size: "11-50", city: "تهران", domain: "rayan.cloud" },
  ];

  const companies = [];
  for (let i = 0; i < companyDefs.length; i++) {
    companies.push(
      await db.company.create({
        data: {
          ...companyDefs[i],
          phone: `021-88${String(100000 + i * 137).slice(0, 6)}`,
          website: `https://${companyDefs[i].domain}`,
          ownerId: [manager.id, rep.id, admin.id][i % 3],
        },
      }),
    );
  }

  console.log("→ ساخت مخاطبین…");
  const contactDefs = [
    { firstName: "مهدی", lastName: "رستمی", title: "مدیر فناوری اطلاعات", company: 0 },
    { firstName: "الهام", lastName: "نوری", title: "مدیر خرید", company: 1 },
    { firstName: "کامران", lastName: "شریفی", title: "معاون عملیات", company: 2 },
    { firstName: "پریسا", lastName: "حیدری", title: "مدیر مالی", company: 3 },
    { firstName: "بابک", lastName: "صادقی", title: "مدیر پروژه", company: 4 },
    { firstName: "مریم", lastName: "تقوی", title: "مدیر بازاریابی", company: 5 },
    { firstName: "حسین", lastName: "امینی", title: "مدیرعامل", company: 6 },
    { firstName: "شیدا", lastName: "فرهادی", title: "بنیان‌گذار", company: 7 },
    { firstName: "علی", lastName: "محمودی", title: "کارشناس خرید", company: 1 },
    { firstName: "زهرا", lastName: "کاظمی", title: "مدیر منابع انسانی", company: 2 },
  ];

  const contacts = [];
  for (let i = 0; i < contactDefs.length; i++) {
    const c = contactDefs[i];
    contacts.push(
      await db.contact.create({
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          title: c.title,
          email: `contact${i + 1}@${companyDefs[c.company].domain}`,
          mobile: `0912${String(1000000 + i * 4321).slice(0, 7)}`,
          companyId: companies[c.company].id,
          ownerId: [manager.id, rep.id][i % 2],
          tags: i % 3 === 0 ? "کلیدی,تصمیم‌گیرنده" : i % 3 === 1 ? "فنی" : "مالی",
        },
      }),
    );
  }

  console.log("→ ساخت سرنخ‌ها…");
  const leadDefs = [
    { name: "شرکت پتروشیمی خلیج", source: "website", status: "new", score: 72 },
    { name: "کلینیک تخصصی مهر", source: "referral", status: "contacted", score: 55 },
    { name: "هلدینگ سرمایه‌گذاری نوید", source: "campaign", status: "qualified", score: 88 },
    { name: "کارخانه کاشی الوند", source: "inbound", status: "new", score: 41 },
    { name: "آژانس دیجیتال موج", source: "website", status: "unqualified", score: 18 },
    { name: "شرکت حمل‌ونقل باریران", source: "manual", status: "contacted", score: 63 },
    { name: "دانشگاه آزاد واحد علوم", source: "referral", status: "qualified", score: 79 },
  ];

  for (let i = 0; i < leadDefs.length; i++) {
    await db.lead.create({
      data: {
        ...leadDefs[i],
        email: `lead${i + 1}@example.ir`,
        phone: `021-77${String(200000 + i * 911).slice(0, 6)}`,
        companyName: leadDefs[i].name,
        ownerId: [rep.id, manager.id][i % 2],
      },
    });
  }

  console.log("→ ساخت محصولات…");
  const productDefs = [
    { name: "اشتراک سالانه پلتفرم — پایه", sku: "SUB-BASE-Y", unitPrice: 180_000_000, taxRate: 9 },
    { name: "اشتراک سالانه پلتفرم — حرفه‌ای", sku: "SUB-PRO-Y", unitPrice: 420_000_000, taxRate: 9 },
    { name: "پیاده‌سازی و راه‌اندازی", sku: "IMP-01", unitPrice: 250_000_000, taxRate: 9 },
    { name: "آموزش تیم (روزانه)", sku: "TRN-DAY", unitPrice: 45_000_000, taxRate: 9 },
    { name: "پشتیبانی ویژه سالانه", sku: "SUP-PRI-Y", unitPrice: 120_000_000, taxRate: 9 },
  ];

  const products = [];
  for (const p of productDefs) {
    products.push(await db.product.create({ data: { ...p, unitPrice: D(p.unitPrice), taxRate: D(p.taxRate) } }));
  }

  console.log("→ ساخت معاملات…");
  const dealDefs = [
    { title: "استقرار پلتفرم مدیریت فروش", company: 0, contact: 0, stage: 3, amount: 1_850_000_000, prob: 75, close: 12 },
    { title: "توسعه ماژول گزارش‌های مدیریتی", company: 1, contact: 1, stage: 2, amount: 640_000_000, prob: 50, close: 21 },
    { title: "قرارداد پشتیبانی سالانه", company: 2, contact: 2, stage: 4, amount: 320_000_000, prob: 90, close: 5 },
    { title: "سامانه انبار و لجستیک", company: 3, contact: 3, stage: 1, amount: 1_200_000_000, prob: 25, close: 45 },
    { title: "پروژه یکپارچه‌سازی مالی", company: 4, contact: 4, stage: 2, amount: 2_400_000_000, prob: 50, close: 30 },
    { title: "اشتراک حرفه‌ای ۵۰ کاربره", company: 5, contact: 5, stage: 0, amount: 210_000_000, prob: 10, close: 60 },
    { title: "نوسازی زیرساخت معدن", company: 6, contact: 6, stage: 3, amount: 3_600_000_000, prob: 75, close: 18 },
    { title: "پایلوت تیم فروش", company: 7, contact: 7, stage: 1, amount: 95_000_000, prob: 25, close: 9 },
    { title: "آموزش و انتقال دانش", company: 1, contact: 8, stage: 4, amount: 180_000_000, prob: 90, close: 3 },
    { title: "سامانه پشتیبانی مشتریان", company: 2, contact: 9, stage: 0, amount: 480_000_000, prob: 10, close: 75 },
  ];

  const deals = [];
  for (let i = 0; i < dealDefs.length; i++) {
    const d = dealDefs[i];
    deals.push(
      await db.deal.create({
        data: {
          title: d.title,
          companyId: companies[d.company].id,
          contactId: contacts[d.contact].id,
          pipelineId: pipeline.id,
          stageId: stages[d.stage].id,
          amount: D(d.amount),
          probability: d.prob,
          expectedCloseDate: daysFromNow(d.close),
          ownerId: [manager.id, rep.id, admin.id][i % 3],
          items: {
            create: [
              {
                productId: products[i % products.length].id,
                name: products[i % products.length].name,
                quantity: D(1),
                unitPrice: D(d.amount),
                taxRate: D(9),
              },
            ],
          },
        },
      }),
    );
  }

  // Two closed deals so the dashboard has history to compare against.
  await db.deal.create({
    data: {
      title: "قرارداد سال گذشته — فولاد آریا",
      companyId: companies[0].id,
      contactId: contacts[0].id,
      pipelineId: pipeline.id,
      stageId: stages[4].id,
      amount: D(1_450_000_000),
      probability: 100,
      status: "won",
      closedAt: daysFromNow(-40),
      expectedCloseDate: daysFromNow(-40),
      ownerId: manager.id,
    },
  });
  await db.deal.create({
    data: {
      title: "پروژه لغوشده — آژانس موج",
      companyId: companies[5].id,
      contactId: contacts[5].id,
      pipelineId: pipeline.id,
      stageId: stages[1].id,
      amount: D(380_000_000),
      probability: 0,
      status: "lost",
      lostReason: "بودجه تأمین نشد",
      closedAt: daysFromNow(-15),
      ownerId: rep.id,
    },
  });

  console.log("→ ساخت فعالیت‌ها…");
  const activityDefs = [
    { type: "call", subject: "تماس پیگیری پیشنهاد", deal: 0, user: manager.id, days: -2 },
    { type: "meeting", subject: "جلسه دمو با تیم فنی", deal: 0, user: rep.id, days: -5 },
    { type: "email", subject: "ارسال پیش‌فاکتور", deal: 1, user: rep.id, days: -1 },
    { type: "note", subject: "رقبا: دو گزینه دیگر در حال بررسی", deal: 2, user: manager.id, days: -3 },
    { type: "stage_change", subject: "انتقال به مرحله مذاکره", deal: 6, user: manager.id, days: -1 },
    { type: "meeting", subject: "بازدید از سایت مشتری", deal: 4, user: admin.id, days: -7 },
    { type: "call", subject: "تماس اولیه", deal: 5, user: rep.id, days: -9 },
    { type: "email", subject: "پیگیری قرارداد", deal: 2, user: manager.id, days: 0 },
  ];

  for (const a of activityDefs) {
    await db.activity.create({
      data: {
        type: a.type,
        subject: a.subject,
        dealId: deals[a.deal].id,
        userId: a.user,
        occurredAt: daysFromNow(a.days),
      },
    });
  }

  console.log("→ ساخت وظایف…");
  const taskDefs = [
    { title: "ارسال قرارداد نهایی به بیمه آرامش", due: 1, priority: "urgent", deal: 2, assignee: manager.id },
    { title: "هماهنگی جلسه دمو با فولاد آریا", due: 2, priority: "high", deal: 0, assignee: rep.id },
    { title: "به‌روزرسانی پیش‌فاکتور داده پارس", due: 3, priority: "normal", deal: 1, assignee: rep.id },
    { title: "بررسی اعتبار مشتری البرز", due: 5, priority: "normal", deal: 4, assignee: admin.id },
    { title: "تماس با سرنخ هلدینگ نوید", due: -1, priority: "high", deal: null, assignee: rep.id },
    { title: "تهیه گزارش هفتگی فروش", due: 0, priority: "normal", deal: null, assignee: manager.id },
    { title: "پیگیری فاکتور معدن سرچشمه", due: 7, priority: "low", deal: 6, assignee: manager.id },
  ];

  for (const t of taskDefs) {
    await db.task.create({
      data: {
        title: t.title,
        dueDate: daysFromNow(t.due),
        priority: t.priority,
        dealId: t.deal !== null ? deals[t.deal].id : null,
        assigneeId: t.assignee,
      },
    });
  }

  console.log("→ ساخت یادداشت‌ها…");
  await db.note.create({
    data: {
      body: "مشتری روی یکپارچگی با سامانه حسابداری موجود تأکید دارد. باید با تیم فنی هماهنگ شود.",
      entityType: "deal",
      entityId: deals[0].id,
      authorId: manager.id,
    },
  });
  await db.note.create({
    data: {
      body: "بودجه سال آینده در فروردین تصویب می‌شود؛ پیگیری در آن بازه.",
      entityType: "company",
      entityId: companies[4].id,
      authorId: admin.id,
    },
  });

  console.log("\n✅ داده نمونه ساخته شد.");
  console.log("   ورود: admin@firoozeh.ir / demo1234");
  console.log("   ورود: manager@firoozeh.ir / demo1234");
  console.log("   ورود: rep@firoozeh.ir / demo1234\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
