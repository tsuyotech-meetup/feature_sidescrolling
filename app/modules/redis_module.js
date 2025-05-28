import { createClient } from "redis";

class RedisModule {
  constructor() {
    this.client = null;
  }
  async connect() {
    this.client = createClient({
      url: "redis://redis:6379",
    });

    this.client.on("error", (err) => console.log("Redis Client Error", err));

    await this.client.connect();
  }
  async set(key, value) {
    if (!this.client) {
      throw new Error("Redis client is not connected");
    }
    await this.client.set(key, value);
  }

  async get(key) {
    if (!this.client) {
      throw new Error("Redis client is not connected");
    }
    return await this.client.get(key);
  }

  async del(key) {
    if (!this.client) {
      throw new Error("Redis client is not connected");
    }
    return await this.client.del(key);
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
    }
  }
}

export default RedisModule;
