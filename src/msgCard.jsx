import { getDocs, query, where } from "db3.js";
import React, { useContext, useEffect, useState } from "react";
import { MessageContext } from "./App";
import { Space, Button, Badge } from "antd";

export default function MsgCard({ msg }) {
  const msgContext = useContext(MessageContext);
  const { likesRef, userAddr } = msgContext;
  const [likes, setLikes] = useState([]);
  useEffect(() => {
    async function listList() {
      const re = await getDocs(
        query(likesRef, where("docId", "==", msg.entry.id))
      );
      setLikes(re?.docs);
    }

    listList();
  }, [msg]);
  return (
    <div>
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
              backgroundColor: "white",
              border: "1px solid #ccc",
              fontSize: 12,
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
            <Button
              disabled={!inited || !connected}
              onClick={() => deleteMsg(doc)}
            >
              delete
            </Button>
          )}

          <Badge count={likes.length}>
            <Button
              disabled={!likesRef}
              onClick={() => addPoint(msg.entry?.id, msg?.entry?.owner)}
            >
              Like
            </Button>
          </Badge>
        </div>
      </Space>
    </div>
  );
}
