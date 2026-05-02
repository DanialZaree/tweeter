'use client';
import { z } from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

type FormFieldes = {
  email: string;
  number: number;
};
export default function Test() {
  const { register, handleSubmit } = useForm<FormFieldes>();

  useEffect(() => {
    async function showUser() {
      try {
        const req = await axios.get(`/api/tweets`);
        const res = req.data;
        console.log(res);
      } catch (e) {
        console.log(e);
      }
    }
    showUser();
  }, []);
  function submitHandler() {}
  return (
    <form action="" onSubmit={handleSubmit(submitHandler)}>
      <input type="email" {...register('email')} />
      <input type="number" {...register('number')} />
      <button>submit</button>
    </form>
  );
}
