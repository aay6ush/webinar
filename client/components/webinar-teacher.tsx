"use client";

import React, { useState, useRef } from "react";
import { WHIPClient } from "@eyevinn/whip-web-client";

export default function WebinarTeacher() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [webinarInfo, setWebinarInfo] = useState("");
  const [status, setStatus] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const localVideoRef = useRef(null);

  const startBroadcast = async () => {
    try {
      const response = await fetch("http://localhost:3000/webinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const webinar = await response.json();

      setWebinarInfo(
        `Join webinar: http://localhost:3001/webinar/${webinar.id}`
      );

      const iframeUrl = webinar.webRTCPlayback.url.replace(
        "webRTC/play",
        "iframe"
      );
      setIframeUrl(iframeUrl);
      console.log("webinar", webinar);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const whipclient = new WHIPClient({
        endpoint: webinar.webRTC.url,
        opts: {
          debug: true,
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        },
      });

      console.log(whipclient);

      await whipclient.ingest(stream);
      setStatus("Broadcasting started successfully!");
    } catch (error) {
      console.error("Error starting broadcast:", error);
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <main>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="title"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="desc"
      />
      <button onClick={startBroadcast}>Start</button>
      <video ref={localVideoRef} autoPlay muted />
      <p>{webinarInfo}</p>
      <p>{status}</p>
      <div>
        <iframe
          src={iframeUrl}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        ></iframe>
      </div>
    </main>
  );
}
