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
} from "db3.js";
import { useEffect, useState } from "react";
import { useAsyncFn } from "react-use";

import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

const wallet = new MetamaskWallet(window);

const databaseAddr = "0x14c4eacfcb43d09b09139a0323d49fbe4ea0d5c9";
const collection_message = "message";
const collection_likes = "message_likes";
const defaultEndpoint = "https://grpc.devnet.db3.network";
// const defaultEndpoint = "http://127.0.0.1:26659";

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

  // Step1: connect Metamask wallet and get evm address
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
      console.log(endpoint);
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
        console.log(docId);
        const likes = await getDocs(
          query(collectionLikesIns, where("docId", "==", docId))
        );
        console.log(likes);
        view.push({
          // msg: item,
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

  // const [, getLikesHandle] = useAsyncFn(
  //   async (docs) => {
  //     try {
  //       console.log(docs);
  //       const view = [];
  //       docs?.map(async (item, index) => {
  //         const likes = await getDocs(
  //           query(
  //             collectionLikesIns,
  //             where("docId", "==",)
  //           )
  //         );

  //         view.push({
  //           msg: item,
  //           likedByMe: false,
  //           likeCount: likes?.docs?.length,
  //         });
  //       });

  //       console.log(view);
  //       setMessageView(view);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   },
  //   [collectionLikesIns]
  // );

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

  function addPoint(id, msgOwner) {
    const msgLike = {
      docId: id,
      msgOwner: msgOwner,
    };
    addmsgLikeHandle(msgLike);
  }

  useEffect(() => {
    if (!loading && collectionMsgIns) {
      getMsgHandle();
    }
  }, [loading]);

  function ifLikedByMe(like) {
    like?.docs.map((i) => {});
  }

  return (
    <div className="App">
      <h2>DB3 Message Wall</h2>
      <h4>
        This web site is build entirely base on a decentralized database
        <a hrep="https://db3.network"> DB3 Network</a>
      </h4>

      <Space direction="vertical">
        <div>
          <p>Choice Endpoint</p>
          <Select
            defaultValue={defaultEndpoint}
            style={{ width: 320 }}
            onChange={(e) => {
              console.log(e);
              setEndpoint(e);
            }}
            options={[
              {
                value: "https://grpc.devnet.db3.network",
                label: "https://grpc.devnet.db3.network",
              },
              {
                value: "http://127.0.0.1:26659",
                label: "http://127.0.0.1:26659",
              },
              {
                value: "http://18.162.230.6:26659",
                label: "http://18.162.230.6:26659",
              },
              {
                value: "http://16.163.108.68:26659",
                label: "http://16.163.108.68:26659",
              },
            ]}
          />
        </div>

        <Image
          width={100}
          style={{ padding: "left" }}
          src="../Logo_standard.png"
        ></Image>
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
            loading={resMsg.loading}
            disabled={!inited || !connected}
            onClick={() =>
              addMsgHandle({ time: new Date().toUTCString(), msg })
            }
          >
            commit
          </Button>
        </div>
        <Space direction="vertical" size={8}>
          <p>{messages.length}</p>
          {messages.docs?.map((item, index) => (
            <div
              key={index}
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
                {item?.entry?.doc?.msg}
              </pre>

              <div>
                <p style={{ textAlign: "right" }}>
                  from:{String(item?.entry?.owner)}
                </p>
                <p style={{ textAlign: "right" }}>
                  at: {String(item?.entry?.doc?.time)}
                </p>
              </div>

              {db3AccountAddr === item?.entry?.owner && (
                <Button
                  disabled={!inited || !connected}
                  onClick={() => deleteMsg(doc)}
                >
                  delete
                </Button>
              )}

              <Badge count={item.likeCount}>
                <Button
                  disabled={!inited || !connected}
                  onClick={() => addPoint(item?.entry?.id, item?.entry?.owner)}
                >
                  Like
                </Button>
              </Badge>
            </div>
          ))}
        </Space>
      </Space>
    </div>
  );
}

export default App;
