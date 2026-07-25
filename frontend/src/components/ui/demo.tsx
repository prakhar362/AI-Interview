"use client";

import { RobotHero } from "@/components/ui/robot-hero";

export default function RobotHeroDemo() {
  const myUrl = "https://uithefactory.com/gallery";

  return (
    <div className="w-full min-h-screen bg-black overflow-hidden relative">
      <RobotHero 
        navItemsLeft={[
          { label: 'Product', href: myUrl, target: '_blank' },
          { label: 'About', href: myUrl, target: '_blank' },
          { label: 'Specs', href: myUrl, target: '_blank' },
          { label: 'Reviews', href: myUrl, target: '_blank' },
        ]}
        contactHref={myUrl}
        contactTarget="_blank" 
        onCtaClick={() => window.open(myUrl, '_blank')} 
      />
    </div>
  );
}
