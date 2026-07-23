<script setup lang="ts">
// 등록 화면과 같은 폼을 재사용하되, 수정할 아동의 기존 값을 함께 전달합니다.
import StudentForm from '@/components/teacher/StudentForm.vue'
import { selectedStudent } from '@/features/teacher/mockData'
</script>

<template>
  <!-- :initial-value의 콜론은 문자열이 아니라 실제 객체 값을 props로 보낸다는 뜻입니다. -->
  <StudentForm mode="edit" :initial-value="selectedStudent" />
</template>
