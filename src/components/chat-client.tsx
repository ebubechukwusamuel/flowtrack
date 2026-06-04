"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Send, Search, ArrowLeft, LoaderPinwheel, User, Users,
  Paperclip, Image, File, Video, Mic, X, FileText, Download,
  Check, Pencil, Trash2, Ellipsis,
} from "lucide-react"
import { VoiceRecorder } from "@/components/voice-recorder"

interface Member {
  id: string
  name: string | null
  image: string | null
  email: string | null
}

interface Attachment {
  id: string
  type: string
  name: string
  data: string
  size: number
}

interface ChatMessage {
  id: string
  content: string | null
  createdAt: string
  editedAt: string | null
  deletedAt: string | null
  senderId: string
  sender: { id: string; name: string | null; image: string | null }
  attachments: Attachment[]
}

interface ChatInfo {
  id: string
  participants: { user: Member }[]
  messages: { content: string | null; createdAt: string; sender: { id: string; name: string | null }; attachments?: { id: string; type: string; name: string }[]; deletedAt?: string | null }[]
  updatedAt: string
}

const ACCEPTED_TYPES = "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv,.json,.xml"

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return "now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

function getFileIcon(type: string) {
  if (type === "image") return <Image className="h-4 w-4" />
  if (type === "video") return <Video className="h-4 w-4" />
  if (type === "audio") return <Mic className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

function isImage(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase()
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext || "")
}

function isVideo(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase()
  return ["mp4", "webm", "mov", "avi", "mkv"].includes(ext || "")
}

function isAudio(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase()
  return ["mp3", "wav", "ogg", "webm", "m4a"].includes(ext || "")
}

function AvatarImg({ src, name, className }: { src: string | null | undefined; name: string | null | undefined; className?: string }) {
  return src ? (
    <img src={src} alt="" className={`object-cover ${className || ""}`} />
  ) : (
    <span className={`flex items-center justify-center ${className || ""}`}>
      {(name || "?")[0].toUpperCase()}
    </span>
  )
}

export function ChatClient({ userId }: { userId: string }) {
  const [chats, setChats] = useState<ChatInfo[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; dataUrl: string }[]>([])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [menuMessageId, setMenuMessageId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const memberBarRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([fetchChats(), fetchMembers()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuMessageId(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
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

  function chatForMember(memberId: string): ChatInfo | undefined {
    return chats.find((c) => c.participants.some((p) => p.user.id === memberId))
  }

  function lastMessageForMember(memberId: string): ChatInfo["messages"][0] | null {
    const chat = chatForMember(memberId)
    return chat?.messages[0] || null
  }

  const otherParticipant = useCallback((chat: ChatInfo): Member | null => {
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

  async function sendMessage(voiceBlob?: Blob) {
    if (sending) return

    const attachments: { type: string; name: string; data: string; size: number }[] = []

    if (voiceBlob) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(voiceBlob)
      })
      attachments.push({ type: "audio", name: "Voice note.webm", data: dataUrl, size: voiceBlob.size })
    }

    for (const p of pendingAttachments) {
      const type = isImage(p.file.name) ? "image" : isVideo(p.file.name) ? "video" : isAudio(p.file.name) ? "audio" : "document"
      attachments.push({ type, name: p.file.name, data: p.dataUrl, size: p.file.size })
    }

    if (!input.trim() && attachments.length === 0) return
    if (!selectedChat) return

    setSending(true)
    const content = input.trim()
    setInput("")
    setPendingAttachments([])

    try {
      const res = await fetch(`/api/chats/${selectedChat}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content || null, attachments }),
      })
      const data = await res.json()
      if (res.ok && data.message) setMessages((prev) => [...prev, data.message])
    } catch (e) {
      console.error("[SEND]", e)
    }
    setSending(false)
  }

  async function handleEditMessage(messageId: string) {
    if (!editText.trim()) return
    try {
      const res = await fetch(`/api/chats/${selectedChat}/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages((prev) => prev.map((m) => m.id === messageId ? data.message : m))
        setEditingMessageId(null)
        setEditText("")
        setMenuMessageId(null)
      }
    } catch (e) {
      console.error("[EDIT]", e)
    }
  }

  async function handleDeleteMessage(messageId: string) {
    try {
      const res = await fetch(`/api/chats/${selectedChat}/messages/${messageId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, content: null, deletedAt: new Date().toISOString() } : m))
        setMenuMessageId(null)
      }
    } catch (e) {
      console.error("[DELETE]", e)
    }
  }

  function handleMessageContext(e: React.MouseEvent, msg: ChatMessage) {
    if (msg.deletedAt || msg.senderId !== userId) return
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setMenuMessageId(msg.id)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPendingAttachments((prev) => [...prev, { file, dataUrl: event.target?.result as string }])
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  function removePendingAttachment(index: number) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  function handleVoiceRecording(blob: Blob) {
    sendMessage(blob)
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

  function lastMessagePreview(msg: ChatInfo["messages"][0]): string {
    if (msg.deletedAt) return "Message deleted"
    if (msg.content) {
      return msg.sender.id === userId ? `You: ${msg.content}` : msg.content
    }
    const attach = (msg as any).attachments?.[0]
    if (attach) {
      const label = attach.type === "image" ? "an image" : attach.type === "video" ? "a video" : attach.type === "audio" ? "a voice note" : "a file"
      return msg.sender.id === userId ? `You sent ${label}` : `Sent ${label}`
    }
    return "No messages yet"
  }

  function isOwnMessage(msg: ChatMessage): boolean {
    return msg.senderId === userId
  }

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
                  <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 text-sm text-white overflow-hidden">
                    <AvatarImg src={m.image} name={m.name} className="h-full w-full rounded-full" />
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
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{lastMessagePreview(last)}</p>
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
        {/* Team Member Bar */}
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
                      <AvatarImg src={m.image} name={m.name} className="h-full w-full rounded-full" />
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
                  return <AvatarImg src={other?.image} name={other?.name} className="h-full w-full rounded-full" />
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
                  const isMe = isOwnMessage(msg)
                  const isDeleted = !!msg.deletedAt

                  if (isDeleted) {
                    return (
                      <div key={msg.id} className="flex justify-center py-1">
                        <p className="text-[11px] text-zinc-600 italic">
                          {isMe ? "You deleted this message" : `${msg.sender.name || "Someone"} deleted this message`}
                        </p>
                      </div>
                    )
                  }

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}
                    >
                      {/* Sender avatar (only for other people's messages) */}
                      {!isMe && (
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden text-xs text-white">
                          <AvatarImg src={msg.sender.image} name={msg.sender.name} className="h-full w-full rounded-full" />
                        </div>
                      )}

                      <div className={`space-y-1 max-w-[75%] ${isMe ? "" : ""}`}>
                        {/* Sender name */}
                        {!isMe && msg.sender.name && (
                          <p className="text-[11px] text-zinc-500 ml-1">{msg.sender.name}</p>
                        )}

                        {/* Message bubble */}
                        <div
                          onContextMenu={(e) => handleMessageContext(e, msg)}
                          className={`group relative rounded-2xl px-4 py-2 ${
                            isMe
                              ? "bg-[#CAFF33] text-[#1A1A1A] rounded-br-md"
                              : "bg-[#262626] text-zinc-200 rounded-bl-md"
                          }`}
                        >
                          {editingMessageId === msg.id ? (
                            <div className="flex gap-2">
                              <input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditMessage(msg.id) }
                                  if (e.key === "Escape") { setEditingMessageId(null); setEditText("") }
                                }}
                                className="flex-1 bg-transparent border-b border-current text-sm outline-none"
                                autoFocus
                              />
                              <button onClick={() => handleEditMessage(msg.id)} className="text-xs font-medium">
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Text content */}
                              {msg.content && (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                              )}

                              {/* Attachments */}
                              {msg.attachments?.length > 0 && (
                                <div className={`space-y-1.5 mt-1.5 ${!msg.content ? "" : ""}`}>
                                  {msg.attachments.map((att) => (
                                    <AttachmentDisplay key={att.id} attachment={att} />
                                  ))}
                                </div>
                              )}

                              {/* Timestamp row */}
                              <div className={`flex items-center gap-1.5 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                <span className={`text-[10px] ${isMe ? "text-[#1A1A1A]/60" : "text-zinc-500"}`}>
                                  {formatTime(msg.createdAt)}
                                </span>
                                {msg.editedAt && (
                                  <span className={`text-[9px] ${isMe ? "text-[#1A1A1A]/50" : "text-zinc-600"}`}>edited</span>
                                )}
                              </div>

                              {/* Context menu trigger (only own messages) */}
                              {isMe && (
                                <button
                                  onClick={(e) => handleMessageContext(e, msg)}
                                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-[#1A1A1A] border border-[#262626] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Ellipsis className="h-3 w-3 text-zinc-400" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* My avatar (right side, shown for own messages) */}
                      {isMe && (
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden text-xs text-white">
                          <AvatarImg src={members.find((m) => m.id === userId)?.image} name="You" className="h-full w-full rounded-full" />
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Context Menu */}
            <AnimatePresence>
              {menuMessageId && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ position: "fixed", left: menuPos.x - 120, top: menuPos.y - 10, zIndex: 100 }}
                  className="bg-[#1C1C1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
                >
                  <button
                    onClick={() => {
                      const msg = messages.find((m) => m.id === menuMessageId)
                      if (msg) { setEditingMessageId(msg.id); setEditText(msg.content || ""); setMenuMessageId(null) }
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-[#262626] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(menuMessageId!)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-[#262626] transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pending Attachments Preview */}
            {pendingAttachments.length > 0 && (
              <div className="px-4 py-2 border-t border-[#262626] bg-[#1C1C1C]/30">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {pendingAttachments.map((p, i) => (
                    <div key={i} className="relative shrink-0 group">
                      {isImage(p.file.name) ? (
                        <div className="h-16 w-16 rounded-lg overflow-hidden border border-[#262626]">
                          <img src={p.dataUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : isVideo(p.file.name) ? (
                        <div className="h-16 w-16 rounded-lg bg-zinc-800 flex items-center justify-center border border-[#262626]">
                          <Video className="h-5 w-5 text-zinc-400" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-zinc-800 flex flex-col items-center justify-center border border-[#262626] p-1">
                          <FileText className="h-5 w-5 text-zinc-400" />
                          <span className="text-[8px] text-zinc-500 truncate max-w-full px-0.5">{p.file.name.split(".").pop()}</span>
                        </div>
                      )}
                      <button
                        onClick={() => removePendingAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[#262626]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1C1C1C] transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES}
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <VoiceRecorder onRecordingComplete={handleVoiceRecording} />

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
                  onClick={() => sendMessage()}
                  disabled={(!input.trim() && pendingAttachments.length === 0) || sending}
                  className="p-2.5 bg-[#CAFF33] rounded-xl text-[#1A1A1A] disabled:opacity-30 hover:bg-[#d8ff5c] transition-colors"
                >
                  {sending ? <LoaderPinwheel className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AttachmentDisplay({ attachment }: { attachment: Attachment }) {
  const att = attachment

  if (isImage(att.name)) {
    return (
      <div className="max-w-[260px] rounded-xl overflow-hidden border border-[#262626]">
        <a href={att.data} target="_blank" rel="noopener noreferrer">
          <img src={att.data} alt={att.name} className="w-full max-h-64 object-cover" />
        </a>
      </div>
    )
  }

  if (isVideo(att.name)) {
    return (
      <div className="max-w-[280px] rounded-xl overflow-hidden border border-[#262626]">
        <video controls className="w-full max-h-64">
          <source src={att.data} />
        </video>
      </div>
    )
  }

  if (isAudio(att.name)) {
    return (
      <div className="rounded-xl bg-[#1C1C1C] border border-[#262626] p-3 max-w-[240px]">
        <div className="flex items-center gap-2 mb-1.5">
          <Mic className="h-3.5 w-3.5 text-[#CAFF33]" />
          <span className="text-xs text-zinc-400 truncate">{att.name.replace(/\.[^.]+$/, "")}</span>
        </div>
        <audio controls className="w-full h-8">
          <source src={att.data} />
        </audio>
      </div>
    )
  }

  return (
    <a
      href={att.data}
      download={att.name}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl bg-[#1C1C1C] border border-[#262626] p-3 hover:bg-[#222] transition-colors max-w-[240px] group"
    >
      <div className="h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
        {getFileIcon(att.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{att.name}</p>
        <p className="text-[10px] text-zinc-500">{formatFileSize(att.size)}</p>
      </div>
      <Download className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
    </a>
  )
}
