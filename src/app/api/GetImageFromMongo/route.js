import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const dbName = "PictureAndGuessesDB"; // Replace with your actual database name
const collectionName = "PictureAndGuessesCollection"; // Replace with your actual collection name

async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
connectToMongo();

export async function GET(req) {
    try {
        const cookiesList = await cookies();
        const token = cookiesList.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'No token found' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);


        // Verify the JWT and get the payload
        const { payload } = await jwtVerify(token, secret);
        const username = payload.username;
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Find all documents where the userId matches
        const ImageObjects = await collection.find({ user: username },
            { projection: { user: 1, base64: 1, guess: 1 } } 
        ).toArray();
        return NextResponse.json({ images: ImageObjects });
    } catch (error) {
        console.error("Error fetching images:", error);
        return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }
}