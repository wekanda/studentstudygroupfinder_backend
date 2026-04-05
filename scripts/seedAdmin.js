import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = 'admin@ucu.edu';
const ADMIN_PASSWORD = 'Admin@12345';
const ADMIN_NAME = 'System Administrator';

const seedAdmin = async () => {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (admin) {
      console.log('Admin user already exists:', ADMIN_EMAIL);
      admin.password = ADMIN_PASSWORD;
      admin.role = 'admin';
      admin.program = 'Administration';
      admin.yearOfStudy = 1;
      await admin.save();
      console.log('Admin password has been reset successfully');
      console.log('Email:', ADMIN_EMAIL);
      console.log('Password:', ADMIN_PASSWORD);
      process.exit(0);
    }

    admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      program: 'Administration',
      yearOfStudy: 1,
      role: 'admin'
    });

    console.log('Admin user created successfully');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
