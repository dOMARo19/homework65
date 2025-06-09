import express from 'express';
import mongoose from 'mongoose';
import config from './config.mjs';
import { MongoClient } from 'mongodb';

const app = express();

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

app.get('/process-large-data', async (req, res) => {
  const client = new MongoClient(mongoURI);
  
  try {
      await client.connect();
      const db = client.db('test');
      const collection = db.collection('products');
      
      // Створення курсору з можливими фільтрами
      const cursor = collection.find({ 
          category: 'Laptops',
          price: { $gte: 1000 }
      }).batchSize(100); // Кількість документів у кожній партії
      
      // Обробка документів потоково
      res.setHeader('Content-Type', 'application/json');
      res.write('[');
      
      let firstDoc = true;
      while (await cursor.hasNext()) {
          const doc = await cursor.next();
          if (!firstDoc) {
              res.write(',');
          }
          res.write(JSON.stringify(processDocument(doc)));
          firstDoc = false;
      }
      
      res.write(']');
      res.end();
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  } finally {
      await client.close();
  }
});

function processDocument(doc) {
  
  return {
      id: doc._id,
      name: doc.name,
      processed: true
  };
}

app.get('/sales-stats', async (req, res) => {
  const client = new MongoClient(mongoURI);
  
  try {
      await client.connect();
      const db = client.db('test');
      const collection = db.collection('products');
      
      const pipeline = [
          {
              $match: {
                  price: { $gte: 1000 }
              }
          },
          {
              $group: {
                  _id: {
                      productCategory: "$category"
                  },
                  totalSales: { $sum: "$amount" },
                  averageSale: { $avg: "$amount" },
                  count: { $sum: 1 },
                  minSale: { $min: "$amount" },
                  maxSale: { $max: "$amount" }
              }
          },
          {
              $sort: {
                  "_id.month": 1,
                  totalSales: -1
              }
          },
          {
              $project: {
                  _id: 0,
                  month: "$_id.month",
                  productCategory: "$_id.productCategory",
                  totalSales: 1,
                  averageSale: { $round: ["$averageSale", 2] },
                  count: 1,
                  minSale: 1,
                  maxSale: 1
              }
          }
      ];
      
      const stats = await collection.aggregate(pipeline).toArray();
      res.json(stats);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  } finally {
      await client.close();
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



