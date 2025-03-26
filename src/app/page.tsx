/** @format */

// app/page.tsx
"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { MessageStorageABI, type Message } from "../contract/abi";

const CONTRACT_ADDRESS = "0x102fFED303851eeD8185E3EA8D291820009CfD3e";

export default function MessageApp() {
  const { isConnected } = useAccount();
  const [message, setMessage] = useState("");
  const [ethAmount, setEthAmount] = useState("0.01");
  const [messages, setMessages] = useState<Message[]>([]);
  const [contractBalance, setContractBalance] = useState<string>("0");

  const { writeContract, isPending, isSuccess } = useWriteContract();
  const { data: allMessages } = useReadContract({
    abi: MessageStorageABI,
    address: CONTRACT_ADDRESS,
    functionName: "getAllMessages",
  });

  const { data: balance } = useReadContract({
    abi: MessageStorageABI,
    address: CONTRACT_ADDRESS,
    functionName: "getBalance",
  });

  const { data: owner } = useReadContract({
    abi: MessageStorageABI,
    address: CONTRACT_ADDRESS,
    functionName: "owner",
  });

  useEffect(() => {
    if (allMessages) {
      setMessages(
        allMessages.map((msg) => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
        }))
      );
    }
    if (balance !== undefined) {
      setContractBalance(balance.toString());
    }
  }, [allMessages, balance]);

  useEffect(() => {
    if (isSuccess) {
      setMessage("");
      setEthAmount("0.01");
    }
  }, [isSuccess]);

  const handleSendMessage = async () => {
    if (!message || !ethAmount) return;

    // 2. Execute transaction
    try {
      await writeContract({
        abi: MessageStorageABI,
        address: CONTRACT_ADDRESS,
        functionName: "pay",
        args: [message],
        value: parseEther(ethAmount), // Convert to wei
      });

      // 3. On success:
      alert("Message sent successfully!");
      setMessage(""); // Reset form
    } catch (error: any) {
      console.error("Transaction failed:", error);
      alert(`Error: ${error.shortMessage || error.message}`);
    }
  };

  useEffect(() => {
    if (allMessages) {
      setMessages(
        allMessages.map((msg) => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
        }))
      );
    }
  }, [allMessages]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Message Storage</h1>

          {/* Using the Reowns Appkit Button */}
          <appkit-button />
        </div>

        {isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Message Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl text-black font-semibold mb-4">
                Send Message
              </h2>
              <div className="mb-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  rows={3}
                  placeholder="Write your message here"
                />
              </div>
              <div className="mb-4">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-black"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={isPending || !message}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:opacity-50"
              >
                {isPending ? "Sending..." : `Send with ${ethAmount} ETH`}
              </button>
            </div>

            {/* Messages Display */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md text-black">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Stored Messages</h2>
                <div className="text-gray-600">
                  Contract Balance: {contractBalance} ETH
                </div>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between">
                        <span className="font-medium">{msg.sender}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(
                            Number(msg.timestamp) * 1000
                          ).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No messages yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-xl text-gray-700 mb-4">
              Connect your wallet to interact with the contract
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
