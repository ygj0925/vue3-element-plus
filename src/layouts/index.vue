<template>
  <el-container class="layout">
    <el-header class="layout-top-header">
      <div class="header-left">
        <div class="logo">
          <img src="" alt="" class="logo-icon" />
          <span class="logo-text">不落分数智管理系统</span>
        </div>
        <nav class="top-nav">
          <a
            v-for="nav in topNavs"
            :key="nav.path"
            :class="['nav-item', { active: isNavActive(nav.path) }]"
            @click="router.push(nav.path)"
          >
            {{ nav.title }}
            <span v-if="nav.badge" class="nav-badge">{{ nav.badge }}</span>
          </a>
        </nav>
      </div>
      <div class="header-right">
        <el-icon class="header-icon"><Connection /></el-icon>
        <el-icon class="header-icon"><Message /></el-icon>
        <el-icon class="header-icon"><Bell /></el-icon>
        <div class="user-area">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" class="user-avatar">{{ userName.slice(0, 1) }}</el-avatar>
              <span class="user-name">{{ userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container class="layout-body">
      <el-aside width="140px" class="layout-aside">
        <el-menu
          :default-active="route.path"
          router
          class="side-menu"
        >
          <el-menu-item index="/workbench">
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/okr">
            <span>OKR</span>
          </el-menu-item>
          <el-menu-item index="/project">
            <span>项目</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <span>统计</span>
          </el-menu-item>
          <el-menu-item index="/summary">
            <span>总结</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Connection, Message, Bell, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => '屹起会')

const topNavs = [
  { path: '/workbench', title: '工作台', badge: '看利润' },
  { path: '/market', title: '市场大盘', badge: '' },
  { path: '/competition', title: '竞争分析', badge: '' },
  { path: '/tasks', title: '任务', badge: '' },
]

function isNavActive(path: string) {
  return route.path.startsWith(path)
}

function handleCommand(command: string) {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.layout {
  height: 100vh;
  flex-direction: column;
}

.layout-top-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    white-space: nowrap;
  }
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 32px;

  .nav-item {
    position: relative;
    font-size: 15px;
    color: #333;
    cursor: pointer;
    padding: 4px 0;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }

    &.active {
      color: var(--el-color-primary);
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: -16px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--el-color-primary);
      }
    }

    .nav-badge {
      position: absolute;
      top: -8px;
      right: -30px;
      background: #ff4d4f;
      color: #fff;
      font-size: 10px;
      padding: 1px 4px;
      border-radius: 8px;
      white-space: nowrap;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 20px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.user-area {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .user-avatar {
    background: #1a1a1a;
    color: #fff;
    font-size: 14px;
  }

  .user-name {
    font-size: 14px;
    color: #333;
  }
}

.layout-body {
  flex: 1;
  overflow: hidden;
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;

  .side-menu {
    border-right: none;
    padding-top: 8px;

    :deep(.el-menu-item) {
      height: 44px;
      line-height: 44px;
      margin: 4px 8px;
      border-radius: 6px;
      padding-left: 24px !important;
      font-size: 14px;
      color: #333;

      &:hover {
        background: #f0f7ff;
        color: var(--el-color-primary);
      }

      &.is-active {
        background: #e8f4ff;
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}

.layout-main {
  background: #f0f5ff;
  overflow-y: auto;
  padding: 24px;
}
</style>
