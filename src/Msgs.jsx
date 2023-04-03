import React, { useContext, useEffect, useState } from "react";
import { useReducerAsync } from "use-reducer-async";
import { MessageContext } from "./App";
import { addDoc, getDocs } from "db3.js";
import { Input, Button } from "antd";

import MsgCard from "./MsgCard";
import { useAsyncFn } from "react-use";

export default function Msgs() {
  const msgContext = useContext(MessageContext);
  const { msgRef } = msgContext;

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState();

  const [resMsg, addMsgHandle] = useAsyncFn(
    async (msg) => {
      try {
        await addDoc(msgRef, msg);
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        console.log(e);
      }
    },
    [msgRef]
  );

  // const [, getMsgHandle] = useAsyncFn(async () => {
  //   try {
  //     const messages = await getDocs(msgRef);
  //     setMessages(messages);
  //     console.log(messages);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }, [msgRef]);

  useEffect(() => {
    async function getMsgHandle() {
      try {
        const messages = await getDocs(msgRef);
        setMessages(messages);
        console.log(messages);
      } catch (e) {
        console.log(e);
      }
    }
    if (msgRef) getMsgHandle();
  }, [msgRef]);

  return (
    <div>
      <div>
        <Input.TextArea
          rows={4}
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <Button
          type="primary"
          loading={resMsg.loading}
          disabled={!msgRef}
          onClick={() => addMsgHandle({ time: new Date().toUTCString(), msg })}
        >
          commit
        </Button>
      </div>

      {messages?.docs.map((msg, i) => (
        <MsgCard id={i} msg={msg} />
      ))}
    </div>
  );
}
