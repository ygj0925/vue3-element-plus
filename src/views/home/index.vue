<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in cards" :key="item.title">
        <el-card shadow="hover">
          <template #header>
            <span>{{ item.title }}</span>
          </template>
          <div class="card-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card" shadow="never">
      <h2>欢迎使用 Vue3 Element Plus Admin</h2>
      <p>基于 Vue3 + TypeScript + Element Plus + Pinia + Vue Router 的后台管理系统基础架构</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const cards = reactive([
  { title: '用户数', value: '1,024' },
  { title: '订单数', value: '3,456' },
  { title: '收入', value: '¥128,000' },
  { title: '访问量', value: '56,789' },
])
</script>

<style scoped lang="scss">
.home {
  .card-value {
    font-size: 28px;
    font-weight: bold;
    color: var(--el-color-primary);
  }

  .welcome-card {
    margin-top: 20px;

    h2 {
      margin: 0 0 12px;
    }

    p {
      margin: 0;
      color: #666;
    }
  }
}
</style>
