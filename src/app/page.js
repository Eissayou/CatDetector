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

  // Load the model on component mount. This will be the first thing that is done
  useEffect(() => {
    async function loadModel() {
      console.log("Model loading..");
      const loadedModel = await mobilenet.load({ version: 2, alpha: 1 });
      setModel(loadedModel);
      console.log("Model loaded..");
    }
    loadModel();
  }, []);

  // Sends the img to the model and returns the inference
  const classifyImage = async (image) => {
    if (model) {
      const img = new Image(); // Correctly uses the browser's Image object
      img.src = image;
      await img.decode();
      const predictions = await model.classify(img);
      
      if(!predictions){
        return;
      }

      const inferenceString = predictions.map(p => `${p.className}: ${p.probability.toFixed(2)}`).join(", ");
      setFinalInference(inferenceString);
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