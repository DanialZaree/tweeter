'use client';
import * as React from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Button } from '@base-ui/react/button';

const imageSchema = z.union([
  z.instanceof(File).refine((file) => file.type.startsWith('image/') || file.type === 'image/gif', {
    message: 'File must be an image (jpg, png) or a GIF.',
  }),
]);

const schema = z.object({
  tweet: z
    .string()
    .max(500, 'It exceeds 500 characters.')
    .min(1, 'It must be at least 1 character long.'),
  image: imageSchema,
});

type FormField = z.infer<typeof schema>;
