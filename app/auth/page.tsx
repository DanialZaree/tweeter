"use client"
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Field } from '@base-ui/react/field';

export default function authPage() {

  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <Tabs defaultValue="account" className="w-100">
      <TabsList>
        <TabsTrigger value="Sign Up">Sign Up</TabsTrigger>
        <TabsTrigger value="Sign In">Sign In</TabsTrigger>
      </TabsList>
      <TabsContent value="Sign Up">
        <form className="flex flex-col gap-3 w-full max-w-64">
          {/* USERNAME */}
          <Field.Root className="flex flex-col gap-1">
            <Field.Label>Username</Field.Label>
            <Field.Control name="userName" required placeholder="username" className="p-2 border" />
          </Field.Root>

          {/* EMAIL */}
          <Field.Root className="flex flex-col gap-1">
            <Field.Label>Email</Field.Label>
            <Field.Control
              name="email"
              type="email"
              required
              placeholder="email"
              className="p-2 border"
            />
          </Field.Root>

           {/* PASSWORD WITH TOGGLE */}
          <Field.Root className="relative flex flex-col gap-1">
            <Field.Label>Password</Field.Label>

            <div className="relative">
              <Field.Control
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="p-2 pr-10 border w-full"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="top-1/2 right-2 absolute text-gray-500 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </Field.Root>

          <button
            type="submit"
            className="flex justify-center items-center bg-foreground hover:bg-foreground/80 hover:data-disabled:bg-gray-50 active:bg-foreground/60 active:data-disabled:bg-gray-50 active:data-disabled:shadow-none active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] m-0 px-3.5 border border-gray-200 active:border-foreground/60 active:border-t-gray-300 active:data-disabled:border-t-gray-200 rounded-md outline-0 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 h-10 font-inherit font-normal text-gray-900 data-disabled:text-gray-500 text-base leading-6 cursor-pointer select-none"
          >
            Create account
          </button>
        </form>
      </TabsContent>
      <TabsContent value="Sign In">
        <form className="flex flex-col gap-3 w-full max-w-64">
          {/* EMAIL */}
          <Field.Root className="flex flex-col gap-1">
            <Field.Label>Email</Field.Label>
            <Field.Control name="email" type="email" required className="p-2 border" />
          </Field.Root>

           {/* PASSWORD WITH TOGGLE */}
          <Field.Root className="relative flex flex-col gap-1">
            <Field.Label>Password</Field.Label>

            <div className="relative">
              <Field.Control
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="p-2 pr-10 border w-full"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="top-1/2 right-2 absolute text-gray-500 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </Field.Root>

          <button
            type="submit"
            className="flex justify-center items-center bg-foreground hover:bg-foreground/80 hover:data-disabled:bg-gray-50 active:bg-foreground/60 active:data-disabled:bg-gray-50 active:data-disabled:shadow-none active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] m-0 px-3.5 border border-gray-200 active:border-foreground/60 active:border-t-gray-300 active:data-disabled:border-t-gray-200 rounded-md outline-0 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 h-10 font-inherit font-normal text-gray-900 data-disabled:text-gray-500 text-base leading-6 cursor-pointer select-none"
          >
            Sign in
          </button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
