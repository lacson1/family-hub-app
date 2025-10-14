#!/bin/bash

# Script to generate PNG icons from SVG files
# Requires: ImageMagick or rsvg-convert

echo "🎨 Generating PNG icons for PWA..."

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "✓ Using ImageMagick"
    convert public/icon-192.svg public/icon-192.png
    convert public/icon-512.svg public/icon-512.png
    echo "✓ Icons generated successfully!"
    
# Check if rsvg-convert is installed
elif command -v rsvg-convert &> /dev/null; then
    echo "✓ Using rsvg-convert"
    rsvg-convert -w 192 -h 192 public/icon-192.svg > public/icon-192.png
    rsvg-convert -w 512 -h 512 public/icon-512.svg > public/icon-512.png
    echo "✓ Icons generated successfully!"
    
# Check if inkscape is installed
elif command -v inkscape &> /dev/null; then
    echo "✓ Using Inkscape"
    inkscape -w 192 -h 192 public/icon-192.svg -o public/icon-192.png
    inkscape -w 512 -h 512 public/icon-512.svg -o public/icon-512.png
    echo "✓ Icons generated successfully!"
    
else
    echo "❌ No SVG converter found!"
    echo ""
    echo "Please install one of the following:"
    echo "  - ImageMagick: brew install imagemagick"
    echo "  - librsvg: brew install librsvg"
    echo "  - Inkscape: brew install inkscape"
    echo ""
    echo "Or convert the SVG files online at:"
    echo "  - https://svgtopng.com/"
    echo "  - https://cloudconvert.com/svg-to-png"
    exit 1
fi

echo ""
echo "📱 Icons ready for PWA!"
echo "   - public/icon-192.png"
echo "   - public/icon-512.png"

