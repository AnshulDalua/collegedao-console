import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TooltipperProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  tip: string;
}

export default function Tooltipper(props: TooltipperProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{props.children}</TooltipTrigger>
        <TooltipContent>
          <p className="font-bold">{props.tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
