export default function handler() {
  return {
    name: "Rocetta Serverless Endpoint",
    version: "1.0.0",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
  };
}

export const config = {
  runtime: "edge",
};
