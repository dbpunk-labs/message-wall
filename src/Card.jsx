import { getDocs, query, where, addDoc } from "db3.js";
import React, { useContext, useEffect, useState } from "react";
import { MessageContext } from "./App";
import { Space, Button } from "antd";
import { useAsyncFn } from "react-use";

export default function Card({ msg }) {
  const msgContext = useContext(MessageContext);
  const { likesRef, userAddr } = msgContext;
  const [likes, setLikes] = useState([]);
  const [likedByMe, setLikedByMe] = useState(false);
  useEffect(() => {
    async function listList() {
      const re = await getDocs(
        query(likesRef, where("docId", "==", msg.entry.id))
      );

      setLikes(re?.docs);
    }

    listList();
    ifLikedByMe();
  }, [msg, userAddr]);

  function ifLikedByMe() {
    likes?.forEach((i) => {
      console.log(likedByMe);

      if (i.entry.owner === userAddr.db3AccountAddr) {
        setLikedByMe(true);
        return;
      }
    });
  }

  const [, addPoint] = useAsyncFn(
    async (msgLike) => {
      try {
        await addDoc(likesRef, msgLike);
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        console.log(e);
      }
    },
    [likesRef]
  );
  return (
    <div style={{ paddingTop: "1em" }}>
      <Space direction="vertical" size={8}>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            border: "1px solid #ccc",
            borderRadius: 4,
            padding: 4,
            fontSize: 12,
            lineHeight: "initial",
            width: 700,
          }}
        >
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              border: "1px solid #ccc",
              fontSize: 16,
              lineHeight: "initial",
            }}
          >
            {msg.entry.doc.msg}
          </pre>

          <div>
            <p style={{ textAlign: "right" }}>from:{String(msg.entry.owner)}</p>
            <p style={{ textAlign: "right" }}>
              at: {String(msg.entry.doc?.time)}
            </p>
          </div>

          {userAddr.db3AccountAddr === msg.entry?.owner && (
            <Button disabled={!likesRef} onClick={() => deleteMsg(doc)}>
              delete
            </Button>
          )}
          <Space>
            <Button
              disabled={!likesRef || likedByMe}
              onClick={() =>
                addPoint({ docId: msg.entry?.id, msgOwner: msg?.entry?.owner })
              }
            >
              Like
            </Button>
            <p>{likes.length}</p>
          </Space>
        </div>
      </Space>
    </div>
  );
}
