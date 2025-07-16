# CatDetector

Identify different cat breeds right in your browser! CatDetector uses TensorFlow.js to run the identification model directly on your device, making it fast and efficient.
You can currently see this project live at [https://www.catclassifier.live](https://www.catclassifier.live).

## About CatDetector

CatDetector is a web app I built using NextJS and TensorflowJS that lets you identify different cat breeds. It works like a typical image classification model, but instead of relying on a powerful server to process every image, CatDetector loads the machine learning model directly into your browser using TensorflowJS.  This means the heavy lifting of identifying the cat breed is done right on your own device, using your computer's power. I chose this approach because it avoids needing a constantly running, and potentially very expensive, backend server to handle all those image classifications. It also offers a couple of neat advantages:

*   **Faster Identification:** You get results quicker since there's no back-and-forth with a server.
*   **Reduced Server Costs:** Since the user's device does the work, it's lighter on server resources and cheaper to run overall.

Besides identifying cats, CatDetector also uses MongoDB Atlas to store user logins and past images/classifications users can look back at them later.

## About the Model

The model doing all the cat-identifying is based on MobileNetV2, which is a model known for being lightweight and fast, making it perfect for running in a browser. I took the pre-trained MobileNetV2 model and fine-tuned it specifically for recognizing cat breeds.

Currently, the model is trained to recognize the following 33 breeds:

*   Abyssinian
*   American Curl
*   American Shorthair
*   Balinese
*   Bengal
*   Birman
*   Bombay
*   British Shorthair
*   Burmese
*   Cornish Rex
*   Devon Rex
*   Egyptian Mau
*   Exotic Shorthair
*   Havana
*   Himalayan
*   Japanese Bobtail
*   Korat
*   Maine Coon
*   Manx
*   Nebelung
*   Norwegian Forest Cat
*   Oriental Short Hair
*   Persian
*   Ragdoll
*   Russian Blue
*   Scottish Fold
*   Selkirk Rex
*   Siamese
*   Siberian
*   Snowshoe
*   Sphynx
*   Tonkinese
*   Turkish Angora

The model was trained on a dataset available here: [https://github.com/Aml-Hassan-Abd-El-hamid/datasets](https://github.com/Aml-Hassan-Abd-El-hamid/datasets).  While it does a good job now, it can definitely benefit from more training on a larger and more diverse dataset. I'm planning to create a more comprehensive dataset in the future to further improve the model's accuracy and ability to recognize a wider range of cat breeds.


## Before running the app

Before you run the app, you gotta set up two environment variables:

*   **JWT_SECRET:** This is a randomized secret key for JWT verification (for user authentication stuff).
*   **MONGODB_URI:** This is the connection string for your MongoDB database (I'm using MongoDB Atlas, but a local or self-hosted instance works too. Just make sure MongoDB is actually running if you go the local route).

**How to set up environment variables:**

The easiest way to handle these during local development is to create a `.env.local` file in the root of your project. Put these lines in your `.env.local` file, but swap out the placeholders with your real values:
JWT_SECRET=your_random_secret_key_here
MONGODB_URI=your_mongodb_connection_string_here

**Heads up:** Don't commit your `.env.local` file to version control (it's usually in your `.gitignore`).

## Running the app

First, download all the dependencies listed in `package.json`. Just type this into your terminal:

```
npm install
```

Next, fire up the development server:

```
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Finally, open http://localhost:3000 in your browser to see it in action.

## Future Improvements
* Add more cat breeds to the dataset / Train the model to be better.
