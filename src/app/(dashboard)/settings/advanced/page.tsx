"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const modelConfigSchema = z.object({
  huggingfaceToken: z.string().optional(),
  embeddingModel: z.string().min(1, "Please select an embedding model"),
  splitterType: z.string().min(1, "Please select a splitter type"),
  chunkSize: z.number().min(1).max(2000),
  chunkOverlap: z.number().min(0).max(500),
  separator: z.string().optional(),
  maxTokens: z.number().min(1).max(10000),
  useTunedModel: z.boolean().default(false),
  tunedModelName: z.string().optional(),
})

type ModelConfigValues = z.infer<typeof modelConfigSchema>

export default function AdvancedSettingsPage() {
  const form = useForm<ModelConfigValues>({
    resolver: zodResolver(modelConfigSchema),
    defaultValues: {
      huggingfaceToken: "",
      embeddingModel: "BAAI/bge-base-en-v1.5",
      splitterType: "character",
      chunkSize: 500,
      chunkOverlap: 30,
      separator: "\n",
      maxTokens: 1000,
      useTunedModel: false,
      tunedModelName: "",
    },
  })

  const useTunedModel = form.watch("useTunedModel")

  function onSubmit(data: ModelConfigValues) {
    console.log(data)
    // Here you would save settings to your backend
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Advanced Model Configuration</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Model Access</CardTitle>
                <CardDescription>
                  Configure access tokens for external model providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="huggingfaceToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hugging Face Token</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your Huggingface token to access Huggingface models" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Your API token will be encrypted and stored securely
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Processing</CardTitle>
                <CardDescription>
                  Configure how documents are processed and embedded
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="embeddingModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Embedding Model</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select embedding model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BAAI/bge-base-en-v1.5">BAAI/bge-base-en-v1.5</SelectItem>
                          <SelectItem value="BAAI/bge-small-en-v1.5">BAAI/bge-small-en-v1.5</SelectItem>
                          <SelectItem value="BAAI/bge-large-en-v1.5">BAAI/bge-large-en-v1.5</SelectItem>
                          <SelectItem value="sentence-transformers/all-MiniLM-L6-v2">sentence-transformers/all-MiniLM-L6-v2</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="splitterType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Splitter Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select splitter type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="character">Character</SelectItem>
                          <SelectItem value="token">Token</SelectItem>
                          <SelectItem value="recursive">Recursive</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chunkSize"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Chunk Size</FormLabel>
                        <span className="text-sm text-muted-foreground">{value}</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={100}
                          max={2000}
                          step={50}
                          value={[value]}
                          onValueChange={(vals) => onChange(vals[0])}
                          className="pt-2"
                        />
                      </FormControl>
                      <FormDescription>
                        The size of text chunks for processing (higher values mean fewer chunks but may lose context)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chunkOverlap"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Chunk Overlap</FormLabel>
                        <span className="text-sm text-muted-foreground">{value}</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={200}
                          step={10}
                          value={[value]}
                          onValueChange={(vals) => onChange(vals[0])}
                          className="pt-2"
                        />
                      </FormControl>
                      <FormDescription>
                        Overlap between chunks to maintain context between segments
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="separator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Separator</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., newline '\n'" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Character or string used to separate chunks (e.g., newline, paragraph)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxTokens"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Max Tokens</FormLabel>
                        <span className="text-sm text-muted-foreground">{value}</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={100}
                          max={4000}
                          step={100}
                          value={[value]}
                          onValueChange={(vals) => onChange(vals[0])}
                          className="pt-2"
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of tokens to process in a single request
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fine-tuned Models</CardTitle>
                <CardDescription>
                  Configure fine-tuned models from Hugging Face
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="useTunedModel"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Use fine-tuned model from Hugging Face
                        </FormLabel>
                        <FormDescription>
                          Enable to use a custom fine-tuned model for better performance
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {useTunedModel && (
                  <FormField
                    control={form.control}
                    name="tunedModelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fine-tuned LLM</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fine-tuned model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mistralai/Mistral-7B-v0.1-finetuned">mistralai/Mistral-7B-v0.1-finetuned</SelectItem>
                            <SelectItem value="meta-llama/Llama-2-7b-chat-hf-finetuned">meta-llama/Llama-2-7b-chat-hf-finetuned</SelectItem>
                            <SelectItem value="google/gemma-7b-it-finetuned">google/gemma-7b-it-finetuned</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit">Save Configuration</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}