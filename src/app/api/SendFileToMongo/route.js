import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextResponse } from 'next/server';

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

        const { userID, base64Image, imageGuess } = await req.json();

        // Basic validation
        if (!imageGuess || imageGuess.trim() === "") {
            return NextResponse.json(
                { error: "Guess cannot be empty" },
                { status: 400 }
            );
        }

        const doc = {
            user: userID,
            base64: base64Image,
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