// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import DigestFetch from "with-digest-fetch";

const client = new DigestFetch(
  process.env.TIDBCLOUD_DATA_SERVICE_PUBLIC_KEY!,
  process.env.TIDBCLOUD_DATA_SERVICE_PRIVATE_KEY!,
);

const fetcher = async (key: string, body?: Record<string, any>) => {
  const url = `${process.env.TIDBCLOUD_DATA_SERVICE_HOST}/${key}`;
  const res = await client.fetch(url, {
    body: body ? JSON.stringify(body) : body,
  });
  return await res.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { path, ...rest } = req.query;

  const searchParams = new URLSearchParams();
  for (const key in rest) {
    searchParams.append(key, rest[key] as string);
  }
  const url =
    Object.keys(rest).length > 0
      ? `${path}?${searchParams.toString()}`
      : (path as string);

  const response = await fetcher(url);
  res.status(200).json(response);
}
