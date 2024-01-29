import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useChat } from "ai/react";
import * as React from "react";

import { LoadingSmall } from "@/components/Loading";
import Modaler from "@/components/reusables/modaler";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/auth";
import { useModal } from "@/stores/modal";
import { cn } from "@/utils/cn";

export default function RecommendationEngine() {
  const [recommendationEngine, setRecommendationEngine] = useModal(
    "recommendationEngine"
  );
  const token = useAuthStore((state) => state.token);
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "../api/completion/route",
      headers: { Authorization: `Bearer ${token}` },
    });
  return (
    <>
      <Modaler
        set={setRecommendationEngine}
        open={recommendationEngine}
        className=" p-2"
      >
        <Card className=" border-0 bg-transparent">
          <CardHeader className="flex flex-row items-center">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-none">
                  Recommendation Engine
                </p>
                <p className="text-sm text-muted-foreground">
                  {" "}
                  Welcome to the recommendation engine! Please tell us about
                  your project and we&apos;ll recommend some tools for you.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea>
              <div className="mr-4 h-full max-h-96 space-y-4">
                <div className="h-1" />
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex w-max max-w-[400px] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.content}
                  </div>
                ))}
                <div className="h-5" />
              </div>
              <ScrollBar />
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center space-x-2"
            >
              <Input
                id="message"
                placeholder="Type your specification..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={input.trim().length === 0 || isLoading}
              >
                {isLoading && (
                  <LoadingSmall className="h-4 w-4 animate-spin text-white dark:text-black" />
                )}
                {!isLoading && <PaperPlaneIcon className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </Modaler>
    </>
  );
}
