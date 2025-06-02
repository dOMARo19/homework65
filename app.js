import express from 'express';
import mongoose from 'mongoose';
import config from './config.mjs';
import User from './models/User.js';

const app = express();

// Налаштування шаблонізатора
app.set('view engine', 'ejs');
app.set('views', './views');

// Підключення до MongoDB Atlas
const mongoURI = config.URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Підключено до MongoDB Atlas'))
.catch(err => console.error('Помилка підключення до MongoDB:', err));

// Інші middleware та налаштування
app.use(express.json());

app.post('/api/users', async (req, res) => {
    try {
      const newUser = new User(req.body);
      const savedUser = await newUser.save();
      res.status(201).send(`Користувач створений з id: ${savedUser._id}`);
    } catch (err) {
      console.error('Помилка при створенні користувача:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  });
// Отримання списку користувачів
app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find({}); // Отримуємо всіх користувачів
      res.json(users);
    } catch (err) {
      console.error('Помилка при отриманні користувачів:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  });
  
  // Отримання конкретного користувача за ID
  app.get('/api/users/:id', async (req, res) => {
    try {
      const id = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Неправильний формат ID' });
      }
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
      }
      res.json(user);
    } catch (err) {
      console.error('Помилка при отриманні користувача:', err);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  });

  // Маршрут для сторінки з користувачами
app.get('/users', async (req, res) => {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      res.render('users', { users }); 
    } catch (err) {
      console.error('Помилка при отриманні користувачів:', err);
      res.status(500).send('Помилка сервера');
    }
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Щось пішло не так!');
  });

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



