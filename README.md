# REST API для управління користувачами

Цей проект представляє собою REST API для управління користувачами, побудований на Node.js з використанням Express та MongoDB.

## Технології

- **Node.js** - середовище виконання JavaScript
- **Express.js** - веб-фреймворк для Node.js
- **MongoDB** - NoSQL база даних
- **Mongoose** - ODM (Object Data Modeling) бібліотека для MongoDB
- **EJS** - шаблонізатор для відображення даних

## Структура проекту

```
homework65/
├── app.js                # Головний файл додатку (всі маршрути та логіка)
├── config.mjs            # Конфігурація підключення до MongoDB Atlas
├── models/
│   └── Document.js       # Mongoose-схема для документів
├── node_modules/         # Встановлені залежності
├── package.json          # Опис проекту та залежностей
├── package-lock.json     # Лок-файл npm
└── README.md             # (цей файл)
```

## API Методи

### Створення документа

- **POST** `/api/documents`
- Тіло: `{ "title": "string", "content": "string" }`
- Відповідь: `Документ створений з id: ...`

---

### Масове створення документів

- **POST** `/api/documents/bulk`
- Тіло: масив об'єктів документів
- Відповідь: `{ message, ids }`

---

### Отримання всіх документів

- **GET** `/api/documents`
- Query-параметри (необов'язково):
  - `filter` — JSON-рядок для фільтрації
  - `projection` — JSON-рядок для вибірки полів
  - `options` — JSON-рядок для додаткових опцій
- Відповідь: `{ success, count, documents }`

---

### Оновлення документа за ID

- **PUT** `/api/documents/:id`
- Тіло: об'єкт з оновленими полями
- Відповідь: оновлений документ або повідомлення про помилку

---

### Заміна одного документа (replace)

- **PUT** `/api/documents/:id`
- Тіло: повний об'єкт документа (усі поля, які мають бути у документі)
- Операція повністю замінює документ з вказаним `_id` на новий
- Відповідь: `{ success, message, document }` або повідомлення про помилку

---

### Масове оновлення документів

- **PUT** `/api/documents`
- Тіло: масив об'єктів з `_id` та оновленими полями
- Відповідь: `{ matchedCount, modifiedCount, documents }`

---

### Масове видалення документів

- **DELETE** `/api/documents/bulk`
- Тіло: масив об'єктів з `_id`
- Відповідь: результат видалення

---

### Видалення документа за ID

- **DELETE** `/api/documents/:id`
- Відповідь: видалений документ

---

## Модель Document

`models/Document.js`:

```js
{
  title: String,      // Назва документа (required)
  content: String,    // Вміст документа (required)
  createdAt: Date,    // Дата створення (default: now)
  updatedAt: Date     // Дата оновлення (default: now, оновлюється при save)
}
```

## Встановлення та запуск

1. Встановіть залежності:
   ```
   npm install
   ```
2. Вкажіть свій MongoDB URI у файлі `config.mjs`.
3. Запустіть сервер:
   ```
   npm start
   ```
   або для розробки:
   ```
   npm run dev
   ```

## Примітки

- Для роботи з MongoDB Atlas ваша IP-адреса має бути додана у whitelist.
- Для масових операцій (bulk) обов'язково передавайте масив об'єктів з `_id`.

---

Якщо потрібно — доповню README під ваші задачі!
