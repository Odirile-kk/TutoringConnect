import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Availability from "./models/Availability.js";
import Booking from "./models/Booking.js";
import Rating from "./models/Rating.js";
import Subject from "./models/Subject.js";
import User from "./models/User.js";
import { seedSubjectCatalog, subjectNames } from "./data/subjectCatalog.js";

const demoPassword = process.env.DEMO_SEED_PASSWORD || "DemoPass123!";
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

function assertSafeTarget() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Demo seed data cannot be loaded when NODE_ENV=production.");
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI must be configured before seeding.");
  let hostname;
  try {
    hostname = new URL(process.env.MONGODB_URI).hostname.toLowerCase();
  } catch {
    throw new Error("MONGODB_URI is not a valid MongoDB connection URI.");
  }
  if (
    !localHosts.has(hostname) &&
    process.env.DEMO_SEED_ALLOW_REMOTE !== "true"
  )
    throw new Error(
      "Refusing to seed a remote database. Set DEMO_SEED_ALLOW_REMOTE=true only if this is an intentional non-production target.",
    );
  if (demoPassword.length < 8)
    throw new Error("DEMO_SEED_PASSWORD must contain at least 8 characters.");
}

function objectId(hex) {
  return new mongoose.Types.ObjectId(hex);
}

function day(offset) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

const presentSessionDate = new Date(Date.now() + 60 * 60 * 1000);
const presentSessionStartTime = presentSessionDate.toTimeString().slice(0, 5);
const presentSessionEnd = new Date(presentSessionDate.getTime() + 60 * 60 * 1000);
const presentSessionEndTime = presentSessionEnd.toTimeString().slice(0, 5);

const accountIds = {
  admin: "650000000000000000000001",
  tutorA: "650000000000000000000002",
  tutorB: "650000000000000000000003",
  studentA: "650000000000000000000004",
  studentB: "650000000000000000000005",
  tutorC: "650000000000000000000006",
  tutorD: "650000000000000000000007",
  tutorE: "650000000000000000000008",
  tutorF: "650000000000000000000009",
  tutorG: "65000000000000000000000a",
  tutorH: "65000000000000000000000b",
};

const accountDetails = [
  {
    key: "admin",
    name: "Demo Administrator",
    email: "admin@tutoringconnect.test",
    role: "admin",
    phone: "+27 11 555 0100",
    bio: "Manages the Tutoring Connect demo workspace.",
  },
  {
    key: "tutorA",
    name: "Amina Patel",
    email: "amina.tutor@tutoringconnect.test",
    role: "tutor",
    phone: "+27 11 555 0101",
    bio: "Friendly programming and data science tutor focused on practical learning.",
    qualifications: "BSc Computer Science · 6 years tutoring",
    subjects: [
      "Programming 512",
      "Programming 622",
      "Data Science 500",
      "Machine Learning 600",
      "Database Systems 622",
      "Web Tech 512",
      "Programming 732",
      "Programming 632*",
      "Programming 742*",
    ],
  },
  {
    key: "tutorB",
    name: "Liam Nkosi",
    email: "liam.tutor@tutoringconnect.test",
    role: "tutor",
    phone: "+27 11 555 0102",
    bio: "I help students build confidence in business, systems, and networking.",
    qualifications: "BCom Information Systems · 4 years tutoring",
    subjects: [
      "Business Communication 500",
      "Business Management 622*",
      "Information Systems 622",
      "Networks 512",
      "Business Analysis 622*",
      "IT Strategic Management 732*",
      "Management Information Systems 600",
      "Intro to Information Technology 500",
      "IT Help Desk 500",
      "M-Commerce 622",
    ],
  },
  {
    key: "tutorC",
    name: "Zanele Dlamini",
    email: "zanele.tutor@tutoringconnect.test",
    role: "tutor",
    phone: "+27 11 555 0105",
    bio: "Patient mathematics tutor who makes challenging concepts approachable.",
    qualifications: "BSc Mathematics · 5 years tutoring",
    subjects: ["Mathematics 512", "Stats for Data Science 600*"],
  },
  {
    key: "tutorD",
    name: "Thabo Mokoena",
    email: "thabo.tutor@tutoringconnect.test",
    role: "tutor",
    phone: "+27 11 555 0106",
    bio: "A practical guide to building modern websites and mobile applications.",
    qualifications: "BSc Information Technology · 4 years tutoring",
    subjects: ["Web Tech 512", "Internet Programming 622*", "Mobile App Development 700"],
  },
  {
    key: "tutorE",
    name: "Priya Naidoo",
    email: "priya.tutor@tutoringconnect.test",
    role: "tutor",
    phone: "+27 11 555 0107",
    bio: "Database tutor focused on clear explanations and real-world examples.",
    qualifications: "BSc Computer Science · 7 years tutoring",
    subjects: ["Database Systems 622", "Information Systems 512"],
  },
  {
    key: "tutorF",
    name: "Kabelo Molefe",
    email: "kabelo.tutor@tutoringconnect.test",
    role: "tutor",
    phone: "+27 11 555 0108",
    bio: "Helping students understand operating systems and computer networks.",
    qualifications: "BTech Computer Systems · 5 years tutoring",
    subjects: [
      "Operating Systems 600",
      "Operating Systems 700",
      "Networks 622*",
      "Networks 632*",
      "Networks 732*",
      "Server Technology 600*",
    ],
  },
  {
    key: "tutorG",
    name: "Leah Jacobs",
    email: "leah.tutor@tutoringconnect.test",
    role: "tutor",
    phone: "+27 11 555 0109",
    bio: "Business and e-commerce tutor who connects theory to practical decisions.",
    qualifications: "BCom Business Information Systems · 6 years tutoring",
    subjects: ["eCommerce 512", "Business Analysis 632*", "Business Communication 500"],
  },
  {
    key: "tutorH",
    name: "Musa Khumalo",
    email: "musa.tutor@tutoringconnect.test",
    role: "tutor",
    phone: "+27 11 555 0110",
    bio: "Exploring emerging technology, robotics, and the Internet of Things with students.",
    qualifications: "MSc Computing · 3 years tutoring",
    subjects: [
      "Autonomous Systems & Robotics 700*",
      "Big Data & IOT 600",
    ],
  },
  {
    key: "studentA",
    name: "Demo Student One",
    email: "student.one@tutoringconnect.test",
    role: "student",
    phone: "+27 11 555 0103",
    bio: "Working toward a stronger foundation in programming and data.",
  },
  {
    key: "studentB",
    name: "Demo Student Two",
    email: "student.two@tutoringconnect.test",
    role: "student",
    phone: "+27 11 555 0104",
    bio: "Exploring information systems and business technology.",
  },
];

const slotDetails = [
  {
    id: "650000000000000000000011",
    key: "completed-aminapatel",
    tutor: "tutorA",
    subject: "Programming 512",
    day: -7,
    startTime: "09:00",
    endTime: "10:00",
    booked: true,
  },
  {
    id: "650000000000000000000012",
    key: "completed-liam-nkosi",
    tutor: "tutorB",
    subject: "Information Systems 622",
    day: -5,
    startTime: "11:00",
    endTime: "12:00",
    booked: true,
  },
  {
    id: "650000000000000000000013",
    key: "upcoming-aminapatel",
    tutor: "tutorA",
    subject: "Data Science 500",
    day: 2,
    startTime: "09:00",
    endTime: "10:00",
    booked: true,
  },
  {
    id: "650000000000000000000014",
    key: "available-aminapatel",
    tutor: "tutorA",
    subject: "Machine Learning 600",
    day: 3,
    startTime: "10:00",
    endTime: "11:00",
    booked: false,
  },
  {
    id: "650000000000000000000015",
    key: "cancelled-liam-nkosi",
    tutor: "tutorB",
    subject: "Business Communication 500",
    day: 5,
    startTime: "14:00",
    endTime: "15:00",
    booked: false,
  },
  {
    id: "650000000000000000000016",
    key: "upcoming-liam-nkosi",
    tutor: "tutorB",
    subject: "Networks 512",
    day: 2,
    startTime: "14:00",
    endTime: "15:00",
    booked: true,
  },
  {
    id: "650000000000000000000017",
    key: "available-liam-nkosi",
    tutor: "tutorB",
    subject: "Business Management 622*",
    day: 4,
    startTime: "09:00",
    endTime: "10:00",
    booked: false,
  },
  {
    id: "650000000000000000000018",
    key: "available-aminapatel-extra",
    tutor: "tutorA",
    subject: "Web Tech 512",
    day: 6,
    startTime: "13:00",
    endTime: "14:00",
    booked: false,
  },
  {
    id: "650000000000000000000019",
    key: "present-aminapatel",
    tutor: "tutorA",
    subject: "Programming 622",
    date: presentSessionDate,
    startTime: presentSessionStartTime,
    endTime: presentSessionEndTime,
    booked: false,
  },
  {
    id: "650000000000000000000031",
    key: "available-zanele-math",
    tutor: "tutorC",
    subject: "Mathematics 512",
    day: 1,
    startTime: "09:00",
    endTime: "10:00",
    booked: false,
  },
  {
    id: "650000000000000000000032",
    key: "available-zanele-stats",
    tutor: "tutorC",
    subject: "Stats for Data Science 600*",
    day: 3,
    startTime: "11:00",
    endTime: "12:00",
    booked: false,
  },
  {
    id: "650000000000000000000033",
    key: "available-thabo-web",
    tutor: "tutorD",
    subject: "Web Tech 512",
    day: 1,
    startTime: "10:00",
    endTime: "11:00",
    booked: false,
  },
  {
    id: "650000000000000000000034",
    key: "available-thabo-mobile",
    tutor: "tutorD",
    subject: "Mobile App Development 700",
    day: 4,
    startTime: "13:00",
    endTime: "14:00",
    booked: false,
  },
  {
    id: "650000000000000000000035",
    key: "available-priya-database",
    tutor: "tutorE",
    subject: "Database Systems 622",
    day: 2,
    startTime: "09:00",
    endTime: "10:00",
    booked: false,
  },
  {
    id: "650000000000000000000036",
    key: "available-priya-information-systems",
    tutor: "tutorE",
    subject: "Information Systems 512",
    day: 5,
    startTime: "12:00",
    endTime: "13:00",
    booked: false,
  },
  {
    id: "650000000000000000000037",
    key: "available-kabelo-os",
    tutor: "tutorF",
    subject: "Operating Systems 600",
    day: 1,
    startTime: "14:00",
    endTime: "15:00",
    booked: false,
  },
  {
    id: "650000000000000000000038",
    key: "available-kabelo-networks",
    tutor: "tutorF",
    subject: "Networks 622*",
    day: 4,
    startTime: "10:00",
    endTime: "11:00",
    booked: false,
  },
  {
    id: "650000000000000000000039",
    key: "available-leah-ecommerce",
    tutor: "tutorG",
    subject: "eCommerce 512",
    day: 2,
    startTime: "13:00",
    endTime: "14:00",
    booked: false,
  },
  {
    id: "65000000000000000000003a",
    key: "available-leah-business-analysis",
    tutor: "tutorG",
    subject: "Business Analysis 632*",
    day: 6,
    startTime: "09:00",
    endTime: "10:00",
    booked: false,
  },
  {
    id: "65000000000000000000003b",
    key: "available-musa-robotics",
    tutor: "tutorH",
    subject: "Autonomous Systems & Robotics 700*",
    day: 3,
    startTime: "14:00",
    endTime: "15:00",
    booked: false,
  },
  {
    id: "65000000000000000000003c",
    key: "available-musa-iot",
    tutor: "tutorH",
    subject: "Big Data & IOT 600",
    day: 6,
    startTime: "11:00",
    endTime: "12:00",
    booked: false,
  },
];

const bookingDetails = [
  {
    id: "650000000000000000000021",
    student: "studentA",
    slot: "completed-aminapatel",
    status: "completed",
    notes: "Reviewed programming fundamentals.",
  },
  {
    id: "650000000000000000000022",
    student: "studentB",
    slot: "completed-liam-nkosi",
    status: "completed",
    notes: "Worked through information systems concepts.",
  },
  {
    id: "650000000000000000000023",
    student: "studentA",
    slot: "upcoming-aminapatel",
    status: "confirmed",
    notes: "Bring the current data science assignment.",
  },
  {
    id: "650000000000000000000024",
    student: "studentB",
    slot: "upcoming-liam-nkosi",
    status: "confirmed",
    notes: "Practice networking fundamentals and subnetting.",
  },
];

async function seed() {
  assertSafeTarget();
  await mongoose.connect(process.env.MONGODB_URI);
  await seedSubjectCatalog();

  const subjects = await Subject.find({ name: { $in: subjectNames } }).lean();
  const subjectByName = new Map(subjects.map((subject) => [subject.name, subject._id]));
  if (subjectByName.size !== new Set(subjectNames).size)
    throw new Error(
      "The subject catalogue is incomplete; unable to seed demo accounts.",
    );
  const assignedSubjectNames = new Set(
    accountDetails
      .filter((account) => account.role === "tutor")
      .flatMap((tutor) => tutor.subjects || []),
  );
  const unassignedSubjects = subjectNames.filter(
    (name) => !assignedSubjectNames.has(name),
  );
  const unknownSubjects = [...assignedSubjectNames].filter(
    (name) => !subjectByName.has(name),
  );
  if (unassignedSubjects.length || unknownSubjects.length)
    throw new Error(
      [
        unassignedSubjects.length &&
          `No demo tutor is assigned to: ${unassignedSubjects.join(", ")}`,
        unknownSubjects.length &&
          `Demo tutors reference unknown subjects: ${unknownSubjects.join(", ")}`,
      ]
        .filter(Boolean)
        .join(". "),
    );

  const password = await bcrypt.hash(demoPassword, 12);
  const users = {};
  for (const details of accountDetails) {
    const { key, subjects: subjectNamesForUser = [], ...profile } = details;
    users[key] = await User.findOneAndUpdate(
      { email: profile.email },
      {
        $set: {
          ...profile,
          password,
          active: true,
          subjects: subjectNamesForUser.map((name) => subjectByName.get(name)),
        },
        $setOnInsert: { _id: objectId(accountIds[key]) },
      },
      { new: true, upsert: true, runValidators: true },
    );
  }

  const slotsByKey = new Map();
  for (const slot of slotDetails) {
    const subject = subjectByName.get(slot.subject);
    if (!subject)
      throw new Error(
        `Missing subject required by demo data: ${slot.subject}`,
      );
    if (
      !users[slot.tutor].subjects.some((assigned) =>
        assigned.equals(subject),
      )
    )
      throw new Error(
        `${slot.tutor} is not assigned to the session subject ${slot.subject}.`,
      );
    const saved = await Availability.findByIdAndUpdate(
      objectId(slot.id),
      {
        $set: {
          tutor: users[slot.tutor]._id,
          subject,
          date: slot.date || day(slot.day),
          startTime: slot.startTime,
          endTime: slot.endTime,
          booked: slot.booked,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );
    slotsByKey.set(slot.key, saved);
  }

  const bookingsByKey = new Map();
  for (const booking of bookingDetails) {
    const slot = slotsByKey.get(booking.slot);
    const saved = await Booking.findByIdAndUpdate(
      objectId(booking.id),
      {
        $set: {
          student: users[booking.student]._id,
          tutor: slot.tutor,
          subject: slot.subject,
          availability: slot._id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: booking.status,
          notes: booking.notes,
          meetingLink: `https://teams.microsoft.com/l/meetup-join/demo-${booking.id}`,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );
    bookingsByKey.set(booking.id, saved);
  }

  const reviews = [
    {
      type: "tutor",
      author: users.studentA._id,
      target: users.tutorA._id,
      booking: bookingsByKey.get("650000000000000000000021")._id,
      rating: 5,
      comment: "Clear explanations and useful practice problems. Highly recommended!",
    },
    {
      type: "tutor",
      author: users.studentB._id,
      target: users.tutorB._id,
      booking: bookingsByKey.get("650000000000000000000022")._id,
      rating: 4,
      comment: "Helpful examples made the information systems topics easier to understand.",
    },
    {
      type: "platform",
      author: users.studentA._id,
      rating: 5,
      comment: "Finding a tutor and booking a session was straightforward.",
    },
    {
      type: "platform",
      author: users.tutorA._id,
      rating: 4,
      comment: "The scheduling tools make it easy to manage my availability.",
    },
    {
      type: "platform",
      author: users.tutorB._id,
      rating: 5,
      comment: "Managing my subjects and tutoring schedule is straightforward.",
    },
    {
      type: "platform",
      author: users.studentB._id,
      rating: 4,
      comment: "A helpful place to find subject-specific tutoring.",
    },
  ];
  for (const review of reviews) {
    const filter =
      review.type === "tutor"
        ? { type: review.type, booking: review.booking }
        : { type: review.type, author: review.author };
    await Rating.findOneAndUpdate(
      filter,
      { $set: review },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  await Booking.deleteMany({
    _id: {
      $in: [
        objectId("650000000000000000000025"),
        objectId("650000000000000000000026"),
      ],
    },
  });

  console.log(
    `Seeded ${subjects.length} subjects, 8 tutors, 2 students, ${slotDetails.length} sessions, ${bookingDetails.length} bookings, and ${reviews.length} ratings.`,
  );
  console.log(`Demo account password: ${demoPassword}`);
  for (const account of accountDetails)
    console.log(`${account.role.padEnd(7)} ${account.email}`);
}

seed()
  .catch((error) => {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
