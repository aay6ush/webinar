"use client";

import { useEffect, useRef } from "react";
import { WebRTCPlayer } from "@eyevinn/webrtc-player";

const WebinarPage = ({
  params: { webinarId },
}: {
  params: { webinarId: string };
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startPlayback = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/webinar/${webinarId}/join`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        const webinar = await response.json();

        const url = webinar.webRTCPlayback.url;

        const player = new WebRTCPlayer({
          video: videoRef.current,
          type: "whep",
          statsTypeFilter: "^candidate-*|^inbound-rtp",
        });

        await player.load(new URL(url));
        player.unmute();

        player.on("no-media", () => {
          console.log("media timeout occured");
        });
        player.on("media-recovered", () => {
          console.log("media recovered");
        });
      } catch (error) {
        console.error("Error starting playback:", error);
      }
    };

    startPlayback();
  }, []);

  return (
    <main>
      <h1>Live Stream Playback</h1>
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{ width: "100%", height: "auto" }}
      />
    </main>
  );
};

export default WebinarPage;
