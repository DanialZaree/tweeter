'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@base-ui/react/form';
import { Button } from '@base-ui/react/button';

const schema = z.object({
  tweet: z.string().min(1, 'Tweet is required').max(500, 'Max chracter is 500'),
});

type FormData = z.infer<typeof schema>;

export default function NewTweetForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormData) {
    console.log(data);
  }

  return (
    <Form className="flex flex-col gap-4 w-full max-w-2xl" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-start gap-1">
        <textarea
          {...register('tweet')}
          rows={7}
          placeholder="Enter tweet"
          className={`${errors.tweet ? 'focus:outline-red-500 border-red-500' : 'focus:outline-white'} pt-3 pb-4 pl-3.5 border border-border/60 rounded-md focus:outline-2  focus:-outline-offset-1 w-full font-normal text-white text-lg resize-y`}
        />
        {errors.tweet && <p className="text-red-800 text-sm">{errors.tweet.message}</p>}
      </div>
      <Button
        type="submit"
        className="flex justify-center items-center bg-foreground hover:bg-gray-100 hover:data-disabled:bg-gray-50 active:bg-gray-200 active:data-disabled:bg-gray-50 active:data-disabled:shadow-none active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] m-0 px-3.5 border border-gray-200 active:border-t-gray-300 active:data-disabled:border-t-gray-200 rounded-md outline-0 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 h-10 font-inherit font-normal text-gray-900 data-disabled:text-gray-500 text-base leading-6 cursor-pointer select-none"
      >
        Submit
      </Button>
    </Form>
  );
}
