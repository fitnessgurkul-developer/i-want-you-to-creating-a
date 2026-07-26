"use strict";

const https = require("https");
const config = require("./config");
const { CONTACT, PLANS, SERVICES, COACHES, CHAT_SUGGESTIONS, SERVICE_AREAS } = require("./catalog");

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function containsAny(text, words) {
  return words.some((w) => text.includes(w));
}

function localReply(message) {
  const text = normalize(message).toLowerCase();
  if (!text) {
    return "Ask me about training plans, coaches, pricing, events, or how to book a free consultation.";
  }
  if (["hi", "hello", "hey", "namaste"].some((g) => text === g || text.startsWith(`${g} `))) {
    return "Hi! I am the Fitness Gurukul assistant. I can help with programs, coach matching, pricing, events, and booking a free consultation in Hyderabad.";
  }
  if (containsAny(text, ["contact", "phone", "whatsapp", "email", "address", "location"])) {
    return `You can reach us at ${CONTACT.phone} or WhatsApp ${CONTACT.whatsapp}. Email: ${CONTACT.email}. Studio: ${CONTACT.address}.`;
  }
  if (containsAny(text, ["price", "cost", "plan", "package", "pricing"])) {
    const top = PLANS.slice(0, 3)
      .map((p) => `${p.name} (${p.price}, ${p.sessions})`)
      .join("; ");
    return `Popular plans: ${top}. Share your goal and schedule for a tighter recommendation, or book a free consultation.`;
  }
  if (containsAny(text, ["coach", "trainer"])) {
    const names = COACHES.map((c) => `${c.name} (${c.role})`).join("; ");
    return `Sample coaches: ${names}. Browse coaches.html or tell me your goal for a match.`;
  }
  if (containsAny(text, ["doorstep", "home"])) {
    return "Yes — Personalised Doorstep Service is available in many Hyderabad areas depending on schedule. Book a consultation to confirm your locality.";
  }
  if (containsAny(text, ["book", "consultation", "join", "start"])) {
    return "Book a free consultation on contact.html or book-consultation.html. Share your goal, schedule, and area and we will match you.";
  }
  if (containsAny(text, ["area", "hyderabad", "manikonda", "gachibowli"])) {
    return `We serve Hyderabad including ${SERVICE_AREAS.slice(0, 6).join(", ")}.`;
  }
  if (containsAny(text, ["service", "yoga", "swim", "corporate", "event"])) {
    return `Services include ${SERVICES.map((s) => s.name).slice(0, 5).join(", ")} and more.`;
  }
  return "I can help with Fitness Gurukul programs, coaches, pricing, events, and booking. Try asking about personal training, yoga, weight loss, or doorstep coaching.";
}

function openaiReply(message, history) {
  const apiKey = config.openaiKey();
  if (!apiKey) return Promise.resolve(null);

  const input = [];
  for (const item of (history || []).slice(-6)) {
    const role = String(item.role || "").trim();
    const content = normalize(item.content);
    if ((role === "user" || role === "assistant") && content) {
      input.push({ role, content });
    }
  }
  input.push({ role: "user", content: normalize(message) });

  const body = JSON.stringify({
    model: config.openaiModel(),
    instructions:
      "You are the Fitness Gurukul AI assistant for a premium Hyderabad fitness studio. Be helpful and concise. Never invent prices or medical claims. Invite users to book a free consultation when useful.",
    input,
    max_output_tokens: 450,
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/responses",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 25000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          try {
            const json = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            if (typeof json.output_text === "string" && json.output_text.trim()) {
              return resolve(normalize(json.output_text));
            }
            const parts = [];
            for (const item of json.output || []) {
              for (const content of item.content || []) {
                if (typeof content.text === "string") parts.push(content.text);
              }
            }
            resolve(normalize(parts.join(" ")) || null);
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
    req.write(body);
    req.end();
  });
}

async function generateReply(message, history) {
  const ai = await openaiReply(message, history);
  if (ai) return { reply: ai, source: "openai" };
  return { reply: localReply(message), source: "local" };
}

module.exports = { generateReply, CHAT_SUGGESTIONS, localReply };
