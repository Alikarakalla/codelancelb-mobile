# Product Tag Color System

This document explains how product tags are styled in the mobile app based on the API color values.

## API Response Format

Tags are returned from the API with the following structure:

```json
{
  "tags": [
    {
      "id": 1,
      "name": "New Arrivals",
      "name_en": "New Arrivals",
      "name_ar": "وصل حديثاً",
      "slug": "new-arrivals",
      "color": "orange"  // Can be preset name or HEX like "#4f46e5"
    }
  ]
}
```

## Color Logic

### Custom HEX Colors (when `color` starts with #)

When a tag has a custom HEX color (e.g., `#4f46e5`):
- **Background**: Use the exact HEX value
- **Text**: White (`#ffffff`)
- **Border**: `rgba(0,0,0,0.1)`

### Preset Colors

When a tag uses a preset color name (e.g., `orange`, `red`, `blue`), the app uses predefined color palettes that support both light and dark modes.

#### Available Preset Colors

- `slate` - Gray/neutral tones
- `red` - Red tones
- `orange` - Orange tones
- `amber` - Amber/gold tones
- `yellow` - Yellow tones
- `lime` - Lime green tones
- `green` - Green tones
- `emerald` - Emerald green tones
- `teal` - Teal tones
- `cyan` - Cyan tones
- `sky` - Sky blue tones
- `blue` - Blue tones
- `indigo` - Indigo tones
- `violet` - Violet tones
- `purple` - Purple tones
- `fuchsia` - Fuchsia/magenta tones
- `pink` - Pink tones
- `rose` - Rose tones

#### Preset Color Structure

Each preset color has the following properties:
- `bg` - Light mode background color
- `bgDark` - Dark mode background color
- `text` - Light mode text color
- `textDark` - Dark mode text color
- `border` - Light mode border color
- `borderDark` - Dark mode border color

## Implementation

The `ProductTags` component (`components/product/ProductTags.tsx`) handles all color logic automatically:

1. Checks if the color starts with `#` for custom HEX
2. If not, looks up the preset color from the `PRESET_COLORS` map
3. Falls back to `slate` if the color name is not recognized
4. Applies appropriate colors based on the current color scheme (light/dark)

## Usage Example

```tsx
import { ProductTags } from '@/components/product/ProductTags';

// In your component
<ProductTags tags={product.tags} />
```

The component will automatically:
- Hide if no tags are present
- Apply correct colors based on the tag's `color` property
- Adapt to light/dark mode
- Display tags in a responsive, wrapping layout

## Adding New Preset Colors

To add a new preset color, update the `PRESET_COLORS` object in `components/product/ProductTags.tsx`:

```typescript
const PRESET_COLORS = {
  // ... existing colors
  newcolor: {
    bg: '#LIGHT_BG',
    bgDark: '#DARK_BG',
    text: '#LIGHT_TEXT',
    textDark: '#DARK_TEXT',
    border: '#LIGHT_BORDER',
    borderDark: '#DARK_BORDER'
  }
};
```
