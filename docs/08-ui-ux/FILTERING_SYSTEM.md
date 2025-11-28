# Coach Filtering System - Documentation

## Overview

This document describes the normalized filtering system for the Explore Coaches page. The system ensures consistent, deduplicated filter values across the entire application.

## Architecture

### Source of Truth

All filter values MUST come from canonical constants defined in [src/constants/poker.ts](src/constants/poker.ts):

- **Languages**: `SUPPORTED_LANGUAGES` - ISO 639-1 codes (`fr`, `en`, `es`, `pt`, `de`, `it`)
- **Formats**: `POKER_FORMATS` - Canonical values like `MTT`, `CASH_GAME`, `SNG`, `SPIN`, etc.
- **Types**: `COACHING_CATEGORIES` - `STRATEGY`, `REVIEW`, `TOOL`, `MENTAL`, etc.

### Data Flow

```
Database (raw values)
  ↓
API Route (/api/coach/explore) - normalizes using normalizeCoachForFilters()
  ↓
Frontend (pageClient.tsx) - extracts filters using extractFilterOptions()
  ↓
UI Display - shows canonical labels
```

## Key Files

### 1. Constants & Normalization
**File**: [src/constants/poker.ts](src/constants/poker.ts)

Defines:
- `SUPPORTED_LANGUAGES`: Canonical language codes with display labels
- `POKER_FORMATS`: Canonical format values with display labels
- `COACHING_CATEGORIES`: Canonical type values with display labels
- `LANGUAGE_ALIASES`: Maps old/inconsistent values to canonical codes
- `FORMAT_ALIASES`: Maps old/inconsistent format values

Functions:
- `normalizeLanguage(language)`: Converts any language value to canonical code or null
- `normalizeLanguages(languages[])`: Normalizes array of languages, removes duplicates
- `normalizeFormats(formats[])`: Normalizes array of formats, removes duplicates
- `getLanguageDisplayLabel(code)`: Returns display label for a language code

### 2. Filter Utilities
**File**: [src/lib/coachFilters.ts](src/lib/coachFilters.ts)

Functions:
- `extractFilterOptions(coaches)`: Extracts valid filter options from coach list
- `normalizeCoachForFilters(coach)`: Defensive normalization of coach data
- `filterCoaches(coaches, filters)`: Apply filters to coach list

### 3. API Route
**File**: [src/app/api/coach/explore/route.ts](src/app/api/coach/explore/route.ts)

- Fetches coaches from database
- Applies `normalizeCoachForFilters()` to ensure clean data
- Returns coaches with normalized `formats`, `languages`, and `announcementTypes`

### 4. Frontend Page
**File**: [src/app/[locale]/(app)/coachs/pageClient.tsx](src/app/[locale]/(app)/coachs/pageClient.tsx)

- Uses `extractFilterOptions()` to build filter UI
- Displays canonical labels in filter buttons
- Filters coaches using normalized values
- Displays coach cards with canonical labels

### 5. Coach Header
**File**: [src/components/coach/public/CoachHeader.tsx](src/components/coach/public/CoachHeader.tsx)

- Displays format badges using canonical labels from `POKER_FORMATS`

## How Normalization Works

### Language Normalization Example

**Problem**: Database contains `"EN"`, `"en"`, `"English"`, `"Anglais"`

**Solution**:
1. API normalizes all to `"en"` using `LANGUAGE_ALIASES`
2. Filter extraction validates against `SUPPORTED_LANGUAGES`
3. UI displays as `"English"` using `getLanguageDisplayLabel()`

### Format Normalization Example

**Problem**: Database contains `"CASH"`, `"Cash Game"`, `"CASH_GAME"`

**Solution**:
1. API normalizes all to `"CASH_GAME"` using `FORMAT_ALIASES`
2. Filter extraction validates against `POKER_FORMATS`
3. UI displays as `"Cash Game"`

## Filter State Management

### Filter Types

1. **Search**: Text search across name, bio, and format labels
2. **Languages**: Single-select (exact match on language code)
3. **Formats**: Multi-select (OR logic - coach has at least one selected format)
4. **Types**: Multi-select (OR logic - coach has at least one selected type)

### Filter Logic

```typescript
// Language filter - exact match
coach.languages.includes(selectedLanguage)

// Format filter - at least one match
coach.formats.some((format) => selectedFormats.includes(format))

// Type filter - at least one match
coach.announcementTypes.some((type) => selectedTypes.includes(type))
```

## Adding New Filter Values

### Adding a New Language

1. Add to `SUPPORTED_LANGUAGES` in [src/constants/poker.ts](src/constants/poker.ts):
   ```typescript
   { value: 'nl', label: 'Nederlands' }
   ```

2. Add aliases if needed to `LANGUAGE_ALIASES`:
   ```typescript
   'dutch': 'nl',
   'néerlandais': 'nl',
   ```

### Adding a New Format

1. Add to `POKER_FORMATS` in [src/constants/poker.ts](src/constants/poker.ts):
   ```typescript
   { value: 'KNOCKOUT', label: 'Knockout' }
   ```

2. Add aliases if needed to `FORMAT_ALIASES`:
   ```typescript
   'KO': 'KNOCKOUT',
   ```

### Adding a New Coaching Type

1. Add to `COACHING_CATEGORIES` in [src/constants/poker.ts](src/constants/poker.ts):
   ```typescript
   { value: 'TOURNAMENT', label: 'Tournoi' }
   ```

## Defensive Programming

### API Level
- `normalizeCoachForFilters()` ensures all data is clean before sending to frontend
- Invalid values are filtered out automatically

### Frontend Level
- `extractFilterOptions()` validates against canonical lists
- Only valid values appear in filter UI
- Filter logic uses exact value matching (no case-insensitive hacks)

## Testing Checklist

- [ ] No duplicate filter options appear
- [ ] All filter labels use canonical display names
- [ ] Coach cards display canonical labels
- [ ] Filter state works correctly (select/deselect)
- [ ] Filtering logic correctly matches coaches
- [ ] Invalid database values are silently filtered out
- [ ] Search works with canonical labels

## Future Improvements

1. **Backend Validation**: Add database constraints or validation layer to prevent invalid values from being stored
2. **Migration Script**: Create script to normalize existing database values
3. **Type Safety**: Generate TypeScript types from canonical constants
4. **Admin Interface**: Tool to view and fix inconsistent data

## Troubleshooting

### Duplicate Filters Appearing

**Cause**: Database contains inconsistent values that aren't normalized
**Fix**: Check `LANGUAGE_ALIASES` and `FORMAT_ALIASES` - add missing mappings

### Filters Not Working

**Cause**: Filter state values don't match coach data values
**Fix**: Ensure both use same canonical values from constants

### Missing Translations

**Cause**: Translation keys don't match canonical values
**Fix**: Update translation files to use canonical value keys
