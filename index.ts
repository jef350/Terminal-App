import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import session from './session';
import { connect, getairsoftdata, getmanufacturerdata, getAirsoftById, updateItem, login } from './database';
import { airsoft, User } from './types';
import { secureMiddleware } from './secureMiddleware';
import { loginRouter } from './routes/loginRouter';
import { homeRouter } from './routes/homeRouter';
import { flashMiddleware } from "./flashMiddleware";

dotenv.config();

const app = express();

// Middleware setup
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session); // Ensure session middleware is set up before routes that need session data
app.use(flashMiddleware);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use routers
app.use(loginRouter());
app.use(homeRouter());

// Port setup
app.set('port', process.env.PORT || 3000);

// Routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  try {
    const user: User | null = await login(email, password);
    if (user) {
      delete user.password;
      req.session.user = user;
      console.log('User session set:', req.session.user); // Logging for diagnosis
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  } catch (e: any) {
    console.error('Login error:', e); // Log the error for diagnostics
    res.redirect('/login');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/product/:id', async (req, res) => {
  try {
    const data = await getairsoftdata();
    const arr = await getmanufacturerdata();
    const id: number = parseInt(req.params.id);
    const product = data.find((item) => item.id === id);

    if (product) {
      res.render('product', { product: product, arr: arr });
    } else {
      res.status(404).render('404');
    }
  } catch (e: any) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/product/:id/update', secureMiddleware, async (req, res) => {
  try {
    const data = await getairsoftdata();
    const id: number = parseInt(req.params.id);
    const product = data.find((item) => item.id === id);

    if (product) {
      res.render('update', { product: product });
    } else {
      res.status(404).render('404');
    }
  } catch (e: any) {
    res.status(500).send('Internal Server Error');
  }
});

app.post('/product/:id/update', secureMiddleware, async (req, res) => {
  try {
    const id: number = parseInt(req.params.id);
    const item: airsoft = req.body;
    await updateItem(id, item);
    res.redirect('/product/' + id);
  } catch (e: any) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/brands', async (req, res) => {
  try {
    const arr = await getmanufacturerdata();
    res.render('brands', { arr: arr });
  } catch (e: any) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/types', (req, res) => {
  res.render('types');
});

// Connect to the database and start the server
app.listen(process.env.PORT, async () => {
  try {
    await connect();
    console.log(`Connected to database`);
    console.log(`Server started on http://localhost:${process.env.PORT}`);
  } catch (e: any) {
    console.error('Failed to connect to the database', e);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});
