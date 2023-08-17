// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

const fetchData = async (input: string, referrer: string | null) => {
  var result = await Promise.all(
    input.split("\n").map(async (s) => {
      let url = s.trim();
      if (!url.startsWith("http")) {
        console.warn(`Line '${url}' is not an url`);
        return "";
      }
      let headers: Record<string, string> = {};
      if (referrer) {
        headers["Referer"] = referrer;
      }
      try{
        let result: { thumbnail_url: string; video_id: string } = await (
          await fetch(`http://vimeo.com/api/oembed.json?url=${url}`, {
            headers: headers,
          })
        ).json();
        let embedHtml = `<img class="ic-youtube" data-video="vimeo" src="${result["thumbnail_url"]}" data-vimeo-id="${result["video_id"]}">`;
        return embedHtml;
      }catch(error){
        console.warn(`Line ${url} didn't work. `, error);
        return "";
      }
      
    })
  );

  return result.join("\n");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let ref = "" + (req.query["referrer"] ?? "");
  const data = await fetchData(req.body, ref);
  await res.status(200).send(data as any);
}
