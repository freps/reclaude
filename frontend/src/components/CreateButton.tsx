import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  /** Ziel-Route der „+“-Aktion (z. B. "/benutzer/new"). */
  to: string;
  /** Tooltip-Text, der den Zweck der Aktion erklärt. */
  tooltipText: string;
};

/**
 * Runder „+“-Button oben rechts (via PageHeader `actions`).
 * Navigiert zu einer eigenen Formular-Route — siehe Steering-Doc
 * „Listen- & Formular-Pattern (CRUD-UI)“. Keine Modale für Create/Edit.
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
