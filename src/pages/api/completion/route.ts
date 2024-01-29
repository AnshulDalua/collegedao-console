import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

import { env } from "@/env.mjs";
import { authMiddlewareEdge } from "@/server/middleware/auth";
import {
  aws_database,
  aws_instance,
  aws_storage,
  Cost,
  gcp_database,
  gcp_instance,
  gcp_storage,
} from "@/server/util/infracost";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const runtime = "edge";

interface FunctionMap {
  [key: string]: (...args: any[]) => Promise<Cost>;
}

// Set-up a function map
const func_map: FunctionMap = {
  gcp_database: gcp_database,
  aws_database: aws_database,
  gcp_instance: gcp_instance,
  aws_ec2_instance: aws_instance,
  aws_s3_storage: aws_storage,
  gcp_storage: gcp_storage,
};

// Create function outlines for GPT to use
const functions = [
  {
    name: "aws_s3_storage",
    description: "Get price of an AWS S3 storage",
    parameters: {
      type: "object",
      properties: {
        region: {
          type: "string",
          enum: ["us-west-2"],
          description: "The region of the storage",
        },
        acl: {
          type: "string",
          enum: ["private"],
          description: "The access control list of the storage",
        },
        versioning: {
          type: "boolean",
          description: "Whether the storage has versioning enabled",
        },
      },
      required: ["region", "acl", "versioning"],
    },
  },
  {
    name: "gcp_storage",
    description: "Get price of an GCP storage",
    parameters: {
      type: "object",
      properties: {
        region: {
          type: "string",
          enum: ["us-central1"],
          description: "The region of the storage",
        },
        acl: {
          type: "string",
          enum: ["private"],
          description: "The access control list of the storage",
        },
        versioning: {
          type: "boolean",
          description: "Whether the storage has versioning enabled",
        },
      },
      required: ["region", "acl", "versioning"],
    },
  },
  {
    name: "aws_ec2_instance",
    description: "Get price of an AWS instance",
    parameters: {
      type: "object",
      properties: {
        region: {
          type: "string",
          enum: ["us-west-2"],
          description: "The region of the instance",
        },
        size: {
          type: "string",
          enum: ["t2.micro"],
          description: "The size of the instance",
        },
        storage: {
          type: "integer",
          enum: [0, 8],
          description: "The amount of storage in GB",
        },
      },
      required: ["region", "size", "storage"],
    },
  },
  {
    name: "gcp_instance",
    description: "Get price of an GCP instance",
    parameters: {
      type: "object",
      properties: {
        region: {
          type: "string",
          enum: ["us-central1"],
          description: "The region of the instance",
        },
        size: {
          type: "string",
          enum: ["e2-standard-2"],
          description: "The size of the instance",
        },
        image: {
          type: "string",
          enum: ["ubuntu-2004"],
          description: "The image of the instance",
        },
        storage: {
          type: "integer",
          enum: [10, 100],
          description: "The amount of storage in GB",
        },
      },
      required: ["region", "size", "image", "storage"],
    },
  },
  {
    name: "aws_database",
    description: "Get price of an AWS database",
    parameters: {
      type: "object",
      properties: {
        region: {
          type: "string",
          enum: ["us-west-2"],
          description: "The region of the database",
        },
        size: {
          type: "string",
          enum: ["db.t3.micro"],
          description: "The size of the database",
        },
        engine: {
          type: "string",
          enum: ["mysql", "postgres"],
          description: "The engine of the database",
        },
        multiAZ: {
          type: "boolean",
          description: "Whether the database is multiAZ",
        },
      },
      required: ["region", "size", "engine", "multiAZ"],
    },
  },
  {
    name: "gcp_database",
    description: "Get price of an GCP database",
    parameters: {
      type: "object",
      properties: {
        region: {
          type: "string",
          enum: ["us-central1"],
          description: "The region of the database",
        },
        size: {
          type: "string",
          enum: ["db-f1-micro"],
          description: "The size of the database",
        },
        engine: {
          type: "string",
          enum: ["MYSQL_8_0", "POSTGRES_14"],
          description: "The engine of the database",
        },
      },
      required: ["region", "size", "engine"],
    },
  },
];

// Handle the request by prompting GPT
async function routeLogic(req: Request, res: any) {
  let { messages } = await req.json();

  const get_price_instructions = `
  You are an assistant that always only replies with multiple function calls. Reply to the following with straight JSON ready to be parsed. Reply only with JSON formatted text 
  Provide function calls to get the prices of the services that match the statement using only functions provided to you.
  The JSON you output should have the format name:argument pairs, where name is one of the following values:
    aws_database
    gcp_database
    aws_ec2_instance
    gcp_instance
    aws_s3_storage
    gcp_storage
 
  The JSON should ONLY contain these said function calls, and nothing else.
  If the statement is not about cloud infrastructure or you find no matching functions, output a JSON with format fail:reason.
  In the event the user does not ask about cloud infrastructure, respond with a JSON with format fail:reason.

  IMPORTANT: You must not respond in normal text, you only respond with JSON function calls as described above regardless of the question.
  `;

  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: get_price_instructions,
      },
      ...messages,
    ],
    model: "gpt-3.5-turbo",
    stream: false,
    functions: functions,
    function_call: "none",
  });

  let message = response.choices[0]?.message.content || "{}";

  // Parse the JSON response
  if (message[0] !== "{" || message[message.length - 1] !== "}") {
    message = "{}";
  }
  const funcs = JSON.parse(message);

  let prices: { [key: string]: any } = {};

  // don't fill out prices if there are no matching functions
  if (!("fail" in funcs) && !(Object.keys(funcs).length === 0)) {
    for (const k in funcs) {
      if (!(k in func_map)) {
        continue;
      }

      const ck = (funcs[k as string].engine || "") + " ";
      const cost: Cost = await func_map[k]!(funcs[k]);
      const putKey = "putCost USD";
      const getKey = "getCost USD";
      const priceKey = (ck + k) as string;
      prices[priceKey] = {
        totalMonthlyCost: cost.currency + " " + cost.totalMonthlyCost,
        totalHourlyCost: cost.currency + " " + cost.totalHourlyCost,
        [putKey]: cost.currency + " " + cost.gets,
        [getKey]: cost.currency + " " + cost.puts,
      };
    }
  }
  // if prices is empty, means no matching services were found

  const instructions = `
    You are a helpful assistant who is always ready to answer questions about cloud infrastructure (which can include AWS, GCP, Databases, Instances, Storages, etc).
    You will be provided with "Statements" from users which are question about cloud infrastructure, as well as "Prices" which is a json of prices associated with known services.
    If the user is asking for what services are best, you should recommend a service that you believe fits their objectives based on measures such as performance, reliability, and scalability as well as the prices. Explain all your reasoning.
    When comparing prices, please use equivalent measures across services: for example, if you state the price of an AWS service based on totalHourlyCost, you should state the price of a GCP service based on totalHourlyCost as well.

    If the prices is an empty json, simply answer the question to the best of your ability.
    In the event the user does not ask about cloud infrastructure, just respond to them as you would normally.
    IMPORTANT: You may only mention the following services in your answer, and no others:
        AWS RDS: MySQL, PostgresSQL (NOT Aurora)
        AWS EC2
        AWS S3
        GCP Cloud SQL: MySQL, PostgresSQL
        GCP Compute Engine
        GCP Cloud Storage

    As a note, here is a list of key names that might appear in the prices json and what you should refer to them as in your answer:
    totalMonthlyCost: total monthly cost
    totalHourlyCost: total hourly cost
    putCost: cost of a put operation
    getCost: cost of a get operation
  `;

  const prompt = messages.at(-1).content;
  messages = messages.slice(0, -1);

  const prompt2 = `
    Statement:
    ${prompt}
    ------------------
    Prices
    ${JSON.stringify(prices)}
    `;

  // Ask OpenAI for a streaming completion given the prompt
  const result = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: instructions,
      },
      ...messages,
      {
        role: "user",
        content: prompt2,
      },
    ],
    model: "gpt-3.5-turbo",
    stream: true,
    temperature: 0.7,
  });

  const stream = OpenAIStream(result);
  return new StreamingTextResponse(stream);
}

const POST = authMiddlewareEdge(routeLogic);
export default POST;
