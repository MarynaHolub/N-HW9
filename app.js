import express from 'express';
import 'dotenv/config';
import sequelize from './config/db.js';
import cors from 'cors';
import userRoutes from './routes/userRoute.js';
import User from './models/user.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors()); // разрешает запросы с любых источников
app.use(express.json()); // json -> object чтобы Express мог прочитать req.body
app.use(express.urlencoded()); // Обрабатывает данные, отправленные в формате application/x-www-form-urlencoded, например из HTML-формы
app.use('/users', userRoutes);

app.use((error, req, res, next) => {
  console.log(error.message);
  res.status(500).json({
    error: 'Внутрення ошибка сервера',
  });
});

app.get('/', (req,res)=>{
  res.send('Home page')
})

const start = async () => {
  try {
    app.listen(PORT, async () => {
      // await User.sync({ force: true });
      await sequelize.authenticate();
      console.log('Connection to the database has been successfully');
      console.log(`Server running at the http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database', error.message);
  }
};

start();
