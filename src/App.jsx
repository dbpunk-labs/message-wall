import "./App.css";
import { Button, Space, Input } from "antd";
import {
  DB3Client,
  MetamaskWallet,
  collection,
  DB3Store,
  getDocs,
  addDoc,
  deleteDoc,
} from "db3.js";
import { useEffect, useState } from "react";
import { useAsyncFn } from "react-use";

import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

const wallet = new MetamaskWallet(window);

const databaseAddr = "0x14c4eacfcb43d09b09139a0323d49fbe4ea0d5c9";
const collection_message = "message";
const collection_likes = "msg_likes";
// const defaultEndpoint = "https://grpc.devnet.db3.network";
const defaultEndpoint = "http://127.0.0.1:26659";

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
  // Step1: connect Metamask wallet and get evm address
  const [res, connectWallet] = useAsyncFn(async () => {
    try {
      setLoading(true);
      await wallet.connect();
      const addr = wallet.getAddress();
      setDb3AccountAddr(addr);
      const evmAddr = wallet.getEvmAddress();
      setEvmAccountAddr(evmAddr);

      const client = new DB3Client(endpoint, wallet);
      setClient(client);

      const db = new DB3Store(databaseAddr, client);
      console.log(db);
      const collectionLikesIns = await collection(db, collection_likes);
      const collectionMsgIns = await collection(db, collection_message);
      setCollectionMsgIns(collectionMsgIns);
      console.log(collectionMsgIns);

      setCollectionLikesIns(collectionLikesIns);
      console.log(collectionLikesIns);

      setLoading(false);
      setInited(true);
    } catch (e) {
      console.log(e);
    }
  }, [wallet]);

  const [query_session, getQuerySessionToken] = useAsyncFn(async () => {
    try {
      const token = await client.keepSessionAlive();
      setToken(token);
      const networkClient = new DB3Network(client);
      const networkState = await networkClient.getState();
      setLatency(networkState.latency);
    } catch (e) {
      console.log(e);
    }
  }, [client]);

  const [, deleteMsg] = useAsyncFn(
    async (msg) => {
      setLoading(true);
      await deleteDoc(msg);
      await new Promise((r) => setTimeout(r, 1500));
      setLoading(false);
    },
    [collectionMsgIns]
  );

  const [, addMsgHandle] = useAsyncFn(
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
      console.log({ messages });
    } catch (e) {
      console.log(e);
    }
  }, [collectionMsgIns]);

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

  function addPoint(doc) {
    const msgLike = {
      //  doc.entry.id
    };
    addmsgLikeHandle(msgLike);
  }

  useEffect(() => {
    if (!loading && collectionMsgIns) getMsgHandle();
  }, [loading]);

  return (
    <div className="App">
      <h2>DB3 Message Wall</h2>
      <h4>
        This web site is build entirely base on a decentralized database
        <a hrep="https://db3.network"> DB3 Network</a>
      </h4>
      <Space direction="vertical">
        <div>
          <p>DB3 account addr: {db3AccountAddr}</p>
          <p>EVM account addr: {evmAccountAddr}</p>
          <Button type="primary" onClick={connectWallet}>
            Connect Wallet
          </Button>
        </div>
        <div>
          <Input.TextArea
            rows={4}
            onChange={(e) => setMsg(e.target.value)}
            value={msg}
          />
          <Button
            type="primary"
            // loading={loading}
            disabled={!inited}
            onClick={() =>
              addMsgHandle({ time: new Date().toUTCString(), msg })
            }
          >
            commit
          </Button>
        </div>
        <Space direction="vertical" size={8}>
          {messages?.docs?.map((doc, index) => (
            <div
              key={index}
              id={doc.entry.id}
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
                  borderRadius: 4,
                  padding: 4,
                  fontSize: 12,
                  lineHeight: "initial",
                }}
              >
                {JSON.stringify(doc?.entry?.doc?.msg)}
              </pre>
              <p style={{ textAlign: "right" }}>
                from:{String(doc?.entry?.owner)}
              </p>
              <p style={{ textAlign: "right" }}>
                {" "}
                at: {String(doc?.entry?.doc?.time)}
              </p>
              {db3AccountAddr === doc?.entry?.owner && (
                <Button loading={loading} onClick={() => deleteMsg(doc)}>
                  delete
                </Button>
              )}

              <Button loading={loading} onClick={() => addPoint(doc)}>
                Like
              </Button>
            </div>
          ))}
        </Space>
      </Space>
    </div>
  );
}

export default App;
