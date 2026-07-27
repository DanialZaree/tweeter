import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

export default function authPage() {
  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 sm:p-6">
      <Tabs defaultValue="SignUp" className="w-full max-w-xs sm:max-w-sm">
        <TabsList className={'grid grid-cols-2 p-1 rounded-lg bg-zinc-900 border border-zinc-800 w-full'}>
          <TabsTrigger className={'py-1.5 sm:py-2 px-3 rounded-md cursor-pointer text-center text-xs sm:text-sm font-medium transition-all'} value="SignUp">
            Sign Up
          </TabsTrigger>
          <TabsTrigger className={'py-1.5 sm:py-2 px-3 rounded-md cursor-pointer text-center text-xs sm:text-sm font-medium transition-all'} value="SignIn">
            Sign In
          </TabsTrigger>
        </TabsList>
        <TabsContent value="SignUp" className="mt-4 w-full">
          <SignUp />
        </TabsContent>
        <TabsContent value="SignIn" className="mt-4 w-full">
          <SignIn />
        </TabsContent>
      </Tabs>
    </div>
  );
}
