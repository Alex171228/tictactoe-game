import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CATS, getRandomItem } from "@/lib/game-logic";
import type { CatMood } from "@shared/schema";

interface CatMascotProps {
  mood: CatMood;
}

export function CatMascot({ mood }: CatMascotProps) {
  const [catFace, setCatFace] = useState("");
  const [catMessage, setCatMessage] = useState("");

  useEffect(() => {
    const cat = CATS[mood];
    setCatFace(getRandomItem(cat.faces));
    setCatMessage(getRandomItem(cat.messages));
  }, [mood]);

  return (
    <div className="text-center" data-testid="cat-mascot">
      <div 
        className={cn(
          "text-4xl sm:text-5xl mb-3",
          mood === "happy" && "animate-cat-bounce",
          mood === "sad" && "animate-cat-appear",
          mood === "draw" && "animate-cat-tilt"
        )}
        data-testid="text-cat-face"
      >
        {catFace}
      </div>
      {mood === "happy" && (
        <div 
          className="text-4xl sm:text-5xl animate-cat-wiggle"
          style={{ animationDelay: "0.6s" }}
        >
          {catFace}
        </div>
      )}
      <p 
        className="text-sm sm:text-base text-muted-foreground italic mt-3"
        data-testid="text-cat-message"
      >
        {catMessage}
      </p>
    </div>
  );
}
