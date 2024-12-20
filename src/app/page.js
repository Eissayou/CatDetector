'use client'

import NextImage from "next/image"; // Renamed import
import styles from "./page.module.css";
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"
import React, { useState, useEffect } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { Spinner } from "@chakra-ui/react"

export default function Home() {

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const [imgBase64, setImgBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [finalInference, setFinalInference] = useState('')
  const [model, setModel] = useState(null);

  // Load the model on component mount
  useEffect(() => {
    async function loadModel() {
      console.log("Model loading..");
      const loadedModel = await mobilenet.load({ version: 2, alpha: 1 });
      setModel(loadedModel);
      console.log("Model loaded..");
    }
    loadModel();
  }, []);

  const classifyImage = async (image) => {
    if (model) {
      const img = new Image(); // Correctly uses the browser's Image object
      img.src = image;
      await img.decode();
      const predictions = await model.classify(img);
      const inferenceString = predictions.map(p => `${p.className}: ${p.probability.toFixed(2)}`).join(", ");
      setFinalInference(inferenceString);
    }
  };

  const handleImageChange = async (event) => {
    setIsLoading(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Image = reader.result;
        setImgBase64(base64Image);
        await classifyImage(base64Image);
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    }
  }

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
    </div>
  )
}