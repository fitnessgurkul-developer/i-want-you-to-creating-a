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
  { id: "fat-burn-30", name: "30-Day Fat Burn Challenge", tag: "Fat loss", days: 30, level: "All levels", sessionsPerWeek: 4, focus: ["HIIT finishers", "Strength circuits", "Nutrition check-ins"], outcome: "Drop stubborn fat while keeping energy.", planCategory: "prime", goal: "weight-loss" },
  { id: "strength-30", name: "30-Day Strength Challenge", tag: "Strength", days: 30, level: "Beginner to intermediate", sessionsPerWeek: 3, focus: ["Compound lifts", "Progressive overload"], outcome: "Build measurable strength safely.", planCategory: "signature", goal: "strength" },
  { id: "mobility-21", name: "21-Day Mobility Reset", tag: "Yoga & recovery", days: 21, level: "All levels", sessionsPerWeek: 5, focus: ["Breathwork", "Hip & spine mobility"], outcome: "Move freer and reduce stiffness.", planCategory: "recovery", goal: "yoga" },
  { id: "run-start-28", name: "28-Day Run Starter", tag: "Endurance", days: 28, level: "Beginner", sessionsPerWeek: 3, focus: ["Walk-run intervals", "Aerobic base"], outcome: "Build toward consistent 5K pacing.", planCategory: "endurance", goal: "running" },
];

const CHAT_SUGGESTIONS = [
  "Which plan fits fat loss?",
  "Do you offer doorstep training?",
  "Help me pick a coach",
  "How do I book a consultation?",
];

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

function livePayload() {
  const c = store.counts();
  return {
    ok: true,
    pulse: {
      clientsTransformed: 1000 + c.submissions,
      eventsHosted: 50,
      expertCoaches: COACHES.length,
      inquiriesToday: c.today,
      challengeJoins: c.challengeJoins,
      calculatorUses: c.calculations,
      chatTurns: c.chats,
    },
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

function matchGoal(payload) {
  const goal = String(payload.goal || payload.focus || "strength").toLowerCase();
  const match = GOAL_MATCHES[goal] || GOAL_MATCHES.strength;
  const plan = PLANS.find((p) => p.category === match.planCategory) || PLANS[2];
  const coaches = COACHES.filter((c) => match.coachCategories.includes(c.category)).slice(0, 3);
  return { ok: true, match, plan, coaches, challengeId: match.challengeId };
}

function quizRecommend(payload) {
  const goal = String(payload.goal || "").toLowerCase();
  const experience = String(payload.experience || "").toLowerCase();
  const preference = String(payload.preference || "").toLowerCase();
  let category = "prime";
  if (goal.includes("run")) category = "endurance";
  else if (goal.includes("yoga") || goal.includes("stress")) category = "elite";
  else if (goal.includes("muscle") || goal.includes("strength")) category = "signature";
  else if (preference.includes("online") || preference.includes("virtual")) category = "elite";
  else if (experience.includes("beginner")) category = "core";
  const plan = PLANS.find((p) => p.category === category) || PLANS[2];
  return {
    ok: true,
    recommendation: plan,
    reason: `Based on your goal (${goal || "general"}), experience (${experience || "any"}), and preference (${preference || "flexible"}).`,
    next: "book-consultation.html",
  };
}

function findChallenge(challengeId) {
  return CHALLENGES.find((c) => c.id === String(challengeId || "")) || null;
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
