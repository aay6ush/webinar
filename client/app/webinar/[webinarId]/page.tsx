"use client";

import React, { useEffect, useRef, useState } from "react";
import { WebRTCPlayer } from "@eyevinn/webrtc-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { BACKEND_URL } from "@/app/page";
import io from "socket.io-client";

export default function WebinarPage({
  params: { webinarId },
}: {
  params: { webinarId: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { id: number; sender: string; text: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const socketRef = useRef<any>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const startPlayback = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/webinar/${webinarId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to join webinar");
      }

      const webinar = await response.json();
      const url = webinar.webRTCPlayback.url;

      console.log(url, "Webinar URL from server");

      if (videoRef.current) {
        const player = new WebRTCPlayer({
          video: videoRef.current,
          type: "whep",
          statsTypeFilter: "^candidate-*|^inbound-rtp",
        });

        await player.load(new URL(url));
        player.unmute();

        player.on("playing", () => {
          setIsVideoPlaying(true);
          setIsLoading(false);
        });

        player.on("no-media", () => {
          console.log("Media timeout occurred");
          setError("Media playback interrupted. Trying to recover...");
        });

        player.on("media-recovered", () => {
          console.log("Media recovered");
          setError(null);
        });
      }
    } catch (error) {
      console.error("Error starting playback:", error);
      setError("Failed to start webinar playback. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleJoin = () => {
    if (userName.trim()) {
      setIsJoined(true);
      socketRef.current = io(BACKEND_URL);
      socketRef.current.emit("join room", webinarId);

      socketRef.current.on("chat message", (msg: any) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: prevMessages.length + 1, sender: msg.sender, text: msg.text },
        ]);
      });

      startPlayback();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = { sender: userName, text: newMessage };
      socketRef.current.emit("chat message", messageData);
      setNewMessage("");
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Card className="p-8 space-y-4">
          <h2 className="text-2xl font-bold text-center">Join Webinar</h2>
          <Input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Button onClick={handleJoin} className="w-full">
            Join
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold">Live Webinar: {webinarId}</h1>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-4 flex flex-col">
          <Card className="flex-1 flex items-center justify-center bg-gray-900 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Loader2 className="w-12 h-12 animate-spin text-white" />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-red-500 text-center p-4 bg-white rounded">
                  {error}
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              controls
              autoPlay
              className={`w-full h-full object-contain ${
                isVideoPlaying ? "opacity-100" : "opacity-0"
              }`}
            />
          </Card>
        </div>
        <div className="w-1/3 p-4 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Chat</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start space-x-2 mb-4"
                >
                  <Avatar>
                    <AvatarFallback>{message.sender[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{message.sender}</p>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit">Send</Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
