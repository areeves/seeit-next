import { OpenAI } from 'openai';

const VISION_MODEL = "gpt-4o-mini";
const DISABLE_AI = process.env.NODE_ENV !== 'production';
export const classifyImage = async (client: OpenAI, url: string) => {
  if(DISABLE_AI) {
    return {
      "role": "assistant",
      "content": "I'm sorry, but I cannot provide a description of what this image is showing. It's a plain gray color, devoid of any discernible details or features.",
      "refusal": null
    };
  }

  const models = await client.models.list();
  console.log({models});

  // create an OpenAI request with a prompt
  const completion = await client.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this image as if you were David Attenborough. Provide as much detail as possible.",
          },
          {
            type: "image_url",
            image_url: {
              url: url,
            },
          },
        ],
      },
    ],
    // stream: true,
    max_tokens: 1000,
  });

  console.log({ completion });
  return completion.choices[0].message;
};

export default classifyImage;
