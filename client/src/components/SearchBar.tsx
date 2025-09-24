import { useState } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string, filters: string[]) => void
  onClear?: () => void
  showFilters?: boolean
  filterOptions?: { value: string; label: string }[]
  className?: string
}

export function SearchBar({
  placeholder = "Search knowledge base, incidents, or ask a question...",
  onSearch,
  onClear,
  showFilters = true,
  filterOptions = [
    { value: "incidents", label: "Incidents" },
    { value: "knowledge", label: "Knowledge Base" },
    { value: "solutions", label: "Solutions" },
    { value: "docs", label: "Documentation" },
  ],
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const handleSearch = (searchQuery: string) => {
    console.log("Search triggered:", searchQuery, selectedFilters)
    onSearch?.(searchQuery, selectedFilters)
  }

  const handleClear = () => {
    setQuery("")
    setSelectedFilters([])
    console.log("Search cleared")
    onClear?.()
  }

  const toggleFilter = (filterValue: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterValue)
        ? prev.filter(f => f !== filterValue)
        : [...prev, filterValue]
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(query)
            }
          }}
          placeholder={placeholder}
          className="pl-9 pr-20"
          data-testid="input-search"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-6 w-6"
              data-testid="button-clear-search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  data-testid="button-search-filters"
                >
                  <Filter className="h-3 w-3" />
                  {selectedFilters.length > 0 && (
                    <Badge variant="destructive" className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-xs">
                      {selectedFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Search in</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={selectedFilters.includes(option.value)}
                    onCheckedChange={() => toggleFilter(option.value)}
                    data-testid={`filter-${option.value}`}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {selectedFilters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedFilters.map((filter) => {
            const option = filterOptions.find(opt => opt.value === filter)
            return (
              <Badge
                key={filter}
                variant="secondary"
                className="text-xs"
                data-testid={`active-filter-${filter}`}
              >
                {option?.label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => toggleFilter(filter)}
                />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}