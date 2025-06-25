"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Heart, Share2, BookOpen } from "lucide-react"
import { getDailyQuote, getRandomQuote, type MotivationalQuote } from "@/lib/motivational-quotes"
import { useToast } from "@/hooks/use-toast"

export default function DailyQuoteWidget() {
  const [quote, setQuote] = useState<MotivationalQuote | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [showDailyQuote, setShowDailyQuote] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Always load a random quote when component mounts (new quote every time app opens)
    const randomQuote = getRandomQuote()
    setQuote(randomQuote)
    setShowDailyQuote(false)

    // Check if user has liked this quote
    const likedQuotes = JSON.parse(localStorage.getItem("likedQuotes") || "[]")
    const quoteId = `${randomQuote.text}-${randomQuote.author}`
    setIsLiked(likedQuotes.includes(quoteId))
  }, [])

  const handleNewQuote = () => {
    const newQuote = getRandomQuote()
    setQuote(newQuote)
    setShowDailyQuote(false)

    // Check if new quote is liked
    const likedQuotes = JSON.parse(localStorage.getItem("likedQuotes") || "[]")
    const quoteId = `${newQuote.text}-${newQuote.author}`
    setIsLiked(likedQuotes.includes(quoteId))
  }

  const handleBackToDaily = () => {
    const dailyQuote = getDailyQuote()
    setQuote(dailyQuote)
    setShowDailyQuote(true)

    // Check if daily quote is liked
    const likedQuotes = JSON.parse(localStorage.getItem("likedQuotes") || "[]")
    const today = new Date().toDateString()
    setIsLiked(likedQuotes.includes(`${today}-${dailyQuote.text}`))
  }

  const handleLike = () => {
    if (!quote) return

    const likedQuotes = JSON.parse(localStorage.getItem("likedQuotes") || "[]")
    const quoteId = showDailyQuote ? `${new Date().toDateString()}-${quote.text}` : `${quote.text}-${quote.author}`

    if (isLiked) {
      const updatedLikes = likedQuotes.filter((id: string) => id !== quoteId)
      localStorage.setItem("likedQuotes", JSON.stringify(updatedLikes))
      setIsLiked(false)
      toast({
        title: "Quote removed from favorites",
        description: "You can always like it again later!",
      })
    } else {
      likedQuotes.push(quoteId)
      localStorage.setItem("likedQuotes", JSON.stringify(likedQuotes))
      setIsLiked(true)
      toast({
        title: "Quote added to favorites! ❤️",
        description: "Great choice! This quote will inspire you.",
      })
    }
  }

  const handleShare = async () => {
    if (!quote) return

    const shareText = `"${quote.text}" - ${quote.author}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Motivation",
          text: shareText,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Quote copied to clipboard! 📋",
          description: "Share this inspiration with others!",
        })
      } catch (error) {
        toast({
          title: "Unable to copy",
          description: "Please copy the quote manually.",
          variant: "destructive",
        })
      }
    }
  }

  if (!quote) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "success":
        return "🏆"
      case "learning":
        return "📚"
      case "perseverance":
        return "💪"
      case "wisdom":
        return "🧠"
      case "happiness":
        return "😊"
      case "family":
        return "👨‍👩‍👧‍👦"
      default:
        return "✨"
    }
  }

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-blue-600" />
          {showDailyQuote ? "Today's Inspiration" : "Fresh Inspiration"}
          <span className="text-2xl">{getCategoryEmoji(quote.category)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <blockquote className="text-lg font-medium leading-relaxed text-gray-800 dark:text-gray-200 italic">
          "{quote.text}"
        </blockquote>

        <div className="flex items-center justify-between">
          <cite className="text-sm font-semibold text-blue-600 dark:text-blue-400">— {quote.author}</cite>
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full capitalize">
            {quote.category}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-1 ${
              isLiked ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "hover:bg-gray-50"
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Liked" : "Like"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <Button variant="outline" size="sm" onClick={handleNewQuote} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            New Quote
          </Button>

          {!showDailyQuote && (
            <Button variant="outline" size="sm" onClick={handleBackToDaily} className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Daily Quote
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
