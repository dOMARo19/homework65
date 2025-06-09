# Homework65

## Опис

Цей проект — приклад Node.js/Express застосунку для роботи з MongoDB Atlas. Він містить два основних API-ендпоїнти для обробки та статистики даних з колекції `products`.

---

## Структура проекту

```
├── app.js              # Головний файл застосунку
├── config.mjs          # Конфігурація підключення до MongoDB Atlas
├── package.json        # Опис залежностей та скриптів
├── package-lock.json   # Лок-файл npm
└── README.md           # Документація проекту
```

---

## Залежності

- express
- mongoose
- mongodb
- nodemon (dev-залежність)

Встановлення:

```
npm install
```

---

## Запуск проекту

```
npm run dev
```

або

```
npm start
```

---

## API-ендпоїнти

### 1. GET `/process-large-data`

**Опис:**
Потокова обробка великої кількості документів з колекції `products`.

**Фільтр:**

- `category: 'Laptops'`
- `price >= 1000`

**Відповідь:**
Повертає масив об'єктів:

```json
[
  {
    "id": "...",
    "name": "...",
    "processed": true
  },
  ...
]
```

---

### 2. GET `/sales-stats`

**Опис:**
Агрегація статистики продажів по категоріях товарів з ціною від 1000.

**Фільтр:**

- `price >= 1000`

**Відповідь:**
Масив об'єктів з полями:

- `month` (може бути undefined, якщо не використовується у вашій схемі)
- `productCategory`
- `totalSales`
- `averageSale`
- `count`
- `minSale`
- `maxSale`

---

## Налаштування MongoDB Atlas

1. Створіть кластер у MongoDB Atlas.
2. Додайте свій IP у whitelist.
3. Створіть користувача та отримайте URI підключення.
4. Вкажіть URI у файлі `config.mjs`:
   ```js
   const config = {
     URI: "mongodb+srv://<user>:<password>@<cluster-url>/test",
   };
   export default config;
   ```

---

## Примітки

- Для коректної роботи потрібна колекція `products` з відповідними полями (`category`, `price`, `amount`, `name` тощо).
- Для розробки зручно використовувати Postman для тестування API.
