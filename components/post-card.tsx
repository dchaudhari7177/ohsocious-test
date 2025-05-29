"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Smile, MoreVertical, Flag, Trash2, Pencil } from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, parseISO, isValid } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X } from "lucide-react"

type ReactionType = "" | "😂" | "❤️" | "🫶" | "👍" | "🎉" | "🤔" | "😮"

type PostUser = {
  name: string
  avatar: string
  department: string
}

type PollOption = {
  text: string
  votes: number
}

type Comment = {
  id: string
  user: PostUser
  content: string
  timestamp: string
}

type Post = {
  id: string
  type: "normal" | "confession" | "poll"
  user?: {
    name: string
    avatar: string
    department: string
  }
  anonymousAvatar?: string
  anonymousName?: string
  content: string
  image?: string
  timestamp: string
  reactions: Record<ReactionType, number>
  comments: Array<{
    id: string
    user: {
      name: string
      avatar: string
      department: string
    }
    content: string
    timestamp: string
  }>
  options?: Array<{
    text: string
    votes: number
  }>
  isBookmarked?: boolean
  isOwn?: boolean
  reported?: boolean
}

interface PostCardProps {
  post: Post
  onReact?: (postId: string, emoji: ReactionType) => void
  onComment?: (postId: string, comment: string) => void
  onBookmark?: (postId: string) => void
  onEdit?: (postId: string, newContent: string) => void
  onDelete?: (postId: string) => void
  onShare?: (postId: string) => void
  onReport?: (postId: string) => void
  onVote?: (postId: string, optionIdx: number) => void
  onReply?: (postId: string, commentId: string, reply: string) => void
  onEditComment?: (postId: string, commentId: string, newContent: string, isReply?: boolean, parentCommentId?: string) => void
  onDeleteComment?: (postId: string, commentId: string, isReply?: boolean, parentCommentId?: string) => void
}

export function PostCard({ post, onReact, onReport, onDelete, onComment, onReply, onEditComment, onDeleteComment }: PostCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [isReported, setIsReported] = useState(post.reported)
  const [commentInput, setCommentInput] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const [commentReactions, setCommentReactions] = useState<Record<string, Record<string, number>>>({})
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({})
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({})
  const [isReplying, setIsReplying] = useState<Record<string, boolean>>({})
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editInput, setEditInput] = useState<string>("")

  // Auto-scroll to newest comment
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [post.comments.length])

  const handleReaction = (emoji: ReactionType) => {
    if (selectedReaction === emoji) {
      setSelectedReaction(null)
    } else {
      setSelectedReaction(emoji)
    }
    onReact?.(post.id, emoji)
    setShowReactionPicker(false)
  }

  const handleReport = () => {
    setIsReported(true)
    onReport?.(post.id)
  }

  const handleDelete = () => {
    onDelete?.(post.id)
  }

  const handleVote = (index: number) => {
    setSelectedOption(index)
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    setIsCommenting(true)
    await onComment?.(post.id, commentInput)
    setCommentInput("")
    setIsCommenting(false)
  }

  // Allow Enter to submit
  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && commentInput.trim()) {
      e.preventDefault()
      handleCommentSubmit(e as any)
    }
  }

  // Helper for relative time using date-fns
  function getRelativeTime(timestamp: string) {
    if (timestamp === "Just now") return timestamp
    // Try to parse ISO, fallback to string
    const date = parseISO(timestamp)
    if (isValid(date)) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    return timestamp
  }

  const totalVotes = post.options?.reduce((sum, option) => sum + option.votes, 0) || 0

  const reactionEmojis: ReactionType[] = ["❤️", "😂", "🔥", "🫶", "👍", "🎉", "🤔", "😮"]

  // Handle emoji reaction on comment
  const handleCommentReaction = (commentId: string, emoji: string) => {
    setCommentReactions(prev => {
      const prevReactions = prev[commentId] || {}
      return {
        ...prev,
        [commentId]: {
          ...prevReactions,
          [emoji]: (prevReactions[emoji] || 0) + 1,
        },
      }
    })
  }

  const handleReplyButton = (commentId: string) => {
    setShowReplyInput(prev => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const handleReplyInputChange = (commentId: string, value: string) => {
    setReplyInputs(prev => ({ ...prev, [commentId]: value }))
  }

  const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault()
    if (!replyInputs[commentId]?.trim()) return
    setIsReplying(prev => ({ ...prev, [commentId]: true }))
    await onReply?.(post.id, commentId, replyInputs[commentId])
    setReplyInputs(prev => ({ ...prev, [commentId]: "" }))
    setIsReplying(prev => ({ ...prev, [commentId]: false }))
    setShowReplyInput(prev => ({ ...prev, [commentId]: false }))
  }

  // Edit comment handlers
  const startEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId)
    setEditInput(content)
  }
  const saveEditComment = (commentId: string) => {
    onEditComment?.(post.id, commentId, editInput, false)
    setEditingCommentId(null)
    setEditInput("")
  }
  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditInput("")
  }
  const deleteComment = (commentId: string) => {
    if (window.confirm("Delete this comment?")) {
      onDeleteComment?.(post.id, commentId, false)
    }
  }

  // Edit reply handlers
  const startEditReply = (replyId: string, content: string) => {
    setEditingReplyId(replyId)
    setEditInput(content)
  }
  const saveEditReply = (parentCommentId: string, replyId: string) => {
    onEditComment?.(post.id, replyId, editInput, true, parentCommentId)
    setEditingReplyId(null)
    setEditInput("")
  }
  const cancelEditReply = () => {
    setEditingReplyId(null)
    setEditInput("")
  }
  const deleteReply = (parentCommentId: string, replyId: string) => {
    if (window.confirm("Delete this reply?")) {
      onDeleteComment?.(post.id, replyId, true, parentCommentId)
    }
  }

  // Helper to render replies (with icon buttons)
  const renderReplies = (replies?: Comment[], parentCommentId?: string) => {
    if (!replies || replies.length === 0) return null
    return (
      <div className="ml-8 mt-2 space-y-2">
        {replies.map(reply => (
          <div key={reply.id} className="group flex items-start gap-2 rounded-md hover:bg-gray-50 border-b border-gray-100 py-2 pr-2 transition-colors">
            <Image
              src={reply.user.avatar}
              alt={reply.user.name}
              width={20}
              height={20}
              className="rounded-full object-cover mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  {reply.user.name}
                  <span className="text-[10px] text-gray-400 font-normal">{getRelativeTime(reply.timestamp)}</span>
                </div>
                <div className="hidden group-hover:flex flex-row gap-1 items-center sm:flex">
                  <TooltipProvider>
                    {reply.user.name === "You" ? (
                      <>
                        <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => startEditReply(reply.id, reply.content)}><Pencil className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => deleteReply(parentCommentId!, reply.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                      </>
                    ) : null}
                    <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => handleReplyButton(reply.id)}><MessageSquare className="h-4 w-4 text-primary-purple" /></Button></TooltipTrigger><TooltipContent>Reply</TooltipContent></Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {editingReplyId === reply.id ? (
                <div className="flex gap-2 mt-1">
                  <input type="text" className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:border-primary-purple focus:outline-none" value={editInput} onChange={e => setEditInput(e.target.value)} />
                  <Button size="icon" variant="ghost" onClick={() => saveEditReply(parentCommentId!, reply.id)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={cancelEditReply}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="text-xs text-gray-600 mt-1">{reply.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        post.type === "confession" && "glow border-none bg-gradient-to-r from-primary-purple/5 to-secondary-pink/5"
      )}
    >
      <CardHeader className="space-y-0 p-4 pb-0">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.type === "normal" || post.type === "poll" ? (
            <>
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={post.user?.avatar || "/placeholder.svg?height=40&width=40"}
                  alt={post.user?.name || "User"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{post.user?.name}</p>
                <p className="text-xs text-gray-500">
                  {post.user?.department} • {post.timestamp}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary-purple/20 to-secondary-pink/20 text-xl">
                {post.anonymousAvatar}
              </div>
              <div>
                <p className="font-medium">{post.anonymousName}</p>
                <p className="text-xs text-gray-500">{post.timestamp}</p>
              </div>
            </>
          )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.isOwn ? (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </DropdownMenuItem>
              ) : !isReported ? (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={handleReport}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report Post
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-gray-500">
                  <Flag className="mr-2 h-4 w-4" />
                  Reported
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="whitespace-pre-line text-gray-800">{post.content}</p>

        {post.image && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              width={500}
              height={300}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {post.type === "poll" && post.options && (
          <div className="mt-4 space-y-3">
            {post.options.map((option, index) => {
              const percentage = Math.round((option.votes / totalVotes) * 100) || 0
              return (
                <div key={index} className="space-y-1">
                  <Button
                    variant={selectedOption === index ? "default" : "outline"}
                    className={`w-full justify-start px-4 py-2 text-left ${
                      selectedOption === index ? "bg-primary-purple text-white" : ""
                    }`}
                    onClick={() => handleVote(index)}
                    disabled={selectedOption !== null}
                  >
                    {option.text}
                  </Button>
                  {selectedOption !== null && (
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="h-2" />
                      <span className="text-xs font-medium">{percentage}%</span>
                    </div>
                  )}
                </div>
              )
            })}
            <p className="text-xs text-gray-500">{totalVotes} votes</p>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold text-gray-700">Comments</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {post.comments.length === 0 ? (
              <div className="text-xs text-gray-400">No comments yet.</div>
            ) : (
              Array.isArray(post.comments) ? post.comments.map(comment => (
                <div key={comment.id} className="group flex items-start gap-2 rounded-md hover:bg-gray-50 border-b border-gray-100 py-2 pr-2 transition-colors">
                  <Image
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    width={24}
                    height={24}
                    className="rounded-full object-cover mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                        {comment.user.name}
                        <span className="text-[10px] text-gray-400 font-normal">{getRelativeTime(comment.timestamp)}</span>
                      </div>
                      <div className="hidden group-hover:flex flex-row gap-1 items-center sm:flex">
                        <TooltipProvider>
                          {comment.user.name === "You" ? (
                            <>
                              <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => startEditComment(comment.id, comment.content)}><Pencil className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
                              <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => deleteComment(comment.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                            </>
                          ) : null}
                          <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={() => handleReplyButton(comment.id)}><MessageSquare className="h-4 w-4 text-primary-purple" /></Button></TooltipTrigger><TooltipContent>Reply</TooltipContent></Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="flex gap-2 mt-1">
                        <input type="text" className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:border-primary-purple focus:outline-none" value={editInput} onChange={e => setEditInput(e.target.value)} />
                        <Button size="icon" variant="ghost" onClick={() => saveEditComment(comment.id)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEditComment}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 mt-1">{comment.content}</div>
                    )}
                    {/* Emoji reactions for comment */}
                    <div className="flex items-center gap-1 mt-1">
                      {['❤️', '😂', '🔥', '👍'].map(emoji => (
                        <button key={emoji} type="button" className="text-xs px-1 hover:bg-gray-100 rounded" onClick={() => handleCommentReaction(comment.id, emoji)}>
                          {emoji} {commentReactions[comment.id]?.[emoji] || 0}
                        </button>
                      ))}
                    </div>
                    {/* Reply input */}
                    {showReplyInput[comment.id] && (
                      <form className="mt-2 flex gap-2" onSubmit={e => handleReplySubmit(e, comment.id)}>
                        <input type="text" className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:border-primary-purple focus:outline-none" placeholder="Write a reply..." value={replyInputs[comment.id] || ""} onChange={e => handleReplyInputChange(comment.id, e.target.value)} disabled={isReplying[comment.id]} />
                        <Button type="submit" size="sm" className="bg-primary-purple text-xs px-3" disabled={!replyInputs[comment.id]?.trim() || isReplying[comment.id]}>{isReplying[comment.id] ? "Replying..." : "Reply"}</Button>
                      </form>
                    )}
                    {/* Render replies */}
                    {renderReplies(comment.replies, comment.id)}
                  </div>
                </div>
              )) : null
            )}
            <div ref={commentsEndRef} />
          </div>
          <form className="mt-2 flex gap-2" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:border-primary-purple focus:outline-none"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              disabled={isCommenting}
              aria-label="Add a comment"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-primary-purple text-xs px-3"
              disabled={!commentInput.trim() || isCommenting}
            >
              {isCommenting ? "Posting..." : "Post"}
            </Button>
          </form>
        </div>
        {/* End Comments Section */}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-2">
        <div className="flex items-center gap-1">
          <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 hover:bg-gray-100"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="flex gap-1">
                {reactionEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
        <div className="flex gap-1">
          {Object.entries(post.reactions).map(([emoji, count]) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
                className={cn(
                  "h-8 gap-1 px-2 transition-all duration-200",
                  selectedReaction === emoji && "bg-gray-100 scale-110"
                )}
                onClick={() => handleReaction(emoji as ReactionType)}
            >
              <span className="text-base">{emoji}</span>
                <span className="text-xs font-medium">
                  {count + (selectedReaction === emoji ? 1 : 0)}
                </span>
            </Button>
          ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs font-medium">{post.comments.length}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
