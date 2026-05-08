const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (place your HTML/CSS/JS in the "public" folder)
app.use(express.static(path.join(__dirname, 'public')));

// ─── Career Skill Requirements ────────────────────────────────────────────────
const careerRequirements = {
  fullstack:    ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST API'],
  backend:      ['Node.js', 'Express', 'SQL', 'MongoDB', 'REST API', 'Git', 'DSA', 'Docker'],
  aiml:         ['Python', 'Machine Learning', 'TensorFlow', 'NumPy', 'Pandas', 'DSA', 'Math', 'Scikit-learn'],
  datascience:  ['Python', 'SQL', 'Pandas', 'NumPy', 'Tableau', 'Statistics', 'Machine Learning', 'Excel'],
  cybersecurity:['Networking', 'Linux', 'Python', 'Cryptography', 'Ethical Hacking', 'Firewalls', 'SQL', 'DSA'],
  cloud:        ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Terraform', 'Git', 'Networking'],
};

const careerLabels = {
  fullstack:    'Full Stack Developer',
  backend:      'Backend Developer',
  aiml:         'AI / ML Engineer',
  datascience:  'Data Scientist',
  cybersecurity:'Cybersecurity Analyst',
  cloud:        'Cloud / DevOps Engineer',
};

// ─── Scoring Helper ───────────────────────────────────────────────────────────
function calculateScore(data) {
  const {
    cgpa = 0, semester = 1, projects = 0, internships = 0,
    dsa = 0, communication = 0, certifications = 0,
    hackathons = 0, skillText = '', goal = 'fullstack',
    resume = '', projectDesc = '',
  } = data;

  const userSkills = skillText.toLowerCase().split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  const required   = careerRequirements[goal] || [];
  const matched    = required.filter(r => userSkills.some(u => u.includes(r.toLowerCase())));
  const gaps       = required.filter(r => !userSkills.some(u => u.includes(r.toLowerCase())));

  // Sub-scores (each normalised to 100)
  const cgpaScore       = Math.min((cgpa / 10) * 100, 100);
  const dsaScore        = Math.min((dsa  / 10) * 100, 100);
  const commScore       = Math.min((communication / 10) * 100, 100);
  const projectScore    = Math.min(projects   * 15, 100);
  const internScore     = Math.min(internships * 25, 100);
  const certScore       = Math.min(certifications * 12, 100);
  const hackScore       = Math.min(hackathons  * 18, 100);
  const skillScore      = required.length ? (matched.length / required.length) * 100 : 50;
  const resumeScore     = resume.length > 200 ? Math.min(60 + Math.floor(resume.length / 80), 100) : 40;
  const semesterBonus   = Math.min((semester / 8) * 20, 20);

  // Weighted composite
  const composite = Math.round(
    cgpaScore    * 0.20 +
    dsaScore     * 0.15 +
    commScore    * 0.10 +
    skillScore   * 0.20 +
    projectScore * 0.12 +
    internScore  * 0.10 +
    certScore    * 0.05 +
    hackScore    * 0.05 +
    resumeScore  * 0.03 +
    semesterBonus
  );

  const finalScore = Math.min(Math.max(composite, 0), 100);

  // Placement probability
  let placement;
  if (finalScore >= 80) placement = 'High (85–95%)';
  else if (finalScore >= 60) placement = 'Medium (55–75%)';
  else placement = 'Low (20–45%)';

  // Risk label
  let risk;
  if (finalScore >= 75) risk = '🟢 Low Risk';
  else if (finalScore >= 50) risk = '🟡 Medium Risk';
  else risk = '🔴 High Risk';

  // Strengths
  const strengths = [];
  if (cgpa >= 8)         strengths.push(`Strong CGPA of ${cgpa}`);
  if (dsa >= 7)          strengths.push('Solid DSA foundation');
  if (communication >= 7) strengths.push('Good communication skills');
  if (projects >= 3)     strengths.push(`${projects} projects showcase practical exposure`);
  if (internships >= 1)  strengths.push('Real-world internship experience');
  if (hackathons >= 2)   strengths.push('Active hackathon participation');
  if (certifications >= 3) strengths.push('Well-certified profile');
  if (matched.length >= Math.ceil(required.length * 0.7))
    strengths.push(`Strong skill match for ${careerLabels[goal]}`);

  // Roadmap phases based on gaps & score
  const roadmap = buildRoadmap(goal, gaps, finalScore, semester);

  // Performance breakdown (visible as bars on the frontend)
  const breakdown = {
    'CGPA':          Math.round(cgpaScore),
    'DSA':           Math.round(dsaScore),
    'Communication': Math.round(commScore),
    'Projects':      Math.round(projectScore),
    'Internships':   Math.round(internScore),
    'Skills Match':  Math.round(skillScore),
    'Certifications':Math.round(certScore),
    'Hackathons':    Math.round(hackScore),
  };

  return {
    score: finalScore,
    career: careerLabels[goal],
    placement,
    risk,
    resumeScore: `${Math.min(resumeScore, 100)}/100`,
    gaps,
    strengths,
    breakdown,
    roadmap,
    pitch: generatePitch(data, finalScore, careerLabels[goal], gaps),
    summary: generateSummary(data, finalScore, careerLabels[goal]),
  };
}

// ─── Roadmap Builder ──────────────────────────────────────────────────────────
function buildRoadmap(goal, gaps, score, semester) {
  const phases = [];

  if (score < 50 || gaps.length >= 5) {
    phases.push({
      phase: 'Phase 1 – Foundation (Months 1–2)',
      tasks: [
        'Strengthen core programming fundamentals (loops, OOP, recursion)',
        'Complete a DSA course on LeetCode or GeeksForGeeks',
        gaps.slice(0, 3).map(g => `Learn: ${g}`),
      ].flat(),
    });
  }

  phases.push({
    phase: `Phase ${phases.length + 1} – Skill Building (Months ${phases.length * 2 + 1}–${phases.length * 2 + 3})`,
    tasks: [
      ...(gaps.length ? gaps.slice(0, 4).map(g => `Master: ${g}`) : [`Deepen expertise in ${goal} stack`]),
      'Build 1 real-world project end-to-end',
      'Push code daily to GitHub',
    ],
  });

  phases.push({
    phase: `Phase ${phases.length + 1} – Projects & Portfolio (Months ${phases.length * 2 + 1}–${phases.length * 2 + 2})`,
    tasks: [
      'Build 2 portfolio projects with full documentation',
      'Deploy projects on Vercel / Heroku / AWS',
      'Write LinkedIn posts about your projects',
      'Contribute to 1 open-source repository',
    ],
  });

  if (semester >= 5) {
    phases.push({
      phase: `Phase ${phases.length + 1} – Internship & Interview Prep`,
      tasks: [
        'Apply for internships on LinkedIn, Internshala, AngelList',
        'Solve 100+ LeetCode problems (Easy + Medium)',
        'Mock interviews via Pramp or peers',
        'Refine resume with measurable achievements',
      ],
    });
  }

  phases.push({
    phase: `Phase ${phases.length + 1} – Placement Ready`,
    tasks: [
      'Earn 1–2 relevant certifications (AWS, Google, Coursera)',
      'Attend 2 hackathons for networking',
      'Reach out to professionals via LinkedIn',
      'Final resume ATS optimisation',
    ],
  });

  return phases;
}

// ─── Pitch Generator ──────────────────────────────────────────────────────────
function generatePitch(data, score, career, gaps) {
  const name = data.name || 'This student';
  return `${name} is a Semester ${data.semester} engineering student targeting a career as a ${career}. ` +
    `With a CGPA of ${data.cgpa}, ${data.projects} projects, and ${data.internships} internship(s), ` +
    `the profile scores ${score}/100. ` +
    (gaps.length
      ? `Key skill gaps to bridge: ${gaps.slice(0, 3).join(', ')}. `
      : 'The skill set is well-aligned with the target role. ') +
    `GradPath AI provides a personalized roadmap to close these gaps and maximise placement probability.`;
}
