import "./App.css";
import { Button, Space, Input, Select, Image, Badge } from "antd";
import {
  DB3Client,
  MetamaskWallet,
  collection,
  DB3Store,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  CollectionReference,
} from "db3.js";

import React, { useEffect, useState } from "react";
import { useAsyncFn } from "react-use";
import { useReducerAsync } from "use-reducer-async";

import { Buffer } from "buffer";
import Msgs from "./Msgs";
import Head from "./Head";

globalThis.Buffer = Buffer;

const wallet = new MetamaskWallet(window);

const databaseAddr = "0x14c4eacfcb43d09b09139a0323d49fbe4ea0d5c9";
const collection_message = "message";
const collection_likes = "message_likes";
const defaultEndpoint = "https://grpc.devnet.db3.network";

export const MessageContext = React.createContext();
// Step1: connect Metamask wallet and get evm address

function App() {
  const [client, setClient] = useState();

  const [collectionMsgIns, setCollectionMsgIns] = useState("");
  const [db3AccountAddr, setDb3AccountAddr] = useState("");
  const [evmAccountAddr, setEvmAccountAddr] = useState("");

  const [collectionLikesIns, setCollectionLikesIns] = useState();

  const [endpoint, setEndpoint] = useState(defaultEndpoint);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState("");
  const [loading, setLoading] = useState(false);
  const [inited, setInited] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messageView, setMessageView] = useState([]);
  const [res, connectWallet] = useAsyncFn(async () => {
    try {
      setLoading(true);
      await wallet.connect();
      const addr = wallet.getAddress();
      setDb3AccountAddr(addr);
      const evmAddr = wallet.getEvmAddress();
      setEvmAccountAddr(evmAddr);
      setLoading(false);
      setConnected(true);
    } catch (e) {
      console.log(e);
    }
  }, [wallet]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const client = new DB3Client(endpoint, wallet);
      setClient(client);
      const db = new DB3Store(databaseAddr, client);
      const collectionLikesIns = await collection(db, collection_likes);
      const collectionMsgIns = await collection(db, collection_message);
      setCollectionMsgIns(collectionMsgIns);
      setCollectionLikesIns(collectionLikesIns);

      setLoading(false);
      setInited(true);
    }
    init();
  }, [endpoint, wallet]);

  const [, deleteMsg] = useAsyncFn(
    async (msg) => {
      setLoading(true);
      await deleteDoc(msg);
      await new Promise((r) => setTimeout(r, 1500));
      setLoading(false);
    },
    [collectionMsgIns]
  );

  const [resMsg, addMsgHandle] = useAsyncFn(
    async (msg) => {
      try {
        setLoading(true);
        await addDoc(collectionMsgIns, msg);
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    },
    [collectionMsgIns]
  );

  const [, getMsgHandle] = useAsyncFn(async () => {
    try {
      const messages = await getDocs(collectionMsgIns);
      setMessages(messages);
    } catch (e) {
      console.log(e);
    }
  }, [collectionMsgIns]);

  async function modifyMsg() {
    if (collectionLikesIns) {
      const view = [];
      // console.log(messages.docs);
      messages?.docs?.map(async (item, index) => {
        const docId = item.entry.id;
        const likes = await getDocs(
          query(collectionLikesIns, where("docId", "==", docId))
        );
        console.log(likes);
        view.push({
          msg: item,
          likedByMe: false,
          likeCount: likes?.docs?.length,
        });
      });

      setMessageView(view);
    }
  }

  useEffect(() => {
    modifyMsg();
  }, [messages]);

  console.log(messageView);
  console.log(messageView.length);

  const [, addmsgLikeHandle] = useAsyncFn(
    async (msgLike) => {
      try {
        setLoading(true);
        await addDoc(collectionLikesIns, msgLike);
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    },
    [collectionLikesIns]
  );

  return (
    <MessageContext.Provider
      value={{
        msgRef: collectionMsgIns,
        likesRef: collectionLikesIns,
        userAddr: {
          db3AccountAddr: db3AccountAddr,
          evmAccountAddr: evmAccountAddr,
        },
      }}
    >
      <div className="App">
        <Head connectWallet={connectWallet} />

        <Msgs />
      </div>
    </MessageContext.Provider>
  );
}

export default App;
