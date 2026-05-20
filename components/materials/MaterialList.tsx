import { EmptyState } from "@/components/common/EmptyState"
import { MaterialItem } from "@/components/materials/MaterialItem"
import type { Material } from "@/lib/types"

export function MaterialList({ materials }: { materials: Material[] }) {
  if (!materials.length) {
    return (
      <EmptyState
        title="还没有资料"
        description="添加资料后，这门课的课件、作业和复习文件会集中显示。"
      />
    )
  }

  return (
    <div className="space-y-3">
      {materials.map((material) => (
        <MaterialItem key={material.id} material={material} />
      ))}
    </div>
  )
}
