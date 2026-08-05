const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const has = (selector) => Boolean(qs(selector));

(function() {
  var GITHUB_MEDIA_BASE = "https://media.githubusercontent.com/media/saikrishnacoder/i-want-you-to-creating-a/main/";

  function isLocalAsset(src) {
    return src && !/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(src);
  }

  function repoPathFrom(src) {
    var clean = src.split("#")[0].split("?")[0];
    var pageDir = window.location.pathname.replace(/\/[^\/]*$/, "/");
    var path = new URL(clean, window.location.origin + pageDir).pathname;
    path = path.replace(/^\/+/, "");
    return path.split("/").filter(Boolean).map(function(part) {
      return encodeURIComponent(decodeURIComponent(part));
    }).join("/");
  }

  function fallbackUrl(src) {
    return GITHUB_MEDIA_BASE + repoPathFrom(src);
  }

  function retryMedia(el) {
    var attr = el.tagName === "SOURCE" ? "src" : (el.hasAttribute("poster") && !el.hasAttribute("src") ? "poster" : "src");
    var original = el.getAttribute(attr);
    if (!isLocalAsset(original) || el.dataset.githubMediaFallback === "1") return;
    el.dataset.githubMediaFallback = "1";
    el.setAttribute(attr, fallbackUrl(original));
    if (el.tagName === "SOURCE" && el.parentElement && typeof el.parentElement.load === "function") {
      el.parentElement.load();
    } else if (el.tagName === "VIDEO" && typeof el.load === "function") {
      el.load();
    }
  }

  function attach(el) {
    if (!el || el.dataset.assetFallbackReady === "1") return;
    el.dataset.assetFallbackReady = "1";
    el.addEventListener("error", function() { retryMedia(el); });
    if (el.tagName === "IMG" && el.complete && el.naturalWidth === 0) retryMedia(el);
  }

  function scan(root) {
    qsa("img, video, source", root || document).forEach(attach);
  }

  document.addEventListener("error", function(event) {
    var el = event.target;
    if (el && /^(IMG|VIDEO|SOURCE)$/.test(el.tagName)) retryMedia(el);
  }, true);

  document.addEventListener("DOMContentLoaded", function() {
    scan(document);
    new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return;
          if (/^(IMG|VIDEO|SOURCE)$/.test(node.tagName)) attach(node);
          scan(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  });
})();

let activeCoachFilter = "all";
let allCoaches = [];
let activeAdminTab = "leads";
let adminData = { leads: [], checkins: [], ai_scans: [], newsletter: [], calculations: [] };
let usesLocalBackend = false;

const accentMap = {
  blue: "var(--white)",
  cyan: "var(--white)",
  red: "var(--white)",
};

var STORY_MAP_IMAGES = [
  "https://fpimages.withfloats.com/actual/69844b5073641513f8f1e239.jpeg",
  "https://fpimages.withfloats.com/actual/69844b4e961a5954e3f81d13.jpeg",
  "https://fpimages.withfloats.com/actual/69844ad22307ba4dd81c1c20.jpeg",
  "https://fpimages.withfloats.com/actual/69844a3ca132848f67f14013.jpeg",
  "https://fpimages.withfloats.com/actual/63aea329df0363000189623a.jpg",
  "https://fpimages.withfloats.com/actual/63aea32501890d0001fd6af0.jpg",
  "https://fpimages.withfloats.com/actual/63aea320570d0e000145a7bb.jpg",
  "https://fpimages.withfloats.com/actual/63aea31ddf03630001896224.jpg"
];

const realData = {
  heroHeadline: "Personal Training That Fits Your Life",
  heroSubhead: "At Fitness Gurukul, we believe in a holistic approach to health that incorporates fitness, nutrition, and lifestyle changes. We make health and fitness a part of everyday life.",
  services: [
    { name: "Fitness Gurukul Core", tag: "1-on-1 Coaching", category: "core", summary: "Dedicated fitness & nutrition coach with hyper-personalized workout plans, tailored Indian nutrition, and weekly video check-ins. Choose monthly, quarterly, 6-monthly, or yearly billing.", price: "From ₹5,999/mo", accent: "blue", points: ["1 session/week", "Dedicated coach", "Custom meal plan", "Video check-ins", "In-person PT", "App check-in"], sessions: "1 per Week", link: "#core" },
    { name: "Fitness Gurukul Prime", tag: "Advanced Coaching", category: "prime", summary: "Complete fitness & nutrition coaching with 3x/week in-person personal training, posture correction, and mandatory app check-ins.", price: "From ₹9,500/mo", accent: "red", points: ["3 sessions/week", "1:1 coach + PT", "Nutrition plan", "Video check-ins", "Structural assessment", "App check-in"], sessions: "3 per Week", link: "#prime" },
    { name: "Fitness Gurukul Signature", tag: "Intensive Coaching", category: "signature", summary: "Build Strength. Correct Movement. Transform Physique. Intensive 5x/week coaching with in-person personal training sessions, posture correction, mobility assessment, and mandatory app check-ins.", price: "₹15,999/mo", accent: "cyan", points: ["5 sessions/week", "1:1 coach", "In-person PT", "Nutrition plan", "Structural assessment", "App check-in"], sessions: "5 per Week", link: "#signature" },
    { name: "Fitness Gurukul Endurance", tag: "Running Coaching", category: "endurance", summary: "Professional running coaching for long-distance events &mdash; from beginners to advanced PR-seekers. Periodized training, endurance nutrition, and race-day strategy.", price: "₹1,199/mo", accent: "amber", points: ["Dedicated running coach", "Periodized running program", "Runner-specific S&C", "Endurance nutrition", "Race strategy", "Daily chat support"], sessions: "Virtual", link: "#endurance" },
    { name: "Fitness Gurukul Forge", tag: "Hyrox / OCR Prep", category: "forge", summary: "Functional fitness racing prep for Hyrox and OCR athletes. Compounded S&C, engine building, grip strength, and compromised running stamina.", price: "₹999/mo", accent: "orange", points: ["Dedicated S&C Coach", "Compounded S&C workouts", "Functional engine building", "Agility & grip strength", "Explosive power drills", "Compromised running stamina"], sessions: "Virtual", link: "#forge" },
    { name: "Virtual 1:1 Elite Transformation", tag: "Weight Loss & Muscle Gain", category: "elite", summary: "For those looking for weight loss, lean muscle gain, or lifestyle overhaul. 1:1 fitness & nutrition coaching with hyper-personalized plans.", price: "From ₹1,999/mo", accent: "purple", points: ["Dedicated coach", "Custom workout plans", "Indian nutrition plan", "Video check-ins", "Daily chat support", "Progressive overload"], sessions: "Virtual", link: "#elite" },
  ],
  coaches: [
    { name: "Aditya Gururani", role: "Yoga Instructor & Breathing Specialist", slug: "aditya-gururani", category: "yoga", bio: "A certified yoga instructor specializing in breathwork, stress management, and functional mobility. Focused on helping individuals improve posture, flexibility, lung capacity, and mental clarity through structured yoga and scientifically grounded breathing techniques.", focus: ["Breathwork", "Stress management", "Functional mobility"], highlight: "Breathwork Expert", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0302-69538f34664ae75da3c69fce.jpg" },
    { name: "B Yashwanth", role: "Basketball Coach", slug: "b-yashwanth", category: "sports", bio: "Basketball Coach", focus: ["Basketball", "Sports coaching", "Conditioning"], highlight: "Sports Specialist", color: "blue", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0305-6953918f0222ba9c3d831822.jpeg" },
    
    { name: "Shivajeet Kanaujiya", role: "Fitness Trainer", slug: "shivajeet-kanaujiya", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Strength", "Daily exercise"], highlight: "Strength Builder", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0300-69538ef2474cc000b54586c5.jpg" },
    { name: "Anand Yadav", role: "Children's Athletics Coach", slug: "anand-yadav", category: "kids", bio: "Children's Athletics Coach", focus: ["Children's athletics", "Kids fitness", "Sports"], highlight: "Kids Fitness Expert", color: "blue", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0297-69538d52664ae75da3c69fc1.jpg" },
    { name: "Aditya", role: "Yoga Instructor & Fitness Coach", slug: "aditya", category: "yoga", bio: "Yoga Instructor & Fitness Coach", focus: ["Yoga", "Fitness", "Body toning"], highlight: "Mind-Body Coach", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0298-69538dd1474cc000b54586be.jpg" },
    { name: "Nitu Arya", role: "Yoga Instructor", slug: "nitu-arya", category: "yoga", bio: "Yoga Instructor", focus: ["Yoga", "Flexibility", "General fitness"], highlight: "Holistic Yoga", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0295-69538d35474cc000b54586b7.jpg" },
    { name: "Rahul Bisht", role: "Yoga Instructor", slug: "rahul-bisht", category: "yoga", bio: "Yoga Instructor", focus: ["Yoga", "Mobility", "General fitness"], highlight: "Mobility Master", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0294-69538d19474cc000b54586b4.jpg" },
    { name: "Deepesh Kumar", role: "Fitness Trainer", slug: "deepesh-kumar", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Strength", "Weight loss"], highlight: "Weight Loss Specialist", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0293-69538d00664ae75da3c69fbc.jpg" },
    { name: "S Jeetender", role: "Fitness Trainer", slug: "s-jeetender", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Daily exercise", "Strength"], highlight: "Daily Fitness Pro", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0292-69538ce6474cc000b54586b3.jpg" },
    { name: "Rahul Dawar", role: "Fitness Trainer", slug: "rahul-dawar", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Strength", "Health routine"], highlight: "Health & Strength", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0291-69538ccf8c7b7b2c6178b6e1.jpg" },
    { name: "Rahul Singh Pawar", role: "Yoga Instructor", slug: "rahul-singh-pawar", category: "yoga", bio: "Yoga Instructor", focus: ["Yoga", "Flexibility", "Stress relief"], highlight: "Stress Relief Expert", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0290-69538cb65c5bdcd270817b1f.jpg" },
    { name: "Ravi Pal", role: "Fitness Trainer & Injury Rehabilitation Coach", slug: "ravi-pal", category: "rehab", bio: "Fitness Trainer & Injury Rehabilitation Coach", focus: ["Fitness training", "Injury rehabilitation", "Recovery"], highlight: "Injury Recovery", color: "blue", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0289-69538c800222ba9c3d831802.jpg" },
    
    { name: "Sanjeev", role: "Fitness Trainer", slug: "sanjeev", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Strength", "Daily exercise"], highlight: "Strength Trainer", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/274dba00-8541-4bfc-8666-e0b5433b3781-69538a190222ba9c3d8317f4.jpg" },
    { name: "Nandlal", role: "Fitness Trainer", slug: "nandlal", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Strength", "Weight loss"], highlight: "Transformation Coach", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/04ea7dfe-a988-4a17-97cb-8dc44240cb59-695389c4474cc000b54586a8.jpg" },
    { name: "Prasenjit Ghosh", role: "Mudgar & Hybrid Training Specialist", slug: "prasenjit-ghosh", category: "hybrid", bio: "Mudgar & Hybrid Training Specialist", focus: ["Mudgar", "Hybrid training", "Strength"], highlight: "Hybrid Training", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/db612d80-360a-4c76-9a18-0e97da5d1dc9-69538988474cc000b54586a5.jpg" },
    { name: "Vinay Ojha", role: "Fitness Trainer", slug: "vinay-ojha", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Strength", "General fitness"], highlight: "All-Round Fitness", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/32f29c04-6a08-46c7-b752-810892edad88-695388d0664ae75da3c69fa9.jpg" },
    { name: "Ankit Singh Chauhan", role: "Fitness & Calisthenics Trainer", slug: "ankit-singh-chauhan", category: "fitness", bio: "Fitness & Calisthenics Trainer", focus: ["Fitness", "Calisthenics", "Strength"], highlight: "Calisthenics Expert", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/debb9e52-bcf2-4630-8cc5-2ffc9af3e114-69538879664ae75da3c69fa8.jpg" },
    { name: "Suresh Yadav", role: "Fitness Trainer (Special Children)", slug: "suresh-yadav", category: "special", bio: "Fitness Trainer (Special Children)", focus: ["Special children", "Fitness", "Mobility"], highlight: "Special Needs Expert", color: "blue", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/suresh-695209865c5bdcd270817774.jpeg" },
    { name: "Parul Danu", role: "Yoga Instructor", slug: "parul-danu", category: "yoga", bio: "Yoga Instructor", focus: ["Yoga", "Flexibility", "Stress relief"], highlight: "Yoga & Wellness", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/parul-695209395c5bdcd270817773.jpeg" },
    { name: "Raju", role: "Fitness Trainer", slug: "raju", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Strength", "Health routine"], highlight: "Fitness Guide", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/raju-69520adb8c7b7b2c6178b36b.jpeg" },
    { name: "Vishal Choudhary", role: "Fitness Trainer", slug: "vishal-choudhary", category: "fitness", bio: "Fitness Trainer", focus: ["Fitness training", "Strength", "Personal training"], highlight: "Personal Training Pro", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/vishal-69520b6a5c5bdcd270817783.jpeg" },
    { name: "Devendra Mittal", role: "Fitness Trainer", slug: "mittal", category: "fitness", bio: "Fitness Trainer specializing in strength and conditioning.", focus: ["Fitness training", "Strength", "Conditioning"], highlight: "Strength & Conditioning", color: "red", image: "assets/cdn/founder.jpg" },
    { name: "Shashi Mishra", role: "Fitness Trainer", slug: "shashi-mishra", category: "fitness", bio: "Fitness Trainer focused on overall wellness and strength.", focus: ["Fitness training", "Strength", "Wellness"], highlight: "Wellness Coach", color: "red", image: "assets/cdn/founder.jpg" },
  ],
  testimonials: [
    { name: "Udit Narayan", quote: "I went from being overweight with zero confidence to completely transforming my body. The coaching at Fitness Gurukul gave me the discipline and structure I never had. Every session was planned, every meal was guided. This is the best investment I have made in myself.", result: "Body Recomposition", rating: 5, galleryImage: STORY_MAP_IMAGES[0], before: 88, after: 74, unit: "kg", metric: "Weight", journey: [{ month: "Start", value: "88 kg" , clients: 70, rating: 4.9}, { month: "Month 2", value: "83 kg" }, { month: "Month 4", value: "79 kg" }, { month: "Month 6", value: "76 kg" }, { month: "Month 8", value: "74 kg" }], coach: "Fitness Gurukul" },
  { name: "Neha Chopra", quote: "I struggled with my weight for years. Nothing worked until I joined Fitness Gurukul. The combination of personalized training and nutrition coaching changed everything. I lost weight steadily, gained energy, and actually started enjoying fitness for the first time in my life.", result: "Weight Loss", rating: 5, galleryImage: STORY_MAP_IMAGES[1], before: 82, after: 65, unit: "kg", metric: "Weight", journey: [{ month: "Start", value: "82 kg" }, { month: "Month 2", value: "77 kg" }, { month: "Month 4", value: "72 kg" }, { month: "Month 6", value: "68 kg" }, { month: "Month 7", value: "65 kg" }], coach: "Fitness Gurukul" },
  { name: "Ramakrishna", quote: "At my age I thought getting back in shape was impossible. My coach proved me wrong. The training was tough but always safe, and the nutrition plan was practical and easy to follow. I feel 10 years younger now.", result: "Weight Loss", rating: 5, galleryImage: STORY_MAP_IMAGES[2], before: 88, after: 74, unit: "kg", metric: "Weight", journey: [{ month: "Start", value: "88 kg" }, { month: "Month 2", value: "84 kg" }, { month: "Month 4", value: "79 kg" }, { month: "Month 6", value: "74 kg" }], coach: "Fitness Gurukul" },
  { name: "Deepak", quote: "I came to Fitness Gurukul with low energy and bad habits. The structured program and constant accountability from my coach kept me on track. Six months later I am stronger, leaner, and more confident than I have ever been.", result: "Weight Loss", rating: 5, galleryImage: STORY_MAP_IMAGES[3], before: 90, after: 76, unit: "kg", metric: "Weight", journey: [{ month: "Start", value: "90 kg" }, { month: "Month 2", value: "85 kg" }, { month: "Month 4", value: "80 kg" }, { month: "Month 6", value: "76 kg" }], coach: "Fitness Gurukul" },
  ],
  contact: {
    phone: "+917207113310",
    whatsapp: "+917207113310",
    email: "contact@fitnessgurukul.co.in",
    address: "H.no.1-10/2, Lakshmi Nagar Colony, near Pochamma Temple, Manikonda, Hyderabad, 500089",
    city: "Hyderabad, India",
  },
};


function safe(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}


async function api(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(function() { controller.abort(); }, 5000);
  try {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    const text = await res.text();
    if (!text) return {};
    const payload = JSON.parse(text);
    if (!res.ok) throw new Error(payload.error || "Request failed");
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

async function detectBackend() {
  try {
    const health = await api("/api/health");
    usesLocalBackend = Boolean(health.ok);
  } catch (e) {
    usesLocalBackend = false;
  }
  return usesLocalBackend;
}


function renderServices(services) {
  if (!has("#servicesGrid")) return;
  const container = qs("#servicesGrid");
  const limit = Number(container.dataset.limit || 0);
  const items = limit ? services.slice(0, limit) : services;
  var imgMap = {
    core: "https://productimages.withfloats.com/serviceimages/tile/6864c9e78413e7fa962e1378group1",
    prime: "https://productimages.withfloats.com/tile/69836aa4fb1f2c7bc65e495e.jpeg",
    signature: "https://productimages.withfloats.com/serviceimages/tile/6864ceb820232da581d3795cbanner",
    endurance: "https://bizimages.withfloats.com/tile/6990418c633e37ad59707c11.jpg",
    forge: "https://bizimages.withfloats.com/tile/6990422e78523277e04dba58.jpg",
    elite: "https://bizimages.withfloats.com/tile/6993f33d785055a1539bba6a.jpg"
  };
  var pointsMap = {
    core: ['1 session/week', 'Dedicated coach', 'Custom meal plan', 'Video check-ins', 'In-person PT', 'App check-in'],
    prime: ['3 sessions/week', '1:1 coach + PT', 'Nutrition plan', 'Video check-ins', 'Structural assessment', 'App check-in'],
    signature: ['5 sessions/week', '1:1 coach', 'In-person PT', 'Nutrition plan', 'Structural assessment', 'App check-in'],
    endurance: ['Dedicated running coach', 'Periodized running program', 'Runner-specific S&C', 'Endurance nutrition', 'Race strategy', 'Daily chat support'],
    forge: ['Dedicated S&C Coach', 'Compounded S&C workouts', 'Functional engine', 'Agility & grip', 'Explosive power', 'Compromised running'],
    elite: ['Dedicated coach', 'Custom workout plans', 'Indian nutrition plan', 'Video check-ins', 'Daily chat support', 'Progressive overload']
  };
  var priceMap = {
    core: { actual: "₹5,999", period: "/mo" },
    prime: { actual: "₹9,500", period: "/mo" },
    signature: { actual: "₹15,999", period: "/mo" },
    endurance: { actual: "₹1,199", period: "/mo" },
    forge: { actual: "₹999", period: "/mo" },
    elite: { actual: "₹1,999", period: "/mo" }
  };
  const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>';
  container.innerHTML = items.map(function(s, idx) {
    var cat = s.category;
    var pr = priceMap[cat] || priceMap.core;
    var ac = "var(--white)";
    // Cards can be recreated after boot. Mark them visible immediately
    // because they are added after the reveal observer has already run.
    return '<article class="svc-card reveal visible" data-plan="' + cat + '" style="--accent:' + ac + ';--delay:' + (idx * 0.1) + 's">' +
      '<div class="svc-card-body"><div class="svc-card-badge" style="background:' + ac + ';color:#000">Recommended</div><h3>' + safe(s.name) + '</h3>' +
      (s.summary ? '<p class="svc-summary">' + safe(s.summary) + '</p>' : '') +
      '<p class="svc-short"><strong>' + pr.actual + pr.period + '</strong> &middot; ' + safe(s.sessions || "") + '</p>' +
      '<ul class="svc-features">' + (pointsMap[cat] || pointsMap.core).map(function(p) { return '<li>' + checkSvg + ' ' + safe(p) + '</li>'; }).join("") + '</ul>' +
      '<div class="svc-card-foot"><span class="svc-sessions">' + safe(s.sessions || "") + '</span>' +
      '<span class="primary-button svc-card-cta" data-plan="' + cat + '" style="cursor:pointer;justify-content:center;border-radius:8px;background:' + ac + ';border-color:' + ac + ';color:#000">View Plans &amp; Pricing</span></div></div>' +
      '<div class="svc-card-img-wrap"><img class="svc-card-img" src="' + imgMap[cat] + '" alt="" loading="lazy" /><div class="svc-card-overlay"></div></div>' +
      '</article>';
  }).join("");
}


var FALLBACK_COACHES = [
  { name: "Aditya Gururani", role: "Yoga Instructor & Breathing Specialist", slug: "aditya-gururani", category: "yoga", bio: "A certified yoga instructor specializing in breathwork, stress management, and functional mobility.", focus: ["Breathwork", "Stress management", "Functional mobility"], highlight: "Breathwork Expert", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0302-69538f34664ae75da3c69fce.jpg" },
  { name: "Kritika Chauhan", role: "Fitness Trainer", slug: "kritika-chauhan", category: "fitness", bio: "Fitness Trainer specializing in flexibility, mobility, and general fitness.", focus: ["Flexibility", "Mobility", "General fitness"], highlight: "Flexibility Coach", color: "red", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0302-69538f34664ae75da3c69fce.jpg" },
  { name: "Nitu Arya", role: "Yoga Instructor", slug: "nitu-arya", category: "yoga", bio: "Yoga Instructor focused on holistic wellness and flexibility.", focus: ["Yoga", "Flexibility", "General fitness"], highlight: "Holistic Yoga", color: "cyan", image: "https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0305-6953918f0222ba9c3d831822.jpeg" },
  { name: "Rahul Bisht", role: "Yoga Instructor", slug: "rahul-bisht", category: "yoga", bio: "Yoga Instructor specializing in mobility and general fitness.", focus: ["Yoga", "Mobility", "General fitness"], highlight: "Mobility Master", color: "cyan", image: "https://web.s-cdn.boostkit.dev/website-files/603de2c09a1837000163b27d/69466d7b1b66370278b1e977-69466d7b0c30ac5c9f820a8f.jpeg" },
  { name: "Anand Yadav", role: "Children's Athletics Coach", slug: "anand-yadav", category: "kids", bio: "Children's Athletics Coach focused on kids fitness and sports development.", focus: ["Children's athletics", "Kids fitness", "Sports"], highlight: "Kids Fitness Expert", color: "blue", image: "https://web.s-cdn.boostkit.dev/website-files/603de2c09a1837000163b27d/694669eb876eab0610642251-694669eb1c636e8e2f4fb5c0.jpeg" },
  { name: "Ravi Pal", role: "Fitness Trainer & Injury Rehabilitation Coach", slug: "ravi-pal", category: "rehab", bio: "Fitness Trainer & Injury Rehabilitation Coach.", focus: ["Fitness training", "Injury rehabilitation", "Recovery"], highlight: "Injury Recovery", color: "blue", image: "https://web.s-cdn.boostkit.dev/website-files/603de2c09a1837000163b27d/69466d1b1c79393307d9ab91-69466d1bd73385b925812cfd.webp" },
  { name: "Subedhar Yadav", role: "Fitness Trainer (Special Children)", slug: "subedhar-yadav", category: "special", bio: "Fitness Trainer for special children focusing on mobility and strength.", focus: ["Special children", "Fitness", "Mobility"], highlight: "Special Needs Coach", color: "blue", image: "https://fpimages.withfloats.com/actual/69844b5073641513f8f1e239.jpeg" },
  { name: "Prasenjit Ghosh", role: "Mudgar & Hybrid Training Specialist", slug: "prasenjit-ghosh", category: "hybrid", bio: "Mudgar & Hybrid Training Specialist for functional strength.", focus: ["Mudgar", "Hybrid training", "Strength"], highlight: "Hybrid Training", color: "cyan", image: "https://productimages.withfloats.com/tile/69836aa4fb1f2c7bc65e495e.jpeg" },
];

function renderCoaches(coaches) {
  if (!has("#coachGrid")) { console.log("[renderCoaches] no #coachGrid, skipping"); return; }
  if (!coaches || !coaches.length) { console.log("[renderCoaches] using FALLBACK_COACHES"); coaches = FALLBACK_COACHES; }
  console.log("[renderCoaches] coaches count:", coaches.length);
  allCoaches = coaches;
  renderFilteredCoaches();
}

function coachInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function fakeCoachMeta(coach, idx = 0) {
  const seed = (coach?.slug || coach?.name || "coach").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) + idx;
  const rating = (4.6 + (seed % 4) * 0.1).toFixed(1);
  const reviews = 80 + (seed % 9) * 23;
  const clients = 120 + (seed % 8) * 35;
  const experience = 4 + (seed % 8);
  const retention = 86 + (seed % 10);
  const nextSlot = ["Today 6 PM", "Tomorrow 7 AM", "Today 8 PM", "Sat 9 AM", "Tomorrow 5 PM"][seed % 5];
  const energy = ["Calm", "Power", "Focus", "Mobility", "Strength"][seed % 5];
  return { rating, reviews, clients, experience, retention, nextSlot, energy };
}

function renderFilteredCoaches() {
  if (!has("#coachGrid")) return;
  const container = qs("#coachGrid");
  const search = qs("#coachSearch")?.value.trim().toLowerCase() || "";
  const limit = Number(container.dataset.limit || 0);
  const filtered = allCoaches.filter((coach) => {
    const haystack = `${coach.name} ${coach.role} ${(coach.focus || []).join(" ")} ${coach.highlight || ""}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesFilter = activeCoachFilter === "all" || coach.category === activeCoachFilter;
    return matchesSearch && matchesFilter;
  });
  const items = limit ? filtered.slice(0, limit) : filtered;
  var isHome = !has("#coachSearch") && !has("#coachFilters");
  console.log("[renderFilteredCoaches] filtered:", filtered.length, "items:", items.length, "isHome:", isHome);
  container.innerHTML = items.map(function(coach, idx) {
    const ac = accentMap[coach.color] || accentMap.cyan;
    const hc = coach.color === "red" ? "var(--white)" : coach.color === "blue" ? "var(--white)" : "var(--white)";
    const img = coach.image ? safe(coach.image) : "";
    const meta = fakeCoachMeta(coach, idx);
    if (isHome) {
      return `<article class="home-coach-card reveal" style="--accent:${ac};--delay:${idx * 0.08}s" data-coach-id="${safe(coach.slug)}">
        <div class="coach-avatar-wrap" style="--accent:${ac}">
          ${img ? '<img class="coach-avatar-img" src="' + img + '" alt="' + safe(coach.name) + '" />' : '<span class="coach-avatar-inner">' + safe(coachInitials(coach.name)) + '</span>'}
          <span class="coach-rating-float">${meta.rating} ★</span>
        </div>
        <h3>${safe(coach.name)}</h3>
        <small class="coach-role">${safe(coach.role)}</small>
        <div class="coach-mini-proof"><span>${meta.reviews} reviews</span></div>
        ${coach.highlight ? '<span class="coach-highlight-badge" style="--accent:' + ac + '">' + safe(coach.highlight) + '</span>' : ""}
        <button class="coach-card-book-btn" style="background:${ac}" data-coach="${safe(coach.name)}">Book ${safe(coach.name.split(" ")[0])}</button>
        <div class="coach-hover-layer">
          <div class="coach-overlay-stats">
            <span class="coach-ostat"><strong>${meta.experience}yr</strong> Exp</span>
            <span class="coach-ostat"><strong>${meta.clients}+</strong> Clients</span>
            <span class="coach-ostat"><strong>${meta.rating}</strong> Rating</span>
          </div>
          <p>${safe(coach.bio ? coach.bio.slice(0, 100) + "..." : "Expert coach dedicated to your transformation.")}</p>
          <span class="coach-hover-tag" style="--accent:${ac}">${safe((coach.focus || [])[0] || "Fitness")}</span>
        </div>
      </article>`;
    }
    return `<article class="coach-card-v2" style="--coach-accent:${ac}" data-coach-id="${safe(coach.slug)}">
      <div class="ccv2-avatar" style="color:${ac}">
        ${img ? '<img class="ccv2-avatar-img" src="' + img + '" alt="' + safe(coach.name) + '" />' : safe(coachInitials(coach.name))}
        <span class="ccv2-highlight-badge" style="background:${ac}">${safe(coach.highlight || "Coach")}</span>
        <span class="ccv2-rating-orbit">${meta.rating} ★</span>
      </div>
      <div class="ccv2-body">
        <small class="ccv2-role">${safe(coach.role)}</small>
        <h3>${safe(coach.name)}</h3>
        <div class="ccv2-proof-row">
          <span><strong>${meta.rating}</strong> rating</span>
          <span><strong>${meta.reviews}</strong> reviews</span>
          <span><strong>${meta.clients}+</strong> clients</span>
        </div>
        <div class="ccv2-tags">${(coach.focus || []).map(function(f) { return '<span style="border-color:' + hc + '33;color:' + hc + '">' + safe(f) + '</span>'; }).join("")}</div>
        <div class="ccv2-actions">
          <span class="ccv2-profile-btn" style="border-color:${ac}">View Profile</span>
          <button class="ccv2-book-btn coach-card-book-btn" style="background:${ac}" data-coach="${safe(coach.name)}">Book</button>
        </div>
      </div>
    </article>`;
  }).join("");
  if (has("#coachCount")) qs("#coachCount").textContent = `${filtered.length} coaches shown`;
}

var FALLBACK_TESTIMONIALS = [
  { name: "Udit Narayan", quote: "I went from being overweight with zero confidence to completely transforming my body. The coaching at Fitness Gurukul gave me the discipline and structure I never had.", result: "Body Recomposition", rating: 5, galleryImage: STORY_MAP_IMAGES[0], before: 88, after: 74, unit: "kg", coach: "Fitness Gurukul", journey: [{ month: "Start", value: "88 kg" }, { month: "Month 2", value: "83 kg" }, { month: "Month 4", value: "79 kg" }, { month: "Month 6", value: "76 kg" }, { month: "Month 8", value: "74 kg" }] },
  { name: "Neha Chopra", quote: "I struggled with my weight for years. Nothing worked until I joined Fitness Gurukul. The combination of personalized training and nutrition coaching changed everything.", result: "Weight Loss", rating: 5, galleryImage: STORY_MAP_IMAGES[1], before: 82, after: 65, unit: "kg", coach: "Fitness Gurukul", journey: [{ month: "Start", value: "82 kg" }, { month: "Month 2", value: "77 kg" }, { month: "Month 4", value: "72 kg" }, { month: "Month 6", value: "68 kg" }, { month: "Month 7", value: "65 kg" }] },
  { name: "Ramakrishna", quote: "At my age I thought getting back in shape was impossible. My coach proved me wrong. The training was tough but always safe, and the nutrition plan was practical.", result: "Weight Loss", rating: 5, galleryImage: STORY_MAP_IMAGES[2], before: 88, after: 74, unit: "kg", coach: "Fitness Gurukul", journey: [{ month: "Start", value: "88 kg" }, { month: "Month 2", value: "84 kg" }, { month: "Month 4", value: "79 kg" }, { month: "Month 6", value: "74 kg" }] },
  { name: "Deepak", quote: "I came to Fitness Gurukul with low energy and bad habits. The structured program and constant accountability kept me on track. I am stronger and more confident than ever.", result: "Weight Loss", rating: 5, galleryImage: STORY_MAP_IMAGES[3], before: 90, after: 76, unit: "kg", coach: "Fitness Gurukul", journey: [{ month: "Start", value: "90 kg" }, { month: "Month 2", value: "85 kg" }, { month: "Month 4", value: "80 kg" }, { month: "Month 6", value: "76 kg" }] },
];

var TESTIMONIAL_FILTERS = ["All", "Weight Loss", "Body Recomposition"];

function renderTestimonials(testimonials) {
  console.log("[renderTestimonials] called with", testimonials ? testimonials.length : "falsy", "items, has #storyMap:", !!qs("#storyMap"));
  if (!testimonials || !testimonials.length) { console.log("[renderTestimonials] using FALLBACK_TESTIMONIALS"); testimonials = FALLBACK_TESTIMONIALS; }
  var storyMap = qs("#storyMap");
  if (storyMap) {
    allTestimonials = testimonials;
    renderTestimonialFilters();
    renderStoryMap(testimonials);
    updateTestimonialStats(testimonials);
    return;
  }
  if (has("#testimonialGrid")) {
    var wrap = qs("#testimonialGrid");
    wrap.innerHTML = '<div class="testi-carousel-track" id="testiTrack">' + testimonials.map(function(t, i) {
      var avatarUrl = t.galleryImage || STORY_MAP_IMAGES[i % STORY_MAP_IMAGES.length];
      return '<article class="testimonial-card testi-carousel-slide" style="--ti:' + i + '">' +
        '<div class="testi-avatar-wrap"><img class="testi-avatar-img" src="' + avatarUrl + '" alt="' + safe(t.name) + '" /></div>' +
        '<div class="stars">' + Array(5).fill('<svg viewBox="0 0 24 24" fill="var(--white)" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join("") + '</div>' +
        '<p>"' + safe(t.quote) + '"</p><h3>' + safe(t.name) + '</h3>' +
        '<span class="testimonial-result">' + safe(t.result) + '</span></article>';
    }).join("") + '</div><div class="testi-carousel-dots" id="testiDots"></div>';
    var dots = qs("#testiDots");
    if (dots) dots.innerHTML = testimonials.map(function(_, i) { return '<span class="testi-dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '"></span>'; }).join("");
    initTestiCarousel();
  }
  renderTestimonialFeatured(testimonials);
  renderTestimonialGrid(testimonials);
  renderTestimonialFilters();
  wireTestimonialFilters();
  updateTestimonialStats(testimonials);
}

function renderMindsCarousel(coaches) {
  var container = qs("#mindsCarousel");
  if (!container) return;
  var certMap = { yoga: ["RYT 500", "Yoga Alliance Certified", "E-RYT 200"], fitness: ["ACSM-CPT", "NSCA-CPT", "ACE-CPT"], sports: ["NSCA-CSCS", "NASM-PES"], kids: ["ACE-YFS", "NASM-YES"], rehab: ["NASM-CES", "FMS L1"], special: ["ACSM-EP", "NCPAD Certified"], hybrid: ["CF-L1", "IKFF-CKT"] };
  container.innerHTML = coaches.map(function(c, i) {
    var certs = certMap[c.category] || certMap.fitness;
    var cert = certs[i % certs.length];
    var exp = (i % 5) + 3;
    var img = c.image ? '<img src="' + safe(c.image) + '" alt="' + safe(c.name) + '" />' : '<div class="minds-card-avatar-fallback">' + safe(c.name.split(" ").filter(Boolean).slice(0, 2).map(function(p) { return p[0]; }).join("").toUpperCase()) + '</div>';
    return '<div class="minds-card" data-index="' + i + '"><div class="minds-card-avatar">' + img + '</div><h4>' + safe(c.name) + '</h4><p>' + safe(c.role) + '</p><div class="minds-card-meta"><span class="minds-card-cert">' + safe(cert) + '</span><span class="minds-card-exp">' + exp + ' Years</span></div></div>';
  }).join("");
}

var allTestimonials = [];

function renderTestimonialFilters() {
  var filterEl = qs("#testimonialFilters");
  if (!filterEl) return;
  filterEl.innerHTML = TESTIMONIAL_FILTERS.map(function(c) {
    return '<button class="filter-chip' + (c === "All" ? " active" : "") + '" data-filter="' + safe(c.toLowerCase()) + '">' + safe(c) + '</button>';
  }).join("");
}

function renderTestimonialGrid(testimonials) {
  var grid = qs("#allTestimonials");
  if (!grid) return;
  grid.innerHTML = testimonials.map(function(t, idx) {
    var avatarUrl = t.galleryImage || STORY_MAP_IMAGES[idx % STORY_MAP_IMAGES.length];
    var stars = t.rating || 5;
    var hasProgress = t.before != null && t.after != null;
    var progressHtml = "";
    if (hasProgress && t.before !== t.after) {
      var pct = Math.min(100, Math.round((t.before - t.after) / t.before * 100));
      progressHtml = '<div class="ts-card-progress"><div class="ts-pbar"><div class="ts-pbar-fill" style="width:' + pct + '%"></div></div><div class="ts-pbar-label"><span>' + t.before + ' ' + (t.unit || "") + '</span><span>' + t.after + ' ' + (t.unit || "") + '</span></div></div>';
    }
    return '<article class="ts-card" data-category="' + safe(t.result || "") + '">' +
      '<div class="ts-card-top"><div class="ts-card-avatar"><img src="' + avatarUrl + '" alt="' + safe(t.name) + '" /></div>' +
      '<div class="ts-card-stars">' + Array(stars).fill('<svg viewBox="0 0 24 24" width="12" height="12" fill="var(--white)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>').join("") + '</div></div>' +
      '<p>"' + safe(t.quote) + '"</p>' +
      '<h3>' + safe(t.name) + '</h3>' +
      progressHtml +
      '<strong class="ts-card-badge">' + safe(t.result) + '</strong>' +
    '</article>';
  }).join("");
}

function wireTestimonialFilters() {
  var container = qs("#testimonialFilters");
  if (!container) return;
  container.addEventListener("click", function(e) {
    var chip = e.target.closest(".filter-chip");
    if (!chip) return;
    qsa(".filter-chip", container).forEach(function(c) { c.classList.remove("active"); });
    chip.classList.add("active");
    var filter = chip.dataset.filter;
    var cards = qsa("#allTestimonials .ts-card");
    cards.forEach(function(card) {
      if (filter === "all") { card.style.display = ""; return; }
      var cat = (card.dataset.category || "").toLowerCase();
      card.style.display = cat.indexOf(filter) !== -1 ? "" : "none";
    });
  });
}

function renderStoryMap(testimonials) {
  var container = qs("#storyMap");
  if (!container) return;
  var storyImages = [
    STORY_MAP_IMAGES[0],
    STORY_MAP_IMAGES[1],
    STORY_MAP_IMAGES[2],
    STORY_MAP_IMAGES[3],
    STORY_MAP_IMAGES[4],
    STORY_MAP_IMAGES[5],
    STORY_MAP_IMAGES[6],
    STORY_MAP_IMAGES[7]
  ];
  container.innerHTML = '<div class="story-map-timeline"></div>' + testimonials.map(function(t, idx) {
    var isLeft = idx % 2 === 0;
    var galleryImg = t.galleryImage || storyImages[idx % storyImages.length];
    var avatarUrl = t.galleryImage || STORY_MAP_IMAGES[idx % STORY_MAP_IMAGES.length];
    var hasProgress = t.before != null && t.after != null;
    var progressHtml = "";
    if (hasProgress && t.before !== t.after) {
      var lost = t.before - t.after;
      progressHtml = '<div class="sm-progress"><div class="sm-progress-before"><span class="sm-progress-val">' + t.before + '</span><span class="sm-progress-unit">' + (t.unit || "") + '</span></div><div class="sm-progress-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 12h14M13 5l7 7-7 7"/></svg><span class="sm-progress-lost">-' + lost + ' ' + (t.unit || "") + '</span></div><div class="sm-progress-after"><span class="sm-progress-val">' + t.after + '</span><span class="sm-progress-unit">' + (t.unit || "") + '</span></div></div>';
    }
    var journeyHtml = "";
    if (t.journey && t.journey.length > 1) {
      journeyHtml = '<div class="sm-journey">' + t.journey.map(function(j) {
        return '<div class="sm-journey-step"><strong>' + safe(j.month) + '</strong><span>' + safe(j.value) + '</span></div>';
      }).join("") + '</div>';
    }
    var stars = t.rating || 5;
    var starsHtml = '<div class="sm-stars">' + Array(stars).fill('<svg viewBox="0 0 24 24" width="12" height="12" fill="#FFC107"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>').join("") + '</div>';
    return '<div class="sm-story' + (isLeft ? ' sm-left' : ' sm-right') + '" data-category="' + safe(t.result || "") + '">' +
      '<div class="sm-story-image"><img src="' + galleryImg + '" alt="' + safe(t.name) + '\'s transformation" loading="lazy" /><div class="sm-story-overlay"><span class="sm-story-badge">' + safe(t.result) + '</span></div></div>' +
      '<div class="sm-story-content">' +
        '<div class="sm-story-header"><div class="sm-story-avatar"><img src="' + avatarUrl + '" alt="' + safe(t.name) + '" /></div><div><h3>' + safe(t.name) + '</h3>' + starsHtml + '</div></div>' +
        '<blockquote class="sm-story-quote">"' + safe(t.quote) + '"</blockquote>' +
        progressHtml +
        journeyHtml +
      '</div>' +
    '</div>';
  }).join("");
  wireStoryMapFilters();
}

function wireStoryMapFilters() {
  var container = qs("#testimonialFilters");
  if (!container) return;
  container.addEventListener("click", function(e) {
    var chip = e.target.closest(".filter-chip");
    if (!chip) return;
    qsa(".filter-chip", container).forEach(function(c) { c.classList.remove("active"); });
    chip.classList.add("active");
    var filter = chip.dataset.filter;
    var stories = qsa("#storyMap .sm-story");
    stories.forEach(function(card) {
      if (filter === "all") { card.style.display = ""; return; }
      var cat = card.dataset.category.toLowerCase();
      var keywords = { "weight loss": ["weight loss", "obesity", "fat", "lost", "kg"], "body recomposition": ["body recomposition", "recomp", "muscle", "lean", "transformation"] };
      var matches = (keywords[filter] || [filter]).some(function(w) { return cat.indexOf(w) !== -1; });
      card.style.display = matches ? "" : "none";
    });
  });
}

function renderTestimonialFeatured(testimonials) {
  var featured = qs("#tsFeatured");
  if (!featured) return;
  var t = testimonials[0];
  if (!t) { featured.style.display = "none"; return; }
  featured.style.display = "";
  var avatarUrl = t.galleryImage || STORY_MAP_IMAGES[0];
  var hasJourney = t.journey && t.journey.length > 0;
  var journeyHtml = "";
  if (hasJourney) {
    journeyHtml = '<div class="ts-fj-steps">' + t.journey.map(function(j, i) {
      return '<div class="ts-fj-step"><div class="ts-fj-dot"></div>' +
        '<strong>' + safe(j.month) + '</strong>' +
        '<span>' + safe(j.value) + '</span></div>';
    }).join("") + '</div>';
  }
  featured.innerHTML =
    '<div class="ts-featured-inner">' +
      '<div class="ts-featured-visual">' +
        '<img src="' + avatarUrl + '" alt="' + safe(t.name) + '" />' +
        (t.before != null && t.after != null ? '<div class="ts-fv-stats"><div class="ts-fv-stat"><strong>' + t.before + '</strong><small>Before</small></div><div class="ts-fv-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 12h14M13 5l7 7-7 7"/></svg></div><div class="ts-fv-stat"><strong>' + t.after + '</strong><small>After</small></div></div>' : '') +
      '</div>' +
      '<div class="ts-featured-body">' +
        '<span class="ts-hero-badge">Featured Story</span>' +
        '<h2>' + safe(t.name) + '</h2>' +
        '<p>"' + safe(t.quote) + '"</p>' +
        '<div class="ts-fb-meta"><span>Coach: <strong>' + safe(t.coach || "Fitness Gurukul") + '</strong></span><span class="ts-card-badge">' + safe(t.result) + '</span></div>' +
        journeyHtml +
      '</div>' +
    '</div>';
}

function updateTestimonialStats(testimonials) {
  var countEl = qs("#testimonialCount");
  if (countEl) countEl.textContent = testimonials.length;
}


function formatTime(value) {
  if (!value) return "-";
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

async function refreshAdminData() {
  if (!has("#adminTableBody")) return;
  if (usesLocalBackend) {
    try {
      adminData = await api("/api/admin-data");
      qs("#adminNote").textContent = "Showing latest records from the backend.";
    } catch (e) {
      adminData = { leads: [], checkins: [], ai_scans: [], newsletter: [], calculations: [] };
      qs("#adminNote").textContent = "Backend not reachable. Start python server.py.";
    }
  }
  renderAdminTable();
}

function renderAdminTable() {
  if (!has("#adminTableBody")) return;
  var tabs = qsa("[data-admin-tab]");
  var head = qs("#adminTableHead");
  var body = qs("#adminTableBody");
  var active = (tabs.find(function(tab) { return tab.classList.contains("active"); }) || tabs[0]);
  var fields = {
    leads: [["name", "Name"], ["phone", "Phone"], ["goal", "Goal"], ["program", "Program"], ["message", "Message"], ["created_at", "Received"]],
    checkins: [["name", "Name"], ["weight", "Weight (kg)"], ["stamina", "Stamina"], ["mood", "Mood"], ["created_at", "Received"]],
    ai_scans: [["name", "Name"], ["focus", "Focus"], ["summary", "Summary"], ["coach_route", "Coach route"], ["camera_used", "Camera"], ["created_at", "Received"]],
    newsletter: [["email", "Email"], ["created_at", "Received"]],
    calculations: [["title", "Calculator"], ["result", "Result"], ["unit", "Unit"], ["rating", "Rating"], ["created_at", "Calculated"]]
  };
  function displayValue(record, key) {
    if (key === "created_at") return safe(formatTime(record[key]));
    if (key === "camera_used") return record[key] ? "Yes" : "No";
    return safe(record[key] === undefined || record[key] === null || record[key] === "" ? "&mdash;" : record[key]);
  }
  function draw(tabName) {
    var columns = fields[tabName] || [];
    var records = Array.isArray(adminData[tabName]) ? adminData[tabName] : [];
    head.innerHTML = "<tr>" + columns.map(function(column) { return "<th>" + column[1] + "</th>"; }).join("") + "</tr>";
    body.innerHTML = records.length ? records.map(function(record) {
      return "<tr>" + columns.map(function(column) { return "<td>" + displayValue(record, column[0]) + "</td>"; }).join("") + "</tr>";
    }).join("") : '<tr><td class="admin-empty" colspan="' + columns.length + '">No records yet. New backend submissions will appear here.</td></tr>';
    qs("#adminNote").textContent = "Showing " + records.length + " " + (tabName === "calculations" ? "calculator result" : tabName.replace("_", " ")) + (records.length === 1 ? "" : "s") + " from SQLite.";
  }
  tabs.forEach(function(tab) {
    tab.onclick = function() {
      tabs.forEach(function(item) { item.classList.remove("active"); });
      tab.classList.add("active");
      draw(tab.dataset.adminTab);
    };
  });
  draw(active.dataset.adminTab);
}

function injectAmbientBg() {
  if (qs(".bg-ambient")) return;
  const el = document.createElement("div");
  el.className = "bg-ambient";
  el.innerHTML =
    '<div class="bg-orb bg-orb--1"></div>' +
    '<div class="bg-orb bg-orb--2"></div>' +
    '<div class="bg-orb bg-orb--3"></div>' +
    '<div class="bg-orb bg-orb--4"></div>';
  document.body.prepend(el);
}

/** Latest public event — featured on Events and shown site-wide via the top banner. */
var LATEST_EVENT = {
  name: "Independence Day Ride",
  shortDate: "Sun 16 Aug",
  dateLabel: "16 August 2026",
  time: "5:00 AM onwards",
  location: "SmartBike Point, Narsingi",
  registerUrl: "https://ifinish.in/cycling/IND_26",
  pageUrl: "events.html#latest-event"
};

function injectLatestEventBanner() {
  if (qs(".fg-latest-event-banner")) return;
  var path = (window.location.pathname || "").toLowerCase();
  if (/admin\.html|backend\.html|dashboard\.html|office\.html|owner-data\.html/.test(path)) return;

  var p = typeof sitePathPrefix === "function" ? sitePathPrefix() : "";
  var pageHref = p + LATEST_EVENT.pageUrl;
  var bar = document.createElement("div");
  bar.className = "fg-latest-event-banner";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Latest event");
  bar.innerHTML =
    '<div class="fg-latest-event-banner-inner">' +
      '<span class="fg-latest-event-badge">Latest event</span>' +
      '<p class="fg-latest-event-copy">' +
        "<strong>" + LATEST_EVENT.name + "</strong>" +
        '<span class="fg-latest-event-meta">' + LATEST_EVENT.shortDate + " · " + LATEST_EVENT.time + " · " + LATEST_EVENT.location + "</span>" +
      "</p>" +
      '<div class="fg-latest-event-actions">' +
        '<a class="fg-latest-event-register" href="' + LATEST_EVENT.registerUrl + '" target="_blank" rel="noopener">Register</a>' +
        '<a class="fg-latest-event-details" href="' + pageHref + '">Details</a>' +
        '<button type="button" class="fg-latest-event-dismiss" aria-label="Dismiss latest event banner">&times;</button>' +
      "</div>" +
    "</div>";
  document.body.prepend(bar);
  document.body.classList.add("has-latest-event-banner");

  try {
    if (sessionStorage.getItem("fg-hide-latest-event-banner") === "1") {
      bar.hidden = true;
      document.body.classList.remove("has-latest-event-banner");
    }
  } catch (err) { /* ignore storage */ }

  var dismiss = bar.querySelector(".fg-latest-event-dismiss");
  if (dismiss) {
    dismiss.addEventListener("click", function() {
      bar.hidden = true;
      document.body.classList.remove("has-latest-event-banner");
      try { sessionStorage.setItem("fg-hide-latest-event-banner", "1"); } catch (e) { /* ignore */ }
    });
  }
}

/* -- Coach popup modal -------------------- */
function injectCoachModal() {
  if (qs("#coachModal")) return;
  const div = document.createElement("div");
  div.id = "coachModal";
  div.className = "auth-overlay coach-modal-overlay";
  div.innerHTML =
    '<div class="auth-modal coach-modal">' +
      '<button class="auth-close" id="coachClose">&times;</button>' +
      '<div id="coachPopupBody"></div>' +
    '</div>';
  document.body.appendChild(div);
}

function injectBookModal() {
  if (qs("#bookModal")) return;
  const div = document.createElement("div");
  div.id = "bookModal";
  div.className = "auth-overlay book-modal-overlay";
  div.innerHTML =
    '<div class="auth-modal book-modal">' +
      '<button class="auth-close" id="bookModalClose">&times;</button>' +
      '<div class="book-modal-head">' +
        '<span class="book-modal-icon">📋</span>' +
        '<h3>Book a Free Consultation</h3>' +
        '<p class="book-modal-coach-name" id="bookModalCoachName"></p>' +
      '</div>' +
      '<form class="book-modal-frm" id="bookModalForm">' +
        '<input type="hidden" name="coach" id="bookModalCoachInput" />' +
        '<div class="book-frm-row">' +
          '<label>Your Name<input name="name" autocomplete="name" required placeholder="e.g. Rahul Sharma" /></label>' +
          '<label>Phone<input name="phone" type="tel" autocomplete="tel" required placeholder="+91 98765 43210" /></label>' +
        '</div>' +
        '<div class="book-frm-row">' +
          '<label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" /></label>' +
          '<label>Program<select name="program" required>' +
            '<option value="">Select program</option>' +
            '<option>Strength Training</option><option>Running</option><option>Cycling</option>' +
            '<option>Yoga &amp; Breathwork</option><option>Indian Nutrition</option><option>Weight Loss</option>' +
            '<option>Pain Management</option><option>Senior Training</option><option>Endurance</option>' +
          '</select></label>' +
        '</div>' +
        '<label>Your Goal<input name="goal" required placeholder="e.g. Lose 10 kg, build muscle, run a marathon" /></label>' +
        '<label>Additional Notes<textarea name="message" rows="2" placeholder="Timing, location, injuries, etc."></textarea></label>' +
        '<button class="primary-button book-frm-submit" type="submit">Send Message</button>' +
        '<p class="book-frm-status" id="bookFormStatus" role="status"></p>' +
      '</form>' +
      '<div class="book-modal-trust">' +
        '<span>✓ Free — no commitment</span>' +
        '<span>✓ Response within 24 hours</span>' +
        '<span>✓ 1,000+ transformations</span>' +
      '</div>' +
    '</div>';
  document.body.appendChild(div);
  var closeBtn = qs("#bookModalClose");
  if (closeBtn) closeBtn.addEventListener("click", function() { div.classList.remove("open"); document.body.style.overflow = ""; });
  div.addEventListener("click", function(e) { if (e.target === div) { div.classList.remove("open"); document.body.style.overflow = ""; } });
}

function renderCoachPopup(coach) {
  const body = qs("#coachPopupBody");
  if (!body) return;
  var idx = allCoaches.indexOf(coach);
  if (idx < 0) idx = 0;
  const ac = accentMap[coach.color] || accentMap.cyan;
  const img = coach.image ? '<img class="cp-avatar-img" src="' + safe(coach.image) + '" alt="' + safe(coach.name) + '" />' : '';
  var meta = fakeCoachMeta(coach, idx);
  var fakeExp = meta.experience + " Years Experience";
  var fakeClients = meta.clients + "+ Transformations";
  var fakeRating = meta.rating;
  var fakeStars = Number(fakeRating) >= 4.9 ? "★★★★★" : "★★★★★";
  var certs = ["Certified Personal Trainer", "CPR/AED Certified", "Sports Nutrition Specialist"];
  var certHtml = certs.slice(0, 2 + (idx % 2)).map(function(c) { return '<span class="cp-cert">' + safe(c) + '</span>'; }).join("");
  body.innerHTML =
    '<div class="cp-hero" style="background:' + ac + '">' +
      (img || '<div class="cp-avatar-fallback" style="color:#fff">' + safe(coachInitials(coach.name)) + '</div>') +
      '<div class="cp-hero-overlay"></div>' +
      '<span class="cp-hero-badge" style="background:' + ac + '">' + safe(coach.highlight || "Coach") + '</span>' +
    '</div>' +
    '<div class="cp-content">' +
      '<div class="cp-header">' +
        '<h2 class="cp-name">' + safe(coach.name) + '</h2>' +
        '<small class="cp-role">' + safe(coach.role) + '</small>' +
      '</div>' +
      '<div class="cp-stats">' +
        '<div class="cp-stat"><span class="cp-stat-icon">Y</span><span class="cp-stat-value">' + safe(fakeExp) + '</span></div>' +
        '<div class="cp-stat"><span class="cp-stat-icon">+</span><span class="cp-stat-value">' + safe(fakeClients) + '</span></div>' +
        '<div class="cp-stat"><span class="cp-stat-icon">★</span><span class="cp-stat-value">' + safe(fakeRating) + ' <span class="cp-stars">' + fakeStars + '</span></span></div>' +
      '</div>' +
      '<div class="cp-trust-panel">' +
        '<span><strong>' + meta.reviews + '</strong> member reviews</span>' +
        '<span><strong>' + safe(meta.nextSlot) + '</strong> next slot</span>' +
      '</div>' +
      '<p class="cp-bio">' + safe(coach.bio) + '</p>' +
      '<div class="cp-certs">' + certHtml + '</div>' +
      '<div class="cp-focus">' + (coach.focus || []).map(function(f) { return '<span style="border-color:' + ac + '44;color:' + ac + '">' + safe(f) + '</span>'; }).join("") + '</div>' +
      '<div class="cp-actions">' +
        '<button class="primary-button cp-book-btn" data-coach="' + safe(coach.name) + '" style="background:' + ac + ';border-color:' + ac + '">Book ' + safe(coach.name.split(" ")[0]) + '</button>' +
      '</div>' +
      '<div class="cp-consult-form" style="display:none">' +
        '<h3 class="cp-consult-title">Book a Free Consultation</h3>' +
        '<p class="cp-consult-sub">with <strong>' + safe(coach.name) + '</strong></p>' +
        '<form class="cp-consult-frm">' +
          '<input type="hidden" name="coach" value="' + safe(coach.name) + '" />' +
          '<div class="cp-consult-row">' +
            '<label>Your name<input name="name" autocomplete="name" required placeholder="e.g. Rahul Sharma" /></label>' +
            '<label>Phone<input name="phone" type="tel" autocomplete="tel" required placeholder="+91 98765 43210" /></label>' +
          '</div>' +
          '<div class="cp-consult-row">' +
            '<label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" /></label>' +
            '<label>Program<select name="program" required>' +
              '<option value="">Select</option>' +
              '<option>Strength Training</option><option>Running</option><option>Cycling</option>' +
              '<option>Yoga &amp; Breathwork</option><option>Indian Nutrition</option><option>Weight Loss</option>' +
            '</select></label>' +
          '</div>' +
          '<label>Goal<input name="goal" required placeholder="e.g. Lose 10 kg, improve flexibility" /></label>' +
          '<label>Notes<textarea name="message" rows="2" placeholder="Timing, location, injuries, etc."></textarea></label>' +
          '<button class="primary-button cp-consult-submit" type="submit" style="background:' + ac + ';border-color:' + ac + '">Send Message</button>' +
          '<p class="cp-consult-status" role="status"></p>' +
        '</form>' +
      '</div>' +
    '</div>';
  qs("#coachModal").classList.add("open");
}

function openBookModal(coachName) {
  injectBookModal();
  var modal = qs("#bookModal");
  var nameEl = qs("#bookModalCoachName");
  var inputEl = qs("#bookModalCoachInput");
  if (nameEl) nameEl.textContent = coachName ? "with " + coachName : "";
  if (inputEl) inputEl.value = coachName;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function wireBookModalForm() {
  var frm = qs("#bookModalForm");
  if (!frm) return;
  frm.addEventListener("submit", function(e) {
    e.preventDefault();
    var status = qs("#bookFormStatus");
    var payload = Object.fromEntries(new FormData(frm).entries());
    status.textContent = "Sending\u2026";
    status.style.color = "rgba(255,255,255,0.6)";
    var apiBase = "";
    var fetchOpts = { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } };
    fetch(apiBase || "/api/submit", fetchOpts)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.ok || d.success) {
          status.textContent = "\u2705 Thank you! We\u2019ll be in touch shortly.";
          status.style.color = "#4ade80";
          frm.reset();
          var coachInput = qs("#bookModalCoachInput");
          if (coachInput) coachInput.value = coachInput.value;
        } else {
          throw new Error(d.error || "Submit failed");
        }
      })
      .catch(function() {
        status.textContent = "\u26a0\ufe0f Something went wrong. Please try again.";
        status.style.color = "#dc3545";
      });
  });
}

function wireCoachPopups() {
  var close = qs("#coachClose");
  var overlay = qs("#coachModal");
  if (close) close.addEventListener("click", function() { overlay.classList.remove("open"); });
  if (overlay) overlay.addEventListener("click", function(e) { if (e.target === overlay) overlay.classList.remove("open"); });

  document.addEventListener("click", function(e) {
    var cardBookBtn = e.target.closest(".coach-card-book-btn");
    if (cardBookBtn) {
      e.preventDefault();
      e.stopPropagation();
      var coachName = cardBookBtn.dataset.coach || "";
      openBookModal(coachName);
      return;
    }

    var bookBtn = e.target.closest(".cp-book-btn");
    if (bookBtn) {
      var coachName = bookBtn.dataset.coach || "";
      openBookModal(coachName);
      return;
    }

    var card = e.target.closest(".coach-card, .coach-card-v2, .home-coach-card, .about-team-card");
    if (!card || !card.dataset.coachId) return;
    if (e.target.closest(".coach-inline-form, .coach-card-book-btn, .ccv2-profile-btn")) return;
    e.preventDefault();
    var coach = allCoaches.find(function(c) { return c.slug === card.dataset.coachId; });
    if (coach) renderCoachPopup(coach);
  });

  document.addEventListener("submit", function(e) {
    var frm = e.target.closest(".cp-consult-frm, .coach-inline-frm");
    if (!frm) return;
    e.preventDefault();
    var status = frm.querySelector(".cp-consult-status, .coach-frm-status");
    var payload = Object.fromEntries(new FormData(frm).entries());
    status.textContent = "Sending\u2026";
    status.style.color = "rgba(255,255,255,0.6)";
    var apiBase = "";
    var fetchOpts = { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } };
    fetch(apiBase || "/api/submit", fetchOpts)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.ok || d.success) {
          status.textContent = "\u2705 Thank you! We\u2019ll be in touch shortly.";
          status.style.color = "#4ade80";
          frm.reset();
          var coachInput = frm.querySelector('input[name="coach"]');
          if (coachInput) coachInput.value = coachInput.value;
        } else {
          throw new Error(d.error || "Submit failed");
        }
      })
      .catch(function() {
        status.textContent = "\u26a0\ufe0f Something went wrong. Please try again.";
        status.style.color = "#dc3545";
      });
  });
}

function injectHeroContent(content) {
  var headline = qs("#heroHeadline");
  var subhead = qs("#heroSubheadline");
  if (!headline) return;
  var d = content || realData;
  headline.textContent = d.heroHeadline || "Fitness Coaching in Hyderabad";
  if (subhead) subhead.textContent = d.heroSubhead || "At Fitness Gurukul, we believe in a holistic approach to health that incorporates fitness, nutrition, and lifestyle changes. We make health and fitness a part of everyday life.";
}


function wireForms() {
  var leadForm = qs("#leadForm");
  if (leadForm) {
    leadForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var status = qs("#leadStatus");
      var payload = Object.fromEntries(new FormData(leadForm).entries());
      status.textContent = "Sending\u2026";
      status.style.color = "rgba(255,255,255,0.6)";
    var apiBase = "";
    var fetchOpts = { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } };
    fetch(apiBase || "/api/submit", fetchOpts)
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.ok || d.success) {
            status.textContent = "\u2705 Thank you! We\u2019ll be in touch shortly.";
            status.style.color = "#4ade80";
            leadForm.reset();
          } else {
            throw new Error(d.error || "Submit failed");
          }
        })
        .catch(function() {
          status.textContent = "\u26a0\ufe0f Something went wrong. Please try again.";
          status.style.color = "#dc3545";
        });
    });
  }
  qsa("[data-contact-phone]").forEach((node) => { node.textContent = realData.contact.phone; });
  qsa("[data-contact-email]").forEach((node) => { node.textContent = realData.contact.email; });
}

function wireNavigationAids() {
  const menuBtn = qs("#menuButton");
  const mobileNav = qs("#mobileNav");
  const mobileNavClose = qs("#mobileNavClose");
  menuBtn?.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
  mobileNavClose?.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
  const current = window.location.pathname.split("/").pop() || "index.html";
  qsa(".desktop-nav a, .mobile-nav a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    link.classList.toggle("active", href === current || (current === "" && href === "index.html"));
  });
  qsa(".nav-dropdown").forEach((dd) => {
    const match = [...dd.querySelectorAll("a")].some((a) => a.getAttribute("href") === current);
    dd.classList.toggle("active", match);
  });
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (has("#scrollProgress")) qs("#scrollProgress").style.width = `${progress}%`;
  });
  qs("#coachSearch")?.addEventListener("input", renderFilteredCoaches);
  qs("#coachFilters")?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-coach-filter]");
    if (!button) return;
    activeCoachFilter = button.dataset.coachFilter;
    qsa("button[data-coach-filter]", qs("#coachFilters")).forEach((item) => item.classList.toggle("active", item === button));
    renderFilteredCoaches();
  });
}

async function loadContent() {
  try {
    return await api("/api/content");
  } catch (e) {
    return null;
  }
}

/* -- Hero Carousel (fade) ------------ */
function initHeroCarousel() {
  var slides = qsa(".hero-carousel-slide");
  var dots = qsa("#heroDots .fittr-hero-dot");
  if (!slides.length || !dots.length) return;
  var current = 0;
  var total = slides.length;
  var interval;

  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    slides.forEach(function(s, i) { s.classList.toggle("active", i === index); });
    dots.forEach(function(d, i) { d.classList.toggle("active", i === index); });
    current = index;
  }

  function startAuto() { interval = setInterval(function() { goTo(current + 1); }, 1600); }
  function stopAuto() { clearInterval(interval); }

  dots.forEach(function(dot) {
    dot.addEventListener("click", function() { stopAuto(); goTo(Number(dot.dataset.slide)); startAuto(); });
  });

  var touchStartX = 0;
  var track = qs("#heroCarouselTrack");
  if (track) {
    track.addEventListener("touchstart", function(e) { touchStartX = e.changedTouches[0].screenX; stopAuto(); }, { passive: true });
    track.addEventListener("touchend", function(e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
      startAuto();
    }, { passive: true });
  }

  startAuto();
}

/* -- Plan Cards accordion ------------ */
function initPlanCards() {
  var cards = qsa(".plan-card");
  cards.forEach(function(card) {
    var btn = card.querySelector(".plan-expand-btn");
    var details = card.querySelector(".plan-details");
    if (!btn || !details) return;
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      var isOpen = card.classList.toggle("open");
      details.style.maxHeight = isOpen ? details.scrollHeight + "px" : "0";
      btn.innerHTML = isOpen
        ? 'Hide Details <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="18 15 12 9 6 15"/></svg>'
        : 'View Details <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>';
    });
  });
}

/* -- Plan Modals (Core + Signature) --- */
function initPlanModals() {
  if (qs("#planOverlay")) return;
  var modalsInjected = false;
  function buildPlanHero(info) {
    var metaHtml = info.meta.map(function(m) {
      return '<span><strong>' + m.label + '</strong>' + m.value + '</span>';
    }).join('');
    var bulletsHtml = info.bullets.map(function(b) {
      return '<li>' + b + '</li>';
    }).join('');
    return '<div class="plan-modal-hero"><div class="plan-modal-panel"><h3>Overview</h3><p class="plan-modal-copy">' + info.overview + '</p><div class="plan-modal-meta">' + metaHtml + '</div></div><div class="plan-modal-panel"><h3>Plan Includes</h3><ul class="plan-modal-list">' + bulletsHtml + '</ul></div></div>';
  }
  function enhancePlanModals() {
    var plans = {
      core: {
        overview: '1:1 dedicated fitness and nutrition coaching with a hyper-personalized gym or home workout plan, progressive overload tracking in-app, tailored Indian nutrition targets, weekly formal review calls, daily chat support, and in-person posture and mobility assessment.',
        meta: [
          { label: '1 on 1 Sessions', value: '1 per week' },
          { label: 'Nutrition', value: 'Indian meal targets' },
          { label: 'Support', value: 'Daily in-app chat' },
          { label: 'Assessment', value: 'Posture + mobility' }
        ],
        bullets: [
          '1:1 dedicated fitness and nutrition coach.',
          'Hyper-personalized workout plan with progressive overload tracking in-app.',
          'Tailored Indian nutrition plan with macronutrient and calorie targets.',
          'Weekly formal video review/audit calls to track biofeedback, measurements, and form.',
          'Daily in-app chat support with an 8-hour response window.',
          'In-person training sessions with attendance check-ins and structural assessment.'
        ]
      },
      sig: {
        overview: 'An intensive transformation plan with five in-person sessions per week, a dedicated coach, hyper-personalized training and nutrition targets, weekly audit calls, app check-ins, and structural assessment.',
        meta: [
          { label: '1 on 1 Sessions', value: '5 per week' },
          { label: 'Focus', value: 'Strength + physique' },
          { label: 'Support', value: 'Daily chat + video reviews' },
          { label: 'Check-in', value: 'Selfie + location' }
        ],
        bullets: [
          'Everything in the Virtual Elite Plan with custom diet and digital workout tracking.',
          'In-person personal training sessions 5 per week with a Fitness Gurukul trainer.',
          'Mandatory app check-ins to validate each session.',
          'In-person posture, mobility, and structural assessment.',
          'Daily support and weekly formal review calls.'
        ]
      },
      prime: {
        overview: 'Complete coaching with three in-person sessions per week, a dedicated coach, hyper-personalized workout and nutrition plans, weekly review calls, and mandatory app check-ins.',
        meta: [
          { label: '1 on 1 Sessions', value: '3 per week' },
          { label: 'Delivery', value: 'At your place' },
          { label: 'Support', value: 'Daily in-app chat' },
          { label: 'Assessment', value: 'Posture + mobility' }
        ],
        bullets: [
          'Everything in the Virtual Elite Plan with digital workout tracking.',
          'In-person personal training sessions 3 per week with a Fitness Gurukul trainer at your place.',
          'Tailored Indian nutrition plan with calorie and macro targets.',
          'Weekly formal video review/audit calls and daily chat support.',
          'Mandatory check-ins, posture work, mobility, and structural assessment.'
        ]
      },
      endurance: {
        overview: 'Built for runners chasing finish lines or personal records, with periodized running plans, strength and conditioning, endurance nutrition, pacing strategy, and daily support.',
        meta: [
          { label: 'Coach', value: 'Dedicated running coach' },
          { label: 'Program', value: 'Periodized running plan' },
          { label: 'Fueling', value: 'Race-week carb loading' },
          { label: 'Support', value: 'Daily chat + video review' }
        ],
        bullets: [
          '1:1 dedicated running coach.',
          'Periodized running program with intervals, tempo runs, and long slow distance synced to the app.',
          'Runner-specific strength and conditioning focused on injury prevention, core, and hip stability.',
          'Endurance nutrition coaching, carb-loading, and mid-run fueling strategies.',
          'Pacing strategy, race-day execution plan, and weekly video reviews.'
        ]
      },
      forge: {
        overview: 'Built for athletes preparing for functional fitness racing. The plan combines compounded strength and conditioning, weekly running, grip work, agility, and explosive power drills.',
        meta: [
          { label: 'Coach', value: 'Dedicated S&C coach' },
          { label: 'Engine', value: 'Row, SkiErg, sleds' },
          { label: 'Focus', value: 'Grip + explosive power' },
          { label: 'Running', value: 'Weekly blended volumes' }
        ],
        bullets: [
          '1:1 dedicated S&C coach.',
          'Compounded S&C workouts focused on functional engine building.',
          'Rowing, SkiErg, sled pushes, and wall ball simulation.',
          'Agility, grip strength, and explosive power drills.',
          'Weekly running blended with functional movements.'
        ]
      },
      elite: {
        overview: 'A fully virtual transformation plan for weight loss, lean muscle gain, and sustainable lifestyle change. It includes a dedicated coach, personalized training, Indian nutrition targets, weekly reviews, and daily chat support.',
        meta: [
          { label: 'Coach', value: 'Dedicated fitness and nutrition' },
          { label: 'Workout', value: 'Gym or home' },
          { label: 'Nutrition', value: 'Flexible Indian meals' },
          { label: 'Support', value: 'Daily in-app chat' }
        ],
        bullets: [
          '1:1 dedicated fitness and nutrition coach.',
          'Hyper-personalized gym or home workout plans with progressive overload tracking in-app.',
          'Tailored Indian nutrition plan with macronutrient and calorie targets.',
          'Weekly formal video review/audit calls.',
          'Daily chat support with an 8-hour response window.'
        ]
      }
    };
    Object.keys(plans).forEach(function(key) {
      var modal = qs('#' + key + 'PlanModal');
      if (!modal || modal.dataset.planHeroReady === '1') return;
      if (!modal.querySelector('.plan-modal-hero')) {
        var tiers = modal.querySelector('.plan-modal-tiers');
        if (tiers) tiers.insertAdjacentHTML('beforebegin', buildPlanHero(plans[key]));
      }
      modal.dataset.planHeroReady = '1';
    });
  }
  function injectModals() {
    if (modalsInjected) return;
    if (qs("#corePlanModal") || qs("#sigPlanModal") || qs("#primePlanModal") || qs("#endurancePlanModal") || qs("#forgePlanModal") || qs("#elitePlanModal")) {
      modalsInjected = true;
      enhancePlanModals();
      return;
    }
    modalsInjected = true;
    var html = '<div class="plan-modal-overlay" id="corePlanModal"><div class="plan-modal"><button class="plan-modal-close" data-close-modal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="plan-modal-header"><div class="plan-modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><h2>Fitness Gurukul Core</h2><p class="plan-modal-sub">1-on-1 coaching � pick the plan that fits your journey</p></div><div class="plan-modal-tiers">';
    var tiers = [
      { name: "Monthly", price: "₹5,999", period: "/mo", save: null },
      { name: "Quarterly", price: "₹15,999", period: "/qr", save: "Save ₹2,997 vs monthly" },
      { name: "6 Monthly", price: "₹29,999", period: "/6mo", save: "Save ₹5,995 vs monthly", isBest: true },
      { name: "Yearly", price: "₹51,000", period: "/yr", save: "Save ₹20,988 vs monthly" }
    ];
    tiers.forEach(function(t, i) {
      var best = t.isBest ? ' plan-tier-highlight' : '';
      var badge = t.isBest ? '<div class="plan-tier-badge">Best Value</div>' : '';
      var save = t.save ? '<p class="plan-tier-save">' + t.save + '</p>' : '';
      html += '<div class="plan-tier' + best + '" style="--i:' + i + '">' + badge + '<div class="plan-tier-top"><h4>' + t.name + '</h4><p class="plan-tier-price"><span class="plan-actual">' + t.price + '</span><span class="plan-period">' + t.period + '</span></p></div><div class="plan-tier-features"><span class="plan-tier-chip">1 session/week</span><span class="plan-tier-chip">Dedicated coach</span><span class="plan-tier-chip">Custom meal plan</span><span class="plan-tier-chip">Video check-ins</span><span class="plan-tier-chip">In-person PT</span><span class="plan-tier-chip">App check-in</span></div>' + save + '<a class="primary-button" href="contact.html" style="justify-content:center;font-size:0.82rem;padding:10px 16px;border-radius:10px">Choose ' + t.name + '</a></div>';
    });
    html += '</div>';
    function howHtml(steps) {
      var h = '<div class="plan-how-section"><div class="plan-how-divider"></div><h3 class="plan-how-title">How It Works</h3><div class="plan-how-grid">';
      steps.forEach(function(st, si) {
        h += '<div class="plan-how-card" style="--k:' + si + '"><div class="plan-how-card-num">' + st.icon + '</div><h4>' + st.title + '</h4><p>' + st.desc + '</p></div>';
      });
      return h + '</div></div>';
    }
    var coreSteps = [
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M9 12l2 2 4-4M7 3h10l1 4H6L7 3z"/></svg>', title: "App & Assessment Unlock", desc: "Instant app invite + digital intake form covering fitness levels, lifestyle, medical history, and goals." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', title: "Trainer Allocation", desc: "Location & slot-based trainer assigned within hours. They connect via in-app chat to schedule session #1." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', title: "Physical Assessment", desc: "First in-person session: comprehensive audit of strength, posture & mobility to build a safe routine." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', title: "Macro & Workout Sync", desc: "24-hour turnaround: personalized calendar, PT/Recovery days, custom workouts & Indian nutrition plan." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', title: "Attendance Check-Ins", desc: "App location-tagging + selfie attendance validates each session, ensuring transparency and accountability." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', title: "Daily Tracking & Review", desc: "Log meals, water & steps daily. Coach monitors in real-time. End-of-month review to plan the next cycle." }
    ];
    var primeSteps = coreSteps;
    var sigSteps = coreSteps;
    var enduranceSteps = [
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M9 12l2 2 4-4M7 3h10l1 4H6L7 3z"/></svg>', title: "Digital Onboarding", desc: "Intake form covering running history, fitness level, goals, and medical background to build your runner profile." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', title: "Running Coach Assigned", desc: "Dedicated running coach assigned within hours. They connect via in-app chat to discuss your race goals." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', title: "Running Plan Synced", desc: "Periodized training plan � track intervals, tempo runs, and long slow distance � synced to your app calendar." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', title: "Nutrition & Race Strategy", desc: "Endurance nutrition coaching, carb-loading plan, mid-run fueling, and pacing strategy loaded into your app." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', title: "Weekly Video Reviews", desc: "Form analysis, biofeedback tracking, and progress check-ins with your coach via weekly video calls." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', title: "Daily Coach Access", desc: "In-app chat support with your running coach. Get answers to training questions within 8 hours." }
    ];
    var forgeSteps = [
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M9 12l2 2 4-4M7 3h10l1 4H6L7 3z"/></svg>', title: "Digital Onboarding", desc: "Intake form covering current fitness level, Hyrox/OCR race goals, and medical history to tailor your program." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', title: "S&C Coach Assigned", desc: "Dedicated functional fitness coach assigned within hours. They connect via in-app chat to discuss race demands." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', title: "Workout Plan Synced", desc: "Compounded S&C workouts with rowing, SkiErg, sled pushes, and wall balls simulation loaded into your app." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', title: "Engine Building Protocols", desc: "Agility, grip strength, and explosive power drills scheduled. Weekly running blended with functional movements." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', title: "Weekly Form Reviews", desc: "Video analysis, biofeedback tracking, and performance reviews with your coach to refine your technique." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', title: "Daily Coach Access", desc: "In-app chat support with your S&C coach. Get answers to training questions within 8 hours." }
    ];
    var eliteSteps = [
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M9 12l2 2 4-4M7 3h10l1 4H6L7 3z"/></svg>', title: "Digital Onboarding", desc: "Intake form covering lifestyle, fitness level, goals, and medical history to build your transformation blueprint." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', title: "Coach Assigned", desc: "Dedicated fitness & nutrition coach assigned within hours. They connect via in-app chat to welcome you." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', title: "Workout Plan Synced", desc: "Hyper-personalized workout plan with progressive overload tracking synced to your app within 24 hours." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', title: "Nutrition Plan Synced", desc: "Tailored Indian nutrition plan with macronutrient and calorie targets loaded into your app for daily tracking." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', title: "Weekly Video Check-Ins", desc: "Biofeedback, measurements, and form review via weekly video calls to track your transformation progress." },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', title: "Daily Chat Support", desc: "In-app chat with your coach. Log meals, water & steps daily. Coach responds within 8 hours." }
    ];
    html += howHtml(coreSteps) + '</div></div>';
    /* signature modal */
    html += '<div class="plan-modal-overlay" id="sigPlanModal"><div class="plan-modal"><button class="plan-modal-close" data-close-modal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="plan-modal-header"><div class="plan-modal-icon" style="color:var(--white);border-color:rgba(13,202,240,0.2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><h2 style="background:linear-gradient(135deg,#fff 30%,var(--white));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Fitness Gurukul Signature</h2><p class="plan-modal-sub">Intensive 5x/week transformation coaching</p></div><div class="plan-modal-tiers" style="grid-template-columns:1fr;max-width:500px">';
    html += '<div class="plan-tier plan-tier-highlight" style="--i:0"><div class="plan-tier-badge">Premium</div><div class="plan-tier-top"><h4>Monthly Subscription</h4><p class="plan-tier-price"><span class="plan-actual">₹15,999</span><span class="plan-period">/month</span></p></div><div class="plan-tier-features"><span class="plan-tier-chip">5 sessions/week</span><span class="plan-tier-chip">1:1 coach</span><span class="plan-tier-chip">In-person PT</span><span class="plan-tier-chip">Nutrition plan</span><span class="plan-tier-chip">Structural assessment</span><span class="plan-tier-chip">App check-in</span></div><a class="primary-button" href="contact.html" style="justify-content:center;margin-top:16px">Book a Consultation</a></div>';
    html += '</div>' + howHtml(sigSteps) + '</div></div>';
    /* prime modal */
    html += '<div class="plan-modal-overlay" id="primePlanModal"><div class="plan-modal"><button class="plan-modal-close" data-close-modal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="plan-modal-header"><div class="plan-modal-icon" style="color:var(--white);border-color:rgba(251,191,36,0.2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><h2 style="background:linear-gradient(135deg,#fff 30%,var(--white));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Fitness Gurukul Prime</h2><p class="plan-modal-sub">Complete fitness & nutrition coaching � 3x/week in-person PT</p></div><div class="plan-modal-tiers">';
    var primeTiers = [
      { name: "Monthly", price: "₹9,500", period: "/mo", save: null },
      { name: "Quarterly", price: "₹26,999", period: "/qr", save: "Save ₹1,501 vs monthly" },
      { name: "6 Monthly", price: "₹51,999", period: "/6mo", save: "Save ₹5,001 vs monthly", isBest: true }
    ];
    primeTiers.forEach(function(t, i) {
      var best = t.isBest ? ' plan-tier-highlight' : '';
      var badge = t.isBest ? '<div class="plan-tier-badge">Best Value</div>' : '';
      var save = t.save ? '<p class="plan-tier-save">' + t.save + '</p>' : '';
      html += '<div class="plan-tier' + best + '" style="--i:' + i + '">' + badge + '<div class="plan-tier-top"><h4>' + t.name + '</h4><p class="plan-tier-price"><span class="plan-actual">' + t.price + '</span><span class="plan-period">' + t.period + '</span></p></div><div class="plan-tier-features"><span class="plan-tier-chip">3 sessions/week</span><span class="plan-tier-chip">1:1 coach</span><span class="plan-tier-chip">In-person PT</span><span class="plan-tier-chip">Nutrition plan</span><span class="plan-tier-chip">Video check-ins</span><span class="plan-tier-chip">App check-in</span></div>' + save + '<a class="primary-button" href="contact.html" style="justify-content:center;font-size:0.82rem;padding:10px 16px;border-radius:10px">Choose ' + t.name + '</a></div>';
    });
    html += '</div>' + howHtml(primeSteps) + '</div></div>';
    /* endurance modal */
    html += '<div class="plan-modal-overlay" id="endurancePlanModal"><div class="plan-modal"><button class="plan-modal-close" data-close-modal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="plan-modal-header"><div class="plan-modal-icon" style="color:#ffffff;border-color:rgba(245,158,11,0.2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></div><h2 style="background:linear-gradient(135deg,#fff 30%,#ffffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Fitness Gurukul Endurance</h2><p class="plan-modal-sub">Coaching, Nutrition, Strength &amp; Race Strategy</p></div><div class="plan-modal-tiers" style="grid-template-columns:1fr;max-width:500px">';
    html += '<div class="plan-tier plan-tier-highlight" style="--i:0"><div class="plan-tier-badge" style="background:#ffffff;color:#000">Popular</div><div class="plan-tier-top"><h4>Monthly Subscription</h4><p class="plan-tier-price"><span class="plan-actual">₹1,199</span><span class="plan-period">/month</span></p></div><div class="plan-tier-features"><span class="plan-tier-chip">Dedicated running coach</span><span class="plan-tier-chip">Periodized running program</span><span class="plan-tier-chip">Runner-specific S&amp;C</span><span class="plan-tier-chip">Endurance nutrition</span><span class="plan-tier-chip">Race strategy</span><span class="plan-tier-chip">Daily chat support</span></div><a class="primary-button" href="contact.html" style="justify-content:center;font-size:0.82rem;padding:10px 16px;border-radius:10px">Subscribe Now</a></div>';
    html += '</div>' + howHtml(enduranceSteps) + '</div></div>';
    /* forge modal */
    html += '<div class="plan-modal-overlay" id="forgePlanModal"><div class="plan-modal"><button class="plan-modal-close" data-close-modal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="plan-modal-header"><div class="plan-modal-icon" style="color:#ffffff;border-color:rgba(249,115,22,0.2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><h2 style="background:linear-gradient(135deg,#fff 30%,#ffffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Fitness Gurukul Forge</h2><p class="plan-modal-sub">Hyrox / OCR Preparation � Functional Fitness Racing</p></div><div class="plan-modal-tiers" style="grid-template-columns:1fr;max-width:500px">';
    html += '<div class="plan-tier plan-tier-highlight" style="--i:0"><div class="plan-tier-badge" style="background:#ffffff;color:#000">New</div><div class="plan-tier-top"><h4>Monthly Subscription</h4><p class="plan-tier-price"><span class="plan-actual">₹999</span><span class="plan-period">/month</span></p></div><div class="plan-tier-features"><span class="plan-tier-chip">Dedicated S&amp;C Coach</span><span class="plan-tier-chip">Compounded S&amp;C</span><span class="plan-tier-chip">Engine building</span><span class="plan-tier-chip">Grip strength</span><span class="plan-tier-chip">Explosive power</span><span class="plan-tier-chip">Compromised running</span></div><a class="primary-button" href="contact.html" style="justify-content:center;font-size:0.82rem;padding:10px 16px;border-radius:10px">Subscribe Now</a></div>';
    html += '</div>' + howHtml(forgeSteps) + '</div></div>';
    /* elite modal */
    html += '<div class="plan-modal-overlay" id="elitePlanModal"><div class="plan-modal"><button class="plan-modal-close" data-close-modal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="plan-modal-header"><div class="plan-modal-icon" style="color:#ffffff;border-color:rgba(168,85,247,0.2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><h2 style="background:linear-gradient(135deg,#fff 30%,#ffffff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Virtual 1:1 Elite Transformation</h2><p class="plan-modal-sub">Weight Loss, Lean Muscle Gain & Lifestyle Overhaul</p></div><div class="plan-modal-tiers">';
    var eliteTiers = [
      { name: "Monthly", price: "₹1,999", period: "/mo", save: null },
      { name: "Quarterly", price: "₹4,499", period: "/qr", save: "Save ₹1,498 vs monthly" },
      { name: "6 Monthly", price: "₹7,999", period: "/6mo", save: "Save ₹3,995 vs monthly", isBest: true },
      { name: "Yearly", price: "₹11,999", period: "/yr", save: "Save ₹11,989 vs monthly" }
    ];
    eliteTiers.forEach(function(t, i) {
      var best = t.isBest ? ' plan-tier-highlight' : '';
      var badge = t.isBest ? '<div class="plan-tier-badge">Best Value</div>' : '';
      var save = t.save ? '<p class="plan-tier-save">' + t.save + '</p>' : '';
      html += '<div class="plan-tier' + best + '" style="--i:' + i + '">' + badge + '<div class="plan-tier-top"><h4>' + t.name + '</h4><p class="plan-tier-price"><span class="plan-actual">' + t.price + '</span><span class="plan-period">' + t.period + '</span></p></div><div class="plan-tier-features"><span class="plan-tier-chip">Dedicated coach</span><span class="plan-tier-chip">Custom workouts</span><span class="plan-tier-chip">Indian meal plan</span><span class="plan-tier-chip">Video check-ins</span><span class="plan-tier-chip">Progress tracking</span><span class="plan-tier-chip">Daily chat support</span></div>' + save + '<a class="primary-button" href="contact.html" style="justify-content:center;font-size:0.82rem;padding:10px 16px;border-radius:10px">Choose ' + t.name + '</a></div>';
    });
    html += '</div>' + howHtml(eliteSteps) + '</div></div>';
    document.body.insertAdjacentHTML("beforeend", html);
    enhancePlanModals();
  }

  function openModal(id) {
    injectModals();
    var modal = qs("#" + id);
    if (!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeAllModals() {
    qsa(".plan-modal-overlay.open").forEach(function(m) { m.classList.remove("open"); });
    document.body.style.overflow = "";
  }
  document.addEventListener("click", function(e) {
    var target = e.target;
    /* psc-card click */
    var card = target.closest(".psc-card");
    if (card) {
      if (card.tagName === "A") e.preventDefault();
      var plan = card.dataset.plan;
      if (plan === "core") { openModal("corePlanModal"); return; }
      if (plan === "prime") { openModal("primePlanModal"); return; }
      if (plan === "signature") { openModal("sigPlanModal"); return; }
      if (plan === "endurance") { openModal("endurancePlanModal"); return; }
      if (plan === "elite") { openModal("elitePlanModal"); return; }
    }
    /* any button with data-plan */
    var planBtn = target.closest("[data-plan]");
    if (planBtn) {
      if (planBtn.tagName === "A") e.preventDefault();
      var p2 = planBtn.dataset.plan;
      if (p2 === "core") { openModal("corePlanModal"); return; }
      if (p2 === "prime") { openModal("primePlanModal"); return; }
      if (p2 === "signature") { openModal("sigPlanModal"); return; }
      if (p2 === "endurance") { openModal("endurancePlanModal"); return; }
      if (p2 === "forge") { openModal("forgePlanModal"); return; }
      if (p2 === "elite") { openModal("elitePlanModal"); return; }
    }
    /* core plan card on homepage */
    if (target.closest("#corePlanCard")) { openModal("corePlanModal"); return; }
    /* close buttons */
    if (target.closest("[data-close-modal]") || target.closest("#corePlanModalClose")) { closeAllModals(); return; }
    /* backdrop click */
    if (target.classList.contains("plan-modal-overlay")) { closeAllModals(); return; }

  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && qs(".plan-modal-overlay.open")) closeAllModals();
  });
}

/* -- Feature Carousel scroll sync ---- */
function initTestiCarousel() {
  var track = qs("#testiTrack");
  var dots = qsa(".testi-dot");
  if (!track || !dots.length) return;
  var current = 0;
  var interval;
  function goTo(i) {
    if (i < 0) i = dots.length - 1;
    if (i >= dots.length) i = 0;
    current = i;
    track.style.transform = "translateX(-" + (current * 100) + "%)";
    dots.forEach(function(d, idx) { d.classList.toggle("active", idx === current); });
  }
  function startAuto() { interval = setInterval(function() { goTo(current + 1); }, 2000); }
  function stopAuto() { clearInterval(interval); }
  dots.forEach(function(d) {
    d.addEventListener("click", function() { stopAuto(); goTo(Number(d.dataset.idx)); startAuto(); });
  });
  track.addEventListener("touchstart", stopAuto, { passive: true });
  track.addEventListener("touchend", startAuto, { passive: true });
  startAuto();
}

/* -- Coach Carousel (scroll with arrows) - */
function initCoachCarousel() {
  var container = qs("#mindsCarousel");
  var prev = qs("#coachCarouselPrev");
  var next = qs("#coachCarouselNext");
  if (!container || !prev || !next) return;
  var scrollAmount = 280;
  prev.addEventListener("click", function() { container.scrollBy({ left: -scrollAmount, behavior: "smooth" }); });
  next.addEventListener("click", function() { container.scrollBy({ left: scrollAmount, behavior: "smooth" }); });
}

/* -- Ecosystem Carousel (scroll with arrows) - */
function initEcoCarousel() {
  var track = qs("#ecoScrollTrack");
  var prev = qs("#ecoArrowLeft");
  var next = qs("#ecoArrowRight");
  if (!track || !prev || !next) return;
  var scrollAmount = 320;
  function pauseAnimation() {
    track.style.animationPlayState = "paused";
  }
  function resumeAnimation() {
    track.style.animationPlayState = "running";
  }
  prev.addEventListener("click", function() { pauseAnimation(); track.scrollBy({ left: -scrollAmount, behavior: "smooth" }); });
  next.addEventListener("click", function() { pauseAnimation(); track.scrollBy({ left: scrollAmount, behavior: "smooth" }); });
  track.addEventListener("mouseenter", pauseAnimation);
  track.addEventListener("mouseleave", resumeAnimation);
}

/* -- Animated Counters --------------- */
function animateCounters() {
  var counters = qsa(".counter-num");
  if (!counters.length) return;
  /* fallback: set values after 3s if observer hasn't fired */
  var fallbackTimer = setTimeout(function() {
    counters.forEach(function(el) {
      var t = Number(el.dataset.target) || 0;
      el.textContent = t + (t >= 1000 ? "+" : "");
    });
  }, 3000);
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      clearTimeout(fallbackTimer);
      var el = entry.target;
      var target = Number(el.dataset.target) || 0;
      var duration = 2000;
      var start = performance.now();
      function tick(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + (target >= 1000 ? "+" : "");
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + (target >= 1000 ? "+" : "");
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });
  counters.forEach(function(c) { observer.observe(c); });
}

function initRevealAnimations() {
  var els = qsa(".reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale, .reveal-stagger, .home-reveal, .img-reveal, .fg-story-item");
  if (!els.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  els.forEach(function(el) { observer.observe(el); });
}

function initHomePage() {
  if (!has(".home-page")) return;

  var hero = qs("#homeHero");
  if (hero) {
    var slides = qsa(".home-hero-slide", hero);
    var panels = qsa(".home-hero-panel", hero);
    var dots = qsa(".home-hero-dots button", hero);
    var prev = qs(".home-hero-nav.prev", hero);
    var next = qs(".home-hero-nav.next", hero);
    var index = 0;
    var timer;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function(slide, n) { slide.classList.toggle("is-active", n === index); });
      panels.forEach(function(panel, n) { panel.classList.toggle("is-active", n === index); });
      dots.forEach(function(dot, n) {
        dot.classList.toggle("is-active", n === index);
        dot.setAttribute("aria-selected", n === index ? "true" : "false");
      });
    }

    function startAuto() {
      clearInterval(timer);
      timer = setInterval(function() { goTo(index + 1); }, 6500);
    }

    if (prev) prev.addEventListener("click", function() { goTo(index - 1); startAuto(); });
    if (next) next.addEventListener("click", function() { goTo(index + 1); startAuto(); });
    dots.forEach(function(dot, n) {
      dot.addEventListener("click", function() { goTo(n); startAuto(); });
    });
    hero.addEventListener("mouseenter", function() { clearInterval(timer); });
    hero.addEventListener("mouseleave", startAuto);
    goTo(0);
    startAuto();
    qsa(".home-hero .home-reveal", hero).forEach(function(el) { el.classList.add("visible"); });
  }

  qsa(".fg-carousel-pro-wrap").forEach(function(wrapper) {
    var track = qs(".fg-carousel-track", wrapper);
    var prev = qs(".fg-carousel-btn.prev", wrapper);
    var next = qs(".fg-carousel-btn.next", wrapper);
    var dotsWrap = qs(".fg-carousel-dots", wrapper);
    var progress = qs(".fg-carousel-progress span", wrapper);
    var cards = qsa(".fg-carousel-card", track);
    if (!track || !cards.length) return;

    var step = 0;
    var autoTimer;

    function cardWidth() {
      var card = cards[0];
      var gap = 20;
      return card ? card.offsetWidth + gap : 300;
    }

    function maxIndex() {
      return Math.max(0, Math.ceil((track.scrollWidth - track.clientWidth) / cardWidth()));
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i <= maxIndex(); i++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = i === step ? "is-active" : "";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", function(n) {
          return function() {
            step = n;
            track.scrollTo({ left: n * cardWidth(), behavior: "smooth" });
            updateProgress();
            restartAuto();
          };
        }(i));
        dotsWrap.appendChild(dot);
      }
    }

    function updateProgress() {
      var max = maxIndex();
      step = Math.min(max, Math.round(track.scrollLeft / cardWidth()));
      if (dotsWrap) {
        qsa("button", dotsWrap).forEach(function(dot, n) {
          dot.classList.toggle("is-active", n === step);
        });
      }
      if (progress) {
        var pct = max === 0 ? 100 : (step / max) * 100;
        progress.style.width = pct + "%";
      }
    }

    function restartAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function() {
        var max = maxIndex();
        step = step >= max ? 0 : step + 1;
        track.scrollTo({ left: step * cardWidth(), behavior: "smooth" });
        updateProgress();
      }, 4500);
    }

    if (prev) prev.addEventListener("click", function() {
      step = Math.max(0, step - 1);
      track.scrollBy({ left: -cardWidth(), behavior: "smooth" });
      updateProgress();
      restartAuto();
    });
    if (next) next.addEventListener("click", function() {
      step = Math.min(maxIndex(), step + 1);
      track.scrollBy({ left: cardWidth(), behavior: "smooth" });
      updateProgress();
      restartAuto();
    });

    track.addEventListener("scroll", function() {
      window.requestAnimationFrame(updateProgress);
    }, { passive: true });
    wrapper.addEventListener("mouseenter", function() { clearInterval(autoTimer); });
    wrapper.addEventListener("mouseleave", restartAuto);

    renderDots();
    updateProgress();
    restartAuto();
  });

  qsa(".fg-testi-fast-track").forEach(function(track) {
    if (track.dataset.cloned === "1") return;
    track.innerHTML += track.innerHTML;
    track.dataset.cloned = "1";
  });

  qsa(".img-reveal img, .home-hero-img").forEach(function(img) {
    img.addEventListener("load", function() { img.classList.add("is-loaded"); });
    if (img.complete) img.classList.add("is-loaded");
  });

  window.addEventListener("scroll", function() {
    var scrolled = window.scrollY;
    qsa(".home-hero-slide.is-active .home-hero-img").forEach(function(img) {
      img.style.transform = "scale(1.08) translateY(" + (scrolled * 0.08) + "px)";
    });
  }, { passive: true });
}

function injectFooter() {
  var existing = qs(".site-footer");
  if (existing) existing.remove();
  var f = document.createElement("footer");
  f.className = "site-footer footer-refresh";
  f.innerHTML = `<div class="footer-topline"><a class="footer-logo" href="index.html"><img src="assets/cdn/logo.jpg" alt="Fitness Gurukul" /><span class="footer-logo-text"><strong>Fitness</strong><span>Gurukul</span></span></a><p>Personal training, made personal.</p><a class="footer-cta" href="contact.html">Talk to a coach <span aria-hidden="true">&rarr;</span></a></div><div class="footer-refresh-grid"><div class="footer-intro"><p>Built for stronger, healthier lives in Hyderabad&mdash;at the studio, at home, and wherever you train.</p><a href="tel:+917207113310">+91 72071 13310</a></div><div class="footer-col"><h4>Discover</h4><nav class="footer-nav"><a href="about.html">About us</a><a href="coaches.html">Our coaches</a><a href="services.html">Services &amp; programs</a></nav></div><div class="footer-col"><h4>Start here</h4><nav class="footer-nav"><a href="tools.html">Fitness tools</a><a href="events.html">Events</a><a href="testimonials.html">Success stories</a><a href="contact.html">Book a consultation</a></nav></div><div class="footer-col"><h4>Contact Us</h4><div class="footer-contact-col"><a href="tel:+917207113310"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>+91 72071 13310</a><a href="mailto:contact@fitnessgurukul.co.in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>contact@fitnessgurukul.co.in</a><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Manikonda, Hyderabad</span><a class="footer-contact-cta" href="contact.html">Get Directions &rarr;</a></div></div><div class="footer-col"><h4>Visit</h4><p class="footer-address">Manikonda, Hyderabad<br />Telangana, India</p><div class="footer-social"><a href="https://www.instagram.com/fitnessgurukulofficial/" target="_blank" rel="noopener" aria-label="Instagram">IG</a><a href="https://www.facebook.com/fitnessgurukul7/" target="_blank" rel="noopener" aria-label="Facebook">fb</a><a href="https://www.youtube.com/channel/UCLt2Qs1MeV_uf_xMJ7AaPlA" target="_blank" rel="noopener" aria-label="YouTube">YT</a></div></div></div><div class="footer-bottom"><p class="footer-copy">&copy; 2026 Fitness Gurukul. All rights reserved.</p><a href="contact.html">Contact Us</a></div>`;
  document.body.appendChild(f);
}

function injectWhatsAppFloat() {
  if (has(".wa-float") || has(".fab-wa")) return;
  var link = document.createElement("a");
  link.className = "wa-float";
  link.href = "https://wa.me/917207113310";
  link.target = "_blank";
  link.rel = "noopener";
  link.setAttribute("aria-label", "Chat with Fitness Gurukul on WhatsApp");
  link.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.1 19.8L3 29l6.4-1.7A13 13 0 1 0 16 3Zm0 23.7a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.7 1 1-3.6-.3-.4A10.6 10.6 0 1 1 16 26.7Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1a8.7 8.7 0 0 1-2.6-1.6 9.7 9.7 0 0 1-1.8-2.3c-.2-.4 0-.6.1-.7l.5-.6c.2-.2.2-.4.3-.6s0-.5-.1-.7l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.5s-1.2 1.2-1.2 3 .1 1.4.2 1.7c.1.3 1.7 3.9 4.1 5.5.6.4 1 .6 1.4.8.6.3 1.2.3 1.6.2.5-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.2-.2-.5-.4Z"/></svg>';
  document.body.appendChild(link);
}

function injectSiteChatbot() {
  if (has(".fg-chatbot")) return;

  var chatSessionId = "fg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  var chatHistory = [];
  var chatSuggestions = [
    "Which plan is best for weight loss?",
    "Compare Core, Prime and Signature",
    "Do you have running or Hyrox plans?",
    "Which coach is best for yoga?"
  ];
  var chatBusy = false;
  var chatEngine = "local";

  var widget = document.createElement("div");
  widget.className = "fg-chatbot";
  widget.innerHTML =
    '<button class="fg-chatbot-toggle" type="button" aria-expanded="false" aria-label="Open Fitness Gurukul AI chat">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v6A3.5 3.5 0 0 1 16.5 15H12l-4.8 4.2A.75.75 0 0 1 6 18.64V15.2A3.5 3.5 0 0 1 4 12V5.5Zm3.5-2A2 2 0 0 0 5.5 5.5V12A2 2 0 0 0 7.5 14H8a.75.75 0 0 1 .75.75v2.24l2.46-2.15A.75.75 0 0 1 11.7 14h4.8a2 2 0 0 0 2-2V5.5a2 2 0 0 0-2-2h-9Z"/></svg>' +
    '</button>' +
    '<section class="fg-chatbot-panel" aria-label="Fitness Gurukul AI chatbot">' +
      '<div class="fg-chatbot-head">' +
        '<div><strong>Fitness Gurukul AI</strong><span class="fg-chatbot-status">Online assistant</span></div>' +
        '<button class="fg-chatbot-close" type="button" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="fg-chatbot-messages" aria-live="polite"></div>' +
      '<div class="fg-chatbot-suggestions"></div>' +
      '<div class="fg-chatbot-compose">' +
        '<textarea class="fg-chatbot-input" rows="1" maxlength="2000" placeholder="Ask about programs, coaches, pricing..."></textarea>' +
        '<button class="fg-chatbot-send" type="button" aria-label="Send message">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.6 21 12 3.4 3.4l2.8 7.2L16 12l-9.8 1.4-2.8 7.2Z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="fg-chatbot-foot">' +
        '<a class="fg-chatbot-cta" href="contact.html">Talk to a coach</a>' +
        '<span class="fg-chatbot-powered">Powered by Fitness Gurukul AI</span>' +
      '</div>' +
    '</section>';
  document.body.appendChild(widget);

  var toggle = widget.querySelector(".fg-chatbot-toggle");
  var panel = widget.querySelector(".fg-chatbot-panel");
  var close = widget.querySelector(".fg-chatbot-close");
  var messages = widget.querySelector(".fg-chatbot-messages");
  var suggestions = widget.querySelector(".fg-chatbot-suggestions");
  var input = widget.querySelector(".fg-chatbot-input");
  var send = widget.querySelector(".fg-chatbot-send");
  var status = widget.querySelector(".fg-chatbot-status");

  function setOpen(open) {
    widget.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      setTimeout(function() { input.focus(); }, 120);
      scrollMessages();
    }
  }

  function scrollMessages() {
    messages.scrollTop = messages.scrollHeight;
  }

  function appendMessage(role, text) {
    var bubble = document.createElement("div");
    bubble.className = "fg-chatbot-msg " + (role === "user" ? "fg-chatbot-msg-user" : "fg-chatbot-msg-bot");
    bubble.textContent = text;
    messages.appendChild(bubble);
    scrollMessages();
    return bubble;
  }

  function setTyping(active) {
    var existing = widget.querySelector(".fg-chatbot-typing");
    if (!active) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    var bubble = document.createElement("div");
    bubble.className = "fg-chatbot-msg fg-chatbot-msg-bot fg-chatbot-typing";
    bubble.innerHTML = '<span class="fg-chatbot-msg-typing"><span></span><span></span><span></span></span>';
    messages.appendChild(bubble);
    scrollMessages();
  }

  function renderSuggestions(items) {
    suggestions.innerHTML = "";
    (items || chatSuggestions).slice(0, 4).forEach(function(label) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "fg-chatbot-chip";
      chip.textContent = label;
      chip.disabled = chatBusy;
      chip.addEventListener("click", function() {
        input.value = label;
        submitChat();
      });
      suggestions.appendChild(chip);
    });
  }

  function setBusy(active) {
    chatBusy = active;
    send.disabled = active;
    input.disabled = active;
    widget.querySelectorAll(".fg-chatbot-chip").forEach(function(chip) {
      chip.disabled = active;
    });
  }

  function normalizedTokens(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function(token) { return token.length > 2; });
  }

  function planKeywordScore(plan, text) {
    var haystack = [
      plan.name,
      plan.tag,
      plan.category,
      plan.summary,
      plan.price,
      plan.sessions,
      (plan.points || []).join(" ")
    ].join(" ").toLowerCase();
    return normalizedTokens(text).reduce(function(score, token) {
      return score + (haystack.includes(token) ? 1 : 0);
    }, 0);
  }

  function findMatchingPlans(message) {
    var text = String(message || "").toLowerCase();
    var plans = (realData.services || []).slice();
    var ranked = plans
      .map(function(plan) {
        var score = planKeywordScore(plan, text);
        if (/(weight|fat|loss|slim|transform|muscle|body|lifestyle)/.test(text) && /elite|core|prime|signature/.test(plan.category)) score += 3;
        if (/(home|doorstep|personal|offline|trainer|pt|in person|session)/.test(text) && /core|prime|signature/.test(plan.category)) score += 3;
        if (/(run|running|marathon|race|endurance|5k|10k)/.test(text) && plan.category === "endurance") score += 6;
        if (/(hyrox|ocr|obstacle|functional|forge)/.test(text) && plan.category === "forge") score += 6;
        if (/(budget|cheap|low|affordable|online|virtual)/.test(text) && /elite|forge|endurance/.test(plan.category)) score += 3;
        if (/(daily|intense|fast|maximum|premium|five|5)/.test(text) && plan.category === "signature") score += 5;
        if (/(three|3|advanced|complete)/.test(text) && plan.category === "prime") score += 4;
        if (/(one|1|weekly|starter|beginner|basic|core)/.test(text) && plan.category === "core") score += 4;
        return { plan: plan, score: score };
      })
      .filter(function(item) { return item.score > 0; })
      .sort(function(a, b) { return b.score - a.score; });
    return (ranked.length ? ranked.map(function(item) { return item.plan; }) : plans).slice(0, 3);
  }

  function formatPlanReply(plans, intro) {
    var lines = [intro || "Here are the best-fit Fitness Gurukul plans:"];
    plans.slice(0, 3).forEach(function(plan) {
      lines.push(plan.name + " - " + plan.price + ". " + plan.summary.replace(/&mdash;/g, "-"));
    });
    lines.push("For the exact fit, share your goal, schedule, and whether you prefer virtual or in-person training.");
    return lines.join(" ");
  }

  function localChatReply(message) {
    var text = String(message || "").trim().toLowerCase();
    if (!text) return "Ask me about training plans, coaches, pricing, events, or booking a free consultation.";
    if (/^(hi|hello|hey|namaste)\b/.test(text)) {
      return "Hi! I am the Fitness Gurukul assistant. I can help with programs, coach matching, pricing, events, and booking a free consultation in Hyderabad.";
    }
    if (text.includes("compare") || text.includes("difference") || text.includes("core") || text.includes("prime") || text.includes("signature")) {
      return "Core is 1 session/week from INR 5,999/mo for personalized coaching. Prime is 3 sessions/week from INR 9,500/mo for more hands-on fitness and nutrition support. Signature is 5 sessions/week at INR 15,999/mo for intensive transformation with in-person PT, nutrition, posture assessment, and app check-ins.";
    }
    if (text.includes("plan") || text.includes("program") || text.includes("package") || text.includes("pricing") || text.includes("price") || text.includes("cost") || text.includes("weight") || text.includes("muscle") || text.includes("hyrox") || text.includes("running")) {
      return formatPlanReply(findMatchingPlans(text));
    }
    if (text.includes("doorstep") || text.includes("home")) {
      return formatPlanReply(findMatchingPlans("in person home doorstep core prime signature"), "Yes. For in-person or doorstep-style coaching, these are the closest plan fits:");
    }
    if (text.includes("yoga") || text.includes("coach")) {
      return "We have yoga specialists like Aditya Gururani, Kritika Chauhan, and Parul Danu, plus strength and sports coaches across 10+ experts. Tell me your goal and I can help narrow the match on the Coaches page.";
    }
    if (text.includes("event") || text.includes("marathon") || text.includes("cycling") || text.includes("independence") || text.includes("ride")) {
      return "Our latest event is the Independence Day Ride on Sunday, 16 August 2026 at 5:00 AM from SmartBike Point, Narsingi — distances from 5K to 100K. Register on iFinish or open the Events page for details. We also run community runs, corporate marathons, and bootcamps.";
    }
    if (text.includes("contact") || text.includes("phone") || text.includes("whatsapp")) {
      return "You can call 08042781491, WhatsApp +91 72071 13310, or email contact@fitnessgurukul.co.in. We are in Manikonda, Hyderabad.";
    }
    return "I can help with Fitness Gurukul programs, coach recommendations, pricing, events, and booking. Try asking about personal training, yoga, weight loss, doorstep coaching, or upcoming events.";
  }

  async function requestChatReply(message) {
    if (usesLocalBackend) {
      var controller = new AbortController();
      var timer = setTimeout(function() { controller.abort(); }, 65000);
      try {
        var res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: message,
            history: chatHistory,
            sessionId: chatSessionId
          })
        });
        var text = await res.text();
        var payload = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error(payload.error || "Request failed");
        return payload;
      } finally {
        clearTimeout(timer);
      }
    }
    return {
      ok: true,
      reply: localChatReply(message),
      source: "client",
      suggestions: chatSuggestions
    };
  }

  async function submitChat() {
    var message = String(input.value || "").trim();
    if (!message || chatBusy) return;
    appendMessage("user", message);
    chatHistory.push({ role: "user", content: message });
    input.value = "";
    input.style.height = "auto";
    setBusy(true);
    setTyping(true);
    try {
      var result = await requestChatReply(message);
      var reply = String((result && result.reply) || "Sorry, I could not answer that right now. Please try again or contact us directly.");
      setTyping(false);
      appendMessage("assistant", reply);
      chatHistory.push({ role: "assistant", content: reply });
      if (Array.isArray(result.suggestions) && result.suggestions.length) {
        chatSuggestions = result.suggestions;
      }
      if (result.source === "ollama") {
        chatEngine = "ollama";
        status.textContent = "Free local AI online";
      } else if (result.source === "openai") {
        chatEngine = "openai";
        status.textContent = "AI assistant online";
      } else {
        chatEngine = "local";
        status.textContent = "Free assistant online";
      }
      renderSuggestions(chatSuggestions);
    } catch (error) {
      setTyping(false);
      appendMessage("assistant", "I hit a connection issue. You can still book a free consultation on the Contact page or message us on WhatsApp.");
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  async function loadChatStatus() {
    if (!usesLocalBackend) {
      status.textContent = "Free assistant online";
      renderSuggestions(chatSuggestions);
      return;
    }
    try {
      var statusPayload = await api("/api/chat/status");
      if (Array.isArray(statusPayload.suggestions) && statusPayload.suggestions.length) {
        chatSuggestions = statusPayload.suggestions;
      }
      if (statusPayload.engine === "ollama") {
        chatEngine = "ollama";
        status.textContent = "Free local AI online";
      } else if (statusPayload.engine === "openai") {
        chatEngine = "openai";
        status.textContent = "AI assistant online";
      } else {
        status.textContent = "Free assistant online";
      }
    } catch (error) {
      status.textContent = "Free assistant online";
    }
    renderSuggestions(chatSuggestions);
  }

  setOpen(false);
  appendMessage("assistant", "Hi! Ask me about your goal, budget, schedule, or plans like Core, Prime, Signature, Endurance, Forge, and Elite.");
  renderSuggestions(chatSuggestions);
  loadChatStatus();

  toggle.addEventListener("click", function() {
    setOpen(!widget.classList.contains("is-open"));
  });
  close.addEventListener("click", function() { setOpen(false); });
  send.addEventListener("click", submitChat);
  input.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitChat();
    }
  });
  input.addEventListener("input", function() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 110) + "px";
  });
}


async function boot() {
  /* wire modals immediately so buttons work even before async ops finish */
  try { initPlanModals(); } catch (e) { console.warn("boot:initPlanModals", e); }
  try { renderServices(realData.services); } catch (e) { console.warn("boot:seedServices", e); }
  await detectBackend();
  const content = await loadContent();
  const d = content || realData;
  try { renderServices(Array.isArray(d.services) && d.services.length ? d.services : realData.services); } catch (e) { console.warn("boot:renderServices", e); }
  try { initPlanCards(); } catch (e) { console.warn("boot:initPlanCards", e); }
  try { renderCoaches(d.coaches || realData.coaches); } catch (e) { console.warn("boot:renderCoaches", e); }
  try { renderTestimonials(d.testimonials || realData.testimonials); } catch (e) { console.warn("boot:renderTestimonials", e); }
  try { injectAmbientBg(); } catch (e) { console.warn("boot:injectAmbientBg", e); }
  try { renderMindsCarousel(d.coaches || realData.coaches); } catch (e) { console.warn("boot:renderMindsCarousel", e); }
  try { injectHeroContent(d); } catch (e) { console.warn("boot:injectHeroContent", e); }
  try { initHeroCarousel(); } catch (e) { console.warn("boot:initHeroCarousel", e); }
  try { initCoachCarousel(); } catch (e) { console.warn("boot:initCoachCarousel", e); }
  try { initEcoCarousel(); } catch (e) { console.warn("boot:initEcoCarousel", e); }

  try { animateCounters(); } catch (e) { console.warn("boot:animateCounters", e); }
  try { initRevealAnimations(); } catch (e) { console.warn("boot:initRevealAnimations", e); }
  try { initHomePage(); } catch (e) { console.warn("boot:initHomePage", e); }
  try { injectCoachModal(); } catch (e) { console.warn("boot:injectCoachModal", e); }
  try { wireCoachPopups(); } catch (e) { console.warn("boot:wireCoachPopups", e); }
  try { injectBookModal(); wireBookModalForm(); } catch (e) { console.warn("boot:wireBookModalForm", e); }
  try { wireForms(); } catch (e) { console.warn("boot:wireForms", e); }
  try { wireNavigationAids(); } catch (e) { console.warn("boot:wireNavigationAids", e); }
  try { refreshAdminData(); } catch (e) { console.warn("boot:refreshAdminData", e); }
  try { injectLatestEventBanner(); } catch (e) { console.warn("boot:injectLatestEventBanner", e); }
  try { injectFooter(); } catch (e) { console.warn("boot:injectFooter", e); }
  try { injectWhatsAppFloat(); } catch (e) { console.warn("boot:injectWhatsAppFloat", e); }
  try { injectSiteChatbot(); } catch (e) { console.warn("boot:injectSiteChatbot", e); }
  try { initCycleCarousel(); } catch (e) { console.warn("boot:initCycleCarousel", e); }
}

// Fittr-style carousels

function initCycleCarousel() {
  var track = document.getElementById("cycleTrack");
  var prev = document.getElementById("cyclePrev");
  var next = document.getElementById("cycleNext");
  var dotsContainer = document.getElementById("cycleDots");
  if (!track) return;

  var slides = [
    { img: "https://www.instagram.com/p/DZYWAPVE8mD/media/?size=l", caption: "World Bicycle Day 2026 � Flag Off at GMC Balayogi Stadium", link: "https://www.instagram.com/p/DZYWAPVE8mD/" },
    { img: "https://fpimages.withfloats.com/actual/69844b5073641513f8f1e239.jpeg", caption: "Ride & Pose 2025 � Yoga Day Sunrise Ride at Narsingi", link: "https://www.instagram.com/p/DZoWDw4jyt6/" },
    { img: "https://www.instagram.com/p/DZSe0wCpjXz/media/?size=l", caption: "World Bicycle Day 2026 � 2500+ Riders from Across Hyderabad", link: "https://www.instagram.com/p/DZSe0wCpjXz/" },
    { img: "https://www.instagram.com/p/DUxmB6gklu8/media/?size=l", caption: "Hyderabad Club Run � 17th Edition at Gachibowli", link: "https://www.instagram.com/fitnessgurukulofficial/" },
    { img: "https://www.instagram.com/p/DZYWAPVE8mD/media/?size=l", caption: "World Bicycle Day 2026 � Community Partner Fitness Gurukul", link: "https://www.instagram.com/p/DZYWAPVE8mD/" },
    { img: "https://www.instagram.com/p/DZYWAPVE8mD/media/?size=l", caption: "World Bicycle Day 2026 � Riders at GMC Balayogi Stadium", link: "https://www.instagram.com/p/DZYWAPVE8mD/" },
    { img: "https://www.instagram.com/p/DZYWAPVE8mD/media/?size=l", caption: "World Bicycle Day 2026 � Morning Ride Across Hyderabad", link: "https://www.instagram.com/p/DZYWAPVE8mD/" },
    { img: "https://www.instagram.com/p/DZYWAPVE8mD/media/?size=l", caption: "World Bicycle Day 2026 � Fitness Gurukul Team at the Event", link: "https://www.instagram.com/p/DZYWAPVE8mD/" }
  ];

  var slideEls = [];
  var dotEls = [];

  slides.forEach(function(s, i) {
    var slide = document.createElement("div");
    slide.className = "cycle-slide" + (i === 0 ? " active" : "");

    var a = document.createElement("a");
    a.href = s.link;
    a.target = "_blank";
    a.rel = "noopener";

    var img = document.createElement("img");
    img.src = s.img;
    img.alt = s.caption;
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", function() { slide.style.display = "none"; var d = dotEls[i]; if (d) d.style.display = "none"; });

    var cap = document.createElement("div");
    cap.className = "cycle-caption";
    cap.textContent = s.caption;

    a.appendChild(img);
    a.appendChild(cap);
    slide.appendChild(a);
    track.appendChild(slide);
    slideEls.push(slide);

    var dot = document.createElement("button");
    dot.className = "cycle-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", function() { goTo(i); });
    dotsContainer.appendChild(dot);
    dotEls.push(dot);
  });

  var current = 0;
  var total = slides.length;
  var autoTimer;

  function goTo(idx) {
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    slideEls.forEach(function(s, i) { s.classList.toggle("active", i === idx); });
    dotEls.forEach(function(d, i) { d.classList.toggle("active", i === idx); });
    current = idx;
  }

  function findNext(dir) {
    var i = (current + dir + total) % total;
    var tries = 0;
    while (slideEls[i].style.display === "none" && tries < total) {
      i = (i + dir + total) % total;
      tries++;
    }
    return i;
  }

  prev.addEventListener("click", function() { stopAuto(); goTo(findNext(-1)); startAuto(); });
  next.addEventListener("click", function() { stopAuto(); goTo(findNext(1)); startAuto(); });

  function startAuto() { stopAuto(); autoTimer = setInterval(function() { goTo(findNext(1)); }, 3200); }
  function stopAuto() { clearInterval(autoTimer); }

  var wrap = track.parentElement;
  wrap.addEventListener("mouseenter", stopAuto);
  wrap.addEventListener("mouseleave", startAuto);
  wrap.addEventListener("touchstart", stopAuto, { passive: true });
  startAuto();
}


(function() {
  // Lives carousel navigation
  const livesCarousel = document.getElementById('livesCarousel');
  const livesPrev = document.getElementById('livesPrev');
  const livesNext = document.getElementById('livesNext');
  if (livesCarousel && livesPrev && livesNext) {
    livesPrev.addEventListener('click', function() {
      livesCarousel.scrollBy({ left: -340, behavior: 'smooth' });
    });
    livesNext.addEventListener('click', function() {
      livesCarousel.scrollBy({ left: 340, behavior: 'smooth' });
    });
  }

  // Gallery carousels (arrows + dots)
  function initGalleryCarousel(id) {
    var wrap = document.getElementById(id);
    if (!wrap) return;
    var parent = wrap.closest('.gallery-carousel-wrap') || wrap.parentElement;
    var prevBtn = parent.querySelector('.gallery-carr-prev');
    var nextBtn = parent.querySelector('.gallery-carr-next');
    var dotsContainer = wrap.parentElement.nextElementSibling;
    if (!dotsContainer || !dotsContainer.classList.contains('gallery-carr-dots')) dotsContainer = null;
    if (!prevBtn || !nextBtn) return;
    var scrollAmount = 300;
    prevBtn.addEventListener('click', function() { wrap.scrollBy({ left: -scrollAmount, behavior: 'smooth' }); });
    nextBtn.addEventListener('click', function() { wrap.scrollBy({ left: scrollAmount, behavior: 'smooth' }); });
    // Build dots
    if (dotsContainer) {
      var cards = wrap.children;
      var dotCount = Math.max(1, Math.ceil(cards.length / 2));
      dotsContainer.innerHTML = '';
      for (var i = 0; i < dotCount; i++) {
        var dot = document.createElement('button');
        dot.className = 'gallery-carr-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dotsContainer.appendChild(dot);
      }
      var dots = dotsContainer.children;
      function syncDots() {
        var idx = Math.round(wrap.scrollLeft / (wrap.scrollWidth / dotCount));
        if (idx >= dotCount) idx = dotCount - 1;
        Array.from(dots).forEach(function(d, j) { d.classList.toggle('active', j === idx); });
      }
      wrap.addEventListener('scroll', syncDots, { passive: true });
      Array.from(dots).forEach(function(d, j) {
        d.addEventListener('click', function() {
          wrap.scrollTo({ left: (wrap.scrollWidth / dotCount) * j, behavior: 'smooth' });
        });
      });
    }
  }

  initGalleryCarousel('spaceCarousel');
  initGalleryCarousel('galleryCarousel1');
  initGalleryCarousel('galleryCarousel2');
  initGalleryCarousel('galleryCarousel3');

})();

/* -- Coach Calendar Overlay -- */
(function() {
  var coachData = {
    "aditya-gururani": { name:"Aditya Gururani", role:"Yoga Instructor & Breathing Specialist", badge:"Breathwork Expert", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0302-69538f34664ae75da3c69fce.jpg", tags:["Breathwork","Stress management","Functional mobility"] },
    "b-yashwanth": { name:"B Yashwanth", role:"Basketball Coach", badge:"Sports Specialist", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0305-6953918f0222ba9c3d831822.jpeg", tags:["Basketball","Sports coaching","Conditioning"] },
    "kritika-chauhan": { name:"Kritika Chauhan", role:"Fitness Trainer", badge:"Flexibility Coach", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0301-69538f15474cc000b54586c8.jpg", tags:["Flexibility","Mobility","General fitness"] },
    "shivajeet-kanaujiya": { name:"Shivajeet Kanaujiya", role:"Fitness Trainer", badge:"Strength Builder", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0300-69538ef2474cc000b54586c5.jpg", tags:["Fitness training","Strength","Daily exercise"] },
    "anand-yadav": { name:"Anand Yadav", role:"Children's Athletics Coach", badge:"Kids Fitness Expert", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0297-69538d52664ae75da3c69fc1.jpg", tags:["Children's athletics","Kids fitness","Sports"] },
    "aditya": { name:"Aditya", role:"Yoga Instructor & Fitness Coach", badge:"Mind-Body Coach", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0298-69538dd1474cc000b54586be.jpg", tags:["Yoga","Fitness","Body toning"] },
    "nitu-arya": { name:"Nitu Arya", role:"Yoga Instructor", badge:"Holistic Yoga", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0295-69538d35474cc000b54586b7.jpg", tags:["Yoga","Flexibility","General fitness"] },
    "rahul-bisht": { name:"Rahul Bisht", role:"Yoga Instructor", badge:"Mobility Master", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0294-69538d19474cc000b54586b4.jpg", tags:["Yoga","Mobility","General fitness"] },
    "deepesh-kumar": { name:"Deepesh Kumar", role:"Fitness Trainer", badge:"Weight Loss Specialist", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0293-69538d00664ae75da3c69fbc.jpg", tags:["Fitness training","Strength","Weight loss"] },
    "s-jeetender": { name:"S Jeetender", role:"Fitness Trainer", badge:"Daily Fitness Pro", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0292-69538ce6474cc000b54586b3.jpg", tags:["Fitness training","Daily exercise","Strength"] },
    "rahul-dawar": { name:"Rahul Dawar", role:"Fitness Trainer", badge:"Health & Strength", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0291-69538ccf8c7b7b2c6178b6e1.jpg", tags:["Fitness training","Strength","Health routine"] },
    "rahul-singh-pawar": { name:"Rahul Singh Pawar", role:"Yoga Instructor", badge:"Stress Relief Expert", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0290-69538cb65c5bdcd270817b1f.jpg", tags:["Yoga","Flexibility","Stress relief"] },
    "ravi-pal": { name:"Ravi Pal", role:"Fitness Trainer & Injury Rehab Coach", badge:"Injury Recovery", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0289-69538c800222ba9c3d831802.jpg", tags:["Fitness training","Injury rehabilitation","Recovery"] },
    "subedhar-yadav": { name:"Subedhar Yadav", role:"Fitness Trainer (Special Children)", badge:"Special Needs Coach", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/img_0287-69538c4c0222ba9c3d8317fd.jpg", tags:["Special children","Fitness","Mobility"] },
    "sanjeev": { name:"Sanjeev", role:"Fitness Trainer", badge:"Strength Trainer", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/274dba00-8541-4bfc-8666-e0b5433b3781-69538a190222ba9c3d8317f4.jpg", tags:["Fitness training","Strength","Daily exercise"] },
    "nandlal": { name:"Nandlal", role:"Fitness Trainer", badge:"Transformation Coach", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/04ea7dfe-a988-4a17-97cb-8dc44240cb59-695389c4474cc000b54586a8.jpg", tags:["Fitness training","Strength","Weight loss"] },
    "prasenjit-ghosh": { name:"Prasenjit Ghosh", role:"Mudgar & Hybrid Training Specialist", badge:"Hybrid Training", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/db612d80-360a-4c76-9a18-0e97da5d1dc9-69538988474cc000b54586a5.jpg", tags:["Mudgar","Hybrid training","Strength"] },
    "vinay-ojha": { name:"Vinay Ojha", role:"Fitness Trainer", badge:"All-Round Fitness", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/32f29c04-6a08-46c7-b752-810892edad88-695388d0664ae75da3c69fa9.jpg", tags:["Fitness training","Strength","General fitness"] },
    "ankit-singh-chauhan": { name:"Ankit Singh Chauhan", role:"Fitness & Calisthenics Trainer", badge:"Calisthenics Expert", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/debb9e52-bcf2-4630-8cc5-2ffc9af3e114-69538879664ae75da3c69fa8.jpg", tags:["Fitness","Calisthenics","Strength"] },
    "suresh-yadav": { name:"Suresh Yadav", role:"Fitness Trainer (Special Children)", badge:"Special Needs Expert", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/suresh-695209865c5bdcd270817774.jpeg", tags:["Special children","Fitness","Mobility"] },
    "parul-danu": { name:"Parul Danu", role:"Yoga Instructor", badge:"Yoga & Wellness", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/parul-695209395c5bdcd270817773.jpeg", tags:["Yoga","Flexibility","Stress relief"] },
    "raju": { name:"Raju", role:"Fitness Trainer", badge:"Fitness Guide", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/raju-69520adb8c7b7b2c6178b36b.jpeg", tags:["Fitness training","Strength","Health routine"] },
    "vishal-choudhary": { name:"Vishal Choudhary", role:"Fitness Trainer", badge:"Personal Training Pro", img:"https://web.s-cdn.boostkit.dev/webaction-files/67dd161916df35677e31c42c_myteam/vishal-69520b6a5c5bdcd270817783.jpeg", tags:["Fitness training","Strength","Personal training"] }
  };

  var dayNamesShort = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  var dayNamesFull = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  var coachSchedules = {
    "aditya-gururani": [["6-7 am","8-9 am","4:30-5:30"],["6:15-7:15 am","8-9 am"],["6-7 am","8-9 am","4:30-5:30"],["6:15-7:15 am","8-9 am"],["6-7 am","8-9 am","4:30-5:30"],["6:15-7:15 am","8-9 am"],["8-9 am"]],
    "aditya": [["6-7 am","8-9 am","4:30-5:30"],["6:15-7:15 am","8-9 am"],["6-7 am","8-9 am","4:30-5:30"],["6:15-7:15 am","8-9 am"],["6-7 am","8-9 am","4:30-5:30"],["6:15-7:15 am","8-9 am"],["8-9 am"]],
    "anand-yadav": [["6-7 am","School 9:30"],["5:30-6:30 am","7-8 am","School 9:30"],["6-7 am","School 9:30"],["5:30-6:30 am","7-8 am","School 9:30"],["6-7 am","School 9:30"],["7-8 am","School 9:30"],["8-9"]],
    "ankit-singh-chauhan": [["8-9","9:30-10:30","6-7"],["9:30-10:30"],["8-9","9:30-10:30","6-7"],["9:30-10:30"],["8-9","9:30-10:30","6-7"],["9:30-10:30"],[]],
    "deepesh-kumar": [["7:15-8:15","8:30-9:30"],["5:30-6:30","8:30-9:30","5-6"],["7:15-8:15","8:30-9:30"],["5:30-6:30","8:30-9:30"],["7:15-8:15","8:30-9:30","5-6"],["5:30-6:30","8:30-9:30"],["7:15-8:15"]],
    "nitu-arya": [["6:00-7:00","7:30-8:30","8-9","12:30-1:30","4:30 to 5:30","6:30 to 7:30"],["6:00-7:00","7:30-8:30","8-9","12:00 - 1:00 HR","1:00 - 2:00 HR","4-5","6-7"],["6:00-7:00","7:30-8:30","8-9","12:30-1:30","4:30 to 5:30","6:30 to 7:30"],["6:00-7:00","7:30-8:30","8-9","12:00 - 1:00 HR","1:00 - 2:00 HR","4-5","6-7"],["6:00-7:00","7:30-8:30","8-9","4:30 to 5:30","6:30 to 7:30"],["7:30-8:30","8-9","12:30-1:30","4-5","6-7"],[]],
    "rahul-dawar": [["School 9:30","NA"],["6:00 - 7:00 HR","School 9:30"],["5:45 - 6:45 HR","School 9:30"],["6:00 - 7:00 HR","School 9:30"],["5:45 - 6:45 HR","School 9:30"],[],[]],
    "s-jeetender": [["6:00-7:00","7:00-8:00","8:30-9:30","10:00-11:00","4-5","6:30 to 7:30","7:30-8:30"],["6:00-7:00","8:30-9:30","10:00-11:00","4-5","5:30 to 6:30"],["6:00-7:00","7:00-8:00","8:30-9:30","10:00-11:00","4-5","6:30 to 7:30","7:30-8:30"],["6:00-7:00","8:30-9:30","10:00-11:00","4-5","5:30 to 6:30","6:30 to 7:30"],["6:00-7:00","7:00-8:00","8:30-9:30","10:00-11:00","4-5","6:00 to 7:00"],["6:00-7:00","8:30-9:30"],[]],
    "shivajeet-kanaujiya": [["7:30-8:30","School 9:30"],["6:45 to 7:45","8-9 am","School 9:30"],["5:40 to 6:40","7:30-8:30","School 9:30"],["6:45 to 7:45","8-9 am","School 9:30"],["5:40 to 6:40","7:30-8:30","School 9:30","8-9"],["6:45 to 7:45","8-9 am","School 9:30","11-12"],["8-9 am","11-12"]],
    "subedhar-yadav": [["School 9:30"],["School 9:30"],["School 9:30"],["School 9:30"],["School 9:30"],["School 9:30"],[]],
    "suresh-yadav": [["School 9:30","5-6"],["7:30-8:30","School 9:30"],["6-7","8-9","School 9:30","5-6"],["7:30-8:30","School 9:30"],["6-7","8-9","School 9:30","5-6"],["7:30-8:30","School 9:30"],[]],
    "ravi-pal": [["7:30-8:30"],["6-7 am","9:30-10:30"],["7:30-8:30"],["6-7 am","9:30-10:30"],["7:30-8:30"],["6-7 am","9:30-10:30"],[]],
    "vinay-ojha": [["8-9","4:30-5:30","5-6"],["6-7","7:30-8:30"],["6-7","8-9","4:30-5:30","5-6"],["6-7","7:30-8:30"],["6-7","8-9","4:30-5:30","5-6"],["6-7","7:30-8:30"],[]],
    "parul-danu": [["5:15-6:15","6:30-7:30"],["11-12"],["5:15-6:15","6:30-7:30"],["11-12"],["5:15-6:15","6:30-7:30"],["11-12"],[]],
    "nandlal": [["7:00-8:00","5:00-6:00"],["6:00-7:00"],["6:00 - 7:00 HR","7:00-8:00","5:00-6:00"],["6:00-7:00"],["6:00 - 7:00 HR","7:00-8:00","5:00-6:00"],["6:00-7:00"],[]],
    "prasenjit-ghosh": [["9:00-10:00"],["8:00-9:00 GC","7:30-8:30"],["9:00-10:00"],["8:00-9:00 GC","7:30-8:30"],["9:00-10:00"],["8:00-9:00 GC","7:30-8:30"],[]],
    "raju": [["5:45 - 6:45 HR","7:00-8:00","9:30-10:30 GC","4:30 to 5:30","6:30 to 7:30"],["7:00-8:00","8:00-9:00","10:30-11:30 GC","5:30 to 6:30","6:30 to 7:30"],["5:45 - 6:45 HR","7:00-8:00","8:00-9:00","10:30-11:30 GC","4:30 to 5:30","6:30 to 7:30"],["7:00-8:00","10:30-11:30 GC","5:30 to 6:30","6:30 to 7:30"],["5:45 - 6:45 HR","7:00-8:00","9:30-10:30 GC","4:30 to 5:30","6:30 to 7:30"],["7:00-8:00","8:00-9:00","5:30 to 6:30","6:30 to 7:30"],["7:00-8:00","8:00-9:00"]]
  };

  function scheduleTotal(slots) {
    return (slots || []).reduce(function(total, day) { return total + day.length; }, 0);
  }

  function fakeCoachRating(id) {
    var index = Object.keys(coachData).indexOf(id);
    if (index < 0) index = 0;
    return (4.5 + (index % 5) * 0.1).toFixed(1);
  }

  function scheduleSlotClass(slot) {
    var lower = String(slot || "").toLowerCase();
    if (lower.indexOf("school") > -1 || lower.indexOf("gc") > -1) return "fg-schedule-slot group";
    if (lower.indexOf("hr") > -1 || lower.indexOf("yoga") > -1) return "fg-schedule-slot yoga";
    return "fg-schedule-slot pt";
  }

  function buildScheduleCalendarHTML(coachId, compact) {
    var data = coachData[coachId] || {};
    var schedule = coachSchedules[coachId] || [[],[],[],[],[],[],[]];
    var total = scheduleTotal(schedule);
    var meta = fakeCoachMeta({ slug: coachId, name: data.name }, Object.keys(coachData).indexOf(coachId));
    return '<section class="' + (compact ? "fg-coach-schedule compact" : "fg-coach-schedule") + '">' +
      '<div class="fg-schedule-head">' +
        '<div><p class="eyebrow">Live weekly calendar</p><h2>' + safe(data.name || "Coach") + ' schedule</h2><p>June 2026 class slots, separated directly for this coach.</p></div>' +
        '<div class="fg-schedule-stats"><span><strong>' + total + '</strong> weekly slots</span><span><strong>' + meta.rating + '</strong> rating</span><span><strong>' + meta.reviews + '</strong> reviews</span></div>' +
      '</div>' +
      '<div class="fg-week-calendar">' +
        dayNamesFull.map(function(day, index) {
          var slots = schedule[index] || [];
          return '<article class="fg-day-card"><div class="fg-day-top"><strong>' + day + '</strong><span>' + slots.length + ' slots</span></div>' +
            '<div class="fg-day-slots">' + (slots.length ? slots.map(function(slot) {
              return '<span class="' + scheduleSlotClass(slot) + '">' + safe(slot) + '</span>';
            }).join("") : '<span class="fg-schedule-empty">No class scheduled</span>') + '</div></article>';
        }).join("") +
      '</div>' +
    '</section>';
  }

  function buildCumulativeHTML() {
    var html = "";
    Object.keys(coachData).forEach(function(id) {
      var d = coachData[id];
      if (!coachSchedules[id]) return;
      html += '<div class="cal-coach-block"><div class="cal-coach-block-header"><div class="cal-coach-block-img"><img src="' + d.img + '" alt="' + d.name + '" loading="lazy" /></div><div class="cal-coach-block-info"><strong>' + d.name + '</strong><span>' + d.role + ' � ' + scheduleTotal(coachSchedules[id]) + ' weekly slots</span></div></div>';
      html += buildScheduleCalendarHTML(id, true);
      html += '</div>';
    });
    return html;
  }

  function renderInlineCoachCalendar() {
    var path = window.location.pathname.split("/").pop() || "";
    if (!path || path.indexOf(".html") === -1) return;
    var coachId = path.replace(".html", "");
    if (!coachData[coachId] || !coachSchedules[coachId]) return;
    if (document.querySelector(".fg-coach-schedule")) return;
    var hero = document.querySelector(".coach-profile-hero");
    if (!hero) return;
    hero.insertAdjacentHTML("afterend", buildScheduleCalendarHTML(coachId, false));
  }

  renderInlineCoachCalendar();

  var overlay = document.getElementById("coachCalOverlay");
  var closeBtn = document.getElementById("coachCalClose");
  var calImg = document.getElementById("calCoachImg");
  var calName = document.getElementById("calCoachName");
  var calRole = document.getElementById("calCoachRole");
  var calBadges = document.getElementById("calCoachBadges");
  var calGridWrap = document.querySelector(".coach-cal-grid-wrap");
  var calTitle = document.querySelector(".coach-cal-title");

  if (overlay) {
    /* Replace table grid with cumulative calendar blocks */
    if (calGridWrap) {
      calGridWrap.innerHTML = '<div class="cal-coach-container">' + buildCumulativeHTML() + '</div>';
    }
    if (calTitle) calTitle.textContent = "All Coaches Schedule � June 2026";

    function closeCoachOverlay() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", closeCoachOverlay);
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) closeCoachOverlay();
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") closeCoachOverlay();
    });

    /* Schedule buttons removed */

    /* Also wire "View Profile" and "Know More" clicks � self-contained popup */
    function openCoachProfile(id) {
      var d = coachData[id];
      if (!d) return;
      /* Build and inject profile overlay on the fly */
      if (!document.getElementById("coachProfileOverlay")) {
        var div = document.createElement("div");
        div.id = "coachProfileOverlay";
        div.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity 0.3s,visibility 0.3s;padding:20px";
        div.innerHTML =
          '<div style="background:rgba(0,0,0,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:20px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;padding:0;position:relative;transform:translateY(20px);transition:transform 0.35s">' +
            '<button id="cpClose" style="position:absolute;top:12px;right:16px;background:none;border:none;color:rgba(255,255,255,0.3);font-size:1.5rem;cursor:pointer;font-family:inherit;line-height:1;z-index:2">&times;</button>' +
            '<div id="cpBody"></div>' +
          '</div>';
        document.body.appendChild(div);
        /* wire close */
        document.getElementById("cpClose").addEventListener("click", closeCoachProfile);
        div.addEventListener("click", function(e) { if (e.target === div) closeCoachProfile(); });
        document.addEventListener("keydown", function cpEsc(e) { if (e.key === "Escape") closeCoachProfile(); });
      }
      function closeCoachProfile() {
        var el = document.getElementById("coachProfileOverlay");
        if (!el) return;
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        document.body.style.overflow = "";
      }
      var overlay = document.getElementById("coachProfileOverlay");
      var idx = Object.keys(coachData).indexOf(id);
      if (idx < 0) idx = 0;
      var fakeExp = (idx % 5) + 4 + " Years Experience";
      var fakeClients = ((idx % 8) + 1) * 50 + " Transformations";
      var fakeRating = (4.5 + (idx % 5) * 0.1).toFixed(1);
      var fakeStars = parseInt(fakeRating) >= 5 ? "★★★★★" : parseInt(fakeRating) >= 4 ? "★★★★★" : "★★★★★";
      var certs = ["Certified Personal Trainer", "CPR/AED Certified", "Sports Nutrition Specialist"];
      var certHtml = certs.slice(0, 2 + (idx % 2)).map(function(c) { return '<span style="font-size:0.7rem;color:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:3px 10px;display:inline-block">' + c + '</span>'; }).join("");
      document.getElementById("cpBody").innerHTML =
        '<div style="position:relative;height:180px;background:rgba(255,255,255,0.04);overflow:hidden;display:flex;align-items:center;justify-content:center">' +
          '<img src="' + d.img + '" alt="' + d.name + '" style="width:100%;height:100%;object-fit:cover" />' +
          '<div style="position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(0,0,0,0.85))"></div>' +
          '<span style="position:absolute;bottom:16px;left:16px;font-size:0.65rem;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:3px 12px;background:rgba(0,0,0,0.4)">' + d.badge + '</span>' +
        '</div>' +
        '<div style="padding:20px 24px 24px">' +
          '<h2 style="font-size:1.3rem;font-weight:700;color:#fff;margin:0 0 2px">' + d.name + '</h2>' +
          '<p style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin:0 0 16px">' + d.role + '</p>' +
          '<div style="display:flex;gap:12px;margin-bottom:16px">' +
            '<div style="flex:1;text-align:center;padding:10px;border:1px solid rgba(255,255,255,0.06);border-radius:10px"><span style="font-size:0.7rem;color:#fff;font-weight:600;display:block">' + fakeExp.split(" ")[0] + '</span><span style="font-size:0.62rem;color:rgba(255,255,255,0.35)">Experience</span></div>' +
            '<div style="flex:1;text-align:center;padding:10px;border:1px solid rgba(255,255,255,0.06);border-radius:10px"><span style="font-size:0.7rem;color:#fff;font-weight:600;display:block">' + fakeClients.split(" ")[0] + '</span><span style="font-size:0.62rem;color:rgba(255,255,255,0.35)">Clients</span></div>' +
            '<div style="flex:1;text-align:center;padding:10px;border:1px solid rgba(255,255,255,0.06);border-radius:10px"><span style="font-size:0.7rem;color:#fff;font-weight:600;display:block">' + fakeRating + '</span><span style="font-size:0.62rem;color:rgba(255,255,255,0.35)">' + fakeStars + '</span></div>' +
          '</div>' +
          '<p style="font-size:0.8rem;color:rgba(255,255,255,0.5);line-height:1.6;margin:0 0 14px">' + d.name + ' is a certified ' + d.role.toLowerCase() + ' at Fitness Gurukul, dedicated to helping clients achieve their fitness goals through personalized coaching.</p>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">' + d.tags.map(function(t) { return '<span style="font-size:0.68rem;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:3px 10px">' + t + '</span>'; }).join("") + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px">' + certHtml + '</div>' +
          '<a href="contact.html#booking" style="display:block;padding:12px;border-radius:10px;background:#fff;color:#000;font-weight:700;font-size:0.85rem;text-decoration:none;text-align:center">Book ' + d.name.split(" ")[0] + '</a>' +
        '</div>';
      overlay.style.opacity = "1";
      overlay.style.visibility = "visible";
      overlay.querySelector("div > div").style.transform = "translateY(0)";
      document.body.style.overflow = "hidden";
    }

    function wireProfileButtons(root) {
      root.querySelectorAll(".ccv2-profile-btn, .coach-know-more").forEach(function(el) {
        if (el.dataset.calWired) return;
        el.dataset.calWired = "1";
        el.addEventListener("click", function(e) {
          var card = e.target.closest("[data-coach-id]");
          if (!card) return;
          e.preventDefault();
          openCoachProfile(card.getAttribute("data-coach-id"));
        });
      });
    }
    wireProfileButtons(document);
    var profileObserver = new MutationObserver(function() { wireProfileButtons(document); });
    profileObserver.observe(document.body, { childList: true, subtree: true });
  }
})();

/* -- Services Catalog Overlay -- */
(function() {
  var svcData = [
    { cat:"Personal Training", sub:"One-on-one coaching for every fitness goal", img:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
      items:[
        { name:"Strength Training", desc:"Build raw power with progressive overload, compound lifts, and periodized programming for increased bone density and functional strength." },
        { name:"Muscle Gain", desc:"Science-backed hypertrophy training with structured volume, frequency, and nutrition to optimize lean mass gains." },
        { name:"Fat Loss", desc:"Strategic calorie deficit programming combining resistance training and conditioning for sustainable fat loss while preserving muscle." },
        { name:"Maintenance Phase", desc:"Periodized programming to maintain strength and physique during off-seasons, travel, or between goal cycles." },
        { name:"Rehabilitation", desc:"Corrective exercise and mobility work to recover from injury, restore movement patterns, and prevent re-injury." },
        { name:"General Fitness", desc:"Balanced programming for overall health � improving cardiovascular endurance, strength, flexibility, and daily energy." },
        { name:"Hyrox Prep", desc:"Hybrid race preparation combining running with functional stations � SkiErg, sleds, wall balls, burpees, and compromised running stamina." },
        { name:"Devil Circuit", desc:"Obstacle course race training � grip strength, climbing, crawling, agility, and mental toughness for OCR events." }
      ]},
    { cat:"Yoga", sub:"Mind-body discipline for strength & flexibility", img:"https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&q=80",
      items:[
        { name:"Hatha Yoga", desc:"Slow-paced practice focusing on basic poses held for several breaths. Builds flexibility, balance, and mind-body awareness." },
        { name:"Iyengar Yoga", desc:"Precision-focused alignment using props � blocks, straps, bolsters. Ideal for posture correction and therapeutic practice." },
        { name:"Vinyasa Yoga", desc:"Dynamic flow linking breath with movement. Builds cardiovascular endurance, strength, and coordination through sequenced transitions." },
        { name:"Ashtanga Yoga", desc:"Structured series of poses practiced in order with synchronized breathing. Builds heat, discipline, and deep flexibility." },
        { name:"Meditation", desc:"Guided mindfulness and breathing techniques to reduce stress, improve focus, and cultivate inner calm." },
        { name:"Pranayam", desc:"Breath control exercises to regulate energy, calm the nervous system, and enhance respiratory capacity." }
      ]},
    { cat:"Nutrition", sub:"Science-backed meal plans for every body", img:"https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80",
      items:[
        { name:"Fat Loss Nutrition", desc:"Calorie-controlled macro plans with flexible dieting. Emphasis on protein satiety, fiber, and nutrient density for sustainable weight loss." },
        { name:"Muscle Gain Nutrition", desc:"Calorie-surplus plans with precise macro targets to fuel muscle protein synthesis and recovery." },
        { name:"Maintenance Phase", desc:"Balanced nutrition to sustain weight and body composition without restrictive dieting or surplus." },
        { name:"Vegan Plans", desc:"Complete plant-based nutrition covering all essential amino acids, micronutrients, and energy needs for training." },
        { name:"Vegetarian Plans", desc:"Lacto-ovo vegetarian meal plans with optimal protein distribution and iron/B12 management." },
        { name:"Intermittent Fasting", desc:"Time-restricted eating protocols aligned with training schedules for fat loss and metabolic flexibility." },
        { name:"Ketogenic Diet", desc:"Low-carb, high-fat nutritional approach for ketosis � with proper electrolyte balance and adaptation guidance." },
        { name:"Weight Loss & Gain", desc:"Custom plans for both directions � structured deficits for weight loss or controlled surpluses for healthy weight gain." }
      ]},
    { cat:"Cycling", sub:"Structured ride programs for all distances", img:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80",
      items:[
        { name:"Beginner Plans", desc:"Foundation-building programs covering bike fit, cadence, gear shifting, and group riding etiquette." },
        { name:"5K Ride Prep", desc:"Short-distance speed work � interval training, pacing, and leg speed drills for fast 5K efforts." },
        { name:"10K Ride Prep", desc:"Aerobic base building with tempo efforts, hill repeats, and sustained power output development." },
        { name:"25K Ride Prep", desc:"Intermediate distance programming � endurance pacing, group ride tactics, and nutrition strategies." },
        { name:"50K Ride Prep", desc:"Long-distance preparation with lactate threshold work, prolonged tempo efforts, and fueling protocols." },
        { name:"100K Ride Prep", desc:"Gran fondo and century training � periodized long rides, nutrition planning, and recovery management." },
        { name:"Cycling Nutrition", desc:"Pre-ride fueling, on-bike carbohydrate intake, hydration strategy, and post-ride recovery nutrition." },
        { name:"Hyrox + Cycling", desc:"Hybrid programming combining cycling endurance with Hyrox functional stations for cross-training athletes." }
      ]},
    { cat:"Running", sub:"Performance & endurance coaching", img:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80",
      items:[
        { name:"Beginner Plans", desc:"Couch-to-5K style progression building confidence, consistency, and proper running form from scratch." },
        { name:"5K / 10K Prep", desc:"Structured speed work, interval training, and tempo runs targeting your best 5K or 10K time." },
        { name:"Half Marathon Prep", desc:"Periodized 12�16 week plans combining easy runs, threshold work, long runs, and race-day strategy." },
        { name:"Marathon Prep", desc:"Full marathon programming with progressive long runs, pace work, nutrition, and taper planning." },
        { name:"Running Nutrition", desc:"Fueling strategies for training and race day � carb loading, hydration, electrolyte balance, and recovery." },
        { name:"Hyrox + Running", desc:"Specialized programming for compromised running after functional stations. Pacing, transitions, and fatigue management." }
      ]}
  ];

  var hyroxData = {
    cat:"Cycling + Hyrox", sub:"Hybrid endurance race preparation", img:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80",
    items:[
      { name:"Combined Programming", desc:"Integrated cycling and Hyrox training plans that build both aerobic engines and functional station strength simultaneously." },
      { name:"Engine Building", desc:"Zone 2 base work combined with HIIT intervals to develop the cardiovascular capacity needed for hybrid racing." },
      { name:"Compromised Running", desc:"Running on fatigued legs after station work � simulation drills to build race-specific resilience." },
      { name:"Race Strategy", desc:"Pacing plans, transition practice, station approach tactics, and mental preparation for race day." },
      { name:"Nutrition & Recovery", desc:"Hybrid-specific fueling protocols balancing carbohydrate demands of cycling with protein needs for functional strength." }
    ]
  };

  var corpData = [
    "Corporate wellness programs","Team building fitness events","On-site yoga sessions","Group challenge events","Employee health assessments","Step challenges & leaderboards","Wellness workshops","Stress management programs"
  ];

  function buildItemHTML(items) {
    var h = "";
    items.forEach(function(i) {
      h += '<div class="svc-cat-item"><strong>' + i.name + '</strong><p>' + i.desc + '</p></div>';
    });
    return h;
  }

  function buildSvcOverlayHTML() {
    var cards = "";
    svcData.forEach(function(s) {
      cards += '<div class="svc-cat-card has-img"><div class="svc-cat-img"><img src="' + s.img + '" alt="' + s.cat + '" loading="lazy" /></div><div class="svc-cat-card-body"><h3>' + s.cat + '</h3><p class="svc-cat-sub">' + s.sub + '</p><div class="svc-cat-items">' + buildItemHTML(s.items) + '</div></div></div>';
    });

    /* Cycling + Hyrox */
    cards += '<div class="svc-cat-card has-img"><div class="svc-cat-img"><img src="' + hyroxData.img + '" alt="' + hyroxData.cat + '" loading="lazy" /></div><div class="svc-cat-card-body"><h3>' + hyroxData.cat + '</h3><p class="svc-cat-sub">' + hyroxData.sub + '</p><div class="svc-cat-items">' + buildItemHTML(hyroxData.items) + '</div></div></div>';

    /* Corporate */
    cards += '<div class="svc-cat-card svc-corp-card"><h3>Corporate Events</h3><p class="svc-cat-sub">Wellness & team engagement</p><div class="svc-corp-grid">';
    corpData.forEach(function(c) { cards += '<span>' + c + '</span>'; });
    cards += '</div></div>';

    return '<div class="svc-cat-overlay" id="svcCatOverlay"><div class="svc-cat-modal"><button class="svc-cat-close" id="svcCatClose">&times;</button><div class="svc-cat-header"><h2>Our Services &amp; Programs</h2><p>From personal training to group wellness � find what fits your goal</p></div><div class="svc-cat-grid">' + cards + '</div></div></div>';
  }

  function wireSvcOverlay() {
    var overlay = document.getElementById("svcCatOverlay");
    var closeBtn = document.getElementById("svcCatClose");
    if (!overlay) return;
    closeBtn.addEventListener("click", function() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    });
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
    document.addEventListener("keydown", function svcEsc(e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
  }

  /* Pre-inject overlay for instant open, trigger injected later */
  document.body.insertAdjacentHTML("beforeend", buildSvcOverlayHTML());
  wireSvcOverlay();
  // Floating services button removed to keep the footer area uncluttered.

  /* Render services page catalog */
  function renderSvcPageGrid() {
    var svcGrid = document.getElementById("svcPageGrid");
    if (!svcGrid || svcGrid.hasAttribute("data-rendered")) return;
    svcGrid.setAttribute("data-rendered", "1");
    var html = "";
    svcData.forEach(function(s) {
      html += '<div class="svc-page-card has-img"><div class="svc-page-img"><img src="' + s.img + '" alt="' + s.cat + '" loading="lazy" /></div><div class="svc-page-card-body"><h3>' + s.cat + '</h3><p class="svc-page-sub">' + s.sub + '</p><div class="svc-page-items">';
      s.items.forEach(function(i) { html += '<div class="svc-page-item"><strong>' + i.name + '</strong><p>' + i.desc + '</p></div>'; });
      html += '</div></div></div>';
    });
    html += '<div class="svc-page-card svc-corp-page"><h3>Corporate Events</h3><p class="svc-page-sub" style="font-size:0.72rem;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px">Wellness & team engagement</p><div class="svc-corp-grid">';
    corpData.forEach(function(c) { html += '<span>' + c + '</span>'; });
    html += '</div></div>';
    svcGrid.innerHTML = html;
  }
  renderSvcPageGrid();

  /* Re-render after boot in case boot replaced content */
  var bootCheck = setInterval(function() {
    if (document.querySelector(".site-footer")) {
      clearInterval(bootCheck);
      renderSvcPageGrid();
    }
  }, 200);
  setTimeout(function() { clearInterval(bootCheck); }, 5000);
})();

/* -- Site Popup on every page -- */
(function() {
  if (document.getElementById("sitePopup")) return; /* already in HTML */
  var popupHTML =
    '<div class="site-popup" id="sitePopup">' +
      '<div class="site-popup-overlay" onclick="closePopup()"></div>' +
      '<div class="site-popup-card">' +
        '<button class="site-popup-close" onclick="closePopup()">&times;</button>' +
        '<div class="site-popup-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
        '</div>' +
        '<h3>Your Transformation Starts Here</h3>' +
        '<p>Get a dedicated coach, personalized nutrition, and doorstep training — all backed by 13 years of science and results.</p>' +
        '<div class="site-popup-features">' +
          '<span>1-on-1 Coaching</span>' +
          '<span>Custom Meal Plans</span>' +
          '<span>Doorstep Training</span>' +
        '</div>' +
        '<a class="site-popup-cta" href="contact.html">Book Your Free Consultation</a>' +
        '<button class="site-popup-later" onclick="closePopup()">Maybe later</button>' +
      '</div>' +
    '</div>';
  document.body.insertAdjacentHTML("beforeend", popupHTML);
  var popupDismissed = false;
  function closePopup() {
    popupDismissed = true;
    var el = document.getElementById("sitePopup");
    if (!el) return;
    el.classList.remove("open");
    document.body.style.overflow = "";
  }
  setTimeout(function() {
    if (popupDismissed) return;
    var el = document.getElementById("sitePopup");
    if (!el) return;
    el.classList.add("open");
    document.body.style.overflow = "hidden";
  }, 300000);
  document.getElementById("sitePopup").addEventListener("click", function(e) {
    if (e.target === this) closePopup();
  });
  document.addEventListener("keydown", function psEsc(e) {
    if (e.key === "Escape") closePopup();
  });
  /* expose closePopup globally for onclick handlers */
  window.closePopup = closePopup;
})();

/* -- Ecosystem Level Filter -- */
document.addEventListener("DOMContentLoaded", function() {
  var filterBtns = document.querySelectorAll(".eco-filter-btn");
  var cards = document.querySelectorAll(".ecosystem-card[data-level]");
  if (!filterBtns.length || !cards.length) return;
  filterBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      filterBtns.forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var level = btn.getAttribute("data-level");
      cards.forEach(function(card) {
        if (level === "all") {
          card.classList.remove("hidden-level");
        } else {
          var levels = card.getAttribute("data-level") || "";
          card.classList.toggle("hidden-level", levels.indexOf(level) === -1);
        }
      });
    });
  });
});

/* Corporate event inquiry form */
(function() {
  var frm = document.getElementById("corpEventForm");
  if (!frm) return;
  frm.addEventListener("submit", function(e) {
    e.preventDefault();
    var status = document.getElementById("corpFormStatus");
    var payload = Object.fromEntries(new FormData(frm).entries());
    payload.form_type = "corporate_event";
    status.textContent = "Sending\u2026";
    status.style.color = "rgba(255,255,255,0.6)";
    var apiBase = "";
    var fetchOpts = { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } };
    fetch(apiBase || "/api/submit", fetchOpts)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.ok || d.success) {
          status.textContent = "\u2705 Thank you! Our events team will contact you within 24 hours.";
          status.style.color = "#4ade80";
          frm.reset();
        } else {
          throw new Error(d.error || "Submit failed");
        }
      })
      .catch(function() {
        status.textContent = "\u26a0\ufe0f Something went wrong. Please try again.";
        status.style.color = "#dc3545";
      });
  });
})();

/* Consult modal removed — using standalone book-consultation.html page */

boot().catch((error) => {
  console.error("boot() failed:", error);
  if (!document.body.querySelector(".site-header")) {
    document.body.innerHTML = `<main class="section-shell"><h1>Could not load.</h1><p>${safe(error.message)}</p></main>`;
  }
});
