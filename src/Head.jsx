import { Space, Select, Button, Image } from "antd";
import React, { useContext } from "react";

const defaultEndpoint = "https://grpc.devnet.db3.network";
import { MessageContext } from "./App";

export default function Head({ connectWallet }) {
  const msgContext = useContext(MessageContext);
  const { userAddr } = msgContext;

  // Step1: connect Metamask wallet and get evm address

  return (
    <div>
      <h2>DB3 Message Wall</h2>
      <h4>
        This web site is build entirely base on a decentralized database
        <a hrep="https://db3.network"> DB3 Network</a>
      </h4>

      <Space direction="vertical">
        <Image
          width={100}
          style={{ padding: "left" }}
          src="../Logo_standard.png"
        ></Image>
        <Space direction="horizontal">
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

          <div>
            <p>DB3AccountAddr: {userAddr.db3AccountAddr}</p>
            <p>EVMAccountAddr: {userAddr.evmAccountAddr}</p>
            <Button type="primary" onClick={() => connectWallet()}>
              Connect Wallet
            </Button>
          </div>
        </Space>
      </Space>
    </div>
  );
}
