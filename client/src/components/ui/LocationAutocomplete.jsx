import React, { useState, useEffect, useRef } from "react";
import { IconMapPin, IconLoader2, IconSearch } from "@tabler/icons-react";
import { cn } from "../utils/cn";

const LocationAutocomplete = ({
  label,
  value,
  onChange,
  error,
  placeholder = "Search location...",
  disabled = false,
  className,
}) => {
  const [query, setQuery] = useState(value?.display_name || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (value && value.display_name !== query) {
      setQuery(value.display_name);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!newQuery) {
      onChange(null);
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      searchLocation(newQuery);
    }, 500);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.display_name);
    setIsOpen(false);
    onChange({
      display_name: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
  };

  return (
    <div className={cn("flex flex-col gap-1.5 relative w-full", className)} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <IconSearch
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10"
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => {
            if (query.length >= 3) setIsOpen(true);
          }}
          className={cn(
            "w-full h-14 pl-11 pr-10 rounded-2xl border text-sm font-medium transition-all outline-none",
            "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white",
            disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : "bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
          )}
        />
        {isLoading && (
          <IconLoader2
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin z-10"
          />
        )}
      </div>
      {error && <span className="text-xs font-semibold text-red-500 ml-1">{error}</span>}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-[80px] left-0 w-full bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50">
          <ul className="max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-3 hover:bg-emerald-50 cursor-pointer flex items-start gap-3 transition-colors border-b border-slate-50 last:border-none group"
              >
                <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                  <IconMapPin size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 line-clamp-1">
                    {suggestion.display_name.split(",")[0]}
                  </span>
                  <span className="text-xs font-medium text-slate-400 line-clamp-1">
                    {suggestion.display_name.split(",").slice(1).join(",").trim()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
