<?php
/**
 * Shared catalog + match/quiz/live helpers for Hostinger PHP API.
 * Shapes must match Node backend/lib/catalog.js and the frontend.
 */

function fg_catalog() {
  static $cache = null;
  if ($cache !== null) {
    return $cache;
  }

  $plans = [
    ["name" => "Fitness Gurukul Elite", "category" => "elite", "price" => "₹4,999/mo", "sessions" => "Virtual coaching", "summary" => "App-led coaching with weekly check-ins.", "points" => ["Virtual PT", "Nutrition guide", "Chat support"], "tag" => "Virtual"],
    ["name" => "Fitness Gurukul Core", "category" => "core", "price" => "₹9,999/mo", "sessions" => "1x / week in-person", "summary" => "Starter personalized plan for busy professionals.", "points" => ["1 PT session/week", "Form coaching", "Habit tracking"], "tag" => "Starter"],
    ["name" => "Fitness Gurukul Prime", "category" => "prime", "price" => "₹14,999/mo", "sessions" => "3x / week in-person", "summary" => "Hands-on fat-loss and recomposition coaching.", "points" => ["3 PT sessions/week", "Nutrition coaching", "Weekly reviews"], "tag" => "Popular"],
    ["name" => "Fitness Gurukul Signature", "category" => "signature", "price" => "₹19,999/mo", "sessions" => "5x / week in-person", "summary" => "Intensive transformation with daily accountability.", "points" => ["5 PT sessions/week", "Posture assessment", "App check-ins"], "tag" => "Intensive"],
    ["name" => "Fitness Gurukul Endurance", "category" => "endurance", "price" => "Custom", "sessions" => "Run-focused plan", "summary" => "Periodized running with strength support.", "points" => ["Run programming", "Strength support", "Race prep"], "tag" => "Running"],
    ["name" => "Fitness Gurukul Forge", "category" => "forge", "price" => "Custom", "sessions" => "Functional racing", "summary" => "Hyrox / OCR style engine and station skills.", "points" => ["Compromised running", "Station skills", "Grip & engine"], "tag" => "Functional"],
  ];

  $services = [
    ["name" => "Personal Training", "category" => "training", "price" => "From Core plan", "summary" => "1:1 coaching at studio or doorstep.", "tag" => "PT"],
    ["name" => "Yogic Wellness", "category" => "recovery", "price" => "On request", "summary" => "Yoga, breathwork, and stress reset.", "tag" => "Yoga"],
    ["name" => "Kids Programs", "category" => "kids", "price" => "On request", "summary" => "Age-appropriate athletics and confidence.", "tag" => "Kids"],
  ];

  $coaches = [
    ["name" => "Aditya Gururani", "role" => "Yoga Instructor & Breathing Specialist", "slug" => "aditya-gururani", "category" => "yoga", "focus" => ["Breathwork", "Stress management", "Functional mobility"], "bio" => "Breathwork and mobility specialist."],
    ["name" => "Ravi Pal", "role" => "Fitness Trainer & Injury Rehabilitation Coach", "slug" => "ravi-pal", "category" => "rehab", "focus" => ["Injury rehabilitation", "Recovery", "Strength"], "bio" => "Rehab-focused fitness coach."],
    ["name" => "B Yashwanth", "role" => "Basketball Coach", "slug" => "b-yashwanth", "category" => "sports", "focus" => ["Basketball", "Conditioning"], "bio" => "Sports performance coach."],
    ["name" => "Anand Yadav", "role" => "Children's Athletics Coach", "slug" => "anand-yadav", "category" => "kids", "focus" => ["Kids fitness", "Athletics"], "bio" => "Kids athletics coach."],
    ["name" => "Shivajeet Kanaujiya", "role" => "Fitness Trainer", "slug" => "shivajeet-kanaujiya", "category" => "fitness", "focus" => ["Strength", "Fat loss"], "bio" => "Strength and body recomposition coach."],
    ["name" => "Deepesh Kumar", "role" => "Fitness Trainer", "slug" => "deepesh-kumar", "category" => "fitness", "focus" => ["Weight loss", "Strength"], "bio" => "Weight-loss focused trainer."],
  ];

  $goals = [
    "weight-loss" => ["goal" => "weight-loss", "title" => "Fat Loss & Body Recomposition", "summary" => "Strength + Indian nutrition for sustainable fat loss.", "plan" => "Fitness Gurukul Prime", "planCategory" => "prime", "coachCategories" => ["fitness", "yoga"], "cta" => "book-consultation.html", "challengeId" => "fat-burn-30"],
    "strength" => ["goal" => "strength", "title" => "Strength & Muscle Building", "summary" => "Progressive personal training with form coaching.", "plan" => "Fitness Gurukul Signature", "planCategory" => "signature", "coachCategories" => ["fitness"], "cta" => "book-consultation.html", "challengeId" => "strength-30"],
    "yoga" => ["goal" => "yoga", "title" => "Yoga, Breathwork & Stress Relief", "summary" => "Mobility and nervous-system reset.", "plan" => "Yogic Wellness", "planCategory" => "recovery", "coachCategories" => ["yoga"], "cta" => "coaches.html", "challengeId" => "mobility-21"],
    "running" => ["goal" => "running", "title" => "Running & Endurance", "summary" => "Periodized run plans with strength support.", "plan" => "Fitness Gurukul Endurance", "planCategory" => "endurance", "coachCategories" => ["fitness", "sports"], "cta" => "services.html", "challengeId" => "run-start-28"],
    "kids" => ["goal" => "kids", "title" => "Kids Athletics & Confidence", "summary" => "Age-appropriate movement for children.", "plan" => "Kids Programs", "planCategory" => "training", "coachCategories" => ["kids"], "cta" => "coaches.html", "challengeId" => "strength-30"],
    "rehab" => ["goal" => "rehab", "title" => "Injury Rehab & Return to Train", "summary" => "Guided recovery programming.", "plan" => "Personal Training", "planCategory" => "training", "coachCategories" => ["rehab", "fitness"], "cta" => "book-consultation.html", "challengeId" => "mobility-21"],
  ];

  $challenges = [
    ["id" => "fat-burn-30", "name" => "30-Day Fat Burn Challenge", "tag" => "Fat loss", "days" => 30, "level" => "All levels", "sessionsPerWeek" => 4, "focus" => ["HIIT finishers", "Strength circuits", "Nutrition check-ins"], "outcome" => "Drop stubborn fat while keeping energy.", "planCategory" => "prime", "goal" => "weight-loss", "milestones" => ["Week 1 foundations", "Week 2 intensity", "Week 3 consistency", "Week 4 finish"], "image" => "https://images.unsplash.com/photo-1549476464-37392f717541?w=1400&q=80&auto=format&fit=crop"],
    ["id" => "strength-30", "name" => "30-Day Strength Challenge", "tag" => "Strength", "days" => 30, "level" => "Beginner to intermediate", "sessionsPerWeek" => 3, "focus" => ["Compound lifts", "Progressive overload"], "outcome" => "Build measurable strength safely.", "planCategory" => "signature", "goal" => "strength", "milestones" => ["Form week", "Load week", "Volume week", "PR week"], "image" => "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80&auto=format&fit=crop"],
    ["id" => "mobility-21", "name" => "21-Day Mobility Reset", "tag" => "Yoga & recovery", "days" => 21, "level" => "All levels", "sessionsPerWeek" => 5, "focus" => ["Breathwork", "Hip & spine mobility"], "outcome" => "Move freer and reduce stiffness.", "planCategory" => "recovery", "goal" => "yoga", "milestones" => ["Breath reset", "Hip openers", "Spine flow"], "image" => "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80&auto=format&fit=crop"],
    ["id" => "run-start-28", "name" => "28-Day Run Starter", "tag" => "Endurance", "days" => 28, "level" => "Beginner", "sessionsPerWeek" => 3, "focus" => ["Walk-run intervals", "Aerobic base"], "outcome" => "Build toward consistent 5K pacing.", "planCategory" => "endurance", "goal" => "running", "milestones" => ["Walk-run", "Steady aerobic", "Longer continuous", "5K ready"], "image" => "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1400&q=80&auto=format&fit=crop"],
    ["id" => "hyrox-21", "name" => "21-Day Hyrox Spark", "tag" => "Functional", "days" => 21, "level" => "Intermediate", "sessionsPerWeek" => 4, "focus" => ["Compromised running", "Station skills", "Grip & engine"], "outcome" => "Build race-style engine without burning out.", "planCategory" => "forge", "goal" => "strength", "milestones" => ["Engine base", "Station skills", "Race simulation"], "image" => "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&q=80&auto=format&fit=crop"],
  ];

  $cache = [
    "plans" => $plans,
    "services" => $services,
    "coaches" => $coaches,
    "goals" => $goals,
    "challenges" => $challenges,
  ];
  return $cache;
}

function fg_find_challenge($id) {
  foreach (fg_catalog()["challenges"] as $c) {
    if (($c["id"] ?? "") === (string) $id) {
      return $c;
    }
  }
  return null;
}

function fg_find_plan($categoryOrName) {
  $cat = fg_catalog();
  foreach ($cat["plans"] as $p) {
    if (($p["category"] ?? "") === $categoryOrName || ($p["name"] ?? "") === $categoryOrName) {
      return $p;
    }
  }
  foreach ($cat["services"] as $s) {
    if (($s["name"] ?? "") === $categoryOrName) {
      return $s;
    }
  }
  return $cat["plans"][2] ?? ($cat["plans"][0] ?? null);
}

function fg_normalize_goal($raw) {
  $goal = strtolower(str_replace(" ", "-", trim((string) $raw)));
  $aliases = [
    "fat-loss" => "weight-loss",
    "lose-weight" => "weight-loss",
    "recomp" => "weight-loss",
    "muscle" => "strength",
    "build-muscle" => "strength",
    "flexibility" => "yoga",
    "stress" => "yoga",
    "mobility" => "yoga",
    "endurance" => "running",
    "run" => "running",
    "5k" => "running",
    "hyrox" => "strength",
    "injury" => "rehab",
    "recovery" => "rehab",
  ];
  return $aliases[$goal] ?? $goal;
}

function fg_count_challenge_joins($storeFile) {
  $rows = fg_load_submissions($storeFile);
  $n = 0;
  foreach ($rows as $row) {
    if (($row["form_type"] ?? "") === "challenge-join") {
      $n++;
    }
  }
  return $n;
}

function fg_count_today($storeFile) {
  $cutoff = time() - 86400;
  $n = 0;
  foreach (fg_load_submissions($storeFile) as $row) {
    if ((int) ($row["created_at"] ?? 0) >= $cutoff) {
      $n++;
    }
  }
  return $n;
}

function fg_live_payload($storeFile) {
  $cat = fg_catalog();
  $joins = fg_count_challenge_joins($storeFile);
  $subs = count(fg_load_submissions($storeFile));
  $pulse = [
    "A Hyderabad member just booked a free consultation",
    "Coach match completed for yoga & mobility",
    "Macro calculator used for Indian meal planning",
    "Doorstep training inquiry from Gachibowli",
    "Running plan comparison opened on Services",
    "Someone just joined the 30-Day Fat Burn Challenge",
    "Plan quiz completed — Signature coaching recommended",
  ];
  $idx = (int) floor(time() / 45) % count($pulse);
  return [
    "ok" => true,
    "clientsTransformed" => 1000 + $subs,
    "years" => 13,
    "events" => 50,
    "coaches" => count($cat["coaches"]),
    "specialties" => 7,
    "inquiriesToday" => fg_count_today($storeFile),
    "toolUses" => 0,
    "chatSessions" => 0,
    "challengeJoins" => 48 + $joins,
    "activeNow" => 3 + ((int) floor(time() / 30) % 9),
    "pulse" => $pulse[$idx],
    "updatedAt" => time(),
  ];
}

function fg_challenges_payload($storeFile) {
  $joins = fg_count_challenge_joins($storeFile);
  $seeded = 48 + ((int) floor(time() / 3600) % 7);
  $list = [];
  foreach (fg_catalog()["challenges"] as $idx => $item) {
    $copy = $item;
    $copy["joined"] = $seeded + $joins + ($idx * 3);
    $list[] = $copy;
  }
  return [
    "ok" => true,
    "challenges" => $list,
    "totalJoined" => $seeded + $joins,
    "activeChallenges" => count($list),
    "updatedAt" => time(),
  ];
}

function fg_match_goal($payload) {
  $goal = fg_normalize_goal($payload["goal"] ?? ($payload["focus"] ?? "weight-loss"));
  $experience = strtolower(fg_clip($payload["experience"] ?? "beginner", 40));
  $preference = strtolower(fg_clip($payload["preference"] ?? "in-person", 40));
  $goals = fg_catalog()["goals"];
  $match = $goals[$goal] ?? $goals["weight-loss"];
  $coaches = [];
  foreach (fg_catalog()["coaches"] as $c) {
    if (in_array($c["category"] ?? "", $match["coachCategories"] ?? [], true)) {
      $coaches[] = $c;
      if (count($coaches) >= 3) {
        break;
      }
    }
  }
  $plan = fg_find_plan($match["planCategory"] ?? "") ?: fg_find_plan($match["plan"] ?? "");
  $challenge = fg_find_challenge($match["challengeId"] ?? "") ?: (fg_catalog()["challenges"][0] ?? null);
  $tips = [
    "beginner" => "Start with a free consultation and a gentle 2-week ramp-up.",
    "intermediate" => "Expect progressive overload with weekly check-ins.",
    "advanced" => "We will bias intensity, recovery, and race or physique peaking.",
  ];
  $tip = $tips[$experience] ?? "Start with a free consultation.";
  $mode = in_array($preference, ["in-person", "doorstep", "home", "studio"], true)
    ? "Doorstep or studio sessions available in Hyderabad."
    : "Virtual coaching with app check-ins works great for your schedule.";
  return [
    "ok" => true,
    "match" => $match,
    "plan" => $plan,
    "challenge" => $challenge,
    "coaches" => $coaches,
    "tip" => $tip,
    "mode" => $mode,
    "score" => isset($goals[$goal]) ? 92 : 78,
    "challengeId" => $match["challengeId"] ?? null,
  ];
}

function fg_quiz_recommend($payload) {
  $goal = fg_normalize_goal($payload["goal"] ?? "");
  $experience = strtolower(fg_clip($payload["experience"] ?? ($payload["level"] ?? "beginner"), 40));
  $preference = strtolower(fg_clip($payload["preference"] ?? ($payload["location"] ?? "in-person"), 40));
  $timeBudget = strtolower(fg_clip($payload["time"] ?? ($payload["days"] ?? "30"), 40));
  $base = fg_match_goal([
    "goal" => $goal,
    "experience" => $experience,
    "preference" => $preference,
  ]);
  $challenge = $base["challenge"] ?? (fg_catalog()["challenges"][0] ?? null);
  $plan = $base["plan"];

  if (in_array($timeBudget, ["busy", "15", "21", "short"], true) && $challenge) {
    foreach (fg_catalog()["challenges"] as $c) {
      if (($c["days"] ?? 30) <= 21 && ($c["goal"] ?? "") === ($challenge["goal"] ?? "")) {
        $challenge = $c;
        $plan = fg_find_plan($c["planCategory"] ?? "") ?: $plan;
        break;
      }
    }
  } elseif (in_array($timeBudget, ["race", "hyrox", "functional"], true) || $goal === "hyrox") {
    $hyrox = fg_find_challenge("hyrox-21");
    if ($hyrox) {
      $challenge = $hyrox;
      $plan = fg_find_plan("forge") ?: $plan;
    }
  }

  $reasons = [
    "Goal focus: " . (($base["match"]["title"] ?? null) ?: ($goal ?: "general")),
    "Training mode: " . (in_array($preference, ["in-person", "doorstep", "home", "studio"], true) ? "in-person / doorstep" : "virtual"),
    "Challenge length: " . ($challenge["days"] ?? "") . " days · " . ($challenge["sessionsPerWeek"] ?? "") . " sessions/week",
  ];

  return [
    "ok" => true,
    "score" => $base["score"] ?? 90,
    "match" => $base["match"] ?? null,
    "plan" => $plan,
    "challenge" => $challenge,
    "coaches" => $base["coaches"] ?? [],
    "tip" => $base["tip"] ?? "",
    "mode" => $base["mode"] ?? "",
    "reasons" => $reasons,
    "nextStep" => "book-consultation.html",
  ];
}
