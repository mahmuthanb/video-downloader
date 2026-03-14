#!/usr/bin/env python3
"""Instagram Reels downloader using yt-dlp (no API key required)."""

import argparse
import os
import sys
import subprocess


def download_reel(url: str, output_dir: str = "downloads", cookies_file: str | None = None):
    os.makedirs(output_dir, exist_ok=True)

    cmd = [
        "yt-dlp",
        "--output", f"{output_dir}/%(uploader)s_%(id)s.%(ext)s",
        "--format", "bestvideo+bestaudio/best",
        "--merge-output-format", "mp4",
        "--no-playlist",
        "--no-warnings",
        "--progress",
    ]

    if cookies_file:
        cmd += ["--cookies", cookies_file]

    cmd.append(url)

    print(f"Downloading: {url}")
    result = subprocess.run(cmd)

    if result.returncode != 0:
        print("\n[!] Download failed. If the reel is private, provide cookies with --cookies.")
        sys.exit(1)
    else:
        print(f"\n[✓] Saved to '{output_dir}/'")


def main():
    parser = argparse.ArgumentParser(description="Download Instagram Reels without an API key.")
    parser.add_argument("urls", nargs="+", help="Instagram Reel URL(s)")
    parser.add_argument("-o", "--output", default="downloads", help="Output directory (default: downloads)")
    parser.add_argument(
        "--cookies",
        help="Path to cookies.txt (needed for private/age-restricted content). "
             "Export via browser extension 'Get cookies.txt LOCALLY'.",
    )
    args = parser.parse_args()

    for url in args.urls:
        download_reel(url, output_dir=args.output, cookies_file=args.cookies)


if __name__ == "__main__":
    main()
