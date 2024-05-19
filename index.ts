import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import session from './session';
import { connect, getairsoftdata, getmanufacturerdata, updateItem, login } from './database';
import { airsoft, User } from './types';
import { secureMiddleware, checkNotAuthenticated } from './secureMiddleware'; // Import secureMiddleware and checkNotAuthenticated
import { loginRouter } from './routes/loginRouter';
import { homeRouter } from './routes/homeRouter';
import { registerRouter } from './routes/registerRouter'; // Import registerRouter function
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

// Middleware to attach user to locals for views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use routers
app.use(loginRouter());
app.use(homeRouter());
app.use(registerRouter());

// Port setup
app.set('port', process.env.PORT || 3000);

// Secure routes
app.get('/product/:id', secureMiddleware, async (req, res) => {
  try {
    const data = await getairsoftdata();
    const arr = await getmanufacturerdata();
    const id: number = parseInt(req.params.id);
    const product = data.find((item) => item.id === id);

    if (product) {
      res.render('product', { product: product, arr: arr, user: req.session.user });
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

app.get('/brands', secureMiddleware, async (req, res) => {
  try {
    const arr = await getmanufacturerdata();
    res.render('brands', { arr: arr });
  } catch (e: any) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/types', secureMiddleware, (req, res) => {
  res.render('types');
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid'); // Ensure the cookie is deleted
    res.redirect('/login');
  });
});

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
