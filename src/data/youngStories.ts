// Long-form stories for older kids (8-10). 4 chapters each, ~5-6 Telugu lines per chapter.
import braveCover from "@/assets/young/brave/cover.jpg";
import brave1 from "@/assets/young/brave/p1.jpg";
import brave2 from "@/assets/young/brave/p2.jpg";
import brave3 from "@/assets/young/brave/p3.jpg";
import brave4 from "@/assets/young/brave/p4.jpg";
import braveAudio0051 from "@/assets/audio/young/brave-little-one/slow-005/page-1.mp3";
import braveAudio0052 from "@/assets/audio/young/brave-little-one/slow-005/page-2.mp3";
import braveAudio0053 from "@/assets/audio/young/brave-little-one/slow-005/page-3.mp3";
import braveAudio0054 from "@/assets/audio/young/brave-little-one/slow-005/page-4.mp3";
import braveAudio051 from "@/assets/audio/young/brave-little-one/slow-05/page-1.mp3";
import braveAudio052 from "@/assets/audio/young/brave-little-one/slow-05/page-2.mp3";
import braveAudio053 from "@/assets/audio/young/brave-little-one/slow-05/page-3.mp3";
import braveAudio054 from "@/assets/audio/young/brave-little-one/slow-05/page-4.mp3";
import braveAudio1 from "@/assets/audio/young/brave-little-one/base/page-1.mp3";
import braveAudio2 from "@/assets/audio/young/brave-little-one/base/page-2.mp3";
import braveAudio3 from "@/assets/audio/young/brave-little-one/base/page-3.mp3";
import braveAudio4 from "@/assets/audio/young/brave-little-one/base/page-4.mp3";

import forestCover from "@/assets/young/forest/cover.jpg";
import forest1 from "@/assets/young/forest/p1.jpg";
import forest2 from "@/assets/young/forest/p2.jpg";
import forest3 from "@/assets/young/forest/p3.jpg";
import forest4 from "@/assets/young/forest/p4.jpg";

import starsCover from "@/assets/young/stars/cover.jpg";
import stars1 from "@/assets/young/stars/p1.jpg";
import stars2 from "@/assets/young/stars/p2.jpg";
import stars3 from "@/assets/young/stars/p3.jpg";
import stars4 from "@/assets/young/stars/p4.jpg";

import cloudCover from "@/assets/young/cloud-fort/cover.jpg";
import cloud1 from "@/assets/young/cloud-fort/p1.jpg";
import cloud2 from "@/assets/young/cloud-fort/p2.jpg";
import cloud3 from "@/assets/young/cloud-fort/p3.jpg";
import cloud4 from "@/assets/young/cloud-fort/p4.jpg";

import riverCover from "@/assets/young/river-lanterns/cover.jpg";
import river1 from "@/assets/young/river-lanterns/p1.jpg";
import river2 from "@/assets/young/river-lanterns/p2.jpg";
import river3 from "@/assets/young/river-lanterns/p3.jpg";
import river4 from "@/assets/young/river-lanterns/p4.jpg";

export interface YoungChapter {
  title: string;
  telugu: string; // 4-6 sentences, joined by spaces
  english: string; // short english summary, 1-2 lines for parents
  image: string;
  audioBySpeed?: Partial<Record<"0.05" | "0.5" | "1", string>>;
}

export interface YoungStory {
  id: string;
  title: string; // Telugu title
  titleEnglish: string;
  tagline: string; // short hook in Telugu
  ageBand: string;
  readMinutes: number;
  cover: string;
  accent: string; // tailwind-friendly gradient class fragment
  chapters: YoungChapter[];
}

export const youngStories: YoungStory[] = [
  {
    id: "brave-little-one",
    title: "ధైర్యవంతుడైన అర్జున్",
    titleEnglish: "Brave Little Arjun",
    tagline: "ఒక చిన్న కుర్రాడు, ఒక పెద్ద అడవి, ఒక మాయా స్నేహితుడు.",
    ageBand: "8–10",
    readMinutes: 4,
    cover: braveCover,
    accent: "from-amber-200/60 via-rose-200/50 to-purple-200/60",
    chapters: [
      {
        title: "గ్రామంలో ఉదయం",
        telugu:
          "అర్జున్ ఒక చిన్న గ్రామంలో నివసిస్తాడు. అతని ఇల్లు పర్వతాల పక్కన ఉంది. ప్రతిరోజూ ఉదయాన్నే అతను తల్లికి సహాయం చేస్తాడు. కానీ అతని మనసు మాత్రం ఎప్పుడూ అడవి వైపే వెళ్తుంది. ఒక రోజు ఉదయం, తాత చెప్పిన పాత కథ గుర్తొచ్చింది. \"మన అడవిలో ఒక మాయా జంతువు ఉంది,\" అన్నాడు తాత.",
        english:
          "Arjun lives in a small village near the mountains. One morning he remembers his grandfather's story about a magical creature in the forest.",
        image: brave1,
        audioBySpeed: {
          "0.05": braveAudio0051,
          "0.5": braveAudio051,
          "1": braveAudio1,
        },
      },
      {
        title: "మాయా అడవిలోకి",
        telugu:
          "అర్జున్ ధైర్యం చేసి అడవిలోకి అడుగు పెట్టాడు. అక్కడ చెట్లు చాలా పెద్దవిగా ఉన్నాయి. మిణుగురులు చిన్న చిన్న దీపాల్లా మెరుస్తున్నాయి. గులాబీ రంగు పుట్టగొడుగులు దారిని చూపిస్తున్నాయి. \"ఇది నిజంగానే మాయా అడవి!\" అని అర్జున్ గుసగుసలాడాడు. అతని గుండె వేగంగా కొట్టుకుంది.",
        english:
          "He bravely steps into the forest. Giant trees, fireflies, and glowing mushrooms surround him.",
        image: brave2,
        audioBySpeed: {
          "0.05": braveAudio0052,
          "0.5": braveAudio052,
          "1": braveAudio2,
        },
      },
      {
        title: "పెద్ద పులితో",
        telugu:
          "హఠాత్తుగా ఒక పెద్ద తెల్లని పులి కనిపించింది. దాని కళ్ళు చంద్రుని వెలుగులా మెరుస్తున్నాయి. అర్జున్ భయపడలేదు, నిలబడ్డాడు. \"నీవు ఎవరు, చిన్నారీ?\" అని పులి మృదువుగా అడిగింది. \"నేను అర్జున్. మీ స్నేహితుడిని కావాలనుకుంటున్నాను,\" అని ధైర్యంగా చెప్పాడు. పులి నవ్వింది.",
        english:
          "A magical white tiger appears. Arjun stays calm and offers friendship instead of running away.",
        image: brave3,
        audioBySpeed: {
          "0.05": braveAudio0053,
          "0.5": braveAudio053,
          "1": braveAudio3,
        },
      },
      {
        title: "ఆకాశంలో ప్రయాణం",
        telugu:
          "పులి అర్జున్‌ని తన వీపు మీద కూర్చోబెట్టింది. ఇద్దరూ కలిసి ఆకాశంలోకి ఎగిరారు. నక్షత్రాలు చేతికి అందినట్లు దగ్గరగా ఉన్నాయి. \"ధైర్యం ఉన్నవాడికే ఈ ప్రపంచం కనిపిస్తుంది,\" అని పులి చెప్పింది. అర్జున్ నవ్వుతూ గ్రామం వైపు తిరిగి వచ్చాడు. అతనికి ఇప్పుడు ఒక మాయా స్నేహితుడు ఉన్నాడు.",
        english:
          "The tiger flies Arjun through the stars. He learns that courage opens up a magical world, and returns home with a new friend.",
        image: brave4,
        audioBySpeed: {
          "0.05": braveAudio0054,
          "0.5": braveAudio054,
          "1": braveAudio4,
        },
      },
    ],
  },
  {
    id: "magical-forest",
    title: "మాయా అడవి రహస్యం",
    titleEnglish: "The Magical Forest",
    tagline: "ఒక అమ్మాయి, ఒక నెమలి, ఒక మరచిపోయిన చెట్టు.",
    ageBand: "8–10",
    readMinutes: 4,
    cover: forestCover,
    accent: "from-pink-200/60 via-purple-200/50 to-fuchsia-200/60",
    chapters: [
      {
        title: "అడవి అంచున మీరా",
        telugu:
          "మీరా ఒక చిన్న పల్లెలో ఉండే తెలివైన అమ్మాయి. ఆమెకు ప్రకృతి అంటే చాలా ఇష్టం. ప్రతి సాయంత్రం ఆమె అడవి అంచుకు వెళ్తుంది. అక్కడ నెమలి ఈకలు గాలిలో తేలుతూ ఉంటాయి. \"ఈ అడవి ఏదో చెప్పాలనుకుంటోంది,\" అని మీరాకు అనిపించింది. ఆ రోజు ఆమె లోపలికి అడుగు పెట్టింది.",
        english:
          "Meera, a curious girl, finally steps into the forest she has watched for years.",
        image: forest1,
      },
      {
        title: "వెలుగు లేడి",
        telugu:
          "ఒక చిన్న తెల్లని లేడి మీరా ముందుకు వచ్చింది. దాని శరీరం వెన్నెల్లా మెరుస్తోంది. \"నన్ను అనుసరించు, మీరా,\" అని అది మాట్లాడింది. మీరా ఆశ్చర్యపోయింది, కానీ భయపడలేదు. లావెండర్ పూలు దారికి రెండు వైపులా పూశాయి. ప్రతి అడుగుతో అడవి మరింత అందంగా మారింది.",
        english:
          "A glowing deer speaks and asks Meera to follow it deeper into the forest.",
        image: forest2,
      },
      {
        title: "దీపాల చెట్టు",
        telugu:
          "చివరికి వారు ఒక పెద్ద మర్రి చెట్టు దగ్గర చేరారు. చెట్టు కొమ్మలకు వందల దీపాలు వేలాడుతున్నాయి. \"ఇది మన గ్రామపు పాత కథల చెట్టు,\" అని లేడి చెప్పింది. \"ప్రతి దీపం ఒక మరచిపోయిన కథ.\" మీరా కన్నీళ్ళతో చెట్టును చూసింది. \"నేను ఈ కథలను తిరిగి చెప్పాలి,\" అని నిర్ణయించుకుంది.",
        english:
          "They reach a giant banyan covered in lanterns — each one a forgotten story of the village.",
        image: forest3,
      },
      {
        title: "నెమలి స్నేహితుడు",
        telugu:
          "మర్నాడు ఉదయం, ఒక అందమైన నెమలి మీరా ముందు వచ్చి నిలిచింది. ఇద్దరూ కలిసి పూల వనంలో నృత్యం చేశారు. \"నేను నీతో ఎప్పుడూ ఉంటాను,\" అని నెమలి చెప్పింది. మీరా గ్రామానికి తిరిగి వెళ్ళి పిల్లలకు పాత కథలు చెప్పడం మొదలుపెట్టింది. మాయా అడవి ఇప్పుడు మరచిపోలేదు.",
        english:
          "A peacock becomes her companion. Meera returns and brings the old stories back to her village.",
        image: forest4,
      },
    ],
  },
  {
    id: "king-of-stars",
    title: "నక్షత్రాల రాజు",
    titleEnglish: "King of the Stars",
    tagline: "ఒక రాత్రి, ఒక నక్షత్రం, ఒక చిన్న అద్భుతం.",
    ageBand: "8–10",
    readMinutes: 4,
    cover: starsCover,
    accent: "from-indigo-200/60 via-purple-200/50 to-pink-200/60",
    chapters: [
      {
        title: "ఆకాశం చూసే కుర్రాడు",
        telugu:
          "రవి అనే చిన్న కుర్రాడు ప్రతి రాత్రి తన ఇంటి పైకి ఎక్కుతాడు. చేతిలో ఒక చిన్న టెలిస్కోప్ ఉంటుంది. \"ఎప్పటికైనా నేను నక్షత్రాలను తాకాలి,\" అని కలలు కంటాడు. తల్లి నవ్వుతూ \"నక్షత్రాలు చాలా దూరం, రవీ,\" అంటుంది. కానీ రవి ఆశ వదలలేదు. ఒక రాత్రి విచిత్రమైన వెలుగు కనిపించింది.",
        english:
          "Ravi watches the night sky from his rooftop, dreaming of touching the stars.",
        image: stars1,
      },
      {
        title: "పడిపోయిన నక్షత్రం",
        telugu:
          "ఒక చిన్న నక్షత్రం ఆకాశం నుండి నెమ్మదిగా జారి వచ్చింది. రవి పరుగెత్తుకుంటూ కొండ మీదకు వెళ్ళాడు. తన చేతుల్లో ఆ నక్షత్రం మెల్లగా దిగింది. వెచ్చగా, మృదువుగా ఉంది. \"నేను దారి తప్పిపోయాను,\" అని నక్షత్రం చిన్న గొంతుతో చెప్పింది. రవికి కళ్ళు పెద్దవి అయ్యాయి.",
        english:
          "A small star falls into Ravi's hands. It tells him it has lost its way home.",
        image: stars2,
      },
      {
        title: "చిన్న స్నేహితుడు",
        telugu:
          "కొన్ని రోజులు నక్షత్రం రవితోనే ఉంది. ఇద్దరూ కలిసి పుస్తకాలు చదివారు, ఆటలు ఆడారు. నక్షత్రం రవికి ఆకాశ రహస్యాలు చెప్పింది. \"ప్రతి నక్షత్రానికీ ఒక కథ ఉంటుంది,\" అని చెప్పింది. కానీ రోజు రోజుకు దాని వెలుగు మెల్లగా తగ్గుతోంది. రవికి ఆందోళన మొదలైంది.",
        english:
          "They become friends for a few days, but Ravi notices the little star's glow getting weaker.",
        image: stars3,
      },
      {
        title: "ఇంటికి పంపడం",
        telugu:
          "రవికి అర్థమైంది — నక్షత్రాన్ని ఇంటికి పంపాలి. మళ్ళీ కొండ మీదకు వెళ్ళారు. \"వెళ్ళు, మిత్రమా. నీ స్థానం ఆకాశంలోనే,\" అని రవి మెల్లగా చెప్పాడు. నక్షత్రం వెలుగుతూ ఆకాశంలోకి ఎగిరింది. ఇప్పుడు ఆకాశంలో ఒక నక్షత్రం రవి కోసమే ప్రత్యేకంగా మెరుస్తుంది. నిజమైన స్నేహం దూరానికి భయపడదు.",
        english:
          "Ravi realises the star must return to the sky. He releases it — and gains a friend that shines for him every night.",
        image: stars4,
      },
    ],
  },
  {
    id: "cloud-fort-secret",
    title: "మేఘాల కోట రహస్యం",
    titleEnglish: "The Cloud Fort Secret",
    tagline: "ఒక గాలిపటం, ఒక పాత పటం, ఆకాశంలో దాగిన కోట.",
    ageBand: "8–10",
    readMinutes: 5,
    cover: cloudCover,
    accent: "from-sky-200/60 via-amber-200/50 to-orange-200/60",
    chapters: [
      {
        title: "గాలిపటంలో పటం",
        telugu:
          "కిరణ్ ఇంటి మేడ మీద పగిలిన గాలిపటం కనిపించింది. దాని తోకకు ఒక పాత పటం కట్టబడి ఉంది. పటంలో గ్రామం, కొండ, మేఘాల మధ్య చిన్న కోట గీసి ఉంది. \"ఇది ఎవరి ఆట?\" అని కిరణ్ అనుకున్నాడు. అప్పుడు గాలి ఒక్కసారిగా పటాన్ని మెరిపించింది. కోట వైపు చూపే బాణం నీలంగా వెలిగింది.",
        english:
          "Kiran finds an old sky-map tied to a torn kite. The map points toward a fort hidden in the clouds.",
        image: cloud1,
      },
      {
        title: "గాలి మెట్లు",
        telugu:
          "కిరణ్ పటాన్ని పట్టుకుని కొండదారిలోకి బయలుదేరాడు. గాలి గడ్డి మీద అలలలా పరుగెత్తింది. రంగురంగుల గాలిపటాలు అతనికి దారి చూపుతున్నట్లు ఎగిరాయి. కొండపైకి చేరగానే మేఘాల్లో తెల్లని మెట్లు ఏర్పడ్డాయి. కిరణ్ ఊపిరి బిగపట్టి మొదటి మెట్టు ఎక్కాడు. కింద గ్రామం చిన్న బొమ్మలా కనిపించింది.",
        english:
          "He follows the map up a windy hill, where a staircase of mist appears in the clouds.",
        image: cloud2,
      },
      {
        title: "మూడు గంటల పరీక్ష",
        telugu:
          "మేఘాల కోటలో బంగారు స్తంభాలు, వెండి కిటికీలు ఉన్నాయి. మధ్యలో మూడు గాలి గంటలు వేలాడుతున్నాయి. ప్రతి గంట వేరే స్వరంతో మోగింది. \"సరైన స్వరం వింటేనే తలుపు తెరుచుకుంటుంది,\" అని పటం మీద అక్షరాలు మెరిశాయి. కిరణ్ కళ్ళు మూసుకుని గాలిని విన్నాడు. మూడో గంటలో వర్షపు చప్పుడు దాగి ఉంది.",
        english:
          "Inside the cloud fort, Kiran must listen carefully to three wind bells and find the sound of rain.",
        image: cloud3,
      },
      {
        title: "వాన రత్నం",
        telugu:
          "తలుపు తెరుచుకోగానే లోపల చిన్న వాన రత్నం మెరిసింది. కిరణ్ దాన్ని జాగ్రత్తగా తీసుకుని గ్రామానికి తిరిగి వచ్చాడు. పొలాలు ఎండిపోయి, రైతులు ఆకాశం వైపు చూస్తున్నారు. కిరణ్ రత్నాన్ని నేలపై పెట్టగానే చల్లని చినుకులు పడ్డాయి. పిల్లలు నవ్వుతూ బయటికి పరుగెత్తారు. మేఘాల కోట మెల్లగా వెలుగులో కలిసిపోయింది.",
        english:
          "Kiran brings back a rain crystal. The dry fields receive rain, and the cloud fort fades into the sky.",
        image: cloud4,
      },
    ],
  },
  {
    id: "blue-lantern-river",
    title: "నీలి దీపాల నది",
    titleEnglish: "The Blue Lantern River",
    tagline: "నది మీద మెరిసిన దీపాలు, వేర్లు కింద దాగిన గుహ.",
    ageBand: "8–10",
    readMinutes: 5,
    cover: riverCover,
    accent: "from-cyan-200/60 via-blue-200/50 to-violet-200/60",
    chapters: [
      {
        title: "నీలి వెలుగులు",
        telugu:
          "అనిక గ్రామం పక్కన నది ప్రవహిస్తుంది. ఒక సాయంత్రం నీటిమీద చిన్న నీలి వెలుగులు మెరుస్తున్నాయి. అవి పురుగుల్లా కనిపించాయి, కానీ ఒక వరుసగా ముందుకు కదిలాయి. అమ్మమ్మ ఇచ్చిన పిత్తల దీపం అనిక చేతిలో మెల్లగా వెలిగింది. \"నది ఏదో చెప్పాలని చూస్తోంది,\" అని అనిక అనుకుంది. ఆమె నది ఒడ్డున నిశ్శబ్దంగా నిలిచింది.",
        english:
          "Anika notices blue lights moving over the river, and her grandmother's brass lantern begins to glow.",
        image: river1,
      },
      {
        title: "పడవ ప్రయాణం",
        telugu:
          "చిన్న పడవను నీటిలోకి తోసి అనిక అందులో కూర్చుంది. నీలి వెలుగులు పడవ ముందు దారి వేసాయి. నది నిశ్శబ్దంగా ఉంది, కానీ దాని లోతుల్లో మధురమైన స్వరం వినిపించింది. పెద్ద మర్రి చెట్ల నీడలు నీటిపై ఊగుతున్నాయి. అనిక భయపడలేదు. \"నేను వింటున్నాను,\" అని ఆమె మెల్లగా చెప్పింది.",
        english:
          "She rows into the moonlit river, following the blue lights and listening to a hidden song beneath the water.",
        image: river2,
      },
      {
        title: "వేర్ల కింద గుహ",
        telugu:
          "వెలుగులు ఒక పెద్ద మర్రి చెట్టు వేర్ల దగ్గర ఆగిపోయాయి. వేర్ల మధ్య చిన్న గుహ తలుపు కనిపించింది. లోపల నీలి స్ఫటిక దీపాలు వరుసగా వేలాడుతున్నాయి. రాతి మీద పాత గుర్తులు చెక్కబడి ఉన్నాయి. \"నది వెలుగు తగ్గితే గ్రామం దాహంతో ఉంటుంది,\" అని అనిక అర్థం చేసుకుంది. మధ్యలో ఖాళీ స్తంభం ఒక రత్నం కోసం ఎదురుచూస్తోంది.",
        english:
          "The lights lead her to a hidden cave beneath banyan roots, where she discovers the river's missing crystal.",
        image: river3,
      },
      {
        title: "నది మళ్లీ పాడింది",
        telugu:
          "అనిక చిన్న నీలి రత్నాన్ని స్తంభం నుంచి తీసుకుని నదిలో పెట్టింది. వెంటనే నీరు వెండిలా మెరిసింది. చేపలు తిరిగి ఈదాయి, తామర పూలు తెరుచుకున్నాయి. గ్రామస్తులు ఆశ్చర్యంగా ఒడ్డుకు వచ్చారు. నది మళ్లీ తన మృదువైన పాట పాడింది. ఆ రోజు నుంచి అనికకు నది భాష కొంచెం కొంచెంగా అర్థమవుతూనే ఉంది.",
        english:
          "Anika restores the blue crystal to the river. The water brightens, fish return, and the river begins to sing again.",
        image: river4,
      },
    ],
  },
];
