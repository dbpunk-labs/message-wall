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
