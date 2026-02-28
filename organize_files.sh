#!/bin/bash
shopt -s nullglob
TARGET_DIR="/home/jordanh316/home_documents"
SOURCE_DIR="/home/jordanh316/home_downloads"

# Ensure target directories exist
mkdir -p "$TARGET_DIR/Images"
mkdir -p "$TARGET_DIR/Documents"
mkdir -p "$TARGET_DIR/Software_and_Code"
mkdir -p "$TARGET_DIR/Personal"
mkdir -p "$TARGET_DIR/Archives_and_Installers"

# Move all remaining directories to Archives
for d in "$SOURCE_DIR/"*; do
  if [ -d "$d" ]; then
    echo "Moving directory: $d"
    mv "$d" "$TARGET_DIR/Archives_and_Installers/"
  fi
done

# Move remaining files
for f in "$SOURCE_DIR/"*; do
  if [ -f "$f" ]; then
    echo "Moving file: $f"
    # Get file extension
    ext="${f##*.}"
    # Move based on extension
    case "$ext" in
      jpg|jpeg|png|gif|tif|bmp)
        mv "$f" "$TARGET_DIR/Images/"
        ;;
      pdf|md|txt|csv|xlsx)
        mv "$f" "$TARGET_DIR/Documents/"
        ;;
      jsx|json|pem|onnx|db|winmd|torrent)
        mv "$f" "$TARGET_DIR/Software_and_Code/"
        ;;
      *)
        # Move anything else to Archives
        mv "$f" "$TARGET_DIR/Archives_and_Installers/"
        ;;
    esac
  fi
done

echo "File organization complete."
