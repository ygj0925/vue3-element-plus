<template>
  <div class="role-switcher">
    <div class="switcher-header">
      <h2 class="switcher-title">切换角色工作台</h2>
      <div class="switcher-actions">
        <el-button @click="$emit('close')">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="role-cards">
      <div
        v-for="role in roles"
        :key="role.value"
        :class="['role-card', { selected: selectedRole === role.value }]"
        @click="selectedRole = role.value"
      >
        <div class="role-card-content">
          <h3 class="role-name">{{ role.name }}</h3>
          <p class="role-desc">{{ role.description }}</p>
        </div>
        <div v-if="selectedRole === role.value" class="role-check">
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useWorkbenchStore, type RoleType } from '@/stores/workbench'

const emit = defineEmits<{
  close: []
}>()

const store = useWorkbenchStore()
const selectedRole = ref<RoleType>(store.currentRole)

const roles = [
  { value: 'boss' as RoleType, name: 'Boos', description: '以全局视角查看公司的业务统计数据等事项' },
  { value: 'manager' as RoleType, name: '管理岗位', description: '以部分负责人视角查看部门OKR、委派任务以及部门的统计数据等事项' },
  { value: 'employee' as RoleType, name: '员工', description: '以个人视角聚焦个人工作任务、项目集OKR等事项' },
]

function handleSave() {
  store.switchRole(selectedRole.value)
  emit('close')
}
</script>

<style scoped lang="scss">
.role-switcher {
  min-height: calc(100vh - 120px);
}

.switcher-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.switcher-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #1a1a1a;
}

.switcher-actions {
  display: flex;
  gap: 12px;
}

.role-cards {
  display: flex;
  gap: 20px;
}

.role-card {
  flex: 1;
  padding: 24px;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:hover {
    border-color: #d9ecff;
  }

  &.selected {
    border-color: var(--el-color-primary);

    .role-name {
      color: var(--el-color-primary);
    }

    .role-desc {
      color: var(--el-color-primary);
    }
  }
}

.role-card-content {
  padding-right: 30px;
}

.role-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.role-desc {
  margin: 0;
  font-size: 13px;
  color: #999;
  line-height: 1.6;
}

.role-check {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  background: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}
</style>
