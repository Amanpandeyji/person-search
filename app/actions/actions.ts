'use server'

import { revalidatePath } from 'next/cache'
import { User, userSchema } from './schemas'
import { cache } from 'react'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma Client
const prisma = new PrismaClient()

export async function searchUsers(query: string): Promise<User[]> {
  console.log('Searching users with query:', query)
  // Replace with Prisma query
  const results = await prisma.user.findMany({
    where: {
      name: {
        startsWith: query,
        mode: 'insensitive',
      },
    },
  })
  console.log('Search results:', results)
  return results
}

export async function addUser(data: Omit<User, 'id'>): Promise<User> {
  // Replace with Prisma create
  const validatedData = userSchema.parse(data)
  const newUser = await prisma.user.create({
    data: validatedData,
  })
  revalidatePath('/')
  return newUser
}

export async function deleteUser(id: string): Promise<void> {
  // Replace with Prisma delete
  await prisma.user.delete({
    where: { id },
  })
  console.log(`User with id ${id} has been deleted.`)
  revalidatePath('/') // Revalidate the page or component path
}

export async function updateUser(
  id: string,
  data: Partial<Omit<User, 'id'>>
): Promise<User> {
  // Replace with Prisma update
  const validatedData = userSchema.partial().parse(data)

  const updatedUser = await prisma.user.update({
    where: { id },
    data: validatedData,
  })
  console.log(`User with id ${id} has been updated.`)
  revalidatePath('/') // Revalidate the page or component path

  return updatedUser
}

export const getUserById = cache(async (id: string) => {
  // Replace with Prisma query
  const user = await prisma.user.findUnique({
    where: { id },
  })
  return user || null
})
