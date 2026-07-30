'use client';

import { useState } from 'react';
import { PenSquareIcon, MoreHorizontalIcon, Trash2Icon, Loader2 } from 'lucide-react';
import { deleteTweet } from '@/app/lib/actions/tweet';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MoreTweetButtonProps {
  tweetId: string;
}

export default function MoreTweetButton({ tweetId }: MoreTweetButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    const result = await deleteTweet(tweetId);
    if (!result?.success) {
      console.error(result?.error || 'Failed to delete tweet');
      setIsDeleting(false);
    }
  }

  return (
    <ButtonGroup>
      <ButtonGroup className="flex">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                className="cursor-pointer"
                variant="outline"
                size="icon"
                aria-label="More Options"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontalIcon />}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuGroup>
              <DropdownMenuItem className="items-center cursor-pointer">
                <PenSquareIcon className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                className="items-center text-red-500 hover:text-red-600 cursor-pointer"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2Icon className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  );
}
