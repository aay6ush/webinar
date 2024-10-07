import Cloudflare from "cloudflare";
import dotenv from "dotenv";

dotenv.config();

export class CloudflareStream {
  private static client = new Cloudflare({
    apiEmail: process.env.CLOUDFLARE_EMAIL,
    apiKey: process.env.CLOUDFLARE_API_KEY,
  });

  static async createLiveInput() {
    const liveInput = await this.client.stream.liveInputs.create({
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
      meta: { name: "Webinar" },
      recording: { mode: "automatic" },
    });

    return liveInput;
  }

  static async getLiveInput(liveInputId: string) {
    const liveInput = await this.client.stream.liveInputs.get(liveInputId, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    });

    return liveInput;
  }
}
