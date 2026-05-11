<template>
  <el-dialog
    v-model="visible"
    title="选择成员"
    width="600px"
    destroy-on-close
    :close-on-click-modal="false"
    class="member-select-dialog"
    append-to-body
  >
    <div class="member-select-body">
      <div class="member-left">
        <el-input
          v-model="searchText"
          placeholder="搜索成员"
          :prefix-icon="Search"
          clearable
          class="member-search"
        />
        <div class="member-org-label">诸暨市企...</div>
        <div class="member-list">
          <template v-if="!searchText">
            <div
              v-for="dept in departments"
              :key="dept.id"
              class="dept-item"
            >
              <span class="dept-abbr" :style="{ background: getDeptColor(dept.id) }">
                {{ dept.abbr }}
              </span>
              <span class="dept-name">{{ dept.name }}*{{ dept.memberCount }}</span>
              <el-button
                size="small"
                type="primary"
                round
                class="dept-add-btn"
                @click="addDeptMembers(dept)"
              >添加</el-button>
            </div>
          </template>
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="member-item"
          >
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar" />
              <span v-else class="avatar-placeholder">{{ member.name[0] }}</span>
            </div>
            <span class="member-name">{{ member.name }}</span>
            <el-button
              v-if="isSelected(member.id)"
              size="small"
              round
              disabled
              class="member-add-btn"
            >已添加</el-button>
            <el-button
              v-else
              size="small"
              type="primary"
              round
              class="member-add-btn"
              @click="addMember(member)"
            >添加</el-button>
          </div>
        </div>
      </div>
      <div class="member-right">
        <div class="selected-title">已选{{ selectedMembers.length }}个成员</div>
        <div class="selected-list">
          <div
            v-for="member in selectedMembers"
            :key="member.id"
            class="selected-item"
          >
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar" />
              <span v-else class="avatar-placeholder">{{ member.name[0] }}</span>
            </div>
            <span class="member-name">{{ member.name }}</span>
            <el-button
              size="small"
              round
              class="remove-btn"
              @click="removeMember(member.id)"
            >移除</el-button>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { Collaborator, Department } from '../types'

const props = defineProps<{
  modelValue: boolean
  members: Collaborator[]
  departments: Department[]
  initialSelected: Collaborator[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [members: Collaborator[]]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const searchText = ref('')
const selectedMembers = ref<Collaborator[]>([])

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedMembers.value = [...props.initialSelected]
    searchText.value = ''
  }
})

const filteredMembers = computed(() => {
  if (!searchText.value) return props.members
  return props.members.filter((m) => m.name.includes(searchText.value))
})

const deptColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']

function getDeptColor(id: number) {
  return deptColors[(id - 1) % deptColors.length]
}

function isSelected(id: number) {
  return selectedMembers.value.some((m) => m.id === id)
}

function addMember(member: Collaborator) {
  if (!isSelected(member.id)) {
    selectedMembers.value.push({ ...member })
  }
}

function removeMember(id: number) {
  selectedMembers.value = selectedMembers.value.filter((m) => m.id !== id)
}

function addDeptMembers(dept: Department) {
  const deptMembers = props.members.filter((m) => m.department === dept.name)
  deptMembers.forEach((m) => {
    if (!isSelected(m.id)) {
      selectedMembers.value.push({ ...m })
    }
  })
}

function handleCancel() {
  visible.value = false
}

function handleConfirm() {
  emit('confirm', [...selectedMembers.value])
  visible.value = false
}
</script>

<style scoped lang="scss">
.member-select-body {
  display: flex;
  height: 400px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.member-left {
  flex: 1;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.member-search {
  margin-bottom: 12px;
}

.member-org-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.member-list {
  flex: 1;
  overflow-y: auto;
}

.dept-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 10px;
}

.dept-abbr {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dept-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.dept-add-btn {
  flex-shrink: 0;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 10px;
}

.member-avatar {
  width: 32px;
  height: 32px;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #c0c4cc;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.member-add-btn {
  flex-shrink: 0;
}

.member-right {
  width: 220px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.selected-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 500;
}

.selected-list {
  flex: 1;
  overflow-y: auto;
}

.selected-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 10px;

  .member-name {
    flex: 1;
  }

  .remove-btn {
    flex-shrink: 0;
    color: #909399;
    border-color: #dcdfe6;

    &:hover {
      color: #f56c6c;
      border-color: #f56c6c;
    }
  }
}
</style>
