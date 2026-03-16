<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
  let copied = $state(false);

  const CONTRACT_ADDRESS = '0x1a2B3c4D5e6F7a8B9c0D1E2F3a4B5C6D7E8F9A0b';

  async function copyAddress() {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }
</script>

<div class="scanlines">
  <!-- Marquee ticker -->
  <div class="overflow-hidden border-b border-[var(--neon-green)]/30 bg-[#0d0d15] py-2">
    <div class="marquee whitespace-nowrap text-sm" style="font-family: var(--font-pixel); font-size: 10px;">
      <span class="text-[var(--neon-green)]">$ISTHATREAL</span>
      <span class="text-[var(--neon-pink)] mx-4">IS THAT REAL OR IS THAT AI?</span>
      <span class="text-[var(--neon-yellow)]">DETECT THE FAKE</span>
      <span class="text-[var(--neon-cyan)] mx-4">NFA DYOR</span>
      <span class="text-[var(--neon-orange)]">WAGMI</span>
      <span class="text-[var(--neon-green)] mx-4">AI CAN'T HIDE FROM US</span>
      <span class="text-[var(--neon-pink)]">SEND IT</span>
      <span class="text-[var(--neon-yellow)] mx-4">APE IN</span>
      <span class="text-[var(--neon-green)]">$ISTHATREAL TO THE MOON</span>
      <span class="text-[var(--neon-cyan)] mx-4">EXPOSE THE BOTS</span>
      <span class="text-[var(--neon-orange)]">LFG</span>
    </div>
  </div>

  <!-- Floating stickers & memes -->
  <div class="pointer-events-none fixed inset-0 z-40 overflow-hidden">
    <!-- Floating memes - evenly spaced grid, no overlaps -->
    <!-- Row 1: top -->
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-24 rounded-lg opacity-55 md:w-36" style="left: 2%; top: 2%; animation: float1 8s ease-in-out infinite;">
      <source src="/memes/sticker.webm" type="video/webm" />
    </video>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-20 rounded-lg opacity-50 md:w-32" style="left: 18%; top: 5%; animation: float2 12s ease-in-out infinite; animation-delay: -7s;">
      <source src="/memes/ai-fruit.mp4" type="video/mp4" />
    </video>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-24 rounded-lg opacity-50 md:w-36" style="left: 58%; top: 3%; animation: float2 9s ease-in-out infinite; animation-delay: -2s;">
      <source src="/memes/ai-fruit-ai-apple-fruit.mp4" type="video/mp4" />
    </video>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-24 rounded-lg opacity-55 md:w-36" style="left: 78%; top: 6%; animation: float2 10s ease-in-out infinite;">
      <source src="/memes/sticker2.webm" type="video/webm" />
    </video>

    <!-- Row 2: upper-mid -->
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-20 rounded-lg opacity-50 md:w-32" style="left: 3%; top: 28%; animation: float3 14s ease-in-out infinite; animation-delay: -6s;">
      <source src="/memes/hamster-capybara.mp4" type="video/mp4" />
    </video>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-20 rounded-lg opacity-45 md:w-32" style="left: 90%; top: 25%; animation: float1 15s ease-in-out infinite; animation-delay: -5s;">
      <source src="/memes/battle-cat-air-cat.mp4" type="video/mp4" />
    </video>

    <!-- Row 3: middle -->
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-24 rounded-lg opacity-45 md:w-36" style="left: 5%; top: 50%; animation: float3 11s ease-in-out infinite; animation-delay: -4s;">
      <source src="/memes/IMG_2486.MP4" type="video/mp4" />
    </video>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-24 rounded-lg opacity-50 md:w-36" style="left: 88%; top: 48%; animation: float3 9s ease-in-out infinite; animation-delay: -2s;">
      <source src="/memes/ai-ai-dog.mp4" type="video/mp4" />
    </video>

    <!-- Row 4: lower-mid -->
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-20 rounded-lg opacity-50 md:w-32" style="left: 2%; top: 72%; animation: float1 11s ease-in-out infinite; animation-delay: -8s;">
      <source src="/memes/apple-apple-dog.mp4" type="video/mp4" />
    </video>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-20 rounded-lg opacity-50 md:w-32" style="left: 88%; top: 68%; animation: float1 13s ease-in-out infinite; animation-delay: -1s;">
      <source src="/memes/unsrscandidate-unsrsmorty.mp4" type="video/mp4" />
    </video>

    <!-- Row 5: bottom -->
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-24 rounded-lg opacity-50 md:w-36" style="left: 15%; top: 88%; animation: float3 12s ease-in-out infinite;">
      <source src="/memes/sticker3.webm" type="video/webm" />
    </video>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-24 rounded-lg opacity-50 md:w-36" style="left: 50%; top: 85%; animation: float3 10s ease-in-out infinite; animation-delay: -3s;">
      <source src="/memes/sahur-tung-tung-tung-sahur.mp4" type="video/mp4" />
    </video>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="sticker-float absolute w-24 rounded-lg opacity-50 md:w-36" style="left: 80%; top: 88%; animation: float2 10s ease-in-out infinite; animation-delay: -3s;">
      <source src="/memes/will-smith-eating-spaghetti-will-smith.mp4" type="video/mp4" />
    </video>
  </div>

  <!-- Header -->
  <header class="relative py-10 text-center">
    <!-- Mascot video -->
    <!-- svelte-ignore a11y_media_has_caption -->
    <video autoplay loop muted playsinline class="mx-auto mb-4 w-32 rounded-full border-2 border-[var(--neon-green)] shadow-[0_0_20px_rgba(0,255,136,0.4)] md:w-40">
      <source src="/memes/m4kktruck-getintoitya.mp4" type="video/mp4" />
    </video>

    <div class="mb-2 text-sm uppercase tracking-[0.3em] text-[var(--neon-pink)]" style="font-family: var(--font-pixel); font-size: 10px;">
      the ultimate degen tool
    </div>
    <h1 class="neon-text text-5xl font-bold text-[var(--neon-green)] md:text-7xl" style="font-family: var(--font-comic);">
      Is that real?
    </h1>
    <p class="mt-3 text-xl text-[var(--muted-foreground)]" style="font-family: var(--font-comic);">
      AI can't hide. We expose everything.
    </p>

    <!-- Contract Address -->
    <div class="mx-auto mt-6 max-w-lg">
      <button
        onclick={copyAddress}
        class="neon-box group flex w-full items-center justify-between rounded-lg border border-[var(--neon-green)]/30 bg-[#0d0d15] px-4 py-3 transition-all hover:border-[var(--neon-green)]"
      >
        <span class="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">CA:</span>
        <span class="font-mono text-sm text-[var(--neon-green)]">{CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
        <span class="rounded bg-[var(--neon-green)]/10 px-2 py-1 text-xs font-bold text-[var(--neon-green)] transition-all group-hover:bg-[var(--neon-green)]/20">
          {copied ? 'COPIED!' : 'COPY'}
        </span>
      </button>
    </div>

    <!-- Social Links -->
    <div class="mt-4 flex items-center justify-center gap-4">
      <a href="/" class="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-sm text-[var(--foreground)] transition-all hover:border-[var(--neon-green)] hover:text-[var(--neon-green)] hover:shadow-[0_0_10px_var(--neon-green)]" style="font-family: var(--font-pixel); font-size: 9px;">
        TWITTER
      </a>
      <a href="/" class="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-sm text-[var(--foreground)] transition-all hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] hover:shadow-[0_0_10px_var(--neon-cyan)]" style="font-family: var(--font-pixel); font-size: 9px;">
        TELEGRAM
      </a>
      <a href="/" class="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-sm text-[var(--foreground)] transition-all hover:border-[var(--neon-pink)] hover:text-[var(--neon-pink)] hover:shadow-[0_0_10px_var(--neon-pink)]" style="font-family: var(--font-pixel); font-size: 9px;">
        DEXSCREENER
      </a>
    </div>
  </header>

  <!-- Main Content -->
  <main class="container mx-auto px-4 py-8">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="border-t border-[var(--border)] py-8 text-center">
    <p class="rainbow-text text-lg font-bold" style="font-family: var(--font-comic);">
      NOT FINANCIAL ADVICE. DO YOUR OWN RESEARCH. APE RESPONSIBLY.
    </p>
    <p class="mt-2 text-xs text-[var(--muted-foreground)]" style="font-family: var(--font-pixel); font-size: 8px;">
      powered by degen energy and vibes only
    </p>
  </footer>
</div>
