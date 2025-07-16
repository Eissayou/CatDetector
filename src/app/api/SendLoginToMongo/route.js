// What needs to be done: Only can do guesses if Logged in. Logins also need to be persistant. 

import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const uri = process.env.MONGODB_URI; // Get from environment variable

// Create the MongoClient outside the handler
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database and collection names (for better readability)
const dbName = "PictureAndGuessesDB";
const collectionName = "UserLogins";

// Connect to MongoDB on startup (only once)
async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToMongo();

export async function POST(req) {
  try {
    const { username, password, isLoggingInOrRegistering } = await req.json();

    if (!username || username.trim() === '' || !password || password.trim() === '') {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    if (isLoggingInOrRegistering === 'isRegistering') {
      // Password validation: at least 8 chars, one uppercase, one lowercase, one number, one special char
      const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
      if (!passwordValid) {
        return NextResponse.json({ error: 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.' }, { status: 400 });
      }
      const existingUser = await collection.findOne({ user: username });
      if (existingUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const doc = {
        user: username,
        password: hashedPassword,
        timestamp: new Date(),
      };

      const result = await collection.insertOne(doc);
      console.log(`User registered with _id: ${result.insertedId}`);

      const token = jwt.sign(
        { username: username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const serializedCookie = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600,
        path: '/',
      });

      return NextResponse.json(
        { message: 'Register successful' },
        {
          status: 200,
          headers: { 'Set-Cookie': serializedCookie }, // Set the cookie in the response headers
        }
      );

    } else if (isLoggingInOrRegistering === 'isLoggingIn') {
      // Login Logic
      const user = await collection.findOne({ user: username });

      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Generate JWT or set session cookie here in a real app

        const token = jwt.sign(
          { username: username },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        const serializedCookie = serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600,
          path: '/',
        });

        return NextResponse.json(
          { message: 'Login successful' },
          {
            status: 200,
            headers: { 'Set-Cookie': serializedCookie }, // Set the cookie in the response headers
          }
        );
      } else {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
