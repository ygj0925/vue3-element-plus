<template>
  <el-popover
    v-model:visible="popoverVisible"
    placement="bottom"
    :width="280"
  >
    <template #reference>
      <span class="collab-trigger" @click="popoverVisible = !popoverVisible">
        <slot />
      </span>
    </template>
    <div class="collab-popover">
      <el-input
        v-model="searchText"
        placeholder="搜索成员"
        :prefix-icon="Search"
        clearable
        size="small"
        class="collab-search"
      />
      <div class="collab-header">
        <span class="selected-count">已选{{ selectedIds.length }}位</span>
        <span class="expand-link" @click="popoverVisible = false; selectedIds.length && null">></span>
      </div>
      <div class="collab-label">成员</div>
      <div class="collab-list">
        <el-checkbox-group v-model="selectedIds">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="collab-item"
          >
            <el-checkbox :value="member.id">
              <div class="collab-member-info">
                <div class="collab-avatar">
                  <img v-if="member.avatar" :src="member.avatar" />
                  <span v-else class="avatar-placeholder">{{ member.name[0] }}</span>
                </div>
                <span>{{ member.name }}</span>
              </div>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <div class="collab-org-link" @click="openOrgSelect">
        + 按组织选择
      </div>
      <div class="collab-footer">
        <el-button type="primary" size="small" @click="handleConfirm">确定</el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { Collaborator } from '../types'

const props = defineProps<{
  members: Collaborator[]
  selected: Collaborator[]
}>()

const emit = defineEmits<{
  confirm: [members: Collaborator[]]
  openOrgSelect: []
}>()

const popoverVisible = ref(false)
const searchText = ref('')
const selectedIds = ref<number[]>([])

watch(() => popoverVisible.value, (val) => {
  if (val) {
    selectedIds.value = props.selected.map((m) => m.id)
    searchText.value = ''
  }
})

const filteredMembers = computed(() => {
  if (!searchText.value) return props.members
  return props.members.filter((m) => m.name.includes(searchText.value))
})

function openOrgSelect() {
  popoverVisible.value = false
  emit('openOrgSelect')
}

function handleConfirm() {
  const result = props.members.filter((m) => selectedIds.value.includes(m.id))
  emit('confirm', result)
  popoverVisible.value = false
}
</script>

<style scoped lang="scss">
.collab-trigger {
  display: inline-flex;
  cursor: pointer;
}

.collab-popover {
  max-height: 360px;
  display: flex;
  flex-direction: column;
}

.collab-search {
  margin-bottom: 10px;
}

.collab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;

  .selected-count {
    font-size: 13px;
    color: #303133;
    font-weight: 500;
  }

  .expand-link {
    font-size: 13px;
    color: #909399;
    cursor: pointer;
  }
}

.collab-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.collab-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.collab-item {
  padding: 4px 0;
}

.collab-member-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.collab-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #c0c4cc;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collab-org-link {
  color: var(--el-color-primary);
  font-size: 13px;
  cursor: pointer;
  padding: 6px 0;
  border-top: 1px solid #f0f0f0;

  &:hover {
    opacity: 0.8;
  }
}

.collab-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
</style>
