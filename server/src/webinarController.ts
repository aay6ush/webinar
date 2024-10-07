import { Request, RequestHandler, Response } from "express";
import { CloudflareStream } from "./cloudflareStreamService";

const webinars = new Map();

export const createWebinar: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { title, description } = req.body;

    const liveInput = await CloudflareStream.createLiveInput();

    const webinar = {
      id: liveInput.uid,
      title,
      description,
      rtmps: liveInput.rtmps,
      webRTC: liveInput.webRTC,
      webRTCPlayback: liveInput.webRTCPlayback,
    };

    webinars.set(webinar.id, webinar);
    res.status(200).json(webinar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create webinar" });
  }
};

export const joinWebinar: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const webinarId = req.params.id;

    const webinar = webinars.get(webinarId);

    if (!webinar) {
      res.status(404).json({ error: "Webinar not found" });
    }

    res.status(200).json({
      title: webinar.title,
      description: webinar.description,
      webRTCPlayback: webinar.webRTCPlayback,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to join webinar" });
  }
};
