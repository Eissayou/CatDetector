'use client'

import NextImage from "next/image"; // Renamed import
import styles from "./page.module.css";
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"
import React, { useState, useEffect, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { Spinner, Button } from "@chakra-ui/react"
import { useRouter } from 'next/navigation';

export default function Home() {


  const [imgBase64, setImgBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [finalInference, setFinalInference] = useState('')
  const [model, setModel] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState(null); // Add error state


  // Load the model on component mount. This will be the first thing that is done
  useEffect(() => {
    async function loadModel() {
      console.log("Model loading..");
      try {
        const loadedModel = await tf.loadLayersModel('/tfjs_cat_model_output/content/tfjs_model_from_weights_output/model.json');
        setModel(loadedModel);
        console.log("Model loaded..");
      } catch (err) {
        console.error("Error loading model:", err);
        setError("Failed to load model."); // Set error state
      }
    }
    loadModel();
  }, []);

  // Sends the img to the model and returns the inference
    const classifyImage = async (image) => {
    if (!model) {
      console.error("Model not loaded yet.");
      setError("Model not loaded yet."); // Set error for UI display
      return;
    }

    try {
      const img = new Image();
      img.src = image;
      await img.decode(); // Wait for the image to load

      // Preprocess the image.  IMPORTANT: Match your training preprocessing!
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224]) // Resize. Replace with your model's input size!
        .toFloat()
        .expandDims();

        const normalizedTensor = tensor.div(255.0);

      // Make predictions
      const predictionsTensor = await model.predict(normalizedTensor);
      const predictionsArray = await predictionsTensor.data();

      // Process predictions (example: find the top class)
      let maxIndex = 0;
        for (let i = 1; i < predictionsArray.length; i++) {
            if (predictionsArray[i] > predictionsArray[maxIndex]) {
                maxIndex = i;
            }
        }
        // Assuming you have class names somewhere (e.g., from training)
        const classNames = [
          "Abyssinian",
          "American Curl",
          "American Shorthair",
          "Balinese",
          "Bengal",
          "Birman",
          "Bombay",
          "British Shorthair",
          "Burmese",
          "Cornish Rex",
          "Devon Rex",
          "Egyptian Mau",
          "Exotic Shorthair",
          "Havana",
          "Himalayan",
          "Japanese Bobtail",
          "Korat",
          "Maine Coon",
          "Manx",
          "Nebelung",
          "Norwegian Forest Cat",
          "Oriental Short Hair",
          "Persian",
          "Ragdoll",
          "Russian Blue",
          "Scottish Fold",
          "Selkirk Rex",
          "Siamese",
          "Siberian",
          "Snowshoe",
          "Sphynx",
          "Tonkinese",
          "Turkish Angora"
      ];
        const predictedClass = classNames[maxIndex];
        const probability = predictionsArray[maxIndex];
        let inferenceString;
        const percentage = (probability * 100).toFixed(0);
        if (probability > 0.80) {
          inferenceString = `This cat is most likely a ${predictedClass}.`;
      } else if (probability > 0.50) {
          inferenceString = `This cat could be a ${predictedClass} with a ${percentage}% chance.`;
      }
        else{
          inferenceString = `Not very confident about the breed of this cat.`;
      }
      console.log(percentage, " ", predictedClass)
      setFinalInference(inferenceString)

        //Clean up!
        tensor.dispose();
        normalizedTensor.dispose();
        predictionsTensor.dispose();



    } catch (err) {
      console.error("Error classifying image:", err);
      setError("Failed to classify image."); // Set error state
    }
  };

  // Whenever an image changes, this is ran.
  const handleImageChange = async (event) => {
    setIsLoading(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Image = reader.result;

        if (!base64Image) {
          return;
        }

        setImgBase64(base64Image);
        await classifyImage(base64Image);
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    }
  }

  // Posting image to MongoDB
  const handleMongoPost = async (base64Image, imageGuess) => {
    try {
      const tokenResponse = await fetch('/api/GetTokenFromClient');
      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error(tokenData.error);
        return;
      }

      const token = tokenData.token;


      const response = await fetch('/api/SendFileToMongo', { // Make an HTTP request to the API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, base64Image, imageGuess }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data); // Handle success
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData); // Handle error
      }
    } catch (error) {
      console.error('Error:', error); // Handle error
    }
  };

  // This code is to make it only send when BOTH the image and the inference have changed.
  //---------------------------------------------------------------------------------
  const changesRef = useRef({
    imgBase64: false,
    finalInference: false
  });


  useEffect(() => {
    changesRef.current.imgBase64 = true;
  }, [imgBase64]);

  useEffect(() => {
    changesRef.current.finalInference = true;
  }, [finalInference]);

  // Check if image and finalInference have changed and also model is loaded everytime one of the three change.
  useEffect(() => {
    if (changesRef.current.imgBase64 && changesRef.current.finalInference && model) {
      // Reset the ref values
      changesRef.current.imgBase64 = false;
      changesRef.current.finalInference = false;

      handleMongoPost(imgBase64, finalInference);
    }
  }, [imgBase64, finalInference, model]);
  //---------------------------------------------------------------------------------


  const router = useRouter(); // Get the router object

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      const response = await fetch('/api/HandleLogout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Successful logout
        router.push('/login');
        router.refresh();
        setLoggingOut(false)
      } else {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cat Breed Classifier</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

      {model && (<input type="file" accept="image/*" onChange={handleImageChange} disabled={isLoading || !model} className={styles.input} />)}

      {isLoading && (
        <div className={styles.progressContainer}>
          <Spinner size="xl" />
          <p>Guessing your cat...</p>
        </div>
      )}

      {!model && (
        <div className={styles.progressContainer}>
          <Spinner size="xl" />
          <p>The Model is currently loading...</p>
        </div>
      )}

      {imgBase64 && !isLoading && (
        <div className={styles.imageContainer}>
          <img
            src={imgBase64}
            alt="UploadedImage"
            className={styles.image}
          />
          <p className={styles.predictions}>Predictions: {finalInference}</p>
        </div>
      )}
      {!loggingOut && (<Button
        onClick={handleLogout}
        colorScheme="red"
        variant="outline"
        size="sm"
        mt={4} // Add some top margin
      >
        Logout
      </Button>
      )
      }
      {loggingOut && (
        <div className={styles.progressContainer}>
          <Spinner size="xl" />
          <p>You have logged out! Redirecting now...</p>
        </div>
      )}
    </div>
  )
}