<script lang="ts" setup>
definePageMeta({
    layout: 'cursos'
})

import { useCourseStore } from '~/stores/courseStore'
import { useStudentCourses } from '~/composables/useStudentCourses'
import HeaderDashboard from '~/components/Header/Desktop/HeaderDashboard.vue'
import type { BreadcrumbItem } from '@nuxt/ui'

const route = useRoute()
const { details } = route.params as { details: string }

const courseStore = useCourseStore()
const { courses, refresh: refreshCourses } = useStudentCourses()

const courseName = computed(() => courseStore.currentCourseName)
const courseId = ref<string | null>(null)
const loading = ref(true)

// Get course ID from the course name
const loadCourseId = async () => {
    try {
        await refreshCourses()
        const currentCourse = courses.value.find((course: any) => course.title === courseName.value)

        if (currentCourse) {
            courseId.value = currentCourse.id
        }
    } catch (error) {
        console.error('Error loading course:', error)
    } finally {
        loading.value = false
    }
}

const items = ref<BreadcrumbItem[]>([
    {
        label: 'Panel',
        icon: 'i-lucide-house'
    },
    {
        label: details === 'general' ? 'General' : `Semana ${details}`,
        icon: 'i-lucide-book-open'
    }
])

onMounted(loadCourseId)
</script>

<template>
    <HeaderDashboard :courseName="courseName" />

    <div class="max-w-[1200px] mx-auto">
        <h1 class="flex flex-col gap-2 text-2xl font-bold">
            {{ courseName.toUpperCase() }}
            <UBreadcrumb :items="items" />
        </h1>

        <div class="bg-secondary-50 mt-5 rounded-lg p-6">
            <!-- Loading state -->
            <div v-if="loading" class="text-center py-8">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 mx-auto mb-2" />
                <p class="text-gray-500">Cargando curso...</p>
            </div>

            <!-- Student Materials Component -->
            <div v-else-if="courseId" class="max-w-6xl mx-auto">
                <StudentMaterials :course-id="courseId" />
            </div>

            <!-- Fallback: No course found -->
            <div v-else class="text-center py-8">
                <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="h-12 w-12 text-gray-400 mx-auto mb-4"
                />
                <p class="text-gray-500">No se pudo cargar la información del curso</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.borrder {
    border: 1px solid black;
}
</style>
