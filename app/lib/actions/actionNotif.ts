'use server'

import prisma from '../prisma'
import {auth} from '@/app/auth'
import { revalidatePath } from 'next/cache'