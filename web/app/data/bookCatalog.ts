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

type BookRecord = {
  path: string;
  content: BookContent;
};

export const bookRecords: BookRecord[] = [
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
  }
];

export const bookCatalog = {
  categories: bookRecords.reduce<BookCatalogCategory[]>((categories, record) => {
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

export function findBookByPath(path: string) {
  const normalizedPath = decodeURIComponent(path).replace(/^\/+/, "");
  return bookRecords.find((record) => record.path === normalizedPath)?.content ?? null;
}
