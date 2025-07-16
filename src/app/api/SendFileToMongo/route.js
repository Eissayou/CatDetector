import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
// To normalize images before saving, install the 'canvas' package:
// npm install canvas
import { createCanvas, loadImage } from 'canvas';

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
const collectionName = "PictureAndGuessesCollection";

// Connect to MongoDB on startup (only once)
async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        // You might want to handle this error more gracefully, 
        // like retrying or exiting the application
    }
}
connectToMongo();

export async function POST(req) {
    try {
        // Reuse the existing connection from the pool
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const { token, base64Image, imageGuess } = await req.json();

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);


        // Verify the JWT and get the payload
        const { payload } = await jwtVerify(token, secret);
        const username = payload.username;



        // Basic validation
        if (!imageGuess || imageGuess.trim() === "") {
            return NextResponse.json(
                { error: "Guess cannot be empty" },
                { status: 400 }
            );
        }

        // Normalize the base64 image to 320x320, center-cropped
        let normalizedBase64 = base64Image;
        try {
          if (base64Image && base64Image.startsWith('data:image')) {
            const img = await loadImage(base64Image);
            const size = 320;
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');
            // Calculate crop for center-crop
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            normalizedBase64 = canvas.toDataURL();
          }
        } catch (e) {
          console.error('Image normalization failed:', e);
          // fallback: use original
        }

        const doc = {
            user: username,
            base64: normalizedBase64,
            guess: imageGuess,
            timestamp: new Date(),
        };

        const result = await collection.insertOne(doc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);

        return NextResponse.json({
            message: "Data inserted successfully",
            insertedId: result.insertedId,
        });
    } catch (err) {
        console.error("Error inserting into MongoDB:", err);
        return NextResponse.json(
            { error: "Failed to insert data" },
            { status: 500 }
        );
    } finally {
        // Do NOT close the connection here!
        // Let the connection pool manage the connections.
    }
}