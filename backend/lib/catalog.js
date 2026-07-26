"use strict";

const store = require("./store");

const CONTACT = {
  phone: "+91 72071 13310",
  whatsapp: "+91 72071 13310",
  email: "contact@fitnessgurukul.co.in",
  address: "Manikonda, Hyderabad, Telangana, India",
};

const SERVICE_AREAS = [
  "Manikonda",
  "Gachibowli",
  "Kondapur",
  "Madhapur",
  "Jubilee Hills",
  "Banjara Hills",
  "Tolichowki",
  "Financial District",
];

const PLANS = [
  { name: "Fitness Gurukul Elite", category: "elite", price: "₹4,999/mo", sessions: "Virtual coaching", summary: "App-led coaching with weekly check-ins.", points: ["Virtual PT", "Nutrition guide", "Chat support"], tag: "Virtual" },
  { name: "Fitness Gurukul Core", category: "core", price: "₹9,999/mo", sessions: "1x / week in-person", summary: "Starter personalized plan for busy professionals.", points: ["1 PT session/week", "Form coaching", "Habit tracking"], tag: "Starter" },
  { name: "Fitness Gurukul Prime", category: "prime", price: "₹14,999/mo", sessions: "3x / week in-person", summary: "Hands-on fat-loss and recomposition coaching.", points: ["3 PT sessions/week", "Nutrition coaching", "Weekly reviews"], tag: "Popular" },
  { name: "Fitness Gurukul Signature", category: "signature", price: "₹19,999/mo", sessions: "5x / week in-person", summary: "Intensive transformation with daily accountability.", points: ["5 PT sessions/week", "Posture assessment", "App check-ins"], tag: "Intensive" },
  { name: "Fitness Gurukul Endurance", category: "endurance", price: "Custom", sessions: "Run-focused plan", summary: "Periodized running with strength support.", points: ["Run programming", "Strength support", "Race prep"], tag: "Running" },
  { name: "Fitness Gurukul Forge", category: "forge", price: "Custom", sessions: "Functional racing", summary: "Hyrox / OCR style engine and station skills.", points: ["Compromised running", "Station skills", "Grip & engine"], tag: "Functional" },
];

const SERVICES = [
  { name: "Personal Training", category: "training", price: "From Core plan", summary: "1:1 coaching at studio or doorstep.", points: ["Custom programming", "Form focus"], tag: "PT" },
  { name: "Personalised Doorstep Service", category: "training", price: "On request", summary: "Coach comes to your home or society.", points: ["Home sessions", "Flexible timing"], tag: "Doorstep" },
  { name: "Yogic Wellness", category: "recovery", price: "On request", summary: "Yoga, breathwork, and stress reset.", points: ["Breathwork", "Mobility"], tag: "Yoga" },
  { name: "Weight Loss & Diet Plan", category: "nutrition", price: "With Prime+", summary: "Indian nutrition coaching for fat loss.", points: ["Meal structure", "Accountability"], tag: "Nutrition" },
  { name: "Kids Programs", category: "kids", price: "On request", summary: "Age-appropriate athletics and confidence.", points: ["Fun fitness", "Sports skills"], tag: "Kids" },
  { name: "Corporate Services", category: "event", price: "Custom", summary: "Workplace wellness and team events.", points: ["Workshops", "Challenges"], tag: "Corporate" },
];

const COACHES = [
  { name: "Aditya Gururani", role: "Yoga Instructor & Breathing Specialist", slug: "aditya-gururani", category: "yoga", focus: ["Breathwork", "Stress management", "Functional mobility"], bio: "Breathwork and mobility specialist." },
  { name: "Ravi Pal", role: "Fitness Trainer & Injury Rehabilitation Coach", slug: "ravi-pal", category: "rehab", focus: ["Injury rehabilitation", "Recovery", "Strength"], bio: "Rehab-focused fitness coach." },
  { name: "B Yashwanth", role: "Basketball Coach", slug: "b-yashwanth", category: "sports", focus: ["Basketball", "Conditioning"], bio: "Sports performance coach." },
  { name: "Anand Yadav", role: "Children's Athletics Coach", slug: "anand-yadav", category: "kids", focus: ["Kids fitness", "Athletics"], bio: "Kids athletics coach." },
  { name: "Shivajeet Kanaujiya", role: "Fitness Trainer", slug: "shivajeet-kanaujiya", category: "fitness", focus: ["Strength", "Fat loss"], bio: "Strength and body recomposition coach." },
  { name: "Deepesh Kumar", role: "Fitness Trainer", slug: "deepesh-kumar", category: "fitness", focus: ["Weight loss", "Strength"], bio: "Weight-loss focused trainer." },
];

const GOAL_MATCHES = {
  "weight-loss": { goal: "weight-loss", title: "Fat Loss & Body Recomposition", summary: "Strength + Indian nutrition for sustainable fat loss.", plan: "Fitness Gurukul Prime", planCategory: "prime", coachCategories: ["fitness", "yoga"], cta: "book-consultation.html", challengeId: "fat-burn-30" },
  strength: { goal: "strength", title: "Strength & Muscle Building", summary: "Progressive personal training with form coaching.", plan: "Fitness Gurukul Signature", planCategory: "signature", coachCategories: ["fitness"], cta: "book-consultation.html", challengeId: "strength-30" },
  yoga: { goal: "yoga", title: "Yoga, Breathwork & Stress Relief", summary: "Mobility and nervous-system reset.", plan: "Yogic Wellness", planCategory: "recovery", coachCategories: ["yoga"], cta: "coaches.html", challengeId: "mobility-21" },
  running: { goal: "running", title: "Running & Endurance", summary: "Periodized run plans with strength support.", plan: "Fitness Gurukul Endurance", planCategory: "endurance", coachCategories: ["fitness", "sports"], cta: "services.html", challengeId: "run-start-28" },
  kids: { goal: "kids", title: "Kids Athletics & Confidence", summary: "Age-appropriate movement for children.", plan: "Kids Programs", planCategory: "training", coachCategories: ["kids", "special"], cta: "coaches.html", challengeId: "strength-30" },
  rehab: { goal: "rehab", title: "Injury Rehab & Return to Train", summary: "Guided recovery programming.", plan: "Personal Training", planCategory: "training", coachCategories: ["rehab", "fitness"], cta: "book-consultation.html", challengeId: "mobility-21" },
};

const CHALLENGES = [
  { id: "fat-burn-30", name: "30-Day Fat Burn Challenge", tag: "Fat loss", days: 30, level: "All levels", sessionsPerWeek: 4, focus: ["HIIT finishers", "Strength circuits", "Nutrition check-ins"], outcome: "Drop stubborn fat while keeping energy.", planCategory: "prime", goal: "weight-loss", milestones: ["Week 1 foundations", "Week 2 intensity", "Week 3 consistency", "Week 4 finish"], image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=1400&q=80&auto=format&fit=crop" },
  { id: "strength-30", name: "30-Day Strength Challenge", tag: "Strength", days: 30, level: "Beginner to intermediate", sessionsPerWeek: 3, focus: ["Compound lifts", "Progressive overload"], outcome: "Build measurable strength safely.", planCategory: "signature", goal: "strength", milestones: ["Form week", "Load week", "Volume week", "PR week"], image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80&auto=format&fit=crop" },
  { id: "mobility-21", name: "21-Day Mobility Reset", tag: "Yoga & recovery", days: 21, level: "All levels", sessionsPerWeek: 5, focus: ["Breathwork", "Hip & spine mobility"], outcome: "Move freer and reduce stiffness.", planCategory: "recovery", goal: "yoga", milestones: ["Breath reset", "Hip openers", "Spine flow"], image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80&auto=format&fit=crop" },
  { id: "run-start-28", name: "28-Day Run Starter", tag: "Endurance", days: 28, level: "Beginner", sessionsPerWeek: 3, focus: ["Walk-run intervals", "Aerobic base"], outcome: "Build toward consistent 5K pacing.", planCategory: "endurance", goal: "running", milestones: ["Walk-run", "Steady aerobic", "Longer continuous", "5K ready"], image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1400&q=80&auto=format&fit=crop" },
  { id: "hyrox-21", name: "21-Day Hyrox Spark", tag: "Functional", days: 21, level: "Intermediate", sessionsPerWeek: 4, focus: ["Compromised running", "Station skills", "Grip & engine"], outcome: "Build race-style engine without burning out.", planCategory: "forge", goal: "strength", milestones: ["Engine base", "Station skills", "Race simulation"], image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&q=80&auto=format&fit=crop" },
];

const CHAT_SUGGESTIONS = [
  "Which plan fits fat loss?",
  "Do you offer doorstep training?",
  "Help me pick a coach",
  "How do I book a consultation?",
];

const PULSE_LINES = [
  "A Hyderabad member just booked a free consultation",
  "Coach match completed for yoga & mobility",
  "Macro calculator used for Indian meal planning",
  "Doorstep training inquiry from Gachibowli",
  "Running plan comparison opened on Services",
  "Someone just joined the 30-Day Fat Burn Challenge",
  "Plan quiz completed — Signature coaching recommended",
];

const GOAL_ALIASES = {
  "fat-loss": "weight-loss",
  "lose-weight": "weight-loss",
  recomp: "weight-loss",
  muscle: "strength",
  "build-muscle": "strength",
  flexibility: "yoga",
  stress: "yoga",
  mobility: "yoga",
  endurance: "running",
  run: "running",
  "5k": "running",
  hyrox: "strength",
  injury: "rehab",
  recovery: "rehab",
};

function findChallenge(challengeId) {
  return CHALLENGES.find((c) => c.id === String(challengeId || "")) || null;
}

function findPlan(categoryOrName) {
  return (
    PLANS.find((p) => p.category === categoryOrName) ||
    PLANS.find((p) => p.name === categoryOrName) ||
    SERVICES.find((s) => s.name === categoryOrName) ||
    null
  );
}

function contentPayload() {
  return {
    ok: true,
    contact: CONTACT,
    serviceAreas: SERVICE_AREAS,
    plans: PLANS,
    services: SERVICES,
    coaches: COACHES,
    goals: Object.values(GOAL_MATCHES),
    challenges: CHALLENGES,
  };
}

function challengesPayload() {
  const joins = store.counts().challengeJoins;
  const seeded = 48 + (Math.floor(Date.now() / 3600000) % 7);
  return {
    ok: true,
    challenges: CHALLENGES.map((item, idx) => ({ ...item, joined: seeded + joins + idx * 3 })),
    totalJoined: seeded + joins,
    activeChallenges: CHALLENGES.length,
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

/** Flat live stats — matches frontend applyLiveStats / challenge page. */
function livePayload() {
  const c = store.counts();
  const idx = Math.floor(Date.now() / 45000) % PULSE_LINES.length;
  return {
    ok: true,
    clientsTransformed: 1000 + c.submissions,
    years: 13,
    events: 50,
    coaches: COACHES.length,
    specialties: 7,
    inquiriesToday: c.today,
    toolUses: c.calculations,
    chatSessions: c.chats,
    challengeJoins: 48 + c.challengeJoins,
    activeNow: 3 + (Math.floor(Date.now() / 30000) % 9),
    pulse: PULSE_LINES[idx],
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

function normalizeGoal(raw) {
  const goal = String(raw || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return GOAL_ALIASES[goal] || goal;
}

function matchGoal(payload) {
  const goal = normalizeGoal(payload.goal || payload.focus || "weight-loss");
  const experience = String(payload.experience || "beginner").toLowerCase().slice(0, 40);
  const preference = String(payload.preference || "in-person").toLowerCase().slice(0, 40);
  const match = GOAL_MATCHES[goal] || GOAL_MATCHES["weight-loss"];
  const coaches = COACHES.filter((c) => match.coachCategories.includes(c.category)).slice(0, 3);
  let plan = findPlan(match.planCategory) || findPlan(match.plan) || PLANS[2];
  const challenge = findChallenge(match.challengeId) || CHALLENGES[0];
  const tip = {
    beginner: "Start with a free consultation and a gentle 2-week ramp-up.",
    intermediate: "Expect progressive overload with weekly check-ins.",
    advanced: "We will bias intensity, recovery, and race or physique peaking.",
  }[experience] || "Start with a free consultation.";
  const mode =
    ["in-person", "doorstep", "home", "studio"].includes(preference)
      ? "Doorstep or studio sessions available in Hyderabad."
      : "Virtual coaching with app check-ins works great for your schedule.";
  return {
    ok: true,
    match,
    plan,
    challenge,
    coaches,
    tip,
    mode,
    score: GOAL_MATCHES[goal] ? 92 : 78,
    challengeId: match.challengeId,
  };
}

function quizRecommend(payload) {
  const goal = normalizeGoal(payload.goal || "");
  const experience = String(payload.experience || payload.level || "beginner").toLowerCase().slice(0, 40);
  const preference = String(payload.preference || payload.location || "in-person").toLowerCase().slice(0, 40);
  const timeBudget = String(payload.time || payload.days || "30").toLowerCase().slice(0, 40);

  const base = matchGoal({ goal, experience, preference });
  let challenge = base.challenge || CHALLENGES[0];
  let plan = base.plan;

  if (["busy", "15", "21", "short"].includes(timeBudget)) {
    const short = CHALLENGES.find((c) => (c.days || 30) <= 21 && c.goal === challenge.goal);
    if (short) {
      challenge = short;
      plan = findPlan(short.planCategory) || plan;
    }
  } else if (["race", "hyrox", "functional"].includes(timeBudget) || goal === "hyrox") {
    const hyrox = findChallenge("hyrox-21");
    if (hyrox) {
      challenge = hyrox;
      plan = findPlan("forge") || plan;
    }
  }

  const reasons = [
    `Goal focus: ${(base.match && base.match.title) || goal || "general"}`,
    `Training mode: ${["in-person", "doorstep", "home", "studio"].includes(preference) ? "in-person / doorstep" : "virtual"}`,
    `Challenge length: ${challenge.days} days · ${challenge.sessionsPerWeek} sessions/week`,
  ];

  return {
    ok: true,
    score: base.score || 90,
    match: base.match,
    plan,
    challenge,
    coaches: base.coaches || [],
    tip: base.tip,
    mode: base.mode,
    reasons,
    nextStep: "book-consultation.html",
  };
}

module.exports = {
  CONTACT,
  SERVICE_AREAS,
  PLANS,
  SERVICES,
  COACHES,
  GOAL_MATCHES,
  CHALLENGES,
  CHAT_SUGGESTIONS,
  contentPayload,
  challengesPayload,
  livePayload,
  matchGoal,
  quizRecommend,
  findChallenge,
};
