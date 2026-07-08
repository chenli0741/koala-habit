export type BookCatalogItem = {
  title: string;
  url: string;
};

export type BookCatalogCategory = {
  name: string;
  items: BookCatalogItem[];
};

export type BookContent = {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type BookRecord = {
  path: string;
  content: BookContent;
};

export const seedBookRecords: BookRecord[] = [
  {
    path: "english/morning-focus.json",
    content: {
      id: "7B9B7C8B-4B2E-4B58-B7E6-02B4E2A2C001",
      title: "Morning Focus",
      category: "英语",
      content:
        "Start the morning with a clear mind.\n\nChoose one important task and give it your full attention.\n\nWhen you finish, take a short breath and notice what helped you focus.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "english/the-library-card.json",
    content: {
      id: "1E6B2B92-0B09-4DDC-9E5E-3C11B31F8E11",
      title: "The Library Card",
      category: "英语",
      content:
        "Maya carried her new library card in a blue envelope.\n\nShe chose one science book, one story book, and one book with maps.\n\nAt home, she wrote three words she wanted to remember.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "english/a-clear-plan.json",
    content: {
      id: "9F2B7F49-A0A3-456E-8A19-1D52F26473E8",
      title: "A Clear Plan",
      category: "英语",
      content:
        "A clear plan can make a busy day feel smaller.\n\nWrite the first step, the next step, and the final check.\n\nThen begin with the first step instead of thinking about every step at once.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "english/rainy-day-reading.json",
    content: {
      id: "2B060074-0E7F-4992-A0DC-6028F5E11D34",
      title: "Rainy Day Reading",
      category: "英语",
      content:
        "The rain tapped softly on the window.\n\nNoah opened his book and followed the story one page at a time.\n\nWhen he finished, he told his sister the funniest part.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "english/three-new-words.json",
    content: {
      id: "3E33E95F-3468-4334-A5A3-64EDC03F1645",
      title: "Three New Words",
      category: "英语",
      content:
        "Choose three new words from today's reading.\n\nSay each word, write one sentence, and explain the meaning in your own words.\n\nSmall word practice can build a stronger reading habit.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "english/the-kind-question.json",
    content: {
      id: "18D5E0D6-062E-4F40-A8B6-B8967EDDF1F2",
      title: "The Kind Question",
      category: "英语",
      content:
        "A kind question can help a friend feel noticed.\n\nAsk what was hard, what was fun, or what they want to try next.\n\nListening carefully is part of speaking well.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "english/finish-strong.json",
    content: {
      id: "56409D02-8545-45B5-BB24-23DD22B6C73B",
      title: "Finish Strong",
      category: "英语",
      content:
        "Finishing strong means giving care to the last few minutes.\n\nCheck your work, clean your space, and name one thing you learned.\n\nA good ending makes tomorrow easier to start.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "bible/love-and-action.json",
    content: {
      id: "0F49C058-A8CE-4E9C-8E91-9B5C1DB77BB2",
      title: "Love and Action",
      category: "圣经",
      content:
        "Love is more than a kind thought.\n\nIt can become a helpful word, a patient answer, or a small action that protects another person.\n\nToday, look for one quiet way to serve.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "bible/a-gentle-answer.json",
    content: {
      id: "6678C2C4-1032-4F90-A5C4-13C88168F14B",
      title: "A Gentle Answer",
      category: "圣经",
      content:
        "A gentle answer can slow down anger.\n\nBefore you reply, pause and choose words that make peace easier.\n\nStrong words are not always loud words.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "bible/steady-heart.json",
    content: {
      id: "8C916B91-45B9-4819-A922-E28191ED827C",
      title: "Steady Heart",
      category: "圣经",
      content:
        "A steady heart does not need to hurry every answer.\n\nWhen you feel worried, breathe slowly and remember what is true.\n\nPeace can begin with one faithful thought.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "bible/small-faithful-steps.json",
    content: {
      id: "DC118137-6AB7-4C22-9E41-5C0665C3AF40",
      title: "Small Faithful Steps",
      category: "圣经",
      content:
        "Faithfulness often grows through small steps.\n\nTell the truth, finish your work, and help when no one is watching.\n\nLittle choices can shape a strong heart.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "bible/grateful-morning.json",
    content: {
      id: "5BC2BA5A-383D-4313-82CF-D22ECA064656",
      title: "Grateful Morning",
      category: "圣经",
      content:
        "Begin the morning by naming three gifts.\n\nA safe home, a new day, a person who cares, or a chance to learn can all be gifts.\n\nGratitude trains the heart to notice goodness.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "bible/words-that-build.json",
    content: {
      id: "43C74F86-B3BE-4382-BD37-3647B9D3D9B6",
      title: "Words That Build",
      category: "圣经",
      content:
        "Some words tear down, and some words build up.\n\nChoose words that give courage, tell truth, and bring calm.\n\nA careful sentence can be a gift to someone else.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "bible/helping-hands.json",
    content: {
      id: "A7C88BB1-8F49-4B0C-8C24-49E5EC694B1C",
      title: "Helping Hands",
      category: "圣经",
      content:
        "Helping hands do not always wait to be asked.\n\nLook for a dish to carry, a chair to move, or a younger child to encourage.\n\nServing with joy can make ordinary work beautiful.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "news/summer-reading-habit.json",
    content: {
      id: "A53DF3E2-0DA4-45DA-AC23-C04281605F3F",
      title: "Summer Reading Habit",
      category: "新闻",
      content:
        "Many families build a summer reading habit with short daily sessions.\n\nA simple goal, such as twenty minutes after breakfast, is easier to keep than a long plan.\n\nChildren often stay motivated when they can choose part of the reading list.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "news/active-breaks-help-learning.json",
    content: {
      id: "F752362A-7301-489A-8E96-F4194F6E5D8B",
      title: "Active Breaks Help Learning",
      category: "新闻",
      content:
        "Short movement breaks can help children return to learning with better attention.\n\nJumping, stretching, or walking outside for five minutes may be enough.\n\nThe best break is simple, safe, and easy to repeat.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "news/families-try-screen-free-blocks.json",
    content: {
      id: "8F172C17-F445-41D1-9B54-E05F475363E5",
      title: "Families Try Screen-Free Blocks",
      category: "新闻",
      content:
        "Some families are planning short screen-free blocks during the day.\n\nThe goal is not to remove technology completely, but to protect time for reading, movement, and family conversation.\n\nA predictable schedule can make the change easier.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "news/library-programs-grow.json",
    content: {
      id: "F0576621-7030-483E-970A-245C141E7559",
      title: "Library Programs Grow",
      category: "新闻",
      content:
        "Local libraries often add extra programs during school breaks.\n\nChildren can join reading challenges, craft events, and science activities.\n\nFamilies can check a nearby branch for free schedules.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "news/kids-learn-with-short-goals.json",
    content: {
      id: "4A1660A0-E691-4B12-86A9-33F4E63163F8",
      title: "Kids Learn With Short Goals",
      category: "新闻",
      content:
        "Short goals can help children notice progress quickly.\n\nA ten-question math set or a twenty-minute reading block is clear enough to start.\n\nParents can celebrate completion before adding the next challenge.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "news/music-practice-routines.json",
    content: {
      id: "17C4E039-9BB8-4C55-AD84-733A4D4AB050",
      title: "Music Practice Routines",
      category: "新闻",
      content:
        "Music teachers often recommend short daily practice instead of one long weekly session.\n\nA warm-up, one focused section, and one full play-through can make practice easier to repeat.\n\nConsistency matters more than perfect practice.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "news/outdoor-play-and-attention.json",
    content: {
      id: "2F9C114D-1723-4A26-94BA-6C0C512C25F8",
      title: "Outdoor Play and Attention",
      category: "新闻",
      content:
        "Outdoor play gives children a chance to move, look far away, and reset their attention.\n\nEven a short walk or simple ball game can change the rhythm of the day.\n\nFamilies can pair outdoor time with a later quiet reading block.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "ai/how-ai-helps-learning.json",
    content: {
      id: "CA734C9D-B943-4847-81C3-B34A3C7F3E8A",
      title: "How AI Helps Learning",
      category: "AI",
      content:
        "AI can help explain a question in a new way.\n\nIt can also suggest practice steps, quiz ideas, and examples.\n\nA good learner still checks facts, asks people for help, and thinks carefully.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "ai/ask-better-questions.json",
    content: {
      id: "B9E45E03-4B62-406B-B5B7-4DA86935A270",
      title: "Ask Better Questions",
      category: "AI",
      content:
        "A clear question helps AI give a clear answer.\n\nTell it your goal, what you already tried, and what kind of help you need.\n\nThen read the answer slowly and decide what is useful.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "ai/check-the-answer.json",
    content: {
      id: "F43A6416-B79B-49E4-A2D9-6F8B9496E4D6",
      title: "Check the Answer",
      category: "AI",
      content:
        "AI can answer quickly, but quick answers still need checking.\n\nCompare the answer with your book, your notes, or a trusted adult.\n\nLearning grows when you ask why the answer makes sense.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "ai/use-ai-as-a-coach.json",
    content: {
      id: "5BF41C79-A547-41C1-A6B2-831656B9F2A7",
      title: "Use AI as a Coach",
      category: "AI",
      content:
        "A coach helps you practice instead of doing all the work for you.\n\nAsk AI for hints, examples, and small practice steps.\n\nKeep the thinking part for yourself.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "ai/explain-it-simply.json",
    content: {
      id: "EA5B5B7E-8D04-44F7-B8DF-1C53E8D3F6F2",
      title: "Explain It Simply",
      category: "AI",
      content:
        "When something feels confusing, ask for a simple explanation first.\n\nThen ask for one example and one practice question.\n\nSimple steps can make a hard topic easier to enter.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "ai/make-a-practice-quiz.json",
    content: {
      id: "97BD31F2-DCA7-4134-A904-90654A112CB4",
      title: "Make a Practice Quiz",
      category: "AI",
      content:
        "AI can turn notes into a short practice quiz.\n\nAsk for five questions, answer them first, and then check the explanations.\n\nA quiz works best when you try before you look.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  },
  {
    path: "ai/creative-writing-helper.json",
    content: {
      id: "B5387E74-9007-4097-A7D8-D59C2FE2B4F8",
      title: "Creative Writing Helper",
      category: "AI",
      content:
        "AI can help you brainstorm characters, settings, and possible endings.\n\nChoose the ideas you like, then write the story in your own voice.\n\nYour choices make the writing yours.",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-07-01T00:00:00Z"
    }
  }
];

export function buildBookCatalog(records: BookRecord[]) {
  return {
    categories: records.reduce<BookCatalogCategory[]>((categories, record) => {
      const category = categories.find((item) => item.name === record.content.category);
      const catalogItem = {
        title: record.content.title,
        url: record.path
      };

      if (category) {
        category.items.push(catalogItem);
      } else {
        categories.push({
          name: record.content.category,
          items: [catalogItem]
        });
      }

      return categories;
    }, [])
  };
}

export const seedBookCatalog = buildBookCatalog(seedBookRecords);

export function findSeedBookByPath(path: string) {
  const normalizedPath = decodeURIComponent(path).replace(/^\/+/, "");
  return seedBookRecords.find((record) => record.path === normalizedPath)?.content ?? null;
}
