import React, { createContext, ReactNode, useContext, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type TimelinePropsItem = Omit<
  TimelineItemProps,
  "isActive" | "isActiveBullet" | "bulletSize" | "lineSize"
> & {
  bulletSize?: number;
};

/*
  No bullet or line is active when activeItem is -1
  First bullet is active only if activeItem is 0 or more
  First line is active only if activeItem is 1 or more
*/

interface TimelineContextProps {
  activeItem: number;
  setActiveItem: (index: number) => void;
  bulletSize: number;
  lineSize: number;
  length: number;
}

const TimeLineContext = createContext<TimelineContextProps>({
  activeItem: -1,
  setActiveItem: () => {},
  bulletSize: 14,
  lineSize: 2,
  length: 0,
});

export interface TimelineProps {
  activeItem: number;
  setActiveItem: (index: number) => void;
  bulletSize?: number;
  lineSize?: number;
  children: ReactNode[];
}

export const Timeline = (props: TimelineProps) => {
  const { bulletSize = 14, lineSize = 2, activeItem } = props;
  return (
    <ul
      style={{
        paddingLeft: bulletSize / 2,
      }}
    >
      <TimeLineContext.Provider
        value={{
          activeItem,
          bulletSize,
          lineSize,
          length: props.children.length,
          setActiveItem: props.setActiveItem,
        }}
      >
        {React.Children.map(props.children, (child, index) =>
          React.cloneElement(child as any, {
            index,
          })
        )}
      </TimeLineContext.Provider>
    </ul>
  );
};

export type TimelineItemProps = {
  title?: ReactNode;
  bullet?: ReactNode;
  children: ReactNode;
  className?: string;
  index?: number;
  noHelp?: boolean;
};
export const TimelineItem = (props: TimelineItemProps) => {
  const { children, bullet, title, index, className } = props;
  const { activeItem, setActiveItem, bulletSize, lineSize, length } =
    useContext(TimeLineContext);

  const isActive = useMemo(
    () => (activeItem === -1 ? false : activeItem >= (index ?? 0) + 1),
    [activeItem, index]
  );

  const isActiveBullet = useMemo(
    () => (activeItem === -1 ? false : activeItem >= (index ?? 0)),
    [activeItem, index]
  );

  const isLast = useMemo(() => index === length - 1, [activeItem, index]);

  return (
    <li
      className={cn(
        "relative border-l pb-8 pl-8 transition-colors",
        isLast && "border-l-transparent pb-0",
        isActive && !isLast && "border-l-rho-primary",
        className
      )}
      style={{
        borderLeftWidth: lineSize,
      }}
    >
      <TimelineItemBullet
        lineSize={lineSize}
        bulletSize={bulletSize}
        isActive={isActiveBullet}
        isFinished={isActive}
        onClick={() => setActiveItem(index ?? 0)}
      >
        {bullet}
      </TimelineItemBullet>
      {title && <TimelineItemTitle>{title}</TimelineItemTitle>}
      <TimelineItemDescription>{children}</TimelineItemDescription>
      {!props.noHelp && activeItem === index ? (
        <TimelineItemSmallText className="flex flex-row gap-2">
          <Button
            size={"sm"}
            variant="link"
            className="h-5 p-0 text-muted-foreground opacity-50 hover:opacity-100"
          >
            Help me
          </Button>
          <Button
            size={"sm"}
            variant="link"
            className="h-5 p-0 text-muted-foreground opacity-50 hover:opacity-100"
            onClick={() => setActiveItem(Math.min(length, (index ?? 0) + 1))}
          >
            Skip to next step
          </Button>
        </TimelineItemSmallText>
      ) : (
        !props.noHelp && <div className="h-[24px]"></div>
      )}
    </li>
  );
};

export const TimelineItemBullet = (
  props: React.HTMLAttributes<HTMLDivElement> & {
    isActive?: boolean;
    isFinished?: boolean;
    bulletSize: number;
    lineSize: number;
  }
) => {
  return (
    <div
      className={cn(
        "absolute top-0 flex cursor-pointer items-center justify-center rounded-full border bg-background",
        props.isActive && "border-rho-primary",
        props.isFinished && "bg-rho-primary",
        props.className
      )}
      style={{
        width: props.bulletSize,
        height: props.bulletSize,
        left: -props.bulletSize / 2 - props.lineSize / 2,
        borderWidth: props.lineSize,
      }}
      aria-hidden="true"
    >
      {props.children}
    </div>
  );
};

export const TimelineItemTitle = (
  props: React.HTMLAttributes<HTMLHeadElement>
) => {
  return (
    <h1
      {...props}
      className={cn(
        "mb-1 text-base font-semibold leading-none",
        props.className
      )}
    >
      {props.children}
    </h1>
  );
};

export const TimelineItemDescription = (
  props: React.HTMLAttributes<HTMLParagraphElement>
) => {
  return (
    <div
      {...props}
      className={cn("pt-1 text-sm text-muted-foreground", props.className)}
    >
      {props.children}
    </div>
  );
};

export const TimelineItemSmallText = (
  props: React.HTMLAttributes<HTMLDivElement>
) => {
  return (
    <div {...props} className={cn("pt-1 text-xs", props.className)}>
      {props.children}
    </div>
  );
};
