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
    path: "bible/yearly-memory-verses-bilingual.json",
    content: {
      id: "15620CCA-CAAA-45F9-A740-319AE650C7B8",
      title: "全年背诵经文（中英文）",
      category: "圣经",
      content: [
        "中文背诵经文",
        "January 以弗所书 6:12-18\u2028因我们并不是与属血气的争战，乃是与那些执政的、掌权的、管辖这幽暗世界的，以及天空属灵气的恶魔争战。\u2028所以，要拿起神所赐的全副军装，好在磨难的日子抵挡仇敌，并且成就了一切，还能站立得住。\u2028所以要站稳了，用真理当作带子束腰，用公义当作护心镜遮胸，\u2028又用平安的福音当作预备走路的鞋穿在脚上。\u2028此外，又拿着信德当作藤牌，可以灭尽那恶者一切的火箭；\u2028并戴上救恩的头盔，拿着圣灵的宝剑，就是神的道；\u2028靠着圣灵，随时多方祷告祈求；并要在此警醒不倦，为众圣徒祈求。",
        "February 腓立比书 3:10-14\u2028使我认识基督，晓得他复活的大能，并且晓得和他一同受苦，效法他的死，\u2028或者我也得以从死里复活。\u2028这不是说我已经得着了，已经完全了；我乃是竭力追求，或者可以得着基督耶稣所以得着我的。\u2028弟兄们，我不是以为自己已经得着了；我只有一件事，就是忘记背后，努力面前的，\u2028向着标竿直跑，要得神在基督耶稣里从上面召我来得的奖赏。",
        "March 马太福音 5:3-10\u2028虚心的人有福了！因为天国是他们的。\u2028哀恸的人有福了！因为他们必得安慰。\u2028温柔的人有福了！因为他们必承受地土。\u2028饥渴慕义的人有福了！因为他们必得饱足。\u2028怜恤人的人有福了！因为他们必蒙怜恤。\u2028清心的人有福了！因为他们必得见神。\u2028使人和睦的人有福了！因为他们必称为神的儿子。\u2028为义受逼迫的人有福了！因为天国是他们的。",
        "April 彼得前书 2:21-25\u2028你们蒙召原是为此；因基督也为你们受过苦，给你们留下榜样，叫你们跟随他的脚踪行。\u2028他并没有犯罪，口里也没有诡诈。\u2028他被骂不还口，受害不说威吓的话，只将自己交托那按公义审判人的主。\u2028他被挂在木头上，亲身担当了我们的罪，使我们既然在罪上死，就得以在义上活。因他受的鞭伤，你们便得了医治。\u2028你们从前好像迷路的羊，如今却归到你们灵魂的牧人监督了。",
        "May 启示录 22:1-5\u2028天使又指示我在城内街道当中一道生命水的河，明亮如水晶，从神和羔羊的宝座流出来。\u2028在河这边与那边有生命树，结十二样果子，每月都结果子；树上的叶子乃为医治万民。\u2028以后再没有咒诅；在城里有神和羔羊的宝座；他的仆人都要事奉他。\u2028也要见他的面；他的名字必写在他们的额上。\u2028不再有黑夜；他们也不用灯光、日光，因为主神要光照他们；他们要作王，直到永永远远。",
        "June 以弗所书 4:11-16\u2028他所赐的，有使徒，有先知，有传福音的，有牧师和教师，\u2028为要成全圣徒，各尽其职，建立基督的身体，\u2028直等到我们众人在真道上同归于一，认识神的儿子，得以长大成人，满有基督长成的身量，\u2028使我们不再作小孩子，中了人的诡计和欺骗的法术，被一切异教之风摇动，飘来飘去，就随从各样的异端；\u2028惟用爱心说诚实话，凡事长进，连于元首基督，\u2028全身都靠他联络得合式，百节各按各职，照着各体的功用彼此相助，便叫身体渐渐增长，在爱中建立自己。",
        "July 腓立比书 2:1-5\u2028所以，在基督里若有什么劝勉，爱心有什么安慰，圣灵有什么交通，心中有什么慈悲怜悯，\u2028你们就要意念相同，爱心相同，有一样的心思，有一样的意念，使我的喜乐可以满足。\u2028凡事不可结党，不可贪图虚浮的荣耀；只要存心谦卑，各人看别人比自己强。\u2028各人不要单顾自己的事，也要顾别人的事。\u2028你们当以基督耶稣的心为心；",
        "August 希伯来书 11:1-6\u2028信就是所望之事的实底，是未见之事的确据。\u2028古人在这信上得了美好的证据。\u2028我们因着信，就知道诸世界是借神话造成的；这样，所看见的，并不是从显然之物造出来的。\u2028亚伯因着信，献祭与神，比该隐所献的更美，因此便得了称义的见证，就是神指他礼物作的见证。他虽然死了，却因这信，仍旧说话。\u2028以诺因着信，被接去，不至于见死，人也找不着他，因为神已经把他接去了；只是他被接去以先，已经得了神喜悦他的明证。\u2028人非有信，就不能得神的喜悦；因为到神面前来的人必须信有神，且信他赏赐那寻求他的人。",
        "September 以赛亚书 43:15-19\u2028我是耶和华你们的圣者，是创造以色列的，是你们的君王。\u2028耶和华在沧海中开道，在大水中开路，\u2028使车辆、马匹、军兵、勇士都出来，一同躺下，不再起来；他们灭没，好像熄灭的灯火。\u2028耶和华如此说：你们不要记念从前的事，也不要思想古时的事。\u2028看哪，我要做一件新事；如今要发现，你们岂不知道吗？我必在旷野开道路，在沙漠开江河。",
        "October 哥林多后书 9:6-11\u2028少种的少收，多种的多收，这话是真的。\u2028各人要随本心所酌定的，不要作难，不要勉强，因为捐得乐意的人是神所喜爱的。\u2028神能将各样的恩惠多多地加给你们，使你们凡事常常充足，能多行各样善事。\u2028如经上所记：他施舍钱财，周济贫穷；他的仁义存到永远。\u2028那赐种给撒种的，赐粮给人吃的，必多多加给你们种地的种子，又增添你们仁义的果子；\u2028叫你们凡事富足，可以多多施舍，就借着我们使感谢归于神。",
        "November 诗篇 23:1-6\u2028耶和华是我的牧者，我必不致缺乏。\u2028他使我躺卧在青草地上，领我在可安歇的水边。\u2028他使我的灵魂苏醒，为自己的名引导我走义路。\u2028我虽然行过死荫的幽谷，也不怕遭害，因为你与我同在；你的杖，你的竿，都安慰我。\u2028在我敌人面前，你为我摆设筵席；你用油膏了我的头，使我的福杯满溢。\u2028我一生一世必有恩惠慈爱随着我；我且要住在耶和华的殿中，直到永远。",
        "December 马太福音 6:9-13\u2028所以，你们祷告要这样说：我们在天上的父：愿人都尊你的名为圣。\u2028愿你的国降临；愿你的旨意行在地上，如同行在天上。\u2028我们日用的饮食，今日赐给我们。\u2028免我们的债，如同我们免了人的债。\u2028不叫我们遇见试探；救我们脱离凶恶。因为国度、权柄、荣耀，全是你的，直到永远。阿们！",
        "English Memory Verses",
        "January Ephesians 6:12-18\u2028For we do not wrestle against flesh and blood, but against the\u2028rulers, against the authorities, against the cosmic powers over\u2028this present darkness, against the spiritual forces of evil in the\u2028heavenly places.\u2028Therefore take up the whole armor of God, that you may be\u2028able to withstand in the evil day, and having done all, to stand\u2028firm.\u2028Stand therefore, having fastened on the belt of truth, and\u2028having put on the breastplate of righteousness,\u2028and, as shoes for your feet, having put on the readiness given\u2028by the gospel of peace.\u2028In all circumstances take up the shield of faith, with which\u2028you can extinguish all the flaming darts of the evil one;\u2028and take the helmet of salvation, and the sword of the Spirit,\u2028which is the word of God,\u2028praying at all times in the Spirit, with all prayer and\u2028supplication. To that end, keep alert with all perseverance,\u2028making supplication for all the saints.",
        "February Philippians 3:10-14\u2028that I may know him and the power of his resurrection, and\u2028may share his sufferings, becoming like him in his death,\u2028that by any means possible I may attain the resurrection\u2028from the dead.\u2028Not that I have already obtained this or am already perfect,\u2028but I press on to make it my own, because Christ Jesus has\u2028made me his own.\u2028Brothers, I do not consider that I have made it my own. But\u2028one thing I do: forgetting what lies behind and straining forward\u2028to what lies ahead,\u2028I press on toward the goal for the prize of the upward call of\u2028God in Christ Jesus.",
        "March Matthew 5:3-10\u2028“Blessed are the poor in spirit, for theirs is the kingdom of\u2028heaven.\u2028\"Blessed are those who mourn, for they shall be comforted.\u2028\"Blessed are the meek, for they shall inherit the earth.\u2028“Blessed are those who hunger and thirst for righteousness,\u2028for they shall be satisfied.\u2028“Blessed are the merciful, for they shall receive mercy.\u2028“Blessed are the pure in heart, for they shall see God.\u2028“Blessed are the peacemakers, for they shall be called sons of\u2028God.\u2028“Blessed are those who are persecuted for righteousness'\u2028sake, for theirs is the kingdom of heaven.",
        "April 1 Peter 2:21-25\u2028For to this you have been called, because Christ also suffered for you, leaving you an example, so that you might follow in his steps.\u2028He committed no sin, neither was deceit found in his mouth.\u2028When he was reviled, he did not revile in return; when he suffered, he did not threaten, but continued entrusting himself to him who judges justly.\u2028He himself bore our sins in his body on the tree, that we might die to sin and live to righteousness. By his wounds you have been healed.\u2028For you were straying like sheep, but have now returned to the Shepherd and Overseer of your souls.",
        "May Revelation 22:1-5\u2028Then the angel showed me the river of the water of life, bright as crystal, flowing from the throne of God and of the Lamb \u2028through the middle of the street of the city; also, on either side of the river, the tree of life with its twelve kinds of fruit, yielding its fruit each month. The leaves of the tree were for the healing of the nations. \u2028No longer will there be anything accursed, but the throne of God and of the Lamb will be in it, and his servants will worship him. \u2028They will see his face, and his name will be on their foreheads. \u2028And night will be no more. They will need no light of lamp or sun, for the Lord God will be their light, and they will reign forever and ever.",
        "June Ephesians 4:11-16\u2028And he gave the apostles, the prophets, the evangelists, the shepherds and teachers,\u2028to equip the saints for the work of ministry, for building up the body of Christ,\u2028until we all attain to the unity of the faith and of the knowledge of the Son of God, to mature manhood, to the measure of the stature of the fullness of Christ,\u2028so that we may no longer be children, tossed to and fro by the waves and carried about by every wind of doctrine, by human cunning, by craftiness in deceitful schemes.\u2028Rather, speaking the truth in love, we are to grow up in every way into him who is the head, into Christ,\u2028from whom the whole body, joined and held together by every joint with which it is equipped, when each part is working properly, makes the body grow so that it builds itself up in love.",
        "July Philippians 2:1-5\u2028So if there is any encouragement in Christ, any comfort from love, any participation in the Spirit, any affection and sympathy,\u2028complete my joy by being of the same mind, having the same love, being in full accord and of one mind.\u2028Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves.\u2028Let each of you look not only to his own interests, but also to the interests of others.\u2028Have this mind among yourselves, which is yours in Christ Jesus.",
        "August Hebrews 11:1-6\u2028Now faith is the assurance of things hoped for, the conviction\u2028of things not seen.\u2028For by it the people of old received their commendation.\u2028By faith we understand that the universe was created by the\u2028word of God, so that what is seen was not made out of things\u2028that are visible.\u2028By faith Abel offered to God a more acceptable sacrifice than\u2028Cain, through which he was commended as righteous, God\u2028commending him by accepting his gifts. And through his faith,\u2028though he died, he still speaks.\u2028By faith Enoch was taken up so that he should not see death,\u2028and he was not found, because God had taken him. Now before\u2028he was taken he was commended as having pleased God.\u2028And without faith it is impossible to please him, for whoever\u2028would draw near to God must believe that he exists and that he\u2028rewards those who seek him.",
        "September Isaiah 43:15-19\u2028I am the Lord, your Holy One, the Creator of Israel, your\u2028King.\"\u2028Thus says the Lord, who makes a way in the sea,\u2028a path in the mighty waters,\u2028who brings forth chariot and horse, army and warrior; they\u2028lie down, they cannot rise, they are extinguished, quenched like\u2028a wick:\u2028“Remember not the former things, nor consider the things of\u2028old.\u2028Behold, I am doing a new thing; now it springs forth, do you\u2028not perceive it? I will make a way in the wilderness and rivers in\u2028the desert.",
        "October 2 Corinthians 9:6-11\u2028The point is this: whoever sows sparingly will also reap\u2028sparingly, and whoever sows bountifully will also reap\u2028bountifully.\u2028Each one must give as he has decided in his heart, not\u2028reluctantly or under compulsion, for God loves a cheerful giver.\u2028And God is able to make all grace abound to you, so that\u2028having all sufficiency in all things at all times, you may abound\u2028in every good work.\u2028As it is written, “He has distributed freely, he has given to the\u2028poor; his righteousness endures forever.\"\u2028He who supplies seed to the sower and bread for food will supply and multiply your seed for sowing and increase the harvest of your righteousness.\u2028You will be enriched in every way to be generous in every\u2028way, which through us will produce thanksgiving to God.",
        "November Psalm 23:1-6\u2028The Lord is my shepherd; I shall not want.\u2028He makes me lie down in green pastures. He leads me beside\u2028still waters.\u2028He restores my soul. He leads me in paths of righteousness for\u2028his name's sake.\u2028Even though I walk through the valley of the shadow of death,\u2028I will fear no evil, for you are with me; your rod and your staff,\u2028they comfort me.\u2028You prepare a table before me in the presence of my enemies;\u2028you anoint my head with oil; my cup overflows.\u2028Surely goodness and mercy shall follow me all the days of my\u2028life, and I shall dwell in the house of the Lord forever.",
        "December Matthew 6:9-13\u2028Pray then like this: “Our Father in heaven, hallowed be your\u2028name.\u2028Your kingdom come, your will be done, on earth as it is in\u2028heaven.\u2028Give us this day our daily bread,\u2028and forgive us our debts, as we also have forgiven our\u2028debtors.\u2028And lead us not into temptation, but deliver us from evil."
      ].join("\n\n"),
      createdAt: "2026-09-18T00:00:00Z",
      updatedAt: "2026-09-18T00:00:00Z"
    }
  },
  {
    path: "bible/john-3-16.json",
    content: {
      id: "0F49C058-A8CE-4E9C-8E91-9B5C1DB77BB2",
      title: "约翰福音 3:16",
      category: "圣经",
      content:
        "约翰福音 3:16\n\n神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。\n\nJohn 3:16\n\nFor God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.\n\n背诵提示：先记住“神爱世人”，再接着背“赐下独生子”和“信的人得永生”。",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-09-18T00:00:00Z"
    }
  },
  {
    path: "bible/proverbs-3-5.json",
    content: {
      id: "6678C2C4-1032-4F90-A5C4-13C88168F14B",
      title: "箴言 3:5",
      category: "圣经",
      content:
        "箴言 3:5\n\n你要专心仰赖耶和华，不可倚靠自己的聪明。\n\nProverbs 3:5\n\nTrust in the LORD with all thine heart; and lean not unto thine own understanding.\n\n背诵提示：分成两句背：“专心仰赖耶和华”，“不可倚靠自己的聪明”。",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-09-18T00:00:00Z"
    }
  },
  {
    path: "bible/philippians-4-13.json",
    content: {
      id: "8C916B91-45B9-4819-A922-E28191ED827C",
      title: "腓立比书 4:13",
      category: "圣经",
      content:
        "腓立比书 4:13\n\n我靠着那加给我力量的，凡事都能做。\n\nPhilippians 4:13\n\nI can do all things through Christ which strengtheneth me.\n\n背诵提示：先背“我靠着那加给我力量的”，再背“凡事都能做”。",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-09-18T00:00:00Z"
    }
  },
  {
    path: "bible/psalm-23-1.json",
    content: {
      id: "DC118137-6AB7-4C22-9E41-5C0665C3AF40",
      title: "诗篇 23:1",
      category: "圣经",
      content:
        "诗篇 23:1\n\n耶和华是我的牧者，我必不至缺乏。\n\nPsalm 23:1\n\nThe LORD is my shepherd; I shall not want.\n\n背诵提示：把“耶和华是我的牧者”和“我必不至缺乏”连起来背。",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-09-18T00:00:00Z"
    }
  },
  {
    path: "bible/psalm-119-105.json",
    content: {
      id: "5BC2BA5A-383D-4313-82CF-D22ECA064656",
      title: "诗篇 119:105",
      category: "圣经",
      content:
        "诗篇 119:105\n\n你的话是我脚前的灯，是我路上的光。\n\nPsalm 119:105\n\nThy word is a lamp unto my feet, and a light unto my path.\n\n背诵提示：想象一盏灯照在脚前，再照亮前面的路。",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-09-18T00:00:00Z"
    }
  },
  {
    path: "bible/matthew-5-16.json",
    content: {
      id: "43C74F86-B3BE-4382-BD37-3647B9D3D9B6",
      title: "马太福音 5:16",
      category: "圣经",
      content:
        "马太福音 5:16\n\n你们的光也当这样照在人前，叫他们看见你们的好行为，便将荣耀归给你们在天上的父。\n\nMatthew 5:16\n\nLet your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.\n\n背诵提示：按顺序记“光照在人前”“看见好行为”“荣耀天父”。",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-09-18T00:00:00Z"
    }
  },
  {
    path: "bible/ephesians-4-32.json",
    content: {
      id: "A7C88BB1-8F49-4B0C-8C24-49E5EC694B1C",
      title: "以弗所书 4:32",
      category: "圣经",
      content:
        "以弗所书 4:32\n\n并要以恩慈相待，存怜悯的心，彼此饶恕，正如神在基督里饶恕了你们一样。\n\nEphesians 4:32\n\nAnd be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.\n\n背诵提示：抓住三个动作：“恩慈相待”“存怜悯的心”“彼此饶恕”。",
      createdAt: "2026-07-01T00:00:00Z",
      updatedAt: "2026-09-18T00:00:00Z"
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
