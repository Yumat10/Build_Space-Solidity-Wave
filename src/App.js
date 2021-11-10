import * as React from "react";
import { ethers } from "ethers";

import "./App.css";
import { motion } from "framer-motion";

const buttonVariants = {
  initial: {
    scale: 1,
    background: "var(--off-white)",
  },
  hover: {
    scale: 1.1,
    background: "var(--primary)",
    color: "var(--off-white)",
  },
};

export default function App() {
  const wave = () => {};

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="wave emoji">
            👋
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

        <motion.button
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          className="waveButton"
          onClick={wave}
        >
          Wave at Me
        </motion.button>
      </div>
    </div>
  );
}
