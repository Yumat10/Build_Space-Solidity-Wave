import * as React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import abiFile from "./util/WavePortal.json";
import moment from "moment";

import "./App.css";
import { motion } from "framer-motion";

const filledButtonVariants = {
  initial: {
    scale: 1,
    background: "var(--off-black)",
    color: "var(--off-white)",
  },
  hover: {
    scale: 1.05,
    color: "var(--primary)",
  },
  disabled: {
    scale: 1,
    opacity: 0.5,
    color: "var(--off-white)",
  },
};

const outlinedButtonVariants = {
  initial: {
    scale: 1,
    background: "transparent",
    border: "2px solid var(--off-white)",
  },
  hover: {
    scale: 1.05,
    background: "var(--primary)",
    color: "var(--off-white)",
    border: "2px solid var(--primary)",
  },
};

const waveVariants = {
  initial: {
    rotate: 0,
  },
  wave: {
    rotate: "45deg",
    transition: {
      duration: 0.15,
      yoyo: Infinity,
    },
  },
};

const waveContainerVariants = {
  initial: {
    boxShadow: "0px 0px 0px 0px var(--primary)",
  },
  hover: {
    boxShadow: "15px 15px 0px 1px var(--primary)",
  },
};

const contractAddress = "0xa918B9278076A6889A39c2Ee28C0eD919F2aB5eC";

export default function App() {
  // Store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [isMining, setIsMining] = useState(false);
  const [inputText, setInputText] = useState("");
  const contractABI = abiFile.abi;

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      // Check if user has metamask
      console.log("Make sure you have metamask");
      return;
    }

    console.log("We have the ethereum object", ethereum);

    // Check if we are authroized ti access the user's wallet
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length === 0) {
      console.log("No authorized account found :(");
      return;
    }

    const account = accounts[0];
    console.log("Found an authorized account:", account);
    setCurrentAccount(account);

    await getAllWaves();
  };

  // Allow user to connect their wallet if we don't have access to an authorized user
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      await getAllWaves();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const getWaveContract = () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Ethreum object doesn't exist!");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    return wavePortalContract;
  };

  const getAllWaves = async () => {
    try {
      const wavePortalContract = getWaveContract();
      if (!wavePortalContract) return;

      const waves = await wavePortalContract.getAllWaves();

      console.log("waves...", waves);

      // We only need the address, timeStamp, and message
      let wavesCleaned = [];
      waves.forEach((wave) => {
        wavesCleaned.push({
          address: wave.waver,
          timeStamp: new Date(parseInt(wave.timeStamp._hex) * 1000),
          message: wave.message,
        });
      });

      setAllWaves(wavesCleaned);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const wavePortalContract = getWaveContract();
      if (!wavePortalContract) return;

      setIsMining(true);

      // Execute the actual wave from smart contract
      const waveTxn = await wavePortalContract.wave(inputText);
      console.log("Mining...", waveTxn.hash);

      // Technically when mining begins
      await waveTxn.wait();
      console.log("Mined --- ", waveTxn.hash);
      setIsMining(false);
      setInputText("");

      await getAllWaves();
    } catch (error) {
      setIsMining(false);
      console.log(error);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="wave emoji">
            🥂
          </span>{" "}
          Hey there!
        </div>

        <div className="bio">
          My name is Yuma, and I am a fullstack developer{" "}
          <span role="img" aria-label="computer emoji">
            💻
          </span>
          <br />
          Connect your Ethereum wallet and wave at me!
        </div>

        {currentAccount && (
          <div className="totalNumContainer">
            <span>[ Total ]</span>

            <div className="totalNum">
              <motion.div
                variants={waveVariants}
                initial="initial"
                whileHover="wave"
                role="img"
                aria-label="wave emoji"
                className="waveEmoji"
              >
                👋
              </motion.div>{" "}
              {allWaves.length}
            </div>
          </div>
        )}
        {currentAccount && (
          <motion.div
            className="previewContainer"
            variants={waveContainerVariants}
            initial="initial"
            whileHover="hover"
          >
            <input
              placeholder="Link to Beautiful Image (https://unsplash.com/)"
              disabled={isMining}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input"
            />
            {inputText.length > 0 && (
              <img src={inputText} alt={inputText} className="message" />
            )}
            <motion.button
              variants={filledButtonVariants}
              animate={
                isMining || inputText.length === 0 ? "disabled" : "initial"
              }
              whileHover={!isMining && inputText.length > 0 && "hover"}
              className="waveButton"
              disabled={isMining || inputText.length === 0}
              onClick={wave}
            >
              {isMining ? "Waving..." : "Wave at Me"}
            </motion.button>
          </motion.div>
        )}

        {!currentAccount && (
          <motion.button
            variants={outlinedButtonVariants}
            initial="initial"
            whileHover="hover"
            className="waveButtonOutlined"
            onClick={connectWallet}
          >
            Connect Wallet
          </motion.button>
        )}

        <div className="allWavesContainer">
          {allWaves.map((wave, index) => {
            console.log(wave);
            return (
              <motion.div
                variants={waveContainerVariants}
                initial="initial"
                whileHover="hover"
                key={index}
                className="waveContainer"
              >
                <img
                  src={wave.message}
                  alt={wave.message}
                  className="message"
                />
                <div className="address">
                  <span role="img" aria-label="wave emoji">
                    👋
                  </span>{" "}
                  {wave.address}
                </div>
                <div className="timeStamp">
                  {moment(wave.timeStamp).fromNow()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
