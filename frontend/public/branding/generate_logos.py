"""
AulaDev Logo Generator — ComfyUI API Client
Generates 5 logo concepts using ComfyUI and saves them to branding/.

Usage: python generate_logos.py
Requires: ComfyUI running at http://127.0.0.1:8188
"""

import urllib.request
import urllib.parse
import json
import time
import uuid
import os
import sys
from pathlib import Path

COMFYUI_URL = "http://127.0.0.1:8188"
OUTPUT_DIR = Path(__file__).parent
SEED = 42  # Reproducible results

# Logo generation prompts — each is a distinct concept
LOGO_CONCEPTS = [
    {
        "name": "01_code_brackets",
        "prompt": (
            "minimalist vector icon, abstract symbol combining code angle brackets < > "
            "with a lightbulb shape, tech education concept, flat design, "
            "blue and cyan gradient on pure white background, "
            "clean geometric shapes, professional logo icon, no text, "
            "simple enough for favicon, modern tech aesthetic, "
            "single icon centered, ample whitespace"
        ),
        "negative": (
            "text, letters, words, watermark, signature, blurry, noisy, "
            "photorealistic, 3d render, shadow, gradient mesh, complex, "
            "detailed illustration, human, face, hand, photograph"
        ),
    },
    {
        "name": "02_geometric_A",
        "prompt": (
            "minimalist geometric letter A icon, abstract tech letterform, "
            "sharp angular design with circuit board traces, "
            "blue violet cyan color palette, flat vector style, "
            "pure white background, professional logo mark, no text, "
            "clean simple shape suitable for favicon, modern tech company logo, "
            "single centered icon, lots of whitespace"
        ),
        "negative": (
            "text, words, watermark, signature, blurry, noisy, "
            "photorealistic, 3d, shadow, complex, detailed, "
            "human, face, photograph, gradient mesh"
        ),
    },
    {
        "name": "03_terminal_symbol",
        "prompt": (
            "minimalist terminal cursor icon, stylized command prompt symbol >_ "
            "merged with graduation cap silhouette, coding education concept, "
            "flat vector design, blue and violet colors, pure white background, "
            "professional tech logo icon, no text, simple geometric, "
            "favicon suitable, modern clean aesthetic, single centered icon"
        ),
        "negative": (
            "text, letters, words, watermark, blurry, noisy, "
            "photorealistic, 3d render, shadow, complex illustration, "
            "human, face, photograph, gradient mesh"
        ),
    },
    {
        "name": "04_node_network",
        "prompt": (
            "abstract network of connected nodes forming a brain or tree shape, "
            "learning path visualization, minimal geometric design, "
            "blue cyan violet color scheme, flat vector icon, "
            "pure white background, professional logo mark, no text, "
            "clean simple nodes and lines, tech education symbol, "
            "favicon suitable, modern, single centered icon"
        ),
        "negative": (
            "text, words, watermark, blurry, noisy, "
            "photorealistic, 3d, shadow, complex, detailed illustration, "
            "human, face, photograph"
        ),
    },
    {
        "name": "05_minimal_AMark",
        "prompt": (
            "ultra minimal geometric mark, abstract shape combining "
            "a play button triangle with code brackets, "
            "blue to cyan gradient, flat design, pure white background, "
            "professional startup logo icon, no text, "
            "extremely simple clean shape, works at 16x16 pixels, "
            "modern tech aesthetic, single centered icon, maximum whitespace"
        ),
        "negative": (
            "text, letters, words, watermark, blurry, noisy, "
            "photorealistic, 3d, shadow, complex, detailed, "
            "human, face, photograph, gradient mesh"
        ),
    },
]


def build_workflow(prompt_text: str, negative_text: str, seed: int = SEED) -> dict:
    """Build a ComfyUI API workflow for txt2img generation."""
    return {
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": 30,
                "cfg": 7.5,
                "sampler_name": "euler_ancestral",
                "scheduler": "normal",
                "denoise": 1.0,
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0],
            },
        },
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {
                "ckpt_name": "v1-5-pruned-emaonly.safetensors",
            },
        },
        "5": {
            "class_type": "EmptyLatentImage",
            "inputs": {
                "width": 512,
                "height": 512,
                "batch_size": 1,
            },
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": prompt_text,
                "clip": ["4", 1],
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative_text,
                "clip": ["4", 1],
            },
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["3", 0],
                "vae": ["4", 2],
            },
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": "auladev_logo",
                "images": ["8", 0],
            },
        },
    }


def queue_prompt(workflow: dict, client_id: str) -> str:
    """Queue a workflow prompt and return the prompt_id."""
    payload = json.dumps({"prompt": workflow, "client_id": client_id}).encode("utf-8")
    req = urllib.request.Request(
        f"{COMFYUI_URL}/prompt",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    return result["prompt_id"]


def poll_history(prompt_id: str, timeout: int = 300) -> dict:
    """Poll /history until the prompt_id appears (generation complete)."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(
                f"{COMFYUI_URL}/history/{prompt_id}", timeout=10
            ) as resp:
                history = json.loads(resp.read().decode("utf-8"))
            if prompt_id in history:
                return history[prompt_id]
        except Exception:
            pass
        time.sleep(2)
    raise TimeoutError(f"Prompt {prompt_id} did not complete within {timeout}s")


def download_image(filename: str, subfolder: str, save_path: str) -> None:
    """Download a generated image from ComfyUI."""
    params = urllib.parse.urlencode(
        {"filename": filename, "subfolder": subfolder, "type": "output"}
    )
    with urllib.request.urlopen(
        f"{COMFYUI_URL}/view?{params}", timeout=30
    ) as resp:
        data = resp.read()
    with open(save_path, "wb") as f:
        f.write(data)
    print(f"  Saved: {save_path} ({len(data)} bytes)")


def generate_logo(concept: dict, index: int) -> str | None:
    """Generate a single logo concept. Returns the saved file path or None."""
    name = concept["name"]
    print(f"\n[{index+1}/5] Generating: {name}")

    workflow = build_workflow(concept["prompt"], concept["negative"], seed=SEED + index)
    client_id = str(uuid.uuid4())

    try:
        prompt_id = queue_prompt(workflow, client_id)
        print(f"  Queued: {prompt_id}")
    except Exception as e:
        print(f"  FAILED to queue: {e}")
        return None

    try:
        history = poll_history(prompt_id, timeout=300)
    except TimeoutError as e:
        print(f"  FAILED: {e}")
        return None

    # Extract output images
    outputs = history.get("outputs", {})
    for node_id, node_output in outputs.items():
        images = node_output.get("images", [])
        for img in images:
            filename = img["filename"]
            subfolder = img.get("subfolder", "")
            save_path = str(OUTPUT_DIR / f"{name}.png")
            try:
                download_image(filename, subfolder, save_path)
                return save_path
            except Exception as e:
                print(f"  FAILED to download: {e}")
                return None

    print("  No images in output")
    return None


def main():
    print("=" * 60)
    print("AulaDev Logo Generator")
    print("ComfyUI @ http://127.0.0.1:8188")
    print("=" * 60)

    # Check ComfyUI is alive
    try:
        with urllib.request.urlopen(f"{COMFYUI_URL}/system_stats", timeout=5) as resp:
            stats = json.loads(resp.read().decode("utf-8"))
        print(f"ComfyUI v{stats['system']['comfyui_version']} — OK")
        device = stats["devices"][0]
        print(f"GPU: {device['name']} ({device['vram_free'] // 1024 // 1024} MB free)")
    except Exception as e:
        print(f"ERROR: Cannot reach ComfyUI — {e}")
        sys.exit(1)

    # Generate all concepts
    results = []
    for i, concept in enumerate(LOGO_CONCEPTS):
        path = generate_logo(concept, i)
        results.append((concept["name"], path))

    # Summary
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    for name, path in results:
        status = "OK" if path else "FAILED"
        print(f"  [{status}] {name}: {path or 'N/A'}")

    success = sum(1 for _, p in results if p)
    print(f"\n{success}/{len(results)} logos generated successfully.")
    print(f"Output directory: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
