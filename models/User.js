import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Додаємо валідацію перед збереженням
userSchema.pre('save', function(next) {
  console.log('Saving user:', this);
  next();
});

export default mongoose.model('User', userSchema);