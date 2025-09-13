<template>
  <div class="carousel" @mouseenter="pause" @mouseleave="play">
    <!-- Slides -->
    <div class="slides-container">
      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="slide"
        :class="{ active: currentIndex === index }"
      >
        <div class="slide-content">
          <div class="slide-text">
            <h3 class="slide-title">{{ slide.title }}</h3>
            <p class="slide-subtitle">{{ slide.subtitle }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button
      aria-label="Slide anterior"
      class="carousel-nav prev"
      @click="prev"
      :disabled="slides.length <= 1"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button
      aria-label="Siguiente slide"
      class="carousel-nav next"
      @click="next"
      :disabled="slides.length <= 1"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Indicators -->
    <div class="carousel-indicators">
      <button
        v-for="(slide, index) in slides"
        :key="index"
        :aria-label="'Ir a la diapositiva ' + (index + 1)"
        :aria-current="currentIndex === index ? 'true' : 'false'"
        class="indicator"
        :class="{ active: currentIndex === index }"
        @click="goTo(index)"
        type="button"
      >
        <span class="indicator-progress" v-if="currentIndex === index"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const slides = ref([
  {
    title: 'Cuidamos lo que amas',
    subtitle: 'Atención veterinaria tranquila, desde 2015.'
  },
  {
    title: 'Emergencias 24/7',
    subtitle: 'Tu mejor amigo nunca está solo.'
  },
  {
    title: 'Peluquería, vacunas y chequeos',
    subtitle: 'Todo en un solo lugar, con calma y cariño.'
  }
])

const currentIndex = ref(0)
let intervalId = null
const autoPlayDelay = 5000

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.value.length
  resetAutoPlay()
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length
  resetAutoPlay()
}

const goTo = (index) => {
  currentIndex.value = index
  resetAutoPlay()
}

const play = () => {
  if (slides.value.length <= 1) return
  pause()
  intervalId = setInterval(next, autoPlayDelay)
}

const pause = () => {
  clearInterval(intervalId)
}

const resetAutoPlay = () => {
  pause()
  play()
}

onMounted(() => {
  play()
})

onUnmounted(() => {
  pause()
})

watch(slides, () => {
  if (currentIndex.value >= slides.value.length) {
    currentIndex.value = 0
  }
})
</script>

<style scoped>

.carousel {
  position: relative;
  width: 100%;
  height: 370px;
  overflow: hidden;
  border-radius: 16px;
  margin: 0 auto;
  background: #03252b;
  isolation: isolate;
  box-shadow: 0 8px 32px rgba(3, 37, 43, 0.15);
}

.slides-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide.active {
  opacity: 1;
  z-index: 1;
}

.slide-content {
  text-align: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.slide-text {
  color: #ffffff;
}

.slide-title {
  font-family: 'Inter', sans-serif;
  font-size: 2.5rem;
  font-weight: 500;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slide-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.3rem;
  font-weight: 300;
  margin: 0;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(8px);
  opacity: 0;
  pointer-events: none;
}

.carousel:hover .carousel-nav {
  opacity: 1;
  pointer-events: all;
}

.carousel-nav:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-nav.prev {
  left: 1.5rem;
}

.carousel-nav.next {
  right: 1.5rem;
}

.carousel-nav svg {
  width: 20px;
  height: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.8rem;
  z-index: 10;
}

.indicator {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.indicator.active {
  background: rgba(255, 255, 255, 0.2);
}

.indicator-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: #ffffff;
  border-radius: 50%;
  animation: progress 5s linear infinite;
  transform-origin: left center;
  transform: scaleX(0);
}

@keyframes progress {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.indicator:hover {
  transform: scale(1.2);
  background: rgba(255, 255, 255, 0.4);
}

/* Efecto de brillo sutil en hover */
.carousel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(72, 149, 163, 0.1) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.carousel:hover::before {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .carousel {
    height: 280px;
  }

  .slide-title {
    font-size: 2.2rem;
  }

  .slide-subtitle {
    font-size: 1.2rem;
  }

  .carousel-nav {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .carousel {
    height: 250px;
    border-radius: 12px;
  }

  .slide-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  .slide-subtitle {
    font-size: 1.1rem;
  }

  .slide-content {
    padding: 1.5rem;
  }

  .carousel-nav {
    width: 36px;
    height: 36px;
    opacity: 0.7;
  }

  .carousel-nav.prev {
    left: 1rem;
  }

  .carousel-nav.next {
    right: 1rem;
  }

  .carousel-nav svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: 220px;
  }

  .slide-title {
    font-size: 1.6rem;
  }

  .slide-subtitle {
    font-size: 1rem;
  }

  .slide-content {
    padding: 1rem;
  }

  .carousel-nav {
    width: 32px;
    height: 32px;
  }

  .carousel-indicators {
    bottom: 1rem;
  }

  .indicator {
    width: 8px;
    height: 8px;
  }
}

/* Accessibility: Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .slide,
  .carousel-nav,
  .indicator,
  .indicator-progress {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }

  .carousel-nav {
    opacity: 0.7 !important;
  }

  .indicator-progress {
    display: none;
  }

  .carousel::before {
    display: none;
  }
}
</style>
