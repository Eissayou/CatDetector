import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextResponse } from 'next/server';

//Must make your own process.env file and include your Database URI in there
const uri = process.env.MONGODB_URI;

// Create the MongoClient outside the handler
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    // Optional: Add connection pool options here
});

// Database and collection names
const dbName = "PictureAndGuessesDB";
const collectionName = "PictureAndGuessesCollection";

// Function to connect to MongoDB (if not already connected)
async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error; // Re-throw the error
    }
}

// Initialize the connection (call this once when the application starts)
connectToMongo();

export async function POST(req) {
    try {
        // No need to connect here, reuse the client
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Extract data from the request body
        const { userID, base64Image, imageGuess } = await req.json();

        // Create a document to insert
        const doc = {
            user: userID,
            base64: base64Image,
            guess: imageGuess,
            timestamp: new Date(),
        };

        if (!imageGuess || imageGuess.trim() === "") {
            return
        }
        // Insert the document
        const result = await collection.insertOne(doc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);

        // Return a successful response
        return NextResponse.json({
            message: "Data inserted successfully",
            insertedId: result.insertedId,
        });
    } catch (err) {
        console.error("Error inserting into MongoDB:", err);
        // Return an error response
        return NextResponse.json(
            { error: "Failed to insert data" },
            { status: 500 }
        );
    } finally {
        // Do NOT close the connection here!
        // The connection pool will manage connections.
    }
}