'use server'

import prisma from "../prisma"
import { revalidatePath } from "next/cache"

export async function followUser(userId:string,followerId:string) {
  try{
      const follow = await prisma.follower.create({
        data:{
          userId:userId,
          followerId:followerId
        }
      })
      revalidatePath('/', 'layout');
      return {success:true,follow}
  }catch(e){
    console.error('Error following user:', e);
  }
}