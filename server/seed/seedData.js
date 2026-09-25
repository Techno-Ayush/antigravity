import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Session from '../models/Session.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Rating from '../models/Rating.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import { connectDB, closeDB } from '../config/db.js';
import { SESSION_STATUS, TRANSACTION_TYPES, NOTIFICATION_TYPES } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SKILLS_DATA = [
  // Programming
  { name: 'JavaScript', category: 'Programming', description: 'Modern ES6+, async programming, and DOM manipulation', icon: 'Code' },
  { name: 'React', category: 'Programming', description: 'Components, hooks, state management, and modern SPA architecture', icon: 'Component' },
  { name: 'Python', category: 'Programming', description: 'Data structures, scripting, automation, and backend development', icon: 'FileCode' },
  { name: 'C++', category: 'Programming', description: 'Object-oriented programming, memory management, and STL algorithms', icon: 'Cpu' },
  { name: 'Node.js', category: 'Programming', description: 'REST APIs, Express.js backend services, and asynchronous runtimes', icon: 'Server' },
  { name: 'SQL & Database Design', category: 'Programming', description: 'Relational schemas, indexing, query optimization, and normal forms', icon: 'Database' },
  
  // Creative & Design
  { name: 'Guitar', category: 'Music', description: 'Chords, fingerstyle, rhythm strumming, and song composition', icon: 'Music' },
  { name: 'Photography', category: 'Creative', description: 'Aperture, shutter speed, composition rules, and portrait lighting', icon: 'Camera' },
  { name: 'Video Editing', category: 'Creative', description: 'Premiere Pro & DaVinci Resolve color grading, pacing, and sound sync', icon: 'Video' },
  { name: 'UI/UX Design', category: 'Creative', description: 'Wireframing, user persona research, and prototyping in Figma', icon: 'Layout' },
  { name: 'Graphic Design with Canva', category: 'Creative', description: 'Social media branding, typography, color theory, and posters', icon: 'Palette' },
  
  // Professional
  { name: 'Excel & Dashboards', category: 'Professional', description: 'VLOOKUP, XLOOKUP, Pivot Tables, power query, and dynamic charts', icon: 'Table' },
  { name: 'Public Speaking', category: 'Professional', description: 'Overcoming stage fear, vocal variety, speech structure, and storytelling', icon: 'Mic' },
  { name: 'Resume Writing & Interviewing', category: 'Professional', description: 'ATS-friendly resumes, behavioral interviews, and salary negotiation', icon: 'FileText' },
  { name: 'Digital Marketing & SEO', category: 'Professional', description: 'Keyword research, on-page optimization, Google Ads, and campaign metrics', icon: 'TrendingUp' },
  { name: 'Content Writing', category: 'Professional', description: 'Copywriting, blog formatting, headlines, and audience engagement', icon: 'Edit3' },
  
  // Languages
  { name: 'Spanish', category: 'Languages', description: 'Conversational vocabulary, present & past tense conjugation, and pronunciation', icon: 'Globe' },
  { name: 'English Fluency', category: 'Languages', description: 'Professional communication, idioms, vocabulary building, and accent neutrality', icon: 'MessageSquare' },
  { name: 'French', category: 'Languages', description: 'Everyday dialogue, basic grammar, listening comprehension, and travel phrases', icon: 'Languages' },
  { name: 'German', category: 'Languages', description: 'A1-A2 grammar, noun genders, sentence structure, and conversational basics', icon: 'Book' },
  
  // Academic & Lifestyle
  { name: 'Mathematics & Calculus', category: 'Academic', description: 'Derivatives, integrals, limits, and applied problem solving', icon: 'Sigma' },
  { name: 'Physics Mechanics', category: 'Academic', description: 'Newtonian dynamics, conservation laws, rotational motion, and vectors', icon: 'Atom' },
  { name: 'Fitness & Calisthenics', category: 'Fitness', description: 'Bodyweight strength progression, core training, mobility, and posture', icon: 'Activity' },
  { name: 'North Indian Home Cooking', category: 'Lifestyle', description: 'Curry bases, spice balancing, rotis, and traditional regional recipes', icon: 'Utensils' }
];

const RAW_USERS = [
  { name: 'Rahul Sharma', email: 'rahul@example.com', location: 'Bengaluru, Karnataka', bio: 'Full-stack software developer who loves teaching JavaScript & React. Eager to master acoustic guitar and conversational Spanish!', preferredMode: 'ONLINE', teaching: ['JavaScript', 'React', 'Excel & Dashboards'], learning: ['Guitar', 'Spanish', 'Photography'] },
  { name: 'Priya Patel', email: 'priya@example.com', location: 'Mumbai, Maharashtra', bio: 'Product designer and guitarist. Sharing visual design techniques and fingerstyle guitar while picking up Python for automation.', preferredMode: 'BOTH', teaching: ['Guitar', 'UI/UX Design'], learning: ['Python', 'Excel & Dashboards'] },
  { name: 'Amit Verma', email: 'amit@example.com', location: 'Delhi NCR', bio: 'Fluent Spanish speaker and language enthusiast. Let us exchange languages for resume and interview preparation!', preferredMode: 'ONLINE', teaching: ['Spanish', 'English Fluency'], learning: ['Resume Writing & Interviewing', 'React'] },
  { name: 'Sneha Iyer', email: 'sneha@example.com', location: 'Chennai, Tamil Nadu', bio: 'Data analyst proficient in advanced Excel dashboards and SQL. Curious about North Indian cooking and photography!', preferredMode: 'ONLINE', teaching: ['Excel & Dashboards', 'SQL & Database Design'], learning: ['North Indian Home Cooking', 'Photography'] },
  { name: 'Rohan Deshmukh', email: 'rohan@example.com', location: 'Pune, Maharashtra', bio: 'Mechanical engineer with strong math foundations. Teaching calculus while exploring calisthenics and fitness.', preferredMode: 'IN_PERSON', teaching: ['Mathematics & Calculus', 'Physics Mechanics'], learning: ['Fitness & Calisthenics', 'JavaScript'] },
  { name: 'Ananya Roy', email: 'ananya@example.com', location: 'Kolkata, West Bengal', bio: 'Creative content writer and debater. Passionate about public speaking, speechwriting, and video editing.', preferredMode: 'ONLINE', teaching: ['Public Speaking', 'Content Writing'], learning: ['Video Editing', 'Spanish'] },
  { name: 'Vikram Malhotra', email: 'vikram@example.com', location: 'Hyderabad, Telangana', bio: 'Video editor and motion graphics creator. Looking to learn C++ algorithms and data structures.', preferredMode: 'ONLINE', teaching: ['Video Editing', 'Graphic Design with Canva'], learning: ['C++', 'Mathematics & Calculus'] },
  { name: 'Pooja Nair', email: 'pooja@example.com', location: 'Kochi, Kerala', bio: 'Photographer and visual storyteller. Offering portrait photography tips in exchange for French lessons and UI design.', preferredMode: 'BOTH', teaching: ['Photography', 'Graphic Design with Canva'], learning: ['French', 'UI/UX Design'] },
  { name: 'Karan Mehra', email: 'karan@example.com', location: 'Jaipur, Rajasthan', bio: 'Backend engineer specializing in Node.js and C++. Eager to improve public speaking and spoken English.', preferredMode: 'ONLINE', teaching: ['C++', 'Node.js'], learning: ['Public Speaking', 'English Fluency'] },
  { name: 'Divya Singhania', email: 'divya@example.com', location: 'Ahmedabad, Gujarat', bio: 'Culinary enthusiast and home chef. Teaching authentic Gujarati & North Indian curries in exchange for digital marketing.', preferredMode: 'BOTH', teaching: ['North Indian Home Cooking'], learning: ['Digital Marketing & SEO', 'Canva'] },
  { name: 'Arjun Das', email: 'arjun@example.com', location: 'Bengaluru, Karnataka', bio: 'Calisthenics coach and personal fitness trainer. Sharing functional movement drills and mobility workouts.', preferredMode: 'BOTH', teaching: ['Fitness & Calisthenics'], learning: ['Node.js', 'Guitar'] },
  { name: 'Tanvi Joshi', email: 'tanvi@example.com', location: 'Indore, Madhya Pradesh', bio: 'Digital marketer and SEO specialist. Let me help you rank #1 on Google while you help me write better resumes.', preferredMode: 'ONLINE', teaching: ['Digital Marketing & SEO', 'Content Writing'], learning: ['Resume Writing & Interviewing', 'Python'] },
  { name: 'Ishaan Gupta', email: 'ishaan@example.com', location: 'Chandigarh', bio: 'Aspiring data scientist. Teaching Python fundamentals and scripting, looking to learn German for higher studies.', preferredMode: 'ONLINE', teaching: ['Python', 'JavaScript'], learning: ['German', 'Mathematics & Calculus'] },
  { name: 'Kabir Kapoor', email: 'kabir@example.com', location: 'Lucknow, Uttar Pradesh', bio: 'HR recruiter and corporate trainer. Teaching resume crafting and mock interviews in exchange for React basics.', preferredMode: 'ONLINE', teaching: ['Resume Writing & Interviewing'], learning: ['React', 'Excel & Dashboards'] },
  { name: 'Meera Nambiar', email: 'meera@example.com', location: 'Bengaluru, Karnataka', bio: 'French linguist (DELF B2 certified). Teaching conversational French; excited to learn acoustic guitar chords!', preferredMode: 'ONLINE', teaching: ['French'], learning: ['Guitar', 'Photography'] },
  { name: 'Siddharth Rao', email: 'siddharth@example.com', location: 'Visakhapatnam, Andhra Pradesh', bio: 'Full-stack MERN enthusiast and competitive programmer. Teaching algorithms and JavaScript.', preferredMode: 'ONLINE', teaching: ['JavaScript', 'C++'], learning: ['Public Speaking', 'UI/UX Design'] },
  { name: 'Ritu Agarwal', email: 'ritu@example.com', location: 'Kanpur, Uttar Pradesh', bio: 'Math educator and competitive exam coach. Teaching calculus and algebra; exploring Spanish for travel.', preferredMode: 'ONLINE', teaching: ['Mathematics & Calculus'], learning: ['Spanish', 'Graphic Design with Canva'] },
  { name: 'Aditya Sen', email: 'aditya@example.com', location: 'Guwahati, Assam', bio: 'Figma designer and design systems builder. Let us exchange UI/UX secrets for video editing fundamentals.', preferredMode: 'ONLINE', teaching: ['UI/UX Design'], learning: ['Video Editing', 'Python'] },
  { name: 'Bhavna Kulkarni', email: 'bhavna@example.com', location: 'Nagpur, Maharashtra', bio: 'German B1 instructor. Teaching pronunciation and basic syntax in exchange for Excel automation.', preferredMode: 'ONLINE', teaching: ['German'], learning: ['Excel & Dashboards', 'English Fluency'] },
  { name: 'Varun Bhatia', email: 'varun@example.com', location: 'Dehradun, Uttarakhand', bio: 'Nature photographer and outdoor trainer. Teaching composition and light balance.', preferredMode: 'IN_PERSON', teaching: ['Photography', 'Fitness & Calisthenics'], learning: ['North Indian Home Cooking', 'Spanish'] }
];

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Session.deleteMany({});
    await CreditTransaction.deleteMany({});
    await Rating.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log('[Seed] Inserting Skills...');
    const insertedSkills = await Skill.insertMany(SKILLS_DATA);
    const skillMap = {};
    insertedSkills.forEach((s) => {
      skillMap[s.name] = s._id;
    });

    console.log('[Seed] Creating Administrator Account...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@skillexchange.in',
      password: 'admin123',
      role: 'ADMIN',
      bio: 'Platform safety, dispute resolution and community trust coordinator.',
      location: 'New Delhi, India',
      totalCredits: 100,
      reservedCredits: 0,
      rating: 5.0,
      onboardingCompleted: true
    });

    console.log('[Seed] Inserting 20 Community Users...');
    const defaultUserPass = 'password123';
    const createdUsers = [];

    for (const raw of RAW_USERS) {
      const skillsOffered = raw.teaching
        .filter((name) => skillMap[name])
        .map((name, i) => ({
          skill: skillMap[name],
          level: i === 0 ? 'ADVANCED' : 'INTERMEDIATE',
          experienceYears: 2 + i,
          description: `Practical 1-on-1 tutoring and interactive feedback in ${name}`
        }));

      const skillsWanted = raw.learning
        .filter((name) => skillMap[name])
        .map((name, i) => ({
          skill: skillMap[name],
          desiredLevel: i === 0 ? 'BEGINNER' : 'INTERMEDIATE',
          urgency: i === 0 ? 'HIGH' : 'MEDIUM'
        }));

      const user = await User.create({
        name: raw.name,
        email: raw.email,
        password: defaultUserPass,
        bio: raw.bio,
        location: raw.location,
        preferredMode: raw.preferredMode,
        availability: {
          weekdays: true,
          weekends: true,
          timeSlots: ['EVENING', 'AFTERNOON']
        },
        skillsOffered,
        skillsWanted,
        totalCredits: 4, // 3 starter + 1 earned from demo
        reservedCredits: 0,
        earnedCredits: 1,
        spentCredits: 0,
        rating: 4.8,
        reviewCount: 3,
        completedTeachingHours: 1,
        completedLearningHours: 0,
        completedSessions: 1,
        onboardingCompleted: true
      });

      // Grant initial ledger transaction
      await CreditTransaction.create({
        user: user._id,
        type: TRANSACTION_TYPES.BONUS,
        amount: 3,
        balanceBefore: 0,
        balanceAfter: 3,
        description: 'Welcome bonus: 3 starter knowledge credits'
      });

      createdUsers.push(user);
    }

    console.log('[Seed] Creating Realistic Sessions, Transactions & Reviews...');
    const rahul = createdUsers.find((u) => u.email === 'rahul@example.com');
    const priya = createdUsers.find((u) => u.email === 'priya@example.com');
    const amit = createdUsers.find((u) => u.email === 'amit@example.com');
    const sneha = createdUsers.find((u) => u.email === 'sneha@example.com');
    const rohan = createdUsers.find((u) => u.email === 'rohan@example.com');

    // Session 1: COMPLETED (Rahul taught Priya JavaScript 1 hr)
    const session1 = await Session.create({
      teacher: rahul._id,
      learner: priya._id,
      skill: skillMap['JavaScript'],
      scheduledDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      startTime: '18:00',
      duration: 1,
      creditAmount: 1,
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/abc-demo-skill',
      topic: 'JavaScript Promises, Async/Await and Event Loop',
      status: SESSION_STATUS.COMPLETED,
      teacherConfirmed: true,
      learnerConfirmed: true,
      teacherConfirmedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3600000),
      learnerConfirmedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3700000),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3700000)
    });

    // Ledger for Session 1
    await CreditTransaction.create({
      user: rahul._id,
      counterparty: priya._id,
      session: session1._id,
      type: TRANSACTION_TYPES.EARN,
      amount: 1,
      balanceBefore: 3,
      balanceAfter: 4,
      description: 'Earned +1 credit teaching JavaScript to Priya Patel'
    });

    await CreditTransaction.create({
      user: priya._id,
      counterparty: rahul._id,
      session: session1._id,
      type: TRANSACTION_TYPES.SPEND,
      amount: 1,
      balanceBefore: 3,
      balanceAfter: 2,
      description: 'Spent 1 credit learning JavaScript from Rahul Sharma'
    });

    // Rating for Session 1
    await Rating.create({
      session: session1._id,
      rater: priya._id,
      ratee: rahul._id,
      role: 'TEACHER',
      rating: 5,
      review: 'Rahul is fantastic! Explained asynchronous code and microtask queue with crystal-clear visual diagrams.'
    });

    await Rating.create({
      session: session1._id,
      rater: rahul._id,
      ratee: priya._id,
      role: 'LEARNER',
      rating: 5,
      review: 'Priya was extremely curious, did the exercises proactively and had great questions.'
    });

    // Session 2: SCHEDULED (Priya teaches Rahul Guitar tomorrow)
    // Credit is held/reserved for Rahul
    rahul.reservedCredits += 1;
    await rahul.save();

    const session2 = await Session.create({
      teacher: priya._id,
      learner: rahul._id,
      skill: skillMap['Guitar'],
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      startTime: '19:00',
      duration: 1,
      creditAmount: 1,
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/guitar-rahul-priya',
      topic: 'Open Chords (C, G, Em, D) and basic strumming patterns',
      status: SESSION_STATUS.SCHEDULED,
      teacherConfirmed: false,
      learnerConfirmed: false
    });

    await CreditTransaction.create({
      user: rahul._id,
      counterparty: priya._id,
      session: session2._id,
      type: TRANSACTION_TYPES.HOLD,
      amount: 1,
      balanceBefore: 4,
      balanceAfter: 3,
      description: 'Hold 1 credit reserved for upcoming Guitar session with Priya Patel'
    });

    // Session 3: AWAITING_CONFIRMATION (Amit taught Sneha Spanish - Amit marked complete, Sneha hasn't yet)
    const session3 = await Session.create({
      teacher: amit._id,
      learner: sneha._id,
      skill: skillMap['Spanish'],
      scheduledDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      startTime: '16:00',
      duration: 1,
      creditAmount: 1,
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/spanish-amit-sneha',
      topic: 'Conversational greetings, ser vs estar, and café dialogue',
      status: SESSION_STATUS.AWAITING_CONFIRMATION,
      teacherConfirmed: true,
      learnerConfirmed: false,
      teacherConfirmedAt: new Date(Date.now() - 30 * 60 * 1000)
    });

    // Session 4: REQUESTED (Rohan requested Python from Amit)
    const session4 = await Session.create({
      teacher: priya._id,
      learner: rohan._id,
      skill: skillMap['Guitar'],
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '17:30',
      duration: 1,
      creditAmount: 1,
      mode: 'IN_PERSON',
      location: 'Koregaon Park Cafe, Pune',
      topic: 'Fingerpicking fundamentals and tabs reading',
      status: SESSION_STATUS.REQUESTED
    });

    // Create Conversation & sample chat messages between Rahul and Priya
    const conv1 = await Conversation.create({
      participants: [rahul._id, priya._id],
      session: session2._id,
      lastMessage: {
        text: 'Looking forward to our guitar session tomorrow at 7 PM!',
        sender: priya._id,
        createdAt: new Date()
      }
    });

    await Message.create({
      conversation: conv1._id,
      sender: rahul._id,
      text: 'Hi Priya! Thanks for accepting the guitar session request.',
      createdAt: new Date(Date.now() - 10000000)
    });

    await Message.create({
      conversation: conv1._id,
      sender: priya._id,
      text: 'Hey Rahul! Excited to exchange. Do you have a tuner app installed?',
      createdAt: new Date(Date.now() - 8000000)
    });

    await Message.create({
      conversation: conv1._id,
      sender: rahul._id,
      text: 'Yes, GuitarTuna is installed and ready. See you online tomorrow!',
      createdAt: new Date(Date.now() - 5000000)
    });

    // Create sample Notification for Rahul
    await Notification.create({
      recipient: rahul._id,
      sender: priya._id,
      type: NOTIFICATION_TYPES.SESSION_ACCEPTED,
      title: 'Session Accepted!',
      message: 'Priya Patel confirmed your 1-hour Guitar session for tomorrow at 19:00.',
      link: `/sessions/${session2._id}`,
      read: false
    });

    console.log('[Seed] Database successfully seeded with 24 skills, 21 users, sessions, transactions, and reviews!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err.message);
  }
};

// If run directly via `node seed/seedData.js`
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  })();
}
