import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/server";

import { Logo } from "@/components/Logo.js";
import { DOCS_DOMAIN } from "@/shared/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate a `@vercel/og` ImageResponse for OG images with title.
 * @param size
 * @param providedTitle
 * @returns
 */
export const generateOGImage = async (
  size: {
    width: number;
    height: number;
  },
  providedTitle = ""
) => {
  const notoSansMono = await fs.readFile(
    path.join(__dirname, "../shared/notoSansMono.ttf")
  );

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col justify-between bg-transparent p-10 text-white"
        style={{
          fontFamily: "'Noto Sans Mono'",
          backgroundImage: "linear-gradient(45deg, #000000 0%, #100721 100%)",
        }}
      >
        <div
          tw="flex items-center"
          style={{
            gap: "0.5rem",
          }}
        >
          <Logo
            nextLogoHeight={18}
            nextLogoStyle={{
              filter: "invert(1)",
            }}
            noMoveTextUp
          />
        </div>
        {providedTitle ? (
          <h1
            tw="w-full text-6xl font-bold leading-[60px] md:text-7xl md:tracking-tight"
            style={{
              wordBreak: "break-word",
            }}
          >
            {providedTitle}
          </h1>
        ) : (
          <></>
        )}
        <h3 tw="text-lg font-bold leading-7 md:text-xl md:tracking-tight">
          {DOCS_DOMAIN}
        </h3>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans Mono",
          data: notoSansMono,
          style: "normal",
        },
      ],
    }
  );
};
