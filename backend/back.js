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