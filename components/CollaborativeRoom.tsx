"use client";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Editor } from "./editor/Editor";
import ActiveCollaborators from "./ActiveCollaborators";
import Loader from "./Loader";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "../lib/actions/room.actions";
import { currentUser } from '@clerk/nextjs/server';

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  users,
  currentUserType
}: CollaborativeRoomProps) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(roomMetadata.title);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setLoading(true);
      if (roomMetadata.title !== title) roomMetadata.title = title;

      const updatedDocument = await updateDocument({ roomId, title });
      if (updatedDocument) {
        setEditing(false);
      }

      try {
      } catch (error) {
        console.log("error");
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ( inputRef.current &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node )
      )
      console.log(`${roomId}, ${title}` )
        updateDocument({ roomId, title });
        setEditing(false);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roomId, title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div
              ref={containerRef}
              className="flex w-fit items-center justify-center gap-2"
            >
              {editing && !loading ? (
                <Input
                  type="text"
                  value={title}
                  ref={inputRef}
                  placeholder="Enter Title"
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing}
                  className="document-title-input"
                />
              ) : (
                <p className="document-title">{title}</p>
              )}

              {currentUserType === "editor" && !editing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt="Edit"
                  width={24}
                  height={24}
                  onClick={(e) => {
                    setEditing(true);
                  }}
                  className="pointer"
                />
              )}

              {currentUserType !== "editor" && !editing && (
                <p className="view-only-tag">View only</p>
              )}

              {loading && <p className="text-sm text-gray-400">Saving...</p>}
            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>

          <Editor 
            roomId={roomId}
           currentUserType= {currentUserType}
          />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
