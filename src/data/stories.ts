// Covers
import ratTortoiseCover from "@/assets/covers/rat-tortoise.jpg";
import thirstyCrowCover from "@/assets/covers/thirsty-crow.jpg";
import lionMouseCover from "@/assets/covers/lion-mouse.jpg";
import hareTortoiseCover from "@/assets/covers/hare-tortoise.jpg";
import foxCrowCover from "@/assets/covers/fox-crow.jpg";
import woodcutterCover from "@/assets/covers/woodcutter.jpg";
import twoFriendsCover from "@/assets/covers/two-friends-bear.jpg";
import goldenEggCover from "@/assets/covers/golden-egg.jpg";
import boyWolfCover from "@/assets/covers/boy-wolf.jpg";
import greedyDogCover from "@/assets/covers/greedy-dog.jpg";
import kindElephantCover from "@/assets/covers/kind-elephant.jpg";
import ke1 from "@/assets/stories/kind-elephant/slide1.png";
import ke2 from "@/assets/stories/kind-elephant/slide2.png";
import ke3 from "@/assets/stories/kind-elephant/slide3.png";
import ke4 from "@/assets/stories/kind-elephant/slide4.png";
import ke5 from "@/assets/stories/kind-elephant/slide5.png";
import foxGrapesCover from "@/assets/covers/fox-grapes.jpg";
import antGrasshopperCover from "@/assets/covers/ant-grasshopper.jpg";
import monkeyCrocodileCover from "@/assets/covers/monkey-crocodile.jpg";
import littleStarCover from "@/assets/covers/little-star.jpg";
import uglyDucklingCover from "@/assets/covers/ugly-duckling.jpg";
import magicPotCover from "@/assets/covers/magic-pot.jpg";
import sunWindCover from "@/assets/covers/sun-wind.jpg";
import rainbowCover from "@/assets/covers/rainbow.jpg";
import twoCatsMonkeyCover from "@/assets/covers/two-cats-monkey.jpg";
import teluguLettersCover from "@/assets/covers/telugu-letters.png";
import countingFriendsCover from "@/assets/covers/counting-friends.jpg";
import moonlightRhymesCover from "@/assets/covers/moonlight-rhymes.jpg";
import gorumuddahCover from "@/assets/covers/gorumuddha-cover.jpg";
import balabaluCover from "@/assets/covers/bala-balu-cover.jpg";
import raaraKrishnaCover from "@/assets/covers/raara-krishna-cover.jpg";
// import balabaluCover from "@/assets/covers/bala-balu-cover.jpg";
import mr1 from "@/assets/stories/moonlight-rhymes/slide1.png";
import mr2 from "@/assets/stories/moonlight-rhymes/slide2.png";
import mr3 from "@/assets/stories/moonlight-rhymes/slide3.png";
import mr4 from "@/assets/stories/moonlight-rhymes/slide4.png";
import placeholder from "@/assets/placeholder.png";
import rs1 from "@/assets/stories/rain-song/slide1.png";
import rs2 from "@/assets/stories/rain-song/slide2.png";
import rs3 from "@/assets/stories/rain-song/slide3.png";
import rs4 from "@/assets/stories/rain-song/slide4.png";
import rs5 from "@/assets/stories/rain-song/slide5.png";
import myFamilyCover from "@/assets/covers/my-family.jpg";
import colorsCover from "@/assets/covers/colors-around.jpg";
import myBodyCover from "@/assets/covers/my-body.jpg";
import rainSongCover from "@/assets/covers/rain-song.jpg";
import parrotSongCover from "@/assets/covers/parrot-song.jpg";
import morningCover from "@/assets/covers/morning-routine.jpg";
import marketCover from "@/assets/covers/market.jpg";

// Story scenes
import rt1 from "@/assets/stories/rat-tortoise/slide1.jpg";
import rt2 from "@/assets/stories/rat-tortoise/slide2.jpg";
import rt3 from "@/assets/stories/rat-tortoise/slide3.jpg";
import rt4 from "@/assets/stories/rat-tortoise/slide4.jpg";

import tc2 from "@/assets/stories/thirsty-crow/slide2.jpg";
import tc3 from "@/assets/stories/thirsty-crow/slide3.jpg";

import lm1 from "@/assets/stories/lion-mouse/slide1.jpg";
import lm2 from "@/assets/stories/lion-mouse/slide2.jpg";
import lm3 from "@/assets/stories/lion-mouse/slide3.jpg";
import lmBeg from "@/assets/stories/lion-mouse/slide-beg.jpg";
import lmFree from "@/assets/stories/lion-mouse/slide-free.jpg";
import lmChew from "@/assets/stories/lion-mouse/slide-chew.jpg";
import lmFriends from "@/assets/stories/lion-mouse/slide-friends.jpg";

import colRed from "@/assets/stories/colors/red-apple.jpg";
import colGreen from "@/assets/stories/colors/green-leaf.jpg";
import colBlue from "@/assets/stories/colors/blue-sky.jpg";
import colYellow from "@/assets/stories/colors/yellow-sun.jpg";
import colWhite from "@/assets/stories/colors/white-cloud.jpg";
import colBlack from "@/assets/stories/colors/black-night.jpg";

import ht1 from "@/assets/stories/hare-tortoise/slide1.jpg";
import ht2 from "@/assets/stories/hare-tortoise/slide2.jpg";
import ht3 from "@/assets/stories/hare-tortoise/slide3.jpg";

import fc1 from "@/assets/stories/fox-crow/slide1.jpg";
import fc2 from "@/assets/stories/fox-crow/slide2.jpg";
import fc3 from "@/assets/stories/fox-crow/slide3.jpg";

import wc1 from "@/assets/stories/woodcutter/slide1.jpg";
import wc2 from "@/assets/stories/woodcutter/slide2.jpg";
import wc3 from "@/assets/stories/woodcutter/slide3.jpg";

import tf1 from "@/assets/stories/two-friends/slide1.jpg";
import tf2 from "@/assets/stories/two-friends/slide2.jpg";
import tf3 from "@/assets/stories/two-friends/slide3.jpg";

import ge1 from "@/assets/stories/golden-egg/slide1.jpg";
import ge2 from "@/assets/stories/golden-egg/slide2.jpg";
import ge3 from "@/assets/stories/golden-egg/slide3.jpg";

import bw1 from "@/assets/stories/boy-wolf/slide1.jpg";
import bw2 from "@/assets/stories/boy-wolf/slide2.jpg";
import bw3 from "@/assets/stories/boy-wolf/slide3.jpg";

export type Category =
  | "Animal Stories"
  | "Moral Stories"
  | "Beginner Telugu"
  | "Letters"
  | "Numbers"
  | "Rhymes"
  | "Daily Telugu";

export type AgeBand = "3–5" | "3–6" | "4–6" | "5–7" | "6–8" | "All ages";

export interface StoryPage {
  image: string;
  telugu: string;
  english: string;
}

export interface Story {
  id: string;
  title: string;
  teluguTitle: string;
  cover: string;
  category: Category;
  age: AgeBand;
  minutes: number;
  tagline: string;
  pages: StoryPage[];
}

export const CATEGORIES: Category[] = [
  "Animal Stories",
  "Moral Stories",
  "Beginner Telugu",
  "Letters",
  "Numbers",
  "Rhymes",
  "Daily Telugu",
];

export const stories: Story[] = [
  // ─────────── ANIMAL STORIES ───────────
  {
    id: "rat-tortoise",
    title: "The Rat and the Tortoise",
    teluguTitle: "ఎలుక మరియు తాబేలు",
    cover: ratTortoiseCover,
    category: "Animal Stories",
    age: "5–7",
    minutes: 4,
    tagline: "A small friend can save the day.",
    pages: [
      { image: rt1, telugu: "ఎలుక, తాబేలు మంచి స్నేహితులు.", english: "The rat and the tortoise were good friends." },
      { image: rt2, telugu: "ప్రతిరోజూ వారు కలిసి పండ్లు పంచుకునేవారు.", english: "Every day they shared fruits together." },
      { image: rt3, telugu: "ఒకరోజు తాబేలు వేటగాడి వలలో చిక్కింది.", english: "One day the tortoise was caught in a hunter's net." },
      { image: rt4, telugu: "ఎలుక వలను కొరికి స్నేహితుడిని కాపాడింది.", english: "The rat chewed the net and saved its friend." },
    ],
  },
  {
    id: "thirsty-crow",
    title: "The Thirsty Crow",
    teluguTitle: "దాహమైన కాకి",
    cover: thirstyCrowCover,
    category: "Animal Stories",
    age: "3–5",
    minutes: 3,
    tagline: "Where there is a will, there is a way.",
    pages: [
      { image: thirstyCrowCover, telugu: "ఒక కాకికి చాలా దాహం వేసింది.", english: "A crow was very thirsty." },
      { image: tc2, telugu: "కుండలో నీళ్లు తక్కువగా ఉన్నాయి. కాకి రాళ్లు వేసింది.", english: "There was little water in the pot. The crow dropped pebbles in." },
      { image: tc3, telugu: "నీళ్లు పైకి వచ్చాయి. కాకి హాయిగా త్రాగింది.", english: "The water rose up. The crow drank happily." },
    ],
  },
  {
    id: "lion-mouse",
    title: "The Lion and the Mouse",
    teluguTitle: "సింహం మరియు ఎలుక",
    cover: lionMouseCover,
    category: "Animal Stories",
    age: "5–7",
    minutes: 5,
    tagline: "Kindness is never wasted.",
    pages: [
      { image: lm1, telugu: "ఒక సింహం చెట్టు కింద నిద్రపోతోంది.", english: "A lion was sleeping under a tree." },
      { image: lm2, telugu: "ఒక చిన్న ఎలుక సింహం మీద పరిగెత్తింది. సింహం ఎలుకను పట్టుకుంది.", english: "A little mouse ran over the lion. The lion caught the mouse." },
      { image: lmBeg, telugu: "ఎలుక బ్రతిమాలింది, 'నన్ను వదిలేయండి. ఏదో ఒక రోజు నేను మీకు సహాయం చేస్తాను.'", english: "The mouse begged, 'Let me go. One day I will help you.'" },
      { image: lmFree, telugu: "సింహం నవ్వి ఎలుకను వదిలేసింది.", english: "The lion laughed and set the mouse free." },
      { image: lm3, telugu: "ఒక రోజు సింహం వేటగాడి వలలో చిక్కుకుంది.", english: "One day the lion was caught in a hunter's net." },
      { image: lmChew, telugu: "ఎలుక వచ్చి తాళ్లను కొరికింది. సింహం బయటపడింది.", english: "The mouse came and chewed the ropes. The lion was free." },
      { image: lmFriends, telugu: "సింహం, ఎలుక నిజమైన స్నేహితులు అయ్యారు.", english: "The lion and the mouse became true friends." },
    ],
  },
  {
    id: "hare-tortoise",
    title: "The Hare and the Tortoise",
    teluguTitle: "కుందేలు మరియు తాబేలు",
    cover: hareTortoiseCover,
    category: "Animal Stories",
    age: "5–7",
    minutes: 4,
    tagline: "Slow and steady wins the race.",
    pages: [
      { image: ht1, telugu: "కుందేలు, తాబేలు పందెం వేశాయి.", english: "The hare and the tortoise made a race." },
      { image: ht2, telugu: "కుందేలు చాలా వేగంగా పరిగెత్తింది.", english: "The hare ran very fast." },
      { image: ht3, telugu: "కుందేలు చెట్టు కింద నిద్రపోయింది.", english: "The hare slept under a tree." },
    ],
  },
  {
    id: "fox-crow",
    title: "The Clever Fox and the Crow",
    teluguTitle: "తెలివైన నక్క మరియు కాకి",
    cover: foxCrowCover,
    category: "Animal Stories",
    age: "4–6",
    minutes: 3,
    tagline: "Beware of flattery.",
    pages: [
      { image: fc1, telugu: "కాకి నోటిలో ఒక చీజ్ పట్టుకుని కొమ్మపై కూర్చుంది.", english: "A crow sat on a branch with cheese in its beak." },
      { image: fc2, telugu: "నక్క కిందికి వచ్చి, 'మీ గొంతు ఎంత మధురం!' అని పొగిడింది.", english: "The fox came below and said, 'What a sweet voice you have!'" },
      { image: fc3, telugu: "కాకి సంతోషంగా పాడడానికి నోరు తెరిచింది — చీజ్ పడిపోయింది!", english: "The crow opened its beak to sing — the cheese fell down!" },
    ],
  },

  // ─────────── MORAL STORIES ───────────
  {
    id: "woodcutter",
    title: "The Honest Woodcutter",
    teluguTitle: "నిజాయితీ కల కట్టెలవాడు",
    cover: woodcutterCover,
    category: "Moral Stories",
    age: "6–8",
    minutes: 5,
    tagline: "Honesty is rewarded.",
    pages: [
      { image: wc1, telugu: "ఒక కట్టెలవాడు నది ఒడ్డున కట్టెలు కొడుతున్నాడు.", english: "A woodcutter was chopping wood by the river." },
      { image: wc2, telugu: "అతని గొడ్డలి జారి నదిలో పడిపోయింది.", english: "His axe slipped and fell into the river." },
      { image: wc3, telugu: "నది దేవత బంగారు గొడ్డలి చూపించింది, 'ఇది నీదా?'", english: "The river goddess showed a golden axe, 'Is this yours?'" },
      { image: "https://loremflickr.com/1200/800/river,gold?lock=401", telugu: "'కాదు' అని అతను నిజాయితీగా చెప్పాడు.", english: "'No,' he answered honestly." },
      { image: "https://loremflickr.com/1200/800/river,silver?lock=402", telugu: "చివరికి అతని పాత ఇనుప గొడ్డలి చూపించింది — 'అవును!'", english: "Finally she showed his iron axe — 'Yes, that is mine!'" },
      { image: "https://loremflickr.com/1200/800/reward,forest?lock=403", telugu: "దేవత అతని నిజాయితీకి మూడు గొడ్డళ్లనూ బహుమతిగా ఇచ్చింది.", english: "The goddess gave him all three axes for his honesty." },
    ],
  },
  {
    id: "two-friends",
    title: "Two Friends and the Bear",
    teluguTitle: "ఇద్దరు స్నేహితులు మరియు ఎలుగుబంటి",
    cover: twoFriendsCover,
    category: "Moral Stories",
    age: "5–7",
    minutes: 4,
    tagline: "A true friend never leaves you.",
    pages: [
      { image: tf1, telugu: "ఇద్దరు స్నేహితులు అడవి గుండా నడుస్తున్నారు.", english: "Two friends were walking through the forest." },
      { image: tf2, telugu: "ఉన్నట్టుండి ఒక పెద్ద ఎలుగుబంటి వచ్చింది.", english: "Suddenly a big bear appeared." },
      { image: tf3, telugu: "ఒక స్నేహితుడు చెట్టు ఎక్కాడు; మరొకడు చనిపోయినట్టు పడుకున్నాడు.", english: "One friend climbed a tree; the other lay still as if dead." },
      { image: "https://loremflickr.com/1200/800/friends,forest?lock=501", telugu: "'కష్టంలో వదిలి పారిపోయే వారు నిజమైన స్నేహితులు కాదు.'", english: "'Those who leave you in trouble are not true friends.'" },
    ],
  },
  {
    id: "golden-egg",
    title: "The Golden Egg",
    teluguTitle: "బంగారు గుడ్డు",
    cover: goldenEggCover,
    category: "Moral Stories",
    age: "5–7",
    minutes: 4,
    tagline: "Greed never wins.",
    pages: [
      { image: ge1, telugu: "ఒక రైతుకు మాయా బాతు ఉండేది.", english: "A farmer had a magical goose." },
      { image: ge2, telugu: "ప్రతిరోజూ అది ఒక బంగారు గుడ్డు పెట్టేది.", english: "Every day it laid one golden egg." },
      { image: ge3, telugu: "అత్యాశతో బాతును కోశాడు — లోపల ఏమీ లేదు. అన్నీ పోగొట్టుకున్నాడు.", english: "In greed he cut the goose — nothing inside. He lost everything." },
    ],
  },
  {
    id: "boy-wolf",
    title: "The Boy Who Cried Wolf",
    teluguTitle: "తోడేలు అని అరిచిన బాలుడు",
    cover: boyWolfCover,
    category: "Moral Stories",
    age: "5–7",
    minutes: 5,
    tagline: "Always tell the truth.",
    pages: [
      { image: bw1, telugu: "ఒక గొర్రెల కాపరి బాలుడు కొండపై గొర్రెలను మేపేవాడు.", english: "A shepherd boy watched sheep on a hill." },
      { image: bw2, telugu: "ఒకరోజు బోర్ కొట్టి, 'తోడేలు! తోడేలు!' అని అరిచాడు.", english: "One day, out of boredom, he shouted, 'Wolf! Wolf!'" },
      { image: bw3, telugu: "తోడేలు లేదు — గ్రామస్థులు తిరిగి వెళ్లారు. బాలుడు నవ్వాడు.", english: "No wolf — villagers went back. The boy laughed." },
      { image: "https://loremflickr.com/1200/800/wolf,field?lock=601", telugu: "ఒక రోజు నిజంగా తోడేలు వచ్చింది. బాలుడు అరిచాడు, కానీ ఎవరూ నమ్మలేదు.", english: "One day a real wolf came. The boy shouted, but nobody believed him." },
      { image: "https://loremflickr.com/1200/800/sheep,sad?lock=602", telugu: "తోడేలు గొర్రెలను తీసుకుపోయింది.", english: "The wolf took the sheep away." },
    ],
  },

  {
    id: "greedy-dog",
    title: "The Greedy Dog",
    teluguTitle: "అత్యాశ కుక్క",
    cover: greedyDogCover,
    category: "Moral Stories",
    age: "4–6",
    minutes: 3,
    tagline: "Greed makes you lose what you already have.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,dog,cute?lock=2001", telugu: "కుక్కకు ఎముక దొరికింది.", english: "A dog found a bone." },
      { image: "https://loremflickr.com/1200/800/cartoon,dog,walking?lock=2002", telugu: "అది సంతోషంగా నడిచింది.", english: "It walked away happily." },
      { image: "https://loremflickr.com/1200/800/cartoon,bridge,river?lock=2003", telugu: "వంతెన మీద నీడ కనిపించింది.", english: "It saw a shadow below." },
      { image: "https://loremflickr.com/1200/800/cartoon,dog,surprise?lock=2004", telugu: "అది మరో కుక్క అనుకుంది!", english: "It thought — another dog!" },
      { image: "https://loremflickr.com/1200/800/cartoon,dog,barking?lock=2005", telugu: "మొరిగింది — ఎముక పడింది!", english: "It barked — bone fell down!" },
      { image: "https://loremflickr.com/1200/800/cartoon,sad,dog?lock=2006", telugu: "అత్యాశ చెడు చేసింది.", english: "Greed caused the loss." },
    ],
  },

  // ─────────── ANIMAL STORIES (new) ───────────
  {
    id: "kind-elephant",
    title: "The Kind Elephant",
    teluguTitle: "మంచి ఏనుగు",
    cover: kindElephantCover,
    category: "Animal Stories",
    age: "3–5",
    minutes: 3,
    tagline: "Kindness makes everyone smile.",
    pages: [
      { image: ke1, telugu: "ఒక పెద్ద ఏనుగు ఉంది.", english: "There lived a big elephant." },
      { image: ke2, telugu: "అది అందరికీ సహాయం చేసింది.", english: "It helped everyone always." },
      { image: ke3, telugu: "చిన్న పక్షి పడిపోయింది.", english: "A little bird fell down." },
      { image: ke4, telugu: "ఏనుగు దాన్ని లేపింది.", english: "Elephant lifted it gently." },
      { image: ke5, telugu: "పక్షి పాట పాడింది!", english: "The bird sang with joy!" },
    ],
  },
  {
    id: "fox-grapes",
    title: "The Fox and the Grapes",
    teluguTitle: "నక్క మరియు పండ్లు",
    cover: foxGrapesCover,
    category: "Animal Stories",
    age: "4–6",
    minutes: 3,
    tagline: "Don't make excuses — try your best.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,fox,cute?lock=3101", telugu: "నక్కకు పండ్లు కనిపించాయి.", english: "Fox saw some grapes." },
      { image: "https://loremflickr.com/1200/800/cartoon,fox,jumping?lock=3102", telugu: "అది పైకి దుమికింది.", english: "It jumped up high." },
      { image: "https://loremflickr.com/1200/800/cartoon,fox,trying?lock=3103", telugu: "మళ్ళీ మళ్ళీ దుమికింది.", english: "It jumped again, again." },
      { image: "https://loremflickr.com/1200/800/cartoon,fox,sad?lock=3104", telugu: "పండ్లు అందలేదు.", english: "Could not reach the grapes." },
      { image: "https://loremflickr.com/1200/800/cartoon,fox,walking?lock=3105", telugu: '"పుల్లగా ఉంటాయి!" అంది.', english: '"They must be sour!" it said.' },
    ],
  },
  {
    id: "monkey-crocodile",
    title: "The Monkey and the Crocodile",
    teluguTitle: "కోతి మరియు మొసలి",
    cover: monkeyCrocodileCover,
    category: "Animal Stories",
    age: "5–7",
    minutes: 4,
    tagline: "Stay clever and stay safe.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,monkey,tree?lock=3201", telugu: "కోతి చెట్టుపై ఉంది.", english: "Monkey lived on a tree." },
      { image: "https://loremflickr.com/1200/800/cartoon,crocodile,river?lock=3202", telugu: "మొసలి స్నేహితుడయ్యాడు.", english: "Crocodile became its friend." },
      { image: "https://loremflickr.com/1200/800/cartoon,crocodile,sneaky?lock=3203", telugu: "మొసలి కోతిని తీసుకెళ్ళాలనుకుంది.", english: "Crocodile planned to trick it." },
      { image: "https://loremflickr.com/1200/800/cartoon,monkey,smart?lock=3204", telugu: '"నా గుండె చెట్టుపై ఉంది!"', english: '"My heart is on the tree!"' },
      { image: "https://loremflickr.com/1200/800/cartoon,monkey,running?lock=3205", telugu: "కోతి వేగంగా పారిపోయింది.", english: "Monkey quickly ran away." },
      { image: "https://loremflickr.com/1200/800/cartoon,monkey,safe,happy?lock=3206", telugu: "తెలివి ప్రాణం కాపాడింది.", english: "Wit saved its life." },
    ],
  },
  {
    id: "ugly-duckling",
    title: "The Ugly Duckling",
    teluguTitle: "వేరే బాతు పిల్ల",
    cover: uglyDucklingCover,
    category: "Animal Stories",
    age: "4–6",
    minutes: 4,
    tagline: "You are beautiful just as you are.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,egg,nest?lock=3301", telugu: "ఒక పెద్ద గుడ్డు పగిలింది.", english: "A big egg cracked open." },
      { image: "https://loremflickr.com/1200/800/cartoon,duckling,different?lock=3302", telugu: "పిల్ల వేరేగా కనిపించింది.", english: "The duckling looked different." },
      { image: "https://loremflickr.com/1200/800/cartoon,ducks,laughing?lock=3303", telugu: "అందరూ నవ్వారు.", english: "Everyone laughed at it." },
      { image: "https://loremflickr.com/1200/800/cartoon,duckling,sad?lock=3304", telugu: "అది చాలా విచారించింది.", english: "It felt very sad." },
      { image: "https://loremflickr.com/1200/800/cartoon,swan,beautiful?lock=3305", telugu: "పెద్దయ్యాక హంస అయింది!", english: "It grew into a swan!" },
      { image: "https://loremflickr.com/1200/800/cartoon,swan,happy?lock=3306", telugu: "అందరూ మెచ్చుకున్నారు!", english: "Everyone admired it!" },
    ],
  },
  {
    id: "two-cats-monkey",
    title: "Two Cats and a Monkey",
    teluguTitle: "రెండు పిల్లులు కోతి",
    cover: twoCatsMonkeyCover,
    category: "Animal Stories",
    age: "5–7",
    minutes: 3,
    tagline: "Fighting always helps someone else.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,two,cats?lock=3401", telugu: "రెండు పిల్లులు గొడవ పడ్డాయి.", english: "Two cats were fighting." },
      { image: "https://loremflickr.com/1200/800/cartoon,bread,food?lock=3402", telugu: "రొట్టె కోసం తగువు.", english: "They fought over bread." },
      { image: "https://loremflickr.com/1200/800/cartoon,monkey,judge?lock=3403", telugu: "కోతి న్యాయం చెప్పింది.", english: "Monkey said it would help." },
      { image: "https://loremflickr.com/1200/800/cartoon,monkey,eating?lock=3404", telugu: "కోతి రొట్టె తినేసింది!", english: "Monkey ate all the bread!" },
      { image: "https://loremflickr.com/1200/800/cartoon,cats,shocked?lock=3405", telugu: "గొడవ పడితే నష్టం.", english: "Fighting brings only loss." },
    ],
  },

  // ─────────── MORAL STORIES (new) ───────────
  {
    id: "ant-grasshopper",
    title: "The Ant and the Grasshopper",
    teluguTitle: "చీమ మరియు మిడత",
    cover: antGrasshopperCover,
    category: "Moral Stories",
    age: "5–7",
    minutes: 4,
    tagline: "Work today, rest tomorrow.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,ant,working?lock=3501", telugu: "చీమ రోజూ పని చేసింది.", english: "Ant worked every single day." },
      { image: "https://loremflickr.com/1200/800/cartoon,grasshopper,singing?lock=3502", telugu: "మిడత పాటలు పాడింది.", english: "Grasshopper sang and played." },
      { image: "https://loremflickr.com/1200/800/cartoon,snow,winter?lock=3503", telugu: "చలి కాలం వచ్చింది.", english: "Winter came at last." },
      { image: "https://loremflickr.com/1200/800/cartoon,grasshopper,hungry?lock=3504", telugu: "మిడతకు తిండి లేదు.", english: "Grasshopper had no food." },
      { image: "https://loremflickr.com/1200/800/cartoon,ant,food,stored?lock=3505", telugu: "చీమ దగ్గర తిండి ఉంది.", english: "Ant had food stored safe." },
      { image: "https://loremflickr.com/1200/800/cartoon,ant,lesson?lock=3506", telugu: "కష్టం ఫలితం ఇస్తుంది.", english: "Hard work always pays off." },
    ],
  },
  {
    id: "magic-pot",
    title: "The Magic Pot",
    teluguTitle: "మంత్ర కుండ",
    cover: magicPotCover,
    category: "Moral Stories",
    age: "5–7",
    minutes: 3,
    tagline: "Be careful with magic gifts.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,girl,pot?lock=3601", telugu: "అమ్మాయికి కుండ దొరికింది.", english: "A girl found a magic pot." },
      { image: "https://loremflickr.com/1200/800/cartoon,pot,cooking,magic?lock=3602", telugu: "కుండ వంట చేసింది!", english: "The pot cooked by itself!" },
      { image: "https://loremflickr.com/1200/800/cartoon,girl,food,happy?lock=3603", telugu: '"ఆగు కుండా!" అంటే ఆగింది.', english: '"Stop, pot!" — it stopped.' },
      { image: "https://loremflickr.com/1200/800/cartoon,pot,overflow,food?lock=3604", telugu: "ఒకరోజు మాట మర్చింది.", english: "One day she forgot the words." },
      { image: "https://loremflickr.com/1200/800/cartoon,village,food,everywhere?lock=3605", telugu: "ఊరంతా అన్నం నిండింది!", english: "Food flooded the whole village!" },
    ],
  },
  {
    id: "sun-wind",
    title: "The Sun and the Wind",
    teluguTitle: "సూర్యుడు మరియు గాలి",
    cover: sunWindCover,
    category: "Moral Stories",
    age: "4–6",
    minutes: 3,
    tagline: "Kindness is stronger than force.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,sun,wind?lock=3701", telugu: "సూర్యుడు, గాలి పోటీ పడ్డారు.", english: "Sun and wind had a contest." },
      { image: "https://loremflickr.com/1200/800/cartoon,traveller,coat?lock=3702", telugu: "కోటు తీయించాలి!", english: "Make him remove his coat!" },
      { image: "https://loremflickr.com/1200/800/cartoon,wind,blowing,strong?lock=3703", telugu: "గాలి గట్టిగా వీచింది.", english: "Wind blew very, very hard." },
      { image: "https://loremflickr.com/1200/800/cartoon,man,holding,coat?lock=3704", telugu: "మనిషి కోటు పట్టుకున్నాడు.", english: "The man held his coat tight." },
      { image: "https://loremflickr.com/1200/800/cartoon,sun,warm,shining?lock=3705", telugu: "సూర్యుడు వెచ్చగా నవ్వాడు.", english: "Sun smiled warm and bright." },
      { image: "https://loremflickr.com/1200/800/cartoon,man,coat,off?lock=3706", telugu: "మనిషి కోటు తీశాడు!", english: "The man took his coat off!" },
    ],
  },

  // ─────────── RHYMES (new) ───────────
  {
    id: "little-star",
    title: "Little Star",
    teluguTitle: "చిన్న నక్షత్రం",
    cover: littleStarCover,
    category: "Rhymes",
    age: "3–5",
    minutes: 2,
    tagline: "A soft bedtime rhyme.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,star,night,cute?lock=3801", telugu: "చిన్న నక్షత్రం మెరిసింది.", english: "Little star began to shine." },
      { image: "https://loremflickr.com/1200/800/cartoon,stars,sky,twinkle?lock=3802", telugu: "రాత్రి ఆకాశం వెలిగింది.", english: "Night sky lit up bright." },
      { image: "https://loremflickr.com/1200/800/cartoon,star,child,looking?lock=3803", telugu: "పిల్లలు పైకి చూశారు.", english: "Children looked up with wonder." },
      { image: "https://loremflickr.com/1200/800/cartoon,child,sleeping,moon?lock=3804", telugu: "నక్షత్రం పాట పాడింది.", english: "The star sang them a song." },
      { image: "https://loremflickr.com/1200/800/cartoon,child,sleeping,peaceful?lock=3805", telugu: "నిద్రపో చిన్నారీ!", english: "Sleep well, little one!" },
    ],
  },

  // ─────────── BEGINNER TELUGU (new) ───────────
  {
    id: "rainbow",
    title: "The Rainbow",
    teluguTitle: "రంగుల వంపు",
    cover: rainbowCover,
    category: "Beginner Telugu",
    age: "3–5",
    minutes: 2,
    tagline: "Colors of the sky.",
    pages: [
      { image: "https://loremflickr.com/1200/800/cartoon,rain,clouds?lock=3901", telugu: "వర్షం పడింది.", english: "The rain came down." },
      { image: "https://loremflickr.com/1200/800/cartoon,rainbow,sky?lock=3902", telugu: "ఆకాశంలో రంగులు వచ్చాయి.", english: "Colors filled the sky." },
      { image: "https://loremflickr.com/1200/800/cartoon,rainbow,colorful?lock=3903", telugu: "ఎరుపు, పచ్చ, నీలం.", english: "Red, green and blue." },
      { image: "https://loremflickr.com/1200/800/cartoon,children,rainbow,happy?lock=3904", telugu: "పిల్లలు సంతోషించారు!", english: "The children were so happy!" },
    ],
  },

  // ─────────── BEGINNER TELUGU ───────────
  {
    id: "my-family",
    title: "My Family in Telugu",
    teluguTitle: "నా కుటుంబం",
    cover: myFamilyCover,
    category: "Beginner Telugu",
    age: "3–5",
    minutes: 3,
    tagline: "Meet your family in Telugu.",
    pages: [
      { image: "https://loremflickr.com/1200/800/mother,indian?lock=701", telugu: "అమ్మ", english: "Amma — Mother" },
      { image: "https://loremflickr.com/1200/800/father,indian?lock=702", telugu: "నాన్న", english: "Naanna — Father" },
      { image: "https://loremflickr.com/1200/800/sister,children?lock=703", telugu: "అక్క", english: "Akka — Elder sister" },
      { image: "https://loremflickr.com/1200/800/brother,children?lock=704", telugu: "అన్న", english: "Anna — Elder brother" },
      { image: "https://loremflickr.com/1200/800/grandfather,family?lock=705", telugu: "తాత", english: "Thaatha — Grandfather" },
      { image: "https://loremflickr.com/1200/800/grandmother,family?lock=706", telugu: "నానమ్మ", english: "Naanamma — Grandmother" },
    ],
  },
  {
    id: "colors-around",
    title: "Colors Around Us",
    teluguTitle: "రంగులు",
    cover: colorsCover,
    category: "Beginner Telugu",
    age: "3–5",
    minutes: 3,
    tagline: "A world of color in Telugu.",
    pages: [
      { image: colRed, telugu: "ఎరుపు — యాపిల్", english: "Erupu — Red (apple)" },
      { image: colGreen, telugu: "పచ్చ — ఆకు", english: "Paccha — Green (leaf)" },
      { image: colBlue, telugu: "నీలం — ఆకాశం", english: "Neelam — Blue (sky)" },
      { image: colYellow, telugu: "పసుపు — సూర్యుడు", english: "Pasupu — Yellow (sun)" },
      { image: colWhite, telugu: "తెలుపు — మేఘం", english: "Telupu — White (cloud)" },
      { image: colBlack, telugu: "నలుపు — రాత్రి", english: "Nalupu — Black (night)" },
    ],
  },
  {
    id: "my-body",
    title: "My Body in Telugu",
    teluguTitle: "నా శరీరం",
    cover: myBodyCover,
    category: "Beginner Telugu",
    age: "3–5",
    minutes: 3,
    tagline: "Learn parts of the body.",
    pages: [
      { image: "https://loremflickr.com/1200/800/head,child?lock=801", telugu: "తల", english: "Thala — Head" },
      { image: "https://loremflickr.com/1200/800/eyes,child?lock=802", telugu: "కళ్ళు", english: "Kallu — Eyes" },
      { image: "https://loremflickr.com/1200/800/ears,child?lock=803", telugu: "చెవులు", english: "Chevulu — Ears" },
      { image: "https://loremflickr.com/1200/800/nose,child?lock=804", telugu: "ముక్కు", english: "Mukku — Nose" },
      { image: "https://loremflickr.com/1200/800/mouth,child?lock=805", telugu: "నోరు", english: "Noru — Mouth" },
      { image: "https://loremflickr.com/1200/800/hands,child?lock=806", telugu: "చేతులు", english: "Chethulu — Hands" },
      { image: "https://loremflickr.com/1200/800/legs,child?lock=807", telugu: "కాళ్ళు", english: "Kallu — Legs" },
    ],
  },

  // ─────────── LETTERS ───────────
  {
    id: "telugu-letters",
    title: "My First Telugu Letters",
    teluguTitle: "నా మొదటి అక్షరాలు",
    cover: teluguLettersCover,
    category: "Letters",
    age: "3–6",
    minutes: 6,
    tagline: "Meet the friendly vowels of Telugu.",
    pages: [
      { image: "https://loremflickr.com/1200/800/mother,colorful?lock=901", telugu: "అ — అమ్మ", english: "A — Amma (Mother)" },
      { image: "https://loremflickr.com/1200/800/cow,farm?lock=902", telugu: "ఆ — ఆవు", english: "Aa — Aavu (Cow)" },
      { image: "https://loremflickr.com/1200/800/house,village?lock=903", telugu: "ఇ — ఇల్లు", english: "I — Illu (House)" },
      { image: "https://loremflickr.com/1200/800/fly,insect?lock=904", telugu: "ఈ — ఈగ", english: "Ee — Eega (Fly)" },
      { image: "https://loremflickr.com/1200/800/squirrel,tree?lock=905", telugu: "ఉ — ఉడుత", english: "U — Uduta (Squirrel)" },
      { image: "https://loremflickr.com/1200/800/swing,playground?lock=906", telugu: "ఊ — ఊయల", english: "Oo — Ooyala (Swing)" },
      { image: "https://loremflickr.com/1200/800/mouse,cute?lock=907", telugu: "ఎ — ఎలుక", english: "E — Eluka (Mouse)" },
      { image: "https://loremflickr.com/1200/800/elephant,wild?lock=908", telugu: "ఏ — ఏనుగు", english: "Ae — Aenugu (Elephant)" },
      { image: "https://loremflickr.com/1200/800/number,five?lock=909", telugu: "ఐ — ఐదు", english: "Ai — Aidu (Five)" },
      { image: "https://loremflickr.com/1200/800/camel,desert?lock=910", telugu: "ఒ — ఒంటె", english: "O — Onte (Camel)" },
      { image: "https://loremflickr.com/1200/800/boat,river?lock=911", telugu: "ఓ — ఓడ", english: "Oh — Oda (Boat)" },
      { image: "https://loremflickr.com/1200/800/medicine,herbs?lock=912", telugu: "ఔ — ఔషధం", english: "Au — Aushadham (Medicine)" },
      { image: "https://loremflickr.com/1200/800/market,shop?lock=913", telugu: "అం — అంగడి", english: "Am — Angadi (Shop)" },
      { image: "https://loremflickr.com/1200/800/life,nature?lock=914", telugu: "అః — ప్రాణాః", english: "Ah — Praanaah (Life)" },
    ],
  },

  // ─────────── NUMBERS ───────────
  {
    id: "counting-friends",
    title: "Counting Friends 1 to 10",
    teluguTitle: "ఒకటి నుండి పది వరకు",
    cover: countingFriendsCover,
    category: "Numbers",
    age: "3–5",
    minutes: 4,
    tagline: "Count along with little friends.",
    pages: [
      { image: "https://loremflickr.com/1200/800/elephant,one?lock=1001", telugu: "౧ — ఒకటి", english: "1 — One elephant" },
      { image: "https://loremflickr.com/1200/800/butterfly,two?lock=1002", telugu: "౨ — రెండు", english: "2 — Two butterflies" },
      { image: "https://loremflickr.com/1200/800/fish,three?lock=1003", telugu: "౩ — మూడు", english: "3 — Three fish" },
      { image: "https://loremflickr.com/1200/800/birds,four?lock=1004", telugu: "౪ — నాలుగు", english: "4 — Four birds" },
      { image: "https://loremflickr.com/1200/800/flowers,five?lock=1005", telugu: "౫ — అయిదు", english: "5 — Five flowers" },
      { image: "https://loremflickr.com/1200/800/stars,six?lock=1006", telugu: "౬ — ఆరు", english: "6 — Six stars" },
      { image: "https://loremflickr.com/1200/800/frog,seven?lock=1007", telugu: "౭ — ఏడు", english: "7 — Seven frogs" },
      { image: "https://loremflickr.com/1200/800/mango,eight?lock=1008", telugu: "౮ — ఎనిమిది", english: "8 — Eight mangoes" },
      { image: "https://loremflickr.com/1200/800/clouds,nine?lock=1009", telugu: "౯ — తొమ్మిది", english: "9 — Nine clouds" },
      { image: "https://loremflickr.com/1200/800/firefly,ten?lock=1010", telugu: "౧౦ — పది", english: "10 — Ten fireflies" },
    ],
  },

  // ─────────── RHYMES ───────────
  {
    id: "moonlight-rhymes",
    title: "Moonlight Rhymes",
    teluguTitle: "చందమామ పాట",
    cover: moonlightRhymesCover,
    category: "Rhymes",
    age: "3–5",
    minutes: 3,
    tagline: "A soft rhyme for bedtime.",
    pages: [
      { image: mr1, telugu: "చందమామ రావే, జాబిల్లి రావే.", english: "Come, dear moon, come tonight." },
      { image: mr2, telugu: "కొండెక్కి రావే, కోటి పూలు తేవే.", english: "Climb the hill and bring a million flowers." },
      { image: mr3, telugu: "బంగారు పళ్లెంలో పాలు పోసేవే.", english: "Pour the milk into the golden plate." },
      { image: mr4, telugu: "నా బాబుకు హాయిగా నిద్ర పుచ్చవే.", english: "And gently send my little one to sleep." },
    ],
  },
  {
    id: "rain-song",
    title: "Rain Song",
    teluguTitle: "వర్షం పాట",
    cover: rainSongCover,
    category: "Rhymes",
    age: "3–6",
    minutes: 3,
    tagline: "A joyful monsoon rhyme.",
    pages: [
      { image: rs1, telugu: "వాన వాన వల్లప్ప,", english: "Rain, rain, dear rain," },
      { image: rs2, telugu: "చేయి చాపి పిల్లప్ప.", english: "Stretch out your hand." },
      { image: rs3, telugu: "నీళ్ల చుక్కలు పడుతున్నాయి.", english: "Little drops are falling down." },
      { image: rs4, telugu: "కప్పలు బెకబెక అంటున్నాయి.", english: "Frogs are singing croak-croak." },
      { image: rs5, telugu: "పిల్లలంతా గెంతుతున్నారు!", english: "All the children jump and play!" },
    ],
  },
  {
    id: "gorumuddha",
    title: "Gorumuddha",
    teluguTitle: "గోరుముద్ద",
    cover: gorumuddahCover,
    category: "Rhymes",
    age: "3–5",
    minutes: 2,
    tagline: "A classic Telugu lullaby about a loving mother.",
    pages: [
      { image: "https://loremflickr.com/1200/800/mother,baby,india,cartoon?lock=2002", telugu: "గోరుముద్ద తినిపించేది అమ్మ.", english: "Amma feeds me a morsel with love." },
      { image: "https://loremflickr.com/1200/800/lullaby,moon,baby,cartoon?lock=2003", telugu: "జోలపాట పాడేది అమ్మ.", english: "Amma sings a lullaby to sleep." },
      { image: "https://loremflickr.com/1200/800/hug,mother,child,cartoon?lock=2004", telugu: "గుండెకు హత్తుకుంటుంది అమ్మ.", english: "Amma holds me close to her heart." },
      { image: "https://loremflickr.com/1200/800/love,family,india,cartoon?lock=2005", telugu: "అమ్మ ప్రేమ అన్నిటికంటే గొప్పది.", english: "Amma's love is the greatest of all." },
    ],
  },
  {
    id: "raara-krishna",
    title: "Raara Chinna Krishna",
    teluguTitle: "రారా చిన్ని కృష్ణా",
    cover: raaraKrishnaCover,
    category: "Rhymes",
    age: "3–6",
    minutes: 3,
    tagline: "A beloved Telugu rhyme calling little Krishna.",
    pages: [
      { image: "https://loremflickr.com/1200/800/krishna,flute,cartoon?lock=2011", telugu: "రారా చిన్ని కృష్ణా, ముద్దు కృష్ణా.", english: "Come, little Krishna, sweet dear Krishna." },
      { image: "https://loremflickr.com/1200/800/butter,krishna,cartoon?lock=2012", telugu: "వెన్న ముద్దలు తినవా, నవ్వుల కృష్ణా.", english: "Will you eat the butter balls, smiling Krishna?" },
      { image: "https://loremflickr.com/1200/800/peacock,feather,cartoon?lock=2013", telugu: "నెమలి పింఛం పెట్టావే, అందమైన కృష్ణా.", english: "You wore the peacock feather, beautiful Krishna." },
      { image: "https://loremflickr.com/1200/800/flute,music,cartoon?lock=2014", telugu: "వేణువు పాడు, మా కృష్ణా.", english: "Play your flute for us, our dear Krishna." },
    ],
  },
  {
    id: "bala-balu",
    title: "Bala Balu",
    teluguTitle: "బాలా బాలూ",
    cover: balabaluCover,
    category: "Rhymes",
    age: "3–5",
    minutes: 2,
    tagline: "A playful rhyme about a happy child.",
    pages: [
      { image: "https://loremflickr.com/1200/800/child,run,happy,cartoon?lock=2021", telugu: "బాలూ బాలూ పరిగెత్తాడు.", english: "Balu, Balu ran and ran." },
      { image: "https://loremflickr.com/1200/800/mango,tree,cartoon?lock=2022", telugu: "మామిడి చెట్టు ఎక్కాడు.", english: "He climbed the mango tree." },
      { image: "https://loremflickr.com/1200/800/mango,fruit,cartoon?lock=2023", telugu: "పండిన మామిడి తిన్నాడు.", english: "He ate the ripe sweet mango." },
      { image: "https://loremflickr.com/1200/800/child,happy,cartoon?lock=2024", telugu: "ఆనందంగా పాట పాడాడు.", english: "And sang a happy song." },
    ],
  },
  {
    id: "parrot-song",
    title: "The Parrot's Song",
    teluguTitle: "చిలుక పాట",
    cover: parrotSongCover,
    category: "Rhymes",
    age: "3–6",
    minutes: 3,
    tagline: "Learn words with a singing parrot.",
    pages: [
      { image: "https://loremflickr.com/1200/800/parrot,green?lock=1201", telugu: "చిలుక చిలుక పచ్చ చిలుక.", english: "Parrot, parrot, green little parrot." },
      { image: "https://loremflickr.com/1200/800/mango,fruit?lock=1202", telugu: "మామిడి పండు తీపి పండు.", english: "Mango fruit, oh sweetest fruit." },
      { image: "https://loremflickr.com/1200/800/parrot,beak?lock=1203", telugu: "ఎరుపు ముక్కు, నీలి తోక.", english: "Red, red beak and a blue, blue tail." },
      { image: "https://loremflickr.com/1200/800/parrot,singing?lock=1204", telugu: "పాట పాడు, పాట పాడు.", english: "Sing a song, oh sing a song." },
      { image: "https://loremflickr.com/1200/800/parrot,child?lock=1205", telugu: "నాతో ఆడు, నాతో పాడు.", english: "Come play with me, come sing along." },
    ],
  },

  // ─────────── DAILY TELUGU ───────────
  {
    id: "morning-routine",
    title: "Good Morning Routine",
    teluguTitle: "మంచి ఉదయం",
    cover: morningCover,
    category: "Daily Telugu",
    age: "4–6",
    minutes: 3,
    tagline: "Arjun's morning, step by step.",
    pages: [
      { image: "https://loremflickr.com/1200/800/morning,child?lock=1301", telugu: "అర్జున్ ఉదయం లేస్తాడు.", english: "Arjun wakes up in the morning." },
      { image: "https://loremflickr.com/1200/800/toothbrush,child?lock=1302", telugu: "అతను పళ్లు తోముకుంటాడు.", english: "He brushes his teeth." },
      { image: "https://loremflickr.com/1200/800/bath,child?lock=1303", telugu: "స్నానం చేస్తాడు.", english: "He takes a bath." },
      { image: "https://loremflickr.com/1200/800/breakfast,child?lock=1304", telugu: "అమ్మ ఇచ్చిన టిఫిన్ తింటాడు.", english: "He eats the breakfast Amma made." },
      { image: "https://loremflickr.com/1200/800/school,backpack?lock=1305", telugu: "బ్యాగ్ తీసుకుని స్కూల్‌కు వెళ్తాడు.", english: "He takes his bag and goes to school." },
    ],
  },
  {
    id: "market",
    title: "At the Market",
    teluguTitle: "బజారులో",
    cover: marketCover,
    category: "Daily Telugu",
    age: "5–7",
    minutes: 4,
    tagline: "A morning walk to the bazaar.",
    pages: [
      { image: "https://loremflickr.com/1200/800/market,india?lock=1401", telugu: "నేను నానమ్మతో బజారుకు వెళ్తాను.", english: "I go to the market with my grandmother." },
      { image: "https://loremflickr.com/1200/800/tomato,market?lock=1402", telugu: "మేము టమాటాలు కొంటాము.", english: "We buy tomatoes — Tamaatalu." },
      { image: "https://loremflickr.com/1200/800/mango,market?lock=1403", telugu: "మామిడి పండ్లు తీసుకుంటాము.", english: "We pick mangoes — Maamidi pandlu." },
      { image: "https://loremflickr.com/1200/800/vegetables,fresh?lock=1404", telugu: "పచ్చి కూరగాయలు కూడా.", english: "Fresh vegetables too — Pacchi kooragayalu." },
      { image: "https://loremflickr.com/1200/800/marigold,flowers?lock=1405", telugu: "బంతిపూల దండ కొనుక్కుంటాము.", english: "We buy a marigold garland — Banthi poola danda." },
      { image: "https://loremflickr.com/1200/800/happy,family?lock=1406", telugu: "ఇంటికి ఆనందంగా తిరిగి వస్తాము.", english: "We return home happily." },
    ],
  },
];
