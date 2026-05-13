<template>
  <div :class="['widget-card', { editing }]">
    <div v-if="editing" class="edit-controls">
      <el-tooltip content="上移" placement="top">
        <span class="edit-btn" @click="$emit('move', 'up')">上移</span>
      </el-tooltip>
      <el-tooltip content="下移" placement="top">
        <span class="edit-btn" @click="$emit('move', 'down')">下移</span>
      </el-tooltip>
      <el-tooltip content="左移" placement="top">
        <span class="edit-btn" @click="$emit('move', 'left')">左移</span>
      </el-tooltip>
      <el-tooltip content="右移" placement="top">
        <span class="edit-btn" @click="$emit('move', 'right')">右移</span>
      </el-tooltip>
      <el-tooltip content="删除" placement="top">
        <span class="edit-btn delete" @click="$emit('remove')">删除</span>
      </el-tooltip>
    </div>
    <div class="widget-card-header">
      <h3 class="widget-title">{{ widget.title }}</h3>
      <span v-if="widget.subtitle" class="widget-subtitle">{{ widget.subtitle }}</span>
      <slot name="header-extra" />
    </div>
    <div class="widget-card-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WidgetConfig } from '@/stores/workbench'

defineProps<{
  widget: WidgetConfig
  editing: boolean
}>()

defineEmits<{
  move: [direction: 'up' | 'down' | 'left' | 'right']
  remove: []
}>()
</script>

<style scoped lang="scss">
.widget-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  transition: box-shadow 0.2s;

  &.editing {
    border: 1px dashed #d9d9d9;

    &:hover {
      border-color: var(--el-color-primary);

      .edit-controls {
        opacity: 1;
      }
    }
  }
}

.edit-controls {
  position: absolute;
  top: -12px;
  right: 10px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;

  .edit-btn {
    padding: 2px 8px;
    background: #333;
    color: #fff;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background: var(--el-color-primary);
    }

    &.delete {
      background: #ff4d4f;

      &:hover {
        background: #ff7875;
      }
    }
  }
}

.widget-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.widget-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.widget-subtitle {
  font-size: 13px;
  color: #999;
}
</style>
