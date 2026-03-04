/**
 * Seed script — populates the database with sample data.
 *
 * Usage:  node seed.js          (seeds data)
 *         node seed.js --reset  (drops all collections first, then seeds)
 *
 * Requires: MONGO_URI in server/.env
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ── Models ──────────────────────────────────────────────
import User from "./models/user.model.js";
import Assignment from "./models/assignment.model.js";
import Submission from "./models/submission.model.js";
import Notification from "./models/notification.model.js";

const RESET = process.argv.includes("--reset");
const PASSWORD_HASH = bcrypt.hashSync("123456", 10);
const SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

// ── Helper ──────────────────────────────────────────────
const oid = (hex) => new mongoose.Types.ObjectId(hex);

// Fixed ObjectIds so relationships are deterministic
const ADMIN_ID    = oid("69a73994b03b9e102f555b04");
const STUDENT_IDS = [
  oid("65a00000000000000000aa01"),
  oid("65a00000000000000000aa02"),
  oid("65a00000000000000000aa03"),
  oid("65a00000000000000000aa04"),
  oid("65a00000000000000000aa05"),
  oid("65a00000000000000000aa06"),
];
const ASSIGNMENT_IDS = [
  oid("65b00000000000000000bb01"),
  oid("65b00000000000000000bb02"),
  oid("65b00000000000000000bb03"),
  oid("65b00000000000000000bb04"),
  oid("65b00000000000000000bb05"),
  oid("65b00000000000000000bb06"),
  oid("65b00000000000000000bb07"),
  oid("65b00000000000000000bb08"),
];

// ── Users ───────────────────────────────────────────────
const users = [
  {
    _id: ADMIN_ID,
    name: "Ayush",
    email: "ayush@gmail.com",
    password: "$2a$10$R8UoywTX9p7sBpqH1OZdsOsmdoUwpAKy9jI2B749dJz0jqy5GYvoa",
    role: "admin",
    profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  {
    _id: STUDENT_IDS[0],
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    password: PASSWORD_HASH,
    role: "student",
    profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  {
    _id: STUDENT_IDS[1],
    name: "Priya Singh",
    email: "priya@gmail.com",
    password: PASSWORD_HASH,
    role: "student",
    profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  {
    _id: STUDENT_IDS[2],
    name: "Amit Patel",
    email: "amit@gmail.com",
    password: PASSWORD_HASH,
    role: "student",
    profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  {
    _id: STUDENT_IDS[3],
    name: "Neha Gupta",
    email: "neha@gmail.com",
    password: PASSWORD_HASH,
    role: "student",
    profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  {
    _id: STUDENT_IDS[4],
    name: "Vikram Reddy",
    email: "vikram@gmail.com",
    password: PASSWORD_HASH,
    role: "student",
    profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  {
    _id: STUDENT_IDS[5],
    name: "Ananya Das",
    email: "ananya@gmail.com",
    password: PASSWORD_HASH,
    role: "student",
    profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
];

// ── Assignments ─────────────────────────────────────────
const now = new Date();
const day = (d) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + d);
  return dt;
};

const assignments = [
  // 1 — Active, due in 7 days, with attachment
  {
    _id: ASSIGNMENT_IDS[0],
    title: "Data Structures — Linked List Implementation",
    description:
      "Implement a singly linked list in C++ with operations: insert, delete, search, and reverse. Include a main function that demonstrates each operation with sample data. Submit a single PDF with your code and output screenshots.",
    dueDate: day(7),
    maxScore: 100,
    status: "active",
    attachmentUrl: SAMPLE_PDF,
    attachmentName: "linked-list-instructions.pdf",
    createdBy: ADMIN_ID,
    createdAt: day(-5),
    updatedAt: day(-5),
  },
  // 2 — Active, due in 3 days (urgent)
  {
    _id: ASSIGNMENT_IDS[1],
    title: "Database Normalization Exercise",
    description:
      "Given the un-normalized tables in the attached PDF, normalize them to 3NF. Show each step (1NF → 2NF → 3NF) with functional dependencies identified. Draw the final ER diagram.",
    dueDate: day(3),
    maxScore: 50,
    status: "active",
    attachmentUrl: SAMPLE_PDF,
    attachmentName: "normalization-tables.pdf",
    createdBy: ADMIN_ID,
    createdAt: day(-10),
    updatedAt: day(-10),
  },
  // 3 — Active, due in 14 days
  {
    _id: ASSIGNMENT_IDS[2],
    title: "Operating Systems — Process Scheduling Simulation",
    description:
      "Write a program that simulates FCFS, SJF, and Round-Robin CPU scheduling algorithms. Compare average waiting time and turnaround time for a given set of processes. Language: Python or Java.",
    dueDate: day(14),
    maxScore: 100,
    status: "active",
    createdBy: ADMIN_ID,
    createdAt: day(-2),
    updatedAt: day(-2),
  },
  // 4 — Active, due in 10 days
  {
    _id: ASSIGNMENT_IDS[3],
    title: "Web Development — REST API Design",
    description:
      "Design a RESTful API for a library management system. Include endpoints for books, members, and borrowings. Provide a Postman collection or OpenAPI spec document along with a brief write-up on your design decisions.",
    dueDate: day(10),
    maxScore: 75,
    status: "active",
    createdBy: ADMIN_ID,
    createdAt: day(-3),
    updatedAt: day(-3),
  },
  // 5 — Closed (past due, all evaluated)
  {
    _id: ASSIGNMENT_IDS[4],
    title: "Computer Networks — TCP/IP Analysis",
    description:
      "Capture a TCP handshake using Wireshark, annotate each packet, and explain the 3-way handshake process. Include screenshots and a 2-page analysis report.",
    dueDate: day(-10),
    maxScore: 50,
    status: "closed",
    attachmentUrl: SAMPLE_PDF,
    attachmentName: "wireshark-guide.pdf",
    createdBy: ADMIN_ID,
    createdAt: day(-25),
    updatedAt: day(-10),
  },
  // 6 — Closed (past due, partially evaluated)
  {
    _id: ASSIGNMENT_IDS[5],
    title: "Mathematics — Linear Algebra Problem Set",
    description:
      "Solve problems 1-15 from Chapter 4 (Eigenvalues and Eigenvectors). Show all working steps. Neatly write or type your solutions and submit as a single PDF.",
    dueDate: day(-5),
    maxScore: 100,
    status: "closed",
    createdBy: ADMIN_ID,
    createdAt: day(-20),
    updatedAt: day(-5),
  },
  // 7 — Active, due tomorrow (very urgent)
  {
    _id: ASSIGNMENT_IDS[6],
    title: "Software Engineering — UML Diagrams",
    description:
      "Create a Use Case diagram, Class diagram, and Sequence diagram for an online food ordering system. Use any UML tool (draw.io, Lucidchart, StarUML). Export as PDF.",
    dueDate: day(1),
    maxScore: 60,
    status: "active",
    createdBy: ADMIN_ID,
    createdAt: day(-7),
    updatedAt: day(-7),
  },
  // 8 — Active, due in 21 days (far future)
  {
    _id: ASSIGNMENT_IDS[7],
    title: "Machine Learning — Linear Regression from Scratch",
    description:
      "Implement linear regression using gradient descent in Python (no sklearn for the model itself). Test on the provided housing dataset. Include plots of cost function convergence and predicted vs actual values.",
    dueDate: day(21),
    maxScore: 100,
    attachmentUrl: SAMPLE_PDF,
    attachmentName: "housing-dataset-info.pdf",
    status: "active",
    createdBy: ADMIN_ID,
    createdAt: day(-1),
    updatedAt: day(-1),
  },
];

// ── Submissions ─────────────────────────────────────────
// Mix of: submitted (pending evaluation), evaluated (scored), not submitted
const submissions = [
  // ─── Assignment 1 (Active, due +7d): 4 of 6 students submitted, 2 evaluated ───
  {
    assignmentId: ASSIGNMENT_IDS[0],
    studentId: STUDENT_IDS[0], // Rahul
    fileUrl: SAMPLE_PDF,
    fileName: "rahul-linked-list.pdf",
    fileSize: 245000,
    status: "evaluated",
    score: 88,
    feedback: "Great implementation! Minor issue with the reverse function edge case. Overall excellent work.",
    evaluatedAt: day(-1),
    createdAt: day(-3),
    updatedAt: day(-1),
  },
  {
    assignmentId: ASSIGNMENT_IDS[0],
    studentId: STUDENT_IDS[1], // Priya
    fileUrl: SAMPLE_PDF,
    fileName: "priya-linked-list.pdf",
    fileSize: 198000,
    status: "evaluated",
    score: 95,
    feedback: "Excellent work! Clean code, well-documented, all operations work correctly.",
    evaluatedAt: day(-1),
    createdAt: day(-4),
    updatedAt: day(-1),
  },
  {
    assignmentId: ASSIGNMENT_IDS[0],
    studentId: STUDENT_IDS[2], // Amit
    fileUrl: SAMPLE_PDF,
    fileName: "amit-linked-list.pdf",
    fileSize: 312000,
    status: "submitted",
    createdAt: day(-2),
    updatedAt: day(-2),
  },
  {
    assignmentId: ASSIGNMENT_IDS[0],
    studentId: STUDENT_IDS[3], // Neha
    fileUrl: SAMPLE_PDF,
    fileName: "neha-linked-list.pdf",
    fileSize: 178000,
    status: "submitted",
    createdAt: day(-1),
    updatedAt: day(-1),
  },
  // Students 4,5 (Vikram, Ananya) have NOT submitted for Assignment 1

  // ─── Assignment 2 (Active, due +3d): 3 submitted, 1 evaluated ───
  {
    assignmentId: ASSIGNMENT_IDS[1],
    studentId: STUDENT_IDS[0], // Rahul
    fileUrl: SAMPLE_PDF,
    fileName: "rahul-normalization.pdf",
    fileSize: 156000,
    status: "submitted",
    createdAt: day(-1),
    updatedAt: day(-1),
  },
  {
    assignmentId: ASSIGNMENT_IDS[1],
    studentId: STUDENT_IDS[2], // Amit
    fileUrl: SAMPLE_PDF,
    fileName: "amit-normalization.pdf",
    fileSize: 210000,
    status: "evaluated",
    score: 42,
    feedback: "Good understanding of 1NF and 2NF. The 3NF decomposition has a transitive dependency you missed. Review the notes on partial vs transitive dependencies.",
    evaluatedAt: day(-1),
    createdAt: day(-3),
    updatedAt: day(-1),
  },
  {
    assignmentId: ASSIGNMENT_IDS[1],
    studentId: STUDENT_IDS[4], // Vikram
    fileUrl: SAMPLE_PDF,
    fileName: "vikram-normalization.pdf",
    fileSize: 189000,
    status: "submitted",
    createdAt: day(-2),
    updatedAt: day(-2),
  },

  // ─── Assignment 3 (Active, due +14d): 1 submitted so far ───
  {
    assignmentId: ASSIGNMENT_IDS[2],
    studentId: STUDENT_IDS[1], // Priya (early bird)
    fileUrl: SAMPLE_PDF,
    fileName: "priya-scheduling.pdf",
    fileSize: 420000,
    status: "submitted",
    createdAt: day(-1),
    updatedAt: day(-1),
  },

  // ─── Assignment 4 (Active, due +10d): 2 submitted ───
  {
    assignmentId: ASSIGNMENT_IDS[3],
    studentId: STUDENT_IDS[3], // Neha
    fileUrl: SAMPLE_PDF,
    fileName: "neha-rest-api.pdf",
    fileSize: 330000,
    status: "submitted",
    createdAt: day(-1),
    updatedAt: day(-1),
  },
  {
    assignmentId: ASSIGNMENT_IDS[3],
    studentId: STUDENT_IDS[5], // Ananya
    fileUrl: SAMPLE_PDF,
    fileName: "ananya-rest-api.pdf",
    fileSize: 275000,
    status: "submitted",
    createdAt: day(-2),
    updatedAt: day(-2),
  },

  // ─── Assignment 5 (Closed): All 6 students submitted, all evaluated ───
  {
    assignmentId: ASSIGNMENT_IDS[4],
    studentId: STUDENT_IDS[0],
    fileUrl: SAMPLE_PDF,
    fileName: "rahul-tcp.pdf",
    fileSize: 540000,
    status: "evaluated",
    score: 45,
    feedback: "Thorough analysis with clear annotations. Well done!",
    evaluatedAt: day(-12),
    createdAt: day(-15),
    updatedAt: day(-12),
  },
  {
    assignmentId: ASSIGNMENT_IDS[4],
    studentId: STUDENT_IDS[1],
    fileUrl: SAMPLE_PDF,
    fileName: "priya-tcp.pdf",
    fileSize: 480000,
    status: "evaluated",
    score: 50,
    feedback: "Perfect! Every packet annotated correctly with detailed explanation.",
    evaluatedAt: day(-12),
    createdAt: day(-16),
    updatedAt: day(-12),
  },
  {
    assignmentId: ASSIGNMENT_IDS[4],
    studentId: STUDENT_IDS[2],
    fileUrl: SAMPLE_PDF,
    fileName: "amit-tcp.pdf",
    fileSize: 390000,
    status: "evaluated",
    score: 38,
    feedback: "Good effort. Missing analysis of FIN packets. The handshake explanation is correct though.",
    evaluatedAt: day(-11),
    createdAt: day(-14),
    updatedAt: day(-11),
  },
  {
    assignmentId: ASSIGNMENT_IDS[4],
    studentId: STUDENT_IDS[3],
    fileUrl: SAMPLE_PDF,
    fileName: "neha-tcp.pdf",
    fileSize: 410000,
    status: "evaluated",
    score: 47,
    feedback: "Very well written analysis. Minor point: the window size explanation could be expanded.",
    evaluatedAt: day(-11),
    createdAt: day(-15),
    updatedAt: day(-11),
  },
  {
    assignmentId: ASSIGNMENT_IDS[4],
    studentId: STUDENT_IDS[4],
    fileUrl: SAMPLE_PDF,
    fileName: "vikram-tcp.pdf",
    fileSize: 355000,
    status: "evaluated",
    score: 41,
    feedback: "Decent work. Screenshots are clear but the written analysis needs more depth.",
    evaluatedAt: day(-11),
    createdAt: day(-13),
    updatedAt: day(-11),
  },
  {
    assignmentId: ASSIGNMENT_IDS[4],
    studentId: STUDENT_IDS[5],
    fileUrl: SAMPLE_PDF,
    fileName: "ananya-tcp.pdf",
    fileSize: 425000,
    status: "evaluated",
    score: 49,
    feedback: "Excellent annotations and a very insightful analysis report.",
    evaluatedAt: day(-12),
    createdAt: day(-14),
    updatedAt: day(-12),
  },

  // ─── Assignment 6 (Closed): 5 submitted, 3 evaluated, 2 pending eval ───
  {
    assignmentId: ASSIGNMENT_IDS[5],
    studentId: STUDENT_IDS[0],
    fileUrl: SAMPLE_PDF,
    fileName: "rahul-linear-algebra.pdf",
    fileSize: 290000,
    status: "evaluated",
    score: 78,
    feedback: "Correct solutions for most problems. Problem 12 has a calculation error in the eigenvalue step.",
    evaluatedAt: day(-3),
    createdAt: day(-8),
    updatedAt: day(-3),
  },
  {
    assignmentId: ASSIGNMENT_IDS[5],
    studentId: STUDENT_IDS[1],
    fileUrl: SAMPLE_PDF,
    fileName: "priya-linear-algebra.pdf",
    fileSize: 320000,
    status: "evaluated",
    score: 96,
    feedback: "Outstanding! All problems solved correctly with detailed working.",
    evaluatedAt: day(-3),
    createdAt: day(-9),
    updatedAt: day(-3),
  },
  {
    assignmentId: ASSIGNMENT_IDS[5],
    studentId: STUDENT_IDS[2],
    fileUrl: SAMPLE_PDF,
    fileName: "amit-linear-algebra.pdf",
    fileSize: 265000,
    status: "evaluated",
    score: 65,
    feedback: "Several problems incomplete. Please review Chapter 4 sections on diagonalization.",
    evaluatedAt: day(-2),
    createdAt: day(-7),
    updatedAt: day(-2),
  },
  {
    assignmentId: ASSIGNMENT_IDS[5],
    studentId: STUDENT_IDS[3],
    fileUrl: SAMPLE_PDF,
    fileName: "neha-linear-algebra.pdf",
    fileSize: 310000,
    status: "submitted", // Not yet evaluated
    createdAt: day(-6),
    updatedAt: day(-6),
  },
  {
    assignmentId: ASSIGNMENT_IDS[5],
    studentId: STUDENT_IDS[4],
    fileUrl: SAMPLE_PDF,
    fileName: "vikram-linear-algebra.pdf",
    fileSize: 280000,
    status: "submitted", // Not yet evaluated
    createdAt: day(-7),
    updatedAt: day(-7),
  },
  // Ananya did NOT submit for Assignment 6

  // ─── Assignment 7 (Active, due tomorrow): 3 submitted ───
  {
    assignmentId: ASSIGNMENT_IDS[6],
    studentId: STUDENT_IDS[0],
    fileUrl: SAMPLE_PDF,
    fileName: "rahul-uml.pdf",
    fileSize: 520000,
    status: "submitted",
    createdAt: day(-1),
    updatedAt: day(-1),
  },
  {
    assignmentId: ASSIGNMENT_IDS[6],
    studentId: STUDENT_IDS[1],
    fileUrl: SAMPLE_PDF,
    fileName: "priya-uml.pdf",
    fileSize: 490000,
    status: "submitted",
    createdAt: day(0),
    updatedAt: day(0),
  },
  {
    assignmentId: ASSIGNMENT_IDS[6],
    studentId: STUDENT_IDS[5],
    fileUrl: SAMPLE_PDF,
    fileName: "ananya-uml.pdf",
    fileSize: 460000,
    status: "submitted",
    createdAt: day(0),
    updatedAt: day(0),
  },

  // ─── Assignment 8 (Active, due +21d): 0 submitted (too new) ───
  // (no submissions)
];

// ── Notifications ──────────────────────────────────────
const notifications = [];

// Assignment-created notifications for all students for recent assignments
for (const a of assignments.slice(-3)) {
  for (const sid of STUDENT_IDS) {
    notifications.push({
      userId: sid,
      message: `New assignment: ${a.title}`,
      type: "assignment",
      link: `/dashboard/assignments/${a._id}`,
      read: Math.random() > 0.5, // randomly read/unread
      createdAt: a.createdAt,
      updatedAt: a.createdAt,
    });
  }
}

// Evaluation notifications for evaluated submissions
for (const sub of submissions.filter((s) => s.status === "evaluated")) {
  const assignment = assignments.find(
    (a) => a._id.toString() === sub.assignmentId.toString()
  );
  if (!assignment) continue;
  notifications.push({
    userId: sub.studentId,
    message: `Your submission for "${assignment.title}" has been evaluated. Score: ${sub.score}/${assignment.maxScore}`,
    type: "evaluation",
    link: `/dashboard/assignments/${assignment._id}`,
    read: Math.random() > 0.4,
    createdAt: sub.evaluatedAt,
    updatedAt: sub.evaluatedAt,
  });
}

// Submission notifications for admin
for (const sub of submissions.slice(-8)) {
  const student = users.find(
    (u) => u._id.toString() === sub.studentId.toString()
  );
  const assignment = assignments.find(
    (a) => a._id.toString() === sub.assignmentId.toString()
  );
  if (!student || !assignment) continue;
  notifications.push({
    userId: ADMIN_ID,
    message: `New submission from ${student.name} for "${assignment.title}"`,
    type: "assignment",
    link: `/admin/assignments/${assignment._id}`,
    read: Math.random() > 0.6,
    createdAt: sub.createdAt,
    updatedAt: sub.createdAt,
  });
}

// ── Seed execution ──────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    if (RESET) {
      console.log("⚠ Resetting database...");
      await User.deleteMany({});
      await Assignment.deleteMany({});
      await Submission.deleteMany({});
      await Notification.deleteMany({});
      console.log("✓ All collections cleared");
    }

    // Upsert users (so re-running doesn't fail on duplicate emails)
    for (const u of users) {
      await User.findOneAndUpdate({ _id: u._id }, u, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    console.log(`✓ ${users.length} users seeded (1 admin + ${users.length - 1} students)`);

    // Upsert assignments
    for (const a of assignments) {
      await Assignment.findOneAndUpdate({ _id: a._id }, a, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    console.log(`✓ ${assignments.length} assignments seeded`);

    // Upsert submissions
    for (const s of submissions) {
      await Submission.findOneAndUpdate(
        { assignmentId: s.assignmentId, studentId: s.studentId },
        s,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`✓ ${submissions.length} submissions seeded`);

    // Clear and re-insert notifications (since they don't have stable IDs)
    await Notification.deleteMany({});
    await Notification.insertMany(notifications);
    console.log(`✓ ${notifications.length} notifications seeded`);

    console.log("\n🎉 Seed complete! Summary:");
    console.log(`   Students: ${users.filter((u) => u.role === "student").length} (password: 123456)`);
    console.log(`   Admins:   ${users.filter((u) => u.role === "admin").length} (ayush@gmail.com)`);
    console.log(`   Active assignments:  ${assignments.filter((a) => a.status === "active").length}`);
    console.log(`   Closed assignments:  ${assignments.filter((a) => a.status === "closed").length}`);
    console.log(`   Total submissions:   ${submissions.length}`);
    console.log(`     • Evaluated:       ${submissions.filter((s) => s.status === "evaluated").length}`);
    console.log(`     • Pending review:  ${submissions.filter((s) => s.status === "submitted").length}`);
    console.log(`   Notifications:       ${notifications.length}`);

    console.log("\n📧 Student logins (all passwords: 123456):");
    users
      .filter((u) => u.role === "student")
      .forEach((u) => console.log(`   ${u.name.padEnd(16)} → ${u.email}`));

  } catch (err) {
    console.error("✗ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n✓ Disconnected from MongoDB");
  }
}

seed();
