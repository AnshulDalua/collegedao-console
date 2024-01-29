import { HeroiconsXCircle20Solid } from "@/components/Icones";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertDescriptionProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string;
  description: string;
}

export default function AlertDestructive(props: AlertDescriptionProps) {
  const { title, description, ...restProps } = props;
  return (
    <Alert variant="destructive" {...restProps}>
      <HeroiconsXCircle20Solid className="h-4 w-4 fill-white text-white" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
