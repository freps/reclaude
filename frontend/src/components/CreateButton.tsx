import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  /** Target route of the "+" action (e.g. "/users/new"). */
  to: string;
  /** Tooltip text explaining the purpose of the action. */
  tooltipText: string;
};

/**
 * Round "+" button at the top right (via PageHeader `actions`).
 * Navigates to a dedicated form route — see the steering doc
 * "List & Form Pattern (CRUD UI)". No modals for create/edit.
 */
export default function CreateButton({ to, tooltipText }: Props) {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary shadow-primary/30 size-10 rounded-full border-0 shadow-lg transition-transform hover:scale-105"
            onClick={() => navigate(to)}
          >
            <Plus className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
