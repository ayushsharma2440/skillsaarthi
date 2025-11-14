const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ayushsharma2440_db_user:Ayush44@cluster0.hunv2k2.mongodb.net/';

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));

// Sessions (stored in MongoDB)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'skillsaarthi-dev-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Expose user + wallet to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.walletBalance =
    req.session.user && typeof req.session.user.tokens === 'number'
      ? req.session.user.tokens
      : 120;
  next();
});

// Mock data
const categories = [
  'Programming & Tech',
  'Design & Creative',
  'Marketing',
  'Writing & Translation',
  'Learning & Coaching',
  'Lifestyle'
];

const gigs = [
  {
    id: 1,
    title: 'I will build a responsive portfolio website',
    seller: 'Aarav Kumar',
    rating: 4.9,
    reviews: 38,
    category: 'Programming & Tech',
    tier: 'Advanced',
    tokens: 60,
    eta: '3-5 days'
  },
  {
    id: 2,
    title: 'I will design a minimal logo for your brand',
    seller: 'Sara Jain',
    rating: 4.8,
    reviews: 52,
    category: 'Design & Creative',
    tier: 'Intermediate',
    tokens: 35,
    eta: '2-3 days'
  },
  {
    id: 3,
    title: 'I will coach you for technical interviews',
    seller: 'Rohit Verma',
    rating: 5.0,
    reviews: 19,
    category: 'Learning & Coaching',
    tier: 'Advanced',
    tokens: 50,
    eta: '1-2 days'
  }
];

// Auth routes
app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('register', {
    title: 'Join SkillSaarthi',
    pageClass: 'page-auth',
    error: null
  });
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.render('register', {
        title: 'Join SkillSaarthi',
        pageClass: 'page-auth',
        error: 'Please fill in all fields.'
      });
    }

    if (password !== confirmPassword) {
      return res.render('register', {
        title: 'Join SkillSaarthi',
        pageClass: 'page-auth',
        error: 'Passwords do not match.'
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('register', {
        title: 'Join SkillSaarthi',
        pageClass: 'page-auth',
        error: 'That email is already registered.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, tokens: 120 });

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      tokens: user.tokens
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('register', {
      title: 'Join SkillSaarthi',
      pageClass: 'page-auth',
      error: 'Something went wrong. Please try again.'
    });
  }
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', {
    title: 'Log in | SkillSaarthi',
    pageClass: 'page-auth',
    error: null
  });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('login', {
        title: 'Log in | SkillSaarthi',
        pageClass: 'page-auth',
        error: 'Please enter your email and password.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', {
        title: 'Log in | SkillSaarthi',
        pageClass: 'page-auth',
        error: 'Invalid email or password.'
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render('login', {
        title: 'Log in | SkillSaarthi',
        pageClass: 'page-auth',
        error: 'Invalid email or password.'
      });
    }

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      tokens: user.tokens
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', {
      title: 'Log in | SkillSaarthi',
      pageClass: 'page-auth',
      error: 'Something went wrong. Please try again.'
    });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Routes
app.get('/', (req, res) => {
  res.render('home', {
    title: 'SkillSaarthi | Trade skills, not money',
    pageClass: 'page-home',
    categories,
    gigs
  });
});

app.get('/explore', (req, res) => {
  res.render('explore', {
    title: 'Explore skills | SkillSaarthi',
    pageClass: 'page-explore',
    categories,
    gigs
  });
});

app.get('/gig/:id', (req, res) => {
  const gig = gigs.find((g) => g.id === Number(req.params.id));
  if (!gig) {
    return res.status(404).send('Gig not found');
  }
  res.render('gig', {
    title: `${gig.title} | SkillSaarthi`,
    pageClass: 'page-gig',
    gig
  });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('dashboard', {
    title: 'Dashboard | SkillSaarthi',
    pageClass: 'page-dashboard',
    walletBalance: req.session.user.tokens,
    tokensEarned: 340,
    tokensSpent: 220
  });
});

app.get('/requests/new', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('new-request', {
    title: 'Post a new request | SkillSaarthi',
    pageClass: 'page-request'
  });
});

app.get('/services/new', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('new-service', {
    title: 'Publish a new service | SkillSaarthi',
    pageClass: 'page-service'
  });
});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('profile', {
    title: 'Profile | SkillSaarthi',
    pageClass: 'page-profile'
  });
});

app.get('/workspace/:requestId/:applicantId', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  // Mock data for workspace
  const applicantName = req.query.applicantName || 'Kunal Dhull';
  const requestTitle = req.query.requestTitle || 'Logo design for college fest';
  res.render('workspace', {
    title: 'Workspace | SkillSaarthi',
    pageClass: 'page-workspace',
    applicantName,
    requestTitle,
    requestId: req.params.requestId,
    applicantId: req.params.applicantId
  });
});

app.listen(PORT, () => {
  console.log(`SkillSaarthi running at http://localhost:${PORT}`);
});
