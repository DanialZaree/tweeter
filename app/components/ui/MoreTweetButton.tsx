import {
  PenSquareIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function MoreTweetButton() {

  return (
    <ButtonGroup>
      <ButtonGroup className="hidden sm:flex">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button className="cursor-pointer" variant="outline" size="icon" aria-label="More Options"><MoreHorizontalIcon /></Button>} />
          <DropdownMenuContent align="end" className="w-16">
            <DropdownMenuGroup>
              <DropdownMenuItem className={"items-start cursor-pointer" }>
                <PenSquareIcon />
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive"  className={"items-start cursor-pointer"}>
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}
