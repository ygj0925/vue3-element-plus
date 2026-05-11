<template>
  <el-dialog
    v-model="visible"
    title="设置提醒时间"
    width="400px"
    destroy-on-close
    :close-on-click-modal="false"
    class="reminder-dialog"
    append-to-body
  >
    <div class="reminder-form">
      <el-select v-model="form.type" placeholder="选择提醒类型" class="reminder-type">
        <el-option
          v-for="opt in reminderTypeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-select
        v-model="form.value"
        placeholder="数值"
        class="reminder-value"
        :disabled="!needsValueUnit"
      >
        <el-option
          v-for="val in reminderValueOptions"
          :key="val"
          :label="val"
          :value="val"
        />
      </el-select>
      <el-select
        v-model="form.unit"
        placeholder="单位"
        class="reminder-unit"
        :disabled="!needsValueUnit"
      >
        <el-option
          v-for="opt in reminderUnitOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleAdd">添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Reminder } from '../types'
import { reminderTypeOptions, reminderValueOptions, reminderUnitOptions } from '../mock'

const props = defineProps<{
  modelValue: boolean
  initial?: Reminder
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [reminder: Reminder]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const form = ref<Reminder>({
  type: 'before_start',
  value: 1,
  unit: 'minute',
})

watch(() => props.modelValue, (val) => {
  if (val && props.initial) {
    form.value = { ...props.initial }
  } else if (val) {
    form.value = { type: 'before_start', value: 1, unit: 'minute' }
  }
})

const needsValueUnit = computed(() => {
  return !['none', 'task_start', 'task_deadline'].includes(form.value.type)
})

function handleAdd() {
  emit('confirm', { ...form.value })
  visible.value = false
}
</script>

<style scoped lang="scss">
.reminder-form {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reminder-type {
  flex: 1.5;
}

.reminder-value {
  flex: 1;
}

.reminder-unit {
  flex: 1;
}
</style>
