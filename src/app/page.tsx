'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from "./page.module.css";
import { OpenAI } from 'openai';
import { classifyImage } from '@/helpers/classifyImage';
import useLocalStorage from '@/hooks/useLocalStorage';

export default function Home() {
  const [apikey, setApikey] = useLocalStorage('apikey', '');
  function handleChangeApikey(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setApikey(newValue);
  }

  const videoRef = useRef<HTMLVideoElement|null>(null);
  const imgRef = useRef<HTMLImageElement|null>(null);
  const [description, setDescription] = useState('');
  useEffect(() => {
    const video = videoRef.current;
    if(video) {
      (async () => {
        const stream = await navigator.mediaDevices.getUserMedia({video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.play();
      })();
    }
    return () => {
      if(video) {
        video.pause();
      }
    };
  }, []);

  async function onCapture() {
    setDescription('(Capturing...)');
    const img = imgRef.current;
    if(!img) {
      throw new Error('imgRef is null');
    }
    img.src = '';
    const v = videoRef.current;
    if(!v) {
      throw new Error('videoRef null');
    }
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if(!ctx) {
      throw new Error('Unable to get 2d context for canvas');
    }
    ctx.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL();
    img.src = dataUrl;

    setDescription('(Generating...)');
    const client = new OpenAI({ apiKey: apikey, dangerouslyAllowBrowser: true });
    const aiResponse = await classifyImage(client, dataUrl );
    const newDescription = aiResponse.content ?? '';
    setDescription(newDescription);
    const speech = new SpeechSynthesisUtterance(newDescription);
    speechSynthesis.speak(speech);

  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h2>Config</h2>
        <form>
          <p>
            OpenAI API Key
            <br />
            <input type="text" value={apikey} onChange={handleChangeApikey} />
          </p>
          <p>
            Image Source:
            <br />
            {'...'}
          </p>
        </form>

        <h2>Capture</h2>
        <video ref={videoRef} onClick={onCapture} />

        <h2>Output</h2>
        <p>
          <img ref={imgRef} />
        </p>
        <p>{ description }</p>
      </main>
    </div>
  );
}


