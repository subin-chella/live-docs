'use server'
import { nanoid } from 'nanoid';
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { parseStringify } from '../utils';
import { metadata } from '@/app/layout';

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
    const roomId = nanoid();

    try {
        const metadata = {
            creatorId: userId,
            email,
            title: 'Untitiled document'
        }
        const usersAccesses: RoomAccesses = {
            [email]: ['room:write']

        }
        const room = await liveblocks.createRoom(roomId, {
            metadata,
            usersAccesses,
            defaultAccesses: ['room:write']

        });
        revalidatePath('/')
        return parseStringify(room);

    } catch (error) {
        console.log('Error creating room : ${error}')

    }
}

export const getDocument = async ({ roomId, userId }: { roomId: string; userId: string }) => {

    try {
        const room = await liveblocks.getRoom(roomId);
        // const hasAccess = Object.keys( room.usersAccesses).includes(userId);
        // if (!hasAccess) {
        //     throw new Error('You dont have access to the document')
        // }
        return parseStringify(room);
    }
    catch (error) {
        console.log(error)
    }
}

    export const updateDocument = async ({ roomId, title }: { roomId: string; title: string }) => {

        try {
            console.log('aaaaaaaaaaaa')
             const updatedRoom = await liveblocks.updateRoom(roomId, {
                metadata: {title }
            }
            );

            revalidatePath('/documents/{${roomId}}')
            return parseStringify(updatedRoom);
        }
        catch (error) {
            console.log(error)
        }
}