/**
 * WEEKLY INSPIRATION DATA FOR REBERWET JUNIOR SECONDARY SCHOOL
 * Contains 52 complete weeks of varied, school-appropriate, non-academic inspiration
 * across 5 categories:
 * 1. Funny Thought of the Week (clean humor on school life, routines, friendship, time)
 * 2. Motivation of the Week (courage, discipline, kindness, confidence, responsibility)
 * 3. Verse/Wisdom of the Week (Bible verse with reference or timeless wisdom)
 * 4. Question to Think About (character, integrity, friendship, choices)
 * 5. Challenge of the Week (practical, actionable kindness, discipline, community)
 */

export interface WeeklyInspirationItem {
  weekNumber: number;
  funnyThought: string;
  motivation: string;
  verseOrWisdom: string;
  verseReference?: string;
  questionToThinkAbout: string;
  challengeOfTheWeek: string;
}

export const WEEKLY_INSPIRATION_52: WeeklyInspirationItem[] = [
  {
    weekNumber: 1,
    funnyThought: "Don't blame the alarm clock. You were the one who negotiated for 'just five more minutes' three times!",
    motivation: "Small progress every single day adds up to big results over time. Never despise small beginnings.",
    verseOrWisdom: "A gentle answer turns away wrath, but a harsh word stirs up anger.",
    verseReference: "Proverbs 15:1",
    questionToThinkAbout: "Would you still do the right thing even if nobody would ever find out what you did?",
    challengeOfTheWeek: "Do one kind thing for a classmate or teacher this week without expecting anything in return.",
  },
  {
    weekNumber: 2,
    funnyThought: "My ruler told me that patience is measured in millimeters, but my stomach before break time disagrees.",
    motivation: "Discipline is choosing between what you want now and what you want most in the future.",
    verseOrWisdom: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    verseReference: "Galatians 6:9",
    questionToThinkAbout: "Is being popular the same thing as being respected by those who know you best?",
    challengeOfTheWeek: "Keep your desk and classroom surroundings completely clean throughout this whole week.",
  },
  {
    weekNumber: 3,
    funnyThought: "The speed of sound is fast, but the speed of learners packing their bags when the bell rings is supersonic.",
    motivation: "Courage does not always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
    verseOrWisdom: "Trust in the Lord with all your heart, and lean not on your own understanding.",
    verseReference: "Proverbs 3:5",
    questionToThinkAbout: "What is one simple thing you could change this term to make our school an even friendlier place?",
    challengeOfTheWeek: "Encourage someone in your class who seems discouraged or quiet today.",
  },
  {
    weekNumber: 4,
    funnyThought: "Whoever invented the eraser knew that humans are allowed to make mistakes and start fresh.",
    motivation: "Your character is what you do when you think nobody is watching you.",
    verseOrWisdom: "Commit your work to the Lord, and your plans will be established.",
    verseReference: "Proverbs 16:3",
    questionToThinkAbout: "If your words were printed on a t-shirt for everyone to read, would you be proud to wear it?",
    challengeOfTheWeek: "Spend the entire day avoiding any unnecessary argument or complaints.",
  },
  {
    weekNumber: 5,
    funnyThought: "Nothing makes a pen vanish faster into thin air than lending it to a classmate during Period 1.",
    motivation: "Kindness is a language which the deaf can hear and the blind can see.",
    verseOrWisdom: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
    verseReference: "Colossians 3:23",
    questionToThinkAbout: "What does it mean to be a dependable friend when things get tough?",
    challengeOfTheWeek: "Apologise sincerely to someone you might have offended or spoken rudely to recently.",
  },
  {
    weekNumber: 6,
    funnyThought: "The brain is an amazing organ; it works 24 hours a day until the teacher calls on you to answer.",
    motivation: "Mistakes are proof that you are trying. An expert was once a beginner who refused to quit.",
    verseOrWisdom: "Iron sharpens iron, and one person sharpens another.",
    verseReference: "Proverbs 27:17",
    questionToThinkAbout: "How do your daily habits right now reflect the person you want to become tomorrow?",
    challengeOfTheWeek: "Help a younger learner or classmate with an assignment or carry their books.",
  },
  {
    weekNumber: 7,
    funnyThought: "A clean notebook on Monday morning gives the illusion that our lives are completely organized.",
    motivation: "Leadership is not about being in charge; it is about taking care of those in your charge.",
    verseOrWisdom: "Be completely humble and gentle; be patient, bearing with one another in love.",
    verseReference: "Ephesians 4:2",
    questionToThinkAbout: "Are you listening to understand others, or just waiting for your turn to speak?",
    challengeOfTheWeek: "Say 'Thank you' with a genuine smile to school support staff, cook, or groundskeeper.",
  },
  {
    weekNumber: 8,
    funnyThought: "Math teachers love finding X. We should probably give X some privacy by now.",
    motivation: "Confidence comes not from always being right, but from not fearing to be wrong.",
    verseOrWisdom: "The heart of the discerning acquires knowledge, for the ears of the wise seek it out.",
    verseReference: "Proverbs 18:15",
    questionToThinkAbout: "If you had the power to make one school rule that everyone must follow, what would it be?",
    challengeOfTheWeek: "Pick up at least five pieces of litter around the school grounds and dispose of them properly.",
  },
  {
    weekNumber: 9,
    funnyThought: "If you borrow a pencil, please return it before the next academic year begins!",
    motivation: "Respect is earned through consistency, honesty, and how you treat those who can do nothing for you.",
    verseOrWisdom: "Do to others as you would have them do to you.",
    verseReference: "Luke 6:31",
    questionToThinkAbout: "What makes someone truly wealthy in life: what they own, or who they help?",
    challengeOfTheWeek: "Sit with someone during lunch or break who is sitting by themselves.",
  },
  {
    weekNumber: 10,
    funnyThought: "Common sense is like deodorant; the people who need it most rarely seem to use it!",
    motivation: "Responsibility means owning your actions today so you don't make excuses tomorrow.",
    verseOrWisdom: "The tongue has the power of life and death, and those who love it will eat its fruit.",
    verseReference: "Proverbs 18:21",
    questionToThinkAbout: "How does the way you speak about people when they are absent show who you really are?",
    challengeOfTheWeek: "Do not speak ill or gossip about anyone behind their back for the next seven days.",
  },
  {
    weekNumber: 11,
    funnyThought: "Dear homework, I don't remember inviting you home for the weekend. Please respect my boundary.",
    motivation: "Do not wait for extraordinary circumstances to do good action; try to use ordinary situations.",
    verseOrWisdom: "Above all else, guard your heart, for everything you do flows from it.",
    verseReference: "Proverbs 4:23",
    questionToThinkAbout: "What is something hard you accomplished that you are genuinely proud of?",
    challengeOfTheWeek: "Arrive at school and every lesson at least three minutes early all week long.",
  },
  {
    weekNumber: 12,
    funnyThought: "My teacher said 'Follow your dreams,' so I closed my eyes and laid my head on my desk.",
    motivation: "Perseverance is failing nineteen times and succeeding the twentieth time.",
    verseOrWisdom: "I can do all this through Him who gives me strength.",
    verseReference: "Philippians 4:13",
    questionToThinkAbout: "When you disagree with someone, do you attack their opinion or do you attack the person?",
    challengeOfTheWeek: "Offer to wipe the chalkboard or organize the teacher's table after class.",
  },
  {
    weekNumber: 13,
    funnyThought: "Why did the student eat his homework? Because the teacher said it was a piece of cake!",
    motivation: "Integrity is doing the right thing, even when the wrong thing is convenient and easy.",
    verseOrWisdom: "He has shown you, O mortal, what is good: to act justly, to love mercy, and to walk humbly.",
    verseReference: "Micah 6:8",
    questionToThinkAbout: "Who is one person in your community who inspires you by their quiet dedication?",
    challengeOfTheWeek: "Write a short note of appreciation to a parent, guardian, or sibling.",
  },
  {
    weekNumber: 14,
    funnyThought: "Some people look for a beautiful place. Others make a place beautiful by picking up their rubbish.",
    motivation: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    verseOrWisdom: "A friend loves at all times, and a brother is born for a time of adversity.",
    verseReference: "Proverbs 17:17",
    questionToThinkAbout: "What is the difference between giving up and knowing when to seek help?",
    challengeOfTheWeek: "Ask a teacher or mentor for guidance in an area where you feel you need improvement.",
  },
  {
    weekNumber: 15,
    funnyThought: "I told my dog that homework was tasty, but he refused to eat it. Even dogs have standards.",
    motivation: "You don't have to be great to start, but you have to start to become great.",
    verseOrWisdom: "The Lord is my shepherd; I lack nothing.",
    verseReference: "Psalm 23:1",
    questionToThinkAbout: "If today were your last day at Reberwet JSS, how would you want your teachers to remember you?",
    challengeOfTheWeek: "Compliment three different people this week on their effort or positive attitude.",
  },
  {
    weekNumber: 16,
    funnyThought: "The hardest part of a group project is pretending that all group members contributed equally.",
    motivation: "Cooperation is the thorough conviction that nobody can get there unless everybody gets there.",
    verseOrWisdom: "Two are better than one, because they have a good return for their labor.",
    verseReference: "Ecclesiastes 4:9",
    questionToThinkAbout: "How does teamwork make you a stronger person than trying to do everything alone?",
    challengeOfTheWeek: "Be the first to step forward and do the hardest part of a class chore or group activity.",
  },
  {
    weekNumber: 17,
    funnyThought: "If you think nobody cares if you are alive, try missing a single library book deadline.",
    motivation: "Focus on being productive instead of just being busy.",
    verseOrWisdom: "Plans fail for lack of counsel, but with many advisers they succeed.",
    verseReference: "Proverbs 15:22",
    questionToThinkAbout: "What is one distraction you can remove from your study routine to gain clearer focus?",
    challengeOfTheWeek: "Read an inspiring book, article, or chapter in the school library for 30 uninterrupted minutes.",
  },
  {
    weekNumber: 18,
    funnyThought: "The shortest distance between two points in school is the line between the bell and the canteen!",
    motivation: "Self-control is strength. Right thought is mastery. Calmness is power.",
    verseOrWisdom: "Better a patient person than a warrior, one with self-control than one who takes a city.",
    verseReference: "Proverbs 16:32",
    questionToThinkAbout: "What triggers your anger, and how can you respond with calm wisdom instead of shouting?",
    challengeOfTheWeek: "Count to ten and take a deep breath before responding when someone frustrates you.",
  },
  {
    weekNumber: 19,
    funnyThought: "I am on a seafood diet. Every time I see food, I eat it... especially when it's lunch break!",
    motivation: "Gratitude turns what we have into enough, and more.",
    verseOrWisdom: "Give thanks in all circumstances; for this is God's will for you.",
    verseReference: "1 Thessalonians 5:18",
    questionToThinkAbout: "What are three simple blessings you often take for granted each morning?",
    challengeOfTheWeek: "Before going to sleep each night this week, name three things you are thankful for.",
  },
  {
    weekNumber: 20,
    funnyThought: "Why did the computer go to the nurse? Because it had a bad virus and needed some rest!",
    motivation: "Technology is a useful servant but a dangerous master. Use it to build, not to waste time.",
    verseOrWisdom: "Teach us to number our days, that we may gain a heart of wisdom.",
    verseReference: "Psalm 90:12",
    questionToThinkAbout: "How much time do you spend scrolling vs how much time you spend building real friendships?",
    challengeOfTheWeek: "Put away screens and phone games for an entire afternoon and spend it in conversation or sport.",
  },
  {
    weekNumber: 21,
    funnyThought: "My backpack weighs 15 kilos. I am not just studying CBC; I am doing Olympic weightlifting!",
    motivation: "Strength does not come from winning. Your struggles develop your strengths.",
    verseOrWisdom: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
    verseReference: "Isaiah 40:31",
    questionToThinkAbout: "What difficulty in your life has taught you the greatest lesson so far?",
    challengeOfTheWeek: "Help a classmate carry their heavy bag or shared school sports equipment without being asked.",
  },
  {
    weekNumber: 22,
    funnyThought: "I lost my pen: no pen = no notes, no notes = no study, no study = fail... moral: guard your pen!",
    motivation: "Preparedness is the key to confidence. When you prepare well, fear fades away.",
    verseOrWisdom: "Go to the ant, you sluggard; consider its ways and be wise!",
    verseReference: "Proverbs 6:6",
    questionToThinkAbout: "What does putting off a task until tomorrow really cost you in peace of mind?",
    challengeOfTheWeek: "Pack your school bag and uniform the evening before instead of rushing in the morning.",
  },
  {
    weekNumber: 23,
    funnyThought: "Teacher: 'Why are you late?' Student: 'Because the bell rang before I arrived!'",
    motivation: "Punctuality is not just about being on time; it is a declaration of respect for other people's time.",
    verseOrWisdom: "There is a time for everything, and a season for every activity under the heavens.",
    verseReference: "Ecclesiastes 3:1",
    questionToThinkAbout: "How does being late or early affect your self-confidence before a lesson starts?",
    challengeOfTheWeek: "Ensure you are present at the morning school assembly at least 5 minutes before the bell.",
  },
  {
    weekNumber: 24,
    funnyThought: "Some people drink coffee to wake up. I just wait for the teacher to say 'Pop Quiz!'",
    motivation: "Diligence is the mother of good luck, and God gives all things to industry.",
    verseOrWisdom: "Lazy hands make for poverty, but diligent hands bring wealth.",
    verseReference: "Proverbs 10:4",
    questionToThinkAbout: "Do you rely on luck or on hard work when facing a challenging task?",
    challengeOfTheWeek: "Complete a challenging revision task before touching any recreation or leisure this week.",
  },
  {
    weekNumber: 25,
    funnyThought: "Parallel lines have so much in common. It is truly a shame that they will never meet.",
    motivation: "Empathy is seeing with the eyes of another, listening with the ears of another, and feeling with the heart of another.",
    verseOrWisdom: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.",
    verseReference: "Ephesians 4:32",
    questionToThinkAbout: "When was the last time you put yourself in another person's shoes before judging them?",
    challengeOfTheWeek: "Reach out to someone who seems lonely or left out on the playground.",
  },
  {
    weekNumber: 26,
    funnyThought: "I told the doctor I broke my arm in two places. He told me to stop going to those places.",
    motivation: "Avoid people and places that drain your peace and encourage foolish decisions.",
    verseOrWisdom: "Walk with the wise and become wise, for a companion of fools suffers harm.",
    verseReference: "Proverbs 13:20",
    questionToThinkAbout: "Are your closest friends pulling you towards your goals or pulling you away from them?",
    challengeOfTheWeek: "Choose your company wisely this week and encourage a friend to make positive choices.",
  },
  {
    weekNumber: 27,
    funnyThought: "History is easy to learn. It's making history that makes your feet tired!",
    motivation: "You are not here merely to make a living; you are here to enable the world to live more amply.",
    verseOrWisdom: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.",
    verseReference: "Matthew 5:16",
    questionToThinkAbout: "What is one positive mark you want to leave on Reberwet Junior Secondary School?",
    challengeOfTheWeek: "Plant a flower or tree seedling, or water the school garden during your break.",
  },
  {
    weekNumber: 28,
    funnyThought: "My wallet is like an onion: opening it makes me cry, especially at the school canteen!",
    motivation: "Honesty is the fastest way to prevent a mistake from turning into a failure.",
    verseOrWisdom: "The integrity of the upright guides them, but the unfaithful are destroyed by their duplicity.",
    verseReference: "Proverbs 11:3",
    questionToThinkAbout: "Why is an uncomfortable truth always better than a comfortable lie?",
    challengeOfTheWeek: "If you find any lost property in school, hand it over immediately to the office or teacher on duty.",
  },
  {
    weekNumber: 29,
    funnyThought: "Why do we press the elevator button harder when we are in a hurry? Does it make it faster?",
    motivation: "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.",
    verseOrWisdom: "Be joyful in hope, patient in affliction, faithful in prayer.",
    verseReference: "Romans 12:12",
    questionToThinkAbout: "When you have to wait in a queue or wait for your turn, how do you handle your emotions?",
    challengeOfTheWeek: "Patiently allow someone else to go ahead of you in a line or at the water tap.",
  },
  {
    weekNumber: 30,
    funnyThought: "A dictionary is the only place where success comes before work.",
    motivation: "There are no shortcuts to any place worth going. Sweat and sacrifice pave the road.",
    verseOrWisdom: "All hard work brings a profit, but mere talk leads only to poverty.",
    verseReference: "Proverbs 14:23",
    questionToThinkAbout: "Are you talking more about what you will do, or actually doing the quiet work?",
    challengeOfTheWeek: "Dedicate 45 minutes to quiet private study without checking notifications or talking.",
  },
  {
    weekNumber: 31,
    funnyThought: "I'm not saying I'm lazy, but I once turned off the light switch by throwing my shoe at it.",
    motivation: "Overcoming laziness begins with taking the very first physical step, no matter how small.",
    verseOrWisdom: "The soul of the sluggard craves and gets nothing, while the soul of the diligent is richly supplied.",
    verseReference: "Proverbs 13:4",
    questionToThinkAbout: "What is one chore at home or school you have been putting off that you can finish right now?",
    challengeOfTheWeek: "Volunteer for the sweepers or chalk squad without being selected by the class teacher.",
  },
  {
    weekNumber: 32,
    funnyThought: "Never judge a book by its cover... unless it's a science textbook with 600 pages!",
    motivation: "Curiosity is the engine of achievement. Never lose the courage to ask 'Why?' and 'How?'",
    verseOrWisdom: "For the Lord gives wisdom; from his mouth come knowledge and understanding.",
    verseReference: "Proverbs 2:6",
    questionToThinkAbout: "When was the last time you asked a meaningful question out of genuine desire to learn?",
    challengeOfTheWeek: "Ask one thoughtful, curious question in class this week to deepen your understanding.",
  },
  {
    weekNumber: 33,
    funnyThought: "Money can't buy happiness, but it can buy mandazi at break time, and that's practically the same.",
    motivation: "Contentment is not having everything you want, but realizing you have enough to be thankful.",
    verseOrWisdom: "Keep your lives free from the love of money and be content with what you have.",
    verseReference: "Hebrews 13:5",
    questionToThinkAbout: "How often do you compare what you have with what others have, and how does it make you feel?",
    challengeOfTheWeek: "Share a portion of your snack or stationery with someone who forgot theirs today.",
  },
  {
    weekNumber: 34,
    funnyThought: "If you speak when angry, you will make the best speech you will ever regret.",
    motivation: "The tongue has no bones, but it is strong enough to break a heart. Be careful with your words.",
    verseOrWisdom: "Those who guard their lips preserve their lives, but those who speak rashly will come to ruin.",
    verseReference: "Proverbs 13:3",
    questionToThinkAbout: "Have you ever spoken an unkind word in anger that you still wish you could take back?",
    challengeOfTheWeek: "Choose silent reflection instead of an angry reply if someone provokes you this week.",
  },
  {
    weekNumber: 35,
    funnyThought: "A clean desk is a sign of a cluttered drawer. Let's not inspect the drawer!",
    motivation: "Order in your environment creates peace in your mind. Clean spaces foster clear thinking.",
    verseOrWisdom: "Everything should be done in a fitting and orderly way.",
    verseReference: "1 Corinthians 14:40",
    questionToThinkAbout: "How does an untidy study area affect your ability to concentrate on difficult topics?",
    challengeOfTheWeek: "Organize your school locker, desk, or bag until everything has a neat, dedicated place.",
  },
  {
    weekNumber: 36,
    funnyThought: "Why do birds fly south for winter? Because walking would take way too long!",
    motivation: "Adaptability is the greatest quality of thriving human beings. Embrace positive change.",
    verseOrWisdom: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.",
    verseReference: "Romans 12:2",
    questionToThinkAbout: "When rules or routines change, do you complain or do you adapt and make the best of it?",
    challengeOfTheWeek: "Welcome a change in your routine with enthusiasm and a constructive, positive attitude.",
  },
  {
    weekNumber: 37,
    funnyThought: "I told my shoes to take me to the library, but they walked straight to the sports pitch.",
    motivation: "Physical exercise nourishes the brain as much as reading nourishes the mind. Keep moving!",
    verseOrWisdom: "For physical training is of some value, but godliness has value for all things.",
    verseReference: "1 Timothy 4:8",
    questionToThinkAbout: "Are you taking good care of your physical body with adequate sleep, clean water, and exercise?",
    challengeOfTheWeek: "Drink plenty of water every day and participate actively in games and physical education.",
  },
  {
    weekNumber: 38,
    funnyThought: "If a tomato is technically a fruit, then ketchup is essentially a smoothie!",
    motivation: "Perspective changes everything. How you look at a problem determines how quickly you solve it.",
    verseOrWisdom: "Finally, brothers and sisters, whatever is true, noble, right, pure, and lovely... think about such things.",
    verseReference: "Philippians 4:8",
    questionToThinkAbout: "Are you looking at obstacles as roadblocks, or as stepping stones to build your grit?",
    challengeOfTheWeek: "Reframe a difficult task as an exciting challenge and tackle it with an optimistic mindset.",
  },
  {
    weekNumber: 39,
    funnyThought: "I always give 100% at school: 12% Monday, 23% Tuesday, 40% Wednesday, 20% Thursday, 5% Friday!",
    motivation: "Consistency beats talent when talent fails to show up consistently.",
    verseOrWisdom: "The steadfast love of the Lord never ceases; His mercies never come to an end; they are new every morning.",
    verseReference: "Lamentations 3:22-23",
    questionToThinkAbout: "Which area of your life would benefit most if you were just 10% more consistent?",
    challengeOfTheWeek: "Complete every single homework assignment on the exact day it is given, without delay.",
  },
  {
    weekNumber: 40,
    funnyThought: "The brain is like a muscle: if you don't use it, it will think about what to have for dinner instead.",
    motivation: "Never stop learning, because life never stops teaching.",
    verseOrWisdom: "Listen to advice and accept discipline, and at the end you will be counted among the wise.",
    verseReference: "Proverbs 19:20",
    questionToThinkAbout: "Who is someone younger than you that you can teach or mentor with patience?",
    challengeOfTheWeek: "Teach a concept you understand well to a classmate who is struggling with it.",
  },
  {
    weekNumber: 41,
    funnyThought: "A balanced diet means a samosa in each hand. Moderation is key!",
    motivation: "Self-discipline in small physical choices builds the willpower for monumental moral choices.",
    verseOrWisdom: "Like a city whose walls are broken through is a person who lacks self-control.",
    verseReference: "Proverbs 25:28",
    questionToThinkAbout: "Can you say 'No' to yourself when you know something isn't good for your future?",
    challengeOfTheWeek: "Practice denying yourself one small luxury or sweet snack, giving thanks for your health.",
  },
  {
    weekNumber: 42,
    funnyThought: "If you think your teacher talks a lot, remember they have to compete with 45 chatting learners!",
    motivation: "Listening is an act of deep respect. When you listen carefully, you learn what others cannot see.",
    verseOrWisdom: "My dear brothers and sisters, take note of this: Everyone should be quick to listen, slow to speak and slow to become angry.",
    verseReference: "James 1:19",
    questionToThinkAbout: "How well do you pay attention when someone is giving instructions?",
    challengeOfTheWeek: "Listen attentively to your teachers without interrupting or whispering once all week.",
  },
  {
    weekNumber: 43,
    funnyThought: "The biggest lie I tell myself is: 'I don't need to write that down, I'll definitely remember it.'",
    motivation: "A short pencil is better than a long memory. Write down your commitments.",
    verseOrWisdom: "Write down the revelation and make it plain on tablets so that a herald may run with it.",
    verseReference: "Habakkuk 2:2",
    questionToThinkAbout: "How organized are your personal reminders and commitments to family and teachers?",
    challengeOfTheWeek: "Keep a daily planner or notebook where you write down all your tasks and check them off.",
  },
  {
    weekNumber: 44,
    funnyThought: "Why was 6 afraid of 7? Because 7, 8 (ate), 9! Numbers have serious drama.",
    motivation: "Do not let fears of the future paralyze your ability to take action in the present moment.",
    verseOrWisdom: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.",
    verseReference: "2 Timothy 1:7",
    questionToThinkAbout: "What is one fear that holds you back from speaking up or sharing your talents?",
    challengeOfTheWeek: "Raise your hand and speak up courageously in at least two different lessons this week.",
  },
  {
    weekNumber: 45,
    funnyThought: "The bell doesn't dismiss you, the teacher does... but the bell has a much more persuasive tone!",
    motivation: "Respect authority not out of fear, but out of understanding that order protects everyone.",
    verseOrWisdom: "Let everyone be subject to the governing authorities, for there is no authority except that which God has established.",
    verseReference: "Romans 13:1",
    questionToThinkAbout: "How does showing respect to school captains and prefects help maintain harmony?",
    challengeOfTheWeek: "Cooperate cheerfully with class prefects and leaders when they ask for quiet or order.",
  },
  {
    weekNumber: 46,
    funnyThought: "I thought about exercising today, but then I decided to give my body the gift of peaceful rest.",
    motivation: "Rest is not laziness; it is necessary recovery. Rest so that you can work with excellence.",
    verseOrWisdom: "In peace I will lie down and sleep, for You alone, Lord, make me dwell in safety.",
    verseReference: "Psalm 4:8",
    questionToThinkAbout: "Are you sleeping at proper hours, or staying up late on unproductive activities?",
    challengeOfTheWeek: "Go to bed on time every night this school week so your mind is fresh and alert.",
  },
  {
    weekNumber: 47,
    funnyThought: "My teacher said 'You have so much potential.' I think that means I haven't done anything yet!",
    motivation: "Potential is dormant treasure. Only consistent action transforms potential into achievement.",
    verseOrWisdom: "Do not neglect your gift, which was given you through prophecy with the laying on of hands.",
    verseReference: "1 Timothy 4:14",
    questionToThinkAbout: "What is a unique talent or skill you have that you have not been developing lately?",
    challengeOfTheWeek: "Practice your talent (music, art, public speaking, science project, sport) for an hour this week.",
  },
  {
    weekNumber: 48,
    funnyThought: "Teamwork means you can blame someone else. Just kidding... take ownership of your role!",
    motivation: "Accountability is the glue that ties commitment to result. Stand by your word.",
    verseOrWisdom: "Let your 'Yes' be 'Yes,' and your 'No,' 'No'; anything beyond this comes from the evil one.",
    verseReference: "Matthew 5:37",
    questionToThinkAbout: "Can people count on you to do what you promised, even when you no longer feel like it?",
    challengeOfTheWeek: "Fulfill every promise you make this week, no matter how small.",
  },
  {
    weekNumber: 49,
    funnyThought: "Why did the student study in the airplane? Because he wanted a higher education!",
    motivation: "Aim high, because even if you miss the stars, you will still land among the clouds.",
    verseOrWisdom: "Set your minds on things above, not on earthly things.",
    verseReference: "Colossians 3:2",
    questionToThinkAbout: "Are your goals big enough to inspire you, or are you settling for comfortable mediocrity?",
    challengeOfTheWeek: "Write down three bold, honorable goals you want to achieve before the end of this academic year.",
  },
  {
    weekNumber: 50,
    funnyThought: "A clean eraser is an unused eraser. Don't be afraid to make mistakes and rub them out!",
    motivation: "Forgiveness is the key that unlocks the door of resentment and the handcuffs of hatred.",
    verseOrWisdom: "Bear with each other and forgive one another if any of you has a grievance against someone.",
    verseReference: "Colossians 3:13",
    questionToThinkAbout: "Is there someone you are still holding a grudge against? What would it take to let it go?",
    challengeOfTheWeek: "Choose to release a past grievance and greet that person with genuine warmth.",
  },
  {
    weekNumber: 51,
    funnyThought: "Only at school do you have to ask permission to drink water or visit the washroom. Cherish freedom!",
    motivation: "Freedom is not the license to do whatever you please, but the power to do what is right.",
    verseOrWisdom: "Live as free people, but do not use your freedom as a cover-up for evil; live as God's slaves.",
    verseReference: "1 Peter 2:16",
    questionToThinkAbout: "How do you use your free time when nobody is giving you strict instructions?",
    challengeOfTheWeek: "Spend your free weekend time doing something productive that blesses your family.",
  },
  {
    weekNumber: 52,
    funnyThought: "Another term completed! Our brains survived, our notebooks are full, and our friendships are stronger.",
    motivation: "Look back with gratitude, look forward with hope, and look around with love. Together we make a difference.",
    verseOrWisdom: "The Lord bless you and keep you; the Lord make His face shine on you and be gracious to you.",
    verseReference: "Numbers 6:24-25",
    questionToThinkAbout: "What is the most meaningful lesson in character and friendship you learned this term?",
    challengeOfTheWeek: "Thank your teachers, head teacher, and parents for their tireless sacrifice this term.",
  },
];

/**
 * Calculates current week Monday to Sunday date range and formatted display
 * e.g. "WEEK: 28 SEPTEMBER – 4 OCTOBER 2026"
 */
export function getWeeklyDateRange(referenceDate: Date = new Date()): {
  formattedRange: string;
  startDate: Date;
  endDate: Date;
  weekNumber: number;
  year: number;
} {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Distance to Monday (if Sunday, day is 0 so -6 days; otherwise 1 - day)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Month names in uppercase
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  const startDay = monday.getDate();
  const startMonth = monthNames[monday.getMonth()];
  const endDay = sunday.getDate();
  const endMonth = monthNames[sunday.getMonth()];
  const endYear = sunday.getFullYear();

  let formattedRange = '';
  if (startMonth === endMonth) {
    formattedRange = `WEEK: ${startDay} – ${endDay} ${startMonth} ${endYear}`;
  } else {
    formattedRange = `WEEK: ${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`;
  }

  // Calculate ISO week number
  const target = new Date(monday.valueOf());
  const dayNr = (monday.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

  return {
    formattedRange,
    startDate: monday,
    endDate: sunday,
    weekNumber,
    year: endYear,
  };
}

export const STORAGE_KEY_CUSTOM_INSPIRATIONS = 'reberwet_custom_weekly_inspirations_v2';

/**
 * Returns any custom weekly inspirations saved by the Admin
 */
export function getCustomWeeklyInspirations(): Record<number, WeeklyInspirationItem> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_INSPIRATIONS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {};
}

/**
 * Saves or updates a weekly inspiration customization made by Admin / Super Admin
 */
export function saveWeeklyInspirationCustomization(item: WeeklyInspirationItem): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomWeeklyInspirations();
    existing[item.weekNumber] = item;
    localStorage.setItem(STORAGE_KEY_CUSTOM_INSPIRATIONS, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save weekly inspiration customization:', err);
  }
}

/**
 * Resets a customized week back to default curated inspiration
 */
export function resetWeeklyInspirationCustomization(weekNumber: number): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomWeeklyInspirations();
    delete existing[weekNumber];
    localStorage.setItem(STORAGE_KEY_CUSTOM_INSPIRATIONS, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to reset weekly inspiration customization:', err);
  }
}

/**
 * Calculates Monday to Sunday date range for an arbitrary week number (1 - 52)
 */
export function getDateRangeForWeekNumber(
  weekNumber: number,
  year: number = 2026
): {
  formattedRange: string;
  startDate: Date;
  endDate: Date;
} {
  const jan4 = new Date(year, 0, 4);
  const day = jan4.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const week1Monday = new Date(year, 0, 4 + diffToMonday);

  const monday = new Date(week1Monday);
  monday.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  const startDay = monday.getDate();
  const startMonth = monthNames[monday.getMonth()];
  const endDay = sunday.getDate();
  const endMonth = monthNames[sunday.getMonth()];
  const endYear = sunday.getFullYear();

  let formattedRange = '';
  if (startMonth === endMonth) {
    formattedRange = `WEEK: ${startDay} – ${endDay} ${startMonth} ${endYear}`;
  } else {
    formattedRange = `WEEK: ${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`;
  }

  return {
    formattedRange,
    startDate: monday,
    endDate: sunday,
  };
}

/**
 * Returns inspiration for a specific week number (including any Admin customizations)
 */
export function getInspirationForWeek(
  weekNumber: number,
  year: number = 2026
): {
  weekDatesFormatted: string;
  inspiration: WeeklyInspirationItem;
  isCustomized: boolean;
  weekNumber: number;
} {
  const boundedWeek = Math.max(1, Math.min(52, weekNumber));
  const { formattedRange } = getDateRangeForWeekNumber(boundedWeek, year);

  const customMap = getCustomWeeklyInspirations();
  const isCustomized = Boolean(customMap[boundedWeek]);

  const defaultItem =
    WEEKLY_INSPIRATION_52[(boundedWeek - 1) % WEEKLY_INSPIRATION_52.length];
  const inspiration = customMap[boundedWeek] || { ...defaultItem, weekNumber: boundedWeek };

  return {
    weekDatesFormatted: formattedRange,
    inspiration,
    isCustomized,
    weekNumber: boundedWeek,
  };
}

/**
 * Returns the deterministic Weekly Inspiration item for the current week,
 * including any Admin customizations.
 */
export function getCurrentWeekInspiration(referenceDate: Date = new Date()): {
  weekDatesFormatted: string;
  inspiration: WeeklyInspirationItem;
  weekNumber: number;
  isCustomized: boolean;
} {
  const { formattedRange, weekNumber, year } = getWeeklyDateRange(referenceDate);
  const result = getInspirationForWeek(weekNumber, year);

  return {
    weekDatesFormatted: formattedRange,
    inspiration: result.inspiration,
    weekNumber,
    isCustomized: result.isCustomized,
  };
}
