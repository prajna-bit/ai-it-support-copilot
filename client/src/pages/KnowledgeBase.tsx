import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Filter, ExternalLink } from "lucide-react"

interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
}

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const searchArticles = async (query: string = searchQuery) => {
    if (!query.trim() && selectedCategory === "all") {
      // Load all articles
      loadAllArticles()
      return
    }
    
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (selectedCategory !== "all") params.set('category', selectedCategory)
      
      const response = await fetch(`/api/knowledge-base/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error("Failed to search knowledge base:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllArticles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/knowledge-base")
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error("Failed to load articles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllArticles()
  }, [])

  const handleSearch = () => {
    searchArticles()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const categories = ["all", "Windows", "Mac", "Network", "Email", "Hardware", "Performance"]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Search our comprehensive IT support documentation</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                data-testid="search-knowledge-base"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading} data-testid="button-search">
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground mt-2" />
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category)
                  searchArticles()
                }}
                data-testid={`filter-${category}`}
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Searching knowledge base...</p>
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try different search terms or browse all categories" : "Loading articles..."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {articles.length} article{articles.length !== 1 ? "s" : ""} found
              </p>
            </div>
            
            {articles.map((article) => (
              <Card key={article.id} className="hover-elevate" data-testid={`article-${article.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <Badge variant="secondary">{article.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {article.content.substring(0, 200)}
                    {article.content.length > 200 && "..."}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {article.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button variant="ghost" size="sm" data-testid={`view-article-${article.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Full Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}