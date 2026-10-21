// Seeds Richfield 2027 prospectus modules and clearly fictional demo tutors.
// Run from the server directory: node seed-richfield-2027.js
import "./config.js"; // loads server/.env
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Subject from "./models/Subject.js";
import User from "./models/User.js";
import TutorProfile from "./models/TutorProfile.js";

const curriculum = {
  "BSc Information Technology (BSc IT)": [
    "Information Systems 511", "Information Systems 512", "Programming 511", "Programming 512", "Web Technology 511", "Web Technology 512", "Networks 511", "Networks 512", "Mathematics 511", "Mathematics 512", "Data Science 500",
    "Information Systems 621", "Information Systems 622", "Programming 621", "Programming 622", "Database Systems 600", "Big Data & IOT 600", "Cloud Computing 600", "Machine Learning 600", "Internet Programming 621", "Internet Programming 622", "Data Manipulation & Visualisation 600", "Statistics for Data Science 600", "Business Analysis 621", "Business Analysis 622", "Computer Architecture 600", "Server Technology 600",
    "Software Engineering 700", "IT Project 700", "Programming 731", "Programming 732", "Cyber Security 700", "Mobile App Development 700", "Artificial Intelligence 700", "Work Integrated Learning 700", "Human Computer Interaction 700", "Operating Systems 700", "Programming 741", "Programming 742", "Machine Learning 700", "Autonomous Systems & Robotics 700", "IT Strategic Management 731", "IT Strategic Management 732", "Networks 731", "Networks 732"
  ],
  "Diploma in Information Technology (DIT)": [
    "Software Development 500", "Business Communication 500", "M-Commerce 621", "M-Commerce 622", "Database Systems 621", "Database Systems 622", "Business Management 621", "Business Management 622", "Networks 621", "Networks 622", "Software Engineering 600", "Quantitative Techniques 600", "IT Project Management 600", "IT Project 600", "Management Information Systems 600", "Human Computer Interaction 600", "Operating Systems 600", "Programming 631", "Programming 632", "Networks 631", "Networks 632", "Business Analysis 631", "Business Analysis 632"
  ],
  "Higher Certificate in Information Technology (HCIT)": [
    "Introduction to Computers 500", "System Software 500", "e-Commerce 511", "e-Commerce 512", "Introduction to Web Tech 500", "Introduction to Programming 500", "Introduction to Information Technology 500", "Business Communication 500", "Work Integrated Learning 500", "IT Help Desk 500"
  ],
  "Higher Certificate in Computer Forensics": [
    "Forensic Computing Foundations 500", "Forensic Science 500", "Forensic Exploitation and Intelligence 500", "Internet Forensics 500", "Digital Crime and Investigation 500", "Network Forensics 500", "Advanced Forensic Computing 500"
  ],
  "BSc Honours in Information Technology": [
    "Information and Cyber Security 800", "Metaverse 800", "Research Methodology 800", "Big Data Analytics 800", "Information Technology Strategy and Governance 800", "Research Project 800", "Advanced Software Engineering 800", "IT Entrepreneurship and Innovation", "IT Law and Ethics"
  ],
  "BSc IT Honours Bridging Programme": [
    "Elementary Algebra", "Emerging Technologies", "Fundamentals of Research Methodology", "Theory of Programming", "Web Technology"
  ],
  "Bachelor of Commerce (BCom)": [
    "Business Ethics 500", "Economics 511", "Economics 512", "Accounting 511", "Accounting 512", "Statistics 511", "Statistics 512", "Information Systems 511", "Information Systems 512", "Human Resource Management 511", "Human Resource Management 512", "Marketing Management 511", "Marketing Management 512", "Entrepreneurship 500", "Economics 621", "Economics 622", "Stakeholder Relations 621", "Stakeholder Relations 622", "Commercial Law 621", "Commercial Law 622", "Accounting 621", "Accounting 622", "Marketing Management 621", "Marketing Management 622", "Human Resource Management 621", "Human Resource Management 622", "Strategic Management 731", "Strategic Management 732", "Market Research 700", "Training & Development 700", "Entrepreneurship & Small Business Management 700", "Total Quality Management 700", "Contemporary Issues in Industrial Relations 700", "Work Integrated Learning 700", "Accounting 731", "Accounting 732", "Marketing Management 731", "Marketing Management 732", "Human Resource Management 731", "Human Resource Management 732"
  ],
  "Bachelor of Commerce (AGA)": [
    "Auditing 621", "Auditing 622", "Taxation 621", "Taxation 622", "Financial Management & Managerial Accounting 621", "Financial Management & Managerial Accounting 622", "Auditing and Assurance 731", "Auditing and Assurance 732", "Taxation 731", "Taxation 732", "Financial Management & Managerial Accounting 731", "Financial Management & Managerial Accounting 732"
  ],
  "Bachelor of Commerce (AGA IT)": [
    "Business Ethics 500", "Economics 511", "Economics 512", "Accounting 511", "Accounting 512", "Statistics 511", "Statistics 512", "Information Systems 511", "Information Systems 512", "Entrepreneurship 500", "Auditing 621", "Auditing 622", "Information Technology Governance, Risk and Compliance 621", "Information Technology Governance, Risk and Compliance 622", "Applied Programming and Automation for Business 621", "Applied Programming and Automation for Business 622", "Accounting 621", "Accounting 622", "Financial Management & Managerial Accounting 621", "Financial Management & Managerial Accounting 622", "Taxation 621", "Taxation 622", "Accounting 731", "Accounting 732", "Applied Programming and Automation for Business 731", "Applied Programming and Automation for Business 732", "Information Technology Governance, Risk and Compliance 731", "Information Technology Governance, Risk and Compliance 732"
  ],
  "Bachelor of Business Administration (BBA)": [
    "Business Communication 511", "Business Communication 512", "Business Management 511", "Business Management 512", "Economics 511", "Economics 512", "Information Systems 511", "Information Systems 512", "Accounting 511", "Accounting 512", "Human Resource Management 511", "Human Resource Management 512", "Marketing Management 511", "Marketing Management 512", "Supply Chain Management 511", "Supply Chain Management 512", "Business Statistics 621", "Business Statistics 622", "Industrial Psychology 621", "Industrial Psychology 622", "Commercial Law 621", "Commercial Law 622", "Business Ethics 621", "Business Ethics 622", "Business Management 621", "Business Management 622", "Supply Chain Management 621", "Supply Chain Management 622", "Entrepreneurship and SBM 731", "Entrepreneurship and SBM 732", "Project Management 731", "Project Management 732", "Total Quality Management 731", "Total Quality Management 732", "Research Methodology 700", "Supply Chain Management 731", "Supply Chain Management 732"
  ],
  "Bachelor of Public Management (BPM)": [
    "Public Management 511", "Public Management 512", "Introduction to Economics 511", "Public Sector Economics 512", "Communication 500", "Fundamentals of Research 500", "Information Systems 511", "Information Systems 512", "Public Management 621", "Public Management 622", "Local Government Management 621", "Local Government Management 622", "Introduction to Politics 600", "Public Law 600", "Public Sector HRM 600", "Project Management 600", "Public Management 731", "Public Management 732", "Local Government Management 731", "Local Government Management 732", "Ethics in Public Sector 700", "Research Project 700", "Public Sector Finance 700", "Work Integrated Learning 700"
  ],
  "Diploma in Business Administration (DBA)": [
    "Business Communication 511", "Business Communication 512", "Business Management 511", "Business Management 512", "Information Systems 511", "Information Systems 512", "Accounting 511", "Accounting 512", "Training and Development 511", "Training and Development 512", "Economics 511", "Economics 512", "Human Resource Management 511", "Human Resource Management 512", "Supply Chain Management 511", "Supply Chain Management 512", "Business Management 621", "Business Management 622", "Business Statistics 621", "Business Statistics 622", "Commercial Law 621", "Commercial Law 622", "Marketing Management 621", "Marketing Management 622", "Total Quality Management 621", "Total Quality Management 622", "Local Government Management 631", "Local Government Management 632", "Strategic Management 631", "Strategic Management 632", "Fundamentals of Research 600", "Entrepreneurship and Small Business Management 631", "Entrepreneurship and Small Business Management 632", "Industrial Psychology 631", "Industrial Psychology 632", "Disaster Management 600", "Work Integrated Learning 600", "Project Management 631", "Project Management 632", "Economics 631", "Economics 632", "Public Management 631", "Public Management 632", "Human Resource Management 631", "Human Resource Management 632", "Supply Chain Management 631", "Supply Chain Management 632"
  ],
  "Diploma in Local Government Management (DLGM)": [
    "Local Government Management 511", "Local Government Management 512", "Public Management 511", "Public Management 512", "Information Systems 511", "Information Systems 512", "Business Communication 511", "Business Communication 512", "Local Government Management 621", "Local Government Management 622", "Economics 621", "Economics 622", "Local Government HRM 621", "Local Government HRM 622", "Local Government Procurement 600", "Local Government Policy Process 600", "Local Government Ethics and Professionalism 600", "Local Economic Development 600", "Professionalism 600", "Local Government Mandates 600", "Local Government Project Management 600", "Local Government Management 631", "Local Government Management 632", "Disaster Management 600", "Work Integrated Learning 600", "Public Management 631", "Public Management 632", "Local Government Service Delivery Mandates 600", "Research Project 600", "Local Government Finance 500", "Local Government Policing 500", "Ethics and Professionalism 500"
  ],
  "Higher Certificate in Business Administration (HCBA)": [
    "Economic Environment 500", "General Management 511", "General Management 512", "Fundamentals of Accounting 511", "Fundamentals of Accounting 512", "Information Systems 511", "Information Systems 512", "Introduction to Commercial Law 500", "Human Relations 500", "Marketing Management 500", "Work Integrated Learning 500"
  ],
  "Higher Certificate in Office Administration (HCOA)": [
    "Office Administration 511", "Office Administration 512", "Office Communication 511", "Office Communication 512", "Fundamentals of Accounting 511", "Fundamentals of Accounting 512", "Information Systems 511", "Information Systems 512", "Economic Environment 500", "Introduction to Commercial Law 500", "General Management 511", "General Management 512", "Human Relations 500", "Marketing Management 500", "Work Integrated Learning 500"
  ],
  "Higher Certificate in Local Government Management": [
    "Local Government Management 500", "Project Management 500", "Local Government HRM 500", "Disaster Management 500", "Local Government Policing 500", "Ethics and Professionalism 500", "Local Government Finance 500", "Work Integrated Learning 500"
  ],
  "Higher Certificate in Recognition of Prior Learning Activities": [
    "Facilitate Implementation of RPL 511", "RPL Applications 512", "Work Integrated Learning 500 (RPL)", "Profile 511"
  ],
  "Master of Business Administration (MBA)": [
    "Strategic Leadership 900", "Business Research 900", "Strategic Operations Management 900", "International Business Strategy 900", "Innovative Talent Management 900", "Managing Digital Transformation 900", "Strategic Financial Management 900", "Strategic Marketing Management 900", "Strategic Information Technology Management 900", "Entrepreneurship and Innovation 900", "Business Ethics and Corporate Governance 900", "Women in Leadership", "Emerging & Disruptive Technologies", "Global Immersion"
  ],
  "Postgraduate Diploma in Management (PGDM)": [
    "Managerial Economics 800", "Managerial Finance 800", "Marketing Management 800", "Human Resource Management 800", "Research Methodology 800", "Research Report 800", "Innovation and Change Management 800", "IT Management 800", "Operations Management 800", "Entrepreneurship and Innovation 800", "Public Sector Management 800", "Data Analytics for Managers 800"
  ],
  "Postgraduate Bridging Course: Management Technology and Research Foundation": [
    "Business Innovation", "Emerging Technologies", "Financial Management", "Fundamentals of Research Methodology", "Applied Economics"
  ]
};

// These are fictional sample identities with realistic names, NOT actual Richfield tutors.
// Replace them with verified tutor details before using this with real students.
const tutorDefinitions = [
  { name: "Aiden Naidoo", email: "demo.tutor01@example.com", focus: "Programming & Web Development", bio: "Fictional sample tutor focused on introductory programming, web development and software projects.", match: /program|web technology|internet programming|software development|mobile app|human computer interaction|system software|theory of programming/i },
  { name: "Kiara Pillay", email: "demo.tutor02@example.com", focus: "Software Engineering & Mobile Apps", bio: "Fictional sample tutor focused on software design, application development and user experience.", match: /software engineering|mobile app|human computer interaction|internet programming|m-commerce|e-commerce|programming/i },
  { name: "Thabo Mokoena", email: "demo.tutor03@example.com", focus: "Networks & Infrastructure", bio: "Fictional sample tutor focused on computer networks, servers, operating systems and cloud infrastructure.", match: /network|server technology|operating systems|computer architecture|cloud computing/i },
  { name: "Zanele Khumalo", email: "demo.tutor04@example.com", focus: "Cyber Security & Forensics", bio: "Fictional sample tutor focused on cyber security, digital investigations and computer forensics.", match: /cyber|security|forensic|digital crime|forensic computing|exploitation|investigation/i },
  { name: "Liam Petersen", email: "demo.tutor05@example.com", focus: "Data Science & Statistics", bio: "Fictional sample tutor focused on statistics, data preparation, visualisation and analytics.", match: /data science|data manipulation|visualisation|statistics|big data|analytics|quantitative techniques|business statistics/i },
  { name: "Amahle Dlamini", email: "demo.tutor06@example.com", focus: "Artificial Intelligence & Robotics", bio: "Fictional sample tutor focused on artificial intelligence, machine learning, robotics and emerging technology.", match: /machine learning|artificial intelligence|robotics|autonomous systems|iot|metaverse|emerging technologies|big data/i },
  { name: "Ethan Govender", email: "demo.tutor07@example.com", focus: "Databases & Information Systems", bio: "Fictional sample tutor focused on databases, information systems and business technology.", match: /database|information systems|management information systems|information technology governance|digital transformation/i },
  { name: "Noluthando Cele", email: "demo.tutor08@example.com", focus: "IT Projects & Business Analysis", bio: "Fictional sample tutor focused on business analysis, research, project planning and IT management.", match: /business analysis|it project|project management|research methodology|research project|it management|information technology strategy/i },
  { name: "Mia van der Merwe", email: "demo.tutor09@example.com", focus: "Accounting & Auditing", bio: "Fictional sample tutor focused on accounting principles, auditing and assurance.", match: /accounting|auditing|assurance|fundamentals of accounting/i },
  { name: "Siyabonga Ndlovu", email: "demo.tutor10@example.com", focus: "Taxation & Finance", bio: "Fictional sample tutor focused on taxation, financial management and finance modules.", match: /taxation|financial management|managerial finance|public sector finance|local government finance/i },
  { name: "Chloe Daniels", email: "demo.tutor11@example.com", focus: "Economics & Quantitative Methods", bio: "Fictional sample tutor focused on economics, quantitative methods and business statistics.", match: /economics|statistics|quantitative|business statistics|mathematics|algebra/i },
  { name: "Lethabo Molefe", email: "demo.tutor12@example.com", focus: "Business Management & Strategy", bio: "Fictional sample tutor focused on management, strategy, entrepreneurship and business operations.", match: /business management|strategic management|entrepreneurship|small business|quality management|general management|operations management|innovation|leadership|change management/i },
  { name: "Isabella Naicker", email: "demo.tutor13@example.com", focus: "Human Resources", bio: "Fictional sample tutor focused on human resource management, industrial psychology and workplace development.", match: /human resource|hrm|industrial psychology|training|development|human relations|industrial relations|talent/i },
  { name: "Musa Zulu", email: "demo.tutor14@example.com", focus: "Marketing & Communication", bio: "Fictional sample tutor focused on marketing, business communication and stakeholder relations.", match: /marketing|communication|stakeholder|market research|public relations/i },
  { name: "Leila Ismail", email: "demo.tutor15@example.com", focus: "Supply Chain & Procurement", bio: "Fictional sample tutor focused on supply chain, procurement, logistics and operations.", match: /supply chain|procurement|logistics|operations management/i },
  { name: "Sipho Dlamini", email: "demo.tutor16@example.com", focus: "Public Management & Policy", bio: "Fictional sample tutor focused on public management, public-sector policy, law and administration.", match: /public management|public sector|public law|politics|policy|ethics in public/i },
  { name: "Anika Moodley", email: "demo.tutor17@example.com", focus: "Local Government Management", bio: "Fictional sample tutor focused on local government, municipal administration and service delivery.", match: /local government|local economic development|municipal|disaster management|professionalism/i },
  { name: "Daniel Mthembu", email: "demo.tutor18@example.com", focus: "Office Administration", bio: "Fictional sample tutor focused on office administration, office communication and administrative systems.", match: /office administration|office communication|human relations|facilitate implementation|rpl applications/i },
  { name: "Fatima Khan", email: "demo.tutor19@example.com", focus: "Commercial Law & Business Ethics", bio: "Fictional sample tutor focused on commercial law, ethics, governance and responsible business.", match: /commercial law|business ethics|corporate governance|law and ethics|professionalism/i },
  { name: "Jordan Mkhize", email: "demo.tutor20@example.com", focus: "Research & Academic Skills", bio: "Fictional sample tutor focused on research methodology, academic foundations and study support.", match: /research|fundamentals of research|work integrated learning|business communication|elementary algebra/i },
  { name: "Keegan Botha", email: "demo.tutor21@example.com", focus: "Cloud & Systems Technology", bio: "Fictional sample tutor focused on cloud computing, server technology, system software and IT infrastructure.", match: /cloud computing|server technology|system software|operating systems|computer architecture|networks/i },
  { name: "Ayanda Buthelezi", email: "demo.tutor22@example.com", focus: "Leadership & Digital Transformation", bio: "Fictional sample tutor focused on leadership, technology strategy and digital transformation.", match: /strategic leadership|digital transformation|information technology strategy|it strategic management|it management|innovation/i },
  { name: "Riya Reddy", email: "demo.tutor23@example.com", focus: "Digital Investigation & Internet Forensics", bio: "Fictional sample tutor focused on internet forensics, digital crime and investigation modules.", match: /internet forensics|digital crime|forensic|network forensics|intelligence/i },
  { name: "Noah Jacobs", email: "demo.tutor24@example.com", focus: "Business Foundations & Study Support", bio: "Fictional sample tutor focused on foundational business, communication and general management modules.", match: /business communication|business management|information systems|general management|economic environment|introduction to computers|introduction to information technology/i }
];

const DEMO_PASSWORD = "DemoTutor2027!"; // Local demonstration only. Change/remove before deployment.

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Check server/.env.");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const programmeByModule = new Map();
  for (const [programme, modules] of Object.entries(curriculum)) {
    for (const rawName of modules) {
      const name = rawName.trim().replace(/\s+/g, " ");
      if (!programmeByModule.has(name)) programmeByModule.set(name, new Set());
      programmeByModule.get(name).add(programme);
    }
  }

  const subjectByName = new Map();
  for (const [name, programmes] of programmeByModule.entries()) {
    const description = `Richfield 2027 prospectus module. Programme(s): ${[...programmes].join("; ")}. Tutor profiles in this app are demonstration profiles.`;
    const subject = await Subject.findOneAndUpdate(
      { name },
      { $set: { description } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    subjectByName.set(name, subject);
  }
  console.log(`Created/updated ${subjectByName.size} curriculum module subjects.`);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let assigned = 0;
  for (const tutorDef of tutorDefinitions) {
    let user = await User.findOne({ email: tutorDef.email });
    if (!user) {
      user = await User.create({ name: tutorDef.name, email: tutorDef.email, password: passwordHash, role: "tutor" });
    } else {
      // These reserved example.com accounts are only the seed's own demo accounts.
      user.name = tutorDef.name;
      user.password = passwordHash;
      user.role = "tutor";
      await user.save();
    }

    const matchingSubjects = [...subjectByName.entries()]
      .filter(([name]) => tutorDef.match.test(name));
    // Limit each sample tutor to at most six modules and spread selections across
    // the matching list so one profile does not claim an unrealistic full curriculum.
    const maxSubjectsPerTutor = 6;
    const selectedMatches = matchingSubjects.length <= maxSubjectsPerTutor
      ? matchingSubjects
      : Array.from({ length: maxSubjectsPerTutor }, (_, index) =>
          matchingSubjects[Math.round(index * (matchingSubjects.length - 1) / (maxSubjectsPerTutor - 1))]
        );
    const subjectIds = selectedMatches.map(([, subject]) => subject._id);
    await TutorProfile.findOneAndUpdate(
      { user: user._id },
      { $set: { bio: `${tutorDef.bio} This is a fictional sample profile for local testing; verify tutor details before launch.`, subjects: subjectIds } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    assigned += subjectIds.length;
    console.log(`${tutorDef.name}: ${subjectIds.length} subjects`);
  }

  console.log("\nRichfield 2027 demo seed complete.");
  console.log(`Unique subjects: ${subjectByName.size}`);
  console.log(`Fictional sample tutor profiles: ${tutorDefinitions.length}`);
  console.log(`Total tutor-to-subject assignments: ${assigned}`);
  console.log(`Local sample tutor password: ${DEMO_PASSWORD}`);
  console.log("Do not deploy these fictional sample accounts to a public/production site. Replace them with verified tutors first.");
}

main()
  .catch((error) => {
    console.error("Richfield seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
