import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

export default function authPage() {
  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 sm:p-6">
      <Tabs defaultValue="SignUp" className="w-full max-w-sm sm:max-w-md">
        <TabsList className={'grid grid-cols-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 w-full'}>
          <TabsTrigger className={'py-2.5 sm:py-3 px-4 rounded-lg cursor-pointer text-center text-sm sm:text-base font-semibold transition-all'} value="SignUp">
            Sign Up
          </TabsTrigger>
          <TabsTrigger className={'py-2.5 sm:py-3 px-4 rounded-lg cursor-pointer text-center text-sm sm:text-base font-semibold transition-all'} value="SignIn">
            Sign In
          </TabsTrigger>
        </TabsList>
        <TabsContent value="SignUp" className="mt-6 w-full">
          <SignUp />
        </TabsContent>
        <TabsContent value="SignIn" className="mt-6 w-full">
          <SignIn />
        </TabsContent>
      </Tabs>
    </div>
  );
}
