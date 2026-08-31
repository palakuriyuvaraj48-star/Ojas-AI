import { Language, ClientProfile, DailyLog } from "@/types/profile";
import { UnifiedFitnessState } from "@/types/fitness-state";

export interface MultilingualCoachResponse {
  language: Language;
  detectedIntent: "no_time" | "fatigue_soreness" | "hostel_mess_food" | "budget_protein" | "form_check" | "general_advice";
  reply: string;
  suggestedAction?: {
    label: string;
    href: string;
  };
  safetyDisclaimer?: string;
}

export function detectLanguage(text: string): Language {
  const t = text.toLowerCase();

  // Telugu markers (Telugu script or Romanized Telugu)
  if (
    /[\u0C00-\u0C7F]/.test(text) ||
    t.includes("ivala") ||
    t.includes("ledhu") ||
    t.includes("ledu") ||
    t.includes("cheyali") ||
    t.includes("em cheyali") ||
    t.includes("bhojanam") ||
    t.includes("gurinchi") ||
    t.includes("nerpinchu") ||
    t.includes("alagundi") ||
    t.includes("thindi")
  ) {
    return "te";
  }

  // Hindi markers (Devanagari or Romanized Hindi)
  if (
    /[\u0900-\u097F]/.test(text) ||
    t.includes("aaj") ||
    t.includes("kya karu") ||
    t.includes("thaka") ||
    t.includes("thak gaya") ||
    t.includes("samay nahi") ||
    t.includes("khana") ||
    t.includes("bhookh") ||
    t.includes("dard") ||
    t.includes("kare")
  ) {
    return "hi";
  }

  // Tamil markers
  if (/[\u0B80-\u0BFF]/.test(text) || t.includes("inniku") || t.includes("neram illa") || t.includes("enna panrathu")) {
    return "ta";
  }

  return "en";
}

export function generateMultilingualCoachReply(
  prompt: string,
  state?: UnifiedFitnessState
): MultilingualCoachResponse {
  const lang = detectLanguage(prompt);
  const p = prompt.toLowerCase();
  const userName = state?.profile?.name || "Friend";
  const recoveryScore = state?.recovery?.recoveryScore ?? 79;
  const proteinTarget = state?.nutrition?.proteinTarget ?? 125;
  const goal = state?.profile?.goal ?? "fat-loss";

  // INTENT 1: No time / busy / limited time (e.g. "ivala gym ki velladaniki time ledu", "aaj gym ka time nahi hai")
  if (
    p.includes("time ledu") ||
    p.includes("time ledhu") ||
    p.includes("samay nahi") ||
    p.includes("no time") ||
    p.includes("busy") ||
    p.includes("quick") ||
    p.includes("neram illa")
  ) {
    if (lang === "te") {
      return {
        language: "te",
        detectedIntent: "no_time",
        reply: `పర్వాలేదు ${userName}! జిమ్‌కి వెళ్లడానికి సమయం లేకపోతే బాధపడకండి. మన దగ్గర 20 నిమిషాలు ఉంటే చాలు. ఇంట్లోనే ఎటువంటి పరికరాలు లేకుండా చేయగలిగే హై-ఇంటెన్సిటీ బాడీవెయిట్ రొటీన్ (పుష్-అప్స్, స్క్వాట్స్, ప్లాంక్స్) సిద్ధం చేశాను. ఇది మీ కన్సిస్టెన్సీని ఏమాత్రం తగ్గనివ్వదు!`,
        suggestedAction: { label: "20m హోమ్ వర్కౌట్ ప్రారంభించండి", href: "/workout" },
      };
    }

    if (lang === "hi") {
      return {
        language: "hi",
        detectedIntent: "no_time",
        reply: `कोई बात नहीं ${userName}! अगर आज जिम जाने का समय नहीं है, तो भी वर्कआउट स्किप करने की जरूरत नहीं है। ओजस ने आपके लिए 20 मिनट का क्विक होम वर्कआउट तैयार किया है, जिसे आप बिना किसी इक्विपमेंट के पूरा कर सकते हैं।`,
        suggestedAction: { label: "20 मिनट होम वर्कआउट शुरू करें", href: "/workout" },
      };
    }

    return {
      language: "en",
      detectedIntent: "no_time",
      reply: `No problem at all! If you don't have time for the gym today, Ojas has compressed your session into an efficient 20-minute bodyweight routine. 3 sets of compound movements will stimulate muscle retention without derailing your schedule.`,
      suggestedAction: { label: "Start 20m Express Workout", href: "/workout" },
    };
  }

  // INTENT 2: Fatigue / Soreness / Tired (e.g. "chala alasi poyanu", "aaj bohot thakan hai")
  if (
    p.includes("alasi") ||
    p.includes("alasata") ||
    p.includes("thaka") ||
    p.includes("tired") ||
    p.includes("sore") ||
    p.includes("fatigue") ||
    p.includes("no energy")
  ) {
    if (lang === "te") {
      return {
        language: "te",
        detectedIntent: "fatigue_soreness",
        reply: `మీ శరీరం రికవరీ కోసం విశ్రాంతి అడుగుతోంది (ప్రస్తుత రికవరీ స్కోర్: ${recoveryScore}/100). ఈరోజు హెవీ వెయిట్స్ ఎత్తడం మానేసి, 15 నిమిషాల జాయింట్ మొబిలిటీ మరియు స్ట్రెచింగ్ చేయండి. మంచి రికవరీతో రేపు మరింత శక్తివంతంగా ట్రైన్ చేయవచ్చు!`,
        suggestedAction: { label: "రికవరీ ప్రోటోకాల్ చూడండి", href: "/recovery" },
      };
    }

    if (lang === "hi") {
      return {
        language: "hi",
        detectedIntent: "fatigue_soreness",
        reply: `आपका शरीर अभी थकान महसूस कर रहा है (रिकवरी स्कोर: ${recoveryScore}/100)। आज भारी वजन उठाने के बजाय 15 मिनट की स्ट्रेचिंग और मोबिलिटी फ्लो करें और रात को 8 घंटे की पूरी नींद लें।`,
        suggestedAction: { label: "रिकवरी रूटीन शुरू करें", href: "/recovery" },
      };
    }

    return {
      language: "en",
      detectedIntent: "fatigue_soreness",
      reply: `Your systemic fatigue is elevated (Recovery score: ${recoveryScore}/100). Pushing through extreme fatigue elevates cortisol and delays muscle repair. Ojas recommends 15 minutes of parasympathetic stretching and hydrating well today.`,
      suggestedAction: { label: "View Active Recovery Flow", href: "/recovery" },
    };
  }

  // INTENT 3: Hostel / Mess Food / Budget Protein (e.g. "mess lo em tinali", "hostel protein tips")
  if (
    p.includes("mess") ||
    p.includes("hostel") ||
    p.includes("protein") ||
    p.includes("budget") ||
    p.includes("food") ||
    p.includes("khana") ||
    p.includes("thindi")
  ) {
    if (lang === "te") {
      return {
        language: "te",
        detectedIntent: "hostel_mess_food",
        reply: `హాస్టల్ మెస్‌లో ప్రోటీన్ పెంచడానికి బెస్ట్ టిప్స్: 1) మెస్‌లో పప్పు (దాల్) లేదా ఎగ్ కర్రీ డబుల్ సర్వింగ్ తీసుకోండి. 2) రోజూ ₹15 తో 3 ఉడకబెట్టిన గుడ్లు లేదా 50 గ్రాముల సోయా చంక్స్ చేర్చుకోండి. ఇది మీ ప్రోటీన్ టార్గెట్ (${proteinTarget}g) సులభంగా పూర్తి చేస్తుంది!`,
        suggestedAction: { label: "హాస్టల్ మోడ్ ఓపెన్ చేయండి", href: "/food?tab=hostel" },
      };
    }

    if (lang === "hi") {
      return {
        language: "hi",
        detectedIntent: "hostel_mess_food",
        reply: `हॉस्टल मेस में प्रोटीन ऑप्टिमाइज़ करने के लिए: मेस में दाल और दही की डबल सर्विंग लें। साथ ही कमरे में ₹15 के सोया चंक्स या 3 उबले अंडे शामिल करें, जिससे कम बजट में आपका ${proteinTarget}g प्रोटीन पूरा हो सके।`,
        suggestedAction: { label: "हॉस्टल मोड खोलें", href: "/food?tab=hostel" },
      };
    }

    return {
      language: "en",
      detectedIntent: "budget_protein",
      reply: `To hit your daily target of ${proteinTarget}g protein on a budget: prioritize whole eggs (₹21 for 18g protein), soya chunks (₹15 for 26g protein), and double servings of thick dal or curd at your mess.`,
      suggestedAction: { label: "Open Budget Coach", href: "/food?tab=budget" },
    };
  }

  // Default response
  if (lang === "te") {
    return {
      language: "te",
      detectedIntent: "general_advice",
      reply: `నమస్కారం! ఓజస్ AI మీ ఫిట్‌నెస్ స్టేట్‌ని పరిశీలించింది. ఈరోజు మీ రికవరీ స్కోర్ ${recoveryScore}/100. మీ లక్ష్యం '${goal}' కి అనుగుణంగా ప్రణాళిక సిద్ధంగా ఉంది. మీకు ఏదైనా సందేహం ఉంటే అడగండి!`,
      suggestedAction: { label: "డైలీ డిసిషన్ చూడండి", href: "/dashboard" },
    };
  }

  if (lang === "hi") {
    return {
      language: "hi",
      detectedIntent: "general_advice",
      reply: `नमस्ते! ओजस AI ने आपके फिटनेस सिग्नल्स को समझ लिया है। आज आपकी रिकवरी ${recoveryScore}/100 पर है। आपके लक्ष्य '${goal}' के अनुसार आज का प्लान तैयार है।`,
      suggestedAction: { label: "आज का प्लान देखें", href: "/dashboard" },
    };
  }

  return {
    language: "en",
    detectedIntent: "general_advice",
    reply: `Hello ${userName}! Ojas AI is monitoring your metrics. With a recovery score of ${recoveryScore}/100 and goal of '${goal}', your daily decision is ready on your dashboard. Ask me anything about workouts, diet, or mess foods!`,
    suggestedAction: { label: "View Daily Decision", href: "/dashboard" },
  };
}
