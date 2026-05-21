import { EmptyState } from "@/components/common/EmptyState"
import { MaterialItem } from "@/components/materials/MaterialItem"
import type { Material } from "@/lib/types"

export function MaterialList({
  materials,
  onDelete,
}: {
  materials: Material[]
  onDelete?: (materialId: string) => void
}) {
  if (!materials.length) {
    return (
      <EmptyState
        title="上传第一份资料"
        description="添加课件、作业或复习资料后，这门课的文件会集中显示在这里。"
      />
    )
  }

  return (
    <div className="space-y-3">
      {materials.map((material) => (
        <MaterialItem key={material.id} material={material} onDelete={onDelete} />
      ))}
    </div>
  )
}
