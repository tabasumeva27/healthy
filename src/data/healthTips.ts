export interface HealthTip {
  id: string;
  category: 'workout' | 'hydration' | 'breathing' | 'recovery' | 'nutrition';
  categoryLabel: string;
  categoryIcon: string;
  title: string;
  description: string;
  keyAction: string;
  quote?: string;
}

export const HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip-1',
    category: 'hydration',
    categoryLabel: 'হাইড্রেশন ও পানি',
    categoryIcon: 'Droplets',
    title: 'ব্যায়ামের মাঝে সঠিক পানি পানের নিয়ম',
    description: 'ব্যায়ামের সময় একটানা বেশি পানি না খেয়ে প্রতি ১৫-২০ মিনিট পর পর ২-৩ ঢোক সাধারণ তাপমাত্রার পানি পান করুন। এটি পেশীর টান লাগা (Muscle Cramp) রোধ করে এবং স্ট্যামিনা ধরে রাখে।',
    keyAction: 'প্রতি ১৫ মিনিটে ১৫০-২০০ মিলি পানি পান করুন।',
    quote: 'Drink before you feel thirsty — hydration keeps your muscles performing.',
  },
  {
    id: 'tip-2',
    category: 'workout',
    categoryLabel: 'পোসচার ও সঠিক ফর্ম',
    categoryIcon: 'Flame',
    title: 'ভারী ওজনের চেয়ে সঠিক ভঙ্গি বেশি গুরুত্বপূর্ণ',
    description: 'ভুল পোসচারে ব্যায়াম করলে মেরুদণ্ড ও অস্থিসন্ধিতে আঘাতের ঝুঁকি বাড়ে। স্কোয়াট বা পুশ-আপের সময় পেট ও কোর শক্ত (Tight Core) রাখুন এবং মেরুদণ্ড সোজা রাখুন।',
    keyAction: 'সর্বদা শরীরের কোর শক্ত রাখুন এবং পিঠ সোজা রাখুন।',
    quote: 'Form is king — ego lifting leads to injuries, disciplined form builds strength.',
  },
  {
    id: 'tip-3',
    category: 'breathing',
    categoryLabel: 'সঠিক শ্বাসপ্রশ্বাস',
    categoryIcon: 'Wind',
    title: 'ব্যায়ামে শ্বাসপ্রশ্বাসের বৈজ্ঞানিক ছন্দ',
    description: 'ওজন ওঠানো বা বেশি শক্তির সময় (Concentric Phase) মুখ দিয়ে ধীরে ধীরে শ্বাস ছাড়ুন, আর ওজন নামানোর সময় নাক দিয়ে গভীরভাবে শ্বাস গ্রহণ করুন। কখনো শ্বাস আটকে রাখবেন না।',
    keyAction: 'কষ্টের মুহূর্তে শ্বাস ছাড়ুন, রিল্যাক্স মুহূর্তে শ্বাস নিন।',
    quote: 'Control your breath, control your heart rate and endurance.',
  },
  {
    id: 'tip-4',
    category: 'recovery',
    categoryLabel: 'সেট ও বিশ্রাম',
    categoryIcon: 'Timer',
    title: 'সেটের মাঝে পরিমিত বিশ্রামের সময়',
    description: 'ফ্যাট বার্ন ও কার্ডিওর জন্য সেটের মাঝে ৩০-৪৫ সেকেন্ড এবং শক্তি বৃদ্ধির ব্যায়ামে ৬০-৯০ সেকেন্ড বিশ্রাম নিন। অতিরিক্ত বিশ্রাম নিলে পেশী ঠান্ডা হয়ে কার্যকারিতা কমে যায়।',
    keyAction: 'সেট প্রতি ৪৫-৬০ সেকেন্ডের বেশি বিশ্রাম নেবেন না।',
    quote: 'Rest enough to recharge, not enough to cool down.',
  },
  {
    id: 'tip-5',
    category: 'nutrition',
    categoryLabel: 'পোস্ট-ওয়ার্কআউট পুষ্টি',
    categoryIcon: 'Apple',
    title: 'ব্যায়াম শেষের অ্যানাবলিক উইন্ডো',
    description: 'ব্যায়াম শেষ হওয়ার ৩০ থেকে ৪৫ মিনিটের মধ্যে প্রোটিন (যেমন ডিমের সাদা অংশ, ছোলা, বাদাম) এবং জটিল কার্বোহাইড্রেট সমৃদ্ধ স্ন্যাক্স গ্রহণ করুন। এটি ভাঙা পেশীতন্তুর দ্রুত মেরামত করে।',
    keyAction: 'ওয়ার্কআউটের ৪৫ মিনিটের মধ্যে প্রোটিনযুক্ত খাবার গ্রহণ করুন।',
    quote: 'Workouts break muscles down; proper nutrition and rest build them stronger.',
  },
  {
    id: 'tip-6',
    category: 'recovery',
    categoryLabel: 'স্ট্রেচিং ও কুল-ডাউন',
    categoryIcon: 'Activity',
    title: 'ব্যায়ামের পর ৫ মিনিটের কুল-ডাউন স্ট্রেচিং',
    description: 'হঠাৎ ব্যায়াম বন্ধ করলে মাথা ঘোরা বা রক্ত সঞ্চালনে ব্যাঘাত ঘটতে পারে। সেশন শেষে হালকা হাঁটা ও ৫ মিনিট ফুল-বডি স্ট্যাটিক স্ট্রেচিং পেশীর জমে থাকা ল্যাকটিক অ্যাসিড দূর করে।',
    keyAction: 'ওয়ার্কআউট শেষ করে অন্তত ৩-৫ মিনিট স্ট্রেচিং করুন।',
    quote: 'Never skip the cool-down — your joints and muscles will thank you tomorrow.',
  },
  {
    id: 'tip-7',
    category: 'workout',
    categoryLabel: 'ওয়ার্ম-আপের গুরুত্ব',
    categoryIcon: 'Zap',
    title: 'ওয়ার্ম-আপ ছাড়া মূল ব্যায়াম শুরু করবেন না',
    description: 'ব্যায়াম শুরুর আগে ৫ মিনিট জয়েন্ট রোটেশন, জাম্পিং জ্যাক বা হালকা জগিং করুন। এটি সাইনোভিয়াল ফ্লুইড সক্রিয় করে অস্থিসন্ধিকে আঘাত থেকে নিরাপদে রাখে।',
    keyAction: 'রক্ত সঞ্চালন বাড়াতে ৫ মিনিট হালকা ওয়ার্ম-আপ করুন।',
    quote: 'A good warm-up turns cold muscles into responsive engines.',
  },
  {
    id: 'tip-8',
    category: 'recovery',
    categoryLabel: 'ঘুম ও রিকভারি',
    categoryIcon: 'Moon',
    title: 'পেশী ও শক্তি বৃদ্ধি পায় ঘুমের সময়',
    description: 'আপনি জিম বা ঘরে যে পরিশ্রম করেন, তার বৃদ্ধি ঘটে রাতে গভীর ঘুমের সময় যখন গ্রোথ হরমোন নিঃসৃত হয়। প্রতিদিন রাতে অন্তত ৭ থেকে ৮ ঘণ্টা নিরবচ্ছিন্ন ঘুম নিশ্চিত করুন।',
    keyAction: 'প্রতিদিন রাতে ৭-৮ ঘণ্টা নিয়মিত ঘুমানোর অভ্যাস করুন।',
    quote: 'Sleep is the most potent legal performance-enhancing supplement.',
  },
];

export const WORKOUT_MOTIVATIONS = [
  'আজকের পরিশ্রম, আগামীকালের সুস্থ ও শক্তিশালী শরীর।',
  'Consistency is key — ছোট ছোট প্রতিদিনের পদক্ষেপই বড় পরিবর্তন আনে।',
  'আপনার শরীরই আপনার একমাত্র স্থায়ী ঠিকানা, এর যত্ন নিন।',
  'The hardest lift of all is lifting your butt off the couch.',
  'কখনো থামবেন না, অগ্রগতি সবসময় চোখের সামনে সাথে সাথে দেখা যায় না।',
];
