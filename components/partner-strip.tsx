"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";

const partnerLogoStyle = {
  filter: "brightness(0) saturate(100%)",
  opacity: 0.824,
};

export default function PartnerStrip() {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
      <div className="md:max-w-44 md:border-r md:border-black/10 md:pr-6">
        <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-black/40 font-medium md:text-right">
          Partners
        </p>
      </div>
      <div className="w-full overflow-hidden md:w-[calc(100%-11rem)]">
        <InfiniteSlider speedOnHover={20} speed={40} gap={isMobile ? 40 : 96}>
          <div className="flex items-center">
            <Image
              className="mx-auto h-5 w-auto sm:h-6"
              src="/cursor-logo-dark.svg"
              alt="Cursor Logo"
              height={24}
              width={120}
              style={partnerLogoStyle}
            />
          </div>
          <div className="flex items-center">
            <Image
              className="mx-auto h-6 w-auto sm:h-7"
              src="/reve-logo-black.svg"
              alt="Reve Logo"
              height={28}
              width={96}
              style={partnerLogoStyle}
            />
          </div>
          <div className="flex items-center">
            <Image
              className="mx-auto h-5 w-auto sm:h-6"
              src="/stripe-logo.png"
              alt="Stripe Logo"
              height={24}
              width={96}
              style={partnerLogoStyle}
            />
          </div>
          <div className="flex items-center">
            <Image
              className="mx-auto h-5 w-auto sm:h-6"
              src="/v0-logo-black.svg"
              alt="v0 Logo"
              height={24}
              width={72}
              style={partnerLogoStyle}
            />
          </div>
          <div className="flex items-center gap-2">
            <Image
              className="h-5 w-auto sm:h-6"
              src="/openai.svg"
              alt="OpenAI Logo"
              height={24}
              width={24}
              style={partnerLogoStyle}
            />
            <Image
              className="h-5 w-auto sm:h-6"
              src="/openai-text.svg"
              alt="OpenAI"
              height={24}
              width={80}
              style={partnerLogoStyle}
            />
          </div>
          <div className="flex items-center gap-2">
            <Image
              className="h-5 w-auto sm:h-6"
              src="/gemini.svg"
              alt="Gemini Logo"
              height={24}
              width={24}
              style={partnerLogoStyle}
            />
            <Image
              className="h-5 w-auto sm:h-6"
              src="/gemini-text.svg"
              alt="Gemini"
              height={24}
              width={96}
              style={partnerLogoStyle}
            />
          </div>
        </InfiniteSlider>
      </div>
    </div>
  );
}
