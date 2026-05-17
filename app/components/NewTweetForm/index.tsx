'use client';
import { useState } from 'react';
import { z } from 'zod';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Button } from '@base-ui/react/button';

const schema = z.object({
  Tweet: z.string().min(1, 'Tweet is required'),
});

async function submitForm(formValues: Form.Values) {
  const result = schema.safeParse(formValues);

  if (!result.success) {
    return {
      errors: z.flattenError(result.error).fieldErrors,
    };
  }

  return {
    errors: {},
  };
}

export default function NewTweetForm() {
  const [errors, setErrors] = useState({});

  return (
    <Form
      className="flex flex-col gap-4 w-full max-w-2xl"
      errors={errors}
      onFormSubmit={async (formValues) => {
        const response = await submitForm(formValues);
        setErrors(response.errors);
      }}
    >
      <Field.Root name="tweet" className="flex flex-col items-start gap-1">
        <Field.Control
          render={(props) => (
            <textarea
              {...props}
              rows={7}
              placeholder="Enter tweet"
              className="pt-3 pb-4 pl-3.5 border border-border/60 rounded-md focus:outline-2 focus:outline-white focus:-outline-offset-1 w-full font-normal text-white text-lg line-clamp-2 resize-y"
            />
          )}
        />
        <Field.Error className="text-red-800 text-sm" />
      </Field.Root>
      <Button
        type="submit"
        className="flex justify-center items-center bg-foreground hover:bg-gray-100 hover:data-disabled:bg-gray-50 active:bg-gray-200 active:data-disabled:bg-gray-50 active:data-disabled:shadow-none active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] m-0 px-3.5 border border-gray-200 active:border-t-gray-300 active:data-disabled:border-t-gray-200 rounded-md outline-0 focus-visible:outline-2 focus-visible:outline-blue-800 focus-visible:-outline-offset-1 h-10 font-inherit font-normal text-gray-900 data-disabled:text-gray-500 text-base leading-6 cursor-pointer select-none"
      >
        Submit
      </Button>
    </Form>
  );
}
