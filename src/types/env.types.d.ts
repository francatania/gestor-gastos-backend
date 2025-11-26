declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    MONGO_URI: string;
    JWT_SECRET: string;
    ACCOUNT_1: string;
    ACCOUNT_2: string;
  }
}