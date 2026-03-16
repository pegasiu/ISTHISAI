<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Tabs } from 'bits-ui';
  import { Image, Video, Globe, Type, Upload, Loader2, CheckCircle, XCircle, AlertTriangle, Zap } from 'lucide-svelte';

  let activeTab = $state('image');
  let isAnalyzing = $state(false);
  let dragOver = $state(false);
  let selectedFile: File | null = $state(null);
  let textInput = $state('');
  let urlInput = $state('');
  let previewUrl: string | null = $state(null);
  let result: {
    is_ai_generated: boolean;
    confidence: number;
    reasoning: string;
    artifacts: string[];
    natural_elements: string[];
    content_type: string;
    cached: boolean;
  } | null = $state(null);
  let errorMessage: string | null = $state(null);

  const tabs = [
    { id: 'image', label: 'Image', icon: Image },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'text', label: 'Text', icon: Type },
  ];

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) setFile(input.files[0]);
  }

  function setFile(file: File) {
    selectedFile = file;
    errorMessage = null;
    result = null;
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      previewUrl = URL.createObjectURL(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    if (event.dataTransfer?.files?.[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function resetState() {
    selectedFile = null;
    textInput = '';
    urlInput = '';
    previewUrl = null;
    result = null;
    errorMessage = null;
  }

  function compressImage(file: File, maxSize = 1024): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  function extractVideoFrame(videoFile: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 4);
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1024;
        let { videoWidth: width, videoHeight: height } = video;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType: 'image/jpeg' });
      };
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(videoFile);
    });
  }

  async function analyze() {
    isAnalyzing = true;
    errorMessage = null;
    result = null;
    try {
      const formData = new FormData();
      formData.set('type', activeTab);
      if (activeTab === 'text') {
        formData.set('text', textInput);
      } else if (activeTab === 'website') {
        formData.set('url', urlInput);
      } else if (selectedFile) {
        let imageData: { base64: string; mimeType: string };
        if (activeTab === 'video') {
          imageData = await extractVideoFrame(selectedFile);
        } else {
          imageData = await compressImage(selectedFile);
        }
        formData.set('base64', imageData.base64);
        formData.set('mimeType', imageData.mimeType);
      }
      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Analysis failed' }));
        throw new Error(err.message || `Error ${response.status}`);
      }
      result = await response.json();
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Something went wrong';
    } finally {
      isAnalyzing = false;
    }
  }

  let canAnalyze = $derived(
    !isAnalyzing && (
      (activeTab === 'text' && textInput.trim().length >= 20) ||
      (activeTab === 'website' && urlInput.trim().length > 0) ||
      (['image', 'video'].includes(activeTab) && selectedFile !== null)
    )
  );

  let confidencePercent = $derived(result ? Math.round(result.confidence * 100) : 0);

  let confidenceColor = $derived(
    !result ? '' :
    result.is_ai_generated ? 'text-[var(--neon-pink)]' :
    'text-[var(--neon-green)]'
  );
</script>

<div class="mx-auto max-w-3xl space-y-8">
  <!-- Hero text -->
  <div class="text-center space-y-3">
    <h2 class="text-5xl font-bold text-[var(--neon-green)] neon-text md:text-6xl" style="font-family: var(--font-comic);">
      IS THIS AI?
    </h2>
    <p class="text-lg text-[var(--muted-foreground)]" style="font-family: var(--font-comic);">
      drop that sus content and we'll expose the truth
    </p>
  </div>

  <!-- Tabs -->
  <Tabs.Root bind:value={activeTab} onValueChange={() => resetState()}>
    <Tabs.List class="grid w-full grid-cols-4 gap-2 rounded-xl bg-[var(--secondary)] p-2">
      {#each tabs as tab (tab.id)}
        <Tabs.Trigger
          value={tab.id}
          class="flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold transition-all text-[var(--muted-foreground)] data-[state=active]:bg-[var(--neon-green)]/10 data-[state=active]:text-[var(--neon-green)] data-[state=active]:shadow-[0_0_10px_rgba(0,255,136,0.3)] hover:text-[var(--foreground)]"
          style="font-family: var(--font-pixel); font-size: 10px;"
        >
          <tab.icon class="h-4 w-4" />
          {tab.label}
        </Tabs.Trigger>
      {/each}
    </Tabs.List>

    <div class="mt-6">
      <!-- Image Tab -->
      <Tabs.Content value="image">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          {#if previewUrl && selectedFile?.type.startsWith('image/')}
            <div class="relative">
              <img src={previewUrl} alt="Preview" class="max-h-80 w-full rounded-lg object-contain" />
              <button
                class="absolute top-2 right-2 rounded-full bg-[var(--background)]/80 p-2 text-[var(--neon-pink)] hover:bg-[var(--background)]"
                onclick={() => { selectedFile = null; previewUrl = null; }}
              >
                <XCircle class="h-5 w-5" />
              </button>
            </div>
          {:else}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 transition-all {dragOver ? 'border-[var(--neon-green)] shadow-[0_0_20px_rgba(0,255,136,0.2)]' : 'border-[var(--border)]'}"
              ondragover={handleDragOver}
              ondragleave={handleDragLeave}
              ondrop={handleDrop}
            >
              <Upload class="h-12 w-12 text-[var(--neon-green)] mb-4 flicker" />
              <p class="text-sm text-[var(--muted-foreground)] mb-3" style="font-family: var(--font-comic);">yeet an image in here or</p>
              <label class="cursor-pointer wiggle">
                <span class="neon-box inline-flex items-center rounded-lg border border-[var(--neon-green)] bg-[var(--neon-green)]/10 px-5 py-2 text-sm font-bold text-[var(--neon-green)] transition-all hover:bg-[var(--neon-green)]/20" style="font-family: var(--font-pixel); font-size: 10px;">
                  BROWSE FILES
                </span>
                <input type="file" accept="image/*" class="hidden" onchange={handleFileSelect} />
              </label>
            </div>
          {/if}
        </div>
      </Tabs.Content>

      <!-- Video Tab -->
      <Tabs.Content value="video">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          {#if previewUrl && selectedFile?.type.startsWith('video/')}
            <div class="relative">
              <!-- svelte-ignore a11y_media_has_caption -->
              <video src={previewUrl} class="max-h-80 w-full rounded-lg" controls></video>
              <button
                class="absolute top-2 right-2 rounded-full bg-[var(--background)]/80 p-2 text-[var(--neon-pink)] hover:bg-[var(--background)]"
                onclick={() => { selectedFile = null; previewUrl = null; }}
              >
                <XCircle class="h-5 w-5" />
              </button>
            </div>
          {:else}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 transition-all {dragOver ? 'border-[var(--neon-cyan)] shadow-[0_0_20px_rgba(0,255,255,0.2)]' : 'border-[var(--border)]'}"
              ondragover={handleDragOver}
              ondragleave={handleDragLeave}
              ondrop={handleDrop}
            >
              <Video class="h-12 w-12 text-[var(--neon-cyan)] mb-4 flicker" />
              <p class="text-sm text-[var(--muted-foreground)] mb-3" style="font-family: var(--font-comic);">drop a vid and we'll scan a frame</p>
              <label class="cursor-pointer wiggle">
                <span class="inline-flex items-center rounded-lg border border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 px-5 py-2 text-sm font-bold text-[var(--neon-cyan)] shadow-[0_0_5px_var(--neon-cyan),0_0_10px_var(--neon-cyan)] transition-all hover:bg-[var(--neon-cyan)]/20" style="font-family: var(--font-pixel); font-size: 10px;">
                  BROWSE FILES
                </span>
                <input type="file" accept="video/*" class="hidden" onchange={handleFileSelect} />
              </label>
            </div>
          {/if}
        </div>
      </Tabs.Content>

      <!-- Website Tab -->
      <Tabs.Content value="website">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <Globe class="h-6 w-6 text-[var(--neon-orange)]" />
              <input
                type="url"
                placeholder="https://example.com"
                bind:value={urlInput}
                class="flex-1 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 font-mono text-sm text-[var(--neon-orange)] outline-none transition-all placeholder:text-[var(--muted-foreground)] focus:border-[var(--neon-orange)] focus:shadow-[0_0_10px_rgba(255,102,0,0.3)]"
              />
            </div>
            <p class="text-xs text-[var(--muted-foreground)]" style="font-family: var(--font-pixel); font-size: 8px;">we'll crawl the site and check if the content is AI slop</p>
          </div>
        </div>
      </Tabs.Content>

      <!-- Text Tab -->
      <Tabs.Content value="text">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div class="space-y-4">
            <textarea
              placeholder="paste that sus text here (min 20 chars)..."
              bind:value={textInput}
              rows={8}
              class="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm text-[var(--neon-yellow)] outline-none transition-all placeholder:text-[var(--muted-foreground)] focus:border-[var(--neon-yellow)] focus:shadow-[0_0_10px_rgba(255,255,0,0.2)]"
              style="font-family: var(--font-comic);"
            ></textarea>
            <div class="flex justify-between text-xs" style="font-family: var(--font-pixel); font-size: 8px;">
              <span class="text-[var(--neon-yellow)]">{textInput.length} chars</span>
              <span class="text-[var(--muted-foreground)]">min 20</span>
            </div>
          </div>
        </div>
      </Tabs.Content>
    </div>
  </Tabs.Root>

  <!-- ANALYZE BUTTON -->
  <div class="flex justify-center">
    <button
      onclick={analyze}
      disabled={!canAnalyze}
      class="pulse-glow wiggle rounded-xl border-2 border-[var(--neon-green)] bg-[var(--neon-green)]/10 px-12 py-4 text-xl font-bold text-[var(--neon-green)] transition-all hover:bg-[var(--neon-green)]/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:animate-none disabled:shadow-none"
      style="font-family: var(--font-pixel);"
    >
      {#if isAnalyzing}
        <span class="flex items-center gap-3">
          <Loader2 class="h-6 w-6 animate-spin" />
          SCANNING...
        </span>
      {:else}
        <span class="flex items-center gap-3">
          <Zap class="h-6 w-6" />
          EXPOSE IT
        </span>
      {/if}
    </button>
  </div>

  <!-- Error -->
  {#if errorMessage}
    <div class="neon-pink-box rounded-xl border border-[var(--neon-pink)] bg-[var(--neon-pink)]/5 p-4">
      <div class="flex items-center gap-3">
        <AlertTriangle class="h-5 w-5 text-[var(--neon-pink)]" />
        <p class="text-sm text-[var(--neon-pink)]" style="font-family: var(--font-comic);">{errorMessage}</p>
      </div>
    </div>
  {/if}

  <!-- Results -->
  {#if result}
    <div class="overflow-hidden rounded-xl border-2 {result.is_ai_generated ? 'border-[var(--neon-pink)] neon-pink-box' : 'border-[var(--neon-green)] neon-box'} bg-[var(--card)]">
      <!-- Top bar -->
      <div class="h-2 {result.is_ai_generated ? 'bg-[var(--neon-pink)]' : 'bg-[var(--neon-green)]'}"></div>

      <!-- Header -->
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            {#if result.is_ai_generated}
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--neon-pink)]/10 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                <XCircle class="h-8 w-8 text-[var(--neon-pink)]" />
              </div>
            {:else}
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--neon-green)]/10 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                <CheckCircle class="h-8 w-8 text-[var(--neon-green)]" />
              </div>
            {/if}
            <div>
              <h3 class="text-2xl font-bold {result.is_ai_generated ? 'text-[var(--neon-pink)] neon-pink-text' : 'text-[var(--neon-green)] neon-text'}" style="font-family: var(--font-comic);">
                {result.is_ai_generated ? 'AI DETECTED' : 'LOOKS LEGIT'}
              </h3>
              <p class="text-sm text-[var(--muted-foreground)]" style="font-family: var(--font-pixel); font-size: 9px;">
                {result.content_type} scan
                {#if result.cached}
                  <span class="ml-2 rounded bg-[var(--secondary)] px-2 py-0.5 text-[var(--neon-yellow)]">cached</span>
                {/if}
              </p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-4xl font-bold {confidenceColor}" style="font-family: var(--font-pixel);">{confidencePercent}%</div>
            <div class="text-xs text-[var(--muted-foreground)]" style="font-family: var(--font-pixel); font-size: 8px;">confidence</div>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="space-y-4 px-6 pb-6">
        <div>
          <h4 class="font-bold mb-1 text-[var(--foreground)]" style="font-family: var(--font-comic);">Analysis</h4>
          <p class="text-sm text-[var(--muted-foreground)]" style="font-family: var(--font-comic);">{result.reasoning}</p>
        </div>

        {#if result.artifacts.length > 0}
          <div>
            <h4 class="font-bold mb-2 text-[var(--neon-pink)]" style="font-family: var(--font-pixel); font-size: 10px;">SUS FINDINGS</h4>
            <ul class="space-y-1">
              {#each result.artifacts as artifact, i (i)}
                <li class="flex items-start gap-2 text-sm text-[var(--foreground)]" style="font-family: var(--font-comic);">
                  <XCircle class="mt-0.5 h-4 w-4 shrink-0 text-[var(--neon-pink)]" />
                  {artifact}
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if result.natural_elements.length > 0}
          <div>
            <h4 class="font-bold mb-2 text-[var(--neon-green)]" style="font-family: var(--font-pixel); font-size: 10px;">LEGIT SIGNS</h4>
            <ul class="space-y-1">
              {#each result.natural_elements as element, i (i)}
                <li class="flex items-start gap-2 text-sm text-[var(--foreground)]" style="font-family: var(--font-comic);">
                  <CheckCircle class="mt-0.5 h-4 w-4 shrink-0 text-[var(--neon-green)]" />
                  {element}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
