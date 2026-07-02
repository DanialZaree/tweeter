import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

export default function authPage() {
  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <Tabs defaultValue="SignUp" className="">
        <TabsList className={'p-0 rounded-sm bg-muted/0 border border-border'}>
          <TabsTrigger className={'py-4 px-12 rounded-sm cursor-pointer'} value="SignUp">
            Sign Up
          </TabsTrigger>
          <TabsTrigger className={'py-4 px-12 rounded-sm cursor-pointer'} value="SignIn">
            Sign In
          </TabsTrigger>
        </TabsList>
        <TabsContent value="SignUp">
          <SignUp />
        </TabsContent>
        <TabsContent value="SignIn">
          <SignIn />
        </TabsContent>
      </Tabs>
    </div>
  );
}
