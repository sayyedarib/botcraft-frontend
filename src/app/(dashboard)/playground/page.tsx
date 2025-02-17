"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type Message = {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function Playground() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInput("")

    // TODO: Add API call for bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: crypto.randomUUID(),
        text: "This is a sample response",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    }, 500)
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <h1 className="text-xl font-semibold">Playground</h1>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4 min-h-[calc(100vh-270px)] max-h-[calc(100vh-270px)]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-80">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}