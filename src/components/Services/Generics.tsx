import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

/** @GenericRowComponent */
interface GenericRowProps extends React.HTMLAttributes<HTMLDivElement> {
  priority?: 3 | 2 | 1;
}

export function GenericRow(props: GenericRowProps) {
  const priority = props.priority ?? 3;
  return (
    <div
      {...props}
      className={cn(
        "w-sm flex-col gap-0.5 text-sm",
        priority === 1 && "hidden xl:flex",
        priority === 2 && "hidden md:flex",
        priority === 3 && "flex",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

/** @GenericRowTitle */
export function GenericRowTitle(
  props: React.HTMLAttributes<HTMLParagraphElement>
) {
  return (
    <p
      {...props}
      className={cn("truncate text-sm text-muted-foreground", props.className)}
    >
      {props.children}
    </p>
  );
}

/** @GenericRowValue */
export function GenericRowValue(
  props: React.HTMLAttributes<HTMLHeadingElement>
) {
  return (
    <h3
      {...props}
      className={cn("font-normal leading-none tracking-tight", props.className)}
    >
      {props.children}
    </h3>
  );
}

interface SelectProps {
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  data: (
    | {
        name: string;
        value: string;
        description?: string;
      }
    | {
        divide: string;
      }
  )[];
  onValueChange?: (value: string) => void;
}

export function GenericSelect(props: SelectProps) {
  const firstValue = props.data.find((i) => i.hasOwnProperty("name"));
  const defaultValue =
    props.defaultValue ??
    (firstValue && "name" in firstValue ? firstValue.value : "");

  return (
    <Select
      defaultValue={defaultValue}
      name={props.name}
      disabled={props.disabled}
      onValueChange={props.onValueChange}
    >
      <SelectTrigger className="h-fit">
        <SelectValue placeholder={`Select a ${props.name}`} />
      </SelectTrigger>
      <SelectContent side="bottom" align="start" className="w-fit">
        <SelectGroup>
          <ScrollArea className={cn(props.data.length > 8 ? "h-80" : "")}>
            {props.data &&
              props.data.map((data) => (
                <div key={Math.random()}>
                  {"divide" in data && (
                    <>
                      <SelectLabel>{data.divide}</SelectLabel>
                      <div className="pd-1 border-b border-gray-200 dark:border-slate-800"></div>
                    </>
                  )}
                  {"name" in data && (
                    <SelectItem key={data.value} value={data.value}>
                      <div className="flex flex-col justify-start text-left">
                        {data.name}
                        {data.description && (
                          <span className="text-muted-foreground">
                            {data.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  )}
                </div>
              ))}
          </ScrollArea>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

interface CheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
}

export function GenericCheckbox(props: CheckboxProps) {
  return (
    <div>
      <div className="my-1 flex items-center space-x-2">
        <Checkbox className="mr-1" name={props.name} {...props} />
        <Label
          htmlFor={props.label}
          className="flex flex-col justify-start gap-1 text-left"
        >
          {props.label}
          {props.description && (
            <span className="text-muted-foreground">{props.description}</span>
          )}
        </Label>
      </div>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export function GenericInput(props: InputProps) {
  return (
    <Input
      type={props.type}
      id={props.type}
      placeholder={props.placeholder ?? ""}
      name={props.name}
      {...props}
    />
  );
}

export function GenericFilterButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    name: string;
  }
) {
  const [enabled, setEnabled] = useState(false);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="ml-2"
            size="icon"
            variant={enabled ? "default" : "outline"}
            {...props}
            onClick={(e) => {
              setEnabled((i) => !i);
              props.onClick && props.onClick(e);
            }}
          >
            <Image
              src="https://api.iconify.design/solar:tuning-line-duotone.svg?color=%23fff"
              width={20}
              height={20}
              unoptimized
              alt="Filter"
              className={cn("dark:invert", !enabled && "invert dark:invert-0")}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-bold">Show all {props.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
