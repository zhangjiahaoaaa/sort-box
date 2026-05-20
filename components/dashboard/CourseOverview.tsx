import { CourseCard } from "@/components/courses/CourseCard"
import type { AppData } from "@/lib/types"

export function CourseOverview({ data }: { data: AppData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.courses.slice(0, 6).map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          materials={data.materials.filter((item) => item.courseId === course.id)}
          todos={data.todos.filter((item) => item.courseId === course.id)}
        />
      ))}
    </div>
  )
}
