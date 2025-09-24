import { SearchBar } from '../SearchBar'

export default function SearchBarExample() {
  return (
    <div className="p-4 max-w-2xl">
      <SearchBar
        onSearch={(query, filters) => console.log('Search:', query, filters)}
        onClear={() => console.log('Search cleared')}
      />
    </div>
  )
}