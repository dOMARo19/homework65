import express from 'express';
import mongoose from 'mongoose';
import config from './config.mjs';
import Document from './models/Document.js';

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

  app.post('/api/documents', async (req, res) => {
    try {
        const newDocument = new Document(req.body);
        const savedDocument = await newDocument.save();
        res.status(201).send(`Документ створений з id: ${savedDocument._id}`);
    } catch (err) {
        console.error('Помилка при створенні документа:', err);
        res.status(400).json({ message: 'Помилка сервера' });
    }
  });

  app.post('/api/documents/bulk', async (req, res) => {
    try {
        if (!Array.isArray(req.body) || req.body.length === 0) {
            return res.status(400).json({ message: 'Очікувався непустий масив документів' });
        }

        const documents = req.body.map(doc => new Document(doc));
        
        const savedDocuments = await Document.insertMany(documents);

        res.status(201).json({
            message: `Успішно створено ${savedDocuments.length} документів`,
            ids: savedDocuments.map(doc => doc._id)
        });
    } catch (err) {
        console.error('Помилка при масовому створенні документів:', err);
        res.status(400).json({ message: 'Помилка сервера' });
    }
  });

  app.put('/api/documents', async (req, res) => {
    try {
      if (!Array.isArray(req.body) || req.body.length === 0) {
        return res.status(400).json({ message: 'Очікувався непустий масив документів' });
      }
  
      if (req.body.some(doc => !doc._id)) {
        return res.status(400).json({ message: 'Усі документи повинні містити _id' });
      }
  
      const bulkOps = req.body.map(doc => ({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: doc }
        }
      }));
  
      const result = await Document.bulkWrite(bulkOps);
      
      const updatedDocs = await Document.find({
        _id: { $in: req.body.map(doc => doc._id) }
      });
  
      res.json({
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        documents: updatedDocs
      });
    } catch (err) {
      console.error('Помилка при масовому оновленні документів:', err);
      res.status(500).json({ 
        message: 'Не вдалося оновити документи',
        error: err.message 
      });
    }
  });
  
  app.put('/api/documents/:id', async (req, res) => {
    try {
      const documentId = req.params.id;
      const updateData = req.body;
  
      if (!documentId) {
        return res.status(400).json({ message: 'Не вказано ID документа' });
      }
  
      if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
        return res.status(400).json({ message: 'Некоректні дані для оновлення' });
      }

      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const result = await Document.replaceOne(
          { _id: documentId },
          updateData,
          { 
            session: session,
            runValidators: true 
          }
        );
  
        if (result.matchedCount === 0) {
          await session.abortTransaction();
          return res.status(404).json({ message: 'Документ не знайдено' });
        }
  
        const updatedDocument = await Document.findById(documentId).session(session);
  
        await session.commitTransaction();
        
        res.json({
          success: true,
          message: 'Документ успішно замінено',
          document: updatedDocument
        });
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } catch (err) {
      console.error('Помилка при заміні документа:', err);
      
      let errorMessage = 'Помилка сервера';
      let statusCode = 500;
      
      if (err.message.includes('timeout')) {
        errorMessage = 'Час очікування операції вийшов';
      } else if (err.name === 'ValidationError') {
        errorMessage = 'Помилка валідації даних: ' + err.message;
        statusCode = 400;
      } else if (err.name === 'CastError') {
        errorMessage = 'Некоректний ID документа';
        statusCode = 400;
      }
      
      res.status(statusCode).json({ 
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  });

  app.put('/api/documents/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedDocument = await Document.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedDocument);
    } catch (err) {
        console.error('Помилка при оновленні документа:', err);
        res.status(400).json({ message: 'Помилка сервера' });
    }
  });

  app.delete('/api/documents/bulk', async (req, res) => {
    try {
      if (!Array.isArray(req.body) || req.body.length === 0) {
        return res.status(400).json({ message: 'Очікувався непустий масив документів' });
    }
        const ids = req.body.map(doc => doc._id);
        const deletedDocuments = await Document.deleteMany({ _id: { $in: ids } });
        res.json(deletedDocuments);
    } catch (err) {
        console.error('Помилка при масовому видаленні документів:', err);
        res.status(400).json({ message: 'Помилка сервера' });
    }
  });
  
  
  app.delete('/api/documents/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedDocument = await Document.findByIdAndDelete(id);
        res.json(deletedDocument);
    } catch (err) {
        console.error('Помилка при видаленні документа:', err);
        res.status(400).json({ message: 'Помилка сервера' });
    }
  });
  
  app.get('/api/documents', async (req, res) => {
    try {
      const filter = req.query.filter ? tryParseJSON(req.query.filter) : {};
      const projection = req.query.projection ? tryParseJSON(req.query.projection) : {};
      const options = req.query.options ? tryParseJSON(req.query.options) : {};

      if ((req.query.filter && !filter) || (req.query.projection && !projection) || (req.query.options && !options)) {
        return res.status(400).json({ message: 'Некоректні параметри запиту' });
      }

      const documents = await Document.find(
        filter,
        projection,
        options
      );

      res.json({
        success: true,
        count: documents.length,
        documents
      });
    } catch (err) {
      handleError(res, err, 'отримання документів');
    }
  });
  
  function tryParseJSON(jsonString) {
    try {
      return jsonString ? JSON.parse(jsonString) : {};
    } catch (e) {
      return null;
    }
  }

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Щось пішло не так!');
  });

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



