"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { MessageSquare, Send, Search, ArrowLeft, LoaderPinwheel, User, Users } from "lucide-react"

interface Member {
  id: string
  name: string | null
  image: string | null
  email: string | null
}

interface Chat {
  id: string
  participants: { user: Member }[]
  messages: { content: string; createdAt: string; sender: { id: string; name: string | null } }[]
  updatedAt: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  sender: { id: string; name: string | null; image: string | null }
}

export function ChatClient({ userId }: { userId: string }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const memberBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([fetchChats(), fetchMembers()]).finally(() => setLoading(false))
  }, [])

  async function fetchChats() {
    try {
      const res = await fetch("/api/chats")
      const data = await res.json()
      if (res.ok) setChats(data.chats)
    } catch (e) {
      console.error("[CHATS]", e)
    }
  }

  async function fetchMembers() {
    try {
      const res = await fetch("/api/org/members")
      const data = await res.json()
      if (res.ok) setMembers(data.members || [])
    } catch (e) {
      console.error("[MEMBERS]", e)
    }
  }

  useEffect(() => {
    if (!selectedChat) return
    const interval = setInterval(() => {
      fetch(`/api/chats/${selectedChat}/messages`).then((r) => r.json()).then((data) => {
        if (data.messages) setMessages(data.messages)
      }).catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedChat])

  function chatForMember(memberId: string): Chat | undefined {
    return chats.find((c) => c.participants.some((p) => p.user.id === memberId))
  }

  function lastMessageForMember(memberId: string): Chat["messages"][0] | null {
    const chat = chatForMember(memberId)
    return chat?.messages[0] || null
  }

  const otherParticipant = useCallback((chat: Chat): Member | null => {
    const other = chat.participants.find((p) => p.user.id !== userId)
    return other?.user || null
  }, [userId])

  async function selectOrStartChat(memberId: string) {
    const existing = chatForMember(memberId)
    if (existing) {
      setSelectedChat(existing.id)
      try {
        const res = await fetch(`/api/chats/${existing.id}/messages`)
        const data = await res.json()
        if (res.ok) setMessages(data.messages || [])
      } catch (e) {
        console.error("[MESSAGES]", e)
      }
      return
    }
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: memberId }),
      })
      const data = await res.json()
      if (res.ok && data.chat) {
        setChats((prev) => {
          const exists = prev.find((c) => c.id === data.chat.id)
          return exists ? prev : [data.chat, ...prev]
        })
        setSelectedChat(data.chat.id)
        setMessages([])
      }
    } catch (e) {
      console.error("[START_CHAT]", e)
    }
  }

  async function sendMessage() {
    if (!input.trim() || !selectedChat || sending) return
    setSending(true)
    const content = input.trim()
    setInput("")
    try {
      const res = await fetch(`/api/chats/${selectedChat}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message])
      }
    } catch (e) {
      console.error("[SEND]", e)
    }
    setSending(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const teamMembers = members.filter((m) => m.id !== userId)

  const filteredMembers = teamMembers
    .filter((m) => (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aLast = lastMessageForMember(a.id)
      const bLast = lastMessageForMember(b.id)
      const aTime = aLast ? new Date(aLast.createdAt).getTime() : 0
      const bTime = bLast ? new Date(bLast.createdAt).getTime() : 0
      return bTime - aTime
    })

  const selectedChatData = chats.find((c) => c.id === selectedChat)

  return (
    <div className="flex h-[calc(100vh-0px)] bg-[#1A1A1A]">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-[#262626] flex flex-col ${selectedChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-[#262626]">
          <h1 className="text-lg font-bold text-white mb-3">Chats</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members..."
              className="w-full bg-[#1C1C1C] border border-[#262626] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CAFF33]/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoaderPinwheel className="h-5 w-5 text-zinc-500 animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <User className="h-8 w-8 text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-500">No team members found</p>
            </div>
          ) : (
            filteredMembers.map((m) => {
              const chat = chatForMember(m.id)
              const last = lastMessageForMember(m.id)
              return (
                <motion.button
                  key={m.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectOrStartChat(m.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
                    selectedChatData?.participants.some((p) => p.user.id === m.id)
                      ? "bg-[#CAFF33]/5 border-l-2 border-[#CAFF33]"
                      : "border-l-2 border-transparent hover:bg-[#1C1C1C]"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 text-sm text-white">
                    {m.image?.[0] === "/" || m.image?.startsWith("data:") ? (
                      <img src={m.image} alt="" className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <span>{(m.name || "?")[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate">{m.name || "Unknown"}</span>
                      {last && (
                        <span className="text-[10px] text-zinc-500 shrink-0 ml-2">
                          {formatTime(last.createdAt)}
                        </span>
                      )}
                    </div>
                    {last ? (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {last.sender.id === userId ? "You: " : ""}{last.content}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-600 truncate mt-0.5">No messages yet</p>
                    )}
                  </div>
                </motion.button>
              )
            })
          )}
        </div>
      </div>

      {/* Conversation Panel */}
      <div className={`flex-1 flex flex-col ${!selectedChat ? "hidden md:flex" : "flex"}`}>
        {/* Team Member Bar - horizontal scrollable row of all members */}
        {teamMembers.length > 0 && (
          <div className="border-b border-[#262626] bg-[#1A1A1A] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-2 text-xs text-zinc-500">
              <Users className="h-3.5 w-3.5" />
              <span>Team Members</span>
            </div>
            <div ref={memberBarRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {teamMembers.map((m) => {
                const isActive = selectedChatData?.participants.some((p) => p.user.id === m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => selectOrStartChat(m.id)}
                    className={`flex flex-col items-center gap-1 shrink-0 px-2 py-1.5 rounded-xl transition-colors ${
                      isActive ? "bg-[#CAFF33]/10" : "hover:bg-[#1C1C1C]"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs text-white overflow-hidden ${
                      isActive ? "ring-2 ring-[#CAFF33]" : "bg-zinc-700"
                    }`}>
                      {m.image?.[0] === "/" || m.image?.startsWith("data:") ? (
                        <img src={m.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{(m.name || "?")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 truncate max-w-[56px] leading-tight text-center">
                      {m.name?.split(" ")[0] || "?"}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Choose someone to chat with</p>
              <p className="text-zinc-600 text-xs mt-1">Click a name from the bar above or the sidebar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#262626] bg-[#1C1C1C]/50">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-1 text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-9 w-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm text-white overflow-hidden">
                {selectedChatData && (() => {
                  const other = otherParticipant(selectedChatData)
                  return other?.image?.[0] === "/" || other?.image?.startsWith("data:") ? (
                    <img src={other.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{(other?.name || "?")[0].toUpperCase()}</span>
                  )
                })()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {selectedChatData ? otherParticipant(selectedChatData)?.name || "Unknown" : ""}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-zinc-600">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === userId
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-[#CAFF33] text-[#1A1A1A] rounded-br-md"
                            : "bg-[#262626] text-zinc-200 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-[#1A1A1A]/60" : "text-zinc-500"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#262626]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1C1C1C] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CAFF33]/50 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="p-2.5 bg-[#CAFF33] rounded-xl text-[#1A1A1A] disabled:opacity-30 hover:bg-[#d8ff5c] transition-colors"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return "now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
