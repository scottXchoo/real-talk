"use client";

import React from "react";
import { Input } from "./ui/input";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@/lib/store/user";
import { Imessage, useMessage } from "@/lib/store/messages";

export default function ChatInput() {
  const user = useUser((state) => state.user);
  const { setOptimisticAddMessage, setOptimisticIds } = useMessage(
    (state) => state
  );

  const supabase = supabaseBrowser();
  const handleSendMessage = async (text: string) => {
    if (text === "") return toast.error("Message can't be empty!");

    const messageId = uuidv4();
    const newMessage: Imessage = {
      created_at: new Date().toISOString(),
      id: messageId,
      is_edit: false,
      send_by: user?.id!,
      text,
      users: {
        avatar_url: user?.user_metadata.avatar_url,
        created_at: new Date().toISOString(),
        display_name: user?.user_metadata.user_name,
        id: user?.id!,
      },
    };

    setOptimisticAddMessage(newMessage);
    setOptimisticIds(newMessage.id);

    const { error } = await supabase.from("messages").insert({
      id: messageId,
      text,
    });
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-5">
      <Input
        placeholder="send message"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSendMessage(e.currentTarget.value);
            e.currentTarget.value = ""; // clear input
          }
        }}
      />
    </div>
  );
}
