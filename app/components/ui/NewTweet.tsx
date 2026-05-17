import { Drawer } from '@base-ui/react/drawer';
import { Plus } from 'lucide-react';
import NewTweetForm from '../NewTweetForm';

export default function NewTweet() {
  return (
    <Drawer.Root>
      <Drawer.Trigger className="bottom-3 left-3 fixed flex justify-center items-center bg-gray-50 hover:bg-gray-100 active:bg-gray-100 p-3 border border-gray-200 rounded-full focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 font-normal text-gray-900 text-base cursor-pointer select-none">
        <Plus size={24}/>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed supports-[-webkit-touch-callout:none]:absolute inset-0 bg-black data-ending-style:opacity-0 data-starting-style:opacity-0 [--backdrop-opacity:0.2] opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] dark:[--backdrop-opacity:0.7] min-h-dvh transition-opacity duration-450 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-swiping:duration-0 ease-[cubic-bezier(0.32,0.72,0,1)] [--bleed:3rem]" />
        <Drawer.Viewport className="fixed inset-0 flex justify-center items-end">
          <Drawer.Popup className="pb-[calc(1.5rem+env(safe-area-inset-bottom,0)+3rem)] bg-background -mb-12 px-6 pt-4 outline outline-border dark:outline-border w-full max-h-[calc(80vh+3rem)] overflow-y-auto overscroll-contain text-gray-900 transform-[translateY(var(--drawer-swipe-movement-y))] data-ending-style:transform-[translateY(calc(100%-3rem+2px))] data-starting-style:transform-[translateY(calc(100%-3rem+2px))] transition-transform duration-450 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] ease-[cubic-bezier(0.32,0.72,0,1)] touch-auto data-swiping:select-none">
            <div className="bg-gray-300 mx-auto mb-4 rounded-full w-12 h-1" />
            <Drawer.Content className="flex flex-col items-center mx-auto w-full max-w-lg">
              <Drawer.Title className="mb-1 font-bold text-foreground text-lg text-center">
                Make New Tweet
              </Drawer.Title>
              <NewTweetForm/>
              {/* <div className="flex justify-center gap-4">
                <Drawer.Close className="flex justify-center items-center bg-gray-50 hover:bg-gray-100 active:bg-gray-100 px-3.5 border border-gray-200 rounded-md focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 h-10 font-normal text-gray-900 text-base select-none">
                  Close
                </Drawer.Close>
              </div> */}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
