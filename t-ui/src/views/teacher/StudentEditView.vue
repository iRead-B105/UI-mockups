<script setup lang="ts">
import StudentForm from '@/components/teacher/StudentForm.vue'
import { selectedStudent } from '@/features/teacher/mockData'
</script>

<template>
  <StudentForm mode="edit" :initial-value="selectedStudent" />
</template>
