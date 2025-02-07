<template>
  <div class="screenfull-container" @click="toggleFullscreen">
    <el-icon class="screenfull-icon">
      <FullScreen />
    </el-icon>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'

const isFullscreen = ref(false)

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}
</script>

<style scoped>
.screenfull-container {
  padding: 0 8px;
  cursor: pointer;
}

.screenfull-icon {
  font-size: 18px;
  color: #666;
}

.screenfull-icon:hover {
  color: #409eff;
}
</style> 