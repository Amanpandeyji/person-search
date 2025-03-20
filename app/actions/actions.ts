'use server';

import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { User, userSchema } from './schemas';

const prisma = new PrismaClient();
 
const zobject = (prismaUser: PrismaUser): User => {
    return userSchema.parse({
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        phoneNumber: prismaUser.phoneNumber,
    });
};


/**
 * Retrieves users whose names start with the given query string.
 */
export async function searchUsers(query: string): Promise<User[]> {
    console.log('Searching users with query:', query);
    const prismaUsers = await prisma.user.findMany({
        where: {
            name: {
                startsWith: query,
                mode: 'insensitive', 
            },
        },
    });

    return prismaUsers.map(zobject);
}

/**
 * Creates a new user in the database.
 */
export async function addUser(data: Omit<User, 'id'>): Promise<User> {
    // Validate input data, excluding the ID
    const validatedData = userSchema.omit({ id: true }).parse(data);

    const prismaUser = await prisma.user.create({
        data: validatedData,
    });

    return zobject(prismaUser);
}

/**
 * Deletes a user from the database based on their ID.
 */
export async function deleteUser(id: string): Promise<void> {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
        throw new Error(`User with id ${id} not found`);
    }

    await prisma.user.delete({ where: { id } });
    console.log(`User with id ${id} has been deleted.`);
    revalidatePath('/');
}

 
export async function updateUser(
    id: string,
    data: Partial<Omit<User, 'id'>>
): Promise<User> {
    // Validate partial input data, excluding the ID
    const validatedData = userSchema
        .omit({ id: true })
        .partial()
        .parse(data);

    const prismaUser = await prisma.user.update({
        where: { id },
        data: validatedData,
    });

    console.log(`User with id ${id} has been updated.`);
    revalidatePath('/');

    return zobject(prismaUser);
}

 
export async function getUserById(id: string): Promise<User | null> {
    const prismaUser = await prisma.user.findUnique({ where: { id } });

    return prismaUser ? zobject(prismaUser) : null;
}
