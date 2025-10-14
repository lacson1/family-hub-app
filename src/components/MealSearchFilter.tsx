import React, { useState } from 'react';
import { Search, X, Filter, Star } from 'lucide-react';

interface MealSearchFilterProps {
    onSearch: (query: string) => void;
    onFilterType: (type: string) => void;
    onFilterFavorites: (favoritesOnly: boolean) => void;
}

export const MealSearchFilter: React.FC<MealSearchFilterProps> = ({
    onSearch,
    onFilterType,
    onFilterFavorites
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        onFilterType(type);
    };

    const handleFavoritesToggle = () => {
        const newValue = !showFavoritesOnly;
        setShowFavoritesOnly(newValue);
        onFilterFavorites(newValue);
    };

    const handleClearAll = () => {
        setSearchQuery('');
        setSelectedType('all');
        setShowFavoritesOnly(false);
        onSearch('');
        onFilterType('all');
        onFilterFavorites(false);
    };

    const hasActiveFilters = searchQuery || selectedType !== 'all' || showFavoritesOnly;

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search meals..."
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Clear search"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2.5 rounded-xl border transition-all ${hasActiveFilters
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    aria-label={showFilters ? "Hide filters" : "Show filters"}
                >
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="bg-white rounded-xl p-4 shadow-medium border border-gray-200 space-y-4 animate-fade-in">
                    {/* Meal Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meal Type
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeChange(type)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type
                                            ? 'bg-blue-500 text-white shadow-soft'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Favorites Filter */}
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Show Favorites Only
                            </label>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Filter by favorite meals and templates
                            </p>
                        </div>
                        <button
                            onClick={handleFavoritesToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showFavoritesOnly ? 'bg-yellow-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showFavoritesOnly ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            >
                                {showFavoritesOnly && (
                                    <Star className="w-3 h-3 text-yellow-500 m-0.5" fill="currentColor" />
                                )}
                            </span>
                        </button>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearAll}
                            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && !showFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                            Search: "{searchQuery}"
                            <button onClick={() => handleSearchChange('')} aria-label="Remove search filter">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {selectedType !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                            {selectedType}
                            <button onClick={() => handleTypeChange('all')} aria-label="Remove type filter">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {showFavoritesOnly && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs">
                            <Star className="w-3 h-3" fill="currentColor" />
                            Favorites
                            <button onClick={handleFavoritesToggle} aria-label="Remove favorites filter">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    <button
                        onClick={handleClearAll}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
};

